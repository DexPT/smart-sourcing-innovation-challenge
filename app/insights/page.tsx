'use client'
import { useMemo } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { useAppStore } from '@/store/appStore'
import { formatAED } from '@/lib/utils'
import { BarChart3, TrendingUp, Target, Zap, Download, Clock, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { ClientOnly } from '@/components/ui/ClientOnly'

// ─── constants ───────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  ai_ml: 'AI & ML',
  fintech: 'FinTech',
  healthtech: 'HealthTech',
  logistics: 'Logistics',
  sustainability: 'Sustainability',
  edtech: 'EdTech',
  cybersecurity: 'Cybersecurity',
  smart_city: 'Smart City',
  iot: 'IoT',
}

const FUNNEL_STAGES = [
  'submitted', 'ai_review', 'evaluation', 'compliance_check', 'approved', 'pilot', 'procurement',
] as const

const FUNNEL_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  ai_review: 'AI Review',
  evaluation: 'Evaluation',
  compliance_check: 'Compliance',
  approved: 'Approved',
  pilot: 'Pilot',
  procurement: 'Procurement',
}

const FUNNEL_COLORS = ['#c3c6d6', '#0c56d0', '#003d9b', '#434655', '#1a6b6b', '#00897b', '#004d40']

const monthlyData = [
  { month: 'Oct 25', submissions: 4, evaluations: 3, pilots: 1, value: 8200000 },
  { month: 'Nov 25', submissions: 6, evaluations: 5, pilots: 1, value: 15400000 },
  { month: 'Dec 25', submissions: 5, evaluations: 4, pilots: 2, value: 12100000 },
  { month: 'Jan 26', submissions: 9, evaluations: 8, pilots: 2, value: 28500000 },
  { month: 'Feb 26', submissions: 8, evaluations: 7, pilots: 2, value: 22000000 },
  { month: 'Mar 26', submissions: 12, evaluations: 10, pilots: 3, value: 45000000 },
  { month: 'Apr 26', submissions: 8, evaluations: 5, pilots: 2, value: 18200000 },
]

// ─── custom tooltip ──────────────────────────────────────────
const ChartTooltip = {
  contentStyle: {
    background: '#fff',
    border: '1px solid rgba(195,198,214,0.2)',
    borderRadius: '8px',
    fontSize: '12px',
  },
}

