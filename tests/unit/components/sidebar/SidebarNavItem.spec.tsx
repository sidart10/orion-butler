/**
 * SidebarNavItem Component Tests
 * Story 1.4: Sidebar Column
 *
 * Test IDs: 1.4-UNIT-020 through 1.4-UNIT-040
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SidebarNavItem } from '@/components/sidebar/SidebarNavItem'

describe('SidebarNavItem Component', () => {
  describe('Rendering', () => {
    it('1.4-UNIT-020: should render with label', () => {
      render(<SidebarNavItem label="Inbox" />)
      expect(screen.getByText('Inbox')).toBeInTheDocument()
    })

    it('1.4-UNIT-021: should render as a button element', () => {
      render(<SidebarNavItem label="Inbox" />)
      const button = screen.getByRole('button', { name: /inbox/i })
      expect(button).toBeInTheDocument()
      expect(button.tagName.toLowerCase()).toBe('button')
    })

    it('1.4-UNIT-022: should have type=button attribute', () => {
      render(<SidebarNavItem label="Inbox" />)
      const button = screen.getByRole('button', { name: /inbox/i })
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  describe('Count badge', () => {
    it('1.4-UNIT-023: should display count badge when count > 0', () => {
      render(<SidebarNavItem label="Inbox" count={5} />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('1.4-UNIT-024: should not display count badge when count is 0', () => {
      render(<SidebarNavItem label="Inbox" count={0} />)
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('1.4-UNIT-025: should not display count badge when count is undefined', () => {
      render(<SidebarNavItem label="Inbox" />)
      // No count element should be rendered
      // The icon has text-orion-fg-muted, so check specifically for the badge's bg color classes
      const button = screen.getByRole('button')
      const countBadge = button.querySelector('.bg-\\[\\#E5E1DA\\]')
      expect(countBadge).not.toBeInTheDocument()
    })

    it('1.4-UNIT-026: should style count badge with muted foreground', () => {
      render(<SidebarNavItem label="Inbox" count={5} />)
      const countBadge = screen.getByText('5')
      expect(countBadge).toHaveClass('text-orion-fg-muted')
    })
  })

  describe('Active state', () => {
    it('1.4-UNIT-027: should apply active styles when isActive=true', () => {
      render(<SidebarNavItem label="Inbox" isActive />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border-l-4')
      expect(button).toHaveClass('border-orion-gold')
    })

    it('1.4-UNIT-028: should have aria-current=true when active', () => {
      render(<SidebarNavItem label="Inbox" isActive />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-current', 'true')
    })

    it('1.4-UNIT-029: should not have aria-current when not active', () => {
      render(<SidebarNavItem label="Inbox" />)
      const button = screen.getByRole('button')
      expect(button).not.toHaveAttribute('aria-current')
    })
  })

  describe('Interactions', () => {
    it('1.4-UNIT-030: should call onClick when clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      render(<SidebarNavItem label="Inbox" onClick={handleClick} />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('1.4-UNIT-031: should call onClick when Enter key pressed', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      render(<SidebarNavItem label="Inbox" onClick={handleClick} />)

      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{Enter}')

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('1.4-UNIT-032: should call onClick when Space key pressed', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      render(<SidebarNavItem label="Inbox" onClick={handleClick} />)

      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard(' ')

      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Styling', () => {
    it('1.4-UNIT-033: should have full width', () => {
      render(<SidebarNavItem label="Inbox" />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-full')
    })

    it('1.4-UNIT-034: should have flex layout with space-between', () => {
      render(<SidebarNavItem label="Inbox" />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('flex')
      expect(button).toHaveClass('items-center')
      expect(button).toHaveClass('justify-between')
    })

    it('1.4-UNIT-035: should have hover background', () => {
      render(<SidebarNavItem label="Inbox" />)
      const button = screen.getByRole('button')
      // Check for hover class pattern
      expect(button.className).toMatch(/hover:/)
    })

    it('1.4-UNIT-036: should have focus-visible outline styles', () => {
      render(<SidebarNavItem label="Inbox" />)
      const button = screen.getByRole('button')
      expect(button.className).toMatch(/focus-visible:outline/)
    })

    it('1.4-UNIT-037: should have consistent 36px height (h-9)', () => {
      render(<SidebarNavItem label="Inbox" />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9')
      expect(button).not.toHaveClass('min-h-[44px]')
    })

    it('1.4-UNIT-038: should use text-orion-fg for text color', () => {
      render(<SidebarNavItem label="Inbox" />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-orion-fg')
    })
  })
})
