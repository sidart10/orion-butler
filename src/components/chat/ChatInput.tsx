/**
 * ChatInput Component
 * Story 1.5: Main Chat Column
 * Story 1.15: Global Keyboard Shortcuts
 *
 * Fixed input area at the bottom of the chat column.
 *
 * Acceptance Criteria:
 * - AC#3: Fixed input area at the bottom for future chat input
 * - Story 1.15 AC#4: Cmd+Enter sends message
 *
 * Styling:
 * - Editorial Luxury: 0px border-radius
 * - 2px gold outline on focus with 2px offset
 *
 * Accessibility:
 * - aria-label="Chat input" for screen readers
 * - Keyboard focusable
 */

'use client'

import { useState, useRef, useCallback } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ChatInputProps {
  /** CSS class overrides */
  className?: string
  /** Maximum character length */
  maxLength?: number
  /** Callback when message is sent. If not provided, just clears the input. */
  onSend?: (message: string) => void
}

export function ChatInput({ className, maxLength, onSend }: ChatInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * Handle sending the message
   * Story 1.15 AC#4: Cmd+Enter sends message and clears input
   */
  const handleSend = useCallback(() => {
    const trimmedValue = value.trim()
    if (!trimmedValue) return

    if (onSend) {
      onSend(trimmedValue)
    }
    setValue('')
  }, [value, onSend])

  /**
   * Handle key down events
   * Plain Enter sends message (standard chat behavior)
   * Shift+Enter reserved for future multiline support
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      data-testid="chat-input-container"
      className={cn(
        'flex-shrink-0',
        'px-8 pb-8 pt-4 bg-orion-bg-white',
        className
      )}
    >
      <div className="max-w-[640px] mx-auto">
        <div className="relative flex items-center border-b border-orion-border focus-within:border-orion-gold pb-2 transition-colors duration-state">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Make changes or send..."
            aria-label="Chat input"
            maxLength={maxLength}
            data-testid="chat-input"
            className={cn(
              'w-full bg-transparent border-none outline-none',
              'py-4 text-[15px]',
              'text-orion-fg',
              'placeholder:text-orion-fg-muted/50'
            )}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!value.trim()}
            className={cn(
              'ml-4 min-h-[44px] min-w-[44px] flex items-center justify-center',
              'text-orion-fg-muted hover:text-orion-gold',
              'disabled:opacity-30 disabled:cursor-not-allowed',
              'transition-colors duration-state',
              'focus-visible:outline-2 focus-visible:outline-orion-gold focus-visible:outline-offset-2'
            )}
            aria-label="Send message"
          >
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
