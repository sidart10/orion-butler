/**
 * StatusIndicator Component - Orion Design System
 *
 * Story 1.9: Status Indicator Component
 *
 * Visualizes agent states (idle, thinking, acting, waiting, success, error)
 * using geometric dots and animations. Uses Editorial Luxury aesthetic with
 * typography-first design - no emojis, only geometric shapes.
 *
 * @example
 * // Inline with text
 * <StatusIndicator status="thinking" size="sm" />
 *
 * @example
 * // Sidebar with label
 * <StatusIndicator status="idle" size="md" showLabel />
 *
 * @example
 * // Activity panel
 * <StatusIndicator status="success" size="lg" />
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Status type for the indicator
 */
export type StatusType = 'idle' | 'thinking' | 'acting' | 'waiting' | 'success' | 'error'

/**
 * Status-to-label mapping for accessibility
 */
const statusLabels: Record<StatusType, string> = {
  idle: 'Agent is idle',
  thinking: 'Agent is thinking',
  acting: 'Agent is acting',
  waiting: 'Agent is waiting',
  success: 'Action completed successfully',
  error: 'An error occurred',
}

/**
 * Status-to-display label mapping for visible labels
 */
const statusDisplayLabels: Record<StatusType, string> = {
  idle: 'Idle',
  thinking: 'Thinking',
  acting: 'Acting',
  waiting: 'Waiting',
  success: 'Success',
  error: 'Error',
}

/**
 * StatusIndicator variants configuration using class-variance-authority
 *
 * Size variants (AC#7):
 * - sm: 6px (inline with text)
 * - md: 8px (sidebar indicators)
 * - lg: 12px (activity panel, prominent display)
 */
const statusIndicatorVariants = cva(
  // Base styles - all indicators are inline-flex with centered content
  [
    'inline-flex items-center justify-center',
    'rounded-full', // Geometric filled circle
    'flex-shrink-0',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'h-1.5 w-1.5', // 6px
        md: 'h-2 w-2', // 8px
        lg: 'h-3 w-3', // 12px
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

/**
 * StatusIndicator component props
 */
export interface StatusIndicatorProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'role'>,
    VariantProps<typeof statusIndicatorVariants> {
  /**
   * Current status state
   * @default 'idle'
   */
  status?: StatusType

  /**
   * Optional text label beside indicator
   * @default false
   */
  showLabel?: boolean
}

/**
 * StatusIndicator component
 *
 * Implements all acceptance criteria from Story 1.9:
 * - AC#1: Working indicator displays with pulse animation when processing
 * - AC#2: Waiting indicator displays in blue (#3B82F6)
 * - AC#3: Idle indicator displays in muted gray
 * - AC#4: Uses geometric dots (filled circle) - no emojis
 * - AC#5: Success state displays gold checkmark icon (Lucide)
 * - AC#6: Error state displays red indicator
 * - AC#7: Three size variants: 6px (sm), 8px (md), 12px (lg)
 * - AC#8: Pulse animation at 1500ms ease-in-out
 * - AC#9: Accessible with ARIA labels
 * - AC#10: Focus states use 2px gold outline with 2px offset
 */
const StatusIndicator = React.forwardRef<HTMLSpanElement, StatusIndicatorProps>(
  ({ className, status = 'idle', size, showLabel, ...props }, ref) => {
    // Get the appropriate aria-label for the status
    const ariaLabel = statusLabels[status]
    const displayLabel = statusDisplayLabels[status]

    // Determine if this is a success state (renders checkmark instead of dot)
    const isSuccess = status === 'success'

    // Get status-specific styles
    const getStatusStyles = () => {
      switch (status) {
        case 'idle':
          // AC#3: Idle indicator displays in muted gray
          return 'bg-orion-fg-muted'
        case 'thinking':
          // AC#1: Working/thinking indicator with pulse animation
          // AC#8: Pulse animation at 1500ms ease-in-out
          return 'bg-orion-gold animate-status-pulse'
        case 'acting':
          // Acting indicator with spin animation (1000ms)
          return 'bg-orion-gold animate-status-spin'
        case 'waiting':
          // AC#2: Waiting indicator displays in blue
          // AC#8: Pulse animation at 1500ms
          return 'bg-[#3B82F6] animate-status-pulse'
        case 'success':
          // AC#5: Success state displays gold checkmark icon
          return 'bg-orion-gold'
        case 'error':
          // AC#6: Error state displays red indicator
          return 'bg-orion-error'
        default:
          return 'bg-orion-fg-muted'
      }
    }

    // Size mapping for the checkmark icon
    const getIconSize = () => {
      switch (size) {
        case 'sm':
          return 6
        case 'md':
          return 8
        case 'lg':
          return 12
        default:
          return 8
      }
    }

    return (
      <span
        ref={ref}
        role="status"
        aria-label={ariaLabel}
        className={cn(
          'inline-flex items-center gap-2',
          // AC#10: Focus states use 2px gold outline with 2px offset
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orion-gold',
          className
        )}
        tabIndex={0}
        {...props}
      >
        {isSuccess ? (
          // AC#5: Success state displays gold checkmark icon (Lucide)
          <span
            className={cn(
              'inline-flex items-center justify-center text-orion-gold',
              // Reduced motion support
              'motion-reduce:animate-none'
            )}
            aria-hidden="true"
          >
            <Check size={getIconSize()} strokeWidth={3} />
          </span>
        ) : (
          // AC#4: Geometric filled circle for all other states
          <span
            className={cn(
              statusIndicatorVariants({ size }),
              getStatusStyles(),
              // Reduced motion support - AC#9 accessibility
              'motion-reduce:animate-none'
            )}
            aria-hidden="true"
          />
        )}
        {showLabel && (
          <span className="text-sm text-orion-fg">{displayLabel}</span>
        )}
      </span>
    )
  }
)

StatusIndicator.displayName = 'StatusIndicator'

export { StatusIndicator, statusIndicatorVariants }
