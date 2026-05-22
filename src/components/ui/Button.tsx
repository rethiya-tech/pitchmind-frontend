import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils/cn'
import { Spinner } from './Spinner'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, children, className, ...props }, ref) => {
    const isInactive = disabled || loading
    return (
      <motion.button
        ref={ref}
        disabled={isInactive}
        whileHover={!isInactive ? { scale: 1.02 } : undefined}
        whileTap={!isInactive ? { scale: 0.97 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={cn(
          'relative inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-gradient-to-r from-pm-teal to-[#0A9B6E] hover:from-pm-teal-hover hover:to-[#0F8060] text-white focus:ring-pm-teal shadow-sm': variant === 'primary',
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
      </motion.button>
    )
  }
)
Button.displayName = 'Button'
