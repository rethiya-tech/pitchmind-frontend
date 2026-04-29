import { useEditorStore } from '@/stores/editorStore'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-1.5 border-b border-pm-border bg-[#F9FAFB]">
      <span className="text-[10px] font-bold text-pm-muted uppercase tracking-widest">{children}</span>
    </div>
  )
}

const inputCls = 'w-full border border-pm-border rounded-lg px-3 py-2 text-xs text-pm-primary bg-white focus:outline-none focus:ring-2 focus:ring-pm-teal transition placeholder:text-gray-300'

export function SlideDetailPanel() {
  const { slides, activeSlideId, updateSlide } = useEditorStore()
  const slide = slides.find((s) => s.id === activeSlideId && !s.is_deleted)

  if (!slide) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-pm-muted px-6">
        <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 7h8M6 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-xs text-center">Select a slide to edit</p>
      </div>
    )
  }

  const handleBulletChange = (i: number, value: string) => {
    const bullets = [...slide.bullets]
    bullets[i] = value
    updateSlide(slide.id, { bullets })
  }

  const handleAddBullet = () => updateSlide(slide.id, { bullets: [...slide.bullets, ''] })

  const handleRemoveBullet = (i: number) =>
    updateSlide(slide.id, { bullets: slide.bullets.filter((_, idx) => idx !== i) })

  return (
    <div className="flex flex-col h-full overflow-y-auto">

      {/* ── Title ── */}
      <SectionLabel>Slide Title</SectionLabel>
      <div className="px-3 py-3">
        <input
          className={inputCls}
          value={slide.title}
          placeholder="Enter slide title…"
          onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
        />
      </div>

      {/* ── Bullets ── */}
      <SectionLabel>Bullet Points</SectionLabel>
      <div className="px-3 py-3 space-y-1.5">
        {slide.bullets.map((bullet, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[#E1F5EE] text-pm-teal text-[9px] font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </span>
            <input
              className="flex-1 border border-pm-border rounded-lg px-2.5 py-1.5 text-xs text-pm-primary bg-white focus:outline-none focus:ring-2 focus:ring-pm-teal transition min-w-0"
              value={bullet}
              placeholder={`Point ${i + 1}`}
              onChange={(e) => handleBulletChange(i, e.target.value)}
            />
            <button
              onClick={() => handleRemoveBullet(i)}
              className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-pm-danger transition-colors"
              aria-label="Remove bullet"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        <button
          onClick={handleAddBullet}
          className="flex items-center gap-1.5 w-full px-2.5 py-1.5 rounded-lg border border-dashed border-pm-border text-[11px] font-medium text-pm-muted hover:border-pm-teal hover:text-pm-teal hover:bg-[#E1F5EE] transition-all"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add bullet point
        </button>
      </div>

      {/* ── Speaker Notes ── */}
      <SectionLabel>Speaker Notes</SectionLabel>
      <div className="px-3 py-3">
        <textarea
          className={`${inputCls} resize-none`}
          rows={4}
          value={slide.speaker_notes}
          placeholder="Add notes for this slide…"
          onChange={(e) => updateSlide(slide.id, { speaker_notes: e.target.value })}
        />
        <p className="text-[10px] text-pm-muted mt-1 text-right tabular-nums">
          {slide.speaker_notes?.length ?? 0} chars
        </p>
      </div>

    </div>
  )
}
