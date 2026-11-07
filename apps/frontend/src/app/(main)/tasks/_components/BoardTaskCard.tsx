"use client"

import { useRef, useState, useEffect } from "react"
import { BoardTask, BoardSection } from "@/stores/boardStore"
import { cn } from "@/lib/utils"

interface BoardTaskCardProps {
  task: BoardTask
  nextSection: BoardSection | null
  onMove: () => void
  onToggle: () => void
  onDelete: () => void
}

const REVEAL_WIDTH = 96
const SNAP_THRESHOLD = 56

export function BoardTaskCard({ task, nextSection, onMove, onToggle, onDelete }: BoardTaskCardProps) {
  const [offsetX, setOffsetX] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const draggingRef = useRef(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Non-passive touch listeners so we can call preventDefault on horizontal swipes
  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      startXRef.current = e.touches[0].clientX
      startYRef.current = e.touches[0].clientY
      draggingRef.current = true
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current || !nextSection) return
      const dx = e.touches[0].clientX - startXRef.current
      const dy = e.touches[0].clientY - startYRef.current

      // Only handle horizontal-ish left swipe
      if (Math.abs(dx) > Math.abs(dy) && dx < 0) {
        e.preventDefault()
        const base = revealed ? -REVEAL_WIDTH : 0
        const target = Math.max(base + dx, -REVEAL_WIDTH)
        setOffsetX(target)
      }
    }

    const onTouchEnd = () => {
      draggingRef.current = false
      if (offsetX <= -SNAP_THRESHOLD) {
        setOffsetX(-REVEAL_WIDTH)
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
  }, [nextSection, offsetX, revealed])

  const handleMove = () => {
    onMove()
    setOffsetX(0)
    setRevealed(false)
  }

  const handleClose = () => {
    setOffsetX(0)
    setRevealed(false)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Action area (revealed on swipe left) */}
      {nextSection && (
        <button
          type="button"
          onClick={handleMove}
          className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-0.5 px-3 rounded-2xl active:opacity-80"
          style={{
            width: REVEAL_WIDTH,
            background: "linear-gradient(135deg, #D7BEFF 0%, #9957FF 100%)",
          }}
          aria-label={`Переместить в ${nextSection.name}`}
        >
          <svg width="18" height="13" viewBox="0 0 18 13" fill="none" aria-hidden>
            <path
              d="M1 6.5h16M11 1l6 5.5-6 5.5"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[9px] text-white font-semibold leading-tight text-center">
            {nextSection.name}
          </span>
        </button>
      )}

      {/* Card */}
      <div
        ref={cardRef}
        className={cn(
          "relative flex items-center gap-3 bg-card-2 rounded-2xl px-4 py-3",
          !draggingRef.current && "transition-transform duration-200",
        )}
        style={{ transform: `translateX(${offsetX}px)` }}
        onClick={revealed ? handleClose : undefined}
      >
        {/* Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          className={cn(
            "w-[22px] h-[22px] rounded-full shrink-0 transition-all duration-200",
            task.isCompleted
              ? "bg-accent flex items-center justify-center"
              : "border-2 border-accent",
          )}
          aria-label={task.isCompleted ? "Снять отметку" : "Выполнить"}
        >
          {task.isCompleted && (
            <svg width="9" height="6" viewBox="0 0 9 6" fill="none" aria-hidden>
              <path
                d="M1 3L3.5 5L8 1"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {/* Title */}
        <span
          className={cn(
            "flex-1 text-sm font-medium text-primary leading-[14px]",
            task.isCompleted && "line-through",
          )}
        >
          {task.title}
        </span>

        {/* Delete */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="w-5 h-5 flex items-center justify-center text-tertiary shrink-0 active:opacity-50"
          aria-label="Удалить задачу"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path
              d="M1 1l8 8M9 1L1 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
