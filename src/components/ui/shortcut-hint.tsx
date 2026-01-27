/**
 * ShortcutHint Component
 * Story 1.15: Global Keyboard Shortcuts
 *
 * Displays keyboard shortcut hints in a consistent style.
 * Used in tooltips, settings page, and throughout the UI.
 *
 * AC#7: Shortcuts are discoverable through tooltips and help mechanism
 */

import { cn } from '@/lib/utils'

export interface ShortcutHintProps {
  /** The shortcut to display (e.g., "Cmd+K", "Esc") */
  shortcut: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Renders a keyboard shortcut hint in a styled kbd element
 *
 * @example
 * ```tsx
 * <ShortcutHint shortcut="Cmd+K" />
 * // Renders: [Cmd+K] in a styled box
 * ```
 */
export function ShortcutHint({ shortcut, className }: ShortcutHintProps) {
  // Split shortcut into parts for individual styling
  const parts = shortcut.split('+')

  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {parts.map((part, index) => (
        <span key={index}>
          <kbd
            className={cn(
              'inline-flex items-center justify-center',
              'px-1.5 py-0.5',
              'text-xs font-mono',
              'bg-orion-surface-elevated',
              'text-orion-fg-muted',
              'border border-orion-border',
              'rounded-none' // Editorial Luxury: 0px border-radius
            )}
          >
            {part}
          </kbd>
          {index < parts.length - 1 && (
            <span className="text-orion-fg-muted text-xs mx-0.5">+</span>
          )}
        </span>
      ))}
    </span>
  )
}

/**
 * Inline shortcut hint for tooltips and compact displays
 * Shows as a single block without plus signs
 */
export function ShortcutHintCompact({ shortcut, className }: ShortcutHintProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center',
        'px-1.5 py-0.5',
        'text-xs font-mono',
        'bg-orion-surface-elevated',
        'text-orion-fg-muted',
        'border border-orion-border',
        'rounded-none',
        className
      )}
    >
      {shortcut}
    </kbd>
  )
}
