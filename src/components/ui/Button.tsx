import { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { Spinner } from './Spinner'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'relative inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-pm-teal hover:bg-pm-teal-hover text-white focus:ring-pm-teal': variant === 'primary',
            'bg-white border border-pm-border text-pm-primary hover:bg-gray-50 focus:ring-pm-teal': variant === 'secondary',
            'bg-pm-danger hover:bg-red-700 text-white focus:ring-pm-danger': variant === 'danger',
            'text-pm-primary hover:bg-gray-100 focus:ring-gray-300': variant === 'ghost',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-5 py-2.5 text-sm': size === 'md',
            'px-8 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner size="sm" className="text-current" />
          </span>
        )}
        <span className={cn({ 'opacity-0': loading })}>{children}</span>
      </button>
    )
  }
)
Button.displayName = 'Button'
