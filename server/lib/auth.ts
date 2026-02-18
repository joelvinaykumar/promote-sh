import { Context } from 'hono'
import { supabase } from './supabase'

export const getAuthUser = async (c: Context) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  
  const token = authHeader.split(' ')[1]
  console.log({token})
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) return null
  return user
}
