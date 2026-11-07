import { TaskDifficulty } from '@/types'
import { cn } from '@/lib/utils'

const DIFFICULTY_CONFIG: Record<TaskDifficulty, { label: string; color: string; bg: string; dots: number }> = {
  TRIVIAL: { label: 'Тривиальная', color: 'text-gray-400',    bg: 'bg-gray-500/15',    dots: 1 },
  EASY:    { label: 'Лёгкая',      color: 'text-emerald-400', bg: 'bg-emerald-500/15', dots: 2 },
  MEDIUM:  { label: 'Средняя',     color: 'text-amber-400',   bg: 'bg-amber-500/15',   dots: 3 },
  HARD:    { label: 'Сложная',     color: 'text-red-400',     bg: 'bg-red-500/15',     dots: 4 },
}

interface DifficultyBadgeProps {
  difficulty: TaskDifficulty
  xp?: number
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export function DifficultyBadge({ difficulty, xp, showLabel = false, size = 'md' }: DifficultyBadgeProps) {
  const cfg = DIFFICULTY_CONFIG[difficulty]

  return (
    <div className={cn('flex items-center gap-1.5 rounded-full px-2 py-0.5', cfg.bg, size === 'sm' ? 'px-1.5' : '')}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-full transition-all',
              size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5',
              i < cfg.dots ? cfg.color.replace('text-', 'bg-') : 'bg-gray-600/40'
            )}
          />
        ))}
      </div>
      {showLabel && <span className={cn('text-xs font-semibold', cfg.color)}>{cfg.label}</span>}
      {xp !== undefined && <span className={cn('text-xs font-bold', cfg.color)}>+{xp}</span>}
    </div>
  )
}
