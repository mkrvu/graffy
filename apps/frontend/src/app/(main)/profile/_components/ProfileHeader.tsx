"use client"

import { useEffect, useRef, useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useProfileStore } from "@/stores/profileStore"
import { useClanStore } from "@/stores/clanStore"
import { useRouter } from "next/navigation"
import { useThemeStore } from "@/stores/themeStore"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { ClanLogo } from "../clan/_components/ClanLogo"

export function ProfileHeader() {
  const { user, updateUser } = useAuthStore()
  const { uploadAvatar } = useProfileStore()
  const { myClan, isInitialized: clanInitialized, fetchMy } = useClanStore()
  const router = useRouter()
  const { theme } = useThemeStore()
  const isDark = theme === "dark"

  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!clanInitialized) fetchMy()
  }, [clanInitialized, fetchMy])

  if (!user) return null

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert("Максимальный размер: 5 МБ")
      return
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Допустимые форматы: JPEG, PNG, WebP")
      return
    }
    setUploading(true)
    try {
      const url = await uploadAvatar(file)
      updateUser({ ...user, avatarUrl: url })
    } catch {}
    setUploading(false)
  }

  // Gradients differ between light / dark (cannot express branching in plain Tailwind)
  const bgGradient = isDark
    ? "linear-gradient(180deg, rgba(153,87,255,0.5) 0%, rgba(153,87,255,0) 92%)"
    : "linear-gradient(180deg, rgba(153,87,255,0.5) 0%, rgba(255,255,255,1) 92%)"

  const avatarGradient = isDark
    ? "linear-gradient(180deg, rgba(153,87,255,0) 0%, rgba(153,87,255,0.66) 100%)"
    : "linear-gradient(180deg, #FFF8F8 0%, #C9B2ED 100%)"

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="relative w-full h-[223px]">
        <div className="absolute inset-x-0 top-0 h-[195px] rounded-3xl" style={{ background: bgGradient }} />

        <button onClick={() => router.push("/profile/settings")} className="absolute top-4 right-5 z-10">
          <Image src="/settings.svg" alt="" width={20} height={20} />
        </button>

        <div
          className={cn(
            "absolute top-[120px] gap-4 left-[64.4%]",
            "flex items-center justify-center px-4 min-w-[111px] h-[34px] rounded-full",
            "shadow-[0px_2px_4px_rgba(0,0,0,0.13)] backdrop-blur-[38.7px]",
            isDark ? "bg-[rgba(40,40,40,0.5)]" : "bg-white/[0.69]",
          )}
        >
          <Image src="/geo.svg" alt="geo" width={10} height={12} />
          <span className={cn("text-[11px] font-semibold", isDark ? "text-white" : "text-[#454545]")}>
            {user.city ?? "Казань"}
          </span>
        </div>

        <div className="flex h-[155px] mt-[68px]">
          <button
            onClick={() => fileRef.current?.click()}
            className={cn(
              "relative ml-[6.65%] w-auto h-full shrink-0 aspect-square",
              "rounded-3xl overflow-hidden",
              "shadow-[0px_4px_6.2px_rgba(171,171,171,0.34)]",
            )}
            style={{ background: avatarGradient }}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Аватар" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="63"
                  height="64"
                  viewBox="0 0 63 64"
                  fill="none"
                  opacity="0.42"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M29.9005 3.83684C25.2311 4.34484 21.0144 6.94184 18.3714
                       10.9375C17.3193 12.5278 16.5028 14.5477 16.0468
                       16.6875C15.7507 18.0766 15.7507 21.4233 16.0468
                       22.8125C17.1457 27.9686 20.161 31.9277 24.671
                       34.1361C27.1479 35.3491 29.5013 35.8391 32.2384
                       35.7118C34.6486 35.6 36.5967 35.087 38.6554
                       34.0222C40.2816 33.1811 41.3318 32.3978 42.7003
                       31.0051C45.6697 27.9833 47.2491 24.0753 47.2491
                       19.75C47.2491 11.6471 41.3591 4.86234 33.4721
                       3.87984C32.4781 3.75596 30.8262 3.73609 29.9005
                       3.83684ZM27.9471 38.2641C21.6273 38.5828 15.876
                       39.9686 11.8126 42.1516C6.59468 44.9548 3.38845
                       48.9591 1.94019 54.481C1.27217 57.0285 1.4624
                       58.2908 2.67835 59.3781C3.732 60.3203 1.40678
                       60.25 31.5029 60.25C54.4582 60.25 58.6185 60.2233
                       59.1101 60.073C60.2507 59.7242 61.1646 58.7167
                       61.4043 57.5436C61.5248 56.9545 61.5071 56.6633
                       61.2814 55.5215C59.3822 45.9108 51.6309 40.0803
                       38.7479 38.5716C36.8634 38.3508 32.7083 38.1202
                       31.0694 38.1455C30.4604 38.1547 29.0553 38.2081
                       27.9471 38.2641Z"
                    fill="#9957FF"
                  />
                </svg>
              </div>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <div className="flex-1 ml-5 relative z-10 pt-[97px] flex flex-col gap-4">
            <span className="text-primary font-medium text-xl leading-[14px]">@{user.username}</span>
            <span className="text-tertiary font-medium text-sm leading-4">{user.bio}</span>
          </div>
        </div>
      </div>
      <Link href={myClan ? `/profile/clan/${myClan.id}` : "/profile/clan"} className="w-full flex items-center gap-3">
        {myClan ? (
          <div className="w-8">
            <ClanLogo color={myClan.color} />
          </div>
        ) : (
          <Image src="/clan.svg" alt="clan" width={30} height={30} />
        )}
        {myClan ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-accent font-medium text-sm leading-[14px]">{myClan.name}</span>
            <span className="text-tertiary font-medium text-xs leading-none">@{myClan.nickname}</span>
          </div>
        ) : (
          <span className="text-accent font-medium text-sm leading-[14px]">Клан не выбран</span>
        )}
      </Link>
    </div>
  )
}
