import { useState, useEffect, useCallback } from 'react'
import { WorkEntry } from '../types'
import {
  SidebarIcon,
  Circle,
  Sun,
  LogOut,
  Plus,
  Trash2,
  Loader2,
  Ellipsis,
  Pencil,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenu,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarMenuAction
} from './ui/sidebar'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { useUser } from '../contexts/UserContext'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Textarea } from './ui/textarea'
import { DayPicker } from 'react-day-picker'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'

interface ProfileSidebarProps {
  entries: WorkEntry[]
  side?: 'left' | 'right'
}
const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
})

export function ProfileSidebar({ entries, side = 'left' }: ProfileSidebarProps) {
  const { state, toggleSidebar } = useSidebar()
  const { logout, user, authFetch } = useUser()
  const [projects, setProjects] = useState<z.infer<typeof projectSchema>[]>([])
  const [formVisible, setFormVisible] = useState<"project-create"| "project-delete"| null>(null)
  const [loading, setLoading] = useState<"create-project"| "get-projects"| "delete-project"| null>(null)
  const [selectedId, setSelectedId] = useState<string|null>(null)
  const isCollapsed = state === 'collapsed'

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const fetchProjects = useCallback(async () => {
    setLoading("get-projects")
    try {
      const response = await authFetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    } finally {
      setLoading(null)
    }
  }, [authFetch])

  const handleCreateProject = async (values: z.infer<typeof projectSchema>) => {
    try {
      setLoading("create-project")
      const response = await authFetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify({ ...values})
      })

      if (response.ok) {
        fetchProjects()
        setFormVisible(null)
        setSelectedId(null)
        form.reset()
      }
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleUpdateProject = async (values: z.infer<typeof projectSchema>) => {
    try {
      setLoading("create-project")
      const response = await authFetch(`/api/projects/${selectedId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...values})
      })

      if (response.ok) {
        fetchProjects()
        setFormVisible(null)
        setSelectedId(null)
        form.reset({})
      }
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleSubmitProject =  async (values: z.infer<typeof projectSchema>) => {
    if(selectedId) {
      handleUpdateProject(values)
    } else {
      handleCreateProject(values)
    }
  }

  const handleDeleteProject = async () => {
    try {
      setLoading("delete-project")
      const response = await authFetch(`/api/projects/${selectedId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchProjects()
        setFormVisible(null)
        form.reset({})
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
    } finally {
      setLoading(null)
    }
  }

  useEffect(() => {
    fetchProjects()

    return () => {
      form.reset({})
      setSelectedId(null)
    }
  }, [])

  // Group entries by projectId for project view
  const projectStats = projects.map(project => ({
    ...project,
    count: entries.filter(e => e.projectId === project.id).length,
    hours: entries.filter(e => e.projectId === project.id).reduce((sum, e) => sum + e.timeSpent, 0) / 60
  }))

  return (
    <>
    <Sidebar side={side} collapsible='icon' variant='floating'>
      {/* Header */}
      <SidebarHeader>
        <div className='flex items-center justify-between p-2'>
          {!isCollapsed && <h2 className='text-xl font-bold text-slate-800'>Profile</h2>}
          <Button onClick={toggleSidebar} size='icon' variant='link' className='px-0'>
            {isCollapsed? (
              <Avatar>
                <AvatarFallback>{user?.email?.[0]}</AvatarFallback>
              </Avatar>
              ):<SidebarIcon />}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className='space-y-6 px-2'>
        {/* User Profile Card */}
        {!isCollapsed && (
          <div className='bg-white rounded-xl p-4 border border-slate-100 shadow-sm space-y-6'>
            <div className='flex items-center gap-4'>
              <Avatar className='size-10'>
                <AvatarFallback className='size-10 rounded-full'>{user?.email?.[0]}</AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <h3 className='text-sm font-bold text-slate-800 leading-tight'>{user?.email}</h3>
                <p className='text-xs text-slate-400 font-medium leading-tight'>Developer</p>
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className='text-muted-foreground'>Projects</SidebarGroupLabel>
          <SidebarMenu className='space-y-2'>
            {projectStats.map(project => (
              <SidebarMenuItem
                key={project.id}
                className='group border border-slate-100 transition-all cursor-pointer hover:border-slate-200 rounded-xl'
              >
                <SidebarMenuButton asChild tooltip={project.title}>
                  <div className='flex items-center justify-between gap-3 h-14'>
                    <div className='flex items-center gap-3'>
                      {!isCollapsed && (
                        <div className='flex flex-col'>
                          <span className='text-sm font-semibold text-slate-700'>{project.title}</span>
                          <div className='flex items-center gap-1'>
                            <span className='text-[10px] text-slate-400 font-medium'>{project.count} entries</span>
                            <Circle className='size-1 bg-slate-300 rounded-full' />
                            <span className='text-[10px] text-slate-400 font-medium'>{project.hours} hours</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </SidebarMenuButton>
                <SidebarMenuAction>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Ellipsis className='size-4 invisible group-hover:visible' />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                         onClick={() => {
                            setFormVisible("project-create")
                            setSelectedId(project?.id || null)
                            form.reset({
                              title: project.title,
                              description: project.description,
                              start_date: project.start_date,
                              end_date: project.end_date,
                            })
                          }}
                      >
                        <Pencil className='size-3'/>
                        Update
                      </DropdownMenuItem>
                      <DropdownMenuItem
                         onClick={() => {
                            setFormVisible("project-delete")
                            setSelectedId(project?.id || null)
                          }}
                      >
                        <Trash2
                          className='size-3 text-destructive'
                        />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuAction>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <SidebarGroupAction>
            {loading==="get-projects" ?<Loader2 className='ml-1 animate-spin' />: <Plus className='size-4 text-muted-foreground cursor-pointer' onClick={() => setFormVisible("project-create")} />}
          </SidebarGroupAction>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='pt-2'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button variant="secondary">
                <Sun className='size-4' />
                {!isCollapsed && <p>Light Theme</p>}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild  >
              <Button variant="destructive" onClick={logout}>
                <LogOut className='size-4 ' />
                {!isCollapsed && <p>Logout</p>}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
    <Dialog open={formVisible === "project-create"} onOpenChange={open => setFormVisible(open ? "project-create" : null)}>
      <DialogContent>
      <DialogHeader>
        <DialogTitle>{selectedId? "Update":"Create a"} project</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitProject)} className='grid grid-cols-2 gap-4 py-4'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem className='col-span-2'>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder='Project title' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem className='col-span-2'>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder='Project description' {...field} value={field?.value ?? ""}  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='start_date'
            render={({ field }) => (
              <FormItem className='col-span-1'>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type='date' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='end_date'
            render={({ field }) => (
              <FormItem className='col-span-1'>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type='date' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <DialogFooter className='col-span-2'>
          <Button variant="secondary" onClick={() => setFormVisible(null)}>Cancel</Button>
          <Button variant="default" type='submit' loading={form.formState.isSubmitting || loading === "create-project"}>
            {selectedId? "Update":"Create"}
          </Button>
        </DialogFooter>
        </form>
      </Form>
      </DialogContent>
    </Dialog>
    <AlertDialog open={formVisible === "project-delete"} onOpenChange={open => setFormVisible(open ? "project-delete" : null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete "{selectedId}" and remove all the entries under this project. We recommend backing up project before permanent deletion.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>         
          <Button variant="destructive" loading={loading === "delete-project"} onClick={handleDeleteProject}>
            Delete Project
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
