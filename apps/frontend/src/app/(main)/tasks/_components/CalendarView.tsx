"use client"

import { useRef, useState } from "react"
import { addDays, isSameDay, isToday, startOfWeek } from "date-fns"
import { useTaskStore } from "@/stores/taskStore"
import { useFilterStore, applyFilter } from "@/stores/filterStore"
import { cn } from "@/lib/utils"
import { BoardTaskItem } from "./BoardTaskItem"

const WEEKDAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
const noop = () => {}

export function CalendarView() {
  const { tasks, completeTask, uncompleteTask, deleteTask } = useTaskStore()
  const filter = useFilterStore()
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set())
  const [weekOffset, setWeekOffset] = useState(0)
  const [currentDay, setCurrentDay] = useState(new Date())

  const startX = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0]?.clientX ?? null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return
    const dx = (e.changedTouches[0]?.clientX ?? startX.current) - startX.current
    if (dx > 40) setWeekOffset(o => o - 1)
    else if (dx < -40) setWeekOffset(o => o + 1)
    startX.current = null
  }

  const handleToggle = (taskId: string, isCompleted: boolean) => {
    if (isCompleted) {
      uncompleteTask(taskId)
      return
    }
    completeTask(taskId)
    setFadingIds(prev => new Set(prev).add(taskId))
    setTimeout(() => {
      setFadingIds(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }, 600)
  }

  const weekStart = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const filtered = applyFilter(tasks, filter, fadingIds)
  const tasksForDay = (day: Date) => filtered.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day))
  const dayTasks = tasksForDay(currentDay)

  return (
    <div className="flex flex-col gap-5 pt-1 pb-28">
      <div className="bg-accent rounded-[33px] p-6 select-none" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="flex items-center justify-between">
          {days.map(day => {
            const has = tasksForDay(day).length > 0
            const activeClass = isSameDay(currentDay, day)

            let circleClass = "border-[#B281FF]"
            if (activeClass) circleClass = "bg-[#DDA2FF] border-[#DDA2FF]"
            else if (!has) circleClass = "border-[#B281FF] opacity-40"

            return (
              <div key={day.toISOString()} className="flex flex-col items-center gap-1.5">
                <span className={cn("text-sm font-medium", activeClass ? "text-white" : "text-accent-light")}>
                  {WEEKDAYS[day.getDay()]}
                </span>
                <div
                  onClick={() => setCurrentDay(day)}
                  className={cn(
                    "w-[33px] h-[33px] rounded-[16px] flex items-center cursor-pointer justify-center border-2 transition-colors",
                    circleClass,
                  )}
                >
                  <span className="text-[13px] font-medium text-white">{day.getDate()}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {dayTasks.map(day => {
          return (
            <div key={day.id} className="flex flex-col gap-1">
              <div className="flex flex-col">
                {dayTasks.map(task => (
                  <div key={task.id} style={{ borderTop: "1px solid var(--task-divider)" }}>
                    <BoardTaskItem
                      task={task}
                      sectionId=""
                      isDraggingThis={false}
                      onToggle={() => handleToggle(task.id, task.isCompleted)}
                      onDelete={() => deleteTask(task.id)}
                      onDragStart={noop}
                      onDrag={noop}
                      onDragStop={noop}
                      href={`/tasks/${task.id}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex-1" />
    </div>
  )
}
