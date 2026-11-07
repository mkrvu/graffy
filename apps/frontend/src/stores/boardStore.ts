import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TaskDifficulty } from '@/types'

export interface BoardSection {
  id: string
  name: string
  createdAt: string
}

export interface BoardTask {
  id: string
  sectionId: string
  title: string
  description?: string
  difficulty: TaskDifficulty
  isCompleted: boolean
  dueDate?: string   // ISO date string, optional
  sphereId?: string
  createdAt: string
}

interface BoardStore {
  sections: BoardSection[]
  tasks: BoardTask[]
  addSection: (name: string) => void
  renameSection: (id: string, name: string) => void
  removeSection: (id: string) => void
  addTask: (
    sectionId: string,
    title: string,
    difficulty: TaskDifficulty,
    dueDate?: string,
    description?: string,
    sphereId?: string,
  ) => void
  moveTask: (taskId: string, toSectionId: string) => void
  toggleTask: (taskId: string) => void
  deleteTask: (taskId: string) => void
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export const useBoardStore = create<BoardStore>()(
  persist(
    (set) => ({
      sections: [],
      tasks: [],

      addSection: (name) =>
        set((s) => ({
          sections: [...s.sections, { id: uid(), name, createdAt: new Date().toISOString() }],
        })),

      renameSection: (id, name) =>
        set((s) => ({
          sections: s.sections.map((sec) => (sec.id === id ? { ...sec, name } : sec)),
        })),

      removeSection: (id) =>
        set((s) => ({
          sections: s.sections.filter((sec) => sec.id !== id),
          tasks: s.tasks.filter((t) => t.sectionId !== id),
        })),

      addTask: (sectionId, title, difficulty, dueDate, description, sphereId) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              id: uid(),
              sectionId,
              title,
              ...(description ? { description } : {}),
              difficulty,
              isCompleted: false,
              ...(dueDate ? { dueDate } : {}),
              ...(sphereId ? { sphereId } : {}),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      moveTask: (taskId, toSectionId) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, sectionId: toSectionId } : t)),
        })),

      toggleTask: (taskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)),
        })),

      deleteTask: (taskId) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) })),
    }),
    { name: 'graffy-board' }
  )
)
