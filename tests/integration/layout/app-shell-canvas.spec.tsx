/**
 * AppShell + Canvas Integration Tests
 * Story 1.6: Canvas Column Placeholder
 *
 * Tests for the integration of CanvasColumn into AppShell layout.
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppShell } from '@/components/layout/AppShell'
import { useCanvasStore } from '@/stores/canvasStore'

/**
 * Helper to find the canvas element (which has aria-hidden when closed)
 * Since aria-hidden makes the name not computable, we find by role and filter
 * Story 1.17: Updated to use "Canvas panel" aria-label
 */
const getCanvasElement = () => {
  const complementaryElements = screen.getAllByRole('complementary', { hidden: true })
  const canvas = complementaryElements.find(el => el.getAttribute('aria-label') === 'Canvas panel')
  if (!canvas) throw new Error('Canvas element not found')
  return canvas
}

describe('AppShell + Canvas Integration', () => {
  // Reset store state before each test
  beforeEach(() => {
    useCanvasStore.setState({ isCanvasOpen: false })
  })

  test('1.6-INT-003: AppShell includes CanvasColumn', () => {
    render(<AppShell />)

    // Canvas should be present (hidden by default)
    // Story 1.17: Updated to use "Canvas panel" aria-label
    const canvas = getCanvasElement()
    expect(canvas).toBeInTheDocument()
    expect(canvas).toHaveAttribute('aria-label', 'Canvas panel')
  })

  test('AppShell renders all three columns', () => {
    render(<AppShell />)

    // Should have the app shell container
    const appShell = screen.getByTestId('app-shell')
    expect(appShell).toBeInTheDocument()
    expect(appShell).toHaveClass('flex')

    // Should have sidebar navigation
    // Story 1.17: Updated to use "Main navigation" aria-label
    const sidebar = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(sidebar).toBeInTheDocument()

    // Should have main content area (chat)
    // Story 1.17: Updated to use <main> with "Chat conversation" aria-label
    const main = screen.getByRole('main', { name: 'Chat conversation' })
    expect(main).toBeInTheDocument()

    // Should have canvas
    const canvas = getCanvasElement()
    expect(canvas).toBeInTheDocument()
  })

  test('Canvas is hidden by default in AppShell', () => {
    render(<AppShell />)

    const canvas = getCanvasElement()
    expect(canvas).toHaveClass('w-0')
    expect(canvas).toHaveClass('opacity-0')
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
  })

  test('Canvas width does not affect layout when hidden', () => {
    render(<AppShell />)

    const appShell = screen.getByTestId('app-shell')
    const canvas = getCanvasElement()

    // Canvas should have width 0 when closed
    expect(canvas).toHaveClass('w-0')
    expect(canvas).toHaveClass('flex-shrink-0')

    // AppShell should still render properly
    expect(appShell).toHaveClass('flex')
    expect(appShell).toHaveClass('h-screen')
  })
})
