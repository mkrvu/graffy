"use client"

import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useFilterStore } from "@/stores/filterStore"
import { TaskDifficulty } from "@/types"
import { CircleIcon, TriangleIcon, SquareIcon, RhombusIcon } from "./icons"
import { Emoji } from "emoji-picker-react"
import { useSphereStore } from "@/stores/sphereStore"

const DIFF_ICON: Record<TaskDifficulty, React.ComponentType<{ color?: string }>> = {
  TRIVIAL: CircleIcon,
  EASY: TriangleIcon,
  MEDIUM: SquareIcon,
  HARD: RhombusIcon,
}

const DAYS_RU = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]

const MONTHS_RU = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
]

function getMonday(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  const day = copy.getDay()
  copy.setDate(copy.getDate() - (day === 0 ? 6 : day - 1))
  return copy
}

function getDueDateInfo(dueDateStr: string): { label: string; color: string } | null {
  const due = new Date(dueDateStr)
  if (isNaN(due.getTime())) return null
  const now = new Date()
  const hoursLeft = (due.getTime() - now.getTime()) / 3_600_000
  const thisMonday = getMonday(now)
  const nextMonday = new Date(thisMonday)
  nextMonday.setDate(thisMonday.getDate() + 7)
  const isThisWeek = due >= thisMonday && due < nextMonday
  const label = isThisWeek ? DAYS_RU[due.getDay()] : `${due.getDate()} ${MONTHS_RU[due.getMonth()]}`
  const color = hoursLeft < 12 ? "#F34D64" : isThisWeek ? "#9957FF" : "#A7A5A6"
  return { label, color }
}

