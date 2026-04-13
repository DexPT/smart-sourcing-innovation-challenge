'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { useAppStore } from '@/store/appStore'
import { getPilotStatusConfig, formatAED, formatDate, getScoreBg, getScoreColor } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  FlaskConical, ChevronLeft, CheckCircle2, Clock, AlertCircle,
  XCircle, Users, DollarSign, Calendar, Target,
} from 'lucide-react'

const MILESTONE_ICONS: Record<string, React.ElementType> = {
  completed:   CheckCircle2,
  in_progress: Clock,
  upcoming:    Clock,
  overdue:     AlertCircle,
}
const MILESTONE_COLORS: Record<string, string> = {
  completed:   'text-secondary',
  in_progress: 'text-warning',
  upcoming:    'text-on-surface-variant',
  overdue:     'text-error',
}

const RECOMMENDATION_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  proceed:   { label: 'Proceed to Procurement', bg: 'bg-secondary-container', text: 'text-secondary' },
  modify:    { label: 'Proceed with Modifications', bg: 'bg-warning-container', text: 'text-on-surface' },
  terminate: { label: 'Terminate', bg: 'bg-error-container', text: 'text-error' },
}

export default function PilotDetailPage() {
  const { id } = useParams<{ id: string }>()
  const pilots = useAppStore(s => s.pilots)
  const submissions = useAppStore(s => s.submissions)
  const pilot = pilots.find(p => p.id === id)

  if (!pilot) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FlaskConical className="mb-4 h-12 w-12 text-on-surface-variant/40" />
          <p className="font-display text-headline-md text-on-surface">Pilot not found</p>
          <p className="mt-1 text-body-md text-on-surface-variant">The pilot you're looking for doesn't exist.</p>
          <Link href="/pilots" className="mt-6 inline-flex items-center gap-1.5 text-label-md font-medium text-primary hover:underline">
            <ChevronLeft className="h-4 w-4" /> Back to Pilots
          </Link>
        </div>
      </AppShell>
    )
  }

  const relatedSub  = submissions.find(s => s.id === pilot.submissionId)
  const statusConfig = getPilotStatusConfig(pilot.status)
  const budgetUsed   = Math.round((pilot.spentBudget / pilot.budget) * 100)
  const kpisAchieved = pilot.kpis.filter(k => k.achieved).length
  const recConfig    = pilot.recommendation ? RECOMMENDATION_CONFIG[pilot.recommendation] : null

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back */}
        <Link href="/pilots" className="inline-flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface transition-colors">
          <ChevronLeft className="h-4 w-4" /> Pilots
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-teal-gradient">
            <FlaskConical className="h-7 w-7 text-on-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="font-display text-headline-lg text-on-surface">{pilot.title}</h1>
              <StatusBadge status={statusConfig} />
            </div>
            <p className="text-body-sm text-on-surface-variant capitalize">{pilot.phase} phase</p>
            {relatedSub && (
              <p className="mt-0.5 text-label-sm text-on-surface-variant">
                Linked to{' '}
                <Link href={`/submissions/${relatedSub.id}`} className="text-primary hover:underline">
                  {relatedSub.title}
                </Link>
              </p>
            )}
          </div>
          {recConfig && (
            <span className={`inline-flex flex-shrink-0 rounded-full px-3 py-1 text-label-sm font-semibold ${recConfig.bg} ${recConfig.text}`}>
              {recConfig.label}
            </span>
          )}
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card padding="sm">
            <div className="flex items-center gap-1.5 mb-1">
              <Target className="h-3.5 w-3.5 text-on-surface-variant" />
              <p className="text-label-sm text-on-surface-variant">Progress</p>
            </div>
            <p className="text-title-md font-bold text-on-surface">{pilot.progress}%</p>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-on-surface-variant" />
              <p className="text-label-sm text-on-surface-variant">KPIs Achieved</p>
            </div>
            <p className="text-title-md font-bold text-secondary">{kpisAchieved}/{pilot.kpis.length}</p>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-on-surface-variant" />
              <p className="text-label-sm text-on-surface-variant">Budget Used</p>
            </div>
            <p className="text-title-md font-bold text-on-surface">{budgetUsed}%</p>
            <p className="text-label-sm text-on-surface-variant">{formatAED(pilot.spentBudget)} / {formatAED(pilot.budget)}</p>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="h-3.5 w-3.5 text-on-surface-variant" />
              <p className="text-label-sm text-on-surface-variant">End Date</p>
            </div>
            <p className="text-title-md font-bold text-on-surface">{formatDate(pilot.endDate)}</p>
          </Card>
        </div>

        {/* Final score (if completed) */}
        {pilot.finalScore != null && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Final Pilot Score</p>
                <p className={cn('font-display text-display-md font-bold', getScoreColor(pilot.finalScore))}>
                  {pilot.finalScore}<span className="text-title-lg">/100</span>
                </p>
              </div>
              {recConfig && (
                <span className={`rounded-full px-4 py-1.5 text-label-md font-semibold ${recConfig.bg} ${recConfig.text}`}>
                  {recConfig.label}
                </span>
              )}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardTitle className="mb-3">Description</CardTitle>
              <p className="text-body-md leading-relaxed text-on-surface-variant">{pilot.description}</p>
            </Card>

            {/* Progress bars */}
            <Card>
              <CardTitle className="mb-4">Progress Overview</CardTitle>
              <div className="space-y-4">
                <Progress value={pilot.progress}  label="Overall Progress" showLabel size="md" />
                <Progress value={budgetUsed}       label="Budget Utilisation" showLabel size="md" barClassName={budgetUsed > 90 ? 'bg-error' : 'bg-secondary'} />
              </div>
            </Card>

            {/* KPIs */}
            <Card>
              <CardTitle className="mb-4">KPI Tracker</CardTitle>
              <div className="space-y-3">
                {pilot.kpis.map(kpi => {
                  const pct = Math.min(100, Math.round((kpi.current / kpi.target) * 100))
                  return (
                    <div key={kpi.id} className="rounded-lg bg-surface-container-lowest p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-label-md text-on-surface">{kpi.metric}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-label-sm text-on-surface-variant">
                            {kpi.current}{kpi.unit} / {kpi.target}{kpi.unit}
                          </span>
                          {kpi.achieved ? (
                            <CheckCircle2 className="h-4 w-4 text-secondary" />
                          ) : (
                            <Clock className="h-4 w-4 text-on-surface-variant" />
                          )}
                        </div>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-container">
                        <div
                          className={cn('h-full rounded-full transition-all', kpi.achieved ? 'bg-secondary' : 'bg-primary')}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Milestones */}
            <Card>
              <CardTitle className="mb-4">Milestones</CardTitle>
              <div className="space-y-3">
                {pilot.milestones.map(ms => {
                  const Icon  = MILESTONE_ICONS[ms.status] ?? Clock
                  const color = MILESTONE_COLORS[ms.status] ?? 'text-on-surface-variant'
                  return (
                    <div key={ms.id} className="flex gap-3">
                      <div className={cn('mt-0.5 flex-shrink-0', color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <p className="text-label-md font-medium text-on-surface">{ms.title}</p>
                          <span className={cn('badge text-label-sm capitalize', color === 'text-secondary' ? 'bg-secondary-container text-secondary' : color === 'text-warning' ? 'bg-warning-container text-on-surface' : color === 'text-error' ? 'bg-error-container text-error' : 'bg-surface-container text-on-surface-variant')}>
                            {ms.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-body-sm text-on-surface-variant leading-snug">{ms.description}</p>
                        <p className="mt-0.5 text-label-sm text-on-surface-variant/70">
                          Due {formatDate(ms.dueDate)}
                          {ms.completedAt && ` · Completed ${formatDate(ms.completedAt)}`}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Dates */}
            <Card>
              <CardTitle className="mb-3">Timeline</CardTitle>
              <div className="space-y-2.5">
                {[
                  { label: 'Start Date', value: formatDate(pilot.startDate) },
                  { label: 'End Date',   value: formatDate(pilot.endDate) },
                  { label: 'Created',    value: formatDate(pilot.createdAt) },
                  { label: 'Updated',    value: formatDate(pilot.updatedAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between border-b border-outline-variant/10 pb-2 last:border-0 last:pb-0">
                    <span className="text-label-sm text-on-surface-variant">{label}</span>
                    <span className="text-label-md font-medium text-on-surface">{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Budget */}
            <Card>
              <CardTitle className="mb-3">Budget</CardTitle>
              <div className="space-y-2.5">
                {[
                  { label: 'Total Budget', value: formatAED(pilot.budget) },
                  { label: 'Spent',        value: formatAED(pilot.spentBudget) },
                  { label: 'Remaining',    value: formatAED(pilot.budget - pilot.spentBudget) },
                  { label: 'Utilisation',  value: `${budgetUsed}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between border-b border-outline-variant/10 pb-2 last:border-0 last:pb-0">
                    <span className="text-label-sm text-on-surface-variant">{label}</span>
                    <span className="text-label-md font-medium text-on-surface">{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Stakeholders */}
            <Card>
              <CardTitle className="mb-3">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> Stakeholders
                </span>
              </CardTitle>
              <div className="space-y-1.5">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-gradient text-[10px] font-bold text-on-primary">
                    {pilot.leadEvaluatorName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-label-md text-on-surface">{pilot.leadEvaluatorName}</p>
                    <p className="text-label-sm text-on-surface-variant">Lead Evaluator</p>
                  </div>
                </div>
                {pilot.stakeholders.map(s => (
                  <p key={s} className="text-label-sm text-on-surface-variant pl-8">{s}</p>
                ))}
              </div>
            </Card>

            {/* Notes */}
            {pilot.notes && (
              <Card>
                <CardTitle className="mb-2">Notes</CardTitle>
                <p className="text-body-sm leading-relaxed text-on-surface-variant">{pilot.notes}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
