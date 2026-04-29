import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useEditorStore } from '@/stores/editorStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import { SlideList } from '@/components/editor/SlideList'
import { SlideDetailPanel } from '@/components/editor/SlideDetailPanel'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import api from '@/services/api'
import type { Conversion, Slide, Theme } from '@/types' // eslint-disable-line @typescript-eslint/no-unused-vars
import { THEMES } from '@/types'

/*
 * Percentages derived directly from pptx_builder.py EMU coordinates:
 * Slide: 9144000 W × 5143500 H
 * Header band  : y=0,       h=685800  → 0%   – 13.33%
 * Slide number : x=8229600, y=100000  → x=90%, y=1.94%
 * Title box    : x=457200,  y=800000  → x=5%,  y=15.56%
 * Divider      : x=457200,  y=1943400 → x=5%,  y=37.78%,  w=20%
 * Bullets box  : x=457200,  y=2057400 → x=5%,  y=40%
 * Footer       : y=5006700, h=136800  → 97.34% – 100%
 */
function SlidePreview({ slide, theme, index }: { slide: Slide; theme: Theme; index: number }) {
  const bullets: string[] = slide.bullets ?? []

  return (
    <div
      className="w-full rounded-xl overflow-hidden shadow-2xl"
      style={{ aspectRatio: '16/9', position: 'relative', backgroundColor: theme.bg, fontFamily: '"Plus Jakarta Sans", sans-serif' }}
    >
      {/* Header band (0 – 13.33%) */}
      <div className="absolute left-0 right-0" style={{ top: 0, height: '13.33%', backgroundColor: theme.accent }} />

      {/* Slide number chip */}
      <div
        className="absolute flex items-center justify-center text-white font-bold"
        style={{ right: 0, top: 0, width: '5%', height: '13.33%', backgroundColor: theme.accent, fontSize: 'clamp(7px, 1vw, 11px)', borderLeft: `1px solid rgba(255,255,255,0.2)` }}
      >
        {index + 1}
      </div>

      {/* Title */}
      <div
        className="absolute font-extrabold leading-tight"
        style={{ top: '15.56%', left: '5%', right: '5%', color: theme.text, fontSize: 'clamp(11px, 2vw, 26px)' }}
      >
        {slide.title || 'Untitled Slide'}
      </div>

      {/* Accent divider */}
      <div
        className="absolute rounded-full"
        style={{ top: '37.78%', left: '5%', width: '20%', height: '0.9%', backgroundColor: theme.accent }}
      />

      {/* Bullets */}
      <div className="absolute overflow-hidden" style={{ top: '40%', left: '5%', right: '5%', bottom: '5.4%' }}>
        {bullets.map((b, i) => (
          <div key={i} className="flex items-start" style={{ marginBottom: '1.5%' }}>
            <span
              className="flex-shrink-0 rounded-full"
              style={{ backgroundColor: theme.accent, width: '0.6em', height: '0.6em', minWidth: '0.6em', marginTop: '0.3em', marginRight: '0.6em', fontSize: 'clamp(9px, 1.3vw, 14px)' }}
            />
            <span style={{ color: theme.text, fontSize: 'clamp(9px, 1.3vw, 14px)', lineHeight: 1.4, opacity: 0.92 }}>
              {b}
            </span>
          </div>
        ))}
      </div>

      {/* Footer bar */}
      <div
        className="absolute left-0 right-0 flex items-center"
        style={{ top: '97.34%', height: '2.66%', backgroundColor: theme.accent, paddingLeft: '5%' }}
      >
        <span className="text-white font-semibold" style={{ fontSize: 'clamp(5px, 0.7vw, 8px)', opacity: 0.9 }}>PitchMind</span>
      </div>
    </div>
  )
}

// ── Panel header shared by left and right sidebars ────────────────────────────
function PanelHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 h-11 border-b border-pm-border flex-shrink-0 bg-pm-surface">
      <span className="text-xs font-semibold uppercase tracking-wider text-pm-muted">{title}</span>
      {action}
    </div>
  )
}

