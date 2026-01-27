/**
 * useAnnounce Hook Tests - Story 1.17: Accessibility Components
 *
 * Tests for the aria-live announcement hook implementation.
 *
 * Test Coverage:
 * - Hook returns announce function
 * - Announce adds text to a live region
 * - Default priority is 'polite'
 * - 'assertive' priority works
 * - Cleanup on unmount
 *
 * Test ID Convention: 1.17-UNIT-{SEQ}
 */

import { describe, it, expect, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnnounce } from '@/hooks/useAnnounce'

describe('useAnnounce', () => {
  // Clean up any live regions after each test
  afterEach(() => {
    document
      .querySelectorAll('[data-testid="announce-region"]')
      .forEach((el) => el.remove())
  })

  describe('Hook Interface', () => {
    // 1.17-UNIT-01: Hook returns announce function
    it('returns an announce function', () => {
      const { result } = renderHook(() => useAnnounce())
      expect(result.current).toBeDefined()
      expect(result.current.announce).toBeDefined()
      expect(typeof result.current.announce).toBe('function')
    })

    // 1.17-UNIT-02: Returns same function across re-renders
    it('returns the same announce function across re-renders', () => {
      const { result, rerender } = renderHook(() => useAnnounce())

      const initialAnnounce = result.current.announce

      rerender()

      expect(result.current.announce).toBe(initialAnnounce)
    })
  })

  describe('Announcement Behavior', () => {
    // 1.17-UNIT-03: Calling announce adds text to a live region
    it('adds text to a live region when announce is called', () => {
      const { result } = renderHook(() => useAnnounce())

      act(() => {
        result.current.announce('Test message')
      })

      const liveRegion = document.querySelector('[data-testid="announce-region"]')
      expect(liveRegion).toBeTruthy()
      expect(liveRegion?.textContent).toBe('Test message')
    })

    // 1.17-UNIT-04: Can announce multiple messages
    it('can announce multiple messages', () => {
      const { result } = renderHook(() => useAnnounce())

      act(() => {
        result.current.announce('First message')
      })

      let liveRegion = document.querySelector('[data-testid="announce-region"]')
      expect(liveRegion?.textContent).toBe('First message')

      act(() => {
        result.current.announce('Second message')
      })

      liveRegion = document.querySelector('[data-testid="announce-region"]')
      expect(liveRegion?.textContent).toBe('Second message')
    })

    // 1.17-UNIT-05: Live region is visually hidden but accessible
    it('creates a visually hidden live region', () => {
      const { result } = renderHook(() => useAnnounce())

      act(() => {
        result.current.announce('Hidden message')
      })

      const liveRegion = document.querySelector(
        '[data-testid="announce-region"]'
      ) as HTMLElement
      expect(liveRegion).toBeTruthy()

      // Check that the region uses visually hidden styles
      const styles = window.getComputedStyle(liveRegion)
      // Should be positioned absolute and clipped to 1px
      expect(liveRegion.style.position).toBe('absolute')
      expect(liveRegion.style.width).toBe('1px')
      expect(liveRegion.style.height).toBe('1px')
      expect(liveRegion.style.overflow).toBe('hidden')
      expect(liveRegion.style.clip).toBe('rect(0px, 0px, 0px, 0px)')
    })
  })

  describe('Priority Levels', () => {
    // 1.17-UNIT-06: Default priority is 'polite'
    it('uses polite aria-live by default', () => {
      const { result } = renderHook(() => useAnnounce())

      act(() => {
        result.current.announce('Polite message')
      })

      const liveRegion = document.querySelector('[data-testid="announce-region"]')
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite')
    })

    // 1.17-UNIT-07: Explicit 'polite' priority works
    it('uses polite aria-live when specified', () => {
      const { result } = renderHook(() => useAnnounce())

      act(() => {
        result.current.announce('Polite message', 'polite')
      })

      const liveRegion = document.querySelector('[data-testid="announce-region"]')
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite')
    })

    // 1.17-UNIT-08: 'assertive' priority works
    it('uses assertive aria-live when specified', () => {
      const { result } = renderHook(() => useAnnounce())

      act(() => {
        result.current.announce('Urgent message', 'assertive')
      })

      const liveRegion = document.querySelector('[data-testid="announce-region"]')
      expect(liveRegion?.getAttribute('aria-live')).toBe('assertive')
    })

    // 1.17-UNIT-09: Switching priority levels updates the live region
    it('updates aria-live attribute when priority changes', () => {
      const { result } = renderHook(() => useAnnounce())

      act(() => {
        result.current.announce('First message', 'polite')
      })

      let liveRegion = document.querySelector('[data-testid="announce-region"]')
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite')

      act(() => {
        result.current.announce('Urgent message', 'assertive')
      })

      liveRegion = document.querySelector('[data-testid="announce-region"]')
      expect(liveRegion?.getAttribute('aria-live')).toBe('assertive')
    })
  })

  describe('Accessibility Attributes', () => {
    // 1.17-UNIT-10: Has proper role attribute
    it('has role="status" for the live region', () => {
      const { result } = renderHook(() => useAnnounce())

      act(() => {
        result.current.announce('Status message')
      })

      const liveRegion = document.querySelector('[data-testid="announce-region"]')
      expect(liveRegion?.getAttribute('role')).toBe('status')
    })

    // 1.17-UNIT-11: Has aria-atomic attribute
    it('has aria-atomic="true" for complete announcements', () => {
      const { result } = renderHook(() => useAnnounce())

      act(() => {
        result.current.announce('Complete message')
      })

      const liveRegion = document.querySelector('[data-testid="announce-region"]')
      expect(liveRegion?.getAttribute('aria-atomic')).toBe('true')
    })
  })

  describe('Cleanup', () => {
    // 1.17-UNIT-12: Removes live region on unmount
    it('removes the live region when component unmounts', () => {
      const { result, unmount } = renderHook(() => useAnnounce())

      act(() => {
        result.current.announce('Test message')
      })

      // Verify region exists
      expect(
        document.querySelector('[data-testid="announce-region"]')
      ).toBeTruthy()

      // Unmount the hook
      unmount()

      // Region should be removed
      expect(
        document.querySelector('[data-testid="announce-region"]')
      ).toBeNull()
    })
  })
})
