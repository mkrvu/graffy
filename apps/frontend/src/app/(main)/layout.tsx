"use client"

import { useEffect, useRef } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useThemeStore } from "@/stores/themeStore"
import { useNotificationStore } from "@/stores/notificationStore"
import { BottomNav, ToastHost } from "@/components/layout"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { fetchUser, isInitialized, isAuthenticated } = useAuthStore()
  const { theme } = useThemeStore()
  const pollAndShow = useNotificationStore(s => s.pollAndShow)
  const fetched = useRef(false)

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    fetchUser()
  }, [fetchUser])

  // Поллинг уведомлений каждые 5 секунд для авторизованного юзера.
  useEffect(() => {
    if (!isAuthenticated) return
    pollAndShow()
    const id = setInterval(pollAndShow, 5000)
    return () => clearInterval(id)
  }, [isAuthenticated, pollAndShow])

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-app">
        <div
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <>
      <main className="pb-20 max-w-lg mx-auto">{children}</main>
      <BottomNav />
      <ToastHost />
    </>
  )
}
