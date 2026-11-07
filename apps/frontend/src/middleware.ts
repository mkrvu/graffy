import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_PAGES = new Set(["/login", "/register"])

export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get("refresh_token")?.value)
  const { pathname } = request.nextUrl

  if (pathname === "/") {
    return NextResponse.redirect(new URL(hasSession ? "/tasks" : "/login", request.url))
  }

  if (hasSession && AUTH_PAGES.has(pathname)) {
    return NextResponse.redirect(new URL("/tasks", request.url))
  }

  if (!hasSession && !AUTH_PAGES.has(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/tasks/:path*",
    "/profile/:path*",
    "/graph/:path*",
    "/habits/:path*",
    "/admin/:path*",
  ],
}
