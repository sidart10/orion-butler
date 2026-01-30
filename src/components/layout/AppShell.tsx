/**
 * AppShell Component
 * Story 1.4 + Story 1.5 + Story 1.6 + Story 1.10 + Story 1.11 + Story 1.12: Layout Structure
 *
 * Main layout wrapper that provides the three-column structure:
 * - Left Sidebar (280px desktop, 48px laptop, overlay tablet) - GTD navigation
 * - Main Content (flex-1) - Chat column
 * - Right Panel (480px desktop/laptop, 100% tablet) - Canvas column
 *
 * Layout Reference (from ux-design-specification.md):
 * +----------------+----------------------+------------------+
 * |  LEFT SIDEBAR  |      CHAT AREA       |   RIGHT PANEL    |
 * |     280px      |      (flex-1)        |   (320px/480px)  |
 * +----------------+----------------------+------------------+
 *
 * Desktop (>=1280px):
 * +--------+---------------+------------------+
 * | GTD    |     CHAT      |      CANVAS      |
 * | 280px  |   min:400px   |       480px      |
 * +--------+---------------+------------------+
 *
 * Laptop (1024-1279px):
 * +------+-------------------------+
 * | 48px |          CHAT           |
 * | icon |        flex-1           |
 * +------+-------------------------+
 *   Canvas overlays as fixed panel →
 *
 * Tablet (<1024px) - Story 1.12:
 * +---------------------------+
 * | [≡]       CHAT            |
 * |         full-width        |
 * +---------------------------+
 *   Sidebar slides in from left as overlay
 *   Canvas opens as full-width overlay
 *
 * Story 1.12 Acceptance Criteria:
 * - AC#1: At <1024px, sidebar hidden by default, chat takes full width
 * - AC#2: Hamburger menu click → sidebar slides in as overlay (280px)
 * - AC#3: Sidebar closes on: click outside, ESC, focus trapped while open
 * - AC#4: Canvas opens as full-width overlay
 * - AC#5: No horizontal scrolling
 * - AC#6: Above 1024px → transitions to laptop mode
 * - AC#7: Hamburger in top-left, 44x44px touch target
 */

'use client'

import { useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/sidebar'
import { ChatColumn } from '@/components/chat'
import { ContextSidebar } from '@/components/context'
import { CanvasColumn } from '@/components/canvas'
import { HamburgerMenu } from './HamburgerMenu'
import { Backdrop } from './Backdrop'
import { useBreakpoint } from '@/hooks'
import { useLayoutStore } from '@/stores/layoutStore'
import { useStreamingMachineWrapper } from '@/hooks/useStreamingMachineWrapper'
import { useSessionLoader } from '@/hooks/useSessionLoader'
import { useSessionStore } from '@/stores/sessionStore'
import { createSession } from '@/lib/ipc/conversation'

export function AppShell() {
  const {
    isSidebarCollapsed,
    isSidebarOverlay,
    isCanvasOverlay,
    isCanvasFullWidth,
  } = useBreakpoint()

  const {
    isSidebarOverlayOpen,
    closeSidebarOverlay,
    toggleSidebarOverlay,
    isSidebarManuallyCollapsed,
    isContextSidebarCollapsed,
  } = useLayoutStore()

  // Lift streaming machine to share between ChatColumn and Sidebar
  // Phase 1: Use wrapper for multi-session concurrent architecture
  const streamingMachine = useStreamingMachineWrapper()

  // Load session on app launch (Story 3.9)
  useSessionLoader()

  // Session store for managing active session (TIGER-3)
  const { setActiveSession, setRecentSessions, recentSessions } = useSessionStore()

  // Handle new session with proper guards (pre-mortem mitigation)
  // TIGER-3 FIX: Creates DB record, not just machine reset
  const handleNewSession = useCallback(async () => {
    // TIGER-7 FIX: Removed confirmation dialog
    // The dialog caused UX friction and potential stale state issues.
    // Messages are preserved in the DB for the previous session, so no data loss.

    // TIGER-9 FIX: DON'T cancel streaming - let old session continue in background
    // The wrapper's TIGER-9 logic keeps sessions with active requests alive.
    // When setActiveSession() is called below, the wrapper effect will:
    // 1. Check oldSession.hasActiveRequest() → true (still streaming)
    // 2. Keep old session alive in SessionManager (not destroyed)
    // 3. Events continue routing to old session via conversationId
    // 4. User can switch back to see completed response

    try {
      // Create new session in database
      const newSessionId = await createSession('adhoc')

      // TIGER-3: Removed redundant reset() call
      // setActiveSession() triggers wrapper effect which:
      // 1. Creates NEW StreamingSession with fresh XState state
      // 2. Old session's messages are in old actor (we unsubscribe from it)
      // 3. New session starts with empty messages automatically

      // TIGER-4: Derive conversationId from sessionId (backend uses same pattern)
      // Session: orion-adhoc-{uuid} -> Conversation: conv_adhoc-{uuid}
      const conversationId = `conv_${newSessionId.replace('orion-', '')}`

      // Create a minimal session object for the store
      const newSession = {
        id: newSessionId,
        displayName: `Session at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: 'adhoc' as const,
        lastActive: new Date().toISOString(),
        messageCount: 0,
        conversationId, // TIGER-4: Include for message routing
        messages: [], // Session (extends SessionMetadata) requires messages
      }

      // Update session store
      setActiveSession(newSession)

      // Add to recent sessions (SessionMetadata doesn't include messages)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { messages: _, ...metadataOnly } = newSession
      setRecentSessions([
        metadataOnly,
        ...(recentSessions || []).slice(0, 9), // Keep max 10
      ])

    } catch (error) {
      console.error('Failed to create new session:', error)
      // Fallback: just reset machine (original behavior)
      streamingMachine.reset()
    }
  }, [streamingMachine, setActiveSession, setRecentSessions, recentSessions])

  // Close sidebar overlay when transitioning from tablet to larger breakpoint (AC#6)
  useEffect(() => {
    if (!isSidebarOverlay && isSidebarOverlayOpen) {
      closeSidebarOverlay()
    }
  }, [isSidebarOverlay, isSidebarOverlayOpen, closeSidebarOverlay])

  return (
    <div
      data-testid="app-shell"
      className="flex h-screen bg-orion-bg max-w-[100vw] overflow-x-hidden"
    >
      {/* Tablet: Show hamburger menu in header area */}
      {isSidebarOverlay && (
        <div
          data-testid="tablet-header"
          className="fixed top-0 left-0 h-18 z-30 flex items-center px-space-2"
        >
          <HamburgerMenu
            isOpen={isSidebarOverlayOpen}
            onToggle={toggleSidebarOverlay}
          />
        </div>
      )}

      {/* Sidebar backdrop for tablet (AC#3: click outside closes sidebar) */}
      {isSidebarOverlay && (
        <Backdrop
          visible={isSidebarOverlayOpen}
          onClick={closeSidebarOverlay}
          testId="sidebar-backdrop"
        />
      )}

      {/* Left Sidebar */}
      {isSidebarOverlay ? (
        // Tablet: Sidebar as overlay
        <Sidebar
          isOverlay={true}
          isOverlayOpen={isSidebarOverlayOpen}
          onCloseOverlay={closeSidebarOverlay}
          onNewSession={handleNewSession}
        />
      ) : (
        // Desktop/Laptop: Sidebar in flow
        // Collapsed if: breakpoint forces collapse OR user manually collapsed
        <Sidebar
          isCollapsed={isSidebarCollapsed || isSidebarManuallyCollapsed}
          onNewSession={handleNewSession}
        />
      )}

      {/* Main content area: Chat + Right panels (relative container for canvas overlay) */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Chat Column - fills remaining space, min-width: 400px (Story 1.5) */}
        {/* At tablet, chat takes full width (AC#1) */}
        <ChatColumn streamingMachine={streamingMachine} />

        {/* Context Sidebar - 320px, between Chat and Canvas */}
        {/* Phase 1: UI Design Template Match */}
        <ContextSidebar isCollapsed={isContextSidebarCollapsed} />

        {/* Canvas Column - absolutely positioned to overlay context sidebar */}
        <CanvasColumn
          isOverlay={isCanvasOverlay}
          isFullWidth={isCanvasFullWidth}
        />
      </div>
    </div>
  )
}
