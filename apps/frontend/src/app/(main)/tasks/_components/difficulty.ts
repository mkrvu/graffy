import { TaskDifficulty } from "@/types"
import { CircleIcon, TriangleIcon, SquareIcon, RhombusIcon } from "./icons"

// Общая мапа сложность → иконка/подпись. Не может жить в page-модуле Next.js
// (он разрешает только специальные экспорты).
export const DIFFICULTY_ICON: Record<TaskDifficulty, React.ComponentType<{ color?: string }>> = {
  TRIVIAL: CircleIcon,
  EASY: TriangleIcon,
  MEDIUM: SquareIcon,
  HARD: RhombusIcon,
}

export const DIFF_LABEL: Record<TaskDifficulty, string> = {
  TRIVIAL: "Пустяк",
  EASY: "Легко",
  MEDIUM: "Среднее",
  HARD: "Сложно",
}

export const DIFFICULTIES: TaskDifficulty[] = ["TRIVIAL", "EASY", "MEDIUM", "HARD"]
