/**
 * AgentMessage Component
 * Phase 2: Message Rendering
 *
 * Agent message with optional ActivityBar and ArtifactCard.
 * Based on design template: chat-full-flow-final.html lines 135-192
 */

'use client'

import { cn } from '@/lib/utils'
import { ActivityBar, type ActivityBarProps } from './ActivityBar'
import { ArtifactCard, type ArtifactCardProps } from './ArtifactCard'

export interface AgentMessageProps {
  /** Message content to display (supports HTML) */
  content: string
  /** Optional activity bar data */
  activity?: Pick<ActivityBarProps, 'summary' | 'durationMs' | 'tools'>
  /** Optional artifact card data */
  artifact?: Pick<ArtifactCardProps, 'type' | 'title' | 'preview'>
  /** Callback when artifact card is clicked */
  onArtifactClick?: () => void
  /** CSS class overrides */
  className?: string
}

/**
 * AgentMessage - Agent response with gold dot indicator
 *
 * Design specs:
 * - Gold dot indicator (w-1.5 h-1.5 bg-orion-gold)
 * - Cream background (#FAF8F5 = orion-bg)
 * - Dark text (#1A1A1A = orion-fg)
 * - Max width 85%
 * - Padding px-5 py-3.5
 * - Font 14px with relaxed line height
 * - Optional ActivityBar above text
 * - Optional ArtifactCard below text
 */
export function AgentMessage({
  content,
  activity,
  artifact,
  onArtifactClick,
  className
}: AgentMessageProps) {
  return (
    <article
      data-testid="agent-message"
      className={cn('flex items-start gap-3', className)}
    >
      {/* Gold dot indicator */}
      <span
        data-testid="agent-message-dot"
        className="w-1.5 h-1.5 bg-orion-gold mt-2 shrink-0"
        aria-hidden="true"
      />

      <div className="flex-1 space-y-3">
        {/* Optional ActivityBar */}
        {activity && (
          <ActivityBar
            summary={activity.summary}
            durationMs={activity.durationMs}
            tools={activity.tools}
          />
        )}

        {/* Agent text bubble */}
        <div
          data-testid="agent-message-bubble"
          className="bg-orion-surface px-5 py-3.5 max-w-[85%]"
        >
          <p
            className="text-[14px] leading-relaxed text-orion-fg m-0"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Optional ArtifactCard */}
        {artifact && (
          <ArtifactCard
            type={artifact.type}
            title={artifact.title}
            preview={artifact.preview}
            onClick={onArtifactClick}
          />
        )}
      </div>
    </article>
  )
}
