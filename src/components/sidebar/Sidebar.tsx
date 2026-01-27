/**
 * Sidebar Component
 * Story 1.4: Sidebar Column
 * Story 1.11: Laptop Breakpoint
 * Story 1.12: Tablet Breakpoint
 *
 * Left sidebar for GTD navigation.
 *
 * Structure:
 * - Header: "ORION" branding
 * - GTD Nav: Inbox (new conversation), Next, Waiting, Someday
 * - Divider
 * - Recent: Recent conversations
 * - Projects: Collapsible project list
 * - Footer: Settings
 */

'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { SidebarNavItem } from './SidebarNavItem'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Settings, Folder, ChevronRight, Plus } from 'lucide-react'

export interface SidebarProps {
  /** Whether sidebar is collapsed to icon-only mode (laptop breakpoint) */
  isCollapsed?: boolean
  /** Whether sidebar is in overlay mode (tablet breakpoint) */
  isOverlay?: boolean
  /** Whether sidebar overlay is open (tablet breakpoint) */
  isOverlayOpen?: boolean
  /** Callback to close sidebar overlay */
  onCloseOverlay?: () => void
}

// Placeholder recent conversations
const RECENT_CONVERSATIONS = [
  { id: '1', title: 'Email to Sarah', isActive: true },
  { id: '2', title: 'Q4 Planning', isActive: false },
  { id: '3', title: 'Project Review', isActive: false },
]

/**
 * Sidebar - Left navigation panel
 */
