'use client'

export default function GraphPage() {
  return (
    <div className="px-5 pt-5 pb-8 min-h-[calc(100svh-120px)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="w-20 h-20 rounded-[24px] flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #D7BEFF 0%, #9957FF 100%)" }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path
              d="M6 30 L14 18 L22 24 L30 10 L34 14"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="34" cy="10" r="3.5" fill="white" />
          </svg>
        </div>
        <span className="text-lg font-semibold text-primary">Здесь скоро что-то будет</span>
      </div>
    </div>
  )
}
