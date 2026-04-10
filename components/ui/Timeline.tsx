import { cn, formatRelativeTime } from '@/lib/utils'
import type { TimelineEvent } from '@/types'
import { Bot, User, ShieldCheck, CheckCircle2, FileText, AlertCircle, Settings } from 'lucide-react'

const typeConfig = {
  status_change: { icon: CheckCircle2, color: 'text-secondary', bg: 'bg-secondary-container' },
  comment: { icon: User, color: 'text-on-surface-variant', bg: 'bg-surface-container' },
  document: { icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
  decision: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning-container' },
  ai_event: { icon: Bot, color: 'text-primary-tint', bg: 'bg-primary/10' },
  compliance: { icon: ShieldCheck, color: 'text-secondary', bg: 'bg-secondary-container' },
  system: { icon: Settings, color: 'text-on-surface-variant', bg: 'bg-surface-container' },
}

interface TimelineProps {
  events: TimelineEvent[]
  className?: string
}

export function Timeline({ events, className }: TimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className={cn('space-y-0', className)}>
      {sorted.map((event, idx) => {
        const config = typeConfig[event.type] ?? typeConfig.system
        const Icon = config.icon
        const isLast = idx === sorted.length - 1

        return (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', config.bg)}>
                <Icon className={cn('w-4 h-4', config.color)} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-outline-variant/20 my-1" />}
            </div>

            <div className={cn('flex-1 pb-4', isLast && 'pb-0')}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-title-sm text-on-surface">{event.title}</p>
                <span className="text-label-sm text-on-surface-variant flex-shrink-0">{formatRelativeTime(event.timestamp)}</span>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-0.5">{event.description}</p>
              <p className="text-label-sm text-on-surface-variant/60 mt-1">{event.actorName} · {event.actorRole}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
