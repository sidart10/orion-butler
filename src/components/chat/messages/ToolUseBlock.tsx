/**
 * ToolUseBlock Component
 * Story 2.9: Tool Use Display
 *
 * Shows when Claude is using a tool with status indicator.
 */

import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToolUseBlockProps {
  /** Name of the tool being used */
  toolName: string
  /** Current status */
  status: 'running' | 'complete' | 'error'
  /** Optional description */
  description?: string
  /** Additional class names */
  className?: string
}

const STATUS_ICONS = {
  running: <Loader2 className="w-4 h-4 animate-spin text-orion-gold" />,
  complete: <CheckCircle className="w-4 h-4 text-orion-success" />,
  error: <XCircle className="w-4 h-4 text-orion-error" />,
}

/**
 * ToolUseBlock - Shows tool usage status
 */
export function ToolUseBlock({
  toolName,
  status,
  description,
  className,
}: ToolUseBlockProps) {
  return (
    <div
      data-testid="tool-use-block"
      className={cn(
        'flex items-center gap-2 px-3 py-2',
        'bg-orion-surface border border-orion-border',
        'text-sm',
        className
      )}
    >
      {STATUS_ICONS[status]}
      <span className="text-orion-fg font-medium">{toolName}</span>
      {description && (
        <span className="text-orion-fg-muted">- {description}</span>
      )}
    </div>
  )
}
