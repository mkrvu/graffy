"use client"

import { ComponentType, createElement } from "react"

type IconCmp = ComponentType<{ color?: string }>

interface DifficultyPickerProps<T extends string> {
  value: T
  onChange: (v: T) => void
  options: readonly T[]
  labels: Record<T, string>
  icons: Record<T, IconCmp>
}

// Единый селектор сложности для задач/привычек.
// Сетка из 4 равных колонок: ширина не зависит от состояния, активный пункт
// помечается outline'ом — не влияет на размер ячейки, поэтому ничего не съезжает.
export function DifficultyPicker<T extends string>({
  value,
  onChange,
  options,
  labels,
  icons,
}: DifficultyPickerProps<T>) {
  return (
    <div className="grid grid-cols-4 w-full gap-[5px] py-[3px]">
      {options.map(d => {
        const active = value === d
        // createElement обходит проблему дженерик-индексированных JSX-элементов
        // (под TS production-сборкой <Icon /> в виде JSX роняет тип-чек).
        const Icon = icons[d] as IconCmp
        return (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            className="active:opacity-70 transition-opacity min-w-0 flex items-center justify-center gap-1.5"
            style={{
              height: 33.63,
              borderRadius: 30,
              background: active ? "#9957FF" : "rgba(153,87,255,0.25)",
              outline: active ? "1.5px solid #9957FF" : undefined,
              outlineOffset: active ? 2 : undefined,
              padding: "0 8px",
            }}
          >
            {createElement(Icon, { color: active ? "white" : "#9957FF" })}
            <span
              style={{
                color: active ? "white" : "#9957FF",
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {labels[d]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
