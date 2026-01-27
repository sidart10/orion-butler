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
  /** Whether currently streaming - triggers continuous scroll */
  isStreaming?: boolean
}

export function MessageArea({ children, className, messageCount = 0, isStreaming = false }: MessageAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isUserScrollingRef = useRef(false)
  const prevMessageCountRef = useRef(messageCount)

  // Detect manual scrolling
  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return

    // User is "at bottom" if within 50px of the end
    const isAtBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 50
    isUserScrollingRef.current = !isAtBottom
  }

  // Reset user scrolling flag when a NEW message arrives (user submitted)
  useEffect(() => {
    if (messageCount > prevMessageCountRef.current) {
      // New message added - reset scroll lock so user sees response
      isUserScrollingRef.current = false
    }
    prevMessageCountRef.current = messageCount
  }, [messageCount])

  // Helper to scroll to bottom (with jsdom guard)
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current
    if (el && typeof el.scrollTo === 'function') {
      el.scrollTo({ top: el.scrollHeight, behavior })
    }
  }

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (!isUserScrollingRef.current) {
      scrollToBottom('smooth')
    }
  }, [messageCount])

  // Continuous auto-scroll during streaming (poll every 100ms)
  useEffect(() => {
    if (!isStreaming) return

    const interval = setInterval(() => {
      if (!isUserScrollingRef.current) {
        scrollToBottom('auto')
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isStreaming])

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
