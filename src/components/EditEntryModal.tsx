import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Tag } from 'lucide-react'
import { WorkEntry } from '../types'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { cn } from './ui/utils'
import { CATEGORIES, PRIORITIES } from '@/utils/constants-ui'

const editFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.enum([CATEGORIES[0].id, ...CATEGORIES.slice(1).map(c => c.id)]),
  project_id: z.string(),
  time_spent: z.number().min(1)
})

type EditFormValues = z.infer<typeof editFormSchema>

interface EditEntryModalProps {
  entry: WorkEntry
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (updates: Partial<WorkEntry>) => void
  projectTitle?: string
}

export function EditEntryModal({ entry, isOpen, onOpenChange, onUpdate, projectTitle }: EditEntryModalProps) {
  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      title: entry.title,
      description: entry.description || '',
      priority: entry.priority || 'medium',
      category: entry.category || 'feature',
      project_id: entry.project_id || 'internal',
      time_spent: entry.time_spent || 60
    }
  })

  const handleUpdate = (values: EditFormValues) => {
    onUpdate({
      ...values,
      description: values.description || undefined
    })
    onOpenChange(false)
  }

  const TIME_PRESETS = [
    { label: '10m', minutes: 10 },
    { label: '30m', minutes: 30 },
    { label: '1h', minutes: 60 },
    { label: '2h', minutes: 120 },
    { label: '4h', minutes: 240 }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl! p-0 gap-0 border-none shadow-2xl overflow-hidden'>
        <DialogHeader className='bg-slate-900 p-6 text-white'>
          <DialogTitle className='text-xl'>Edit Work Log</DialogTitle>
          <DialogDescription className='text-slate-400'>
            Update your entry details to reflect your work accurately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)}>
            <div className='p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar font-sans bg-white'>
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-xs font-bold text-slate-500 uppercase tracking-wider'>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className='min-h-[40px] text-lg font-semibold border-slate-200 focus-visible:ring-emerald-500 placeholder:text-slate-300'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='text-xs font-bold text-slate-500 uppercase tracking-wider'>Details & Impact</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className='text-sm font-mono bg-slate-50/50 border-slate-200 focus-visible:ring-emerald-500'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='category'
                  render={({ field }) => (
                    <FormItem className='space-y-1.5'>
                      <FormLabel className='text-xs font-bold text-slate-500 uppercase tracking-wider'>Category</FormLabel>
                      <FormControl>
                        <div className='flex flex-wrap gap-1.5'>
                          {CATEGORIES.map(cat => (
                            <Badge
                              key={cat.id}
                              variant={cat.id === field.value ? 'secondary' : 'outline'}
                              onClick={() => field.onChange(cat.id)}
                              className={cn(
                                'cursor-pointer rounded-full h-8 px-3 text-xs transition-all',
                                cat.id === field.value && 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              )}
                            >
                              {cat.label}
                            </Badge>
                          ))}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='time_spent'
                  render={({ field }) => (
                    <FormItem className='space-y-1.5'>
                      <FormLabel className='text-xs font-bold text-slate-500 uppercase tracking-wider'>Time Invested</FormLabel>
                      <FormControl>
                        <div className='flex flex-wrap gap-1.5'>
                          {TIME_PRESETS.map(preset => (
                            <Badge
                              key={preset.minutes}
                              variant={field.value === preset.minutes ? 'secondary' : 'outline'}
                              onClick={() => field.onChange(preset.minutes)}
                              className={cn(
                                'cursor-pointer rounded-full h-8 px-3 text-xs transition-all',
                                field.value === preset.minutes && 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              )}
                            >
                              {preset.label}
                            </Badge>
                          ))}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-6'>
                <div className='flex items-center gap-2 text-sm text-slate-600 font-medium'>
                  <Tag className='size-3.5 text-slate-400' />
                  {projectTitle || entry?.project_id || 'Unknown'}
                </div>

                <FormField
                  control={form.control}
                  name='priority'
                  render={({ field }) => (
                    <FormItem className='space-y-1.5'>
                      <FormLabel className='text-xs font-bold text-slate-500 uppercase tracking-wider'>Priority</FormLabel>
                      <FormControl>
                        <div className='flex flex-wrap gap-1.5'>
                          {PRIORITIES.map(priority => (
                            <Badge
                              key={priority.id}
                              variant={field.value === priority.id ? 'secondary' : 'outline'}
                              onClick={() => field.onChange(priority.id)}
                              className={cn(
                                'cursor-pointer rounded-full h-8 px-3 text-xs transition-all',
                                field.value === priority.id && 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              )}
                            >
                              {priority.label}
                            </Badge>
                          ))}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className='p-4 bg-slate-50 border-t flex justify-end gap-3'>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button className='bg-emerald-600 hover:bg-emerald-700' type="submit">Update Entry</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
