import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  const date = parseISO(dateString)
  if (isNaN(date.getTime())) return '—'
  if (isToday(date)) return 'Сегодня'
  if (isYesterday(date)) return 'Вчера'
  return format(date, 'd MMMM yyyy', { locale: ru })
}

export function formatDateShort(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  const date = parseISO(dateString)
  if (isNaN(date.getTime())) return '—'
  return format(date, 'd MMM', { locale: ru })
}

export function formatDateWeekday(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  const date = parseISO(dateString)
  if (isNaN(date.getTime())) return '—'
  return format(date, 'EEE', { locale: ru })
}

export function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} ${few}`
  return `${n} ${many}`
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
