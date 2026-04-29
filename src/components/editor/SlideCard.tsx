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
        style={{
          width: 72,
          height: 41,
          backgroundColor: theme.bg,
          backgroundImage: `url(/themes/${theme.id}.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Title */}
        <div
          className="absolute font-bold leading-none px-[7%] truncate"
          style={{ top: '8%', left: 0, right: 0, fontSize: 5, color: theme.text }}
        >
          {slide.title || `Slide ${index + 1}`}
        </div>
        {/* Accent divider */}
        <div className="absolute rounded-full" style={{ top: '30%', left: '7%', width: '22%', height: '4%', backgroundColor: theme.accent }} />
        {/* Bullets */}
        <div className="absolute" style={{ top: '38%', left: '7%', right: '7%', bottom: '4%' }}>
          {slide.bullets.slice(0, 3).map((b, i) => (
            <div key={i} className="flex items-center gap-[3%] mb-[5%]">
              <div className="rounded-full flex-shrink-0" style={{ width: 2, height: 2, backgroundColor: theme.accent }} />
              <div className="truncate" style={{ fontSize: 4, color: theme.text, opacity: 0.8 }}>{b}</div>
            </div>
          ))}
        </div>
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
