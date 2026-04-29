import { cn } from '@/utils/cn'
import { THEMES } from '@/types'

interface ThemePickerProps {
  value: string
  onChange: (themeId: string) => void
  disabled?: boolean
}

export function ThemePicker({ value, onChange, disabled }: ThemePickerProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-3', { 'opacity-50 pointer-events-none': disabled })}>
      {THEMES.map((theme) => (
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
                /* fallback to solid color if image missing */
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
  )
}
