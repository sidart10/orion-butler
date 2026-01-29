/**
 * SessionListItem Component
 * Story 3.10: Session Selector UI
 * Story 3.15: Session Metadata Display
 *
 * Individual session entry in the session selector.
 * Shows display name, type badge, relative time, and optional message count.
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { SessionTypeBadge } from './SessionTypeBadge'
import { formatRelativeTime } from '@/lib/utils/time'
import type { SessionMetadata } from '@/stores/sessionStore'

export interface SessionListItemProps {
  session: SessionMetadata
  isActive?: boolean
  isCollapsed?: boolean
  onClick?: () => void
}

export function SessionListItem({
  session,
  isActive = false,
  isCollapsed = false,
  onClick,
}: SessionListItemProps) {
  const relativeTime = formatRelativeTime(session.lastActive)

  // Collapsed mode - show only type icon with tooltip
  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={onClick}
        data-testid={`session-item-${session.id}`}
        aria-current={isActive ? 'true' : undefined}
        className={cn(
          'w-full flex items-center justify-center',
          'h-9',  // 36px - consistent sizing
          'text-orion-fg-muted hover:text-orion-fg',
          'hover:bg-white',
          'focus:outline-none',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-orion-gold focus-visible:outline-offset-2',
          'transition-colors duration-100',
          isActive && [
            'border-l-4 border-orion-gold',
            'bg-orion-primary-light',
            '-ml-1',
          ]
        )}
        title={session.displayName}
      >
        <SessionTypeBadge type={session.type} showIcon className="bg-transparent" />
      </button>
    )
  }

  // Expanded mode - full display
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`session-item-${session.id}`}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'w-full flex flex-col gap-1',
        'h-9 py-space-2 px-space-3',  // 36px - consistent sizing
        'text-left',
        'hover:bg-white',
        'focus:outline-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-orion-gold focus-visible:outline-offset-2',
        'transition-colors duration-100',
        isActive && [
          'border-l-4 border-orion-gold',
          'bg-orion-primary-light',
          '-ml-space-3 pl-[calc(var(--space-3)-4px)]',
        ]
      )}
    >
      {/* Row 1: Type badge + relative time */}
      <div className="flex items-center justify-between gap-2">
        <SessionTypeBadge type={session.type} showIcon={false} />
        <span className="text-[10px] text-orion-fg-muted">
          {relativeTime}
        </span>
      </div>

      {/* Row 2: Session title */}
      <span className="text-[12px] font-medium text-orion-fg truncate">
        {session.displayName}
      </span>

      {/* Row 3: Project name (for project sessions) + message count */}
      {(session.projectName || session.messageCount > 0) && (
        <div className="flex items-center justify-between gap-2">
          {session.projectName && (
            <span className="text-[10px] text-orion-fg-muted truncate">
              {session.projectName}
            </span>
          )}
          {session.messageCount > 0 && (
            <span className="text-[10px] text-orion-fg-subtle">
              {session.messageCount} msg{session.messageCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Corrupted indicator */}
      {session.isCorrupted && (
        <span className="text-[10px] text-orion-error">
          Session corrupted
        </span>
      )}
    </button>
  )
}
