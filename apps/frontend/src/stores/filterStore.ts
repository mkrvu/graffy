import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Task, TaskDifficulty } from "@/types"

export type ViewMode = "list" | "board" | "calendar"
export type SortUrgency = "urgent_first" | "not_urgent_first" | "none"
export type SortDifficulty = "easy_first" | "hard_first" | "none"
export type SortTime = "newest_first" | "oldest_first" | "range" | "none"

export interface FilterState {
  viewMode: ViewMode
  showCompleted: boolean
  showDifficulty: boolean
  showSpheres: boolean
  selectedSpheres: string[]
  selectedDifficulties: TaskDifficulty[]
  sortUrgency: SortUrgency
  sortDifficulty: SortDifficulty
  sortTime: SortTime
  sortRangeFrom: string
  sortRangeTo: string

  setViewMode: (v: ViewMode) => void
  setShowCompleted: (v: boolean) => void
  setShowDifficulty: (v: boolean) => void
  setShowSpheres: (v: boolean) => void
  setSelectedSpheres: (v: string[]) => void
  setSelectedDifficulties: (v: TaskDifficulty[]) => void
  setSortUrgency: (v: SortUrgency) => void
  setSortDifficulty: (v: SortDifficulty) => void
  setSortTime: (v: SortTime) => void
  setSortRange: (from: string, to: string) => void
}

const DIFF_ORDER: Record<string, number> = {
  TRIVIAL: 0,
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
}

export const useFilterStore = create<FilterState>()(
  persist(
    set => ({
      viewMode: "list",
      // По умолчанию выполненные задачи показываются — это позволяет тапнуть по галочке
      // ещё раз и снять отметку выполнения.
      showCompleted: true,
      showDifficulty: false,
      showSpheres: false,
      selectedSpheres: [],
      selectedDifficulties: [],
      sortUrgency: "urgent_first",
      sortDifficulty: "easy_first",
      sortTime: "newest_first",
      sortRangeFrom: "",
      sortRangeTo: "",

      setViewMode: v => set({ viewMode: v }),
      setShowCompleted: v => set({ showCompleted: v }),
      setShowDifficulty: v => set({ showDifficulty: v }),
      setShowSpheres: v => set({ showSpheres: v }),
      setSelectedSpheres: v => set({ selectedSpheres: v }),
      setSelectedDifficulties: v => set({ selectedDifficulties: v }),
      setSortUrgency: v => set({ sortUrgency: v }),
      setSortDifficulty: v => set({ sortDifficulty: v }),
      setSortTime: v => set({ sortTime: v }),
      setSortRange: (from, to) => set({ sortRangeFrom: from, sortRangeTo: to }),
    }),
    {
      name: "graffy-task-filter",
      // bump версии, когда меняем дефолты — иначе у пользователей со старым localStorage
      // останется прежнее значение и новый дефолт «не доедет».
      version: 1,
      migrate: (persisted, version) => {
        if (version < 1 && persisted && typeof persisted === "object") {
          return { ...(persisted as object), showCompleted: true } as FilterState
        }
        return persisted as FilterState
      },
    },
  ),
)

export function applyFilter(tasks: Task[], filter: FilterState, fadingIds?: Set<string>): Task[] {
  let result = [...tasks]

  // hide completed (but keep fading-out ones visible briefly)
  if (!filter.showCompleted) {
    result = result.filter(t => !t.isCompleted || fadingIds?.has(t.id))
  }

  // filter by difficulty
  if (filter.selectedDifficulties.length > 0) {
    result = result.filter(t => filter.selectedDifficulties.includes(t.difficulty))
  }

  // filter by sphere
  if (filter.selectedSpheres.length > 0) {
    result = result.filter(t => t.sphereId && filter.selectedSpheres.includes(t.sphereId))
  }

  // filter by date range (dueDate)
  if (filter.sortTime === "range") {
    if (filter.sortRangeFrom) {
      result = result.filter(t => !t.dueDate || t.dueDate >= filter.sortRangeFrom)
    }
    if (filter.sortRangeTo) {
      result = result.filter(t => !t.dueDate || t.dueDate <= filter.sortRangeTo)
    }
  }

  // sort: выполненные задачи всегда вниз; пока крутится fade-анимация — считаем такую задачу
  // невыполненной, чтобы она не «прыгала» вниз раньше времени.
  const isDone = (t: Task) => t.isCompleted && !fadingIds?.has(t.id)
  result.sort((a, b) => {
    const aDone = isDone(a) ? 1 : 0
    const bDone = isDone(b) ? 1 : 0
    if (aDone !== bDone) return aDone - bDone

    if (filter.sortUrgency !== "none") {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
      const urgencyDiff = filter.sortUrgency === "urgent_first" ? aTime - bTime : bTime - aTime
      if (urgencyDiff !== 0) return urgencyDiff
    }

    if (filter.sortDifficulty !== "none") {
      const aDiff = DIFF_ORDER[a.difficulty]
      const bDiff = DIFF_ORDER[b.difficulty]
      const difficultyDiff = filter.sortDifficulty === "easy_first" ? aDiff - bDiff : bDiff - aDiff
      if (difficultyDiff !== 0) return difficultyDiff
    }

    if (filter.sortTime === "none") return 0
    const aCreated = new Date(a.createdAt).getTime()
    const bCreated = new Date(b.createdAt).getTime()
    return filter.sortTime === "oldest_first" ? aCreated - bCreated : bCreated - aCreated
  })

  return result
}
