"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { BackTo, GradientButton } from "@/components"
import { ClanLogo } from "../_components/ClanLogo"
import { useClanStore } from "@/stores/clanStore"
import { ClanInvitePreview } from "@/types"

export default function JoinClanPage() {
  return (
    <Suspense fallback={null}>
      <JoinClanInner />
    </Suspense>
  )
}

function JoinClanInner() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get("token")
  const { getInvitePreview, acceptInvite } = useClanStore()

  const [preview, setPreview] = useState<ClanInvitePreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      router.replace("/profile/clan")
      return
    }
    setLoading(true)
    setError(null)
    getInvitePreview(token)
      .then(setPreview)
      .catch(() => setError("Приглашение не найдено или больше не действительно"))
      .finally(() => setLoading(false))
  }, [token, getInvitePreview, router])

  const handleAccept = async () => {
    if (!token) return
    setAccepting(true)
    setError(null)
    try {
      const clan = await acceptInvite(token)
      router.replace(`/profile/clan/${clan.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка")
      setAccepting(false)
    }
  }

  if (!token) return null

  return (
    <div className="flex flex-col justify-between gap-8 px-[22px] py-4 min-h-[calc(100svh-80px)]">
      <BackTo onClickFn={() => router.back()} />

      <div className="flex flex-col flex-1 items-center justify-center gap-[40px] w-full">
        <div className="w-40">
          <ClanLogo color={preview?.color} />
        </div>

        {loading && <p className="text-tertiary text-sm">Загрузка…</p>}

        {preview && (
          <div className="flex flex-col items-center gap-3 max-w-[300px] w-full">
            <h1 className="text-[22px] font-medium text-fg text-center leading-tight">{preview.name}</h1>
            <span className="text-tertiary text-[14px] font-medium">@{preview.nickname}</span>
            <p className="text-[13.44px] font-medium text-tertiary text-center leading-snug">
              Участников: {preview.memberCount} из {preview.memberLimit}
            </p>
          </div>
        )}

        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
      </div>

      {preview && (
        <GradientButton
          isActive={!accepting && preview.memberCount < preview.memberLimit}
          isLoading={accepting}
          loadingText="Присоединяемся..."
          type="button"
          onClick={handleAccept}
        >
          {preview.memberCount >= preview.memberLimit ? "Клан переполнен" : "Присоединиться"}
        </GradientButton>
      )}
    </div>
  )
}
