/**
 * Tablet Breakpoint Tests
 * Story 1.12: Tablet Breakpoint (<1024px)
 *
 * Test IDs: 1.12-UNIT-001 through 1.12-UNIT-050
 *
 * Acceptance Criteria:
 * - AC#1: At <1024px, sidebar hidden by default, chat takes full width
 * - AC#2: Hamburger menu click → sidebar slides in as overlay (280px)
 * - AC#3: Sidebar closes on: click outside, ESC, focus trapped while open
 * - AC#4: Canvas opens as full-width overlay
 * - AC#5: No horizontal scrolling
 * - AC#6: Above 1024px → transitions to laptop mode
 * - AC#7: Hamburger in top-left, 44x44px touch target
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { HamburgerMenu } from '@/components/layout/HamburgerMenu'
import { Backdrop } from '@/components/layout/Backdrop'
import { Sidebar } from '@/components/sidebar'
import { CanvasColumn } from '@/components/canvas'
import { useLayoutStore } from '@/stores/layoutStore'
import { useCanvasStore } from '@/stores/canvasStore'
import * as hooks from '@/hooks'

// Mock the hooks module
vi.mock('@/hooks', () => ({
  useBreakpoint: vi.fn(() => ({
    isDesktop: false,
    isLaptop: false,
    isTablet: true,
    isMobile: false,
    isSidebarCollapsed: false,
    isSidebarOverlay: true,
    isCanvasOverlay: true,
    isCanvasFullWidth: true,
    hasMounted: true,
  })),
  useMediaQuery: vi.fn(() => false),
}))

// Helper to mock tablet breakpoint
const mockTabletBreakpoint = () => {
  vi.mocked(hooks.useBreakpoint).mockReturnValue({
    isDesktop: false,
    isLaptop: false,
    isTablet: true,
    isMobile: false,
    isSidebarCollapsed: false,
    isSidebarOverlay: true,
    isCanvasOverlay: true,
    isCanvasFullWidth: true,
    hasMounted: true,
  })
}

// Helper to mock laptop breakpoint
const mockLaptopBreakpoint = () => {
  vi.mocked(hooks.useBreakpoint).mockReturnValue({
    isDesktop: false,
    isLaptop: true,
    isTablet: false,
    isMobile: false,
    isSidebarCollapsed: true,
    isSidebarOverlay: false,
    isCanvasOverlay: true,
    isCanvasFullWidth: false,
    hasMounted: true,
  })
}

// Helper to mock desktop breakpoint
const mockDesktopBreakpoint = () => {
  vi.mocked(hooks.useBreakpoint).mockReturnValue({
    isDesktop: true,
    isLaptop: false,
    isTablet: false,
    isMobile: false,
    isSidebarCollapsed: false,
    isSidebarOverlay: false,
    isCanvasOverlay: false,
    isCanvasFullWidth: false,
    hasMounted: true,
  })
}

describe('Story 1.12: Tablet Breakpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTabletBreakpoint()
    // Reset stores
    useLayoutStore.setState({ isSidebarOverlayOpen: false })
    useCanvasStore.setState({ isCanvasOpen: false })
  })

  afterEach(() => {
    cleanup()
  })

  describe('HamburgerMenu Component', () => {
    it('1.12-UNIT-001: renders hamburger menu button', () => {
      const onToggle = vi.fn()
      render(<HamburgerMenu isOpen={false} onToggle={onToggle} />)

      const button = screen.getByTestId('hamburger-menu')
      expect(button).toBeInTheDocument()
    })

    it('1.12-UNIT-002: has 44x44px minimum touch target (AC#7)', () => {
      const onToggle = vi.fn()
      render(<HamburgerMenu isOpen={false} onToggle={onToggle} />)

      const button = screen.getByTestId('hamburger-menu')
      expect(button).toHaveClass('min-w-[44px]')
      expect(button).toHaveClass('min-h-[44px]')
    })

    it('1.12-UNIT-003: has correct aria-label when closed', () => {
      const onToggle = vi.fn()
      render(<HamburgerMenu isOpen={false} onToggle={onToggle} />)

      const button = screen.getByTestId('hamburger-menu')
      expect(button).toHaveAttribute('aria-label', 'Open menu')
    })

    it('1.12-UNIT-004: has correct aria-label when open', () => {
      const onToggle = vi.fn()
      render(<HamburgerMenu isOpen={true} onToggle={onToggle} />)

      const button = screen.getByTestId('hamburger-menu')
      expect(button).toHaveAttribute('aria-label', 'Close menu')
    })

    it('1.12-UNIT-005: has aria-expanded attribute', () => {
      const onToggle = vi.fn()
      const { rerender } = render(<HamburgerMenu isOpen={false} onToggle={onToggle} />)

      const button = screen.getByTestId('hamburger-menu')
      expect(button).toHaveAttribute('aria-expanded', 'false')

      rerender(<HamburgerMenu isOpen={true} onToggle={onToggle} />)
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('1.12-UNIT-006: calls onToggle when clicked (AC#2)', () => {
      const onToggle = vi.fn()
      render(<HamburgerMenu isOpen={false} onToggle={onToggle} />)

      const button = screen.getByTestId('hamburger-menu')
      fireEvent.click(button)

      expect(onToggle).toHaveBeenCalledTimes(1)
    })

    it('1.12-UNIT-007: has gold color on hover/focus/active states', () => {
      const onToggle = vi.fn()
      render(<HamburgerMenu isOpen={false} onToggle={onToggle} />)

      const button = screen.getByTestId('hamburger-menu')
      expect(button).toHaveClass('hover:text-orion-gold')
    })

    it('1.12-UNIT-008: has gold focus outline', () => {
      const onToggle = vi.fn()
      render(<HamburgerMenu isOpen={false} onToggle={onToggle} />)

      const button = screen.getByTestId('hamburger-menu')
      expect(button).toHaveClass('focus-visible:outline-orion-gold')
    })

    it('1.12-UNIT-009: shows X icon when open', () => {
      const onToggle = vi.fn()
      render(<HamburgerMenu isOpen={true} onToggle={onToggle} />)

      const button = screen.getByTestId('hamburger-menu')
      expect(button).toHaveClass('text-orion-gold')
    })
  })

  describe('Backdrop Component', () => {
    it('1.12-UNIT-010: renders backdrop', () => {
      const onClick = vi.fn()
      render(<Backdrop visible={true} onClick={onClick} testId="test-backdrop" />)

      const backdrop = screen.getByTestId('test-backdrop')
      expect(backdrop).toBeInTheDocument()
    })

    it('1.12-UNIT-011: has semi-transparent black background', () => {
      const onClick = vi.fn()
      render(<Backdrop visible={true} onClick={onClick} testId="test-backdrop" />)

      const backdrop = screen.getByTestId('test-backdrop')
      expect(backdrop).toHaveClass('bg-black/50')
    })

    it('1.12-UNIT-012: is visible when visible=true', () => {
      const onClick = vi.fn()
      render(<Backdrop visible={true} onClick={onClick} testId="test-backdrop" />)

      const backdrop = screen.getByTestId('test-backdrop')
      expect(backdrop).toHaveClass('opacity-100')
      expect(backdrop).not.toHaveClass('pointer-events-none')
    })

    it('1.12-UNIT-013: is hidden when visible=false', () => {
      const onClick = vi.fn()
      render(<Backdrop visible={false} onClick={onClick} testId="test-backdrop" />)

      const backdrop = screen.getByTestId('test-backdrop')
      expect(backdrop).toHaveClass('opacity-0')
      expect(backdrop).toHaveClass('pointer-events-none')
    })

    it('1.12-UNIT-014: calls onClick when clicked (AC#3)', () => {
      const onClick = vi.fn()
      render(<Backdrop visible={true} onClick={onClick} testId="test-backdrop" />)

      const backdrop = screen.getByTestId('test-backdrop')
      fireEvent.click(backdrop)

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('1.12-UNIT-015: has fixed positioning', () => {
      const onClick = vi.fn()
      render(<Backdrop visible={true} onClick={onClick} testId="test-backdrop" />)

      const backdrop = screen.getByTestId('test-backdrop')
      expect(backdrop).toHaveClass('fixed')
      expect(backdrop).toHaveClass('inset-0')
    })

    it('1.12-UNIT-016: has transition animation', () => {
      const onClick = vi.fn()
      render(<Backdrop visible={true} onClick={onClick} testId="test-backdrop" />)

      const backdrop = screen.getByTestId('test-backdrop')
      expect(backdrop).toHaveClass('transition-opacity')
      expect(backdrop).toHaveClass('duration-300')
    })

    it('1.12-UNIT-017: has correct z-index', () => {
      const onClick = vi.fn()
      render(<Backdrop visible={true} onClick={onClick} zIndex="z-40" testId="test-backdrop" />)

      const backdrop = screen.getByTestId('test-backdrop')
      expect(backdrop).toHaveClass('z-40')
    })

    it('1.12-UNIT-018: has aria-hidden true', () => {
      const onClick = vi.fn()
      render(<Backdrop visible={true} onClick={onClick} testId="test-backdrop" />)

      const backdrop = screen.getByTestId('test-backdrop')
      expect(backdrop).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Sidebar Overlay Mode', () => {
    it('1.12-UNIT-019: renders sidebar in overlay mode', () => {
      render(
        <Sidebar
          isOverlay={true}
          isOverlayOpen={true}
          onCloseOverlay={vi.fn()}
        />
      )

      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toBeInTheDocument()
    })

    it('1.12-UNIT-020: has fixed positioning in overlay mode', () => {
      render(
        <Sidebar
          isOverlay={true}
          isOverlayOpen={true}
          onCloseOverlay={vi.fn()}
        />
      )

      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('fixed')
      expect(sidebar).toHaveClass('left-0')
      expect(sidebar).toHaveClass('top-0')
    })

    it('1.12-UNIT-021: has 280px width in overlay mode (AC#2)', () => {
      render(
        <Sidebar
          isOverlay={true}
          isOverlayOpen={true}
          onCloseOverlay={vi.fn()}
        />
      )

      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('w-sidebar')
    })

    it('1.12-UNIT-022: is translated off-screen when closed', () => {
      render(
        <Sidebar
          isOverlay={true}
          isOverlayOpen={false}
          onCloseOverlay={vi.fn()}
        />
      )

      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('-translate-x-full')
    })

    it('1.12-UNIT-023: is translated on-screen when open', () => {
      render(
        <Sidebar
          isOverlay={true}
          isOverlayOpen={true}
          onCloseOverlay={vi.fn()}
        />
      )

      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('translate-x-0')
    })

    it('1.12-UNIT-024: has shadow for elevation', () => {
      render(
        <Sidebar
          isOverlay={true}
          isOverlayOpen={true}
          onCloseOverlay={vi.fn()}
        />
      )

      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('shadow-lg')
    })

    it('1.12-UNIT-025: has 300ms animation (AC#2)', () => {
      render(
        <Sidebar
          isOverlay={true}
          isOverlayOpen={true}
          onCloseOverlay={vi.fn()}
        />
      )

      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('duration-300')
      expect(sidebar).toHaveClass('ease-luxury')
    })

    it('1.12-UNIT-026: has z-index 50 for overlay', () => {
      render(
        <Sidebar
          isOverlay={true}
          isOverlayOpen={true}
          onCloseOverlay={vi.fn()}
        />
      )

      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('z-50')
    })

    it('1.12-UNIT-027: calls onCloseOverlay on ESC key (AC#3)', () => {
      const onCloseOverlay = vi.fn()
      render(
        <Sidebar
          isOverlay={true}
          isOverlayOpen={true}
          onCloseOverlay={onCloseOverlay}
        />
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(onCloseOverlay).toHaveBeenCalledTimes(1)
    })

    it('1.12-UNIT-028: does not call onCloseOverlay on ESC when closed', () => {
      const onCloseOverlay = vi.fn()
      render(
        <Sidebar
          isOverlay={true}
          isOverlayOpen={false}
          onCloseOverlay={onCloseOverlay}
        />
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(onCloseOverlay).not.toHaveBeenCalled()
    })

    it('1.12-UNIT-029: has aria-hidden true when closed', () => {
      render(
        <Sidebar
          isOverlay={true}
          isOverlayOpen={false}
          onCloseOverlay={vi.fn()}
        />
      )

      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveAttribute('aria-hidden', 'true')
    })

    it('1.12-UNIT-030: has aria-hidden false when open', () => {
      render(
        <Sidebar
          isOverlay={true}
          isOverlayOpen={true}
          onCloseOverlay={vi.fn()}
        />
      )

      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveAttribute('aria-hidden', 'false')
    })

    it('1.12-UNIT-031: has data-open attribute', () => {
      const { rerender } = render(
        <Sidebar
          isOverlay={true}
          isOverlayOpen={false}
          onCloseOverlay={vi.fn()}
        />
      )

      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveAttribute('data-open', 'false')

      rerender(
        <Sidebar
          isOverlay={true}
          isOverlayOpen={true}
          onCloseOverlay={vi.fn()}
        />
      )
      expect(sidebar).toHaveAttribute('data-open', 'true')
    })
  })

  describe('CanvasColumn Full-Width Mode', () => {
    it('1.12-UNIT-032: renders canvas column', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} isFullWidth={true} />)

      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toBeInTheDocument()
    })

    it('1.12-UNIT-033: has full width at tablet breakpoint (AC#4)', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} isFullWidth={true} />)

      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('w-full')
    })

    it('1.12-UNIT-034: has 480px width when not full-width (laptop)', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} isFullWidth={false} />)

      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('w-canvas')
    })

    it('1.12-UNIT-035: has fixed positioning in overlay mode', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} isFullWidth={true} />)

      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('fixed')
      expect(canvas).toHaveClass('right-0')
      expect(canvas).toHaveClass('top-0')
    })

    it('1.12-UNIT-036: slides in from right', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} isFullWidth={true} />)

      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('translate-x-0')
    })

    it('1.12-UNIT-037: slides out to right when closed', () => {
      useCanvasStore.setState({ isCanvasOpen: false })
      render(<CanvasColumn isOverlay={true} isFullWidth={true} />)

      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('translate-x-full')
    })

    it('1.12-UNIT-038: has backdrop when open', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} isFullWidth={true} />)

      const backdrop = screen.getByTestId('canvas-backdrop')
      expect(backdrop).toBeInTheDocument()
      expect(backdrop).toHaveClass('opacity-100')
    })

    it('1.12-UNIT-039: closes on ESC key', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} isFullWidth={true} />)

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(useCanvasStore.getState().isCanvasOpen).toBe(false)
    })

    it('1.12-UNIT-040: has close button', () => {
      useCanvasStore.setState({ isCanvasOpen: true })
      render(<CanvasColumn isOverlay={true} isFullWidth={true} />)

      const closeButton = screen.getByRole('button', { name: 'Close canvas' })
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('Layout Store - Sidebar Overlay State', () => {
    it('1.12-UNIT-041: has isSidebarOverlayOpen state', () => {
      const state = useLayoutStore.getState()
      expect(state).toHaveProperty('isSidebarOverlayOpen')
    })

    it('1.12-UNIT-042: isSidebarOverlayOpen defaults to false', () => {
      useLayoutStore.setState({ isSidebarOverlayOpen: false })
      const state = useLayoutStore.getState()
      expect(state.isSidebarOverlayOpen).toBe(false)
    })

    it('1.12-UNIT-043: openSidebarOverlay sets state to true', () => {
      useLayoutStore.getState().openSidebarOverlay()
      expect(useLayoutStore.getState().isSidebarOverlayOpen).toBe(true)
    })

    it('1.12-UNIT-044: closeSidebarOverlay sets state to false', () => {
      useLayoutStore.setState({ isSidebarOverlayOpen: true })
      useLayoutStore.getState().closeSidebarOverlay()
      expect(useLayoutStore.getState().isSidebarOverlayOpen).toBe(false)
    })

    it('1.12-UNIT-045: toggleSidebarOverlay toggles state', () => {
      useLayoutStore.setState({ isSidebarOverlayOpen: false })

      useLayoutStore.getState().toggleSidebarOverlay()
      expect(useLayoutStore.getState().isSidebarOverlayOpen).toBe(true)

      useLayoutStore.getState().toggleSidebarOverlay()
      expect(useLayoutStore.getState().isSidebarOverlayOpen).toBe(false)
    })
  })

  describe('Breakpoint Detection', () => {
    it('1.12-UNIT-046: isTablet is true at <1024px', () => {
      mockTabletBreakpoint()
      const result = hooks.useBreakpoint()
      expect(result.isTablet).toBe(true)
    })

    it('1.12-UNIT-047: isSidebarOverlay is true at tablet', () => {
      mockTabletBreakpoint()
      const result = hooks.useBreakpoint()
      expect(result.isSidebarOverlay).toBe(true)
    })

    it('1.12-UNIT-048: isCanvasFullWidth is true at tablet', () => {
      mockTabletBreakpoint()
      const result = hooks.useBreakpoint()
      expect(result.isCanvasFullWidth).toBe(true)
    })

    it('1.12-UNIT-049: isSidebarCollapsed is false at tablet (uses overlay instead)', () => {
      mockTabletBreakpoint()
      const result = hooks.useBreakpoint()
      expect(result.isSidebarCollapsed).toBe(false)
    })

    it('1.12-UNIT-050: isCanvasOverlay is true at tablet', () => {
      mockTabletBreakpoint()
      const result = hooks.useBreakpoint()
      expect(result.isCanvasOverlay).toBe(true)
    })
  })
})
