'use client'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { vendors } from '@/data/vendors'
import { getVendorStatusConfig, getVendorTierConfig, formatAED } from '@/lib/utils'
import { Building2, Search, Star, Award } from 'lucide-react'
import { useState } from 'react'

export default function VendorsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [selected, setSelected] = useState(vendors[0].id)

  const filtered = vendors.filter(v => {
    const matchSearch =
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.industry.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || v.status === statusFilter
    const matchTier = !tierFilter || v.tier === tierFilter
    return matchSearch && matchStatus && matchTier
  })

  const selectedVendor = vendors.find(v => v.id === selected) ?? vendors[0]

  const stats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === 'active').length,
    preferred: vendors.filter(v => v.tier === 'preferred').length,
    totalValue: vendors.reduce((sum, vendor) => sum + vendor.totalValue, 0),
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <p className="text-label-sm text-on-surface-variant">Total Vendors</p>
            <p className="mt-1 font-display text-display-sm font-bold text-on-surface">{stats.total}</p>
          </Card>
          <Card>
            <p className="text-label-sm uppercase text-secondary">Active</p>
            <p className="mt-1 font-display text-display-sm font-bold text-secondary">{stats.active}</p>
          </Card>
          <Card>
            <p className="text-label-sm uppercase text-primary">Preferred Tier</p>
            <p className="mt-1 font-display text-display-sm font-bold text-primary">{stats.preferred}</p>
          </Card>
          <Card gradient>
            <p className="text-label-sm uppercase text-on-primary/70">Total Contract Value</p>
            <p className="mt-1 font-display text-display-sm font-bold text-on-primary">{formatAED(stats.totalValue)}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search vendors..."
                className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest py-2.5 pl-9 pr-4 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 text-label-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                value={tierFilter}
                onChange={e => setTierFilter(e.target.value)}
                className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 text-label-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Tiers</option>
                <option value="preferred">Preferred</option>
                <option value="approved">Approved</option>
                <option value="provisional">Provisional</option>
              </select>
            </div>

            <div className="space-y-2">
              {filtered.map(vendor => {
                const statusConfig = getVendorStatusConfig(vendor.status)
                const tierConfig = getVendorTierConfig(vendor.tier)

                return (
                  <button
                    key={vendor.id}
                    onClick={() => setSelected(vendor.id)}
                    className={`w-full rounded-lg p-3 text-left transition-all duration-150 ${
                      selected === vendor.id
                        ? 'bg-primary/8 ring-1 ring-primary/20'
                        : 'bg-surface-container-lowest shadow-ambient hover:bg-surface-container'
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <p className="flex-1 truncate text-title-sm text-on-surface">{vendor.name}</p>
                      <StatusBadge status={statusConfig} />
                    </div>
                    <p className="text-label-sm text-on-surface-variant">
                      {vendor.industry} · {vendor.country}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className={`badge text-label-sm ${tierConfig.bg} ${tierConfig.text}`}>{tierConfig.label}</span>
                      <div className="ml-auto flex items-center gap-1">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        <span className="text-label-sm text-on-surface">{vendor.averageScore}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            {selectedVendor && (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-power-gradient">
                    <Building2 className="h-6 w-6 text-on-primary" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-headline-md text-on-surface">{selectedVendor.name}</h2>
                      <StatusBadge status={getVendorStatusConfig(selectedVendor.status)} />
                    </div>
                    <p className="text-body-md text-on-surface-variant">
                      {selectedVendor.industry} · {selectedVendor.legalName}
                    </p>
                  </div>

                  <div className="sm:self-start">
                    <div
                      className={`inline-flex rounded-full px-3 py-1 text-label-sm font-semibold ${getVendorTierConfig(selectedVendor.tier).bg} ${getVendorTierConfig(selectedVendor.tier).text}`}
                    >
                      {getVendorTierConfig(selectedVendor.tier).label} Vendor
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {[
                    { label: 'Avg Score', value: `${selectedVendor.averageScore}/100`, color: 'text-secondary' },
                    { label: 'Completion Rate', value: `${selectedVendor.completionRate}%`, color: 'text-secondary' },
                    { label: 'Active Contracts', value: selectedVendor.activeContracts, color: 'text-primary' },
                    { label: 'Total Value', value: formatAED(selectedVendor.totalValue), color: 'text-on-surface' },
                  ].map(({ label, value, color }) => (
                    <Card key={label} padding="sm">
                      <p className="text-label-sm text-on-surface-variant">{label}</p>
                      <p className={`mt-0.5 text-title-md font-bold ${color}`}>{value}</p>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardTitle className="mb-3">About</CardTitle>
                  <p className="text-body-md leading-relaxed text-on-surface-variant">{selectedVendor.description}</p>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <Card>
                    <CardTitle className="mb-3">Registration Details</CardTitle>
                    <div className="space-y-2">
                      {[
                        { label: 'Country', value: selectedVendor.country },
                        { label: 'Emirate', value: selectedVendor.emirate ?? 'N/A' },
                        { label: 'License No.', value: selectedVendor.licenseNumber ?? 'N/A' },
                        { label: 'VAT No.', value: selectedVendor.vatNumber ?? 'N/A' },
                        { label: 'Type', value: selectedVendor.type },
                        { label: 'Registered', value: new Date(selectedVendor.registeredAt).toLocaleDateString('en-GB') },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex flex-col gap-1 border-b border-outline-variant/10 py-1 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="text-label-sm text-on-surface-variant">{label}</span>
                          <span className="text-label-md font-medium text-on-surface">{value}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <CardTitle className="mb-3">Specializations & Certifications</CardTitle>
                    <div className="mb-3">
                      <p className="mb-2 text-label-sm uppercase tracking-wider text-on-surface-variant">Specializations</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedVendor.specializations.map(specialization => (
                          <span key={specialization} className="badge bg-primary/8 text-primary">
                            {specialization}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-label-sm uppercase tracking-wider text-on-surface-variant">Certifications</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedVendor.certifications.map(certification => (
                          <span key={certification} className="badge bg-secondary-container text-secondary">
                            <Award className="h-3 w-3" />
                            {certification}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>

                <Card>
                  <CardTitle className="mb-3">Performance Metrics</CardTitle>
                  <div className="space-y-3">
                    <Progress value={selectedVendor.averageScore} label="Average Score" showLabel size="md" />
                    <Progress value={selectedVendor.completionRate} label="Project Completion Rate" showLabel size="md" barClassName="bg-secondary" />
                  </div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg bg-surface-container-low p-2 text-center">
                      <p className="font-display text-display-sm font-bold text-on-surface">{selectedVendor.totalContracts}</p>
                      <p className="text-label-sm text-on-surface-variant">Total Projects</p>
                    </div>
                    <div className="rounded-lg bg-surface-container-low p-2 text-center">
                      <p className="font-display text-display-sm font-bold text-on-surface">{selectedVendor.activeContracts}</p>
                      <p className="text-label-sm text-on-surface-variant">Active Now</p>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
