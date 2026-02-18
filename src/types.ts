import { CATEGORIES } from "./utils/constants-ui"

export type Category = typeof CATEGORIES[number]['id']

export interface WorkEntry {
  id?: string
  title: string
  description?: string
  category?: Category
  project_id?: string
  time_spent?: number // in minutes
  priority?: 'low' | 'medium' | 'high'
  status?: 'pending' | 'completed'
  created_at?: number
  updated_at?: number
}

export interface User {
  name: string
  email: string
  avatar?: string
}
