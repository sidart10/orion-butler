/**
 * useFocusTrap Hook - Story 1.16: Focus States
 *
 * A hook for trapping focus within a container element.
 * Implements AC#5: Focus trapped within modals, Esc closes and restores focus.
 *
 * Features:
 * - Stores previous focus element on activation
 * - Traps Tab/Shift+Tab within the container
 * - Restores focus to previous element on cleanup
 * - Focuses first focusable element when activated
 *
 * @example
 * function Modal({ isOpen, onClose }) {
 *   const containerRef = useFocusTrap(isOpen);
 *
 *   return (
 *     <div ref={containerRef} role="dialog" aria-modal="true">
 *       <button>First focusable</button>
 *       <input />
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   );
 * }
 */

import { useEffect, useRef, useCallback } from 'react'

/**
 * Selector for all focusable elements
 */
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Hook for trapping focus within a container
 *
 * @param isActive - Whether focus trap is currently active
 * @param options - Optional configuration
 * @returns A ref to attach to the container element
 */
export function useFocusTrap(
  isActive: boolean,
  options?: {
    /**
     * Whether to focus the first element when trap activates
     * @default true
     */
    autoFocus?: boolean
    /**
     * Whether to restore focus when trap deactivates
     * @default true
     */
    restoreFocus?: boolean
    /**
     * Optional callback when Escape key is pressed
     */
    onEscape?: () => void
  }
) {
  const {
    autoFocus = true,
    restoreFocus = true,
    onEscape,
  } = options || {}

  const containerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  /**
   * Get all focusable elements within the container
   */
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((el) => {
      // Additional check: element must be visible
      return el.offsetParent !== null
    })
  }, [])

  /**
   * Handle keydown events for focus trapping
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Handle Escape key
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault()
        onEscape()
        return
      }

      // Only trap Tab key
      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Shift+Tab: if on first element, go to last
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
        return
      }

      // Tab: if on last element, go to first
      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
        return
      }

      // If focus is outside the container, trap it
      if (!containerRef.current?.contains(document.activeElement)) {
        event.preventDefault()
        firstElement?.focus()
      }
    },
    [getFocusableElements, onEscape]
  )

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    // Store previous focus
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement
    }

    // Focus first element
    if (autoFocus) {
      // Use requestAnimationFrame to ensure the container is rendered
      const frameId = requestAnimationFrame(() => {
        const focusableElements = getFocusableElements()
        if (focusableElements.length > 0) {
          focusableElements[0].focus()
        } else {
          // If no focusable elements, focus the container itself
          containerRef.current?.focus()
        }
      })

      // Cleanup
      return () => {
        cancelAnimationFrame(frameId)
      }
    }
  }, [isActive, autoFocus, restoreFocus, getFocusableElements])

  // Set up keydown listener
  useEffect(() => {
    if (!isActive) return

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      // Restore focus when deactivating
      if (restoreFocus && previousFocusRef.current) {
        // Use requestAnimationFrame to avoid focus race conditions
        requestAnimationFrame(() => {
          previousFocusRef.current?.focus()
          previousFocusRef.current = null
        })
      }
    }
  }, [isActive, handleKeyDown, restoreFocus])

  return containerRef
}

export default useFocusTrap
