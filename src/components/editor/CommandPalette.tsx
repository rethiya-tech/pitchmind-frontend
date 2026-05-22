import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEditorStore } from '@/stores/editorStore'

interface Props {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: Props) {
  const { slides, setActiveSlide, activeSlideId } = useEditorStore()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const visibleSlides = slides.filter((s) => !s.is_deleted)
  const filtered = query.trim()
    ? visibleSlides.filter((s) =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.bullets.some((b) => b.toLowerCase().includes(query.toLowerCase()))
      )
    : visibleSlides

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleSelect = (slideId: string) => {
    setActiveSlide(slideId)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-pm-border"
            initial={{ scale: 0.96, y: -16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: -16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-pm-border">
              <svg className="w-4 h-4 text-pm-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to slide…"
                className="flex-1 text-sm text-pm-primary placeholder:text-pm-muted outline-none bg-transparent"
              />
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-pm-muted">Esc</kbd>
            </div>

            {/* Slide list */}
            <div className="max-h-72 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-pm-muted">No slides match "{query}"</p>
              ) : (
                filtered.map((slide) => {
                  const isActive = slide.id === activeSlideId
                  const globalIndex = visibleSlides.findIndex((s) => s.id === slide.id)
                  return (
                    <motion.button
                      key={slide.id}
                      onClick={() => handleSelect(slide.id)}
                      whileHover={{ backgroundColor: '#F9FAFB' }}
                      className={`w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors ${isActive ? 'bg-[#E6F2EF]' : ''}`}
                    >
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-pm-teal text-white' : 'bg-gray-100 text-pm-muted'}`}>
                        {globalIndex + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-pm-primary truncate">
                          {slide.title || `Slide ${globalIndex + 1}`}
                        </p>
                        {slide.bullets[0] && (
                          <p className="text-xs text-pm-muted truncate">{slide.bullets[0]}</p>
                        )}
                      </div>
                      {isActive && (
                        <span className="ml-auto text-[10px] font-semibold text-pm-teal flex-shrink-0">current</span>
                      )}
                    </motion.button>
                  )
                })
              )}
            </div>

            <div className="px-4 py-2 border-t border-pm-border bg-[#F9FAFB]">
              <p className="text-[10px] text-pm-muted">{filtered.length} slide{filtered.length !== 1 ? 's' : ''}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
