import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import chat from './routes/chat'
import entries from './routes/entries'
import projects from './routes/projects'
import auth from './routes/auth'
import stats from './routes/stats'

// Re-using the basePath strategy which is canonical for Hono + Vercel
const app = new Hono().basePath('/api')

app.use('*', logger())
app.use('*', cors())

// Mount routes
app.route('/chat', chat)
app.route('/entries', entries)
app.route('/projects', projects)
app.route('/stats', stats)
app.route('/', auth) // mounts /login as /api/login



// Health checks
app.get('/health', (c) => {
  return c.json({ status: 'ok', msg: 'Hono is reaching the API correctly' })
})

app.get('/ping', (c) => {
  return c.json({ status: 'ok', msg: 'pong' })
})

export default app



