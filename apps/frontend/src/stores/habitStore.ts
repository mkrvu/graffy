import { create } from 'zustand'
import api from '@/lib/api'
import { Habit, HabitDifficulty, HabitFrequency } from '@/types'

// Бэк использует PascalCase ("Trivial", "Daily"), UI — UPPERCASE. Маппим на границе со стором.
const toApiDifficulty: Record<HabitDifficulty, string> = {
  TRIVIAL: 'Trivial',
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
}

const toApiFrequency: Record<HabitFrequency, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
}

function normalizeHabit(dto: Habit): Habit {
  return {
    ...dto,
    difficulty: (dto.difficulty ?? '').toString().toUpperCase() as HabitDifficulty,
    frequency: (dto.frequency ?? 'DAILY').toString().toUpperCase() as HabitFrequency,
  }
}

interface CreateHabitInput {
  sphereId?: string
  title: string
  description?: string
  difficulty: HabitDifficulty
  emoji?: string
  frequency: HabitFrequency
  goalAmount?: number
  goalUnit?: string
  startDate?: string
  endDate?: string
}

function toPayload(data: Partial<CreateHabitInput>) {
  return {
    ...(data.sphereId !== undefined ? { sphereId: data.sphereId } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.difficulty !== undefined ? { difficulty: toApiDifficulty[data.difficulty] } : {}),
    ...(data.emoji !== undefined ? { emoji: data.emoji } : {}),
    ...(data.frequency !== undefined ? { frequency: toApiFrequency[data.frequency] } : {}),
    ...(data.goalAmount !== undefined ? { goalAmount: data.goalAmount } : {}),
    ...(data.goalUnit !== undefined ? { goalUnit: data.goalUnit } : {}),
    ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
    ...(data.endDate !== undefined ? { endDate: data.endDate } : {}),
  }
}

interface HabitState {
  habits: Habit[]
  isLoading: boolean
  error: string | null
  fetchHabits: () => Promise<void>
  createHabit: (data: CreateHabitInput) => Promise<void>
  updateHabit: (id: string, data: Partial<CreateHabitInput>) => Promise<void>
  completeHabit: (id: string) => Promise<Habit>
  uncompleteHabit: (id: string) => Promise<Habit>
  deleteHabit: (id: string) => Promise<void>
  clearError: () => void
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  isLoading: false,
  error: null,

  fetchHabits: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get<Habit[]>('/habits')
      set({ habits: data.map(normalizeHabit), isLoading: false })
    } catch {
      set({ error: 'Не удалось загрузить привычки', isLoading: false })
    }
  },

  createHabit: async (data) => {
    try {
      const { data: created } = await api.post<Habit>('/habits', toPayload(data))
      set((state) => ({ habits: [normalizeHabit(created), ...state.habits] }))
    } catch {
      set({ error: 'Не удалось создать привычку' })
      throw new Error('Failed to create habit')
    }
  },

  updateHabit: async (id, data) => {
    const prev = get().habits
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? { ...h, ...data } : h)),
    }))
    try {
      const { data: updated } = await api.put<Habit>(`/habits/${id}`, toPayload(data))
      set((state) => ({
        habits: state.habits.map((h) => (h.id === id ? normalizeHabit(updated) : h)),
      }))
    } catch {
      set({ habits: prev, error: 'Не удалось обновить привычку' })
      throw new Error('Failed to update habit')
    }
  },

  completeHabit: async (id) => {
    const { data } = await api.post<Habit>(`/habits/${id}/complete`)
    const habit = normalizeHabit(data)
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? habit : h)),
    }))
    return habit
  },

  uncompleteHabit: async (id) => {
    const { data } = await api.delete<Habit>(`/habits/${id}/complete`)
    const habit = normalizeHabit(data)
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? habit : h)),
    }))
    return habit
  },

  deleteHabit: async (id) => {
    const prev = get().habits
    set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }))
    try {
      await api.delete(`/habits/${id}`)
    } catch {
      set({ habits: prev, error: 'Не удалось удалить привычку' })
      throw new Error('Failed to delete habit')
    }
  },

  clearError: () => set({ error: null }),
}))
