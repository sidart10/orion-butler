/**
 * ToolResultBlock Component
 * Story 2.10: Tool Result Display
 *
 * Shows the result of a tool execution.
 */

import { CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToolResultBlockProps {
  /** Name of the tool */
  toolName: string
  /** Whether the tool succeeded */
  success: boolean
  /** Summary of the result */
  summary?: string
  /** Additional class names */
  className?: string
}

/**
 * ToolResultBlock - Shows tool execution result
 */
export function ToolResultBlock({
  toolName,
  success,
  summary,
  className,
}: ToolResultBlockProps) {
  return (
    <div
      data-testid="tool-result-block"
      className={cn(
        'flex items-start gap-2 px-3 py-2',
        'bg-orion-surface border border-orion-border',
        'text-sm',
        className
      )}
    >
      {success ? (
        <CheckCircle className="w-4 h-4 text-orion-success mt-0.5" />
      ) : (
        <XCircle className="w-4 h-4 text-orion-error mt-0.5" />
      )}
      <div className="flex-1">
        <span className="text-orion-fg font-medium">{toolName}</span>
        {summary && (
          <p className="text-orion-fg-muted mt-1">{summary}</p>
        )}
      </div>
    </div>
  )
}
