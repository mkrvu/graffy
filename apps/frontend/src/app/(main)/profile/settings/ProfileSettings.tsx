"use client"

import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { useThemeStore } from "@/stores/themeStore"
import { cn } from "@/lib/utils"
import api from "@/lib/api"
import { BackTo, Toggle } from "@/components"

type FormValues = {
  username: string
  bio: string
  city: string
}

function ChevronRight() {
  return (
    <svg width="5" height="11" viewBox="0 0 5 11" fill="none" aria-hidden>
      <path d="M1 1l3 4.5L1 10" stroke="#A7A5A6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Divider() {
  return <div className="w-full h-px bg-settings-divider" />
}

function SettingsRow({
  label,
  right,
  onClick,
  disabled,
}: {
  label: string
  right: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  const isButton = Boolean(onClick) && !disabled
  const Wrapper = isButton ? "button" : "div"
  return (
    <Wrapper
      onClick={isButton ? onClick : undefined}
      className={cn(
        "flex items-center justify-between w-full py-[15px] px-8 rounded-xl",
        disabled && "opacity-40 cursor-not-allowed",
      )}
    >
      <span className="text-sm font-semibold text-primary">{label}</span>
      {right}
    </Wrapper>
  )
}

const inputClass = cn(
  "w-full bg-input border border-input rounded-[16.62px]",
  "py-[17px] px-[22px]",
  "text-primary font-medium text-sm",
  "placeholder:text-tertiary",
  "outline-none focus:border-accent",
)

export function ProfileSettings() {
  const { user, updateUser, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const router = useRouter()
  const isDark = theme === "dark"

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      username: user?.username ?? "",
      bio: user?.bio ?? "",
      city: user?.city ?? "",
    },
  })

  if (!user) return null

  const onSubmit = async (values: FormValues) => {
    try {
      const { data } = await api.put<{ nickname: string; avatarUrl?: string; bio?: string; city?: string }>(
        "/profile/me",
        { nickname: values.username, bio: values.bio || null, city: values.city || null },
      )
      updateUser({ ...user, username: data.nickname, avatarUrl: data.avatarUrl, bio: data.bio, city: data.city })
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } }
      setError("root", { message: err?.response?.data?.error ?? "Ошибка сохранения" })
    }
  }

  const handleLogout = async () => {
    await logout()
    router.replace("/login")
  }

  return (
    <div className="w-full flex flex-col gap-8 py-4 pl-[21px] pr-[22px]">
      <BackTo onClickFn={() => router.back()} />

      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <span className="text-sm font-semibold text-tertiary">Профиль</span>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <input
                {...register("username", {
                  required: "Никнейм обязателен",
                  minLength: { value: 5, message: "Минимум 5 символов" },
                  maxLength: { value: 20, message: "Максимум 20 символов" },
                  pattern: {
                    value: /^[a-z]+$/,
                    message: "Только маленькие латинские буквы, без цифр и спецсимволов",
                  },
                })}
                placeholder="@username"
                className={cn(inputClass, errors.username && "border-red-400")}
              />
              {errors.username && (
                <p className="text-red-500 text-sm font-semibold px-2">⚠ {errors.username.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <input {...register("bio")} placeholder="Описание" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1">
              <input {...register("city")} placeholder="Город" className={inputClass} />
            </div>

            {errors.root && <p className="text-red-400 text-xs px-2">{errors.root.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full py-[17px] rounded-[16.62px]",
                "bg-accent text-white text-sm font-semibold",
                "disabled:opacity-60 transition-opacity duration-150",
              )}
            >
              {isSubmitting ? "Сохранение…" : "Сохранить"}
            </button>
          </form>
        </section>

        <section className="flex flex-col gap-4">
          <span className="text-sm font-semibold text-tertiary">Настройки</span>

          <div className="flex flex-col gap-2">
            <SettingsRow label="Темная тема" right={<Toggle value={isDark} onChange={() => toggleTheme()} />} />

            <Divider />

            <SettingsRow
              label="Сферы"
              right={<ChevronRight />}
              onClick={() => router.push("/profile/settings/spheres")}
            />

            <Divider />

            <SettingsRow label="Цвет графа" right={<ChevronRight />} disabled />
          </div>
        </section>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-semibold text-tertiary hover:text-red-400 transition-colors duration-150 self-start"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Выйти
        </button>
      </div>
    </div>
  )
}
