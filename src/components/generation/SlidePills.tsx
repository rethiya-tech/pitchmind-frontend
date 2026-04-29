import { cn } from '@/utils/cn'
import type { Slide } from '@/types'

interface SlidePillsProps {
  slides: Slide[]
  className?: string
}

export function SlidePills({ slides, className }: SlidePillsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className="flex items-center gap-2 bg-pm-teal-light border border-pm-teal/20 text-pm-teal text-sm px-3 py-1.5 rounded-full animate-pulse-once"
        >
          <span className="w-5 h-5 rounded-full bg-pm-teal text-white text-xs flex items-center justify-center font-bold">
            {i + 1}
          </span>
          <span className="max-w-[12rem] truncate">{slide.title || `Slide ${i + 1}`}</span>
        </div>
      ))}
    </div>
  )
}
