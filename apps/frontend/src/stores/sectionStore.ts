import { create } from 'zustand'
import api from '@/lib/api'
import { TaskSection } from '@/types'

interface SectionState {
  sections: TaskSection[]
  isFetching: boolean
  fetchSections: () => Promise<void>
  createSection: (name: string) => Promise<TaskSection>
  updateSection: (id: string, name: string) => Promise<void>
  deleteSection: (id: string) => Promise<void>
}

export const useSectionStore = create<SectionState>((set, get) => ({
  sections: [],
  isFetching: false,

  fetchSections: async () => {
    if (get().isFetching) return
    set({ isFetching: true })
    try {
      const { data } = await api.get<TaskSection[]>('/sections')
      set({ sections: data })
    } finally {
      set({ isFetching: false })
    }
  },

  createSection: async (name) => {
    const { data } = await api.post<TaskSection>('/sections', { name })
    set((state) => ({ sections: [...state.sections, data] }))
    return data
  },

  updateSection: async (id, name) => {
    const { data } = await api.put<TaskSection>(`/sections/${id}`, { name })
    set((state) => ({
      sections: state.sections.map((s) => (s.id === id ? data : s)),
    }))
  },

  deleteSection: async (id) => {
    const prev = get().sections
    set((state) => ({ sections: state.sections.filter((s) => s.id !== id) }))
    try {
      await api.delete(`/sections/${id}`)
    } catch {
      set({ sections: prev })
      throw new Error('Failed to delete section')
    }
  },
}))
