import { Hono } from 'hono'

import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText, generateText, tool, convertToModelMessages, stepCountIs } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { supabase } from '../lib/supabase.js'
import { getAuthUser } from '../lib/auth.js'
import { GOD_PROMPT, SupabaseTableName } from '../../src/utils/shared-constants.js'

const chat = new Hono()

const google = createGoogleGenerativeAI({
  apiKey: process.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY || import.meta.env?.VITE_GOOGLE_GENERATIVE_AI_API_KEY,
})

// Initialize OpenRouter client
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.VITE_OPENROUTER_KEY || import.meta.env?.VITE_OPENROUTER_KEY,
  headers: {
    'HTTP-Referer': 'http://localhost:3000', 
    'X-Title': 'Work Log App',
  }
})

import { embed } from 'ai'
import { google as googleProvider } from '@ai-sdk/google'

// AI Streaming Chat
chat.post('/', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const body = await c.req.json()
    const { messages, sessionId } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return c.json({ error: 'Invalid or empty messages array' }, 400)
    }

    const modelMessages = await convertToModelMessages(messages)
    
    // Save user message to Supabase
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && sessionId && lastMessage.role === 'user') {
      const textContent = lastMessage.content || 
        (lastMessage.parts?.find((p: any) => p.type === 'text')?.text) || 
        '';

      await supabase.from('chat_messages').insert({
        user_id: user.id,
        session_id: sessionId,
        role: 'user',
        content: textContent,
      })
    }
    
    try {
      const result = streamText({
        model: openrouter.chat('openrouter/auto:free'), 
        stopWhen: stepCountIs(5),
        temperature: 0.7,
        system: `${GOD_PROMPT}\n\nCURRENT_DATE: ${new Date().toISOString().split('T')[0]}\n\nTOOL USE POLICY: Use semantic search for specific questions. Use summaries for high-level overviews. Minimize data transfer.`,
        messages: modelMessages,
        tools: {
          get_work_logs: tool({
            description: 'Fetch detailed work log entries. Use for deep dives into specific items.',
            inputSchema: z.object({
              limit: z.number().optional().default(10).describe('Number of logs to fetch.'),
              category: z.string().optional().describe('Filter by category.'),
              projectId: z.string().optional().describe('Filter by project ID.'),
              startDate: z.string().optional().describe('ISO date string (YYYY-MM-DD or full timestamp). Filter logs created at or after this date.'),
              endDate: z.string().optional().describe('ISO date string (YYYY-MM-DD or full timestamp). Filter logs created at or before this date.'),
            }),
            execute: async ({ limit, category, projectId, startDate, endDate }) => {
              let query = supabase
                .from(SupabaseTableName.ENTRIES)
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(limit)

              if (category) query = query.eq('category', category)
              if (projectId) query = query.eq('project_id', projectId)
              if (startDate) query = query.gte('created_at', startDate)
              if (endDate) query = query.lte('created_at', endDate)

              const { data, error } = await query
              if (error) throw new Error(error.message)
              return data
            },
          }),
          get_work_log_summary: tool({
            description: 'Fetch a high-level summary of work logs (titles and impact only). Use this for broad questions about many logs.',
            inputSchema: z.object({
              limit: z.number().optional().default(30).describe('Number of logs to summarize.'),
              startDate: z.string().optional().describe('ISO date string (YYYY-MM-DD).'),
              endDate: z.string().optional().describe('ISO date string (YYYY-MM-DD).'),
            }),
            execute: async ({ limit, startDate, endDate }) => {
              let query = supabase
                .from(SupabaseTableName.ENTRIES)
                .select('id, title, category, created_at, project_id, time_spent')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(limit)

              if (startDate) query = query.gte('created_at', startDate)
              if (endDate) query = query.lte('created_at', endDate)

              const { data, error } = await query
              if (error) throw new Error(error.message)
              return data
            },
          }),
          search_work_logs: tool({
            description: 'Search for work logs using semantic similarity. Best for "Have I ever done X?" or finding related past tasks.',
            inputSchema: z.object({
              query: z.string().describe('The search query string.'),
            }),
            execute: async ({ query }) => {
              try {
                // Generate embedding for query
                const { embedding } = await embed({
                  model: googleProvider.textEmbedding('text-embedding-004'),
                  value: query,
                })

                // Use the match_entries RPC for vector search
                const { data, error } = await supabase.rpc('match_entries', {
                  query_embedding: embedding,
                  match_threshold: 0.3,
                  match_count: 10,
                  user_id_param: user.id,
                })

                if (error) throw new Error(error.message)
                return data
              } catch (err) {
                console.error('Semantic search failed, falling back to keyword:', err)
                const { data, error: fbError } = await supabase
                  .from(SupabaseTableName.ENTRIES)
                  .select('*')
                  .eq('user_id', user.id)
                  .ilike('title', `%${query}%`)
                  .limit(10)
                if (fbError) throw new Error(fbError.message, { cause: err })
                return data
              }
            },
          }),
        },
        onChunk: ({ chunk }) => {
          if (chunk.type === 'text-delta') {
            console.log('Text delta:', chunk.text)
          } else if (chunk.type === 'tool-call') {
            console.log('Tool call:', chunk.toolName)
          }
        },
        onFinish: async ({ text: responseText }) => {
          console.log('Stream finished, saving to Supabase...')
          if (sessionId && responseText) {
            await supabase.from('chat_messages').insert({
              user_id: user.id,
              session_id: sessionId,
              role: 'assistant',
              content: responseText,
            })
          }
        },
        onError: ({ error }) => {
          console.error('SERVER STREAM ERROR:', error)
        }
      })

      // Use toUIMessageStreamResponse for standard AI SDK streaming
      return result.toUIMessageStreamResponse()
    } catch (streamError: any) {
      console.error('StreamText error:', streamError)
      console.error('Error details:', {
        message: streamError.message,
        stack: streamError.stack,
        name: streamError.name,
      })
      throw streamError
    }
  } catch (error: any) {
    console.error('Chat endpoint error:', error)
    return c.json({ 
      error: 'Failed to process chat request',
      details: error.message 
    }, 500)
  }
})

// Summarize Description to Title
chat.post('/summarize', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const { description } = await c.req.json()
    if (!description) return c.json({ error: 'Description is required' }, 400)

    const { text } = await generateText({
      model: google('gemini-2.5-flash'), // Using Flash for speed/low-latency
      headers: {},
      prompt: `Summarize the following work log entry description into a short, punchy title (max 6-8 words). 
      Return ONLY the title text. No markdown. No quotes.
      
      Description:
      ${description}`,
    })

    return c.json({ title: text.trim() })
  } catch (error: any) {
    console.error('Summarize error:', error)
    return c.json({ error: 'Failed to summarize' }, 500)
  }
})

// GET /api/chat/history/:sessionId
chat.get('/history/:sessionId', async (c) => {
  const user = await getAuthUser(c)
  console.log({user})
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const sessionId = c.req.param('sessionId')
  
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', user.id)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) return c.json({ error: error.message }, 400)
  return c.json(data)
})

export default chat
