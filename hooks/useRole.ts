'use client'
import { useAppStore } from '@/store/appStore'
import type { UserRole, RoleProfile } from '@/types'

export const roleProfiles: RoleProfile[] = [
  {
    id: 'admin',
    label: 'Admin / Decision Maker',
    description: 'Full access to all modules, approvals, and procurement decisions.',
    avatar: 'A',
    initials: 'AM',
    color: 'bg-power-gradient',
  },
  {
    id: 'evaluator',
    label: 'Evaluator',
    description: 'Access to AI evaluation, scoring, and submission review.',
    avatar: 'E',
    initials: 'OK',
    color: 'bg-teal-gradient',
  },
  {
    id: 'compliance',
    label: 'Compliance Officer',
    description: 'Access to compliance checks, vendor validation, and risk management.',
    avatar: 'C',
    initials: 'SA',
    color: 'bg-tertiary',
  },
  {
    id: 'startup',
    label: 'Startup / Vendor',
    description: 'Create and track submissions, view status updates and feedback.',
    avatar: 'S',
    initials: 'NH',
    color: 'bg-secondary',
  },
]

export function useRole() {
  const currentRole = useAppStore((s) => s.currentRole)
  const setRole = useAppStore((s) => s.setRole)

  const profile = roleProfiles.find((r) => r.id === currentRole) ?? roleProfiles[0]

  const can = {
    viewAllSubmissions: currentRole !== 'startup',
    createSubmission: currentRole === 'startup',
    runAIEvaluation: currentRole === 'evaluator' || currentRole === 'admin',
    approveSubmission: currentRole === 'admin',
    rejectSubmission: currentRole === 'evaluator' || currentRole === 'admin',
    runComplianceCheck: currentRole === 'compliance' || currentRole === 'admin',
    manageVendors: currentRole === 'compliance' || currentRole === 'admin',
    managePilots: currentRole === 'evaluator' || currentRole === 'admin',
    manageProcurement: currentRole === 'admin',
    viewInsights: currentRole === 'admin' || currentRole === 'evaluator',
    viewAuditLogs: currentRole === 'admin' || currentRole === 'compliance',
  }

  const navItems = getNavItemsForRole(currentRole)

  return { currentRole, setRole, profile, can, navItems }
}

function getNavItemsForRole(role: UserRole) {
  const allItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', roles: ['admin', 'evaluator', 'compliance', 'startup'] as UserRole[] },
    { id: 'submissions', label: 'Submissions', href: '/submissions', icon: 'FileText', roles: ['admin', 'evaluator', 'compliance', 'startup'] as UserRole[] },
    { id: 'ai-evaluation', label: 'AI Evaluation Hub', href: '/ai-evaluation', icon: 'Brain', roles: ['admin', 'evaluator'] as UserRole[] },
    { id: 'compliance', label: 'Compliance Hub', href: '/compliance', icon: 'ShieldCheck', roles: ['admin', 'compliance'] as UserRole[] },
    { id: 'vendors', label: 'Vendor Registry', href: '/vendors', icon: 'Building2', roles: ['admin', 'compliance', 'evaluator'] as UserRole[] },
    { id: 'pilots', label: 'Pilot Management', href: '/pilots', icon: 'FlaskConical', roles: ['admin', 'evaluator'] as UserRole[] },
    { id: 'procurement', label: 'Procurement', href: '/procurement', icon: 'HandshakeIcon', roles: ['admin'] as UserRole[] },
    { id: 'insights', label: 'Insights & Reports', href: '/insights', icon: 'BarChart3', roles: ['admin', 'evaluator'] as UserRole[] },
    { id: 'audit', label: 'Audit Logs', href: '/audit', icon: 'ClipboardList', roles: ['admin', 'compliance'] as UserRole[] },
  ]

  return allItems.filter((item) => item.roles.includes(role))
}
