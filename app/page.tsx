'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/appStore'
import { ShieldCheck, ArrowRight, ChevronLeft, Brain, Shield, Users, Building2, Sparkles, CheckCircle2 } from 'lucide-react'
import type { UserRole } from '@/types'

const PERSONAS = [
  {
    role: 'admin' as UserRole,
    name: 'Ahmed Al-Maktoum',
    title: 'Admin / Decision Maker',
    email: 'ahmed@chamber.ae',
    code: '847291',
    gradient: 'bg-power-gradient',
    initials: 'AM',
    description: 'Full platform access — procurement approvals, finalist selection, and strategic oversight.',
  },
  {
    role: 'evaluator' as UserRole,
    name: 'Omar Khalid',
    title: 'Innovation Evaluator',
    email: 'omar@chamber.ae',
    code: '362819',
    gradient: 'bg-teal-gradient',
    initials: 'OK',
    description: 'AI-assisted evaluation, pilot management, and startup scoring across all submissions.',
  },
  {
    role: 'compliance' as UserRole,
    name: 'Sara Al-Ansari',
    title: 'Compliance Officer',
    email: 'sara@chamber.ae',
    code: '519047',
    gradient: 'bg-tertiary',
    initials: 'SA',
    description: 'Regulatory checks, DESC-aligned vendor validation, and risk management.',
  },
  {
    role: 'startup' as UserRole,
    name: 'Nadia Hassan',
    title: 'Startup Founder — NexusAI',
    email: 'nadia@nexusai.ae',
    code: '204736',
    gradient: 'bg-secondary',
    initials: 'NH',
    description: 'Submit applications, track evaluation progress, and receive feedback from reviewers.',
  },
]

type Phase = 'select' | 'otp'
type Persona = typeof PERSONAS[0]

