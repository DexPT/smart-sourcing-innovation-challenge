'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { vendors } from '@/data/vendors'
import { getVendorStatusConfig, getVendorTierConfig, formatAED, formatDate } from '@/lib/utils'
import { Building2, ChevronLeft, Star, Award, Mail, Phone, Globe, MapPin } from 'lucide-react'

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const vendor = vendors.find(v => v.id === id)

  if (!vendor) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Building2 className="mb-4 h-12 w-12 text-on-surface-variant/40" />
          <p className="font-display text-headline-md text-on-surface">Vendor not found</p>
          <p className="mt-1 text-body-md text-on-surface-variant">The vendor you're looking for doesn't exist or has been removed.</p>
          <Link href="/vendors" className="mt-6 inline-flex items-center gap-1.5 text-label-md font-medium text-primary hover:underline">
            <ChevronLeft className="h-4 w-4" /> Back to Vendors
          </Link>
        </div>
      </AppShell>
    )
  }

  const statusConfig = getVendorStatusConfig(vendor.status)
  const tierConfig   = getVendorTierConfig(vendor.tier)

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back */}
        <Link href="/vendors" className="inline-flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface transition-colors">
          <ChevronLeft className="h-4 w-4" /> Vendors
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-power-gradient">
            <Building2 className="h-7 w-7 text-on-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="font-display text-headline-lg text-on-surface">{vendor.name}</h1>
              <StatusBadge status={statusConfig} />
            </div>
            <p className="text-body-md text-on-surface-variant">{vendor.legalName}</p>
            <p className="mt-0.5 text-body-sm text-on-surface-variant">{vendor.industry} · {vendor.type}</p>
          </div>
          <div className="flex-shrink-0">
            <span className={`inline-flex rounded-full px-3 py-1 text-label-sm font-semibold ${tierConfig.bg} ${tierConfig.text}`}>
              {tierConfig.label} Vendor
            </span>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Avg Score',        value: `${vendor.averageScore}/100`, color: 'text-secondary' },
            { label: 'Completion Rate',  value: `${vendor.completionRate}%`,  color: 'text-secondary' },
            { label: 'Active Contracts', value: vendor.activeContracts,       color: 'text-primary' },
            { label: 'Total Value',      value: formatAED(vendor.totalValue), color: 'text-on-surface' },
          ].map(({ label, value, color }) => (
            <Card key={label} padding="sm">
              <p className="text-label-sm text-on-surface-variant">{label}</p>
              <p className={`mt-0.5 text-title-md font-bold ${color}`}>{value}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardTitle className="mb-3">About</CardTitle>
              <p className="text-body-md leading-relaxed text-on-surface-variant">{vendor.description}</p>
            </Card>

            {/* Performance */}
            <Card>
              <CardTitle className="mb-4">Performance</CardTitle>
              <div className="space-y-4">
                <Progress value={vendor.averageScore}     label="Average Score"            showLabel size="md" />
                <Progress value={vendor.completionRate}   label="Project Completion Rate"  showLabel size="md" barClassName="bg-secondary" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Projects',   value: vendor.totalContracts },
                  { label: 'Active Now',        value: vendor.activeContracts },
                  { label: 'Success Rate',      value: `${vendor.completionRate}%` },
                ].map(stat => (
                  <div key={stat.label} className="rounded-lg bg-surface-container-low p-3 text-center">
                    <p className="font-display text-display-sm font-bold text-on-surface">{stat.value}</p>
                    <p className="text-label-sm text-on-surface-variant">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Specializations & Certs */}
            <Card>
              <CardTitle className="mb-4">Specializations & Certifications</CardTitle>
              <div className="mb-4">
                <p className="mb-2 text-label-sm uppercase tracking-wider text-on-surface-variant">Specializations</p>
                <div className="flex flex-wrap gap-1.5">
                  {vendor.specializations.map(s => (
                    <span key={s} className="badge bg-primary/8 text-primary">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-label-sm uppercase tracking-wider text-on-surface-variant">Certifications</p>
                <div className="flex flex-wrap gap-1.5">
                  {vendor.certifications.map(c => (
                    <span key={c} className="badge bg-secondary-container text-secondary">
                      <Award className="h-3 w-3" />{c}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Registration */}
            <Card>
              <CardTitle className="mb-3">Registration</CardTitle>
              <div className="space-y-2.5">
                {[
                  { label: 'Country',     value: vendor.country },
                  { label: 'Emirate',     value: vendor.emirate ?? 'N/A' },
                  { label: 'License No.', value: vendor.licenseNumber ?? 'N/A' },
                  { label: 'VAT No.',     value: vendor.vatNumber ?? 'N/A' },
                  { label: 'Type',        value: vendor.type },
                  { label: 'Registered',  value: formatDate(vendor.registeredAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-4 border-b border-outline-variant/10 pb-2 last:border-0 last:pb-0">
                    <span className="text-label-sm text-on-surface-variant">{label}</span>
                    <span className="text-label-md font-medium text-on-surface text-right">{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Contact */}
            <Card>
              <CardTitle className="mb-3">Contact</CardTitle>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-surface-container-lowest">
                    <Mail className="h-3.5 w-3.5 text-on-surface-variant" />
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant">{vendor.contactName}</p>
                    <a href={`mailto:${vendor.contactEmail}`} className="text-label-md text-primary hover:underline">{vendor.contactEmail}</a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-surface-container-lowest">
                    <Phone className="h-3.5 w-3.5 text-on-surface-variant" />
                  </div>
                  <p className="text-label-md text-on-surface">{vendor.contactPhone}</p>
                </div>
                {vendor.website && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-surface-container-lowest">
                      <Globe className="h-3.5 w-3.5 text-on-surface-variant" />
                    </div>
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-label-md text-primary hover:underline truncate">{vendor.website.replace('https://', '')}</a>
                  </div>
                )}
                {vendor.emirate && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-surface-container-lowest">
                      <MapPin className="h-3.5 w-3.5 text-on-surface-variant" />
                    </div>
                    <p className="text-label-md text-on-surface">{vendor.emirate}, {vendor.country}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Tags */}
            {vendor.tags.length > 0 && (
              <Card>
                <CardTitle className="mb-3">Tags</CardTitle>
                <div className="flex flex-wrap gap-1.5">
                  {vendor.tags.map(tag => (
                    <span key={tag} className="badge bg-surface-container text-on-surface-variant">{tag}</span>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
