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
 * SSR-safe implementation: always returns false during SSR and initial hydration
 * to prevent hydration mismatches. The actual value is set after mount.
 *
 * @param query - CSS media query string (e.g., '(min-width: 1024px)')
 * @returns boolean - true if the media query matches (false during SSR/hydration)
 */
export function useMediaQuery(query: string): boolean {
  // ALWAYS start with false for SSR/hydration consistency
  const [matches, setMatches] = useState(false)

  // Track if we've mounted (client-side only)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (typeof window === 'undefined') return

    const mediaQueryList = window.matchMedia(query)

    // Set initial value AFTER mount (no hydration mismatch)
    setMatches(mediaQueryList.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQueryList.addEventListener('change', handleChange)
    return () => mediaQueryList.removeEventListener('change', handleChange)
  }, [query])

  // During SSR and initial hydration, return false
  // After mount, return actual value
  return mounted ? matches : false
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

  // Track mount state for components that need to handle initial render
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => {
    setHasMounted(true)
  }, [])

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
    /**
     * Whether the component has mounted (client-side)
     * Components can use this to avoid layout flash during hydration
     */
    hasMounted,
  }
}
