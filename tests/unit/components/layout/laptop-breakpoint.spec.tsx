/**
 * Laptop Breakpoint Tests
 * Story 1.11: Laptop Breakpoint
 *
 * Test IDs: 1.11-UNIT-001 through 1.11-UNIT-050
 *
 * Tests for:
 * - AC#1: Sidebar collapses to 48px icon-only mode at 1024-1279px
 * - AC#2: Canvas overlays chat area at laptop breakpoint
 * - AC#3: Collapsed sidebar shows only icons with tooltips
 * - AC#4: No horizontal scrolling
 * - AC#5: Transitions to desktop mode above 1280px
 * - AC#6: Transitions to tablet mode below 1024px
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { SidebarNavItem } from '@/components/sidebar/SidebarNavItem'
import { CanvasColumn } from '@/components/canvas/CanvasColumn'
import { AppShell } from '@/components/layout/AppShell'
import { useCanvasStore } from '@/stores/canvasStore'
import { TooltipProvider } from '@/components/ui/tooltip'

// Mock matchMedia for breakpoint testing
const mockMatchMedia = (matches: boolean) => {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

describe('Story 1.11: Laptop Breakpoint', () => {
  beforeEach(() => {
    // Reset canvas store before each test
    useCanvasStore.setState({ isCanvasOpen: false })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('AC#1: Sidebar collapses to 48px icon-only mode', () => {
    it('1.11-UNIT-001: Sidebar has w-sidebar-icon-only class when isCollapsed=true', () => {
      render(<Sidebar isCollapsed={true} />)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('w-sidebar-icon-only')
    })

    it('1.11-UNIT-002: Sidebar has w-sidebar class when isCollapsed=false', () => {
      render(<Sidebar isCollapsed={false} />)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('w-sidebar')
    })

    it('1.11-UNIT-003: Sidebar has transition classes for smooth width changes', () => {
      render(<Sidebar isCollapsed={true} />)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('transition-all')
      expect(sidebar).toHaveClass('duration-300')
      expect(sidebar).toHaveClass('ease-luxury')
    })

    it('1.11-UNIT-004: Sidebar defaults to expanded when no isCollapsed prop', () => {
      render(<Sidebar />)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('w-sidebar')
      expect(sidebar).not.toHaveClass('w-sidebar-icon-only')
    })
  })

  describe('AC#2: Canvas overlays chat area', () => {
    it('1.11-UNIT-005: CanvasColumn uses fixed positioning when isOverlay=true', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('fixed')
      expect(canvas).toHaveClass('top-0')
      expect(canvas).toHaveClass('right-0')
    })

    it('1.11-UNIT-006: CanvasColumn uses flex layout when isOverlay=false', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={false} />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('flex-shrink-0')
      expect(canvas).not.toHaveClass('fixed')
    })

    it('1.11-UNIT-007: Canvas has w-canvas class (480px)', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('w-canvas')
    })

    it('1.11-UNIT-008: Canvas is full height (h-screen) in overlay mode', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('h-screen')
    })

    it('1.11-UNIT-009: Canvas overlay has z-index for proper stacking', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('z-50')
    })

    it('1.11-UNIT-010: Canvas backdrop renders in overlay mode', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} />)
      const backdrop = screen.getByTestId('canvas-backdrop')
      expect(backdrop).toBeInTheDocument()
      expect(backdrop).toHaveClass('fixed')
      expect(backdrop).toHaveClass('inset-0')
    })

    it('1.11-UNIT-011: Canvas overlay slides in from right with translate-x', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('translate-x-0')
    })

    it('1.11-UNIT-012: Canvas overlay slides out with translate-x-full when closed', () => {
      useCanvasStore.setState({ isCanvasOpen: false })
      render(<CanvasColumn isOverlay={true} />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('translate-x-full')
    })

    it('1.11-UNIT-013: Canvas overlay has 300ms transition', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('duration-300')
      expect(canvas).toHaveClass('ease-luxury')
    })
  })

  describe('AC#3: Collapsed sidebar shows icons with tooltips', () => {
    it('1.11-UNIT-014: SidebarNavItem shows icon when collapsed', () => {
      render(
        <TooltipProvider>
          <SidebarNavItem label="Inbox" isCollapsed={true} />
        </TooltipProvider>
      )
      const icon = screen.getByTestId('inbox-icon')
      expect(icon).toBeInTheDocument()
    })

    it('1.11-UNIT-015: SidebarNavItem hides text label when collapsed', () => {
      render(
        <TooltipProvider>
          <SidebarNavItem label="Inbox" isCollapsed={true} />
        </TooltipProvider>
      )
      // Text should not be visible as separate span
      const buttons = screen.getAllByRole('button')
      const navItem = buttons.find(b => b.getAttribute('data-testid')?.includes('inbox'))
      // The label text should only exist in the tooltip, not as visible text in the button
      expect(navItem?.textContent).not.toContain('Inbox')
    })

    it('1.11-UNIT-016: SidebarNavItem shows text label when expanded', () => {
      render(
        <TooltipProvider>
          <SidebarNavItem label="Inbox" isCollapsed={false} />
        </TooltipProvider>
      )
      expect(screen.getByText('Inbox')).toBeInTheDocument()
    })

    it('1.11-UNIT-017: SidebarNavItem maintains 44px touch target when collapsed', () => {
      render(
        <TooltipProvider>
          <SidebarNavItem label="Inbox" isCollapsed={true} />
        </TooltipProvider>
      )
      const navItem = screen.getByTestId('sidebar-nav-item-inbox')
      expect(navItem).toHaveClass('min-h-[44px]')
    })

    it('1.11-UNIT-018: SidebarNavItem icon is 24px (w-6 h-6) when collapsed', () => {
      render(
        <TooltipProvider>
          <SidebarNavItem label="Inbox" isCollapsed={true} />
        </TooltipProvider>
      )
      const iconWrapper = screen.getByTestId('inbox-icon')
      expect(iconWrapper).toHaveClass('w-6')
      expect(iconWrapper).toHaveClass('h-6')
    })

    it('1.11-UNIT-019: Collapsed sidebar header shows "O" instead of "Orion"', () => {
      render(<Sidebar isCollapsed={true} />)
      expect(screen.getByText('O')).toBeInTheDocument()
      expect(screen.queryByText('Orion')).not.toBeInTheDocument()
    })

    it('1.11-UNIT-020: Expanded sidebar header shows "Orion"', () => {
      render(<Sidebar isCollapsed={false} />)
      expect(screen.getByText('Orion')).toBeInTheDocument()
      expect(screen.queryByText('O')).not.toBeInTheDocument()
    })
  })

  describe('AC#4: No horizontal scrolling', () => {
    it('1.11-UNIT-021: AppShell has max-w-[100vw] constraint', () => {
      window.matchMedia = mockMatchMedia(true)
      render(<AppShell />)
      const appShell = screen.getByTestId('app-shell')
      expect(appShell).toHaveClass('max-w-[100vw]')
    })

    it('1.11-UNIT-022: AppShell has overflow-x-hidden', () => {
      window.matchMedia = mockMatchMedia(true)
      render(<AppShell />)
      const appShell = screen.getByTestId('app-shell')
      expect(appShell).toHaveClass('overflow-x-hidden')
    })

    it('1.11-UNIT-023: Sidebar width variable exists in CSS', async () => {
      const fs = await import('node:fs/promises')
      const css = await fs.readFile(
        '/Users/sid/Desktop/orion-butler/design-system/styles/globals.css',
        'utf-8'
      )
      expect(css).toContain('--orion-sidebar-icon-only: 48px')
    })

    it('1.11-UNIT-024: Laptop breakpoint token exists in CSS', async () => {
      const fs = await import('node:fs/promises')
      const css = await fs.readFile(
        '/Users/sid/Desktop/orion-butler/design-system/styles/globals.css',
        'utf-8'
      )
      expect(css).toContain('--orion-breakpoint-laptop: 1024px')
    })
  })

  describe('AC#5 & AC#6: Breakpoint transitions', () => {
    it('1.11-UNIT-025: Sidebar has transition-all for smooth changes', () => {
      render(<Sidebar isCollapsed={true} />)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('transition-all')
    })

    it('1.11-UNIT-026: Canvas has transition-transform in overlay mode', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('transition-transform')
    })
  })

  describe('Canvas overlay interactions', () => {
    it('1.11-UNIT-027: Canvas closes when ESC is pressed', async () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} />)

      expect(useCanvasStore.getState().isCanvasOpen).toBe(true)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(useCanvasStore.getState().isCanvasOpen).toBe(false)
    })

    it('1.11-UNIT-028: Canvas closes when backdrop is clicked', async () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} />)

      const backdrop = screen.getByTestId('canvas-backdrop')
      fireEvent.click(backdrop)
      expect(useCanvasStore.getState().isCanvasOpen).toBe(false)
    })

    it('1.11-UNIT-029: Canvas has close button in overlay mode', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} />)

      const closeButton = screen.getByRole('button', { name: /close canvas/i })
      expect(closeButton).toBeInTheDocument()
    })

    it('1.11-UNIT-030: Close button closes canvas when clicked', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} />)

      const closeButton = screen.getByRole('button', { name: /close canvas/i })
      fireEvent.click(closeButton)
      expect(useCanvasStore.getState().isCanvasOpen).toBe(false)
    })

    it('1.11-UNIT-031: Close button has 44px touch target', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} />)

      const closeButton = screen.getByRole('button', { name: /close canvas/i })
      expect(closeButton).toHaveClass('min-w-[44px]')
      expect(closeButton).toHaveClass('min-h-[44px]')
    })
  })

  describe('Accessibility', () => {
    it('1.11-UNIT-032: Canvas overlay has aria-label', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveAttribute('aria-label', 'Canvas')
    })

    it('1.11-UNIT-033: Canvas overlay has aria-hidden when closed', () => {
      useCanvasStore.setState({ isCanvasOpen: false })
      render(<CanvasColumn isOverlay={true} />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveAttribute('aria-hidden', 'true')
    })

    it('1.11-UNIT-034: Canvas overlay has tabIndex -1 when closed', () => {
      useCanvasStore.setState({ isCanvasOpen: false })
      render(<CanvasColumn isOverlay={true} />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveAttribute('tabIndex', '-1')
    })

    it('1.11-UNIT-035: Canvas overlay has tabIndex 0 when open', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveAttribute('tabIndex', '0')
    })

    it('1.11-UNIT-036: Collapsed sidebar nav item has correct data-testid', () => {
      render(
        <TooltipProvider>
          <SidebarNavItem label="Inbox" isCollapsed={true} />
        </TooltipProvider>
      )
      expect(screen.getByTestId('sidebar-nav-item-inbox')).toBeInTheDocument()
    })
  })

  describe('Active state styling', () => {
    it('1.11-UNIT-037: Active collapsed nav item has gold border', () => {
      render(
        <TooltipProvider>
          <SidebarNavItem label="Inbox" isCollapsed={true} isActive={true} />
        </TooltipProvider>
      )
      const navItem = screen.getByTestId('sidebar-nav-item-inbox')
      expect(navItem).toHaveClass('border-orion-gold')
      expect(navItem).toHaveClass('border-l-4')
    })

    it('1.11-UNIT-038: Active collapsed nav item has background tint', () => {
      render(
        <TooltipProvider>
          <SidebarNavItem label="Inbox" isCollapsed={true} isActive={true} />
        </TooltipProvider>
      )
      const navItem = screen.getByTestId('sidebar-nav-item-inbox')
      expect(navItem).toHaveClass('bg-orion-primary-light')
    })

    it('1.11-UNIT-039: Active collapsed nav item has aria-current', () => {
      render(
        <TooltipProvider>
          <SidebarNavItem label="Inbox" isCollapsed={true} isActive={true} />
        </TooltipProvider>
      )
      const navItem = screen.getByTestId('sidebar-nav-item-inbox')
      expect(navItem).toHaveAttribute('aria-current', 'true')
    })
  })

  describe('Focus states', () => {
    it('1.11-UNIT-040: Collapsed nav item has focus-visible styles', () => {
      render(
        <TooltipProvider>
          <SidebarNavItem label="Inbox" isCollapsed={true} />
        </TooltipProvider>
      )
      const navItem = screen.getByTestId('sidebar-nav-item-inbox')
      expect(navItem.className).toMatch(/focus-visible/)
    })

    it('1.11-UNIT-041: Close button has focus-visible styles', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} />)
      const closeButton = screen.getByRole('button', { name: /close canvas/i })
      expect(closeButton.className).toMatch(/focus-visible/)
    })
  })

  describe('Tailwind config integration', () => {
    it('1.11-UNIT-042: w-sidebar-icon-only class defined in tailwind config', async () => {
      const fs = await import('node:fs/promises')
      const config = await fs.readFile(
        '/Users/sid/Desktop/orion-butler/design-system/tailwind.config.ts',
        'utf-8'
      )
      expect(config).toContain("'sidebar-icon-only'")
    })

    it('1.11-UNIT-043: spacing.sidebar-icon-only defined in tailwind config', async () => {
      const fs = await import('node:fs/promises')
      const config = await fs.readFile(
        '/Users/sid/Desktop/orion-butler/design-system/tailwind.config.ts',
        'utf-8'
      )
      expect(config).toContain("'sidebar-icon-only': 'var(--orion-sidebar-icon-only)'")
    })
  })

  describe('Hook tests', () => {
    it('1.11-UNIT-044: useMediaQuery hook file exists', async () => {
      const fs = await import('node:fs/promises')
      const hook = await fs.readFile(
        '/Users/sid/Desktop/orion-butler/src/hooks/useMediaQuery.ts',
        'utf-8'
      )
      expect(hook).toContain('export function useMediaQuery')
      expect(hook).toContain('export function useBreakpoint')
    })

    it('1.11-UNIT-045: useBreakpoint returns isSidebarCollapsed', async () => {
      const fs = await import('node:fs/promises')
      const hook = await fs.readFile(
        '/Users/sid/Desktop/orion-butler/src/hooks/useMediaQuery.ts',
        'utf-8'
      )
      expect(hook).toContain('isSidebarCollapsed')
    })

    it('1.11-UNIT-046: useBreakpoint returns isCanvasOverlay', async () => {
      const fs = await import('node:fs/promises')
      const hook = await fs.readFile(
        '/Users/sid/Desktop/orion-butler/src/hooks/useMediaQuery.ts',
        'utf-8'
      )
      expect(hook).toContain('isCanvasOverlay')
    })
  })

  describe('Desktop mode preservation', () => {
    it('1.11-UNIT-047: CanvasColumn without isOverlay uses flex layout', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('flex-shrink-0')
      expect(canvas).not.toHaveClass('fixed')
    })

    it('1.11-UNIT-048: CanvasColumn without isOverlay uses opacity animation', () => {
      useCanvasStore.setState({ isCanvasOpen: false })
      render(<CanvasColumn />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('opacity-0')
    })

    it('1.11-UNIT-049: CanvasColumn open without isOverlay has full opacity', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('opacity-100')
    })

    it('1.11-UNIT-050: Desktop mode canvas has no backdrop', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={false} />)
      expect(screen.queryByTestId('canvas-backdrop')).not.toBeInTheDocument()
    })
  })
})
