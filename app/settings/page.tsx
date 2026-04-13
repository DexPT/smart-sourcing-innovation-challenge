'use client'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardTitle } from '@/components/ui/Card'
import { useRole } from '@/hooks/useRole'
import { Bell, Moon, Globe, Shield, Key, Users, Building2, Plug } from 'lucide-react'
import { useState } from 'react'

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      onClick={() => setOn(v => !v)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${on ? 'bg-primary' : 'bg-surface-container'}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-3 border-b border-outline-variant/10 last:border-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-label-md font-medium text-on-surface">{label}</p>
        {description && <p className="mt-0.5 text-label-sm text-on-surface-variant">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardTitle className="mb-4">
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-on-surface-variant" /> {title}
        </span>
      </CardTitle>
      {children}
    </Card>
  )
}

export default function SettingsPage() {
  const { profile, currentRole } = useRole()

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Profile */}
        <Card>
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-on-primary text-title-md font-bold ${profile.color}`}>
              {profile.initials}
            </div>
            <div>
              <p className="font-display text-headline-sm text-on-surface">{profile.label}</p>
              <p className="text-body-sm text-on-surface-variant">{profile.description}</p>
              <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-label-sm font-medium text-primary capitalize">
                {currentRole}
              </span>
            </div>
          </div>
          <p className="mt-4 rounded-lg bg-surface-container-lowest px-3 py-2 text-label-sm text-on-surface-variant">
            This is a prototype demo environment. Role and identity are set via the Role Switcher in the sidebar.
          </p>
        </Card>

        {/* Notifications */}
        <Section icon={Bell} title="Notifications">
          <SettingRow label="New submission alerts" description="Notify when a startup submits a new application">
            <Toggle defaultOn />
          </SettingRow>
          <SettingRow label="AI evaluation complete" description="Notify when AI finishes scoring a submission">
            <Toggle defaultOn />
          </SettingRow>
          <SettingRow label="Compliance decisions" description="Notify on compliance approvals, blocks, or conditions">
            <Toggle />
          </SettingRow>
          <SettingRow label="Pilot status changes" description="Notify on pilot launches, completions, and cancellations">
            <Toggle defaultOn />
          </SettingRow>
          <SettingRow label="Weekly digest" description="Receive a weekly summary of pipeline activity">
            <Toggle />
          </SettingRow>
        </Section>

        {/* Appearance */}
        <Section icon={Moon} title="Appearance">
          <SettingRow label="Dark mode" description="Switch to dark colour scheme (coming soon)">
            <Toggle />
          </SettingRow>
          <SettingRow label="Compact view" description="Reduce spacing in tables and lists">
            <Toggle />
          </SettingRow>
          <SettingRow label="Show animations" description="Enable transitions and motion effects">
            <Toggle defaultOn />
          </SettingRow>
        </Section>

        {/* Language & Region */}
        <Section icon={Globe} title="Language & Region">
          <SettingRow label="Language">
            <select className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-1.5 text-label-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option>English</option>
              <option>العربية</option>
            </select>
          </SettingRow>
          <SettingRow label="Currency display">
            <select className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-1.5 text-label-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option>AED</option>
              <option>USD</option>
            </select>
          </SettingRow>
          <SettingRow label="Date format">
            <select className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-1.5 text-label-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option>DD MMM YYYY</option>
              <option>MM/DD/YYYY</option>
            </select>
          </SettingRow>
        </Section>

        {/* Security */}
        <Section icon={Shield} title="Security & Access">
          <SettingRow label="Two-factor authentication" description="Add an extra layer of security to your account">
            <Toggle />
          </SettingRow>
          <SettingRow label="Session timeout" description="Automatically log out after inactivity">
            <select className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-1.5 text-label-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>4 hours</option>
              <option>Never</option>
            </select>
          </SettingRow>
          <SettingRow label="Audit trail" description="Log all actions taken in this session">
            <Toggle defaultOn />
          </SettingRow>
        </Section>

        {/* Integrations */}
        <Section icon={Plug} title="Integrations">
          {[
            { name: 'Dubai Chambers Portal', status: 'Connected', statusColor: 'text-secondary' },
            { name: 'DESC Regulatory API', status: 'Connected', statusColor: 'text-secondary' },
            { name: 'UAE Pass', status: 'Not configured', statusColor: 'text-on-surface-variant' },
            { name: 'ADGM Registry', status: 'Not configured', statusColor: 'text-on-surface-variant' },
          ].map(item => (
            <SettingRow key={item.name} label={item.name}>
              <span className={`text-label-sm font-medium ${item.statusColor}`}>{item.status}</span>
            </SettingRow>
          ))}
        </Section>

        <p className="pb-6 text-center text-label-sm text-on-surface-variant">
          Dubai Chambers Innovation Platform · Prototype v0.1 · Settings are not persisted in this demo
        </p>
      </div>
    </AppShell>
  )
}
