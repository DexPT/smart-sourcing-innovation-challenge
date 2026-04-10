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
    totalBudget: pilots.reduce((sum, pilot) => sum + pilot.budget, 0),
  }

  const milestoneStatusColors: Record<string, string> = {
    completed: 'text-secondary',
    in_progress: 'text-warning',
    upcoming: 'text-on-surface-variant',
    overdue: 'text-error',
  }

  const milestoneStatusIcons: Record<string, React.ElementType> = {
    completed: CheckCircle2,
    in_progress: Clock,
    upcoming: Clock,
    overdue: AlertTriangle,
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <p className="text-label-sm text-on-surface-variant">Total Pilots</p>
            <p className="mt-1 font-display text-display-sm font-bold text-on-surface">{stats.total}</p>
          </Card>
          <Card className="border-l-4 border-l-secondary">
            <p className="text-label-sm text-secondary">Active</p>
            <p className="mt-1 font-display text-display-sm font-bold text-secondary">{stats.active}</p>
          </Card>
          <Card>
            <p className="text-label-sm text-on-surface-variant">Completed</p>
            <p className="mt-1 font-display text-display-sm font-bold text-on-surface">{stats.completed}</p>
          </Card>
          <Card gradient>
            <p className="text-label-sm text-on-primary/70">Total Budget</p>
            <p className="mt-1 font-display text-display-sm font-bold text-on-primary">{formatAED(stats.totalBudget)}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h2 className="text-title-md font-semibold text-on-surface">Pilot Programs</h2>

            {pilots.map(pilot => {
              const statusConfig = getPilotStatusConfig(pilot.status)
              const sub = submissions.find(s => s.id === pilot.submissionId)

              return (
                <button
                  key={pilot.id}
                  onClick={() => setSelected(pilot.id)}
                  className={`w-full rounded-lg p-3 text-left transition-all duration-150 ${
                    selected === pilot.id
                      ? 'bg-primary/8 ring-1 ring-primary/20'
                      : 'bg-surface-container-lowest shadow-ambient hover:bg-surface-container'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <StatusBadge status={statusConfig} />
                    <span className="ml-auto text-label-sm text-on-surface-variant">{pilot.progress}%</span>
                  </div>
                  <p className="text-title-sm text-on-surface">{pilot.title}</p>
                  <p className="mt-0.5 text-label-sm text-on-surface-variant">{sub?.company}</p>
                  <Progress value={pilot.progress} size="sm" className="mt-2" barClassName={pilot.status === 'completed' ? 'bg-secondary' : 'bg-primary'} />
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="text-label-sm text-on-surface-variant">{formatAED(pilot.budget)} budget</span>
                    <span className="text-label-sm text-on-surface-variant">{formatDate(pilot.endDate)}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="space-y-4 lg:col-span-2">
            {selectedPilot && (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-0.5 flex flex-wrap items-center gap-2">
                      <StatusBadge status={getPilotStatusConfig(selectedPilot.status)} />
                      <span className="badge bg-surface-container text-on-surface-variant capitalize">{selectedPilot.phase}</span>
                    </div>
                    <h2 className="font-display text-headline-md text-on-surface">{selectedPilot.title}</h2>
                    <p className="text-body-md text-on-surface-variant">
                      {relatedSub?.company} · Lead: {selectedPilot.leadEvaluatorName}
                    </p>
                    {relatedVendor && <p className="mt-1 text-label-sm text-on-surface-variant">Vendor: {relatedVendor.name}</p>}
                  </div>

                  {relatedSub && (
                    <Link href={`/submissions/${relatedSub.id}`} className="w-full sm:w-auto">
                      <Button variant="secondary" size="sm" icon={<ChevronRight />} iconPosition="right" className="w-full sm:w-auto">
                        View Submission
                      </Button>
                    </Link>
                  )}
                </div>

                <Card gradient>
                  <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-label-sm text-on-primary/70">Overall Progress</p>
                      <p className="font-display text-display-sm font-bold text-on-primary">{selectedPilot.progress}%</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-primary/70">Budget Used</p>
                      <p className="font-display text-display-sm font-bold text-on-primary">{formatAED(selectedPilot.spentBudget)}</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-primary/70">End Date</p>
                      <p className="font-display text-headline-sm font-bold text-on-primary">{formatDate(selectedPilot.endDate)}</p>
                    </div>
                  </div>
                  <Progress value={selectedPilot.spentBudget} max={selectedPilot.budget} label="Budget Utilization" showLabel barClassName="bg-on-primary/80" />
                </Card>

                <Card>
                  <CardTitle subtitle="Key performance indicators" className="mb-3">
                    KPI Tracker
                  </CardTitle>
                  <div className="space-y-3">
                    {selectedPilot.kpis.map(kpi => (
                      <div key={kpi.id}>
                        <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 flex-shrink-0 rounded-full ${kpi.achieved ? 'bg-secondary' : 'bg-warning'}`} />
                            <span className="text-label-md text-on-surface">{kpi.metric}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
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
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-secondary" />
                      <span className="text-label-sm text-on-surface-variant">{selectedPilot.kpis.filter(k => k.achieved).length} KPIs achieved</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-warning" />
                      <span className="text-label-sm text-on-surface-variant">{selectedPilot.kpis.filter(k => !k.achieved).length} in progress</span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <CardTitle subtitle="Delivery timeline" className="mb-3">
                    Milestones
                  </CardTitle>
                  <div className="space-y-0">
                    {selectedPilot.milestones.map((ms, idx) => {
                      const StatusIcon = milestoneStatusIcons[ms.status] ?? Clock
                      const statusColor = milestoneStatusColors[ms.status]
                      const isLast = idx === selectedPilot.milestones.length - 1

                      return (
                        <div key={ms.id} className="flex gap-3">
                          <div className="flex flex-shrink-0 flex-col items-center">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full ${ms.status === 'completed' ? 'bg-secondary-container' : ms.status === 'in_progress' ? 'bg-primary/10' : 'bg-surface-container'}`}>
                              <StatusIcon className={`h-3.5 w-3.5 ${statusColor}`} />
                            </div>
                            {!isLast && <div className="my-1 w-px flex-1 bg-outline-variant/20" />}
                          </div>
                          <div className={`flex-1 ${!isLast ? 'pb-4' : 'pb-0'}`}>
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                              <p className="text-title-sm text-on-surface">{ms.title}</p>
                              <span className="flex-shrink-0 text-label-sm text-on-surface-variant">{formatDate(ms.dueDate)}</span>
                            </div>
                            <p className="mt-0.5 text-body-sm text-on-surface-variant">{ms.description}</p>
                            {ms.completedAt && <p className="mt-0.5 text-label-sm text-secondary">Completed {formatDate(ms.completedAt)}</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>

                {selectedPilot.finalScore && (
                  <Card className="bg-secondary-container">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                        <span className="font-display text-headline-md font-bold text-on-secondary">{selectedPilot.finalScore}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-title-md font-semibold text-on-surface">Pilot Final Score</p>
                        <p className={`mt-0.5 text-body-md font-medium ${selectedPilot.recommendation === 'proceed' ? 'text-secondary' : selectedPilot.recommendation === 'modify' ? 'text-warning' : 'text-error'}`}>
                          Recommendation: {selectedPilot.recommendation === 'proceed' ? 'Proceed to Procurement' : selectedPilot.recommendation === 'modify' ? 'Modify & Extend' : 'Terminate Pilot'}
                        </p>
                      </div>
                    </div>
                    {selectedPilot.notes && <p className="mt-3 text-body-sm text-on-surface-variant">{selectedPilot.notes}</p>}
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
