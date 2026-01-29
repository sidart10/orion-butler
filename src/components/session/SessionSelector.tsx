/**
 * SessionSelector Component
 * Story 3.10: Session Selector UI
 *
 * Displays recent sessions list in sidebar with selection capability.
 * Includes "Recent" header and integrates with session store.
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { SessionListItem } from './SessionListItem'
import { useSessionStore } from '@/stores/sessionStore'
import { invoke } from '@tauri-apps/api/core'
import type { Session } from '@/stores/sessionStore'

export interface SessionSelectorProps {
  /** Whether sidebar is in collapsed mode */
  isCollapsed?: boolean
  /** Maximum sessions to display */
  maxSessions?: number
  className?: string
}

export function SessionSelector({
  isCollapsed = false,
  maxSessions = 5,
  className,
}: SessionSelectorProps) {
  const {
    activeSession,
    recentSessions,
    isLoadingRecent,
    setActiveSession,
    setLoadingSession,
    setSessionError,
  } = useSessionStore()

  const displaySessions = (recentSessions ?? []).slice(0, maxSessions)

  const handleSessionClick = async (sessionId: string) => {
    // Skip if already active
    if (activeSession?.id === sessionId) return

    setLoadingSession(true)
    try {
      const session = await invoke<Session>('load_session', { sessionId })
      setActiveSession(session)
    } catch (error) {
      console.error('Failed to load session:', error)
      setSessionError(error instanceof Error ? error.message : 'Failed to load session')
    } finally {
      setLoadingSession(false)
    }
  }

  // Don't render header in collapsed mode - just show items
  if (isCollapsed) {
    return (
      <div className={cn('space-y-0.5', className)}>
        {displaySessions.map((session) => (
          <SessionListItem
            key={session.id}
            session={session}
            isActive={activeSession?.id === session.id}
            isCollapsed
            onClick={() => handleSessionClick(session.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('mb-space-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-space-3 mb-space-4">
        <h4 className="tracking-luxury text-[14px] font-bold text-orion-fg small-caps uppercase">
          Recent
        </h4>
        {!isLoadingRecent && (recentSessions?.length ?? 0) > 0 && (
          <span className="text-[10px] text-orion-fg-muted">
            {recentSessions?.length ?? 0}
          </span>
        )}
      </div>

      {/* Session list */}
      <div className="space-y-0.5">
        {isLoadingRecent ? (
          <div className="text-[12px] text-orion-fg-muted px-space-3 py-space-2">
            Loading...
          </div>
        ) : displaySessions.length === 0 ? (
          <div className="text-[12px] text-orion-fg-muted px-space-3">
            No recent conversations
          </div>
        ) : (
          displaySessions.map((session) => (
            <SessionListItem
              key={session.id}
              session={session}
              isActive={activeSession?.id === session.id}
              onClick={() => handleSessionClick(session.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
