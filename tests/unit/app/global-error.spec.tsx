/**
 * Global Error Boundary Unit Tests
 *
 * Story 1.X: Error Boundaries for graceful error handling
 * Tests cover the global-error.tsx App Router error boundary component
 * for root layout errors.
 *
 * Test ID Convention: GERR-UNIT-{SEQ}
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GlobalErrorBoundary from '@/app/global-error'

// Mock console.error to prevent test output noise
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('Global Error Boundary Component', () => {
  const mockReset = vi.fn()
  const createTestError = (message: string) => {
    const err = new globalThis.Error(message)
    return err as globalThis.Error & { digest?: string }
  }
  const mockError = createTestError('Test global error message')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =============================================================================
  // GERR-UNIT-001: Basic Rendering
  // =============================================================================
  describe('Rendering', () => {
    it('GERR-UNIT-001: Global error boundary renders without crashing', () => {
      render(<GlobalErrorBoundary error={mockError} reset={mockReset} />)
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('GERR-UNIT-002: Global error boundary displays error message', () => {
      render(<GlobalErrorBoundary error={mockError} reset={mockReset} />)
      expect(screen.getByText('Test global error message')).toBeInTheDocument()
    })

    it('GERR-UNIT-003: Global error boundary displays fallback for empty message', () => {
      const errorWithoutMessage = createTestError('')
      render(<GlobalErrorBoundary error={errorWithoutMessage} reset={mockReset} />)
      expect(screen.getByText('A critical error occurred. Please try again.')).toBeInTheDocument()
    })

    it('GERR-UNIT-004: Global error boundary renders try again button', () => {
      render(<GlobalErrorBoundary error={mockError} reset={mockReset} />)
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })
  })

  // =============================================================================
  // GERR-UNIT-005: HTML Structure (required for global-error)
  // Note: In jsdom, html/body tags from JSX are processed differently,
  // so we test the structure indirectly
  // =============================================================================
  describe('HTML Structure', () => {
    it('GERR-UNIT-005: Renders error container with testid', () => {
      render(<GlobalErrorBoundary error={mockError} reset={mockReset} />)
      // The global error container should be present
      expect(screen.getByTestId('global-error-container')).toBeInTheDocument()
    })

    it('GERR-UNIT-006: Container has correct class name', () => {
      render(<GlobalErrorBoundary error={mockError} reset={mockReset} />)
      const container = screen.getByTestId('global-error-container')
      expect(container.className).toContain('global-error-container')
    })
  })

  // =============================================================================
  // GERR-UNIT-007: Reset Functionality
  // =============================================================================
  describe('Reset Functionality', () => {
    it('GERR-UNIT-007: Reset function is called when button is clicked', () => {
      render(<GlobalErrorBoundary error={mockError} reset={mockReset} />)
      const button = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(button)
      expect(mockReset).toHaveBeenCalledTimes(1)
    })
  })

  // =============================================================================
  // GERR-UNIT-008: Error Logging
  // =============================================================================
  describe('Error Logging', () => {
    it('GERR-UNIT-008: Error is logged to console on mount', () => {
      render(<GlobalErrorBoundary error={mockError} reset={mockReset} />)
      expect(mockConsoleError).toHaveBeenCalledWith(mockError)
    })
  })

  // =============================================================================
  // GERR-UNIT-009: Accessibility
  // =============================================================================
  describe('Accessibility', () => {
    it('GERR-UNIT-009: Heading has correct semantic level', () => {
      render(<GlobalErrorBoundary error={mockError} reset={mockReset} />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Something went wrong')
    })

    it('GERR-UNIT-010: Button is keyboard accessible', () => {
      render(<GlobalErrorBoundary error={mockError} reset={mockReset} />)
      const button = screen.getByRole('button', { name: /try again/i })
      expect(button).toBeEnabled()
      expect(button.tagName).toBe('BUTTON')
    })

    it('GERR-UNIT-011: Has alert role for screen readers', () => {
      render(<GlobalErrorBoundary error={mockError} reset={mockReset} />)
      const container = screen.getByRole('alert')
      expect(container).toBeInTheDocument()
    })
  })

  // =============================================================================
  // GERR-UNIT-012: Component includes design system styles
  // Note: Inline styles in head are processed differently by jsdom
  // =============================================================================
  describe('Component Styling', () => {
    it('GERR-UNIT-012: Elements have expected class names for styling', () => {
      render(<GlobalErrorBoundary error={mockError} reset={mockReset} />)
      const heading = screen.getByText('Something went wrong')
      expect(heading.className).toContain('global-error-heading')
    })

    it('GERR-UNIT-013: Message has expected class name', () => {
      render(<GlobalErrorBoundary error={mockError} reset={mockReset} />)
      const message = screen.getByText('Test global error message')
      expect(message.className).toContain('global-error-message')
    })

    it('GERR-UNIT-014: Button has expected class name', () => {
      render(<GlobalErrorBoundary error={mockError} reset={mockReset} />)
      const button = screen.getByRole('button', { name: /try again/i })
      expect(button.className).toContain('global-error-button')
    })
  })
})
