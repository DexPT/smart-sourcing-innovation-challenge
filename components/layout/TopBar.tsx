'use client'
import { useAppStore } from '@/store/appStore'
import { useRole } from '@/hooks/useRole'
import { Search, Bell, Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of the innovation pipeline' },
  '/submissions': { title: 'Submissions', subtitle: 'Manage and track all innovation submissions' },
  '/ai-evaluation': { title: 'AI Evaluation Hub', subtitle: 'AI-powered scoring and analysis' },
  '/compliance': { title: 'Compliance Hub', subtitle: 'DESC-aligned regulatory validation' },
  '/vendors': { title: 'Vendor Registry', subtitle: 'Approved and registered vendor network' },
  '/pilots': { title: 'Pilot Management', subtitle: 'Active and completed pilot programs' },
  '/procurement': { title: 'Procurement Decisions', subtitle: 'Contract and procurement tracking' },
  '/insights': { title: 'Insights & Reports', subtitle: 'Analytics and performance metrics' },
  '/audit': { title: 'Audit Logs', subtitle: 'Full traceability and governance trail' },
}

export function TopBar() {
  const pathname = usePathname()
  const globalSearchQuery = useAppStore((s) => s.globalSearchQuery)
  const setGlobalSearch = useAppStore((s) => s.setGlobalSearch)
  const activeNotifications = useAppStore((s) => s.activeNotifications)
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const { profile } = useRole()

  const pageKey = Object.keys(pageTitles).find(k => pathname === k || pathname.startsWith(k + '/')) ?? '/dashboard'
  const page = pageTitles[pageKey] ?? { title: 'Platform', subtitle: '' }

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

      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Search submissions, vendors..."
          value={globalSearchQuery}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="w-56 lg:w-64 pl-9 pr-4 py-1.5 bg-surface-container rounded-lg text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-high transition-colors duration-200"
        />
      </div>

      <button className="relative w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center transition-colors duration-150">
        <Bell className="w-4 h-4 text-on-surface-variant" />
        {activeNotifications > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error" />
        )}
      </button>

      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-on-primary text-label-sm font-semibold cursor-pointer', profile.color)}>
        {profile.initials}
      </div>
    </header>
  )
}
