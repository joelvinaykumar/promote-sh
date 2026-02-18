import React, { useState } from 'react'
import { Trash2, Eye, Edit } from 'lucide-react'

import { WorkEntry } from '../types'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog'
import { cn } from './ui/utils'
import { CATEGORIES, PRIORITIES } from '@/utils/constants'
import { useProjectStore } from '@/store/useProjectStore'
import { formatTime } from '@/utils/format'
import { ViewEntryModal } from './ViewEntryModal'
import { EditEntryModal } from './EditEntryModal'

interface EntryCardProps {
  entry: WorkEntry
  isNew: boolean
  onDelete: () => void
  onUpdate: (updates: Partial<WorkEntry>) => void
}

export function EntryCard({ entry, isNew, onDelete, onUpdate }: EntryCardProps) {
  const { getProjectById } = useProjectStore()
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const category = CATEGORIES.find(c => c.id === entry.category)
  const priority = PRIORITIES.find(p => p.id === entry.priority)
  const project = getProjectById(entry.project_id || '')

  return (
    <>
      <div
        className={cn(
          'bg-white border border-[#d0d7de] rounded-lg shadow-sm transition-all group hover:border-emerald-500/50 hover:shadow-md cursor-pointer',
          isNew && 'animate-in fade-in slide-in-from-left-4 border-emerald-500 shadow-emerald-500/10'
        )}
        onClick={() => setIsViewOpen(true)}
      >
        <div className='flex items-start gap-3 p-3'>
          <div className='size-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0'>
            {category?.icon}
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between mb-0.5'>
              <h4 className='font-semibold text-slate-900 truncate pr-2'>
                {entry.title}
              </h4>
              <span className='text-[10px] font-medium text-slate-400 whitespace-nowrap'>
                {formatTime(entry.time_spent || 0)}
              </span>
            </div>

            {entry.description && (
              <p className='text-xs text-slate-500 line-clamp-1 mb-2'>
                {entry.description.replace(/[#*`]/g, '')}
              </p>
            )}

            <div className='flex items-center gap-2'>
              <Badge variant="outline" className='rounded-full h-5 px-2 text-[10px] border-slate-200 bg-slate-50/50'>
                {category?.label}
              </Badge>
              {priority && (
                <Badge className={cn(
                  'border-none rounded-lg px-2.5 py-0.5 text-[11px] font-medium shadow-xs',
                  priority.id === 'high' ? 'bg-red-50 text-red-600' :
                    priority.id === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-600'
                )}>
                  {priority.label} Priority
                </Badge>
              )}
              <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className='size-7 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsViewOpen(true)
                  }}
                >
                  <Eye className='size-3.5' />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className='size-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditOpen(true)
                  }}
                >
                  <Edit className='size-3.5' />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className='size-7 text-slate-400 hover:text-red-600 hover:bg-red-50'
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsDeleting(true)
                  }}
                >
                  <Trash2 className='size-3.5' />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ViewEntryModal
        entry={entry}
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        projectTitle={project?.title}
      />

      <EditEntryModal
        entry={entry}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        onUpdate={onUpdate}
        projectTitle={project?.title}
      />

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent className='border-none shadow-2xl'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-slate-900'>Delete Entry?</AlertDialogTitle>
            <AlertDialogDescription className='text-slate-500'>
              This will permanently remove this work log entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='border-slate-200'>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={onDelete}>Delete Entry</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
