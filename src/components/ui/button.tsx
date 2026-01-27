/**
 * Button Component - Orion Design System
 *
 * Story 1.7: Button Component Hierarchy
 *
 * Customized shadcn/ui Button with Orion Editorial Luxury styling.
 * Uses class-variance-authority for variant management.
 *
 * @example
 * // Primary button (default)
 * <Button>Confirm</Button>
 *
 * @example
 * // Secondary button
 * <Button variant="secondary">Cancel</Button>
 *
 * @example
 * // Tertiary button (text only with underline)
 * <Button variant="tertiary">View More</Button>
 *
 * @example
 * // Destructive button (red text)
 * <Button variant="destructive">Delete</Button>
 *
 * @example
 * // Loading state
 * <Button loading>Saving...</Button>
 *
 * @example
 * // Icon button
 * <Button size="icon" aria-label="Close"><XIcon /></Button>
 *
 * @example
 * // As link (using asChild)
 * <Button asChild><a href="/link">Link Button</a></Button>
 */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Button variants configuration using class-variance-authority
 *
 * Base styles include:
 * - Inline flex layout with centered content
 * - No text wrapping
 * - Inter font (inherited from design system)
 * - 100ms transition for state changes (AC#4)
 * - Sharp corners (0px border-radius) for Editorial Luxury aesthetic (AC#5)
 * - Disabled state styling
 * - Focus ring configuration
 *
 * Variants:
 * - default (Primary): Gold background with dark text (AC#1)
 * - secondary: Transparent with gold border (AC#2)
 * - tertiary: Text only with underline (AC#3)
 * - destructive: Red text for dangerous actions (AC#4)
 *
 * Sizes:
 * - sm: 44px height, smaller padding
 * - default: 44px height, standard padding (AC#6)
 * - lg: 52px height, larger padding
 * - icon: 44x44px square for icon-only buttons
 */
const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center whitespace-nowrap',
    'font-medium',
    'transition-colors duration-100 ease',
    'rounded-none', // Sharp corners - Editorial Luxury (AC#5)
    // Story 1.16: Focus-visible pattern with 2px gold outline, 2px offset
    'focus:outline-none',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary - AC#1: Gold background with dark text
        // Text is ALWAYS #1A1A1A regardless of theme for contrast on gold
        // Story 1.16: Gold focus ring
        default: [
          'bg-orion-gold text-[#1A1A1A]',
          'hover:bg-orion-gold/90',
          'active:bg-orion-gold/80',
          'focus-visible:outline-orion-gold',
        ].join(' '),

        // Secondary - AC#2: Transparent with gold border
        // Story 1.16: Gold focus ring
        secondary: [
          'border border-orion-gold bg-transparent text-orion-gold',
          'hover:bg-orion-gold/10',
          'active:bg-orion-gold/20',
          'focus-visible:outline-orion-gold',
        ].join(' '),

        // Tertiary - AC#3: Text only with underline
        // Story 1.16: Gold focus ring
        tertiary: [
          'bg-transparent text-orion-fg underline',
          'hover:text-orion-gold',
          'active:text-orion-gold/80',
          'focus-visible:outline-orion-gold',
        ].join(' '),

        // Destructive - AC#4: Red text for dangerous actions
        // Story 1.16: Red focus ring for destructive actions
        destructive: [
          'bg-transparent text-orion-error',
          'hover:text-orion-error/80',
          'active:text-orion-error/60',
          'focus-visible:outline-orion-error',
        ].join(' '),
      },
      size: {
        // All sizes maintain 44px minimum touch target (AC#6)
        default: 'h-11 px-4 py-2 text-sm', // 44px height
        sm: 'h-11 px-3 text-sm', // 44px height (touch target)
        lg: 'h-13 px-8 text-base', // 52px height
        icon: 'h-11 w-11', // 44x44px square
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

/**
 * Spinner component for loading state
 */
const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 mr-2"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

/**
 * Button component props
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * When true, renders the child as the button element using Radix Slot.
   * Useful for rendering links with button styling.
   * @default false
   */
  asChild?: boolean

  /**
   * When true, shows a loading spinner and disables the button.
   * Sets aria-busy="true" for accessibility.
   * @default false
   */
  loading?: boolean
}

/**
 * Button component with Orion Design System styling
 *
 * Implements all acceptance criteria from Story 1.7:
 * - AC#1: Primary buttons have gold background (#D4AF37) with dark text
 * - AC#2: Secondary buttons have transparent background with gold border
 * - AC#3: Tertiary buttons have no border, text only with underline
 * - AC#4: Destructive buttons have red text for dangerous actions
 * - AC#5: All buttons have 0px border-radius (Editorial Luxury aesthetic)
 * - AC#6: All buttons have 44x44px minimum touch target
 * - AC#7: All buttons have proper keyboard focus states (2px gold outline with 2px offset)
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    const isDisabled = disabled || loading

    // When using asChild, we cannot render both spinner and children
    // since Slot requires exactly one child. In asChild mode with loading,
    // the spinner would need to be handled by the child element.
    const content = asChild ? (
      children
    ) : (
      <>
        {loading && <Spinner />}
        {children}
      </>
    )

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading ? 'true' : undefined}
        {...props}
      >
        {content}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
