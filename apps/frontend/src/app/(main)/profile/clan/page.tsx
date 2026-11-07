"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { BackTo, GradientButton } from "@/components"
import { useClanStore } from "@/stores/clanStore"
import { ClanLogo } from "./_components/ClanLogo"

export default function ClanPage() {
  const router = useRouter()
  const { myClan, isInitialized, isLoading, fetchMy } = useClanStore()

  useEffect(() => {
    if (!isInitialized) fetchMy()
  }, [isInitialized, fetchMy])

  useEffect(() => {
    if (isInitialized && myClan) router.replace(`/profile/clan/${myClan.id}`)
  }, [isInitialized, myClan, router])

  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100svh-80px)]">
        <div
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
      </div>
    )
  }

  if (myClan) return null

  return (
    <div className="flex flex-col justify-between gap-8 px-[22px] py-4 min-h-[calc(100svh-80px)]">
      <BackTo onClickFn={() => router.back()} />

      <div className="flex flex-col flex-1 items-center justify-center gap-[72px] w-full">
        <ClanLogo />

        <div className="flex flex-col items-center gap-[19px] max-w-[300px] w-full">
          <h1 className="text-[28.69px] font-medium text-fg text-center leading-tight">У вас пока нет клана</h1>
          <p className="text-[13.44px] font-medium text-tertiary text-center leading-snug">
            Создайте свой клан или присоединитесь к существующему — для этого попросите у участника
            ссылку-приглашение.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full mt-auto">
        <GradientButton isActive type="button" onClick={() => router.push("/profile/clan/create")}>
          Создать клан
        </GradientButton>
      </div>
    </div>
  )
}
