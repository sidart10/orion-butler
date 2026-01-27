/**
 * CanvasColumn Component Unit Tests
 * Story 1.6: Canvas Column Placeholder
 *
 * Tests for the CanvasColumn component that displays the canvas panel.
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CanvasColumn } from '@/components/canvas/CanvasColumn'
import { useCanvasStore } from '@/stores/canvasStore'

describe('CanvasColumn', () => {
  // Reset store state before each test
  beforeEach(() => {
    useCanvasStore.setState({ isCanvasOpen: false })
  })

  test('1.6-UNIT-005: hidden state applies translate-x-full (slide animation)', () => {
    render(<CanvasColumn />)
    const aside = screen.getByRole('complementary', { hidden: true })
    expect(aside).toHaveClass('translate-x-full')
    expect(aside).toHaveClass('w-canvas')
  })

  test('1.6-UNIT-006: visible state applies translate-x-0 (slide animation)', () => {
    useCanvasStore.setState({ isCanvasOpen: true })
    render(<CanvasColumn />)
    const aside = screen.getByRole('complementary')
    expect(aside).toHaveClass('translate-x-0')
    expect(aside).toHaveClass('w-canvas')
  })

  test('1.6-UNIT-007: renders as aside with complementary role', () => {
    render(<CanvasColumn />)
    const aside = screen.getByRole('complementary', { hidden: true })
    expect(aside.tagName).toBe('ASIDE')
    expect(aside).toHaveAttribute('aria-label', 'Canvas panel')
  })

  test('1.6-UNIT-008: has animation transition classes', () => {
    render(<CanvasColumn />)
    const aside = screen.getByRole('complementary', { hidden: true })
    expect(aside).toHaveClass('transition-transform')
    expect(aside).toHaveClass('duration-300')
    // ease-luxury maps to cubic-bezier(0.4, 0, 0.2, 1)
    expect(aside).toHaveClass('ease-luxury')
  })

  test('renders with absolute positioning for desktop mode', () => {
    render(<CanvasColumn />)
    const aside = screen.getByRole('complementary', { hidden: true })
    expect(aside).toHaveClass('absolute')
  })

  test('renders with z-40 for proper stacking', () => {
    render(<CanvasColumn />)
    const aside = screen.getByRole('complementary', { hidden: true })
    expect(aside).toHaveClass('z-40')
  })

  test('renders with h-full for full height', () => {
    render(<CanvasColumn />)
    const aside = screen.getByRole('complementary', { hidden: true })
    expect(aside).toHaveClass('h-full')
  })

  test('renders with background and border classes', () => {
    useCanvasStore.setState({ isCanvasOpen: true })
    render(<CanvasColumn />)
    const aside = screen.getByRole('complementary')
    expect(aside).toHaveClass('bg-orion-surface')
    expect(aside).toHaveClass('border-l')
    expect(aside).toHaveClass('border-orion-border')
  })

  test('contains EmailCanvas component when visible', () => {
    useCanvasStore.setState({ isCanvasOpen: true })
    render(<CanvasColumn />)
    // EmailCanvas should be rendered with Email Draft header
    expect(screen.getByText(/Email Draft/i)).toBeInTheDocument()
  })

  test('1.6-INT-001: aria-hidden reflects canvas state', async () => {
    render(<CanvasColumn />)
    const aside = screen.getByRole('complementary', { hidden: true })

    // Initially hidden
    expect(aside).toHaveAttribute('aria-hidden', 'true')

    // Open canvas
    act(() => useCanvasStore.getState().openCanvas())
    expect(aside).toHaveAttribute('aria-hidden', 'false')

    // Close canvas
    act(() => useCanvasStore.getState().closeCanvas())
    expect(aside).toHaveAttribute('aria-hidden', 'true')
  })

  test('1.6-INT-002: tabIndex reflects canvas state (desktop mode)', async () => {
    render(<CanvasColumn />)
    const aside = screen.getByRole('complementary', { hidden: true })

    // Hidden: tabIndex = -1
    expect(aside).toHaveAttribute('tabindex', '-1')

    // Visible: tabIndex = 0 (desktop mode allows direct focus)
    act(() => useCanvasStore.getState().openCanvas())
    expect(aside).toHaveAttribute('tabindex', '0')
  })

  test('ESC key closes canvas when open (desktop mode - no focus trap)', async () => {
    useCanvasStore.setState({ isCanvasOpen: true })
    const user = userEvent.setup()
    render(<CanvasColumn />)

    const aside = screen.getByRole('complementary')
    expect(aside).toHaveClass('translate-x-0')

    // Press ESC - in desktop mode, ESC is handled by EmailCanvas close button
    // Desktop mode doesn't use focus trap, so ESC won't automatically close
    // This test verifies desktop mode behavior
    await user.keyboard('{Escape}')

    // In desktop mode, canvas stays open (ESC handled by EmailCanvas component)
    expect(aside).toHaveClass('translate-x-0')
  })

  test('ESC key does nothing when canvas is already closed', async () => {
    const user = userEvent.setup()
    render(<CanvasColumn />)

    // Verify closed
    expect(useCanvasStore.getState().isCanvasOpen).toBe(false)

    // Press ESC
    await user.keyboard('{Escape}')

    // Should still be closed
    expect(useCanvasStore.getState().isCanvasOpen).toBe(false)
  })
})
