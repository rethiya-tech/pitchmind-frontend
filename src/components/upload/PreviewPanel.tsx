import { cn } from '@/utils/cn'

interface PreviewPanelProps {
  text: string
  wordCount?: number
  className?: string
}

export function PreviewPanel({ text, wordCount, className }: PreviewPanelProps) {
  return (
    <div className={cn('bg-pm-app rounded-xl border border-pm-border overflow-hidden', className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-pm-border bg-pm-surface">
        <span className="text-sm font-medium text-pm-primary">Document Preview</span>
        {wordCount !== undefined && (
          <span className="text-xs text-pm-muted">{wordCount.toLocaleString()} words</span>
        )}
      </div>
      <div className="p-4 max-h-64 overflow-y-auto">
        <p className="text-sm text-pm-muted whitespace-pre-wrap leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
