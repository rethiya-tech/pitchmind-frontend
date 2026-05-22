import type { Slide, Theme } from '@/types'
import { resolveSlideBackgroundUrl } from '@/utils/slideImage'

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

export type TextEditTarget = {
  field: 'title' | 'bullet'
  bulletIndex?: number
  fullText: string
  selectedText: string
  selectedStart?: number
  rect: DOMRect
}

export function SlidePreview({
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
      ? `url(${resolveSlideBackgroundUrl(slide.background_image_url)})`
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
