'use client'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/appStore'
import { useRole } from '@/hooks/useRole'
import { formatAED, formatRelativeTime, getSubmissionStatusConfig, getCategoryLabel } from '@/lib/utils'
import {
  FileText, Brain, FlaskConical,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, ArrowRight, Zap
} from 'lucide-react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { ClientOnly } from '@/components/ui/ClientOnly'

const submissionTrendData = [
  { month: 'Oct', submissions: 4, approved: 2 },
  { month: 'Nov', submissions: 6, approved: 3 },
  { month: 'Dec', submissions: 5, approved: 3 },
  { month: 'Jan', submissions: 9, approved: 5 },
  { month: 'Feb', submissions: 8, approved: 4 },
  { month: 'Mar', submissions: 12, approved: 7 },
  { month: 'Apr', submissions: 8, approved: 3 },
]

const categoryData = [
  { name: 'AI & ML', value: 2, color: '#003d9b' },
  { name: 'Logistics', value: 1, color: '#006a6a' },
  { name: 'Sustainability', value: 1, color: '#3c4455' },
  { name: 'FinTech', value: 1, color: '#0052cc' },
  { name: 'Cybersecurity', value: 1, color: '#0c56d0' },
  { name: 'EdTech', value: 1, color: '#747688' },
  { name: 'HealthTech', value: 1, color: '#c3c6d6' },
]

