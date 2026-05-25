import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-pm-primary mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'border border-pm-border rounded-lg px-4 py-2.5 w-full bg-pm-surface text-pm-primary',
            'focus:outline-none focus:ring-2 focus:ring-pm-teal focus:border-transparent',
            'placeholder:text-pm-muted transition-colors',
            { 'border-pm-danger focus:ring-pm-danger': !!error },
            className
          )}
          {...props}
        />
        {error && <p className="text-pm-danger text-sm mt-1">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
