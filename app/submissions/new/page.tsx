'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/appStore'
import { getCategoryLabel } from '@/lib/utils'
import type { Submission, SubmissionCategory } from '@/types'
import { ChevronRight, Upload, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES: SubmissionCategory[] = ['ai_ml', 'fintech', 'healthtech', 'logistics', 'sustainability', 'edtech', 'cybersecurity', 'smart_city', 'iot']
const FUNDING_STAGES = ['pre-seed', 'seed', 'series-a', 'series-b', 'growth', 'bootstrapped']
const TRL_DESCRIPTIONS: Record<number, string> = {
  1: 'Basic principles observed', 2: 'Technology concept formulated', 3: 'Experimental proof of concept',
  4: 'Technology validated in lab', 5: 'Technology validated in relevant environment',
  6: 'Technology demonstrated in relevant environment', 7: 'System prototype in operational environment',
  8: 'System complete and qualified', 9: 'Actual system proven in operational environment',
}

export default function NewSubmissionPage() {
  const router = useRouter()
  const addSubmission = useAppStore(s => s.addSubmission)
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [newSubId, setNewSubId] = useState('')

  const [form, setForm] = useState({
    title: '', company: '', contactName: '', contactEmail: '',
    category: 'ai_ml' as SubmissionCategory,
    description: '', problem: '', solution: '',
    trl: 5, teamSize: 10,
    fundingStage: 'seed' as Submission['fundingStage'],
    estimatedValue: 1000000, countryOfOrigin: 'UAE',
    tags: '',
  })

  const update = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = () => {
    const id = `sub-${Date.now()}`
    const newSub: Submission = {
      id,
      title: form.title || 'Untitled Submission',
      company: form.company || 'Your Company',
      contactName: form.contactName,
      contactEmail: form.contactEmail,
      category: form.category,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: form.description,
      problem: form.problem,
      solution: form.solution,
      trl: form.trl,
      teamSize: form.teamSize,
      fundingStage: form.fundingStage,
      estimatedValue: form.estimatedValue,
      countryOfOrigin: form.countryOfOrigin,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      source: 'direct',
      attachments: [],
      timeline: [{
        id: `tl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        title: 'Submission Created',
        description: 'Submission submitted to Dubai Chambers innovation portal.',
        actorName: form.contactName || 'Vendor',
        actorRole: 'startup',
        type: 'status_change',
      }],
    }
    addSubmission(newSub)
    setNewSubId(id)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="font-display text-display-sm text-on-surface mb-3">Submission Received!</h1>
          <p className="text-body-lg text-on-surface-variant mb-8">
            Your innovation has been submitted to Dubai Chambers. Our AI engine will evaluate it shortly and you'll be notified of the outcome.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href={`/submissions/${newSubId}`}>
              <Button>View Submission</Button>
            </Link>
            <Link href="/submissions">
              <Button variant="secondary">All Submissions</Button>
            </Link>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
          <Link href="/submissions" className="hover:text-primary">Submissions</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>New Submission</span>
        </div>

        {/* Steps indicator */}
        <div className="flex gap-2 items-center">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-label-sm font-bold ${step >= s ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              <span className={`text-label-sm font-medium hidden sm:inline ${step >= s ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                {s === 1 ? 'Company Info' : s === 2 ? 'Solution Details' : 'Technical Info'}
              </span>
              {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-secondary' : 'bg-surface-container'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Company Info */}
        {step === 1 && (
          <Card>
            <CardHeader><CardTitle subtitle="Tell us about your company and contact person">Company Information</CardTitle></CardHeader>
            <div className="space-y-4">
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1.5">Solution Title *</label>
                <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. AI-Powered Supply Chain Optimizer" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-md text-on-surface-variant block mb-1.5">Company Name *</label>
                  <input value={form.company} onChange={e => update('company', e.target.value)} placeholder="Your company name" className="input-field" />
                </div>
                <div>
                  <label className="text-label-md text-on-surface-variant block mb-1.5">Country of Origin</label>
                  <input value={form.countryOfOrigin} onChange={e => update('countryOfOrigin', e.target.value)} placeholder="UAE" className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-md text-on-surface-variant block mb-1.5">Contact Name *</label>
                  <input value={form.contactName} onChange={e => update('contactName', e.target.value)} placeholder="Full name" className="input-field" />
                </div>
                <div>
                  <label className="text-label-md text-on-surface-variant block mb-1.5">Contact Email *</label>
                  <input value={form.contactEmail} onChange={e => update('contactEmail', e.target.value)} placeholder="email@company.com" className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1.5">Innovation Category *</label>
                <select value={form.category} onChange={e => update('category', e.target.value)} className="input-field">
                  {CATEGORIES.map(c => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setStep(2)} iconPosition="right" icon={<ChevronRight />}>Next Step</Button>
            </div>
          </Card>
        )}

        {/* Step 2: Solution Details */}
        {step === 2 && (
          <Card>
            <CardHeader><CardTitle subtitle="Describe the problem you solve and your solution">Solution Details</CardTitle></CardHeader>
            <div className="space-y-4">
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1.5">Description *</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} placeholder="Brief overview of your innovation..." className="input-field resize-none" />
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1.5">Problem Statement *</label>
                <textarea value={form.problem} onChange={e => update('problem', e.target.value)} rows={3} placeholder="What specific problem are you solving?" className="input-field resize-none" />
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1.5">Your Solution *</label>
                <textarea value={form.solution} onChange={e => update('solution', e.target.value)} rows={4} placeholder="How does your solution solve the problem?" className="input-field resize-none" />
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1.5">Tags (comma separated)</label>
                <input value={form.tags} onChange={e => update('tags', e.target.value)} placeholder="AI, Machine Learning, IoT..." className="input-field" />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} iconPosition="right" icon={<ChevronRight />}>Next Step</Button>
            </div>
          </Card>
        )}

        {/* Step 3: Technical Info */}
        {step === 3 && (
          <Card>
            <CardHeader><CardTitle subtitle="Technical maturity and business details">Technical Information</CardTitle></CardHeader>
            <div className="space-y-4">
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1.5">
                  Technology Readiness Level (TRL): <span className="font-semibold text-primary">{form.trl}</span>
                </label>
                <input type="range" min={1} max={9} value={form.trl} onChange={e => update('trl', +e.target.value)} className="w-full accent-primary" />
                <p className="text-label-sm text-on-surface-variant mt-1">{TRL_DESCRIPTIONS[form.trl]}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-md text-on-surface-variant block mb-1.5">Team Size</label>
                  <input type="number" min={1} value={form.teamSize} onChange={e => update('teamSize', +e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-label-md text-on-surface-variant block mb-1.5">Funding Stage</label>
                  <select value={form.fundingStage} onChange={e => update('fundingStage', e.target.value)} className="input-field">
                    {FUNDING_STAGES.map(s => <option key={s} value={s}>{s.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1.5">Estimated Contract Value (AED)</label>
                <input type="number" min={0} step={100000} value={form.estimatedValue} onChange={e => update('estimatedValue', +e.target.value)} className="input-field" />
              </div>
              <div className="bg-surface-container-low rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4 text-on-surface-variant" />
                  <p className="text-label-md text-on-surface-variant">Attach Documents (simulated)</p>
                </div>
                <p className="text-body-sm text-on-surface-variant/60">Pitch deck, technical specs, case studies — drag & drop or browse</p>
                <div className="mt-2 border border-dashed border-outline-variant/30 rounded-lg p-4 text-center cursor-pointer hover:bg-surface-container transition-colors">
                  <p className="text-label-sm text-on-surface-variant">Click to upload files</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
              <Button icon={<CheckCircle2 />} onClick={handleSubmit}>Submit Innovation</Button>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
