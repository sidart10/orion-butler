/**
 * Backdrop Component
 * Story 1.12: Tablet Breakpoint
 * Story 1.13: Dark Mode System Detection
 *
 * Semi-transparent overlay for sidebar and canvas overlays.
 * Provides dimming effect and click-to-close functionality.
 *
 * Acceptance Criteria (Story 1.12):
 * - AC#2: Semi-transparent black backdrop dims content behind sidebar
 * - AC#3: Clicking outside sidebar (backdrop) closes it
 * - AC#4: Same backdrop pattern for canvas overlay
 *
 * Story 1.13 Additions:
 * - AC#6: Overlay backdrop renders appropriately for dark mode
 * - Uses slightly higher opacity in dark mode for better contrast
 */

'use client'

import { cn } from '@/lib/utils'

export interface BackdropProps {
  /** Whether the backdrop is visible */
  visible: boolean
  /** Callback when backdrop is clicked */
  onClick: () => void
  /** z-index level (default: 40 for sidebar, use 30 for canvas if needed) */
  zIndex?: 'z-30' | 'z-40'
  /** Additional className */
  className?: string
  /** Test ID for testing */
  testId?: string
}

/**
 * Backdrop - Overlay dimming component
 *
 * Features:
 * - Semi-transparent black overlay (50% light mode, 70% dark mode)
 * - Click-to-close behavior
 * - 300ms opacity transition
 * - pointer-events: none when hidden
 * - aria-hidden for accessibility
 * - Story 1.13: Dark mode uses higher opacity for better contrast
 */
export function Backdrop({
  visible,
  onClick,
  zIndex = 'z-40',
  className,
  testId = 'backdrop',
}: BackdropProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        // Positioning
        'fixed inset-0',
        // Background - 50% in light mode, 70% in dark mode (Story 1.13 AC#6)
        'bg-black/50 dark:bg-black/70',
        // Z-index
        zIndex,
        // Transition
        'transition-opacity duration-300 ease-luxury',
        // Visibility states
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
        className
      )}
      onClick={onClick}
      aria-hidden="true"
    />
  )
}
