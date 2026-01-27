/**
 * ContextSidebar Component
 * Phase 1: UI Design Template Match - Right Context Sidebar
 *
 * Right sidebar that displays contextual information:
 * - Project folder with file tree
 * - Connected tools/integrations
 *
 * Design Reference (from chat-full-flow-final.html lines 210-251):
 * - Width: 320px
 * - Background: cream (#FAF8F5)
 * - Border: left, gold/20
 * - Header: 80px height, "context" title with luxury tracking
 *
 * Layout Position:
 * +------------+------------------+------------+------------+
 * |  SIDEBAR   |    CHAT AREA     |  CONTEXT   |   CANVAS   |
 * |   280px    |     flex-1       |   320px    |   480px    |
 * +------------+------------------+------------+------------+
 */

import { cn } from '@/lib/utils'
import { Folder, FileText } from 'lucide-react'
// Note: Calendar, Mail icons will be used when real context data flows in

export interface ContextSidebarProps {
  /** Whether the sidebar is collapsed */
  isCollapsed?: boolean
  /** CSS class overrides */
  className?: string
}

/**
 * File tree item component
 * Note: Kept for future use when real context data flows in
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function FileTreeItem({
  name,
  isFolder = false,
  isNested = false,
}: {
  name: string
  isFolder?: boolean
  isNested?: boolean
}) {
  const Icon = isFolder ? Folder : FileText

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 py-1.5',
        isNested && 'pl-4 hover:bg-orion-gold/5 cursor-pointer'
      )}
    >
      <Icon
        className={cn(
          'w-3 h-3',
          isFolder ? 'text-orion-gold' : 'text-orion-fg-muted'
        )}
      />
      <span className={cn('text-xs', isFolder ? 'text-orion-fg' : 'text-sm text-orion-fg')}>
        {name}
      </span>
    </div>
  )
}

/**
 * Connected tool item component
 * Note: Kept for future use when real context data flows in
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ToolItem({
  name,
  icon: Icon,
  iconClassName,
}: {
  name: string
  icon: React.ComponentType<{ className?: string }>
  iconClassName?: string
}) {
  return (
    <div className="flex items-center justify-between p-2">
      <div className="flex items-center gap-2">
        <Icon className={cn('w-4 h-4', iconClassName)} />
        <span className="text-xs">{name}</span>
      </div>
      <span className="w-1.5 h-1.5 bg-orion-gold" />
    </div>
  )
}

export function ContextSidebar({ isCollapsed = false, className }: ContextSidebarProps) {
  return (
    <aside
      aria-label="Context"
      aria-hidden={isCollapsed}
      className={cn(
        // Layout: flex column, shrink-0
        'flex flex-col shrink-0 overflow-hidden',
        // Background: cream
        'bg-orion-bg',
        // Border: left with gold tint
        'border-l border-orion-gold/20',
        // Transition for smooth collapse
        'transition-all duration-300 ease-luxury',
        // Width: context width when expanded, 0 when collapsed
        isCollapsed ? 'w-0 opacity-0' : 'w-context opacity-100',
        className
      )}
    >
      {/* Header - 80px height */}
      <div
        data-testid="context-sidebar-header"
        className="h-header px-6 flex items-center"
      >
        <h3 className="tracking-luxury text-sm font-bold text-orion-fg small-caps">
          context
        </h3>
      </div>

      {/* Content area - empty state */}
      <div className="flex-1 p-6 overflow-y-auto min-w-[320px]">
        <div className="text-[12px] text-orion-fg-muted">
          No files or tools in context
        </div>
      </div>
    </aside>
  )
}
