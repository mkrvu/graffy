"use client"

import { useEffect, useState } from "react"
import { useAdminStore } from "@/stores/adminStore"
import { AdminUser } from "@/types"
import { getLevelFromXP } from "@/lib/levels"

export function UsersPanel() {
  const { users, badges, isLoading, error, fetchUsers, fetchBadges, updateNickname, issueBadge } =
    useAdminStore()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<AdminUser | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchBadges()
  }, [fetchUsers, fetchBadges])

  const q = query.trim().toLowerCase()
  const filtered = q
    ? users.filter(u => u.nickname.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    : users

  return (
    <div className="flex flex-col gap-3">
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Поиск по нику или email"
        className="w-full bg-card border border-input rounded-2xl px-4 py-3 text-primary placeholder:text-tertiary focus:outline-none focus:border-accent text-sm"
      />

      {error && <div className="text-red-400 text-sm">{error}</div>}
      {isLoading && users.length === 0 && (
        <div className="text-tertiary text-sm py-8 text-center">Загрузка…</div>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map(u => (
          <button
            key={u.id}
            onClick={() => setSelected(u)}
            className="bg-card border border-theme rounded-2xl p-3 flex justify-between items-center text-left hover:border-accent transition-colors"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-primary font-semibold text-sm truncate">
                {u.nickname}
                {u.role === "Admin" || u.role === "ADMIN" ? (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-md bg-accent/20 text-accent">
                    ADMIN
                  </span>
                ) : null}
              </span>
              <span className="text-tertiary text-xs truncate">{u.email}</span>
            </div>
            <div className="text-tertiary text-xs flex flex-col items-end shrink-0 ml-2">
              <span>
                ур. {getLevelFromXP(u.xp)} · {u.xp} XP
              </span>
              <span>
                {u.taskCount} зад. · {u.habitCount} прив.
              </span>
            </div>
          </button>
        ))}
        {!isLoading && filtered.length === 0 && (
          <div className="text-tertiary text-sm py-8 text-center">Никого не найдено</div>
        )}
      </div>

      {selected && (
        <UserActionsModal
          user={selected}
          badges={badges}
          onClose={() => setSelected(null)}
          onUpdateNickname={async name => {
            await updateNickname(selected.id, name)
            setSelected({ ...selected, nickname: name })
          }}
          onIssueBadge={async badgeId => issueBadge(selected.id, badgeId)}
        />
      )}
    </div>
  )
}

interface ModalProps {
  user: AdminUser
  badges: { id: string; title: string; tier: number; category: string }[]
  onClose: () => void
  onUpdateNickname: (n: string) => Promise<void>
  onIssueBadge: (badgeId: string) => Promise<void>
}

function UserActionsModal({ user, badges, onClose, onUpdateNickname, onIssueBadge }: ModalProps) {
  const [nickname, setNickname] = useState(user.nickname)
  const [badgeId, setBadgeId] = useState(badges[0]?.id ?? "")
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const save = async (action: () => Promise<void>, ok: string) => {
    setBusy(true)
    setMsg(null)
    try {
      await action()
      setMsg(ok)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center px-4 pb-4"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-card rounded-3xl border border-theme p-5 flex flex-col gap-4 w-full max-w-md"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-primary font-bold text-lg">{user.nickname}</h2>
          <button onClick={onClose} className="text-tertiary hover:text-primary text-xl leading-none">
            ×
          </button>
        </div>

        <div>
          <label className="text-tertiary text-xs font-medium block mb-1">Никнейм</label>
          <div className="flex gap-2">
            <input
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              className="flex-1 bg-app border border-input rounded-xl px-3 py-2 text-primary text-sm focus:outline-none focus:border-accent"
            />
            <button
              disabled={busy || nickname === user.nickname || nickname.trim() === ""}
              onClick={() => save(() => onUpdateNickname(nickname.trim()), "Никнейм обновлён")}
              className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold disabled:opacity-40"
            >
              Сохранить
            </button>
          </div>
        </div>

        <div>
          <label className="text-tertiary text-xs font-medium block mb-1">Выдать бейдж</label>
          <div className="flex gap-2">
            <select
              value={badgeId}
              onChange={e => setBadgeId(e.target.value)}
              className="flex-1 bg-app border border-input rounded-xl px-3 py-2 text-primary text-sm focus:outline-none focus:border-accent"
            >
              {badges.length === 0 && <option value="">Нет бейджей</option>}
              {badges.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title} (T{b.tier})
                </option>
              ))}
            </select>
            <button
              disabled={busy || !badgeId}
              onClick={() => save(() => onIssueBadge(badgeId), "Бейдж выдан")}
              className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold disabled:opacity-40"
            >
              Выдать
            </button>
          </div>
        </div>

        {msg && <div className="text-sm text-tertiary">{msg}</div>}
      </div>
    </div>
  )
}
