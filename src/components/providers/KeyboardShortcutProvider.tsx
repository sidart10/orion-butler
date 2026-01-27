'use client'

/**
 * KeyboardShortcutProvider
 * Story 1.15: Global Keyboard Shortcuts
 *
 * Provider component that registers all global keyboard shortcuts and provides
 * context for child components to control modals/palettes.
 *
 * Shortcuts registered:
 * - Cmd+[ : Toggle sidebar (AC#2)
 * - Cmd+N : Open quick capture (AC#1)
 * - Cmd+K : Toggle command palette (AC#3)
 * - Cmd+, : Open settings (from Story 7.2/PRD)
 * - Esc   : Close modals/canvas (AC#5)
 *
 * AC#6: System shortcuts (Cmd+C, Cmd+V, etc.) are not registered, so they work normally
 * AC#8: Navigation shortcuts disabled in input fields (except Esc which has allowInInput: true)
 */

import { createContext, useContext, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useKeyboardShortcuts, type ShortcutConfig } from '@/hooks/useKeyboardShortcuts'
import { useLayoutStore } from '@/stores/layoutStore'
import { useCanvasStore } from '@/stores/canvasStore'

/**
 * Context value for keyboard shortcuts
 */
export interface KeyboardShortcutContextValue {
  /** Opens the command palette */
  openCommandPalette: () => void
  /** Closes the command palette */
  closeCommandPalette: () => void
  /** Opens the quick capture modal */
  openQuickCapture: () => void
  /** Closes the quick capture modal */
  closeQuickCapture: () => void
  /** Whether the command palette is currently open */
  isCommandPaletteOpen: boolean
  /** Whether the quick capture modal is currently open */
  isQuickCaptureOpen: boolean
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextValue | null>(null)

/**
 * Hook to access keyboard shortcut context
 * Must be used within KeyboardShortcutProvider
 */
export function useKeyboardShortcutContext() {
  const context = useContext(KeyboardShortcutContext)
  if (!context) {
    throw new Error(
      'useKeyboardShortcutContext must be used within KeyboardShortcutProvider'
    )
  }
  return context
}

export interface KeyboardShortcutProviderProps {
  children: React.ReactNode
}

/**
 * Provider component for global keyboard shortcuts
 *
 * Registers all shortcuts on mount and provides context for controlling
 * modals and palettes opened by shortcuts.
 */
export function KeyboardShortcutProvider({ children }: KeyboardShortcutProviderProps) {
  const router = useRouter()
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [isQuickCaptureOpen, setQuickCaptureOpen] = useState(false)

  // Layout store for sidebar toggle
  const toggleSidebar = useLayoutStore((state) => state.toggleSidebar)

  // Canvas store for Esc to close canvas
  const closeCanvas = useCanvasStore((state) => state.closeCanvas)
  const isCanvasOpen = useCanvasStore((state) => state.isCanvasOpen)

  // Context actions
  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), [])
  const closeCommandPalette = useCallback(() => setCommandPaletteOpen(false), [])
  const openQuickCapture = useCallback(() => setQuickCaptureOpen(true), [])
  const closeQuickCapture = useCallback(() => setQuickCaptureOpen(false), [])

  // Build shortcuts array
  // Note: These are defined inside the component to access state setters
  const shortcuts: ShortcutConfig[] = [
    // AC#2: Cmd+[ toggles sidebar collapse/expand
    {
      key: '[',
      modifiers: { meta: true },
      action: toggleSidebar,
      description: 'Toggle sidebar',
      category: 'navigation',
    },
    // AC#1: Cmd+N opens quick capture placeholder
    {
      key: 'n',
      modifiers: { meta: true },
      action: openQuickCapture,
      description: 'Quick capture',
      category: 'global',
    },
    // AC#3: Cmd+K opens command palette placeholder
    {
      key: 'k',
      modifiers: { meta: true },
      action: () => setCommandPaletteOpen((prev) => !prev),
      description: 'Command palette',
      category: 'global',
    },
    // Cmd+, opens settings (per Story 7.2/PRD)
    {
      key: ',',
      modifiers: { meta: true },
      action: () => router.push('/settings'),
      description: 'Open Settings',
      category: 'navigation',
    },
    // AC#5: Esc closes canvas/modal/palette (priority order)
    {
      key: 'Escape',
      modifiers: {},
      action: () => {
        // Priority: quick capture > command palette > canvas
        if (isQuickCaptureOpen) {
          setQuickCaptureOpen(false)
        } else if (isCommandPaletteOpen) {
          setCommandPaletteOpen(false)
        } else if (isCanvasOpen) {
          closeCanvas()
        }
      },
      description: 'Close / Dismiss',
      category: 'global',
      // AC#8: Esc should work even in inputs
      allowInInput: true,
    },
  ]

  // Register all shortcuts
  useKeyboardShortcuts(shortcuts)

  const contextValue: KeyboardShortcutContextValue = {
    openCommandPalette,
    closeCommandPalette,
    openQuickCapture,
    closeQuickCapture,
    isCommandPaletteOpen,
    isQuickCaptureOpen,
  }

  return (
    <KeyboardShortcutContext.Provider value={contextValue}>
      {children}
    </KeyboardShortcutContext.Provider>
  )
}
