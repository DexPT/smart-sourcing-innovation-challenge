'use client'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { useAppStore } from '@/store/appStore'
import { useRole } from '@/hooks/useRole'
import { vendors } from '@/data/vendors'
import {
  formatAED, formatRelativeTime, formatDate,
  getSubmissionStatusConfig, getCategoryLabel, getScoreColor, getScoreBg,
} from '@/lib/utils'
import {
  FileText, Brain, FlaskConical, TrendingUp, AlertTriangle,
  CheckCircle2, Clock, ArrowRight, ShieldCheck, Building2,
  Zap, BarChart3, Users, Target, CircleDot, Bot, Play,
  Trophy, Star,
} from 'lucide-react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import { ClientOnly } from '@/components/ui/ClientOnly'

// ─── Shared chart palette ───────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  ai_ml: '#003d9b', logistics: '#006a6a', sustainability: '#3c4455',
  fintech: '#0052cc', cybersecurity: '#0c56d0', edtech: '#747688',
  healthtech: '#c3c6d6', smart_city: '#006a6a', iot: '#434654',
}

const submissionTrendData = [
  { month: 'Oct', submissions: 4, approved: 2 },
  { month: 'Nov', submissions: 6, approved: 3 },
  { month: 'Dec', submissions: 5, approved: 3 },
  { month: 'Jan', submissions: 9, approved: 5 },
  { month: 'Feb', submissions: 8, approved: 4 },
  { month: 'Mar', submissions: 12, approved: 7 },
  { month: 'Apr', submissions: 8, approved: 3 },
]

// Simulated AI override trend (AI recommended vs human decision)
const overrideTrendData = [
  { month: 'Jan', aligned: 7, overridden: 2 },
  { month: 'Feb', aligned: 6, overridden: 3 },
  { month: 'Mar', aligned: 10, overridden: 2 },
  { month: 'Apr', aligned: 5, overridden: 1 },
]

// ─── FINALISTS PANEL ────────────────────────────────────────────────────────
const MAX_FINALISTS = 5

