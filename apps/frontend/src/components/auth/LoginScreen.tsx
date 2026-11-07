'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GraffLogo } from '../ui/GraffLogo'
import { Checkbox } from '../ui/Checkbox'
import { GradientButton } from '../ui/GradientButton'

interface LoginScreenProps {
  onSubmit?: (data: { email: string; password: string; rememberMe: boolean }) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

export function LoginScreen({ onSubmit, isLoading = false, error }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  const isReady = email.trim() !== '' && password !== ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit?.({ email, password, rememberMe })
  }

  return (
    <div className="min-h-screen bg-app flex flex-col items-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div
        className="w-full flex-1 bg-card flex flex-col items-center gap-14 px-5 pt-12 pb-12 mt-4"
        style={{ borderRadius: '53px 53px 0 0' }}
      >
        <GraffLogo className="h-[62px]" />

        <div className="flex flex-col items-center gap-5 w-[263px]">
          <h1 className="text-primary text-center font-medium" style={{ fontSize: 28.7 }}>
            С возвращением
          </h1>
          <p className="text-center font-medium w-full" style={{ fontSize: 13.4 }}>
            <span className="text-tertiary">Готовы начать свой путь в GRAFFY?</span>
            <br />
            <span className="text-primary">Ваш путь прямо здесь.</span>
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full" style={{ maxWidth: 387 }}>
          {error && (
            <div className="p-3 rounded-xl border text-sm text-red-400 bg-red-500/10 border-red-500/30 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full bg-card border border-input rounded-[17px] px-[22px] py-[17px] font-medium text-primary placeholder:text-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              style={{ fontSize: 15.1 }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              required
              className="w-full bg-card border border-input rounded-[17px] px-[22px] py-[17px] font-medium text-primary placeholder:text-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
              style={{ fontSize: 15.1 }}
            />

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox checked={rememberMe} onChange={setRememberMe} />
              <span className="text-accent font-medium" style={{ fontSize: 14 }}>Запомнить меня</span>
            </label>

            <div className="flex flex-col gap-4 mt-4">
              <GradientButton isActive={isReady} isLoading={isLoading} loadingText="Вход...">
                Войти
              </GradientButton>

              <OrDivider />

              <div className="flex justify-center">
                <p className="text-accent font-medium" style={{ fontSize: 14 }}>
                  <span className="text-primary">Нет аккаунта? </span>
                  <Link href="/register" className="text-accent hover:opacity-75 transition-opacity">
                    Зарегистрироваться
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
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(144,147,166,0) 0%, rgba(144,147,166,1) 100%)' }} />
      <span className="mx-3 text-tertiary font-medium" style={{ fontSize: 14, width: 26, textAlign: 'center' }}>или</span>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(144,147,166,1) 0%, rgba(144,147,166,0) 100%)' }} />
    </div>
  )
}
