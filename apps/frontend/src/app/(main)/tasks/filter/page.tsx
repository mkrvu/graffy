"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarPreview, ListPreview, BoardPreview } from "../_components/icons"
import { BackTo, Toggle } from "@/components"
import { useSphereStore } from "@/stores/sphereStore"
import { useFilterStore } from "@/stores/filterStore"
import { SortRow } from "./SortRow"
import { DifficultyFilterRow } from "./DifficultyFilterRow"
import { SphereFilterRow } from "./SphereFilterRow"
import { TimeCreatedSortRow } from "./TimeCreatedSortRow"
import { Row } from "./shared"

function Divider() {
  return <div aria-hidden style={{ height: 1.5, background: "var(--task-divider)", margin: "0 -21px" }} />
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm font-semibold" style={{ color: "var(--fg-tertiary)" }}>
        {title}
      </span>
      {children}
    </div>
  )
}

export default function FilterPage() {
  const router = useRouter()
  const { fetchSpheres, spheres } = useSphereStore()

  const {
    viewMode,
    setViewMode,
    showCompleted,
    setShowCompleted,
    showDifficulty,
    setShowDifficulty,
    showSpheres,
    setShowSpheres,
    selectedSpheres,
    setSelectedSpheres,
    selectedDifficulties,
    setSelectedDifficulties,
    sortUrgency,
    setSortUrgency,
    sortDifficulty,
    setSortDifficulty,
    sortTime,
    setSortTime,
    sortRangeFrom,
    sortRangeTo,
    setSortRange,
  } = useFilterStore()

  useEffect(() => {
    fetchSpheres()
  }, [fetchSpheres])

  const views = [
    { id: "list" as const, label: "Список", Preview: ListPreview },
    { id: "board" as const, label: "Разделы", Preview: BoardPreview },
    { id: "calendar" as const, label: "Календарь", Preview: CalendarPreview },
  ]

  return (
    <div className="flex-1 py-4 px-5 overflow-x-hidden overflow-y-auto">
      <BackTo onClickFn={() => router.back()} />

      <div className="flex flex-col mt-8 gap-4">
        <Section title="Вид">
          <div className="flex gap-2">
            {views.map(({ id, label, Preview }) => {
              const active = viewMode === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setViewMode(id)}
                  className="flex-1 flex flex-col items-center gap-1 active:opacity-75 transition-opacity"
                >
                  <div
                    className="w-full flex items-center justify-center"
                    style={{
                      height: 123,
                      borderRadius: 21,
                      background: active ? "var(--accent)" : "var(--filter-btn-bg)",
                      transition: "background 0.2s",
                    }}
                  >
                    <Preview active={active} />
                  </div>

                  <div
                    style={{
                      height: 34,
                      borderRadius: 30,
                      background: active ? "var(--accent)" : "transparent",
                      padding: "0 13px",
                      display: "flex",
                      alignItems: "center",
                      transition: "background 0.2s",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: active ? "#ffffff" : "var(--fg-tertiary)",
                        whiteSpace: "nowrap",
                        transition: "color 0.2s",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </Section>

        <Section title="Фильтр">
          <div className="flex flex-col">
            {spheres.length > 0 && (
              <>
                <SphereFilterRow selectedIds={selectedSpheres} onChange={setSelectedSpheres} />
                <Divider />
              </>
            )}
            <DifficultyFilterRow selectedIds={selectedDifficulties} onChange={setSelectedDifficulties} />
          </div>
        </Section>

        <Section title="Сортировка">
          <div className="flex flex-col">
            <SortRow
              label="По срочности"
              value={sortUrgency}
              onChange={v => setSortUrgency(v as Parameters<typeof setSortUrgency>[0])}
              options={[
                { value: "none", label: "Нет" },
                { value: "urgent_first", label: "Сначала срочные" },
                { value: "not_urgent_first", label: "Сначала несрочные" },
              ]}
            />
            <Divider />
            <SortRow
              label="По сложности"
              value={sortDifficulty}
              onChange={v => setSortDifficulty(v as Parameters<typeof setSortDifficulty>[0])}
              options={[
                { value: "none", label: "Нет" },
                { value: "easy_first", label: "Сначала простые" },
                { value: "hard_first", label: "Сначала сложные" },
              ]}
            />
            <Divider />
            <TimeCreatedSortRow
              value={sortTime}
              onChange={v => setSortTime(v as Parameters<typeof setSortTime>[0])}
              rangeFrom={sortRangeFrom}
              rangeTo={sortRangeTo}
              onRangeChange={(f, t) => setSortRange(f, t)}
            />
          </div>
        </Section>

        <Section title="Элементы">
          <div className="flex flex-col">
            <Row label="Выполненные задачи" right={<Toggle value={showCompleted} onChange={setShowCompleted} />} />
            <Divider />
            <Row label="Сложность задач" right={<Toggle value={showDifficulty} onChange={setShowDifficulty} />} />
            <Divider />
            <Row label="Сферы" right={<Toggle value={showSpheres} onChange={setShowSpheres} />} />
          </div>
        </Section>
      </div>
    </div>
  )
}
