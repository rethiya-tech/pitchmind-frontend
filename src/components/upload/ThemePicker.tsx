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
            'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
            value === theme.id
              ? 'border-pm-teal ring-2 ring-pm-teal ring-offset-1'
              : 'border-pm-border hover:border-gray-300'
          )}
        >
          {/* Mini slide preview */}
          <div
            className="w-full rounded-lg overflow-hidden relative flex-shrink-0"
            style={{ backgroundColor: theme.bg, height: 56 }}
          >
            {/* Top accent band */}
            <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: theme.accent }} />
            {/* Left accent bar */}
            <div className="absolute left-0 top-2 bottom-2 w-1" style={{ backgroundColor: theme.accent, opacity: 0.6 }} />
            {/* Title line */}
            <div
              className="absolute rounded-full"
              style={{ backgroundColor: theme.text, opacity: 0.85, top: 16, left: 10, width: '52%', height: 3 }}
            />
            {/* Accent underline */}
            <div
              className="absolute rounded-full"
              style={{ backgroundColor: theme.accent, top: 22, left: 10, width: '28%', height: 2 }}
            />
            {/* Bullet lines */}
            <div
              className="absolute rounded-full"
              style={{ backgroundColor: theme.text, opacity: 0.45, top: 30, left: 10, width: '65%', height: 2 }}
            />
            <div
              className="absolute rounded-full"
              style={{ backgroundColor: theme.text, opacity: 0.45, top: 36, left: 10, width: '48%', height: 2 }}
            />
            <div
              className="absolute rounded-full"
              style={{ backgroundColor: theme.text, opacity: 0.45, top: 42, left: 10, width: '55%', height: 2 }}
            />
            {/* Bottom accent band */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ backgroundColor: theme.accent }} />
          </div>
          <span className="text-xs font-medium text-pm-primary text-center leading-tight">
            {theme.name}
          </span>
        </button>
      ))}
    </div>
  )
}
