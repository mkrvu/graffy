"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BackTo, GradientButton } from "@/components"
import { cn } from "@/lib/utils"
import { useClanStore } from "@/stores/clanStore"
import { ClanColorCarousel, CLAN_COLORS, type ClanColor } from "../_components/ClanColorCarousel"

const inputClass = cn(
  "w-full bg-input border border-input rounded-[16.62px]",
  "py-[17px] px-[22px]",
  "text-primary font-medium text-[15.1px]",
  "placeholder:text-tertiary",
  "outline-none focus:border-accent transition-colors duration-150",
)

export default function CreateClanPage() {
  const router = useRouter()
  const { create } = useClanStore()
  const [name, setName] = useState("")
  const [nickname, setNickname] = useState("")
  const [color, setColor] = useState<ClanColor>(CLAN_COLORS[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nicknameTrim = nickname.trim().toLowerCase()
  const nicknameValid = /^[a-z]{5,20}$/.test(nicknameTrim)
  const canSubmit = name.trim().length >= 2 && nicknameValid && !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const clan = await create(name.trim(), nicknameTrim, color)
      router.replace(`/profile/clan/${clan.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка")
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10 py-4">
      <BackTo onClickFn={() => router.back()} className="px-5" />

      <div className="flex flex-col flex-1 items-center gap-8 w-full">
        <h1 className="text-[28.69px] font-medium px-5 text-fg text-center leading-tight">Создай свой клан</h1>

        <ClanColorCarousel color={color} onChange={setColor} />
        <div className="px-5 w-full flex flex-col gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Название"
            autoFocus
            maxLength={40}
            className={inputClass}
          />
          <input
            value={nickname}
            onChange={e => setNickname(e.target.value.toLowerCase().replace(/[^a-z]/g, ""))}
            placeholder="@nickname"
            maxLength={20}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={inputClass}
          />
          {nickname.length > 0 && !nicknameValid && (
            <div className="text-tertiary text-xs px-2">
              Ник: 5–20 строчных латинских букв
            </div>
          )}
        </div>

        {error && <div className="text-red-400 text-sm px-5 text-center">{error}</div>}
      </div>

      <div className="px-5 w-full">
        <GradientButton isActive={canSubmit} isLoading={submitting} type="submit" loadingText="Создаём...">
          Создать
        </GradientButton>
      </div>
    </form>
  )
}
