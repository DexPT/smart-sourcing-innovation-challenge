import { cn } from '@/lib/utils'

// ─── base ────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-surface-container', className)} />
}

// ─── stat card ───────────────────────────────────────────────
export function SkeletonStatCard() {
  return (
    <div className="rounded-xl bg-surface-container-lowest p-4 shadow-ambient">
      <Skeleton className="mb-3 h-3 w-20" />
      <Skeleton className="mb-2 h-8 w-28" />
      <Skeleton className="h-2.5 w-16" />
    </div>
  )
}

// ─── generic card ────────────────────────────────────────────
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-xl bg-surface-container-lowest p-4 shadow-ambient space-y-3">
      <Skeleton className="h-4 w-32" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-3/4' : 'w-full')} />
      ))}
    </div>
  )
}

// ─── list item ───────────────────────────────────────────────
export function SkeletonListItem() {
  return (
    <div className="rounded-lg bg-surface-container-lowest p-3 shadow-ambient space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="ml-auto h-4 w-14" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  )
}

// ─── table row ───────────────────────────────────────────────
export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  const widths = ['w-24', 'w-20', 'w-36', 'w-28', 'w-40', 'w-16']
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={cn('h-4', widths[i % widths.length])} />
        </td>
      ))}
    </tr>
  )
}

// ─── text block ──────────────────────────────────────────────
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-3/4' : 'w-full')} />
      ))}
    </div>
  )
}

// ─── chart placeholder ───────────────────────────────────────
export function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <div className="animate-pulse rounded bg-surface-container" style={{ height }} />
  )
}
