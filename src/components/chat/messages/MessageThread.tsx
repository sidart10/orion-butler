/**
 * MessageThread Component
 * Story 2.11: Message Thread Layout
 *
 * Renders a conversation thread with proper layout for
 * user and assistant messages.
 */

import { cn } from '@/lib/utils'
import { TextBlock } from './TextBlock'
import type { ChatMessage } from '@/machines/streamingMachine'

export interface MessageThreadProps {
  /** Messages to display */
  messages: ChatMessage[]
  /** Additional class names */
  className?: string
}

/**
 * MessageThread - Conversation thread layout
 */
export function MessageThread({ messages, className }: MessageThreadProps) {
  if (messages.length === 0) {
    return null
  }

  return (
    <div
      data-testid="message-thread"
      className={cn('space-y-6', className)}
    >
      {messages.map((message) => (
        <div
          key={message.id}
          data-testid={`message-${message.role}`}
          className={cn(
            message.role === 'user'
              ? 'chat-user' // User messages: dark background
              : 'chat-agent' // Assistant messages: gold left border
          )}
        >
          {message.role === 'user' ? (
            <p className="text-[15px]">{message.content}</p>
          ) : (
            <TextBlock
              content={message.content}
              isStreaming={message.isStreaming}
            />
          )}
        </div>
      ))}
    </div>
  )
}
