/**
 * SessionSelector Component
 * Story 3.10: Session Selector UI
 * Epic 5: Session Tigers - Added switchingSessionId tracking (TIGER Step 3.2)
 *
 * Displays recent sessions list in sidebar with selection capability.
 * Includes "Chats" header and integrates with session store.
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
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

  // Track which session is being loaded (TIGER Step 3.2 fix)
  const [switchingSessionId, setSwitchingSessionId] = useState<string | null>(null)

  const displaySessions = recentSessions ?? []

  const handleSessionClick = async (sessionId: string) => {
    // Skip if already active or already loading this session
    if (activeSession?.id === sessionId || switchingSessionId === sessionId) return

    setSwitchingSessionId(sessionId)
    setLoadingSession(true)
    try {
      const session = await invoke<Session>('load_session', { sessionId })
      setActiveSession(session)
    } catch (error) {
      console.error('Failed to load session:', error)
      setSessionError(error instanceof Error ? error.message : 'Failed to load session')
    } finally {
      setLoadingSession(false)
      setSwitchingSessionId(null)
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
            isLoading={switchingSessionId === session.id}
            onClick={() => handleSessionClick(session.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('mb-space-2', className)}>
      {/* Header - Epic 5 UI Polish: Renamed to "Chats" */}
      <div className="flex items-center justify-between px-space-3 mb-space-4">
        <h4 className="tracking-luxury text-[14px] font-bold text-orion-fg small-caps uppercase">
          Chats
        </h4>
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
              isLoading={switchingSessionId === session.id}
              onClick={() => handleSessionClick(session.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
