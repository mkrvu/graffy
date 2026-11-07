import { create } from "zustand"
import api from "@/lib/api"
import { AdminUser, AdminStats, Badge } from "@/types"

interface CreateBadgePayload {
  code: string
  title: string
  description?: string
  iconUrl?: string
  category: string
  tier: number
  requirement: number
  manualOnly: boolean
}

interface AdminState {
  users: AdminUser[]
  badges: Badge[]
  stats: AdminStats | null
  isLoading: boolean
  error: string | null
  fetchStats: () => Promise<void>
  fetchUsers: () => Promise<void>
  fetchBadges: () => Promise<void>
  updateNickname: (userId: string, nickname: string) => Promise<void>
  issueBadge: (userId: string, badgeId: string) => Promise<void>
  createBadge: (data: CreateBadgePayload) => Promise<void>
  clearError: () => void
}

function getError(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { error?: string } } }
  return e?.response?.data?.error ?? fallback
}

export const useAdminStore = create<AdminState>(set => ({
  users: [],
  badges: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get<AdminStats>("/admin/stats")
      set({ stats: data, isLoading: false })
    } catch (err) {
      set({ error: getError(err, "Не удалось загрузить статистику"), isLoading: false })
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get<AdminUser[]>("/admin/users")
      set({ users: data, isLoading: false })
    } catch (err) {
      set({ error: getError(err, "Не удалось загрузить пользователей"), isLoading: false })
    }
  },

  fetchBadges: async () => {
    try {
      const { data } = await api.get<Badge[]>("/admin/badges")
      set({ badges: data })
    } catch (err) {
      set({ error: getError(err, "Не удалось загрузить бейджи") })
    }
  },

  updateNickname: async (userId, nickname) => {
    try {
      await api.put(`/admin/users/${userId}/nickname`, { nickname })
      set(state => ({
        users: state.users.map(u => (u.id === userId ? { ...u, nickname } : u)),
      }))
    } catch (err) {
      const msg = getError(err, "Не удалось изменить никнейм")
      set({ error: msg })
      throw new Error(msg)
    }
  },

  issueBadge: async (userId, badgeId) => {
    try {
      await api.post(`/admin/users/${userId}/badges`, { badgeId })
    } catch (err) {
      const msg = getError(err, "Не удалось выдать бейдж")
      set({ error: msg })
      throw new Error(msg)
    }
  },

  createBadge: async payload => {
    try {
      const { data } = await api.post<Badge>("/admin/badges", payload)
      set(state => ({ badges: [...state.badges, data] }))
    } catch (err) {
      const msg = getError(err, "Не удалось создать бейдж")
      set({ error: msg })
      throw new Error(msg)
    }
  },

  clearError: () => set({ error: null }),
}))
