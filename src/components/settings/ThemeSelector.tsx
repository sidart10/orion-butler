'use client'

/**
 * ThemeSelector
 * Story 1.14: Dark Mode - Manual Toggle
 *
 * Three-option segmented control for theme selection.
 * Options: Light | Dark | System
 *
 * Features:
 * - Active option highlighted with gold accent (#D4AF37)
 * - 0px border-radius (Editorial Luxury aesthetic)
 * - aria-pressed for accessibility
 * - Gold focus outline with 2px offset
 */

import { useThemeStore, type ThemePreference } from '@/stores/themeStore'

interface ThemeOption {
  value: ThemePreference
  label: string
}

const options: ThemeOption[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

/**
 * ThemeSelector component
 *
 * @example
 * ```tsx
 * // In settings page
 * <ThemeSelector />
 * ```
 */
export function ThemeSelector() {
  const { preference, setPreference } = useThemeStore()

  return (
    <div
      className="flex"
      role="group"
      aria-label="Theme selection"
      data-testid="theme-selector"
    >
      {options.map((option, index) => {
        const isActive = preference === option.value
        const isFirst = index === 0
        const isLast = index === options.length - 1

        return (
          <button
            key={option.value}
            onClick={() => setPreference(option.value)}
            className={`
              px-4 min-h-[44px] text-sm font-medium
              border border-orion-border
              transition-colors duration-100
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orion-gold
              focus-visible:z-10 relative
              ${isActive
                ? 'bg-orion-gold text-[#1A1A1A] border-orion-gold'
                : 'bg-orion-surface text-orion-fg hover:bg-orion-surface-elevated'
              }
              ${!isFirst ? '-ml-px' : ''}
              ${isFirst ? 'rounded-l-none' : ''}
              ${isLast ? 'rounded-r-none' : ''}
            `}
            aria-pressed={isActive}
            data-testid={`theme-option-${option.value}`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
