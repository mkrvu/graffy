"use client"

import { useEffect } from "react"
import { useAdminStore } from "@/stores/adminStore"
import { BADGE_CATEGORY_INFO } from "@/types"

export function BadgesPanel() {
  const { badges, error, fetchBadges } = useAdminStore()

  useEffect(() => {
    fetchBadges()
  }, [fetchBadges])

  return (
    <div className="flex flex-col gap-3">
      {error && <div className="text-red-400 text-sm">{error}</div>}

      <div className="flex flex-col gap-2">
        {badges.map(b => (
          <div
            key={b.id}
            className="bg-card border border-theme rounded-2xl p-3 flex justify-between items-center"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-primary font-semibold text-sm truncate">
                {b.title}{" "}
                <span className="text-tertiary text-xs">
                  T{b.tier} · {b.code}
                </span>
              </span>
              <span className="text-tertiary text-xs truncate">
                {BADGE_CATEGORY_INFO[b.category]?.name ?? b.category}
                {b.manualOnly ? " · ручная выдача" : ` · треб. ${b.requirement}`}
              </span>
            </div>
          </div>
        ))}
        {badges.length === 0 && (
          <div className="text-tertiary text-sm py-8 text-center">Нет бейджей</div>
        )}
      </div>
    </div>
  )
}
