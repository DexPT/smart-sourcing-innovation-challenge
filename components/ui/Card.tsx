import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  gradient?: boolean
}

export function Card({ children, className, hover, padding = 'md', gradient }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  return (
    <div
      className={cn(
        'card',
        paddingClasses[padding],
        hover && 'cursor-pointer transition-shadow duration-200 hover:shadow-ambient-md',
        gradient && 'bg-power-gradient text-on-primary',
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

export function CardHeader({ children, className, actions }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div className="flex-1 min-w-0">{children}</div>
      {actions && <div className="flex-shrink-0 self-start">{actions}</div>}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
  subtitle?: string
}

export function CardTitle({ children, className, subtitle }: CardTitleProps) {
  return (
    <div className={className}>
      <h3 className="font-display text-title-md text-on-surface font-semibold">{children}</h3>
      {subtitle && <p className="text-body-sm text-on-surface-variant mt-0.5">{subtitle}</p>}
    </div>
  )
}

interface CardSectionProps {
  children: React.ReactNode
  className?: string
  label?: string
}

export function CardSection({ children, className, label }: CardSectionProps) {
  return (
    <div className={cn('bg-surface-container-low rounded-md p-3', className)}>
      {label && <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">{label}</p>}
      {children}
    </div>
  )
}
