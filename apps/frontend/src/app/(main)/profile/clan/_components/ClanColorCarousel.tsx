"use client"

import { ClanLogo } from "./ClanLogo"
import { cn } from "@/lib/utils"

export const CLAN_COLORS = ["#9957FF", "#F23B54", "#48D5E8", "#FBCD63", "#FFA1FC"] as const
export type ClanColor = (typeof CLAN_COLORS)[number]

interface ClanColorCarouselProps {
  color: ClanColor
  onChange: (color: ClanColor) => void
  className?: string
}

export function ClanColorCarousel({ color, onChange, className }: ClanColorCarouselProps) {
  const activeIndex = CLAN_COLORS.indexOf(color)

  return (
    <div className={cn("flex flex-col items-center w-full", className)}>
      <div className="relative w-full py-6 flex justify-center gap-5 overflow-x-hidden">
        <ClanLogo
          color={color}
          glow={false}
          logoSrc="/dragon.svg"
          className="absolute top-1/2 left-0 shrink-0 -translate-y-1/2 -translate-x-[45%] w-[36%] opacity-50 transition-[filter] duration-300"
        />
        <ClanLogo
          color={color}
          glow={false}
          logoSrc="/jedi.svg"
          size="h-[88px] left-[53%]"
          className="absolute top-1/2 right-0 shrink-0 -translate-y-1/2 translate-x-[45%] w-[36%] opacity-50 transition-[filter] duration-300"
        />
        <ClanLogo color={color} className="relative z-10 transition-[filter] duration-300" />
      </div>

      {/* Индикатор активного цвета */}
      <div className="flex items-center my-8 gap-[6px]">
        {CLAN_COLORS.map((c, i) => (
          <span
            key={c}
            className={cn(
              "w-2 h-2 rounded-full transition-colors duration-200",
              i === activeIndex ? "bg-accent" : "bg-accent-muted",
            )}
          />
        ))}
      </div>

      {/* Выбор цвета — кружки */}
      <div className="flex items-center gap-3">
        {CLAN_COLORS.map((c, i) => {
          const isActive = c === color
          return (
            <button
              key={c}
              type="button"
              aria-label={`Цвет ${i + 1}`}
              aria-pressed={isActive}
              onClick={() => onChange(c)}
              className="w-[22px] h-[22px] rounded-full transition-transform duration-200 active:scale-95"
              style={{
                backgroundColor: c,
                boxShadow: `0 0 0 3px var(--bg), 0 0 0 4px ${isActive ? c : "#D5D5D5"}`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
