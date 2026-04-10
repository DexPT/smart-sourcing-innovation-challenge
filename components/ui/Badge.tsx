import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'neutral'
  size?: 'sm' | 'md'
  dot?: boolean
}

const variantClasses = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-secondary-container text-secondary',
  error: 'bg-error-container text-error',
  warning: 'bg-warning-container text-on-surface',
  info: 'bg-primary/10 text-primary-tint',
  neutral: 'bg-surface-container text-on-surface-variant',
}

export function Badge({ children, className, variant = 'default', size = 'md', dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'badge rounded-full leading-none',
        variantClasses[variant],
        size === 'sm' && 'text-label-sm px-1.5 py-1',
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'inline-block w-1.5 h-1.5 rounded-full',
            variant === 'success' && 'bg-secondary',
            variant === 'error' && 'bg-error',
            variant === 'warning' && 'bg-warning',
            variant === 'info' && 'bg-primary-tint',
            (variant === 'default' || variant === 'neutral') && 'bg-on-surface-variant',
          )}
        />
      )}
      {children}
    </span>
  )
}

// Convenience wrappers
export function StatusBadge({ status, className }: { status: { label: string; bg: string; text: string }; className?: string }) {
  return (
    <span className={cn('badge rounded-full leading-none', status.bg, status.text, className)}>
      {status.label}
    </span>
  )
}
