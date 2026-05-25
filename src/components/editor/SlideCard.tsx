import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/utils/cn'
import type { Slide, Theme } from '@/types'

interface SlideCardProps {
  slide: Slide
  index: number
  isActive?: boolean
  theme: Theme
  locked?: boolean
  onSelect: () => void
  onDelete: () => void
  onTitleChange: (title: string) => void
  style?: React.CSSProperties
  isDragOverlay?: boolean
}

// Inner card — used both inline and inside DragOverlay
export const SlideCardInner = forwardRef<HTMLDivElement, SlideCardProps & {
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}>(function SlideCardInner(
  { slide, index, isActive, theme, locked, onSelect, onDelete, onTitleChange, style, isDragOverlay, dragHandleProps },
  ref
) {
  return (
    <div
      ref={ref}
      style={style}
      data-testid="slide-card"
      onClick={onSelect}
      className={cn(
        'group relative flex items-center gap-2 px-2 py-2 rounded-xl transition-all select-none',
        isDragOverlay ? 'cursor-grabbing shadow-xl ring-2 ring-pm-teal bg-pm-teal-light' : 'cursor-pointer',
        !isDragOverlay && (isActive ? 'bg-pm-teal-light' : 'hover:bg-pm-surface-2')
      )}
    >
      {isActive && !isDragOverlay && (
        <motion.div
          layoutId="active-slide-indicator"
          className="absolute left-0 inset-y-2 w-[3px] rounded-full bg-pm-teal"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
      {/* Drag handle */}
      <div
        {...(locked ? {} : dragHandleProps)}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'flex-shrink-0 flex flex-col gap-[3px] py-1 px-0.5 rounded transition-colors',
          locked
            ? 'opacity-0 pointer-events-none'
            : 'opacity-25 group-hover:opacity-70 cursor-grab active:cursor-grabbing hover:bg-pm-surface-3'
        )}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-3 h-[2px] rounded-full bg-gray-500" />
        ))}
      </div>

      {/* Mini thumbnail */}
      <motion.div
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'relative flex-shrink-0 rounded-md overflow-hidden border',
          isActive ? 'border-pm-teal shadow-sm' : 'border-pm-border'
        )}
        style={{
          width: 68,
          height: 38,
          backgroundColor: theme.bg,
          backgroundImage: `url(/themes/${theme.id}.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute font-bold leading-none px-[7%] truncate"
          style={{ top: '8%', left: 0, right: 0, fontSize: 5, color: theme.text }}
        >
          {slide.title || `Slide ${index + 1}`}
        </div>
        <div className="absolute rounded-full" style={{ top: '30%', left: '7%', width: '22%', height: '4%', backgroundColor: theme.accent }} />
        <div className="absolute" style={{ top: '38%', left: '7%', right: '7%', bottom: '4%' }}>
          {slide.bullets.slice(0, 3).map((b, bi) => (
            <div key={bi} className="flex items-center gap-[3%] mb-[5%]">
              <div className="rounded-full flex-shrink-0" style={{ width: 2, height: 2, backgroundColor: theme.accent }} />
              <div className="truncate" style={{ fontSize: 4, color: theme.text, opacity: 0.8 }}>{b}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Info */}
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

      {/* Delete */}
      {!locked && (
        <button
          data-testid="slide-delete-btn"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-pm-muted hover:text-pm-danger hover:bg-pm-danger/10 transition-all"
          aria-label="Delete slide"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
})

export function SlideCard(props: SlideCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.slide.id,
    disabled: props.locked,
  })

  return (
    <SlideCardInner
      {...props}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
      }}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  )
}
