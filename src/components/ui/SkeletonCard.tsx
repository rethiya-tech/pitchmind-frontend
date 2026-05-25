import { cn } from '@/utils/cn'

function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn('skeleton-shimmer rounded-full', className)} />
}

export function SkeletonStatCard() {
  return (
    <div className="bg-pm-surface rounded-2xl border border-pm-border px-6 py-5 flex items-start justify-between shadow-card">
      <div className="space-y-3 flex-1">
        <SkeletonLine className="h-3 w-1/3" />
        <SkeletonLine className="h-8 w-1/2" />
        <SkeletonLine className="h-2.5 w-2/3" />
      </div>
      <div className="w-11 h-11 rounded-xl skeleton-shimmer flex-shrink-0" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 border-b border-pm-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-6 rounded-sm skeleton-shimmer flex-shrink-0" />
        <SkeletonLine className="h-3 w-40" />
      </div>
      <SkeletonLine className="h-6 w-16 rounded-full" />
      <SkeletonLine className="h-3 w-6" />
      <SkeletonLine className="h-3 w-10" />
    </div>
  )
}
