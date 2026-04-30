import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import axios from 'axios'
import { DropZone } from './DropZone'
import { ThemePicker } from './ThemePicker'
import { Button } from '@/components/ui/Button'
import api from '@/services/api'
import { cn } from '@/utils/cn'
import { THEMES } from '@/types'

const SLIDE_COUNTS = [5, 8, 10, 12, 15]
const PROMPT_MIN = 20
const PROMPT_MAX = 3000

type InputMode = 'file' | 'prompt'

// ── Section card shell ────────────────────────────────────────────────────────
function Section({
  step,
  title,
  subtitle,
  done,
  children,
}: {
  step: number
  title: string
  subtitle: string
  done?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-pm-border overflow-hidden h-full">
      <div className="flex items-start gap-3 px-5 py-4 border-b border-pm-border flex-shrink-0">
        <span
          className={cn(
            'mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
            done ? 'bg-pm-teal text-white' : 'bg-[#E1F5EE] text-pm-teal'
          )}
        >
          {done ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            step
          )}
        </span>
        <div>
          <p className="text-sm font-semibold text-pm-primary leading-tight">{title}</p>
          <p className="text-xs text-pm-muted mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
    </div>
  )
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-pm-muted uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

const selectCls =
  'w-full border border-pm-border rounded-lg px-3 py-2.5 text-sm text-pm-primary bg-white focus:outline-none focus:ring-2 focus:ring-pm-teal transition'

