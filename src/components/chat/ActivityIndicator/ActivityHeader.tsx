/**
 * ActivityHeader Component
 * Epic 3: Enhanced UX Components
 *
 * Collapsed header view with status icon, summary, and chevron.
 */

import { memo } from 'react'
import { Loader2, CheckCircle, AlertCircle, Square, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActivityStatus, ToolInfo } from './types'

interface ActivityHeaderProps {
  status: ActivityStatus
  tools: ToolInfo[]
  isExpanded: boolean
  onClick: () => void
}

/**
 * Get the status icon based on activity status
 */
function getStatusIcon(status: ActivityStatus) {
  switch (status) {
    case 'running':
      return (
        <Loader2
          data-testid="activity-status-icon"
          className="w-4 h-4 text-orion-gold animate-spin"
        />
      )
    case 'complete':
      return (
        <CheckCircle
          data-testid="activity-status-icon"
          className="w-4 h-4 text-orion-success"
        />
      )
    case 'error':
      return (
        <AlertCircle
          data-testid="activity-status-icon"
          className="w-4 h-4 text-orion-error"
        />
      )
    case 'cancelled':
      return (
        <Square
          data-testid="activity-status-icon"
          className="w-4 h-4 text-orion-fg-muted"
        />
      )
  }
}

/**
 * Generate summary text based on status and tools
 */
function getSummaryText(status: ActivityStatus, tools: ToolInfo[]): string {
  const runningTool = tools.find((t) => t.status === 'running')
  const completedCount = tools.filter((t) => t.status === 'complete').length

  switch (status) {
    case 'running':
      if (runningTool) {
        return `Using ${runningTool.name}...`
      }
      return `Running ${completedCount} of ${tools.length} actions...`
    case 'complete':
      return tools.length === 1
        ? `${tools[0].name} completed`
        : `${tools.length} actions completed`
    case 'error': {
      const errorTool = tools.find((t) => t.status === 'error')
      return errorTool ? `${errorTool.name} failed` : 'Action failed'
    }
    case 'cancelled':
      return 'Cancelled'
  }
}

/**
 * ActivityHeader - Collapsed view toggle button
 */
export const ActivityHeader = memo(function ActivityHeader({
  status,
  tools,
  isExpanded,
  onClick,
}: ActivityHeaderProps) {
  const summaryText = getSummaryText(status, tools)
  const ChevronIcon = isExpanded ? ChevronUp : ChevronDown

  return (
    <button
      type="button"
      data-testid="activity-header"
      onClick={onClick}
      aria-expanded={isExpanded}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3',
        'border bg-orion-surface',
        // Border color based on status
        status === 'running' && isExpanded
          ? 'border-orion-gold'
          : status === 'complete'
            ? 'border-orion-success/30'
            : status === 'error'
              ? 'border-orion-error/30'
              : 'border-orion-border',
        // Hover effect
        'hover:border-orion-gold transition-colors duration-normal',
        // Font
        'text-[13px]'
      )}
    >
      {getStatusIcon(status)}
      <span
        data-testid="activity-summary-text"
        className={cn(
          'flex-1 text-left truncate',
          status === 'cancelled' ? 'text-orion-fg-muted line-through' : 'text-orion-fg'
        )}
      >
        {summaryText}
      </span>
      {status === 'cancelled' && (
        <span className="text-[11px] text-orion-fg-muted ml-2">Cancelled</span>
      )}
      <ChevronIcon
        className={cn(
          'w-3 h-3 ml-1 transition-transform duration-normal',
          isExpanded ? 'text-orion-gold' : 'text-orion-fg-muted group-hover:text-orion-gold'
        )}
      />
    </button>
  )
})
