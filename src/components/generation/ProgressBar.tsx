import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  className?: string
  active?: boolean
}

export function ProgressBar({ value, max = 100, label, className, active = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex justify-between text-sm text-pm-muted">
          <span>{label}</span>
          <motion.span
            key={pct}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {pct}%
          </motion.span>
        </div>
      )}
      <div className="relative h-3 bg-pm-surface-3 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #0F6E56, #0A9B6E)',
            boxShadow: pct > 0 ? '0 0 12px rgba(15,110,86,0.45)' : 'none',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        />
        {active && pct > 0 && pct < 100 && (
          <motion.div
            className="absolute inset-y-0 rounded-full"
            style={{
              width: 60,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
              left: `${pct}%`,
              transform: 'translateX(-100%)',
            }}
            animate={{ left: [`${Math.max(0, pct - 40)}%`, `${pct}%`] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const }}
          />
        )}
      </div>
    </div>
  )
}
