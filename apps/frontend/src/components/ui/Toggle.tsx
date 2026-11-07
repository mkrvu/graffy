import { cn } from "@/lib/utils"

export function Toggle({ value, onChange }: { value: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "relative flex items-center rounded-full transition-colors duration-200 shrink-0",
        value ? "bg-accent" : "bg-toggle-off",
      )}
      style={{ width: 48, height: 27 }}
      aria-label="Переключить тему"
    >
      <span
        className="absolute w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all duration-200"
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          left: value ? "calc(100% - 21px)" : 3,
        }}
      />
    </button>
  )
}