function CalendarIcon({ color }: { color: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="1" y="2.5" width="13" height="11" rx="2" stroke={color} strokeWidth="1.3" />
      <path d="M1 6.5h13" stroke={color} strokeWidth="1.3" />
      <path d="M5 1v3M10 1v3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

interface TaskLike {
  id: string
  title: string
  isCompleted: boolean
  dueDate?: string
  difficulty: TaskDifficulty
  sphereId?: string
}

const REVEAL = 64
const SNAP = 40

function SwipeDeleteRow({
  onDelete,
  onClick,
  children,
}: {
  onDelete: () => void
  onClick?: () => void
  children: React.ReactNode
}) {
  const [offsetX, setOffsetX] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const draggingRef = useRef(false)
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = rowRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      startXRef.current = e.touches[0].clientX
      startYRef.current = e.touches[0].clientY
      draggingRef.current = true
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current) return
      const dx = e.touches[0].clientX - startXRef.current
      const dy = e.touches[0].clientY - startYRef.current
      if (Math.abs(dx) <= Math.abs(dy)) return
      // Закрыта и тянут вправо — нечего показывать, отдаём жест системе.
      if (!revealed && dx > 0) return
      // Открыта и тянут ещё левее — уже максимум, игнорируем.
      if (revealed && dx < 0) return
      e.preventDefault()
      const base = revealed ? -REVEAL : 0
      const next = Math.max(-REVEAL, Math.min(0, base + dx))
      setOffsetX(next)
    }

    const onTouchEnd = () => {
      draggingRef.current = false
      if (offsetX <= -SNAP) {
        setOffsetX(-REVEAL)
        setRevealed(true)
      } else {
        setOffsetX(0)
        setRevealed(false)
      }
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
    }
  }, [offsetX, revealed])

  return (
    <div className="relative overflow-hidden" style={{ borderTop: "1px solid rgba(40,40,40,0.05)" }}>
      <button
        type="button"
        onClick={e => {
          e.stopPropagation()
          setOffsetX(0)
          setRevealed(false)
          onDelete()
        }}
        className="absolute inset-y-0 right-0 flex items-center justify-center active:opacity-70"
        style={{ width: REVEAL, background: "#F34D64" }}
        aria-label="Удалить задачу"
      >
        <svg width="16" height="18" viewBox="0 0 16 18" fill="none" aria-hidden>
          <path
            d="M1 4h14M5 4V2.5A1.5 1.5 0 0 1 6.5 1h3A1.5 1.5 0 0 1 11 2.5V4m2 0v11.5A1.5 1.5 0 0 1 11.5 17h-7A1.5 1.5 0 0 1 3 15.5V4h10Z"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        ref={rowRef}
        className="bg-bg transition-transform duration-200"
        style={{ transform: `translateX(${offsetX}px)`, touchAction: "pan-y" }}
        onClick={() => {
          if (revealed) {
            setOffsetX(0)
            setRevealed(false)
          } else onClick?.()
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface BoardTaskItemProps {
  task: TaskLike
  sectionId: string
  isDraggingThis: boolean
  onToggle: () => void
  onDelete: () => void
  onDragStart: () => void
  onDrag: (e: TouchEvent) => void
  onDragStop: () => void
  href?: string
}

export function BoardTaskItem({
  task,
  sectionId,
  isDraggingThis,
  onToggle,
  onDelete,
  onDragStart,
  onDrag,
  onDragStop,
  href,
}: BoardTaskItemProps) {
  const router = useRouter()
  const showDifficulty = useFilterStore(s => s.showDifficulty)
  const showSpheres = useFilterStore(s => s.showSpheres)
  const spheres = useSphereStore(s => s.spheres)
  const sphere = task.sphereId ? spheres.find(s => s.id === task.sphereId) : undefined
  const sphereEmoji = sphere?.emoji
  const dateInfo = task.dueDate && !task.isCompleted ? getDueDateInfo(task.dueDate) : null

  const wrapRef = useRef<HTMLDivElement>(null)
  const isDragActiveRef = useRef(false)
  const didDragRef = useRef(false)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartRef = useRef({ x: 0, y: 0 })

  // Stable refs so closures inside useEffect never go stale
  const onDragRef = useRef(onDrag)
  const onDragStopRef = useRef(onDragStop)
  const onDragStartRef = useRef(onDragStart)
  useEffect(() => {
    onDragRef.current = onDrag
  }, [onDrag])
  useEffect(() => {
    onDragStopRef.current = onDragStop
  }, [onDragStop])
  useEffect(() => {
    onDragStartRef.current = onDragStart
  }, [onDragStart])

  useEffect(() => {
    if (!sectionId) return
    const el = wrapRef.current
    if (!el) return

    // Called once long-press fires — blocks scroll and starts visual drag
    const onDocMove = (e: TouchEvent) => {
      e.preventDefault()
      didDragRef.current = true
      const t = e.touches[0]
      const dx = t.clientX - touchStartRef.current.x
      const dy = t.clientY - touchStartRef.current.y
      el.style.transform = `translate(${dx}px, ${dy}px)`
      onDragRef.current(e)
    }

    const onDocEnd = () => {
      document.removeEventListener("touchmove", onDocMove)
      document.removeEventListener("touchend", onDocEnd)
      if (isDragActiveRef.current) {
        isDragActiveRef.current = false
        el.style.transform = ""
        el.style.opacity = ""
        onDragStopRef.current()
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      touchStartRef.current = { x: t.clientX, y: t.clientY }
      didDragRef.current = false

      longPressTimerRef.current = setTimeout(() => {
        isDragActiveRef.current = true
        // Non-passive on document — fires AFTER user held still 450ms, so scroll won't compete
        document.addEventListener("touchmove", onDocMove, { passive: false })
        document.addEventListener("touchend", onDocEnd, { passive: true })
        el.style.opacity = "0.6"
        onDragStartRef.current()
        if (navigator.vibrate) navigator.vibrate(20)
      }, 450)
    }

    const onTouchMove = (e: TouchEvent) => {
      // Only used to cancel long-press if finger moves before timer fires
      if (isDragActiveRef.current) return
      const dx = e.touches[0].clientX - touchStartRef.current.x
      const dy = e.touches[0].clientY - touchStartRef.current.y
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        clearTimeout(longPressTimerRef.current!)
        longPressTimerRef.current = null
      }
    }

    const onTouchEnd = () => {
      clearTimeout(longPressTimerRef.current!)
      longPressTimerRef.current = null
      // If drag was not yet active, document listeners were never added — nothing to clean
    }

    const blockContextMenu = (e: Event) => e.preventDefault()

    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchmove", onTouchMove, { passive: true })
    el.addEventListener("touchend", onTouchEnd, { passive: true })
    el.addEventListener("contextmenu", blockContextMenu)

    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
      el.removeEventListener("contextmenu", blockContextMenu)
      document.removeEventListener("touchmove", onDocMove)
      document.removeEventListener("touchend", onDocEnd)
      clearTimeout(longPressTimerRef.current!)
    }
  }, [sectionId])

  const canOpen = !!href && !task.isCompleted
  const openEdit = canOpen ? () => router.push(href!) : undefined

  const inner = (
    <div
      className={cn(
        "flex flex-col justify-center select-none transition-opacity duration-150",
        isDraggingThis && "opacity-40 z-50 relative",
      )}
      style={{ gap: 2, padding: "8px 0" }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            onToggle()
          }}
          className={cn(
            "w-[22px] h-[22px] rounded-full shrink-0 transition-all duration-200 active:opacity-70",
            task.isCompleted ? "bg-accent flex items-center justify-center" : "border-2 border-accent",
          )}
          aria-label={task.isCompleted ? "Снять отметку выполнения" : "Выполнить"}
        >
          {task.isCompleted && (
            <svg width="9" height="6" viewBox="0 0 9 6" fill="none" aria-hidden>
              <path d="M1 3L3.5 5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <span
          className={cn(
            "flex-1 text-sm font-medium leading-[14px]",
            task.isCompleted ? "line-through text-tertiary" : "text-primary",
          )}
        >
          {task.title}
        </span>

        <div className="flex items-center gap-3">
          {showDifficulty &&
            DIFF_ICON[task.difficulty] &&
            (() => {
              const Icon = DIFF_ICON[task.difficulty]!
              return <Icon color={"var(--fg)"} />
            })()}
        </div>
      </div>

      {(dateInfo || (showSpheres && sphereEmoji)) && (
        <div className="flex items-center gap-2" style={{ paddingLeft: 34 }}>
          {showSpheres && sphereEmoji && (
            <div className="flex items-center gap-1">
              <Emoji unified={sphereEmoji} size={16} />
              {sphere?.name && <span className="text-xs text-tertiary">{sphere.name}</span>}
            </div>
          )}

          {dateInfo && (
            <div className="flex items-center gap-[6.5px]">
              {!(showSpheres && sphereEmoji) && <CalendarIcon color={dateInfo.color} />}
              <span className="font-medium" style={{ fontSize: 11.5, lineHeight: "11.5px", color: dateInfo.color }}>
                {dateInfo.label}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )

  if (!sectionId) {
    return (
      <SwipeDeleteRow onDelete={onDelete} onClick={openEdit}>
        {inner}
      </SwipeDeleteRow>
    )
  }

  return (
    <div
      ref={wrapRef}
      className={cn(
        "flex flex-col justify-center select-none transition-opacity duration-150 border-t",
        isDraggingThis && "opacity-40",
      )}
      style={{
        borderColor: "rgba(40, 40, 40, 0.05)",
        gap: 2,
        padding: "8px 0",
        position: "relative",
        zIndex: isDraggingThis ? 50 : undefined,
      }}
      onClick={() => {
        if (!didDragRef.current && canOpen) openEdit!()
      }}
    >
      {inner}
    </div>
  )
}
