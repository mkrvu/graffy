"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useHabitStore } from "@/stores/habitStore"
import { useAuthStore } from "@/stores/authStore"
import { XPBar } from "@/components/gamification/XPBar"
import { IconPlus } from "../tasks/_components/icons"
import { HabitCard } from "./_components/HabitCard"

export default function HabitsPage() {
  const { habits, fetchHabits } = useHabitStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  return (
    <div className="px-4 pb-[110px] flex flex-col gap-8">
      {/* XP-бар — закреплён сверху */}
      {user && (
        <div className="sticky top-0 z-20 -mx-4 px-4 pt-5 pb-3 bg-app">
          <XPBar user={user} />
        </div>
      )}

      {/* Пустое состояние */}
      {habits.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-accent-muted flex items-center justify-center">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#9957FF" strokeWidth="2" />
              <circle cx="12" cy="9" r="2.5" fill="#9957FF" />
            </svg>
          </div>
          <p className="text-sm text-tertiary text-center max-w-[320px]">
            Привычка — это повторяющиеся задачи. Например, ежедневная зарядка или еженедельная сдача отчётов
          </p>
        </div>
      )}

      {/* Карточки привычек */}
      {habits.length > 0 && (
        <div className="flex flex-col gap-4">
          {habits.map(habit => <HabitCard key={habit.id} habit={habit} />)}
        </div>
      )}

      {/* Кнопка создания — закреплена над нижним меню */}
      <Link
        href="/habits/new"
        className="fixed bottom-[88px] left-4 right-4 mx-auto h-14 flex items-center justify-center gap-[17px] rounded-[46px] z-30 active:opacity-80 transition-opacity"
        style={{
          background: "linear-gradient(90deg, #D7BEFF 0%, #9957FF 100%)",
          maxWidth: 480,
        }}
      >
        <IconPlus size={20} color="white" />
        <span className="text-white font-semibold text-[17px]">Создать привычку</span>
      </Link>
    </div>
  )
}
