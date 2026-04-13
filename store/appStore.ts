'use client'
import { create } from 'zustand'
import type { UserRole, Submission, FilterState, ComplianceResult, Pilot } from '@/types'
import { submissions as initialSubmissions } from '@/data/submissions'
import { complianceResults as initialComplianceResults } from '@/data/compliance'
import { pilots as initialPilots } from '@/data/pilots'
import { generateAIScore } from '@/lib/aiEngine'

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
  activeNotifications: number
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
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
    })),

  addSubmission: (sub) =>
    set((state) => ({
      submissions: [sub, ...state.submissions],
    })),

  complianceResults: initialComplianceResults,

  updateComplianceResult: (id, updates) =>
    set((state) => ({
      complianceResults: state.complianceResults.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  pilots: initialPilots,

  updatePilot: (id, updates) =>
    set((state) => ({
      pilots: state.pilots.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    })),

  runningAIEvaluation: null,

  startAIEvaluation: async (submissionId) => {
    set({ runningAIEvaluation: submissionId })
    const { submissions, updateSubmission } = get()
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

  activeNotifications: 4,
}))
