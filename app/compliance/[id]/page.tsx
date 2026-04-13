'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { useAppStore } from '@/store/appStore'
import { getComplianceStatusConfig, getSeverityConfig, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  ShieldCheck, ChevronLeft, CheckCircle2, XCircle, AlertTriangle,
  Clock, User, CalendarCheck, ListChecks,
} from 'lucide-react'

const CHECK_STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  pass:    { icon: CheckCircle2,   color: 'text-secondary',            bg: 'bg-secondary-container' },
  fail:    { icon: XCircle,        color: 'text-error',                bg: 'bg-error-container' },
  warning: { icon: AlertTriangle,  color: 'text-warning',              bg: 'bg-warning-container' },
  pending: { icon: Clock,          color: 'text-on-surface-variant',   bg: 'bg-surface-container' },
}

const RISK_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  low:      { label: 'Low Risk',      bg: 'bg-secondary-container', text: 'text-secondary' },
  medium:   { label: 'Medium Risk',   bg: 'bg-warning-container',   text: 'text-on-surface' },
  high:     { label: 'High Risk',     bg: 'bg-error-container/50',  text: 'text-error' },
  critical: { label: 'Critical Risk', bg: 'bg-error-container',     text: 'text-error' },
}

const CATEGORY_LABELS: Record<string, string> = {
  data_privacy:  'Data Privacy',
  cybersecurity: 'Cybersecurity',
  financial:     'Financial',
  legal:         'Legal',
  operational:   'Operational',
  environmental: 'Environmental',
}

