"use client"

import { useEffect, useRef, useState } from "react"
import { useTaskStore } from "@/stores/taskStore"
import { useFilterStore, applyFilter } from "@/stores/filterStore"
import { BoardTaskItem } from "./BoardTaskItem"

const noop = () => {}

export function ListView() {
  const { tasks, loadMore, hasMore, isLoading, completeTask, uncompleteTask, deleteTask } = useTaskStore()
  const filter = useFilterStore()
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set())
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return
    const io = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) loadMore()
      },
      { rootMargin: "400px 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, isLoading, loadMore])

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

  const allTasks = applyFilter(tasks, filter, fadingIds)

  return (
    <div className="flex flex-col gap-4 pt-1 pb-8">
      <div className="flex flex-col">
        {allTasks.map(task => (
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

      <div ref={loadMoreRef} className="h-px" aria-hidden />
      {hasMore && isLoading && <div className="flex justify-center py-4 text-xs text-tertiary">Загружаем ещё…</div>}
      <div className="flex-1" />
    </div>
  )
}
