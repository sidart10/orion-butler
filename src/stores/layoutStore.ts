/**
 * Layout Store
 * Story 1.11: Laptop Breakpoint
 * Story 1.12: Tablet Breakpoint
 *
 * Zustand store for managing layout state including sidebar collapse and overlay.
 * This store manages user-initiated state (manual toggle).
 * Breakpoint-driven collapse is handled by CSS/hooks separately.
 */

import { create } from 'zustand'

/**
 * Layout store state and actions interface
 */
export interface LayoutStore {
  /**
   * Whether sidebar is manually collapsed by user
   * Note: At laptop breakpoint, sidebar is always collapsed regardless of this state
   */
  isSidebarManuallyCollapsed: boolean

  /** Toggles the manual sidebar collapse state */
  toggleSidebar: () => void

  /** Expands the sidebar (sets manual collapse to false) */
  expandSidebar: () => void

  /** Collapses the sidebar (sets manual collapse to true) */
  collapseSidebar: () => void

  /**
   * Whether sidebar overlay is open (tablet breakpoint)
   * Story 1.12: Sidebar slides in as overlay at tablet breakpoint
   */
  isSidebarOverlayOpen: boolean

  /** Opens the sidebar overlay */
  openSidebarOverlay: () => void

  /** Closes the sidebar overlay */
  closeSidebarOverlay: () => void

  /** Toggles the sidebar overlay */
  toggleSidebarOverlay: () => void

  /**
   * Whether context sidebar (right) is collapsed
   */
  isContextSidebarCollapsed: boolean

  /** Toggles the context sidebar collapse state */
  toggleContextSidebar: () => void

  /** Expands the context sidebar */
  expandContextSidebar: () => void

  /** Collapses the context sidebar */
  collapseContextSidebar: () => void
}

/**
 * Layout state store
 *
 * @example
 * ```tsx
 * const { isSidebarManuallyCollapsed, toggleSidebar } = useLayoutStore();
 * const { isSidebarOverlayOpen, toggleSidebarOverlay } = useLayoutStore();
 * ```
 */
export const useLayoutStore = create<LayoutStore>((set) => ({
  isSidebarManuallyCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarManuallyCollapsed: !state.isSidebarManuallyCollapsed })),
  expandSidebar: () => set({ isSidebarManuallyCollapsed: false }),
  collapseSidebar: () => set({ isSidebarManuallyCollapsed: true }),

  // Story 1.12: Sidebar overlay state
  isSidebarOverlayOpen: false,
  openSidebarOverlay: () => set({ isSidebarOverlayOpen: true }),
  closeSidebarOverlay: () => set({ isSidebarOverlayOpen: false }),
  toggleSidebarOverlay: () =>
    set((state) => ({ isSidebarOverlayOpen: !state.isSidebarOverlayOpen })),

  // Context sidebar (right) collapse state
  isContextSidebarCollapsed: false,
  toggleContextSidebar: () =>
    set((state) => ({ isContextSidebarCollapsed: !state.isContextSidebarCollapsed })),
  expandContextSidebar: () => set({ isContextSidebarCollapsed: false }),
  collapseContextSidebar: () => set({ isContextSidebarCollapsed: true }),
}))

// Expose store to window for E2E testing
if (typeof window !== 'undefined') {
  ;(window as unknown as { __LAYOUT_STORE__: typeof useLayoutStore }).__LAYOUT_STORE__ =
    useLayoutStore
}