function FinalistsPanel() {
  const submissions   = useAppStore(s => s.submissions)
  const updateSubmission = useAppStore(s => s.updateSubmission)

  const finalists = submissions.filter(s => ['finalist', 'demo_day'].includes(s.status))
  const eligible  = submissions.filter(s => s.status === 'approved')
  const remaining = MAX_FINALISTS - finalists.length
  const isFull    = remaining <= 0

  const markFinalist = (id: string) => {
    updateSubmission(id, {
      status: 'finalist',
      timeline: [
        ...(submissions.find(s => s.id === id)?.timeline ?? []),
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Selected as Finalist',
          description: `Submission shortlisted as a Challenge Finalist for Demo Day. (${finalists.length + 1}/${MAX_FINALISTS} slots filled)`,
          actorName: 'Ahmed Al-Maktoum',
          actorRole: 'admin' as const,
          type: 'decision' as const,
        },
      ],
    })
  }

  const confirmDemoDay = (id: string) => {
    updateSubmission(id, {
      status: 'demo_day',
      timeline: [
        ...(submissions.find(s => s.id === id)?.timeline ?? []),
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Confirmed for Demo Day',
          description: 'Startup confirmed as a Demo Day presenter. Presentation slot allocated.',
          actorName: 'Ahmed Al-Maktoum',
          actorRole: 'admin' as const,
          type: 'decision' as const,
        },
      ],
    })
  }

  return (
    <Card>
      <CardHeader actions={
        <Link href="/submissions?status=finalist">
          <Button variant="ghost" size="sm" icon={<ArrowRight />} iconPosition="right">View All</Button>
        </Link>
      }>
        <CardTitle subtitle="Dubai Chambers Innovation Challenge — Demo Day selection">
          <span className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Challenge Finalists
          </span>
        </CardTitle>
      </CardHeader>

      {/* Slot counter */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex gap-1.5">
          {Array.from({ length: MAX_FINALISTS }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-8 rounded-full transition-all ${
                i < finalists.length
                  ? finalists[i]?.status === 'demo_day' ? 'bg-power-gradient' : 'bg-primary'
                  : 'bg-surface-container'
              }`}
            />
          ))}
        </div>
        <p className="text-label-sm text-on-surface-variant">
          <span className="font-semibold text-on-surface">{finalists.length}</span> / {MAX_FINALISTS} finalists selected
        </p>
        {isFull && (
          <span className="badge bg-secondary-container text-secondary text-label-sm">Slots full</span>
        )}
      </div>

      {/* Current finalists */}
      {finalists.length > 0 && (
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {finalists.map(sub => (
            <div
              key={sub.id}
              className={`rounded-lg p-3 ${sub.status === 'demo_day' ? 'bg-power-gradient' : 'bg-primary/8'}`}
            >
              <div className="mb-1 flex items-center gap-1.5">
                <Star className={`h-3.5 w-3.5 flex-shrink-0 ${sub.status === 'demo_day' ? 'text-on-primary' : 'text-primary'}`} />
                <span className={`text-label-sm font-semibold ${sub.status === 'demo_day' ? 'text-on-primary' : 'text-primary'}`}>
                  {sub.status === 'demo_day' ? 'Demo Day ★' : 'Finalist'}
                </span>
              </div>
              <p className={`text-label-md font-semibold truncate ${sub.status === 'demo_day' ? 'text-on-primary' : 'text-on-surface'}`}>
                {sub.title}
              </p>
              <p className={`text-label-sm truncate ${sub.status === 'demo_day' ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
                {sub.company}
              </p>
              {sub.aiScore && (
                <p className={`mt-1 text-label-sm font-medium ${sub.status === 'demo_day' ? 'text-on-primary/80' : 'text-primary'}`}>
                  AI Score: {sub.aiScore.overall}/100
                </p>
              )}
              {sub.status === 'finalist' && (
                <button
                  onClick={() => confirmDemoDay(sub.id)}
                  className="mt-2 w-full rounded-md bg-primary/10 px-2 py-1 text-label-sm font-medium text-primary hover:bg-primary/20 transition-colors text-center"
                >
                  Confirm for Demo Day
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Eligible to shortlist */}
      {eligible.length > 0 && !isFull && (
        <div>
          <p className="mb-2 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
            Eligible for Finalist Selection ({eligible.length} approved)
          </p>
          <div className="space-y-2">
            {eligible.slice(0, 4).map(sub => (
              <div key={sub.id} className="flex items-center gap-3 rounded-lg bg-surface-container-lowest p-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-label-md font-medium text-on-surface truncate">{sub.title}</p>
                  <p className="text-label-sm text-on-surface-variant">{sub.company}</p>
                </div>
                {sub.aiScore && (
                  <span className="flex-shrink-0 text-label-sm font-bold text-secondary">
                    {sub.aiScore.overall}/100
                  </span>
                )}
                <button
                  onClick={() => markFinalist(sub.id)}
                  className="flex-shrink-0 rounded-md bg-primary/10 px-3 py-1.5 text-label-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
                >
                  Select
                </button>
              </div>
            ))}
            {eligible.length > 4 && (
              <p className="text-label-sm text-on-surface-variant/60 pl-1">
                +{eligible.length - 4} more approved submissions
              </p>
            )}
          </div>
        </div>
      )}

      {finalists.length === 0 && eligible.length === 0 && (
        <p className="text-body-sm text-on-surface-variant py-2">
          No approved submissions available for finalist selection yet.
        </p>
      )}
    </Card>
  )
}

// ─── ADMIN DASHBOARD ────────────────────────────────────────────────────────
function AdminDashboard() {
  const submissions = useAppStore(s => s.submissions)
  const complianceResults = useAppStore(s => s.complianceResults)
  const pilots = useAppStore(s => s.pilots)

  const total = submissions.length
  const approved = submissions.filter(s => ['approved', 'pilot', 'procurement'].includes(s.status)).length
  const inPilot = submissions.filter(s => s.status === 'pilot').length
  const totalValue = submissions.filter(s => !['rejected', 'archived'].includes(s.status))
    .reduce((s, sub) => s + sub.estimatedValue, 0)
  const approvalRate = Math.round((approved / total) * 100)
  const pilotConversion = Math.round((pilots.filter(p => p.status === 'completed').length / Math.max(1, approved)) * 100)
  const avgScore = Math.round(
    submissions.filter(s => s.aiScore).reduce((s, sub) => s + (sub.aiScore?.overall ?? 0), 0) /
    Math.max(1, submissions.filter(s => s.aiScore).length)
  )

  const compliancePassed = complianceResults.filter(c => c.status === 'passed').length
  const complianceHealth = Math.round((compliancePassed / Math.max(1, complianceResults.length)) * 100)

  // Category heatmap data
  const categoryCounts = submissions.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1
    return acc
  }, {})
  const heatmapData = Object.entries(categoryCounts)
    .map(([cat, count]) => ({ name: getCategoryLabel(cat), count, color: CATEGORY_COLORS[cat] ?? '#747688' }))
    .sort((a, b) => b.count - a.count)

  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Submissions" value={total} change={23} trend="up" icon={<FileText />} accent="primary" />
        <StatCard label="Pipeline Value" value={formatAED(totalValue)} change={18} trend="up" icon={<TrendingUp />} accent="secondary" gradient />
        <StatCard label="Approval Rate" value={`${approvalRate}%`} change={4} trend="up" icon={<CheckCircle2 />} accent="primary" />
        <StatCard label="Active Pilots" value={inPilot} change={0} trend="flat" icon={<FlaskConical />} accent="secondary" />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Avg AI Score', value: `${avgScore}/100`, sub: '+5 vs last month', color: 'text-primary' },
          { label: 'Pilot Conversion', value: `${pilotConversion}%`, sub: 'From approved to pilot', color: 'text-secondary' },
          { label: 'Compliance Health', value: `${complianceHealth}%`, sub: `${compliancePassed}/${complianceResults.length} reviews passed`, color: 'text-secondary' },
          { label: 'Time to Evaluate', value: '3.2 days', sub: 'Avg AI + human review', color: 'text-on-surface' },
        ].map(item => (
          <Card key={item.label} padding="sm">
            <p className="text-label-sm text-on-surface-variant">{item.label}</p>
            <p className={`mt-0.5 text-title-lg font-bold ${item.color}`}>{item.value}</p>
            <p className="text-label-sm text-on-surface-variant/60 mt-0.5">{item.sub}</p>
          </Card>
        ))}
      </div>

      {/* Finalists panel */}
      <FinalistsPanel />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader actions={
              <Link href="/submissions">
                <Button variant="ghost" size="sm" icon={<ArrowRight />} iconPosition="right">View All</Button>
              </Link>
            }>
              <CardTitle subtitle="Monthly submission and approval trends">Submission Pipeline</CardTitle>
            </CardHeader>
            <ClientOnly fallback={<div className="h-[200px] bg-surface-container rounded animate-pulse" />}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={submissionTrendData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#003d9b" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#003d9b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#006a6a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#006a6a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#434654' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#434654' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(195,198,214,0.2)', borderRadius: '8px', fontSize: '12px' }} cursor={{ stroke: 'rgba(195,198,214,0.3)' }} />
                  <Area type="monotone" dataKey="submissions" stroke="#003d9b" strokeWidth={2} fill="url(#subGrad)" name="Submitted" />
                  <Area type="monotone" dataKey="approved" stroke="#006a6a" strokeWidth={2} fill="url(#appGrad)" name="Approved" />
                </AreaChart>
              </ResponsiveContainer>
            </ClientOnly>
          </Card>
        </div>

        <Card>
          <CardTitle subtitle="Sector innovation heatmap">By Category</CardTitle>
          <div className="mt-3 space-y-2">
            {heatmapData.map(item => (
              <div key={item.name}>
                <div className="flex justify-between text-label-sm mb-0.5">
                  <span className="text-on-surface-variant">{item.name}</span>
                  <span className="font-medium text-on-surface">{item.count}</span>
                </div>
                <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(item.count / total) * 100}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI override trends + compliance + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardTitle subtitle="Human vs AI decision alignment">AI Override Trends</CardTitle>
          <ClientOnly fallback={<div className="h-[160px] bg-surface-container rounded animate-pulse mt-3" />}>
            <div className="mt-3">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={overrideTrendData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#434654' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#434654' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(195,198,214,0.2)', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="aligned" fill="#006a6a" radius={[3, 3, 0, 0]} name="Aligned" stackId="a" />
                  <Bar dataKey="overridden" fill="#b45309" radius={[3, 3, 0, 0]} name="Overridden" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary" /><span className="text-label-sm text-on-surface-variant">AI Aligned</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning" /><span className="text-label-sm text-on-surface-variant">Overridden</span></div>
              </div>
            </div>
          </ClientOnly>
        </Card>

        <Card>
          <CardTitle subtitle="Current compliance pipeline">Compliance Health</CardTitle>
          <div className="mt-3 space-y-3">
            {[
              { label: 'Passed', count: complianceResults.filter(c => c.status === 'passed').length, color: 'bg-secondary', textColor: 'text-secondary' },
              { label: 'In Progress', count: complianceResults.filter(c => c.status === 'in_progress').length, color: 'bg-warning', textColor: 'text-warning' },
              { label: 'Conditional', count: complianceResults.filter(c => c.status === 'conditional').length, color: 'bg-primary', textColor: 'text-primary' },
              { label: 'Failed', count: complianceResults.filter(c => c.status === 'failed').length, color: 'bg-error', textColor: 'text-error' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-label-sm mb-0.5">
                    <span className="text-on-surface-variant">{item.label}</span>
                    <span className={`font-bold ${item.textColor}`}>{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.count / Math.max(1, complianceResults.length)) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/compliance" className="block mt-4">
            <Button variant="ghost" size="sm" className="w-full" icon={<ArrowRight />} iconPosition="right">View Compliance Hub</Button>
          </Link>
        </Card>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader actions={
              <Link href="/submissions">
                <Button variant="ghost" size="sm" icon={<ArrowRight />} iconPosition="right">All</Button>
              </Link>
            }>
              <CardTitle subtitle="Most recently updated">Recent Activity</CardTitle>
            </CardHeader>
            <div className="space-y-0">
              {recentSubmissions.map((sub, idx) => (
                <Link key={sub.id} href={`/submissions/${sub.id}`}>
                  <div className={`flex items-center gap-3 py-2.5 table-row-hover rounded-lg px-2 -mx-2 ${idx < recentSubmissions.length - 1 ? 'border-b border-outline-variant/10' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-title-sm text-on-surface truncate">{sub.title}</p>
                      <p className="text-label-sm text-on-surface-variant">{sub.company}</p>
                    </div>
                    <StatusBadge status={getSubmissionStatusConfig(sub.status)} />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── EVALUATOR DASHBOARD ─────────────────────────────────────────────────────
function EvaluatorDashboard() {
  const submissions = useAppStore(s => s.submissions)
  const runningAIEvaluation = useAppStore(s => s.runningAIEvaluation)
  const startAIEvaluation = useAppStore(s => s.startAIEvaluation)

  const pendingAI = submissions.filter(s => s.status === 'submitted')
  const inEvaluation = submissions.filter(s => s.status === 'evaluation')
  const scored = submissions.filter(s => s.aiScore)
  const avgScore = Math.round(scored.reduce((s, sub) => s + (sub.aiScore?.overall ?? 0), 0) / Math.max(1, scored.length))
  const recommended = scored.filter(s => s.aiScore?.recommendation === 'approve').length

  const topQueue = [...submissions]
    .filter(s => s.status !== 'rejected' && s.status !== 'archived')
    .sort((a, b) => {
      if (a.status === 'evaluation' && b.status !== 'evaluation') return -1
      if (b.status === 'evaluation' && a.status !== 'evaluation') return 1
      if (a.aiScore && b.aiScore) return b.aiScore.overall - a.aiScore.overall
      if (a.aiScore) return 1
      return -1
    })
    .slice(0, 6)

  const scoreDistribution = scored
    .map(s => ({ name: s.company.split(' ')[0], score: s.aiScore!.overall, rec: s.aiScore!.recommendation }))
    .sort((a, b) => b.score - a.score)

  const sectorCounts = submissions.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1
    return acc
  }, {})
  const topSectors = Object.entries(sectorCounts)
    .map(([cat, count]) => ({ name: getCategoryLabel(cat), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Awaiting AI Review" value={pendingAI.length} change={0} trend="flat" icon={<Bot />} accent="primary" />
        <StatCard label="In Human Evaluation" value={inEvaluation.length} change={0} trend="flat" icon={<Users />} accent="secondary" />
        <StatCard label="Avg AI Score" value={`${avgScore}/100`} change={5} trend="up" icon={<Brain />} accent="primary" />
        <StatCard label="AI Recommended" value={recommended} change={2} trend="up" icon={<CheckCircle2 />} accent="secondary" gradient />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI-Ranked Queue */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h2 className="text-title-md font-semibold text-on-surface">Priority Queue</h2>
            <span className="badge ml-auto bg-primary/10 text-primary">{topQueue.length}</span>
          </div>

          {topQueue.map(sub => {
            const isRunning = runningAIEvaluation === sub.id
            const statusCfg = getSubmissionStatusConfig(sub.status)
            return (
              <div key={sub.id} className="bg-surface-container-lowest shadow-ambient rounded-lg p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link href={`/submissions/${sub.id}`} className="flex-1 min-w-0">
                    <p className="text-title-sm text-on-surface truncate leading-snug hover:text-primary transition-colors">{sub.title}</p>
                    <p className="text-label-sm text-on-surface-variant mt-0.5">{sub.company}</p>
                  </Link>
                  {sub.aiScore ? (
                    <span className={`flex-shrink-0 font-display text-headline-sm font-bold ${getScoreColor(sub.aiScore.overall)}`}>
                      {sub.aiScore.overall}
                    </span>
                  ) : isRunning ? (
                    <Bot className="w-4 h-4 text-primary animate-pulse flex-shrink-0" />
                  ) : null}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={statusCfg} />
                  <span className="text-label-sm text-on-surface-variant">{getCategoryLabel(sub.category)}</span>
                </div>
                {sub.status === 'submitted' && !sub.aiScore && (
                  <Button
                    size="sm"
                    icon={<Play />}
                    loading={isRunning}
                    onClick={() => startAIEvaluation(sub.id)}
                    className="w-full mt-2"
                  >
                    {isRunning ? 'Evaluating...' : 'Run AI Evaluation'}
                  </Button>
                )}
              </div>
            )
          })}

          <Link href="/ai-evaluation">
            <Button variant="secondary" className="w-full" icon={<ArrowRight />} iconPosition="right">
              Open AI Evaluation Hub
            </Button>
          </Link>
        </div>

        {/* Score distribution + top sectors */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardTitle subtitle="AI scores across all evaluated submissions">Score Distribution</CardTitle>
            <ClientOnly fallback={<div className="h-[200px] bg-surface-container rounded animate-pulse mt-3" />}>
              <div className="mt-3">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={scoreDistribution} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#434654' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#434654' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid rgba(195,198,214,0.2)', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]} name="AI Score">
                      {scoreDistribution.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={entry.rec === 'approve' ? '#006a6a' : entry.rec === 'review' ? '#b45309' : '#ba1a1a'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-1">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary" /><span className="text-label-sm text-on-surface-variant">Approve</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning" /><span className="text-label-sm text-on-surface-variant">Review</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-error" /><span className="text-label-sm text-on-surface-variant">Reject</span></div>
                </div>
              </div>
            </ClientOnly>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardTitle subtitle="Submissions by category">Top Sectors</CardTitle>
              <div className="mt-3 space-y-2">
                {topSectors.map((sector, idx) => (
                  <div key={sector.name} className="flex items-center gap-3">
                    <span className="text-label-sm text-on-surface-variant w-4 text-right">{idx + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-label-sm mb-0.5">
                        <span className="text-on-surface">{sector.name}</span>
                        <span className="font-medium text-on-surface">{sector.count}</span>
                      </div>
                      <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(sector.count / submissions.length) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardTitle subtitle="Simulated performance metrics">Turnaround Metrics</CardTitle>
              <div className="mt-3 space-y-3">
                {[
                  { label: 'Avg AI Review Time', value: '2.5 min', sub: 'Fully automated' },
                  { label: 'Avg Human Review', value: '1.8 days', sub: 'After AI scoring' },
                  { label: 'Total Pipeline Time', value: '3.2 days', sub: 'Submission to decision' },
                  { label: 'SLA Compliance', value: '94%', sub: 'Within 5-day target' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-1 border-b border-outline-variant/10 last:border-0">
                    <div>
                      <p className="text-label-md text-on-surface">{item.label}</p>
                      <p className="text-label-sm text-on-surface-variant/60">{item.sub}</p>
                    </div>
                    <span className="text-title-sm font-bold text-primary">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── COMPLIANCE DASHBOARD ────────────────────────────────────────────────────
function ComplianceDashboard() {
  const submissions = useAppStore(s => s.submissions)
  const complianceResults = useAppStore(s => s.complianceResults)

  const pendingValidation = submissions.filter(s => s.status === 'compliance_check')
  const blockedItems = complianceResults.filter(c => c.status === 'failed')
  const conditional = complianceResults.filter(c => c.status === 'conditional')
  const passed = complianceResults.filter(c => c.status === 'passed')
  const inProgress = complianceResults.filter(c => c.status === 'in_progress')

  const suspendedVendors = vendors.filter(v => v.status === 'suspended' || v.status === 'blacklisted')
  const pendingVendors = vendors.filter(v => v.status === 'pending')

  // Check pass/fail/warning counts across all checks
  const allChecks = complianceResults.flatMap(c => c.checks)
  const checkCategoryBreakdown = allChecks.reduce<Record<string, { pass: number; fail: number; warning: number }>>((acc, chk) => {
    if (!acc[chk.category]) acc[chk.category] = { pass: 0, fail: 0, warning: 0 }
    if (chk.status === 'pass') acc[chk.category].pass++
    else if (chk.status === 'fail') acc[chk.category].fail++
    else if (chk.status === 'warning') acc[chk.category].warning++
    return acc
  }, {})

  const categoryLabels: Record<string, string> = {
    data_privacy: 'Data Privacy', cybersecurity: 'Cybersecurity', financial: 'Financial',
    legal: 'Legal', operational: 'Operational', environmental: 'Environmental',
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Pending Validation" value={pendingValidation.length} change={0} trend="flat" icon={<Clock />} accent="primary" />
        <StatCard label="Passed Reviews" value={passed.length} change={1} trend="up" icon={<CheckCircle2 />} accent="secondary" gradient />
        <StatCard label="In Progress" value={inProgress.length} change={0} trend="flat" icon={<CircleDot />} accent="primary" />
        <StatCard label="Vendor Alerts" value={suspendedVendors.length + pendingVendors.length} change={0} trend="flat" icon={<AlertTriangle />} accent="secondary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending validation queue */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h2 className="text-title-md font-semibold text-on-surface">Pending Validation</h2>
            <span className={`badge ml-auto ${pendingValidation.length > 0 ? 'bg-warning-container text-warning' : 'bg-secondary-container text-secondary'}`}>
              {pendingValidation.length}
            </span>
          </div>

          {pendingValidation.length === 0 ? (
            <Card className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-secondary mx-auto mb-2" />
              <p className="text-body-md text-on-surface-variant">All clear — no pending validations</p>
            </Card>
          ) : (
            pendingValidation.map(sub => {
              const compResult = complianceResults.find(c => c.submissionId === sub.id)
              return (
                <Link key={sub.id} href={`/submissions/${sub.id}`}>
                  <div className="bg-surface-container-lowest shadow-ambient rounded-lg p-3 hover:bg-surface-container transition-colors">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-title-sm text-on-surface truncate">{sub.title}</p>
                        <p className="text-label-sm text-on-surface-variant">{sub.company}</p>
                      </div>
                      {compResult && (
                        <span className={`badge flex-shrink-0 capitalize ${compResult.overallRisk === 'low' ? 'bg-secondary-container text-secondary' : compResult.overallRisk === 'medium' ? 'bg-warning-container text-warning' : 'bg-error-container text-error'}`}>
                          {compResult.overallRisk} risk
                        </span>
                      )}
                    </div>
                    {compResult && (
                      <div className="mt-2 grid grid-cols-3 gap-1 text-center">
                        <div className="bg-secondary-container/50 rounded p-1">
                          <p className="text-label-sm font-bold text-secondary">{compResult.checks.filter(c => c.status === 'pass').length}</p>
                          <p className="text-label-sm text-on-surface-variant">Pass</p>
                        </div>
                        <div className="bg-warning-container/50 rounded p-1">
                          <p className="text-label-sm font-bold text-warning">{compResult.checks.filter(c => c.status === 'warning').length}</p>
                          <p className="text-label-sm text-on-surface-variant">Warn</p>
                        </div>
                        <div className="bg-surface-container rounded p-1">
                          <p className="text-label-sm font-bold text-on-surface-variant">{compResult.checks.filter(c => c.status === 'pending').length}</p>
                          <p className="text-label-sm text-on-surface-variant">Pending</p>
                        </div>
                      </div>
                    )}
                    <p className="text-label-sm text-on-surface-variant/60 mt-2">
                      Sent {formatRelativeTime(sub.updatedAt)}
                    </p>
                  </div>
                </Link>
              )
            })
          )}

          <Link href="/compliance">
            <Button variant="secondary" className="w-full" icon={<ArrowRight />} iconPosition="right">
              Compliance Hub
            </Button>
          </Link>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Check category breakdown */}
          <Card>
            <CardTitle subtitle="Pass/warning rates by regulation category">Compliance Check Breakdown</CardTitle>
            <div className="mt-3 space-y-3">
              {Object.entries(checkCategoryBreakdown).map(([cat, counts]) => {
                const total = counts.pass + counts.fail + counts.warning
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-label-md text-on-surface">{categoryLabels[cat] ?? cat}</p>
                      <div className="flex gap-2">
                        {counts.pass > 0 && <span className="badge bg-secondary-container text-secondary">{counts.pass} pass</span>}
                        {counts.warning > 0 && <span className="badge bg-warning-container text-warning">{counts.warning} warn</span>}
                        {counts.fail > 0 && <span className="badge bg-error-container text-error">{counts.fail} fail</span>}
                      </div>
                    </div>
                    <div className="h-1.5 bg-surface-container rounded-full overflow-hidden flex">
                      <div className="bg-secondary h-full" style={{ width: `${(counts.pass / total) * 100}%` }} />
                      <div className="bg-warning h-full" style={{ width: `${(counts.warning / total) * 100}%` }} />
                      <div className="bg-error h-full" style={{ width: `${(counts.fail / total) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Vendor compliance alerts */}
          <Card>
            <CardHeader actions={
              <Link href="/vendors"><Button variant="ghost" size="sm" icon={<ArrowRight />} iconPosition="right">View Registry</Button></Link>
            }>
              <CardTitle subtitle="Vendors requiring attention">Vendor Compliance Alerts</CardTitle>
            </CardHeader>
            {suspendedVendors.length === 0 && pendingVendors.length === 0 ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-secondary mx-auto mb-2" />
                <p className="text-body-sm text-on-surface-variant">No vendor alerts at this time</p>
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {suspendedVendors.map(vendor => (
                  <div key={vendor.id} className="flex items-center gap-3 p-2.5 bg-error-container/30 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-error flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-label-md font-medium text-on-surface">{vendor.name}</p>
                      <p className="text-label-sm text-on-surface-variant capitalize">{vendor.status} — requires review</p>
                    </div>
                    <span className="badge bg-error-container text-error capitalize">{vendor.status}</span>
                  </div>
                ))}
                {pendingVendors.map(vendor => (
                  <div key={vendor.id} className="flex items-center gap-3 p-2.5 bg-warning-container/40 rounded-lg">
                    <Clock className="w-4 h-4 text-warning flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-label-md font-medium text-on-surface">{vendor.name}</p>
                      <p className="text-label-sm text-on-surface-variant">Pending registration validation</p>
                    </div>
                    <span className="badge bg-warning-container text-warning">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Conditional approvals */}
          {conditional.length > 0 && (
            <Card className="border-l-4 border-l-warning">
              <CardTitle subtitle="Items with outstanding conditions">Conditional Approvals</CardTitle>
              <div className="mt-3 space-y-3">
                {conditional.map(comp => {
                  const sub = submissions.find(s => s.id === comp.submissionId)
                  return (
                    <div key={comp.id}>
                      <p className="text-title-sm text-on-surface">{sub?.title ?? comp.submissionId}</p>
                      {comp.conditions?.map((cond, i) => (
                        <p key={i} className="text-body-sm text-on-surface-variant mt-1 flex gap-1.5">
                          <span className="text-warning mt-0.5">·</span>{cond}
                        </p>
                      ))}
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── STARTUP DASHBOARD ────────────────────────────────────────────────────────
// In demo mode, the startup user "owns" these two submissions
const MY_SUBMISSION_IDS = ['sub-006', 'sub-008']

function StartupDashboard() {
  const submissions = useAppStore(s => s.submissions)

  const mySubmissions = submissions.filter(s => MY_SUBMISSION_IDS.includes(s.id))
  const total = mySubmissions.length
  const pending = mySubmissions.filter(s => ['submitted', 'ai_review'].includes(s.status)).length
  const inReview = mySubmissions.filter(s => ['evaluation', 'compliance_check'].includes(s.status)).length
  const approved = mySubmissions.filter(s => ['approved', 'pilot', 'procurement'].includes(s.status)).length

  const WORKFLOW_STEPS: Record<string, number> = {
    draft: 0, submitted: 1, ai_review: 2, evaluation: 3,
    compliance_check: 4, approved: 5, pilot: 6, procurement: 7,
  }
  const WORKFLOW_LABELS = ['Draft', 'Submitted', 'AI Review', 'Evaluation', 'Compliance', 'Approved', 'Pilot', 'Procurement']

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <Card className="bg-power-gradient text-on-primary">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-headline-sm text-on-primary">Welcome back, Nour</h2>
            <p className="text-body-sm text-on-primary/70 mt-1">
              You have {pending} submission{pending !== 1 ? 's' : ''} awaiting AI review.
            </p>
          </div>
          <Link href="/submissions/new">
            <Button variant="secondary" className="border-on-primary/30 text-on-primary hover:bg-on-primary/10 flex-shrink-0">
              + New Submission
            </Button>
          </Link>
        </div>
      </Card>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="My Submissions" value={total} change={0} trend="flat" icon={<FileText />} accent="primary" />
        <StatCard label="Pending Review" value={pending} change={0} trend="flat" icon={<Clock />} accent="primary" />
        <StatCard label="In Progress" value={inReview + approved} change={0} trend="up" icon={<TrendingUp />} accent="secondary" gradient />
      </div>

      {/* Submissions with progress tracker */}
      <div className="space-y-4">
        <h2 className="text-title-md font-semibold text-on-surface">My Submissions</h2>
        {mySubmissions.length === 0 ? (
          <Card className="text-center py-12">
            <FileText className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3" />
            <p className="text-body-md text-on-surface-variant">You haven't submitted anything yet.</p>
            <Link href="/submissions/new" className="mt-4 inline-block">
              <Button>Submit Your Innovation</Button>
            </Link>
          </Card>
        ) : (
          mySubmissions.map(sub => {
            const statusCfg = getSubmissionStatusConfig(sub.status)
            const currentStep = WORKFLOW_STEPS[sub.status] ?? 0
            const hasAI = !!sub.aiScore

            return (
              <Link key={sub.id} href={`/submissions/${sub.id}`}>
                <Card className="hover:shadow-ambient-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <StatusBadge status={statusCfg} />
                        <span className="text-label-sm text-on-surface-variant">{getCategoryLabel(sub.category)}</span>
                        <span className="text-label-sm text-on-surface-variant">TRL {sub.trl}</span>
                      </div>
                      <h3 className="font-display text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                        {sub.title}
                      </h3>
                      <p className="text-body-sm text-on-surface-variant mt-1 line-clamp-2">{sub.description}</p>
                    </div>
                    {hasAI && sub.aiScore && (
                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center ${getScoreBg(sub.aiScore.overall)}`}>
                        <span className={`font-display text-title-lg font-bold ${getScoreColor(sub.aiScore.overall)}`}>
                          {sub.aiScore.overall}
                        </span>
                        <span className="text-label-sm text-on-surface-variant">AI</span>
                      </div>
                    )}
                  </div>

                  {/* Workflow progress */}
                  <div className="mt-4 pt-4 border-t border-outline-variant/10">
                    <div className="flex items-center gap-0">
                      {WORKFLOW_LABELS.slice(1).map((label, idx) => {
                        const stepNum = idx + 1
                        const isComplete = currentStep > stepNum
                        const isActive = currentStep === stepNum
                        const isLast = idx === WORKFLOW_LABELS.length - 2
                        return (
                          <div key={label} className={`flex items-center ${!isLast ? 'flex-1' : ''}`}>
                            <div className="flex flex-col items-center">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-label-sm font-bold flex-shrink-0 ${isComplete ? 'bg-secondary text-on-secondary' : isActive ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                                {isComplete ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-[9px]">{stepNum}</span>}
                              </div>
                              <span className={`text-[10px] mt-0.5 hidden sm:block text-center leading-tight ${isActive ? 'text-primary font-semibold' : isComplete ? 'text-secondary' : 'text-on-surface-variant/50'}`}>
                                {label}
                              </span>
                            </div>
                            {!isLast && (
                              <div className={`h-0.5 flex-1 mx-0.5 mb-3 sm:mb-5 ${isComplete ? 'bg-secondary' : 'bg-surface-container'}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* AI feedback summary */}
                  {hasAI && sub.aiScore && (
                    <div className={`mt-3 p-2.5 rounded-lg ${sub.aiScore.recommendation === 'approve' ? 'bg-secondary-container/50' : sub.aiScore.recommendation === 'review' ? 'bg-warning-container/50' : 'bg-error-container/50'}`}>
                      <div className="flex items-center gap-2">
                        <Brain className="w-3.5 h-3.5 text-on-surface-variant flex-shrink-0" />
                        <p className="text-label-sm text-on-surface">
                          <span className="font-semibold">AI Score {sub.aiScore.overall}/100 · </span>
                          {sub.aiScore.recommendation === 'approve' ? 'Recommended for approval' : sub.aiScore.recommendation === 'review' ? 'Under additional review' : 'Not recommended at this stage'}
                          {' '}· {Math.round(sub.aiScore.confidence * 100)}% confidence
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rejection feedback */}
                  {sub.feedback && (
                    <div className="mt-3 p-2.5 rounded-lg bg-error-container/40">
                      <p className="text-label-sm font-semibold text-error mb-1">Feedback from Evaluator</p>
                      <p className="text-body-sm text-on-surface-variant line-clamp-2">{sub.feedback}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-label-sm text-on-surface-variant">
                      Submitted {formatDate(sub.submittedAt)} · Updated {formatRelativeTime(sub.updatedAt)}
                    </p>
                    <div className="flex items-center gap-1 text-primary">
                      <span className="text-label-sm font-medium">View details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })
        )}
      </div>

      {/* Tips / pending actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <p className="text-title-sm text-on-surface">Pending Actions</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-warning-container/40 rounded-md">
              <Clock className="w-3.5 h-3.5 text-warning flex-shrink-0" />
              <p className="text-label-sm text-on-surface">EduScale awaiting AI evaluation</p>
            </div>
            <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-md">
              <Brain className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <p className="text-label-sm text-on-surface">SmartGrid currently in AI review</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-secondary" />
            </div>
            <p className="text-title-sm text-on-surface">What happens next?</p>
          </div>
          <div className="space-y-2 text-body-sm text-on-surface-variant">
            <p>1. AI engine scores your submission across 6 dimensions.</p>
            <p>2. An evaluator reviews the AI recommendation.</p>
            <p>3. If shortlisted, compliance validation begins.</p>
            <p>4. Approved submissions move to pilot and procurement.</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── ROOT PAGE ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { currentRole } = useRole()

  const title: Record<string, { heading: string; sub: string }> = {
    admin: { heading: 'Platform Overview', sub: 'Executive governance and ecosystem metrics' },
    evaluator: { heading: 'Evaluation Center', sub: 'AI-ranked queue and scoring analytics' },
    compliance: { heading: 'Compliance Center', sub: 'Validation pipeline and regulatory health' },
    startup: { heading: 'My Portal', sub: 'Track your submissions and review AI feedback' },
  }

  const { heading, sub } = title[currentRole] ?? title.admin

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-display-sm text-on-surface">{heading}</h1>
          <p className="text-body-lg text-on-surface-variant mt-1">{sub}</p>
        </div>

        {currentRole === 'admin' && <AdminDashboard />}
        {currentRole === 'evaluator' && <EvaluatorDashboard />}
        {currentRole === 'compliance' && <ComplianceDashboard />}
        {currentRole === 'startup' && <StartupDashboard />}
      </div>
    </AppShell>
  )
}
