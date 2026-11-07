"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"

interface IconProps {
  active: boolean
}

function TasksIcon({ active }: IconProps) {
  const circleFill = active ? "rgba(153,87,255,0.45)" : "#E5E5E5"
  const checkStroke = active ? "#9957FF" : "#A7A5A6"
  return (
    <svg width="30.78" height="30.78" viewBox="0 0 30.78 30.78" fill="none">
      <circle cx="15.39" cy="15.39" r="14.39" fill={circleFill} />
      <path
        d="M9.21 15.39 L13.5 19.31 L21.57 11.47"
        stroke={checkStroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BoardIcon({ active }: IconProps) {
  const color = active ? "#9957FF" : "#A7A5A6"
  const bg = active ? "rgba(153,87,255,0.35)" : "#E5E5E5"
  return (
    <svg width="30.78" height="30.78" viewBox="0 0 30.78 30.78" fill="none">
      {/* Three kanban columns */}
      <rect x="2" y="6" width="7" height="19" rx="2" fill={bg} />
      <rect x="12" y="6" width="7" height="13" rx="2" fill={color} />
      <rect x="22" y="6" width="7" height="16" rx="2" fill={bg} />
    </svg>
  )
}

function HabitsIcon({ active }: IconProps) {
  const light = active ? "rgba(153,87,255,0.35)" : "#E5E5E5"
  const dark = active ? "#9957FF" : "#A7A5A6"
  return (
    <svg width="30.78" height="30.78" viewBox="0 0 30.78 30.78" fill="none">
      <path d="M7.535 1.49 L14.26 13.58 L0.81 13.58 Z" fill={dark} />
      <rect x="16.56" y="0.82" width="13.42" height="13.42" rx="1.71" fill={light} />
      <rect x="0.81" y="16.54" width="13.42" height="13.42" rx="1.71" fill={light} />
      <circle cx="23.24" cy="23.25" r="6.71" fill={dark} />
    </svg>
  )
}

function GraphIcon({ active }: IconProps) {
  const main = active ? "#9957FF" : "#A7A5A6"
  const link = active ? "#CCABFF" : "#CFCDCE"
  return (
    <svg width="30.78" height="30.78" viewBox="0 0 30.78 30.78" fill="none">
      <line x1="9.8" y1="13.3" x2="20.8" y2="8.1" stroke={link} strokeWidth="2" strokeLinecap="round" />
      <line x1="9.8" y1="17.5" x2="20.8" y2="22.7" stroke={link} strokeWidth="2" strokeLinecap="round" />
      <circle cx="25" cy="6" r="4.5" fill={main} />
      <circle cx="25" cy="25" r="4.5" fill={main} />
      <circle cx="5.5" cy="15.4" r="4.5" fill={main} />
    </svg>
  )
}

function ProfileIcon({ active }: IconProps) {
  return (
    <svg width="30.78" height="30.78" viewBox="0 0 30.78 30.78" fill="none">
      <circle cx="15.78" cy="7.75" r="6.94" fill={active ? "rgba(153,87,255,0.45)" : "#E5E5E5"} />
      <ellipse cx="15.39" cy="23.04" rx="10.8" ry="6.94" fill={active ? "#9957FF" : "#A7A5A6"} />
    </svg>
  )
}

function AdminIcon({ active }: IconProps) {
  const fill = active ? "rgba(153,87,255,0.45)" : "#E5E5E5"
  const stroke = active ? "#9957FF" : "#A7A5A6"
  return (
    <svg width="30.78" height="30.78" viewBox="0 0 30.78 30.78" fill="none">
      <circle cx="15.39" cy="15.39" r="14.39" fill={fill} />
      <path
        d="M15.39 6.5 L22 9.5 V15 C22 19.5 18.5 22.5 15.39 23.8 C12.28 22.5 8.78 19.5 8.78 15 V9.5 Z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

const BASE_NAV_ITEMS = [
  { href: "/tasks", Icon: TasksIcon },
  { href: "/habits", Icon: HabitsIcon },
  { href: "/graph", Icon: GraphIcon },
  { href: "/profile", Icon: ProfileIcon },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const role = useAuthStore(s => s.user?.role)

  const navItems =
    role === "ADMIN"
      ? [...BASE_NAV_ITEMS, { href: "/admin", Icon: AdminIcon } as const]
      : BASE_NAV_ITEMS

  const activeIndex = navItems.findIndex(({ href }) =>
    pathname === href || pathname.startsWith(href + "/")
  )

  return (
    <nav className="fixed bottom-0 left-0 shrink-0 right-0 z-40 px-3 pb-3 safe-area-bottom">
      <div
        className="mx-auto relative flex items-center bg-bg"
        style={{
          maxWidth: 386,
          height: 65.14,
          borderRadius: 24,
          paddingTop: 6.57,
          paddingBottom: 6.57,
          paddingLeft: 6.57,
          paddingRight: 6.57,
        }}
      >
        {/* Перепрыгивающий задний фон активного пункта */}
        {activeIndex >= 0 && (
          <span
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              top: 6.57,
              bottom: 6.57,
              left: 6.57,
              width: `calc((100% - 13.14px) / ${navItems.length})`,
              transform: `translateX(${activeIndex * 100}%)`,
              borderRadius: 19.71,
              background: "rgba(153, 87, 255, 0.25)",
              transition: "transform 320ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        )}

        {navItems.map(({ href, Icon }, i) => {
          const active = i === activeIndex
          return (
            <Link
              key={href}
              href={href}
              className="relative z-10 flex-1 h-full flex items-center justify-center"
            >
              <Icon active={active} />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
