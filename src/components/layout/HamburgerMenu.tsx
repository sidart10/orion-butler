/**
 * HamburgerMenu Component
 * Story 1.12: Tablet Breakpoint
 * Story 1.20: Icon System Migration
 *
 * Hamburger menu button for tablet breakpoint navigation.
 * Triggers sidebar overlay when clicked.
 *
 * Acceptance Criteria:
 * - AC#7: Located in top-left corner of header
 * - AC#7: 44x44px minimum touch target
 * - Uses Lucide Menu icon (3 horizontal lines) via Icon wrapper
 * - Gold color on active/focus state
 * - aria-label for accessibility
 */

'use client'

import { Menu, X } from 'lucide-react'
import { Icon } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface HamburgerMenuProps {
  /** Whether the sidebar overlay is currently open */
  isOpen: boolean
  /** Callback when button is clicked */
  onToggle: () => void
  /** Additional className */
  className?: string
}

/**
 * HamburgerMenu - Tablet navigation trigger
 *
 * Features:
 * - 44x44px touch target (AC#7)
 * - Lucide Menu icon (24px)
 * - Gold focus/active states
 * - Accessible with aria-label and aria-expanded
 * - Transitions between Menu and X icon based on state
 */
export function HamburgerMenu({ isOpen, onToggle, className }: HamburgerMenuProps) {
  return (
    <button
      type="button"
      data-testid="hamburger-menu"
      onClick={onToggle}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      className={cn(
        // Size: 44x44px minimum touch target (AC#7)
        'w-11 h-11 min-w-[44px] min-h-[44px]',
        // Layout
        'flex items-center justify-center',
        // Colors
        'text-orion-fg',
        // Hover state
        'hover:text-orion-gold hover:bg-orion-primary-light',
        // Active state
        isOpen && 'text-orion-gold bg-orion-primary-light',
        // Focus state: 2px gold outline with 2px offset
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orion-gold',
        // Transition
        'transition-colors duration-100',
        className
      )}
    >
      {isOpen ? (
        <Icon icon={X} size="lg" aria-hidden={true} />
      ) : (
        <Icon icon={Menu} size="lg" aria-hidden={true} />
      )}
    </button>
  )
}