// ── Editor toolbar ─────────────────────────────────────────────────────────────
function EditorBar({ conversionId, conversionName, isSaving, hasError }: {
  conversionId: string
  conversionName?: string
  isSaving?: boolean
  hasError?: boolean
}) {
  const isDirty = useEditorStore((s) => s.isDirty)
  const name = conversionName?.replace(/\.[^.]+$/, '') ?? 'Untitled Presentation'
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const { data } = await api.post<{ download_url: string }>(`/conversions/${conversionId}/export`)
      const url = data.download_url
      const apiBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
      const isLocalUrl = apiBase && url.startsWith(apiBase)
      if (isLocalUrl) {
        const path = url.slice(`${apiBase}/api/v1`.length)
        const res = await api.get(path, { responseType: 'blob' })
        const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = `${name}.pptx`
        a.click()
        URL.revokeObjectURL(blobUrl)
      } else {
        window.open(url, '_blank')
      }
    } catch {
      toast.error('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <header className="flex-shrink-0 bg-white border-b border-pm-border flex items-center justify-between px-5" style={{ minHeight: '52px' }}>
      {/* Left: nav */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-pm-muted hover:text-pm-primary text-sm transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </Link>
        <div className="w-px h-4 bg-pm-border flex-shrink-0" />
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-pm-teal flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="10" height="13" rx="1.5" fill="white" fillOpacity="0.3" />
              <rect x="0" y="2" width="11" height="13" rx="1.5" fill="white" />
              <rect x="2" y="5" width="7" height="1" rx="0.5" fill="#0F6E56" />
              <rect x="2" y="7.5" width="5" height="1" rx="0.5" fill="#0F6E56" fillOpacity="0.5" />
              <rect x="2" y="10" width="6" height="1" rx="0.5" fill="#0F6E56" fillOpacity="0.5" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-pm-primary truncate max-w-xs">{name}</span>
        </div>
      </div>

      {/* Right: status + export */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <span className={cn('text-xs flex items-center gap-1.5 transition-colors',
          hasError ? 'text-pm-danger' : (isSaving || isDirty) ? 'text-pm-muted' : 'text-pm-teal'
        )}>
          {hasError ? (
            <><span className="w-1.5 h-1.5 rounded-full bg-pm-danger inline-block" />Save failed</>
          ) : (isSaving || isDirty) ? (
            <><Spinner size="sm" />Saving…</>
          ) : (
            <><span className="w-1.5 h-1.5 rounded-full bg-pm-teal inline-block" />Saved</>
          )}
        </span>
        <Button size="sm" loading={isExporting} onClick={handleExport}>
          <svg className="w-3.5 h-3.5 mr-1.5 inline-block -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export &amp; Download
        </Button>
      </div>
    </header>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setSlides, setConversionId, setActiveSlide, slides, activeSlideId, markSaved } = useEditorStore()
  const initialActiveSet = useRef(false)

  const { data: conversion, isLoading, isError } = useQuery<Conversion>({
    queryKey: ['conversion', id],
    queryFn: async () => {
      const res = await api.get(`/conversions/${id}`)
      return res.data
    },
    enabled: !!id,
    retry: 1,
  })

  useEffect(() => {
    if (conversion) {
      setConversionId(conversion.id)
      if (conversion.slides) {
        setSlides(conversion.slides)
        if (!initialActiveSet.current) {
          initialActiveSet.current = true
          const first = conversion.slides.find((s) => !s.is_deleted)
          if (first) setActiveSlide(first.id)
        }
      }
    }
  }, [conversion, setSlides, setConversionId, setActiveSlide])

  useEffect(() => {
    if (conversion?.status === 'generating' && id) {
      navigate(`/generating/${id}`, { replace: true })
    }
  }, [conversion?.status, id, navigate])

  const visibleSlides = slides.filter((s) => !s.is_deleted)
  const activeSlide = visibleSlides.find((s) => s.id === activeSlideId)
  const activeIndex = visibleSlides.findIndex((s) => s.id === activeSlideId)
  const theme = THEMES.find((t) => t.id === conversion?.theme) ?? THEMES[THEMES.length - 1]

  const { isSaving, hasError } = useAutoSave({
    slideId: activeSlide?.id ?? '',
    content: activeSlide
      ? JSON.stringify({ title: activeSlide.title, bullets: activeSlide.bullets, speaker_notes: activeSlide.speaker_notes })
      : '',
    onSave: async () => {
      if (!activeSlide) return
      await api.patch(`/slides/${activeSlide.id}`, {
        title: activeSlide.title,
        bullets: activeSlide.bullets,
        speaker_notes: activeSlide.speaker_notes,
        layout: activeSlide.layout,
      })
      markSaved()
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" className="text-pm-teal" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center text-pm-muted">
        Failed to load presentation.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-pm-app overflow-hidden">
      {/* Top toolbar */}
      <EditorBar
        conversionId={id ?? ''}
        conversionName={conversion?.original_filename}
        isSaving={isSaving}
        hasError={hasError}
      />

      {/* Three-panel body */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Panel 1: Slides ── */}
        <aside className="w-64 flex flex-col bg-pm-surface border-r border-pm-border flex-shrink-0">
          <PanelHeader
            title="Slides"
            action={
              <span className="text-xs text-pm-muted tabular-nums">
                {visibleSlides.length} {visibleSlides.length === 1 ? 'slide' : 'slides'}
              </span>
            }
          />
          <div className="flex-1 overflow-y-auto p-3">
            <SlideList conversionId={id ?? ''} theme={theme} />
          </div>
        </aside>

        {/* ── Panel 2: Canvas ── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#E8EAED]">
          {/* Canvas header bar */}
          <div className="h-11 border-b border-[#D1D5DB] bg-white flex items-center justify-between px-5 flex-shrink-0">
            {/* Slide name */}
            <span className="text-sm font-medium text-pm-primary truncate max-w-xs">
              {activeSlide ? activeSlide.title || 'Untitled Slide' : 'No slide selected'}
            </span>
            {/* Navigation */}
            {activeSlide && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => activeIndex > 0 && setActiveSlide(visibleSlides[activeIndex - 1].id)}
                  disabled={activeIndex === 0}
                  className="w-7 h-7 rounded-lg border border-pm-border flex items-center justify-center text-pm-muted hover:text-pm-primary hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-xs text-pm-muted tabular-nums font-medium">
                  {activeIndex + 1} <span className="text-gray-300">/</span> {visibleSlides.length}
                </span>
                <button
                  onClick={() => activeIndex < visibleSlides.length - 1 && setActiveSlide(visibleSlides[activeIndex + 1].id)}
                  disabled={activeIndex === visibleSlides.length - 1}
                  className="w-7 h-7 rounded-lg border border-pm-border flex items-center justify-center text-pm-muted hover:text-pm-primary hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Slide canvas */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-10">
            {activeSlide ? (
              <div className="w-full max-w-4xl drop-shadow-2xl">
                <SlidePreview slide={activeSlide} theme={theme} index={activeIndex} />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <p className="text-sm">Select a slide to preview</p>
              </div>
            )}
          </div>
        </main>

        {/* ── Panel 3: Properties ── */}
        <aside className="w-80 flex flex-col bg-pm-surface border-l border-pm-border flex-shrink-0">
          <PanelHeader title="Properties" />
          <div className="flex-1 overflow-y-auto">
            <SlideDetailPanel />
          </div>
        </aside>

      </div>
    </div>
  )
}
