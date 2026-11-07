"use client"

// Active:   linear-gradient(#D7BEFF → #9957FF) + white text  [Figma node 0:74]
// Inactive: var(--accent-muted) + var(--accent) text

interface GradientButtonProps {
  isActive?: boolean
  isLoading?: boolean
  loadingText?: string
  type?: "submit" | "button"
  children: React.ReactNode
  onClick?: () => void
}

export function GradientButton({
  isActive = false,
  isLoading = false,
  loadingText = "Загрузка...",
  onClick,
  type = "submit",
  children,
}: GradientButtonProps) {
  const disabled = isLoading || !isActive

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full font-medium rounded-full py-[21px] active:scale-95 transition-all duration-200"
      style={{
        fontSize: 18,
        background: isActive ? "linear-gradient(90deg, #D7BEFF 0%, #9957FF 100%)" : "var(--accent-muted)",
        color: isActive ? "#FFFFFF" : "var(--accent)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: isLoading ? 0.7 : 1,
      }}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
