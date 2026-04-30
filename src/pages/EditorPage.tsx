import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
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
 * Slide number : x=8686800, y=0       → x=95%, y=0
 * Title box    : x=457200,  y=800000  → x=5%,  y=15.56%
 * Divider      : x=457200,  y=1943400 → x=5%,  y=37.78%,  w=20%
 * Bullets box  : x=457200,  y=2057400 → x=5%,  y=40%
 * Footer       : y=5006700, h=136800  → 97.34% – 100%
 */

const COLOR_SCHEME_MAP: Record<string, string> = {
  teal: '#0F6E56',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  amber: '#F59E0B',
  rose: '#F43F5E',
  green: '#10B981',
  orange: '#F97316',
}

const SHAPE_RADIUS: Record<string, string> = {
  square: '0px',
  rounded: '12px',
  pill: '50%',
}

/** Lighten (positive amount) or darken (negative amount) a hex color. */
function lighterHex(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const clamp = (v: number) => Math.min(255, Math.max(0, v))
  const r = clamp(parseInt(h.slice(0, 2), 16) + amount)
  const g = clamp(parseInt(h.slice(2, 4), 16) + amount)
  const b = clamp(parseInt(h.slice(4, 6), 16) + amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function SlidePreview({ slide, theme }: { slide: Slide; theme: Theme }) {
  const bullets: string[] = slide.bullets ?? []
  const layout = slide.layout || 'bullets'
  const accentColor = COLOR_SCHEME_MAP[slide.color_scheme] ?? theme.accent
  const radius = SHAPE_RADIUS[slide.shape_style] ?? '0px'

  const containerStyle: React.CSSProperties = {
    aspectRatio: '16/9',
    position: 'relative',
    backgroundColor: theme.bg,
    backgroundImage: `url(/themes/${theme.id}.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
  }

  // ── hero ──────────────────────────────────────────────────────────────────
  if (layout === 'hero') {
    const subtitle = bullets[0] ?? ''
    const tagline = bullets[1] ?? ''
    return (
      <div className="w-full rounded-xl overflow-hidden shadow-2xl" style={containerStyle}>
        <div
          className="absolute font-extrabold leading-tight"
          style={{ top: '28%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(18px, 3.5vw, 42px)' }}
        >
          {slide.title || 'Untitled Slide'}
        </div>
        <div
          className="absolute rounded-full"
          style={{ top: '60%', left: '7%', width: '20%', height: '0.7%', backgroundColor: accentColor }}
        />
        {subtitle && (
          <div
            className="absolute"
            style={{ top: '65%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(9px, 1.6vw, 18px)', opacity: 0.85 }}
          >
            {subtitle}
          </div>
        )}
        {tagline && (
          <div
            className="absolute"
            style={{ top: '75%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(7px, 1.2vw, 14px)', opacity: 0.65 }}
          >
            {tagline}
          </div>
        )}
      </div>
    )
  }

  // ── two_column ────────────────────────────────────────────────────────────
  if (layout === 'two_column') {
    // Parse "## Header" bullets as column headers; rest are content
    const sections: { header: string; items: string[] }[] = []
    let cur: { header: string; items: string[] } | null = null
    for (const b of bullets) {
      if (b.startsWith('## ')) {
        if (cur) sections.push(cur)
        cur = { header: b.slice(3), items: [] }
      } else {
        if (!cur) cur = { header: 'Key Points', items: [] }
        cur.items.push(b)
      }
    }
    if (cur) sections.push(cur)
    // Fallback: split evenly if no ## markers
    const leftSection = sections[0] ?? { header: 'Key Points', items: bullets.slice(0, Math.ceil(bullets.length / 2)) }
    const rightSection = sections[1] ?? { header: 'Details', items: bullets.slice(Math.ceil(bullets.length / 2)) }

    return (
      <div className="w-full rounded-xl overflow-hidden shadow-2xl" style={containerStyle}>
        <div
          className="absolute font-extrabold leading-tight"
          style={{ top: '7%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(10px, 1.8vw, 22px)' }}
        >
          {slide.title || 'Untitled Slide'}
        </div>
        <div
          className="absolute rounded-full"
          style={{ top: '26%', left: '7%', width: '20%', height: '0.7%', backgroundColor: accentColor }}
        />
        {/* Left column */}
        <div className="absolute" style={{ top: '29%', left: '7%', width: '43%' }}>
          <div className="flex items-center px-2 py-1 mb-2" style={{ backgroundColor: accentColor, borderRadius: radius }}>
            <span className="text-white font-bold" style={{ fontSize: 'clamp(6px, 0.85vw, 10px)' }}>{leftSection.header}</span>
          </div>
          {leftSection.items.map((b, i) => (
            <div key={i} className="flex items-start" style={{ marginBottom: '1.5%' }}>
              <span style={{ color: accentColor, marginRight: '3%', fontSize: 'clamp(7px, 1vw, 11px)', lineHeight: 1.4 }}>●</span>
              <span style={{ color: theme.text, fontSize: 'clamp(7px, 1vw, 11px)', lineHeight: 1.4, opacity: 0.92 }}>{b}</span>
            </div>
          ))}
        </div>
        {/* Right column */}
        <div className="absolute" style={{ top: '29%', left: '53%', right: '7%' }}>
          <div className="flex items-center px-2 py-1 mb-2" style={{ backgroundColor: lighterHex(accentColor, 20), borderRadius: radius }}>
            <span className="text-white font-bold" style={{ fontSize: 'clamp(6px, 0.85vw, 10px)' }}>{rightSection.header}</span>
          </div>
          {rightSection.items.map((b, i) => (
            <div key={i} className="flex items-start" style={{ marginBottom: '1.5%' }}>
              <span style={{ color: accentColor, marginRight: '3%', fontSize: 'clamp(7px, 1vw, 11px)', lineHeight: 1.4 }}>●</span>
              <span style={{ color: theme.text, fontSize: 'clamp(7px, 1vw, 11px)', lineHeight: 1.4, opacity: 0.92 }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── data_table ────────────────────────────────────────────────────────────
  if (layout === 'data_table') {
    const valueBg = lighterHex(theme.bg, 35)

    return (
      <div className="w-full rounded-xl overflow-hidden shadow-2xl" style={containerStyle}>
        {/* Title */}
        <div
          className="absolute font-extrabold leading-tight"
          style={{ top: '7%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(10px, 1.7vw, 20px)' }}
        >
          {slide.title || 'Untitled Slide'}
        </div>

        {/* Table rows */}
        <div className="absolute overflow-hidden" style={{ top: '26%', left: '7%', right: '7%', bottom: '4%' }}>
          {bullets.map((b, i) => {
            const sepIdx = b.indexOf(': ')
            const label = sepIdx !== -1 ? b.slice(0, sepIdx) : b
            const value = sepIdx !== -1 ? b.slice(sepIdx + 2) : ''
            const labelBg = i % 2 === 0 ? accentColor : lighterHex(accentColor, 25)
            return (
              <div key={i} className="flex" style={{ height: '9%', marginBottom: '1%' }}>
                <div
                  className="flex items-center flex-shrink-0"
                  style={{ width: '38%', backgroundColor: labelBg, paddingLeft: '3%', paddingRight: '2%' }}
                >
                  <span className="font-bold truncate" style={{ color: '#FFFFFF', fontSize: 'clamp(6px, 0.9vw, 11px)' }}>{label}</span>
                </div>
                <div
                  className="flex items-center flex-1"
                  style={{ backgroundColor: valueBg, paddingLeft: '3%', paddingRight: '2%' }}
                >
                  <span className="truncate" style={{ color: theme.text, fontSize: 'clamp(6px, 0.9vw, 11px)' }}>{value || '—'}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── timeline ──────────────────────────────────────────────────────────────
  if (layout === 'timeline') {
    return (
      <div className="w-full rounded-xl overflow-hidden shadow-2xl" style={containerStyle}>
        <div
          className="absolute font-extrabold leading-tight"
          style={{ top: '7%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(10px, 1.8vw, 22px)' }}
        >
          {slide.title || 'Untitled Slide'}
        </div>
        <div className="absolute" style={{ top: '29%', left: '7%', right: '7%', bottom: '4%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', left: '1.4%', top: 0, bottom: 0, width: 2, backgroundColor: accentColor, opacity: 0.45 }} />
          {bullets.map((b, i) => {
            const sepIdx = b.indexOf(': ')
            const label = sepIdx !== -1 ? b.slice(0, sepIdx) : `Phase ${i + 1}`
            const desc = sepIdx !== -1 ? b.slice(sepIdx + 2) : b
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1, minHeight: 0 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: accentColor, flexShrink: 0, marginRight: '2.5%', zIndex: 1 }} />
                <span style={{ color: accentColor, fontWeight: 700, fontSize: 'clamp(7px, 1vw, 11px)' }}>{label}</span>
                {desc && <span style={{ color: theme.text, fontSize: 'clamp(6px, 0.85vw, 10px)', opacity: 0.8, marginLeft: '1.5%' }}>{desc}</span>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── big_stat ───────────────────────────────────────────────────────────────
  if (layout === 'big_stat') {
    const stats = bullets.slice(0, 3)
    return (
      <div className="w-full rounded-xl overflow-hidden shadow-2xl" style={containerStyle}>
        <div
          className="absolute font-extrabold leading-tight"
          style={{ top: '7%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(10px, 1.8vw, 22px)' }}
        >
          {slide.title || 'Untitled Slide'}
        </div>
        <div className="absolute flex gap-[2%]" style={{ top: '34%', left: '7%', right: '7%', bottom: '8%' }}>
          {stats.map((b, i) => {
            const sepIdx = b.indexOf(': ')
            const label = sepIdx !== -1 ? b.slice(0, sepIdx) : 'Metric'
            const value = sepIdx !== -1 ? b.slice(sepIdx + 2) : b
            return (
              <div key={i} className="relative flex flex-col overflow-hidden flex-1" style={{ backgroundColor: lighterHex(theme.bg, 30), borderRadius: radius }}>
                <div style={{ height: 4, backgroundColor: accentColor, flexShrink: 0 }} />
                <div style={{ padding: '8% 10%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ color: accentColor, fontWeight: 800, fontSize: 'clamp(14px, 2.4vw, 30px)', lineHeight: 1.1 }}>{value}</div>
                  <div style={{ color: theme.text, fontSize: 'clamp(6px, 0.9vw, 11px)', opacity: 0.75, marginTop: '6%' }}>{label}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── process ────────────────────────────────────────────────────────────────
  if (layout === 'process') {
    const steps = bullets.slice(0, 5)
    return (
      <div className="w-full rounded-xl overflow-hidden shadow-2xl" style={containerStyle}>
        <div
          className="absolute font-extrabold leading-tight"
          style={{ top: '7%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(10px, 1.8vw, 22px)' }}
        >
          {slide.title || 'Untitled Slide'}
        </div>
        <div
          className="absolute rounded-full"
          style={{ top: '26%', left: '7%', width: '20%', height: '0.7%', backgroundColor: accentColor }}
        />
        <div className="absolute flex items-stretch gap-[1.5%]" style={{ top: '31%', left: '7%', right: '7%', bottom: '8%' }}>
          {steps.map((b, i) => (
            <div key={i} className="flex items-center" style={{ flex: i < steps.length - 1 ? '1 1 0' : '1 1 0' }}>
              <div className="flex flex-col overflow-hidden flex-1 h-full" style={{ backgroundColor: i % 2 === 0 ? accentColor : lighterHex(accentColor, 30), borderRadius: radius }}>
                <div className="flex items-center justify-center font-bold text-white flex-shrink-0" style={{ height: '30%', fontSize: 'clamp(8px, 1.3vw, 16px)', backgroundColor: lighterHex(accentColor, -20), borderRadius: `${radius} ${radius} 0 0` }}>
                  {i + 1}
                </div>
                <div style={{ padding: '5% 8%', color: '#fff', fontSize: 'clamp(5px, 0.8vw, 9px)', lineHeight: 1.4, overflow: 'hidden' }}>{b}</div>
              </div>
              {i < steps.length - 1 && (
                <span style={{ color: accentColor, fontSize: 'clamp(8px, 1.2vw, 14px)', flexShrink: 0, padding: '0 2%' }}>→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── quote ──────────────────────────────────────────────────────────────────
  if (layout === 'quote') {
    const quoteText = bullets[0] ?? ''
    const attribution = bullets[1] ?? ''
    return (
      <div className="w-full rounded-xl overflow-hidden shadow-2xl" style={containerStyle}>
        <div
          className="absolute"
          style={{ top: '7%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(8px, 1.3vw, 15px)', opacity: 0.6 }}
        >
          {slide.title}
        </div>
        <div
          className="absolute font-extrabold leading-none"
          style={{ top: '18%', left: '7%', color: accentColor, fontSize: 'clamp(24px, 5vw, 60px)', lineHeight: 1 }}
        >
          &ldquo;
        </div>
        {quoteText && (
          <div
            className="absolute leading-snug"
            style={{ top: '26%', left: '14%', right: '7%', color: theme.text, fontSize: 'clamp(9px, 1.5vw, 18px)', fontStyle: 'italic' }}
          >
            {quoteText}
          </div>
        )}
        <div
          className="absolute rounded-full"
          style={{ top: '74%', left: '7%', width: '20%', height: '0.7%', backgroundColor: accentColor }}
        />
        {attribution && (
          <div
            className="absolute text-right"
            style={{ top: '78%', right: '7%', color: theme.text, fontSize: 'clamp(7px, 1vw, 11px)', opacity: 0.7 }}
          >
            — {attribution}
          </div>
        )}
      </div>
    )
  }

  // ── bullets (default) ─────────────────────────────────────────────────────
  return (
    <div className="w-full rounded-xl overflow-hidden shadow-2xl" style={containerStyle}>
      {/* Title */}
      <div
        className="absolute font-extrabold leading-tight"
        style={{ top: '7%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(11px, 2vw, 26px)' }}
      >
        {slide.title || 'Untitled Slide'}
      </div>

      {/* Accent divider */}
      <div
        className="absolute rounded-full"
        style={{ top: '26%', left: '7%', width: '20%', height: '0.7%', backgroundColor: accentColor }}
      />

      {/* Bullets */}
      <div className="absolute overflow-hidden" style={{ top: '29%', left: '7%', right: '7%', bottom: '4%' }}>
        {bullets.map((b, i) => (
          <div key={i} className="flex items-start" style={{ marginBottom: '2%' }}>
            <span
              className="flex-shrink-0 rounded-full"
              style={{ backgroundColor: accentColor, width: '0.6em', height: '0.6em', minWidth: '0.6em', marginTop: '0.35em', marginRight: '0.6em', fontSize: 'clamp(9px, 1.3vw, 14px)' }}
            />
            <span style={{ color: theme.text, fontSize: 'clamp(9px, 1.3vw, 14px)', lineHeight: 1.45, opacity: 0.92 }}>
              {b}
            </span>
          </div>
        ))}
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
function EditorBar({ conversionId, conversionName, isSaving, hasError, backTo }: {
  conversionId: string
  conversionName?: string
  isSaving?: boolean
  hasError?: boolean
  backTo?: { path: string; label: string }
}) {
  const isDirty = useEditorStore((s) => s.isDirty)
  const name = (conversionName?.replace(/\.[^.]+$/, '') ?? 'Untitled Presentation')
    .replace(/[^a-zA-Z0-9\s-]/g, '').trim().slice(0, 40).trimEnd()
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
          to={backTo?.path ?? '/projects'}
          className="flex items-center gap-1.5 text-pm-muted hover:text-pm-primary text-sm transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backTo?.label ?? 'Projects'}
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
  const location = useLocation()
  const backTo = (location.state as { from?: string } | null)?.from === 'templates'
    ? { path: '/templates', label: 'Templates' }
    : { path: '/projects', label: 'Projects' }
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
      ? JSON.stringify({ title: activeSlide.title, bullets: activeSlide.bullets, speaker_notes: activeSlide.speaker_notes, layout: activeSlide.layout, color_scheme: activeSlide.color_scheme, shape_style: activeSlide.shape_style })
      : '',
    onSave: async () => {
      if (!activeSlide) return
      await api.patch(`/slides/${activeSlide.id}`, {
        title: activeSlide.title,
        bullets: activeSlide.bullets,
        speaker_notes: activeSlide.speaker_notes,
        layout: activeSlide.layout,
        color_scheme: activeSlide.color_scheme,
        shape_style: activeSlide.shape_style,
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
        conversionName={conversion?.name ?? conversion?.original_filename}
        isSaving={isSaving}
        hasError={hasError}
        backTo={backTo}
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
                <SlidePreview slide={activeSlide} theme={theme} />
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
