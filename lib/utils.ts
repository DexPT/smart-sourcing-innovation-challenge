import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { SubmissionStatus, ComplianceStatus, PilotStatus, VendorStatus, VendorTier } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAED(value: number): string {
  if (value >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `AED ${(value / 1_000).toFixed(0)}K`
  return `AED ${value.toLocaleString()}`
}

export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', options ?? { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateString)
}

export function getSubmissionStatusConfig(status: SubmissionStatus) {
  const configs = {
    draft: { label: 'Draft', bg: 'bg-surface-container', text: 'text-on-surface-variant' },
    submitted: { label: 'Submitted', bg: 'bg-primary/10', text: 'text-primary' },
    ai_review: { label: 'AI Review', bg: 'bg-primary-tint/10', text: 'text-primary-tint' },
    evaluation: { label: 'Evaluation', bg: 'bg-warning-container', text: 'text-on-surface' },
    compliance_check: { label: 'Compliance Check', bg: 'bg-tertiary/10', text: 'text-tertiary' },
    approved: { label: 'Approved', bg: 'bg-secondary-container', text: 'text-secondary' },
    finalist: { label: 'Finalist', bg: 'bg-primary', text: 'text-on-primary' },
    demo_day: { label: 'Demo Day ★', bg: 'bg-power-gradient', text: 'text-on-primary' },
    pilot: { label: 'In Pilot', bg: 'bg-secondary/10', text: 'text-secondary' },
    procurement: { label: 'Procurement', bg: 'bg-primary/10', text: 'text-primary' },
    rejected: { label: 'Rejected', bg: 'bg-error-container', text: 'text-error' },
    archived: { label: 'Archived', bg: 'bg-surface-container', text: 'text-on-surface-variant' },
  }

  return configs[status] ?? configs.draft
}

export function getComplianceStatusConfig(status: ComplianceStatus) {
  const configs = {
    pending: { label: 'Pending', bg: 'bg-surface-container', text: 'text-on-surface-variant' },
    in_progress: { label: 'In Progress', bg: 'bg-warning-container', text: 'text-on-surface' },
    passed: { label: 'Passed', bg: 'bg-secondary-container', text: 'text-secondary' },
    failed: { label: 'Failed', bg: 'bg-error-container', text: 'text-error' },
    conditional: { label: 'Conditional', bg: 'bg-warning-container', text: 'text-on-surface' },
  }

  return configs[status] ?? configs.pending
}

export function getPilotStatusConfig(status: PilotStatus) {
  const configs = {
    planned: { label: 'Planned', bg: 'bg-surface-container', text: 'text-on-surface-variant' },
    active: { label: 'Active', bg: 'bg-secondary-container', text: 'text-secondary' },
    paused: { label: 'Paused', bg: 'bg-warning-container', text: 'text-on-surface' },
    completed: { label: 'Completed', bg: 'bg-primary/10', text: 'text-primary' },
    cancelled: { label: 'Cancelled', bg: 'bg-error-container', text: 'text-error' },
  }

  return configs[status] ?? configs.planned
}

export function getVendorStatusConfig(status: VendorStatus) {
  const configs = {
    pending: { label: 'Pending', bg: 'bg-warning-container', text: 'text-on-surface' },
    active: { label: 'Active', bg: 'bg-secondary-container', text: 'text-secondary' },
    suspended: { label: 'Suspended', bg: 'bg-error-container/50', text: 'text-error' },
    blacklisted: { label: 'Blacklisted', bg: 'bg-error-container', text: 'text-error' },
  }

  return configs[status] ?? configs.pending
}

export function getVendorTierConfig(tier: VendorTier) {
  const configs = {
    preferred: { label: 'Preferred', bg: 'bg-power-gradient', text: 'text-on-primary' },
    approved: { label: 'Approved', bg: 'bg-secondary-container', text: 'text-secondary' },
    provisional: { label: 'Provisional', bg: 'bg-warning-container', text: 'text-on-surface' },
    unregistered: { label: 'Unregistered', bg: 'bg-surface-container', text: 'text-on-surface-variant' },
  }

  return configs[tier] ?? configs.unregistered
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-secondary'
  if (score >= 60) return 'text-on-surface'
  if (score >= 40) return 'text-primary'
  return 'text-error'
}

export function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-secondary-container'
  if (score >= 60) return 'bg-warning-container'
  if (score >= 40) return 'bg-primary/10'
  return 'bg-error-container'
}

export function getSeverityConfig(severity: string) {
  const configs: Record<string, { label: string; bg: string; text: string }> = {
    critical: { label: 'Critical', bg: 'bg-error-container', text: 'text-error' },
    high: { label: 'High', bg: 'bg-error-container/50', text: 'text-error' },
    medium: { label: 'Medium', bg: 'bg-warning-container', text: 'text-on-surface' },
    low: { label: 'Low', bg: 'bg-secondary-container', text: 'text-secondary' },
  }

  return configs[severity] ?? configs.low
}

export function getCategoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    smart_city: 'Smart City',
    fintech: 'FinTech',
    healthtech: 'HealthTech',
    logistics: 'Logistics',
    sustainability: 'Sustainability',
    edtech: 'EdTech',
    cybersecurity: 'Cybersecurity',
    ai_ml: 'AI & ML',
    iot: 'IoT',
  }

  return labels[cat] ?? cat
}

export function getFundingLabel(stage: string): string {
  const labels: Record<string, string> = {
    'pre-seed': 'Pre-Seed',
    seed: 'Seed',
    'series-a': 'Series A',
    'series-b': 'Series B',
    growth: 'Growth',
    bootstrapped: 'Bootstrapped',
  }

  return labels[stage] ?? stage
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(Math.max(value, min), max)
}

export function truncate(text: string, maxLength = 80): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}
