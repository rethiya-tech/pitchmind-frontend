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
          {/* Mini slide preview matching PPTX output */}
          <div
            className="w-full h-12 rounded-lg overflow-hidden relative"
            style={{ backgroundColor: theme.bg }}
          >
            {/* Top accent band */}
            <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: theme.accent }} />
            {/* Title line */}
            <div
              className="absolute rounded-full"
              style={{ backgroundColor: theme.text, opacity: 0.7, top: 14, left: 6, width: '55%', height: 3 }}
            />
            {/* Bullet lines */}
            <div
              className="absolute rounded-full"
              style={{ backgroundColor: theme.text, opacity: 0.4, top: 22, left: 6, width: '70%', height: 2 }}
            />
            <div
              className="absolute rounded-full"
              style={{ backgroundColor: theme.text, opacity: 0.4, top: 28, left: 6, width: '50%', height: 2 }}
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
