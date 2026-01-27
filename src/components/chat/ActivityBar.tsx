/**
 * ActivityBar Component
 *
 * Collapsible summary of tool activity during chat processing.
 * Shows an overview with expand/collapse for details.
 *
 * Features:
 * - Summary with total duration
 * - Expandable tool list
 * - Status icons (complete/running/error)
 * - Chevron rotation animation
 */

'use client'

import { useState } from 'react'
import { CheckCircle, Check, ChevronDown, Loader2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ActivityBarProps {
  /** Summary text describing the activity */
  summary: string
  /** Duration of the activity in milliseconds */
  durationMs: number
  /** List of tools that were used */
  tools: Array<{
    icon: React.ReactNode
    label: string
    status: 'complete' | 'running' | 'error'
  }>
  /** Whether to start expanded */
  defaultExpanded?: boolean
}

const STATUS_ICONS = {
  complete: <Check className="w-3 h-3 text-orion-success" />,
  running: <Loader2 className="w-3 h-3 text-orion-gold animate-spin" />,
  error: <XCircle className="w-3 h-3 text-orion-error" />,
}

/**
 * ActivityBar - Collapsible tool activity summary
 */
export function ActivityBar({
  summary,
  durationMs,
  tools,
  defaultExpanded = false
}: ActivityBarProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="max-w-[380px]" data-testid="activity-bar">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2',
          'bg-orion-surface border border-orion-border',
          'text-[12px] hover:border-orion-gold transition-colors duration-state'
        )}
        aria-expanded={expanded}
        data-testid="activity-bar-toggle"
      >
        <CheckCircle className="w-4 h-4 text-orion-success" />
        <span className="text-orion-fg truncate">{summary}</span>
        <span className="text-orion-fg-muted ml-auto shrink-0">
          {(durationMs / 1000).toFixed(1)}s
        </span>
        <ChevronDown
          className={cn(
            'w-3 h-3 text-orion-fg-muted transition-transform duration-state',
            expanded && 'rotate-180'
          )}
          data-testid="activity-bar-chevron"
        />
      </button>

      {expanded && (
        <div
          className="border border-t-0 border-orion-border bg-orion-bg-white p-3 space-y-2"
          data-testid="activity-bar-details"
        >
          {tools.map((tool, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              {STATUS_ICONS[tool.status]}
              {tool.icon}
              <span className="text-orion-fg-muted">{tool.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
