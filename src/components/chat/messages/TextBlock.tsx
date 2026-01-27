/**
 * TextBlock Component
 * Story 2.7: Text Block Rendering
 *
 * Renders assistant text content with proper styling.
 */

import { cn } from '@/lib/utils'

export interface TextBlockProps {
  /** The text content to render */
  content: string
  /** Whether this text is still streaming */
  isStreaming?: boolean
  /** Additional class names */
  className?: string
}

/**
 * TextBlock - Renders text content from assistant
 */
export function TextBlock({ content, isStreaming, className }: TextBlockProps) {
  return (
    <div
      data-testid="text-block"
      className={cn(
        'text-orion-fg text-[15px] leading-relaxed whitespace-pre-wrap',
        className
      )}
    >
      {content}
      {isStreaming && (
        <span
          className="inline-block w-2 h-4 bg-orion-gold ml-1 animate-pulse"
          aria-label="Typing indicator"
        />
      )}
    </div>
  )
}
