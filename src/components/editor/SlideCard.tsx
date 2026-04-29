import { cn } from '@/utils/cn'
import type { Slide, Theme } from '@/types'

interface SlideCardProps {
  slide: Slide
  index: number
  isActive?: boolean
  theme: Theme
  onSelect: () => void
  onDelete: () => void
  onTitleChange: (title: string) => void
}

export function SlideCard({ slide, index, isActive, theme, onSelect, onDelete, onTitleChange }: SlideCardProps) {
  return (
    <div
      data-testid="slide-card"
      onClick={onSelect}
      className={cn(
        'group relative flex items-center gap-2.5 px-2 py-2 rounded-xl cursor-pointer transition-all select-none',
        isActive
          ? 'bg-[#E1F5EE] ring-1 ring-pm-teal'
          : 'hover:bg-gray-50'
      )}
    >
      {/* ── Mini thumbnail ── */}
      <div
        className={cn(
          'relative flex-shrink-0 rounded-md overflow-hidden border',
          isActive ? 'border-pm-teal shadow-sm' : 'border-pm-border'
        )}
        style={{ width: 72, height: 41, backgroundColor: theme.bg }}
      >
        <div className="absolute top-0 left-0 right-0" style={{ height: '14%', backgroundColor: theme.accent }} />
        <div
          className="absolute top-0 right-0 flex items-center justify-center text-white font-bold border-l border-white/20"
          style={{ width: '16%', height: '14%', fontSize: 5, backgroundColor: theme.accent }}
        >
          {index + 1}
        </div>
        <div
          className="absolute font-bold leading-none px-[6%] truncate"
          style={{ top: '18%', left: 0, right: 0, fontSize: 5, color: theme.text }}
        >
          {slide.title || `Slide ${index + 1}`}
        </div>
        <div className="absolute rounded-full" style={{ top: '42%', left: '6%', width: '24%', height: '5%', backgroundColor: theme.accent }} />
        <div className="absolute" style={{ top: '52%', left: '6%', right: '6%', bottom: '10%' }}>
          {slide.bullets.slice(0, 3).map((b, i) => (
            <div key={i} className="flex items-center gap-[3%] mb-[5%]">
              <div className="rounded-full flex-shrink-0" style={{ width: 2, height: 2, backgroundColor: theme.accent }} />
              <div className="truncate" style={{ fontSize: 4, color: theme.text, opacity: 0.7 }}>{b}</div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '8%', backgroundColor: theme.accent }} />
      </div>

      {/* ── Info ── */}
      <div className="flex-1 min-w-0">
        <input
          data-testid="slide-title"
          value={slide.title}
          placeholder={`Slide ${index + 1}`}
          onChange={(e) => { e.stopPropagation(); onTitleChange(e.target.value) }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'text-xs font-semibold outline-none truncate block w-full bg-transparent cursor-text leading-tight',
            isActive ? 'text-pm-teal' : 'text-pm-primary'
          )}
        />
        {slide.bullets[0] && (
          <p className="text-[10px] text-pm-muted truncate mt-0.5 leading-tight">{slide.bullets[0]}</p>
        )}
      </div>

      {/* ── Delete button ── */}
      <button
        data-testid="slide-delete-btn"
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-pm-muted hover:text-pm-danger hover:bg-red-50 transition-all"
        aria-label="Delete slide"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
