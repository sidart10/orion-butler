/**
 * AgentMessage Component
 * Phase 2: Message Rendering
 *
 * Agent message with optional ActivityBar and ArtifactCard.
 * Based on design template: chat-full-flow-final.html lines 135-192
 */

'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { ActivityBar, type ActivityBarProps } from './ActivityBar'
import { ArtifactCard, type ArtifactCardProps } from './ArtifactCard'
import { ThinkingBlock } from './messages/ThinkingBlock'
import { ToolUseBlock } from './messages/ToolUseBlock'

export interface AgentMessageProps {
  /** Message content to display (markdown) */
  content: string
  /** Optional activity bar data */
  activity?: Pick<ActivityBarProps, 'summary' | 'durationMs' | 'tools'>
  /** Optional artifact card data */
  artifact?: Pick<ArtifactCardProps, 'type' | 'title' | 'preview'>
  /** Callback when artifact card is clicked */
  onArtifactClick?: () => void
  /** Whether the message is currently streaming */
  isStreaming?: boolean
  /** CSS class overrides */
  className?: string
  /** Whether the assistant is currently thinking */
  isThinking?: boolean
  /** Current thinking content */
  thinkingContent?: string
  /** Tool uses to display */
  toolUses?: Array<{
    id: string
    name: string
    status: 'running' | 'complete' | 'error'
  }>
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
  isStreaming,
  className,
  isThinking,
  thinkingContent,
  toolUses,
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
        {/* Thinking indicator */}
        {isThinking && thinkingContent && (
          <ThinkingBlock text={thinkingContent} />
        )}

        {/* Tool use chips */}
        {toolUses && toolUses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {toolUses.map((tool) => (
              <ToolUseBlock
                key={tool.id}
                toolName={tool.name}
                status={tool.status}
              />
            ))}
          </div>
        )}

        {/* Optional ActivityBar */}
        {activity && (
          <ActivityBar
            summary={activity.summary}
            durationMs={activity.durationMs}
            tools={activity.tools}
          />
        )}

        {/* Agent text bubble */}
        {content && (
          <div
            data-testid="agent-message-bubble"
            className="bg-orion-surface px-5 py-3.5 max-w-[85%]"
          >
            <div className="prose prose-sm max-w-none text-[14px] leading-relaxed text-orion-fg [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
            {/* Streaming indicator */}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-orion-gold ml-0.5 animate-pulse" aria-label="Typing..." />
            )}
          </div>
        )}

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
