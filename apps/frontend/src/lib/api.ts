import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import { tokenStorage } from "./cookies"

const apiOrigin =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "" : "http://localhost:8000")
const BASE = `${apiOrigin}/api`

const api = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use(config => {
  if (typeof window !== "undefined") {
    const token = tokenStorage.getAccess()
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type QueueItem = { resolve: (token: string) => void; reject: (err: unknown) => void }
let isRefreshing = false
let queue: QueueItem[] = []

const flushQueue = (error: unknown, token: string | null = null) => {
  queue.forEach(p => (error ? p.reject(error) : p.resolve(token!)))
  queue = []
}

api.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    const url = original.url ?? ""
    if (url.includes("/auth/refresh") || url.includes("/auth/login") || url.includes("/auth/register")) {
      return Promise.reject(error)
    }

    const refreshToken = typeof window !== "undefined" ? tokenStorage.getRefresh() : null
    if (!refreshToken) {
      kickToLogin()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        queue.push({ resolve, reject })
      }).then(token => {
        original.headers.Authorization = `Bearer ${token}`
        original._retry = true
        return api(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken })
      tokenStorage.save(data.accessToken, data.refreshToken)
      flushQueue(null, data.accessToken)
      original.headers.Authorization = `Bearer ${data.accessToken}`
      return api(original)
    } catch (err) {
      flushQueue(err, null)
      kickToLogin()
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  },
)

function kickToLogin() {
  if (typeof window === "undefined") return
  tokenStorage.clear()
  if (window.location.pathname === "/login") return
  window.location.href = "/login"
}

export default api
