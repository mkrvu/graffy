import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Inter } from "next/font/google"

export const metadata: Metadata = {
  title: "GRAFFY — Геймифицированный трекер",
  description: "Трекер задач и привычек с системой прокачки",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#7C3AED",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["300", "400", "500", "600", "700"],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.className} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Synchronously apply saved theme before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-app">{children}</body>
    </html>
  )
}
