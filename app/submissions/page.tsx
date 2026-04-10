'use client'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/appStore'
import { useRole } from '@/hooks/useRole'
import {
  formatAED, formatRelativeTime,
  getSubmissionStatusConfig, getCategoryLabel, truncate
} from '@/lib/utils'
import { Search, Plus, Bot, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import type { SubmissionStatus, SubmissionCategory } from '@/types'

const STATUS_OPTIONS: SubmissionStatus[] = ['draft', 'submitted', 'ai_review', 'evaluation', 'compliance_check', 'approved', 'pilot', 'procurement', 'rejected']
const CATEGORY_OPTIONS: SubmissionCategory[] = ['ai_ml', 'fintech', 'healthtech', 'logistics', 'sustainability', 'edtech', 'cybersecurity', 'smart_city', 'iot']

export default function SubmissionsPage() {
  const submissions = useAppStore((s) => s.submissions)
  const { currentRole, can } = useRole()
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const visibleSubmissions = currentRole === 'startup'
    ? submissions.filter(s => ['sub-006', 'sub-001'].includes(s.id))
    : submissions

  const filtered = visibleSubmissions.filter(sub => {
    const matchSearch = !search || sub.title.toLowerCase().includes(search.toLowerCase()) || sub.company.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !selectedStatus || sub.status === selectedStatus
    const matchCategory = !selectedCategory || sub.category === selectedCategory
    return matchSearch && matchStatus && matchCategory
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search by title or company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full min-h-10 pl-9 pr-4 py-2.5 bg-surface-container-lowest rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="min-h-10 px-3 py-2.5 bg-surface-container-lowest rounded-lg text-body-md text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{getSubmissionStatusConfig(s).label}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="min-h-10 px-3 py-2.5 bg-surface-container-lowest rounded-lg text-body-md text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20"
            >
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map(c => (
                <option key={c} value={c}>{getCategoryLabel(c)}</option>
              ))}
            </select>

            {can.createSubmission && (
              <Link href="/submissions/new" className="block">
                <Button icon={<Plus />} className="w-full lg:w-auto">New Submission</Button>
              </Link>
            )}
          </div>
        </div>

        <p className="text-label-md text-on-surface-variant">
          Showing <span className="font-semibold text-on-surface">{filtered.length}</span> submissions
        </p>

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="text-left text-label-sm text-on-surface-variant font-medium px-4 py-3 uppercase tracking-wider">Submission</th>
                  <th className="text-left text-label-sm text-on-surface-variant font-medium px-4 py-3 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left text-label-sm text-on-surface-variant font-medium px-4 py-3 uppercase tracking-wider hidden lg:table-cell">Value</th>
                  <th className="text-left text-label-sm text-on-surface-variant font-medium px-4 py-3 uppercase tracking-wider">Status</th>
                  <th className="text-left text-label-sm text-on-surface-variant font-medium px-4 py-3 uppercase tracking-wider hidden lg:table-cell">AI Score</th>
                  <th className="text-left text-label-sm text-on-surface-variant font-medium px-4 py-3 uppercase tracking-wider hidden xl:table-cell">Updated</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub, idx) => {
                  const statusConfig = getSubmissionStatusConfig(sub.status)
                  return (
                    <tr
                      key={sub.id}
                      className={`table-row-hover ${idx < filtered.length - 1 ? 'border-b border-outline-variant/10' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <Link href={`/submissions/${sub.id}`} className="text-title-sm text-on-surface hover:text-primary transition-colors">
                            {truncate(sub.title, 50)}
                          </Link>
                          <p className="text-label-sm text-on-surface-variant mt-0.5">{sub.company} · TRL {sub.trl}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-body-sm text-on-surface-variant">{getCategoryLabel(sub.category)}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-body-sm font-medium text-on-surface">{formatAED(sub.estimatedValue)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={statusConfig} />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {sub.aiScore ? (
                          <div className="flex items-center gap-1.5">
                            <Bot className="w-3.5 h-3.5 text-primary-tint" />
                            <span className="text-label-md font-semibold text-on-surface">{sub.aiScore.overall}</span>
                            <span className="text-label-sm text-on-surface-variant">/100</span>
                          </div>
                        ) : (
                          <span className="text-label-sm text-on-surface-variant/50">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-label-sm text-on-surface-variant">{formatRelativeTime(sub.updatedAt)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/submissions/${sub.id}`}>
                          <Button variant="ghost" size="sm" icon={<ChevronRight />} iconPosition="right">View</Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-on-surface-variant text-body-md">
                      No submissions found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
