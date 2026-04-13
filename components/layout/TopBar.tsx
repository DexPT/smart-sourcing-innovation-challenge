'use client'
import { useAppStore } from '@/store/appStore'
import { useRole } from '@/hooks/useRole'
import { Search, Bell, Menu, ClipboardList, Building2, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useRef, useState, useEffect, useMemo } from 'react'
import { vendors } from '@/data/vendors'
import Link from 'next/link'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':    { title: 'Dashboard',            subtitle: 'Overview of the innovation pipeline' },
  '/submissions':  { title: 'Submissions',           subtitle: 'Manage and track all innovation submissions' },
  '/ai-evaluation':{ title: 'AI Evaluation Hub',    subtitle: 'AI-powered scoring and analysis' },
  '/compliance':   { title: 'Compliance Hub',        subtitle: 'DESC-aligned regulatory validation' },
  '/vendors':      { title: 'Vendor Registry',       subtitle: 'Approved and registered vendor network' },
  '/pilots':       { title: 'Pilot Management',      subtitle: 'Active and completed pilot programs' },
  '/procurement':  { title: 'Procurement Decisions', subtitle: 'Contract and procurement tracking' },
  '/insights':     { title: 'Insights & Reports',    subtitle: 'Analytics and performance metrics' },
  '/audit':        { title: 'Audit Logs',            subtitle: 'Full traceability and governance trail' },
  '/settings':     { title: 'Settings',              subtitle: 'Platform preferences and configuration' },
}

export function TopBar() {
  const pathname          = usePathname()
  const router            = useRouter()
  const globalSearchQuery = useAppStore((s) => s.globalSearchQuery)
  const setGlobalSearch   = useAppStore((s) => s.setGlobalSearch)
  const activeNotifications = useAppStore((s) => s.activeNotifications)
  const sidebarOpen       = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar     = useAppStore((s) => s.toggleSidebar)
  const submissions       = useAppStore((s) => s.submissions)
  const { profile }       = useRole()

  const [open, setOpen]   = useState(false)
  const wrapperRef        = useRef<HTMLDivElement>(null)

  const pageKey = Object.keys(pageTitles).find(k => pathname === k || pathname.startsWith(k + '/')) ?? '/dashboard'
  const page    = pageTitles[pageKey] ?? { title: 'Platform', subtitle: '' }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Search results
  const results = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase()
    if (!q) return { submissions: [], vendors: [] }
    return {
      submissions: submissions
        .filter(s =>
          s.title.toLowerCase().includes(q) ||
          s.company.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
        )
        .slice(0, 4),
      vendors: vendors
        .filter(v =>
          v.name.toLowerCase().includes(q) ||
          v.industry.toLowerCase().includes(q)
        )
        .slice(0, 3),
    }
  }, [globalSearchQuery, submissions])

  const hasResults = results.submissions.length > 0 || results.vendors.length > 0
  const showDropdown = open && globalSearchQuery.trim().length > 0

  function handleSelect(href: string) {
    router.push(href)
    setGlobalSearch('')
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false)
      setGlobalSearch('')
    }
  }

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 h-14 bg-surface-container-lowest/80 backdrop-blur-glass border-b border-outline-variant/10 flex items-center gap-3 px-4 sm:px-5 lg:px-6 z-20 transition-all duration-300',
      'lg:left-16',
      sidebarOpen && 'lg:left-64'
    )}>
      <button
        onClick={toggleSidebar}
        className="lg:hidden w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center transition-colors duration-150"
      >
        <Menu className="w-4 h-4 text-on-surface-variant" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="font-display text-headline-sm text-on-surface truncate">{page.title}</h1>
      </div>

      {/* Search with dropdown */}
      <div ref={wrapperRef} className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
        <input
          type="text"
          placeholder="Search submissions, vendors…"
          value={globalSearchQuery}
          onChange={e => { setGlobalSearch(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-56 lg:w-72 pl-9 pr-8 py-1.5 bg-surface-container rounded-lg text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-high transition-colors duration-200"
        />
        {globalSearchQuery && (
          <button
            onClick={() => { setGlobalSearch(''); setOpen(false) }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 top-full mt-1.5 w-80 rounded-xl bg-surface-container-lowest shadow-lg border border-outline-variant/15 overflow-hidden z-50">
            {hasResults ? (
              <>
                {results.submissions.length > 0 && (
                  <div>
                    <p className="px-3 pt-3 pb-1.5 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                      Submissions
                    </p>
                    {results.submissions.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => handleSelect(`/submissions/${sub.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-container transition-colors text-left"
                      >
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <ClipboardList className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-label-md text-on-surface truncate">{sub.title}</p>
                          <p className="text-label-sm text-on-surface-variant truncate">{sub.company}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {results.vendors.length > 0 && (
                  <div className={results.submissions.length > 0 ? 'border-t border-outline-variant/10' : ''}>
                    <p className="px-3 pt-3 pb-1.5 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                      Vendors
                    </p>
                    {results.vendors.map(v => (
                      <button
                        key={v.id}
                        onClick={() => handleSelect(`/vendors/${v.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-container transition-colors text-left"
                      >
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                          <Building2 className="h-3.5 w-3.5 text-secondary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-label-md text-on-surface truncate">{v.name}</p>
                          <p className="text-label-sm text-on-surface-variant truncate">{v.industry}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="border-t border-outline-variant/10 px-3 py-2">
                  <button
                    onClick={() => { router.push('/submissions'); setOpen(false) }}
                    className="text-label-sm text-primary hover:underline"
                  >
                    See all submissions →
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-label-md text-on-surface-variant">
                  No results for "<span className="font-medium text-on-surface">{globalSearchQuery}</span>"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <button className="relative w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center transition-colors duration-150">
        <Bell className="w-4 h-4 text-on-surface-variant" />
        {activeNotifications > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error" />
        )}
      </button>

      <Link href="/settings" className={cn('w-7 h-7 rounded-full flex items-center justify-center text-on-primary text-label-sm font-semibold cursor-pointer', profile.color)}>
        {profile.initials}
      </Link>
    </header>
  )
}
