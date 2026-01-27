/**
 * ChatColumn Component
 * Story 1.5: Main Chat Column
 * Phase 1: UI Design Template Match - Added ChatHeader
 *
 * Main chat column container - the center piece of the three-column layout.
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

import { cn } from '@/lib/utils'
import { ChatHeader } from './ChatHeader'
import { MessageArea } from './MessageArea'
import { ChatInput } from './ChatInput'

export interface ChatColumnProps {
  /** CSS class overrides */
  className?: string
}

export function ChatColumn({ className }: ChatColumnProps) {
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
      <ChatHeader title="Email to Sarah" />
      <MessageArea />
      <ChatInput />
    </main>
  )
}
