"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { LoginScreen } from "@/components/auth"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()

  const handleSubmit = async ({
    email,
    password,
    rememberMe,
  }: {
    email: string
    password: string
    rememberMe: boolean
  }) => {
    clearError()
    try {
      await login(email, password, rememberMe)
      router.replace("/tasks")
    } catch {}
  }

  return <LoginScreen onSubmit={handleSubmit} isLoading={isLoading} error={error} />
}
