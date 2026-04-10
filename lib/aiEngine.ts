import type { Submission, AIScore } from '@/types'

// Deterministic AI scoring engine — simulates AI evaluation logic
// Scores are computed from submission attributes for consistency

function deterministicRandom(seed: string, min = 0, max = 100): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  const normalized = Math.abs(hash) / 2147483647
  return Math.round(min + normalized * (max - min))
}

function scoreRelevance(submission: Submission): number {
  // Higher TRL = more relevant for enterprise sourcing
  const trlScore = (submission.trl / 9) * 40
  // Categories aligned with Dubai Chambers priorities
  const priorityCats = ['smart_city', 'ai_ml', 'fintech', 'sustainability', 'cybersecurity']
  const catBonus = priorityCats.includes(submission.category) ? 20 : 10
  // Seed value from ID for variability
  const variance = deterministicRandom(submission.id + 'relevance', -10, 10)
  return Math.round(Math.min(100, Math.max(20, trlScore + catBonus + 30 + variance)))
}

function scoreFeasibility(submission: Submission): number {
  // Larger teams more feasible
  const teamScore = Math.min(submission.teamSize * 3, 25)
  // Later stage funding = more feasible
  const fundingScores: Record<string, number> = {
    'pre-seed': 10, seed: 20, 'series-a': 30, 'series-b': 40, growth: 50, bootstrapped: 15
  }
  const fundingScore = (fundingScores[submission.fundingStage] ?? 15) * 0.6
  const variance = deterministicRandom(submission.id + 'feasibility', -10, 10)
  return Math.round(Math.min(100, Math.max(20, teamScore + fundingScore + 30 + variance)))
}

function scoreCompliance(submission: Submission): number {
  // UAE-based entities score higher
  const uaeBonus = submission.countryOfOrigin === 'UAE' ? 20 : 5
  const variance = deterministicRandom(submission.id + 'compliance', -15, 15)
  return Math.round(Math.min(100, Math.max(25, 55 + uaeBonus + variance)))
}

function scoreRisk(submission: Submission): number {
  // Lower risk = higher score. Newer tech has higher risk.
  const trlRisk = (submission.trl / 9) * 30 // higher TRL = lower risk
  const variance = deterministicRandom(submission.id + 'risk', -10, 10)
  return Math.round(Math.min(100, Math.max(20, 50 + trlRisk - 10 + variance)))
}

function scoreInnovation(submission: Submission): number {
  const innovationCats = ['ai_ml', 'iot', 'smart_city', 'cybersecurity']
  const catBonus = innovationCats.includes(submission.category) ? 15 : 5
  const variance = deterministicRandom(submission.id + 'innovation', -15, 15)
  return Math.round(Math.min(100, Math.max(30, 55 + catBonus + variance)))
}

function scoreMarketFit(submission: Submission): number {
  const highValueThreshold = 5_000_000 // AED
  const valueBonus = submission.estimatedValue >= highValueThreshold ? 15 : 5
  const variance = deterministicRandom(submission.id + 'marketfit', -10, 10)
  return Math.round(Math.min(100, Math.max(25, 55 + valueBonus + variance)))
}

function generateStrengths(submission: Submission, scores: Partial<AIScore>): string[] {
  const strengths: string[] = []
  if ((scores.relevance ?? 0) >= 70) strengths.push('Highly aligned with Dubai Chambers\' strategic innovation objectives')
  if ((scores.feasibility ?? 0) >= 70) strengths.push('Strong team capability and execution track record')
  if (submission.trl >= 7) strengths.push(`Advanced technology readiness level (TRL ${submission.trl}) reduces deployment risk`)
  if (submission.countryOfOrigin === 'UAE') strengths.push('UAE-based entity ensures regulatory familiarity and faster onboarding')
  if ((scores.innovation ?? 0) >= 70) strengths.push('Innovative approach addresses a critical gap in the current ecosystem')
  if (['series-a', 'series-b', 'growth'].includes(submission.fundingStage)) strengths.push('Well-funded with demonstrated investor confidence')
  if ((scores.marketFit ?? 0) >= 70) strengths.push('Strong market fit with significant estimated business value')
  return strengths.slice(0, 3)
}

function generateWeaknesses(submission: Submission, scores: Partial<AIScore>): string[] {
  const weaknesses: string[] = []
  if ((scores.compliance ?? 0) < 60) weaknesses.push('Compliance documentation requires additional validation against DESC frameworks')
  if (submission.trl < 5) weaknesses.push(`Low TRL (${submission.trl}) indicates early-stage technology with higher deployment uncertainty`)
  if (submission.teamSize < 5) weaknesses.push('Small team size may present delivery capacity constraints at scale')
  if (['pre-seed', 'bootstrapped'].includes(submission.fundingStage)) weaknesses.push('Early funding stage may limit financial capacity for enterprise-scale implementation')
  if ((scores.risk ?? 0) < 55) weaknesses.push('Risk profile requires mitigation planning before full deployment')
  return weaknesses.slice(0, 2)
}

