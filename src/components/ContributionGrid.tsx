import { useState, useEffect, useMemo } from 'react'
import { Skeleton } from './ui/skeleton'
import { useUser } from '@/contexts/UserContext'

export function ContributionGrid() {
  const { authFetch } = useUser()
  const [data, setData] = useState<{ counts: Record<string, number>; streak: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await authFetch('/api/stats/daily-counts')
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch contribution stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [authFetch])

  // Generate grid data for last 52 weeks (1 year)
  const gridData = useMemo(() => {
    if (!data) return []

    const weeks: { date: string; count: number }[][] = []
    const today = new Date()
    const year = today.getFullYear()
    const firstDayOfYear = new Date(year, 0, 1)
    
    // Get the Monday of the week containing Jan 1st
    const day = firstDayOfYear.getDay()
    const diff = firstDayOfYear.getDate() - day + (day === 0 ? -6 : 1)
    const startMonday = new Date(firstDayOfYear)
    startMonday.setDate(diff)
    startMonday.setHours(0, 0, 0, 0)

    for (let w = 0; w < 52; w++) {
      const weekData: { date: string; count: number }[] = []
      for (let d = 0; d < 5; d++) { // Mon to Fri
        const date = new Date(startMonday)
        date.setDate(date.getDate() + (w * 7 + d))
        const dateStr = date.toISOString().split('T')[0]
        
        // Strictly start from Jan 01
        const isBeforeYear = date < firstDayOfYear
        
        weekData.push({
          date: dateStr,
          count: isBeforeYear ? -1 : (data.counts[dateStr] || 0)
        })
      }
      weeks.push(weekData)
    }

    return weeks
  }, [data])

  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = []
    let lastMonth = -1

    gridData.forEach((week, index) => {
      // Find the first visible day in the week to determine the month label
      const visibleDay = week.find(d => d.count !== -1)
      if (!visibleDay) return

      const date = new Date(visibleDay.date)
      const month = date.getMonth()
      if (month !== lastMonth) {
        labels.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex: index
        })
        lastMonth = month
      }
    })
    return labels
  }, [gridData])


  const getIntensityClass = (count: number) => {
    if (count === -1) return 'opacity-0 pointer-events-none'
    if (count === 0) return 'bg-slate-100'
    if (count <= 2) return 'bg-emerald-100'
    if (count <= 5) return 'bg-emerald-300'
    if (count <= 10) return 'bg-emerald-500'
    return 'bg-emerald-700'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const daysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

  if (isLoading) {
    return (
      <div className='mb-6 space-y-4'>
        <div className='flex justify-between items-center'>
          <Skeleton className='h-7 w-24' />
          <Skeleton className='h-5 w-32' />
        </div>
        <div className='flex gap-1 overflow-hidden'>
          {[...Array(20)].map((_, i) => (
            <div key={i} className='flex flex-col gap-1'>
              {[...Array(5)].map((_, j) => (
                <Skeleton key={j} className='size-3 rounded-sm' />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='mb-6 rounded-lg w-full'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-semibold text-[#24292e]'>Activity</h3>
        {data && data.streak > 0 && (
          <div className='text-sm py-1 px-3 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm transition-all hover:scale-105'>
            <span className='font-bold'>{data.streak}</span>
            <span className='ml-1 font-medium'>day streak 🔥</span>
          </div>
        )}
      </div>

      <div className='relative w-full overflow-hidden'>
        <div className='hidden sm:block absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-background to-transparent z-10 pointer-events-none' />
        <div className='hidden sm:block absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-background to-transparent z-10 pointer-events-none' />
        <div className='overflow-x-auto w-full pb-2 thin-scrollbar'>
          <div className='inline-flex gap-1 min-w-max px-1 sm:px-4'>
            {/* Day labels */}
            <div className='flex flex-col justify-between py-[2px] pr-2 mt-4'>
              {daysLabels.map((day) => (
                <div key={day} className='text-[10px] uppercase font-bold text-slate-400 h-3 flex items-center leading-none'>
                  {day}
                </div>
              ))}
            </div>

          <div className='flex flex-col'>
            {/* Months row */}
            <div className='flex gap-1 mb-1 h-3 relative'>
              {gridData.map((_, i) => {
                const label = monthLabels.find(l => l.weekIndex === i)
                return (
                  <div key={i} className='w-3 relative'>
                    {label && (
                      <span className='absolute bottom-0 left-0 text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap'>
                        {label.month}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Grid */}
            <div className='flex gap-1'>
              {gridData.map((week, weekIndex) => (
                <div key={weekIndex} className='flex flex-col gap-1'>
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className={`size-3 rounded-[2px] ${getIntensityClass(day.count)} transition-all hover:ring-2 hover:ring-emerald-500 hover:ring-offset-1 cursor-pointer ring-inset`}
                      title={`${formatDate(day.date)}: ${day.count} ${day.count === 1 ? 'entry' : 'entries'}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>

      <div className='mt-3 flex items-center gap-2 text-xs text-slate-400 font-medium'>
        <span>Less</span>
        <div className='flex gap-1'>
          <div className='w-3 h-3 bg-slate-100 rounded-sm' />
          <div className='w-3 h-3 bg-emerald-100 rounded-sm' />
          <div className='w-3 h-3 bg-emerald-300 rounded-sm' />
          <div className='w-3 h-3 bg-emerald-500 rounded-sm' />
          <div className='w-3 h-3 bg-emerald-700 rounded-sm' />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
