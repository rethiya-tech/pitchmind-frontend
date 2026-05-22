import { useRef, useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Spinner } from '@/components/ui/Spinner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import api from '@/services/api'
import { THEMES } from '@/types'
import type { TemplateListResponse, Template, TemplateDetail, TemplateCopyResponse } from '@/types'
import { templateSlideImageUrl } from '@/utils/slideImage'

function MiniThumb({ theme }: { theme: string | null }) {
  const t = THEMES.find(th => th.id === theme) ?? THEMES[0]
  return (
    <div
      className="w-8 h-5 flex-shrink-0 rounded-sm overflow-hidden flex flex-col justify-between p-0.5"
      style={{ backgroundColor: t.bg }}
    >
      <div className="h-0.5 rounded-full w-4" style={{ backgroundColor: t.accent }} />
      <div className="h-0.5 rounded-full w-3 opacity-60" style={{ backgroundColor: t.text }} />
      <div className="h-0.5 rounded-full w-3.5 opacity-60" style={{ backgroundColor: t.text }} />
    </div>
  )
}


function UploadModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dragging, setDragging] = useState(false)

  const { mutate: upload, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('No file selected')
      const form = new FormData()
      form.append('file', file)
      form.append('name', name)
      form.append('description', description)
      return api.post('/templates', form)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      if (data?.data?.parse_warning) {
        toast('Template saved, but slides could not be parsed from the file.', { icon: '⚠️' })
      } else {
        toast.success('Template uploaded successfully')
      }
      onClose()
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail
      const code = detail?.code
      const msg = code === 'LEGACY_FORMAT'
        ? 'Old .ppt format not supported. Convert to .pptx in PowerPoint or Google Slides first.'
        : (detail?.message ?? 'Upload failed. Please try again.')
      toast.error(msg, { duration: 6000 })
    },
  })

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.name.toLowerCase().endsWith('.ppt') && !f.name.toLowerCase().endsWith('.pptx')) {
      toast.error('Old .ppt format not supported. Convert to .pptx first.', { duration: 6000 })
    } else if (f?.name.endsWith('.pptx')) {
      setFile(f)
    } else {
      toast.error('Only .pptx files are accepted')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pm-border">
          <h2 className="text-lg font-bold text-pm-primary">Upload Template</h2>
          <button onClick={onClose} className="text-pm-muted hover:text-pm-primary transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* File drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragging ? 'border-pm-teal bg-[#E1F5EE]' : file ? 'border-green-400 bg-green-50' : 'border-pm-border hover:border-pm-teal hover:bg-[#F7FFFE]'
            }`}
          >
            <input ref={fileRef} type="file" accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-green-600">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6.5 10.5l2.5 2.5 4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-medium text-green-700">{file.name}</span>
                <button onClick={e => { e.stopPropagation(); setFile(null) }} className="text-green-500 hover:text-red-500">✕</button>
              </div>
            ) : (
              <>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-2 text-pm-muted">
                  <path d="M16 4v16M8 12l8-8 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 24h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p className="text-sm font-medium text-pm-primary">Drop your .pptx file here</p>
                <p className="text-xs text-pm-muted mt-1">or click to browse</p>
              </>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-pm-muted uppercase tracking-wider">Template Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Corporate Pitch Deck"
              className="mt-1 w-full border border-pm-border rounded-xl px-4 py-2.5 text-sm text-pm-primary focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-pm-muted uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of this template..."
              className="mt-1 w-full border border-pm-border rounded-xl px-4 py-2.5 text-sm text-pm-primary focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal resize-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-pm-border bg-[#F9FAFB]">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-pm-muted hover:text-pm-primary transition-colors">
            Cancel
          </button>
          <button
            onClick={() => upload()}
            disabled={isPending || !file || !name.trim()}
            className="flex items-center gap-2 px-5 py-2 text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #0F6E56 0%, #0A9B6E 100%)' }}
          >
            {isPending && <Spinner size="sm" />}
            {isPending ? 'Uploading…' : 'Upload Template'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SlideThumbCard({ slide, index, theme }: { slide: any; index: number; theme: string | null }) {
  const t = THEMES.find(th => th.id === theme) ?? THEMES[0]
  const hasTitle = slide.title && !slide.title.match(/^Slide \d+$/)
  const hasBullets = (slide.bullets as string[])?.length > 0

  return (
    <div className="flex gap-4 items-start">
      {/* Visual thumbnail — 16:10 aspect like a real slide */}
      <div
        className="flex-shrink-0 w-36 h-[90px] rounded-lg overflow-hidden flex flex-col px-2.5 py-2 shadow-sm border"
        style={{ backgroundColor: t.bg, borderColor: t.accent + '40' }}
      >
        {hasTitle ? (
          <>
            <p
              className="text-[8px] font-bold leading-tight mb-1.5 truncate"
              style={{ color: t.accent }}
            >
              {slide.title}
            </p>
            {hasBullets ? (
              <div className="space-y-1 flex-1 overflow-hidden">
                {(slide.bullets as string[]).slice(0, 3).map((b, i) => (
                  <p key={i} className="text-[6.5px] leading-tight truncate opacity-80" style={{ color: t.text }}>
                    · {b}
                  </p>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {[0.8, 0.6, 0.7].map((w, i) => (
                  <div key={i} className="h-[5px] rounded-full" style={{ backgroundColor: t.text, opacity: 0.25, width: `${w * 100}%` }} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* No extractable text — decorative placeholder */}
            <div className="h-[6px] rounded-full mb-2 w-2/3" style={{ backgroundColor: t.accent, opacity: 0.7 }} />
            <div className="space-y-1.5 flex-1">
              {[0.9, 0.7, 0.8, 0.65].map((w, i) => (
                <div key={i} className="h-[5px] rounded-full" style={{ backgroundColor: t.text, opacity: 0.2, width: `${w * 100}%` }} />
              ))}
            </div>
            {/* Image icon hint */}
            <div className="mt-auto self-center opacity-25">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="2" width="12" height="10" rx="1" stroke={t.text} strokeWidth="1"/>
                <circle cx="4.5" cy="5.5" r="1.5" fill={t.text}/>
                <path d="M1 9l3-3 2.5 2.5L9 6l4 4" stroke={t.text} strokeWidth="1" strokeLinejoin="round"/>
              </svg>
            </div>
          </>
        )}
        {/* Slide number */}
        <div className="absolute" style={{ /* chip positioned via flex trick below */ }}>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-pm-muted bg-[#F3F4F6] px-1.5 py-0.5 rounded-full">{index + 1}</span>
          {hasTitle ? (
            <p className="text-sm font-semibold text-pm-primary truncate">{slide.title}</p>
          ) : (
            <p className="text-sm font-medium text-pm-muted">Slide {index + 1}</p>
          )}
        </div>
        {hasBullets ? (
          <ul className="mt-1.5 space-y-0.5">
            {(slide.bullets as string[]).slice(0, 4).map((b, j) => (
              <li key={j} className="text-xs text-pm-muted flex gap-1.5 items-start">
                <span className="text-pm-teal flex-shrink-0 mt-px">·</span>
                <span className="line-clamp-1">{b}</span>
              </li>
            ))}
            {slide.bullets.length > 4 && (
              <li className="text-xs text-pm-muted pl-3">+{slide.bullets.length - 4} more</li>
            )}
          </ul>
        ) : (
          <p className="text-xs text-pm-muted mt-1 italic">Image-based — AI will generate content on use</p>
        )}
      </div>
    </div>
  )
}

function ViewModal({ template, onClose }: { template: Template; onClose: () => void }) {
  const { data, isLoading } = useQuery<TemplateDetail>({
    queryKey: ['template-detail', template.id],
    queryFn: async () => (await api.get(`/templates/${template.id}`)).data,
  })

  const t = THEMES.find(th => th.id === template.theme) ?? THEMES[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header with theme color strip */}
        <div className="flex-shrink-0">
          <div className="h-1.5 w-full" style={{ backgroundColor: t.accent }} />
          <div className="flex items-center justify-between px-6 py-4 border-b border-pm-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded-md overflow-hidden flex-shrink-0" style={{ backgroundColor: t.bg }}>
                <div className="h-1 m-1 rounded-full w-6" style={{ backgroundColor: t.accent }} />
                <div className="h-0.5 mx-1 mt-0.5 rounded-full w-5 opacity-60" style={{ backgroundColor: t.text }} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-pm-primary">{template.name}</h2>
                <p className="text-xs text-pm-muted mt-0.5">
                  {template.slide_count} slide{template.slide_count !== 1 ? 's' : ''} · {t.name}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-pm-muted hover:text-pm-primary transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" className="text-pm-teal" /></div>
          ) : (template.preview_count ?? 0) > 0 ? (
            <div className="space-y-4">
              {Array.from({ length: template.preview_count ?? 0 }).map((_, i) => (
                <img
                  key={i}
                  src={templateSlideImageUrl(template.id, i)}
                  alt={`Slide ${i + 1}`}
                  loading="lazy"
                  className="w-full rounded-xl border border-pm-border shadow-sm"
                />
              ))}
            </div>
          ) : !data?.slides_json?.length ? (
            <div className="text-center py-12">
              <div className="w-16 h-10 mx-auto rounded-xl mb-4" style={{ backgroundColor: t.bg }} />
              <p className="text-pm-primary font-semibold">No slides extracted</p>
              <p className="text-pm-muted text-sm mt-1">This template uses image-based layouts. Content will be generated by AI when you use this template.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(data.slides_json as any[]).map((slide: any, i: number) => (
                <SlideThumbCard key={i} slide={slide} index={i} theme={template.theme} />
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-pm-border bg-[#F9FAFB] flex-shrink-0 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-pm-muted hover:text-pm-primary transition-colors rounded-xl">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function TemplateRow({
  template,
  isFirst,
  isLast,
  onDelete,
  onPatch,
  onRename,
  onMove,
}: {
  template: Template
  isFirst: boolean
  isLast: boolean
  onDelete: (id: string) => void
  onPatch: (id: string, patch: Record<string, unknown>) => void
  onRename: (t: Template) => void
  onMove: (id: string, dir: -1 | 1) => void
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showView, setShowView] = useState(false)
  const [copying, setCopying] = useState(false)

  const { mutate: copyTemplate } = useMutation({
    mutationFn: async () => {
      const res = await api.post<TemplateCopyResponse>(`/templates/${template.id}/copy`)
      return res.data
    },
    onMutate: () => setCopying(true),
    onSuccess: (data) => {
      toast.success('Opening editor…')
      navigate(`/editor/${data.conversion_id}`, { state: { from: 'admin-templates' }, replace: true })
    },
    onError: () => {
      setCopying(false)
      toast.error('Failed to copy template.')
    },
  })

  const { mutate: reparse, isPending: reparsing } = useMutation({
    mutationFn: () => api.patch(`/templates/${template.id}/reparse`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['template-detail', template.id] })
      if (res?.data?.parse_warning) {
        toast('Re-parsed: slides could not be fully extracted from the file.', { icon: '⚠️' })
      } else {
        toast.success(`Re-parsed: ${res?.data?.slide_count ?? 0} slide(s) extracted`)
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail?.message ?? 'Re-parse failed.'
      toast.error(msg)
    },
  })

  const themeName = template.theme
    ? template.theme.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
    : '—'

  const uploadedDate = template.created_at
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(template.created_at))
    : '—'

  return (
    <>
      {showView && <ViewModal template={template} onClose={() => setShowView(false)} />}
      <tr className="border-t border-pm-border/60 transition-all duration-150 hover:shadow-[inset_3px_0_0_#0F6E56]"
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(238,248,242,0.55)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
        {/* Name */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            {(template.preview_count ?? 0) > 0 ? (
              <img
                src={templateSlideImageUrl(template.id, 0)}
                alt={template.name}
                loading="lazy"
                className="w-14 h-9 rounded object-cover border border-pm-border flex-shrink-0"
              />
            ) : (
              <MiniThumb theme={template.theme} />
            )}
            <div className="min-w-0">
              <p className="font-medium text-pm-primary truncate max-w-[200px]">{template.name}</p>
              {template.description && (
                <p className="text-xs text-pm-muted truncate max-w-[200px]">{template.description}</p>
              )}
            </div>
          </div>
        </td>
        {/* Slides */}
        <td className="px-5 py-3.5 text-pm-primary">{template.slide_count ?? '—'}</td>
        {/* Theme */}
        <td className="px-5 py-3.5 text-pm-primary">{themeName}</td>
        {/* Status */}
        <td className="px-5 py-3.5">
          <div className="flex flex-col gap-1">
            <span className={`inline-block w-fit text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              template.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {template.is_active ? 'Active' : 'Inactive'}
            </span>
            <span className={`inline-block w-fit text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              template.is_public ? 'bg-[#E1F5EE] text-pm-teal' : 'bg-amber-50 text-amber-700'
            }`}>
              {template.is_public ? 'Public' : 'Private'}
            </span>
          </div>
        </td>
        {/* Uploaded */}
        <td className="px-5 py-3.5 text-pm-muted">{uploadedDate}</td>
        {/* Actions */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            {/* Reorder */}
            <div className="flex flex-col mr-1">
              <button
                onClick={() => onMove(template.id, -1)}
                disabled={isFirst}
                title="Move up"
                className="text-pm-muted hover:text-pm-primary disabled:opacity-30 leading-none"
              >▲</button>
              <button
                onClick={() => onMove(template.id, 1)}
                disabled={isLast}
                title="Move down"
                className="text-pm-muted hover:text-pm-primary disabled:opacity-30 leading-none"
              >▼</button>
            </div>
            <button
              onClick={() => onRename(template)}
              title="Rename"
              className="px-2 h-8 rounded-lg border border-pm-border bg-white hover:bg-[#F3F4F6] text-pm-primary text-xs font-medium transition-colors"
            >
              Rename
            </button>
            <button
              onClick={() => onPatch(template.id, { is_public: !template.is_public })}
              title={template.is_public ? 'Make private' : 'Make public'}
              className="px-2 h-8 rounded-lg border border-pm-border bg-white hover:bg-[#F3F4F6] text-pm-primary text-xs font-medium transition-colors"
            >
              {template.is_public ? 'Make Private' : 'Make Public'}
            </button>
            <button
              onClick={() => onPatch(template.id, { is_active: !template.is_active })}
              title={template.is_active ? 'Deactivate' : 'Activate'}
              className="px-2 h-8 rounded-lg border border-pm-border bg-white hover:bg-[#F3F4F6] text-pm-primary text-xs font-medium transition-colors"
            >
              {template.is_active ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={() => setShowView(true)}
              title="View slides"
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-pm-border bg-white hover:bg-[#F3F4F6] text-pm-primary transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M1.5 7C2.5 4 4.5 2.5 7 2.5S11.5 4 12.5 7c-1 3-3 4.5-5.5 4.5S2.5 10 1.5 7z" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
            </button>
            <button
              onClick={() => copyTemplate()}
              disabled={copying}
              title="Copy template"
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-pm-border bg-white hover:bg-[#F3F4F6] text-pm-teal transition-colors disabled:opacity-50"
            >
              {copying ? <Spinner size="sm" /> : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="4" y="4" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M4 4V3A1.5 1.5 0 012.5 1.5h0A1.5 1.5 0 011 3v7A1.5 1.5 0 002.5 11.5H4" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
              )}
            </button>
            <button
              onClick={() => reparse()}
              disabled={reparsing}
              title="Re-parse slides from PPTX"
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-pm-border bg-white hover:bg-[#F3F4F6] text-pm-muted transition-colors disabled:opacity-50"
            >
              {reparsing ? <Spinner size="sm" /> : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7a5 5 0 015-5 5 5 0 013.5 1.5L12 1v4H8l1.5-1.5A3 3 0 007 4a3 3 0 000 6 3 3 0 002.8-2h2.1A5 5 0 017 12 5 5 0 012 7z" fill="currentColor"/>
                </svg>
              )}
            </button>
            <button
              onClick={() => onDelete(template.id)}
              title="Remove template"
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4h10M5 4V2.5A.5.5 0 015.5 2h3a.5.5 0 01.5.5V4M6 7v3M8 7v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M3 4l.7 7.3A1 1 0 004.7 12h4.6a1 1 0 001-.7L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    </>
  )
}

export function AdminTemplatesPage() {
  const [showUpload, setShowUpload] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<TemplateListResponse>({
    queryKey: ['templates', 'admin'],
    queryFn: async () => (await api.get('/templates?all=true')).data,
  })

  const { mutate: deleteTemplate } = useMutation({
    mutationFn: (id: string) => api.delete(`/templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast.success('Template removed.')
    },
    onError: () => toast.error('Failed to remove template.'),
  })

  const { mutate: patchTemplate } = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      api.patch(`/templates/${id}`, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast.success('Template updated.')
    },
    onError: () => toast.error('Failed to update template.'),
  })

  const { mutate: reorder } = useMutation({
    mutationFn: (ordered_ids: string[]) => api.post('/templates/reorder', { ordered_ids }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
    onError: () => toast.error('Failed to reorder.'),
  })

  const handleDelete = (id: string) => setConfirmId(id)

  const handlePatch = (id: string, patch: Record<string, unknown>) =>
    patchTemplate({ id, patch })

  const handleRename = (t: Template) => {
    const name = window.prompt('Template name', t.name)?.trim()
    if (name && name !== t.name) patchTemplate({ id: t.id, patch: { name } })
  }

  const handleMove = (id: string, dir: -1 | 1) => {
    const items = data?.items ?? []
    const idx = items.findIndex((x) => x.id === id)
    const swap = idx + dir
    if (idx < 0 || swap < 0 || swap >= items.length) return
    const ids = items.map((x) => x.id)
    ;[ids[idx], ids[swap]] = [ids[swap], ids[idx]]
    reorder(ids)
  }

  return (
    <div className="space-y-6">
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      <ConfirmDialog
        open={confirmId !== null}
        title="Remove Template"
        message="Remove this template? Users will no longer see it."
        confirmLabel="Remove"
        onConfirm={() => { if (confirmId) deleteTemplate(confirmId); setConfirmId(null) }}
        onCancel={() => setConfirmId(null)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight gradient-heading">Templates</h1>
          <p className="text-sm text-pm-muted mt-0.5">Upload and manage presentation templates for users</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #0F6E56 0%, #0A9B6E 100%)', boxShadow: '0 4px 14px rgba(15,110,86,0.25)' }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Upload Template
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" className="text-pm-teal" /></div>
      ) : !data?.items.length ? (
        <div className="bg-white rounded-2xl border border-pm-border py-20 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E1F5EE] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="4" y="6" width="20" height="16" rx="2" stroke="#0F6E56" strokeWidth="1.8"/>
              <path d="M9 14h10M14 9v10" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-pm-primary font-bold text-lg">No templates yet</p>
            <p className="text-pm-muted text-sm mt-1">Upload a .pptx file to create the first template</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #0F6E56 0%, #0A9B6E 100%)', boxShadow: '0 4px 14px rgba(15,110,86,0.25)' }}
          >
            Upload your first template
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-pm-border/60 overflow-hidden shadow-card" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/60">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Slides</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Theme</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Uploaded</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-pm-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((t, i) => (
                <TemplateRow
                  key={t.id}
                  template={t}
                  isFirst={i === 0}
                  isLast={i === data.items.length - 1}
                  onDelete={handleDelete}
                  onPatch={handlePatch}
                  onRename={handleRename}
                  onMove={handleMove}
                />
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-pm-border/60 text-xs text-pm-muted bg-white/60">
            Showing {data.items.length} template{data.items.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}
