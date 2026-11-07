"use client"

import { useSphereStore } from "@/stores/sphereStore"
import { useState } from "react"
import { ChevronRightIcon, InnerDivider, Row } from "./shared"
import { Checkbox } from "@/components"
import { Emoji } from "emoji-picker-react"

export function SphereFilterRow({
  selectedIds,
  onChange,
}: {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}) {
  const { spheres } = useSphereStore()
  const [open, setOpen] = useState(false)

  const allSelected = selectedIds.length === 0

  const toggleSphere = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(s => s !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  const toggleAll = () => {
    onChange([])
  }

  // Label shown in row header
  const headerLabel = (() => {
    if (allSelected || selectedIds.length === 0) return "Нет"
    if (selectedIds.length === 1) {
      const s = spheres.find(s => s.id === selectedIds[0])
      return s?.name ?? "1"
    }
    return `${selectedIds.length}`
  })()

  const headerColor = "var(--fg-tertiary)"

  return (
    <div className="flex flex-col">
      {/* Row trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full text-left active:opacity-70 transition-opacity"
      >
        <Row
          label="Показать задачи по сфере"
          right={
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold" style={{ color: headerColor }}>
                {headerLabel}
              </span>
              <ChevronRightIcon color={"var(--fg-tertiary)"} />
            </div>
          }
        />
      </button>

      {/* Inline expanded card */}
      {open && spheres.length > 0 && (
        <div
          className="mb-3 px-7 py-3"
          style={{
            borderRadius: 18,
            background: "var(--filter-btn-bg)",
            overflow: "hidden",
          }}
        >
          {/* Все сферы */}
          <div
            className="w-full flex items-center gap-3 active:opacity-70 transition-opacity"
            style={{ padding: "14px 0" }}
          >
            <Checkbox checked={allSelected} onChange={toggleAll} />
            <span className="text-sm font-semibold text-primary">Все сферы</span>
          </div>

          {spheres.map((sphere, i) => {
            const checked = selectedIds.includes(sphere.id)
            return (
              <div key={sphere.id}>
                <InnerDivider />
                <div
                  className="w-full flex items-center gap-3 active:opacity-70 transition-opacity"
                  style={{ padding: "14px 0" }}
                >
                  <Checkbox checked={checked} onChange={() => toggleSphere(sphere.id)} />
                  <Emoji unified={sphere.emoji} size={16} />
                  <span className="text-sm font-semibold text-primary">{sphere.name}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
