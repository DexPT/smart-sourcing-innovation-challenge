'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  className,
}: SwitchProps) {
  const isControlled = checked !== undefined
  const [internalChecked, setInternalChecked] = useState(defaultChecked)

  useEffect(() => {
    if (!isControlled) {
      setInternalChecked(defaultChecked)
    }
  }, [defaultChecked, isControlled])

  const isChecked = isControlled ? checked : internalChecked

  const handleToggle = () => {
    if (disabled) return

    const nextChecked = !isChecked

    if (!isControlled) {
      setInternalChecked(nextChecked)
    }

    onCheckedChange?.(nextChecked)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-pressed={isChecked}
      disabled={disabled}
      onClick={handleToggle}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
        isChecked ? 'bg-primary shadow-ambient-sm' : 'bg-surface-container-high',
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute top-0.5 h-5 w-5 rounded-full bg-surface-container-lowest shadow-sm transition-[left] duration-200',
          isChecked ? 'left-[22px]' : 'left-0.5'
        )}
      />
    </button>
  )
}
