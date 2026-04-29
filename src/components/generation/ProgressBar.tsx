import { cn } from '@/utils/cn'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  className?: string
}

export function ProgressBar({ value, max = 100, label, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <div className="flex justify-between text-sm text-pm-muted">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-pm-teal rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
