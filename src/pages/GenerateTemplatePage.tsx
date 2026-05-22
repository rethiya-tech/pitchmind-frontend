import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { cn } from '@/utils/cn'
import { Spinner } from '@/components/ui/Spinner'
import api from '@/services/api'
import { THEMES } from '@/types'
import type { Template, TemplateGenerateRequest } from '@/types'

// ── Layout catalogue ──────────────────────────────────────────────────────────

const LAYOUTS: { id: string; label: string; desc: string; tag: string }[] = [
  { id: 'bullets',    label: 'Bullet List',  desc: 'Narrative list of key points',      tag: 'Content'  },
  { id: 'two_column', label: 'Two Column',   desc: 'Side-by-side comparison or split',  tag: 'Compare'  },
  { id: 'data_table', label: 'Data Table',   desc: 'Structured rows & metric grid',     tag: 'Metrics'  },
  { id: 'timeline',   label: 'Timeline',     desc: 'Phases, milestones & roadmap',      tag: 'Roadmap'  },
  { id: 'big_stat',   label: 'Big Numbers',  desc: 'Large metric callouts highlighted', tag: 'Stats'    },
  { id: 'process',    label: 'Process Flow', desc: 'Step-by-step sequential workflow',  tag: 'Steps'    },
  { id: 'quote',      label: 'Pull Quote',   desc: 'Testimonial or highlighted quote',  tag: 'Quote'    },
]

