import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useEditorStore } from '@/stores/editorStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import { SlideList } from '@/components/editor/SlideList'
import { SlideDetailPanel } from '@/components/editor/SlideDetailPanel'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import api from '@/services/api'
import { conversionSlideImageUrl } from '@/utils/slideImage'
import type { Conversion, Slide, SlideTextStyle, Theme } from '@/types' // eslint-disable-line @typescript-eslint/no-unused-vars
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

const FONT_OPTIONS = [
  'Plus Jakarta Sans',
  'Arial',
  'Georgia',
  'Times New Roman',
  'Verdana',
]

const FONT_WEIGHTS = [
  { label: 'Regular', value: 400 },
  { label: 'Medium', value: 500 },
  { label: 'Semi Bold', value: 600 },
  { label: 'Bold', value: 700 },
  { label: 'Extra Bold', value: 800 },
]

const COLOR_SWATCHES = ['#FFFFFF', '#111827', '#0F6E56', '#2563EB', '#7C3AED', '#F59E0B', '#EF4444']

type TextEditTarget = {
  field: 'title' | 'bullet'
  bulletIndex?: number
  fullText: string
  selectedText: string
  selectedStart?: number
  rect: DOMRect
}

type TextEditState = {
  field: 'title' | 'bullet'
  bulletIndex?: number
  fullText: string
  selectedText: string
  selectedStart?: number
  value: string
  style: SlideTextStyle
  top: number
  left: number
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

function bgIsDark(hex: string): boolean {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16) || 0
  const g = parseInt(h.slice(2, 4), 16) || 0
  const b = parseInt(h.slice(4, 6), 16) || 0
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5
}

function SlideContainer({ style, showWatermark, logoUrl, hasUserBg, children }: {
  style: React.CSSProperties
  showWatermark?: boolean
  logoUrl?: string | null
  hasUserBg?: boolean
  children: React.ReactNode
}) {
  const dark = bgIsDark((style.backgroundColor as string) ?? '#1e2a3a')
  const watermarkColor = hasUserBg
    ? 'rgba(255,255,255,0.55)'
    : dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'
  const watermarkShadow = hasUserBg ? '0 1px 4px rgba(0,0,0,0.65)' : undefined
  return (
    <div className="w-full rounded-xl overflow-hidden shadow-2xl" style={style}>
      {children}
      {logoUrl && (
        <img
          src={logoUrl}
          alt="Client logo"
          style={{
            position: 'absolute', bottom: '3.5%', left: '3.5%',
            maxHeight: '10%', maxWidth: '18%', objectFit: 'contain',
            pointerEvents: 'none', userSelect: 'none', zIndex: 20,
            opacity: 0.85,
          }}
        />
      )}
      {showWatermark && (
        <span
          style={{
            position: 'absolute', bottom: '3.5%', right: '3.5%',
            pointerEvents: 'none', userSelect: 'none', zIndex: 20,
            fontSize: 'clamp(7px, 1vw, 13px)', fontWeight: 900, letterSpacing: '0.28em',
            color: watermarkColor,
            textShadow: watermarkShadow,
            fontFamily: '"Plus Jakarta Sans", sans-serif',
          }}
        >
          WAC
        </span>
      )}
    </div>
  )
}