function generateRisks(submission: Submission, scores: Partial<AIScore>): string[] {
  const risks: string[] = []
  if ((scores.risk ?? 0) < 60) risks.push('Technology integration risk with existing Dubai Chambers infrastructure')
  if (submission.countryOfOrigin !== 'UAE') risks.push('Cross-border operational risk and potential data sovereignty concerns')
  if (submission.category === 'cybersecurity') risks.push('Security validation and penetration testing required prior to deployment')
  risks.push('Dependency on regulatory approvals may affect timeline')
  if (submission.trl < 6) risks.push('Prototype maturity risk — additional development cycles may be needed')
  return risks.slice(0, 3)
}

function getRecommendation(overall: number): 'approve' | 'review' | 'reject' {
  if (overall >= 72) return 'approve'
  if (overall >= 50) return 'review'
  return 'reject'
}

function getConfidence(overall: number, variance: number): number {
  // Higher overall scores with less variance = higher confidence
  const base = overall / 100
  const varianceEffect = Math.abs(variance) / 100
  return Math.round((base * 0.7 + (1 - varianceEffect) * 0.3) * 100) / 100
}

function generateReasoning(submission: Submission, scores: Partial<AIScore>, recommendation: string): string {
  const catLabel = getCategoryLabel(submission.category)
  const recText = recommendation === 'approve' ? 'advance to compliance review' : recommendation === 'review' ? 'undergo additional evaluation' : 'not proceed at this stage'
  return `The AI evaluation engine assessed "${submission.title}" by ${submission.company} across six dimensions. ` +
    `The solution operates in the ${catLabel} domain with a Technology Readiness Level of ${submission.trl}/9. ` +
    `Relevance to Dubai Chambers\' strategic priorities scored ${scores.relevance}/100, while feasibility indicators ` +
    `(team size: ${submission.teamSize}, funding: ${submission.fundingStage}) yielded a score of ${scores.feasibility}/100. ` +
    `Compliance pre-screening suggests a ${scores.compliance}/100 alignment with DESC regulatory frameworks. ` +
    `Based on the holistic evaluation, this submission is recommended to ${recText}.`
}

function getCategoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    smart_city: 'Smart City', fintech: 'FinTech', healthtech: 'HealthTech',
    logistics: 'Logistics', sustainability: 'Sustainability', edtech: 'EdTech',
    cybersecurity: 'Cybersecurity', ai_ml: 'AI & ML', iot: 'IoT',
  }
  return labels[cat] ?? cat
}

export function generateAIScore(submission: Submission): AIScore {
  const relevance = scoreRelevance(submission)
  const feasibility = scoreFeasibility(submission)
  const compliance = scoreCompliance(submission)
  const risk = scoreRisk(submission)
  const innovation = scoreInnovation(submission)
  const marketFit = scoreMarketFit(submission)

  const overall = Math.round((relevance * 0.2 + feasibility * 0.2 + compliance * 0.15 + risk * 0.15 + innovation * 0.15 + marketFit * 0.15))
  const recommendation = getRecommendation(overall)
  const variance = deterministicRandom(submission.id + 'var', -20, 20)
  const confidence = getConfidence(overall, variance)

  const scores = { relevance, feasibility, compliance, risk, innovation, marketFit }

  return {
    overall,
    relevance,
    feasibility,
    compliance,
    risk,
    innovation,
    marketFit,
    confidence,
    recommendation,
    reasoning: generateReasoning(submission, scores, recommendation),
    strengths: generateStrengths(submission, scores),
    weaknesses: generateWeaknesses(submission, scores),
    risks: generateRisks(submission, scores),
    generatedAt: new Date().toISOString(),
  }
}

// Simulate AI thinking delay
export function simulateAIDelay(ms = 2000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Get AI recommendation label
export function getAIRecommendationConfig(rec: string) {
  const configs: Record<string, { label: string; bg: string; text: string }> = {
    approve: { label: 'Recommend Approval', bg: 'bg-secondary-container', text: 'text-secondary' },
    review: { label: 'Needs Review', bg: 'bg-warning-container', text: 'text-warning' },
    reject: { label: 'Not Recommended', bg: 'bg-error-container', text: 'text-error' },
  }
  return configs[rec] ?? configs.review
}
