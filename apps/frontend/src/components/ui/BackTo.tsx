import { cn } from "@/lib/utils"

export const BackTo = ({ onClickFn, className }: { onClickFn: () => void; className?: string }) => {
  return (
    <div onClick={onClickFn} className={cn("flex items-center gap-2", className)}>
      <button
        className="w-[33px] h-[33px] rounded-[6.7px] bg-settings-btn-muted flex items-center justify-center shrink-0"
        aria-label="Назад"
      >
        <svg width="18" height="18" viewBox="0 0 19 19" className="text-tertiary" fill="none" aria-hidden>
          <path
            d="M12 4L6 9.5L12 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <span className="text-sm font-semibold cursor-pointer text-tertiary">Назад</span>
    </div>
  )
}
