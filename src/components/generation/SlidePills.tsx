import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { Slide } from '@/types'

interface SlidePillsProps {
  slides: Slide[]
  className?: string
}

export function SlidePills({ slides, className }: SlidePillsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <AnimatePresence>
        {slides.map((slide, i) => (
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 0.75, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' as const }}
            className="flex items-center gap-2 bg-pm-teal-light border border-pm-teal/20 text-pm-teal text-sm px-3 py-1.5 rounded-full"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.12, type: 'spring', stiffness: 400, damping: 20 }}
              className="w-5 h-5 rounded-full bg-pm-teal text-white text-xs flex items-center justify-center font-bold flex-shrink-0"
            >
              {i + 1}
            </motion.span>
            <span className="max-w-[12rem] truncate">{slide.title || `Slide ${i + 1}`}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
