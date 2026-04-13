'use client'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/appStore'
import { useRole } from '@/hooks/useRole'
import { vendors } from '@/data/vendors'
import {
  formatAED, formatDate, getScoreColor, getScoreBg,
  getVendorTierConfig,
} from '@/lib/utils'
import {
  CheckCircle2, Clock, FileText, Building2, Calendar,
  Brain, ShieldCheck, FlaskConical, Star, XCircle,
  RotateCcw, X, AlertTriangle, ShieldAlert,
} from 'lucide-react'
import Link from 'next/link'
import type { ProcurementDecision } from '@/types'

const PROC_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending_approval: { label: 'Pending Approval', bg: 'bg-warning-container', text: 'text-on-surface' },
  approved: { label: 'Approved', bg: 'bg-secondary-container', text: 'text-secondary' },
  contracted: { label: 'Contracted', bg: 'bg-primary/10', text: 'text-primary' },
  active: { label: 'Active', bg: 'bg-secondary-container', text: 'text-secondary' },
  completed: { label: 'Completed', bg: 'bg-surface-container', text: 'text-on-surface-variant' },
  cancelled: { label: 'Cancelled', bg: 'bg-error-container', text: 'text-error' },
}

// ─── Decision summary panel ───────────────────────────────────────────────────
function DecisionSummary({ decision }: { decision: ProcurementDecision }) {
  const submissions = useAppStore(s => s.submissions)
  const complianceResults = useAppStore(s => s.complianceResults)
  const pilots = useAppStore(s => s.pilots)

  const sub = submissions.find(s => s.id === decision.submissionId)
  const compliance = complianceResults.find(c => c.submissionId === decision.submissionId)
  const pilot = pilots.find(p => p.submissionId === decision.submissionId)
  const vendor = vendors.find(v => v.id === decision.vendorId)
  const tierConfig = vendor ? getVendorTierConfig(vendor.tier) : null

  return (
    <Card>
      <CardTitle subtitle="Evidence reviewed before decision">Decision Summary</CardTitle>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* AI Score */}
        <div className="rounded-xl bg-surface-container-low p-3">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-label-md font-semibold text-on-surface">AI Evaluation</p>
          </div>
          {sub?.aiScore ? (
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${getScoreBg(sub.aiScore.overall)}`}>
                <span className={`font-display text-title-lg font-bold ${getScoreColor(sub.aiScore.overall)}`}>
                  {sub.aiScore.overall}
                </span>
              </div>
              <div>
                <p className={`text-label-md font-semibold capitalize ${
                  sub.aiScore.recommendation === 'approve' ? 'text-secondary'
                    : sub.aiScore.recommendation === 'review' ? 'text-warning'
                      : 'text-error'
                }`}>
                  {sub.aiScore.recommendation === 'approve' ? 'Recommended' : sub.aiScore.recommendation}
                </p>
                <p className="text-label-sm text-on-surface-variant">
                  {Math.round(sub.aiScore.confidence * 100)}% confidence
                </p>
              </div>
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant">No AI score available</p>
          )}
        </div>

        {/* Compliance */}
        <div className="rounded-xl bg-surface-container-low p-3">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-label-md font-semibold text-on-surface">Compliance</p>
          </div>
          {compliance ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`badge capitalize ${
                  compliance.status === 'passed' ? 'bg-secondary-container text-secondary'
                    : compliance.status === 'conditional' ? 'bg-warning-container text-warning'
                      : 'bg-error-container text-error'
                }`}>
                  {compliance.status}
                </span>
                {compliance.descAligned && (
                  <span className="badge bg-primary/10 text-primary">DESC ✓</span>
                )}
              </div>
              <p className="text-label-sm text-on-surface-variant capitalize">
                Risk: <span className={`font-medium ${
                  compliance.overallRisk === 'low' ? 'text-secondary'
                    : compliance.overallRisk === 'medium' ? 'text-warning'
                      : 'text-error'
                }`}>{compliance.overallRisk}</span>
              </p>
              {compliance.conditions && compliance.conditions.length > 0 && (
                <p className="text-label-sm text-warning mt-1">
                  {compliance.conditions.length} condition(s) outstanding
                </p>
              )}
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant">No compliance review found</p>
          )}
        </div>

        {/* Pilot outcome */}
        <div className="rounded-xl bg-surface-container-low p-3">
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-label-md font-semibold text-on-surface">Pilot Outcome</p>
          </div>
          {pilot ? (
            <div className="flex items-center gap-3">
              {pilot.finalScore !== undefined ? (
                <>
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${getScoreBg(pilot.finalScore)}`}>
                    <span className={`font-display text-title-lg font-bold ${getScoreColor(pilot.finalScore)}`}>
                      {pilot.finalScore}
                    </span>
                  </div>
                  <div>
                    <p className={`text-label-md font-semibold ${
                      pilot.recommendation === 'proceed' ? 'text-secondary'
                        : pilot.recommendation === 'modify' ? 'text-warning'
                          : 'text-error'
                    }`}>
                      {pilot.recommendation === 'proceed' ? 'Proceed' : pilot.recommendation === 'modify' ? 'Modify' : 'Terminate'}
                    </p>
                    <p className="text-label-sm text-on-surface-variant capitalize">{pilot.status}</p>
                  </div>
                </>
              ) : (
                <p className="text-body-sm text-on-surface-variant capitalize">Pilot {pilot.status}</p>
              )}
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant">No pilot program found</p>
          )}
        </div>

        {/* Vendor readiness */}
        <div className="rounded-xl bg-surface-container-low p-3">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-label-md font-semibold text-on-surface">Vendor Readiness</p>
          </div>
          {vendor ? (
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {tierConfig && (
                  <span className={`badge ${tierConfig.bg} ${tierConfig.text}`}>{tierConfig.label}</span>
                )}
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-warning text-warning" />
                  <span className="text-label-sm font-medium text-on-surface">{vendor.averageScore}/100</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                {vendor.descCertified ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                    <span className="text-label-sm font-semibold text-secondary">DESC Certified</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-warning flex-shrink-0" />
                    <span className="text-label-sm text-warning">DESC Certification Pending</span>
                  </>
                )}
              </div>
              <p className="text-label-sm text-on-surface-variant">
                {vendor.activeContracts} active contract{vendor.activeContracts !== 1 ? 's' : ''} ·{' '}
                {vendor.completionRate}% completion rate
              </p>
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant">Vendor not found</p>
          )}
        </div>
      </div>
    </Card>
  )
}

