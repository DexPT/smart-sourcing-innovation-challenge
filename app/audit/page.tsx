'use client'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { auditLogs } from '@/data/audit'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { ClipboardList, Search, Download, Bot, User, ShieldCheck, Building2, FlaskConical, HandshakeIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import type { UserRole } from '@/types'

const ENTITY_ICONS: Record<string, React.ElementType> = {
  submission: ClipboardList,
  vendor: Building2,
  pilot: FlaskConical,
  procurement: HandshakeIcon,
  compliance: ShieldCheck,
  user: User,
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-power-gradient text-on-primary',
  evaluator: 'bg-teal-gradient text-on-primary',
  compliance: 'bg-tertiary text-on-primary',
  startup: 'bg-secondary text-on-secondary',
}

const ACTION_LABELS: Record<string, { bg: string; text: string }> = {
  SUBMISSION_APPROVED: { bg: 'bg-secondary-container', text: 'text-secondary' },
  SUBMISSION_REJECTED: { bg: 'bg-error-container', text: 'text-error' },
  SUBMISSION_CREATED: { bg: 'bg-primary/10', text: 'text-primary' },
  PILOT_LAUNCHED: { bg: 'bg-secondary-container', text: 'text-secondary' },
  PILOT_COMPLETED: { bg: 'bg-secondary-container', text: 'text-secondary' },
  COMPLIANCE_PASSED: { bg: 'bg-secondary-container', text: 'text-secondary' },
  COMPLIANCE_REVIEW_STARTED: { bg: 'bg-primary/10', text: 'text-primary' },
  MOVED_TO_PROCUREMENT: { bg: 'bg-warning-container', text: 'text-on-surface' },
  MOVED_TO_COMPLIANCE: { bg: 'bg-primary/10', text: 'text-primary-tint' },
  VENDOR_SUSPENDED: { bg: 'bg-error-container', text: 'text-error' },
  VENDOR_REGISTERED: { bg: 'bg-primary/10', text: 'text-primary' },
  AI_EVALUATION_STARTED: { bg: 'bg-primary/10', text: 'text-primary-tint' },
  AI_EVALUATION_COMPLETE: { bg: 'bg-secondary-container', text: 'text-secondary' },
  EVALUATION_ASSIGNED: { bg: 'bg-surface-container', text: 'text-on-surface-variant' },
  MILESTONE_COMPLETED: { bg: 'bg-secondary-container', text: 'text-secondary' },
}

export default function AuditPage() {
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const sorted = [...auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const filtered = sorted.filter(log => {
    const matchSearch = !search || log.entityTitle.toLowerCase().includes(search.toLowerCase()) || log.action.toLowerCase().includes(search.toLowerCase()) || log.actorName.toLowerCase().includes(search.toLowerCase())
    const matchEntity = !entityFilter || log.entityType === entityFilter
    const matchRole = !roleFilter || log.actorRole === roleFilter
    return matchSearch && matchEntity && matchRole
  })

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card><p className="text-label-sm text-on-surface-variant">Total Events</p><p className="font-display font-bold text-display-sm text-on-surface mt-1">{auditLogs.length}</p></Card>
          <Card><p className="text-label-sm text-on-surface-variant">Entity Types</p><p className="font-display font-bold text-display-sm text-on-surface mt-1">6</p></Card>
          <Card><p className="text-label-sm text-on-surface-variant">Unique Actors</p><p className="font-display font-bold text-display-sm text-on-surface mt-1">{new Set(auditLogs.map(a => a.actorId)).size}</p></Card>
          <Card><p className="text-label-sm text-on-surface-variant">System Events</p><p className="font-display font-bold text-display-sm text-on-surface mt-1">{auditLogs.filter(a => a.actorId === 'system').length}</p></Card>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search actions, entities, actors..."
              className="w-full min-h-10 pl-9 pr-4 py-2.5 bg-surface-container-lowest rounded-lg text-body-sm text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3">
            <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="min-h-10 px-3 py-2.5 bg-surface-container-lowest rounded-lg text-body-sm text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20">
              <option value="">All Entity Types</option>
              <option value="submission">Submission</option>
              <option value="vendor">Vendor</option>
              <option value="pilot">Pilot</option>
              <option value="procurement">Procurement</option>
              <option value="compliance">Compliance</option>
            </select>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="min-h-10 px-3 py-2.5 bg-surface-container-lowest rounded-lg text-body-sm text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="evaluator">Evaluator</option>
              <option value="compliance">Compliance</option>
              <option value="startup">Startup</option>
            </select>
            <Button variant="secondary" size="sm" icon={<Download />} className="w-full lg:w-auto">Export</Button>
          </div>
        </div>

        <p className="text-label-md text-on-surface-variant">
          Showing <span className="font-semibold text-on-surface">{filtered.length}</span> events
        </p>

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="text-left text-label-sm text-on-surface-variant font-medium px-4 py-3 uppercase tracking-wider">Timestamp</th>
                  <th className="text-left text-label-sm text-on-surface-variant font-medium px-4 py-3 uppercase tracking-wider">Action</th>
                  <th className="text-left text-label-sm text-on-surface-variant font-medium px-4 py-3 uppercase tracking-wider hidden md:table-cell">Entity</th>
                  <th className="text-left text-label-sm text-on-surface-variant font-medium px-4 py-3 uppercase tracking-wider hidden lg:table-cell">Actor</th>
                  <th className="text-left text-label-sm text-on-surface-variant font-medium px-4 py-3 uppercase tracking-wider hidden xl:table-cell">Details</th>
                  <th className="text-left text-label-sm text-on-surface-variant font-medium px-4 py-3 uppercase tracking-wider hidden xl:table-cell">IP</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, idx) => {
                  const EntityIcon = ENTITY_ICONS[log.entityType] ?? ClipboardList
                  const actionConfig = ACTION_LABELS[log.action] ?? { bg: 'bg-surface-container', text: 'text-on-surface-variant' }
                  const isAI = log.actorId === 'system'
                  return (
                    <tr key={log.id} className={`table-row-hover ${idx < filtered.length - 1 ? 'border-b border-outline-variant/10' : ''}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-label-md font-medium text-on-surface">{formatRelativeTime(log.timestamp)}</p>
                          <p className="text-label-sm text-on-surface-variant/60">{formatDate(log.timestamp)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-label-sm ${actionConfig.bg} ${actionConfig.text}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <EntityIcon className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
                          <div>
                            <p className="text-label-md text-on-surface truncate max-w-40">{log.entityTitle}</p>
                            <p className="text-label-sm text-on-surface-variant capitalize">{log.entityType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          {isAI ? (
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-3.5 h-3.5 text-primary-tint" />
                            </div>
                          ) : (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${ROLE_COLORS[log.actorRole]}`}>
                              {log.actorName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-label-md text-on-surface">{log.actorName}</p>
                            <p className="text-label-sm text-on-surface-variant capitalize">{log.actorRole}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell max-w-xs">
                        <p className="text-body-sm text-on-surface-variant leading-snug line-clamp-2">{log.details}</p>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <code className="text-label-sm text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded font-mono">{log.ipAddress ?? 'N/A'}</code>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-on-surface-variant text-body-md">
                      No audit events found matching your filters.
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
