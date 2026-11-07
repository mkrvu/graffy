import { create } from 'zustand'
import api from '@/lib/api'
import { Task, TaskDifficulty } from '@/types'

const PAGE_SIZE = 30

interface TaskState {
  tasks: Task[]
  isLoading: boolean
  hasMore: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  loadMore: () => Promise<void>
  getTaskById: (id: string) => Promise<Task | null>
  createTask: (data: { title: string; description?: string; difficulty: TaskDifficulty; dueDate?: string; sphereId?: string; sectionId?: string }) => Promise<void>
  updateTask: (id: string, data: { title?: string; description?: string; difficulty?: TaskDifficulty; dueDate?: string; sphereId?: string; sectionId?: string | null }) => Promise<void>
  moveTaskSection: (id: string, sectionId: string | null) => Promise<void>
  completeTask: (id: string) => Promise<Task>
  uncompleteTask: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  clearError: () => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  hasMore: true,
  error: null,

  // Первая загрузка — сбрасывает список и тянет первую страницу.
  fetchTasks: async () => {
    if (get().isLoading) return
    set({ isLoading: true, error: null, tasks: [], hasMore: true })
    try {
      const { data } = await api.get<Task[]>(`/tasks?skip=0&take=${PAGE_SIZE}`)
      const normalized = data.map(t => ({ ...t, difficulty: t.difficulty.toUpperCase() as Task['difficulty'] }))
      set({ tasks: normalized, hasMore: data.length === PAGE_SIZE, isLoading: false })
    } catch {
      set({ error: 'Не удалось загрузить задачи', isLoading: false })
    }
  },

  // Подгружает следующую страницу и доклеивает к существующим. Идемпотентно
  // (повторный вызов пока идёт запрос — no-op).
  loadMore: async () => {
    const { isLoading, hasMore, tasks } = get()
    if (isLoading || !hasMore) return
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get<Task[]>(`/tasks?skip=${tasks.length}&take=${PAGE_SIZE}`)
      const normalized = data.map(t => ({ ...t, difficulty: t.difficulty.toUpperCase() as Task['difficulty'] }))
      set(state => ({
        tasks: [...state.tasks, ...normalized],
        hasMore: data.length === PAGE_SIZE,
        isLoading: false,
      }))
    } catch {
      set({ error: 'Не удалось подгрузить задачи', isLoading: false })
    }
  },

  getTaskById: async (id) => {
    const existing = get().tasks.find(t => t.id === id)
    if (existing) return existing
    try {
      const { data } = await api.get<Task>(`/tasks/${id}`)
      return { ...data, difficulty: data.difficulty.toUpperCase() as Task['difficulty'] }
    } catch {
      return null
    }
  },

  createTask: async (taskData) => {
    try {
      const { data } = await api.post<Task>('/tasks', taskData)
      const t = { ...data, difficulty: data.difficulty.toUpperCase() as Task['difficulty'] }
      set((state) => ({ tasks: [t, ...state.tasks] }))
    } catch {
      set({ error: 'Не удалось создать задачу' })
      throw new Error('Failed to create task')
    }
  },

  updateTask: async (id, taskData) => {
    const prev = get().tasks
    const patch = { ...taskData, sectionId: taskData.sectionId ?? undefined }
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }))
    try {
      const { data } = await api.put<Task>(`/tasks/${id}`, taskData)
      const updated = { ...data, difficulty: data.difficulty.toUpperCase() as Task['difficulty'] }
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
      }))
    } catch {
      set({ tasks: prev, error: 'Не удалось обновить задачу' })
      throw new Error('Failed to update task')
    }
  },

  // Перенос в другой раздел — оптимистично, без отката при ошибке бэка.
  // Используется при drag-and-drop чтобы выполненные задачи тоже можно было переносить.
  moveTaskSection: async (id, sectionId) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, sectionId: sectionId ?? undefined } : t
      ),
    }))
    const t = get().tasks.find(t => t.id === id)
    if (!t) return
    try {
      await api.patch(`/tasks/${id}/section`, { sectionId: sectionId ?? null })
    } catch {
      // Fallback: try full update if PATCH not available
      try {
        await api.put(`/tasks/${id}`, {
          title: t.title, description: t.description, difficulty: t.difficulty,
          dueDate: t.dueDate, sphereId: t.sphereId, sectionId: sectionId ?? null,
        })
      } catch {
        // Optimistic state stays — section change is visible locally
      }
    }
  },

  completeTask: async (id) => {
    const prev = get().tasks
    // Optimistic: mark completed immediately so UI responds without waiting for the server
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, isCompleted: true } : t)),
    }))
    try {
      const { data } = await api.post<Task>(`/tasks/${id}/complete`)
      const completed = { ...data, difficulty: data.difficulty.toUpperCase() as Task['difficulty'] }
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? completed : t)),
      }))
      return completed
    } catch {
      set({ tasks: prev })
      throw new Error('Failed to complete task')
    }
  },

  uncompleteTask: async (id) => {
    await api.delete(`/tasks/${id}/complete`)
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, isCompleted: false, completedAt: undefined } : t
      ),
    }))
  },

  deleteTask: async (id) => {
    const prev = get().tasks
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
    try {
      await api.delete(`/tasks/${id}`)
    } catch {
      set({ tasks: prev, error: 'Не удалось удалить задачу' })
      throw new Error('Failed to delete task')
    }
  },

  clearError: () => set({ error: null }),
}))
