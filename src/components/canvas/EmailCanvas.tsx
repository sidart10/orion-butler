/**
 * EmailCanvas Component
 *
 * Full email editor that appears in the canvas panel when an email artifact is clicked.
 * Based on design template: .superdesign/replica_html_template/chat-full-flow-final.html (lines 253-324)
 *
 * Features:
 * - Email fields: To, Cc, Subject
 * - Contenteditable body area
 * - Attachment display
 * - Action buttons: Refine, Save, Send
 * - Close and Copy buttons in header
 */

'use client'

import { useMemo } from 'react'
import { Mail, Copy, X, FileText, Sparkles, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmailCanvasProps {
  /** Email recipient (To field) */
  to?: string
  /** Email CC recipients */
  cc?: string
  /** Email subject line */
  subject?: string
  /** Email body content */
  body?: string
  /** Optional attachment */
  attachment?: {
    name: string
    size: string
  }
  /** Callback when close button is clicked */
  onClose?: () => void
  /** Callback when send button is clicked */
  onSend?: () => void
  /** Callback when save button is clicked */
  onSave?: () => void
  /** Callback when copy button is clicked */
  onCopy?: () => void
  /** Callback when refine button is clicked */
  onRefine?: () => void
}

/**
 * EmailCanvas - Full email editor for canvas panel
 */
export function EmailCanvas({
  to = '',
  cc = '',
  subject = '',
  body = '',
  attachment,
  onClose,
  onSend,
  onSave,
  onCopy,
  onRefine,
}: EmailCanvasProps) {
  // Check if we have any content to display
  const hasContent = to || subject || body

  // Memoize HTML conversion to ensure stable output between server and client
  const bodyHtml = useMemo(() => {
    if (!body) return ''
    // Convert newlines to <br> tags
    return body.replace(/\n/g, '<br>')
  }, [body])

  // Show empty state when no content
  if (!hasContent) {
    return (
      <div className="h-full flex flex-col bg-white border-l border-[#E5E1DA]">
        {/* Header */}
        <div className="h-[80px] px-6 flex items-center justify-between border-b border-[#E5E1DA] bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-3">
            <Mail className="text-orion-gold text-xl w-5 h-5" />
            <span className="text-[14px] font-bold text-orion-fg uppercase tracking-luxury">
              Email Draft
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'text-orion-fg-muted hover:text-orion-fg p-2',
              'min-w-[44px] min-h-[44px]',
              'transition-colors duration-100',
              'focus:outline-none focus-visible:outline focus-visible:outline-2',
              'focus-visible:outline-orion-gold focus-visible:outline-offset-2'
            )}
            aria-label="Close canvas"
          >
            <X className="text-lg w-5 h-5" />
          </button>
        </div>
        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[14px] text-orion-fg-muted">
            No email content to display
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-[#E5E1DA]">
      {/* Header */}
      <div className="h-[80px] px-6 flex items-center justify-between border-b border-[#E5E1DA] bg-[#FAF8F5] shrink-0">
        <div className="flex items-center gap-3">
          <Mail className="text-orion-gold text-xl w-5 h-5" />
          <span className="text-[14px] font-bold text-orion-fg uppercase tracking-luxury">
            Email Draft
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCopy}
            className={cn(
              'text-orion-fg-muted hover:text-orion-fg p-2',
              'min-w-[44px] min-h-[44px]',
              'transition-colors duration-100',
              'focus:outline-none focus-visible:outline focus-visible:outline-2',
              'focus-visible:outline-orion-gold focus-visible:outline-offset-2'
            )}
            aria-label="Copy email"
          >
            <Copy className="text-lg w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'text-orion-fg-muted hover:text-orion-fg p-2',
              'min-w-[44px] min-h-[44px]',
              'transition-colors duration-100',
              'focus:outline-none focus-visible:outline focus-visible:outline-2',
              'focus-visible:outline-orion-gold focus-visible:outline-offset-2'
            )}
            aria-label="Close canvas"
          >
            <X className="text-lg w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Email fields */}
        <div className="border-b border-[#E5E1DA]">
          {/* To field */}
          <div className="flex items-center px-6 py-3 border-b border-[#E5E1DA]/50">
            <span className="text-[11px] font-bold text-orion-fg-muted uppercase tracking-luxury w-16">
              To
            </span>
            <input
              type="text"
              defaultValue={to}
              className={cn(
                'flex-1 text-[14px] text-orion-fg bg-transparent',
                'border-none outline-none',
                'focus:outline-none focus-visible:outline-none'
              )}
            />
          </div>

          {/* Cc field */}
          <div className="flex items-center px-6 py-3 border-b border-[#E5E1DA]/50">
            <span className="text-[11px] font-bold text-orion-fg-muted uppercase tracking-luxury w-16">
              Cc
            </span>
            <input
              type="text"
              defaultValue={cc}
              placeholder="Add recipients..."
              className={cn(
                'flex-1 text-[14px] bg-transparent',
                'placeholder:text-orion-fg-muted placeholder:opacity-50',
                'border-none outline-none',
                'focus:outline-none focus-visible:outline-none'
              )}
            />
          </div>

          {/* Subject field */}
          <div className="flex items-center px-6 py-3">
            <span className="text-[11px] font-bold text-orion-fg-muted uppercase tracking-luxury w-16">
              Subject
            </span>
            <input
              type="text"
              defaultValue={subject}
              className={cn(
                'flex-1 text-[14px] text-orion-fg font-medium bg-transparent',
                'border-none outline-none',
                'focus:outline-none focus-visible:outline-none'
              )}
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div
            contentEditable
            suppressContentEditableWarning
            className={cn(
              'text-[14px] leading-[1.85] text-orion-fg outline-none min-h-[280px]',
              'focus:outline-none focus-visible:outline-none'
            )}
            dangerouslySetInnerHTML={{
              __html: bodyHtml
            }}
          />
        </div>

        {/* Attachment section */}
        {attachment && (
          <div className="px-6 py-4 border-t border-[#E5E1DA] bg-[#FAF8F5]/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-orion-fg-muted uppercase tracking-luxury">
                Attachment
              </span>
              <button
                type="button"
                className={cn(
                  'text-[11px] text-orion-gold hover:text-orion-gold-muted',
                  'transition-colors duration-100',
                  'focus:outline-none focus-visible:outline focus-visible:outline-2',
                  'focus-visible:outline-orion-gold focus-visible:outline-offset-2'
                )}
              >
                + Add file
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white border border-[#E5E1DA]">
              <FileText className="text-orion-gold w-5 h-5" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-orion-fg">{attachment.name}</p>
                <p className="text-[11px] text-orion-fg-muted">{attachment.size}</p>
              </div>
              <button
                type="button"
                className={cn(
                  'text-orion-fg-muted hover:text-orion-fg',
                  'transition-colors duration-100',
                  'focus:outline-none focus-visible:outline focus-visible:outline-2',
                  'focus-visible:outline-orion-gold focus-visible:outline-offset-2'
                )}
                aria-label="Remove attachment"
              >
                <X className="text-sm w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#E5E1DA] bg-[#FAF8F5] flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={onRefine}
          className={cn(
            'text-[11px] uppercase tracking-luxury font-bold',
            'text-orion-fg-muted hover:text-orion-gold',
            'flex items-center gap-1.5',
            'transition-colors duration-100',
            'focus:outline-none focus-visible:outline focus-visible:outline-2',
            'focus-visible:outline-orion-gold focus-visible:outline-offset-2'
          )}
        >
          <Sparkles className="w-4 h-4" /> Refine
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            className={cn(
              'px-4 py-2 text-[12px] font-semibold',
              'text-orion-fg-muted border border-[#E5E1DA]',
              'hover:border-orion-fg hover:text-orion-fg',
              'uppercase tracking-luxury',
              'transition-colors duration-100',
              'focus:outline-none focus-visible:outline focus-visible:outline-2',
              'focus-visible:outline-orion-gold focus-visible:outline-offset-2'
            )}
          >
            Save
          </button>
          <button
            type="button"
            onClick={onSend}
            className={cn(
              'px-4 py-2 text-[12px] font-semibold',
              'bg-orion-fg text-white',
              'hover:bg-orion-gold hover:text-orion-fg',
              'uppercase tracking-luxury',
              'flex items-center gap-2',
              'transition-colors duration-100',
              'focus:outline-none focus-visible:outline focus-visible:outline-2',
              'focus-visible:outline-orion-gold focus-visible:outline-offset-2'
            )}
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </div>
      </div>
    </div>
  )
}
