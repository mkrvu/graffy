"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import EmojiPicker, { Emoji, type EmojiClickData, Theme } from "emoji-picker-react"
import { useHabitStore } from "@/stores/habitStore"
import { useSphereStore } from "@/stores/sphereStore"
import { useThemeStore } from "@/stores/themeStore"
import { HabitDifficulty, HabitFrequency } from "@/types"
import { BackTo } from "@/components"
import { CircleIcon, TriangleIcon, SquareIcon, RhombusIcon, CalendarIcon } from "../../tasks/_components/icons"
import { SingleDatePicker, fmt } from "../../tasks/_components/DatePicker"
import { DifficultyPicker } from "../../tasks/_components/DifficultyPicker"
import { cn } from "@/lib/utils"

const DIFFICULTY_ICON: Record<HabitDifficulty, React.ComponentType<{ color?: string }>> = {
  TRIVIAL: CircleIcon,
  EASY: TriangleIcon,
  MEDIUM: SquareIcon,
  HARD: RhombusIcon,
}

const DIFFICULTIES: HabitDifficulty[] = ["TRIVIAL", "EASY", "MEDIUM", "HARD"]

const DIFF_LABEL: Record<HabitDifficulty, string> = {
  TRIVIAL: "Пустяк",
  EASY: "Легко",
  MEDIUM: "Среднее",
  HARD: "Сложно",
}

const FREQUENCIES: { value: HabitFrequency; label: string }[] = [
  { value: "DAILY", label: "Ежедневная" },
  { value: "WEEKLY", label: "Еженедельная" },
  { value: "MONTHLY", label: "Ежемесячная" },
]

interface FormValues {
  title: string
  description: string
  difficulty: HabitDifficulty
  sphereId: string
  goalAmount: string
  goalUnit: string
  frequency: HabitFrequency
  startDate: string
  endDate: string
}

const INPUT_CLS =
  "w-full rounded-[16.62px] border border-input text-primary bg-input font-medium text-sm placeholder:text-tertiary outline-none focus:border-accent transition-colors duration-150"

