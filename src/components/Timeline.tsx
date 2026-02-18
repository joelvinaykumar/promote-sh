import { WorkEntry } from '../types'
import { EntryCard } from './EntryCard'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'

interface TimelineProps {
  entries: WorkEntry[]
  newEntryId: string | null
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<WorkEntry>) => void
}

export function Timeline({ entries, newEntryId, onDelete, onUpdate }: TimelineProps) {
  const getMonthYear = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  }

  // Group entries by date
  const groupedEntries = entries.reduce(
    (groups, entry) => {
      const date = entry?.created_at ? new Date(entry?.created_at).toISOString().split('T')[0]: new Date().toISOString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(entry)
      return groups
    },
    {} as { [date: string]: WorkEntry[] }
  )

  const formatGroupDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (dateStr === today) return 'Today'
    if (dateStr === yesterdayStr) return 'Yesterday'

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  const sortedDates = Object.keys(groupedEntries).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  const monthYearGroups = Array.from(new Set(sortedDates.map(d => getMonthYear(d)))).map(month => ({
    month,
    dates: sortedDates.filter(d => getMonthYear(d) === month)
  }))

  const isToday = (dateStr: string) => dateStr === new Date().toISOString().split('T')[0]

  return (
    <Accordion
      type='multiple'
      defaultValue={[monthYearGroups[0]?.month]}
      className='w-full space-y-4'
    >
      {monthYearGroups.map(group => (
        <AccordionItem key={group.month} value={group.month} className='border-none'>
          <AccordionTrigger className='hover:no-underline py-2'>
            <div className='flex items-center gap-4 w-full'>
              <h2 className='text-lg font-bold text-slate-800 whitespace-nowrap'>{group.month}</h2>
              <div className='h-px bg-slate-200 flex-1' />
            </div>
          </AccordionTrigger>
          <AccordionContent className='pt-6'>
            <div className='relative pl-8 ml-3'>
              {/* Vertical Timeline Line */}
              <div className='absolute left-1 top-1 bottom-0 w-[2px] bg-slate-100 rounded-full' />

              <Accordion type='multiple' defaultValue={[group.dates[0]]} className='space-y-6'>
                {group.dates.map(date => (
                  <AccordionItem key={date} value={date} className='border-none relative'>
                    {/* Timeline Node (Dot) */}
                    <div
                      className={`absolute -left-[33px] top-1.5 size-3 rounded-full border-2 border-white shadow-sm z-10 ${
                        isToday(date) ? 'bg-primary ring-4 ring-primary/10 animate-pulse' : 'bg-slate-300'
                      }`}
                    />

                    <AccordionTrigger className='hover:no-underline py-0 mb-4'>
                      <h3
                        className={`text-xs font-bold uppercase tracking-widest text-left ${
                          isToday(date) ? 'text-primary' : 'text-slate-500'
                        }`}
                      >
                        {formatGroupDate(date)}
                        <span className='ml-2 text-[10px] font-normal lowercase tracking-normal text-slate-400'>
                          ({groupedEntries[date].length} {groupedEntries[date].length === 1 ? 'entry' : 'entries'})
                        </span>
                      </h3>
                    </AccordionTrigger>

                    <AccordionContent className='pb-6'>
                      <div className='space-y-4'>
                        {groupedEntries[date]
                          .sort((a, b) => (b?.created_at || 0) - (a?.created_at || 0))
                          .map(entry => (
                            <EntryCard
                              key={entry.id}
                              entry={entry}
                              isNew={entry.id === newEntryId}
                              onDelete={() => onDelete(entry?.id ?? "")}
                              onUpdate={updates => onUpdate(entry?.id ?? "", updates)}
                            />
                          ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
