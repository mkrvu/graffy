import { BadgeCategory, Badge } from "@/types"
import { cn } from "@/lib/utils"
import Image from "next/image"

const ROMAN = ["", "I", "II", "III"]

// Порядок категорий, который рисуем сверху вниз.
const CATEGORY_ORDER: BadgeCategory[] = [
  "TASK_MASTER",
  "TERMINATOR",
  "XP_HUNTER",
  "DISCIPLINE",
  "UNSTOPPABLE",
  "PIONEER",
  "SOCIAL",
]

type Size = "sm" | "lg"

function BadgeItem({ badge, size }: { badge: Badge; size: Size }) {
  const earned = !!badge.issuedAt
  const width = size === "lg" ? 116 : 88
  return (
    <div className="flex flex-col items-center gap-1.5" title={badge.description ?? badge.title}>
      {badge.iconUrl ? (
        <img
          src={badge.iconUrl}
          alt={badge.title}
          style={{ width }}
          className={cn("h-auto object-contain transition-opacity", !earned && "opacity-40 grayscale")}
        />
      ) : (
        <div
          style={{ width, height: width * 1.13 }}
          className={cn(
            "rounded-2xl flex items-center justify-center bg-accent-muted",
            !earned && "opacity-40 grayscale",
          )}
        >
          <Image src="/reward.svg" alt="reward" width={22} height={26} />
        </div>
      )}
      <span
        className={cn("text-[10px] font-semibold leading-tight text-center", earned ? "text-primary" : "text-tertiary")}
      >
        {badge.title}
        {ROMAN[badge.tier] ? ` ${ROMAN[badge.tier]}` : ""}
      </span>
    </div>
  )
}

// Раскладка одной строки: [T1, T3 (большой центр), T2]. Для одно-тировых (Pioneer) — только центр.
function CategoryRow({ category, badges }: { category: BadgeCategory; badges: Badge[] }) {
  const t1 = badges.find(b => b.tier === 1)
  const t2 = badges.find(b => b.tier === 2)
  const t3 = badges.find(b => b.tier === 3)
  const center = t3 ?? t1 ?? badges[0]
  const showSides = !!t2 && !!t3 // полноценная тройка только если есть и T2, и T3

  return (
    <div className="flex items-end justify-center gap-4">
      {showSides ? (
        <>
          {t1 && <BadgeItem badge={t1} size="sm" />}
          {center && <BadgeItem badge={center} size="lg" />}
          {t2 && <BadgeItem badge={t2} size="sm" />}
        </>
      ) : (
        center && <BadgeItem badge={center} size="lg" />
      )}
    </div>
  )
}

export function BadgesTab({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) return null

  const byCategory = CATEGORY_ORDER.map(cat => ({ cat, items: badges.filter(b => b.category === cat) })).filter(
    g => g.items.length > 0,
  )

  return (
    <div className="flex flex-col p-3 bg-[var(--card-bg)] rounded-[20px] gap-6">
      {byCategory.map(({ cat, items }) => (
        <div key={cat} className="flex flex-col gap-2">
          {/* <p className="text-xs font-bold text-tertiary uppercase tracking-wider px-1">
            {BADGE_CATEGORY_INFO[cat].name}
          </p> */}
          <CategoryRow category={cat} badges={items} />
        </div>
      ))}
    </div>
  )
}
