/**
 * MessageArea Component
 * Story 1.5: Main Chat Column
 * Phase 2: Message Rendering - Demo Conversation
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
import { UserMessage } from './UserMessage'
import { AgentMessage } from './AgentMessage'
import { useCanvasStore } from '@/stores/canvasStore'
import { Calendar, User, Mail } from 'lucide-react'

export interface MessageAreaProps {
  /** Optional children for message content */
  children?: React.ReactNode
  /** CSS class overrides */
  className?: string
  /** Whether to show demo conversation (for development/testing) */
  showDemo?: boolean
}

/**
 * Demo conversation matching the design template
 */
function DemoConversation() {
  const openCanvas = useCanvasStore((state) => state.openCanvas)

  return (
    <div className="space-y-6">
      {/* User message */}
      <UserMessage
        content="Draft an email to Sarah about the Q4 roadmap meeting and check her availability next week"
      />

      {/* Agent response with activity bar and artifact card */}
      <AgentMessage
        content="I've drafted the email. Sarah is available <strong>Tuesday at 2pm</strong>, <strong>Wednesday at 10am</strong>, or <strong>Thursday at 3pm</strong>:"
        activity={{
          summary: 'Checked calendar, found contact, drafted email',
          durationMs: 2800,
          tools: [
            {
              icon: <Calendar className="w-4 h-4 text-orion-fg-muted" />,
              label: 'Found 3 available slots next week',
              status: 'complete'
            },
            {
              icon: <User className="w-4 h-4 text-orion-fg-muted" />,
              label: 'sarah.chen@company.com',
              status: 'complete'
            },
            {
              icon: <Mail className="w-4 h-4 text-orion-fg-muted" />,
              label: 'Drafted meeting request',
              status: 'complete'
            }
          ]
        }}
        artifact={{
          type: 'email',
          title: 'Q4 Roadmap Discussion',
          preview: (
            <>
              <p className="text-[10px] text-orion-fg-muted">To: sarah.chen@company.com</p>
              <p className="text-[12px] text-orion-fg font-medium truncate">
                Q4 Roadmap Discussion - Meeting Request
              </p>
            </>
          )
        }}
        onArtifactClick={openCanvas}
      />
    </div>
  )
}

export function MessageArea({ children, className, showDemo = true }: MessageAreaProps) {
  const hasMessages = Boolean(children)
  const shouldShowDemo = showDemo && !hasMessages

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
        ) : shouldShowDemo ? (
          <DemoConversation />
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
