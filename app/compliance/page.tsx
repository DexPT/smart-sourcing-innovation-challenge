'use client'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/appStore'
import { useRole } from '@/hooks/useRole'
import { getComplianceStatusConfig } from '@/lib/utils'
import {
  AlertTriangle, CheckCircle2, Clock, XCircle,
  ChevronRight, ShieldCheck, ShieldX, ShieldAlert, X,
} from 'lucide-react'
import Link from 'next/link'
import type { ComplianceResult } from '@/types'

const CHECK_STATUS_ICONS: Record<string, React.ElementType> = {
  pass: CheckCircle2, fail: XCircle, warning: AlertTriangle, pending: Clock,
}
const CHECK_STATUS_COLORS: Record<string, string> = {
  pass: 'text-secondary', fail: 'text-error', warning: 'text-warning', pending: 'text-on-surface-variant',
}

// ─── Compliance action panel ──────────────────────────────────────────────────
type ActivePanel = null | 'approve' | 'conditional' | 'block'

function ComplianceActions({ compResult }: { compResult: ComplianceResult }) {
  const updateComplianceResult = useAppStore(s => s.updateComplianceResult)
  const updateSubmission = useAppStore(s => s.updateSubmission)
  const submissions = useAppStore(s => s.submissions)
  const { currentRole } = useRole()

  const [panel, setPanel] = useState<ActivePanel>(null)
  const [conditions, setConditions] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [done, setDone] = useState(false)

  const relatedSub = submissions.find(s => s.id === compResult.submissionId)
  const actorName = currentRole === 'admin' ? 'Ahmed Al-Maktoum' : 'Sara Ahmed'

  if (done || !['in_progress', 'pending'].includes(compResult.status)) return null

  const handleApprove = () => {
    const now = new Date().toISOString()
    updateComplianceResult(compResult.id, {
      status: 'passed',
      completedAt: now,
      notes: compResult.notes || 'All compliance checks reviewed and approved. No conditions or concerns.',
    })
    if (relatedSub) {
      updateSubmission(relatedSub.id, {
        status: 'approved',
        timeline: [
          ...relatedSub.timeline,
          {
            id: `tl-${Date.now()}`,
            timestamp: now,
            title: 'Compliance Approved',
            description: 'Compliance officer reviewed all checks. All requirements met — submission approved.',
            actorName,
            actorRole: currentRole,
            type: 'compliance' as const,
          },
        ],
      })
    }
    setDone(true)
  }

  const handleConditional = () => {
    if (!conditions.trim()) return
    const now = new Date().toISOString()
    const conditionList = conditions
      .split('\n')
      .map(c => c.trim())
      .filter(Boolean)

    updateComplianceResult(compResult.id, {
      status: 'conditional',
      completedAt: now,
      conditions: conditionList,
      notes: compResult.notes || 'Conditional approval granted. Outstanding conditions must be resolved within agreed timeframe.',
    })
    if (relatedSub) {
      updateSubmission(relatedSub.id, {
        status: 'approved',
        timeline: [
          ...relatedSub.timeline,
          {
            id: `tl-${Date.now()}`,
            timestamp: now,
            title: 'Conditional Approval Granted',
            description: `Compliance officer approved with ${conditionList.length} condition(s): ${conditionList.join('; ')}`,
            actorName,
            actorRole: currentRole,
            type: 'compliance' as const,
          },
        ],
      })
    }
    setDone(true)
  }

  const handleBlock = () => {
    if (blockReason.trim().length < 20) return
    const now = new Date().toISOString()
    updateComplianceResult(compResult.id, {
      status: 'failed',
      completedAt: now,
      notes: blockReason.trim(),
    })
    if (relatedSub) {
      updateSubmission(relatedSub.id, {
        status: 'evaluation',
        timeline: [
          ...relatedSub.timeline,
          {
            id: `tl-${Date.now()}`,
            timestamp: now,
            title: 'Compliance Blocked — Returned to Evaluation',
            description: `Submission blocked by compliance officer. Reason: ${blockReason.trim()}`,
            actorName,
            actorRole: currentRole,
            type: 'compliance' as const,
          },
        ],
      })
    }
    setDone(true)
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <CardTitle subtitle="Record your compliance decision">Officer Decision</CardTitle>
        {panel && (
          <button onClick={() => setPanel(null)} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Check summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Passed', count: compResult.checks.filter(c => c.status === 'pass').length, color: 'text-secondary', bg: 'bg-secondary-container/50' },
          { label: 'Warnings', count: compResult.checks.filter(c => c.status === 'warning').length, color: 'text-warning', bg: 'bg-warning-container/50' },
          { label: 'Failed', count: compResult.checks.filter(c => c.status === 'fail').length, color: 'text-error', bg: 'bg-error-container/50' },
        ].map(item => (
          <div key={item.label} className={`${item.bg} rounded-lg p-2 text-center`}>
            <p className={`font-display text-headline-sm font-bold ${item.color}`}>{item.count}</p>
            <p className="text-label-sm text-on-surface-variant">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      {!panel && (
        <div className="space-y-2">
          <button
            onClick={handleApprove}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary-container/40 hover:bg-secondary-container transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-on-secondary" />
            </div>
            <div>
              <p className="text-label-md font-semibold text-secondary">Approve</p>
              <p className="text-label-sm text-on-surface-variant">All checks pass — advance to approved</p>
            </div>
          </button>

          <button
            onClick={() => setPanel('conditional')}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-warning-container/30 hover:bg-warning-container/60 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-label-md font-semibold text-warning">Conditional Approval</p>
              <p className="text-label-sm text-on-surface-variant">Approve with outstanding requirements</p>
            </div>
          </button>

          <button
            onClick={() => setPanel('block')}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-error-container/30 hover:bg-error-container/60 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-error/20 flex items-center justify-center flex-shrink-0">
              <ShieldX className="w-4 h-4 text-error" />
            </div>
            <div>
              <p className="text-label-md font-semibold text-error">Block</p>
              <p className="text-label-sm text-on-surface-variant">Reject — return to evaluation queue</p>
            </div>
          </button>
        </div>
      )}

      {/* Conditional approval panel */}
      {panel === 'conditional' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 p-2.5 bg-warning-container/50 rounded-lg">
            <ShieldAlert className="w-4 h-4 text-warning flex-shrink-0" />
            <p className="text-label-sm text-on-surface">
              The submission will advance to <strong>approved</strong> but with mandatory conditions.
            </p>
          </div>
          <div>
            <label className="text-label-md font-semibold text-on-surface block mb-1.5">
              Conditions <span className="text-error">*</span>
            </label>
            <textarea
              value={conditions}
              onChange={e => setConditions(e.target.value)}
              rows={4}
              placeholder={`Enter each condition on a new line, e.g.:\nAmend DPA to restrict DR failover to UAE-only facilities\nSubmit 12-month uptime SLA evidence within 14 days`}
              className="input-field resize-none text-body-sm w-full"
              autoFocus
            />
            <p className="text-label-sm text-on-surface-variant/60 mt-1">One condition per line</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleConditional}
              disabled={!conditions.trim()}
              icon={<ShieldAlert />}
              className="flex-1"
            >
              Grant Conditional Approval
            </Button>
            <Button variant="secondary" onClick={() => setPanel(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Block panel */}
      {panel === 'block' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 p-2.5 bg-error-container/40 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-error flex-shrink-0" />
            <p className="text-label-sm text-on-surface">
              This submission will be <strong>blocked</strong> and returned to the evaluation queue.
            </p>
          </div>
          <div>
            <label className="text-label-md font-semibold text-on-surface block mb-1.5">
              Blocking reason <span className="text-error">*</span>
            </label>
            <textarea
              value={blockReason}
              onChange={e => setBlockReason(e.target.value)}
              rows={4}
              placeholder="Describe the compliance failures that prevent this submission from proceeding. This will be logged and communicated to the evaluator..."
              className="input-field resize-none text-body-sm w-full"
              autoFocus
            />
            <p className="text-label-sm text-on-surface-variant/60 mt-1">Required — minimum 20 characters</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={handleBlock}
              disabled={blockReason.trim().length < 20}
              icon={<ShieldX />}
              className="flex-1"
            >
              Block Submission
            </Button>
            <Button variant="secondary" onClick={() => setPanel(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function CompliancePage() {
  const submissions = useAppStore(s => s.submissions)
  const complianceResults = useAppStore(s => s.complianceResults)
  const { can } = useRole()

  const [selectedId, setSelectedId] = useState<string>(complianceResults[0]?.id ?? '')

  const selected = complianceResults.find(c => c.id === selectedId) ?? complianceResults[0]
  const relatedSub = submissions.find(s => s.id === selected?.submissionId)

  const allChecks = complianceResults.flatMap(c => c.checks)
  const stats = {
    total: complianceResults.length,
    passed: complianceResults.filter(c => c.status === 'passed').length,
    inProgress: complianceResults.filter(c => c.status === 'in_progress').length,
    passedChecks: allChecks.filter(ch => ch.status === 'pass').length,
    allChecks: allChecks.length,
  }

  // Submissions in compliance_check with no result yet (newly arrived)
  const pendingNoResult = submissions.filter(
    s => s.status === 'compliance_check' && !complianceResults.find(c => c.submissionId === s.id)
  )

  return (
    <AppShell>
      <div className="space-y-6">
        {/* KPIs */}
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
              {stats.allChecks > 0 ? Math.round((stats.passedChecks / stats.allChecks) * 100) : 0}%
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="space-y-3">
            <h2 className="text-title-md font-semibold text-on-surface">Compliance Reviews</h2>

            {/* Pending with no result — newly arrived */}
            {pendingNoResult.map(sub => (
              <div key={sub.id} className="rounded-lg border border-warning/20 bg-warning-container/30 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="badge bg-warning-container text-on-surface">Awaiting Review</span>
                </div>
                <p className="text-title-sm text-on-surface">{sub.title}</p>
                <p className="text-label-sm text-on-surface-variant">{sub.company}</p>
              </div>
            ))}

            {complianceResults.map(comp => {
              const sub = submissions.find(s => s.id === comp.submissionId)
              const statusConfig = getComplianceStatusConfig(comp.status)
              const passCount = comp.checks.filter(c => c.status === 'pass').length
              const isActive = selected?.id === comp.id

              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedId(comp.id)}
                  className={`w-full rounded-lg p-3 text-left transition-all duration-150 ${
                    isActive
                      ? 'bg-primary/8 ring-1 ring-primary/20'
                      : 'bg-surface-container-lowest shadow-ambient hover:bg-surface-container'
                  }`}
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <StatusBadge status={statusConfig} />
                    <span className={`ml-auto text-label-sm capitalize font-medium ${
                      comp.overallRisk === 'low' ? 'text-secondary'
                        : comp.overallRisk === 'medium' ? 'text-warning'
                          : 'text-error'
                    }`}>
                      {comp.overallRisk} risk
                    </span>
                  </div>
                  <p className="text-title-sm text-on-surface">{sub?.title ?? comp.submissionId}</p>
                  <p className="mt-0.5 text-label-sm text-on-surface-variant">{sub?.company}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-container">
                      <div
                        className="h-full rounded-full bg-secondary"
                        style={{ width: `${(passCount / comp.checks.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-label-sm text-on-surface-variant">{passCount}/{comp.checks.length}</span>
                  </div>
                  <div className="mt-1.5 flex justify-end">
                    <Link
                      href={`/compliance/${comp.id}`}
                      onClick={e => e.stopPropagation()}
                      className="text-label-sm text-primary hover:underline"
                    >
                      Details →
                    </Link>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Detail panel */}
          <div className="space-y-4 lg:col-span-2">
            {selected && relatedSub ? (
              <>
                {/* Header */}
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

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Card>
                    <p className="text-label-sm text-on-surface-variant">Status</p>
                    <StatusBadge status={getComplianceStatusConfig(selected.status)} className="mt-1" />
                  </Card>
                  <Card>
                    <p className="text-label-sm text-on-surface-variant">Risk Level</p>
                    <p className={`mt-1 text-label-lg font-bold capitalize ${
                      selected.overallRisk === 'low' ? 'text-secondary'
                        : selected.overallRisk === 'medium' ? 'text-warning'
                          : 'text-error'
                    }`}>
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

                {/* Officer decision panel — only for in_progress reviews */}
                {can.runComplianceCheck && ['in_progress', 'pending'].includes(selected.status) && (
                  <ComplianceActions
                    key={selected.id}
                    compResult={selected}
                  />
                )}

                {/* Post-decision banner */}
                {selected.status === 'passed' && (
                  <Card className="bg-secondary-container/40">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-secondary flex-shrink-0" />
                      <div>
                        <p className="text-label-md font-semibold text-secondary">Compliance Approved</p>
                        <p className="text-body-sm text-on-surface-variant">All checks passed. Submission has been advanced.</p>
                      </div>
                    </div>
                  </Card>
                )}
                {selected.status === 'conditional' && (
                  <Card className="bg-warning-container/40 border-l-4 border-l-warning">
                    <div className="flex items-center gap-3 mb-3">
                      <ShieldAlert className="w-5 h-5 text-warning flex-shrink-0" />
                      <div>
                        <p className="text-label-md font-semibold text-warning">Conditional Approval</p>
                        <p className="text-body-sm text-on-surface-variant">Submission advanced with outstanding conditions.</p>
                      </div>
                    </div>
                    {selected.conditions && selected.conditions.length > 0 && (
                      <ul className="space-y-1.5 mt-2">
                        {selected.conditions.map((cond, i) => (
                          <li key={i} className="flex items-start gap-2 bg-warning-container/50 rounded-lg p-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
                            <span className="text-body-sm text-on-surface">{cond}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                )}
                {selected.status === 'failed' && (
                  <Card className="bg-error-container/30 border-l-4 border-l-error">
                    <div className="flex items-center gap-3">
                      <ShieldX className="w-5 h-5 text-error flex-shrink-0" />
                      <div>
                        <p className="text-label-md font-semibold text-error">Submission Blocked</p>
                        <p className="text-body-sm text-on-surface-variant">Returned to evaluation queue.</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Regulatory checks */}
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
                                <span className={`badge text-label-sm ${
                                  check.severity === 'critical' ? 'bg-error-container text-error'
                                    : check.severity === 'high' ? 'bg-error-container/50 text-error'
                                      : check.severity === 'medium' ? 'bg-warning-container text-on-surface'
                                        : 'bg-secondary-container text-secondary'
                                }`}>
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

                {/* Officer notes */}
                {selected.notes && (
                  <Card>
                    <p className="mb-2 text-label-sm uppercase tracking-wider text-on-surface-variant">Officer Notes</p>
                    <p className="text-body-sm text-on-surface-variant">{selected.notes}</p>
                  </Card>
                )}
              </>
            ) : (
              <Card className="py-16 text-center">
                <ShieldCheck className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3" />
                <p className="text-body-md text-on-surface-variant">Select a review to see the details</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
