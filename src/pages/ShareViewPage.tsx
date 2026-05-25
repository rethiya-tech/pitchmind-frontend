import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidePreview } from '@/components/editor/SlidePreview'
import { PageLoader } from '@/components/ui/PageLoader'
import { useDelayedLoading } from '@/hooks/useDelayedLoading'
import { resolveSlideBackgroundUrl } from '@/utils/slideImage'
import { THEMES } from '@/types'
import type { Slide } from '@/types'
import api from '@/services/api'

interface PublicConversion {
  id: string
  name?: string | null
  original_filename?: string | null
  theme?: string | null
  client_logo_url?: string | null
  slides: Slide[]
}

function SlideThumbnail({
  slide,
  index,
  isActive,
  theme,
  onClick,
}: {
  slide: Slide
  index: number
  isActive: boolean
  theme: { id: string; bg: string; text: string; accent: string }
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center gap-2.5 px-2 py-2 rounded-xl transition-all text-left ${
        isActive ? 'bg-pm-teal-light' : 'hover:bg-pm-surface-2'
      }`}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="share-active-indicator"
          className="absolute left-2 w-[3px] h-8 rounded-full bg-pm-teal"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}

      {/* Slide number */}
      <span className={`flex-shrink-0 w-5 text-center text-[10px] font-semibold tabular-nums ${isActive ? 'text-pm-teal' : 'text-pm-muted'}`}>
        {index + 1}
      </span>

      {/* Mini thumbnail */}
      <div
        className={`relative flex-shrink-0 rounded-md overflow-hidden border ${isActive ? 'border-pm-teal shadow-sm' : 'border-pm-border'}`}
        style={{
          width: 68,
          height: 38,
          backgroundColor: theme.bg,
          backgroundImage: slide.background_image_url
            ? `url(${resolveSlideBackgroundUrl(slide.background_image_url)})`
            : `url(/themes/${theme.id}.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute font-bold leading-none px-[7%] truncate"
          style={{ top: '8%', left: 0, right: 0, fontSize: 5, color: theme.text }}
        >
          {slide.title || `Slide ${index + 1}`}
        </div>
        <div className="absolute rounded-full" style={{ top: '30%', left: '7%', width: '22%', height: '4%', backgroundColor: theme.accent }} />
        <div className="absolute" style={{ top: '38%', left: '7%', right: '7%', bottom: '4%' }}>
          {slide.bullets.slice(0, 3).map((b, bi) => (
            <div key={bi} className="flex items-center gap-[3%] mb-[5%]">
              <div className="rounded-full flex-shrink-0" style={{ width: 2, height: 2, backgroundColor: theme.accent }} />
              <div className="truncate" style={{ fontSize: 4, color: theme.text, opacity: 0.8 }}>{b}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold truncate leading-tight ${isActive ? 'text-pm-teal' : 'text-pm-primary'}`}>
          {slide.title || `Slide ${index + 1}`}
        </p>
        {slide.bullets[0] && (
          <p className="text-[10px] text-pm-muted truncate mt-0.5 leading-tight">{slide.bullets[0]}</p>
        )}
      </div>
    </button>
  )
}

export function ShareViewPage() {
  const { token } = useParams<{ token: string }>()
  const [activeIndex, setActiveIndex] = useState(0)
  const [presentMode, setPresentMode] = useState(false)

  const { data, isLoading, isError } = useQuery<PublicConversion>({
    queryKey: ['share', token],
    queryFn: async () => (await api.get(`/share/${token}`)).data,
    enabled: !!token,
    retry: 0,
  })
  const showSpinner = useDelayedLoading(isLoading)

  const slides = data?.slides ?? []
  const activeSlide = slides[activeIndex]
  const theme = THEMES.find(t => t.id === data?.theme) ?? THEMES[THEMES.length - 1]
  const title = data?.name || data?.original_filename || 'Presentation'

  const prev = useCallback(() => setActiveIndex(i => Math.max(0, i - 1)), [])
  const next = useCallback(() => setActiveIndex(i => Math.min(slides.length - 1, i + 1)), [slides.length])

  const enterPresent = useCallback(() => {
    setPresentMode(true)
    document.documentElement.requestFullscreen().catch(() => {})
  }, [])

  const exitPresent = useCallback(() => {
    setPresentMode(false)
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }, [])

  useEffect(() => {
    const onFs = () => { if (!document.fullscreenElement) setPresentMode(false) }
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev()
      if (e.key === 'Escape') exitPresent()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev, exitPresent])

  if (showSpinner || isLoading) return <PageLoader show={showSpinner} />

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-pm-app flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-pm-teal-light flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 10v5M14 18v.5" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="14" cy="14" r="11" stroke="#0F6E56" strokeWidth="1.8" />
            </svg>
          </div>
          <p className="text-pm-primary font-bold text-lg">Presentation not found</p>
          <p className="text-pm-muted text-sm">This link may have been disabled or doesn't exist.</p>
          <a href="/" className="inline-block mt-2 text-sm text-pm-teal font-semibold hover:underline">← Go to PitchMind</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(to right, #F4FCF8 0%, #FDF7E8 100%)' }}>

      {/* Top bar */}
      <header className="bg-pm-surface/80 backdrop-blur-xl border-b border-pm-border/50 flex-shrink-0">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0F6E56 0%, #0A9B6E 100%)' }}
            >
              <svg width="14" height="15" viewBox="0 0 16 18" fill="none">
                <rect x="0" y="3" width="12" height="14" rx="2" fill="white" />
                <rect x="2.5" y="6" width="7" height="1.2" rx="0.6" fill="#0F6E56" />
                <rect x="2.5" y="8.5" width="5" height="1.2" rx="0.6" fill="#0F6E56" fillOpacity="0.5" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-pm-primary truncate max-w-xs leading-tight">{title}</p>
              <p className="text-xs text-pm-muted leading-tight">{slides.length} slides</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-pm-muted tabular-nums hidden sm:block">
              {activeIndex + 1} / {slides.length}
            </span>
            <button
              onClick={enterPresent}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:-translate-y-px active:scale-95"
              style={{ background: 'linear-gradient(135deg, #0F6E56 0%, #0A9B6E 100%)', boxShadow: '0 3px 12px rgba(15,110,86,0.25)' }}
            >
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <polygon points="2,1.5 12.5,7 2,12.5" fill="currentColor" />
              </svg>
              Present
            </button>
            <a
              href="/"
              className="text-xs font-semibold text-pm-teal hover:text-pm-teal-hover transition-colors hidden sm:block"
            >
              Made with PitchMind
            </a>
          </div>
        </div>
      </header>

      {/* Body: sidebar + main */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left sidebar — slide list */}
        <aside className="w-56 flex-shrink-0 bg-pm-surface/60 backdrop-blur-sm border-r border-pm-border/50 flex flex-col overflow-hidden">
          <div className="px-3 py-2.5 border-b border-pm-border/50 flex-shrink-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-pm-muted">Slides</span>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
            {slides.map((slide, i) => (
              <div key={slide.id} className="relative">
                <SlideThumbnail
                  slide={slide}
                  index={i}
                  isActive={i === activeIndex}
                  theme={theme}
                  onClick={() => setActiveIndex(i)}
                />
              </div>
            ))}
          </div>
        </aside>

        {/* Main viewer */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-5 overflow-auto">
          {/* Slide */}
          <div className="w-full max-w-3xl">
            <AnimatePresence mode="wait">
              {activeSlide && (
                <motion.div
                  key={activeSlide.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="drop-shadow-2xl"
                >
                  <SlidePreview
                    slide={activeSlide}
                    theme={theme}
                    showWatermark={false}
                    logoUrl={data.client_logo_url ?? undefined}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={prev}
              disabled={activeIndex === 0}
              className="w-9 h-9 rounded-full border border-pm-border bg-pm-surface/80 flex items-center justify-center text-pm-muted hover:text-pm-primary hover:border-pm-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Dot indicators */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`rounded-full transition-all duration-200 ${
                    i === activeIndex
                      ? 'w-5 h-2 bg-pm-teal'
                      : 'w-2 h-2 bg-pm-border hover:bg-pm-muted'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              disabled={activeIndex === slides.length - 1}
              className="w-9 h-9 rounded-full border border-pm-border bg-pm-surface/80 flex items-center justify-center text-pm-muted hover:text-pm-primary hover:border-pm-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen presentation mode */}
      <AnimatePresence>
        {presentMode && activeSlide && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex-1 relative flex items-center justify-center overflow-hidden px-16 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.id}
                  className="w-full max-w-[90vw]"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  <SlidePreview
                    slide={activeSlide}
                    theme={theme}
                    showWatermark={false}
                    logoUrl={data.client_logo_url ?? undefined}
                  />
                </motion.div>
              </AnimatePresence>

              <button onClick={prev} disabled={activeIndex === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 disabled:opacity-0 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={next} disabled={activeIndex === slides.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 disabled:opacity-0 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button onClick={exitPresent}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-shrink-0 flex items-center justify-center py-3">
              <span className="text-white/40 text-sm tabular-nums font-medium tracking-widest select-none">
                {activeIndex + 1} <span className="text-white/20 mx-1">/</span> {slides.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
