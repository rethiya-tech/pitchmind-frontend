import { cn } from '@/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'bg-pm-surface rounded-2xl border border-pm-border shadow-sm',
        { 'p-0': padding === 'none', 'p-4': padding === 'sm', 'p-6': padding === 'md', 'p-8': padding === 'lg' },
        className
      )}
    >
      {children}
    </div>
  )
}
