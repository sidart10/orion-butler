/**
 * MessageArea Component
 * Story 1.5: Main Chat Column
 *
 * Scrollable area for displaying chat messages.
 * Supports auto-scroll with pause/resume on manual scroll.
 *
 * Acceptance Criteria:
 * - AC#2: Scrollable message area for future chat messages
 * - New messages auto-scroll to bottom
 * - Manual scroll up pauses auto-scroll
 * - Scrolling back to bottom resumes auto-scroll
 *
 * Accessibility:
 * - aria-live="polite" for screen reader updates
 */

'use client'

import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface MessageAreaProps {
  /** Optional children for message content */
  children?: React.ReactNode
  /** CSS class overrides */
  className?: string
  /** Number of messages - used to trigger auto-scroll */
  messageCount?: number
}

export function MessageArea({ children, className, messageCount = 0 }: MessageAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isUserScrollingRef = useRef(false)

  // Detect manual scrolling
  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return

    // User is "at bottom" if within 50px of the end
    const isAtBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 50
    isUserScrollingRef.current = !isAtBottom
  }

  // Auto-scroll when new messages arrive (unless user is scrolling)
  useEffect(() => {
    if (!isUserScrollingRef.current && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messageCount])

  const hasMessages = Boolean(children)

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
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
