"use client"

import { useState } from "react"
import Link from "next/link"
import { Emoji } from "emoji-picker-react"
import { addDays, differenceInCalendarDays, isToday } from "date-fns"
import { Habit, HabitFrequency } from "@/types"
import { useHabitStore } from "@/stores/habitStore"
import { useAuthStore } from "@/stores/authStore"

const PERIOD_DAYS: Record<HabitFrequency, number> = {
  DAILY: 1,
  WEEKLY: 7,
  MONTHLY: 30,
}

interface HabitCardProps {
  habit: Habit
}

export function HabitCard({ habit }: HabitCardProps) {
  const { completeHabit, uncompleteHabit } = useHabitStore()
  const { fetchUser } = useAuthStore()
  const [busy, setBusy] = useState(false)

  // 7 дней с центром на сегодня: -3 … сегодня … +3
  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 3))

  // Дата начала привычки: явная либо дата создания.
  const start = new Date(habit.startDate ?? habit.createdAt)
  const period = PERIOD_DAYS[habit.frequency]

  // День «плановый», если он не раньше начала и попадает на шаг расписания.
  const isScheduled = (day: Date) => {
    const diff = differenceInCalendarDays(day, start)
    return diff >= 0 && diff % period === 0
  }

  const handleToday = async () => {
    if (busy) return
    setBusy(true)
    try {
      if (habit.completedToday) {
        await uncompleteHabit(habit.id)
      } else {
        await completeHabit(habit.id)
      }
      fetchUser()
    } catch {
      // ошибка обработана в сторе
    }
    setBusy(false)
  }

  return (
    <div className="bg-accent rounded-[33px] p-6 flex flex-col gap-6">
      {/* Шапка: эмодзи + название — клик ведёт в редактирование */}
      <Link
        href={`/habits/new?id=${habit.id}`}
        className="flex items-center gap-3 active:opacity-80 transition-opacity"
      >
        {habit.emoji && <Emoji unified={habit.emoji} size={28} />}
        <span className="text-lg font-medium text-white leading-none">{habit.title}</span>
      </Link>

      {/* Недельная полоса: отметить можно только в плановый день и только сегодня */}
      <div className="flex items-center justify-between">
        {days.map((day, i) => {
          const today = isToday(day)
          const past = !today && day < new Date()
          const scheduled = isScheduled(day)
          const done = today && habit.completedToday
          const canToggle = today && scheduled && !busy

          let circleClass = "bg-transparent border-transparent opacity-30"
          if (done) {
            circleClass = "bg-[#DDA2FF] border-[#DDA2FF]"
          } else if (today && scheduled) {
            circleClass = "bg-transparent border-white"
          } else if (past && scheduled) {
            circleClass = "bg-transparent border-[#B281FF] opacity-40"
          } else if (scheduled) {
            circleClass = "bg-transparent border-[#B281FF]"
          }

          const weekdays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
          const dayLabel = weekdays[day.getDay()]

          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className={`text-sm font-medium ${today ? "text-white" : "text-accent-light"}`}>{dayLabel}</span>
              <button
                type="button"
                onClick={canToggle ? handleToday : undefined}
                disabled={!canToggle}
                className={`w-[33px] h-[33px] rounded-[16px] flex items-center justify-center border-2 transition-colors ${circleClass} ${canToggle ? "active:opacity-70 cursor-pointer" : "cursor-default"}`}
              >
                <span className="text-[13px] font-medium text-white">{day.getDate()}</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
