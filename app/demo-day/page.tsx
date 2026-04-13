'use client'
import { useState, useMemo } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/appStore'
import { useRole } from '@/hooks/useRole'
import { formatAED, getCategoryLabel, getScoreColor, getScoreBg } from '@/lib/utils'
import {
  Trophy, Star, MapPin, Calendar, Bot, FlaskConical,
  Crown, CheckCircle2, ArrowRight, Sparkles,
} from 'lucide-react'
import Link from 'next/link'

export default function DemoDayPage() {
  const submissions = useAppStore(s => s.submissions)
  const updateSubmission = useAppStore(s => s.updateSubmission)
  const { currentRole, can } = useRole()

  const finalists = useMemo(
    () => submissions.filter(s => s.status === 'demo_day'),
    [submissions]
  )

  // Local live scores — initialised from AI score or 0
  const [liveScores, setLiveScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(finalists.map(f => [f.id, f.aiScore?.overall ?? 0]))
  )

  const ranked = useMemo(
    () => [...finalists].sort((a, b) => (liveScores[b.id] ?? 0) - (liveScores[a.id] ?? 0)),
    [finalists, liveScores]
  )

  const winner = submissions.find(s => s.winner)
  const canAct = can.approveSubmission

  const handleScoreChange = (id: string, val: number) => {
    setLiveScores(prev => ({ ...prev, [id]: Math.min(100, Math.max(0, val)) }))
  }

  const handleDeclareWinner = (sub: typeof finalists[0]) => {
    // Clear any previous winner, set new
    submissions.filter(s => s.winner).forEach(s => updateSubmission(s.id, { winner: false }))
    updateSubmission(sub.id, {
      winner: true,
      timeline: [
        ...sub.timeline,
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: 'Winner Declared — Demo Day 2026',
          description: `${sub.company} declared the winner of the Dubai Chambers Smart Sourcing Innovation Challenge 2026 with a live panel score of ${liveScores[sub.id] ?? 0}/100.`,
          actorName: 'Ahmed Al-Maktoum',
          actorRole: 'admin' as const,
          type: 'decision' as const,
        },
      ],
    })
  }

  // ── Empty state ───────────────────────────────────────────────
  if (finalists.length === 0) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-power-gradient flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-on-primary" />
          </div>
          <h2 className="font-display text-headline-md text-on-surface mb-1">No finalists confirmed yet</h2>
          <p className="text-body-md text-on-surface-variant max-w-sm mb-6">
            Confirm startups for Demo Day from the Admin Dashboard to populate this page.
          </p>
          <Link href="/dashboard">
            <Button icon={<ArrowRight />} iconPosition="right">Go to Dashboard</Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">

        {/* ── Hero banner ────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-power-gradient px-6 py-8 lg:px-10 lg:py-10">
          {/* decorative circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-white/70" />
                <span className="text-label-sm font-semibold text-white/70 uppercase tracking-wider">
                  Dubai Chambers Smart Sourcing Innovation Challenge
                </span>
              </div>
              <h1 className="font-display text-display-md font-bold text-white leading-tight mb-3">
                Demo Day 2026
              </h1>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1.5 text-white/70">
                  <Calendar className="w-4 h-4" />
                  <span className="text-body-sm">15 May 2026</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/70">
                  <MapPin className="w-4 h-4" />
                  <span className="text-body-sm">Dubai Chamber HQ, Deira</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 lg:gap-6 flex-shrink-0">
              {[
                { label: 'Finalists', value: finalists.length },
                { label: 'Sectors', value: new Set(finalists.map(f => f.category)).size },
                { label: 'Pipeline', value: formatAED(finalists.reduce((s, f) => s + f.estimatedValue, 0)) },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="font-display text-display-sm font-bold text-white">{value}</p>
                  <p className="text-label-sm text-white/60">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Winner banner ──────────────────────────────────────── */}
        {winner && (
          <div className="flex items-center gap-4 rounded-xl bg-secondary-container/60 border border-secondary/20 px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 text-on-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-title-sm font-semibold text-secondary">Winner declared</p>
              <p className="text-body-sm text-on-surface-variant">
                <span className="font-medium text-on-surface">{winner.company}</span>
                {' '}— {winner.title}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getScoreBg(liveScores[winner.id] ?? 0)}`}>
              <span className={`font-display text-title-lg font-bold ${getScoreColor(liveScores[winner.id] ?? 0)}`}>
                {liveScores[winner.id] ?? 0}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Scoring cards ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-title-md font-semibold text-on-surface">
              {canAct ? 'Live Scoring Panel' : 'Finalists'}
            </h2>

            {ranked.map((sub, idx) => {
              const score = liveScores[sub.id] ?? 0
              const isWinner = sub.winner
              const isLeader = idx === 0 && !winner

              return (
                <Card
                  key={sub.id}
                  className={`transition-all duration-200 ${
                    isWinner
                      ? 'ring-2 ring-secondary border-secondary/20'
                      : isLeader && finalists.length > 1
                        ? 'ring-1 ring-primary/20'
                        : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Rank */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-label-lg flex-shrink-0 ${
                      isWinner ? 'bg-secondary text-on-secondary'
                        : idx === 0 ? 'bg-primary text-on-primary'
                          : idx === 1 ? 'bg-surface-container text-on-surface'
                            : 'bg-surface-container-low text-on-surface-variant'
                    }`}>
                      {isWinner ? <Crown className="w-4 h-4" /> : `#${idx + 1}`}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="text-title-sm font-semibold text-on-surface">{sub.company}</p>
                        {isWinner && (
                          <span className="badge bg-secondary-container text-secondary">
                            <Trophy className="w-3 h-3" /> Winner
                          </span>
                        )}
                      </div>
                      <p className="text-body-sm text-on-surface-variant mb-2">{sub.title}</p>

                      <div className="flex flex-wrap gap-3 text-label-sm text-on-surface-variant">
                        <span className="badge bg-surface-container text-on-surface-variant">
                          {getCategoryLabel(sub.category)}
                        </span>
                        {sub.aiScore && (
                          <span className="flex items-center gap-1">
                            <Bot className="w-3 h-3 text-primary" />
                            AI {sub.aiScore.overall}/100
                          </span>
                        )}
                        {sub.pilotId && (
                          <span className="flex items-center gap-1">
                            <FlaskConical className="w-3 h-3 text-secondary" />
                            Pilot completed
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-warning fill-warning" />
                          {formatAED(sub.estimatedValue)}
                        </span>
                      </div>
                    </div>

                    {/* Live score */}
                    <div className="flex flex-col items-center gap-2 flex-shrink-0 sm:min-w-[120px]">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getScoreBg(score)}`}>
                        <span className={`font-display text-headline-md font-bold ${getScoreColor(score)}`}>{score}</span>
                      </div>
                      {canAct && !winner && (
                        <div className="w-full space-y-1">
                          <input
                            type="range"
                            min={0} max={100}
                            value={score}
                            onChange={e => handleScoreChange(sub.id, Number(e.target.value))}
                            className="w-full accent-primary cursor-pointer"
                          />
                          <div className="flex justify-between text-label-sm text-on-surface-variant">
                            <span>0</span><span>100</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {canAct && !winner && isLeader && finalists.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-outline-variant/10">
                      <Button
                        onClick={() => handleDeclareWinner(sub)}
                        icon={<Crown />}
                        className="w-full sm:w-auto"
                      >
                        Declare Winner
                      </Button>
                    </div>
                  )}

                  {canAct && !winner && finalists.length === 1 && (
                    <div className="mt-4 pt-4 border-t border-outline-variant/10">
                      <Button
                        onClick={() => handleDeclareWinner(sub)}
                        icon={<Crown />}
                        className="w-full sm:w-auto"
                      >
                        Declare Winner
                      </Button>
                    </div>
                  )}

                  {isWinner && (
                    <div className="mt-4 pt-4 border-t border-secondary/10 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-secondary" />
                      <p className="text-body-sm text-secondary font-medium">
                        Winner of Dubai Chambers Smart Sourcing Innovation Challenge 2026
                      </p>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>

          {/* ── Leaderboard ────────────────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-title-md font-semibold text-on-surface">Live Leaderboard</h2>
            <Card padding="none">
              <div className="divide-y divide-outline-variant/10">
                {ranked.map((sub, idx) => {
                  const score = liveScores[sub.id] ?? 0
                  return (
                    <div
                      key={sub.id}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        sub.winner ? 'bg-secondary-container/20' : idx === 0 ? 'bg-primary/[0.03]' : ''
                      }`}
                    >
                      <span className={`text-label-md font-bold w-5 text-center flex-shrink-0 ${
                        sub.winner ? 'text-secondary'
                          : idx === 0 ? 'text-primary'
                            : 'text-on-surface-variant'
                      }`}>
                        {sub.winner ? '★' : `${idx + 1}`}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-label-md font-medium text-on-surface truncate">{sub.company}</p>
                        <p className="text-label-sm text-on-surface-variant truncate">{getCategoryLabel(sub.category)}</p>
                      </div>
                      <div className={`text-label-md font-bold px-2 py-0.5 rounded-lg ${getScoreBg(score)} ${getScoreColor(score)}`}>
                        {score}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Scoring guide */}
            <Card>
              <CardTitle className="mb-3">Scoring Criteria</CardTitle>
              <div className="space-y-2">
                {[
                  { label: 'Innovation & Novelty', weight: '25%' },
                  { label: 'Business Viability', weight: '25%' },
                  { label: 'Technical Readiness', weight: '20%' },
                  { label: 'DESC / Compliance Fit', weight: '20%' },
                  { label: 'Presentation Quality', weight: '10%' },
                ].map(({ label, weight }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-label-sm text-on-surface-variant">{label}</span>
                    <span className="text-label-md font-semibold text-on-surface">{weight}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