// ── Main form ─────────────────────────────────────────────────────────────────
export function UploadForm() {
  const navigate = useNavigate()

  // Input mode
  const [inputMode, setInputMode] = useState<InputMode>('file')

  // File mode state
  const [file, setFile] = useState<File | null>(null)
  const [uploadId, setUploadId] = useState<string | null>(null)

  // Prompt mode state
  const [promptText, setPromptText] = useState('')

  // Shared settings
  const [theme, setTheme] = useState('clean_slate')
  const [slideCount, setSlideCount] = useState(8)
  const [customCount, setCustomCount] = useState('')
  const [customError, setCustomError] = useState('')
  const [slideCountSelected, setSlideCountSelected] = useState(true)
  const [style, setStyle] = useState('professional')
  const [audienceLevel, setAudienceLevel] = useState('general')
  const [speakerNotes, setSpeakerNotes] = useState(true)

  const presignMutation = useMutation({
    mutationFn: async (f: File) => {
      const { data } = await api.post('/uploads/presign', {
        filename: f.name,
        content_type: f.type || 'application/octet-stream',
        size_bytes: f.size,
      })
      return data as { upload_url: string; upload_id: string; gcs_key: string }
    },
  })

  const handleFile = async (f: File) => {
    setFile(f)
    setUploadId(null)
    try {
      const { upload_url, upload_id } = await presignMutation.mutateAsync(f)
      await axios.put(upload_url, f, { headers: { 'Content-Type': f.type || 'application/octet-stream' } })
      setUploadId(upload_id)
    } catch {
      toast.error('Upload failed. Please try again.')
    }
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        theme,
        style,
        audience_level: audienceLevel,
        slide_count: slideCount,
        speaker_notes: speakerNotes,
      }
      if (inputMode === 'prompt') {
        payload.prompt_text = promptText
      } else {
        if (!uploadId) throw new Error('No upload ID')
        payload.upload_id = uploadId
      }
      const { data } = await api.post('/conversions', payload)
      return data as { id: string }
    },
    onSuccess: (data) => navigate(`/generating/${data.id}`),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string | { message?: string } } } })
        ?.response?.data?.detail
      const detail = typeof msg === 'string' ? msg : msg?.message
      toast.error(detail || 'Failed to start generation. Please try again.')
    },
  })

  const fileReady = inputMode === 'file' && !!file && !!uploadId && !presignMutation.isPending
  const promptReady = inputMode === 'prompt' && promptText.trim().length >= PROMPT_MIN
  const inputReady = fileReady || promptReady
  const canGenerate = inputReady && !createMutation.isPending

  const switchMode = (mode: InputMode) => {
    setInputMode(mode)
    // Reset the inactive mode's state
    if (mode === 'file') {
      setPromptText('')
    } else {
      setFile(null)
      setUploadId(null)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-5 h-full" style={{ minHeight: 0 }}>

      {/* ── Panel 1: Input ── */}
      <Section
        step={1}
        title="Add Your Content"
        subtitle="Upload a document or describe your topic"
        done={inputReady}
      >
        <div className="flex flex-col gap-4 h-full">

          {/* Mode toggle */}
          <div className="flex gap-1 bg-pm-app rounded-xl p-1 border border-pm-border flex-shrink-0">
            <button
              type="button"
              onClick={() => switchMode('file')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all',
                inputMode === 'file'
                  ? 'bg-white text-pm-teal shadow-sm border border-pm-border'
                  : 'text-pm-muted hover:text-pm-primary'
              )}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Upload File
            </button>
            <button
              type="button"
              onClick={() => switchMode('prompt')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all',
                inputMode === 'prompt'
                  ? 'bg-white text-pm-teal shadow-sm border border-pm-border'
                  : 'text-pm-muted hover:text-pm-primary'
              )}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Prompt
            </button>
          </div>

          {/* File mode */}
          {inputMode === 'file' && (
            <>
              <DropZone onFile={handleFile} file={file} disabled={presignMutation.isPending} />
              {presignMutation.isPending && (
                <div className="flex items-center gap-2 text-sm text-pm-muted">
                  <svg className="w-4 h-4 animate-spin text-pm-teal" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Uploading…
                </div>
              )}
              {!file && (
                <div className="mt-auto pt-2">
                  <p className="text-xs text-pm-muted leading-relaxed">
                    Your document is analysed by AI to extract key points and structure your slides automatically.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Prompt mode */}
          {inputMode === 'prompt' && (
            <div className="flex flex-col gap-2 flex-1">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value.slice(0, PROMPT_MAX))}
                placeholder={`Describe your presentation topic or paste an outline…\n\nExamples:\n• "A 10-slide pitch deck for a SaaS startup targeting HR teams"\n• "Quarterly business review for Q3 2024 with financial highlights"\n• Paste your raw notes or bullet points directly`}
                className={cn(
                  'flex-1 w-full resize-none border rounded-xl px-4 py-3 text-sm text-pm-primary bg-white',
                  'focus:outline-none focus:ring-2 focus:ring-pm-teal transition leading-relaxed',
                  'placeholder:text-pm-muted/60',
                  promptText.length > 0 && promptText.trim().length < PROMPT_MIN
                    ? 'border-amber-300 focus:ring-amber-200'
                    : promptReady
                    ? 'border-pm-teal'
                    : 'border-pm-border'
                )}
                style={{ minHeight: '220px' }}
              />
              <div className="flex items-center justify-between">
                {promptText.trim().length > 0 && promptText.trim().length < PROMPT_MIN ? (
                  <span className="text-xs text-amber-600">
                    {PROMPT_MIN - promptText.trim().length} more characters needed
                  </span>
                ) : promptReady ? (
                  <span className="text-xs text-pm-teal font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Ready to generate
                  </span>
                ) : (
                  <span className="text-xs text-pm-muted">Min {PROMPT_MIN} characters</span>
                )}
                <span className={cn(
                  'text-xs',
                  promptText.length > PROMPT_MAX * 0.9 ? 'text-amber-500' : 'text-pm-muted'
                )}>
                  {promptText.length}/{PROMPT_MAX}
                </span>
              </div>
            </div>
          )}

        </div>
      </Section>

      {/* ── Panel 2: Configure ── */}
      <Section
        step={2}
        title="Configure Settings"
        subtitle="Adjust how your presentation is built"
        done={inputReady}
      >
        <div className="flex flex-col gap-5">
          <Field label="Slide Count">
            <div className="flex items-center gap-1.5 flex-wrap">
              {SLIDE_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => { setSlideCount(n); setCustomCount(''); setCustomError(''); setSlideCountSelected(true) }}
                  className={cn(
                    'w-10 h-9 rounded-lg text-sm font-medium border transition-all flex-shrink-0',
                    slideCount === n && !customCount
                      ? 'bg-pm-teal text-white border-pm-teal shadow-sm'
                      : 'bg-white text-pm-primary border-pm-border hover:border-pm-teal hover:text-pm-teal'
                  )}
                >
                  {n}
                </button>
              ))}
              <div className="w-px h-6 bg-pm-border mx-0.5 flex-shrink-0" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Custom"
                value={customCount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '')
                  const n = parseInt(val)
                  if (val === '') { setCustomCount(''); setCustomError(''); setSlideCountSelected(false); return }
                  if (SLIDE_COUNTS.includes(n)) {
                    setSlideCount(n); setCustomCount(''); setCustomError(''); setSlideCountSelected(true); return
                  }
                  setCustomCount(val)
                  if (n <= 3) { setCustomError('Must be greater than 3') }
                  else if (n > 50) { setCustomError('Maximum is 50') }
                  else { setCustomError(''); setSlideCount(n); setSlideCountSelected(true) }
                }}
                className={cn(
                  'flex-1 min-w-[90px] h-9 border rounded-lg px-3 text-sm text-pm-primary bg-white focus:outline-none focus:ring-2 focus:ring-pm-teal transition',
                  customError ? 'border-red-400 focus:ring-red-300' :
                  customCount && !customError ? 'border-pm-teal bg-[#F0FBF7]' : 'border-pm-border'
                )}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              {slideCountSelected && !customError && (
                <p className="text-xs text-pm-muted">
                  <span className="font-semibold text-pm-primary">{slideCount}</span> slides will be generated
                </p>
              )}
              {(!slideCountSelected || customError) && <span />}
              {customError && (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {customError}
                </span>
              )}
            </div>
          </Field>

          <Field label="Target Audience">
            <select value={audienceLevel} onChange={(e) => setAudienceLevel(e.target.value)} className={selectCls}>
              <option value="general">General</option>
              <option value="executive">Executive</option>
              <option value="c-suite">C-Suite</option>
              <option value="technical">Technical</option>
            </select>
          </Field>

          <Field label="Presentation Style">
            <select value={style} onChange={(e) => setStyle(e.target.value)} className={selectCls}>
              <option value="professional">Professional</option>
              <option value="creative">Creative</option>
              <option value="minimal">Minimal</option>
              <option value="bold">Bold</option>
            </select>
          </Field>

          <Field label="Speaker Notes">
            <div className="flex items-center justify-between bg-pm-app rounded-lg border border-pm-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-pm-primary">Include speaker notes</p>
                <p className="text-xs text-pm-muted mt-0.5">AI-generated notes per slide</p>
              </div>
              <button
                type="button"
                onClick={() => setSpeakerNotes(!speakerNotes)}
                className={cn(
                  'relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200',
                  speakerNotes ? 'bg-pm-teal' : 'bg-gray-200'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
                    speakerNotes ? 'translate-x-4' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          </Field>
        </div>
      </Section>

      {/* ── Panel 3: Theme & Generate ── */}
      <Section
        step={3}
        title="Choose Theme"
        subtitle="Select a visual style for your slides"
        done={false}
      >
        <div className="flex flex-col gap-5 h-full">
          <ThemePicker value={theme} onChange={(id) => {
            setTheme(id)
            const category = THEMES.find(t => t.id === id)?.category
            if (category) setStyle(category)
          }} />

          <div className="mt-auto space-y-2 pt-4 border-t border-pm-border">
            {inputMode === 'file' ? (
              <StatusRow done={fileReady} label={fileReady ? `${file?.name} uploaded` : 'No document uploaded'} />
            ) : (
              <StatusRow
                done={promptReady}
                label={promptReady ? `Prompt ready (${promptText.trim().length} chars)` : 'No prompt entered'}
              />
            )}
            <StatusRow done label={`${slideCount} slides · ${style}`} />
            <StatusRow done={!!theme} label={theme ? `Theme: ${THEMES.find(t => t.id === theme)?.name ?? theme}` : 'Theme selected'} />
          </div>

          <Button
            className="w-full"
            size="lg"
            loading={createMutation.isPending || presignMutation.isPending}
            disabled={!canGenerate}
            onClick={() => createMutation.mutate()}
          >
            Generate Presentation
          </Button>
        </div>
      </Section>

    </div>
  )
}

function StatusRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={cn(
          'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0',
          done ? 'bg-pm-teal' : 'bg-gray-200'
        )}
      >
        {done ? (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        )}
      </span>
      <span className={done ? 'text-pm-primary' : 'text-pm-muted'}>{label}</span>
    </div>
  )
}
