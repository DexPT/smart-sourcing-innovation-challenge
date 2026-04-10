'use client'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AIScorePanel, AIThinkingState } from '@/components/ui/AIScorePanel'
import { useAppStore } from '@/store/appStore'
import { useRole } from '@/hooks/useRole'
import { getSubmissionStatusConfig, getCategoryLabel, getScoreColor } from '@/lib/utils'
import { Brain, Bot, Play, ChevronRight, Sparkles, SortDesc } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'

export default function AIEvaluationPage() {
  const submissions = useAppStore(s => s.submissions)
  const runningAIEvaluation = useAppStore(s => s.runningAIEvaluation)
  const startAIEvaluation = useAppStore(s => s.startAIEvaluation)
  const { can } = useRole()
  const [selectedId, setSelectedId] = useState<string | null>(null)

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
    .map(s => ({ name: s.company.split(' ')[0], score: s.aiScore!.overall }))
    .sort((a, b) => b.score - a.score)

  return (
    <AppShell>
      <div className="space-y-6">
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
                  onClick={() => setSelectedId(sub.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedId(sub.id)
                    }
                  }}
                  className={`w-full cursor-pointer rounded-lg p-3 text-left transition-all duration-150 ${
                    isActive ? 'bg-primary/8 ring-1 ring-primary/20' : 'bg-surface-container-lowest shadow-ambient hover:bg-surface-container'
                  }`}
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
                        onClick={e => {
                          e.stopPropagation()
                          startAIEvaluation(sub.id)
                        }}
                        className="w-full text-white"
                      >
                        {isRunningThis ? 'Evaluating...' : 'Run AI Evaluation'}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

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

                  <Link href={`/submissions/${selected.id}`} className="w-full sm:w-auto">
                    <Button variant="secondary" size="sm" icon={<ChevronRight />} iconPosition="right" className="w-full sm:w-auto">
                      View Submission
                    </Button>
                  </Link>
                </div>

                {isRunning ? (
                  <AIThinkingState label="AI Engine is scoring across 6 dimensions - Relevance, Feasibility, Compliance, Risk, Innovation, Market Fit" />
                ) : selected.aiScore ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card>
                      <CardTitle subtitle="Multi-dimensional AI assessment" className="mb-4">
                        Score Breakdown
                      </CardTitle>
                      <AIScorePanel score={selected.aiScore} />
                    </Card>

                    <div className="space-y-4">
                      <Card>
                        <CardTitle subtitle="Dimension spider chart" className="mb-3">
                          Score Radar
                        </CardTitle>
                        <div className="h-[220px] sm:h-[240px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                              <PolarGrid stroke="rgba(195,198,214,0.3)" />
                              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#434654' }} />
                              <Radar name="Score" dataKey="A" stroke="#003d9b" fill="#003d9b" fillOpacity={0.15} strokeWidth={2} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>

                      <Card>
                        <CardTitle subtitle="AI benchmark comparison" className="mb-3">
                          All Scores
                        </CardTitle>
                        <div className="h-[180px] sm:h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={scoreDistribution} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#434654' }} axisLine={false} tickLine={false} />
                              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#434654' }} axisLine={false} tickLine={false} />
                              <Tooltip
                                contentStyle={{
                                  background: '#fff',
                                  border: '1px solid rgba(195,198,214,0.2)',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                }}
                              />
                              <Bar dataKey="score" radius={[4, 4, 0, 0]} name="AI Score">
                                {scoreDistribution.map((entry, idx) => (
                                  <Cell key={idx} fill={entry.name === selected.company.split(' ')[0] ? '#003d9b' : '#c3c6d6'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <Card className="py-16 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-headline-sm text-on-surface">Ready for AI Evaluation</p>
                    <p className="mt-2 mb-6 text-body-md text-on-surface-variant">
                      This submission is queued and ready to be evaluated by the AI engine.
                    </p>
                    {can.runAIEvaluation && (
                      <Button icon={<Brain />} onClick={() => startAIEvaluation(selected.id)} className="text-white">
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
