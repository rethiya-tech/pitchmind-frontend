import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Spinner } from '@/components/ui/Spinner'
import api from '@/services/api'
import { THEMES } from '@/types'
import type { TemplateListResponse, Template, TemplateDetail, TemplateCopyResponse } from '@/types'

function SlideThumbCard({ slide, index, theme }: { slide: any; index: number; theme: string | null }) {
  const t = THEMES.find(th => th.id === theme) ?? THEMES[0]
  const hasTitle = slide.title && !slide.title.match(/^Slide \d+$/)
  const hasBullets = (slide.bullets as string[])?.length > 0

  return (
    <div className="flex gap-4 items-start">
      <div
        className="flex-shrink-0 w-36 h-[90px] rounded-lg overflow-hidden flex flex-col px-2.5 py-2 shadow-sm border"
        style={{ backgroundColor: t.bg, borderColor: t.accent + '40' }}
      >
        {hasTitle ? (
          <>
            <p className="text-[8px] font-bold leading-tight mb-1.5 truncate" style={{ color: t.accent }}>
              {slide.title}
            </p>
            {hasBullets ? (
              <div className="space-y-1 flex-1 overflow-hidden">
                {(slide.bullets as string[]).slice(0, 3).map((b, i) => (
                  <p key={i} className="text-[6.5px] leading-tight truncate opacity-80" style={{ color: t.text }}>· {b}</p>
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
            <div className="h-[6px] rounded-full mb-2 w-2/3" style={{ backgroundColor: t.accent, opacity: 0.7 }} />
            <div className="space-y-1.5 flex-1">
              {[0.9, 0.7, 0.8, 0.65].map((w, i) => (
                <div key={i} className="h-[5px] rounded-full" style={{ backgroundColor: t.text, opacity: 0.2, width: `${w * 100}%` }} />
              ))}
            </div>
            <div className="mt-auto self-center opacity-25">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="2" width="12" height="10" rx="1" stroke={t.text} strokeWidth="1" />
                <circle cx="4.5" cy="5.5" r="1.5" fill={t.text} />
                <path d="M1 9l3-3 2.5 2.5L9 6l4 4" stroke={t.text} strokeWidth="1" strokeLinejoin="round" />
              </svg>
            </div>
          </>
        )}
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-pm-muted bg-[#F3F4F6] px-1.5 py-0.5 rounded-full">{index + 1}</span>
          {hasTitle
            ? <p className="text-sm font-semibold text-pm-primary truncate">{slide.title}</p>
            : <p className="text-sm font-medium text-pm-muted">Slide {index + 1}</p>}
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

function ViewModal({ template, onClose, onUse }: { template: Template; onClose: () => void; onUse: () => void }) {
  const { data, isLoading } = useQuery<TemplateDetail>({
    queryKey: ['template-detail', template.id],
    queryFn: async () => (await api.get(`/templates/${template.id}`)).data,
  })
  const t = THEMES.find(th => th.id === template.theme) ?? THEMES[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
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
          ) : !data?.slides_json?.length ? (
            <div className="text-center py-12">
              <div className="w-16 h-10 mx-auto rounded-xl mb-4" style={{ backgroundColor: t.bg }} />
              <p className="text-pm-primary font-semibold">No slides extracted</p>
              <p className="text-pm-muted text-sm mt-1">This template uses image-based layouts. Content will be generated by AI when you use it.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(data.slides_json as any[]).map((slide: any, i: number) => (
                <SlideThumbCard key={i} slide={slide} index={i} theme={template.theme} />
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-pm-border bg-[#F9FAFB] flex-shrink-0 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-pm-muted hover:text-pm-primary transition-colors">
            Close
          </button>
          <button
            onClick={onUse}
            className="flex items-center gap-2 px-5 py-2.5 bg-pm-teal hover:bg-pm-teal-hover text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="4" y="4" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M4 4V3A1.5 1.5 0 012.5 1.5h0A1.5 1.5 0 011 3v7A1.5 1.5 0 002.5 11.5H4" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            Use Template
          </button>
        </div>
      </div>
    </div>
  )
}

function TemplateRow({ template }: { template: Template }) {
  const navigate = useNavigate()
  const [showView, setShowView] = useState(false)
  const [copying, setCopying] = useState(false)
  const t = THEMES.find(th => th.id === template.theme) ?? THEMES[0]

  const { mutate: copyTemplate } = useMutation({
    mutationFn: async () => {
      const res = await api.post<TemplateCopyResponse>(`/templates/${template.id}/copy`)
      return res.data
    },
    onMutate: () => setCopying(true),
    onSuccess: (data) => {
      toast.success('Opening editor…')
      navigate(`/editor/${data.conversion_id}`, { state: { from: 'templates' } })
    },
    onError: () => {
      setCopying(false)
      toast.error('Failed to use template. Please try again.')
    },
  })

  return (
    <>
      {showView && (
        <ViewModal
          template={template}
          onClose={() => setShowView(false)}
          onUse={() => { setShowView(false); copyTemplate() }}
        />
      )}
      <tr className="hover:bg-[#F9FAFB] transition-colors">
        {/* Thumbnail */}
        <td className="px-5 py-3">
          <div
            className="w-16 h-10 rounded-lg overflow-hidden flex flex-col px-1.5 py-1.5 flex-shrink-0 relative"
            style={{ backgroundColor: t.bg }}
          >
            <div className="h-1 rounded-full w-8 mb-1" style={{ backgroundColor: t.accent, opacity: 0.8 }} />
            <div className="space-y-0.5">
              <div className="h-[3px] rounded-full w-full" style={{ backgroundColor: t.text, opacity: 0.2 }} />
              <div className="h-[3px] rounded-full w-4/5" style={{ backgroundColor: t.text, opacity: 0.15 }} />
              <div className="h-[3px] rounded-full w-3/5" style={{ backgroundColor: t.text, opacity: 0.15 }} />
            </div>
            <div
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full opacity-10"
              style={{ backgroundColor: t.accent, transform: 'translate(30%, 30%)' }}
            />
          </div>
        </td>

        {/* Name + description */}
        <td className="px-5 py-3">
          <p className="text-sm font-semibold text-pm-primary">{template.name}</p>
          {template.description && (
            <p className="text-xs text-pm-muted mt-0.5 line-clamp-1">{template.description}</p>
          )}
        </td>

        {/* Theme */}
        <td className="px-5 py-3 hidden sm:table-cell">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: t.accent }}
            />
            <span className="text-sm text-pm-muted">{t.name}</span>
          </div>
        </td>

        {/* Slide count */}
        <td className="px-5 py-3 hidden md:table-cell">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: t.accent + '18', color: t.accent }}
          >
            {template.slide_count} slides
          </span>
        </td>

        {/* Actions */}
        <td className="px-5 py-3">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setShowView(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-pm-border rounded-lg text-xs font-medium text-pm-primary hover:bg-[#F3F4F6] transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M1.5 7C2.5 4 4.5 2.5 7 2.5S11.5 4 12.5 7c-1 3-3 4.5-5.5 4.5S2.5 10 1.5 7z" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              Preview
            </button>
            <button
              onClick={() => copyTemplate()}
              disabled={copying}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-pm-teal hover:bg-pm-teal-hover text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-60"
            >
              {copying ? <Spinner size="sm" /> : (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <rect x="4" y="4" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M4 4V3A1.5 1.5 0 012.5 1.5h0A1.5 1.5 0 011 3v7A1.5 1.5 0 002.5 11.5H4" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              )}
              {copying ? 'Opening…' : 'Use Template'}
            </button>
          </div>
        </td>
      </tr>
    </>
  )
}

export function TemplatesPage() {
  const { data, isLoading } = useQuery<TemplateListResponse>({
    queryKey: ['templates'],
    queryFn: async () => (await api.get('/templates')).data,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-pm-primary tracking-tight">Templates</h1>
        <p className="text-sm text-pm-muted mt-0.5">Choose a template to start your presentation</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" className="text-pm-teal" />
        </div>
      ) : !data?.items.length ? (
        <div className="bg-white rounded-2xl border border-pm-border py-20 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E1F5EE] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="4" y="6" width="20" height="16" rx="2" stroke="#0F6E56" strokeWidth="1.8" />
              <path d="M8 14h12M8 10h5" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-pm-primary font-bold text-lg">No templates yet</p>
            <p className="text-pm-muted text-sm mt-1">The admin hasn't uploaded any templates yet. Check back soon!</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-pm-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pm-border bg-[#F9FAFB]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-pm-muted uppercase tracking-wider w-24">Preview</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-pm-muted uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-pm-muted uppercase tracking-wider hidden sm:table-cell">Theme</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-pm-muted uppercase tracking-wider hidden md:table-cell">Slides</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-pm-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pm-border">
              {data.items.map(template => (
                <TemplateRow key={template.id} template={template} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