export function Sidebar({
  isCollapsed = false,
  isOverlay = false,
  isOverlayOpen = false,
  onCloseOverlay,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null)

  // Handle ESC key to close overlay
  useEffect(() => {
    if (!isOverlay || !isOverlayOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onCloseOverlay) {
        onCloseOverlay()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOverlay, isOverlayOpen, onCloseOverlay])

  // Focus trap: Focus sidebar when overlay opens
  useEffect(() => {
    if (isOverlay && isOverlayOpen && sidebarRef.current) {
      const focusableElements = sidebarRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements.length > 0) {
        ;(focusableElements[0] as HTMLElement).focus()
      }
    }
  }, [isOverlay, isOverlayOpen])

  // Sidebar content - shared between overlay and desktop modes
  const sidebarContent = (
    <nav aria-label="Main navigation" className="flex flex-col h-full">
      {/* Header - ORION branding only */}
      <div
        data-testid="sidebar-header"
        className={cn(
          'h-header flex items-center border-b border-orion-gold/20',
          isCollapsed ? 'px-0 justify-center' : 'px-8'
        )}
      >
        {isCollapsed ? (
          <span className="text-lg font-serif text-orion-gold font-semibold">O</span>
        ) : (
          <h1 className="text-2xl font-serif text-orion-fg uppercase tracking-luxury">ORION</h1>
        )}
      </div>

      {/* Navigation - scrollable */}
      <div
        data-testid="sidebar-nav"
        className={cn(
          'flex-1 overflow-y-auto py-space-4',
          isCollapsed ? 'px-0' : 'px-space-6'
        )}
      >
        {/* New Session Button - above GTD items */}
        <div className={cn('mb-space-4', isCollapsed ? 'px-space-2' : 'px-space-3')}>
          {isCollapsed ? (
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  data-testid="new-session-button"
                  className={cn(
                    'w-full flex items-center justify-center',
                    'min-h-[44px] py-space-2',
                    'bg-orion-fg text-white',
                    'hover:bg-orion-gold hover:text-orion-fg',
                    'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-orion-gold focus-visible:outline-offset-2',
                    'transition-colors duration-state'
                  )}
                  aria-label="New Session"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                New Session
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              type="button"
              data-testid="new-session-button"
              className={cn(
                'w-full flex items-center justify-center gap-space-2',
                'min-h-[44px] py-space-2 px-space-3',
                'bg-orion-fg text-white',
                'hover:bg-orion-gold hover:text-orion-fg',
                'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-orion-gold focus-visible:outline-offset-2',
                'transition-colors duration-state',
                'text-[12px] font-semibold tracking-wide'
              )}
            >
              <Plus className="w-4 h-4" />
              <span>New Session</span>
            </button>
          )}
        </div>

        {/* GTD Items */}
        <div className="space-y-0.5 mb-space-8">
          <SidebarNavItem
            label="Inbox"
            count={3}
            isCollapsed={isCollapsed}
          />
          <SidebarNavItem label="Next" count={12} isCollapsed={isCollapsed} />
          <SidebarNavItem label="Waiting" count={0} isCollapsed={isCollapsed} />
          <SidebarNavItem label="Someday" count={0} isCollapsed={isCollapsed} />
        </div>

        {/* Divider */}
        {!isCollapsed && (
          <div
            data-testid="sidebar-divider"
            className="h-px bg-orion-border mx-space-3 mb-space-8"
          />
        )}

        {/* Recent Conversations Section */}
        {!isCollapsed && (
          <div className="mb-space-6">
            <h4 className="tracking-luxury text-[14px] font-bold text-orion-fg small-caps uppercase px-space-3 mb-space-6">
              Recent
            </h4>
            <div className="space-y-0.5">
              {RECENT_CONVERSATIONS.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  className={cn(
                    'w-full flex items-center px-space-3 py-1.5 text-left',
                    'transition-colors duration-state',
                    conv.isActive
                      ? 'bg-white'
                      : 'hover:bg-white'
                  )}
                >
                  <span
                    className={cn(
                      'text-[12px] truncate',
                      conv.isActive
                        ? 'text-orion-fg font-medium'
                        : 'text-orion-fg-muted'
                    )}
                  >
                    {conv.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider before Projects */}
        {!isCollapsed && (
          <div className="h-px bg-orion-border mx-space-3 mb-space-6" />
        )}

        {/* Projects Section */}
        {!isCollapsed ? (
          <div className="mb-space-6">
            <button
              type="button"
              className={cn(
                'w-full flex items-center justify-between px-space-3 py-space-2',
                'text-orion-fg-muted hover:text-orion-fg',
                'transition-colors duration-state'
              )}
            >
              <div className="flex items-center gap-space-3">
                <Folder className="w-4 h-4" />
                <span className="text-[12px] font-medium">Projects</span>
              </div>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  'w-full flex items-center justify-center min-h-[44px]',
                  'text-orion-fg-muted hover:text-orion-fg',
                  'hover:bg-orion-primary-light',
                  'transition-colors duration-state'
                )}
              >
                <Folder className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              Projects
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Footer - Settings */}
      <div
        data-testid="sidebar-footer"
        className={cn(
          'p-space-6 border-t border-orion-border',
          isCollapsed && 'p-0 py-space-4'
        )}
      >
        {isCollapsed ? (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  'w-full flex items-center justify-center min-h-[44px]',
                  'text-orion-fg-muted hover:text-orion-fg',
                  'hover:bg-orion-primary-light',
                  'focus-visible:outline-2 focus-visible:outline-orion-gold focus-visible:outline-offset-2',
                  'transition-colors duration-state'
                )}
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              Settings
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            type="button"
            className={cn(
              'flex items-center gap-space-3',
              'text-orion-fg-muted hover:text-orion-fg',
              'transition-colors duration-state'
            )}
          >
            <Settings className="w-4 h-4" />
            <span className="text-[12px]">Settings</span>
          </button>
        )}
      </div>
    </nav>
  )

  // Overlay mode (tablet breakpoint)
  if (isOverlay) {
    return (
      <TooltipProvider delayDuration={300}>
        <aside
          ref={sidebarRef}
          data-testid="sidebar"
          data-open={isOverlayOpen}
          className={cn(
            'fixed left-0 top-0 h-screen z-50',
            'w-sidebar',
            'bg-orion-bg border-r border-orion-gold/20',
            'shadow-lg',
            'transition-transform duration-300 ease-luxury',
            isOverlayOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          // Note: The inner <nav> element provides the navigation landmark
          // so we don't set role="navigation" here to avoid duplicate landmarks
          aria-hidden={!isOverlayOpen}
          tabIndex={isOverlayOpen ? 0 : -1}
        >
          {sidebarContent}
        </aside>
      </TooltipProvider>
    )
  }

  // Desktop/Laptop mode
  return (
    <TooltipProvider delayDuration={300}>
      <aside
        ref={sidebarRef}
        data-testid="sidebar"
        className={cn(
          'flex-shrink-0 h-screen bg-orion-bg border-r border-orion-gold/20',
          'transition-all duration-300 ease-luxury',
          isCollapsed ? 'w-sidebar-icon-only' : 'w-sidebar'
        )}
      >
        {sidebarContent}
      </aside>
    </TooltipProvider>
  )
}
