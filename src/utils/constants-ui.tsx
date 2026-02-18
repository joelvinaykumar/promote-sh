import { Bug, Calendar, Eye, File, Sparkle, Wrench } from 'lucide-react'

export const CATEGORIES = [
  { id: 'bug', label: 'Bug', icon: <Bug className='size-3 text-destructive' /> },
  { id: 'feature', label: 'Feature', icon: <Sparkle className='size-3 text-yellow-500' /> },
  { id: 'review', label: 'Review', icon: <Eye className='size-3 text-blue-500' /> },
  { id: 'meeting', label: 'Meeting', icon: <Calendar className='size-3 text-green-500' /> },
  { id: 'debt', label: 'Debt', icon: <Wrench className='size-3 text-red-500' /> },
  { id: 'docs', label: 'Docs', icon: <File className='size-3 text-purple-500' /> }
] as const

export const PROJECTS = [
  { id: 'internal', label: 'Internal Tooling', icon: '🛠️' },
  { id: 'acme', label: 'Acme Corp Portal', icon: '🚀' },
  { id: 'migration', label: 'Infrastructure', icon: '☁️' }
]

export const PRIORITIES = [
  { id: 'low', label: 'Low', color: 'text-slate-500' },
  { id: 'medium', label: 'Medium', color: 'text-orange-500' },
  { id: 'high', label: 'High', color: 'text-red-500' }
] as const

export const STATUSES = [
  { id: 'pending', label: 'Pending', icon: <Calendar className='size-3 text-slate-500' /> },
  { id: 'completed', label: 'Completed', icon: <Sparkle className='size-3 text-emerald-500' /> }
] as const

export * from './shared-constants'