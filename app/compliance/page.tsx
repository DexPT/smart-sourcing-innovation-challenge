'use client'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/appStore'
import { complianceResults } from '@/data/compliance'
import { getComplianceStatusConfig, getSubmissionStatusConfig, formatDate, formatRelativeTime } from '@/lib/utils'
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, XCircle, ChevronRight, Filter } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import type { ComplianceResult } from '@/types'

const CHECK_STATUS_ICONS: Record<string, React.ElementType> = {
  pass: CheckCircle2, fail: XCircle, warning: AlertTriangle, pending: Clock
}
const CHECK_STATUS_COLORS: Record<string, string> = {
  pass: 'text-secondary', fail: 'text-error', warning: 'text-warning', pending: 'text-on-surface-variant'
}

export default function CompliancePage() {
  const submissions = useAppStore(s => s.submissions)
  const [selectedId, setSelectedId] = useState<string>(complianceResults[0]?.id ?? '')

  const selected = complianceResults.find(c => c.id === selectedId) ?? complianceResults[0]
  const relatedSub = submissions.find(s => s.id === selected?.submissionId)

  // Stats
  const stats = {
    total: complianceResults.length,
    passed: complianceResults.filter(c => c.status === 'passed').length,
    inProgress: complianceResults.filter(c => c.status === 'in_progress').length,
    failed: complianceResults.filter(c => c.status === 'failed').length,
    allChecks: complianceResults.flatMap(c => c.checks).length,
    passedChecks: complianceResults.flatMap(c => c.checks).filter(ch => ch.status === 'pass').length,
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Reviews</p>
            <p className="font-display font-bold text-display-sm text-on-surface mt-1">{stats.total}</p>
          </Card>
          <Card className="border-l-4 border-l-secondary">
            <p className="text-label-sm text-secondary uppercase tracking-wider">Passed</p>
            <p className="font-display font-bold text-display-sm text-secondary mt-1">{stats.passed}</p>
          </Card>
          <Card className="border-l-4 border-l-warning">
            <p className="text-label-sm text-warning uppercase tracking-wider">In Progress</p>
            <p className="font-display font-bold text-display-sm text-warning mt-1">{stats.inProgress}</p>
          </Card>
          <Card>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Check Pass Rate</p>
            <p className="font-display font-bold text-display-sm text-on-surface mt-1">
              {Math.round((stats.passedChecks / stats.allChecks) * 100)}%
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Review List */}
          <div className="space-y-3">
            <h2 className="text-title-md text-on-surface font-semibold">Compliance Reviews</h2>
            {complianceResults.map(comp => {
              const sub = submissions.find(s => s.id === comp.submissionId)
              const statusConfig = getComplianceStatusConfig(comp.status)
              const passCount = comp.checks.filter(c => c.status === 'pass').length
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedId(comp.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-150 ${selected?.id === comp.id ? 'bg-primary/8 ring-1 ring-primary/20' : 'bg-surface-container-lowest hover:bg-surface-container shadow-ambient'}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <StatusBadge status={statusConfig} />
                    <span className={`text-label-sm ml-auto ${comp.overallRisk === 'low' ? 'text-secondary' : comp.overallRisk === 'medium' ? 'text-warning' : 'text-error'}`}>
                      {comp.overallRisk} risk
                    </span>
                  </div>
                  <p className="text-title-sm text-on-surface">{sub?.title ?? comp.submissionId}</p>
                  <p className="text-label-sm text-on-surface-variant mt-0.5">{sub?.company}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${(passCount / comp.checks.length) * 100}%` }} />
                    </div>
                    <span className="text-label-sm text-on-surface-variant">{passCount}/{comp.checks.length}</span>
                  </div>
                </button>
              )
            })}

            {/* Pending submissions */}
            {submissions.filter(s => s.status === 'compliance_check' && !complianceResults.find(c => c.submissionId === s.id)).map(sub => (
              <div key={sub.id} className="p-3 rounded-lg bg-warning-container/30 border border-warning/20">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-warning" />
                  <span className="badge bg-warning-container text-warning">Pending Review</span>
                </div>
                <p className="text-title-sm text-on-surface">{sub.title}</p>
                <p className="text-label-sm text-on-surface-variant">{sub.company}</p>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2 space-y-4">
            {selected && relatedSub && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-headline-md text-on-surface">{relatedSub.title}</h2>
                    <p className="text-body-md text-on-surface-variant">{relatedSub.company} · Officer: {selected.officerName}</p>
                  </div>
                  <Link href={`/submissions/${relatedSub.id}`}>
                    <Button variant="secondary" size="sm" icon={<ChevronRight />} iconPosition="right">View Submission</Button>
                  </Link>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <Card>
                    <p className="text-label-sm text-on-surface-variant">Status</p>
                    <StatusBadge status={getComplianceStatusConfig(selected.status)} className="mt-1" />
                  </Card>
                  <Card>
                    <p className="text-label-sm text-on-surface-variant">Risk Level</p>
                    <p className={`text-label-lg font-bold mt-1 capitalize ${selected.overallRisk === 'low' ? 'text-secondary' : selected.overallRisk === 'medium' ? 'text-warning' : 'text-error'}`}>
                      {selected.overallRisk}
                    </p>
                  </Card>
                  <Card>
                    <p className="text-label-sm text-on-surface-variant">DESC Aligned</p>
                    <p className={`text-label-lg font-bold mt-1 ${selected.descAligned ? 'text-secondary' : 'text-error'}`}>
                      {selected.descAligned ? 'Yes' : 'No'}
                    </p>
                  </Card>
                </div>

                {/* Checks */}
                <Card padding="none">
                  <div className="p-4 border-b border-outline-variant/10">
                    <CardTitle subtitle="Individual compliance checks">Regulatory Checks</CardTitle>
                  </div>
                  <div className="divide-y divide-outline-variant/10">
                    {selected.checks.map(check => {
                      const Icon = CHECK_STATUS_ICONS[check.status] ?? Clock
                      const color = CHECK_STATUS_COLORS[check.status] ?? 'text-on-surface-variant'
                      return (
                        <div key={check.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <Icon className={`w-5 h-5 ${color} flex-shrink-0 mt-0.5`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <p className="text-title-sm text-on-surface">{check.name}</p>
                                <span className={`badge text-label-sm ${check.severity === 'critical' ? 'bg-error-container text-error' : check.severity === 'high' ? 'bg-error-container/50 text-error' : check.severity === 'medium' ? 'bg-warning-container text-warning' : 'bg-secondary-container text-secondary'}`}>
                                  {check.severity}
                                </span>
                                <span className="badge bg-surface-container text-on-surface-variant text-label-sm">{check.category.replace('_', ' ')}</span>
                              </div>
                              <p className="text-body-sm text-on-surface-variant">{check.description}</p>
                              <p className="text-body-sm text-on-surface mt-1">{check.details}</p>
                              {check.regulation && (
                                <p className="text-label-sm text-on-surface-variant/60 mt-1">📋 {check.regulation}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>

                {/* Conditions & Notes */}
                {(selected.conditions?.length || selected.notes) && (
                  <Card>
                    {selected.conditions && selected.conditions.length > 0 && (
                      <div className="mb-4">
                        <p className="text-label-sm text-warning uppercase tracking-wider mb-2">Approval Conditions</p>
                        <ul className="space-y-1.5">
                          {selected.conditions.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 p-2 bg-warning-container/30 rounded-md">
                              <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
                              <span className="text-body-sm text-on-surface">{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selected.notes && (
                      <div>
                        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Officer Notes</p>
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
