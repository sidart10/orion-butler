/**
 * ChatColumn Component
 * Story 1.5: Main Chat Column
 * Story 2.5/2.6: SDK Integration with XState streaming
 *
 * Main chat column container - the center piece of the three-column layout.
 * Now wired to useStreamingMachine for real SDK integration.
 *
 * Acceptance Criteria:
 * - AC#1: Center column fills remaining space (flex: 1)
 * - AC#2: Contains scrollable message area
 * - AC#3: Contains fixed input area at bottom
 * - AC#4: Chat area has minimum width of 400px
 *
 * Layout Reference (from ux-design-specification.md):
 * +----------------+----------------------+------------------+
 * |  LEFT SIDEBAR  |      CHAT AREA       |   RIGHT PANEL    |
 * |     280px      |      (flex-1)        |   (320px/480px)  |
 * +----------------+----------------------+------------------+
 *
 * Internal Structure:
 * +------------------------+
 * |      ChatHeader        | <- 80px, title + search
 * +------------------------+
 * |      MessageArea       | <- flex-1, scrollable
 * +------------------------+
 * |      ChatInput         | <- fixed at bottom
 * +------------------------+
 *
 * Accessibility:
 * - <main> semantic element
 * - role="region" with aria-label="Chat"
 */

'use client'

import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ChatHeader } from './ChatHeader'
import { MessageArea } from './MessageArea'
import { ChatInput } from './ChatInput'
import { UserMessage } from './UserMessage'
import { AgentMessage } from './AgentMessage'
import type { useStreamingMachine } from '@/hooks/useStreamingMachine'

export interface ChatColumnProps {
  /** CSS class overrides */
  className?: string
  /** Streaming machine instance from parent (lifted to AppShell for sharing) */
  streamingMachine: ReturnType<typeof useStreamingMachine>
}

export function ChatColumn({ className, streamingMachine }: ChatColumnProps) {
  const {
    messages,
    isStreaming,
    isSending,
    error,
    send,
    stateValue,
  } = streamingMachine

  // Handle sending messages via the streaming machine
  const handleSend = useCallback(
    (message: string) => {
      send(message)
    },
    [send]
  )

  // Determine if we have real messages or should show demo
  const hasMessages = messages.length > 0

  // Debug logging
  console.log('[ChatColumn] Render - messages:', messages.length, 'stateValue:', stateValue, 'hasMessages:', hasMessages)

  return (
    <main
      aria-label="Chat conversation"
      className={cn(
        // Layout: fills remaining space
        'flex-1',
        // Minimum width: 400px (canvas split spec requirement)
        'min-w-[400px]',
        // Internal layout: column for MessageArea + ChatInput
        'flex flex-col',
        // Height: fills container
        'h-full',
        // Background: white for chat area (per design template)
        'bg-white',
        className
      )}
    >
      <ChatHeader title={hasMessages ? 'Chat' : 'New Conversation'} />
      <MessageArea>
        {hasMessages && (
          <div className="space-y-6">
            {messages.map((msg) =>
              msg.role === 'user' ? (
                <UserMessage key={msg.id} content={msg.content} />
              ) : (
                <AgentMessage
                  key={msg.id}
                  content={msg.content}
                  isStreaming={msg.isStreaming}
                />
              )
            )}
            {/* Show streaming indicator */}
            {(isSending || isStreaming) && messages.length > 0 && !messages[messages.length - 1]?.isStreaming && (
              <div className="text-sm text-orion-fg-muted animate-pulse">
                Thinking...
              </div>
            )}
            {/* Show error if any */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                Error: {error.message}
              </div>
            )}
          </div>
        )}
      </MessageArea>
      <ChatInput onSend={handleSend} />
      {/* Debug: Show current state in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-20 right-4 text-xs text-orion-fg-muted bg-orion-bg-elevated px-2 py-1 rounded">
          State: {stateValue}
        </div>
      )}
    </main>
  )
}
