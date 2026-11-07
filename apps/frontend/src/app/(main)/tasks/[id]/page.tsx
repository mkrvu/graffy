"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { useTaskStore } from "@/stores/taskStore"
import { useSphereStore } from "@/stores/sphereStore"
import { TaskDifficulty } from "@/types"
import { cn } from "@/lib/utils"
import { BackTo } from "@/components"
import { CloseIcon } from "../_components/icons"
import { SingleDatePicker } from "../_components/DatePicker"
import { Emoji } from "emoji-picker-react"
import { DIFFICULTY_ICON, DIFF_LABEL } from "../_components/difficulty"
import { DifficultyPicker } from "../_components/DifficultyPicker"

const DIFFICULTIES: TaskDifficulty[] = ["TRIVIAL", "EASY", "MEDIUM", "HARD"]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = String(d.getFullYear()).slice(-2)
  return `${day}.${month}.${year}`
}

interface FormValues {
  title: string
  description: string
  difficulty: TaskDifficulty
  sphereId: string
  dueDate: string
}

export default function EditTaskPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const { tasks, getTaskById, updateTask, deleteTask } = useTaskStore()
  const { spheres, fetchSpheres } = useSphereStore()
  const [task, setTask] = useState(tasks.find(t => t.id === id))

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
      dueDate: "",
    },
  })

  useEffect(() => {
    if (!task) {
      getTaskById(id).then(t => {
        if (t) setTask(t)
      })
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? "",
        difficulty: task.difficulty,
        sphereId: task.sphereId ?? "",
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      })
    }
  }, [task, reset])

  useEffect(() => {
    fetchSpheres()
  }, [fetchSpheres])

  const dueDate = watch("dueDate")
  const sphereId = watch("sphereId")
  const [showCal, setShowCal] = useState(false)

  const onSubmit = async (data: FormValues) => {
    await updateTask(id, {
      title: data.title.trim(),
      description: data.description.trim() || undefined,
      difficulty: data.difficulty,
      dueDate: data.dueDate || undefined,
      sphereId: data.sphereId || undefined,
    })
    router.back()
  }

  const handleDelete = async () => {
    await deleteTask(id)
    router.back()
  }

  return (
    <>
      <div
        className="flex-1 flex flex-col pb-[46px] overflow-y-auto"
        style={{
          borderRadius: "53px 53px 0 0",
          background: "var(--bg)",
          paddingLeft: 21,
          paddingRight: 22,
          paddingTop: 16,
          gap: 48,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="flex flex-col gap-8">
          <BackTo onClickFn={() => router.back()} />

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* Title + Description */}
            <div className="flex flex-col gap-2">
              <input
                {...register("title", { required: true })}
                placeholder={task?.title}
                autoFocus
                className="w-full rounded-[16.62px] border text-primary bg-bg font-medium text-sm placeholder:text-tertiary outline-none focus:border-accent transition-colors duration-150"
                style={{ borderColor: "var(--input-border)", padding: "17.25px 22px", borderWidth: 1.15 }}
              />
              <input
                {...register("description")}
                placeholder={task?.description ?? "Описание задачи"}
                className="w-full rounded-[16.62px] border text-primary bg-bg font-medium text-sm placeholder:text-tertiary outline-none focus:border-accent transition-colors duration-150"
                style={{ borderColor: "var(--input-border)", padding: "17.25px 22px", borderWidth: 1.15 }}
              />
            </div>

            {/* Difficulty */}
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

            {/* Sphere */}
            {spheres.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-primary">Сфера</span>
                <div className="flex flex-wrap items-center gap-2">
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

            {/* Deadline */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-primary">Дедлайн</span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCal(v => !v)}
                  className="w-full flex items-center justify-between rounded-[16.62px] border bg-bg"
                  style={{
                    borderColor: showCal ? "#9957FF" : "var(--input-border)",
                    height: 63,
                    padding: "0 18px 0 22px",
                    borderWidth: 1.15,
                  }}
                >
                  <span className={cn("text-sm font-medium", dueDate ? "text-primary" : "text-tertiary")}>
                    {dueDate ? formatDate(dueDate) : "Нет"}
                  </span>
                  {dueDate && (
                    <span
                      className="text-tertiary active:opacity-50 p-1"
                      onClick={e => {
                        e.stopPropagation()
                        setValue("dueDate", "")
                        setShowCal(false)
                      }}
                    >
                      <CloseIcon />
                    </span>
                  )}
                  {!dueDate && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={cn("text-tertiary duration-300", showCal && "rotate-180")}
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                    >
                      <path
                        d="M2.58752 7.74707L8.73157 11.2944L14.8757 7.74707"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
                {showCal && (
                  <SingleDatePicker
                    value={dueDate}
                    onChange={v => setValue("dueDate", v)}
                    onClose={() => setShowCal(false)}
                  />
                )}
              </div>
            </div>

            {/* Save */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center rounded-[52px] active:opacity-80 transition-opacity"
              style={{
                background: "linear-gradient(90deg, #D7BEFF 0%, #9957FF 100%)",
                padding: "21px 22.5px",
                marginTop: 16,
              }}
            >
              <span className="text-white font-medium" style={{ fontSize: 18 }}>
                Сохранить
              </span>
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={handleDelete}
              className="w-full flex items-center justify-center rounded-[52px] active:opacity-80 transition-opacity"
              style={{ border: "1.5px solid #F34D64", padding: "21px 22.5px" }}
            >
              <span className="font-medium" style={{ fontSize: 18, color: "#F34D64" }}>
                Удалить задачу
              </span>
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
