'use client'

/**
 * QuickCaptureModal - Placeholder Component
 * Story 1.15: Global Keyboard Shortcuts
 * Story 1.16: Focus States
 *
 * Placeholder modal for quick capture (Cmd+N).
 * Full implementation will be in Epic 6: Quick Capture & Inbox Processing.
 *
 * Story 1.15:
 * AC#1: Visual indicator confirms the shortcut was received
 * - Modal appears with input focused
 * - Press Esc to close
 *
 * Story 1.16:
 * AC#5: Focus is trapped within the modal until closed
 * AC#5: Esc key closes the modal and returns focus to trigger element
 */

import { useKeyboardShortcutContext } from '@/components/providers/KeyboardShortcutProvider'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { X } from 'lucide-react'

export function QuickCaptureModal() {
  const { isQuickCaptureOpen, closeQuickCapture } = useKeyboardShortcutContext()

  // Story 1.16: Focus trap with Esc handling and focus restoration
  const focusTrapRef = useFocusTrap(isQuickCaptureOpen, {
    autoFocus: true,
    restoreFocus: true,
    onEscape: closeQuickCapture,
  })

  if (!isQuickCaptureOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      data-testid="quick-capture-modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={closeQuickCapture}
        aria-hidden="true"
      />

      {/* Modal Content with Focus Trap */}
      <div
        ref={focusTrapRef}
        className="relative z-10 w-full max-w-lg mx-4 bg-orion-surface border border-orion-border shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-capture-title"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-orion-border">
          <h2
            id="quick-capture-title"
            className="text-sm font-medium text-orion-fg"
          >
            Quick Capture
          </h2>
          <button
            onClick={closeQuickCapture}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-orion-fg-muted hover:text-orion-fg transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orion-gold"
            aria-label="Close quick capture"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <input
            type="text"
            placeholder="What's on your mind?"
            className="w-full px-4 py-3 bg-orion-bg border border-orion-border text-orion-fg placeholder:text-orion-fg-muted rounded-none focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orion-gold"
            onKeyDown={(e) => {
              // Enter would submit - placeholder for now
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                // TODO: Implement capture save in Epic 6
                closeQuickCapture()
              }
            }}
            data-testid="quick-capture-input"
          />
          <p className="mt-3 text-xs text-orion-fg-muted">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-orion-surface-elevated border border-orion-border font-mono">Enter</kbd> to capture, <kbd className="px-1.5 py-0.5 text-xs bg-orion-surface-elevated border border-orion-border font-mono">Esc</kbd> to close
          </p>
          <p className="mt-2 text-xs text-orion-fg-muted italic">
            Full capture functionality coming in Epic 6.
          </p>
        </div>
      </div>
    </div>
  )
}
