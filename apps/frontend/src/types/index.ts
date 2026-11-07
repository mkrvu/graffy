export type Role = "USER" | "ADMIN"
export type TaskDifficulty = "TRIVIAL" | "EASY" | "MEDIUM" | "HARD"
export type HabitDifficulty = "TRIVIAL" | "EASY" | "MEDIUM" | "HARD"
export type HabitFrequency = "DAILY" | "WEEKLY" | "MONTHLY"
export type BadgeCategory =
  | "TASK_MASTER"
  | "TERMINATOR"
  | "XP_HUNTER"
  | "DISCIPLINE"
  | "UNSTOPPABLE"
  | "PIONEER"
  | "SOCIAL"

export interface User {
  id: string
  email: string
  username: string
  avatarUrl?: string
  xp: number
  level: number
  // Прогресс уровня считается на бэке (LevelCalculator) и приходит в UserDto.
  xpInLevel: number
  xpForLevel: number
  progressPercent: number
  role: Role
  bio?: string
  city?: string
  createdAt: string
}

export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  difficulty: TaskDifficulty
  xpReward: number
  isCompleted: boolean
  completedAt?: string
  dueDate?: string
  sphereId?: string
  sectionId?: string
  createdAt: string
}

export interface TaskSection {
  id: string
  userId: string
  name: string
  createdAt: string
}

export interface Habit {
  id: string
  userId: string
  sphereId?: string
  title: string
  description?: string
  difficulty: HabitDifficulty
  xpReward: number
  isActive: boolean
  completedToday: boolean
  createdAt: string
  emoji?: string
  frequency: HabitFrequency
  // Цель — поля-пустышки (UI задаёт, логики по ним пока нет).
  goalAmount?: number
  goalUnit?: string
  startDate?: string
  endDate?: string
}

export interface Badge {
  id: string
  code: string
  title: string
  description?: string
  iconUrl?: string
  category: BadgeCategory
  tier: number
  requirement: number
  manualOnly: boolean
  // null/undefined = бейдж не получен; иначе ISO-дата выдачи.
  issuedAt?: string | null
}

export interface DailyStats {
  date: string
  tasksCompleted: number
  habitsCompleted: number
  xpEarned: number
}

export interface ProfileStats {
  totalTasksCompleted: number
  totalHabitsCompleted: number
  currentStreak: number
  longestStreak: number
  totalBadges: number
  activityPercent: number
  totalXpEarned: number
}

export interface StatsResponse {
  today: { tasksCompleted: number; habitsCompleted: number; xpEarned: number }
  yesterday: { tasksCompleted: number; habitsCompleted: number; xpEarned: number }
  weekly: DailyStats[]
}

export interface GraphStats {
  daily: DailyStats[]
  totalXp: number
  currentLevel: number
  levelProgress: number
  xpThisLevel: number
  xpForNextLevel: number
}

export interface TaskCompletionResponse {
  xpReward: number
  isCompleted: boolean
}

export interface HabitCompletionResponse {
  xpReward: number
  completedToday: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    nickname: string
    avatarUrl?: string
    bio?: string
    city?: string
    graphColor: string
    xp: number
    role: string
    level: number
    xpInLevel: number
    xpForLevel: number
    progressPercent: number
  }
}

export interface AdminStats {
  totalUsers: number
  averageUserActivity: number
  totalCompletedTasks: number
  totalXpEarned: number
}

export interface ClanMember {
  userId: string
  nickname: string
  avatarUrl?: string | null
  city?: string | null
  xp: number
  level: number
  isLeader: boolean
  joinedAt: string
}

export interface ClanStats {
  totalXp: number
  totalCompletedTasks: number
  totalCompletedHabits: number
  activeMembers: number
}

export interface ClanDetails {
  id: string
  name: string
  nickname: string
  color: string
  leaderId: string
  createdAt: string
  members: ClanMember[]
  stats: ClanStats
}

export interface ClanSummary {
  id: string
  name: string
  nickname: string
  color: string
  leaderId: string
  createdAt: string
  memberCount: number
}

export interface ClanInvitePreview {
  clanId: string
  name: string
  nickname: string
  color: string
  memberCount: number
  memberLimit: number
}

export interface AdminUser {
  id: string
  email: string
  nickname: string
  city?: string | null
  xp: number
  role: string
  createdAt: string
  taskCount: number
  habitCount: number
}

export const BADGE_CATEGORY_INFO: Record<BadgeCategory, { name: string; description: string }> = {
  TASK_MASTER: { name: "Мастер задач", description: "За выполнение задач" },
  TERMINATOR: { name: "Терминатор", description: "За XP, заработанный за месяц" },
  XP_HUNTER: { name: "XP-Охотник", description: "За суммарное накопление опыта" },
  DISCIPLINE: { name: "Дисциплина", description: "За серии дней с выполненной задачей" },
  UNSTOPPABLE: { name: "Напролом", description: "За достижение уровня" },
  PIONEER: { name: "Первооткрыватель", description: "Особый бейдж для тестировщиков" },
  SOCIAL: { name: "Душа компании", description: "За приглашение пользователей" },
}

export const DIFFICULTY_INFO: Record<TaskDifficulty, { label: string; xp: number; color: string }> = {
  TRIVIAL: { label: "Тривиальная", xp: 5, color: "#9CA3AF" },
  EASY: { label: "Лёгкая", xp: 10, color: "#34D399" },
  MEDIUM: { label: "Средняя", xp: 20, color: "#FBBF24" },
  HARD: { label: "Сложная", xp: 40, color: "#F87171" },
}
