import { create } from "zustand"
import api from "@/lib/api"
import { ClanDetails, ClanSummary, ClanInvitePreview } from "@/types"

interface ClanState {
  myClan: ClanDetails | null
  isInitialized: boolean
  isLoading: boolean
  error: string | null

  fetchMy: () => Promise<void>
  create: (name: string, nickname: string, color: string) => Promise<ClanSummary>
  getById: (id: string) => Promise<ClanDetails>
  getInvitePreview: (token: string) => Promise<ClanInvitePreview>
  acceptInvite: (token: string) => Promise<ClanDetails>
  getInviteToken: (clanId: string) => Promise<string>
  regenerateInvite: (clanId: string) => Promise<string>
  leave: (clanId: string) => Promise<void>
  remove: (clanId: string) => Promise<void>
  kickMember: (clanId: string, userId: string) => Promise<void>
  transferLeadership: (clanId: string, userId: string) => Promise<void>
  clearError: () => void
}

function getError(err: unknown, fallback: string): string {
  const e = err as { response?: { status?: number; data?: { error?: string } } }
  return e?.response?.data?.error ?? fallback
}

export const useClanStore = create<ClanState>((set, get) => ({
  myClan: null,
  isInitialized: false,
  isLoading: false,
  error: null,

  fetchMy: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get<ClanDetails>("/clans/my")
      set({ myClan: data, isInitialized: true, isLoading: false })
    } catch (err) {
      const e = err as { response?: { status?: number } }
      if (e?.response?.status === 404) {
        set({ myClan: null, isInitialized: true, isLoading: false })
        return
      }
      set({ error: getError(err, "Не удалось загрузить клан"), isInitialized: true, isLoading: false })
    }
  },

  create: async (name, nickname, color) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post<ClanSummary>("/clans", { name, nickname, color })
      await get().fetchMy()
      set({ isLoading: false })
      return data
    } catch (err) {
      const msg = getError(err, "Не удалось создать клан")
      set({ error: msg, isLoading: false })
      throw new Error(msg)
    }
  },

  getById: async id => {
    const { data } = await api.get<ClanDetails>(`/clans/${id}`)
    return data
  },

  getInvitePreview: async token => {
    const { data } = await api.get<ClanInvitePreview>(`/clans/invites/${token}`)
    return data
  },

  acceptInvite: async token => {
    try {
      const { data } = await api.post<ClanDetails>(`/clans/invites/${token}/accept`)
      set({ myClan: data, isInitialized: true })
      return data
    } catch (err) {
      const msg = getError(err, "Не удалось присоединиться к клану")
      set({ error: msg })
      throw new Error(msg)
    }
  },

  getInviteToken: async clanId => {
    const { data } = await api.get<{ token: string }>(`/clans/${clanId}/invite`)
    return data.token
  },

  regenerateInvite: async clanId => {
    const { data } = await api.post<{ token: string }>(`/clans/${clanId}/invite/regenerate`)
    return data.token
  },

  leave: async clanId => {
    try {
      await api.post(`/clans/${clanId}/leave`)
      set({ myClan: null })
    } catch (err) {
      const msg = getError(err, "Не удалось выйти из клана")
      set({ error: msg })
      throw new Error(msg)
    }
  },

  remove: async clanId => {
    try {
      await api.delete(`/clans/${clanId}`)
      set({ myClan: null })
    } catch (err) {
      const msg = getError(err, "Не удалось удалить клан")
      set({ error: msg })
      throw new Error(msg)
    }
  },

  kickMember: async (clanId, userId) => {
    try {
      await api.delete(`/clans/${clanId}/members/${userId}`)
      const my = get().myClan
      if (my && my.id === clanId) {
        set({ myClan: { ...my, members: my.members.filter(m => m.userId !== userId) } })
      }
    } catch (err) {
      const msg = getError(err, "Не удалось удалить участника")
      set({ error: msg })
      throw new Error(msg)
    }
  },

  transferLeadership: async (clanId, userId) => {
    try {
      await api.post(`/clans/${clanId}/transfer/${userId}`)
      await get().fetchMy()
    } catch (err) {
      const msg = getError(err, "Не удалось передать лидерство")
      set({ error: msg })
      throw new Error(msg)
    }
  },

  clearError: () => set({ error: null }),
}))
