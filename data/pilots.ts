import type { Pilot } from '@/types'

export const pilots: Pilot[] = [
  {
    id: 'plt-001',
    submissionId: 'sub-003',
    vendorId: 'ven-002',
    title: 'SmartPort Autonomous Logistics Pilot — Jebel Ali FZ',
    description: 'A 90-day pilot deployment of the SmartPort autonomous management system at Jebel Ali Free Zone, targeting 40% reduction in vehicle dwell time and 72-hour predictive maintenance capability.',
    status: 'active',
    phase: 'execution',
    startDate: '2026-03-01T08:00:00Z',
    endDate: '2026-05-29T17:00:00Z',
    budget: 1500000,
    spentBudget: 680000,
    progress: 48,
    kpis: [
      { id: 'kpi-001', metric: 'Vehicle Dwell Time Reduction', target: 40, current: 31, unit: '%', achieved: false },
      { id: 'kpi-002', metric: 'Equipment Failure Prediction Accuracy', target: 85, current: 89, unit: '%', achieved: true },
      { id: 'kpi-003', metric: 'System Uptime', target: 99.5, current: 99.8, unit: '%', achieved: true },
      { id: 'kpi-004', metric: 'Operational Cost Reduction', target: 20, current: 14, unit: '%', achieved: false },
      { id: 'kpi-005', metric: 'IoT Sensor Network Coverage', target: 100, current: 100, unit: '%', achieved: true },
    ],
    milestones: [
      { id: 'ms-001', title: 'Infrastructure Setup & IoT Deployment', dueDate: '2026-03-15T17:00:00Z', completedAt: '2026-03-13T16:00:00Z', status: 'completed', description: 'Deploy IoT sensor network across 12 berths and install central control infrastructure.' },
      { id: 'ms-002', title: 'System Integration & Testing', dueDate: '2026-03-31T17:00:00Z', completedAt: '2026-03-29T15:00:00Z', status: 'completed', description: 'Integrate with JAFZA\'s existing TOS and complete end-to-end system testing.' },
      { id: 'ms-003', title: 'Live Operations Commencement', dueDate: '2026-04-01T08:00:00Z', completedAt: '2026-04-01T09:30:00Z', status: 'completed', description: 'Begin live autonomous operations on 4 priority berths.' },
      { id: 'ms-004', title: 'Mid-Pilot Review & Optimization', dueDate: '2026-04-15T17:00:00Z', status: 'in_progress', description: 'Evaluate KPI progress, optimize ML models, expand to remaining 8 berths.' },
      { id: 'ms-005', title: 'Full Deployment Completion', dueDate: '2026-05-15T17:00:00Z', status: 'upcoming', description: 'Complete deployment across all 12 berths with full autonomous operations.' },
      { id: 'ms-006', title: 'Pilot Evaluation & Reporting', dueDate: '2026-05-29T17:00:00Z', status: 'upcoming', description: 'Final KPI assessment, lessons learned documentation, and recommendation report.' },
    ],
    stakeholders: ['Ahmed Al-Maktoum (Admin)', 'Omar Khalid (Lead Evaluator)', 'JAFZA Operations Director', 'PortTech Project Team'],
    leadEvaluatorId: 'usr-eval-01',
    leadEvaluatorName: 'Omar Khalid',
    createdAt: '2026-02-25T09:00:00Z',
    updatedAt: '2026-04-10T08:00:00Z',
    notes: 'Pilot progressing well. Equipment prediction KPI already exceeding target. Dwell time reduction on track — expect to meet 40% target by end of Phase 2.',
  },
  {
    id: 'plt-002',
    submissionId: 'sub-007',
    vendorId: 'ven-004',
    title: 'FinVerify KYC/AML Automation Pilot — Dubai Chambers Finance',
    description: 'A 60-day pilot of the FinVerify automated compliance platform within Dubai Chambers\' member onboarding process, targeting 90% reduction in manual KYC processing time.',
    status: 'completed',
    phase: 'reporting',
    startDate: '2026-01-28T08:00:00Z',
    endDate: '2026-03-28T17:00:00Z',
    budget: 800000,
    spentBudget: 762000,
    progress: 100,
    kpis: [
      { id: 'kpi-010', metric: 'KYC Processing Time Reduction', target: 90, current: 94, unit: '%', achieved: true },
      { id: 'kpi-011', metric: 'False Positive AML Rate', target: 5, current: 2.8, unit: '%', achieved: true },
      { id: 'kpi-012', metric: 'Customer Satisfaction Score', target: 80, current: 87, unit: '/100', achieved: true },
      { id: 'kpi-013', metric: 'Regulatory Compliance Rate', target: 100, current: 100, unit: '%', achieved: true },
      { id: 'kpi-014', metric: 'System Uptime', target: 99.9, current: 99.97, unit: '%', achieved: true },
    ],
    milestones: [
      { id: 'ms-010', title: 'System Integration', dueDate: '2026-02-07T17:00:00Z', completedAt: '2026-02-06T15:00:00Z', status: 'completed', description: 'Integrate FinVerify API with Chamber member portal.' },
      { id: 'ms-011', title: 'Parallel Operations Testing', dueDate: '2026-02-21T17:00:00Z', completedAt: '2026-02-20T14:00:00Z', status: 'completed', description: 'Run automated and manual KYC in parallel to validate accuracy.' },
      { id: 'ms-012', title: 'Full Automated Operations', dueDate: '2026-02-28T17:00:00Z', completedAt: '2026-02-28T09:00:00Z', status: 'completed', description: 'Switch to fully automated KYC processing.' },
      { id: 'ms-013', title: 'Pilot Evaluation', dueDate: '2026-03-28T17:00:00Z', completedAt: '2026-03-28T15:00:00Z', status: 'completed', description: 'Final assessment of all KPIs and stakeholder feedback.' },
    ],
    stakeholders: ['Ahmed Al-Maktoum (Admin)', 'Omar Khalid (Lead Evaluator)', 'Dubai Chambers Finance Team', 'Compliant Systems Implementation Team'],
    leadEvaluatorId: 'usr-eval-01',
    leadEvaluatorName: 'Omar Khalid',
    createdAt: '2026-01-22T10:00:00Z',
    updatedAt: '2026-03-28T15:00:00Z',
    notes: 'Outstanding pilot results. All 5 KPIs achieved, with most significantly exceeding targets. Unanimous recommendation to proceed to full procurement.',
    finalScore: 94,
    recommendation: 'proceed',
  },
]

export function getPilotById(id: string): Pilot | undefined {
  return pilots.find(p => p.id === id)
}

export function getPilotBySubmissionId(submissionId: string): Pilot | undefined {
  return pilots.find(p => p.submissionId === submissionId)
}

export function getPilotStats() {
  const total = pilots.length
  const active = pilots.filter(p => p.status === 'active').length
  const completed = pilots.filter(p => p.status === 'completed').length
  const avgProgress = Math.round(pilots.reduce((sum, p) => sum + p.progress, 0) / pilots.length)
  const totalBudget = pilots.reduce((sum, p) => sum + p.budget, 0)
  return { total, active, completed, avgProgress, totalBudget }
}
