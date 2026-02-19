import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

import { supabase } from './lib/supabase'
import projects from './routes/projects'
import entries from './routes/entries'
import chat from './routes/chat'

const app = new Hono().basePath('/api')

// Global Request Logger (Low level)
app.use('*', async (c, next) => {
  console.log(`[Hono] Received ${c.req.method} ${c.req.url}`)
  await next()
  console.log(`[Hono] Responded ${c.res.status}`)
})

app.get('/ping', (c) => {
  return c.json({ status: 'ok', time: new Date().toISOString() })
})

app.use('*', logger())
app.use('*', cors())

// Global Error Handler
app.onError((err, c) => {
  console.error('[Hono Error]', err)
  return c.json({ error: 'Internal Server Error', message: err.message }, 500)
})

// Auth
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

app.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return c.json({ data, error })
  } catch (err: any) {
    console.error('Unexpected error in /login:', err)
    return c.json({ 
      data: { session: null, user: null }, 
      error: { message: 'Internal Server Error' } 
    }, 500)
  }
})

// Mount routes
app.route('/projects', projects)
app.route('/entries', entries)
app.route('/chat', chat)

// Stats
app.get('/stats/daily-counts', async (c) => {
  const user = await supabase.auth.getUser(c.req.header('Authorization')?.split(' ')[1] || '')
  if (!user.data.user) return c.json({ error: 'Unauthorized' }, 401)

  const userId = user.data.user.id

  const { data, error } = await supabase.rpc('get_daily_contribution_counts', {
    p_user_id: userId,
  })

  if (error) {
    console.error('Error fetching contribution counts:', error)
    return c.json({ error: error.message }, 500)
  }

  // Process data into a map and calculate streak
  const counts: Record<string, number> = {}
  const dateMap: Set<string> = new Set()

  data.forEach((row: { day: string; count: number }) => {
    counts[row.day] = row.count
    dateMap.add(row.day)
  })

  // Calculate Streak
  let streak = 0
  const today = new Date()
  
  // Set to midnight UTC for consistent comparison with the DATE type from Postgres
  const checkDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  
  // A streak is active if there is an entry today OR yesterday
  const todayStr = checkDate.toISOString().split('T')[0]
  const yesterday = new Date(checkDate)
  yesterday.setUTCDate(checkDate.getUTCDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const hasToday = dateMap.has(todayStr)
  const hasYesterday = dateMap.has(yesterdayStr)

  if (hasToday || hasYesterday) {
    // Start from the most recent active day
    let currentCheck = hasToday ? checkDate : yesterday
    
    while (dateMap.has(currentCheck.toISOString().split('T')[0])) {
      streak++
      currentCheck.setUTCDate(currentCheck.getUTCDate() - 1)
    }
  }

  return c.json({ counts, streak })
})

export default app
