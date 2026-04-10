import { cn, getScoreColor, getScoreBg } from '@/lib/utils'
import type { AIScore } from '@/types'
import { getAIRecommendationConfig } from '@/lib/aiEngine'
import { Bot, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

interface AIScorePanelProps {
  score: AIScore
  compact?: boolean
  className?: string
}

interface ScoreDimension {
  label: string
  value: number
  weight: string
}

function ScoreBar({ label, value, weight }: ScoreDimension) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-label-sm text-on-surface-variant">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-label-sm text-on-surface-variant/70">{weight}</span>
          <span className={cn('text-label-md font-semibold', getScoreColor(value))}>{value}</span>
        </div>
      </div>
      <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', value >= 80 ? 'bg-secondary' : value >= 60 ? 'bg-warning' : value >= 40 ? 'bg-primary' : 'bg-error')}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export function AIScorePanel({ score, compact, className }: AIScorePanelProps) {
  const recConfig = getAIRecommendationConfig(score.recommendation)

  const dimensions: ScoreDimension[] = [
    { label: 'Relevance', value: score.relevance, weight: '20%' },
    { label: 'Feasibility', value: score.feasibility, weight: '20%' },
    { label: 'Compliance', value: score.compliance, weight: '15%' },
    { label: 'Risk Profile', value: score.risk, weight: '15%' },
    { label: 'Innovation', value: score.innovation, weight: '15%' },
    { label: 'Market Fit', value: score.marketFit, weight: '15%' },
  ]

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-label-lg', getScoreBg(score.overall), getScoreColor(score.overall))}>
          {score.overall}
        </div>
        <div>
          <p className="text-title-sm text-on-surface">{score.overall}/100</p>
          <span className={cn('badge text-label-sm', recConfig.bg, recConfig.text)}>
            {recConfig.label}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-surface-container" />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 28 * score.overall / 100} ${2 * Math.PI * 28}`}
              strokeLinecap="round"
              className={getScoreColor(score.overall)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn('font-display font-bold text-title-md', getScoreColor(score.overall))}>
              {score.overall}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-4 h-4 text-primary-tint" />
            <span className="text-label-md text-on-surface-variant font-medium">AI Evaluation Score</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('badge', recConfig.bg, recConfig.text)}>{recConfig.label}</span>
            <span className="text-label-sm text-on-surface-variant">
              Confidence: {Math.round(score.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-lg p-3 space-y-3">
        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Score Breakdown</p>
        {dimensions.map((d) => (
          <ScoreBar key={d.label} {...d} />
        ))}
      </div>

      <div className="bg-primary/5 rounded-lg p-3 border-l-2 border-primary">
        <div className="flex items-center gap-1.5 mb-2">
          <Bot className="w-3.5 h-3.5 text-primary" />
          <p className="text-label-sm text-primary font-medium uppercase tracking-wider">AI Reasoning</p>
        </div>
        <p className="text-body-sm text-on-surface-variant leading-relaxed">{score.reasoning}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {score.strengths.length > 0 && (
          <div className="bg-surface-container-low rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
              <p className="text-label-sm text-secondary font-medium uppercase tracking-wider">Strengths</p>
            </div>
            <ul className="space-y-1.5">
              {score.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5 flex-shrink-0">•</span>
                  <span className="text-body-sm text-on-surface-variant">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {score.weaknesses.length > 0 && (
          <div className="bg-surface-container-low rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
              <p className="text-label-sm text-on-surface font-medium uppercase tracking-wider">Areas for Review</p>
            </div>
            <ul className="space-y-1.5">
              {score.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-warning mt-0.5 flex-shrink-0">•</span>
                  <span className="text-body-sm text-on-surface-variant">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {score.risks.length > 0 && (
          <div className="bg-surface-container-low rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <XCircle className="w-3.5 h-3.5 text-error" />
              <p className="text-label-sm text-error font-medium uppercase tracking-wider">Risk Factors</p>
            </div>
            <ul className="space-y-1.5">
              {score.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-error mt-0.5 flex-shrink-0">•</span>
                  <span className="text-body-sm text-on-surface-variant">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="text-label-sm text-on-surface-variant/50 text-right">
        Generated {new Date(score.generatedAt).toLocaleString('en-GB')}
      </p>
    </div>
  )
}

export function AIThinkingState({ label = 'AI is evaluating...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
      <div className="relative w-8 h-8 flex-shrink-0">
        <div className="absolute inset-0 rounded-full bg-primary-tint/20 animate-ping" />
        <div className="relative w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary-tint animate-pulse" />
        </div>
      </div>
      <div>
        <p className="text-label-md text-on-surface font-medium">{label}</p>
        <div className="flex gap-1 mt-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary-tint animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
