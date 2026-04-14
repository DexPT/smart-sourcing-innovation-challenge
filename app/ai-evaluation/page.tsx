'use client'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AIScorePanel, AIThinkingState } from '@/components/ui/AIScorePanel'
import { useAppStore } from '@/store/appStore'
import { useRole } from '@/hooks/useRole'
import { getSubmissionStatusConfig, getCategoryLabel, getScoreColor } from '@/lib/utils'
import {
  Brain, Bot, Play, ChevronRight, Sparkles, SortDesc,
  CheckCircle2, XCircle, MessageSquare, AlertTriangle, RotateCcw, X,
  ShieldCheck, ShieldAlert, ShieldX, Shield, Reply,
} from 'lucide-react'
import Link from 'next/link'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts'
import { ClientOnly } from '@/components/ui/ClientOnly'
import type { Submission } from '@/types'

// ─── Evaluator action panel ───────────────────────────────────────────────────
type ActivePanel = null | 'shortlist' | 'request_info' | 'override'

function EvaluatorActions({ submission, onClose }: { submission: Submission; onClose: () => void }) {
  const updateSubmission = useAppStore(s => s.updateSubmission)
  const { currentRole } = useRole()
  const [panel, setPanel] = useState<ActivePanel>(null)
  const [infoText, setInfoText] = useState('')
  const [overrideDecision, setOverrideDecision] = useState<'approve' | 'reject'>('reject')
  const [overrideJustification, setOverrideJustification] = useState('')
  const [done, setDone] = useState(false)

  if (!submission.aiScore) return null

  const actorName = currentRole === 'admin' ? 'Ahmed Al-Maktoum' : 'Omar Khalid'

  const handleShortlist = () => {
    updateSubmission(submission.id, {
      status: 'compliance_check',
      timeline: [
        ...submission.timeline,
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Shortlisted — Sent to Compliance',
          description: `Evaluator aligned with AI recommendation (${submission.aiScore!.overall}/100). Submission advanced to compliance review.`,
          actorName,
          actorRole: currentRole,
          type: 'decision' as const,
        },
      ],
    })
    setDone(true)
    onClose()
  }

  const handleRequestInfo = () => {
    if (!infoText.trim()) return
    updateSubmission(submission.id, {
      timeline: [
        ...submission.timeline,
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Additional Information Requested',
          description: infoText.trim(),
          actorName,
          actorRole: currentRole,
          type: 'comment' as const,
        },
      ],
    })
    setInfoText('')
    setPanel(null)
    setDone(true)
  }

  const handleOverride = () => {
    if (!overrideJustification.trim()) return
    const newStatus = overrideDecision === 'approve' ? 'compliance_check' : 'rejected'
    const aiRec = submission.aiScore!.recommendation
    updateSubmission(submission.id, {
      status: newStatus,
      timeline: [
        ...submission.timeline,
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: `AI Override — ${overrideDecision === 'approve' ? 'Approved' : 'Rejected'}`,
          description: `Evaluator overrode AI recommendation (AI: ${aiRec}). Decision: ${overrideDecision}. Justification: ${overrideJustification.trim()}`,
          actorName,
          actorRole: currentRole,
          type: 'decision' as const,
        },
      ],
    })
    setPanel(null)
    setDone(true)
    onClose()
  }

  if (done) return null

  const aiRec = submission.aiScore.recommendation
  const canShortlist = ['submitted', 'evaluation', 'ai_review'].includes(submission.status)
  const canRequest = ['submitted', 'evaluation', 'ai_review', 'compliance_check'].includes(submission.status)
  const canOverride = ['submitted', 'evaluation', 'ai_review'].includes(submission.status)

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <CardTitle subtitle="Choose a course of action">Evaluator Decision</CardTitle>
        {panel && (
          <button onClick={() => setPanel(null)} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* AI recommendation context */}
      <div className={`p-3 rounded-lg mb-4 ${aiRec === 'approve' ? 'bg-secondary-container/60' : aiRec === 'review' ? 'bg-warning-container/60' : 'bg-error-container/60'}`}>
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
          <p className="text-label-md text-on-surface">
            <span className="font-semibold">AI recommends: </span>
            {aiRec === 'approve' ? 'Advance to Compliance' : aiRec === 'review' ? 'Further Review' : 'Reject'}
          </p>
        </div>
        <p className="text-label-sm text-on-surface-variant mt-1 ml-6">
          Score {submission.aiScore.overall}/100 · Confidence {Math.round(submission.aiScore.confidence * 100)}%
        </p>
      </div>

      {/* Action buttons — hidden when a panel is open */}
      {!panel && (
        <div className="space-y-2">
          {canShortlist && (
            <button
              onClick={handleShortlist}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary-container/40 hover:bg-secondary-container transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-on-secondary" />
              </div>
              <div>
                <p className="text-label-md font-semibold text-secondary group-hover:text-secondary">Shortlist</p>
                <p className="text-label-sm text-on-surface-variant">Agree with AI · Send to compliance review</p>
              </div>
            </button>
          )}

          {canRequest && (
            <button
              onClick={() => setPanel('request_info')}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-label-md font-semibold text-on-surface">Request More Info</p>
                <p className="text-label-sm text-on-surface-variant">Ask the startup for additional details</p>
              </div>
            </button>
          )}

          {canOverride && (
            <button
              onClick={() => setPanel('override')}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-warning-container/30 hover:bg-warning-container/60 transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-label-md font-semibold text-warning">Override AI Recommendation</p>
                <p className="text-label-sm text-on-surface-variant">Disagree with AI · Provide justification</p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Request More Info panel */}
      {panel === 'request_info' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-primary" />
            <p className="text-label-md font-semibold text-on-surface">Request Additional Information</p>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            Describe what information you need from the startup. This will be logged and visible to them.
          </p>
          <textarea
            value={infoText}
            onChange={e => setInfoText(e.target.value)}
            rows={4}
            placeholder="e.g. Please provide evidence of UAE data residency compliance, including your data processing agreement and server location documentation..."
            className="input-field resize-none text-body-sm w-full"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              onClick={handleRequestInfo}
              disabled={!infoText.trim()}
              icon={<MessageSquare />}
              className="flex-1"
            >
              Send Request
            </Button>
            <Button variant="secondary" onClick={() => setPanel(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Override panel */}
      {panel === 'override' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 p-2.5 bg-warning-container/50 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
            <p className="text-label-sm text-on-surface">
              You are overriding an AI recommendation. This action is logged and auditable.
            </p>
          </div>

          <div>
            <p className="text-label-md font-semibold text-on-surface mb-2">Your decision</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOverrideDecision('approve')}
                className={`p-3 rounded-lg border-2 text-left transition-all ${overrideDecision === 'approve' ? 'border-secondary bg-secondary-container/50' : 'border-outline-variant/20 hover:border-outline-variant/50'}`}
              >
                <CheckCircle2 className={`w-4 h-4 mb-1 ${overrideDecision === 'approve' ? 'text-secondary' : 'text-on-surface-variant'}`} />
                <p className={`text-label-md font-semibold ${overrideDecision === 'approve' ? 'text-secondary' : 'text-on-surface'}`}>Approve</p>
                <p className="text-label-sm text-on-surface-variant">Send to compliance</p>
              </button>
              <button
                onClick={() => setOverrideDecision('reject')}
                className={`p-3 rounded-lg border-2 text-left transition-all ${overrideDecision === 'reject' ? 'border-error bg-error-container/50' : 'border-outline-variant/20 hover:border-outline-variant/50'}`}
              >
                <XCircle className={`w-4 h-4 mb-1 ${overrideDecision === 'reject' ? 'text-error' : 'text-on-surface-variant'}`} />
                <p className={`text-label-md font-semibold ${overrideDecision === 'reject' ? 'text-error' : 'text-on-surface'}`}>Reject</p>
                <p className="text-label-sm text-on-surface-variant">End evaluation</p>
              </button>
            </div>
          </div>

          <div>
            <label className="text-label-md font-semibold text-on-surface block mb-1.5">
              Justification <span className="text-error">*</span>
            </label>
            <textarea
              value={overrideJustification}
              onChange={e => setOverrideJustification(e.target.value)}
              rows={4}
              placeholder="Explain why you are overriding the AI recommendation. This justification will appear in the audit log and submission timeline..."
              className="input-field resize-none text-body-sm w-full"
              autoFocus
            />
            <p className="text-label-sm text-on-surface-variant/60 mt-1">Required — minimum 20 characters</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleOverride}
              disabled={overrideJustification.trim().length < 20}
              variant={overrideDecision === 'approve' ? 'primary' : 'danger'}
              icon={overrideDecision === 'approve' ? <CheckCircle2 /> : <XCircle />}
              className="flex-1"
            >
              Confirm Override
            </Button>
            <Button variant="secondary" onClick={() => setPanel(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── DESC AI Security Policy panel ───────────────────────────────────────────
type ControlStatus = 'pass' | 'warning' | 'fail' | 'not-assessed'

function statusFromScore(score: number, thresholds: [number, number]): ControlStatus {
  if (score >= thresholds[0]) return 'pass'
  if (score >= thresholds[1]) return 'warning'
  return 'fail'
}

const CONTROL_ICONS: Record<ControlStatus, React.ElementType> = {
  pass:          CheckCircle2,
  warning:       ShieldAlert,
  fail:          ShieldX,
  'not-assessed': Shield,
}
const CONTROL_COLORS: Record<ControlStatus, string> = {
  pass:           'text-secondary',
  warning:        'text-warning',
  fail:           'text-error',
  'not-assessed': 'text-on-surface-variant',
}
const CONTROL_BG: Record<ControlStatus, string> = {
  pass:           'bg-secondary-container',
  warning:        'bg-warning-container',
  fail:           'bg-error-container',
  'not-assessed': 'bg-surface-container',
}
const CONTROL_LABEL: Record<ControlStatus, string> = {
  pass:           'Pass',
  warning:        'Review Needed',
  fail:           'Non-Compliant',
  'not-assessed': 'Not Assessed',
}

const PHASE_STATUS_CONFIG: Record<ControlStatus, { label: string; dot: string; line: string }> = {
  pass:           { label: 'Compliant',      dot: 'bg-secondary',          line: 'bg-secondary' },
  warning:        { label: 'Review Needed',  dot: 'bg-warning',            line: 'bg-warning/40' },
  fail:           { label: 'Non-Compliant',  dot: 'bg-error',              line: 'bg-error/30' },
  'not-assessed': { label: 'Not Assessed',   dot: 'bg-outline-variant/40', line: 'bg-outline-variant/20' },
}

function DESCAISecurityPanel({ submission }: { submission: Submission }) {
  const score = submission.aiScore!
  const isUAE = submission.countryOfOrigin === 'UAE'

  // ── Lifecycle phases ──
  const phases: { label: string; desc: string; status: ControlStatus }[] = [
    {
      label: 'Design',
      desc: 'Secure-by-design architecture, threat modelling, data classification',
      status: statusFromScore(score.compliance, [75, 55]),
    },
    {
      label: 'Develop',
      desc: 'Secure coding practices, dependency management, adversarial robustness',
      status: statusFromScore(score.feasibility, [75, 55]),
    },
    {
      label: 'Deploy',
      desc: 'Secure configuration, API hardening, access controls, UAE data residency',
      status: isUAE ? statusFromScore(score.risk, [70, 50]) : 'fail',
    },
    {
      label: 'Monitor',
      desc: 'Continuous anomaly detection, hallucination monitoring, audit logging',
      status: statusFromScore(score.overall, [75, 58]),
    },
    {
      label: 'Dispose',
      desc: 'Secure data deletion, model retirement procedures, DESC notification',
      status: statusFromScore(score.compliance, [65, 45]),
    },
  ]

  // ── Risk controls ──
  const controls: { label: string; desc: string; standard: string; status: ControlStatus }[] = [
    {
      label: 'Data Poisoning',
      desc: 'Training data integrity validation and supply chain verification',
      standard: 'DESC AI Policy § 4.2',
      status: statusFromScore(score.risk, [78, 58]),
    },
    {
      label: 'Adversarial Attacks',
      desc: 'Input validation, model robustness testing, anomaly detection',
      standard: 'DESC AI Policy § 4.3',
      status: statusFromScore(score.feasibility, [75, 58]),
    },
    {
      label: 'Hallucination Monitoring',
      desc: 'Output validation gates, confidence thresholds, human-in-the-loop controls',
      standard: 'DESC AI Policy § 5.1',
      status: statusFromScore(score.compliance, [72, 52]),
    },
    {
      label: 'Secure APIs',
      desc: 'API authentication, rate limiting, encrypted transport, DESC CSP alignment',
      standard: 'DESC CSP § 9.1 / ISO 27001',
      status: statusFromScore(score.compliance, [75, 55]),
    },
    {
      label: 'UAE Data Residency',
      desc: 'All data processed and stored within UAE borders per DESC cloud policy',
      standard: 'DESC Cloud Policy / PDPL',
      status: isUAE
        ? statusFromScore(score.compliance, [68, 48])
        : 'fail',
    },
  ]

  const passCount    = controls.filter(c => c.status === 'pass').length
  const warningCount = controls.filter(c => c.status === 'warning').length
  const failCount    = controls.filter(c => c.status === 'fail').length

  const overallStatus: ControlStatus =
    failCount > 0    ? 'fail'
    : warningCount > 0 ? 'warning'
    : 'pass'

  const OverallIcon = CONTROL_ICONS[overallStatus]

  return (
    <Card>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-title-sm font-semibold text-on-surface">DESC AI Security Policy</p>
            <p className="text-label-sm text-on-surface-variant">ISO 27001 · ISO 27017 · CSA CCM v4 · ISR V3 · DESC AI Policy</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-label-sm font-semibold ${CONTROL_BG[overallStatus]} ${CONTROL_COLORS[overallStatus]}`}>
          <OverallIcon className="h-3.5 w-3.5" />
          {CONTROL_LABEL[overallStatus]}
        </div>
      </div>

      {/* AI Lifecycle phases — horizontal stepper */}
      <div className="mb-5">
        <p className="mb-3 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">AI Lifecycle Compliance</p>
        <div className="flex items-start gap-0">
          {phases.map((phase, idx) => {
            const cfg = PHASE_STATUS_CONFIG[phase.status]
            return (
              <div key={phase.label} className="flex flex-1 flex-col items-center">
                {/* Connector + dot row */}
                <div className="flex w-full items-center">
                  <div className={`h-0.5 flex-1 ${idx === 0 ? 'opacity-0' : cfg.line}`} />
                  <div className={`h-3 w-3 flex-shrink-0 rounded-full ${cfg.dot}`} />
                  <div className={`h-0.5 flex-1 ${idx === phases.length - 1 ? 'opacity-0' : cfg.line}`} />
                </div>
                {/* Label */}
                <p className="mt-1.5 text-center text-label-sm font-medium text-on-surface">{phase.label}</p>
                <p className={`text-center text-[10px] font-medium ${CONTROL_COLORS[phase.status]}`}>{cfg.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Risk controls checklist */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">Risk Controls</p>
          <div className="flex items-center gap-3 text-label-sm">
            <span className="text-secondary font-medium">{passCount} Pass</span>
            {warningCount > 0 && <span className="text-warning font-medium">{warningCount} Review</span>}
            {failCount > 0 && <span className="text-error font-medium">{failCount} Fail</span>}
          </div>
        </div>
        <div className="space-y-2">
          {controls.map(ctrl => {
            const Icon = CONTROL_ICONS[ctrl.status]
            return (
              <div key={ctrl.label} className="flex items-start gap-3 rounded-lg bg-surface-container-lowest p-3">
                <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${CONTROL_COLORS[ctrl.status]}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-label-md font-medium text-on-surface">{ctrl.label}</p>
                    <span className="text-label-sm text-on-surface-variant/60">{ctrl.standard}</span>
                  </div>
                  <p className="text-label-sm text-on-surface-variant">{ctrl.desc}</p>
                </div>
                <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-label-sm font-medium ${CONTROL_BG[ctrl.status]} ${CONTROL_COLORS[ctrl.status]}`}>
                  {CONTROL_LABEL[ctrl.status]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-4 text-label-sm text-on-surface-variant/60">
        Controls assessed automatically from AI evaluation scores. Full DESC audit requires manual verification by a certified compliance officer.
      </p>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AIEvaluationPage() {
  const submissions = useAppStore(s => s.submissions)
  const runningAIEvaluation = useAppStore(s => s.runningAIEvaluation)
  const startAIEvaluation = useAppStore(s => s.startAIEvaluation)
  const { can } = useRole()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [actionKey, setActionKey] = useState(0) // remount actions panel after each action

  const queue = submissions
    .filter(s => s.status !== 'draft')
    .sort((a, b) => {
      if (a.status === 'submitted' && b.status !== 'submitted') return -1
      if (b.status === 'submitted' && a.status !== 'submitted') return 1
      if (a.aiScore && b.aiScore) return b.aiScore.overall - a.aiScore.overall
      if (a.aiScore) return 1
      return -1
    })

  const selected = submissions.find(s => s.id === selectedId) ?? queue[0]
  const isRunning = runningAIEvaluation === selected?.id

  const radarData = selected?.aiScore
    ? [
        { subject: 'Relevance', A: selected.aiScore.relevance },
        { subject: 'Feasibility', A: selected.aiScore.feasibility },
        { subject: 'Compliance', A: selected.aiScore.compliance },
        { subject: 'Risk', A: selected.aiScore.risk },
        { subject: 'Innovation', A: selected.aiScore.innovation },
        { subject: 'Market Fit', A: selected.aiScore.marketFit },
      ]
    : []

  const scoreDistribution = submissions
    .filter(s => s.aiScore)
    .map(s => ({ name: s.company.split(' ')[0], score: s.aiScore!.overall, rec: s.aiScore!.recommendation }))
    .sort((a, b) => b.score - a.score)

  // Check if selected submission has been actioned (status changed away from evaluation)
  const isActioned = selected && !['submitted', 'ai_review', 'evaluation'].includes(selected.status)

  // P19 — detect startup response to an evaluator info request
  const startupResponse = selected ? (() => {
    const events = selected.timeline
    const lastRequestIdx = [...events].reverse().findIndex(
      e => e.type === 'comment' && e.title === 'Additional Information Requested'
    )
    if (lastRequestIdx === -1) return null
    const absoluteIdx = events.length - 1 - lastRequestIdx
    return events.slice(absoluteIdx + 1).find(
      e => e.type === 'comment' && e.actorRole === 'startup'
    ) ?? null
  })() : null

  return (
    <AppShell>
      <div className="space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Scored', value: submissions.filter(s => s.aiScore).length, total: submissions.length },
            {
              label: 'Avg Score',
              value: Math.round(
                submissions.filter(s => s.aiScore).reduce((sum, sub) => sum + sub.aiScore!.overall, 0) /
                Math.max(1, submissions.filter(s => s.aiScore).length)
              ),
              total: 100,
            },
            {
              label: 'Recommended',
              value: submissions.filter(s => s.aiScore?.recommendation === 'approve').length,
              total: submissions.filter(s => s.aiScore).length,
            },
            { label: 'Pending', value: submissions.filter(s => s.status === 'submitted').length, total: submissions.length },
          ].map(({ label, value, total }) => (
            <Card key={label}>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</p>
              <p className="mt-1 font-display text-display-sm font-bold text-on-surface">
                {value}
                <span className="ml-1 text-label-lg font-normal text-on-surface-variant">/ {total}</span>
              </p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <SortDesc className="w-4 h-4 text-primary" />
              <h2 className="text-title-md font-semibold text-on-surface">Evaluation Queue</h2>
              <span className="badge ml-auto bg-primary/10 text-primary">{queue.length}</span>
            </div>

            {queue.map(sub => {
              const statusConfig = getSubmissionStatusConfig(sub.status)
              const isActive = selected?.id === sub.id
              const isRunningThis = runningAIEvaluation === sub.id

              return (
                <div
                  key={sub.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => { setSelectedId(sub.id); setActionKey(k => k + 1) }}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(sub.id); setActionKey(k => k + 1) } }}
                  className={`w-full cursor-pointer rounded-lg p-3 text-left transition-all duration-150 ${isActive ? 'bg-primary/8 ring-1 ring-primary/20' : 'bg-surface-container-lowest shadow-ambient hover:bg-surface-container'}`}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-title-sm leading-snug text-on-surface">{sub.title}</p>
                    {sub.aiScore ? (
                      <span className={`flex-shrink-0 text-label-sm font-bold ${getScoreColor(sub.aiScore.overall)}`}>
                        {sub.aiScore.overall}
                      </span>
                    ) : isRunningThis ? (
                      <Bot className="w-4 h-4 flex-shrink-0 animate-pulse text-primary-tint" />
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={statusConfig} />
                    <span className="text-label-sm text-on-surface-variant">{getCategoryLabel(sub.category)}</span>
                  </div>

                  {!sub.aiScore && sub.status === 'submitted' && can.runAIEvaluation && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        icon={<Play />}
                        loading={isRunningThis}
                        onClick={e => { e.stopPropagation(); startAIEvaluation(sub.id) }}
                        className="w-full"
                      >
                        {isRunningThis ? 'Evaluating...' : 'Run AI Evaluation'}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Detail panel */}
          <div className="space-y-6 lg:col-span-2">
            {selected ? (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-display text-headline-md text-on-surface">{selected.title}</h2>
                    <p className="text-body-md text-on-surface-variant">
                      {selected.company} · {getCategoryLabel(selected.category)}
                    </p>
                  </div>
                  <Link href={`/submissions/${selected.id}`} className="w-full sm:w-auto flex-shrink-0">
                    <Button variant="secondary" size="sm" icon={<ChevronRight />} iconPosition="right" className="w-full sm:w-auto">
                      View Submission
                    </Button>
                  </Link>
                </div>

                {isRunning ? (
                  <AIThinkingState label="AI Engine is scoring across 6 dimensions — Relevance, Feasibility, Compliance, Risk, Innovation, Market Fit" />
                ) : selected.aiScore ? (
                  <>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <Card>
                        <CardTitle subtitle="Multi-dimensional AI assessment" className="mb-4">Score Breakdown</CardTitle>
                        <AIScorePanel score={selected.aiScore} />
                      </Card>

                      <div className="space-y-4">
                        <Card>
                          <CardTitle subtitle="Dimension spider chart" className="mb-3">Score Radar</CardTitle>
                          <div className="h-[220px] sm:h-[240px]">
                            <ClientOnly fallback={<div className="h-full bg-surface-container rounded animate-pulse" />}>
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                  <PolarGrid stroke="rgba(195,198,214,0.3)" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#434654' }} />
                                  <Radar name="Score" dataKey="A" stroke="#003d9b" fill="#003d9b" fillOpacity={0.15} strokeWidth={2} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </ClientOnly>
                          </div>
                        </Card>

                        <Card>
                          <CardTitle subtitle="All scored submissions" className="mb-3">Score Comparison</CardTitle>
                          <div className="h-[160px]">
                            <ClientOnly fallback={<div className="h-full bg-surface-container rounded animate-pulse" />}>
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={scoreDistribution} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#434654' }} axisLine={false} tickLine={false} />
                                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#434654' }} axisLine={false} tickLine={false} />
                                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(195,198,214,0.2)', borderRadius: '8px', fontSize: '12px' }} />
                                  <Bar dataKey="score" radius={[4, 4, 0, 0]} name="AI Score">
                                    {scoreDistribution.map((entry, idx) => (
                                      <Cell
                                        key={idx}
                                        fill={entry.name === selected.company.split(' ')[0] ? '#003d9b' : '#c3c6d6'}
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </ClientOnly>
                          </div>
                        </Card>
                      </div>
                    </div>

                    {/* DESC AI Security Policy */}
                    <DESCAISecurityPanel submission={selected} />

                    {/* P19 — Startup Responded banner */}
                    {startupResponse && can.runAIEvaluation && !isActioned && (
                      <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Reply className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-label-md font-semibold text-primary">Startup Responded</p>
                          <p className="text-body-sm text-on-surface-variant mt-0.5">
                            {startupResponse.actorName} has provided the requested information.
                          </p>
                          <div className="mt-2 p-3 bg-surface-container-lowest rounded-lg">
                            <p className="text-body-sm text-on-surface">{startupResponse.description}</p>
                            <p className="text-label-sm text-on-surface-variant/60 mt-1">
                              {new Date(startupResponse.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Evaluator actions */}
                    {can.runAIEvaluation && !isActioned && (
                      <EvaluatorActions
                        key={`${selected.id}-${actionKey}`}
                        submission={selected}
                        onClose={() => setActionKey(k => k + 1)}
                      />
                    )}

                    {/* Post-action status */}
                    {isActioned && (
                      <Card className="bg-surface-container">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                          <div>
                            <p className="text-label-md font-semibold text-on-surface">Decision recorded</p>
                            <p className="text-body-sm text-on-surface-variant">
                              This submission has been actioned. View the full timeline on the{' '}
                              <Link href={`/submissions/${selected.id}`} className="text-primary hover:underline">submission detail page</Link>.
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card className="py-16 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-headline-sm text-on-surface">Ready for AI Evaluation</p>
                    <p className="mt-2 mb-6 text-body-md text-on-surface-variant">
                      This submission is queued and ready to be scored by the AI engine.
                    </p>
                    {can.runAIEvaluation && (
                      <Button icon={<Brain />} onClick={() => startAIEvaluation(selected.id)}>
                        Start AI Evaluation
                      </Button>
                    )}
                  </Card>
                )}
              </>
            ) : (
              <Card className="py-16 text-center">
                <Brain className="mx-auto mb-3 h-12 w-12 text-on-surface-variant/30" />
                <p className="text-body-md text-on-surface-variant">Select a submission to view its AI evaluation</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
