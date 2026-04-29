import { cn } from '@/utils/cn'

interface AIPanelProps {
  children: React.ReactNode
  className?: string
}

export function AIPanel({ children, className }: AIPanelProps) {
  return (
    <div
      className={cn(
        'bg-amber-50 border border-amber-200 rounded-xl p-4',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-amber-600">✨</span>
        <span className="text-sm font-semibold text-amber-800">AI Assistant</span>
      </div>
      {children}
    </div>
  )
}
