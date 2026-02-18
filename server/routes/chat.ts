import { Hono } from 'hono'
import { appendFileSync } from 'fs'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText, generateText, tool, convertToModelMessages, stepCountIs } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { getAuthUser } from '../lib/auth'
import { GOD_PROMPT, SupabaseTableName } from '@/utils/constants'

const chat = new Hono()

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY,
})

// Initialize OpenRouter client
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: import.meta.env.VITE_OPENROUTER_KEY || process.env.VITE_OPENROUTER_KEY,
  headers: {
    'HTTP-Referer': 'http://localhost:3000', 
    'X-Title': 'Work Log App',
  }
})

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

    // Convert UI messages to Model messages
    console.log('Raw messages from client:', JSON.stringify(messages, null, 2))
    const modelMessages = await convertToModelMessages(messages)
    console.log('Converted model messages:', JSON.stringify(modelMessages, null, 2))
    
    // Save user message to Supabase
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && sessionId && lastMessage.role === 'user') {
      // Extract content from parts (latest AI SDK format)
      const textContent = lastMessage.content || 
        (lastMessage.parts?.find((p: any) => p.type === 'text')?.text) || 
        '';

      const { error: insertError } = await supabase.from('chat_messages').insert({
        user_id: user.id,
        session_id: sessionId,
        role: 'user',
        content: textContent,
      })
      
      if (insertError) {
        console.error('Failed to save user message:', insertError)
      }
    }
    
    try {
      const result = streamText({
        model: openrouter.chat('openrouter/auto:free'), 
        stopWhen: stepCountIs(5),
        temperature: 0.7,
        system: `${GOD_PROMPT}\n\nTOOL USE POLICY: Most tool parameters are optional. If a user asks a general question, do NOT ask for a project ID or category; just call the tool with defaults. Be decisive.`,
        messages: modelMessages,
        tools: {
          get_work_logs: tool({
            description: 'Fetch work log entries. Use this for general summaries or filtering by category/project.',
            strict: false,
            inputSchema: z.object({
              limit: z.number().optional().default(10).describe('Number of logs to fetch.'),
              category: z.string().optional().describe('Filter by category (e.g., bug, feature).'),
              projectId: z.string().optional().describe('Optional: Database ID of a specific project. If not provided or user asks generally, do NOT ask the user for this ID; just omit it.'),
            }),
            execute: async ({ limit, category, projectId }) => {
              let query = supabase
                .from(SupabaseTableName.ENTRIES)
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(limit)

              if (category) query = query.eq('category', category)
              if (projectId) query = query.eq('project_id', projectId)

              const { data, error } = await query
              if (error) throw new Error(error.message)
              return data
            },
          }),
          search_work_logs: tool({
            description: 'Search for specific work logs using semantic search',
            inputSchema: z.object({
              query: z.string(),
            }),
            execute: async ({ query }) => {
              const { data, error } = await supabase
                .from(SupabaseTableName.ENTRIES)
                .select('*')
                .eq('user_id', user.id)
                .ilike('title', `%${query}%`)
                .limit(5)

              if (error) throw new Error(error.message)
              return data
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
          appendFileSync('chat_stream_errors.log', JSON.stringify({ timestamp: new Date().toISOString(), error }, null, 2) + '\n---\n')
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