export default function ComplianceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const complianceResults = useAppStore(s => s.complianceResults)
  const submissions       = useAppStore(s => s.submissions)
  const result = complianceResults.find(c => c.id === id)

  if (!result) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShieldCheck className="mb-4 h-12 w-12 text-on-surface-variant/40" />
          <p className="font-display text-headline-md text-on-surface">Compliance review not found</p>
          <p className="mt-1 text-body-md text-on-surface-variant">The compliance review you're looking for doesn't exist.</p>
          <Link href="/compliance" className="mt-6 inline-flex items-center gap-1.5 text-label-md font-medium text-primary hover:underline">
            <ChevronLeft className="h-4 w-4" /> Back to Compliance
          </Link>
        </div>
      </AppShell>
    )
  }

  const relatedSub    = submissions.find(s => s.id === result.submissionId)
  const statusConfig  = getComplianceStatusConfig(result.status)
  const riskConfig    = RISK_CONFIG[result.overallRisk]
  const passCount     = result.checks.filter(c => c.status === 'pass').length
  const failCount     = result.checks.filter(c => c.status === 'fail').length
  const warningCount  = result.checks.filter(c => c.status === 'warning').length

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back */}
        <Link href="/compliance" className="inline-flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface transition-colors">
          <ChevronLeft className="h-4 w-4" /> Compliance
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-tertiary/10">
            <ShieldCheck className="h-7 w-7 text-tertiary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="font-display text-headline-lg text-on-surface">
                Compliance Review
              </h1>
              <StatusBadge status={statusConfig} />
            </div>
            {relatedSub ? (
              <p className="text-body-md text-on-surface-variant">
                For{' '}
                <Link href={`/submissions/${relatedSub.id}`} className="text-primary hover:underline">
                  {relatedSub.title}
                </Link>
              </p>
            ) : (
              <p className="text-body-sm text-on-surface-variant">Submission ID: {result.submissionId}</p>
            )}
          </div>
          <span className={`flex-shrink-0 inline-flex rounded-full px-3 py-1 text-label-sm font-semibold ${riskConfig.bg} ${riskConfig.text}`}>
            {riskConfig.label}
          </span>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card padding="sm">
            <p className="text-label-sm text-on-surface-variant mb-1">Checks Passed</p>
            <p className="text-title-md font-bold text-secondary">{passCount}/{result.checks.length}</p>
          </Card>
          <Card padding="sm">
            <p className="text-label-sm text-on-surface-variant mb-1">Warnings</p>
            <p className="text-title-md font-bold text-warning">{warningCount}</p>
          </Card>
          <Card padding="sm">
            <p className="text-label-sm text-on-surface-variant mb-1">Failures</p>
            <p className={cn('text-title-md font-bold', failCount > 0 ? 'text-error' : 'text-secondary')}>{failCount}</p>
          </Card>
          <Card padding="sm">
            <p className="text-label-sm text-on-surface-variant mb-1">DESC Aligned</p>
            <p className={cn('text-title-md font-bold', result.descAligned ? 'text-secondary' : 'text-error')}>
              {result.descAligned ? 'Yes' : 'No'}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* Compliance checks */}
            <Card>
              <CardTitle className="mb-4">
                <span className="flex items-center gap-1.5">
                  <ListChecks className="h-4 w-4" /> Compliance Checks
                </span>
              </CardTitle>
              <div className="space-y-3">
                {result.checks.map(check => {
                  const cfg      = CHECK_STATUS_CONFIG[check.status] ?? CHECK_STATUS_CONFIG.pending
                  const Icon     = cfg.icon
                  const sevConfig = getSeverityConfig(check.severity)
                  return (
                    <div key={check.id} className="rounded-lg bg-surface-container-lowest p-4">
                      <div className="mb-2 flex flex-wrap items-start gap-2">
                        <Icon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', cfg.color)} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <p className="text-label-md font-medium text-on-surface">{check.name}</p>
                            <span className={`badge text-label-sm ${sevConfig.bg} ${sevConfig.text}`}>{sevConfig.label}</span>
                            <span className="badge bg-surface-container text-on-surface-variant text-label-sm">
                              {CATEGORY_LABELS[check.category] ?? check.category}
                            </span>
                          </div>
                          <p className="text-body-sm text-on-surface-variant">{check.description}</p>
                        </div>
                        <span className={`badge text-label-sm capitalize flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                          {check.status}
                        </span>
                      </div>
                      <p className="pl-6 text-body-sm leading-relaxed text-on-surface-variant">{check.details}</p>
                      {check.regulation && (
                        <p className="mt-1.5 pl-6 text-label-sm text-on-surface-variant/60">
                          Regulation: {check.regulation}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Notes */}
            {result.notes && (
              <Card>
                <CardTitle className="mb-3">Reviewer Notes</CardTitle>
                <p className="text-body-md leading-relaxed text-on-surface-variant">{result.notes}</p>
              </Card>
            )}

            {/* Conditions */}
            {result.conditions && result.conditions.length > 0 && (
              <Card>
                <CardTitle className="mb-3">Approval Conditions</CardTitle>
                <ul className="space-y-2">
                  {result.conditions.map((cond, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
                      <p className="text-body-sm text-on-surface-variant">{cond}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Review details */}
            <Card>
              <CardTitle className="mb-3">Review Details</CardTitle>
              <div className="space-y-2.5">
                {[
                  { label: 'Status',     value: statusConfig.label },
                  { label: 'Risk Level', value: riskConfig.label },
                  { label: 'DESC Aligned', value: result.descAligned ? 'Yes' : 'No' },
                  { label: 'Started',    value: formatDate(result.startedAt) },
                  ...(result.completedAt ? [{ label: 'Completed', value: formatDate(result.completedAt) }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between border-b border-outline-variant/10 pb-2 last:border-0 last:pb-0">
                    <span className="text-label-sm text-on-surface-variant">{label}</span>
                    <span className="text-label-md font-medium text-on-surface">{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Officer */}
            <Card>
              <CardTitle className="mb-3">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" /> Compliance Officer
                </span>
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-tertiary text-on-primary text-sm font-bold">
                  {result.officerName.charAt(0)}
                </div>
                <div>
                  <p className="text-label-md font-medium text-on-surface">{result.officerName}</p>
                  <p className="text-label-sm text-on-surface-variant">Compliance Officer</p>
                </div>
              </div>
            </Card>

            {/* Check summary */}
            <Card>
              <CardTitle className="mb-3">Check Summary</CardTitle>
              <div className="space-y-2">
                {[
                  { label: 'Passed',  value: passCount,    color: 'text-secondary' },
                  { label: 'Warnings', value: warningCount, color: 'text-warning' },
                  { label: 'Failed',  value: failCount,    color: failCount > 0 ? 'text-error' : 'text-on-surface-variant' },
                  { label: 'Pending', value: result.checks.filter(c => c.status === 'pending').length, color: 'text-on-surface-variant' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-label-sm text-on-surface-variant">{label}</span>
                    <span className={cn('text-label-md font-bold', color)}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
