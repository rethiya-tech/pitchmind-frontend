import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Spinner } from '@/components/ui/Spinner'
import api from '@/services/api'
import { THEMES } from '@/types'
import type { TemplateListResponse, TemplateCopyResponse, Template } from '@/types'
import { templateSlideImageUrl } from '@/utils/slideImage'

function TemplateThumb({ theme }: { theme: string | null }) {
  const t = THEMES.find(th => th.id === theme) ?? THEMES[0]
  return (
    <div
      className="w-full aspect-video rounded-lg flex flex-col justify-between p-3 overflow-hidden"
      style={{ backgroundColor: t.bg }}
    >
      <div className="space-y-1.5">
        <div className="h-2 rounded-full w-3/4" style={{ backgroundColor: t.accent }} />
        <div className="h-1.5 rounded-full w-1/2 opacity-60" style={{ backgroundColor: t.text }} />
        <div className="h-1.5 rounded-full w-2/3 opacity-60" style={{ backgroundColor: t.text }} />
        <div className="h-1.5 rounded-full w-1/2 opacity-60" style={{ backgroundColor: t.text }} />
      </div>
      <div className="flex gap-1">
        <div className="h-1 rounded-full flex-1 opacity-30" style={{ backgroundColor: t.accent }} />
        <div className="h-1 rounded-full flex-1 opacity-20" style={{ backgroundColor: t.accent }} />
      </div>
    </div>
  )
}

interface TemplatePickerProps {
  onClose: () => void
}

export function TemplatePicker({ onClose }: TemplatePickerProps) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Template | null>(null)
  const [copying, setCopying] = useState(false)

  const { data, isLoading } = useQuery<TemplateListResponse>({
    queryKey: ['templates'],
    queryFn: async () => (await api.get('/templates')).data,
  })

  const { mutate: copyTemplate } = useMutation({
    mutationFn: async (templateId: string) => {
      const res = await api.post<TemplateCopyResponse>(`/templates/${templateId}/copy`)
      return res.data
    },
    onMutate: () => setCopying(true),
    onSuccess: (data) => {
      toast.success('Template copied! Opening editor…')
      onClose()
      navigate(`/editor/${data.conversion_id}`)
    },
    onError: () => {
      setCopying(false)
      toast.error('Failed to copy template. Please try again.')
    },
  })

  const templates = data?.items ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pm-border flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-pm-primary">Choose a Template</h2>
            <p className="text-xs text-pm-muted mt-0.5">Select a template to start with — you can edit all slides after</p>
          </div>
          <button onClick={onClose} className="text-pm-muted hover:text-pm-primary transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" className="text-pm-teal" /></div>
          ) : templates.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E1F5EE] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="4" y="6" width="20" height="16" rx="2" stroke="#0F6E56" strokeWidth="1.8"/>
                  <path d="M9 14h10" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-pm-primary font-bold">No templates available yet</p>
              <p className="text-pm-muted text-sm">Ask your admin to upload templates</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelected(template)}
                  className={`text-left rounded-2xl border-2 overflow-hidden transition-all hover:shadow-md ${
                    selected?.id === template.id
                      ? 'border-pm-teal shadow-md ring-2 ring-pm-teal/20'
                      : 'border-pm-border hover:border-pm-teal/50'
                  }`}
                >
                  <div className="p-3 bg-[#F9FAFB]">
                    {(template.preview_count ?? 0) > 0 ? (
                      <img
                        src={templateSlideImageUrl(template.id, 0)}
                        alt={template.name}
                        loading="lazy"
                        className="w-full aspect-video object-cover rounded-lg border border-pm-border"
                      />
                    ) : (
                      <TemplateThumb theme={template.theme} />
                    )}
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="text-sm font-bold text-pm-primary truncate">{template.name}</p>
                      {template.is_public && (
                        <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[#E1F5EE] text-pm-teal border border-pm-teal/20">
                          Admin
                        </span>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-xs text-pm-muted mt-0.5 line-clamp-2">{template.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-pm-muted">{template.slide_count} slides</span>
                      {template.theme && (
                        <>
                          <span className="text-xs text-pm-muted">·</span>
                          <span className="text-xs text-pm-muted capitalize">{template.theme.replace(/_/g, ' ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {selected?.id === template.id && (
                    <div className="px-4 pb-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-pm-teal">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
                          <path d="M4.5 7l2 2 3-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Selected
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-pm-border bg-[#F9FAFB] flex-shrink-0">
          <p className="text-xs text-pm-muted">
            {selected ? `"${selected.name}" selected — ${selected.slide_count} slides` : 'No template selected'}
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-pm-muted hover:text-pm-primary transition-colors">
              Cancel
            </button>
            <button
              onClick={() => selected && copyTemplate(selected.id)}
              disabled={!selected || copying}
              className="flex items-center gap-2 px-5 py-2 bg-pm-teal hover:bg-pm-teal-hover text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {copying && <Spinner size="sm" />}
              {copying ? 'Creating…' : 'Use Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
