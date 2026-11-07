export function ChevronRightIcon({ color = "var(--fg-tertiary)" }: { color?: string }) {
  return (
    <svg width="5" height="10" viewBox="0 0 5 10" fill="none" aria-hidden>
      <path d="M1 1.5L4 5L1 8.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Row({ label, right }: { label: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between" style={{ paddingTop: 15, paddingBottom: 15 }}>
      <span className="text-sm font-semibold text-primary">{label}</span>
      {right ?? (
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: "var(--fg-tertiary)" }}>
            Нет
          </span>
          <ChevronRightIcon />
        </div>
      )}
    </div>
  )
}

export function InnerDivider() {
  return <div aria-hidden style={{ height: 1, background: "var(--task-divider)" }} />
}
