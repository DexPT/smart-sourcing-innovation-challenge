// ============================================================
// ROLES
// ============================================================
export type UserRole = 'startup' | 'evaluator' | 'compliance' | 'admin'

export interface RoleProfile {
  id: UserRole
  label: string
  description: string
  avatar: string
  initials: string
  color: string
}

// ============================================================
// SUBMISSION
// ============================================================
export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'ai_review'
  | 'evaluation'
  | 'compliance_check'
  | 'approved'
  | 'finalist'
  | 'demo_day'
  | 'pilot'
  | 'procurement'
  | 'rejected'
  | 'archived'

export type SubmissionCategory =
  | 'smart_city'
  | 'fintech'
  | 'healthtech'
  | 'logistics'
  | 'sustainability'
  | 'edtech'
  | 'cybersecurity'
  | 'ai_ml'
  | 'iot'

export type SubmissionSource =
  | 'direct'
  | 'referral'
  | 'event'
  | 'partner'
  | 'government'
  | 'accelerator'

export interface Submission {
  id: string
  title: string
  company: string
  contactName: string
  contactEmail: string
  category: SubmissionCategory
  status: SubmissionStatus
  submittedAt: string
  updatedAt: string
  description: string
  problem: string
  solution: string
  trl: number // Technology Readiness Level 1-9
  teamSize: number
  fundingStage: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'growth' | 'bootstrapped'
  estimatedValue: number // AED
  countryOfOrigin: string
  tags: string[]
  source: SubmissionSource
  sourceDetail?: string
  aiScore?: AIScore
  complianceResult?: ComplianceResult
  pilotId?: string
  procurementId?: string
  attachments: Attachment[]
  timeline: TimelineEvent[]
  feedback?: string
}

// ============================================================
// AI EVALUATION
// ============================================================
export interface AIScore {
  overall: number // 0-100
  relevance: number
  feasibility: number
  compliance: number
  risk: number
  innovation: number
  marketFit: number
  confidence: number // 0-1
  recommendation: 'approve' | 'review' | 'reject'
  reasoning: string
  strengths: string[]
  weaknesses: string[]
  risks: string[]
  generatedAt: string
}

// ============================================================
// COMPLIANCE
// ============================================================
export type ComplianceStatus = 'pending' | 'in_progress' | 'passed' | 'failed' | 'conditional'

export interface ComplianceCheck {
  id: string
  name: string
  category: 'data_privacy' | 'cybersecurity' | 'financial' | 'legal' | 'operational' | 'environmental'
  status: 'pass' | 'fail' | 'warning' | 'pending'
  description: string
  details: string
  regulation?: string
  severity: 'critical' | 'high' | 'medium' | 'low'
}

export interface ComplianceResult {
  id: string
  submissionId: string
  status: ComplianceStatus
  officerId: string
  officerName: string
  startedAt: string
  completedAt?: string
  checks: ComplianceCheck[]
  notes: string
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
  descAligned: boolean
  conditions?: string[]
}

// ============================================================
// VENDOR
// ============================================================
export type VendorStatus = 'pending' | 'active' | 'suspended' | 'blacklisted'
export type VendorTier = 'preferred' | 'approved' | 'provisional' | 'unregistered'

export interface Vendor {
  id: string
  name: string
  legalName: string
  type: 'startup' | 'sme' | 'enterprise' | 'research'
  industry: string
  country: string
  emirate?: string
  status: VendorStatus
  tier: VendorTier
  registeredAt: string
  licenseNumber?: string
  vatNumber?: string
  contactName: string
  contactEmail: string
  contactPhone: string
  website?: string
  description: string
  specializations: string[]
  certifications: string[]
  descCertified: boolean
  completionRate: number // % of past projects completed
  averageScore: number // 0-100
  activeContracts: number
  totalContracts: number
  totalValue: number // AED
  tags: string[]
}

// ============================================================
// PILOT
// ============================================================
export type PilotStatus = 'planned' | 'active' | 'paused' | 'completed' | 'cancelled'
export type PilotPhase = 'setup' | 'execution' | 'evaluation' | 'reporting'

export interface PilotMilestone {
  id: string
  title: string
  dueDate: string
  completedAt?: string
  status: 'upcoming' | 'in_progress' | 'completed' | 'overdue'
  description: string
}

export interface Pilot {
  id: string
  submissionId: string
  vendorId: string
  title: string
  description: string
  status: PilotStatus
  phase: PilotPhase
  startDate: string
  endDate: string
  budget: number // AED
  spentBudget: number
  progress: number // 0-100
  kpis: PilotKPI[]
  milestones: PilotMilestone[]
  stakeholders: string[]
  leadEvaluatorId: string
  leadEvaluatorName: string
  createdAt: string
  updatedAt: string
  notes: string
  finalScore?: number
  recommendation?: 'proceed' | 'modify' | 'terminate'
}

export interface PilotKPI {
  id: string
  metric: string
  target: number
  current: number
  unit: string
  achieved: boolean
}

// ============================================================
// PROCUREMENT
// ============================================================
export type ProcurementStatus = 'pending_approval' | 'approved' | 'contracted' | 'active' | 'completed' | 'cancelled'

export interface ProcurementDecision {
  id: string
  submissionId: string
  pilotId?: string
  vendorId: string
  vendorName: string
  title: string
  status: ProcurementStatus
  contractValue: number // AED
  contractDuration: number // months
  startDate: string
  endDate: string
  approvedBy: string
  approvedAt?: string
  procurementType: 'direct' | 'tender' | 'framework' | 'pilot_to_contract'
  notes: string
  createdAt: string
}

// ============================================================
// AUDIT
// ============================================================
export interface AuditLog {
  id: string
  entityType: 'submission' | 'vendor' | 'pilot' | 'procurement' | 'compliance' | 'user'
  entityId: string
  entityTitle: string
  action: string
  actorId: string
  actorName: string
  actorRole: UserRole
  timestamp: string
  details: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}

// ============================================================
// SHARED
// ============================================================
export interface TimelineEvent {
  id: string
  timestamp: string
  title: string
  description: string
  actorName: string
  actorRole: UserRole
  type: 'status_change' | 'comment' | 'document' | 'decision' | 'ai_event' | 'compliance' | 'system'
}

export interface Attachment {
  id: string
  name: string
  type: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'jpg' | 'png'
  size: string
  uploadedAt: string
  uploadedBy: string
}

// ============================================================
// DASHBOARD KPIs
// ============================================================
export interface KPIMetric {
  id: string
  label: string
  value: string | number
  unit?: string
  change: number // percentage
  trend: 'up' | 'down' | 'flat'
  icon: string
}

// ============================================================
// FILTERS
// ============================================================
export interface FilterState {
  search: string
  status: string[]
  category: string[]
  dateRange: { from: string; to: string } | null
  sort: string
  order: 'asc' | 'desc'
}
