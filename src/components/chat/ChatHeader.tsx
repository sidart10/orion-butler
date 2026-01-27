/**
 * ChatHeader Component
 * Phase 1: UI Design Template Match - Chat Header
 *
 * Header for the chat column displaying conversation title and actions.
 *
 * Design Reference (from chat-full-flow-final.html lines 114-122):
 * - Height: 80px
 * - Background: cream/50 (#FAF8F5/50)
 * - Border: bottom, cream (#FAF8F5)
 * - Title: 14px, bold, small-caps, luxury tracking
 * - Actions: Search button, sidebar toggles
 */

'use client'

import { cn } from '@/lib/utils'
import { Search, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react'
import { useLayoutStore } from '@/stores/layoutStore'
import { useBreakpoint } from '@/hooks'

export interface ChatHeaderProps {
  /** Conversation/thread title to display */
  title: string
  /** CSS class overrides */
  className?: string
}

export function ChatHeader({ title, className }: ChatHeaderProps) {
  const { isSidebarOverlay } = useBreakpoint()
  const {
    isSidebarManuallyCollapsed,
    toggleSidebar,
    isContextSidebarCollapsed,
    toggleContextSidebar,
  } = useLayoutStore()

  // Icon button styles
  const iconButtonClass = cn(
    'p-2 min-w-[44px] min-h-[44px] flex items-center justify-center',
    'text-orion-fg-muted hover:text-orion-gold',
    'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-orion-gold focus-visible:outline-offset-2',
    'transition-colors'
  )

  return (
    <header
      className={cn(
        // Layout: fixed height, flex with space between
        'h-header px-4 flex items-center justify-between',
        // Background: cream with transparency
        'bg-orion-bg/50',
        // Border: bottom
        'border-b border-orion-bg',
        // Don't shrink
        'shrink-0',
        className
      )}
    >
      {/* Left section: Sidebar toggle + Title */}
      <div className="flex items-center gap-2">
        {/* Left sidebar toggle - hidden at tablet (hamburger menu handles it) */}
        {!isSidebarOverlay && (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isSidebarManuallyCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isSidebarManuallyCollapsed}
            className={iconButtonClass}
            data-testid="toggle-left-sidebar"
          >
            {isSidebarManuallyCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Title */}
        <h2 className="text-sm font-bold tracking-luxury small-caps">
          {title}
        </h2>
      </div>

      {/* Right section: Actions + Context toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Search"
          className={iconButtonClass}
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Right sidebar (context) toggle */}
        <button
          type="button"
          onClick={toggleContextSidebar}
          aria-label={isContextSidebarCollapsed ? 'Expand context panel' : 'Collapse context panel'}
          aria-expanded={!isContextSidebarCollapsed}
          className={iconButtonClass}
          data-testid="toggle-right-sidebar"
        >
          {isContextSidebarCollapsed ? (
            <PanelRightOpen className="w-5 h-5" />
          ) : (
            <PanelRightClose className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  )
}
