/**
 * useKeyboardShortcuts Hook
 * Story 1.15: Global Keyboard Shortcuts
 *
 * Core hook for global keyboard event handling with:
 * - Shortcut registration with action callbacks
 * - Modifier key detection (Cmd/Ctrl, Shift, Alt/Option)
 * - Scope detection (global vs input-focused)
 * - Conflict prevention for system shortcuts
 * - Cross-platform support (Meta=Cmd on Mac, Ctrl on Windows)
 *
 * AC#1-8: Keyboard shortcut infrastructure
 */

import { useEffect, useCallback, useRef } from 'react'

/**
 * Modifier key state
 */
export type ModifierKeys = {
  meta: boolean
  shift: boolean
  alt: boolean
}

/**
 * Shortcut category for grouping in help display
 */
export type ShortcutCategory = 'global' | 'navigation' | 'chat'

/**
 * Configuration for a keyboard shortcut
 */
export interface ShortcutConfig {
  /** The key to listen for (e.g., 'k', '[', 'Enter', 'Escape') */
  key: string
  /** Modifier keys required */
  modifiers: Partial<ModifierKeys>
  /** Action to execute when shortcut is triggered */
  action: () => void
  /** Human-readable description for help display */
  description: string
  /** Category for grouping shortcuts */
  category: ShortcutCategory
  /** Whether this shortcut should work when an input field is focused. Defaults to false. */
  allowInInput?: boolean
}

/**
 * Build a unique key string from key and modifiers
 * Format: "meta+shift+alt+key" (sorted modifiers)
 */
export function buildShortcutKey(
  key: string,
  modifiers: Partial<ModifierKeys>
): string {
  const parts: string[] = []
  if (modifiers.meta) parts.push('meta')
  if (modifiers.shift) parts.push('shift')
  if (modifiers.alt) parts.push('alt')
  parts.push(key.toLowerCase())
  return parts.join('+')
}

/**
 * Check if the currently focused element is an input field
 * (input, textarea, or contenteditable)
 */
export function isInputElement(element: Element | null): boolean {
  if (!element) return false

  const tagName = element.tagName.toLowerCase()
  if (tagName === 'input' || tagName === 'textarea') return true
  if (element.getAttribute('contenteditable') === 'true') return true

  return false
}

/**
 * Detect platform once at module load
 * Used to determine if meta key should map to Cmd (Mac) or Ctrl (Windows/Linux)
 */
const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform || '')

/**
 * Hook for registering and handling global keyboard shortcuts
 *
 * @param shortcuts - Array of shortcut configurations to register
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   {
 *     key: 'k',
 *     modifiers: { meta: true },
 *     action: () => openCommandPalette(),
 *     description: 'Open command palette',
 *     category: 'global',
 *   },
 *   {
 *     key: 'Escape',
 *     modifiers: {},
 *     action: () => closeModal(),
 *     description: 'Close modal',
 *     category: 'global',
 *     allowInInput: true,
 *   },
 * ])
 * ```
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  // Use ref to avoid re-creating event handler on every shortcuts change
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Use metaKey on Mac, ctrlKey on Windows/Linux
    // This ensures Ctrl+K on Mac doesn't trigger Cmd+K actions
    const modifiers: ModifierKeys = {
      meta: isMac ? event.metaKey : event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
    }

    const eventKey = buildShortcutKey(event.key, modifiers)

    // Find matching shortcut
    const shortcut = shortcutsRef.current.find((s) => {
      const shortcutKey = buildShortcutKey(s.key, s.modifiers)
      return shortcutKey === eventKey
    })

    if (!shortcut) return

    // Check if in input and shortcut is not allowed in input
    if (isInputElement(document.activeElement) && !shortcut.allowInInput) {
      return
    }

    // Prevent default and execute action
    event.preventDefault()
    shortcut.action()
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Format a shortcut for display
 * Uses platform-appropriate symbols
 *
 * @example
 * formatShortcutForDisplay({ meta: true }, 'k') // "Cmd+K" on Mac, "Ctrl+K" on Windows
 */
export function formatShortcutForDisplay(
  modifiers: Partial<ModifierKeys>,
  key: string
): string {
  const parts: string[] = []

  if (modifiers.meta) {
    parts.push(isMac ? 'Cmd' : 'Ctrl')
  }
  if (modifiers.shift) {
    parts.push('Shift')
  }
  if (modifiers.alt) {
    parts.push(isMac ? 'Opt' : 'Alt')
  }

  // Format special keys
  const formattedKey =
    key === 'Escape'
      ? 'Esc'
      : key === 'Enter'
        ? 'Enter'
        : key.length === 1
          ? key.toUpperCase()
          : key

  parts.push(formattedKey)

  return parts.join('+')
}

export { isMac }
