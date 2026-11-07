"use client"

interface CheckboxProps {
  checked: boolean
  onChange: (value: boolean) => void
}

export function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative w-[17px] h-[17px] shrink-0 border border-accent flex items-center justify-center transition-colors"
      style={{
        backgroundColor: checked ? "var(--accent)" : "transparent",
        borderRadius: 5.6,
      }}
    >
      <svg
        width="9"
        height="6"
        viewBox="0 0 9 6"
        fill="none"
        style={{ opacity: checked ? 1 : 0, transition: "opacity 0.15s" }}
      >
        <path d="M1 2.5L3.5 5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
