"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { RegisterScreen } from "@/components/auth"

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuthStore()

  const handleSubmit = async ({
    email,
    nickname,
    password,
    rememberMe,
  }: {
    email: string
    nickname: string
    password: string
    rememberMe: boolean
  }) => {
    clearError()
    try {
      await register(email, password, nickname, rememberMe)
      router.replace("/tasks")
    } catch {}
  }

  return <RegisterScreen onSubmit={handleSubmit} isLoading={isLoading} error={error} />
}
