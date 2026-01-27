/**
 * IconButton Component - Orion Design System
 *
 * Story 1.20: Icon System - IconButton
 *
 * Clickable icon button with accessible labels. The label is always required
 * for accessibility - when not shown visually, it becomes the aria-label.
 *
 * @example
 * // Icon-only button (label as aria-label)
 * <IconButton icon={X} label="Close" />
 *
 * @example
 * // Icon with visible label
 * <IconButton icon={Plus} label="Add item" showLabel />
 *
 * @example
 * // Outline variant
 * <IconButton icon={Settings} label="Settings" variant="outline" />
 *
 * @example
 * // Solid variant
 * <IconButton icon={Home} label="Home" variant="solid" />
 *
 * @example
 * // Large size with onClick handler
 * <IconButton icon={Menu} label="Menu" size="lg" onClick={handleClick} />
 */

import * as React from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Icon } from './icon'

/**
 * Size configurations for IconButton
 * All sizes maintain WCAG 44px minimum touch target (Task 5 requirement)
 */
const sizes = {
  sm: {
    button: 'min-h-[44px] min-w-[44px] p-2',
    icon: 'sm' as const,
    text: 'text-sm',
  },
  md: {
    button: 'min-h-[44px] min-w-[44px] p-2.5',
    icon: 'md' as const,
    text: 'text-sm',
  },
  lg: {
    button: 'min-h-[52px] min-w-[52px] p-3',
    icon: 'lg' as const,
    text: 'text-base',
  },
} as const

/**
 * Variant styles for IconButton
 * - ghost: Transparent background, subtle hover (default)
 * - outline: Border with transparent background
 * - solid: Filled background (gold)
 */
const variants = {
  ghost: [
    'bg-transparent text-orion-fg',
    'hover:bg-orion-fg/10',
    'active:bg-orion-fg/20',
  ].join(' '),
  outline: [
    'border border-orion-gold bg-transparent text-orion-fg',
    'hover:bg-orion-gold/10',
    'active:bg-orion-gold/20',
  ].join(' '),
  solid: [
    'bg-orion-gold text-[#1A1A1A]',
    'hover:bg-orion-gold/90',
    'active:bg-orion-gold/80',
  ].join(' '),
} as const

/**
 * IconButton component props
 */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The Lucide icon component to render
   */
  icon: LucideIcon

  /**
   * Accessible label for the button.
   * Always required for accessibility.
   * When showLabel is false, this becomes the aria-label.
   * When showLabel is true, this is rendered as visible text.
   */
  label: string

  /**
   * Show label visually next to the icon
   * @default false
   */
  showLabel?: boolean

  /**
   * Visual variant
   * @default 'ghost'
   */
  variant?: keyof typeof variants

  /**
   * Button size. All sizes maintain 44px minimum touch target.
   * @default 'md'
   */
  size?: keyof typeof sizes

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * IconButton component for clickable icons with accessible labels
 *
 * Implements Story 1.20 acceptance criteria:
 * - Always requires a label for accessibility
 * - Option to show or hide the label visually
 * - Minimum 44x44px touch target (WCAG compliance)
 * - Focus ring using focus-visible pattern
 * - Design system color tokens
 */
export function IconButton({
  icon,
  label,
  showLabel = false,
  variant = 'ghost',
  size = 'md',
  disabled,
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  const sizeConfig = sizes[size]

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        // Base layout
        'inline-flex items-center justify-center gap-2',
        'rounded-none', // Editorial Luxury - sharp corners
        'transition-colors duration-100 ease',
        // Focus ring (Story 1.16 pattern)
        'focus:outline-none',
        'focus-visible:outline',
        'focus-visible:outline-2',
        'focus-visible:outline-offset-2',
        'focus-visible:outline-orion-gold',
        // Disabled state
        'disabled:pointer-events-none disabled:opacity-50',
        // Size-specific styles
        sizeConfig.button,
        // Variant styles
        variants[variant],
        // Custom classes
        className
      )}
      // When label is not shown visually, use aria-label
      aria-label={showLabel ? undefined : label}
      {...props}
    >
      <Icon
        icon={icon}
        size={sizeConfig.icon}
        color={variant === 'solid' ? 'default' : 'default'}
        aria-hidden={true}
        className={variant === 'solid' ? 'text-inherit' : undefined}
      />
      {showLabel && (
        <span className={cn(sizeConfig.text, 'font-medium')}>
          {label}
        </span>
      )}
    </button>
  )
}
