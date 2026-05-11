import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useEditorStore } from '@/stores/editorStore'
import api from '@/services/api'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-1.5 border-b border-pm-border bg-[#F9FAFB]">
      <span className="text-[10px] font-bold text-pm-muted uppercase tracking-widest">{children}</span>
    </div>
  )
}

const inputCls = 'w-full border border-pm-border rounded-lg px-3 py-2 text-xs text-pm-primary bg-white focus:outline-none focus:ring-2 focus:ring-pm-teal transition placeholder:text-gray-300'

const MAX_BULLETS: Record<string, number> = {
  hero: 2,
  bullets: 6,
  two_column: 8,
  data_table: 7,
  timeline: 6,
  big_stat: 3,
  process: 5,
  quote: 2,
}

const AI_EXAMPLES = [
  'Make shapes rounded',
  'Change color to blue',
  'Switch to timeline',
  'Make it concise',
]

interface SlideDetailPanelProps {
  selectionText?: string
  onSelectionConsumed?: () => void
}

export function SlideDetailPanel({ selectionText, onSelectionConsumed }: SlideDetailPanelProps) {
  const { slides, activeSlideId, updateSlide } = useEditorStore()
  const slide = slides.find((s) => s.id === activeSlideId && !s.is_deleted)

  const [activeTab, setActiveTab] = useState<'edit' | 'ai'>('edit')
  const [instruction, setInstruction] = useState('')
  const [applying, setApplying] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!selectionText) return
    setActiveTab('ai')
    setInstruction(`Edit only this selected text: "${selectionText}" — `)
    onSelectionConsumed?.()
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        const len = inputRef.current.value.length
        inputRef.current.setSelectionRange(len, len)
      }
    })
  }, [selectionText, onSelectionConsumed])

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

  const handleApply = async () => {
    const text = instruction.trim()
    if (!text || applying) return
    setApplying(true)
    try {
      const { data } = await api.post<{
        title?: string
        bullets?: string[]
        speaker_notes?: string
        layout?: string
        color_scheme?: string
        shape_style?: string
      }>(`/slides/${slide.id}/ai-enhance`, { instruction: text })

      if (Object.keys(data).length === 0) {
        toast('No changes were needed', { icon: '🤔' })
        return
      }
      const updates = {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.bullets !== undefined && { bullets: data.bullets }),
        ...(data.speaker_notes !== undefined && { speaker_notes: data.speaker_notes }),
        ...(data.layout !== undefined && { layout: data.layout }),
        ...(data.color_scheme !== undefined && { color_scheme: data.color_scheme }),
        ...(data.shape_style !== undefined && { shape_style: data.shape_style }),
      }
      updateSlide(slide.id, updates)
      await api.patch(`/slides/${slide.id}`, updates)
      setInstruction('')
      toast.success('Slide updated')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: { message?: string } } } })
          ?.response?.data?.detail?.message ?? 'AI edit failed — try again'
      toast.error(msg)
    } finally {
      setApplying(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleApply()
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Tab Bar ── */}
      <div className="flex border-b border-pm-border flex-shrink-0">
        <button
          onClick={() => setActiveTab('edit')}
          className={`flex-1 py-2.5 text-[11px] font-semibold transition-colors ${
            activeTab === 'edit'
              ? 'text-pm-primary border-b-2 border-pm-teal bg-white'
              : 'text-pm-muted hover:text-pm-primary'
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-2.5 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'ai'
              ? 'text-amber-600 border-b-2 border-amber-500 bg-white'
              : 'text-pm-muted hover:text-amber-600'
          }`}
        >
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" />
          </svg>
          AI Edit
        </button>
      </div>

      {/* ── Edit Tab ── */}
      {activeTab === 'edit' && (
        <div className="flex-1 overflow-y-auto">

          {/* Title */}
          <SectionLabel>Slide Title</SectionLabel>
          <div className="px-3 py-3">
            <input
              className={inputCls}
              value={slide.title}
              placeholder="Enter slide title…"
              onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
            />
          </div>

          {/* Bullets */}
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

            {slide.bullets.length < (MAX_BULLETS[slide.layout] ?? 6) && (
              <button
                onClick={handleAddBullet}
                className="flex items-center gap-1.5 w-full px-2.5 py-1.5 rounded-lg border border-dashed border-pm-border text-[11px] font-medium text-pm-muted hover:border-pm-teal hover:text-pm-teal hover:bg-[#E1F5EE] transition-all"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add bullet point
              </button>
            )}
          </div>

          {/* Speaker Notes */}
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

          {/* Style */}
          <SectionLabel>Style</SectionLabel>
          <div className="px-3 py-2 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-pm-muted">Color:</span>
              <span className="text-[10px] font-semibold text-pm-primary capitalize">{slide.color_scheme ?? 'default'}</span>
            </div>
            <div className="w-px h-3 bg-pm-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-pm-muted">Shape:</span>
              <span className="text-[10px] font-semibold text-pm-primary capitalize">{slide.shape_style ?? 'square'}</span>
            </div>
          </div>

        </div>
      )}

      {/* ── AI Edit Tab ── */}
      {activeTab === 'ai' && (
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Hint */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] text-pm-muted leading-relaxed">
              Describe what to change. AI will update only the relevant fields.
            </p>
          </div>

          {/* Example chips */}
          <div className="px-3 pb-3 flex flex-wrap gap-1.5">
            {AI_EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setInstruction(ex)
                  inputRef.current?.focus()
                }}
                className="px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-[10px] font-medium text-amber-700 hover:bg-amber-100 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Prompt input */}
          <div className="flex-1 px-3 pb-3">
            <textarea
              ref={inputRef}
              rows={5}
              className="w-full border border-pm-border rounded-lg px-3 py-2.5 text-xs text-pm-primary bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition placeholder:text-gray-300 resize-none"
              placeholder={'e.g. "change color to purple and make shapes pill"'}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={applying}
            />
            <p className="text-[10px] text-pm-muted mt-1">Enter to apply · Shift+Enter for new line</p>
          </div>

          {/* Apply button */}
          <div className="px-3 pb-4 flex-shrink-0">
            <button
              onClick={handleApply}
              disabled={!instruction.trim() || applying}
              className="w-full py-2 rounded-lg flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white text-xs font-semibold"
            >
              {applying ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Applying…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" />
                  </svg>
                  Apply AI Edit
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  )
}
