import { WorkEntry } from '../types'
import { Clock, Calendar, Activity, Zap, TrendingUp } from 'lucide-react'
import { cn } from './ui/utils'

interface StatsBarProps {
  entries: WorkEntry[]
}

export function StatsBar({ entries }: StatsBarProps) {
  const today = new Date().toISOString().split('T')[0]
  
  // Today's Stats
  const todayEntries = entries.filter(e => new Date(e.created_at!).toISOString().split('T')[0] === today)
  const todayHours = todayEntries.reduce((sum, e) => sum + e.time_spent!, 0) / 60

  // This Week's Stats (Last 7 days)
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  const weekEntries = entries.filter(e => new Date(e.created_at!) >= weekStart)
  const weekHours = weekEntries.reduce((sum, e) => sum + e.time_spent!, 0) / 60

  // Streak Calculation
  const calculateStreak = () => {
    if (entries.length === 0) return 0
    
    const dates = Array.from(new Set(entries.map(e => new Date(e.created_at!).toISOString().split('T')[0])))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    
    let streak = 0
    let currentDate = new Date()
    const todayStr = currentDate.toISOString().split('T')[0]
    
    // Check if there's an entry for today or yesterday to start the streak
    const firstDate = dates[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    if (firstDate !== todayStr && firstDate !== yesterdayStr) return 0

    let checkDate = new Date(firstDate)
    
    for (let i = 0; i < dates.length; i++) {
      const dateStr = checkDate.toISOString().split('T')[0]
      if (dates.includes(dateStr)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    return streak
  }

  const streak = calculateStreak()

  const StatCard = ({ 
    label, 
    value, 
    subtext, 
    icon: Icon, 
    colorClass,
    trend 
  }: { 
    label: string; 
    value: string | number; 
    subtext: string; 
    icon: any; 
    colorClass: string;
    trend?: string;
  }) => (
    <div className='bg-white border border-slate-200 p-4 rounded-2xl shadow-xs hover:shadow-sm transition-all group'>
      <div className='flex items-start justify-between mb-3'>
        <div className={cn('p-2 rounded-xl bg-slate-50 group-hover:scale-110 transition-transform', colorClass)}>
          <Icon className='size-4' />
        </div>
        {trend && (
          <div className='flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-tight'>
            <TrendingUp className='size-3' />
            {trend}
          </div>
        )}
      </div>
      <div className='space-y-1'>
        <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider'>{label}</p>
        <div className='flex items-baseline gap-1'>
          <h4 className='text-2xl font-black text-slate-800 tracking-tight'>{value}</h4>
          <span className='text-[10px] font-bold text-slate-400 uppercase'>{subtext}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
      <StatCard
        label='Today'
        value={todayHours.toFixed(1)}
        subtext='hours'
        icon={Clock}
        colorClass='text-blue-500'
        trend={todayHours > 4 ? 'Goal Hit' : undefined}
      />
      <StatCard
        label='Weekly'
        value={weekHours.toFixed(1)}
        subtext='hours'
        icon={Calendar}
        colorClass='text-purple-500'
        trend={weekHours > 20 ? '+12%' : undefined}
      />
      <StatCard
        label='Total Logs'
        value={entries.length}
        subtext='entries'
        icon={Activity}
        colorClass='text-orange-500'
      />
      <StatCard
        label='Streak'
        value={streak}
        subtext='days'
        icon={Zap}
        colorClass='text-yellow-500'
        trend={streak > 3 ? 'On Fire' : undefined}
      />
    </div>
  )
}
