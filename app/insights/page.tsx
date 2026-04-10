'use client'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { useAppStore } from '@/store/appStore'
import { formatAED } from '@/lib/utils'
import { BarChart3, TrendingUp, Target, Zap, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { ClientOnly } from '@/components/ui/ClientOnly'

const monthlyData = [
  { month: 'Oct 25', submissions: 4, evaluations: 3, pilots: 1, value: 8200000 },
  { month: 'Nov 25', submissions: 6, evaluations: 5, pilots: 1, value: 15400000 },
  { month: 'Dec 25', submissions: 5, evaluations: 4, pilots: 2, value: 12100000 },
  { month: 'Jan 26', submissions: 9, evaluations: 8, pilots: 2, value: 28500000 },
  { month: 'Feb 26', submissions: 8, evaluations: 7, pilots: 2, value: 22000000 },
  { month: 'Mar 26', submissions: 12, evaluations: 10, pilots: 3, value: 45000000 },
  { month: 'Apr 26', submissions: 8, evaluations: 5, pilots: 2, value: 18200000 },
]

const categoryPerformance = [
  { category: 'AI & ML', avgScore: 86, count: 2, approved: 2 },
  { category: 'Cybersecurity', avgScore: 88, count: 1, approved: 1 },
  { category: 'Logistics', avgScore: 92, count: 1, approved: 1 },
  { category: 'FinTech', avgScore: 90, count: 1, approved: 1 },
  { category: 'Sustainability', avgScore: 76, count: 1, approved: 0 },
  { category: 'EdTech', avgScore: 0, count: 1, approved: 0 },
  { category: 'HealthTech', avgScore: 48, count: 1, approved: 0 },
]

const funnelData = [
  { stage: 'Submitted', count: 8, color: '#c3c6d6' },
  { stage: 'AI Review', count: 6, color: '#0c56d0' },
  { stage: 'Evaluated', count: 5, color: '#003d9b' },
  { stage: 'Compliance', count: 4, color: '#3c4455' },
  { stage: 'Approved', count: 3, color: '#006a6a' },
  { stage: 'Pilot', count: 2, color: '#00897b' },
  { stage: 'Procurement', count: 1, color: '#004d40' },
]

const complianceData = [
  { name: 'Passed', value: 3, color: '#006a6a' },
  { name: 'In Progress', value: 1, color: '#b45309' },
  { name: 'Failed', value: 0, color: '#ba1a1a' },
  { name: 'Conditional', value: 0, color: '#434654' },
]

const conversionData = [
  { month: 'Jan', rate: 62 },
  { month: 'Feb', rate: 58 },
  { month: 'Mar', rate: 71 },
  { month: 'Apr', rate: 65 },
]

export default function InsightsPage() {
  const submissions = useAppStore(s => s.submissions)
  const totalValue = submissions
    .filter(s => !['rejected', 'archived'].includes(s.status))
    .reduce((sum, sub) => sum + sub.estimatedValue, 0)
  const avgScore = Math.round(
    submissions.filter(s => s.aiScore).reduce((sum, sub) => sum + (sub.aiScore?.overall ?? 0), 0) /
      Math.max(1, submissions.filter(s => s.aiScore).length)
  )

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-body-md text-on-surface-variant">April 2026 · Year to Date</p>
          <Button variant="secondary" size="sm" icon={<Download />} className="w-full sm:w-auto">
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Pipeline Value" value={formatAED(totalValue)} change={38} trend="up" icon={<TrendingUp />} accent="primary" gradient />
          <StatCard label="Submissions YTD" value={submissions.length} change={23} trend="up" icon={<BarChart3 />} accent="secondary" />
          <StatCard label="Avg AI Score" value={avgScore} unit="/100" change={5} trend="up" icon={<Zap />} accent="primary" />
          <StatCard label="Approval Rate" value="55" unit="%" change={8} trend="up" icon={<Target />} accent="secondary" />
        </div>

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
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(195,198,214,0.2)', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="submissions" name="Submissions" stroke="#003d9b" fill="url(#areaSubmit)" strokeWidth={2} />
                  <Area type="monotone" dataKey="evaluations" name="Evaluated" stroke="#006a6a" fill="url(#areaEval)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ClientOnly>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle subtitle="Total deal value in pipeline">Pipeline Value (AED)</CardTitle>
            </CardHeader>
            <ClientOnly fallback={<div className="h-[220px] animate-pulse rounded bg-surface-container" />}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                  <CartesianGrid stroke="rgba(195,198,214,0.15)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#434654' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#434654' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid rgba(195,198,214,0.2)', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v: number) => [`AED ${(v / 1000000).toFixed(1)}M`, 'Value']}
                  />
                  <Bar dataKey="value" name="Pipeline Value" fill="#003d9b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle subtitle="Stage conversion">Pipeline Funnel</CardTitle>
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
                      className="flex h-full items-center justify-end rounded pr-2 text-right transition-all duration-700"
                      style={{ width: `${(stage.count / funnelData[0].count) * 100}%`, background: stage.color }}
                    >
                      {stage.count > 0 && idx > 0 && (
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

          <Card>
            <CardHeader>
              <CardTitle subtitle="Average AI score by domain">Category Performance</CardTitle>
            </CardHeader>
            <ClientOnly fallback={<div className="h-[200px] animate-pulse rounded bg-surface-container" />}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryPerformance.filter(c => c.avgScore > 0)} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 50 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#434654' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 10, fill: '#434654' }} axisLine={false} tickLine={false} width={55} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid rgba(195,198,214,0.2)', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="avgScore" name="Avg Score" radius={[0, 4, 4, 0]}>
                    {categoryPerformance.filter(c => c.avgScore > 0).map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#003d9b' : i === 1 ? '#006a6a' : '#0c56d0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle subtitle="Compliance review outcomes">Compliance Health</CardTitle>
            </CardHeader>
            <div className="mb-4 flex justify-center">
              <ClientOnly fallback={<div className="h-[140px] w-[140px] animate-pulse rounded-full bg-surface-container" />}>
                <PieChart width={140} height={140}>
                  <Pie id="insights-compliance-health" data={complianceData.filter(d => d.value > 0)} cx={65} cy={65} innerRadius={45} outerRadius={65} dataKey="value" strokeWidth={0}>
                    {complianceData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ClientOnly>
            </div>
            <div className="space-y-2">
              {complianceData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-label-sm text-on-surface-variant">{d.name}</span>
                  </div>
                  <span className="text-label-md font-semibold text-on-surface">{d.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-outline-variant/10 pt-3 text-center">
              <p className="text-label-sm text-on-surface-variant">DESC Alignment Rate</p>
              <p className="font-display text-display-sm font-bold text-secondary">100%</p>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle subtitle="Percentage of submissions advancing through pipeline">Monthly Conversion Rate</CardTitle>
          </CardHeader>
          <ClientOnly fallback={<div className="h-[150px] animate-pulse rounded bg-surface-container" />}>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={conversionData} margin={{ top: 0, right: 30, bottom: 0, left: -10 }}>
                <CartesianGrid stroke="rgba(195,198,214,0.15)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#434654' }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 80]} tick={{ fontSize: 11, fill: '#434654' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid rgba(195,198,214,0.2)', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v: number) => [`${v}%`, 'Conversion Rate']}
                />
                <Line type="monotone" dataKey="rate" stroke="#006a6a" strokeWidth={2.5} dot={{ fill: '#006a6a', r: 4 }} name="Conversion Rate" />
              </LineChart>
            </ResponsiveContainer>
          </ClientOnly>
        </Card>
      </div>
    </AppShell>
  )
}
