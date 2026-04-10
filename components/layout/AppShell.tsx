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
          sidebarOpen ? 'pl-64' : 'pl-16'
        )}
      >
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
