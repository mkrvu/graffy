"use client"

import { useEffect, useState } from "react"
import { useNotificationStore, Toast } from "@/stores/notificationStore"

const TOAST_DURATION_MS = 4000
const EXIT_MS = 220

export function ToastHost() {
  const toasts = useNotificationStore(s => s.toasts)

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col items-center gap-2 pt-3 px-3 pointer-events-none">
      {toasts.map(t => (
        <ToastCard key={t.id} toast={t} />
      ))}
    </div>
  )
}

function ToastCard({ toast }: { toast: Toast }) {
  const dismiss = useNotificationStore(s => s.dismiss)
  const id = toast.id
  const [exiting, setExiting] = useState(false)

  const close = () => {
    if (exiting) return
    setExiting(true)
    setTimeout(() => dismiss(id), EXIT_MS)
  }

  useEffect(() => {
    const handle = setTimeout(close, TOAST_DURATION_MS)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const { title, subtitle, icon, accent } = renderContent(toast)

  return (
    <div
      className={`pointer-events-auto w-full max-w-[440px] ${
        exiting ? "animate-slide-up-out" : "animate-slide-down"
      }`}
      role="status"
      style={{
        opacity: exiting ? 0 : 1,
        transform: exiting ? "translateY(-12px)" : "translateY(0)",
        transition: `opacity ${EXIT_MS}ms ease, transform ${EXIT_MS}ms ease`,
      }}
    >
      <div
        className="relative flex items-center gap-3 rounded-[22px] px-3 py-3 pr-10 overflow-hidden"
        style={{
          background: "var(--card-bg)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 14px 40px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Цветная вертикальная полоса слева */}
        <span
          aria-hidden
          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
          style={{ background: accent }}
        />

        {/* Иконка в кружке */}
        <div
          className="ml-1 w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-xl"
          style={{
            background: `linear-gradient(135deg, ${accent}33, ${accent}1a)`,
            boxShadow: `inset 0 0 0 1px ${accent}40`,
          }}
        >
          <span style={{ filter: "saturate(1.1)" }}>{icon}</span>
        </div>

        {/* Текст */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-primary font-semibold text-[14px] leading-tight">{title}</span>
          {subtitle && (
            <span className="text-tertiary text-[12px] leading-tight mt-0.5 truncate">{subtitle}</span>
          )}
        </div>

        {/* Кнопка закрытия */}
        <button
          type="button"
          onClick={close}
          aria-label="Закрыть"
          className="absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-tertiary hover:text-primary active:opacity-60 transition-colors"
          style={{ background: "var(--bg-secondary)" }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
            <path
              d="M1 1L10 10M10 1L1 10"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

function renderContent(t: Toast): { title: string; subtitle?: string; icon: string; accent: string } {
  if (t.data.kind === "badge") {
    return {
      title: "Получен бейдж",
      subtitle: `${t.data.title} · T${t.data.tier}`,
      icon: "🏅",
      accent: "#FBCD63",
    }
  }
  if (t.data.kind === "level") {
    return {
      title: "Новый уровень!",
      subtitle: `Уровень ${t.data.level}`,
      icon: "⚡",
      accent: "#9957FF",
    }
  }
  return {
    title: `Серия ${t.data.days} дней`,
    subtitle: "Так держать!",
    icon: "🔥",
    accent: "#F23B54",
  }
}
