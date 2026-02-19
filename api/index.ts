import { handle } from 'hono/vercel'
import app from '../server/index'

export const config = {
  runtime: 'nodejs'
}

export default (req: Request) => {
  // Extract only the path after /api if it exists to avoid double-prefixing
  const url = new URL(req.url)
  console.log('[Vercel Entry] Incoming URL:', url.pathname)
  
  return handle(app)(req)
}
