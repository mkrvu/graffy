"use client"

import { Emoji } from "emoji-picker-react"

interface SpherePillProps {
  unified: string
  name: string
  onRemove: () => void
}

export function SpherePill({ unified, name, onRemove }: SpherePillProps) {
  return (
    <div className="flex items-center gap-3 bg-accent h-[34px] px-[13px] rounded-full shrink-0">
      <div className="flex items-center gap-2">
        <Emoji unified={unified} size={16} />
        <span className="text-[11px] font-semibold text-white leading-none">{name}</span>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="flex items-center justify-center shrink-0"
        aria-label={`Удалить ${name}`}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M1 1L9 9M9 1L1 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
