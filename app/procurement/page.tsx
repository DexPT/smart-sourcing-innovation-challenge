'use client'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/appStore'
import { procurementDecisions } from '@/data/procurement'
import { formatAED, formatDate } from '@/lib/utils'
import { CheckCircle2, Clock, FileText, Building2, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const PROC_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending_approval: { label: 'Pending Approval', bg: 'bg-warning-container', text: 'text-on-surface' },
  approved: { label: 'Approved', bg: 'bg-secondary-container', text: 'text-secondary' },
  contracted: { label: 'Contracted', bg: 'bg-primary/10', text: 'text-primary' },
  active: { label: 'Active', bg: 'bg-secondary-container', text: 'text-secondary' },
  completed: { label: 'Completed', bg: 'bg-surface-container', text: 'text-on-surface-variant' },
  cancelled: { label: 'Cancelled', bg: 'bg-error-container', text: 'text-error' },
}

export default function ProcurementPage() {
  const submissions = useAppStore(s => s.submissions)
  const updateSubmission = useAppStore(s => s.updateSubmission)
  const [decisions, setDecisions] = useState(procurementDecisions)
  const [selected, setSelected] = useState(decisions[0]?.id ?? '')

  const selectedDecision = decisions.find(d => d.id === selected) ?? decisions[0]
  const relatedSub = submissions.find(s => s.id === selectedDecision?.submissionId)
  const totalValue = decisions.reduce((sum, decision) => sum + decision.contractValue, 0)

  const handleApprove = (id: string) => {
    setDecisions(prev => prev.map(d => (d.id === id ? { ...d, status: 'approved' as const, approvedAt: new Date().toISOString() } : d)))
    const dec = decisions.find(d => d.id === id)
    if (dec) {
      const sub = submissions.find(s => s.id === dec.submissionId)
      if (sub) updateSubmission(sub.id, { status: 'procurement' })
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <p className="text-label-sm text-on-surface-variant">Total Decisions</p>
            <p className="mt-1 font-display text-display-sm font-bold text-on-surface">{decisions.length}</p>
          </Card>
          <Card className="border-l-4 border-l-warning">
            <p className="text-label-sm text-on-surface">Pending Approval</p>
            <p className="mt-1 font-display text-display-sm font-bold text-on-surface">{decisions.filter(d => d.status === 'pending_approval').length}</p>
          </Card>
          <Card className="border-l-4 border-l-secondary">
            <p className="text-label-sm text-secondary">Approved</p>
            <p className="mt-1 font-display text-display-sm font-bold text-secondary">{decisions.filter(d => d.status === 'approved').length}</p>
          </Card>
          <Card gradient>
            <p className="text-label-sm text-on-primary/70">Pipeline Value</p>
            <p className="mt-1 font-display text-display-sm font-bold text-on-primary">{formatAED(totalValue)}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h2 className="text-title-md font-semibold text-on-surface">Procurement Decisions</h2>
            {decisions.map(dec => {
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

          <div className="space-y-4 lg:col-span-2">
            {selectedDecision && (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-0.5 flex flex-wrap items-center gap-2">
                      <StatusBadge status={PROC_STATUS_CONFIG[selectedDecision.status] ?? PROC_STATUS_CONFIG.pending_approval} />
                      <span className="badge bg-surface-container text-on-surface-variant capitalize">
                        {selectedDecision.procurementType.replace('_', ' ')}
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

                <Card gradient>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-label-sm uppercase tracking-wider text-on-primary/70">Contract Value</p>
                      <p className="mt-1 font-display text-display-md font-bold text-on-primary">{formatAED(selectedDecision.contractValue)}</p>
                    </div>
                    <div>
                      <p className="text-label-sm uppercase tracking-wider text-on-primary/70">Duration</p>
                      <p className="mt-1 font-display text-display-sm font-bold text-on-primary">{selectedDecision.contractDuration}m</p>
                    </div>
                    <div>
                      <p className="text-label-sm uppercase tracking-wider text-on-primary/70">Start Date</p>
                      <p className="mt-1 font-display text-headline-sm font-bold text-on-primary">{formatDate(selectedDecision.startDate)}</p>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <Card>
                    <CardTitle className="mb-3">Contract Details</CardTitle>
                    <div className="space-y-2">
                      {[
                        { label: 'Vendor', value: selectedDecision.vendorName, icon: Building2 },
                        { label: 'Contract Type', value: selectedDecision.procurementType.replace('_', ' '), icon: FileText },
                        { label: 'Start Date', value: formatDate(selectedDecision.startDate), icon: Calendar },
                        { label: 'End Date', value: formatDate(selectedDecision.endDate), icon: Calendar },
                        { label: 'Approved By', value: selectedDecision.approvedBy, icon: CheckCircle2 },
                        { label: 'Approval Date', value: selectedDecision.approvedAt ? formatDate(selectedDecision.approvedAt) : 'Pending', icon: Clock },
                      ].map(({ label, value, icon: Icon }) => (
                        <div
                          key={label}
                          className="flex flex-col gap-1 border-b border-outline-variant/10 py-1 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
                        >
                          <div className="flex min-w-0 items-center gap-2">
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

                {selectedDecision.status === 'pending_approval' && (
                  <Card className="border-2 border-warning/30 bg-warning-container/20">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                      <div className="min-w-0">
                        <p className="text-title-md font-semibold text-on-surface">Awaiting Procurement Approval</p>
                        <p className="mt-1 text-body-sm text-on-surface-variant">
                          This contract requires decision maker approval before proceeding.
                        </p>
                      </div>
                      <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:flex-shrink-0">
                        <Button icon={<CheckCircle2 />} onClick={() => handleApprove(selectedDecision.id)} className="w-full sm:w-auto">
                          Approve Contract
                        </Button>
                        <Button variant="danger" className="w-full sm:w-auto">
                          Decline
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {selectedDecision.status === 'approved' && (
                  <Card className="bg-secondary-container">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <CheckCircle2 className="h-8 w-8 flex-shrink-0 text-secondary" />
                      <div className="min-w-0">
                        <p className="text-title-md font-semibold text-on-surface">Contract Approved</p>
                        <p className="text-body-sm text-on-surface-variant">
                          Approved by {selectedDecision.approvedBy} on {selectedDecision.approvedAt ? formatDate(selectedDecision.approvedAt) : 'N/A'}
                        </p>
                      </div>
                    </div>
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
