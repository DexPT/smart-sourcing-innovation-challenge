'use client'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/appStore'
import { complianceResults } from '@/data/compliance'
import { getComplianceStatusConfig } from '@/lib/utils'
import { AlertTriangle, CheckCircle2, Clock, XCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const CHECK_STATUS_ICONS: Record<string, React.ElementType> = {
  pass: CheckCircle2,
  fail: XCircle,
  warning: AlertTriangle,
  pending: Clock,
}

const CHECK_STATUS_COLORS: Record<string, string> = {
  pass: 'text-secondary',
  fail: 'text-error',
  warning: 'text-warning',
  pending: 'text-on-surface-variant',
}

export default function CompliancePage() {
  const submissions = useAppStore(s => s.submissions)
  const [selectedId, setSelectedId] = useState<string>(complianceResults[0]?.id ?? '')

  const selected = complianceResults.find(c => c.id === selectedId) ?? complianceResults[0]
  const relatedSub = submissions.find(s => s.id === selected?.submissionId)

  const stats = {
    total: complianceResults.length,
    passed: complianceResults.filter(c => c.status === 'passed').length,
    inProgress: complianceResults.filter(c => c.status === 'in_progress').length,
    allChecks: complianceResults.flatMap(c => c.checks).length,
    passedChecks: complianceResults.flatMap(c => c.checks).filter(ch => ch.status === 'pass').length,
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">Reviews</p>
            <p className="mt-1 font-display text-display-sm font-bold text-on-surface">{stats.total}</p>
          </Card>
          <Card className="border-l-4 border-l-secondary">
            <p className="text-label-sm uppercase tracking-wider text-secondary">Passed</p>
            <p className="mt-1 font-display text-display-sm font-bold text-secondary">{stats.passed}</p>
          </Card>
          <Card className="border-l-4 border-l-warning">
            <p className="text-label-sm uppercase tracking-wider text-on-surface">In Progress</p>
            <p className="mt-1 font-display text-display-sm font-bold text-on-surface">{stats.inProgress}</p>
          </Card>
          <Card>
            <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">Check Pass Rate</p>
            <p className="mt-1 font-display text-display-sm font-bold text-on-surface">
              {Math.round((stats.passedChecks / stats.allChecks) * 100)}%
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h2 className="text-title-md font-semibold text-on-surface">Compliance Reviews</h2>
            {complianceResults.map(comp => {
              const sub = submissions.find(s => s.id === comp.submissionId)
              const statusConfig = getComplianceStatusConfig(comp.status)
              const passCount = comp.checks.filter(c => c.status === 'pass').length

              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedId(comp.id)}
                  className={`w-full rounded-lg p-3 text-left transition-all duration-150 ${
                    selected?.id === comp.id
                      ? 'bg-primary/8 ring-1 ring-primary/20'
                      : 'bg-surface-container-lowest shadow-ambient hover:bg-surface-container'
                  }`}
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <StatusBadge status={statusConfig} />
                    <span
                      className={`ml-auto text-label-sm ${
                        comp.overallRisk === 'low'
                          ? 'text-secondary'
                          : comp.overallRisk === 'medium'
                            ? 'text-warning'
                            : 'text-error'
                      }`}
                    >
                      {comp.overallRisk} risk
                    </span>
                  </div>
                  <p className="text-title-sm text-on-surface">{sub?.title ?? comp.submissionId}</p>
                  <p className="mt-0.5 text-label-sm text-on-surface-variant">{sub?.company}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-container">
                      <div className="h-full rounded-full bg-secondary" style={{ width: `${(passCount / comp.checks.length) * 100}%` }} />
                    </div>
                    <span className="text-label-sm text-on-surface-variant">
                      {passCount}/{comp.checks.length}
                    </span>
                  </div>
                </button>
              )
            })}

            {submissions
              .filter(s => s.status === 'compliance_check' && !complianceResults.find(c => c.submissionId === s.id))
              .map(sub => (
                <div key={sub.id} className="rounded-lg border border-warning/20 bg-warning-container/30 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning" />
                    <span className="badge bg-warning-container text-on-surface">Pending Review</span>
                  </div>
                  <p className="text-title-sm text-on-surface">{sub.title}</p>
                  <p className="text-label-sm text-on-surface-variant">{sub.company}</p>
                </div>
              ))}
          </div>

          <div className="space-y-4 lg:col-span-2">
            {selected && relatedSub && (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-display text-headline-md text-on-surface">{relatedSub.title}</h2>
                    <p className="text-body-md text-on-surface-variant">
                      {relatedSub.company} · Officer: {selected.officerName}
                    </p>
                  </div>
                  <Link href={`/submissions/${relatedSub.id}`} className="w-full sm:w-auto">
                    <Button variant="secondary" size="sm" icon={<ChevronRight />} iconPosition="right" className="w-full sm:w-auto">
                      View Submission
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Card>
                    <p className="text-label-sm text-on-surface-variant">Status</p>
                    <StatusBadge status={getComplianceStatusConfig(selected.status)} className="mt-1" />
                  </Card>
                  <Card>
                    <p className="text-label-sm text-on-surface-variant">Risk Level</p>
                    <p
                      className={`mt-1 text-label-lg font-bold capitalize ${
                        selected.overallRisk === 'low'
                          ? 'text-secondary'
                          : selected.overallRisk === 'medium'
                            ? 'text-warning'
                            : 'text-error'
                      }`}
                    >
                      {selected.overallRisk}
                    </p>
                  </Card>
                  <Card>
                    <p className="text-label-sm text-on-surface-variant">DESC Aligned</p>
                    <p className={`mt-1 text-label-lg font-bold ${selected.descAligned ? 'text-secondary' : 'text-error'}`}>
                      {selected.descAligned ? 'Yes' : 'No'}
                    </p>
                  </Card>
                </div>

                <Card padding="none">
                  <div className="border-b border-outline-variant/10 p-4">
                    <CardTitle subtitle="Individual compliance checks">Regulatory Checks</CardTitle>
                  </div>
                  <div className="divide-y divide-outline-variant/10">
                    {selected.checks.map(check => {
                      const Icon = CHECK_STATUS_ICONS[check.status] ?? Clock
                      const color = CHECK_STATUS_COLORS[check.status] ?? 'text-on-surface-variant'
                      return (
                        <div key={check.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${color}`} />
                            <div className="min-w-0 flex-1">
                              <div className="mb-0.5 flex flex-wrap items-center gap-2">
                                <p className="text-title-sm text-on-surface">{check.name}</p>
                                <span
                                  className={`badge text-label-sm ${
                                    check.severity === 'critical'
                                      ? 'bg-error-container text-error'
                                      : check.severity === 'high'
                                        ? 'bg-error-container/50 text-error'
                                        : check.severity === 'medium'
                                          ? 'bg-warning-container text-on-surface'
                                          : 'bg-secondary-container text-secondary'
                                  }`}
                                >
                                  {check.severity}
                                </span>
                                <span className="badge bg-surface-container text-label-sm text-on-surface-variant">
                                  {check.category.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-body-sm text-on-surface-variant">{check.description}</p>
                              <p className="mt-1 text-body-sm text-on-surface">{check.details}</p>
                              {check.regulation && (
                                <p className="mt-1 text-label-sm text-on-surface-variant/60">Regulation: {check.regulation}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>

                {(selected.conditions?.length || selected.notes) && (
                  <Card>
                    {selected.conditions && selected.conditions.length > 0 && (
                      <div className="mb-4">
                        <p className="mb-2 text-label-sm uppercase tracking-wider text-on-surface">Approval Conditions</p>
                        <ul className="space-y-1.5">
                          {selected.conditions.map((condition, i) => (
                            <li key={i} className="flex items-start gap-2 rounded-lg bg-warning-container/30 p-2">
                              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-warning" />
                              <span className="text-body-sm text-on-surface">{condition}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selected.notes && (
                      <div>
                        <p className="mb-2 text-label-sm uppercase tracking-wider text-on-surface-variant">Officer Notes</p>
                        <p className="text-body-sm text-on-surface-variant">{selected.notes}</p>
                      </div>
                    )}
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
