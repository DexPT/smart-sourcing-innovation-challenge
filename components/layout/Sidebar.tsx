'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRole } from '@/hooks/useRole'
import { useAppStore } from '@/store/appStore'
import { RoleSwitcher } from './RoleSwitcher'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, FileText, Brain, ShieldCheck, Building2,
  FlaskConical, HandshakeIcon, BarChart3, ClipboardList,
  ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  FileText,
  Brain,
  ShieldCheck,
  Building2,
  FlaskConical,
  HandshakeIcon,
  BarChart3,
  ClipboardList,
}

export function Sidebar() {
  const pathname = usePathname()
  const { navItems } = useRole()
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen bg-surface-container-lowest shadow-ambient flex flex-col z-30 transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-4 border-b border-outline-variant/10', !sidebarOpen && 'justify-center px-0')}>
        <div className="w-8 h-8 rounded-lg bg-power-gradient flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-on-primary" />
        </div>
        {sidebarOpen && (
          <div className="min-w-0">
            <p className="font-display font-bold text-label-lg text-on-surface leading-tight">Dubai Chambers</p>
            <p className="text-label-sm text-on-surface-variant truncate">Innovation Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] ?? LayoutDashboard
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.id}
              href={item.href}
              title={!sidebarOpen ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
                !sidebarOpen && 'justify-center px-0 w-12 mx-auto'
              )}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {sidebarOpen && (
                <span className={cn('text-label-md font-medium truncate', isActive && 'font-semibold')}>
                  {item.label}
                </span>
              )}
              {isActive && sidebarOpen && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer — Role Switcher */}
      <div className="p-2 border-t border-outline-variant/10">
        {sidebarOpen ? (
          <RoleSwitcher />
        ) : (
          <div className="w-8 h-8 rounded-full bg-power-gradient flex items-center justify-center mx-auto cursor-pointer" onClick={toggleSidebar}>
            <span className="text-on-primary text-label-sm font-semibold">AM</span>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-container-lowest shadow-ambient-sm border border-outline-variant/20 flex items-center justify-center hover:bg-surface-container transition-colors duration-150"
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-3.5 h-3.5 text-on-surface-variant" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
        )}
      </button>
    </aside>
  )
}
