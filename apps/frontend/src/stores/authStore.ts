import { create } from "zustand"
import api from "@/lib/api"
import { tokenStorage } from "@/lib/cookies"
import { resetUserStores } from "@/lib/resetStores"
import { User, AuthResponse } from "@/types"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (email: string, password: string, nickname?: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  updateUser: (user: User) => void
  clearError: () => void
}

function mapUser(dto: AuthResponse["user"]): User {
  return {
    id: dto.id,
    email: dto.email,
    username: dto.nickname,
    avatarUrl: dto.avatarUrl,
    bio: dto.bio,
    city: dto.city,
    xp: dto.xp,
    level: dto.level,
    xpInLevel: dto.xpInLevel,
    xpForLevel: dto.xpForLevel,
    progressPercent: dto.progressPercent,
    role: dto.role.toUpperCase() as User["role"],
    createdAt: "",
  }
}

function getError(err: unknown): string {
  const e = err as { response?: { data?: { error?: string; message?: string } } }
  return e?.response?.data?.error ?? e?.response?.data?.message ?? "Неизвестная ошибка"
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,

  login: async (email, password, rememberMe = true) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post<AuthResponse>("/auth/login", { email, password })
      tokenStorage.save(data.accessToken, data.refreshToken, rememberMe)
      resetUserStores()
      set({
        user: mapUser(data.user),
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
      })
    } catch (err) {
      set({ error: getError(err), isLoading: false })
      throw err
    }
  },

  register: async (email, password, nickname, rememberMe = true) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post<AuthResponse>("/auth/register", { email, password, nickname })
      tokenStorage.save(data.accessToken, data.refreshToken, rememberMe)
      resetUserStores()
      set({
        user: mapUser(data.user),
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
      })
    } catch (err) {
      set({ error: getError(err), isLoading: false })
      throw err
    }
  },

  logout: async () => {
    const refreshToken = tokenStorage.getRefresh()
    if (refreshToken) {
      try {
        await api.post("/auth/logout", { refreshToken })
      } catch {}
    }
    tokenStorage.clear()
    resetUserStores()
    set({ user: null, isAuthenticated: false, isInitialized: true })
  },

  fetchUser: async () => {
    if (!tokenStorage.getRefresh()) {
      set({ user: null, isAuthenticated: false, isInitialized: true })
      return
    }
    try {
      const { data } = await api.get<AuthResponse["user"]>("/auth/me")
      set({ user: mapUser(data), isAuthenticated: true, isInitialized: true })
    } catch {
      set({ user: null, isAuthenticated: false, isInitialized: true })
    }
  },

  updateUser: user => set({ user }),
  clearError: () => set({ error: null }),
}))
