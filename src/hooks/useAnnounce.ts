/**
 * useAnnounce Hook - Story 1.17: Accessibility Components
 *
 * A hook for making aria-live announcements to screen readers.
 * Creates an invisible live region that announces messages to assistive technologies.
 *
 * Features:
 * - Creates a visually hidden aria-live region
 * - Supports 'polite' (default) and 'assertive' priority levels
 * - Automatically cleans up on unmount
 * - Screen readers will automatically read announced messages
 *
 * @example
 * function MyComponent() {
 *   const { announce } = useAnnounce();
 *
 *   const handleSave = () => {
 *     // Save logic...
 *     announce('Changes saved successfully');
 *   };
 *
 *   const handleError = () => {
 *     announce('An error occurred', 'assertive');
 *   };
 *
 *   return <button onClick={handleSave}>Save</button>;
 * }
 */

import { useCallback, useEffect, useRef } from 'react'

/**
 * Priority levels for aria-live announcements
 * - 'polite': Waits for a pause in speech before announcing (default)
 * - 'assertive': Interrupts current speech to announce immediately
 */
export type AnnouncePriority = 'polite' | 'assertive'

/**
 * Visually hidden styles for the live region
 * These styles make the element invisible but still accessible to screen readers
 */
const VISUALLY_HIDDEN_STYLES: Partial<CSSStyleDeclaration> = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0px, 0px, 0px, 0px)',
  whiteSpace: 'nowrap',
  border: '0',
}

/**
 * Hook for making aria-live announcements to screen readers
 *
 * @returns An object containing the announce function
 */
export function useAnnounce() {
  const regionRef = useRef<HTMLDivElement | null>(null)

  /**
   * Create the live region element if it doesn't exist
   */
  const getOrCreateRegion = useCallback(() => {
    if (!regionRef.current) {
      const region = document.createElement('div')

      // Set accessibility attributes
      region.setAttribute('role', 'status')
      region.setAttribute('aria-live', 'polite')
      region.setAttribute('aria-atomic', 'true')
      region.setAttribute('data-testid', 'announce-region')

      // Apply visually hidden styles
      Object.assign(region.style, VISUALLY_HIDDEN_STYLES)

      document.body.appendChild(region)
      regionRef.current = region
    }

    return regionRef.current
  }, [])

  /**
   * Announce a message to screen readers
   *
   * @param message - The message to announce
   * @param priority - The priority level ('polite' or 'assertive'), defaults to 'polite'
   */
  const announce = useCallback(
    (message: string, priority: AnnouncePriority = 'polite') => {
      const region = getOrCreateRegion()

      // Update the aria-live priority
      region.setAttribute('aria-live', priority)

      // Set the message content
      // The screen reader will announce this automatically
      region.textContent = message
    },
    [getOrCreateRegion]
  )

  /**
   * Clean up the live region on unmount
   */
  useEffect(() => {
    return () => {
      if (regionRef.current) {
        regionRef.current.remove()
        regionRef.current = null
      }
    }
  }, [])

  return { announce }
}

export default useAnnounce
