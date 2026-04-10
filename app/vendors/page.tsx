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
    const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.industry.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || v.status === statusFilter
    const matchTier = !tierFilter || v.tier === tierFilter
    return matchSearch && matchStatus && matchTier
  })

  const selectedVendor = vendors.find(v => v.id === selected) ?? vendors[0]

  const stats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === 'active').length,
    preferred: vendors.filter(v => v.tier === 'preferred').length,
    totalValue: vendors.reduce((s, v) => s + v.totalValue, 0),
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><p className="text-label-sm text-on-surface-variant">Total Vendors</p><p className="font-display font-bold text-display-sm text-on-surface mt-1">{stats.total}</p></Card>
          <Card><p className="text-label-sm text-secondary uppercase">Active</p><p className="font-display font-bold text-display-sm text-secondary mt-1">{stats.active}</p></Card>
          <Card><p className="text-label-sm text-primary uppercase">Preferred Tier</p><p className="font-display font-bold text-display-sm text-primary mt-1">{stats.preferred}</p></Card>
          <Card gradient><p className="text-label-sm text-on-primary/70 uppercase">Total Contract Value</p><p className="font-display font-bold text-display-sm text-on-primary mt-1">{formatAED(stats.totalValue)}</p></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search vendors..."
                className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="flex-1 px-2 py-1.5 bg-surface-container-lowest rounded-md text-label-sm text-on-surface focus:outline-none">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className="flex-1 px-2 py-1.5 bg-surface-container-lowest rounded-md text-label-sm text-on-surface focus:outline-none">
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
                    className={`w-full text-left p-3 rounded-lg transition-all duration-150 ${selected === vendor.id ? 'bg-primary/8 ring-1 ring-primary/20' : 'bg-surface-container-lowest hover:bg-surface-container shadow-ambient'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-title-sm text-on-surface flex-1 truncate">{vendor.name}</p>
                      <StatusBadge status={statusConfig} />
                    </div>
                    <p className="text-label-sm text-on-surface-variant">{vendor.industry} · {vendor.country}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`badge text-label-sm ${tierConfig.bg} ${tierConfig.text}`}>{tierConfig.label}</span>
                      <div className="flex items-center gap-1 ml-auto">
                        <Star className="w-3 h-3 text-warning fill-warning" />
                        <span className="text-label-sm text-on-surface">{vendor.averageScore}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selectedVendor && (
              <>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-power-gradient flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-on-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h2 className="font-display text-headline-md text-on-surface">{selectedVendor.name}</h2>
                      <StatusBadge status={getVendorStatusConfig(selectedVendor.status)} />
                    </div>
                    <p className="text-body-md text-on-surface-variant">{selectedVendor.industry} · {selectedVendor.legalName}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className={`px-3 py-1 rounded-full text-label-sm font-semibold ${getVendorTierConfig(selectedVendor.tier).bg} ${getVendorTierConfig(selectedVendor.tier).text}`}>
                      {getVendorTierConfig(selectedVendor.tier).label} Vendor
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Avg Score', value: `${selectedVendor.averageScore}/100`, color: 'text-secondary' },
                    { label: 'Completion Rate', value: `${selectedVendor.completionRate}%`, color: 'text-secondary' },
                    { label: 'Active Contracts', value: selectedVendor.activeContracts, color: 'text-primary' },
                    { label: 'Total Value', value: formatAED(selectedVendor.totalValue), color: 'text-on-surface' },
                  ].map(({ label, value, color }) => (
                    <Card key={label} padding="sm">
                      <p className="text-label-sm text-on-surface-variant">{label}</p>
                      <p className={`text-title-md font-bold mt-0.5 ${color}`}>{value}</p>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardTitle className="mb-3">About</CardTitle>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">{selectedVendor.description}</p>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div key={label} className="flex justify-between border-b border-outline-variant/10 py-1 last:border-0">
                          <span className="text-label-sm text-on-surface-variant">{label}</span>
                          <span className="text-label-md text-on-surface font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <CardTitle className="mb-3">Specializations & Certifications</CardTitle>
                    <div className="mb-3">
                      <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Specializations</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedVendor.specializations.map(s => (
                          <span key={s} className="badge bg-primary/8 text-primary">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Certifications</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedVendor.certifications.map(c => (
                          <span key={c} className="badge bg-secondary-container text-secondary">
                            <Award className="w-3 h-3" />{c}
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
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-surface-container-low rounded-lg">
                      <p className="text-display-sm font-display font-bold text-on-surface">{selectedVendor.totalContracts}</p>
                      <p className="text-label-sm text-on-surface-variant">Total Projects</p>
                    </div>
                    <div className="text-center p-2 bg-surface-container-low rounded-lg">
                      <p className="text-display-sm font-display font-bold text-on-surface">{selectedVendor.activeContracts}</p>
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
