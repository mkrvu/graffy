"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface AddSectionSheetProps {
  onSubmit: (name: string) => void
  onClose: () => void
}

const inputClass = cn(
  "w-full bg-input border border-input rounded-[16.62px]",
  "py-[17px] px-[22px]",
  "text-primary font-medium text-sm",
  "placeholder:text-tertiary",
  "outline-none focus:border-accent transition-colors duration-150",
)

export function AddSectionSheet({ onSubmit, onClose }: AddSectionSheetProps) {
  const [name, setName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || submitting) return
    setSubmitting(true)
    onSubmit(name.trim())
    setSubmitting(false)
  }

  const canSubmit = name.trim().length > 0 && !submitting

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 animate-fade-in" onClick={onClose} aria-hidden />

      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up max-w-[430px] mx-auto">
        {/* FAB submit button — floats above the sheet */}
        <div className="relative flex justify-end px-5 mb-3 pointer-events-none">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-[59px] h-[59px] rounded-full flex items-center justify-center active:scale-95 transition-all duration-150 pointer-events-auto"
            style={{
              background: canSubmit
                ? "linear-gradient(90deg, #D7BEFF 0%, #9957FF 100%)"
                : "rgba(153, 87, 255, 0.35)",
            }}
            aria-label="Создать"
          >
            <svg width="22" height="17" viewBox="0 0 22 17" fill="none" aria-hidden>
              <path d="M2 8.5L8.5 15L20 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div
          className="px-8 pb-12 flex flex-col gap-6"
          style={{
            borderRadius: "53.419px 53.419px 0 0",
            background: "var(--sheet-bg)",
            boxShadow: "0 2px 15px 0 rgba(0, 0, 0, 0.30)",
          }}
        >
          <div className="w-10 h-1 rounded-full bg-[rgba(40,40,40,0.15)] mx-auto" />

          <form onSubmit={handleSubmit}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Название"
              autoFocus
              className={inputClass}
            />
          </form>
        </div>
      </div>
    </>
  )
}
