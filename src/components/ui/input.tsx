/**
 * Input Component - Orion Design System
 *
 * Story 1.8: Input Field Component
 *
 * Customized input component with Orion Editorial Luxury styling.
 * Supports left/right icon slots and error state.
 *
 * @example
 * // Basic input
 * <Input placeholder="Enter text..." />
 *
 * @example
 * // Input with error state
 * <Input error aria-invalid={true} />
 *
 * @example
 * // Input with icons
 * <Input leftIcon={<SearchIcon />} rightIcon={<ClearIcon />} />
 *
 * @example
 * // Full width input
 * <Input fullWidth placeholder="Full width" />
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Input component props
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Optional icon on the right side
   */
  rightIcon?: React.ReactNode
  /**
   * Optional icon on the left side
   */
  leftIcon?: React.ReactNode
  /**
   * Error state - shows red border and focus ring
   * @default false
   */
  error?: boolean
  /**
   * Full width mode - makes input container fill available width
   * @default false
   */
  fullWidth?: boolean
}

/**
 * Input component with Orion Design System styling
 *
 * Implements all acceptance criteria from Story 1.8:
 * - AC#1: Input fields use design system styling
 * - AC#2: Focus state shows 2px gold outline with 2px offset
 * - AC#3: Input has 0px border-radius (Editorial Luxury aesthetic)
 * - AC#4: Placeholder text uses muted color from design tokens (--orion-fg-muted)
 *
 * Visual specifications:
 * - Background: --orion-surface
 * - Border: 1px solid --orion-border
 * - Border radius: 0px (rounded-none)
 * - Height: 44px minimum (h-11) for touch targets
 * - Padding: 12px 16px (px-4 py-3)
 * - Placeholder color: --orion-fg-muted
 * - Focus: 2px gold outline with 2px offset
 * - Error: red border and focus ring
 * - Disabled: 50% opacity, cursor-not-allowed
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, rightIcon, leftIcon, error, fullWidth, ...props }, ref) => {
    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orion-fg-muted">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            // Base styles
            'h-11 w-full rounded-none border bg-orion-surface px-4 py-3',
            'text-base text-orion-fg placeholder:text-orion-fg-muted',
            'transition-all duration-100 ease-linear',
            // Border styles (conditional on error)
            error
              ? 'border-orion-error'
              : 'border-orion-border',
            // Story 1.16: Focus-visible pattern (AC#4: no focus ring on mouse click)
            // AC#1: 2px outline with 2px offset
            'focus:outline-none',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            error
              ? 'focus-visible:outline-orion-error'
              : 'focus-visible:outline-orion-gold',
            // Disabled styles
            'disabled:cursor-not-allowed disabled:opacity-50',
            // Icon padding adjustments
            leftIcon && 'pl-12',
            rightIcon && 'pr-12',
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-orion-fg-muted">
            {rightIcon}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