function SlidePreview({
  slide,
  theme,
  showWatermark,
  logoUrl,
  onTextEdit,
  onUpdateText,
  onTypoFocus,
}: {
  slide: Slide
  theme: Theme
  showWatermark?: boolean
  logoUrl?: string | null
  onTextEdit?: (target: TextEditTarget) => void
  onUpdateText?: (field: 'title' | 'bullet', value: string, bulletIndex?: number) => void
  onTypoFocus?: (field: 'title' | 'bullet', bulletIndex?: number) => void
}) {
  const bullets: string[] = slide.bullets ?? []
  const layout = slide.layout || 'bullets'
  const accentColor = COLOR_SCHEME_MAP[slide.color_scheme] ?? theme.accent
  const radius = SHAPE_RADIUS[slide.shape_style] ?? '0px'
  const mergeTextStyle = (
    base: React.CSSProperties,
    field: 'title' | 'bullet',
    bulletIndex?: number
  ): React.CSSProperties => {
    const saved = field === 'title'
      ? slide.text_styles?.title
      : bulletIndex !== undefined
        ? slide.text_styles?.bullets?.[String(bulletIndex)]
        : undefined

    if (!saved) return base
    return {
      ...base,
      ...(saved.fontFamily && { fontFamily: `"${saved.fontFamily}", sans-serif` }),
      ...(saved.fontWeight && { fontWeight: saved.fontWeight }),
      ...(saved.fontSize && { fontSize: `${saved.fontSize}px` }),
      ...(saved.color && { color: saved.color }),
      ...(saved.italic !== undefined && { fontStyle: saved.italic ? 'italic' : 'normal' }),
    }
  }

  const clickable = !!onTextEdit
  const openEditor = (
    e: React.MouseEvent<HTMLElement>,
    field: 'title' | 'bullet',
    fullText: string,
    bulletIndex?: number
  ) => {
    if (!onTextEdit || !fullText) return
    const selection = window.getSelection()
    const hasSelection = !!selection?.toString().trim() && selection.rangeCount > 0
    const range = hasSelection && selection ? selection.getRangeAt(0) : null
    const selectedFromThisElement = !!range && e.currentTarget.contains(range.commonAncestorContainer)
    const selectedText =
      selectedFromThisElement
        ? selection?.toString().trim() ?? fullText
        : fullText
    const rect = selectedFromThisElement
      ? range.getBoundingClientRect()
      : e.currentTarget.getBoundingClientRect()
    e.stopPropagation()
    onTextEdit({ field, bulletIndex, fullText, selectedText, rect })
  }
  const isInlineEditable = !!onUpdateText

  const handleInlineTextBlur = (
    e: React.FocusEvent<HTMLElement>,
    field: 'title' | 'bullet',
    text: string,
    bulletIndex?: number
  ) => {
    const rawValue = e.currentTarget.innerText.trim()
    const placeholder = field === 'title' && !text ? 'Untitled Slide' : ''
    const nextValue = rawValue === placeholder ? '' : rawValue
    if (nextValue !== text && onUpdateText) {
      onUpdateText(field, nextValue, bulletIndex)
    }
  }

  const handleInlineTextKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      ;(e.currentTarget as HTMLElement).blur()
    }
  }

  const editableProps = (
    field: 'title' | 'bullet',
    text: string,
    bulletIndex?: number
  ): React.HTMLAttributes<HTMLElement> => {
    if (!isInlineEditable) return tx(field, text, bulletIndex)
    return {
      contentEditable: true,
      suppressContentEditableWarning: true,
      spellCheck: false,
      onFocus: () => onTypoFocus?.(field, bulletIndex),
      onBlur: (e) => handleInlineTextBlur(e, field, text, bulletIndex),
      onKeyDown: handleInlineTextKeyDown,
    }
  }

  const tx = (
    field: 'title' | 'bullet',
    text: string,
    bulletIndex?: number
  ): React.HTMLAttributes<HTMLElement> => !clickable || !text ? {} : {
    onMouseUp: (e) => {
      if (window.getSelection()?.toString().trim()) openEditor(e, field, text, bulletIndex)
    },
    onClick: (e) => {
      onTypoFocus?.(field, bulletIndex)
      if (window.getSelection()?.toString().trim()) return
      openEditor(e, field, text, bulletIndex)
    },
    title: 'Click or select text to edit',
  }

  const containerStyle: React.CSSProperties = {
    aspectRatio: '16/9',
    position: 'relative',
    backgroundColor: theme.bg,
    backgroundImage: slide.background_image_url
      ? `url(${slide.background_image_url})`
      : `url(/themes/${theme.id}.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
  }

  // ── hero ──────────────────────────────────────────────────────────────────
  if (layout === 'hero') {
    const subtitle = bullets[0] ?? ''
    const tagline = bullets[1] ?? ''
    return (
      <SlideContainer style={containerStyle} showWatermark={showWatermark} logoUrl={logoUrl} hasUserBg={!!slide.background_image_url}>
        <div
          {...editableProps('title', slide.title)}
          className="absolute font-extrabold leading-tight"
          style={mergeTextStyle({ top: '28%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(18px, 3.5vw, 42px)', cursor: isInlineEditable ? 'text' : (clickable && slide.title ? 'pointer' : undefined) }, 'title')}
        >
          {slide.title || 'Untitled Slide'}
        </div>
        <div
          className="absolute rounded-full"
          style={{ top: '60%', left: '7%', width: '20%', height: '0.7%', backgroundColor: accentColor }}
        />
        {subtitle && (
          <div
            {...editableProps('bullet', subtitle, 0)}
            className="absolute"
            style={mergeTextStyle({ top: '65%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(9px, 1.6vw, 18px)', opacity: 0.85, cursor: clickable ? 'pointer' : undefined }, 'bullet', 0)}
          >
            {subtitle}
          </div>
        )}
        {tagline && (
          <div
            {...editableProps('bullet', tagline, 1)}
            className="absolute"
            style={mergeTextStyle({ top: '75%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(7px, 1.2vw, 14px)', opacity: 0.65, cursor: clickable ? 'pointer' : undefined }, 'bullet', 1)}
          >
            {tagline}
          </div>
        )}
      </SlideContainer>
    )
  }

  // ── two_column ────────────────────────────────────────────────────────────
  if (layout === 'two_column') {
    const sections: { header: string; items: { text: string; index: number }[] }[] = []
    let cur: { header: string; items: { text: string; index: number }[] } | null = null
    bullets.forEach((b, index) => {
      if (b.startsWith('## ')) {
        if (cur) sections.push(cur)
        cur = { header: b.slice(3), items: [] }
      } else {
        if (!cur) cur = { header: 'Key Points', items: [] }
        cur.items.push({ text: b, index })
      }
    })
    if (cur) sections.push(cur)
    const leftSection = sections[0] ?? {
      header: 'Key Points',
      items: bullets.slice(0, Math.ceil(bullets.length / 2)).map((text, index) => ({ text, index })),
    }
    const rightSection = sections[1] ?? {
      header: 'Details',
      items: bullets.slice(Math.ceil(bullets.length / 2)).map((text, index) => ({
        text,
        index: index + Math.ceil(bullets.length / 2),
      })),
    }

    return (
      <SlideContainer style={containerStyle} showWatermark={showWatermark} logoUrl={logoUrl} hasUserBg={!!slide.background_image_url}>
        <div
          {...editableProps('title', slide.title)}
          className="absolute font-extrabold leading-tight"
          style={mergeTextStyle({ top: '7%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(10px, 1.8vw, 22px)', cursor: clickable && slide.title ? 'pointer' : undefined }, 'title')}
        >
          {slide.title || 'Untitled Slide'}
        </div>
        <div className="absolute rounded-full" style={{ top: '26%', left: '7%', width: '20%', height: '0.7%', backgroundColor: accentColor }} />
        {/* Left column */}
        <div className="absolute" style={{ top: '29%', left: '7%', width: '43%' }}>
          <div className="flex items-center px-2 py-1 mb-2" style={{ backgroundColor: accentColor, borderRadius: radius }}>
            <span className="text-white font-bold" style={{ fontSize: 'clamp(6px, 0.85vw, 10px)' }}>{leftSection.header}</span>
          </div>
          {leftSection.items.map((item) => (
            <div key={item.index} {...editableProps('bullet', item.text, item.index)} className="flex items-start" style={{ marginBottom: '1.5%', cursor: clickable ? 'pointer' : undefined }}>
              <span style={{ color: accentColor, marginRight: '3%', fontSize: 'clamp(7px, 1vw, 11px)', lineHeight: 1.4 }}>●</span>
              <span style={mergeTextStyle({ color: theme.text, fontSize: 'clamp(7px, 1vw, 11px)', lineHeight: 1.4, opacity: 0.92 }, 'bullet', item.index)}>{item.text}</span>
            </div>
          ))}
        </div>
        {/* Right column */}
        <div className="absolute" style={{ top: '29%', left: '53%', right: '7%' }}>
          <div className="flex items-center px-2 py-1 mb-2" style={{ backgroundColor: lighterHex(accentColor, 20), borderRadius: radius }}>
            <span className="text-white font-bold" style={{ fontSize: 'clamp(6px, 0.85vw, 10px)' }}>{rightSection.header}</span>
          </div>
          {rightSection.items.map((item) => (
            <div key={item.index} {...editableProps('bullet', item.text, item.index)} className="flex items-start" style={{ marginBottom: '1.5%', cursor: clickable ? 'pointer' : undefined }}>
              <span style={{ color: accentColor, marginRight: '3%', fontSize: 'clamp(7px, 1vw, 11px)', lineHeight: 1.4 }}>●</span>
              <span style={mergeTextStyle({ color: theme.text, fontSize: 'clamp(7px, 1vw, 11px)', lineHeight: 1.4, opacity: 0.92 }, 'bullet', item.index)}>{item.text}</span>
            </div>
          ))}
        </div>
      </SlideContainer>
    )
  }

  // ── data_table ────────────────────────────────────────────────────────────
  if (layout === 'data_table') {
    const valueBg = lighterHex(theme.bg, 35)

    return (
      <SlideContainer style={containerStyle} showWatermark={showWatermark} logoUrl={logoUrl} hasUserBg={!!slide.background_image_url}>
        <div
          {...editableProps('title', slide.title)}
          className="absolute font-extrabold leading-tight"
          style={mergeTextStyle({ top: '7%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(10px, 1.7vw, 20px)', cursor: clickable && slide.title ? 'pointer' : undefined }, 'title')}
        >
          {slide.title || 'Untitled Slide'}
        </div>
        <div className="absolute overflow-hidden" style={{ top: '26%', left: '7%', right: '7%', bottom: '4%' }}>
          {bullets.map((b, i) => {
            const sepIdx = b.indexOf(': ')
            const label = sepIdx !== -1 ? b.slice(0, sepIdx) : b
            const value = sepIdx !== -1 ? b.slice(sepIdx + 2) : ''
            const labelBg = i % 2 === 0 ? accentColor : lighterHex(accentColor, 25)
            return (
              <div key={i} {...editableProps('bullet', b, i)} className="flex" style={{ height: '9%', marginBottom: '1%', cursor: clickable ? 'pointer' : undefined }}>
                <div className="flex items-center flex-shrink-0" style={{ width: '38%', backgroundColor: labelBg, paddingLeft: '3%', paddingRight: '2%' }}>
                  <span className="font-bold truncate" style={mergeTextStyle({ color: '#FFFFFF', fontSize: 'clamp(6px, 0.9vw, 11px)' }, 'bullet', i)}>{label}</span>
                </div>
                <div className="flex items-center flex-1" style={{ backgroundColor: valueBg, paddingLeft: '3%', paddingRight: '2%' }}>
                  <span className="truncate" style={mergeTextStyle({ color: theme.text, fontSize: 'clamp(6px, 0.9vw, 11px)' }, 'bullet', i)}>{value || '—'}</span>
                </div>
              </div>
            )
          })}
        </div>
      </SlideContainer>
    )
  }

  // ── timeline ──────────────────────────────────────────────────────────────
  if (layout === 'timeline') {
    return (
      <SlideContainer style={containerStyle} showWatermark={showWatermark} logoUrl={logoUrl} hasUserBg={!!slide.background_image_url}>
        <div
          {...editableProps('title', slide.title)}
          className="absolute font-extrabold leading-tight"
          style={mergeTextStyle({ top: '7%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(10px, 1.8vw, 22px)', cursor: clickable && slide.title ? 'pointer' : undefined }, 'title')}
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
              <div key={i} {...editableProps('bullet', b, i)} style={{ display: 'flex', alignItems: 'center', flex: 1, minHeight: 0, cursor: clickable ? 'pointer' : undefined }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: accentColor, flexShrink: 0, marginRight: '2.5%', zIndex: 1 }} />
                <span style={mergeTextStyle({ color: accentColor, fontWeight: 700, fontSize: 'clamp(7px, 1vw, 11px)' }, 'bullet', i)}>{label}</span>
                {desc && <span style={mergeTextStyle({ color: theme.text, fontSize: 'clamp(6px, 0.85vw, 10px)', opacity: 0.8, marginLeft: '1.5%' }, 'bullet', i)}>{desc}</span>}
              </div>
            )
          })}
        </div>
      </SlideContainer>
    )
  }

  // ── big_stat ───────────────────────────────────────────────────────────────
  if (layout === 'big_stat') {
    const stats = bullets.slice(0, 3)
    return (
      <SlideContainer style={containerStyle} showWatermark={showWatermark} logoUrl={logoUrl} hasUserBg={!!slide.background_image_url}>
        <div
          {...editableProps('title', slide.title)}
          className="absolute font-extrabold leading-tight"
          style={mergeTextStyle({ top: '7%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(10px, 1.8vw, 22px)', cursor: clickable && slide.title ? 'pointer' : undefined }, 'title')}
        >
          {slide.title || 'Untitled Slide'}
        </div>
        <div className="absolute flex gap-[2%]" style={{ top: '34%', left: '7%', right: '7%', bottom: '8%' }}>
          {stats.map((b, i) => {
            const sepIdx = b.indexOf(': ')
            const label = sepIdx !== -1 ? b.slice(0, sepIdx) : 'Metric'
            const value = sepIdx !== -1 ? b.slice(sepIdx + 2) : b
            return (
              <div key={i} {...editableProps('bullet', b, i)} className="relative flex flex-col overflow-hidden flex-1" style={{ backgroundColor: lighterHex(theme.bg, 30), borderRadius: radius, cursor: clickable ? 'pointer' : undefined }}>
                <div style={{ height: 4, backgroundColor: accentColor, flexShrink: 0 }} />
                <div style={{ padding: '8% 10%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={mergeTextStyle({ color: accentColor, fontWeight: 800, fontSize: 'clamp(14px, 2.4vw, 30px)', lineHeight: 1.1 }, 'bullet', i)}>{value}</div>
                  <div style={mergeTextStyle({ color: theme.text, fontSize: 'clamp(6px, 0.9vw, 11px)', opacity: 0.75, marginTop: '6%' }, 'bullet', i)}>{label}</div>
                </div>
              </div>
            )
          })}
        </div>
      </SlideContainer>
    )
  }

  // ── process ────────────────────────────────────────────────────────────────
  if (layout === 'process') {
    const steps = bullets.slice(0, 5)
    return (
      <SlideContainer style={containerStyle} showWatermark={showWatermark} logoUrl={logoUrl} hasUserBg={!!slide.background_image_url}>
        <div
          {...editableProps('title', slide.title)}
          className="absolute font-extrabold leading-tight"
          style={mergeTextStyle({ top: '7%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(10px, 1.8vw, 22px)', cursor: clickable && slide.title ? 'pointer' : undefined }, 'title')}
        >
          {slide.title || 'Untitled Slide'}
        </div>
        <div className="absolute rounded-full" style={{ top: '26%', left: '7%', width: '20%', height: '0.7%', backgroundColor: accentColor }} />
        <div className="absolute flex items-stretch gap-[1.5%]" style={{ top: '31%', left: '7%', right: '7%', bottom: '8%' }}>
          {steps.map((b, i) => (
            <div key={i} className="flex items-center" style={{ flex: '1 1 0' }}>
              <div {...editableProps('bullet', b, i)} className="flex flex-col overflow-hidden flex-1 h-full" style={{ backgroundColor: i % 2 === 0 ? accentColor : lighterHex(accentColor, 30), borderRadius: radius, cursor: clickable ? 'pointer' : undefined }}>
                <div className="flex items-center justify-center font-bold text-white flex-shrink-0" style={{ height: '30%', fontSize: 'clamp(8px, 1.3vw, 16px)', backgroundColor: lighterHex(accentColor, -20), borderRadius: `${radius} ${radius} 0 0` }}>
                  {i + 1}
                </div>
                <div style={mergeTextStyle({ padding: '5% 8%', color: '#fff', fontSize: 'clamp(5px, 0.8vw, 9px)', lineHeight: 1.4, overflow: 'hidden' }, 'bullet', i)}>{b}</div>
              </div>
              {i < steps.length - 1 && (
                <span style={{ color: accentColor, fontSize: 'clamp(8px, 1.2vw, 14px)', flexShrink: 0, padding: '0 2%' }}>→</span>
              )}
            </div>
          ))}
        </div>
      </SlideContainer>
    )
  }

  // ── quote ──────────────────────────────────────────────────────────────────
  if (layout === 'quote') {
    const quoteText = bullets[0] ?? ''
    const attribution = bullets[1] ?? ''
    return (
      <SlideContainer style={containerStyle} showWatermark={showWatermark} logoUrl={logoUrl} hasUserBg={!!slide.background_image_url}>
        <div
          {...editableProps('title', slide.title)}
          className="absolute"
          style={mergeTextStyle({ top: '7%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(8px, 1.3vw, 15px)', opacity: 0.6, cursor: clickable && slide.title ? 'pointer' : undefined }, 'title')}
        >
          {slide.title}
        </div>
        <div className="absolute font-extrabold leading-none" style={{ top: '18%', left: '7%', color: accentColor, fontSize: 'clamp(24px, 5vw, 60px)', lineHeight: 1 }}>
          &ldquo;
        </div>
        {quoteText && (
          <div
            {...editableProps('bullet', quoteText, 0)}
            className="absolute leading-snug"
            style={mergeTextStyle({ top: '26%', left: '14%', right: '7%', color: theme.text, fontSize: 'clamp(9px, 1.5vw, 18px)', fontStyle: 'italic', cursor: clickable ? 'pointer' : undefined }, 'bullet', 0)}
          >
            {quoteText}
          </div>
        )}
        <div className="absolute rounded-full" style={{ top: '74%', left: '7%', width: '20%', height: '0.7%', backgroundColor: accentColor }} />
        {attribution && (
          <div
            {...editableProps('bullet', attribution, 1)}
            className="absolute text-right"
            style={mergeTextStyle({ top: '78%', right: '7%', color: theme.text, fontSize: 'clamp(7px, 1vw, 11px)', opacity: 0.7, cursor: clickable ? 'pointer' : undefined }, 'bullet', 1)}
          >
            — {attribution}
          </div>
        )}
      </SlideContainer>
    )
  }

  // ── bullets (default) ─────────────────────────────────────────────────────
  return (
    <SlideContainer style={containerStyle} showWatermark={showWatermark} logoUrl={logoUrl} hasUserBg={!!slide.background_image_url}>
      <div
        {...editableProps('title', slide.title)}
        className="absolute font-extrabold leading-tight"
        style={mergeTextStyle({ top: '7%', left: '7%', right: '7%', color: theme.text, fontSize: 'clamp(11px, 2vw, 26px)', cursor: clickable && slide.title ? 'pointer' : undefined }, 'title')}
      >
        {slide.title || 'Untitled Slide'}
      </div>
      <div className="absolute rounded-full" style={{ top: '26%', left: '7%', width: '20%', height: '0.7%', backgroundColor: accentColor }} />
      <div className="absolute overflow-hidden" style={{ top: '29%', left: '7%', right: '7%', bottom: '4%' }}>
        {bullets.map((b, i) => (
          <div key={i} {...editableProps('bullet', b, i)} className="flex items-start" style={{ marginBottom: '2%', cursor: clickable ? 'pointer' : undefined }}>
            <span
              className="flex-shrink-0 rounded-full"
              style={{ backgroundColor: accentColor, width: '0.6em', height: '0.6em', minWidth: '0.6em', marginTop: '0.35em', marginRight: '0.6em', fontSize: 'clamp(9px, 1.3vw, 14px)' }}
            />
            <span style={mergeTextStyle({ color: theme.text, fontSize: 'clamp(9px, 1.3vw, 14px)', lineHeight: 1.45, opacity: 0.92 }, 'bullet', i)}>
              {b}
            </span>
          </div>
        ))}
      </div>
    </SlideContainer>
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
function EditorBar({ conversionId, conversionName, isSaving, hasError, backTo, showWatermark, onToggleWatermark }: {
  conversionId: string
  conversionName?: string
  isSaving?: boolean
  hasError?: boolean
  backTo?: { path: string; label: string }
  showWatermark?: boolean
  onToggleWatermark?: () => void
}) {
  const isDirty = useEditorStore((s) => s.isDirty)
  const name = (conversionName?.replace(/\.[^.]+$/, '') ?? 'Untitled Presentation')
    .replace(/[^a-zA-Z0-9\s-]/g, '').trim().slice(0, 40).trimEnd()
  const [exportingFormat, setExportingFormat] = useState<'pptx' | 'pdf' | 'docx' | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleExport = async (format: 'pptx' | 'pdf' | 'docx') => {
    setDropdownOpen(false)
    setExportingFormat(format)
    const mimeMap = {
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }
    try {
      const { data } = await api.post<{ download_url: string }>(`/conversions/${conversionId}/export?format=${format}`)
      const url = data.download_url
      const apiBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
      const stripScheme = (u: string) => u.replace(/^https?:\/\//, '').replace(/^(127\.0\.0\.1|0\.0\.0\.0)(?=:)/, 'localhost')
      const isLocalUrl = apiBase && stripScheme(url).startsWith(stripScheme(apiBase))
      if (isLocalUrl) {
        const path = url.replace(/^https?:\/\/[^/]+\/api\/v1/, '')
        const res = await api.get(path, { responseType: 'blob' })
        const blob = new Blob([res.data], { type: mimeMap[format] })
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = `${name}.${format}`
        a.click()
        URL.revokeObjectURL(blobUrl)
      } else {
        window.open(url, '_blank')
      }
    } catch {
      toast.error('Export failed. Please try again.')
    } finally {
      setExportingFormat(null)
    }
  }

  return (
    <header className="flex-shrink-0 bg-white border-b border-pm-border flex items-center justify-between px-5" style={{ minHeight: '52px' }}>
      {/* Left: nav */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to={backTo?.path ?? '/projects'}
          replace
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

        {/* Watermark toggle */}
        <button
          onClick={onToggleWatermark}
          title={showWatermark ? 'Hide watermark' : 'Show watermark'}
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors',
            showWatermark
              ? 'border-pm-border text-pm-muted hover:text-pm-primary hover:border-gray-300'
              : 'border-transparent text-pm-muted/50 hover:text-pm-muted'
          )}
        >
          {showWatermark ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          )}
          WAC
        </button>

        {/* Split export button with dropdown */}
        <div className="relative flex">
          <Button
            size="sm"
            loading={exportingFormat === 'pptx'}
            disabled={exportingFormat !== null}
            className="rounded-r-none border-r border-r-white/20"
            onClick={() => handleExport('pptx')}
          >
            <svg className="w-3.5 h-3.5 mr-1.5 inline-block -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {exportingFormat ? `Exporting ${exportingFormat.toUpperCase()}…` : 'Export & Download'}
          </Button>
          <button
            disabled={exportingFormat !== null}
            className="flex items-center px-2 bg-pm-teal hover:bg-pm-teal-hover text-white rounded-r-md border-l border-l-white/20 transition-colors disabled:opacity-50"
            onClick={() => setDropdownOpen((o) => !o)}
            aria-label="More export formats"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-pm-border rounded-lg shadow-lg py-1 min-w-[160px]">
                {([
                  { fmt: 'pptx', label: 'Download PPTX' },
                  { fmt: 'pdf',  label: 'Download PDF' },
                  { fmt: 'docx', label: 'Download Word' },
                ] as { fmt: 'pptx' | 'pdf' | 'docx'; label: string }[]).map(({ fmt, label }) => (
                  <button
                    key={fmt}
                    className="w-full text-left px-4 py-2 text-sm text-pm-primary hover:bg-gray-50 transition-colors"
                    onClick={() => handleExport(fmt)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const fromState = (location.state as { from?: string } | null)?.from
  const backTo =
    fromState === 'dashboard'       ? { path: '/dashboard',         label: 'Dashboard'        } :
    fromState === 'templates'       ? { path: '/templates',         label: 'Templates'        } :
    fromState === 'admin'           ? { path: '/admin/projects',    label: 'Admin Projects'   } :
    fromState === 'admin-templates' ? { path: '/admin/templates',   label: 'Admin Templates'  } :
                                      { path: '/projects',          label: 'Projects'         }
  const queryClient = useQueryClient()
  useEffect(() => {
    if (fromState === 'admin') {
      return () => { void queryClient.invalidateQueries({ queryKey: ['admin-conversions'] }) }
    }
  }, [fromState, queryClient])

  const { setSlides, setConversionId, setActiveSlide, slides, activeSlideId, updateSlide, markSaved } = useEditorStore()
  const [showWatermark, setShowWatermark] = useState(true)
  const [showOriginal, setShowOriginal] = useState(false)
  const [origError, setOrigError] = useState(false)
  const initialActiveSet = useRef(false)
  const editInputRef = useRef<HTMLTextAreaElement>(null)

  const { data: conversion, isLoading, isFetching, isError, error } = useQuery<Conversion>({
    queryKey: ['conversion', id],
    queryFn: async () => {
      const res = await api.get(`/conversions/${id}`)
      return res.data
    },
    enabled: !!id,
    retry: 1,
    staleTime: 0,
    refetchOnMount: 'always',
  })

  useEffect(() => {
    if (!conversion) return
    setConversionId(conversion.id)
    if (conversion.slides && !initialActiveSet.current && !isFetching) {
      initialActiveSet.current = true
      setSlides(conversion.slides)
      const first = conversion.slides.find((s) => !s.is_deleted)
      if (first) setActiveSlide(first.id)
    }
  }, [conversion, isFetching, setSlides, setConversionId, setActiveSlide])

  useEffect(() => {
    if (conversion?.status === 'generating' && id) {
      navigate(`/generating/${id}`, { replace: true })
    }
  }, [conversion?.status, id, navigate])

  const visibleSlides = slides.filter((s) => !s.is_deleted)
  const activeSlide = visibleSlides.find((s) => s.id === activeSlideId)
  const activeIndex = visibleSlides.findIndex((s) => s.id === activeSlideId)
  const theme = THEMES.find((t) => t.id === conversion?.theme) ?? THEMES[THEMES.length - 1]

  const [textEditor, setTextEditor] = useState<TextEditState | null>(null)
  const [typoFocus, setTypoFocus] = useState<string>('title')

  // Reset typo focus to title whenever the active slide changes
  useEffect(() => { setTypoFocus('title') }, [activeSlideId])

  useEffect(() => {
    if (!textEditor) return
    requestAnimationFrame(() => {
      editInputRef.current?.focus()
      editInputRef.current?.select()
    })
  }, [textEditor])

  const openTextEditor = (target: TextEditTarget) => {
    const savedStyle = target.field === 'title'
      ? activeSlide?.text_styles?.title
      : target.bulletIndex !== undefined
        ? activeSlide?.text_styles?.bullets?.[String(target.bulletIndex)]
        : undefined
    setTextEditor({
      field: target.field,
      bulletIndex: target.bulletIndex,
      fullText: target.fullText,
      selectedText: target.selectedText,
      selectedStart: target.selectedStart,
      value: target.selectedText,
      style: {
        fontFamily: 'Plus Jakarta Sans',
        fontWeight: target.field === 'title' ? 800 : 400,
        fontSize: target.field === 'title' ? 42 : 18,
        color: theme.text,
        italic: false,
        ...savedStyle,
      },
      top: Math.max(72, target.rect.top - 10),
      left: target.rect.left + target.rect.width / 2,
    })
  }

  const closeTextEditor = () => {
    window.getSelection()?.removeAllRanges()
    setTextEditor(null)
  }

  const saveTextEditor = () => {
    if (!activeSlide || !textEditor) return
    const replacement = textEditor.value.trim()
    if (!replacement) return

    const selectedIndex = textEditor.selectedStart ?? textEditor.fullText.indexOf(textEditor.selectedText)
    const nextText =
      textEditor.selectedText !== textEditor.fullText && selectedIndex >= 0
        ? `${textEditor.fullText.slice(0, selectedIndex)}${replacement}${textEditor.fullText.slice(selectedIndex + textEditor.selectedText.length)}`
        : replacement

    if (textEditor.field === 'title') {
      updateSlide(activeSlide.id, {
        title: nextText,
        text_styles: {
          ...(activeSlide.text_styles ?? {}),
          title: textEditor.style,
        },
      })
    } else if (textEditor.bulletIndex !== undefined) {
      const bullets = [...activeSlide.bullets]
      bullets[textEditor.bulletIndex] = nextText
      updateSlide(activeSlide.id, {
        bullets,
        text_styles: {
          ...(activeSlide.text_styles ?? {}),
          bullets: {
            ...(activeSlide.text_styles?.bullets ?? {}),
            [String(textEditor.bulletIndex)]: textEditor.style,
          },
        },
      })
    }

    closeTextEditor()
  }

  const { isSaving, hasError } = useAutoSave({
    slideId: activeSlide?.id ?? '',
    content: activeSlide
      ? JSON.stringify({ title: activeSlide.title, bullets: activeSlide.bullets, text_styles: activeSlide.text_styles, speaker_notes: activeSlide.speaker_notes, layout: activeSlide.layout, color_scheme: activeSlide.color_scheme, shape_style: activeSlide.shape_style })
      : '',
    onSave: async () => {
      if (!activeSlide) return
      await api.patch(`/slides/${activeSlide.id}`, {
        title: activeSlide.title,
        bullets: activeSlide.bullets,
        text_styles: activeSlide.text_styles ?? {},
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
    const status = (error as { response?: { status?: number } })?.response?.status
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-pm-muted">
        <p className="font-medium text-pm-primary">
          {status === 404 ? 'Presentation not found.' : 'Failed to load presentation.'}
        </p>
        <p className="text-sm">
          {status === 404
            ? 'It may have been deleted or you may not have access.'
            : 'Something went wrong. Please try again.'}
        </p>
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
        showWatermark={showWatermark}
        onToggleWatermark={() => setShowWatermark((v) => !v)}
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
                  onClick={() => { setOrigError(false); setShowOriginal((v) => !v) }}
                  title="Toggle the original uploaded design (template decks)"
                  className={cn(
                    'px-2.5 h-7 rounded-lg border text-xs font-medium transition-colors mr-1',
                    showOriginal
                      ? 'border-pm-teal bg-[#E1F5EE] text-pm-teal'
                      : 'border-pm-border text-pm-muted hover:text-pm-primary'
                  )}
                >
                  {showOriginal ? 'Editing view' : 'Original design'}
                </button>
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
              showOriginal ? (
                <div className="w-full max-w-4xl drop-shadow-2xl">
                  {origError ? (
                    <div className="bg-white rounded-xl border border-pm-border p-10 text-center text-sm text-pm-muted">
                      This deck has no original uploaded design (it wasn't created from an
                      uploaded template). Use “Editing view”.
                    </div>
                  ) : (
                    <img
                      src={conversionSlideImageUrl(id ?? '', activeIndex)}
                      alt={`Original slide ${activeIndex + 1}`}
                      onError={() => setOrigError(true)}
                      className="w-full rounded-xl border border-pm-border bg-white"
                    />
                  )}
                  <p className="text-center text-xs text-pm-muted mt-2">
                    Original uploaded design (read-only). Text edits apply on export.
                  </p>
                </div>
              ) : (
              <div className="w-full max-w-4xl drop-shadow-2xl">
                <SlidePreview
                  slide={activeSlide}
                  theme={theme}
                  showWatermark={showWatermark}
                  logoUrl={conversion?.client_logo_url}
                  onTextEdit={openTextEditor}
                  onTypoFocus={(field, bulletIndex) =>
                    setTypoFocus(field === 'title' ? 'title' : `bullet_${bulletIndex ?? 0}`)
                  }
                  onUpdateText={(field, value, bulletIndex) => {
                    if (field === 'title') {
                      updateSlide(activeSlide.id, { title: value })
                    } else if (bulletIndex !== undefined) {
                      const bullets = [...activeSlide.bullets]
                      bullets[bulletIndex] = value
                      updateSlide(activeSlide.id, { bullets })
                    }
                  }}
                />
              </div>
              )
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
            <SlideDetailPanel
              typoFocus={typoFocus}
            />
          </div>
        </aside>

      </div>

      {textEditor && (
        <div
          className="fixed z-50 w-[380px] -translate-x-1/2 -translate-y-full rounded-xl border border-pm-border bg-white p-3 shadow-2xl"
          style={{ top: textEditor.top, left: textEditor.left }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-pm-muted">
              Text Editor
            </p>
            <button
              type="button"
              onClick={closeTextEditor}
              className="h-6 w-6 rounded-md text-pm-muted hover:bg-gray-100 hover:text-pm-primary"
              aria-label="Close text editor"
            >
              ×
            </button>
          </div>
          <textarea
            ref={editInputRef}
            rows={2}
            value={textEditor.value}
            onChange={(e) => setTextEditor({ ...textEditor, value: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                closeTextEditor()
              }
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                saveTextEditor()
              }
            }}
            className="w-full resize-none rounded-lg border border-pm-border bg-white px-3 py-2 text-sm text-pm-primary outline-none transition focus:ring-2 focus:ring-pm-teal"
          />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-pm-muted">Font</span>
              <select
                value={textEditor.style.fontFamily ?? 'Plus Jakarta Sans'}
                onChange={(e) => setTextEditor({ ...textEditor, style: { ...textEditor.style, fontFamily: e.target.value } })}
                className="h-9 w-full rounded-lg border border-pm-border bg-white px-2 text-xs text-pm-primary outline-none focus:ring-2 focus:ring-pm-teal"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-pm-muted">Weight</span>
              <select
                value={textEditor.style.fontWeight ?? 400}
                onChange={(e) => setTextEditor({ ...textEditor, style: { ...textEditor.style, fontWeight: Number(e.target.value) } })}
                className="h-9 w-full rounded-lg border border-pm-border bg-white px-2 text-xs text-pm-primary outline-none focus:ring-2 focus:ring-pm-teal"
              >
                {FONT_WEIGHTS.map((weight) => (
                  <option key={weight.value} value={weight.value}>{weight.label}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-pm-muted">Size</span>
              <input
                type="number"
                min={6}
                max={96}
                value={textEditor.style.fontSize ?? 18}
                onChange={(e) => setTextEditor({ ...textEditor, style: { ...textEditor.style, fontSize: Number(e.target.value) } })}
                className="h-9 w-full rounded-lg border border-pm-border bg-white px-2 text-xs text-pm-primary outline-none focus:ring-2 focus:ring-pm-teal"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-pm-muted">Color</span>
              <div className="flex h-9 items-center gap-2 rounded-lg border border-pm-border px-2">
                <input
                  type="color"
                  value={textEditor.style.color ?? theme.text}
                  onChange={(e) => setTextEditor({ ...textEditor, style: { ...textEditor.style, color: e.target.value } })}
                  className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-xs text-pm-primary">{textEditor.style.color ?? theme.text}</span>
              </div>
            </label>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {COLOR_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setTextEditor({ ...textEditor, style: { ...textEditor.style, color } })}
                  className="h-6 w-6 rounded-full border border-pm-border ring-offset-2 transition hover:ring-2 hover:ring-pm-teal"
                  style={{ backgroundColor: color }}
                  aria-label={`Set color ${color}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setTextEditor({ ...textEditor, style: { ...textEditor.style, italic: !textEditor.style.italic } })}
              className={cn(
                'h-8 rounded-lg border px-3 text-xs font-semibold italic transition',
                textEditor.style.italic
                  ? 'border-pm-teal bg-[#E1F5EE] text-pm-teal'
                  : 'border-pm-border text-pm-muted hover:text-pm-primary'
              )}
            >
              I
            </button>
          </div>

          <div
            className="mt-3 rounded-lg border border-pm-border bg-[#F9FAFB] px-3 py-2 text-sm"
            style={{
              fontFamily: `"${textEditor.style.fontFamily ?? 'Plus Jakarta Sans'}", sans-serif`,
              fontWeight: textEditor.style.fontWeight ?? 400,
              fontSize: `${Math.min(32, textEditor.style.fontSize ?? 18)}px`,
              color: textEditor.style.color ?? theme.text,
              fontStyle: textEditor.style.italic ? 'italic' : 'normal',
            }}
          >
            {textEditor.value || 'Preview'}
          </div>

          <div className="mt-3 flex items-center justify-end gap-2 border-t border-pm-border pt-3">
            <button
              type="button"
              onClick={closeTextEditor}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-pm-muted hover:bg-gray-100 hover:text-pm-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveTextEditor}
              disabled={!textEditor.value.trim()}
              className="rounded-lg bg-pm-teal px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0B5F4A] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
