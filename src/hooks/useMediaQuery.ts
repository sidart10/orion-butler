/**
 * useMediaQuery Hook
 * Story 1.11: Laptop Breakpoint
 * Story 1.12: Tablet Breakpoint
 *
 * React hook for responsive design that tracks CSS media query matches.
 * Used to detect viewport breakpoints for responsive layout changes.
 *
 * @example
 * ```tsx
 * const isLaptop = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)');
 * const isDesktop = useMediaQuery('(min-width: 1280px)');
 * ```
 */

'use client'

import { useState, useEffect } from 'react'

/**
 * Hook that tracks whether a CSS media query matches
 *
 * @param query - CSS media query string (e.g., '(min-width: 1024px)')
 * @returns boolean - true if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Use lazy initializer to get correct initial value on client
  // This reduces the flash of incorrect state during hydration
  const [matches, setMatches] = useState(() => {
    // During SSR, return false (will be corrected on hydration)
    if (typeof window === 'undefined') {
      return false
    }
    // On client, check immediately
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return
    }

    const mediaQueryList = window.matchMedia(query)

    // Update if it changed (handles SSR -> client transition)
    if (mediaQueryList.matches !== matches) {
      setMatches(mediaQueryList.matches)
    }

    // Handler for media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener (modern API)
    mediaQueryList.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      mediaQueryList.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

/**
 * Hook that provides Orion breakpoint states
 *
 * @returns Object with boolean flags for each breakpoint
 *
 * @example
 * ```tsx
 * const { isLaptop, isDesktop, isTablet } = useBreakpoint();
 *
 * if (isLaptop) {
 *   // Sidebar is collapsed to icon-only mode
 * }
 *
 * if (isTablet) {
 *   // Sidebar is hidden, hamburger menu shown
 * }
 * ```
 */
export function useBreakpoint() {
  // Desktop: >= 1280px
  const isDesktop = useMediaQuery('(min-width: 1280px)')

  // Laptop: 1024px - 1279px
  const isLaptop = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)')

  // Tablet: < 1024px (Story 1.12)
  // Note: Using max-width: 1023px to detect tablet breakpoint
  const isTablet = useMediaQuery('(max-width: 1023px)')

  // Mobile: < 768px (Story 1.13 - placeholder)
  const isMobile = useMediaQuery('(max-width: 767px)')

  return {
    isDesktop,
    isLaptop,
    isTablet,
    isMobile,
    /**
     * Whether sidebar should be collapsed to icon-only mode
     * True at laptop breakpoint only (not tablet - tablet uses overlay)
     */
    isSidebarCollapsed: isLaptop,
    /**
     * Whether sidebar should be in overlay mode
     * True at tablet breakpoint (Story 1.12)
     */
    isSidebarOverlay: isTablet,
    /**
     * Whether canvas should use overlay mode
     * True at laptop and tablet breakpoints
     */
    isCanvasOverlay: isLaptop || isTablet,
    /**
     * Whether canvas should be full-width
     * True at tablet breakpoint only (Story 1.12)
     */
    isCanvasFullWidth: isTablet,
  }
}
