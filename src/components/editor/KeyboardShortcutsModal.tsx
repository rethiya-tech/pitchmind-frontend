import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SHORTCUTS = [
  { keys: ['←', '→'],    desc: 'Previous / Next slide' },
  { keys: ['P'],          desc: 'Enter presentation mode' },
  { keys: ['⌘', 'K'],    desc: 'Command palette' },
  { keys: ['?'],          desc: 'Toggle this panel' },
  { keys: ['Del'],        desc: 'Delete active slide' },
  { keys: ['Esc'],        desc: 'Exit modal / presentation' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative z-10 bg-pm-surface rounded-2xl shadow-2xl p-6 w-80 border border-pm-border"
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold gradient-heading">Keyboard Shortcuts</h2>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-md text-pm-muted hover:bg-pm-surface-3 hover:text-pm-primary flex items-center justify-center text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              {SHORTCUTS.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-pm-muted">{s.desc}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k, ki) => (
                      <kbd
                        key={ki}
                        className="px-2 py-0.5 text-[11px] font-mono bg-pm-surface-3 border border-pm-border rounded-md text-pm-primary leading-tight"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-pm-muted text-center">Press <kbd className="px-1 py-0.5 bg-pm-surface-3 border border-pm-border rounded text-[10px] font-mono">?</kbd> to toggle</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
