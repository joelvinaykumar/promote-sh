import { Hono } from 'hono'
import { supabase } from '../lib/supabase'

const stats = new Hono()

stats.get('/daily-counts', async (c) => {
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

export default stats
