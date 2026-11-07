import { useRef, useState } from "react"
import { ChevronRightIcon, InnerDivider, Row } from "./shared"
import { RangeDatePicker } from "../_components/DatePicker"

function CalendarSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1" y="2.5" width="12" height="10.5" rx="2.5" stroke="var(--accent)" strokeWidth="1.2" />
      <path d="M1 6h12" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4.5 1v3M9.5 1v3" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function TimeCreatedSortRow({
  value,
  onChange,
  rangeFrom,
  rangeTo,
  onRangeChange,
}: {
  value: string
  onChange: (v: string) => void
  rangeFrom: string
  rangeTo: string
  onRangeChange: (from: string, to: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [showCal, setShowCal] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const OPTIONS = [
    { value: "none", label: "Нет" },
    { value: "newest_first", label: "Сначала новые" },
    { value: "oldest_first", label: "Сначала старые" },
  ]

  const selected = OPTIONS.find(o => o.value === value)
  const hasRange = rangeFrom || rangeTo

  const rangeLabel = (() => {
    if (!rangeFrom && !rangeTo) return "Выбрать диапазон:"
    const fmt = (s: string) => {
      if (!s) return ""
      const d = new Date(s)
      return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getFullYear()).slice(-2)}`
    }
    return `${fmt(rangeFrom)} — ${fmt(rangeTo)}`
  })()

  return (
    <div ref={cardRef} className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full text-left active:opacity-70 transition-opacity"
      >
        <Row
          label="По времени создания"
          right={
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold" style={{ color: "var(--fg-tertiary)" }}>
                {hasRange ? rangeLabel : (selected?.label ?? "Нет")}
              </span>
              <ChevronRightIcon color={"var(--fg-tertiary)"} />
            </div>
          }
        />
      </button>

      {open && (
        <div
          className="mb-3 px-7 py-3"
          style={{
            borderRadius: 18,
            background: "var(--filter-btn-bg)",
            overflow: "visible",
            position: "relative",
          }}
        >
          {OPTIONS.map((opt, i) => {
            const active = value === opt.value && !hasRange
            return (
              <div key={opt.value}>
                {i > 0 && <InnerDivider />}
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    onRangeChange("", "")
                    setShowCal(false)
                  }}
                  className="w-full flex items-center active:opacity-70 transition-opacity"
                  style={{ padding: "15px 0", borderRadius: i === 0 ? "18px 18px 0 0" : 0 }}
                >
                  <span className="text-sm font-semibold" style={{ color: active ? "var(--accent)" : "var(--fg)" }}>
                    {opt.label}
                  </span>
                </button>
              </div>
            )
          })}

          <InnerDivider />

          {/* Range picker row */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCal(v => !v)}
              className="w-full flex items-center gap-2 active:opacity-70 transition-opacity"
              style={{ padding: "15px 0", borderRadius: "0 0 18px 18px" }}
            >
              <CalendarSmallIcon />
              <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                {rangeLabel}
              </span>
            </button>

            {showCal && (
              <RangeDatePicker
                from={rangeFrom}
                to={rangeTo}
                onChange={(f, t) => {
                  onRangeChange(f, t)
                  onChange("range")
                }}
                onClose={() => setShowCal(false)}
                anchorRef={cardRef}
                anchorSide="top-right"
                bg="var(--filter-calendar)"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
