'use client'
import { useAppStore } from '@/store/appStore'
import { useRole } from '@/hooks/useRole'
import { useTranslation } from '@/hooks/useTranslation'
import { Search, Menu, ClipboardList, Building2, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useRef, useState, useEffect, useMemo } from 'react'
import { vendors } from '@/data/vendors'
import Link from 'next/link'
import { NotificationBell } from '@/components/layout/NotificationBell'

export function TopBar() {
  const pathname          = usePathname()
  const router            = useRouter()
  const globalSearchQuery = useAppStore((s) => s.globalSearchQuery)
  const setGlobalSearch   = useAppStore((s) => s.setGlobalSearch)
  const sidebarOpen       = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar     = useAppStore((s) => s.toggleSidebar)
  const submissions       = useAppStore((s) => s.submissions)
  const language          = useAppStore((s) => s.language)
  const setLanguage       = useAppStore((s) => s.setLanguage)
  const { profile }       = useRole()
  const { t, isRTL }      = useTranslation()

  const [open, setOpen]   = useState(false)
  const wrapperRef        = useRef<HTMLDivElement>(null)

  // Derive page title from translations
  const pageKey = Object.keys(t.topbar.pages).find(
    k => pathname === k || pathname.startsWith(k + '/')
  ) ?? '/dashboard'
  const page = t.topbar.pages[pageKey as keyof typeof t.topbar.pages]
    ?? { title: t.brand.name, subtitle: '' }

  // Close search on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
      'fixed top-0 right-0 h-14 bg-surface-container-lowest/80 backdrop-blur-glass border-b border-outline-variant/10 flex items-center gap-3 px-4 sm:px-5 lg:px-6 z-20 transition-all duration-300',
      // LTR offset
      'left-0 lg:left-16',
      sidebarOpen && 'lg:left-64',
      // RTL offset
      'rtl:left-0 rtl:right-0 rtl:lg:left-0 rtl:lg:right-16',
      isRTL && sidebarOpen && 'rtl:lg:right-64',
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
        <Search className={cn(
          "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none",
          isRTL ? "right-3" : "left-3"
        )} />
        <input
          type="text"
          placeholder={t.topbar.searchPlaceholder}
          value={globalSearchQuery}
          onChange={e => { setGlobalSearch(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-56 lg:w-72 py-1.5 bg-surface-container rounded-lg text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-high transition-colors duration-200",
            isRTL ? "pr-9 pl-8" : "pl-9 pr-8"
          )}
        />
        {globalSearchQuery && (
          <button
            onClick={() => { setGlobalSearch(''); setOpen(false) }}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-on-surface-variant hover:text-on-surface",
              isRTL ? "left-2.5" : "right-2.5"
            )}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Dropdown */}
        {showDropdown && (
          <div className={cn(
            "absolute top-full mt-1.5 w-80 rounded-xl bg-surface-container-lowest shadow-ambient border border-outline-variant/15 overflow-hidden z-50",
            isRTL ? "left-0" : "right-0"
          )}>
            {hasResults ? (
              <>
                {results.submissions.length > 0 && (
                  <div>
                    <p className="px-3 pt-3 pb-1.5 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                      {t.topbar.searchSubmissions}
                    </p>
                    {results.submissions.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => handleSelect(`/submissions/${sub.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-container transition-colors text-left rtl:text-right"
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
                      {t.topbar.searchVendors}
                    </p>
                    {results.vendors.map(v => (
                      <button
                        key={v.id}
                        onClick={() => handleSelect(`/vendors/${v.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-container transition-colors text-left rtl:text-right"
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
                    {t.topbar.seeAllSubmissions}
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-label-md text-on-surface-variant">
                  {t.topbar.noResults} "<span className="font-medium text-on-surface">{globalSearchQuery}</span>"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Language toggle */}
      <div className="flex items-center bg-surface-container rounded-lg p-0.5 gap-0.5 flex-shrink-0">
        <button
          onClick={() => setLanguage('en')}
          className={cn(
            'px-2.5 py-1 rounded-md text-label-sm font-semibold transition-all duration-150',
            language === 'en'
              ? 'bg-surface-container-lowest text-on-surface shadow-ambient-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          )}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('ar')}
          className={cn(
            'px-2.5 py-1 rounded-md text-label-sm font-semibold transition-all duration-150',
            language === 'ar'
              ? 'bg-surface-container-lowest text-on-surface shadow-ambient-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          )}
        >
          عربي
        </button>
      </div>

      <NotificationBell />

      <div className="flex items-center gap-2 px-1 py-1">
        <Link href="/settings" className="flex min-w-0 items-center gap-2">
          <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full', profile.color)}>
            <span className="text-label-sm font-bold text-on-primary">{profile.initials}</span>
          </div>
          <p className="hidden max-w-40 truncate text-label-md font-semibold text-on-surface md:block">{profile.name}</p>
        </Link>
      </div>
    </header>
  )
}
