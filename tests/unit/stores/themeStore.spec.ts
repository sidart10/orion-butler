/**
 * Theme Store Unit Tests
 * Story 1.14: Dark Mode - Manual Toggle
 *
 * Tests for theme state management including:
 * - Preference state transitions
 * - localStorage persistence
 * - Resolved theme computation
 * - HTML class application
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useThemeStore, THEME_STORAGE_KEY } from '@/stores/themeStore'
import type { ThemePreference } from '@/stores/themeStore'

describe('Story 1.14: Theme Store Unit Tests', () => {
  // Reset store and DOM before each test
  beforeEach(() => {
    // Reset store state
    useThemeStore.setState({
      preference: 'system',
      resolvedTheme: 'light',
      isInitialized: false,
    })

    // Clear localStorage
    localStorage.clear()

    // Remove theme classes
    document.documentElement.classList.remove('light', 'dark')

    // Reset matchMedia mock
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false, // Default to light system preference
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('1.14-UNIT: Initial state', () => {
    it('should have default preference of system', () => {
      const { preference } = useThemeStore.getState()
      expect(preference).toBe('system')
    })

    it('should have default resolvedTheme of light', () => {
      const { resolvedTheme } = useThemeStore.getState()
      expect(resolvedTheme).toBe('light')
    })

    it('should not be initialized by default', () => {
      const { isInitialized } = useThemeStore.getState()
      expect(isInitialized).toBe(false)
    })
  })

  describe('1.14-UNIT: setPreference action', () => {
    it('should update preference state to dark', () => {
      const { setPreference } = useThemeStore.getState()
      setPreference('dark')

      const { preference } = useThemeStore.getState()
      expect(preference).toBe('dark')
    })

    it('should update preference state to light', () => {
      const { setPreference } = useThemeStore.getState()
      setPreference('light')

      const { preference } = useThemeStore.getState()
      expect(preference).toBe('light')
    })

    it('should update preference state to system', () => {
      const { setPreference } = useThemeStore.getState()

      // First set to dark
      setPreference('dark')
      expect(useThemeStore.getState().preference).toBe('dark')

      // Then set to system
      setPreference('system')
      expect(useThemeStore.getState().preference).toBe('system')
    })

    it('should persist preference to localStorage', () => {
      const { setPreference } = useThemeStore.getState()
      setPreference('dark')

      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    })

    it('should persist light preference to localStorage', () => {
      const { setPreference } = useThemeStore.getState()
      setPreference('light')

      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    })

    it('should persist system preference to localStorage', () => {
      const { setPreference } = useThemeStore.getState()
      setPreference('system')

      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system')
    })
  })

  describe('1.14-UNIT: updateResolvedTheme', () => {
    it('should resolve to dark when preference is dark', () => {
      const { setPreference } = useThemeStore.getState()
      setPreference('dark')

      const { resolvedTheme } = useThemeStore.getState()
      expect(resolvedTheme).toBe('dark')
    })

    it('should resolve to light when preference is light', () => {
      const { setPreference } = useThemeStore.getState()
      setPreference('light')

      const { resolvedTheme } = useThemeStore.getState()
      expect(resolvedTheme).toBe('light')
    })

    it('should resolve to dark when preference is system and system is dark', () => {
      // Mock system dark preference
      vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
        matches: query.includes('dark'), // Return true for dark scheme query
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      const { setPreference } = useThemeStore.getState()
      setPreference('system')

      const { resolvedTheme } = useThemeStore.getState()
      expect(resolvedTheme).toBe('dark')
    })

    it('should resolve to light when preference is system and system is light', () => {
      // Mock system light preference (matches: false for dark query)
      vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      const { setPreference } = useThemeStore.getState()
      setPreference('system')

      const { resolvedTheme } = useThemeStore.getState()
      expect(resolvedTheme).toBe('light')
    })
  })

  describe('1.14-UNIT: HTML class application', () => {
    it('should add .dark class when preference is dark', () => {
      const { setPreference } = useThemeStore.getState()
      setPreference('dark')

      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.classList.contains('light')).toBe(false)
    })

    it('should add .light class when preference is light', () => {
      const { setPreference } = useThemeStore.getState()
      setPreference('light')

      expect(document.documentElement.classList.contains('light')).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('should remove classes when preference is system', () => {
      const { setPreference } = useThemeStore.getState()

      // First set to dark
      setPreference('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      // Switch to system
      setPreference('system')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(document.documentElement.classList.contains('light')).toBe(false)
    })

    it('should replace existing class when changing preference', () => {
      const { setPreference } = useThemeStore.getState()

      // Start with dark
      setPreference('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      // Switch to light
      setPreference('light')
      expect(document.documentElement.classList.contains('light')).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('1.14-UNIT: initializeTheme', () => {
    it('should initialize with light preference when no stored value', () => {
      // Orion defaults to 'light' - designed light-first (cream background aesthetic)
      const { initializeTheme } = useThemeStore.getState()
      initializeTheme()

      const { preference, isInitialized } = useThemeStore.getState()
      expect(preference).toBe('light')
      expect(isInitialized).toBe(true)
    })

    it('should initialize with dark preference from localStorage', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark')

      const { initializeTheme } = useThemeStore.getState()
      initializeTheme()

      const { preference, isInitialized } = useThemeStore.getState()
      expect(preference).toBe('dark')
      expect(isInitialized).toBe(true)
    })

    it('should initialize with light preference from localStorage', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light')

      const { initializeTheme } = useThemeStore.getState()
      initializeTheme()

      const { preference, isInitialized } = useThemeStore.getState()
      expect(preference).toBe('light')
      expect(isInitialized).toBe(true)
    })

    it('should ignore invalid localStorage values', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'invalid-value')

      const { initializeTheme } = useThemeStore.getState()
      initializeTheme()

      const { preference, isInitialized } = useThemeStore.getState()
      expect(preference).toBe('light') // Falls back to light (Orion default)
      expect(isInitialized).toBe(true)
    })

    it('should apply correct class after initialization', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark')

      const { initializeTheme } = useThemeStore.getState()
      initializeTheme()

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  describe('1.14-UNIT: localStorage sync', () => {
    it('should cache preference in localStorage on setPreference', () => {
      const { setPreference } = useThemeStore.getState()
      setPreference('dark')

      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    })

    it('should read from localStorage on initializeTheme', () => {
      // Pre-populate localStorage
      localStorage.setItem(THEME_STORAGE_KEY, 'light')

      const { initializeTheme } = useThemeStore.getState()
      initializeTheme()

      expect(useThemeStore.getState().preference).toBe('light')
    })
  })

  describe('1.14-UNIT: Theme preference cycling', () => {
    it('should correctly cycle through all preferences', () => {
      const { setPreference } = useThemeStore.getState()
      const preferences: ThemePreference[] = ['light', 'dark', 'system']

      for (const pref of preferences) {
        setPreference(pref)
        const { preference } = useThemeStore.getState()
        expect(preference).toBe(pref)
      }
    })
  })

  describe('1.14-UNIT: Edge cases', () => {
    it('should handle repeated setPreference calls', () => {
      const { setPreference } = useThemeStore.getState()

      // Call multiple times with same value
      setPreference('dark')
      setPreference('dark')
      setPreference('dark')

      expect(useThemeStore.getState().preference).toBe('dark')
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should handle rapid preference changes', () => {
      const { setPreference } = useThemeStore.getState()

      setPreference('dark')
      setPreference('light')
      setPreference('system')
      setPreference('dark')

      expect(useThemeStore.getState().preference).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })
})
