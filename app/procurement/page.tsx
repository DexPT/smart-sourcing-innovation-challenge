'use client'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/appStore'
import { procurementDecisions } from '@/data/procurement'
import { formatAED, formatDate, getSubmissionStatusConfig } from '@/lib/utils'
import { HandshakeIcon, CheckCircle2, Clock, FileText, Building2, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import type { ProcurementDecision } from '@/types'

const PROC_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending_approval: { label: 'Pending Approval', bg: 'bg-warning-container', text: 'text-warning' },
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

  const totalValue = decisions.reduce((s, d) => s + d.contractValue, 0)
  const approvedValue = decisions.filter(d => d.status === 'approved').reduce((s, d) => s + d.contractValue, 0)

  const handleApprove = (id: string) => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, status: 'approved' as const, approvedAt: new Date().toISOString() } : d))
    const dec = decisions.find(d => d.id === id)
    if (dec) {
      const sub = submissions.find(s => s.id === dec.submissionId)
      if (sub) updateSubmission(sub.id, { status: 'procurement' })
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-label-sm text-on-surface-variant">Total Decisions</p>
            <p className="font-display font-bold text-display-sm text-on-surface mt-1">{decisions.length}</p>
          </Card>
          <Card className="border-l-4 border-l-warning">
            <p className="text-label-sm text-warning">Pending Approval</p>
            <p className="font-display font-bold text-display-sm text-warning mt-1">{decisions.filter(d => d.status === 'pending_approval').length}</p>
          </Card>
          <Card className="border-l-4 border-l-secondary">
            <p className="text-label-sm text-secondary">Approved</p>
            <p className="font-display font-bold text-display-sm text-secondary mt-1">{decisions.filter(d => d.status === 'approved').length}</p>
          </Card>
          <Card gradient>
            <p className="text-label-sm text-on-primary/70">Pipeline Value</p>
            <p className="font-display font-bold text-display-sm text-on-primary mt-1">{formatAED(totalValue)}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Decision List */}
          <div className="space-y-3">
            <h2 className="text-title-md text-on-surface font-semibold">Procurement Decisions</h2>
            {decisions.map(dec => {
              const statusConfig = PROC_STATUS_CONFIG[dec.status] ?? PROC_STATUS_CONFIG.pending_approval
              return (
                <button
                  key={dec.id}
                  onClick={() => setSelected(dec.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-150 ${selected === dec.id ? 'bg-primary/8 ring-1 ring-primary/20' : 'bg-surface-container-lowest hover:bg-surface-container shadow-ambient'}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <StatusBadge status={statusConfig} />
                  </div>
                  <p className="text-title-sm text-on-surface">{dec.title}</p>
                  <p className="text-label-sm text-on-surface-variant mt-0.5">{dec.vendorName}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-label-md font-semibold text-on-surface">{formatAED(dec.contractValue)}</span>
                    <span className="text-label-sm text-on-surface-variant">{dec.contractDuration}m contract</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Decision Detail */}
          <div className="lg:col-span-2 space-y-4">
            {selectedDecision && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <StatusBadge status={PROC_STATUS_CONFIG[selectedDecision.status] ?? PROC_STATUS_CONFIG.pending_approval} />
                      <span className="badge bg-surface-container text-on-surface-variant capitalize">{selectedDecision.procurementType.replace('_', ' ')}</span>
                    </div>
                    <h2 className="font-display text-headline-md text-on-surface">{selectedDecision.title}</h2>
                    <p className="text-body-md text-on-surface-variant">{selectedDecision.vendorName}</p>
                  </div>
                  {relatedSub && (
                    <Link href={`/submissions/${relatedSub.id}`}>
                      <Button variant="secondary" size="sm">View Submission</Button>
                    </Link>
                  )}
                </div>

                {/* Contract Value Hero */}
                <Card gradient>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-label-sm text-on-primary/70 uppercase tracking-wider">Contract Value</p>
                      <p className="font-display font-bold text-display-md text-on-primary mt-1">{formatAED(selectedDecision.contractValue)}</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-primary/70 uppercase tracking-wider">Duration</p>
                      <p className="font-display font-bold text-display-sm text-on-primary mt-1">{selectedDecision.contractDuration}m</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-primary/70 uppercase tracking-wider">Start Date</p>
                      <p className="font-display font-bold text-headline-sm text-on-primary mt-1">{formatDate(selectedDecision.startDate)}</p>
                    </div>
                  </div>
                </Card>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div key={label} className="flex items-center gap-2 py-1 border-b border-outline-variant/10 last:border-0">
                          <Icon className="w-3.5 h-3.5 text-on-surface-variant flex-shrink-0" />
                          <span className="text-label-sm text-on-surface-variant flex-1">{label}</span>
                          <span className="text-label-md font-medium text-on-surface capitalize">{value}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <CardTitle className="mb-3">Notes</CardTitle>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed">{selectedDecision.notes}</p>
                    {selectedDecision.pilotId && (
                      <div className="mt-3 p-2 bg-secondary-container/50 rounded-lg">
                        <p className="text-label-sm text-secondary font-medium">Originated from Pilot Program</p>
                        <Link href="/pilots" className="text-label-sm text-primary hover:underline">View Pilot Details →</Link>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Actions */}
                {selectedDecision.status === 'pending_approval' && (
                  <Card className="border-2 border-warning/30 bg-warning-container/20">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-title-md text-on-surface font-semibold">Awaiting Procurement Approval</p>
                        <p className="text-body-sm text-on-surface-variant mt-1">This contract requires decision maker approval before proceeding.</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          icon={<CheckCircle2 />}
                          onClick={() => handleApprove(selectedDecision.id)}
                        >
                          Approve Contract
                        </Button>
                        <Button variant="danger">Decline</Button>
                      </div>
                    </div>
                  </Card>
                )}

                {selectedDecision.status === 'approved' && (
                  <Card className="bg-secondary-container">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-8 h-8 text-secondary" />
                      <div>
                        <p className="text-title-md text-on-surface font-semibold">Contract Approved</p>
                        <p className="text-body-sm text-on-surface-variant">Approved by {selectedDecision.approvedBy} on {selectedDecision.approvedAt ? formatDate(selectedDecision.approvedAt) : 'N/A'}</p>
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
