'use client'
import { create } from 'zustand'
import type {
  UserRole,
  Submission,
  FilterState,
  ComplianceResult,
  Pilot,
  ProcurementDecision,
  Notification,
  SubmissionStatus,
} from '@/types'
import { submissions as initialSubmissions } from '@/data/submissions'
import { complianceResults as initialComplianceResults } from '@/data/compliance'
import { pilots as initialPilots } from '@/data/pilots'
import { procurementDecisions as initialProcurementDecisions } from '@/data/procurement'
import { generateAIScore } from '@/lib/aiEngine'

type NotificationInput = Omit<Notification, 'id' | 'timestamp' | 'read'> & Partial<Pick<Notification, 'id' | 'timestamp' | 'read'>>

interface AppState {
  // Role management
  currentRole: UserRole
  setRole: (role: UserRole) => void

  // Submissions
  submissions: Submission[]
  updateSubmission: (id: string, updates: Partial<Submission>) => void
  addSubmission: (sub: Submission) => void

  // Compliance results
  complianceResults: ComplianceResult[]
  updateComplianceResult: (id: string, updates: Partial<ComplianceResult>) => void

  // Pilots
  pilots: Pilot[]
  updatePilot: (id: string, updates: Partial<Pilot>) => void

  // Procurement decisions
  procurementDecisions: ProcurementDecision[]
  updateProcurementDecision: (id: string, updates: Partial<ProcurementDecision>) => void

  // Notifications
  notifications: Notification[]
  addNotification: (notification: NotificationInput) => void
  markAllRead: () => void

  // AI evaluation
  runningAIEvaluation: string | null
  startAIEvaluation: (submissionId: string) => Promise<void>

  // Global filters
  filters: FilterState
  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void

  // UI state
  sidebarOpen: boolean
  toggleSidebar: () => void
  globalSearchQuery: string
  setGlobalSearch: (q: string) => void
}

const defaultFilters: FilterState = {
  search: '',
  status: [],
  category: [],
  dateRange: null,
  sort: 'updatedAt',
  order: 'desc',
}

