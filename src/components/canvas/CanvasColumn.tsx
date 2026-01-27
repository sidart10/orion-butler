/**
 * CanvasColumn Component
 * Story 1.6: Canvas Column Placeholder
 * Story 1.11: Laptop Breakpoint
 * Story 1.12: Tablet Breakpoint
 * Story 1.16: Focus States
 *
 * A collapsible right panel that displays canvas content (calendars, emails, approvals).
 * Hidden by default (width: 0), expands to 480px when canvas is active.
 *
 * Layout Reference (from ux-design-specification.md):
 * +----------------+----------------------+------------------+
 * |  LEFT SIDEBAR  |      CHAT AREA       |   RIGHT PANEL    |
 * |     280px      |      (flex-1)        |   (320px/480px)  |
 * +----------------+----------------------+------------------+
 *
 * Story 1.11 Additions:
 * - AC#2: At laptop breakpoint, canvas overlays chat area (fixed positioning)
 * - Canvas uses position: fixed at laptop breakpoint
 * - Right-aligned, full height, 480px width
 * - Slides in with 300ms animation
 *
 * Story 1.12 Additions:
 * - AC#4: At tablet breakpoint, canvas is full-width overlay (100% width)
 * - Slides in from right
 * - Uses backdrop for dimming
 *
 * Story 1.16 Additions:
 * - AC#5: Focus is trapped within the canvas when open
 * - AC#5: Esc key closes canvas and returns focus to trigger element
 */

'use client'

import { cn } from '@/lib/utils'
import { useCanvasStore } from '@/stores/canvasStore'
import { useFocusTrap } from '@/hooks/useFocusTrap'
// X icon will be used when close button is implemented
import { EmailCanvas } from './EmailCanvas'

export interface CanvasColumnProps {
  /**
   * Whether canvas should use overlay mode (fixed positioning)
   * True at laptop and tablet breakpoints
   */
  isOverlay?: boolean
  /**
   * Whether canvas should be full-width (tablet breakpoint)
   * True at tablet breakpoint only
   */
  isFullWidth?: boolean
}

/**
 * CanvasColumn - Right panel for canvas content
 *
 * Features:
 * - Hidden by default (width: 0)
 * - Expands to 480px when isCanvasOpen is true (desktop/laptop)
 * - Full width (100%) at tablet breakpoint
 * - Smooth 300ms animation with luxury easing
 * - ESC key closes canvas when open
 * - Proper accessibility attributes
 * - Story 1.11: Fixed overlay mode at laptop breakpoint
 * - Story 1.12: Full-width overlay at tablet breakpoint
 * - Story 1.16: Focus trap with Esc handling and focus restoration
 */
export function CanvasColumn({ isOverlay = false, isFullWidth = false }: CanvasColumnProps) {
  const isCanvasOpen = useCanvasStore((state) => state.isCanvasOpen)
  const closeCanvas = useCanvasStore((state) => state.closeCanvas)

  // Story 1.16: Focus trap with Esc handling and focus restoration
  const focusTrapRef = useFocusTrap(isCanvasOpen && isOverlay, {
    autoFocus: true,
    restoreFocus: true,
    onEscape: closeCanvas,
  })

  // Overlay mode (laptop and tablet breakpoints) - uses fixed positioning
  if (isOverlay) {
    return (
      <>
        {/* Backdrop - subtle dimming behind canvas overlay */}
        {/* Story 1.13: Dark mode uses higher opacity for better contrast */}
        <div
          data-testid="canvas-backdrop"
          className={cn(
            'fixed inset-0 bg-black/20 dark:bg-black/40 z-40',
            'transition-opacity duration-300 ease-luxury',
            isCanvasOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={closeCanvas}
          aria-hidden="true"
        />

        {/* Canvas Panel - Fixed overlay with Focus Trap */}
        <aside
          ref={focusTrapRef}
          data-testid="canvas-column"
          className={cn(
            // Fixed positioning for overlay mode
            'fixed top-0 right-0 h-screen z-50',
            // Width: 100% for tablet, 480px for laptop
            isFullWidth ? 'w-full' : 'w-canvas',
            // Background and border
            'bg-orion-surface border-l border-orion-border',
            // Shadow for elevation
            'shadow-lg',
            // Animation (AC#4: 300ms cubic-bezier(0.4, 0, 0.2, 1))
            'transition-transform duration-300 ease-luxury',
            // Slide in/out animation
            isCanvasOpen ? 'translate-x-0' : 'translate-x-full'
          )}
          role="complementary"
          aria-label="Canvas panel"
          aria-hidden={!isCanvasOpen}
          tabIndex={-1}
        >
          {/* Canvas content */}
          <EmailCanvas onClose={closeCanvas} />
        </aside>
      </>
    )
  }

  // Desktop mode - uses absolute positioning to overlay context sidebar
  // Canvas slides in from the right and covers the context sidebar
  return (
    <aside
      data-testid="canvas-column"
      className={cn(
        // Absolute positioning to overlay context sidebar
        'absolute top-0 right-0 h-full',
        // Fixed width
        'w-canvas',
        // Background and border with shadow for depth
        'bg-orion-surface border-l border-orion-border',
        'shadow-[-8px_0_32px_rgba(0,0,0,0.08)]',
        // Animation - slide in/out from right
        'transition-transform duration-300 ease-luxury',
        // Slide position based on open state
        isCanvasOpen ? 'translate-x-0' : 'translate-x-full',
        // Z-index to ensure it overlays
        'z-40'
      )}
      role="complementary"
      aria-label="Canvas panel"
      aria-hidden={!isCanvasOpen}
      tabIndex={isCanvasOpen ? 0 : -1}
    >
      {/* Canvas content */}
      <div className="h-full">
        <EmailCanvas onClose={closeCanvas} />
      </div>
    </aside>
  )
}
