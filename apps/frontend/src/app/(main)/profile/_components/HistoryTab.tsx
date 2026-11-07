import { Task } from '@/types'
import { formatDate } from '@/lib/utils'

export function HistoryTab({ history }: { history: Task[] }) {
  if (history.length === 0) {
    return (
      <div className="animate-fade-in flex flex-col items-center py-12 gap-2">
        <span className="text-4xl">📋</span>
        <p className="text-sm text-tertiary">История пуста</p>
      </div>
    )
  }

  const groups: Record<string, Task[]> = {}
  history.forEach((t) => {
    const key = t.completedAt ? formatDate(t.completedAt) : 'Неизвестно'
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  })

  return (
    <div className="animate-fade-in space-y-4">
      {Object.entries(groups).map(([date, tasks]) => (
        <div key={date} className="bg-card border border-theme rounded-2xl p-4">
          <p className="text-xs font-bold text-tertiary uppercase tracking-wider mb-3">{date}</p>
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm text-secondary flex-1 truncate">{t.title}</span>
                <span className="text-xs font-bold text-primary-400">+{t.xpReward} XP</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