export const useAppStore = create<AppState>((set, get) => ({
  currentRole: 'admin',
  setRole: (role) => set({ currentRole: role }),

  submissions: initialSubmissions,

  updateSubmission: (id, updates) =>
    set((state) => {
      const now = new Date().toISOString()
      const previousSubmission = state.submissions.find((s) => s.id === id)
      const nextStatus = updates.status

      const notifications =
        previousSubmission &&
        nextStatus &&
        previousSubmission.status !== nextStatus &&
        ['approved', 'rejected', 'finalist', 'demo_day'].includes(nextStatus)
          ? [
              {
                id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                title: getSubmissionStatusNotificationTitle(nextStatus),
                body: `${previousSubmission.company} - ${previousSubmission.title}`,
                href: `/submissions/${previousSubmission.id}`,
                timestamp: now,
                read: false,
              },
              ...state.notifications,
            ]
          : state.notifications

      return {
        submissions: state.submissions.map((s) =>
          s.id === id ? { ...s, ...updates, updatedAt: now } : s
        ),
        notifications: notifications.slice(0, 20),
      }
    }),

  addSubmission: (sub) =>
    set((state) => ({
      submissions: [sub, ...state.submissions],
    })),

  complianceResults: initialComplianceResults,

  updateComplianceResult: (id, updates) =>
    set((state) => {
      const existingResult = state.complianceResults.find((c) => c.id === id)
      const relatedSubmission = state.submissions.find((s) => s.id === existingResult?.submissionId)
      const nextStatus = updates.status
      const now = new Date().toISOString()

      const notifications =
        existingResult &&
        relatedSubmission &&
        nextStatus &&
        existingResult.status !== nextStatus
          ? [
              {
                id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                title: getComplianceNotificationTitle(nextStatus),
                body: `${relatedSubmission.title} - ${relatedSubmission.company}`,
                href: `/compliance/${existingResult.id}`,
                timestamp: now,
                read: false,
              },
              ...state.notifications,
            ]
          : state.notifications

      return {
        complianceResults: state.complianceResults.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
        notifications: notifications.slice(0, 20),
      }
    }),

  pilots: initialPilots,

  updatePilot: (id, updates) =>
    set((state) => {
      const now = new Date().toISOString()
      const existingPilot = state.pilots.find((p) => p.id === id)
      const relatedSubmission = state.submissions.find((s) => s.id === existingPilot?.submissionId)
      const nextStatus = updates.status

      const notifications =
        existingPilot &&
        relatedSubmission &&
        nextStatus &&
        existingPilot.status !== nextStatus
          ? [
              {
                id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                title: getPilotNotificationTitle(nextStatus),
                body: `${existingPilot.title} - ${relatedSubmission.company}`,
                href: `/pilots/${existingPilot.id}`,
                timestamp: now,
                read: false,
              },
              ...state.notifications,
            ]
          : state.notifications

      return {
        pilots: state.pilots.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: now } : p
        ),
        notifications: notifications.slice(0, 20),
      }
    }),

  procurementDecisions: initialProcurementDecisions,

  updateProcurementDecision: (id, updates) =>
    set((state) => {
      const now = new Date().toISOString()
      const existingDecision = state.procurementDecisions.find((d) => d.id === id)
      const relatedSubmission = state.submissions.find((s) => s.id === existingDecision?.submissionId)
      const nextStatus = updates.status

      const notifications =
        existingDecision &&
        relatedSubmission &&
        nextStatus &&
        existingDecision.status !== nextStatus
          ? [
              {
                id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                title: getProcurementNotificationTitle(nextStatus),
                body: `${existingDecision.title} - ${relatedSubmission.company}`,
                href: `/procurement`,
                timestamp: now,
                read: false,
              },
              ...state.notifications,
            ]
          : state.notifications

      return {
        procurementDecisions: state.procurementDecisions.map((d) =>
          d.id === id ? { ...d, ...updates } : d
        ),
        notifications: notifications.slice(0, 20),
      }
    }),

  notifications: [],

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          id: notification.id ?? `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: notification.title,
          body: notification.body,
          href: notification.href,
          timestamp: notification.timestamp ?? new Date().toISOString(),
          read: notification.read ?? false,
        },
        ...state.notifications,
      ].slice(0, 20),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    })),

  runningAIEvaluation: null,

  startAIEvaluation: async (submissionId) => {
    set({ runningAIEvaluation: submissionId })
    const { submissions, updateSubmission, addNotification } = get()
    const submission = submissions.find((s) => s.id === submissionId)
    if (!submission) {
      set({ runningAIEvaluation: null })
      return
    }

    // Update status to AI review
    updateSubmission(submissionId, { status: 'ai_review' })

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // Generate AI score
    const aiScore = generateAIScore(submission)

    // Add timeline event
    const timelineEvent = {
      id: `tl-ai-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: 'AI Evaluation Complete',
      description: `AI scored ${aiScore.overall}/100. Recommendation: ${aiScore.recommendation}. Confidence: ${Math.round(aiScore.confidence * 100)}%.`,
      actorName: 'AI Engine',
      actorRole: 'evaluator' as const,
      type: 'ai_event' as const,
    }

    updateSubmission(submissionId, {
      aiScore,
      status: 'evaluation',
      timeline: [...(submission.timeline ?? []), timelineEvent],
    })

    addNotification({
      title: 'AI evaluation complete',
      body: `${submission.title} scored ${aiScore.overall}/100 and is ready for evaluator review.`,
      href: `/submissions/${submissionId}`,
    })

    set({ runningAIEvaluation: null })
  },

  filters: defaultFilters,
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),

  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  globalSearchQuery: '',
  setGlobalSearch: (q) => set({ globalSearchQuery: q }),
}))

function getSubmissionStatusNotificationTitle(status: SubmissionStatus): string {
  const titles: Partial<Record<SubmissionStatus, string>> = {
    approved: 'Submission approved',
    rejected: 'Submission rejected',
    finalist: 'Submission selected as finalist',
    demo_day: 'Submission confirmed for Demo Day',
  }

  return titles[status] ?? 'Submission updated'
}

function getComplianceNotificationTitle(status: ComplianceResult['status']): string {
  const titles: Partial<Record<ComplianceResult['status'], string>> = {
    passed: 'Compliance approved',
    conditional: 'Conditional compliance approval',
    failed: 'Compliance review blocked submission',
    in_progress: 'Compliance review started',
    pending: 'Compliance review pending',
  }

  return titles[status] ?? 'Compliance review updated'
}

function getPilotNotificationTitle(status: Pilot['status']): string {
  const titles: Record<Pilot['status'], string> = {
    planned: 'Pilot scheduled',
    active: 'Pilot active',
    paused: 'Pilot paused',
    completed: 'Pilot completed',
    cancelled: 'Pilot cancelled',
  }

  return titles[status]
}

function getProcurementNotificationTitle(status: ProcurementDecision['status']): string {
  const titles: Record<ProcurementDecision['status'], string> = {
    pending_approval: 'Procurement awaiting approval',
    approved: 'Procurement approved',
    contracted: 'Contract signed',
    active: 'Contract active',
    completed: 'Procurement completed',
    cancelled: 'Procurement cancelled',
  }

  return titles[status]
}
