'use client'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { pilots } from '@/data/pilots'
import { vendors } from '@/data/vendors'
import { useAppStore } from '@/store/appStore'
import { getPilotStatusConfig, formatAED, formatDate } from '@/lib/utils'
import { CheckCircle2, Clock, AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function PilotsPage() {
  const submissions = useAppStore(s => s.submissions)
  const [selected, setSelected] = useState(pilots[0].id)
  const selectedPilot = pilots.find(p => p.id === selected) ?? pilots[0]
  const relatedSub = submissions.find(s => s.id === selectedPilot?.submissionId)
  const relatedVendor = vendors.find(v => v.id === selectedPilot?.vendorId)

  const stats = {
    total: pilots.length,
    active: pilots.filter(p => p.status === 'active').length,
    completed: pilots.filter(p => p.status === 'completed').length,
    totalBudget: pilots.reduce((s, p) => s + p.budget, 0),
  }

  const milestoneStatusColors: Record<string, string> = {
    completed: 'text-secondary', in_progress: 'text-warning', upcoming: 'text-on-surface-variant', overdue: 'text-error'
  }
  const milestoneStatusIcons: Record<string, React.ElementType> = {
    completed: CheckCircle2, in_progress: Clock, upcoming: Clock, overdue: AlertTriangle
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><p className="text-label-sm text-on-surface-variant">Total Pilots</p><p className="font-display font-bold text-display-sm text-on-surface mt-1">{stats.total}</p></Card>
          <Card className="border-l-4 border-l-secondary"><p className="text-label-sm text-secondary">Active</p><p className="font-display font-bold text-display-sm text-secondary mt-1">{stats.active}</p></Card>
          <Card><p className="text-label-sm text-on-surface-variant">Completed</p><p className="font-display font-bold text-display-sm text-on-surface mt-1">{stats.completed}</p></Card>
          <Card gradient><p className="text-label-sm text-on-primary/70">Total Budget</p><p className="font-display font-bold text-display-sm text-on-primary mt-1">{formatAED(stats.totalBudget)}</p></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h2 className="text-title-md text-on-surface font-semibold">Pilot Programs</h2>
            {pilots.map(pilot => {
              const statusConfig = getPilotStatusConfig(pilot.status)
              const sub = submissions.find(s => s.id === pilot.submissionId)
              return (
                <button
                  key={pilot.id}
                  onClick={() => setSelected(pilot.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-150 ${selected === pilot.id ? 'bg-primary/8 ring-1 ring-primary/20' : 'bg-surface-container-lowest hover:bg-surface-container shadow-ambient'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={statusConfig} />
                    <span className="text-label-sm text-on-surface-variant ml-auto">{pilot.progress}%</span>
                  </div>
                  <p className="text-title-sm text-on-surface">{pilot.title}</p>
                  <p className="text-label-sm text-on-surface-variant mt-0.5">{sub?.company}</p>
                  <Progress value={pilot.progress} size="sm" className="mt-2" barClassName={pilot.status === 'completed' ? 'bg-secondary' : 'bg-primary'} />
                  <div className="flex justify-between mt-1.5">
                    <span className="text-label-sm text-on-surface-variant">{formatAED(pilot.budget)} budget</span>
                    <span className="text-label-sm text-on-surface-variant">{formatDate(pilot.endDate)}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selectedPilot && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <StatusBadge status={getPilotStatusConfig(selectedPilot.status)} />
                      <span className="badge bg-surface-container text-on-surface-variant capitalize">{selectedPilot.phase}</span>
                    </div>
                    <h2 className="font-display text-headline-md text-on-surface">{selectedPilot.title}</h2>
                    <p className="text-body-md text-on-surface-variant">{relatedSub?.company} · Lead: {selectedPilot.leadEvaluatorName}</p>
                  </div>
                  {relatedSub && (
                    <Link href={`/submissions/${relatedSub.id}`}>
                      <Button variant="secondary" size="sm" icon={<ChevronRight />} iconPosition="right">View Submission</Button>
                    </Link>
                  )}
                </div>

                <Card gradient>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-label-sm text-on-primary/70">Overall Progress</p>
                      <p className="font-display font-bold text-display-sm text-on-primary">{selectedPilot.progress}%</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-primary/70">Budget Used</p>
                      <p className="font-display font-bold text-display-sm text-on-primary">{formatAED(selectedPilot.spentBudget)}</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-primary/70">End Date</p>
                      <p className="font-display font-bold text-headline-sm text-on-primary">{formatDate(selectedPilot.endDate)}</p>
                    </div>
                  </div>
                  <Progress value={selectedPilot.spentBudget} max={selectedPilot.budget} label="Budget Utilization" showLabel barClassName="bg-on-primary/80" />
                </Card>

                <Card>
                  <CardTitle subtitle="Key performance indicators" className="mb-3">KPI Tracker</CardTitle>
                  <div className="space-y-3">
                    {selectedPilot.kpis.map(kpi => (
                      <div key={kpi.id}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${kpi.achieved ? 'bg-secondary' : 'bg-warning'}`} />
                            <span className="text-label-md text-on-surface">{kpi.metric}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-label-sm text-on-surface-variant">Target: {kpi.target}{kpi.unit}</span>
                            <span className={`text-label-md font-bold ${kpi.achieved ? 'text-secondary' : kpi.current >= kpi.target * 0.7 ? 'text-warning' : 'text-error'}`}>
                              {kpi.current}{kpi.unit}
                            </span>
                          </div>
                        </div>
                        <Progress value={Math.min(kpi.current, kpi.target)} max={kpi.target} size="sm" barClassName={kpi.achieved ? 'bg-secondary' : 'bg-warning'} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                      <span className="text-label-sm text-on-surface-variant">{selectedPilot.kpis.filter(k => k.achieved).length} KPIs achieved</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-warning" />
                      <span className="text-label-sm text-on-surface-variant">{selectedPilot.kpis.filter(k => !k.achieved).length} in progress</span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <CardTitle subtitle="Delivery timeline" className="mb-3">Milestones</CardTitle>
                  <div className="space-y-0">
                    {selectedPilot.milestones.map((ms, idx) => {
                      const StatusIcon = milestoneStatusIcons[ms.status] ?? Clock
                      const statusColor = milestoneStatusColors[ms.status]
                      const isLast = idx === selectedPilot.milestones.length - 1
                      return (
                        <div key={ms.id} className="flex gap-3">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${ms.status === 'completed' ? 'bg-secondary-container' : ms.status === 'in_progress' ? 'bg-primary/10' : 'bg-surface-container'}`}>
                              <StatusIcon className={`w-3.5 h-3.5 ${statusColor}`} />
                            </div>
                            {!isLast && <div className="w-px flex-1 bg-outline-variant/20 my-1" />}
                          </div>
                          <div className={`flex-1 ${!isLast ? 'pb-4' : 'pb-0'}`}>
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-title-sm text-on-surface">{ms.title}</p>
                              <span className="text-label-sm text-on-surface-variant flex-shrink-0">{formatDate(ms.dueDate)}</span>
                            </div>
                            <p className="text-body-sm text-on-surface-variant mt-0.5">{ms.description}</p>
                            {ms.completedAt && (
                              <p className="text-label-sm text-secondary mt-0.5">Completed {formatDate(ms.completedAt)}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>

                {selectedPilot.finalScore && (
                  <Card className="bg-secondary-container">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <span className="font-display font-bold text-headline-md text-on-secondary">{selectedPilot.finalScore}</span>
                      </div>
                      <div>
                        <p className="text-title-md text-on-surface font-semibold">Pilot Final Score</p>
                        <p className={`text-body-md font-medium mt-0.5 ${selectedPilot.recommendation === 'proceed' ? 'text-secondary' : selectedPilot.recommendation === 'modify' ? 'text-warning' : 'text-error'}`}>
                          Recommendation: {selectedPilot.recommendation === 'proceed' ? 'Proceed to Procurement' : selectedPilot.recommendation === 'modify' ? 'Modify & Extend' : 'Terminate Pilot'}
                        </p>
                      </div>
                    </div>
                    {selectedPilot.notes && <p className="text-body-sm text-on-surface-variant mt-3">{selectedPilot.notes}</p>}
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
