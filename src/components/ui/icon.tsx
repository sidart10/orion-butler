/**
 * Icon Component - Orion Design System
 *
 * Story 1.20: Icon System
 *
 * Wrapper component for Lucide icons providing consistent sizing and coloring
 * across the application. Uses design system color tokens.
 *
 * @example
 * // Default icon (md size, default color)
 * <Icon icon={Home} />
 *
 * @example
 * // Small muted icon
 * <Icon icon={Settings} size="sm" color="muted" />
 *
 * @example
 * // Large active (gold) icon
 * <Icon icon={Star} size="lg" color="active" />
 *
 * @example
 * // Accessible icon with label (non-decorative)
 * <Icon icon={AlertCircle} aria-hidden={false} aria-label="Warning" />
 *
 * @example
 * // Custom className override
 * <Icon icon={Bell} className="animate-pulse" />
 */

import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Size mapping for consistent icon dimensions
 * - xs: 12px - For very compact UI elements
 * - sm: 16px - For inline text icons
 * - md: 20px - Default, balanced size for most uses
 * - lg: 24px - For prominent icons, navigation
 */
const sizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
} as const

/**
 * Color mapping using design system tokens
 * - default: Standard foreground color (text-orion-fg)
 * - muted: Subdued foreground for secondary elements (text-orion-fg-muted)
 * - active: Gold accent color for active/selected state (text-orion-gold)
 * - disabled: Faint foreground for disabled elements (text-orion-fg-faint)
 */
const colors = {
  default: 'text-orion-fg',
  muted: 'text-orion-fg-muted',
  active: 'text-orion-gold',
  disabled: 'text-orion-fg-faint',
} as const

/**
 * Icon component props
 */
export interface IconProps {
  /**
   * The Lucide icon component to render
   */
  icon: LucideIcon

  /**
   * Size variant for the icon
   * @default 'md'
   */
  size?: keyof typeof sizes

  /**
   * Color variant using design system tokens
   * @default 'default'
   */
  color?: keyof typeof colors

  /**
   * Additional CSS classes to merge with defaults
   */
  className?: string

  /**
   * Whether the icon is decorative (hidden from screen readers)
   * Set to false for icons that convey meaning
   * @default true
   */
  'aria-hidden'?: boolean

  /**
   * Accessible label for non-decorative icons
   * Required when aria-hidden is false
   */
  'aria-label'?: string

  /**
   * Additional HTML attributes passed to the SVG element
   */
  [key: string]: unknown
}

/**
 * Icon component wrapper for Lucide icons
 *
 * Provides consistent sizing and coloring using the Orion design system tokens.
 * All icons are aria-hidden by default (decorative), set aria-hidden={false}
 * and provide aria-label for icons that convey meaning.
 *
 * Implements Story 1.20 acceptance criteria:
 * - Consistent sizing: xs (12px), sm (16px), md (20px), lg (24px)
 * - Color variants: default, muted, active, disabled
 * - Proper accessibility defaults (aria-hidden for decorative icons)
 */
export function Icon({
  icon: IconComponent,
  size = 'md',
  color = 'default',
  className,
  'aria-hidden': ariaHidden = true,
  ...props
}: IconProps) {
  return (
    <IconComponent
      size={sizes[size]}
      className={cn(colors[color], className)}
      aria-hidden={ariaHidden}
      {...props}
    />
  )
}
