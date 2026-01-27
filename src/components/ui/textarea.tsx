/**
 * Textarea Component - Orion Design System
 *
 * Story 1.8: Input Field Component
 *
 * Customized textarea component with Orion Editorial Luxury styling.
 * Supports auto-resize mode and error state.
 *
 * @example
 * // Basic textarea
 * <Textarea placeholder="Enter message..." />
 *
 * @example
 * // Textarea with error state
 * <Textarea error aria-invalid={true} />
 *
 * @example
 * // Auto-resize textarea
 * <Textarea autoResize placeholder="Grows with content" />
 *
 * @example
 * // Full width textarea
 * <Textarea fullWidth placeholder="Full width" />
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Textarea component props
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Error state - shows red border and focus ring
   * @default false
   */
  error?: boolean
  /**
   * Full width mode - makes textarea fill available width
   * @default false
   */
  fullWidth?: boolean
  /**
   * Auto-resize based on content
   * When enabled, textarea grows with content instead of showing scrollbar
   * @default false
   */
  autoResize?: boolean
}

/**
 * Textarea component with Orion Design System styling
 *
 * Implements styling from Story 1.8:
 * - Background: --orion-surface
 * - Border: 1px solid --orion-border
 * - Border radius: 0px (rounded-none)
 * - Min-height: 88px (2 lines + padding)
 * - Padding: 12px 16px (px-4 py-3)
 * - Placeholder color: --orion-fg-muted
 * - Focus: 2px gold outline with 2px offset
 * - Error: red border and focus ring
 * - Disabled: 50% opacity, cursor-not-allowed
 * - Resize: vertical only (or none if autoResize)
 * - Line-height: 1.5 (leading-relaxed)
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, fullWidth, autoResize, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current
        const adjustHeight = () => {
          textarea.style.height = 'auto'
          textarea.style.height = `${textarea.scrollHeight}px`
        }
        textarea.addEventListener('input', adjustHeight)
        adjustHeight()
        return () => textarea.removeEventListener('input', adjustHeight)
      }
    }, [autoResize])

    return (
      <textarea
        className={cn(
          // Base styles
          'min-h-[88px] w-full rounded-none border bg-orion-surface px-4 py-3',
          'text-base leading-relaxed text-orion-fg placeholder:text-orion-fg-muted',
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
          // Resize control
          autoResize ? 'resize-none overflow-hidden' : 'resize-y',
          fullWidth && 'w-full',
          className
        )}
        ref={(el) => {
          textareaRef.current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) ref.current = el
        }}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
