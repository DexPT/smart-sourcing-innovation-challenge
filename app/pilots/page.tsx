'use client'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { useAppStore } from '@/store/appStore'
import { useRole } from '@/hooks/useRole'
import { getPilotStatusConfig, formatAED, formatDate } from '@/lib/utils'
import {
  CheckCircle2, Clock, AlertTriangle, ChevronRight,
  Play, Pause, RotateCcw, XCircle, Trophy, ArrowRight, X,
} from 'lucide-react'
import Link from 'next/link'
import { vendors } from '@/data/vendors'
import type { Pilot } from '@/types'

// ─── Pilot action panel ───────────────────────────────────────────────────────
type ActivePanel = null | 'complete'

function PilotActions({ pilot }: { pilot: Pilot }) {
  const updatePilot = useAppStore(s => s.updatePilot)
  const updateSubmission = useAppStore(s => s.updateSubmission)
  const submissions = useAppStore(s => s.submissions)
  const { currentRole, can } = useRole()

  const [panel, setPanel] = useState<ActivePanel>(null)
  const [finalScore, setFinalScore] = useState(75)
  const [recommendation, setRecommendation] = useState<Pilot['recommendation']>('proceed')
  const [notes, setNotes] = useState('')

  if (!can.managePilots) return null

  const actorName = currentRole === 'admin' ? 'Ahmed Al-Maktoum' : 'Omar Khalid'
  const relatedSub = submissions.find(s => s.id === pilot.submissionId)

  const addSubmissionEvent = (title: string, description: string) => {
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
          type: 'status_change' as const,
        },
      ],
    })
  }

  const handleLaunch = () => {
    updatePilot(pilot.id, { status: 'active', phase: 'execution' })
    addSubmissionEvent('Pilot Launched', 'Pilot program moved to active status. Execution phase commenced.')
  }

  const handlePause = () => {
    updatePilot(pilot.id, { status: 'paused' })
    addSubmissionEvent('Pilot Paused', 'Pilot program temporarily paused pending review.')
  }

  const handleResume = () => {
    updatePilot(pilot.id, { status: 'active' })
    addSubmissionEvent('Pilot Resumed', 'Pilot program resumed from paused state.')
  }

  const handleCancel = () => {
    updatePilot(pilot.id, { status: 'cancelled', recommendation: 'terminate' })
    addSubmissionEvent('Pilot Cancelled', 'Pilot program cancelled. Submission returned for review.')
  }

  const handleComplete = () => {
    updatePilot(pilot.id, {
      status: 'completed',
      phase: 'reporting',
      progress: 100,
      finalScore,
      recommendation,
      notes: notes.trim() || pilot.notes,
    })
    if (recommendation === 'proceed' && relatedSub) {
      // Don't move to procurement yet — just log the recommendation
      addSubmissionEvent(
        'Pilot Completed — Recommended for Procurement',
        `Pilot scored ${finalScore}/100. Recommendation: proceed to procurement. ${notes.trim()}`
      )
    } else {
      addSubmissionEvent(
        `Pilot Completed — ${recommendation === 'modify' ? 'Modify & Extend' : 'Terminate'}`,
        `Pilot scored ${finalScore}/100. Recommendation: ${recommendation}. ${notes.trim()}`
      )
    }
    setPanel(null)
  }

  const handleSendToProcurement = () => {
    if (!relatedSub) return
    updateSubmission(relatedSub.id, {
      status: 'procurement',
      timeline: [
        ...relatedSub.timeline,
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Sent to Procurement',
          description: `Successful pilot (score ${pilot.finalScore}/100) — submission advanced to procurement committee.`,
          actorName,
          actorRole: currentRole,
          type: 'decision' as const,
        },
      ],
    })
  }

  const recOptions: { value: Pilot['recommendation']; label: string; sub: string; color: string; border: string }[] = [
    { value: 'proceed', label: 'Proceed to Procurement', sub: 'Pilot successful — advance', color: 'text-secondary', border: 'border-secondary' },
    { value: 'modify', label: 'Modify & Extend', sub: 'Needs adjustment before proceeding', color: 'text-warning', border: 'border-warning' },
    { value: 'terminate', label: 'Terminate', sub: 'Pilot did not meet objectives', color: 'text-error', border: 'border-error' },
  ]

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <CardTitle subtitle="Manage this pilot program">Pilot Actions</CardTitle>
        {panel && (
          <button onClick={() => setPanel(null)} className="text-on-surface-variant hover:text-on-surface">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status transition buttons */}
      {!panel && (
        <div className="space-y-2">
          {pilot.status === 'planned' && (
            <button
              onClick={handleLaunch}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary-container/40 hover:bg-secondary-container transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 text-on-secondary" />
              </div>
              <div>
                <p className="text-label-md font-semibold text-secondary">Launch Pilot</p>
                <p className="text-label-sm text-on-surface-variant">Move to active execution</p>
              </div>
            </button>
          )}

          {pilot.status === 'active' && (
            <>
              <button
                onClick={() => setPanel('complete')}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/8 hover:bg-primary/15 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-on-primary" />
                </div>
                <div>
                  <p className="text-label-md font-semibold text-primary">Mark as Completed</p>
                  <p className="text-label-sm text-on-surface-variant">Record final score and recommendation</p>
                </div>
              </button>

              <button
                onClick={handlePause}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-warning-container/30 hover:bg-warning-container/60 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                  <Pause className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-label-md font-semibold text-warning">Pause Pilot</p>
                  <p className="text-label-sm text-on-surface-variant">Temporarily halt execution</p>
                </div>
              </button>
            </>
          )}

          {pilot.status === 'paused' && (
            <>
              <button
                onClick={handleResume}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary-container/40 hover:bg-secondary-container transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-4 h-4 text-on-secondary" />
                </div>
                <div>
                  <p className="text-label-md font-semibold text-secondary">Resume Pilot</p>
                  <p className="text-label-sm text-on-surface-variant">Return to active execution</p>
                </div>
              </button>

              <button
                onClick={() => setPanel('complete')}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/8 hover:bg-primary/15 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-on-primary" />
                </div>
                <div>
                  <p className="text-label-md font-semibold text-primary">Mark as Completed</p>
                  <p className="text-label-sm text-on-surface-variant">Record final score and recommendation</p>
                </div>
              </button>
            </>
          )}

          {pilot.status === 'completed' && pilot.recommendation === 'proceed' && relatedSub?.status !== 'procurement' && (
            <button
              onClick={handleSendToProcurement}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-power-gradient text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-on-primary/20 flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-4 h-4 text-on-primary" />
              </div>
              <div>
                <p className="text-label-md font-semibold text-on-primary">Send to Procurement</p>
                <p className="text-label-sm text-on-primary/70">Advance to procurement committee</p>
              </div>
            </button>
          )}

          {pilot.status === 'completed' && relatedSub?.status === 'procurement' && (
            <div className="flex items-center gap-2 p-3 bg-secondary-container/40 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
              <p className="text-label-sm text-secondary font-medium">Submitted to procurement committee</p>
            </div>
          )}

          {['active', 'paused'].includes(pilot.status) && (
            <button
              onClick={handleCancel}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-error-container/20 hover:bg-error-container/40 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-4 h-4 text-error" />
              </div>
              <div>
                <p className="text-label-md font-semibold text-error">Cancel Pilot</p>
                <p className="text-label-sm text-on-surface-variant">Terminate this pilot program</p>
              </div>
            </button>
          )}

          {['cancelled', 'completed'].includes(pilot.status) && pilot.recommendation !== 'proceed' && (
            <div className="flex items-center gap-2 p-3 bg-surface-container rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
              <p className="text-label-sm text-on-surface-variant">This pilot has been closed.</p>
            </div>
          )}
        </div>
      )}

      {/* Complete panel */}
      {panel === 'complete' && (
        <div className="space-y-4 animate-fade-in">
          {/* Final score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-label-md font-semibold text-on-surface">Final Score</label>
              <span className={`font-display text-headline-sm font-bold ${finalScore >= 80 ? 'text-secondary' : finalScore >= 60 ? 'text-warning' : 'text-error'}`}>
                {finalScore}/100
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={finalScore}
              onChange={e => setFinalScore(+e.target.value)}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-label-sm text-on-surface-variant/60 mt-0.5">
              <span>0</span><span>50</span><span>100</span>
            </div>
          </div>

          {/* Recommendation */}
          <div>
            <p className="text-label-md font-semibold text-on-surface mb-2">Recommendation</p>
            <div className="space-y-2">
              {recOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setRecommendation(opt.value)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    recommendation === opt.value
                      ? `${opt.border} bg-surface-container`
                      : 'border-outline-variant/20 hover:border-outline-variant/50'
                  }`}
                >
                  <p className={`text-label-md font-semibold ${recommendation === opt.value ? opt.color : 'text-on-surface'}`}>
                    {opt.label}
                  </p>
                  <p className="text-label-sm text-on-surface-variant">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-label-md font-semibold text-on-surface block mb-1.5">Outcome Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Summarise the pilot outcome, key learnings, and rationale for the recommendation..."
              className="input-field resize-none text-body-sm w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleComplete} icon={<Trophy />} className="flex-1">
              Confirm Completion
            </Button>
            <Button variant="secondary" onClick={() => setPanel(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
const MILESTONE_ICONS: Record<string, React.ElementType> = {
  completed: CheckCircle2, in_progress: Clock, upcoming: Clock, overdue: AlertTriangle,
}
const MILESTONE_COLORS: Record<string, string> = {
  completed: 'text-secondary', in_progress: 'text-warning', upcoming: 'text-on-surface-variant', overdue: 'text-error',
}

export default function PilotsPage() {
  const submissions = useAppStore(s => s.submissions)
  const pilots = useAppStore(s => s.pilots)
  const { can } = useRole()

  const [selected, setSelected] = useState(pilots[0]?.id ?? '')
  const selectedPilot = pilots.find(p => p.id === selected) ?? pilots[0]
  const relatedSub = submissions.find(s => s.id === selectedPilot?.submissionId)
  const relatedVendor = vendors.find(v => v.id === selectedPilot?.vendorId)

  const stats = {
    total: pilots.length,
    active: pilots.filter(p => p.status === 'active').length,
    completed: pilots.filter(p => p.status === 'completed').length,
    totalBudget: pilots.reduce((sum, p) => sum + p.budget, 0),
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* KPIs */}
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
          {/* Pilot list */}
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
                  <Progress
                    value={pilot.progress}
                    size="sm"
                    className="mt-2"
                    barClassName={pilot.status === 'completed' ? 'bg-secondary' : pilot.status === 'paused' ? 'bg-warning' : 'bg-primary'}
                  />
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="text-label-sm text-on-surface-variant">{formatAED(pilot.budget)} budget</span>
                    <span className="text-label-sm text-on-surface-variant">{formatDate(pilot.endDate)}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Detail panel */}
          <div className="space-y-4 lg:col-span-2">
            {selectedPilot && (
              <>
                {/* Header */}
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
                    {relatedVendor && (
                      <p className="mt-1 text-label-sm text-on-surface-variant">Vendor: {relatedVendor.name}</p>
                    )}
                  </div>
                  {relatedSub && (
                    <Link href={`/submissions/${relatedSub.id}`} className="w-full sm:w-auto">
                      <Button variant="secondary" size="sm" icon={<ChevronRight />} iconPosition="right" className="w-full sm:w-auto">
                        View Submission
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Budget + progress */}
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
                  <Progress
                    value={selectedPilot.spentBudget}
                    max={selectedPilot.budget}
                    label="Budget Utilization"
                    showLabel
                    barClassName="bg-on-primary/80"
                  />
                </Card>

                {/* Actions */}
                {can.managePilots && (
                  <PilotActions key={`${selectedPilot.id}-${selectedPilot.status}`} pilot={selectedPilot} />
                )}

                {/* Final score banner */}
                {selectedPilot.finalScore !== undefined && (
                  <Card className="bg-secondary-container/60">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                        <span className="font-display text-headline-md font-bold text-on-secondary">
                          {selectedPilot.finalScore}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-title-md font-semibold text-on-surface">Pilot Final Score</p>
                        <p className={`mt-0.5 text-body-md font-medium ${
                          selectedPilot.recommendation === 'proceed' ? 'text-secondary'
                            : selectedPilot.recommendation === 'modify' ? 'text-warning'
                              : 'text-error'
                        }`}>
                          Recommendation:{' '}
                          {selectedPilot.recommendation === 'proceed' ? 'Proceed to Procurement'
                            : selectedPilot.recommendation === 'modify' ? 'Modify & Extend'
                              : 'Terminate Pilot'}
                        </p>
                      </div>
                    </div>
                    {selectedPilot.notes && (
                      <p className="mt-3 text-body-sm text-on-surface-variant">{selectedPilot.notes}</p>
                    )}
                  </Card>
                )}

                {/* KPIs */}
                <Card>
                  <CardTitle subtitle="Key performance indicators" className="mb-3">KPI Tracker</CardTitle>
                  <div className="space-y-3">
                    {selectedPilot.kpis.map(kpi => (
                      <div key={kpi.id}>
                        <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 flex-shrink-0 rounded-full ${kpi.achieved ? 'bg-secondary' : 'bg-warning'}`} />
                            <span className="text-label-md text-on-surface">{kpi.metric}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                            <span className="text-label-sm text-on-surface-variant">
                              Target: {kpi.target}{kpi.unit}
                            </span>
                            <span className={`text-label-md font-bold ${
                              kpi.achieved ? 'text-secondary'
                                : kpi.current >= kpi.target * 0.7 ? 'text-warning'
                                  : 'text-error'
                            }`}>
                              {kpi.current}{kpi.unit}
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={Math.min(kpi.current, kpi.target)}
                          max={kpi.target}
                          size="sm"
                          barClassName={kpi.achieved ? 'bg-secondary' : 'bg-warning'}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-secondary" />
                      <span className="text-label-sm text-on-surface-variant">
                        {selectedPilot.kpis.filter(k => k.achieved).length} KPIs achieved
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-warning" />
                      <span className="text-label-sm text-on-surface-variant">
                        {selectedPilot.kpis.filter(k => !k.achieved).length} in progress
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Milestones */}
                <Card>
                  <CardTitle subtitle="Delivery timeline" className="mb-3">Milestones</CardTitle>
                  <div className="space-y-0">
                    {selectedPilot.milestones.map((ms, idx) => {
                      const StatusIcon = MILESTONE_ICONS[ms.status] ?? Clock
                      const statusColor = MILESTONE_COLORS[ms.status]
                      const isLast = idx === selectedPilot.milestones.length - 1
                      return (
                        <div key={ms.id} className="flex gap-3">
                          <div className="flex flex-shrink-0 flex-col items-center">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full ${
                              ms.status === 'completed' ? 'bg-secondary-container'
                                : ms.status === 'in_progress' ? 'bg-primary/10'
                                  : 'bg-surface-container'
                            }`}>
                              <StatusIcon className={`h-3.5 w-3.5 ${statusColor}`} />
                            </div>
                            {!isLast && <div className="my-1 w-px flex-1 bg-outline-variant/20" />}
                          </div>
                          <div className={`flex-1 ${!isLast ? 'pb-4' : 'pb-0'}`}>
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                              <p className="text-title-sm text-on-surface">{ms.title}</p>
                              <span className="flex-shrink-0 text-label-sm text-on-surface-variant">
                                {formatDate(ms.dueDate)}
                              </span>
                            </div>
                            <p className="mt-0.5 text-body-sm text-on-surface-variant">{ms.description}</p>
                            {ms.completedAt && (
                              <p className="mt-0.5 text-label-sm text-secondary">
                                Completed {formatDate(ms.completedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
