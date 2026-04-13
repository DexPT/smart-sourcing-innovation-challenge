'use client'
import { useParams, useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardHeader, CardTitle, CardSection } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Timeline } from '@/components/ui/Timeline'
import { AIScorePanel, AIThinkingState } from '@/components/ui/AIScorePanel'
import { Progress } from '@/components/ui/Progress'
import { useAppStore } from '@/store/appStore'
import { useRole } from '@/hooks/useRole'
import {
  formatAED, formatDate, getCategoryLabel, getFundingLabel,
  getSubmissionStatusConfig, getComplianceStatusConfig, truncate
} from '@/lib/utils'
import {
  ArrowLeft, Bot, ShieldCheck, CheckCircle2, XCircle,
  Users, Globe, Tag, FileText, ChevronRight, FlaskConical,
  HandshakeIcon, AlertTriangle, Clock, Download, Play
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

// Workflow steps
const WORKFLOW_STEPS = ['submitted', 'ai_review', 'evaluation', 'compliance_check', 'approved', 'pilot', 'procurement']
const WORKFLOW_LABELS = ['Submitted', 'AI Review', 'Evaluation', 'Compliance', 'Approved', 'Pilot', 'Procurement']

function WorkflowProgress({ currentStatus }: { currentStatus: string }) {
  const activeIdx = WORKFLOW_STEPS.indexOf(currentStatus)
  return (
    <div className="flex items-center gap-0">
      {WORKFLOW_STEPS.map((step, idx) => {
        const isComplete = activeIdx > idx
        const isActive = activeIdx === idx
        const isPast = idx < activeIdx
        return (
          <div key={step} className="flex items-center flex-1">
            <div className={`flex flex-col items-center ${idx < WORKFLOW_STEPS.length - 1 ? 'flex-1' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-label-sm font-bold flex-shrink-0 ${isComplete || isActive ? (isActive ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary') : 'bg-surface-container text-on-surface-variant'}`}>
                {isComplete ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span className={`text-label-sm mt-1 text-center leading-tight ${isActive ? 'text-primary font-semibold' : isComplete ? 'text-secondary' : 'text-on-surface-variant'}`}>
                {WORKFLOW_LABELS[idx]}
              </span>
            </div>
            {idx < WORKFLOW_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-5 ${isPast || isActive ? 'bg-secondary' : 'bg-surface-container'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const submissions = useAppStore((s) => s.submissions)
  const updateSubmission = useAppStore((s) => s.updateSubmission)
  const runningAIEvaluation = useAppStore((s) => s.runningAIEvaluation)
  const startAIEvaluation = useAppStore((s) => s.startAIEvaluation)
  const { currentRole, can } = useRole()
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'compliance' | 'timeline'>('overview')

  const submission = submissions.find(s => s.id === id)
  const complianceResults = useAppStore(s => s.complianceResults)
  const compliance = submission ? complianceResults.find(c => c.submissionId === submission.id) : null

  if (!submission) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <p className="text-headline-sm text-on-surface-variant">Submission not found</p>
          <Link href="/submissions" className="text-primary hover:underline text-body-md mt-2 inline-block">← Back to Submissions</Link>
        </div>
      </AppShell>
    )
  }

  const statusConfig = getSubmissionStatusConfig(submission.status)
  const isRunningAI = runningAIEvaluation === submission.id

  const handleRunAI = () => startAIEvaluation(submission.id)

  const handleApprove = () => {
    updateSubmission(submission.id, {
      status: 'approved',
      timeline: [
        ...submission.timeline,
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Submission Approved',
          description: 'Admin approved the submission for procurement consideration.',
          actorName: 'Ahmed Al-Maktoum',
          actorRole: 'admin' as const,
          type: 'decision' as const,
        }
      ]
    })
  }

  const handleReject = () => {
    updateSubmission(submission.id, {
      status: 'rejected',
      timeline: [
        ...submission.timeline,
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Submission Rejected',
          description: 'Submission rejected by evaluator following review.',
          actorName: currentRole === 'admin' ? 'Ahmed Al-Maktoum' : 'Omar Khalid',
          actorRole: currentRole as any,
          type: 'decision' as const,
        }
      ]
    })
  }

  const handleMoveToCompliance = () => {
    updateSubmission(submission.id, {
      status: 'compliance_check',
      timeline: [
        ...submission.timeline,
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Sent to Compliance Review',
          description: 'Evaluator approved submission for compliance check.',
          actorName: 'Omar Khalid',
          actorRole: 'evaluator' as const,
          type: 'status_change' as const,
        }
      ]
    })
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
          <Link href="/submissions" className="hover:text-primary transition-colors">Submissions</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-on-surface truncate">{truncate(submission.title, 40)}</span>
        </div>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <StatusBadge status={statusConfig} />
              <span className="text-label-sm text-on-surface-variant">{getCategoryLabel(submission.category)}</span>
              <span className="text-label-sm text-on-surface-variant">TRL {submission.trl}</span>
            </div>
            <h1 className="font-display text-display-sm text-on-surface">{submission.title}</h1>
            <p className="text-body-lg text-on-surface-variant mt-1">{submission.company} · {submission.contactName}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            {/* Action buttons based on role and status */}
            {can.runAIEvaluation && submission.status === 'submitted' && (
              <Button icon={<Bot />} onClick={handleRunAI} loading={isRunningAI}>
                Run AI Evaluation
              </Button>
            )}
            {can.rejectSubmission && ['evaluation', 'compliance_check', 'approved'].includes(submission.status) && (
              <Button variant="danger" icon={<XCircle />} onClick={handleReject}>
                Reject
              </Button>
            )}
            {can.runAIEvaluation && submission.status === 'evaluation' && (
              <Button variant="secondary" icon={<ShieldCheck />} onClick={handleMoveToCompliance}>
                Send to Compliance
              </Button>
            )}
            {can.approveSubmission && submission.status === 'compliance_check' && (
              <Button icon={<CheckCircle2 />} onClick={handleApprove}>
                Approve
              </Button>
            )}
          </div>
        </div>

        {/* Workflow Progress */}
        {!['rejected', 'archived', 'draft'].includes(submission.status) && (
          <Card>
            <WorkflowProgress currentStatus={submission.status} />
          </Card>
        )}

        {/* AI Thinking Banner */}
        {isRunningAI && (
          <AIThinkingState label="AI Engine is evaluating this submission across 6 dimensions..." />
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-container-low rounded-lg p-1 w-fit">
          {(['overview', 'ai', 'compliance', 'timeline'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-label-md font-medium transition-all duration-150 capitalize ${activeTab === tab ? 'bg-surface-container-lowest text-on-surface shadow-ambient-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              {tab === 'ai' ? 'AI Evaluation' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <p className="text-body-md text-on-surface-variant leading-relaxed">{submission.description}</p>

                <div className="mt-4 space-y-3">
                  <CardSection label="Problem Statement">
                    <p className="text-body-sm text-on-surface-variant">{submission.problem}</p>
                  </CardSection>
                  <CardSection label="Proposed Solution">
                    <p className="text-body-sm text-on-surface-variant">{submission.solution}</p>
                  </CardSection>
                </div>
              </Card>

              {/* Attachments */}
              {submission.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Attachments</CardTitle>
                  </CardHeader>
                  <div className="space-y-2">
                    {submission.attachments.map(att => (
                      <div key={att.id} className="flex items-center gap-3 p-2.5 bg-surface-container-low rounded-lg">
                        <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-label-md text-on-surface truncate">{att.name}</p>
                          <p className="text-label-sm text-on-surface-variant">{att.size} · {att.type.toUpperCase()}</p>
                        </div>
                        <Button variant="ghost" size="sm" icon={<Download />}>Download</Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Feedback (for rejected) */}
              {submission.feedback && (
                <Card className="border-l-4 border-l-error">
                  <CardHeader>
                    <CardTitle>Rejection Feedback</CardTitle>
                  </CardHeader>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">{submission.feedback}</p>
                </Card>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="space-y-4">
              <Card>
                <CardTitle className="mb-3">Submission Details</CardTitle>
                <div className="space-y-3">
                  {[
                    { label: 'Category', value: getCategoryLabel(submission.category) },
                    { label: 'TRL Level', value: `${submission.trl} / 9` },
                    { label: 'Team Size', value: `${submission.teamSize} people` },
                    { label: 'Funding Stage', value: getFundingLabel(submission.fundingStage) },
                    { label: 'Est. Value', value: formatAED(submission.estimatedValue) },
                    { label: 'Country', value: submission.countryOfOrigin },
                    { label: 'Submitted', value: formatDate(submission.submittedAt) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-1 border-b border-outline-variant/10 last:border-0">
                      <span className="text-label-sm text-on-surface-variant">{label}</span>
                      <span className="text-label-md font-medium text-on-surface">{value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardTitle className="mb-3">Contact</CardTitle>
                <div className="space-y-1.5">
                  <p className="text-label-md font-medium text-on-surface">{submission.contactName}</p>
                  <p className="text-body-sm text-on-surface-variant">{submission.contactEmail}</p>
                </div>
              </Card>

              {submission.tags.length > 0 && (
                <Card>
                  <CardTitle className="mb-3">Tags</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {submission.tags.map(tag => (
                      <span key={tag} className="badge bg-surface-container text-on-surface-variant">{tag}</span>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              {submission.aiScore ? (
                <AIScorePanel score={submission.aiScore} />
              ) : isRunningAI ? (
                <AIThinkingState label="AI is processing your submission..." />
              ) : (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3" />
                  <p className="text-body-md text-on-surface-variant">No AI evaluation yet.</p>
                  {can.runAIEvaluation && submission.status === 'submitted' && (
                    <Button className="mt-4" icon={<Play />} onClick={handleRunAI}>
                      Run AI Evaluation
                    </Button>
                  )}
                </div>
              )}
            </Card>
            {submission.aiScore && (
              <Card>
                <CardTitle subtitle="AI-recommended next actions">Decision Support</CardTitle>
                <div className="mt-4 space-y-3">
                  <div className={`p-3 rounded-lg ${submission.aiScore.recommendation === 'approve' ? 'bg-secondary-container' : submission.aiScore.recommendation === 'review' ? 'bg-warning-container' : 'bg-error-container'}`}>
                    <p className={`text-label-md font-semibold ${submission.aiScore.recommendation === 'approve' ? 'text-secondary' : submission.aiScore.recommendation === 'review' ? 'text-warning' : 'text-error'}`}>
                      AI Recommendation: {submission.aiScore.recommendation === 'approve' ? 'Advance to Compliance' : submission.aiScore.recommendation === 'review' ? 'Further Review Required' : 'Reject Submission'}
                    </p>
                    <p className="text-body-sm text-on-surface-variant mt-1">
                      Confidence level: {Math.round(submission.aiScore.confidence * 100)}%
                    </p>
                  </div>
                  {can.rejectSubmission && submission.status === 'evaluation' && (
                    <div className="flex gap-2">
                      <Button className="flex-1" icon={<ShieldCheck />} onClick={handleMoveToCompliance}>
                        Proceed to Compliance
                      </Button>
                      <Button variant="danger" icon={<XCircle />} onClick={handleReject}>
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'compliance' && (
          <div>
            {compliance ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {compliance.checks.map(check => {
                    const statusIcon = check.status === 'pass' ? CheckCircle2 : check.status === 'fail' ? XCircle : check.status === 'warning' ? AlertTriangle : Clock
                    const statusColor = check.status === 'pass' ? 'text-secondary' : check.status === 'fail' ? 'text-error' : check.status === 'warning' ? 'text-warning' : 'text-on-surface-variant'
                    const StatusIcon = statusIcon
                    return (
                      <Card key={check.id}>
                        <div className="flex items-start gap-3">
                          <StatusIcon className={`w-5 h-5 ${statusColor} flex-shrink-0 mt-0.5`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="text-title-sm text-on-surface">{check.name}</p>
                              <span className={`badge ${check.severity === 'critical' ? 'bg-error-container text-error' : check.severity === 'high' ? 'bg-error-container/50 text-error' : check.severity === 'medium' ? 'bg-warning-container text-warning' : 'bg-secondary-container text-secondary'}`}>
                                {check.severity}
                              </span>
                            </div>
                            <p className="text-body-sm text-on-surface-variant">{check.description}</p>
                            <p className="text-body-sm text-on-surface mt-2">{check.details}</p>
                            {check.regulation && (
                              <p className="text-label-sm text-on-surface-variant/60 mt-1">Regulation: {check.regulation}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
                <div className="space-y-4">
                  <Card>
                    <CardTitle className="mb-3">Compliance Summary</CardTitle>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-label-sm text-on-surface-variant">Overall Status</span>
                        <StatusBadge status={getComplianceStatusConfig(compliance.status)} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-label-sm text-on-surface-variant">DESC Aligned</span>
                        <span className={`text-label-md font-medium ${compliance.descAligned ? 'text-secondary' : 'text-error'}`}>
                          {compliance.descAligned ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-label-sm text-on-surface-variant">Risk Level</span>
                        <span className={`text-label-md font-medium capitalize ${compliance.overallRisk === 'low' ? 'text-secondary' : compliance.overallRisk === 'medium' ? 'text-warning' : 'text-error'}`}>
                          {compliance.overallRisk}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-label-sm text-on-surface-variant">Officer</span>
                        <span className="text-label-md font-medium text-on-surface">{compliance.officerName}</span>
                      </div>
                    </div>
                    {compliance.conditions && compliance.conditions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-outline-variant/10">
                        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Conditions</p>
                        <ul className="space-y-1.5">
                          {compliance.conditions.map((c, i) => (
                            <li key={i} className="text-body-sm text-on-surface-variant flex items-start gap-1.5">
                              <span className="text-warning mt-0.5">·</span> {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {compliance.notes && (
                      <div className="mt-3 pt-3 border-t border-outline-variant/10">
                        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1.5">Officer Notes</p>
                        <p className="text-body-sm text-on-surface-variant">{compliance.notes}</p>
                      </div>
                    )}
                  </Card>
                  {can.approveSubmission && submission.status === 'compliance_check' && (
                    <div className="flex gap-2">
                      <Button className="flex-1" icon={<CheckCircle2 />} onClick={handleApprove}>
                        Approve
                      </Button>
                      <Button variant="danger" icon={<XCircle />} onClick={handleReject}>
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Card className="text-center py-12">
                <ShieldCheck className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3" />
                <p className="text-body-md text-on-surface-variant">No compliance review has been initiated yet.</p>
                {can.runComplianceCheck && <p className="text-label-sm text-on-surface-variant/60 mt-1">Compliance review will appear here once initiated.</p>}
              </Card>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <Card>
            <CardTitle subtitle="Full activity history" className="mb-4">Activity Timeline</CardTitle>
            <Timeline events={submission.timeline} />
          </Card>
        )}
      </div>
    </AppShell>
  )
}
