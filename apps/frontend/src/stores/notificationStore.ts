import { create } from "zustand"
import api from "@/lib/api"

export type ServerNotification = {
  id: string
  type: "BadgeAwarded" | "LeveledUp" | "StreakMilestone"
  payload: string
  createdAt: string
}

export type ToastKind =
  | { kind: "badge"; title: string; iconUrl?: string | null; tier: number }
  | { kind: "level"; level: number }
  | { kind: "streak"; days: number }

export interface Toast {
  id: string
  data: ToastKind
}

interface NotificationState {
  toasts: Toast[]
  pollAndShow: () => Promise<void>
  dismiss: (id: string) => void
  pushLocal: (t: ToastKind) => void
}

function parsePayload(n: ServerNotification): ToastKind | null {
  try {
    const p = JSON.parse(n.payload)
    if (n.type === "BadgeAwarded") {
      return { kind: "badge", title: p.title, iconUrl: p.iconUrl, tier: p.tier ?? 1 }
    }
    if (n.type === "LeveledUp") {
      return { kind: "level", level: p.level }
    }
    if (n.type === "StreakMilestone") {
      return { kind: "streak", days: p.days }
    }
  } catch {}
  return null
}

export const useNotificationStore = create<NotificationState>(set => ({
  toasts: [],

  pollAndShow: async () => {
    try {
      const { data } = await api.get<ServerNotification[]>("/notifications/pending")
      if (!data || data.length === 0) return
      set(s => {
        const next: Toast[] = [...s.toasts]
        for (const n of data) {
          const parsed = parsePayload(n)
          if (parsed) next.push({ id: n.id, data: parsed })
        }
        return { toasts: next }
      })
    } catch {
      // тихо — на следующем опросе попробуем снова
    }
  },

  dismiss: id => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  pushLocal: t =>
    set(s => ({
      toasts: [...s.toasts, { id: `local-${Date.now()}-${Math.random()}`, data: t }],
    })),
}))
