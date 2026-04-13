'use client'
import { useMemo, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { auditLogs } from '@/data/audit'
import { useAppStore } from '@/store/appStore'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import {
  ClipboardList, Search, Download, Bot, ShieldCheck,
  Building2, FlaskConical, HandshakeIcon, Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { AuditLog, UserRole } from '@/types'

// ─── constants ───────────────────────────────────────────────
const ENTITY_ICONS: Record<string, React.ElementType> = {
  submission: ClipboardList,
  vendor: Building2,
  pilot: FlaskConical,
  procurement: HandshakeIcon,
  compliance: ShieldCheck,
  user: Users,
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin:      'bg-power-gradient text-on-primary',
  evaluator:  'bg-teal-gradient text-on-primary',
  compliance: 'bg-tertiary text-on-primary',
  startup:    'bg-secondary text-on-secondary',
}

const ACTION_STYLES: Record<string, { bg: string; text: string }> = {
  SUBMISSION_APPROVED:      { bg: 'bg-secondary-container', text: 'text-secondary' },
  SUBMISSION_REJECTED:      { bg: 'bg-error-container',     text: 'text-error' },
  SUBMISSION_CREATED:       { bg: 'bg-primary/10',          text: 'text-primary' },
  SUBMISSION_SHORTLISTED:   { bg: 'bg-secondary-container', text: 'text-secondary' },
  PILOT_LAUNCHED:           { bg: 'bg-secondary-container', text: 'text-secondary' },
  PILOT_COMPLETED:          { bg: 'bg-secondary-container', text: 'text-secondary' },
  PILOT_STATUS_CHANGE:      { bg: 'bg-primary/10',          text: 'text-primary-tint' },
  COMPLIANCE_PASSED:        { bg: 'bg-secondary-container', text: 'text-secondary' },
  COMPLIANCE_CONDITIONAL:   { bg: 'bg-warning-container',   text: 'text-on-surface' },
  COMPLIANCE_BLOCKED:       { bg: 'bg-error-container',     text: 'text-error' },
  COMPLIANCE_REVIEW_STARTED:{ bg: 'bg-primary/10',          text: 'text-primary-tint' },
  MOVED_TO_PROCUREMENT:     { bg: 'bg-warning-container',   text: 'text-on-surface' },
  MOVED_TO_COMPLIANCE:      { bg: 'bg-primary/10',          text: 'text-primary-tint' },
  VENDOR_SUSPENDED:         { bg: 'bg-error-container',     text: 'text-error' },
  VENDOR_REGISTERED:        { bg: 'bg-primary/10',          text: 'text-primary' },
  AI_EVALUATION_STARTED:    { bg: 'bg-primary/10',          text: 'text-primary-tint' },
  AI_EVALUATION_COMPLETE:   { bg: 'bg-secondary-container', text: 'text-secondary' },
  EVALUATION_ASSIGNED:      { bg: 'bg-surface-container',   text: 'text-on-surface-variant' },
  MILESTONE_COMPLETED:      { bg: 'bg-secondary-container', text: 'text-secondary' },
  EVALUATOR_OVERRIDE:       { bg: 'bg-warning-container',   text: 'text-on-surface' },
  EVALUATOR_DECISION:       { bg: 'bg-primary/10',          text: 'text-primary-tint' },
  COMMENT_ADDED:            { bg: 'bg-surface-container',   text: 'text-on-surface-variant' },
  PROCUREMENT_APPROVED:     { bg: 'bg-secondary-container', text: 'text-secondary' },
  PROCUREMENT_RETURNED:     { bg: 'bg-warning-container',   text: 'text-on-surface' },
  PROCUREMENT_REJECTED:     { bg: 'bg-error-container',     text: 'text-error' },
  STATUS_CHANGE:            { bg: 'bg-surface-container',   text: 'text-on-surface-variant' },
}

// ─── helpers ─────────────────────────────────────────────────
/** Detect dynamically-generated timeline events (timestamp-based IDs). */
function isDynamicEvent(id: string): boolean {
  return /^tl-ai-\d/.test(id) || /^tl-\d{9,}$/.test(id)
}

function deriveAction(title: string, type: string): string {
  const t = title.toLowerCase()
  if (type === 'ai_event') {
    if (t.includes('complete')) return 'AI_EVALUATION_COMPLETE'
    return 'AI_EVALUATION_STARTED'
  }
  if (t.includes('override')) return 'EVALUATOR_OVERRIDE'
  if (t.includes('shortlist')) return 'SUBMISSION_SHORTLISTED'
  if (t.includes('approve') || t.includes('approved')) return 'COMPLIANCE_PASSED'
  if (t.includes('conditional')) return 'COMPLIANCE_CONDITIONAL'
  if (t.includes('block') || t.includes('blocked')) return 'COMPLIANCE_BLOCKED'
  if (t.includes('procurement') && t.includes('approve')) return 'PROCUREMENT_APPROVED'
  if (t.includes('return') || t.includes('revision')) return 'PROCUREMENT_RETURNED'
  if (t.includes('reject')) return 'PROCUREMENT_REJECTED'
  if (t.includes('pilot') || t.includes('launch') || t.includes('pause') || t.includes('resume') || t.includes('complet') || t.includes('cancel')) return 'PILOT_STATUS_CHANGE'
  if (type === 'comment') return 'COMMENT_ADDED'
  if (type === 'decision') return 'EVALUATOR_DECISION'
  return 'STATUS_CHANGE'
}

// ─── page component ──────────────────────────────────────────
export default function AuditPage() {
  const submissions = useAppStore(s => s.submissions)

  const [search, setSearch]       = useState('')
  const [entityFilter, setEntity] = useState('')
  const [roleFilter, setRole]     = useState('')
  const [sourceFilter, setSource] = useState<'all' | 'ai' | 'human'>('all')

  // Merge static audit logs with live timeline events from session
  const allLogs = useMemo((): AuditLog[] => {
    const live: AuditLog[] = []
    submissions.forEach(sub => {
      sub.timeline?.forEach(event => {
        if (!isDynamicEvent(event.id)) return
        const isAI = event.actorName === 'AI Engine' || event.type === 'ai_event'
        live.push({
          id: `live-${event.id}`,
          entityType: 'submission',
          entityId: sub.id,
          entityTitle: sub.title,
          action: deriveAction(event.title, event.type),
          actorId: isAI ? 'system' : `usr-${event.actorRole}-live`,
          actorName: event.actorName,
          actorRole: event.actorRole,
          timestamp: event.timestamp,
          details: event.description,
        })
      })
    })
    return [...auditLogs, ...live].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [submissions])

  // Stats
  const aiCount    = allLogs.filter(l => l.actorId === 'system').length
  const humanCount = allLogs.length - aiCount
  const actorCount = new Set(allLogs.map(l => l.actorId)).size

  // Filtered
  const filtered = useMemo(() => allLogs.filter(log => {
    const matchSearch = !search ||
      log.entityTitle.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
    const matchEntity = !entityFilter || log.entityType === entityFilter
    const matchRole   = !roleFilter   || log.actorRole === roleFilter
    const matchSource = sourceFilter === 'all'   ? true
                      : sourceFilter === 'ai'    ? log.actorId === 'system'
                      : /* human */                log.actorId !== 'system'
    return matchSearch && matchEntity && matchRole && matchSource
  }), [allLogs, search, entityFilter, roleFilter, sourceFilter])

  const selectCls = 'min-h-10 px-3 py-2.5 bg-surface-container-lowest rounded-lg text-body-sm text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20'

  return (
    <AppShell>
      <div className="space-y-4">

        {/* ── stat cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Total Events',    value: allLogs.length },
            { label: 'AI Events',       value: aiCount },
            { label: 'Human Events',    value: humanCount },
            { label: 'Unique Actors',   value: actorCount },
          ].map(card => (
            <Card key={card.label}>
              <p className="text-label-sm text-on-surface-variant">{card.label}</p>
              <p className="font-display font-bold text-display-sm text-on-surface mt-1">{card.value}</p>
            </Card>
          ))}
        </div>

        {/* ── filters ── */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search actions, entities, actors, details…"
              className="w-full min-h-10 pl-9 pr-4 py-2.5 bg-surface-container-lowest rounded-lg text-body-sm text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-3">
            <select value={entityFilter} onChange={e => setEntity(e.target.value)} className={selectCls}>
              <option value="">All Entities</option>
              <option value="submission">Submission</option>
              <option value="vendor">Vendor</option>
              <option value="pilot">Pilot</option>
              <option value="procurement">Procurement</option>
              <option value="compliance">Compliance</option>
            </select>
            <select value={roleFilter} onChange={e => setRole(e.target.value)} className={selectCls}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="evaluator">Evaluator</option>
              <option value="compliance">Compliance</option>
              <option value="startup">Startup</option>
            </select>
            <select value={sourceFilter} onChange={e => setSource(e.target.value as 'all'|'ai'|'human')} className={selectCls}>
              <option value="all">All Sources</option>
              <option value="ai">AI System</option>
              <option value="human">Human</option>
            </select>
            <Button variant="secondary" size="sm" icon={<Download />} className="w-full lg:w-auto">Export</Button>
          </div>
        </div>

        <p className="text-label-md text-on-surface-variant">
          Showing <span className="font-semibold text-on-surface">{filtered.length}</span> of{' '}
          <span className="font-semibold text-on-surface">{allLogs.length}</span> events
        </p>

        {/* ── table ── */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="bg-surface-container-low">
                  {['Timestamp', 'Source', 'Action', 'Entity', 'Actor', 'Details'].map(h => (
                    <th key={h} className="text-left text-label-sm text-on-surface-variant font-medium px-4 py-3 uppercase tracking-wider last:hidden last:xl:table-cell [&:nth-child(4)]:hidden [&:nth-child(4)]:md:table-cell [&:nth-child(5)]:hidden [&:nth-child(5)]:lg:table-cell">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, idx) => {
                  const EntityIcon  = ENTITY_ICONS[log.entityType] ?? ClipboardList
                  const actionStyle = ACTION_STYLES[log.action] ?? { bg: 'bg-surface-container', text: 'text-on-surface-variant' }
                  const isAI        = log.actorId === 'system'
                  const isLive      = log.id.startsWith('live-')

                  return (
                    <tr
                      key={log.id}
                      className={[
                        'table-row-hover',
                        idx < filtered.length - 1 ? 'border-b border-outline-variant/10' : '',
                        isAI ? 'bg-primary/[0.03]' : '',
                      ].join(' ')}
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3 w-32">
                        <p className="text-label-md font-medium text-on-surface">{formatRelativeTime(log.timestamp)}</p>
                        <p className="text-label-sm text-on-surface-variant/60">{formatDate(log.timestamp)}</p>
                      </td>

                      {/* Source */}
                      <td className="px-4 py-3 w-24">
                        {isAI ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-label-sm font-medium text-primary-tint">
                            <Bot className="w-3 h-3" /> AI
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-surface-container px-2 py-1 text-label-sm font-medium text-on-surface-variant">
                            Human
                          </span>
                        )}
                        {isLive && (
                          <span className="mt-0.5 block text-[10px] text-primary/60 font-medium">live</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <span className={`badge text-label-sm ${actionStyle.bg} ${actionStyle.text}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <EntityIcon className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
                          <div>
                            <p className="text-label-md text-on-surface truncate max-w-36">{log.entityTitle}</p>
                            <p className="text-label-sm text-on-surface-variant capitalize">{log.entityType}</p>
                          </div>
                        </div>
                      </td>

                      {/* Actor */}
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

                      {/* Details */}
                      <td className="px-4 py-3 hidden xl:table-cell max-w-xs">
                        <p className="text-body-sm text-on-surface-variant leading-snug line-clamp-2">{log.details}</p>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-on-surface-variant text-body-md">
                      No audit events match your filters.
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
