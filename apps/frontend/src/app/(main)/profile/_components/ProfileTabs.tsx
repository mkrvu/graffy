import { cn } from '@/lib/utils'

export type Tab = 'stats' | 'badges' | 'history'

const TAB_LABELS: Record<Tab, string> = {
  stats: 'Статистика',
  badges: 'Значки',
  history: 'История',
}

export function ProfileTabs({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex gap-1 bg-card rounded-2xl p-1 border border-theme mb-4">
      {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            'flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200',
            tab === t ? 'bg-gradient-purple text-white shadow-glow-purple' : 'text-tertiary hover:text-secondary'
          )}
        >
          {TAB_LABELS[t]}
        </button>
      ))}
    </div>
  )
}
