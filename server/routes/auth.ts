import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { supabase } from '../lib/supabase'

const auth = new Hono()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

// POST /api/login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return c.json({ error: { message: error.message } }, 400)
  }

  return c.json({ data })
})

export default auth
