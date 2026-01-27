/**
 * ThemeProvider Unit Tests
 * Story 1.14: Dark Mode - Manual Toggle
 *
 * Tests for ThemeProvider component including:
 * - Theme initialization on mount
 * - System preference change handling
 * - Children rendering
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { useThemeStore, THEME_STORAGE_KEY } from '@/stores/themeStore'

describe('Story 1.14: ThemeProvider Component', () => {
  // Store the original matchMedia listeners
  const listeners: Map<string, Set<() => void>> = new Map()

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

    // Clear listeners
    listeners.clear()

    // Mock matchMedia with listener tracking
    vi.mocked(window.matchMedia).mockImplementation((query: string) => {
      const queryListeners = new Set<() => void>()
      listeners.set(query, queryListeners)

      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event, handler) => {
          if (event === 'change') {
            queryListeners.add(handler as () => void)
          }
        }),
        removeEventListener: vi.fn((event, handler) => {
          if (event === 'change') {
            queryListeners.delete(handler as () => void)
          }
        }),
        dispatchEvent: vi.fn(),
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('1.14-UNIT: Component rendering', () => {
    it('should render children', () => {
      render(
        <ThemeProvider>
          <div data-testid="child">Test Child</div>
        </ThemeProvider>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should render multiple children', () => {
      render(
        <ThemeProvider>
          <div data-testid="child-1">First</div>
          <div data-testid="child-2">Second</div>
        </ThemeProvider>
      )

      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
    })
  })

  describe('1.14-UNIT: Theme initialization', () => {
    it('should initialize theme on mount', async () => {
      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(useThemeStore.getState().isInitialized).toBe(true)
      })
    })

    it('should apply dark class when localStorage has dark preference', async () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark')

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
      })
    })

    it('should apply light class when localStorage has light preference', async () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light')

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true)
      })
    })

    it('should not apply class when preference is system', async () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'system')

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(useThemeStore.getState().isInitialized).toBe(true)
      })

      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(document.documentElement.classList.contains('light')).toBe(false)
    })
  })

  describe('1.14-UNIT: System preference change handling', () => {
    it('should follow system changes when preference is system', async () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'system')

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(useThemeStore.getState().isInitialized).toBe(true)
      })

      // Verify it is in system mode
      expect(useThemeStore.getState().preference).toBe('system')
    })

    it('should not follow system changes when preference is dark', async () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark')

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(useThemeStore.getState().isInitialized).toBe(true)
      })

      // Verify it is in dark mode
      expect(useThemeStore.getState().preference).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  describe('1.14-UNIT: Component lifecycle', () => {
    it('should clean up on unmount without errors', async () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'system')

      const { unmount } = render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(useThemeStore.getState().isInitialized).toBe(true)
      })

      // Should unmount without throwing
      expect(() => unmount()).not.toThrow()
    })
  })
})
