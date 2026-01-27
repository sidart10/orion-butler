/**
 * VisuallyHidden Component - Orion Design System
 *
 * Story 1.17: Accessibility Utilities
 *
 * Renders content that is visually hidden but accessible to screen readers.
 * Uses the sr-only Tailwind utility class for proper screen reader accessibility.
 *
 * @example
 * // Hidden text for screen readers
 * <VisuallyHidden>This text is only for screen readers</VisuallyHidden>
 *
 * @example
 * // Icon button with accessible label
 * <button>
 *   <VisuallyHidden>Close dialog</VisuallyHidden>
 *   <XIcon aria-hidden="true" />
 * </button>
 *
 * @example
 * // Skip link
 * <a href="#main-content">
 *   <VisuallyHidden>Skip to main content</VisuallyHidden>
 * </a>
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Props for the VisuallyHidden component
 */
export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Content to be hidden visually but accessible to screen readers
   */
  children: React.ReactNode
}

/**
 * VisuallyHidden component for screen reader accessibility
 *
 * Renders a span with Tailwind's sr-only class which:
 * - Position: absolute
 * - Width/Height: 1px
 * - Padding/Margin: 0/-1px
 * - Overflow: hidden
 * - Clip: rect(0,0,0,0)
 * - White-space: nowrap
 * - Border: 0
 *
 * This technique hides content visually while keeping it accessible
 * to assistive technologies like screen readers.
 */
const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn('sr-only', className)} {...props}>
        {children}
      </span>
    )
  }
)

VisuallyHidden.displayName = 'VisuallyHidden'

export { VisuallyHidden }
