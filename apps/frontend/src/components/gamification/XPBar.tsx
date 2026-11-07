"use client"

import { User } from "@/types"

export const LEVEL_TITLES = [
  "Новичок",
  "Ученик",
  "Искатель",
  "Исследователь",
  "Практик",
  "Умелец",
  "Знаток",
  "Мастер",
  "Эксперт",
  "Ветеран",
  "Элита",
  "Легенда",
  "Мифический",
  "Эпический",
  "Бессмертный",
  "Вознесённый",
  "Трансцендент",
  "Космический",
  "Вселенский",
  "Абсолют",
  "GRAFFY",
]

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[level] ?? "GRAFFY"
}

function formatXP(n: number): string {
  return n.toLocaleString("ru-RU")
}

const XP_GRADIENT = "linear-gradient(90deg, #9957FF 0%, #DDA2FF 100%)"

interface XPBarProps {
  user: User
  compact?: boolean
}

export function XPBar({ user, compact = false }: XPBarProps) {
  // Уровень и прогресс приходят с бэка (LevelCalculator).
  const currentLevel = user.level
  const xpInLevel = user.xpInLevel
  const xpForLevel = user.xpForLevel
  const progressPercent = user.progressPercent

  if (compact) {
    return (
      <div className="flex items-center mt-2 gap-2">
        <span className="text-xs font-bold text-accent">Ур.{currentLevel}</span>
        <div className="flex-1 h-1.5 bg-card-2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%`, background: XP_GRADIENT }}
          />
        </div>
        <span className="text-xs text-tertiary">
          {xpInLevel}/{xpForLevel}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 mt-2 w-full">
      <div className="flex items-baseline justify-between">
        <span className="text-base font-medium text-primary leading-[14px]">Уровень {currentLevel}</span>
        <span className="text-base font-medium text-primary leading-4">
          {formatXP(xpInLevel)} / {formatXP(xpForLevel)} XP
        </span>
      </div>

      <div className="w-full h-2 rounded-full bg-card-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%`, background: XP_GRADIENT }}
        />
      </div>
    </div>
  )
}
