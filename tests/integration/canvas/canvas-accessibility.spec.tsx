/**
 * Canvas Accessibility Integration Tests
 * Story 1.6: Canvas Column Placeholder
 *
 * Tests for canvas accessibility features including aria attributes.
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { CanvasColumn } from '@/components/canvas/CanvasColumn'
import { useCanvasStore } from '@/stores/canvasStore'

describe('Canvas Accessibility', () => {
  // Reset store state before each test
  beforeEach(() => {
    useCanvasStore.setState({ isCanvasOpen: false })
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

  test('1.6-INT-002: tabIndex reflects canvas state', async () => {
    render(<CanvasColumn />)
    const aside = screen.getByRole('complementary', { hidden: true })

    // Hidden: tabIndex = -1
    expect(aside).toHaveAttribute('tabindex', '-1')

    // Visible: tabIndex = 0
    act(() => useCanvasStore.getState().openCanvas())
    expect(aside).toHaveAttribute('tabindex', '0')

    // Hidden again: tabIndex = -1
    act(() => useCanvasStore.getState().closeCanvas())
    expect(aside).toHaveAttribute('tabindex', '-1')
  })

  test('canvas uses semantic aside element', () => {
    render(<CanvasColumn />)
    const aside = screen.getByRole('complementary', { hidden: true })
    expect(aside.tagName).toBe('ASIDE')
  })

  test('canvas has descriptive aria-label', () => {
    render(<CanvasColumn />)
    const aside = screen.getByRole('complementary', { hidden: true })
    expect(aside).toHaveAttribute('aria-label', 'Canvas panel')
  })

  test('canvas is removed from tab order when hidden', () => {
    render(<CanvasColumn />)
    const aside = screen.getByRole('complementary', { hidden: true })

    // Should not be focusable when hidden
    expect(aside).toHaveAttribute('tabindex', '-1')
  })

  test('canvas is focusable when visible', () => {
    useCanvasStore.setState({ isCanvasOpen: true })
    render(<CanvasColumn />)
    const aside = screen.getByRole('complementary')

    // Should be focusable when visible
    expect(aside).toHaveAttribute('tabindex', '0')
  })
})
