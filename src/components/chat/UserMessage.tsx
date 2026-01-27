/**
 * UserMessage Component
 * Phase 2: Message Rendering
 *
 * User message bubble - dark background, right-aligned.
 * Based on design template: chat-full-flow-final.html lines 128-133
 */

import { cn } from '@/lib/utils'

export interface UserMessageProps {
  /** Message content to display */
  content: string
  /** CSS class overrides */
  className?: string
}

/**
 * UserMessage - Right-aligned user message bubble
 *
 * Design specs:
 * - Dark brown background (#3D3831)
 * - White text
 * - Right aligned (flex justify-end)
 * - Max width 85%
 * - Padding px-5 py-3.5
 * - Font 14px with relaxed line height
 */
export function UserMessage({ content, className }: UserMessageProps) {
  return (
    <article
      data-testid="user-message"
      className={cn('flex justify-end', className)}
    >
      <div
        data-testid="user-message-bubble"
        className="bg-orion-user-bubble text-white px-5 py-3.5 max-w-[85%]"
      >
        <p className="text-[14px] leading-relaxed m-0">{content}</p>
      </div>
    </article>
  )
}