const LAYOUT_PREVIEWS: Record<string, JSX.Element> = {
  bullets: (
    <svg width="64" height="44" viewBox="0 0 64 44" fill="none">
      <rect width="64" height="44" rx="3" fill="currentColor" opacity=".07"/>
      <rect x="4" y="6" width="28" height="3" rx="1.5" fill="currentColor" opacity=".7"/>
      <rect x="4" y="14" width="3.5" height="3.5" rx="1" fill="currentColor" opacity=".5"/>
      <rect x="11" y="14.5" width="34" height="2.5" rx="1.2" fill="currentColor" opacity=".6"/>
      <rect x="4" y="21" width="3.5" height="3.5" rx="1" fill="currentColor" opacity=".5"/>
      <rect x="11" y="21.5" width="27" height="2.5" rx="1.2" fill="currentColor" opacity=".45"/>
      <rect x="4" y="28" width="3.5" height="3.5" rx="1" fill="currentColor" opacity=".5"/>
      <rect x="11" y="28.5" width="31" height="2.5" rx="1.2" fill="currentColor" opacity=".35"/>
      <rect x="4" y="35" width="3.5" height="3.5" rx="1" fill="currentColor" opacity=".5"/>
      <rect x="11" y="35.5" width="20" height="2.5" rx="1.2" fill="currentColor" opacity=".25"/>
    </svg>
  ),
  two_column: (
    <svg width="64" height="44" viewBox="0 0 64 44" fill="none">
      <rect width="64" height="44" rx="3" fill="currentColor" opacity=".07"/>
      <rect x="3"  y="3"  width="27" height="38" rx="2" fill="currentColor" opacity=".08"/>
      <rect x="34" y="3"  width="27" height="38" rx="2" fill="currentColor" opacity=".08"/>
      <rect x="6"  y="8"  width="18" height="2.5" rx="1.2" fill="currentColor" opacity=".7"/>
      <rect x="6"  y="14" width="14" height="2" rx="1" fill="currentColor" opacity=".4"/>
      <rect x="6"  y="19" width="16" height="2" rx="1" fill="currentColor" opacity=".35"/>
      <rect x="6"  y="24" width="12" height="2" rx="1" fill="currentColor" opacity=".3"/>
      <rect x="37" y="8"  width="18" height="2.5" rx="1.2" fill="currentColor" opacity=".7"/>
      <rect x="37" y="14" width="14" height="2" rx="1" fill="currentColor" opacity=".4"/>
      <rect x="37" y="19" width="16" height="2" rx="1" fill="currentColor" opacity=".35"/>
      <rect x="37" y="24" width="12" height="2" rx="1" fill="currentColor" opacity=".3"/>
    </svg>
  ),
  data_table: (
    <svg width="64" height="44" viewBox="0 0 64 44" fill="none">
      <rect width="64" height="44" rx="3" fill="currentColor" opacity=".07"/>
      <rect x="3" y="4"  width="58" height="8"  rx="2" fill="currentColor" opacity=".18"/>
      <rect x="3" y="15" width="58" height="7"  rx="1" fill="currentColor" opacity=".05"/>
      <rect x="3" y="24" width="58" height="7"  rx="1" fill="currentColor" opacity=".08"/>
      <rect x="3" y="33" width="58" height="7"  rx="1" fill="currentColor" opacity=".05"/>
      <line x1="24" y1="3"  x2="24" y2="41" stroke="currentColor" strokeWidth="0.8" opacity=".15"/>
      <line x1="44" y1="3"  x2="44" y2="41" stroke="currentColor" strokeWidth="0.8" opacity=".15"/>
      <rect x="6"  y="6.5" width="13" height="2" rx="1" fill="currentColor" opacity=".7"/>
      <rect x="27" y="6.5" width="10" height="2" rx="1" fill="currentColor" opacity=".7"/>
      <rect x="47" y="6.5" width="10" height="2" rx="1" fill="currentColor" opacity=".7"/>
      <rect x="6"  y="17" width="11" height="2" rx="1" fill="currentColor" opacity=".4"/>
      <rect x="27" y="17" width="9"  height="2" rx="1" fill="currentColor" opacity=".4"/>
    </svg>
  ),
  timeline: (
    <svg width="64" height="44" viewBox="0 0 64 44" fill="none">
      <rect width="64" height="44" rx="3" fill="currentColor" opacity=".07"/>
      <line x1="4" y1="22" x2="60" y2="22" stroke="currentColor" strokeWidth="1.5" opacity=".25"/>
      <circle cx="12" cy="22" r="5" fill="currentColor" opacity=".8"/>
      <circle cx="32" cy="22" r="5" fill="currentColor" opacity=".55"/>
      <circle cx="52" cy="22" r="5" fill="currentColor" opacity=".35"/>
      <rect x="5"  y="30" width="14" height="2" rx="1" fill="currentColor" opacity=".5"/>
      <rect x="25" y="30" width="14" height="2" rx="1" fill="currentColor" opacity=".4"/>
      <rect x="45" y="30" width="14" height="2" rx="1" fill="currentColor" opacity=".3"/>
      <rect x="7"  y="11" width="10" height="2" rx="1" fill="currentColor" opacity=".35"/>
      <rect x="27" y="11" width="10" height="2" rx="1" fill="currentColor" opacity=".25"/>
    </svg>
  ),
  big_stat: (
    <svg width="64" height="44" viewBox="0 0 64 44" fill="none">
      <rect width="64" height="44" rx="3" fill="currentColor" opacity=".07"/>
      <rect x="4"  y="7"  width="26" height="22" rx="4" fill="currentColor" opacity=".12"/>
      <rect x="34" y="7"  width="26" height="22" rx="4" fill="currentColor" opacity=".12"/>
      <rect x="9"  y="13" width="16" height="8"  rx="3" fill="currentColor" opacity=".65"/>
      <rect x="39" y="13" width="16" height="8"  rx="3" fill="currentColor" opacity=".65"/>
      <rect x="6"  y="33" width="18" height="2"  rx="1" fill="currentColor" opacity=".3"/>
      <rect x="36" y="33" width="18" height="2"  rx="1" fill="currentColor" opacity=".3"/>
    </svg>
  ),
  process: (
    <svg width="64" height="44" viewBox="0 0 64 44" fill="none">
      <rect width="64" height="44" rx="3" fill="currentColor" opacity=".07"/>
      <rect x="4"  y="13" width="15" height="15" rx="3.5" fill="currentColor" opacity=".75"/>
      <rect x="25" y="13" width="15" height="15" rx="3.5" fill="currentColor" opacity=".5"/>
      <rect x="46" y="13" width="15" height="15" rx="3.5" fill="currentColor" opacity=".35"/>
      <path d="M19.5 20.5H25M40.5 20.5H46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="5"  y="32" width="12" height="2" rx="1" fill="currentColor" opacity=".35"/>
      <rect x="26" y="32" width="12" height="2" rx="1" fill="currentColor" opacity=".3"/>
      <rect x="47" y="32" width="12" height="2" rx="1" fill="currentColor" opacity=".25"/>
    </svg>
  ),
  quote: (
    <svg width="64" height="44" viewBox="0 0 64 44" fill="none">
      <rect width="64" height="44" rx="3" fill="currentColor" opacity=".07"/>
      <text x="4" y="28" fontSize="24" fill="currentColor" opacity=".15" fontFamily="Georgia, serif">"</text>
      <rect x="3"  y="12" width="2.5" height="18" rx="1.2" fill="currentColor" opacity=".5"/>
      <rect x="18" y="9"  width="38" height="3.5" rx="1.7" fill="currentColor" opacity=".65"/>
      <rect x="18" y="16" width="32" height="2.5" rx="1.2" fill="currentColor" opacity=".45"/>
      <rect x="18" y="22" width="28" height="2.5" rx="1.2" fill="currentColor" opacity=".35"/>
      <rect x="18" y="30" width="20" height="2"   rx="1"   fill="currentColor" opacity=".25"/>
    </svg>
  ),
}

