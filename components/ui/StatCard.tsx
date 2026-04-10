import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  change?: number
  trend?: 'up' | 'down' | 'flat'
  icon?: React.ReactNode
  className?: string
  accent?: 'primary' | 'secondary' | 'warning' | 'error'
  gradient?: boolean
}

export function StatCard({ label, value, unit, change, trend, icon, className, accent = 'primary', gradient }: StatCardProps) {
  const accentColors = {
    primary: 'text-primary bg-primary/8',
    secondary: 'text-secondary bg-secondary/8',
    warning: 'text-warning bg-warning/8',
    error: 'text-error bg-error/8',
  }

  return (
    <div
      className={cn(
        'bg-surface-container-lowest rounded-lg p-4 shadow-ambient',
        gradient && 'bg-power-gradient text-on-primary shadow-ambient-md',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={cn('text-label-sm font-medium uppercase tracking-wider truncate', gradient ? 'text-on-primary/70' : 'text-on-surface-variant')}>
            {label}
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={cn('font-display font-bold text-display-sm', gradient ? 'text-on-primary' : 'text-on-surface')}>
              {value}
            </span>
            {unit && (
              <span className={cn('text-label-md font-medium', gradient ? 'text-on-primary/70' : 'text-on-surface-variant')}>
                {unit}
              </span>
            )}
          </div>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 mt-1.5', gradient ? 'text-on-primary/80' : '')}>
              {trend === 'up' ? (
                <TrendingUp className={cn('w-3 h-3', gradient ? 'text-on-primary' : 'text-secondary')} />
              ) : trend === 'down' ? (
                <TrendingDown className={cn('w-3 h-3', gradient ? 'text-on-primary' : 'text-error')} />
              ) : (
                <Minus className={cn('w-3 h-3', gradient ? 'text-on-primary/80' : 'text-on-surface-variant')} />
              )}
              <span className={cn('text-label-sm', !gradient && trend === 'up' && 'text-secondary', !gradient && trend === 'down' && 'text-error', !gradient && trend === 'flat' && 'text-on-surface-variant')}>
                {change > 0 ? '+' : ''}{change}% vs last month
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center', gradient ? 'bg-on-primary/15' : accentColors[accent])}>
            <span className={cn('w-5 h-5', gradient ? 'text-on-primary' : '')}>
              {icon}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
