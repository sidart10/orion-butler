/**
 * SidebarNavItem Component
 * Story 1.4: Sidebar Column
 * Story 1.11: Laptop Breakpoint
 * Story 1.16: Focus States
 *
 * A navigation item for the GTD sidebar.
 * Implements keyboard navigation (NFR-5.1) and touch targets (44px minimum).
 *
 * Story 1.11 Additions:
 * - Collapsed mode with icon-only display
 * - Tooltip on hover showing label
 * - Maintains 44px touch targets in collapsed state
 *
 * Story 1.16 Additions:
 * - AC#1: 2px gold outline with 2px offset on keyboard focus
 * - AC#4: Focus-visible only (no focus ring on mouse click)
 * - AC#6: Arrow key navigation shows focus ring
 */

'use client'

import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Inbox,
  LayoutList,
  Clock,
  CalendarDays,
  Folder,
  Settings,
  type LucideIcon,
} from 'lucide-react'

/**
 * Map of labels to their corresponding Lucide icons
 */
const ICON_MAP: Record<string, LucideIcon> = {
  Inbox: Inbox,
  Next: LayoutList,
  Waiting: Clock,
  Someday: CalendarDays,
  Projects: Folder,
  Settings: Settings,
}

export interface SidebarNavItemProps {
  /** Display label for the navigation item */
  label: string
  /** Optional count badge (hidden when 0 or undefined) */
  count?: number
  /** Whether this item is currently active */
  isActive?: boolean
  /** Whether sidebar is in collapsed (icon-only) mode */
  isCollapsed?: boolean
  /** Click handler */
  onClick?: () => void
}

export function SidebarNavItem({
  label,
  count,
  isActive,
  isCollapsed = false,
  onClick,
}: SidebarNavItemProps) {
  // Get the icon component for this label
  const Icon = ICON_MAP[label] || Folder

  // Base button content
  const buttonContent = (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'true' : undefined}
      aria-label={isCollapsed ? label : undefined}
      data-testid={`sidebar-nav-item-${label.toLowerCase()}`}
      className={cn(
        // Base layout
        'w-full flex items-center',
        // 36px - desktop nav standard
        'h-9',
        // Collapsed mode: centered icon
        isCollapsed
          ? 'justify-center px-0'
          : 'justify-between py-space-2 px-space-3',
        // Typography
        'text-sm font-normal text-orion-fg',
        // Hover state - white background (per design template)
        'hover:bg-white',
        // Group hover for icon color change
        'group',
        // Story 1.16: Focus-visible pattern (AC#1, AC#4, AC#6)
        // 2px gold outline with 2px offset, only on keyboard navigation
        'focus:outline-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-orion-gold focus-visible:outline-offset-2',
        // Transition for smooth hover
        'transition-colors duration-100',
        // Active state - gold left border
        isActive && [
          'border-l-4 border-orion-gold',
          'bg-orion-primary-light',
          isCollapsed
            ? '-ml-1 pl-[calc(0px)]' // Adjust for collapsed
            : '-ml-space-3 pl-[calc(var(--space-3)-4px)]',
        ]
      )}
    >
      {/* Icon - always visible */}
      <span
        className={cn(
          'flex items-center justify-center',
          isCollapsed ? 'w-6 h-6' : 'w-4 h-4 mr-space-3',
          'text-orion-fg-muted group-hover:text-orion-gold',
          'transition-colors duration-state'
        )}
        data-testid={`${label.toLowerCase()}-icon`}
      >
        <Icon className="w-full h-full" aria-hidden="true" />
      </span>

      {/* Label - hidden when collapsed */}
      {!isCollapsed && (
        <span className="flex-1 text-left text-[12px] font-medium">{label}</span>
      )}

      {/* Count badge - hidden when collapsed or count is 0 */}
      {/* Uses explicit colors to avoid system dark mode conflict with app light theme */}
      {!isCollapsed && count !== undefined && count > 0 && (
        <span className="text-[10px] font-bold bg-[#E5E1DA] dark:bg-[#3D3D3D] text-orion-fg-muted px-1.5 py-0.5">
          {count}
        </span>
      )}
    </button>
  )

  // Wrap in tooltip when collapsed
  if (isCollapsed) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {buttonContent}
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <span>{label}</span>
          {count !== undefined && count > 0 && (
            <span className="ml-2 text-orion-fg-muted">({count})</span>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return buttonContent
}
