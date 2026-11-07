"use client"

import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { useRouter } from "next/navigation"
import { useTaskStore } from "@/stores/taskStore"
import { useSectionStore } from "@/stores/sectionStore"
import { useSphereStore } from "@/stores/sphereStore"
import { useFilterStore, applyFilter } from "@/stores/filterStore"
import { useAuthStore } from "@/stores/authStore"
import { XPBar } from "@/components"
import { AddSectionSheet } from "./_components/AddSectionSheet"
import { ConfirmSheet } from "./_components/ConfirmSheet"
import { BoardTaskItem } from "./_components/BoardTaskItem"
import { ListView } from "./_components/ListView"
import { CalendarView } from "./_components/CalendarView"
import { IconFilter, IconTrash, IconPlus, IconSection } from "./_components/icons"

export default function TasksPage() {
  const router = useRouter()
  const {
    tasks,
    fetchTasks,
    loadMore,
    hasMore,
    isLoading,
    completeTask,
    uncompleteTask,
    updateTask,
    moveTaskSection,
    deleteTask,
  } = useTaskStore()
  const { sections, fetchSections, createSection, deleteSection } = useSectionStore()
  const { fetchSpheres } = useSphereStore()
  const { user, fetchUser } = useAuthStore()

  useEffect(() => {
    fetchTasks()
    fetchSections()
    fetchSpheres()
  }, [fetchTasks, fetchSections, fetchSpheres])

  useEffect(() => {
    if (restoredRef.current || sections.length === 0) return
    const saved = sessionStorage.getItem("tasksSectionIdx")
    if (!saved) return
    const idx = parseInt(saved, 10)
    sessionStorage.removeItem("tasksSectionIdx")
    if (idx > 0) {
      const el = scrollRef.current
      if (el) {
        el.scrollTo({ left: idx * el.offsetWidth, behavior: "instant" })
        setCurrentIdx(idx)
      }
    }
    restoredRef.current = true
  }, [sections])

  useEffect(() => {
    fetchUser()
  }, [completeTask, tasks])

  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const restoredRef = useRef(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // XP-плашка живёт независимо в fixed-слое наверху. Контент сдвигаем вниз на её высоту.
  const xpBarRef = useRef<HTMLDivElement>(null)
  const [xpBarHeight, setXpBarHeight] = useState(0)
  useLayoutEffect(() => {
    if (!xpBarRef.current) return
    setXpBarHeight(xpBarRef.current.offsetHeight)
    const ro = new ResizeObserver(() => {
      if (xpBarRef.current) setXpBarHeight(xpBarRef.current.offsetHeight)
    })
    ro.observe(xpBarRef.current)
    return () => ro.disconnect()
  }, [user])

  // Пагинация — только для дефолтного списка, сентинел внутри его слайда.
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

  // Строка фильтра — обычный контент в самом верху списка. По умолчанию каждый слайд
  // проскроллен вниз ровно на её высоту, поэтому строка спрятана над краем и появляется,
  // только когда долистываешь список до самого верха (как строка историй в ТГ).
  const slideEls = useRef<Set<HTMLDivElement>>(new Set())
  const initedSlides = useRef<WeakSet<HTMLDivElement>>(new WeakSet())
  const registerSlide = (el: HTMLDivElement | null) => {
    if (el) slideEls.current.add(el)
  }
  useEffect(() => {
    slideEls.current.forEach(el => {
      if (initedSlides.current.has(el)) return
      const header = el.querySelector<HTMLElement>("[data-filter-header]")
      if (!header) return
      const offset = header.offsetHeight + 16 // высота строки (с её верхним отступом) + gap слайда
      if (el.scrollHeight - el.clientHeight < offset) return // список короткий — скрывать нечем
      el.scrollTop = offset
      initedSlides.current.add(el)
    })
  }, [tasks.length, sections.length])

  const [showAddSection, setShowAddSection] = useState(false)
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const justDraggedRef = useRef(false)
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoScrollDirRef = useRef<"left" | "right" | null>(null)

  // В режиме «Разделы» дефолтного (бессекционного) слайда нет: слайды = разделы + «добавить раздел».
  const totalPages = sections.length + 1
  // Каждый слайд чуть уже контейнера — справа торчит кромка следующего слайда (peek),
  // чтобы юзеру было понятно: можно свайпать вбок. Add-section слайд оставляем 100% (он
  // последний и за ним ничего нет).
  const SLIDE_PEEK = 28
  const itemWidth = () =>
    (scrollRef.current?.offsetWidth ?? window.innerWidth) - SLIDE_PEEK

  const handleCarouselScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / itemWidth())
    if (idx >= 0 && idx < totalPages) setCurrentIdx(idx)
  }

  const stopAutoScroll = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current)
    autoScrollRef.current = null
    autoScrollDirRef.current = null
  }

  const startAutoScroll = (direction: "left" | "right") => {
    if (autoScrollDirRef.current === direction) return
    if (autoScrollRef.current) clearInterval(autoScrollRef.current)
    autoScrollDirRef.current = direction

    const tick = () => {
      const el = scrollRef.current
      if (!el) return
      const w = itemWidth()
      const targetIdx =
        direction === "right"
          ? Math.min(sections.length - 1, Math.round(el.scrollLeft / w) + 1)
          : Math.max(0, Math.round(el.scrollLeft / w) - 1)
      el.scrollTo({ left: targetIdx * w, behavior: "smooth" })
      setCurrentIdx(targetIdx)
    }

    tick()
    autoScrollRef.current = setInterval(tick, 700)
  }

  const handleDrag = (e: TouchEvent) => {
    const clientX = e.touches[0]?.clientX
    if (clientX == null) return
    const vw = window.innerWidth
    const edgeZone = vw * 0.15
    if (clientX < edgeZone) startAutoScroll("left")
    else if (clientX > vw - edgeZone) startAutoScroll("right")
    else stopAutoScroll()
  }

  const handleDragStop = (taskId: string, currentSectionId: string | undefined) => {
    stopAutoScroll()
    const el = scrollRef.current
    if (el) {
      const landedIdx = Math.round(el.scrollLeft / itemWidth())
      const targetSectionId = sections[landedIdx]?.id ?? null
      const currentId = currentSectionId === "default" ? null : (currentSectionId ?? null)
      if (targetSectionId !== currentId) {
        moveTaskSection(taskId, targetSectionId)
      }
    }
    setDraggingId(null)
    justDraggedRef.current = true
    setTimeout(() => {
      justDraggedRef.current = false
    }, 300)
  }

  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set())

  const handleToggle = (taskId: string, isCompleted: boolean) => {
    if (isCompleted) {
      uncompleteTask(taskId)
    } else {
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
  }

  const filter = useFilterStore()

  // Фильтр живёт ВНЕ скролл-контейнера. По дефолту скрыт (height: 0). Появляется только
  // когда юзер у самого верха списка и продолжает тянуть вниз (overscroll-пулл) — не от
  // обычного скролла. Скрывается сам, когда юзер начинает скроллить вниз.
  const contentRef = useRef<HTMLDivElement>(null)
  const [filterRevealed, setFilterRevealed] = useState(false)
  const pullStartYRef = useRef<number | null>(null)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (filterRevealed && e.currentTarget.scrollTop > 20) setFilterRevealed(false)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    pullStartYRef.current = e.touches[0]?.clientY ?? null
  }
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (pullStartYRef.current === null) return
    const dy = (e.touches[0]?.clientY ?? 0) - pullStartYRef.current
    const atTop = e.currentTarget.scrollTop <= 0

    if (filterRevealed) {
      // UP-свайп у верха списка — скрываем фильтр.
      if (atTop && dy < -40) {
        setFilterRevealed(false)
        pullStartYRef.current = null
      }
      return
    }

    // Не у верха → обычный скролл, нас не интересует.
    if (!atTop) {
      pullStartYRef.current = null
      return
    }
    // DOWN-свайп у верха — показываем фильтр.
    if (dy > 60) {
      setFilterRevealed(true)
      pullStartYRef.current = null
    }
  }
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const atTop = e.currentTarget.scrollTop <= 0
    if (!filterRevealed && atTop && e.deltaY < -50) {
      setFilterRevealed(true)
    } else if (filterRevealed && atTop && e.deltaY > 50) {
      setFilterRevealed(false)
    }
  }

  // При смене вида прячем фильтр заново.
  useEffect(() => {
    setFilterRevealed(false)
  }, [filter.viewMode])

  // Высота слайда = весь экран минус верхний бар приложения и нижний nav.
  const slideStyle: React.CSSProperties = {
    width: `calc(100% - ${SLIDE_PEEK}px)`,
    flexShrink: 0,
    scrollSnapAlign: "start",
    overflowY: "auto",
    // Снап у верха: строка фильтра и начало контента — точки привязки. При лёгком
    // скролле вниз список доснапится так, что строка спрячется (как истории в ТГ).
    scrollSnapType: "y proximity",
    height: "100%",
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 32,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  }

  return (
    // Внешний контейнер не скроллится — каждый слайд скроллится сам по себе.
    <>
      {/* XP-плашка в отдельном fixed-слое — не зависит ни от какого скролла страницы. */}
      <div
        ref={xpBarRef}
        className="fixed top-0 left-0 right-0 z-50 bg-app"
      >
        <div className="max-w-lg mx-auto pt-4 px-5 pb-2">
          {user && <XPBar user={user} />}
        </div>
      </div>

    <div
      className="flex flex-col"
      style={{
        height: `calc(100svh - 10px - ${xpBarHeight}px)`,
        marginTop: xpBarHeight,
        overscrollBehavior: "contain",
      }}
    >

      <div className="flex-1 min-h-0 relative">
        <div
          className="absolute top-0 left-0 right-0 z-10 pointer-events-none transition-transform duration-300 ease-out"
          style={{ transform: filterRevealed ? "translateY(0)" : "translateY(-100%)" }}
        >
          <div className="px-5 pt-2 pb-2 flex items-center justify-between bg-app">
            <button
              className="pointer-events-auto w-[40px] h-[40px] flex items-center justify-center rounded-[5px]"
              style={{ background: "var(--filter-btn-bg)" }}
              aria-label="Фильтр"
              onClick={() => router.push(`/tasks/filter`)}
            >
              <IconFilter />
            </button>
            <div />
          </div>
        </div>

      <div
        ref={contentRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onWheel={handleWheel}
        className="h-full overflow-y-auto px-5"
        style={{
          overscrollBehavior: "contain",
          paddingTop: filter.viewMode === "list" || filter.viewMode === "calendar"
            ? (filterRevealed ? 56 : 0)
            : 0,
          transition: "padding-top 300ms ease-out",
        }}
      >
        {filter.viewMode === "list" && <ListView />}
        {filter.viewMode === "calendar" && <CalendarView />}

        {filter.viewMode === "board" && (
          <div
            ref={scrollRef}
            className="flex h-full -mx-5"
            style={{
              overflowX: "scroll",
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
              paddingTop: filterRevealed ? 56 : 0,
              transition: "padding-top 300ms ease-out",
            }}
            onScroll={handleCarouselScroll}
          >
            {/* Section pages */}
            {sections.map(sec => {
              const secTasks = applyFilter(
                tasks.filter(t => t.sectionId === sec.id),
                filter,
                fadingIds,
              )
              return (
                <div
                  key={sec.id}
                  ref={registerSlide}
                  style={slideStyle}
                  onScroll={handleScroll}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onWheel={handleWheel}
                >
                  <div
                    className="flex items-center justify-between gap-4"
                    style={{ scrollSnapAlign: "start", paddingTop: 8 }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-[15px] font-medium capitalize text-primary">{sec.name}</span>
                      {secTasks.length > 0 && (
                        <span className="text-[15px] font-medium text-tertiary">{secTasks.length}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeleteSectionId(sections[currentIdx]!.id)}
                      className="w-[40px] h-[40px] flex items-center justify-center text-tertiary active:opacity-50"
                      aria-label="Удалить раздел"
                    >
                      <IconTrash />
                    </button>
                  </div>

                  <div className="flex flex-col">
                    {secTasks.map(task => (
                      <div key={task.id} style={{ borderTop: "1px solid var(--task-divider)" }}>
                        <BoardTaskItem
                          task={task}
                          sectionId={sec.id}
                          isDraggingThis={draggingId === task.id}
                          onToggle={() => handleToggle(task.id, task.isCompleted)}
                          onDelete={() => deleteTask(task.id)}
                          onDragStart={() => setDraggingId(task.id)}
                          onDrag={e => handleDrag(e)}
                          onDragStop={() => handleDragStop(task.id, task.sectionId)}
                          href={`/tasks/${task.id}`}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.setItem("tasksSectionIdx", String(currentIdx))
                      router.push(`/tasks/new?section=${sec.id}`)
                    }}
                    className="flex items-center w-full max-w-[373px] mx-auto gap-2 rounded-[46px] active:opacity-80 transition-opacity"
                    style={{ background: "var(--btn-accent)", height: 56, paddingLeft: 20, paddingRight: 20 }}
                  >
                    <div
                      className="flex items-center justify-center rounded-full flex-shrink-0"
                      style={{ width: 35, height: 34, border: "1.5px solid white" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                        <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-white text-sm font-semibold">Добавить задачу</span>
                  </button>

                  <div className="flex-1" />
                </div>
              )
            })}

            {/* Add section slide */}
            <div
              className="flex-shrink-0 flex items-start pt-16 justify-center"
              style={{ width: "100%", scrollSnapAlign: "start", paddingLeft: 20, paddingRight: 20 }}
            >
              <button
                onClick={() => setShowAddSection(true)}
                className="w-full max-w-[373px] h-14 rounded-[46px] flex items-center justify-center gap-2 text-white text-sm font-semibold active:opacity-80 transition-opacity"
                style={{ background: "var(--btn-accent)" }}
              >
                <IconSection />
                Добавить раздел
              </button>
            </div>
          </div>
        )}
      </div>
      </div>

      {filter.viewMode !== "board" && (
        <div className="fixed bottom-[90px] left-0 right-0 max-w-lg mx-auto z-30 pointer-events-none">
          <button
            onClick={() => router.push(`/tasks/new`)}
            className="absolute right-5 bottom-0 w-[59px] h-[59px] rounded-full flex items-center justify-center active:scale-95 transition-transform duration-150 pointer-events-auto"
            style={{ background: "linear-gradient(90deg, #D7BEFF 0%, #9957FF 100%)" }}
            aria-label="Добавить задачу"
          >
            <IconPlus size={20} />
          </button>
        </div>
      )}

      {deleteSectionId && (
        <ConfirmSheet
          title="Удалить раздел?"
          description="Задачи из раздела останутся в общем списке."
          confirmLabel="Удалить"
          onConfirm={() => {
            deleteSection(deleteSectionId)
            setCurrentIdx(i => Math.max(0, i - 1))
            setDeleteSectionId(null)
          }}
          onCancel={() => setDeleteSectionId(null)}
        />
      )}

      {showAddSection && (
        <AddSectionSheet
          onSubmit={async name => {
            // Без дефолтного слайда новый раздел встаёт на индекс = текущее число разделов.
            const newIdx = sections.length
            await createSection(name)
            setShowAddSection(false)
            const el = scrollRef.current
            if (el) {
              el.scrollTo({ left: newIdx * el.offsetWidth, behavior: "smooth" })
              setCurrentIdx(newIdx)
            }
          }}
          onClose={() => setShowAddSection(false)}
        />
      )}
    </div>
    </>
  )
}
