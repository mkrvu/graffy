const COOKIE_ACCESS = "access_token"
const COOKIE_REFRESH = "refresh_token"
const LS_REMEMBER = "auth_remember_me"

const PERSISTENT_DAYS = 30

function setCookie(name: string, value: string, days?: number) {
  if (typeof document === "undefined") return
  const expires =
    days !== undefined ? `; expires=${new Date(Date.now() + days * 86_400_000).toUTCString()}` : ""
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return m ? decodeURIComponent(m[1]) : null
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

function readRemember(): boolean {
  if (typeof window === "undefined") return true
  try {
    const v = localStorage.getItem(LS_REMEMBER)
    return v === null ? true : v === "1"
  } catch {
    return true
  }
}

function writeRemember(v: boolean) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LS_REMEMBER, v ? "1" : "0")
  } catch {}
}

export const tokenStorage = {
  getAccess: () => getCookie(COOKIE_ACCESS),
  getRefresh: () => getCookie(COOKIE_REFRESH),
  getRememberMe: readRemember,

  save(accessToken: string, refreshToken: string, rememberMe?: boolean) {
    const remember = rememberMe ?? readRemember()
    if (rememberMe !== undefined) writeRemember(remember)
    const days = remember ? PERSISTENT_DAYS : undefined
    setCookie(COOKIE_ACCESS, accessToken, days)
    setCookie(COOKIE_REFRESH, refreshToken, days)
  },

  clear() {
    deleteCookie(COOKIE_ACCESS)
    deleteCookie(COOKIE_REFRESH)
    writeRemember(false)
  },
}
