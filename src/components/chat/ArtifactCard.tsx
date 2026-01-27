/**
 * ArtifactCard Component
 *
 * Clickable card that previews an artifact (email, calendar, task-list, approval).
 * Opens the canvas panel when clicked.
 *
 * Features:
 * - Icon based on artifact type
 * - Type label in header
 * - Preview content
 * - Gold hover/active states
 */

'use client'

import { Mail, Calendar, CheckSquare, Shield, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ArtifactCardProps {
  /** Type of artifact */
  type: 'email' | 'calendar' | 'task-list' | 'approval'
  /** Title of the artifact */
  title: string
  /** Preview content to display */
  preview: React.ReactNode
  /** Whether this card's artifact is currently open in canvas */
  isActive?: boolean
  /** Callback when card is clicked */
  onClick?: () => void
}

const TYPE_ICONS = {
  email: Mail,
  calendar: Calendar,
  'task-list': CheckSquare,
  approval: Shield,
}

const TYPE_LABELS = {
  email: 'Email Draft',
  calendar: 'Calendar',
  'task-list': 'Task List',
  approval: 'Approval',
}

/**
 * ArtifactCard - Clickable preview card for artifacts
 */
export function ArtifactCard({
  type,
  title: _title,
  preview,
  isActive,
  onClick
}: ArtifactCardProps) {
  const Icon = TYPE_ICONS[type]

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="artifact-card"
      data-artifact-type={type}
      data-active={isActive}
      className={cn(
        'w-full max-w-[320px] border border-orion-border bg-orion-bg-white text-left',
        'transition-all duration-150',
        'hover:border-orion-gold hover:shadow-[0_4px_12px_rgba(212,175,55,0.15)]',
        isActive && 'border-orion-gold bg-orion-primary-light'
      )}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-orion-border flex items-center justify-between bg-orion-surface">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-orion-gold" />
          <span className="text-[11px] font-semibold text-orion-fg uppercase tracking-luxury">
            {TYPE_LABELS[type]}
          </span>
        </div>
        <ChevronRight className="w-3 h-3 text-orion-fg-muted" />
      </div>

      {/* Preview content */}
      <div className="px-3 py-2" data-testid="artifact-card-preview">
        {preview}
      </div>
    </button>
  )
}
