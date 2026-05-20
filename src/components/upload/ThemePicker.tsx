import { useState } from 'react'
import { cn } from '@/utils/cn'
import { THEMES } from '@/types'
import type { Template } from '@/types'
import { templateSlideImageUrl } from '@/utils/slideImage'

function TemplateThumb({ templateId, name, theme, previewCount }: { templateId: string; name: string; theme: string | null; previewCount: number }) {
  const [errored, setErrored] = useState(false)
  const t = THEMES.find(th => th.id === theme) ?? THEMES[0]
  const showImage = previewCount > 0 && !errored

  return (
    <div className="w-full rounded-lg overflow-hidden flex-shrink-0 relative" style={{ aspectRatio: '16/9', backgroundColor: t.bg }}>
      {showImage ? (
        <img
          src={templateSlideImageUrl(templateId, 0)}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col px-2 py-2">
          <div className="h-1.5 rounded-full w-8 mb-1.5" style={{ backgroundColor: t.accent, opacity: 0.8 }} />
          <div className="space-y-1">
            <div className="h-[3px] rounded-full w-full" style={{ backgroundColor: t.text, opacity: 0.2 }} />
            <div className="h-[3px] rounded-full w-4/5" style={{ backgroundColor: t.text, opacity: 0.15 }} />
            <div className="h-[3px] rounded-full w-3/5" style={{ backgroundColor: t.text, opacity: 0.15 }} />
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full opacity-10" style={{ backgroundColor: t.accent, transform: 'translate(30%, 30%)' }} />
        </div>
      )}
    </div>
  )
}

type Category = 'professional' | 'creative' | 'minimal' | 'my_templates'

const BUILT_IN_CATEGORIES: { id: Category; label: string }[] = [
  { id: 'professional', label: 'Professional' },
  { id: 'creative',     label: 'Creative' },
  { id: 'minimal',      label: 'Minimal' },
]

interface ThemePickerProps {
  value: string
  onChange: (themeId: string) => void
  disabled?: boolean
  userTemplates?: Template[]
  selectedTemplateId?: string | null
  onTemplateSelect?: (templateId: string | null) => void
}

export function ThemePicker({ value, onChange, disabled, userTemplates, selectedTemplateId, onTemplateSelect }: ThemePickerProps) {
  const hasUserTemplates = (userTemplates?.length ?? 0) > 0

  const [activeCategory, setActiveCategory] = useState<Category>(() => {
    if (selectedTemplateId) return 'my_templates'
    const theme = THEMES.find(t => t.id === value)
    return theme?.category ?? 'professional'
  })

  const categories = hasUserTemplates
    ? [...BUILT_IN_CATEGORIES, { id: 'my_templates' as Category, label: 'My Templates' }]
    : BUILT_IN_CATEGORIES

  const visibleThemes = THEMES.filter(t => t.category === activeCategory)

  const handleThemeClick = (themeId: string) => {
    onChange(themeId)
    onTemplateSelect?.(null)
  }

  const handleTemplateClick = (template: Template) => {
    onChange(template.theme ?? 'clean_slate')
    onTemplateSelect?.(template.id)
  }

  return (
    <div className={cn('flex flex-col gap-3', { 'opacity-50 pointer-events-none': disabled })}>
      {/* Category tabs */}
      <div className="flex gap-1 bg-pm-app rounded-lg p-1 border border-pm-border">
        {categories.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'flex-1 py-1.5 text-xs font-semibold rounded-md transition-all',
              activeCategory === cat.id
                ? 'bg-white text-pm-teal shadow-sm border border-pm-border'
                : 'text-pm-muted hover:text-pm-primary'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Built-in theme grid */}
      {activeCategory !== 'my_templates' && (
        <div className="grid grid-cols-3 gap-3">
          {visibleThemes.map(theme => (
            <button
              key={theme.id}
              type="button"
              data-testid="theme-swatch"
              onClick={() => handleThemeClick(theme.id)}
              className={cn(
                'flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all',
                value === theme.id && !selectedTemplateId
                  ? 'border-pm-teal ring-2 ring-pm-teal ring-offset-1'
                  : 'border-pm-border hover:border-gray-300'
              )}
            >
              <div className="w-full rounded-lg overflow-hidden flex-shrink-0" style={{ aspectRatio: '16/9' }}>
                <img
                  src={`/themes/${theme.id}.png`}
                  alt={theme.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const el = e.currentTarget
                    el.style.display = 'none'
                    const parent = el.parentElement
                    if (parent) parent.style.backgroundColor = theme.bg
                  }}
                />
              </div>
              <span className="text-xs font-medium text-pm-primary text-center leading-tight">
                {theme.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* User templates grid */}
      {activeCategory === 'my_templates' && (
        <div className="grid grid-cols-3 gap-3">
          {userTemplates?.map(template => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleTemplateClick(template)}
              className={cn(
                'flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all',
                selectedTemplateId === template.id
                  ? 'border-pm-teal ring-2 ring-pm-teal ring-offset-1'
                  : 'border-pm-border hover:border-gray-300'
              )}
            >
              <TemplateThumb templateId={template.id} name={template.name} theme={template.theme} previewCount={template.preview_count ?? 0} />
              <span className="text-xs font-medium text-pm-primary text-center leading-tight line-clamp-1">
                {template.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
