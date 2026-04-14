'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { cn, formatRelativeTime } from '@/lib/utils'

export function NotificationBell() {
  const notifications = useAppStore((s) => s.notifications)
  const markAllRead = useAppStore((s) => s.markAllRead)
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  )

  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 hover:bg-surface-container"
        aria-label="Open notifications"
      >
        <Bell className="h-4 w-4 text-on-surface-variant" />
        {unreadCount > 0 && (
          <>
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-error" />
            <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-error px-1 text-center text-[10px] font-semibold text-on-error">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-[22rem] overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest shadow-ambient">
          <div className="flex items-center justify-between border-b border-outline-variant/10 px-4 py-3">
            <div>
              <p className="text-title-sm font-semibold text-on-surface">Notifications</p>
              <p className="text-label-sm text-on-surface-variant">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
            <button
              onClick={() => markAllRead()}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1 text-label-sm font-medium text-primary disabled:cursor-default disabled:text-on-surface-variant/50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell className="mx-auto mb-2 h-8 w-8 text-on-surface-variant/30" />
              <p className="text-body-sm text-on-surface-variant">No notifications yet.</p>
            </div>
          ) : (
            <div className="max-h-[26rem] overflow-y-auto">
              {notifications.slice(0, 8).map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block border-b border-outline-variant/10 px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-container',
                    !notification.read && 'bg-primary/5'
                  )}
                >
                  <div className="mb-1 flex items-start justify-between gap-3">
                    <p className="text-label-md font-semibold text-on-surface">{notification.title}</p>
                    <span className="flex-shrink-0 text-label-sm text-on-surface-variant">
                      {formatRelativeTime(notification.timestamp)}
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">{notification.body}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
