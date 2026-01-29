/**
 * ProjectsSection Component
 * Epic 5 Plan 1: Sidebar Simplification
 *
 * Collapsible section showing active projects.
 * Initially shows empty state; will be populated with project data later.
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Folder, ChevronDown, ChevronRight } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export interface ProjectsSectionProps {
  /** Whether sidebar is collapsed to icon-only mode */
  isCollapsed?: boolean
}

export function ProjectsSection({ isCollapsed = false }: ProjectsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  // Collapsed mode: icon-only button with tooltip
  if (isCollapsed) {
    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Projects"
            className={cn(
              'w-full flex items-center justify-center',
              'h-9',  // 36px - consistent with nav items
              'text-orion-fg-muted hover:text-orion-fg',
              'hover:bg-orion-primary-light',
              'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-orion-gold focus-visible:outline-offset-2',
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
    )
  }

  // Expanded sidebar mode: collapsible section
  return (
    <div className="mb-space-3">
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={handleToggle}
        className={cn(
          'w-full flex items-center justify-between px-space-3 py-space-2',
          'text-orion-fg-muted hover:text-orion-fg',
          'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-orion-gold focus-visible:outline-offset-2',
          'transition-colors duration-state'
        )}
      >
        <div className="flex items-center gap-space-3">
          <Folder className="w-4 h-4" />
          <span className="text-[12px] font-medium">Projects</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>

      {/* Empty state - shown when expanded and no projects */}
      {isExpanded && (
        <div className="px-space-3 py-space-2">
          <span className="text-[11px] text-orion-fg-muted italic">
            No active projects
          </span>
        </div>
      )}
    </div>
  )
}
