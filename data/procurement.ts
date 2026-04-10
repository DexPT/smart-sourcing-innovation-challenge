import type { ProcurementDecision } from '@/types'

export const procurementDecisions: ProcurementDecision[] = [
  {
    id: 'proc-001',
    submissionId: 'sub-007',
    pilotId: 'plt-002',
    vendorId: 'ven-004',
    vendorName: 'Compliant Systems Ltd',
    title: 'FinVerify KYC/AML Platform — Enterprise License',
    status: 'pending_approval',
    contractValue: 22000000,
    contractDuration: 36,
    startDate: '2026-05-01',
    endDate: '2029-04-30',
    approvedBy: 'Ahmed Al-Maktoum',
    procurementType: 'pilot_to_contract',
    notes: 'Following exceptional pilot results (94/100 score, all KPIs exceeded), procurement committee has approved initiating full contract negotiation. Contract value includes implementation, licensing, and 3-year support.',
    createdAt: '2026-03-15T11:00:00Z',
  },
  {
    id: 'proc-002',
    submissionId: 'sub-005',
    vendorId: 'ven-003',
    vendorName: 'SecureNet Arabia',
    title: 'CyberShield Zero-Trust Platform — Framework Agreement',
    status: 'approved',
    contractValue: 18000000,
    contractDuration: 48,
    startDate: '2026-06-01',
    endDate: '2030-05-31',
    approvedBy: 'Ahmed Al-Maktoum',
    approvedAt: '2026-04-09T10:00:00Z',
    procurementType: 'direct',
    notes: 'Direct procurement approved given pre-certified DESC/NESA compliance status. Framework agreement covers initial deployment plus expansion to all Dubai Chambers facilities. Includes 4-year managed service contract.',
    createdAt: '2026-04-08T14:00:00Z',
  },
]

export function getProcurementById(id: string): ProcurementDecision | undefined {
  return procurementDecisions.find(p => p.id === id)
}

export function getProcurementBySubmissionId(submissionId: string): ProcurementDecision | undefined {
  return procurementDecisions.find(p => p.submissionId === submissionId)
}

export function getProcurementStats() {
  const total = procurementDecisions.length
  const totalValue = procurementDecisions.reduce((sum, p) => sum + p.contractValue, 0)
  const approved = procurementDecisions.filter(p => p.status === 'approved').length
  const pending = procurementDecisions.filter(p => p.status === 'pending_approval').length
  return { total, totalValue, approved, pending }
}
