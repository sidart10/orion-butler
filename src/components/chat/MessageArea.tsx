/**
 * MessageArea Component
 * Story 1.5: Main Chat Column
 *
 * Scrollable area for displaying chat messages.
 *
 * Acceptance Criteria:
 * - AC#2: Scrollable message area for future chat messages
 *
 * Accessibility:
 * - aria-live="polite" for screen reader updates
 */

'use client'

import { cn } from '@/lib/utils'

export interface MessageAreaProps {
  /** Optional children for message content */
  children?: React.ReactNode
  /** CSS class overrides */
  className?: string
}

export function MessageArea({ children, className }: MessageAreaProps) {
  const hasMessages = Boolean(children)

  return (
    <div
      data-testid="message-area"
      aria-live="polite"
      className={cn(
        // Layout
        'flex-1 overflow-y-auto',
        // Spacing (design tokens) - updated to match template px-8 py-8
        'px-8 py-8',
        className
      )}
    >
      <div className="max-w-[640px] mx-auto space-y-6">
        {hasMessages ? (
          children
        ) : (
          <div
            data-testid="empty-state-container"
            className="h-full flex items-center justify-center"
          >
            <p className="text-orion-fg-muted text-sm">
              Start a conversation...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