// ── Font style options ────────────────────────────────────────────────────────

const FONT_STYLES: {
  id: TemplateGenerateRequest['style']
  label: string
  tag: string
  desc: string
  headingClass: string
  bodyClass: string
}[] = [
  {
    id: 'professional',
    label: 'Regular',
    tag: 'Sans-Serif',
    desc: 'Clean & corporate',
    headingClass: 'text-[12px] font-bold leading-tight',
    bodyClass: 'text-[9px] font-normal leading-snug',
  },
  {
    id: 'creative',
    label: 'Bold',
    tag: 'Display',
    desc: 'Strong & expressive',
    headingClass: 'text-[12px] font-extrabold leading-tight tracking-tight',
    bodyClass: 'text-[9px] font-semibold leading-snug',
  },
  {
    id: 'minimal',
    label: 'Light',
    tag: 'Elegant',
    desc: 'Refined & spacious',
    headingClass: 'text-[12px] font-light leading-tight tracking-wider',
    bodyClass: 'text-[9px] font-light leading-snug tracking-wide',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const THEME_CATEGORIES = ['professional', 'creative', 'minimal'] as const
const DEFAULT_CUSTOM = { bg: '#1E2A3A', text: '#FFFFFF', accent: '#60A5FA' }

function isValidHex(v: string) { return /^#[0-9A-Fa-f]{6}$/.test(v) }

function SectionIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-7 h-7 rounded-lg bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
      {children}
    </div>
  )
}

function ColorInput({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  const valid = isValidHex(value)
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-pm-primary">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative w-9 h-9 flex-shrink-0">
          <div
            className="w-9 h-9 rounded-lg border border-pm-border overflow-hidden"
            style={{ backgroundColor: valid ? value : '#cccccc' }}
          />
          <input
            type="color" value={valid ? value : '#cccccc'}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <input
          type="text" value={value} maxLength={7}
          onChange={e => onChange(e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value)}
          placeholder="#RRGGBB"
          className={cn(
            'flex-1 px-2.5 py-1.5 rounded-lg border text-xs font-mono text-pm-primary focus:outline-none focus:ring-2 focus:ring-pm-teal/30',
            valid ? 'border-pm-border focus:border-pm-teal' : 'border-pm-danger bg-red-50'
          )}
        />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function GenerateTemplatePage() {
  const navigate = useNavigate()

  const [name, setName]                         = useState('')
  const [description, setDescription]           = useState('')
  const [selectedLayouts, setSelectedLayouts]   = useState<string[]>([])
  const [style, setStyle]                       = useState<TemplateGenerateRequest['style']>('professional')
  const [themeMode, setThemeMode]               = useState<'preset' | 'custom'>('preset')
  const [theme, setTheme]                       = useState('clean_slate')
  const [customBg, setCustomBg]                 = useState(DEFAULT_CUSTOM.bg)
  const [customText, setCustomText]             = useState(DEFAULT_CUSTOM.text)
  const [customAccent, setCustomAccent]         = useState(DEFAULT_CUSTOM.accent)
  const [generated, setGenerated]               = useState<Template | null>(null)

  const customColorsValid = isValidHex(customBg) && isValidHex(customText) && isValidHex(customAccent)

  const previewTheme = themeMode === 'custom'
    ? {
        bg:     isValidHex(customBg)     ? customBg     : DEFAULT_CUSTOM.bg,
        text:   isValidHex(customText)   ? customText   : DEFAULT_CUSTOM.text,
        accent: isValidHex(customAccent) ? customAccent : DEFAULT_CUSTOM.accent,
        name: 'Custom',
      }
    : (THEMES.find(t => t.id === theme) ?? THEMES[0])

  const toggleLayout = (id: string) =>
    setSelectedLayouts(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id])

  const buildBody = (useAi: boolean): TemplateGenerateRequest => ({
    name: name.trim(),
    description: description.trim() || undefined,
    layouts: selectedLayouts,
    slide_count: 8,
    style,
    use_ai: useAi,
    ...(themeMode === 'custom'
      ? { custom_bg: customBg, custom_text: customText, custom_accent: customAccent }
      : { theme }),
  })

  const { mutate: generate, isPending, variables: pendingVars } = useMutation<
    Template, Error, TemplateGenerateRequest
  >({
    mutationFn: async (body) => (await api.post('/templates/generate', body)).data,
    onSuccess: (data) => { setGenerated(data); toast.success('Template saved') },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail?.message ?? err?.response?.data?.detail
      toast.error(typeof msg === 'string' ? msg : 'Failed. Please try again.')
    },
  })

  const isAiPending     = isPending && pendingVars?.use_ai === true
  const isNormalPending = isPending && pendingVars?.use_ai === false
  const canSubmit       = !isPending && !!name.trim() && !(themeMode === 'custom' && !customColorsValid)

  const handleGenerate = (useAi: boolean) => {
    if (!name.trim()) { toast.error('Template name is required'); return }
    if (themeMode === 'custom' && !customColorsValid) {
      toast.error('All three custom colors must be valid hex codes'); return
    }
    generate(buildBody(useAi))
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (generated) {
    const themeName = generated.custom_bg
      ? 'Custom'
      : (THEMES.find(t => t.id === generated.theme)?.name ?? generated.theme ?? '—')
    const themeColor = generated.custom_bg ?? THEMES.find(t => t.id === generated.theme)?.bg ?? '#1E2A3A'

    return (
      <div className="max-w-lg mx-auto py-20 flex flex-col items-center gap-8 text-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-[#E1F5EE] flex items-center justify-center shadow-sm">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M7 18l7 7L29 11" stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-pm-teal flex items-center justify-center shadow-sm">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1l1 2.5L8.5 5 6 6l-1 2.5L4 6 1.5 5 4 3.5 5 1z" fill="white" opacity=".9"/>
            </svg>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold text-pm-teal uppercase tracking-widest mb-2">Template Created</p>
          <h2 className="text-3xl font-extrabold text-pm-primary tracking-tight">{generated.name}</h2>
          {generated.description && (
            <p className="text-pm-muted text-sm mt-2 max-w-xs mx-auto leading-relaxed">{generated.description}</p>
          )}
        </div>

        <div className="flex items-stretch gap-3">
          <div className="px-5 py-3 bg-white border border-pm-border rounded-xl text-center">
            <p className="text-2xl font-extrabold text-pm-primary">{generated.slide_count}</p>
            <p className="text-xs text-pm-muted mt-0.5">Slides</p>
          </div>
          <div className="px-5 py-3 bg-white border border-pm-border rounded-xl text-center">
            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: themeColor }} />
              <p className="text-sm font-bold text-pm-primary">{themeName}</p>
            </div>
            <p className="text-xs text-pm-muted mt-0.5">Theme</p>
          </div>
          <div className="px-5 py-3 bg-white border border-pm-border rounded-xl text-center">
            <p className="text-sm font-bold text-pm-primary capitalize">
              {FONT_STYLES.find(f => f.id === style)?.label ?? style}
            </p>
            <p className="text-xs text-pm-muted mt-0.5">Font Style</p>
          </div>
        </div>

        <p className="text-sm text-pm-muted">Saved to your template library and ready to use.</p>

        <div className="flex gap-3">
          <button
            onClick={() => { setGenerated(null); setName(''); setDescription('') }}
            className="px-5 py-2.5 border border-pm-border rounded-xl text-sm font-semibold text-pm-primary hover:bg-gray-50 transition-colors"
          >
            Generate Another
          </button>
          <button
            onClick={() => navigate('/templates')}
            className="flex items-center gap-2 px-5 py-2.5 bg-pm-teal hover:bg-pm-teal-hover text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="4" y="4" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M4 4V3A1.5 1.5 0 012.5 1.5h0A1.5 1.5 0 011 3v7A1.5 1.5 0 002.5 11.5H4" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
            View in Templates
          </button>
        </div>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-pm-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1.5" y="1.5" width="6" height="6" rx="1.5" stroke="#0F6E56" strokeWidth="1.5"/>
              <rect x="10.5" y="1.5" width="6" height="6" rx="1.5" stroke="#0F6E56" strokeWidth="1.5"/>
              <rect x="1.5" y="10.5" width="6" height="6" rx="1.5" stroke="#0F6E56" strokeWidth="1.5"/>
              <rect x="10.5" y="10.5" width="6" height="6" rx="1.5" stroke="#0F6E56" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-pm-primary tracking-tight">Generate Template</h1>
            <p className="text-sm text-pm-muted mt-0.5">
              Design the visual structure and style for a reusable presentation template.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => handleGenerate(false)}
            disabled={!canSubmit}
            className="flex items-center gap-2 px-4 py-2.5 border border-pm-border bg-white hover:bg-gray-50 text-pm-primary text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isNormalPending ? <Spinner size="sm" /> : (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="7" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="1" y="7" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="7" y="7" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
            )}
            {isNormalPending ? 'Generating…' : 'Generate'}
          </button>

          <button
            onClick={() => handleGenerate(true)}
            disabled={!canSubmit}
            className="flex items-center gap-2 px-4 py-2.5 bg-pm-teal hover:bg-pm-teal-hover text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isAiPending ? <Spinner size="sm" /> : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1l1.5 3.5L12 6l-3.5 1.5L7 11l-1.5-3.5L2 6l3.5-1.5L7 1z"
                  stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            )}
            {isAiPending ? 'Generating…' : 'Generate with AI'}
          </button>
        </div>
      </div>

      {/* Progress banner */}
      {isPending && (
        <div className="flex items-center gap-3 px-4 py-3.5 bg-[#E1F5EE] border border-pm-teal/20 rounded-xl text-sm text-pm-teal font-medium">
          <Spinner size="sm" />
          <span>
            {isAiPending
              ? 'AI is crafting your template structure — usually 10–20 seconds…'
              : 'Building template structure…'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left column ── */}
        <div className="space-y-5">

          {/* Identity */}
          <div className="bg-white rounded-2xl border border-pm-border p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <SectionIcon>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <rect x="1" y="2" width="11" height="9" rx="2" stroke="#6B7280" strokeWidth="1.3"/>
                  <rect x="3.5" y="5" width="6" height="1.5" rx=".7" fill="#6B7280"/>
                  <rect x="3.5" y="7.5" width="4" height="1.5" rx=".7" fill="#6B7280" opacity=".5"/>
                </svg>
              </SectionIcon>
              <div>
                <h2 className="text-sm font-bold text-pm-primary">Template Identity</h2>
                <p className="text-xs text-pm-muted">Name and describe your template</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-pm-primary mb-1.5">
                Name <span className="text-pm-danger">*</span>
              </label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Corporate Blue, Modern Minimal, Bold Creative"
                maxLength={80} disabled={isPending}
                className="w-full px-3 py-2.5 rounded-xl border border-pm-border text-sm text-pm-primary placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal disabled:opacity-50 transition-colors"
              />
              {name.length > 0 && (
                <p className="text-[10px] text-pm-muted mt-1 text-right">{name.length}/80</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-pm-primary mb-1.5">
                Description <span className="text-pm-muted font-normal">(optional)</span>
              </label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Describe the look and feel — e.g. Dark corporate theme with teal accents, ideal for tech presentations"
                rows={2} maxLength={200} disabled={isPending}
                className="w-full px-3 py-2.5 rounded-xl border border-pm-border text-sm text-pm-primary placeholder:text-pm-muted focus:outline-none focus:ring-2 focus:ring-pm-teal/30 focus:border-pm-teal disabled:opacity-50 resize-none transition-colors"
              />
              {description.length > 0 && (
                <p className="text-[10px] text-pm-muted mt-1 text-right">{description.length}/200</p>
              )}
            </div>
          </div>

          {/* Slide Layouts */}
          <div className="bg-white rounded-2xl border border-pm-border p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <SectionIcon>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <rect x="1" y="1" width="5" height="5" rx="1.2" stroke="#6B7280" strokeWidth="1.3"/>
                    <rect x="7" y="1" width="5" height="5" rx="1.2" stroke="#6B7280" strokeWidth="1.3"/>
                    <rect x="1" y="7" width="5" height="5" rx="1.2" stroke="#6B7280" strokeWidth="1.3"/>
                    <rect x="7" y="7" width="5" height="5" rx="1.2" stroke="#6B7280" strokeWidth="1.3"/>
                  </svg>
                </SectionIcon>
                <div>
                  <h2 className="text-sm font-bold text-pm-primary">Slide Layout Types</h2>
                  <p className="text-xs text-pm-muted">Hero cover always included. Leave empty to let AI decide.</p>
                </div>
              </div>
              {selectedLayouts.length > 0 && (
                <button
                  onClick={() => setSelectedLayouts([])}
                  className="text-xs text-pm-muted hover:text-pm-danger transition-colors flex-shrink-0"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {LAYOUTS.map(l => {
                const active = selectedLayouts.includes(l.id)
                return (
                  <button
                    key={l.id}
                    onClick={() => toggleLayout(l.id)}
                    disabled={isPending}
                    className={cn(
                      'group relative flex flex-col items-center gap-1.5 px-1.5 py-3 rounded-xl border-2 transition-all text-center',
                      active
                        ? 'border-pm-teal bg-[#E1F5EE] text-pm-teal'
                        : 'border-pm-border text-pm-muted hover:border-pm-teal/40 hover:bg-gray-50 hover:text-pm-primary'
                    )}
                  >
                    {active && (
                      <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-pm-teal flex items-center justify-center">
                        <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                          <path d="M1 3.5l1.5 1.5 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                    <span className={cn('transition-colors', active ? 'text-pm-teal' : 'text-pm-muted group-hover:text-pm-primary')}>
                      {LAYOUT_PREVIEWS[l.id]}
                    </span>
                    <span className="block text-[10px] font-bold leading-tight">{l.label}</span>
                  </button>
                )
              })}
            </div>

            {selectedLayouts.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedLayouts.map(id => {
                  const l = LAYOUTS.find(x => x.id === id)
                  return (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E1F5EE] text-pm-teal text-[10.5px] font-semibold rounded-full">
                      {l?.label}
                      <button onClick={() => toggleLayout(id)} className="hover:text-pm-teal-hover">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M2 2l4 4M6 2l-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </span>
                  )
                })}
              </div>
            ) : (
              <p className="text-[11px] text-pm-muted italic">No layouts selected — AI will choose a balanced mix.</p>
            )}
          </div>

          {/* Font Style */}
          <div className="bg-white rounded-2xl border border-pm-border p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <SectionIcon>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 11L5.5 3l3.5 8M3.5 8.5h4" stroke="#6B7280" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </SectionIcon>
              <div>
                <h2 className="text-sm font-bold text-pm-primary">Font Style</h2>
                <p className="text-xs text-pm-muted">Typography weight applied across all slides</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {FONT_STYLES.map(f => {
                const active = style === f.id
                return (
                  <button
                    key={f.id}
                    onClick={() => setStyle(f.id)}
                    disabled={isPending}
                    className={cn(
                      'flex flex-col gap-3 p-3 rounded-xl border-2 text-left transition-all',
                      active ? 'border-pm-teal bg-[#E1F5EE]' : 'border-pm-border hover:border-pm-teal/40 hover:bg-gray-50'
                    )}
                  >
                    {/* Mini slide preview using selected theme colors */}
                    <div className="w-full rounded-lg overflow-hidden" style={{ backgroundColor: previewTheme.bg }}>
                      <div className="h-0.5" style={{ backgroundColor: previewTheme.accent }} />
                      <div className="px-2.5 pt-2 pb-2.5 space-y-1.5">
                        <p className={cn(f.headingClass, 'truncate')} style={{ color: previewTheme.text }}>
                          Slide Title
                        </p>
                        <div className="space-y-1">
                          {['Key point one', 'Supporting detail'].map((b, i) => (
                            <div key={i} className="flex items-center gap-1" style={{ color: previewTheme.text, opacity: i === 0 ? 0.82 : 0.62 }}>
                              <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: previewTheme.accent }} />
                              <p className={f.bodyClass}>{b}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={cn('text-xs font-bold', active ? 'text-pm-teal' : 'text-pm-primary')}>
                          {f.label}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-[#F3F4F6] rounded-full text-pm-muted font-semibold">
                          {f.tag}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-pm-muted mt-0.5">{f.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">

          {/* Theme & Colors */}
          <div className="bg-white rounded-2xl border border-pm-border p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <SectionIcon>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="6.5" r="5" stroke="#6B7280" strokeWidth="1.3"/>
                    <circle cx="4.5" cy="6" r="1.5" fill="#6B7280" opacity=".7"/>
                    <circle cx="8.5" cy="5" r="1.5" fill="#6B7280" opacity=".5"/>
                    <circle cx="6.5" cy="9" r="1.5" fill="#6B7280" opacity=".6"/>
                  </svg>
                </SectionIcon>
                <div>
                  <h2 className="text-sm font-bold text-pm-primary">Theme & Colors</h2>
                  <p className="text-xs text-pm-muted">Colour palette for the template</p>
                </div>
              </div>
              <div className="flex items-center bg-[#F3F4F6] rounded-lg p-0.5 gap-0.5">
                <button
                  onClick={() => setThemeMode('preset')}
                  className={cn('px-3 py-1 rounded-md text-xs font-semibold transition-colors',
                    themeMode === 'preset' ? 'bg-white text-pm-primary shadow-sm' : 'text-pm-muted hover:text-pm-primary'
                  )}
                >
                  Presets
                </button>
                <button
                  onClick={() => setThemeMode('custom')}
                  className={cn('px-3 py-1 rounded-md text-xs font-semibold transition-colors',
                    themeMode === 'custom' ? 'bg-white text-pm-primary shadow-sm' : 'text-pm-muted hover:text-pm-primary'
                  )}
                >
                  Custom
                </button>
              </div>
            </div>

            {themeMode === 'preset' ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-0.5">
                {THEME_CATEGORIES.map(cat => (
                  <div key={cat}>
                    <p className="text-[9.5px] font-bold text-pm-muted uppercase tracking-widest mb-2 capitalize">{cat}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {THEMES.filter(t => t.category === cat).map(t => (
                        <button
                          key={t.id} title={t.name}
                          onClick={() => setTheme(t.id)} disabled={isPending}
                          className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all',
                            theme === t.id
                              ? 'border-pm-teal ring-2 ring-pm-teal/20 bg-[#E1F5EE]'
                              : 'border-pm-border hover:border-gray-300 hover:bg-gray-50'
                          )}
                        >
                          <span className="relative flex-shrink-0 w-3.5 h-3.5">
                            <span className="absolute inset-0 rounded-full" style={{ backgroundColor: t.bg }}/>
                            <span className="absolute inset-0 rounded-full border-2" style={{ borderColor: t.accent, backgroundColor: 'transparent' }}/>
                          </span>
                          <span className="text-pm-primary">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-pm-muted">Click a swatch to open the colour picker, or type a hex code directly.</p>
                <div className="grid grid-cols-3 gap-3">
                  <ColorInput label="Background" value={customBg}     onChange={setCustomBg}/>
                  <ColorInput label="Text"        value={customText}   onChange={setCustomText}/>
                  <ColorInput label="Accent"      value={customAccent} onChange={setCustomAccent}/>
                </div>
                {!customColorsValid && (
                  <p className="text-xs text-pm-danger">All three must be valid 6-digit hex codes (e.g. #FF5733).</p>
                )}
              </div>
            )}

            {/* Live mini-slide preview */}
            <div>
              <p className="text-[9.5px] font-bold text-pm-muted uppercase tracking-widest mb-2">Live Preview</p>
              <div className="rounded-xl overflow-hidden border border-pm-border/50 shadow-sm">
                <div className="p-4 space-y-2.5" style={{ backgroundColor: previewTheme.bg }}>
                  <div className="h-1 rounded-full w-14" style={{ backgroundColor: previewTheme.accent }}/>
                  <p className="text-[13px] font-bold leading-tight" style={{ color: previewTheme.text }}>
                    Template Preview
                  </p>
                  <div className="space-y-1.5">
                    {['Key insight here', 'Supporting point', 'Third detail'].map((b, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: previewTheme.accent }}/>
                        <p className="text-[9px]" style={{ color: previewTheme.text, opacity: 0.8 - i * 0.12 }}>{b}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-3 py-2 bg-white border-t border-pm-border/50 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-3 h-3 rounded-sm border border-[#E5E7EB]" style={{ backgroundColor: previewTheme.bg }}/>
                    <span className="w-3 h-3 rounded-sm border border-[#E5E7EB]" style={{ backgroundColor: previewTheme.accent }}/>
                    <span className="w-3 h-3 rounded-sm border border-[#E5E7EB]" style={{ backgroundColor: previewTheme.text }}/>
                  </div>
                  <span className="text-[9px] text-pm-muted font-mono">{previewTheme.bg} · {previewTheme.accent}</span>
                  <span className="ml-auto text-[9.5px] font-semibold text-pm-primary">{previewTheme.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration summary */}
          <div className="bg-[#F9FAFB] rounded-2xl border border-pm-border p-5 space-y-3">
            <div className="flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-pm-muted">
                <path d="M1 2.5A1.5 1.5 0 012.5 1h8A1.5 1.5 0 0112 2.5v8A1.5 1.5 0 0110.5 12h-8A1.5 1.5 0 011 10.5v-8z" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4 6.5l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3 className="text-xs font-bold text-pm-primary">Configuration Summary</h3>
            </div>

            <div className="space-y-0">
              {(
                [
                  {
                    label: 'Theme',
                    value: themeMode === 'custom' ? 'Custom colors' : (THEMES.find(t => t.id === theme)?.name ?? theme),
                    dot: previewTheme.bg as string | undefined,
                    dotBorder: previewTheme.accent as string | undefined,
                  },
                  {
                    label: 'Font Style',
                    value: (() => { const f = FONT_STYLES.find(x => x.id === style); return `${f?.label} (${f?.tag})` })(),
                    dot: undefined as string | undefined,
                    dotBorder: undefined as string | undefined,
                  },
                  {
                    label: 'Layouts',
                    value: selectedLayouts.length === 0
                      ? 'AI decides (recommended)'
                      : `${selectedLayouts.length} type${selectedLayouts.length > 1 ? 's' : ''} selected`,
                    dot: undefined as string | undefined,
                    dotBorder: undefined as string | undefined,
                  },
                ] as { label: string; value: string; dot?: string; dotBorder?: string }[]
              ).map(row => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-pm-border last:border-0">
                  <span className="text-xs text-pm-muted">{row.label}</span>
                  <div className="flex items-center gap-1.5">
                    {row.dot && (
                      <span
                        className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: row.dot, outline: `1.5px solid ${row.dotBorder ?? row.dot}`, outlineOffset: '1px' }}
                      />
                    )}
                    <span className="text-xs font-semibold text-pm-primary">{row.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {!name.trim() ? (
              <div className="flex items-center gap-1.5 text-[11px] text-pm-warning font-medium">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Add a template name to enable generation
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-pm-teal font-medium">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M3.5 6l1.5 1.5 3.5-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Ready to generate
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