export default function InsightsPage() {
  const submissions = useAppStore(s => s.submissions)
  const pilots = useAppStore(s => s.pilots)

  // ── derived stats ──
  const totalValue = useMemo(
    () => submissions
      .filter(s => !['rejected', 'archived'].includes(s.status))
      .reduce((sum, s) => sum + s.estimatedValue, 0),
    [submissions]
  )

  const avgScore = useMemo(() => {
    const scored = submissions.filter(s => s.aiScore)
    if (scored.length === 0) return 0
    return Math.round(scored.reduce((sum, s) => sum + (s.aiScore?.overall ?? 0), 0) / scored.length)
  }, [submissions])

  const avgTimeToEvalDays = useMemo(() => {
    const evaluated = submissions.filter(s => s.aiScore?.generatedAt && s.submittedAt)
    if (evaluated.length === 0) return null
    const total = evaluated.reduce((sum, s) => {
      const diff = new Date(s.aiScore!.generatedAt!).getTime() - new Date(s.submittedAt).getTime()
      return sum + diff / (1000 * 60 * 60 * 24)
    }, 0)
    return Math.round(total / evaluated.length)
  }, [submissions])

  // ── sector heatmap ──
  const sectorData = useMemo(() => {
    const map = new Map<string, { count: number; totalScore: number; scored: number }>()
    submissions.forEach(s => {
      const label = CATEGORY_LABELS[s.category] ?? s.category
      const existing = map.get(label) ?? { count: 0, totalScore: 0, scored: 0 }
      map.set(label, {
        count: existing.count + 1,
        totalScore: existing.totalScore + (s.aiScore?.overall ?? 0),
        scored: existing.scored + (s.aiScore ? 1 : 0),
      })
    })
    return Array.from(map.entries())
      .map(([category, { count, totalScore, scored }]) => ({
        category,
        count,
        avgScore: scored > 0 ? Math.round(totalScore / scored) : 0,
      }))
      .sort((a, b) => b.count - a.count)
  }, [submissions])

  // ── approval funnel ──
  const funnelData = useMemo(() => {
    const BEYOND: Record<string, string[]> = {
      submitted:        ['submitted', 'ai_review', 'evaluation', 'compliance_check', 'approved', 'pilot', 'procurement'],
      ai_review:        ['ai_review', 'evaluation', 'compliance_check', 'approved', 'pilot', 'procurement'],
      evaluation:       ['evaluation', 'compliance_check', 'approved', 'pilot', 'procurement'],
      compliance_check: ['compliance_check', 'approved', 'pilot', 'procurement'],
      approved:         ['approved', 'pilot', 'procurement'],
      pilot:            ['pilot', 'procurement'],
      procurement:      ['procurement'],
    }
    return FUNNEL_STAGES.map((stage, idx) => ({
      stage: FUNNEL_LABELS[stage],
      count: submissions.filter(s => BEYOND[stage].includes(s.status)).length,
      color: FUNNEL_COLORS[idx],
    }))
  }, [submissions])

  // ── AI decision breakdown ──
  const aiDecisionData = useMemo(() => {
    let overrides = 0, aligned = 0, pending = 0
    submissions.forEach(s => {
      if (!s.aiScore) return
      const hasDecision = s.timeline?.some(t => t.type === 'decision')
      const hasOverride = s.timeline?.some(
        t => t.type === 'decision' && t.title.toLowerCase().includes('override')
      )
      if (!hasDecision) pending++
      else if (hasOverride) overrides++
      else aligned++
    })
    return [
      { name: 'AI-Aligned', value: aligned, color: '#006a6a' },
      { name: 'Overridden', value: overrides, color: '#b45309' },
      { name: 'Pending Decision', value: pending, color: '#c3c6d6' },
    ]
  }, [submissions])

  const totalAiDecisions = aiDecisionData.reduce((s, d) => s + d.value, 0)
  const overrideRate = totalAiDecisions > 0
    ? Math.round((aiDecisionData.find(d => d.name === 'Overridden')?.value ?? 0) / totalAiDecisions * 100)
    : 0

  // ── pilot conversion ──
  const pilotStats = useMemo(() => {
    const completed = pilots.filter(p => p.status === 'completed')
    const proceed = completed.filter(p => p.recommendation === 'proceed')
    const modify = completed.filter(p => p.recommendation === 'modify')
    const terminate = completed.filter(p => p.recommendation === 'terminate')
    const rate = completed.length > 0 ? Math.round((proceed.length / completed.length) * 100) : 0
    return { completed: completed.length, proceed: proceed.length, modify: modify.length, terminate: terminate.length, rate }
  }, [pilots])

  const pilotDonutData = [
    { name: 'Proceed', value: pilotStats.proceed, color: '#006a6a' },
    { name: 'Modify', value: pilotStats.modify, color: '#b45309' },
    { name: 'Terminate', value: pilotStats.terminate, color: '#ba1a1a' },
    { name: 'Active / Planned', value: Math.max(0, pilots.length - pilotStats.completed), color: '#c3c6d6' },
  ].filter(d => d.value > 0)

  return (
    <AppShell>
      <div className="space-y-6">
        {/* ── header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-body-md text-on-surface-variant">April 2026 · Year to Date</p>
          <Button variant="secondary" size="sm" icon={<Download />} className="w-full sm:w-auto">
            Export Report
          </Button>
        </div>

        {/* ── stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Pipeline Value"
            value={formatAED(totalValue)}
            change={38} trend="up"
            icon={<TrendingUp />}
            accent="primary" gradient
          />
          <StatCard
            label="Submissions YTD"
            value={submissions.length}
            change={23} trend="up"
            icon={<BarChart3 />}
            accent="secondary"
          />
          <StatCard
            label="Avg AI Score"
            value={avgScore}
            unit="/100"
            change={5} trend="up"
            icon={<Zap />}
            accent="primary"
          />
          <StatCard
            label="Avg Time to AI Eval"
            value={avgTimeToEvalDays ?? '—'}
            unit={avgTimeToEvalDays != null ? ' days' : ''}
            icon={<Clock />}
            accent="secondary"
          />
        </div>

        {/* ── row 1: activity + sector heatmap ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle subtitle="Monthly activity across pipeline stages">Submission Activity</CardTitle>
            </CardHeader>
            <ClientOnly fallback={<div className="h-[220px] animate-pulse rounded bg-surface-container" />}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="areaSubmit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#003d9b" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#003d9b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="areaEval" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#006a6a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#006a6a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(195,198,214,0.15)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#434654' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#434654' }} axisLine={false} tickLine={false} />
                  <Tooltip {...ChartTooltip} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="submissions" name="Submissions" stroke="#003d9b" fill="url(#areaSubmit)" strokeWidth={2} />
                  <Area type="monotone" dataKey="evaluations" name="Evaluated" stroke="#006a6a" fill="url(#areaEval)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ClientOnly>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle subtitle="Submission count and average AI score per sector">Sector Innovation Heatmap</CardTitle>
            </CardHeader>
            <ClientOnly fallback={<div className="h-[220px] animate-pulse rounded bg-surface-container" />}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sectorData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 60 }}>
                  <CartesianGrid stroke="rgba(195,198,214,0.15)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#434654' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 10, fill: '#434654' }} axisLine={false} tickLine={false} width={65} />
                  <Tooltip
                    {...ChartTooltip}
                    formatter={(value: number, name: string) =>
                      name === 'Avg AI Score' ? [`${value}/100`, name] : [value, name]
                    }
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="count" name="Submissions" fill="#003d9b" radius={[0, 3, 3, 0]} barSize={8} />
                  <Bar dataKey="avgScore" name="Avg AI Score" fill="#006a6a" radius={[0, 3, 3, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </Card>
        </div>

        {/* ── row 2: funnel + AI decisions + pilot conversion ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Approval Funnel */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Cumulative count at each pipeline stage">Approval Rate Funnel</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {funnelData.map((stage, idx) => (
                <div key={stage.stage}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-label-sm text-on-surface-variant">{stage.stage}</span>
                    <span className="text-label-md font-semibold text-on-surface">{stage.count}</span>
                  </div>
                  <div className="h-5 overflow-hidden rounded bg-surface-container">
                    <div
                      className="flex h-full items-center justify-end rounded pr-2 transition-all duration-700"
                      style={{
                        width: funnelData[0].count > 0 ? `${(stage.count / funnelData[0].count) * 100}%` : '0%',
                        background: stage.color,
                      }}
                    >
                      {stage.count > 0 && idx > 0 && funnelData[idx - 1].count > 0 && (
                        <span className="text-[10px] font-bold text-white">
                          {Math.round((stage.count / funnelData[idx - 1].count) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Decision Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Evaluator alignment with AI recommendations">AI Decision Alignment</CardTitle>
            </CardHeader>
            <div className="flex justify-center">
              <ClientOnly fallback={<div className="h-[140px] w-[140px] animate-pulse rounded-full bg-surface-container" />}>
                <PieChart width={140} height={140}>
                  <Pie
                    data={aiDecisionData.filter(d => d.value > 0)}
                    cx={65} cy={65}
                    innerRadius={45} outerRadius={65}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {aiDecisionData.filter(d => d.value > 0).map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ClientOnly>
            </div>
            <div className="space-y-2 mt-2">
              {aiDecisionData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-label-sm text-on-surface-variant">{d.name}</span>
                  </div>
                  <span className="text-label-md font-semibold text-on-surface">{d.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-surface-container-lowest p-3 text-center">
              <p className="text-label-sm text-on-surface-variant">Override Rate</p>
              <p className="font-display text-display-sm font-bold text-warning">{overrideRate}%</p>
            </div>
          </Card>

          {/* Pilot Conversion */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Pilot outcomes and procurement conversion rate">Pilot Conversion</CardTitle>
            </CardHeader>
            <div className="flex justify-center">
              <ClientOnly fallback={<div className="h-[140px] w-[140px] animate-pulse rounded-full bg-surface-container" />}>
                <PieChart width={140} height={140}>
                  <Pie
                    data={pilotDonutData}
                    cx={65} cy={65}
                    innerRadius={45} outerRadius={65}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pilotDonutData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ClientOnly>
            </div>
            <div className="space-y-2 mt-2">
              {[
                { label: 'Total Pilots', value: pilots.length },
                { label: 'Completed', value: pilotStats.completed },
                { label: 'Proceed', value: pilotStats.proceed },
                { label: 'Modify / Terminate', value: pilotStats.modify + pilotStats.terminate },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-label-sm text-on-surface-variant">{row.label}</span>
                  <span className="text-label-md font-semibold text-on-surface">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-surface-container-lowest p-3 text-center">
              <p className="text-label-sm text-on-surface-variant">Proceed Rate</p>
              <p className="font-display text-display-sm font-bold text-secondary">
                {pilotStats.completed > 0 ? `${pilotStats.rate}%` : '—'}
              </p>
            </div>
          </Card>
        </div>

        {/* ── row 3: pipeline value ── */}
        <Card>
          <CardHeader>
            <CardTitle subtitle="Monthly deal value flowing through the pipeline">Pipeline Value (AED)</CardTitle>
          </CardHeader>
          <ClientOnly fallback={<div className="h-[160px] animate-pulse rounded bg-surface-container" />}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                <CartesianGrid stroke="rgba(195,198,214,0.15)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#434654' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#434654' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  {...ChartTooltip}
                  formatter={(v: number) => [`AED ${(v / 1000000).toFixed(1)}M`, 'Value']}
                />
                <Bar dataKey="value" name="Pipeline Value" fill="#003d9b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ClientOnly>
        </Card>
      </div>
    </AppShell>
  )
}