export default function HabitFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")

  const { theme } = useThemeStore()
  const { habits, fetchHabits, createHabit, updateHabit } = useHabitStore()
  const { spheres, fetchSpheres } = useSphereStore()

  const editing = editId ? habits.find(h => h.id === editId) : undefined

  const [emoji, setEmoji] = useState("")
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const emojiButtonRef = useRef<HTMLButtonElement>(null)

  const [showStart, setShowStart] = useState(false)
  const [showEnd, setShowEnd] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      difficulty: "TRIVIAL",
      sphereId: "",
      goalAmount: "",
      goalUnit: "",
      frequency: "DAILY",
      startDate: "",
      endDate: "",
    },
  })

  const sphereId = watch("sphereId")
  const title = watch("title")
  const startDate = watch("startDate")
  const endDate = watch("endDate")
  const datesValid = !startDate || !endDate || startDate <= endDate
  const canSubmit = title.trim().length > 0 && datesValid

  useEffect(() => {
    fetchSpheres()
    if (editId && habits.length === 0) fetchHabits()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Предзаполнение формы при редактировании (один раз, когда привычка загрузилась).
  const prefilled = useRef(false)
  useEffect(() => {
    if (!editing || prefilled.current) return
    prefilled.current = true
    reset({
      title: editing.title,
      description: editing.description ?? "",
      difficulty: editing.difficulty,
      sphereId: editing.sphereId,
      goalAmount: editing.goalAmount != null ? String(editing.goalAmount) : "",
      goalUnit: editing.goalUnit ?? "",
      frequency: editing.frequency,
      startDate: editing.startDate ? editing.startDate.slice(0, 10) : "",
      endDate: editing.endDate ? editing.endDate.slice(0, 10) : "",
    })
    setEmoji(editing.emoji ?? "")
  }, [editing, reset])

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

  const handleEmojiClick = (data: EmojiClickData) => {
    setEmoji(data.unified)
    setPickerOpen(false)
  }

  const onSubmit = async (data: FormValues) => {
    if (!data.title.trim()) return
    const payload = {
      sphereId: data.sphereId || undefined,
      title: data.title.trim(),
      description: data.description.trim() || undefined,
      difficulty: data.difficulty,
      emoji: emoji || undefined,
      frequency: data.frequency,
      goalAmount: data.goalAmount ? Number(data.goalAmount) : undefined,
      goalUnit: data.goalUnit.trim() || undefined,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
    }
    try {
      if (editing) {
        await updateHabit(editing.id, payload)
      } else {
        await createHabit(payload)
      }
      router.back()
    } catch {
      // ошибка обработана в сторе
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div
        className="flex-1 flex flex-col pb-[46px] overflow-y-auto"
        style={{ paddingLeft: 21, paddingRight: 22, paddingTop: 16, gap: 48 }}
      >
        <div className="flex flex-col gap-8">
          <BackTo onClickFn={() => router.back()} />

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* Эмодзи + Название */}
            <div className="flex gap-2 items-stretch">
              <div className="relative">
                <button
                  ref={emojiButtonRef}
                  type="button"
                  onClick={() => setPickerOpen(v => !v)}
                  className={`w-[63px] h-[63px] shrink-0 bg-input border rounded-[16.62px] flex items-center justify-center outline-none transition-colors duration-150 ${
                    pickerOpen ? "border-accent" : "border-input hover:border-accent"
                  }`}
                >
                  {emoji && <Emoji unified={emoji} size={28} />}
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
                {...register("title", { required: true })}
                placeholder="Название привычки"
                autoFocus
                className={INPUT_CLS}
                style={{ padding: "17px 22px" }}
              />
            </div>

            {/* Описание */}
            <input
              {...register("description")}
              placeholder="Описание"
              className={INPUT_CLS}
              style={{ padding: "17px 22px" }}
            />

            {/* Цель: число + единица (пустышки) + частота — три равных по ширине поля */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-primary">Цель</span>
              <div className="grid grid-cols-3 gap-3">
                <input
                  {...register("goalAmount")}
                  type="number"
                  min={0}
                  placeholder="1"
                  className={cn(INPUT_CLS, "text-center")}
                  style={{ padding: "17px 12px" }}
                />
                <input
                  {...register("goalUnit")}
                  placeholder="Км"
                  className={INPUT_CLS}
                  style={{ padding: "17px 14px" }}
                />
                <div className="relative">
                  <select
                    {...register("frequency")}
                    className={cn(INPUT_CLS, "appearance-none cursor-pointer pr-9")}
                    style={{ padding: "17px 14px" }}
                  >
                    {FREQUENCIES.map(f => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
                      <path
                        d="M1 1.5L6 6.5L11 1.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Сложность */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-primary">Сложность</span>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <DifficultyPicker
                    value={field.value}
                    onChange={field.onChange}
                    options={DIFFICULTIES}
                    labels={DIFF_LABEL}
                    icons={DIFFICULTY_ICON}
                  />
                )}
              />
            </div>

            {/* Сфера — опционально */}
            {spheres.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-primary">Сфера</span>
                <div className="flex flex-wrap gap-2">
                  {spheres.map(sphere => {
                    const active = sphereId === sphere.id
                    return (
                      <button
                        key={sphere.id}
                        type="button"
                        onClick={() => setValue("sphereId", active ? "" : sphere.id)}
                        className="active:opacity-70 transition-opacity"
                        style={
                          active
                            ? {
                                height: 42,
                                borderRadius: 30,
                                border: "1.5px solid #9957FF",
                                background: "transparent",
                                padding: 4,
                                display: "flex",
                                alignItems: "stretch",
                              }
                            : {
                                height: 34,
                                borderRadius: 30,
                                background: "rgba(153,87,255,0.25)",
                                padding: "0 13px",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }
                        }
                      >
                        {active ? (
                          <span
                            style={{
                              background: "#9957FF",
                              borderRadius: 26,
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "0 12px",
                              flex: 1,
                            }}
                          >
                            <Emoji unified={sphere.emoji} size={14} />
                            <span style={{ color: "white", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                              {sphere.name}
                            </span>
                          </span>
                        ) : (
                          <>
                            <Emoji unified={sphere.emoji} size={14} />
                            <span style={{ color: "#9957FF", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                              {sphere.name}
                            </span>
                          </>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Дата начала и окончания — два отдельных календаря */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-primary">Дата начала и окончания</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStart(v => !v)
                      setShowEnd(false)
                    }}
                    className="w-full flex items-center justify-between rounded-[16.62px] border bg-input"
                    style={{
                      borderColor: showStart ? "#9957FF" : "var(--input-border)",
                      height: 63,
                      padding: "0 16px 0 18px",
                      borderWidth: 1.15,
                    }}
                  >
                    <span className={cn("text-sm font-medium", startDate ? "text-primary" : "text-tertiary")}>
                      {startDate ? fmt(new Date(startDate)) : "Начало"}
                    </span>
                    <CalendarIcon />
                  </button>
                  {showStart && (
                    <SingleDatePicker
                      value={startDate}
                      onChange={v => {
                        setValue("startDate", v)
                        if (v && endDate && v > endDate) setValue("endDate", "")
                      }}
                      onClose={() => setShowStart(false)}
                      maxDate={endDate ? new Date(endDate) : undefined}
                    />
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEnd(v => !v)
                      setShowStart(false)
                    }}
                    className="w-full flex items-center justify-between rounded-[16.62px] border bg-input"
                    style={{
                      borderColor: showEnd ? "#9957FF" : "var(--input-border)",
                      height: 63,
                      padding: "0 16px 0 18px",
                      borderWidth: 1.15,
                    }}
                  >
                    <span className={cn("text-sm font-medium", endDate ? "text-primary" : "text-tertiary")}>
                      {endDate ? fmt(new Date(endDate)) : "Окончание"}
                    </span>
                    <CalendarIcon />
                  </button>
                  {showEnd && (
                    <SingleDatePicker
                      value={endDate}
                      onChange={v => setValue("endDate", v)}
                      onClose={() => setShowEnd(false)}
                      placement="top-right"
                      minDate={startDate ? new Date(startDate) : undefined}
                    />
                  )}
                </div>
              </div>
              {!datesValid && (
                <span className="text-xs font-medium text-[#FF4D4F]">
                  Дата окончания не может быть раньше даты начала
                </span>
              )}
            </div>

            {/* Сабмит */}
            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="w-full flex items-center justify-center rounded-[52px] active:opacity-80 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(90deg, #D7BEFF 0%, #9957FF 100%)",
                padding: "21px 22.5px",
                marginTop: 16,
              }}
            >
              <span className="text-white font-medium" style={{ fontSize: 18 }}>
                {editing ? "Сохранить" : "Создать"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
