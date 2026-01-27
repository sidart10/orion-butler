/**
 * Canvas Store
 * Story 1.6: Canvas Column Placeholder
 *
 * Zustand store for managing canvas visibility state.
 * Controls whether the canvas column is shown or hidden.
 */

import { create } from 'zustand'

/**
 * Canvas store state and actions interface
 */
export interface CanvasStore {
  /** Whether the canvas column is currently open/visible */
  isCanvasOpen: boolean
  /** Opens the canvas column */
  openCanvas: () => void
  /** Closes the canvas column */
  closeCanvas: () => void
  /** Toggles the canvas column visibility */
  toggleCanvas: () => void
}

/**
 * Canvas visibility state store
 *
 * @example
 * ```tsx
 * // In a component
 * const isCanvasOpen = useCanvasStore((state) => state.isCanvasOpen);
 * const { openCanvas, closeCanvas, toggleCanvas } = useCanvasStore();
 * ```
 */
export const useCanvasStore = create<CanvasStore>((set) => ({
  isCanvasOpen: false,
  openCanvas: () => set({ isCanvasOpen: true }),
  closeCanvas: () => set({ isCanvasOpen: false }),
  toggleCanvas: () => set((state) => ({ isCanvasOpen: !state.isCanvasOpen })),
}))

// Expose store to window for E2E testing
if (typeof window !== 'undefined') {
  ;(window as unknown as { __CANVAS_STORE__: typeof useCanvasStore }).__CANVAS_STORE__ = useCanvasStore
}
