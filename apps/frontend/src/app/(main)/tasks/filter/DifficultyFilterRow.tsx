import { TaskDifficulty } from "@/types"
import { CircleIcon, RhombusIcon, SquareIcon, TriangleIcon } from "../_components/icons"
import { useState } from "react"
import { ChevronRightIcon, InnerDivider, Row } from "./shared"
import { Checkbox } from "@/components"

const DIFFICULTY_ICON: Record<TaskDifficulty, React.ComponentType<{ color?: string }>> = {
  TRIVIAL: CircleIcon,
  EASY: TriangleIcon,
  MEDIUM: SquareIcon,
  HARD: RhombusIcon,
}

const DIFF_LABEL: Record<TaskDifficulty, string> = {
  TRIVIAL: "Пустяк",
  EASY: "Легко",
  MEDIUM: "Среднее",
  HARD: "Сложное",
}

const DIFFICULTIES: TaskDifficulty[] = ["TRIVIAL", "EASY", "MEDIUM", "HARD"]

export function DifficultyFilterRow({
  selectedIds,
  onChange,
}: {
  selectedIds: TaskDifficulty[]
  onChange: (ids: TaskDifficulty[]) => void
}) {
  const [open, setOpen] = useState(false)

  const allSelected = selectedIds.length === 0

  const toggleDiff = (d: TaskDifficulty) => {
    if (selectedIds.includes(d)) {
      onChange(selectedIds.filter(x => x !== d))
    } else {
      onChange([...selectedIds, d])
    }
  }

  const headerLabel = (() => {
    if (allSelected) return "Любая"
    if (selectedIds.length === 1) return DIFF_LABEL[selectedIds[0]]
    return `${selectedIds.length}`
  })()

  const headerColor = "var(--fg-tertiary)"

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full text-left active:opacity-70 transition-opacity"
      >
        <Row
          label="Показать задачи по сложности"
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

      {open && (
        <div
          className="mb-3 px-7 py-3"
          style={{
            borderRadius: 18,
            background: "var(--filter-btn-bg)",
            overflow: "hidden",
          }}
        >
          {/* Любая сложность */}
          <div
            className="w-full flex items-center gap-3 active:opacity-70 transition-opacity"
            style={{ padding: "14px 0" }}
          >
            <Checkbox checked={allSelected} onChange={() => onChange([])} />
            <span className="text-sm font-semibold text-primary">Любая сложность</span>
          </div>

          {DIFFICULTIES.map(d => {
            const Icon = DIFFICULTY_ICON[d]
            const checked = selectedIds.includes(d)
            return (
              <div key={d}>
                <InnerDivider />
                <div
                  className="w-full flex items-center gap-1 active:opacity-70 transition-opacity"
                  style={{ padding: "14px 0" }}
                >
                  <Checkbox checked={checked} onChange={() => toggleDiff(d)} />
                  <span className="text-sm font-semibold ml-2 text-primary">{DIFF_LABEL[d]}</span>
                  <Icon color="var(--fg)" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
