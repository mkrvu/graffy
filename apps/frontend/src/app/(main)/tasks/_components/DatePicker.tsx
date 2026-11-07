"use client"

import { useState } from "react"
import { DayPicker, DateRange, Matcher } from "react-day-picker"
import { ru } from "react-day-picker/locale"

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTHS_SHORT = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"]

export function fmt(d: Date) {
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

function toDateStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function parseDate(s: string): Date | undefined {
  return s ? new Date(s) : undefined
}

// ── Nav chevrons (Figma: 14×14 arrows) ───────────────────────────────────────

function ChevLeft() {
  return (
    <svg width="7" height="11" viewBox="0 0 7 11" fill="none" aria-hidden>
      <path d="M6 1L1 5.5L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevRight() {
  return (
    <svg width="7" height="11" viewBox="0 0 7 11" fill="none" aria-hidden>
      <path d="M1 1L6 5.5L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface SingleDatePickerProps {
  value: string
  onChange: (val: string) => void
  onClose: () => void
  placement?: "bottom-left" | "top-right" | "above"
  anchorRef?: React.RefObject<HTMLElement | null>
  anchorSide?: "above" | "right" | "top-right"
  bg?: string
  minDate?: Date
  maxDate?: Date
  allowPast?: boolean
}

interface RangeDatePickerProps {
  from: string
  to: string
  onChange: (from: string, to: string) => void
  onClose: () => void
  placement?: "bottom-left" | "top-right" | "above"
  anchorRef?: React.RefObject<HTMLElement | null>
  anchorSide?: "above" | "right" | "top-right"
  bg?: string
}

function CalendarShell({
  children,
  onClose,
  placement = "above",
  anchorRef,
  anchorSide = "above",
  bg = "var(--filter-calendar, #f5f5f5)",
}: {
  children: React.ReactNode
  onClose: () => void
  placement?: "bottom-left" | "top-right" | "above"
  anchorRef?: React.RefObject<HTMLElement | null>
  anchorSide?: "above" | "right" | "top-right"
  bg?: string
}) {
  let posStyle: React.CSSProperties

  if (anchorRef?.current) {
    const rect = anchorRef.current.getBoundingClientRect()
    if (anchorSide === "right") {
      posStyle = {
        position: "fixed",
        top: rect.top,
        left: rect.right + 8,
      }
    } else if (anchorSide === "top-right") {
      posStyle = {
        bottom: "calc(300% + 14px)",
        right: 0,
      }
    } else {
      posStyle = {
        position: "fixed",
        bottom: window.innerHeight - rect.top + 8,
        left: rect.left,
        width: rect.width,
      }
    }
  } else if (placement === "top-right") {
    posStyle = { bottom: "calc(100% + 8px)", right: 0 }
  } else if (placement === "above") {
    posStyle = { bottom: "calc(100% + 8px)", left: 0 }
  } else {
    posStyle = { top: "calc(100% + 8px)", left: 0 }
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={anchorRef?.current && anchorSide !== "top-right" ? "z-50" : "absolute z-50"}
        style={{
          ...posStyle,
          width: posStyle.width ?? 270,
          borderRadius: 21,
          background: bg,
          boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
          paddingTop: 18,
          paddingBottom: 20,
        }}
        onClick={e => e.stopPropagation()}
      >
        <style dangerouslySetInnerHTML={{ __html: DP_CSS }} />
        {children}
      </div>
    </>
  )
}

export function SingleDatePicker({
  value,
  onChange,
  onClose,
  placement,
  anchorRef,
  anchorSide,
  bg,
  minDate,
  maxDate,
  allowPast,
}: SingleDatePickerProps) {
  const selected = parseDate(value)
  const lowerBound = minDate ?? (allowPast ? undefined : new Date())
  const disabled: Matcher[] = []
  if (lowerBound) disabled.push({ before: lowerBound })
  if (maxDate) disabled.push({ after: maxDate })
  return (
    <CalendarShell onClose={onClose} placement={placement} anchorRef={anchorRef} anchorSide={anchorSide} bg={bg}>
      <div className="dp-wrap">
        <DayPicker
          mode="single"
          locale={ru}
          selected={selected}
          showOutsideDays={false}
          onSelect={d => {
            onChange(d ? toDateStr(d) : "")
            if (d) onClose()
          }}
          disabled={disabled}
          classNames={CLS}
          components={{
            Chevron: ({ orientation }: { orientation?: string }) =>
              orientation === "left" ? <ChevLeft /> : <ChevRight />,
          }}
        />
      </div>
    </CalendarShell>
  )
}

export function RangeDatePicker({
  from,
  to,
  onChange,
  onClose,
  placement,
  anchorRef,
  anchorSide,
  bg,
}: RangeDatePickerProps) {
  const [range, setRange] = useState<DateRange | undefined>({
    from: parseDate(from),
    to: parseDate(to),
  })

  const handleSelect = (r: DateRange | undefined) => {
    setRange(r)
    onChange(r?.from ? toDateStr(r.from) : "", r?.to ? toDateStr(r.to) : "")
  }

  return (
    <CalendarShell onClose={onClose} placement={placement} anchorRef={anchorRef} anchorSide={anchorSide} bg={bg}>
      <div className="dp-wrap">
        <DayPicker
          mode="range"
          locale={ru}
          selected={range}
          showOutsideDays={false}
          onSelect={handleSelect}
          disabled={{ before: new Date() }}
          classNames={CLS}
          components={{
            Chevron: ({ orientation }: { orientation?: string }) =>
              orientation === "left" ? <ChevLeft /> : <ChevRight />,
          }}
        />
      </div>
    </CalendarShell>
  )
}

// ── DayPicker class-name map ──────────────────────────────────────────────────

const CLS = {
  root: "dp-root",
  months: "dp-months",
  month: "dp-month",
  month_caption: "dp-cap",
  nav: "dp-nav",
  button_previous: "dp-prev",
  button_next: "dp-next",
  caption_label: "dp-label",
  weekdays: "dp-wdays",
  weekday: "dp-wday",
  month_grid: "dp-grid",
  week: "dp-week",
  day: "dp-day",
  day_button: "dp-btn",
  selected: "dp-sel",
  today: "dp-tod",
  outside: "dp-out",
  disabled: "dp-dis",
  range_start: "dp-rs",
  range_end: "dp-re",
  range_middle: "dp-rm",
}

const DP_CSS = `
/* reset + box-sizing */
.dp-wrap, .dp-root, .dp-months, .dp-month, .dp-grid, .dp-week, .dp-day, .dp-btn {
  box-sizing: border-box;
}

.dp-wrap { width: 100%; padding: 0 14px; }
.dp-root, .dp-months, .dp-month { display: block; width: 100%; }

/* kill default table padding */
.dp-day, .dp-wday { padding: 0; overflow: visible; }

/* ── Caption / Navigation ── */
.dp-months { position: relative; }

.dp-cap {
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.dp-nav {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
  pointer-events: none;
  z-index: 1;
}

.dp-prev, .dp-next {
  pointer-events: auto;
  width: 32px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; padding: 0;
  color: var(--fg-tertiary, #454545); cursor: pointer;
  transition: color 0.15s;
}
.dp-prev:hover, .dp-next:hover { color: #9957FF; }
.dp-prev:active, .dp-next:active { opacity: 0.55; }
.dp-prev:disabled, .dp-next:disabled { opacity: 0.25; cursor: default; }

.dp-label {
  font-weight: 500; font-size: 14px;
  color: var(--fg-tertiary, #454545);
  text-transform: capitalize;
  pointer-events: none; user-select: none;
}

/* ── Weekday header ── */
.dp-grid { display: block; }
.dp-grid > thead { display: block; }
.dp-grid > tbody { display: block; }

.dp-wdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  margin-bottom: 2px;
}
.dp-wday {
  display: flex; align-items: center; justify-content: center;
  height: 30px;
  font-weight: 600; font-size: 14px;
  color: var(--fg, #282828);
}
.dp-wday abbr {
  text-decoration: none;
  text-transform: capitalize;
  white-space: nowrap;
}
.dp-wday abbr::first-letter { text-transform: uppercase; }
/* sat + sun accent */
.dp-wday:nth-child(6),
.dp-wday:nth-child(7) { color: #9957FF; }

/* ── Week grid ── */
.dp-week {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

/* day cell */
.dp-day {
  display: flex; align-items: center; justify-content: center;
  height: 34px;
  position: relative;
}

/* day button */
.dp-btn {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 500; font-size: 13px;
  color: #A7A5A6;
  background: transparent;
  border: none; cursor: pointer; padding: 0;
  transition: color 0.12s;
}
.dp-btn:active { opacity: 0.7; }

/* outside month */
.dp-out .dp-btn { pointer-events: none; }

/* disabled */
.dp-dis .dp-btn {
  background: transparent; color: #d0d0d0; pointer-events: none; cursor: default;
}

/* today (unselected) */
.dp-tod:not(.dp-sel):not(.dp-rs):not(.dp-re) .dp-btn {
  color: #9957FF; font-weight: 600;
}

/* selected / range endpoints */
.dp-sel .dp-btn,
.dp-rs .dp-btn,
.dp-re .dp-btn {
  background: #9957FF; color: #ffffff; font-weight: 600;
}

/* range middle */
.dp-rm { background: rgba(153, 87, 255, 0.25); }
.dp-rm .dp-btn { background: transparent; color: #A7A5A6; }

/* range start (rounded left) + end (rounded right) */
.dp-rs:not(.dp-re) {
  background: rgba(153,87,255,0.25);
  border-radius: 50% 0 0 50%;
}
.dp-re:not(.dp-rs) {
  background: rgba(153,87,255,0.25);
  border-radius: 0 50% 50% 0;
}

/* ── Dark theme (matches Figma 86:14515) ── */
[data-theme="dark"] .dp-wday { color: #FFFFFF; }
[data-theme="dark"] .dp-wday:nth-child(6),
[data-theme="dark"] .dp-wday:nth-child(7) { color: #9957FF; }
[data-theme="dark"] .dp-label { color: #A7A5A6; }
[data-theme="dark"] .dp-prev, [data-theme="dark"] .dp-next { color: #A7A5A6; }
[data-theme="dark"] .dp-prev:hover, [data-theme="dark"] .dp-next:hover { color: #9957FF; }
[data-theme="dark"] .dp-btn { color: #A7A5A6; }
[data-theme="dark"] .dp-dis .dp-btn { color: rgba(167,165,166,0.35); }
[data-theme="dark"] .dp-tod:not(.dp-sel):not(.dp-rs):not(.dp-re) .dp-btn { color: #9957FF; }
[data-theme="dark"] .dp-sel .dp-btn,
[data-theme="dark"] .dp-rs .dp-btn,
[data-theme="dark"] .dp-re .dp-btn { background: #9957FF; color: #FFFFFF; }
[data-theme="dark"] .dp-rm { background: rgba(153,87,255,0.25); }
[data-theme="dark"] .dp-rm .dp-btn { background: transparent; color: #FFFFFF; }
[data-theme="dark"] .dp-rs:not(.dp-re) { background: rgba(153,87,255,0.25); }
[data-theme="dark"] .dp-re:not(.dp-rs) { background: rgba(153,87,255,0.25); }
`

export { DP_CSS }
