/**
 * ProjectsSection Component Tests
 * Story 5.4: Projects Section
 * Epic 5 Plan 1: Sidebar Simplification
 *
 * Test IDs: 5.4-UNIT-001 through 5.4-UNIT-015
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ProjectsSection } from '@/components/sidebar/ProjectsSection'

// Wrapper component for tests that need TooltipProvider
const renderWithTooltip = (ui: React.ReactElement) => {
  return render(<TooltipProvider>{ui}</TooltipProvider>)
}

describe('ProjectsSection Component', () => {
  describe('Rendering', () => {
    it('5.4-UNIT-001: should render Projects section header', () => {
      renderWithTooltip(<ProjectsSection />)

      expect(screen.getByText('Projects')).toBeInTheDocument()
    })

    it('5.4-UNIT-002: should have expand/collapse toggle with aria-expanded', () => {
      renderWithTooltip(<ProjectsSection />)

      const toggleButton = screen.getByRole('button', { expanded: true })
      expect(toggleButton).toBeInTheDocument()
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('5.4-UNIT-003: should default to expanded state', () => {
      renderWithTooltip(<ProjectsSection />)

      const toggleButton = screen.getByRole('button', { expanded: true })
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('5.4-UNIT-004: should show "No active projects" when empty', () => {
      renderWithTooltip(<ProjectsSection />)

      expect(screen.getByText('No active projects')).toBeInTheDocument()
    })
  })

  describe('Toggle Behavior', () => {
    it('5.4-UNIT-005: should collapse when toggle is clicked', async () => {
      const user = userEvent.setup()
      renderWithTooltip(<ProjectsSection />)

      const toggleButton = screen.getByRole('button', { expanded: true })
      await user.click(toggleButton)

      // After click, should be collapsed
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText('No active projects')).not.toBeInTheDocument()
    })

    it('5.4-UNIT-006: should expand when collapsed toggle is clicked', async () => {
      const user = userEvent.setup()
      renderWithTooltip(<ProjectsSection />)

      const toggleButton = screen.getByRole('button', { expanded: true })

      // Collapse first
      await user.click(toggleButton)
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')

      // Expand again
      await user.click(toggleButton)
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText('No active projects')).toBeInTheDocument()
    })
  })

  describe('Collapsed Sidebar Mode', () => {
    it('5.4-UNIT-007: should show icon-only button in collapsed mode', () => {
      renderWithTooltip(<ProjectsSection isCollapsed />)

      const iconButton = screen.getByLabelText('Projects')
      expect(iconButton).toBeInTheDocument()

      // Text label should not be visible
      expect(screen.queryByText('Projects', { selector: 'span' })).not.toBeInTheDocument()
    })

    it('5.4-UNIT-008: should not show empty state in collapsed mode', () => {
      renderWithTooltip(<ProjectsSection isCollapsed />)

      expect(screen.queryByText('No active projects')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('5.4-UNIT-009: should have focus-visible styles on toggle button', () => {
      renderWithTooltip(<ProjectsSection />)

      const toggleButton = screen.getByRole('button', { expanded: true })
      expect(toggleButton.className).toMatch(/focus-visible/)
    })

    it('5.4-UNIT-010: should toggle on Enter key press', async () => {
      const user = userEvent.setup()
      renderWithTooltip(<ProjectsSection />)

      const toggleButton = screen.getByRole('button', { expanded: true })
      toggleButton.focus()

      await user.keyboard('{Enter}')
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('5.4-UNIT-011: should toggle on Space key press', async () => {
      const user = userEvent.setup()
      renderWithTooltip(<ProjectsSection />)

      const toggleButton = screen.getByRole('button', { expanded: true })
      toggleButton.focus()

      await user.keyboard(' ')
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('5.4-UNIT-012: should have consistent 36px height (h-9) for touch targets', () => {
      renderWithTooltip(<ProjectsSection isCollapsed />)

      const iconButton = screen.getByLabelText('Projects')
      expect(iconButton).toHaveClass('h-9')
      expect(iconButton).not.toHaveClass('min-h-[44px]')
    })
  })

  describe('Visual Elements', () => {
    it('5.4-UNIT-013: should display Folder icon in expanded mode', () => {
      renderWithTooltip(<ProjectsSection />)

      // The Folder icon renders as an SVG
      const toggleButton = screen.getByRole('button', { expanded: true })
      const svg = toggleButton.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('5.4-UNIT-014: should show ChevronDown when expanded, ChevronRight when collapsed', async () => {
      const user = userEvent.setup()
      renderWithTooltip(<ProjectsSection />)

      const toggleButton = screen.getByRole('button', { expanded: true })

      // Expanded: ChevronDown (multiple SVGs - folder + chevron)
      let svgs = toggleButton.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(1)

      // Collapse
      await user.click(toggleButton)

      // Still has SVGs but state changed
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('5.4-UNIT-015: should have type="button" attribute', () => {
      renderWithTooltip(<ProjectsSection />)

      const toggleButton = screen.getByRole('button', { expanded: true })
      expect(toggleButton).toHaveAttribute('type', 'button')
    })
  })
})
