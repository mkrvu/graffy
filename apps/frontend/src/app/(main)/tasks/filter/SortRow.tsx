import { useState } from "react"
import { ChevronRightIcon, InnerDivider, Row } from "./shared"

export function SortRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full text-left active:opacity-70 transition-opacity"
      >
        <Row
          label={label}
          right={
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold" style={{ color: "var(--fg-tertiary)" }}>
                {selected?.label ?? "Нет"}
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
            overflow: "hidden",
          }}
        >
          {options.map((opt, i) => {
            const active = value === opt.value
            return (
              <div key={opt.value}>
                {i > 0 && <InnerDivider />}
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                  className="w-full flex items-center active:opacity-70 transition-opacity"
                  style={{ padding: "15px 0" }}
                >
                  <span className="text-sm font-semibold" style={{ color: active ? "var(--accent)" : "var(--fg)" }}>
                    {opt.label}
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
