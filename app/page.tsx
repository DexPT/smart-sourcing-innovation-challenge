'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/appStore'
import { useTranslation } from '@/hooks/useTranslation'
import {
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  Brain,
  Shield,
  Users,
  Building2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
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
    description:
      'Full platform access - procurement approvals, finalist selection, and strategic oversight.',
  },
  {
    role: 'evaluator' as UserRole,
    name: 'Omar Khalid',
    title: 'Innovation Evaluator',
    email: 'omar@chamber.ae',
    code: '362819',
    gradient: 'bg-teal-gradient',
    initials: 'OK',
    description:
      'AI-assisted evaluation, pilot management, and startup scoring across all submissions.',
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
    title: 'Startup Founder - NexusAI',
    email: 'nadia@nexusai.ae',
    code: '204736',
    gradient: 'bg-secondary',
    initials: 'NH',
    description:
      'Submit applications, track evaluation progress, and receive feedback from reviewers.',
  },
]

type Phase = 'select' | 'otp'
type Persona = (typeof PERSONAS)[0]

export default function LoginPage() {
  const router = useRouter()
  const setRole = useAppStore((s) => s.setRole)
  const { t } = useTranslation()

  const FEATURE_STRIP = [
    { icon: Brain,  label: t.login.feature1Title, sub: t.login.feature1Desc },
    { icon: Shield, label: t.login.feature2Title, sub: t.login.feature2Desc },
    { icon: Users,  label: t.login.feature3Title, sub: t.login.feature3Desc },
  ]

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

    if (val && idx < 5) {
      setTimeout(() => inputRefs.current[idx + 1]?.focus(), 0)
    }
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
      return
    }

    setHasError(true)
    setShakeKey((k) => k + 1)
    setOtp(['', '', '', '', '', ''])
    setTimeout(() => inputRefs.current[0]?.focus(), 50)
  }

  const otpFull = otp.every((digit) => digit !== '')

  return (
    <div className="min-h-screen bg-surface">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[430px_1fr]">
        <section className="flex flex-col bg-power-gradient p-6 lg:p-7 xl:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-label-sm font-semibold uppercase tracking-wider text-white/60">
                {t.brand.name}
              </p>
              <p className="text-label-md font-bold text-white">{t.brand.platform}</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center py-8 lg:py-0">
            <p className="mb-3 text-label-sm font-semibold uppercase tracking-[0.22em] text-white/55">
              {t.login.demoAccess}
            </p>
            <h1 className="mb-3 font-display text-display-sm lg:text-display-md font-bold leading-tight text-white">
              {t.login.tagline}
            </h1>
            <p className="max-w-sm text-body-md leading-relaxed text-white">
              {t.login.subtitle}
            </p>

            <div className="mt-6 space-y-2.5">
              {FEATURE_STRIP.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-3 rounded-xl bg-white/10 px-4 py-2.5">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-label-md font-semibold text-white">{label}</p>
                    <p className="text-label-sm text-white/55">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-label-sm text-white/60">{t.login.footer}</p>
        </section>

        <section className="flex items-center justify-center bg-surface-container-low p-6 lg:p-7 xl:p-8">
          <div className="w-full max-w-3xl">
            {phase === 'select' && (
              <div className="animate-fade-in">
                <div className="mb-6 max-w-xl">
                  <p className="mb-2 text-label-sm font-semibold uppercase tracking-[0.22em] text-primary">
                    {t.login.demoAccess}
                  </p>
                  <h2 className="mb-2 font-display text-display-sm text-on-surface">
                    {t.login.selectProfile}
                  </h2>
                  <p className="text-body-md leading-relaxed text-on-surface-variant">
                    {t.login.chooseDemo}
                  </p>
                </div>

                <div className="rounded-[28px] bg-surface p-4 sm:p-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {PERSONAS.map((persona) => (
                      <button
                        key={persona.role}
                        onClick={() => handleSelect(persona)}
                        className="group rounded-2xl bg-surface-container-lowest p-4 text-left transition-all duration-200 hover:bg-white hover:shadow-ambient-sm"
                      >
                        <div className="mb-3 flex items-start gap-3">
                          <div
                            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${persona.gradient}`}
                          >
                            <span className="text-label-md font-bold text-on-primary">
                              {persona.initials}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-title-sm text-on-surface">{persona.name}</p>
                            <p className="truncate text-label-sm text-on-surface-variant">
                              {persona.title}
                            </p>
                          </div>
                        </div>

                        <p className="min-h-[56px] text-body-sm leading-relaxed text-on-surface-variant">
                          {persona.description}
                        </p>

                        <div className="mt-3 flex items-center justify-between border-t border-outline-variant/10 pt-3">
                          <span className="truncate text-label-sm text-on-surface-variant">
                            {persona.email}
                          </span>
                          <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {phase === 'otp' && selected && (
              <div className="animate-fade-in">
                <button
                  onClick={handleBack}
                  className="mb-6 flex items-center gap-1 text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
                >
                  <ChevronLeft className="h-4 w-4" /> {t.common.back}
                </button>

                <div className="rounded-[28px] bg-surface p-5 sm:p-6">
                  <div className="mb-5 flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${selected.gradient}`}
                    >
                      <span className="font-display text-headline-sm font-bold text-on-primary">
                        {selected.initials}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-display text-headline-md text-on-surface">
                        {selected.name}
                      </h2>
                      <p className="text-body-sm text-on-surface-variant">{selected.email}</p>
                    </div>
                  </div>

                  <div className="mb-4 rounded-2xl bg-surface-container-low p-4">
                    <div className="mb-1 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <p className="text-title-sm font-semibold text-on-surface">
                        {t.login.twoFactor}
                      </p>
                    </div>
                    <p className="text-body-sm text-on-surface-variant">
                      {t.login.enterCode}
                    </p>
                  </div>

                  <div
                    key={shakeKey}
                    className={`mb-2 flex gap-2 sm:gap-3 ${hasError ? 'animate-shake' : ''}`}
                    onPaste={handlePaste}
                  >
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          inputRefs.current[idx] = el
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigit(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        disabled={success}
                        className={`aspect-square w-full max-w-[64px] rounded-xl border-2 bg-surface-container-lowest text-center font-display text-headline-sm font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
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

                  <div className="mb-2 h-5">
                    {hasError && (
                      <p className="text-label-sm text-error">{t.login.incorrect}</p>
                    )}
                  </div>

                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/10 bg-primary/[0.06] px-3 py-2.5">
                    <Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                    <p className="text-label-sm text-on-surface-variant">
                      {t.login.demoCode}{' '}
                      <span className="font-mono font-bold tracking-[0.2em] text-primary">
                        {selected.code}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={handleVerify}
                    disabled={!otpFull || success}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-label-md font-semibold transition-all duration-200 ${
                      success
                        ? 'cursor-default bg-secondary text-on-secondary'
                        : otpFull
                          ? 'bg-power-gradient text-on-primary shadow-ambient hover:opacity-90'
                          : 'cursor-not-allowed bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {success ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        {t.login.verified}
                      </>
                    ) : (
                      t.login.verify
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
