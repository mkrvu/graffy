import { StatsResponse } from '@/types'
import { formatDateWeekday } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function DayCard({ label, tasks, habits, xp }: { label: string; tasks: number; habits: number; xp: number }) {
  return (
    <div className="bg-card border border-theme rounded-2xl p-4">
      <p className="text-xs font-bold text-tertiary uppercase tracking-wider mb-2">{label}</p>
      <p className="text-xl font-black text-primary-400">+{xp} XP</p>
      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-tertiary">Задачи</span>
          <span className="text-xs font-bold text-secondary">{tasks}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-tertiary">Привычки</span>
          <span className="text-xs font-bold text-secondary">{habits}</span>
        </div>
      </div>
    </div>
  )
}

export function StatsTab({ statsResponse }: { statsResponse: StatsResponse | null }) {
  const weeklyData = statsResponse?.weekly.map((d) => ({
    ...d,
    day: formatDateWeekday(d.date),
  })) ?? []

  return (
    <div className="animate-fade-in space-y-4">
      {statsResponse && (
        <div className="grid grid-cols-2 gap-3">
          <DayCard
            label="Сегодня"
            tasks={statsResponse.today.tasksCompleted}
            habits={statsResponse.today.habitsCompleted}
            xp={statsResponse.today.xpEarned}
          />
          <DayCard
            label="Вчера"
            tasks={statsResponse.yesterday.tasksCompleted}
            habits={statsResponse.yesterday.habitsCompleted}
            xp={statsResponse.yesterday.xpEarned}
          />
        </div>
      )}
      {weeklyData.length > 0 && (
        <div className="bg-card border border-theme rounded-2xl p-4">
          <h3 className="text-sm font-bold text-primary mb-3">Неделя</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 0, left: -30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: 'var(--fg)' }}
              />
              <Bar dataKey="tasksCompleted" name="Задачи" fill="#7C3AED" radius={[3, 3, 0, 0]} />
              <Bar dataKey="habitsCompleted" name="Привычки" fill="#06B6D4" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
