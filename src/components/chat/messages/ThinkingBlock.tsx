/**
 * ThinkingBlock Component
 * Story 2.8: Thinking Indicator
 *
 * Shows a thinking/processing indicator while Claude is working.
 */

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ThinkingBlockProps {
  /** Optional thinking text to show */
  text?: string
  /** Additional class names */
  className?: string
}

/**
 * ThinkingBlock - Shows thinking indicator
 */
export function ThinkingBlock({ text, className }: ThinkingBlockProps) {
  return (
    <div
      data-testid="thinking-block"
      className={cn(
        'flex items-center gap-2 py-2',
        'text-orion-fg-muted text-sm italic',
        className
      )}
    >
      <Loader2 className="w-4 h-4 animate-spin text-orion-gold" />
      <span>{text || 'Thinking...'}</span>
    </div>
  )
}
