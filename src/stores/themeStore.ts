/**
 * Theme Store
 * Story 1.14: Dark Mode - Manual Toggle
 *
 * Zustand store for managing theme preference state.
 * Supports three modes: 'light', 'dark', 'system'
 *
 * Persistence: localStorage (SQLite integration deferred to future story)
 */

import { create } from 'zustand'

/** Theme preference values */
export type ThemePreference = 'light' | 'dark' | 'system'

/** Resolved theme (actual visual theme applied) */
export type ResolvedTheme = 'light' | 'dark'

/** localStorage key for theme preference cache */
export const THEME_STORAGE_KEY = 'theme-preference'

/**
 * Theme store state and actions interface
 */
export interface ThemeStore {
  /** User's theme preference: 'light' | 'dark' | 'system' */
  preference: ThemePreference
  /** The actual theme being displayed (resolved from preference + system) */
  resolvedTheme: ResolvedTheme
  /** Whether the theme has been initialized from storage */
  isInitialized: boolean

  /** Set the theme preference and persist to storage */
  setPreference: (pref: ThemePreference) => void
  /** Initialize theme from localStorage on app start */
  initializeTheme: () => void
  /** Update resolved theme based on preference and system settings */
  updateResolvedTheme: () => void
}

/**
 * Get the system's preferred color scheme
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Apply theme class to HTML element
 * - 'light' or 'dark' adds the respective class
 * - 'system' removes all classes, letting media query handle it
 */
function applyThemeClass(resolved: ResolvedTheme, preference: ThemePreference): void {
  if (typeof document === 'undefined') return

  const html = document.documentElement

  // Remove any existing theme class
  html.classList.remove('light', 'dark')

  // Apply class only if not using system preference
  if (preference !== 'system') {
    html.classList.add(resolved)
  }
  // No class = system detection via media query (Story 1.13)
}

/**
 * Theme preference state store
 *
 * @example
 * ```tsx
 * // In a component
 * const { preference, resolvedTheme, setPreference } = useThemeStore();
 *
 * // Set to dark mode
 * setPreference('dark');
 *
 * // Check current theme
 * if (resolvedTheme === 'dark') {
 *   // render dark UI
 * }
 * ```
 */
export const useThemeStore = create<ThemeStore>((set, get) => ({
  preference: 'light',  // Default to light mode - Orion is designed light-first
  resolvedTheme: 'light',
  isInitialized: false,

  setPreference: (pref: ThemePreference) => {
    // Update store state
    set({ preference: pref })

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, pref)
      } catch {
        // Ignore localStorage errors (e.g., private browsing)
      }
    }

    // Update resolved theme and apply class
    get().updateResolvedTheme()
  },

  initializeTheme: () => {
    if (typeof window === 'undefined') {
      set({ isInitialized: true })
      return
    }

    // Try localStorage cache first (fast)
    // Default to 'light' - Orion is designed light-first (cream background aesthetic)
    let preference: ThemePreference = 'light'

    try {
      const cached = localStorage.getItem(THEME_STORAGE_KEY)
      if (cached === 'light' || cached === 'dark' || cached === 'system') {
        preference = cached
      }
    } catch {
      // Ignore localStorage errors
    }

    set({ preference, isInitialized: true })
    get().updateResolvedTheme()
  },

  updateResolvedTheme: () => {
    const { preference } = get()
    let resolved: ResolvedTheme

    if (preference === 'system') {
      resolved = getSystemTheme()
    } else {
      resolved = preference
    }

    set({ resolvedTheme: resolved })
    applyThemeClass(resolved, preference)
  },
}))

// Expose store to window for E2E testing
if (typeof window !== 'undefined') {
  ;(window as unknown as { __THEME_STORE__: typeof useThemeStore }).__THEME_STORE__ = useThemeStore
}
