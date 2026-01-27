'use client'

/**
 * CommandPaletteModal - Placeholder Component
 * Story 1.15: Global Keyboard Shortcuts
 * Story 1.16: Focus States
 *
 * Placeholder modal for command palette (Cmd+K).
 * Full implementation will be in a future story.
 *
 * Story 1.15:
 * AC#3: Focus moves to the palette input when opened
 * - Modal appears with input focused
 * - Press Esc or Cmd+K to close
 *
 * Story 1.16:
 * AC#5: Focus is trapped within the modal until closed
 * AC#5: Esc key closes the modal and returns focus to trigger element
 */

import { useKeyboardShortcutContext } from '@/components/providers/KeyboardShortcutProvider'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { Command, X } from 'lucide-react'

export function CommandPaletteModal() {
  const { isCommandPaletteOpen, closeCommandPalette } = useKeyboardShortcutContext()

  // Story 1.16: Focus trap with Esc handling and focus restoration
  const focusTrapRef = useFocusTrap(isCommandPaletteOpen, {
    autoFocus: true,
    restoreFocus: true,
    onEscape: closeCommandPalette,
  })

  if (!isCommandPaletteOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      data-testid="command-palette-modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={closeCommandPalette}
        aria-hidden="true"
      />

      {/* Modal Content with Focus Trap */}
      <div
        ref={focusTrapRef}
        className="relative z-10 w-full max-w-lg mx-4 bg-orion-surface border border-orion-border shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-title"
        tabIndex={-1}
      >
        {/* Header with search input */}
        <div className="flex items-center px-4 py-3 border-b border-orion-border gap-3">
          <Command className="w-4 h-4 text-orion-fg-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-orion-fg placeholder:text-orion-fg-muted text-sm focus:outline-none"
            data-testid="command-palette-input"
          />
          <button
            onClick={closeCommandPalette}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-orion-fg-muted hover:text-orion-fg transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orion-gold"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content - Placeholder */}
        <div className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-orion-surface-elevated flex items-center justify-center">
              <Command className="w-6 h-6 text-orion-gold" />
            </div>
          </div>
          <h2
            id="command-palette-title"
            className="text-sm font-medium text-orion-fg mb-2"
          >
            Command Palette
          </h2>
          <p className="text-xs text-orion-fg-muted">
            This is a placeholder. Full command palette coming soon.
          </p>
          <p className="mt-4 text-xs text-orion-fg-muted">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-orion-surface-elevated border border-orion-border font-mono">Esc</kbd> or <kbd className="px-1.5 py-0.5 text-xs bg-orion-surface-elevated border border-orion-border font-mono">Cmd+K</kbd> to close
          </p>
        </div>
      </div>
    </div>
  )
}
