import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Project {
  id: string
  title: string
  description?: string
}

interface ProjectState {
  projects: Project[]
  setProjects: (projects: Project[]) => void
  getProjectById: (id: string) => Project | undefined
  clearProjects: () => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      setProjects: (projects) => set({ projects }),
      getProjectById: (id) => get().projects.find((p) => p.id === id),
      clearProjects: () => set({ projects: [] }),
    }),
    {
      name: 'project-storage',
    }
  )
)
