'use client'
import { useAppStore } from '@/store/appStore'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)

  return (
    <div className="min-h-screen bg-surface-container-low">
      <Sidebar />
      <TopBar />
      <main
        className={cn(
          'pt-14 min-h-screen transition-all duration-300',
          'pl-0 lg:pl-16',
          sidebarOpen && 'lg:pl-64'
        )}
      >
        <div className="p-4 sm:p-5 lg:p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