export default function LoginPage() {
  const router = useRouter()
  const setRole = useAppStore(s => s.setRole)

  const [phase, setPhase] = useState<Phase>('select')
  const [selected, setSelected] = useState<Persona | null>(null)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [shakeKey, setShakeKey] = useState(0)
  const [hasError, setHasError] = useState(false)
  const [success, setSuccess] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleSelect = (persona: Persona) => {
    setSelected(persona)
    setOtp(['', '', '', '', '', ''])
    setHasError(false)
    setSuccess(false)
    setPhase('otp')
    setTimeout(() => inputRefs.current[0]?.focus(), 80)
  }

  const handleBack = () => {
    setPhase('select')
    setOtp(['', '', '', '', '', ''])
    setHasError(false)
    setSuccess(false)
  }

  const handleDigit = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    setHasError(false)
    if (val && idx < 5) setTimeout(() => inputRefs.current[idx + 1]?.focus(), 0)
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtp(text.split(''))
      setHasError(false)
      setTimeout(() => inputRefs.current[5]?.focus(), 0)
    }
  }

  const handleVerify = () => {
    if (!selected) return
    const entered = otp.join('')
    if (entered === selected.code) {
      setSuccess(true)
      setTimeout(() => {
        setRole(selected.role)
        router.push('/dashboard')
      }, 900)
    } else {
      setHasError(true)
      setShakeKey(k => k + 1)
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    }
  }

  const otpFull = otp.every(d => d !== '')

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface">

      {/* ── Left branding panel ─────────────────────────────────── */}
      <div className="lg:w-[420px] xl:w-[480px] flex-shrink-0 bg-power-gradient flex flex-col p-6 lg:p-10 xl:p-12">
        {/* Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-label-sm font-semibold text-white/60 uppercase tracking-wider">Dubai Chambers</p>
            <p className="text-label-md font-bold text-white">Innovation Platform</p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="flex-1 flex flex-col justify-center py-10">
          <h1 className="font-display text-display-md font-bold text-white leading-tight mb-3">
            Smart Sourcing<br />Innovation Hub
          </h1>
          <p className="text-body-md text-white/65 leading-relaxed max-w-xs">
            AI-powered startup evaluation and procurement platform for Dubai Chambers innovation programmes.
          </p>

          <div className="mt-8 space-y-4">
            {[
              { Icon: Brain,  label: 'AI-Powered Evaluation',  sub: 'Automated scoring & risk assessment' },
              { Icon: Shield, label: 'DESC Compliance',         sub: 'UAE AI security policy aligned' },
              { Icon: Users,  label: 'Multi-Role Workflows',    sub: 'Evaluators, compliance & admin' },
            ].map(({ Icon, label, sub }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-label-md font-semibold text-white">{label}</p>
                  <p className="text-label-sm text-white/55">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-label-sm text-white/35">© 2026 Dubai Chambers · Prototype Demo</p>
      </div>

      {/* ── Right auth panel ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 xl:p-12">
        <div className="w-full max-w-lg">

          {/* ── Phase 1: User selection ── */}
          {phase === 'select' && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h2 className="font-display text-headline-md text-on-surface mb-1">Select your profile</h2>
                <p className="text-body-md text-on-surface-variant">
                  Choose a demo user to explore their personalised view of the platform.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PERSONAS.map(persona => (
                  <button
                    key={persona.role}
                    onClick={() => handleSelect(persona)}
                    className="group text-left rounded-xl p-4 bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/30 hover:shadow-ambient-sm transition-all duration-150"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl ${persona.gradient} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-label-md font-bold text-on-primary">{persona.initials}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-title-sm text-on-surface truncate">{persona.name}</p>
                        <p className="text-label-sm text-on-surface-variant truncate">{persona.title}</p>
                      </div>
                    </div>
                    <p className="text-label-sm text-on-surface-variant leading-relaxed mb-3 line-clamp-2">
                      {persona.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-label-sm text-on-surface-variant/60 truncate">{persona.email}</span>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Phase 2: 2FA ── */}
          {phase === 'otp' && selected && (
            <div className="animate-fade-in">
              {/* Back */}
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface transition-colors mb-6"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {/* Selected user */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl ${selected.gradient} flex items-center justify-center flex-shrink-0`}>
                  <span className="font-display text-headline-sm font-bold text-on-primary">{selected.initials}</span>
                </div>
                <div>
                  <h2 className="font-display text-headline-md text-on-surface">{selected.name}</h2>
                  <p className="text-body-sm text-on-surface-variant">{selected.email}</p>
                </div>
              </div>

              {/* 2FA header */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <p className="text-title-sm font-semibold text-on-surface">Two-factor authentication</p>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Enter the 6-digit verification code sent to your registered device.
                </p>
              </div>

              {/* OTP input row */}
              <div
                key={shakeKey}
                className={`flex gap-2 mb-2 ${hasError ? 'animate-shake' : ''}`}
                onPaste={handlePaste}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { inputRefs.current[idx] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleDigit(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    disabled={success}
                    className={`w-full aspect-square max-w-[56px] text-center font-display text-headline-sm font-bold rounded-xl border-2 bg-surface-container-lowest transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      success
                        ? 'border-secondary bg-secondary-container/30 text-secondary'
                        : hasError
                          ? 'border-error bg-error-container/20 text-error'
                          : digit
                            ? 'border-primary/50 text-on-surface'
                            : 'border-outline-variant/30 text-on-surface focus:border-primary'
                    }`}
                  />
                ))}
              </div>

              {/* Error / spacer */}
              <div className="h-5 mb-3">
                {hasError && (
                  <p className="text-label-sm text-error">Incorrect code. Please try again.</p>
                )}
              </div>

              {/* Demo hint */}
              <div className="flex items-center gap-2 mb-5 px-3 py-2.5 rounded-lg bg-primary/[0.06] border border-primary/10">
                <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <p className="text-label-sm text-on-surface-variant">
                  Demo code:{' '}
                  <span className="font-mono font-bold text-primary tracking-[0.2em]">{selected.code}</span>
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={handleVerify}
                disabled={!otpFull || success}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-label-md transition-all duration-200 flex items-center justify-center gap-2 ${
                  success
                    ? 'bg-secondary text-on-secondary cursor-default'
                    : otpFull
                      ? 'bg-power-gradient text-on-primary hover:opacity-90 shadow-ambient'
                      : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
                }`}
              >
                {success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Verified — Redirecting…
                  </>
                ) : (
                  'Verify & Sign In'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
