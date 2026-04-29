import { useState } from 'react'
import { cn } from '@/utils/cn'
import { THEMES } from '@/types'

type Category = 'professional' | 'creative' | 'minimal'

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'professional', label: 'Professional' },
  { id: 'creative',     label: 'Creative' },
  { id: 'minimal',      label: 'Minimal' },
]

interface ThemePickerProps {
  value: string
  onChange: (themeId: string) => void
  disabled?: boolean
}

export function ThemePicker({ value, onChange, disabled }: ThemePickerProps) {
  const [activeCategory, setActiveCategory] = useState<Category>(() => {
    const theme = THEMES.find(t => t.id === value)
    return theme?.category ?? 'professional'
  })

  const visibleThemes = THEMES.filter(t => t.category === activeCategory)

  return (
    <div className={cn('flex flex-col gap-3', { 'opacity-50 pointer-events-none': disabled })}>
      {/* Category tabs */}
      <div className="flex gap-1 bg-pm-app rounded-lg p-1 border border-pm-border">
        {CATEGORIES.map(cat => (
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

      {/* Theme grid */}
      <div className="grid grid-cols-3 gap-3">
        {visibleThemes.map(theme => (
          <button
            key={theme.id}
            type="button"
            data-testid="theme-swatch"
            onClick={() => onChange(theme.id)}
            className={cn(
              'flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all',
              value === theme.id
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
    </div>
  )
}
