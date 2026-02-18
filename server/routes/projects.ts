import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { supabase } from '../lib/supabase'
import { getAuthUser } from '../lib/auth'
import { SupabaseTableName } from '@/utils/constants'

const projects = new Hono()

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
})

// GET /api/projects
projects.get('/', async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const { data, error } = await supabase
    .from(SupabaseTableName.PROJECTS)
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching projects:', error.message)
    return c.json({ error: error.message }, 500)
  }
  
  return c.json(data || [])
})

// POST /api/projects
projects.post('/', zValidator('json', projectSchema), async (c) => {
  const user = await getAuthUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const body = c.req.valid('json')
  const { data, error } = await supabase
    .from(SupabaseTableName.PROJECTS)
    .insert([{ ...body, user_id: user.id }])
    .select()
    .single()

  if (error) {
    console.error('Supabase project insert error:', error.message)
    return c.json({ error: error.message }, 400)
  }
  
  return c.json(data, 201)
})

// PUT /api/projects/:id
projects.put('/:id', zValidator('json', projectSchema), async (c) => {
  const id = c.req.param('id')
  const user = await getAuthUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const body = c.req.valid('json')
  
  const { data, error } = await supabase
    .from(SupabaseTableName.PROJECTS)
    .update(body)
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user owns the project
    .select()
    .single()

  if (error) {
    console.error('Supabase project update error:', error.message)
    return c.json({ error: error.message }, 400)
  }
  
  return c.json(data)
})

// DELETE /api/projects/:id
projects.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const user = await getAuthUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const { data, error } = await supabase
    .from(SupabaseTableName.PROJECTS)
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Supabase project delete error:', error.message)
    return c.json({ error: error.message }, 400)
  }
  
  return c.json(data)
})

export default projects
