import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || import.meta.env?.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Missing Supabase environment variables!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY:', supabaseKey ? 'SET' : 'MISSING')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
