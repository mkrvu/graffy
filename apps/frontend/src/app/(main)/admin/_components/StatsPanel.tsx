"use client"

import { useEffect } from "react"
import { useAdminStore } from "@/stores/adminStore"

export function StatsPanel() {
  const { stats, isLoading, error, fetchStats } = useAdminStore()

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (isLoading && !stats) return <div className="text-tertiary text-sm py-8 text-center">Загрузка…</div>
  if (error && !stats) return <div className="text-red-400 text-sm py-8 text-center">{error}</div>
  if (!stats) return null

  const items: { label: string; value: string | number }[] = [
    { label: "Всего пользователей", value: stats.totalUsers },
    { label: "Средняя активность", value: stats.averageUserActivity.toFixed(1) },
    { label: "Выполненных задач", value: stats.totalCompletedTasks },
    { label: "Суммарный XP", value: stats.totalXpEarned },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(i => (
        <div key={i.label} className="bg-card rounded-2xl border border-theme p-4 flex flex-col gap-1">
          <span className="text-tertiary text-xs font-medium">{i.label}</span>
          <span className="text-primary font-bold" style={{ fontSize: 22 }}>
            {i.value}
          </span>
        </div>
      ))}
    </div>
  )
}
