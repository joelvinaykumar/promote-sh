import { handle } from 'hono/vercel'
import app from '../server/index'

export default async function handler(req: any, res: any) {
  try {
    const url = `http://localhost${req.url}`
    
    // Vercel dev sometimes already parses the body. 
    // If it does, we use it. If not, we read the stream.
    let body: any = undefined
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body) {
        body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      } else {
        const chunks = []
        for await (const chunk of req) {
          chunks.push(chunk)
        }
        body = Buffer.concat(chunks)
      }
    }

    const request = new Request(url, {
      method: req.method,
      headers: req.headers as any,
      body,
      // @ts-ignore
      duplex: 'half'
    })
    
    const response = await app.fetch(request)
    
    // For streaming responses (like AI chat), we should ideally pipe the stream.
    // However, for simplicity and since Hono.fetch returns a standard Response,
    // let's at least set the headers and send the body.
    res.status(response.status)
    response.headers.forEach((v, k) => res.setHeader(k, v))
    
    if (response.body) {
      const reader = response.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(value)
      }
      res.end()
    } else {
      res.end()
    }

  } catch (err: any) {
    console.error('API Error:', err)
    res.status(500).send(err.message)
  }
}