export default function DashboardPage() {
  const submissions = useAppStore((s) => s.submissions)
  const { can } = useRole()

  const stats = {
    total: submissions.length,
    approved: submissions.filter(s => ['approved', 'pilot', 'procurement'].includes(s.status)).length,
    inPilot: submissions.filter(s => s.status === 'pilot').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    pending: submissions.filter(s => ['submitted', 'ai_review', 'evaluation', 'compliance_check'].includes(s.status)).length,
    totalValue: submissions.filter(s => !['rejected', 'archived'].includes(s.status)).reduce((s, sub) => s + sub.estimatedValue, 0),
    avgScore: Math.round(submissions.filter(s => s.aiScore).reduce((s, sub) => s + (sub.aiScore?.overall ?? 0), 0) / Math.max(1, submissions.filter(s => s.aiScore).length)),
  }

  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Submissions" value={stats.total} change={23} trend="up" icon={<FileText />} accent="primary" />
          <StatCard label="Pipeline Value" value={formatAED(stats.totalValue)} change={18} trend="up" icon={<TrendingUp />} accent="secondary" gradient />
          <StatCard label="Avg AI Score" value={stats.avgScore} unit="/100" change={5} trend="up" icon={<Brain />} accent="primary" />
          <StatCard label="Active Pilots" value={stats.inPilot} change={0} trend="flat" icon={<FlaskConical />} accent="secondary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                actions={
                  <Link href="/submissions">
                    <Button variant="ghost" size="sm" icon={<ArrowRight />} iconPosition="right">
                      View All
                    </Button>
                  </Link>
                }
              >
                <CardTitle subtitle="Monthly submission and approval trends">Submission Pipeline</CardTitle>
              </CardHeader>
              <ClientOnly fallback={<div className="h-[200px] bg-surface-container rounded animate-pulse" />}>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={submissionTrendData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="submissionsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#003d9b" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#003d9b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#006a6a" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#006a6a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#434654' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#434654' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid rgba(195,198,214,0.2)', borderRadius: '8px', fontSize: '12px' }}
                      cursor={{ stroke: 'rgba(195,198,214,0.3)' }}
                    />
                    <Area type="monotone" dataKey="submissions" stroke="#003d9b" strokeWidth={2} fill="url(#submissionsGrad)" name="Submitted" />
                    <Area type="monotone" dataKey="approved" stroke="#006a6a" strokeWidth={2} fill="url(#approvedGrad)" name="Approved" />
                  </AreaChart>
                </ResponsiveContainer>
              </ClientOnly>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle subtitle="By innovation category">Category Breakdown</CardTitle>
            </CardHeader>
            <div className="flex flex-col items-center">
              <ClientOnly fallback={<div className="w-[160px] h-[160px] bg-surface-container rounded-full animate-pulse" />}>
                <PieChart width={160} height={160}>
                  <Pie id="dashboard-category-breakdown" data={categoryData} cx={75} cy={75} innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                    {categoryData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ClientOnly>
              <div className="space-y-1.5 mt-3 w-full">
                {categoryData.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                      <span className="text-label-sm text-on-surface-variant">{cat.name}</span>
                    </div>
                    <span className="text-label-sm font-medium text-on-surface">{cat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle subtitle="Current pipeline distribution">Status Overview</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {[
                { label: 'Under Review', count: stats.pending, total: stats.total, color: 'bg-primary' },
                { label: 'Approved', count: stats.approved, total: stats.total, color: 'bg-secondary' },
                { label: 'Rejected', count: stats.rejected, total: stats.total, color: 'bg-error' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-label-sm">
                    <span className="text-on-surface-variant">{item.label}</span>
                    <span className="font-medium text-on-surface">{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.count / item.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {can.runAIEvaluation && (
              <div className="mt-4 pt-3 border-t border-outline-variant/10">
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Action Required</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 p-2 bg-warning-container/50 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-warning" />
                    <span className="text-label-sm text-on-surface">{submissions.filter(s => s.status === 'submitted').length} awaiting AI review</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-md">
                    <AlertTriangle className="w-3.5 h-3.5 text-primary" />
                    <span className="text-label-sm text-on-surface">{submissions.filter(s => s.status === 'evaluation').length} in human evaluation</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                actions={
                  <Link href="/submissions">
                    <Button variant="ghost" size="sm" icon={<ArrowRight />} iconPosition="right">
                      All Submissions
                    </Button>
                  </Link>
                }
              >
                <CardTitle subtitle="Most recently updated">Recent Activity</CardTitle>
              </CardHeader>
              <div className="space-y-0">
                {recentSubmissions.map((sub, idx) => {
                  const statusConfig = getSubmissionStatusConfig(sub.status)
                  return (
                    <Link key={sub.id} href={`/submissions/${sub.id}`}>
                      <div className={`flex items-center gap-3 py-2.5 table-row-hover rounded-lg px-2 -mx-2 ${idx < recentSubmissions.length - 1 ? 'border-b border-outline-variant/10' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <p className="text-title-sm text-on-surface truncate">{sub.title}</p>
                          <p className="text-label-sm text-on-surface-variant">{sub.company} · {getCategoryLabel(sub.category)}</p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                          {sub.aiScore && (
                            <span className="text-label-sm font-semibold text-on-surface-variant hidden sm:block">
                              {sub.aiScore.overall}/100
                            </span>
                          )}
                          <StatusBadge status={statusConfig} />
                          <span className="text-label-sm text-on-surface-variant/60 hidden md:block">{formatRelativeTime(sub.updatedAt)}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </Card>
          </div>
        </div>

        {can.createSubmission && (
          <Card className="bg-power-gradient text-on-primary">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-headline-sm text-on-primary">Ready to submit your innovation?</h2>
                <p className="text-body-sm text-on-primary/70 mt-1">Submit your solution for AI-powered evaluation by Dubai Chambers.</p>
              </div>
              <Link href="/submissions/new">
                <Button variant="secondary" className="border-on-primary/30 text-on-primary hover:bg-on-primary/10">
                  Start Submission
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {can.runComplianceCheck && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-error">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-error flex-shrink-0" />
                <div>
                  <p className="text-title-sm text-on-surface">1 Compliance Review</p>
                  <p className="text-label-sm text-on-surface-variant">In progress - NexusAI</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                <div>
                  <p className="text-title-sm text-on-surface">3 Passed Checks</p>
                  <p className="text-label-sm text-on-surface-variant">This quarter</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-warning flex-shrink-0" />
                <div>
                  <p className="text-title-sm text-on-surface">1 Suspended Vendor</p>
                  <p className="text-label-sm text-on-surface-variant">InnovateTech - under review</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  )
}
