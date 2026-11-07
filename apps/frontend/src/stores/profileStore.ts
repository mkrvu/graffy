import { create } from 'zustand'
import api from '@/lib/api'
import { ProfileStats, StatsResponse, Badge, BadgeCategory, Task, GraphStats } from '@/types'

// Бэк отдаёт категорию в PascalCase (Discipline), на фронте — UPPER_SNAKE (DISCIPLINE).
const CATEGORY_FROM_API: Record<string, BadgeCategory> = {
  TaskMaster: 'TASK_MASTER',
  Terminator: 'TERMINATOR',
  XpHunter: 'XP_HUNTER',
  Discipline: 'DISCIPLINE',
  Unstoppable: 'UNSTOPPABLE',
  Pioneer: 'PIONEER',
  Social: 'SOCIAL',
}

function normalizeBadge(b: Badge): Badge {
  const fromApi = CATEGORY_FROM_API[b.category as unknown as string]
  return fromApi ? { ...b, category: fromApi } : b
}

interface ProfileState {
  stats: ProfileStats | null
  statsResponse: StatsResponse | null
  graphStats: GraphStats | null
  badges: Badge[]
  history: Task[]
  isLoading: boolean
  error: string | null
  fetchProfile: () => Promise<void>
  fetchStats: () => Promise<void>
  fetchGraphStats: () => Promise<void>
  fetchBadges: () => Promise<void>
  fetchHistory: () => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
  clearError: () => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  stats: null,
  statsResponse: null,
  graphStats: null,
  badges: [],
  history: [],
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true })
    try {
      const [statsRes, badgesRes] = await Promise.all([
        api.get<ProfileStats>('/profile/stats'),
        api.get<Badge[]>('/badges'),
      ])
      set({ stats: statsRes.data, badges: badgesRes.data.map(normalizeBadge), isLoading: false })
    } catch {
      set({ error: 'Не удалось загрузить профиль', isLoading: false })
    }
  },

  fetchStats: async () => {
    try {
      const { data } = await api.get<StatsResponse>('/profile/stats/detailed')
      set({ statsResponse: data })
    } catch {
      set({ error: 'Не удалось загрузить статистику' })
    }
  },

  fetchGraphStats: async () => {
    try {
      const { data } = await api.get<GraphStats>('/graph/stats')
      set({ graphStats: data })
    } catch {
      set({ error: 'Не удалось загрузить данные графика' })
    }
  },

  fetchBadges: async () => {
    try {
      const { data } = await api.get<Badge[]>('/badges')
      set({ badges: data.map(normalizeBadge) })
    } catch {
      set({ error: 'Не удалось загрузить значки' })
    }
  },

  fetchHistory: async () => {
    try {
      const { data } = await api.get<Task[]>('/profile/history')
      set({ history: data })
    } catch {
      set({ error: 'Не удалось загрузить историю' })
    }
  },

  uploadAvatar: async (file) => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post<{ avatarUrl: string }>('/profile/me/avatar', form, {
      headers: { 'Content-Type': undefined },
    })
    return data.avatarUrl
  },

  clearError: () => set({ error: null }),
}))
