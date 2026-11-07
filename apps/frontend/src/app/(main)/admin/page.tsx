"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { useAdminStore } from "@/stores/adminStore"
import { cn } from "@/lib/utils"
import { StatsPanel } from "./_components/StatsPanel"
import { UsersPanel } from "./_components/UsersPanel"
import { BadgesPanel } from "./_components/BadgesPanel"

type Tab = "stats" | "users" | "badges"

const TAB_LABELS: Record<Tab, string> = {
  stats: "Статистика",
  users: "Пользователи",
  badges: "Бейджи",
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuthStore()
  const [tab, setTab] = useState<Tab>("stats")

  useEffect(() => {
    if (isInitialized && user && user.role !== "ADMIN") {
      router.replace("/tasks")
    }
  }, [isInitialized, user, router])

  if (!user || user.role !== "ADMIN") return null

  return (
    <div className="px-5 pt-4 pb-4 flex flex-col gap-4">
      <h1 className="text-primary font-bold" style={{ fontSize: 22 }}>
        Админ-панель
      </h1>

      <div className="flex gap-1 bg-card rounded-2xl p-1 border border-theme">
        {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200",
              tab === t
                ? "bg-gradient-purple text-white shadow-glow-purple"
                : "text-tertiary hover:text-secondary",
            )}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === "stats" && <StatsPanel />}
      {tab === "users" && <UsersPanel />}
      {tab === "badges" && <BadgesPanel />}
    </div>
  )
}
