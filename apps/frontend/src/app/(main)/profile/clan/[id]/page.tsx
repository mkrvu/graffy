"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { BackTo } from "@/components"
import { ConfirmSheet } from "@/app/(main)/tasks/_components/ConfirmSheet"
import { ClanLogo } from "../_components/ClanLogo"
import { useClanStore } from "@/stores/clanStore"
import { useAuthStore } from "@/stores/authStore"
import { ClanDetails, ClanMember } from "@/types"

type SheetState =
  | { kind: "none" }
  | { kind: "leave" }
  | { kind: "remove" }
  | { kind: "kick"; memberId: string; nickname: string }
  | { kind: "transfer"; memberId: string; nickname: string }

export default function ClanInfoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { user } = useAuthStore()
  const { getById, getInviteToken, kickMember, transferLeadership, leave, remove } = useClanStore()

  const [clan, setClan] = useState<ClanDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sheet, setSheet] = useState<SheetState>({ kind: "none" })

  useEffect(() => {
    if (!id) return
    setError(null)
    getById(id)
      .then(setClan)
      .catch(() => setError("Клан не найден или у вас нет доступа"))
  }, [id, getById])

  if (error) {
    return (
      <div className="flex flex-col gap-4 px-[22px] py-4">
        <BackTo onClickFn={() => router.back()} />
        <div className="text-red-400 text-sm py-8 text-center">{error}</div>
      </div>
    )
  }

  if (!clan || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100svh-80px)]">
        <div
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
      </div>
    )
  }

  const isLeader = clan.leaderId === user.id
  const hasOtherMembers = clan.members.length > 1
  const canLeave = !isLeader || !hasOtherMembers

  const refresh = async () => {
    const fresh = await getById(clan.id)
    setClan(fresh)
  }

  const handleCopy = async () => {
    try {
      const token = await getInviteToken(clan.id)
      const url = `${window.location.origin}/profile/clan/join?token=${token}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const confirmKick = async () => {
    if (sheet.kind !== "kick") return
    const memberId = sheet.memberId
    setSheet({ kind: "none" })
    setBusy(true)
    try {
      await kickMember(clan.id, memberId)
      await refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка")
    }
    setBusy(false)
  }

  const confirmTransfer = async () => {
    if (sheet.kind !== "transfer") return
    const memberId = sheet.memberId
    setSheet({ kind: "none" })
    setBusy(true)
    try {
      await transferLeadership(clan.id, memberId)
      await refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка")
    }
    setBusy(false)
  }

  const confirmLeave = async () => {
    setSheet({ kind: "none" })
    setBusy(true)
    try {
      await leave(clan.id)
      router.replace("/profile/clan")
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка")
      setBusy(false)
    }
  }

  const confirmRemove = async () => {
    setSheet({ kind: "none" })
    setBusy(true)
    try {
      await remove(clan.id)
      router.replace("/profile/clan")
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка")
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 px-[22px] py-4">
      <div className="flex items-center justify-between">
        <BackTo onClickFn={() => router.back()} />
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={copied ? "Ссылка скопирована" : "Скопировать ссылку-приглашение"}
            onClick={handleCopy}
            disabled={copied}
            className={`w-8 h-8 flex items-center justify-center transition-colors ${
              copied ? "text-accent" : "text-tertiary hover:text-fg"
            }`}
          >
            {copied ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M5 12.5l4.5 4.5L19 7"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden width="20" height="20" viewBox="0 0 22 22" fill="none">
                <path
                  d="M15.3147 5.42664C14.7517 5.42664 14.2056 5.57927 13.7273 5.8574C13.1914 5.3147 12.5673 4.8602 11.8788 4.51762C12.8353 3.70358 14.0529 3.25586 15.3147 3.25586C18.2452 3.25586 20.6229 5.63015 20.6229 8.56409C20.6229 9.9717 20.0633 11.3217 19.0695 12.3155L16.6579 14.7271C15.6641 15.7209 14.3141 16.2805 12.9065 16.2805C9.97594 16.2805 7.59827 13.9062 7.59827 10.9723C7.59827 10.9214 7.59827 10.8705 7.60166 10.8197C7.61862 10.2193 8.11722 9.74784 8.71757 9.7648C9.31793 9.78176 9.78939 10.2804 9.77243 10.8807C9.77243 10.9112 9.77243 10.9418 9.77243 10.9689C9.77243 12.7021 11.1767 14.1063 12.9099 14.1063C13.7409 14.1063 14.538 13.7773 15.1281 13.1872L17.5397 10.7756C18.1265 10.1888 18.4589 9.3883 18.4589 8.5573C18.4589 6.82407 17.0547 5.41985 15.3215 5.41985L15.3147 5.42664ZM10.4203 8.04853C10.3558 8.02139 10.2914 7.98408 10.2337 7.94338C9.80635 7.72291 9.31793 7.59741 8.80576 7.59741C7.97476 7.59741 7.17768 7.92642 6.5875 8.5166L4.1759 10.9282C3.58911 11.515 3.25671 12.3155 3.25671 13.1465C3.25671 14.8797 4.66093 16.2839 6.39416 16.2839C6.95382 16.2839 7.4999 16.1347 7.97815 15.8565C8.51406 16.3992 9.13816 16.8537 9.83009 17.1963C8.8736 18.007 7.65932 18.4581 6.39416 18.4581C3.46362 18.4581 1.08594 16.0838 1.08594 13.1499C1.08594 11.7422 1.64559 10.3923 2.6394 9.39848L5.051 6.98688C6.0448 5.99307 7.39476 5.43342 8.80237 5.43342C11.7397 5.43342 14.1106 7.82806 14.1106 10.7552C14.1106 10.7993 14.1106 10.8434 14.1106 10.8875C14.097 11.4879 13.5984 11.9593 12.9981 11.9457C12.3977 11.9322 11.9263 11.4336 11.9398 10.8332C11.9398 10.8061 11.9398 10.7823 11.9398 10.7552C11.9398 9.61216 11.3293 8.60818 10.4203 8.05531V8.04853Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          {canLeave && (
            <button
              type="button"
              aria-label={isLeader ? "Удалить клан" : "Выйти из клана"}
              onClick={() => setSheet({ kind: isLeader ? "remove" : "leave" })}
              disabled={busy}
              className="w-8 h-8 flex items-center justify-center text-tertiary hover:text-red-400 transition-colors disabled:opacity-50"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col mt-4 gap-4">
        <div className="flex items-center gap-8">
          <div className="shrink-0 w-[88px]">
            <ClanLogo color={clan.color} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[20px] font-medium text-fg leading-tight">{clan.name}</h1>
            <span className="text-tertiary text-[13px] font-medium mt-1">@{clan.nickname}</span>
          </div>
        </div>

        <div className="h-px bg-settings-btn-muted" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Общий XP" value={clan.stats.totalXp} />
        <Stat label="Активных" value={clan.stats.activeMembers} />
        <Stat label="Задач" value={clan.stats.totalCompletedTasks} />
        <Stat label="Привычек" value={clan.stats.totalCompletedHabits} />
      </div>

      <section className="flex flex-col gap-[19px] mt-2">
        <h2 className="text-base font-semibold text-fg">Участники ({clan.members.length}/4)</h2>

        <ul className="flex flex-col gap-3">
          {clan.members.map(m => (
            <MemberRow
              key={m.userId}
              member={m}
              showActions={isLeader && m.userId !== user.id}
              onKick={() => setSheet({ kind: "kick", memberId: m.userId, nickname: m.nickname })}
              onTransfer={() => setSheet({ kind: "transfer", memberId: m.userId, nickname: m.nickname })}
              disabled={busy}
            />
          ))}
        </ul>
      </section>

      {sheet.kind === "leave" && (
        <ConfirmSheet
          title="Выйти из клана?"
          description="Весь опыт, заработанный для клана, будет утерян и не вернётся при возвращении."
          confirmLabel="Выйти"
          onConfirm={confirmLeave}
          onCancel={() => setSheet({ kind: "none" })}
        />
      )}
      {sheet.kind === "remove" && (
        <ConfirmSheet
          title="Удалить клан?"
          description="Вы единственный участник. Клан будет удалён вместе со всей статистикой."
          confirmLabel="Удалить"
          onConfirm={confirmRemove}
          onCancel={() => setSheet({ kind: "none" })}
        />
      )}
      {sheet.kind === "kick" && (
        <ConfirmSheet
          title={`Удалить @${sheet.nickname}?`}
          description="Участник будет исключён из клана."
          confirmLabel="Удалить"
          onConfirm={confirmKick}
          onCancel={() => setSheet({ kind: "none" })}
        />
      )}
      {sheet.kind === "transfer" && (
        <ConfirmSheet
          title={`Передать лидерство @${sheet.nickname}?`}
          description="Вы перестанете быть лидером клана."
          confirmLabel="Передать"
          onConfirm={confirmTransfer}
          onCancel={() => setSheet({ kind: "none" })}
        />
      )}
    </div>
  )
}

function MemberRow({
  member,
  showActions,
  onKick,
  onTransfer,
  disabled,
}: {
  member: ClanMember
  showActions: boolean
  onKick: () => void
  onTransfer: () => void
  disabled: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  return (
    <li className="flex items-center gap-[11.82px] relative">
      {member.avatarUrl ? (
        <img src={member.avatarUrl} alt="" className="w-[39px] h-[39px] rounded-full shrink-0 object-cover" />
      ) : (
        <span className="w-[39px] h-[39px] rounded-full shrink-0 bg-[#D9D9D9]" aria-hidden />
      )}
      <div className="flex flex-col flex-1">
        <span className="text-[13.13px] font-medium text-fg">
          @{member.nickname}
          {member.isLeader && (
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-md bg-accent/20 text-accent">лидер</span>
          )}
        </span>
        <span className="text-[11px] text-tertiary">
          ур. {member.level} · {member.xp} XP
        </span>
      </div>

      {showActions && (
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            disabled={disabled}
            aria-label="Действия"
            className="w-8 h-8 flex items-center justify-center text-tertiary hover:text-fg disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <circle cx="4" cy="10" r="1.6" />
              <circle cx="10" cy="10" r="1.6" />
              <circle cx="16" cy="10" r="1.6" />
            </svg>
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 z-20 min-w-[180px] rounded-xl border border-theme bg-card shadow-lg overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onTransfer()
                }}
                className="block w-full text-left px-3 py-2 text-sm text-fg hover:bg-accent/10"
              >
                Передать лидерство
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onKick()
                }}
                className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                Удалить из клана
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card rounded-2xl border border-theme p-3 flex flex-col gap-0.5">
      <span className="text-tertiary text-[11px] font-medium">{label}</span>
      <span className="text-primary font-bold text-lg">{value}</span>
    </div>
  )
}
