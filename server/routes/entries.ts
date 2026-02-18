import { Hono } from 'hono'
import { supabase } from '../lib/supabase'
import { SupabaseTableName } from '../../src/utils/constants'
import { zValidator } from '@hono/zod-validator'
import z from 'zod'
import { getAuthUser } from '../lib/auth'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { embed } from 'ai'

const entries = new Hono()

const google = createGoogleGenerativeAI({
  apiKey: process.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY || import.meta.env?.VITE_GOOGLE_GENERATIVE_AI_API_KEY,
})

const filtersSchema = z.object({
  category: z.string().optional(),
  project_id: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  q: z.string().optional(),
})

// GET /api/entries
entries.get('/', zValidator('query', filtersSchema),async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const q = c.req.query('q')?.toLowerCase()
  const category = c.req.query('category')
  const projectId = c.req.query('project_id')
  const status = c.req.query('status')
  const priority = c.req.query('priority')
  const startDate = c.req.query('start_date')
  const endDate = c.req.query('end_date')
  
  // Build query with server-side filters
  let query = supabase
    .from(SupabaseTableName.ENTRIES)
    .select('*')
    .eq('user_id', user.id)

  // Apply filters conditionally
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  if (projectId) {
    query = query.eq('project_id', projectId)
  }
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (priority && priority !== 'all') {
    query = query.eq('priority', priority)
  }
  if (startDate) {
    query = query.gte('created_at', startDate)
  }
  if (endDate) {
    query = query.lte('created_at', endDate)
  }
  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  // Order and execute
  const { data, error } = await query.order('created_at', { ascending: false })

  if (!error && data) {
    return c.json(data)
  }

  console.error('Supabase fetch error:', error?.message)
  return c.json({ error: error?.message || 'Failed to fetch entries' }, 500)
})

// GET /api/entries/:id
entries.get('/:id', async (c) => {
  const id = c.req.param('id')
  
  const { data, error } = await supabase
    .from(SupabaseTableName.ENTRIES)
    .select('*')
    .eq('id', id)
    .single()

  if (!error && data) return c.json(data)

  return c.json({ error: error?.message || 'Not found' }, error ? 400 : 404)
})

entries.post('/', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const body = await c.req.json()

  const supabaseEntry: any = {
    ...body,
    status: body.status || 'pending',
    user_id: user.id,
  }

  // Generate embedding asynchronously
  try {
    const { embedding } = await embed({
      model: google.textEmbedding('text-embedding-004'),
      value: `${body.title}\n${body.description || ''}`,
    })
    supabaseEntry.embedding = embedding
  } catch (err) {
    console.error('Failed to generate embedding:', err)
  }

  const { data, error } = await supabase
    .from(SupabaseTableName.ENTRIES)
    .insert([supabaseEntry])
    .select()
    .single()

  if (error) {
    console.error('Supabase insert error:', error.message)
    return c.json({ error: error.message }, 400)
  }

  return c.json(data, 201)
})

// DELETE /api/entries/:id
entries.delete('/:id', async (c) => {
  const id = c.req.param('id')
  
  const { error } = await supabase
    .from(SupabaseTableName.ENTRIES)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Supabase delete error:', error.message)
    return c.json({ error: error.message }, 400)
  }

  return c.json({ success: true })
})

// PATCH /api/entries/:id
entries.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const updates: any = { ...body }
  if (body.projectId) {
    updates.project_id = body.projectId
    delete updates.projectId
  }
  if (body.timeSpent) {
    updates.time_spent = body.timeSpent
    delete updates.timeSpent
  }

  const { data, error } = await supabase
    .from(SupabaseTableName.ENTRIES)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Supabase update error:', error.message)
    return c.json({ error: error.message }, 400)
  }

  return c.json(data)
})

export default entries
