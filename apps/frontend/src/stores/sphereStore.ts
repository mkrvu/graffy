import { create } from "zustand"
import api from "@/lib/api"

export interface Sphere {
  id: string
  name: string
  emoji: string
  habitCount: number
  createdAt: string
}

interface SphereState {
  spheres: Sphere[]
  isLoading: boolean
  error: string | null
  fetchSpheres: () => Promise<void>
  addSphere: (name: string, emoji: string) => Promise<void>
  removeSphere: (id: string) => Promise<void>
  clearError: () => void
}

export const useSphereStore = create<SphereState>((set, get) => ({
  spheres: [],
  isLoading: false,
  error: null,

  fetchSpheres: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get<Sphere[]>("/spheres")
      set({ spheres: data, isLoading: false })
    } catch {
      set({ error: "Не удалось загрузить сферы", isLoading: false })
    }
  },

  addSphere: async (name, emoji) => {
    const { data } = await api.post<Sphere>("/spheres", { name, emoji })
    set(s => ({ spheres: [...s.spheres, data] }))
  },

  removeSphere: async (id) => {
    // Удаление на бэке soft-delete: существующие привычки/задачи сохраняют свою сферу,
    // но в списке для выбора она больше не появится.
    await api.delete(`/spheres/${id}`)
    set(s => ({ spheres: s.spheres.filter(s => s.id !== id) }))
  },

  clearError: () => set({ error: null }),
}))
