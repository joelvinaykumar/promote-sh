import { useEffect, useState, useCallback } from 'react'
import { DateRange } from 'react-day-picker'

import { QuickPostBox } from '@/components/QuickPostBox'
import { ContributionGrid } from '@/components/ContributionGrid'
import { Timeline } from '@/components/Timeline'
import { StatsBar } from '@/components/StatsBar'
import { FilterBar } from '@/components/FilterBar'

import { Skeleton } from '@/components/ui/skeleton'
import { WorkEntry } from '@/types'
import { useUser } from '@/contexts/UserContext'
import { useProjectStore } from '@/store/useProjectStore'


export const DashboardPage: React.FC = () => {
  const { authFetch } = useUser()
  const { projects, setProjects } = useProjectStore()
  const [entries, setEntries] = useState<WorkEntry[]>([])
  const [newEntryId, setNewEntryId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Advanced Filters State
  const [filters, setFilters] = useState({
    q: '',
    category: null as string | null,
    projectId: null as string | null,
    status: null as string | null,
    priority: null as string | null,
    dateRange: undefined as DateRange | undefined,
  })

  // Load projects
  const fetchProjects = useCallback(async () => {
    try {
      const response = await authFetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }, [authFetch, setProjects])

  // Load entries from API
  const fetchEntries = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.q) params.append('q', filters.q)
      if (filters.category) params.append('category', filters.category)
      if (filters.projectId) params.append('project_id', filters.projectId)
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.dateRange?.from) params.append('start_date', filters.dateRange.from.toISOString())
      if (filters.dateRange?.to) params.append('end_date', filters.dateRange.to.toISOString())
      
      const response = await authFetch(`/api/entries?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Failed to fetch entries:', error)
    } finally {
      setIsLoading(false)
    }
  }, [authFetch, filters])

  const handleAddEntry = async (entry: Omit<WorkEntry, 'id' | 'createdAt'>) => {
    try {
      let finalEntry = { ...entry }
      
      // Auto-summarize if title is missing
      if (!finalEntry.title && finalEntry.description) {
        try {
          const sumRes = await authFetch('/api/chat/summarize', {
            method: 'POST',
            body: JSON.stringify({ description: finalEntry.description })
          })
          if (sumRes.ok) {
            const { title } = await sumRes.json()
            finalEntry.title = title
          }
        } catch (sumError) {
          console.error('Failed to auto-summarize:', sumError)
          // Fallback: use first few words of description
          finalEntry.title = finalEntry.description.split('\n')[0].substring(0, 50) || 'Untitled Entry'
        }
      }

      // If still no title (e.g. empty description), use default
      if (!finalEntry.title) {
        finalEntry.title = 'Untitled Entry'
      }

      const response = await authFetch('/api/entries', {
        method: 'POST',
        body: JSON.stringify(finalEntry)
      })
      if (response.ok) {
        fetchEntries()
      }
    } catch (error) {
      console.error('Failed to add entry:', error)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      const response = await authFetch(`/api/entries/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchEntries()
      }
    } catch (error) {
      console.error('Failed to delete entry:', error)
    }
  }

  const handleUpdateEntry = async (id: string, updates: Partial<WorkEntry>) => {
    try {
      const response = await authFetch(`/api/entries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      })
      if (response.ok) {
        const updatedEntry = await response.json()
        setEntries(entries.map(e => (e.id === id ? updatedEntry : e)))
      }
    } catch (error) {
      console.error('Failed to update entry:', error)
    }
  }

  const handleClearFilters = () => {
    setFilters({
      q: '',
      category: null,
      projectId: null,
      status: null,
      priority: null,
      dateRange: undefined,
    })
  }

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  return (
    <div className='flex-1 h-full overflow-y-auto thin-scrollbar'>
      <div className='max-w-5xl w-full p-4 sm:p-6 space-y-4 sm:space-y-6 mx-auto'>
        {/* Contribution Grid */}
        <ContributionGrid />

        {/* Stats Bar */}
        <StatsBar entries={entries} />

        {/* Quick Post Box */}
        <QuickPostBox onAddEntry={handleAddEntry} />

        {/* Advanced Filter Bar */}
        <FilterBar 
          filters={filters} 
          setFilters={setFilters} 
          onClear={handleClearFilters}
        />

        {/* Timeline */}
        {isLoading ? (
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='flex items-start gap-4 p-4 bg-white rounded-lg border border-[#d0d7de]'>
                <Skeleton className='size-10 rounded-full shrink-0' />
                <div className='space-y-2 flex-1'>
                  <Skeleton className='h-5 w-[40%]' />
                  <Skeleton className='h-4 w-[90%]' />
                  <Skeleton className='h-4 w-[70%]' />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length > 0 ? (
          <Timeline
            entries={entries}
            newEntryId={newEntryId}
            onDelete={handleDeleteEntry}
            onUpdate={handleUpdateEntry}
          />
        ) : (
          <div className='text-center py-12 bg-white rounded-lg border border-[#d0d7de]'>
            <p className='text-[#57606a]'>No entries found matching your filters</p>
          </div>
        )}
      </div>
    </div> 
  )
}