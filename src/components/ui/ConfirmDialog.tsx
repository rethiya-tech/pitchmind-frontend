import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  danger = true,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel, onConfirm])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-pm-border w-full max-w-sm mx-4 overflow-hidden">
        {/* Icon + Header */}
        <div className="px-6 pt-6 pb-4 flex gap-4 items-start">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${danger ? 'bg-red-50' : 'bg-[#E1F5EE]'}`}>
            {danger ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-red-500">
                <path d="M10 6v4M10 14h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-pm-teal">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 6v4M10 14h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-pm-primary">{title}</h3>
            <p className="text-sm text-pm-muted mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#F9FAFB] border-t border-pm-border">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-pm-muted hover:text-pm-primary transition-colors rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-colors text-white ${
              danger
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-pm-teal hover:bg-pm-teal-hover'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
