import React from 'react'
import { Filter, Search, X, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { CATEGORIES, PRIORITIES, STATUSES } from '@/utils/constants-ui'
import { cn } from '@/components/ui/utils'
import { useProjectStore } from '@/store/useProjectStore'

interface FilterBarProps {
  filters: {
    q: string
    category: string | null
    projectId: string | null
    status: string | null
    priority: string | null
    dateRange: DateRange | undefined
  }
  setFilters: (filters: any) => void
  onClear: () => void
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  onClear
}) => {
  const { projects } = useProjectStore()
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search Input */}
        <div className="relative w-full sm:flex-1 min-w-[100px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            className="pl-9 h-8 sm:h-7 w-full shadow-none border-[#d0d7de]!"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
          {/* Category Filter */}
          <Select
            value={filters.category || 'all'}
            onValueChange={(val) => setFilters({ ...filters, category: val === 'all' ? null : val })}
          >
            <SelectTrigger className="w-fit text-xs h-8 sm:h-7!">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2 text-xs">
                    {cat.icon} {cat.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Project Filter */}
          <Select
            value={filters.projectId || 'all'}
            onValueChange={(val) => setFilters({ ...filters, projectId: val === 'all' ? null : val })}
          >
            <SelectTrigger className="w-fit text-xs h-8 sm:h-7!">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="text-xs">{p.title}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.status || 'all'}
            onValueChange={(val) => setFilters({ ...filters, status: val === 'all' ? null : val })}
          >
            <SelectTrigger className="w-fit text-xs h-8 sm:h-7!">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <div className="flex items-center gap-2 text-xs">
                    {s.icon} {s.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select
            value={filters.priority || 'all'}
            onValueChange={(val) => setFilters({ ...filters, priority: val === 'all' ? null : val })}
          >
            <SelectTrigger className="w-fit text-xs h-8 sm:h-7!">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Priorities</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <span className={cn("text-xs font-medium", p.color)}>{p.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left text-xs font-normal bg-white w-fit h-8 sm:h-7 border-[#d0d7de]!",
                  !filters.dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="size-3.5" />
                {filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                      {format(filters.dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange?.from}
                selected={filters.dateRange}
                onSelect={(range) => setFilters({ ...filters, dateRange: range })}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>

          {/* Clear Filters */}
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4 mr-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
