import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Check } from 'lucide-react'

import { WorkEntry } from '../types'
import { Button } from './ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { cn } from './ui/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

import { CATEGORIES } from '@/utils/constants'
import { useProjectStore } from '@/store/useProjectStore'

const TIME_PRESETS = [
  { label: '10m', minutes: 10 },
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '2h', minutes: 120 },
  { label: '4h', minutes: 240 },
  { label: '8h', minutes: 480 }
]

const PRIORITY_PRESETS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' }
]

const formSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.enum([CATEGORIES[0].id, ...CATEGORIES.slice(1).map(c => c.id)]).optional(),
  project_id: z.string().optional(),
  timeSpent: z.number().optional()
})

type FormValues = z.infer<typeof formSchema>

interface QuickPostBoxProps {
  onAddEntry: (entry: Omit<WorkEntry, 'id' | 'createdAt'>) => void
}

export function QuickPostBox({ onAddEntry }: QuickPostBoxProps) {
  const { projects } = useProjectStore()
  const [showSuccess, setShowSuccess] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'bug',
      project_id: projects[0]?.id || 'internal',
      timeSpent: 60
    }
  })

  const { control, handleSubmit, reset, setValue } = form

  const onSubmit = (values: FormValues) => {
    setIsLoading(true)
    onAddEntry({
      title: values.title?.trim() || '',
      description: values.description,
      priority: (values.priority as 'low' | 'medium' | 'high') || 'medium',
      category: values.category || 'feature',
      project_id: values.project_id || 'internal',
      time_spent: values.timeSpent || 60
    })

    // Show success animation
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 1000)

    // Reset form
    reset()
    setIsExpanded(false)
    setIsLoading(false)
  }

  const timeSpent = form.watch('timeSpent')

  useEffect(() => {
    form.setValue("project_id", projects?.[0]?.id || 'internal')
  }, [projects?.[0]])

  return (
    <div className='bg-white border border-[#d0d7de] rounded-lg shadow-sm'>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Main Input Area */}
          <div className='p-4 space-y-4'>
            <FormField
              control={control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      onClick={() => {
                        setIsExpanded(true)
                        if(!isExpanded) form.setValue("description", `### Screen\n- \n\n### Work Done\n- \n\n### Impact\n- `)
                      }}
                      placeholder='What did you work on today?'
                      className={cn(
                        'w-full resize-none text-lg border-none focus-visible:ring-0 shadow-none p-0 transition-all duration-300 placeholder:text-slate-400 placeholder:text-sm bg-transparent! min-h-[40px] font-semibold tracking-tight',
                        isExpanded ? 'mb-2' : ''
                      )}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault()
                          handleSubmit(onSubmit)()
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>

          {/* Expanded Options */}
          <div
            className={cn(
              'grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
              isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 border-none'
            )}
          >
            <div className='overflow-hidden'>
              <div className='p-4 border-t border-muted flex flex-wrap gap-6 items-center'>
                {/* Category Selection */}
                <FormField
                  control={control}
                  name='category'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                        Category
                      </FormLabel>
                      <FormControl>
                        <div className='flex flex-wrap gap-2'>
                          {CATEGORIES.map(cat => (
                            <Badge
                              key={cat.id}
                              variant={cat.id === field.value ? 'secondary' : 'outline'}
                              onClick={() => field.onChange(cat.id)}
                              className='cursor-pointer rounded-full px-3 text-xs'
                            >
                              {cat.icon} {cat.label}
                            </Badge>
                          ))}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Time Selection */}
                <FormField
                  control={control}
                  name='timeSpent'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                        Time Spent
                      </FormLabel>
                      <FormControl>
                        <div className='flex flex-wrap gap-2'>
                          {TIME_PRESETS.map(preset => (
                            <Badge
                              key={preset.minutes}
                              variant={timeSpent === preset.minutes ? 'secondary' : 'outline'}
                              onClick={() => setValue('timeSpent', preset.minutes)}
                              className='cursor-pointer rounded-full px-3 text-xs'
                            >
                              {preset.label}
                            </Badge>
                          ))}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name='priority'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                        Priority
                      </FormLabel>
                      <FormControl>
                        <div className='flex flex-wrap gap-2'>
                          {PRIORITY_PRESETS.map(priority => (
                            <Badge
                              key={priority.value}
                              variant={priority.value === field.value ? 'secondary' : 'outline'}
                              onClick={() => field.onChange(priority.value)}
                              className='cursor-pointer rounded-full px-3 text-xs'
                            >
                              {priority.label}
                            </Badge>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name='project_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                        Project
                      </FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className='h-8 w-[160px] bg-white border-muted-foreground/20'>
                            <SelectValue placeholder='Select Project' />
                          </SelectTrigger>
                          <SelectContent className='bg-white border-muted'>
                            {projects.map(project => (
                              <SelectItem key={project.id} value={project.id}>
                                <span className="text-xs">{project.title}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className='px-4 py-3 bg-slate-50 border-t border-[#d0d7de] rounded-b-lg flex justify-between items-center'>
            <div
              className={cn(
                'text-xs text-[#57606a] transition-opacity duration-500 delay-100',
                isExpanded ? 'opacity-100' : 'opacity-0'
              )}
            >
              <span>
                Press <kbd className='px-1.5 py-0.5 bg-white border border-border rounded text-xs'>⌘ Enter</kbd> to post
              </span>
            </div>
            <div className='flex gap-2'>
              <Button
                type='button'
                size='sm'
                variant='ghost'
                onClick={() => {
                  reset()
                  setIsExpanded(false)
                }}
                className={cn(
                  'text-sm font-medium text-[#57606a] hover:text-[#24292e] transition-all duration-500',
                  isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none w-0 p-0 overflow-hidden'
                )}
              >
                Cancel
              </Button>
              <Button type='submit' size='sm' loading={isLoading} disabled={!form.formState.isDirty}>
                {showSuccess ? (
                  <>
                    <Check className='w-4 h-4' />
                    Posted!
                  </>
                ) : (
                  'Post Log'
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
