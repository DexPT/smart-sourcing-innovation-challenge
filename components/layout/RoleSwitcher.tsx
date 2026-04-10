'use client'
import { useRole, roleProfiles } from '@/hooks/useRole'
import { cn } from '@/lib/utils'
import { ChevronDown, Check } from 'lucide-react'
import { useState } from 'react'
import type { UserRole } from '@/types'

export function RoleSwitcher() {
  const { currentRole, setRole, profile } = useRole()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors duration-150 w-full"
      >
        {/* Avatar */}
        <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-on-primary text-label-sm font-semibold flex-shrink-0', profile.color)}>
          {profile.initials}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-label-sm font-semibold text-on-surface truncate">{profile.label}</p>
          <p className="text-label-sm text-on-surface-variant/70 truncate capitalize">{currentRole}</p>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-on-surface-variant flex-shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface-container-lowest rounded-lg shadow-ambient z-20 overflow-hidden border border-outline-variant/10">
            <div className="p-2">
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider px-2 py-1.5">Switch Role</p>
              {roleProfiles.map((rp) => (
                <button
                  key={rp.id}
                  onClick={() => { setRole(rp.id as UserRole); setOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2 py-2 rounded-md transition-colors duration-150 text-left',
                    currentRole === rp.id ? 'bg-primary/8' : 'hover:bg-surface-container'
                  )}
                >
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-on-primary text-label-sm font-semibold flex-shrink-0', rp.color)}>
                    {rp.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-label-md font-medium text-on-surface truncate">{rp.label}</p>
                    <p className="text-label-sm text-on-surface-variant truncate">{rp.description}</p>
                  </div>
                  {currentRole === rp.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
