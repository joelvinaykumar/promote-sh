import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Calendar, Clock, Tag, BottleWine, Thermometer } from 'lucide-react'
import { WorkEntry } from '../types'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'
import { formatTime, formatTimestamp } from '@/utils/format'
import { CATEGORIES, PRIORITIES } from '@/utils/constants-ui'

interface ViewEntryModalProps {
  entry: WorkEntry
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  projectTitle?: string
}

export function ViewEntryModal({ entry, isOpen, onOpenChange, projectTitle }: ViewEntryModalProps) {
  const category = CATEGORIES.find(c => c.id === entry.category)
  const priority = PRIORITIES.find(p => p.id === entry.priority)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl! p-0 gap-0 overflow-auto no-scrollbar border-none shadow-2xl rounded-2xl'>
        {/* Header Section */}
        <div className='bg-linear-to-b from-slate-50 to-white px-8 pt-10 pb-6 border-b border-slate-100'>
          <DialogTitle className='text-2xl font-bold text-slate-900 leading-tight mb-6'>
            {entry.title}
          </DialogTitle>

          <div className='grid grid-cols-4 md:grid-cols-5 gap-y-4 gap-x-8'>
            <div className='space-y-1'>
              <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Project</span>
              <div className='flex items-center gap-2 text-sm text-slate-600 font-medium'>
                <Tag className='size-3.5 text-slate-400' />
                {projectTitle || entry?.project_id || 'Unknown'}
              </div>
            </div>
            <div className='space-y-1'>
              <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Category</span>
              <div className='flex items-center gap-2 text-sm text-slate-600 font-medium'>
                <BottleWine className='size-3.5 text-slate-400' />
                {category?.label}
              </div>
            </div>
            <div className='space-y-1'>
              <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Priority</span>
              <div className='flex items-center gap-2 text-sm text-slate-600 font-medium'>
                <Thermometer className='size-3.5 text-slate-400' />
                {priority?.label}
              </div>
            </div>
            <div className='space-y-1'>
              <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Time Invested</span>
              <div className='flex items-center gap-2 text-sm text-slate-600 font-medium'>
                <Clock className='size-3.5 text-slate-400' />
                {formatTime(entry.time_spent || 0)}
              </div>
            </div>
            <div className='space-y-1'>
              <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Logged On</span>
              <div className='flex items-center gap-2 text-xs text-slate-600 font-medium'>
                <Calendar className='size-3.5 text-slate-400' />
                {formatTimestamp(entry.created_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className='p-8 bg-white'>
          <div className='space-y-1 mb-4'>
            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Detailed Notes</span>
          </div>
          <div className='pr-4 overflow-visible max-h-80 overflow-y-auto thin-scrollbar'>
            {entry.description ? (
              <div className='prose prose-slate prose-sm max-w-none 
                [&_h1]:text-black [&_h1]:font-bold [&_h1]:text-xl [&_h1]:mb-4 [&_h1]:mt-6
                [&_h2]:text-black [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mb-3 [&_h2]:mt-5
                [&_h3]:text-black [&_h3]:font-bold [&_h3]:text-base [&_h3]:mb-2 [&_h3]:mt-4
                [&_p]:text-slate-600 [&_p]:leading-relaxed [&_p]:mb-4
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4
                [&_li]:text-slate-600 [&_li]:mb-1
                [&_strong]:text-slate-900 [&_strong]:font-bold
                [&_code]:text-emerald-600 [&_code]:bg-emerald-50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.9em]
                [&_code]:before:content-none [&_code]:after:content-none'>
                <ReactMarkdown>
                  {entry.description}
                </ReactMarkdown>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-12 text-slate-300 space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200'>
                <BottleWine className='size-10 opacity-40' />
                <p className='text-sm italic font-medium'>No additional notes provided</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
