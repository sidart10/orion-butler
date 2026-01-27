'use client'

/**
 * KeyboardShortcutsSection Component
 * Story 1.15: Global Keyboard Shortcuts
 *
 * Settings page section displaying all available keyboard shortcuts.
 * Groups shortcuts by category (Global, Navigation, Chat).
 *
 * AC#7: Shortcuts are discoverable through a help mechanism
 */

import { ShortcutHintCompact } from '@/components/ui/shortcut-hint'
import { isMac } from '@/hooks/useKeyboardShortcuts'

/**
 * Shortcut definition for display
 */
interface ShortcutDefinition {
  /** Keys to press (using platform-appropriate display) */
  keys: string
  /** Human-readable description */
  description: string
  /** Category for grouping */
  category: 'Global' | 'Navigation' | 'Chat'
}

/**
 * Get the platform-appropriate modifier key display
 */
function getModifierKey(): string {
  return isMac ? 'Cmd' : 'Ctrl'
}

/**
 * All registered keyboard shortcuts
 */
function getShortcuts(): ShortcutDefinition[] {
  const mod = getModifierKey()

  return [
    // Global shortcuts
    { keys: `${mod}+N`, description: 'Quick capture', category: 'Global' },
    { keys: `${mod}+K`, description: 'Command palette', category: 'Global' },
    { keys: `${mod}+,`, description: 'Open Settings', category: 'Global' },
    { keys: 'Esc', description: 'Close / Dismiss', category: 'Global' },
    // Navigation shortcuts
    { keys: `${mod}+[`, description: 'Toggle sidebar', category: 'Navigation' },
    // Chat shortcuts
    { keys: `${mod}+Enter`, description: 'Send message', category: 'Chat' },
  ]
}

/**
 * Renders a group of shortcuts by category
 */
function ShortcutGroup({
  category,
  shortcuts,
}: {
  category: string
  shortcuts: ShortcutDefinition[]
}) {
  return (
    <div className="mb-6 last:mb-0">
      <h4 className="text-sm font-medium text-orion-fg-muted mb-3">
        {category}
      </h4>
      <div className="space-y-2">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.keys}
            className="flex justify-between items-center py-2 border-b border-orion-border last:border-b-0"
          >
            <span className="text-sm text-orion-fg">{shortcut.description}</span>
            <ShortcutHintCompact shortcut={shortcut.keys} />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Keyboard Shortcuts settings section
 *
 * Displays all available keyboard shortcuts grouped by category.
 */
export function KeyboardShortcutsSection() {
  const shortcuts = getShortcuts()
  const categories = ['Global', 'Navigation', 'Chat'] as const

  return (
    <div data-testid="keyboard-shortcuts-section">
      <h3 className="text-lg font-medium text-orion-fg mb-4">
        Keyboard Shortcuts
      </h3>

      {categories.map((category) => {
        const categoryShortcuts = shortcuts.filter((s) => s.category === category)
        if (categoryShortcuts.length === 0) return null

        return (
          <ShortcutGroup
            key={category}
            category={category}
            shortcuts={categoryShortcuts}
          />
        )
      })}

      <p className="mt-6 text-xs text-orion-fg-muted">
        {isMac
          ? 'Using Cmd key on macOS.'
          : 'Using Ctrl key on Windows/Linux.'}
      </p>
    </div>
  )
}
