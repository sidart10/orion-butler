/**
 * Hooks - Barrel Export
 * Story 1.11: Laptop Breakpoint
 * Story 1.15: Global Keyboard Shortcuts
 * Story 1.16: Focus States
 * Story 1.17: Accessibility Components
 */

export { useMediaQuery, useBreakpoint } from './useMediaQuery'
export { useAnnounce, type AnnouncePriority } from './useAnnounce'
export {
  useKeyboardShortcuts,
  buildShortcutKey,
  isInputElement,
  formatShortcutForDisplay,
  isMac,
} from './useKeyboardShortcuts'
export type {
  ModifierKeys,
  ShortcutCategory,
  ShortcutConfig,
} from './useKeyboardShortcuts'
export { useFocusTrap } from './useFocusTrap'

// =============================================================================
// Chat & Streaming Hooks (Story 2.5/2.6)
// =============================================================================

export { useStreamingMachine } from './useStreamingMachine'
export {
  useBufferedStreamListener,
  useBufferedTextStream,
  useBufferedEventStream,
} from './useBufferedStreamListener'
export {
  useChat,
  useChatSimple,
  useLatencyReporter,
  type LatencyMetrics,
  type UseChatOptions,
  type UseChatReturn,
} from './useChat'
