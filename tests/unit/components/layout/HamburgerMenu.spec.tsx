/**
 * HamburgerMenu Component Tests
 * Story 1.12 + Story 1.20: Icon System Migration
 *
 * Tests for the HamburgerMenu component, including validation that
 * it uses the Icon wrapper component instead of raw Lucide icons.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HamburgerMenu } from '@/components/layout/HamburgerMenu'

describe('HamburgerMenu', () => {
  describe('Rendering', () => {
    /**
     * Test: 1.12-UNIT-001
     * Category: Basic rendering
     */
    it('[1.12-UNIT-001] renders hamburger menu button', () => {
      render(<HamburgerMenu isOpen={false} onToggle={() => {}} />)

      const button = screen.getByTestId('hamburger-menu')
      expect(button).toBeInTheDocument()
    })

    /**
     * Test: 1.12-UNIT-002
     * Category: Menu icon when closed
     */
    it('[1.12-UNIT-002] renders Menu icon when closed', () => {
      render(<HamburgerMenu isOpen={false} onToggle={() => {}} />)

      const button = screen.getByTestId('hamburger-menu')
      // Icon component wraps the Lucide icon
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    /**
     * Test: 1.12-UNIT-003
     * Category: X icon when open
     */
    it('[1.12-UNIT-003] renders X icon when open', () => {
      render(<HamburgerMenu isOpen={true} onToggle={() => {}} />)

      const button = screen.getByTestId('hamburger-menu')
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    /**
     * Test: 1.12-UNIT-010
     * Category: aria-label when closed
     */
    it('[1.12-UNIT-010] has aria-label "Open menu" when closed', () => {
      render(<HamburgerMenu isOpen={false} onToggle={() => {}} />)

      const button = screen.getByTestId('hamburger-menu')
      expect(button).toHaveAttribute('aria-label', 'Open menu')
    })

    /**
     * Test: 1.12-UNIT-011
     * Category: aria-label when open
     */
    it('[1.12-UNIT-011] has aria-label "Close menu" when open', () => {
      render(<HamburgerMenu isOpen={true} onToggle={() => {}} />)

      const button = screen.getByTestId('hamburger-menu')
      expect(button).toHaveAttribute('aria-label', 'Close menu')
    })

    /**
     * Test: 1.12-UNIT-012
     * Category: aria-expanded when closed
     */
    it('[1.12-UNIT-012] has aria-expanded="false" when closed', () => {
      render(<HamburgerMenu isOpen={false} onToggle={() => {}} />)

      const button = screen.getByTestId('hamburger-menu')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    /**
     * Test: 1.12-UNIT-013
     * Category: aria-expanded when open
     */
    it('[1.12-UNIT-013] has aria-expanded="true" when open', () => {
      render(<HamburgerMenu isOpen={true} onToggle={() => {}} />)

      const button = screen.getByTestId('hamburger-menu')
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    /**
     * Test: 1.12-UNIT-014
     * Category: Button type
     */
    it('[1.12-UNIT-014] has type="button" to prevent form submission', () => {
      render(<HamburgerMenu isOpen={false} onToggle={() => {}} />)

      const button = screen.getByTestId('hamburger-menu')
      expect(button).toHaveAttribute('type', 'button')
    })

    /**
     * Test: 1.20-UNIT-220
     * Category: Icon is decorative (aria-hidden on icon)
     */
    it('[1.20-UNIT-220] icon is marked as decorative (aria-hidden)', () => {
      render(<HamburgerMenu isOpen={false} onToggle={() => {}} />)

      const button = screen.getByTestId('hamburger-menu')
      const svg = button.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Touch Target', () => {
    /**
     * Test: 1.12-UNIT-020
     * Category: WCAG minimum touch target
     */
    it('[1.12-UNIT-020] has 44px minimum touch target', () => {
      render(<HamburgerMenu isOpen={false} onToggle={() => {}} />)

      const button = screen.getByTestId('hamburger-menu')
      // Check CSS classes for minimum dimensions
      expect(button.className).toMatch(/min-w-\[44px\]/)
      expect(button.className).toMatch(/min-h-\[44px\]/)
    })
  })

  describe('Interactions', () => {
    /**
     * Test: 1.12-UNIT-030
     * Category: onClick handler
     */
    it('[1.12-UNIT-030] calls onToggle when clicked', () => {
      const handleToggle = vi.fn()
      render(<HamburgerMenu isOpen={false} onToggle={handleToggle} />)

      const button = screen.getByTestId('hamburger-menu')
      fireEvent.click(button)

      expect(handleToggle).toHaveBeenCalledTimes(1)
    })
  })

  describe('Custom className', () => {
    /**
     * Test: 1.12-UNIT-040
     * Category: Custom className is applied
     */
    it('[1.12-UNIT-040] applies custom className', () => {
      render(<HamburgerMenu isOpen={false} onToggle={() => {}} className="custom-class" />)

      const button = screen.getByTestId('hamburger-menu')
      expect(button.className).toContain('custom-class')
    })
  })

  describe('Icon Wrapper Usage (Story 1.20)', () => {
    /**
     * Test: 1.20-UNIT-221
     * Category: Uses Icon component for consistent sizing
     *
     * This test verifies the migration from raw Lucide imports to using
     * the Icon wrapper component. The Icon component applies consistent
     * sizing based on the 'size' prop.
     */
    it('[1.20-UNIT-221] uses Icon component with size="lg" for 24px icons', () => {
      render(<HamburgerMenu isOpen={false} onToggle={() => {}} />)

      const button = screen.getByTestId('hamburger-menu')
      const svg = button.querySelector('svg')

      // Icon component with size="lg" renders 24x24 icons
      // Check that SVG has width/height attributes set to 24
      expect(svg).toHaveAttribute('width', '24')
      expect(svg).toHaveAttribute('height', '24')
    })

    /**
     * Test: 1.20-UNIT-222
     * Category: Icon color uses design system tokens
     */
    it('[1.20-UNIT-222] icon uses design system color token (text-orion-fg)', () => {
      render(<HamburgerMenu isOpen={false} onToggle={() => {}} />)

      const button = screen.getByTestId('hamburger-menu')
      const svg = button.querySelector('svg')

      // Icon should have the default color class from Icon component
      // or inherit color from parent (text-orion-fg on button)
      expect(svg).toHaveClass('text-orion-fg')
    })
  })
})
