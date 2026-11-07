"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import EmojiPicker, { Emoji, type EmojiClickData, Theme } from "emoji-picker-react"
import { BackTo, GradientButton } from "@/components"
import { useThemeStore } from "@/stores/themeStore"
import { useSphereStore } from "@/stores/sphereStore"
import { cn } from "@/lib/utils"
import { SpherePill } from "./SpherePill"

export function SpheresSettings() {
  const router = useRouter()
  const { theme } = useThemeStore()
  const { spheres, isLoading, fetchSpheres, addSphere, removeSphere } = useSphereStore()

  const [unified, setUnified] = useState("")
  const [name, setName] = useState("")
  const [adding, setAdding] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  const pickerRef = useRef<HTMLDivElement>(null)
  const emojiButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    fetchSpheres()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        !emojiButtonRef.current?.contains(e.target as Node)
      ) {
        setPickerOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const canAdd = unified.length > 0 && name.trim().length > 0

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canAdd) return
    setAdding(true)
    try {
      await addSphere(name.trim(), unified)
      setUnified("")
      setName("")
    } catch {
      // error handled in store
    } finally {
      setAdding(false)
    }
  }

  const handleEmojiClick = (data: EmojiClickData) => {
    setUnified(data.unified)
    setPickerOpen(false)
  }

  return (
    <div className="w-full flex flex-col gap-8 py-4 pl-[21px] pr-[22px]">
      <BackTo onClickFn={() => router.back()} />

      <div className="flex flex-col gap-8">
        <h1 className="text-2xl font-medium text-primary">Сферы</h1>

        <div className="flex flex-wrap gap-[4.58px]">
          {spheres.map(sphere => (
            <SpherePill
              key={sphere.id}
              unified={sphere.emoji}
              name={sphere.name}
              onRemove={() => removeSphere(sphere.id)}
            />
          ))}
        </div>

        <form onSubmit={handleAdd} className="flex flex-col gap-6 pt-8">
          <div className="flex gap-2 items-stretch">
            <div className="relative">
              <button
                ref={emojiButtonRef}
                type="button"
                onClick={() => setPickerOpen(v => !v)}
                className={cn(
                  "w-[63px] h-[63px] shrink-0",
                  "bg-input border border-input rounded-[16.62px]",
                  "flex items-center justify-center",
                  "outline-none transition-colors duration-150",
                  pickerOpen ? "border-accent" : "hover:border-accent",
                )}
              >
                {unified && <Emoji unified={unified} size={28} />}
              </button>

              {pickerOpen && (
                <div ref={pickerRef} className="absolute left-0 top-[71px] z-50">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                    width={300}
                    height={380}
                    searchPlaceholder="Поиск..."
                    previewConfig={{ showPreview: false }}
                  />
                </div>
              )}
            </div>

            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Название сферы"
              className={cn(
                "flex-1 bg-input border border-input rounded-[16.62px]",
                "py-[17px] px-[22px]",
                "text-primary font-medium text-sm",
                "placeholder:text-tertiary",
                "outline-none focus:border-accent transition-colors duration-150",
              )}
            />
          </div>

          <GradientButton type="submit" isActive={canAdd && !adding} isLoading={adding} loadingText="Добавление...">
            Добавить новую сферу
          </GradientButton>
        </form>
      </div>
    </div>
  )
}