// ─── Procurement action panel ─────────────────────────────────────────────────
type ActivePanel = null | 'return' | 'reject'

function ProcurementActions({ decision }: { decision: ProcurementDecision }) {
  const updateProcurementDecision = useAppStore(s => s.updateProcurementDecision)
  const updateSubmission = useAppStore(s => s.updateSubmission)
  const submissions = useAppStore(s => s.submissions)
  const { currentRole } = useRole()

  const [panel, setPanel] = useState<ActivePanel>(null)
  const [returnReason, setReturnReason] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  const relatedSub = submissions.find(s => s.id === decision.submissionId)
  const actorName = 'Ahmed Al-Maktoum'

  const addTimeline = (title: string, description: string) => {
    if (!relatedSub) return
    updateSubmission(relatedSub.id, {
      timeline: [
        ...relatedSub.timeline,
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title,
          description,
          actorName,
          actorRole: currentRole,
          type: 'decision' as const,
        },
      ],
    })
  }

  const handleApprove = () => {
    const now = new Date().toISOString()
    updateProcurementDecision(decision.id, {
      status: 'approved',
      approvedAt: now,
      approvedBy: actorName,
    })
    addTimeline(
      'Procurement Approved',
      `Contract approved by ${actorName}. Value: ${formatAED(decision.contractValue)} over ${decision.contractDuration} months.`
    )
  }

  const handleReturn = () => {
    if (!returnReason.trim()) return
    updateProcurementDecision(decision.id, {
      status: 'pending_approval',
      notes: `Returned for revision: ${returnReason.trim()}`,
    })
    if (relatedSub) {
      updateSubmission(relatedSub.id, {
        status: 'approved',
        timeline: [
          ...relatedSub.timeline,
          {
            id: `tl-${Date.now()}`,
            timestamp: new Date().toISOString(),
            title: 'Returned for Revision',
            description: `Procurement committee returned for revision. Reason: ${returnReason.trim()}`,
            actorName,
            actorRole: currentRole,
            type: 'decision' as const,
          },
        ],
      })
    }
    setPanel(null)
  }

  const handleReject = () => {
    if (rejectReason.trim().length < 20) return
    updateProcurementDecision(decision.id, {
      status: 'cancelled',
      notes: `Rejected: ${rejectReason.trim()}`,
    })
    if (relatedSub) {
      updateSubmission(relatedSub.id, {
        status: 'rejected',
        timeline: [
          ...relatedSub.timeline,
          {
            id: `tl-${Date.now()}`,
            timestamp: new Date().toISOString(),
            title: 'Rejected at Procurement Stage',
            description: `Final rejection by ${actorName}. Reason: ${rejectReason.trim()}`,
            actorName,
            actorRole: currentRole,
            type: 'decision' as const,
          },
        ],
      })
    }
    setPanel(null)
  }

  if (decision.status !== 'pending_approval') return null

  return (
    <Card className="border-2 border-warning/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-title-md font-semibold text-on-surface">Awaiting Decision</p>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Review the summary above before proceeding.
          </p>
        </div>
        {panel && (
          <button onClick={() => setPanel(null)} className="text-on-surface-variant hover:text-on-surface">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!panel && (
        <div className="space-y-2">
          <button
            onClick={handleApprove}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary-container/40 hover:bg-secondary-container transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-on-secondary" />
            </div>
            <div>
              <p className="text-label-md font-semibold text-secondary">Approve for Procurement</p>
              <p className="text-label-sm text-on-surface-variant">Authorise contract — {formatAED(decision.contractValue)}, {decision.contractDuration}m</p>
            </div>
          </button>

          <button
            onClick={() => setPanel('return')}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-warning-container/30 hover:bg-warning-container/60 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-label-md font-semibold text-warning">Return for Revision</p>
              <p className="text-label-sm text-on-surface-variant">Send back with comments before re-submitting</p>
            </div>
          </button>

          <button
            onClick={() => setPanel('reject')}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-error-container/20 hover:bg-error-container/40 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-4 h-4 text-error" />
            </div>
            <div>
              <p className="text-label-md font-semibold text-error">Reject</p>
              <p className="text-label-sm text-on-surface-variant">Final decision — submission will be rejected</p>
            </div>
          </button>
        </div>
      )}

      {panel === 'return' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 p-2.5 bg-warning-container/50 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
            <p className="text-label-sm text-on-surface">
              The submission will return to <strong>approved</strong> status for revision.
            </p>
          </div>
          <div>
            <label className="text-label-md font-semibold text-on-surface block mb-1.5">
              Reason for return <span className="text-error">*</span>
            </label>
            <textarea
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
              rows={3}
              placeholder="Describe what needs to be revised or clarified before re-submission to procurement..."
              className="input-field resize-none text-body-sm w-full"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleReturn}
              disabled={!returnReason.trim()}
              icon={<RotateCcw />}
              className="flex-1"
            >
              Return for Revision
            </Button>
            <Button variant="secondary" onClick={() => setPanel(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {panel === 'reject' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 p-2.5 bg-error-container/40 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-error flex-shrink-0" />
            <p className="text-label-sm text-on-surface">
              This is a <strong>final decision</strong>. The submission will be rejected permanently.
            </p>
          </div>
          <div>
            <label className="text-label-md font-semibold text-on-surface block mb-1.5">
              Rejection justification <span className="text-error">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Provide a clear justification for the rejection. This will be recorded in the audit log and visible to the evaluation team..."
              className="input-field resize-none text-body-sm w-full"
              autoFocus
            />
            <p className="text-label-sm text-on-surface-variant/60 mt-1">Required — minimum 20 characters</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={rejectReason.trim().length < 20}
              icon={<XCircle />}
              className="flex-1"
            >
              Confirm Rejection
            </Button>
            <Button variant="secondary" onClick={() => setPanel(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function ProcurementPage() {
  const submissions = useAppStore(s => s.submissions)
  const procurementDecisions = useAppStore(s => s.procurementDecisions)
  const { can } = useRole()

  const [selected, setSelected] = useState(procurementDecisions[0]?.id ?? '')
  const selectedDecision = procurementDecisions.find(d => d.id === selected) ?? procurementDecisions[0]
  const relatedSub = submissions.find(s => s.id === selectedDecision?.submissionId)
  const totalValue = procurementDecisions.reduce((sum, d) => sum + d.contractValue, 0)

  return (
    <AppShell>
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <p className="text-label-sm text-on-surface-variant">Total Decisions</p>
            <p className="mt-1 font-display text-display-sm font-bold text-on-surface">{procurementDecisions.length}</p>
          </Card>
          <Card className="border-l-4 border-l-warning">
            <p className="text-label-sm text-on-surface">Pending Approval</p>
            <p className="mt-1 font-display text-display-sm font-bold text-on-surface">
              {procurementDecisions.filter(d => d.status === 'pending_approval').length}
            </p>
          </Card>
          <Card className="border-l-4 border-l-secondary">
            <p className="text-label-sm text-secondary">Approved</p>
            <p className="mt-1 font-display text-display-sm font-bold text-secondary">
              {procurementDecisions.filter(d => d.status === 'approved').length}
            </p>
          </Card>
          <Card gradient>
            <p className="text-label-sm text-on-primary/70">Pipeline Value</p>
            <p className="mt-1 font-display text-display-sm font-bold text-on-primary">{formatAED(totalValue)}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="space-y-3">
            <h2 className="text-title-md font-semibold text-on-surface">Procurement Decisions</h2>
            {procurementDecisions.map(dec => {
              const statusConfig = PROC_STATUS_CONFIG[dec.status] ?? PROC_STATUS_CONFIG.pending_approval
              return (
                <button
                  key={dec.id}
                  onClick={() => setSelected(dec.id)}
                  className={`w-full rounded-lg p-3 text-left transition-all duration-150 ${
                    selected === dec.id
                      ? 'bg-primary/8 ring-1 ring-primary/20'
                      : 'bg-surface-container-lowest shadow-ambient hover:bg-surface-container'
                  }`}
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <StatusBadge status={statusConfig} />
                  </div>
                  <p className="text-title-sm text-on-surface">{dec.title}</p>
                  <p className="mt-0.5 text-label-sm text-on-surface-variant">{dec.vendorName}</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-label-md font-semibold text-on-surface">{formatAED(dec.contractValue)}</span>
                    <span className="text-label-sm text-on-surface-variant">{dec.contractDuration}m contract</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Detail */}
          <div className="space-y-4 lg:col-span-2">
            {selectedDecision && (
              <>
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-0.5 flex flex-wrap items-center gap-2">
                      <StatusBadge status={PROC_STATUS_CONFIG[selectedDecision.status] ?? PROC_STATUS_CONFIG.pending_approval} />
                      <span className="badge bg-surface-container text-on-surface-variant capitalize">
                        {selectedDecision.procurementType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h2 className="font-display text-headline-md text-on-surface">{selectedDecision.title}</h2>
                    <p className="text-body-md text-on-surface-variant">{selectedDecision.vendorName}</p>
                  </div>
                  {relatedSub && (
                    <Link href={`/submissions/${relatedSub.id}`} className="w-full sm:w-auto">
                      <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                        View Submission
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Contract value hero */}
                <Card gradient>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-label-sm uppercase tracking-wider text-on-primary/70">Contract Value</p>
                      <p className="mt-1 font-display text-display-md font-bold text-on-primary">
                        {formatAED(selectedDecision.contractValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-label-sm uppercase tracking-wider text-on-primary/70">Duration</p>
                      <p className="mt-1 font-display text-display-sm font-bold text-on-primary">
                        {selectedDecision.contractDuration}m
                      </p>
                    </div>
                    <div>
                      <p className="text-label-sm uppercase tracking-wider text-on-primary/70">Start Date</p>
                      <p className="mt-1 font-display text-headline-sm font-bold text-on-primary">
                        {formatDate(selectedDecision.startDate)}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Decision summary — always visible */}
                <DecisionSummary key={selectedDecision.id} decision={selectedDecision} />

                {/* Actions — only for admin, only when pending */}
                {can.manageProcurement && (
                  <ProcurementActions key={`${selectedDecision.id}-${selectedDecision.status}`} decision={selectedDecision} />
                )}

                {/* Post-decision banners */}
                {selectedDecision.status === 'approved' && (
                  <Card className="bg-secondary-container/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-8 w-8 flex-shrink-0 text-secondary" />
                      <div>
                        <p className="text-title-md font-semibold text-on-surface">Contract Approved</p>
                        <p className="text-body-sm text-on-surface-variant">
                          Approved by {selectedDecision.approvedBy}
                          {selectedDecision.approvedAt && ` on ${formatDate(selectedDecision.approvedAt)}`}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {selectedDecision.status === 'cancelled' && (
                  <Card className="bg-error-container/30 border-l-4 border-l-error">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-6 w-6 flex-shrink-0 text-error" />
                      <div>
                        <p className="text-title-md font-semibold text-error">Contract Rejected</p>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">{selectedDecision.notes}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Contract details */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <Card>
                    <CardTitle className="mb-3">Contract Details</CardTitle>
                    <div className="space-y-2">
                      {[
                        { label: 'Vendor', value: selectedDecision.vendorName, icon: Building2 },
                        { label: 'Type', value: selectedDecision.procurementType.replace(/_/g, ' '), icon: FileText },
                        { label: 'Start Date', value: formatDate(selectedDecision.startDate), icon: Calendar },
                        { label: 'End Date', value: formatDate(selectedDecision.endDate), icon: Calendar },
                        { label: 'Approved By', value: selectedDecision.approvedBy, icon: CheckCircle2 },
                        {
                          label: 'Approval Date',
                          value: selectedDecision.approvedAt ? formatDate(selectedDecision.approvedAt) : 'Pending',
                          icon: Clock,
                        },
                      ].map(({ label, value, icon: Icon }) => (
                        <div
                          key={label}
                          className="flex flex-col gap-1 border-b border-outline-variant/10 py-1 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className="h-3.5 w-3.5 flex-shrink-0 text-on-surface-variant" />
                            <span className="text-label-sm text-on-surface-variant">{label}</span>
                          </div>
                          <span className="text-label-md font-medium capitalize text-on-surface">{value}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <CardTitle className="mb-3">Notes</CardTitle>
                    <p className="text-body-sm leading-relaxed text-on-surface-variant">{selectedDecision.notes}</p>
                    {selectedDecision.pilotId && (
                      <div className="mt-3 rounded-lg bg-secondary-container/50 p-2.5">
                        <p className="text-label-sm font-medium text-secondary">Originated from Pilot Program</p>
                        <Link href="/pilots" className="text-label-sm text-primary hover:underline">
                          View Pilot Details →
                        </Link>
                      </div>
                    )}
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
