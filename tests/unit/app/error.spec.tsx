/**
 * Error Boundary Unit Tests
 *
 * Story 1.X: Error Boundaries for graceful error handling
 * Tests cover the error.tsx App Router error boundary component
 *
 * Test ID Convention: ERR-UNIT-{SEQ}
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from '@/app/error'

// Mock console.error to prevent test output noise
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('Error Boundary Component', () => {
  const mockReset = vi.fn()
  const createTestError = (message: string) => {
    const err = new globalThis.Error(message)
    return err as globalThis.Error & { digest?: string }
  }
  const mockError = createTestError('Test error message')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =============================================================================
  // ERR-UNIT-001: Error boundary renders
  // =============================================================================
  describe('Rendering', () => {
    it('ERR-UNIT-001: Error boundary renders without crashing', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('ERR-UNIT-002: Error boundary displays error message', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      expect(screen.getByText('Test error message')).toBeInTheDocument()
    })

    it('ERR-UNIT-003: Error boundary displays fallback when no error message', () => {
      const errorWithoutMessage = createTestError('')
      render(<ErrorBoundary error={errorWithoutMessage} reset={mockReset} />)
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
    })

    it('ERR-UNIT-004: Error boundary renders try again button', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })
  })

  // =============================================================================
  // ERR-UNIT-005: Design System Compliance
  // =============================================================================
  describe('Design System Compliance', () => {
    it('ERR-UNIT-005: Container uses design system background color', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      const container = screen.getByTestId('error-container')
      expect(container.className).toContain('bg-orion-bg')
    })

    it('ERR-UNIT-006: Container uses design system text color', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      const container = screen.getByTestId('error-container')
      expect(container.className).toContain('text-orion-fg')
    })

    it('ERR-UNIT-007: Heading uses serif font (Playfair Display)', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      const heading = screen.getByText('Something went wrong')
      expect(heading.className).toContain('font-serif')
    })

    it('ERR-UNIT-008: Heading uses display size (32px)', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      const heading = screen.getByText('Something went wrong')
      expect(heading.className).toContain('text-display')
    })

    it('ERR-UNIT-009: Error message uses muted text color', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      const message = screen.getByText('Test error message')
      expect(message.className).toContain('text-orion-fg-muted')
    })

    it('ERR-UNIT-010: Button has correct styling', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      const button = screen.getByRole('button', { name: /try again/i })
      // Should have inverted colors (dark bg with light text)
      expect(button.className).toContain('bg-orion-fg')
      expect(button.className).toContain('text-orion-bg')
    })

    it('ERR-UNIT-011: Button has gold hover state', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      const button = screen.getByRole('button', { name: /try again/i })
      expect(button.className).toContain('hover:bg-orion-gold')
    })

    it('ERR-UNIT-012: Button has sharp corners (no border-radius)', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      const button = screen.getByRole('button', { name: /try again/i })
      // Global CSS enforces border-radius: 0 !important, so we just check no rounded class
      expect(button.className).not.toMatch(/rounded-lg|rounded-md|rounded-xl/)
    })

    it('ERR-UNIT-013: Layout is centered vertically and horizontally', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      const container = screen.getByTestId('error-container')
      expect(container.className).toContain('flex')
      expect(container.className).toContain('items-center')
      expect(container.className).toContain('justify-center')
      expect(container.className).toContain('min-h-screen')
    })
  })

  // =============================================================================
  // ERR-UNIT-014: Reset Functionality
  // =============================================================================
  describe('Reset Functionality', () => {
    it('ERR-UNIT-014: Reset function is called when button is clicked', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      const button = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(button)
      expect(mockReset).toHaveBeenCalledTimes(1)
    })
  })

  // =============================================================================
  // ERR-UNIT-015: Error Logging
  // =============================================================================
  describe('Error Logging', () => {
    it('ERR-UNIT-015: Error is logged to console on mount', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      expect(mockConsoleError).toHaveBeenCalledWith(mockError)
    })

    it('ERR-UNIT-016: Error is re-logged when error prop changes', () => {
      const { rerender } = render(<ErrorBoundary error={mockError} reset={mockReset} />)
      expect(mockConsoleError).toHaveBeenCalledTimes(1)

      const newError = createTestError('New error message')
      rerender(<ErrorBoundary error={newError} reset={mockReset} />)
      expect(mockConsoleError).toHaveBeenCalledWith(newError)
    })
  })

  // =============================================================================
  // ERR-UNIT-017: Accessibility
  // =============================================================================
  describe('Accessibility', () => {
    it('ERR-UNIT-017: Heading has correct semantic level', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Something went wrong')
    })

    it('ERR-UNIT-018: Button is keyboard accessible', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      const button = screen.getByRole('button', { name: /try again/i })
      expect(button).toBeEnabled()
      expect(button.tagName).toBe('BUTTON')
    })

    it('ERR-UNIT-019: Button has focus-visible styling', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      const button = screen.getByRole('button', { name: /try again/i })
      expect(button.className).toContain('focus-visible:outline')
    })

    it('ERR-UNIT-020: Error boundary has proper role for screen readers', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      const container = screen.getByRole('alert')
      expect(container).toBeInTheDocument()
    })
  })

  // =============================================================================
  // ERR-UNIT-021: Error with digest (Next.js specific)
  // =============================================================================
  describe('Error with Digest', () => {
    it('ERR-UNIT-021: Handles error with digest property', () => {
      const errorWithDigest = createTestError('Server error')
      errorWithDigest.digest = 'abc123'
      render(<ErrorBoundary error={errorWithDigest} reset={mockReset} />)
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })

  // =============================================================================
  // ERR-UNIT-022: Transitions
  // =============================================================================
  describe('Transitions', () => {
    it('ERR-UNIT-022: Button has transition for smooth state changes', () => {
      render(<ErrorBoundary error={mockError} reset={mockReset} />)
      const button = screen.getByRole('button', { name: /try again/i })
      expect(button.className).toContain('transition')
    })
  })
})
