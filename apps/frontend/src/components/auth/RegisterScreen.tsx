"use client"

import { useForm } from "react-hook-form"
import Link from "next/link"
import { GraffLogo } from "../ui/GraffLogo"
import { Checkbox } from "../ui/Checkbox"
import { GradientButton } from "../ui/GradientButton"

type FormValues = {
  email: string
  nickname: string
  password: string
  confirm: string
  rememberMe: boolean
  acceptTerms: boolean
}

interface RegisterScreenProps {
  onSubmit?: (data: { email: string; nickname: string; password: string; rememberMe: boolean }) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

const inputClass =
  "w-full bg-card border border-input rounded-[17px] px-[22px] py-[17px] font-medium text-primary placeholder:text-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"

export function RegisterScreen({ onSubmit, isLoading = false, error }: RegisterScreenProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { email: "", nickname: "", password: "", confirm: "", rememberMe: true, acceptTerms: false },
  })

  const acceptTerms = watch("acceptTerms")
  const rememberMe = watch("rememberMe")

  const onFormSubmit = async (values: FormValues) => {
    try {
      await onSubmit?.({ email: values.email, nickname: values.nickname, password: values.password, rememberMe: values.rememberMe })
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } }
      setError("root", { message: err?.response?.data?.error ?? "Ошибка регистрации" })
    }
  }

  const displayError = errors.root?.message || error

  return (
    <div
      className="min-h-screen bg-app flex flex-col items-center"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div
        className="w-full flex-1 bg-card flex flex-col items-center gap-14 px-5 pt-12 pb-12 mt-4"
        style={{ borderRadius: "53px 53px 0 0" }}
      >
        <GraffLogo className="h-[62px]" />

        <div className="flex flex-col items-center gap-5 w-[263px]">
          <h1 className="text-primary text-center font-medium" style={{ fontSize: 28.7 }}>
            Добро пожаловать
          </h1>
          <p className="text-center font-medium w-full" style={{ fontSize: 13.4 }}>
            <span className="text-tertiary">Готовы начать свой путь в GRAFFY?</span>
            <br />
            <span className="text-primary">Ваш путь прямо здесь.</span>
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full" style={{ maxWidth: 387 }}>
          {displayError && (
            <div className="p-3 rounded-xl border text-sm text-red-400 bg-red-500/10 border-red-500/30 animate-fade-in">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <input
                {...register("email", { required: "Введите email" })}
                type="email"
                placeholder="Email"
                className={inputClass}
                style={{ fontSize: 15.1 }}
              />
              {errors.email && <p className="text-red-400 text-xs px-2">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <input
                {...register("nickname", {
                  required: "Введите никнейм",
                  minLength: { value: 5, message: "Минимум 5 символов" },
                  maxLength: { value: 20, message: "Максимум 20 символов" },
                  pattern: {
                    value: /^[a-z]+$/,
                    message: "Только маленькие латинские буквы, без цифр и спецсимволов",
                  },
                })}
                placeholder="@username"
                className={inputClass}
                style={{ fontSize: 15.1 }}
              />
              {errors.nickname && (
                <p className="text-red-500 text-sm font-semibold px-2">⚠ {errors.nickname.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <input
                {...register("password", {
                  required: "Введите пароль",
                  minLength: { value: 6, message: "Минимум 6 символов" },
                })}
                type="password"
                placeholder="Пароль"
                className={inputClass}
                style={{ fontSize: 15.1 }}
              />
              {errors.password && <p className="text-red-400 text-xs px-2">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <input
                {...register("confirm", {
                  required: "Повторите пароль",
                  validate: v => v === watch("password") || "Пароли не совпадают",
                })}
                type="password"
                placeholder="Повторите пароль"
                className={inputClass}
                style={{ fontSize: 15.1 }}
              />
              {errors.confirm && <p className="text-red-400 text-xs px-2">{errors.confirm.message}</p>}
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox checked={rememberMe} onChange={v => setValue("rememberMe", v)} />
              <span className="text-accent font-medium" style={{ fontSize: 14 }}>
                Запомнить меня
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer select-none">
              <Checkbox checked={acceptTerms} onChange={v => setValue("acceptTerms", v)} />
              <span className="text-accent font-medium leading-snug" style={{ fontSize: 14, maxWidth: 339 }}>
                <span className="text-primary">Я принимаю условия </span>
                Пользовательского соглашения <span className="text-primary">и</span> Политики конфиденциальности
              </span>
            </label>

            <div className="flex flex-col gap-4 mt-4">
              <GradientButton
                isActive={acceptTerms && !isSubmitting}
                isLoading={isLoading || isSubmitting}
                loadingText="Регистрация..."
              >
                Зарегистрироваться
              </GradientButton>

              <OrDivider />

              <div className="flex justify-center">
                <p className="text-accent font-medium" style={{ fontSize: 14 }}>
                  <span className="text-primary">Уже есть аккаунт? </span>
                  <Link href="/login" className="text-accent hover:opacity-75 transition-opacity">
                    Войти
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function OrDivider() {
  return (
    <div className="flex items-center w-full" style={{ height: 17 }}>
      <div
        className="flex-1 h-px"
        style={{ background: "linear-gradient(90deg, rgba(144,147,166,0) 0%, rgba(144,147,166,1) 100%)" }}
      />
      <span className="mx-3 text-tertiary font-medium" style={{ fontSize: 14, width: 26, textAlign: "center" }}>
        или
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: "linear-gradient(90deg, rgba(144,147,166,1) 0%, rgba(144,147,166,0) 100%)" }}
      />
    </div>
  )
}
