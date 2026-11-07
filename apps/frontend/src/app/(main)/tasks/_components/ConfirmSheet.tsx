"use client"

interface ConfirmSheetProps {
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmSheet({
  title,
  description,
  confirmLabel = "Удалить",
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onCancel} aria-hidden />

      <div className="fixed inset-x-0 bottom-0 z-50 max-w-[430px] mx-auto animate-slide-up">
        <div
          className="px-8 pb-10 pt-2 flex flex-col gap-6"
          style={{
            borderRadius: "53px 53px 0 0",
            background: "var(--sheet-bg)",
            boxShadow: "0 2px 15px 0 rgba(0,0,0,0.30)",
          }}
        >
          <div className="w-10 h-1 rounded-full bg-[rgba(40,40,40,0.15)] mx-auto" />

          <div className="flex flex-col gap-2">
            <span className="text-[17px] font-semibold text-primary">{title}</span>
            {description && (
              <span className="text-sm text-tertiary">{description}</span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full h-[54px] rounded-[46px] flex items-center justify-center active:opacity-70 transition-opacity"
              style={{ background: "#F34D64" }}
            >
              <span className="text-white text-sm font-semibold">{confirmLabel}</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full h-[54px] rounded-[46px] flex items-center justify-center active:opacity-70 transition-opacity"
              style={{ background: "var(--filter-btn-bg)" }}
            >
              <span className="text-sm font-semibold text-primary">Отмена</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
