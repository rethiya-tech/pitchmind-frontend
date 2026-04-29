import { cn } from '@/utils/cn'

interface Step {
  label: string
  href?: string
}

interface StepBreadcrumbProps {
  steps: Step[]
  current: number
}

export function StepBreadcrumb({ steps, current }: StepBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {steps.map((step, i) => (
        <span key={step.label} className="flex items-center gap-2">
          {i > 0 && <span className="text-pm-muted">→</span>}
          <span
            className={cn(
              'font-medium',
              i < current ? 'text-pm-teal' : i === current ? 'text-pm-primary' : 'text-pm-muted'
            )}
          >
            {step.label}
          </span>
        </span>
      ))}
    </nav>
  )
}
