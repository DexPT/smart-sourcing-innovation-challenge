import { cn, clamp } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  barClassName?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  gradient?: boolean
}

export function Progress({ value, max = 100, className, barClassName, size = 'md', showLabel, label, gradient }: ProgressProps) {
  const pct = clamp((value / max) * 100)

  const heights = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2.5',
  }

  return (
    <div className={cn('space-y-1', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-label-sm text-on-surface-variant">{label}</span>}
          {showLabel && <span className="text-label-sm font-semibold text-on-surface">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-surface-container rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            gradient ? 'bg-power-gradient' : (barClassName ?? 'bg-secondary'),
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// Radial progress for compact displays
interface RadialProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  color?: string
}

export function RadialProgress({ value, size = 48, strokeWidth = 4, className, color }: RadialProgressProps) {
  const r = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * r
  const pct = clamp(value)
  const offset = circumference - (pct / 100) * circumference

  return (
    <svg width={size} height={size} className={cn('-rotate-90', className)}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-surface-container" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color ?? 'currentColor'}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference - offset} ${offset}`}
        strokeLinecap="round"
        className={color ? '' : 'text-secondary'}
      />
    </svg>
  )
}
