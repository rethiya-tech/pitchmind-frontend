import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import axios from 'axios'
import { DropZone } from './DropZone'
import { ThemePicker } from './ThemePicker'
import { PreviewPanel } from './PreviewPanel'
import { Button } from '@/components/ui/Button'
import api from '@/services/api'
import { cn } from '@/utils/cn'

const SLIDE_COUNTS = [5, 8, 10, 12, 15]

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
      {/* Header */}
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
      {/* Body */}
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
  const [file, setFile] = useState<File | null>(null)
  const [theme, setTheme] = useState('executive_gold')
  const [slideCount, setSlideCount] = useState(8)
  const [style, setStyle] = useState('professional')
  const [audienceLevel, setAudienceLevel] = useState('general')
  const [speakerNotes, setSpeakerNotes] = useState(true)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadId, setUploadId] = useState<string | null>(null)

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
    setPreview(null)
    setUploadId(null)
    try {
      const { upload_url, upload_id } = await presignMutation.mutateAsync(f)
      await axios.put(upload_url, f, { headers: { 'Content-Type': f.type || 'application/octet-stream' } })
      setUploadId(upload_id)
      const text = await f.text().catch(() => '')
      if (text) setPreview(text.slice(0, 800))
    } catch {
      toast.error('Upload failed. Please try again.')
    }
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!uploadId) throw new Error('No upload ID')
      const { data } = await api.post('/conversions', {
        upload_id: uploadId,
        theme,
        style,
        audience_level: audienceLevel,
        slide_count: slideCount,
        speaker_notes: speakerNotes,
      })
      return data as { id: string }
    },
    onSuccess: (data) => navigate(`/generating/${data.id}`),
    onError: () => toast.error('Failed to start generation. Please try again.'),
  })

  const fileReady = !!file && !!uploadId && !presignMutation.isPending
  const canGenerate = fileReady && !createMutation.isPending

  return (
    <div className="grid grid-cols-3 gap-5 h-full" style={{ minHeight: 0 }}>

      {/* ── Panel 1: Upload ── */}
      <Section
        step={1}
        title="Upload Document"
        subtitle="PDF, DOCX, TXT or MD — up to 10 MB"
        done={fileReady}
      >
        <div className="flex flex-col gap-4 h-full">
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

          {preview && (
            <PreviewPanel
              text={preview}
              wordCount={preview.split(/\s+/).filter(Boolean).length}
            />
          )}

          {!file && (
            <div className="mt-auto pt-2">
              <p className="text-xs text-pm-muted leading-relaxed">
                Your document is analysed by AI to extract key points and structure your slides automatically.
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* ── Panel 2: Configure ── */}
      <Section
        step={2}
        title="Configure Settings"
        subtitle="Adjust how your presentation is built"
        done={fileReady}
      >
        <div className="flex flex-col gap-5">
          <Field label="Slide Count">
            <div className="grid grid-cols-5 gap-1.5">
              {SLIDE_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSlideCount(n)}
                  className={cn(
                    'py-2 rounded-lg text-sm font-medium border transition-all',
                    slideCount === n
                      ? 'bg-pm-teal text-white border-pm-teal shadow-sm'
                      : 'bg-white text-pm-primary border-pm-border hover:border-pm-teal hover:text-pm-teal'
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-pm-muted mt-1.5">{slideCount} slides will be generated</p>
          </Field>

          <Field label="Target Audience">
            <select
              value={audienceLevel}
              onChange={(e) => setAudienceLevel(e.target.value)}
              className={selectCls}
            >
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
          <ThemePicker value={theme} onChange={setTheme} />

          {/* Status checklist */}
          <div className="mt-auto space-y-2 pt-4 border-t border-pm-border">
            <StatusRow done={fileReady} label={fileReady ? `${file?.name} uploaded` : 'No document uploaded'} />
            <StatusRow done label={`${slideCount} slides · ${style} · ${audienceLevel}`} />
            <StatusRow done={!!theme} label="Theme selected" />
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
