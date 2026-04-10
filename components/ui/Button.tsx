import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { cloneElement, forwardRef, isValidElement } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, iconPosition = 'left', children, className, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-sans text-label-md leading-none font-medium transition-all duration-200 ease-in-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap'

    const variants = {
      primary: 'bg-power-gradient text-on-primary hover:opacity-90 shadow-ambient-sm',
      secondary: 'bg-transparent text-primary border border-outline-variant/20 hover:bg-primary/5',
      ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
      danger: 'bg-error-container text-error hover:bg-error hover:text-on-error',
    }

    const sizes = {
      sm: 'min-h-9 px-3 py-2',
      md: 'min-h-10 px-4 py-2.5',
      lg: 'min-h-11 px-5 py-3',
    }

    const renderIcon = () => {
      if (!icon) return null

      if (isValidElement<{ className?: string }>(icon)) {
        return cloneElement(icon, {
          className: cn(icon.props.className, 'w-4 h-4 text-current'),
        })
      }

      return icon
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          icon && iconPosition === 'left' && <span className="flex-shrink-0">{renderIcon()}</span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{renderIcon()}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
