/**
 * Sidebar Component Tests
 * Story 1.4: Sidebar Column
 *
 * Test IDs: 1.4-UNIT-001 through 1.4-UNIT-030
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '@/components/sidebar/Sidebar'

describe('Sidebar Component', () => {
  describe('AC#1: 280px width at desktop', () => {
    it('1.4-UNIT-001: should render sidebar element', () => {
      render(<Sidebar />)
      const sidebar = screen.getByRole('navigation', { name: /main navigation/i })
      expect(sidebar).toBeInTheDocument()
    })

    it('1.4-UNIT-002: should have w-sidebar class for 280px width', () => {
      render(<Sidebar />)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('w-sidebar')
    })

    it('1.4-UNIT-003: should have flex-shrink-0 to prevent shrinking', () => {
      render(<Sidebar />)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('flex-shrink-0')
    })

    it('1.4-UNIT-004: should have h-screen for full viewport height', () => {
      render(<Sidebar />)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('h-screen')
    })

    it('1.4-UNIT-005: should have header area with 72px height', () => {
      render(<Sidebar />)
      const header = screen.getByTestId('sidebar-header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('h-header') // CSS variable for 72px
    })

    it('1.4-UNIT-006: should have scrollable navigation area', () => {
      render(<Sidebar />)
      const nav = screen.getByTestId('sidebar-nav')
      expect(nav).toBeInTheDocument()
      expect(nav).toHaveClass('flex-1')
      expect(nav).toHaveClass('overflow-y-auto')
    })

    it('1.4-UNIT-007: should have footer area for settings', () => {
      render(<Sidebar />)
      const footer = screen.getByTestId('sidebar-footer')
      expect(footer).toBeInTheDocument()
    })
  })

  describe('AC#2: Background color from design tokens', () => {
    it('1.4-UNIT-008: should use bg-orion-bg class', () => {
      render(<Sidebar />)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('bg-orion-bg')
    })
  })

  describe('AC#3: Border token for right edge divider', () => {
    it('1.4-UNIT-009: should have right border with gold tint', () => {
      render(<Sidebar />)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('border-r')
      expect(sidebar).toHaveClass('border-orion-gold/20')
    })
  })

  describe('AC#4: Keyboard navigable (NFR-5.1)', () => {
    it('1.4-UNIT-010: should have role=navigation', () => {
      render(<Sidebar />)
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('1.4-UNIT-011: should have aria-label for screen readers', () => {
      render(<Sidebar />)
      const nav = screen.getByRole('navigation', { name: /main navigation/i })
      expect(nav).toBeInTheDocument()
    })

    it('1.4-UNIT-012: should render Inbox navigation item', () => {
      render(<Sidebar />)
      expect(screen.getByText('Inbox')).toBeInTheDocument()
      // Next, Waiting, Someday removed per Epic 5 scope (GTD -> Inbox/Projects model)
    })

    it('1.4-UNIT-013: should have focusable nav items', () => {
      render(<Sidebar />)
      const inboxItem = screen.getByRole('button', { name: /inbox/i })
      expect(inboxItem).toBeInTheDocument()
      expect(inboxItem.tabIndex).not.toBe(-1)
    })

    it('1.4-UNIT-014: should navigate with Tab key between items', async () => {
      const user = userEvent.setup()
      render(<Sidebar />)

      const inboxItem = screen.getByRole('button', { name: /inbox/i })
      inboxItem.focus()
      expect(document.activeElement).toBe(inboxItem)

      // After Tab, focus moves to Projects section header
      await user.tab()
      const projectsButton = screen.getByRole('button', { name: /projects/i })
      expect(document.activeElement).toBe(projectsButton)
    })

    it('1.4-UNIT-015: should have visible focus state classes', () => {
      render(<Sidebar />)
      const inboxItem = screen.getByRole('button', { name: /inbox/i })
      // Focus-visible classes should be present
      expect(inboxItem.className).toMatch(/focus-visible/)
    })
  })

  describe('Visual hierarchy', () => {
    it('1.4-UNIT-016: should have section divider between GTD items and Recent', () => {
      render(<Sidebar />)
      const divider = screen.getByTestId('sidebar-divider')
      expect(divider).toBeInTheDocument()
      expect(divider).toHaveClass('h-px')
      expect(divider).toHaveClass('bg-orion-border')
    })

    it('1.4-UNIT-017: should use Inter font for nav items (text-sm)', () => {
      render(<Sidebar />)
      const inboxItem = screen.getByRole('button', { name: /inbox/i })
      expect(inboxItem).toHaveClass('text-sm')
    })
  })

  describe('Semantic HTML', () => {
    it('1.4-UNIT-018: should use aside element for sidebar', () => {
      render(<Sidebar />)
      const aside = screen.getByTestId('sidebar')
      expect(aside.tagName.toLowerCase()).toBe('aside')
    })

    it('1.4-UNIT-019: should use nav element inside aside', () => {
      render(<Sidebar />)
      const nav = screen.getByRole('navigation')
      expect(nav.tagName.toLowerCase()).toBe('nav')
    })
  })

  describe('Sidebar Simplification (Epic 5 Plan 1)', () => {
    it('5.1-UNIT-001: should NOT render Next, Waiting, Someday items', () => {
      render(<Sidebar />)

      expect(screen.queryByText('Next')).not.toBeInTheDocument()
      expect(screen.queryByText('Waiting')).not.toBeInTheDocument()
      expect(screen.queryByText('Someday')).not.toBeInTheDocument()
    })

    it('5.1-UNIT-002: should render Inbox section', () => {
      render(<Sidebar />)

      const inboxItem = screen.getByRole('button', { name: /inbox/i })
      expect(inboxItem).toBeInTheDocument()
    })

    it('5.1-UNIT-003: should render Projects section before Recent sessions', () => {
      render(<Sidebar />)

      const sidebarNav = screen.getByTestId('sidebar-nav')
      const projectsText = within(sidebarNav).getByText('Projects')
      const recentText = within(sidebarNav).getByText('Recent')

      // Projects should appear before Recent in DOM order
      // compareDocumentPosition returns bitmask - DOCUMENT_POSITION_FOLLOWING (4) means B follows A
      expect(projectsText.compareDocumentPosition(recentText)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      )
    })

    it('5.1-UNIT-004: should not render GTD items in collapsed mode', () => {
      render(<Sidebar isCollapsed />)

      expect(screen.queryByText('Next')).not.toBeInTheDocument()
      expect(screen.queryByText('Waiting')).not.toBeInTheDocument()
      expect(screen.queryByText('Someday')).not.toBeInTheDocument()
    })

    it('5.1-UNIT-005: should show Inbox icon button in collapsed mode', () => {
      render(<Sidebar isCollapsed />)

      // In collapsed mode, labels are hidden but aria-label should be present
      const inboxButton = screen.getByRole('button', { name: /inbox/i })
      expect(inboxButton).toBeInTheDocument()
    })

    it('5.1-UNIT-006: should maintain sidebar structure with header, nav, and footer', () => {
      render(<Sidebar />)

      expect(screen.getByTestId('sidebar-header')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-nav')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument()
    })

    it('5.1-UNIT-007: should have section dividers in expanded mode', () => {
      render(<Sidebar />)

      const divider = screen.getByTestId('sidebar-divider')
      expect(divider).toBeInTheDocument()
      expect(divider).toHaveClass('h-px')
      expect(divider).toHaveClass('bg-orion-border')
    })
  })

  describe('Sidebar Sizing Consistency (Plan 1B)', () => {
    it('5.1B-UNIT-001: nav items use h-9 (36px) height', () => {
      render(<Sidebar />)
      const inboxItem = screen.getByTestId('sidebar-nav-item-inbox')
      expect(inboxItem).toHaveClass('h-9')
      expect(inboxItem).not.toHaveClass('min-h-[44px]')
    })

    it('5.1B-UNIT-002: Projects section uses consistent 36px height in collapsed mode', () => {
      render(<Sidebar isCollapsed />)
      const projectsButton = screen.getByLabelText('Projects')
      expect(projectsButton).toHaveClass('h-9')
    })

    it('5.1B-UNIT-003: section gaps use space-3 (12px)', () => {
      render(<Sidebar />)
      // Check that Inbox section has mb-space-3
      const inboxSection = screen.getByTestId('sidebar-nav-item-inbox').parentElement
      expect(inboxSection).toHaveClass('mb-space-3')
    })
  })
})
