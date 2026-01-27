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
import { useStreamingMachine } from '@/hooks/useStreamingMachine'

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
  const streamingMachine = useStreamingMachine()

  // Handle new session with proper guards (pre-mortem mitigation)
  const handleNewSession = useCallback(async () => {
    // Nothing to clear
    if (streamingMachine.messages.length === 0) return
    // User confirmation to prevent accidental data loss
    if (!confirm('Start new conversation? Current messages will be cleared.')) return
    // Cancel streaming before reset - RESET may be ignored mid-stream
    if (streamingMachine.isStreaming) {
      await streamingMachine.cancel()
    }
    streamingMachine.reset()
  }, [streamingMachine])

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
