"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useProfileStore } from "@/stores/profileStore"
import { ProfileHeader, BadgesTab, StatsPills } from "./_components"
import { XPBar } from "@/components"

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { stats, badges, fetchProfile } = useProfileStore()

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  if (!user) return null

  return (
    <div className="px-5 pt-4 flex flex-col gap-4">
      <ProfileHeader />
      <div className="flex flex-col gap-6 mt-2">
        <XPBar user={user} />
        {stats && <StatsPills stats={stats} />}
      </div>

      <div className="mt-4 p-3 bg-[var(--filter-btn-bg)] flex flex-col gap-3 rounded-[20px]">
        <div className="flex gap-2">
          <button
            type="button"
            disabled
            className="flex-1 py-3 rounded-full text-sm font-semibold bg-card-2 text-tertiary opacity-40 cursor-not-allowed"
          >
            Статистика
          </button>
          <button type="button" className="flex-1 py-3 rounded-full bg-accent text-sm font-medium text-white">
            Достижения
          </button>
        </div>

        <BadgesTab badges={badges} />
      </div>
    </div>
  )
}
