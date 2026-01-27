'use client'

/**
 * ThemeProvider
 * Story 1.14: Dark Mode - Manual Toggle
 *
 * Initializes theme from localStorage and listens for system preference changes.
 * Wraps the app to provide theme state management.
 *
 * Features:
 * - Initializes theme on mount from localStorage
 * - Listens for system preference changes when in "System" mode
 * - Applies appropriate class to <html> element
 */

import { useEffect } from 'react'
import { useThemeStore } from '@/stores/themeStore'

interface ThemeProviderProps {
  children: React.ReactNode
}

/**
 * ThemeProvider component
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * <ThemeProvider>
 *   {children}
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const { initializeTheme, preference, updateResolvedTheme, isInitialized } = useThemeStore()

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  // Listen for system preference changes when in "System" mode
  useEffect(() => {
    if (!isInitialized || preference !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      updateResolvedTheme()
    }

    // Update on system preference change
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [preference, updateResolvedTheme, isInitialized])

  return <>{children}</>
}
