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
import { getUserFriendlyMessage } from '@/lib/sdk/errors'
import { MAX_RETRIES } from '@/lib/sdk/errors'
import type { useStreamingMachine } from '@/hooks/useStreamingMachine'
import type { ActivityStatus } from './ActivityIndicator'

export interface ChatColumnProps {
  /** CSS class overrides */
  className?: string
  /** Streaming machine instance from parent (lifted to AppShell for sharing) */
  streamingMachine: ReturnType<typeof useStreamingMachine>
}

/**
 * Derive activity status from machine state
 */
function getActivityStatus(state: string): ActivityStatus {
  switch (state) {
    case 'streaming':
    case 'sending':
      return 'running'
    case 'complete':
      return 'complete'
    case 'error':
      return 'error'
    case 'cancelled':
      return 'cancelled'
    default:
      return 'complete'
  }
}

export function ChatColumn({ className, streamingMachine }: ChatColumnProps) {
  const {
    messages,
    isStreaming,
    isSending,
    error,
    send,
    cancel,
    retry,
    stateValue,
    retryAttempt,
    session,
    saveError,      // Issue #7: Track save failures
    clearSaveError, // Issue #7: Dismiss save error
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
      <MessageArea messageCount={messages.length} isStreaming={isStreaming}>
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
                  isThinking={msg.isThinking}
                  thinkingContent={msg.thinkingContent}
                  toolUses={msg.toolUses}
                  durationMs={session?.durationMs}
                  activityStatus={msg.isStreaming ? 'running' : getActivityStatus(stateValue)}
                  onCancel={msg.isStreaming ? cancel : undefined}
                />
              )
            )}
            {/* Show streaming indicator */}
            {(isSending || isStreaming) && messages.length > 0 && !messages[messages.length - 1]?.isStreaming && (
              <div className="text-sm text-orion-fg-muted animate-pulse">
                Thinking...
              </div>
            )}
            {/* Show error with retry UI */}
            {error && (
              <div className="text-sm p-3 rounded">
                {retryAttempt > 0 && retryAttempt < MAX_RETRIES ? (
                  // Retrying state
                  <div className="text-yellow-700 bg-yellow-50 p-3 rounded">
                    <span className="animate-pulse">&#x27F3;</span> Retrying... (Attempt {retryAttempt}/{MAX_RETRIES})
                  </div>
                ) : retryAttempt >= MAX_RETRIES ? (
                  // Exhausted state
                  <div className="text-orion-error bg-red-50 p-3 rounded space-y-2">
                    <p>{getUserFriendlyMessage(error)}</p>
                    <button
                      onClick={retry}
                      className="px-4 py-2 bg-orion-gold text-white rounded hover:opacity-90 transition-opacity"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  // First error (no retries yet)
                  <div className="text-orion-error bg-red-50 p-3 rounded">
                    {getUserFriendlyMessage(error)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </MessageArea>
      {/* Issue #7: Save error banner - non-blocking notification */}
      {saveError && (
        <div className="mx-4 mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-yellow-800">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Conversation not saved: {saveError}</span>
          </div>
          <button
            onClick={clearSaveError}
            className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-100 transition-colors"
            aria-label="Dismiss save error"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <ChatInput onSend={handleSend} disabled={isSending || isStreaming} />
      {/* Debug: Show current state in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-20 right-4 text-xs text-orion-fg-muted bg-orion-bg-elevated px-2 py-1 rounded">
          State: {stateValue}
        </div>
      )}
    </main>
  )
}
