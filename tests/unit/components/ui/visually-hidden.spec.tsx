/**
 * VisuallyHidden Component Unit Tests
 *
 * Story 1.17: Accessibility Utilities
 * Tests for screen reader only content component
 *
 * Test ID Convention: 1.17-UNIT-{SEQ}
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VisuallyHidden } from '@/components/ui/visually-hidden'

// =============================================================================
// 1.1 Rendering Tests
// =============================================================================

describe('VisuallyHidden Rendering', () => {
  // 1.17-UNIT-001: Content is rendered in the DOM
  it('1.17-UNIT-001: Content is rendered in the DOM', () => {
    render(<VisuallyHidden>Screen reader only text</VisuallyHidden>)
    // The text should exist in the DOM
    expect(screen.getByText('Screen reader only text')).toBeInTheDocument()
  })

  // 1.17-UNIT-002: Children are passed through correctly
  it('1.17-UNIT-002: Children are passed through correctly', () => {
    render(
      <VisuallyHidden>
        <span data-testid="child">Child element</span>
      </VisuallyHidden>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByTestId('child')).toHaveTextContent('Child element')
  })

  // 1.17-UNIT-003: Multiple children are supported
  it('1.17-UNIT-003: Multiple children are supported', () => {
    render(
      <VisuallyHidden>
        <span data-testid="first">First</span>
        <span data-testid="second">Second</span>
      </VisuallyHidden>
    )
    expect(screen.getByTestId('first')).toBeInTheDocument()
    expect(screen.getByTestId('second')).toBeInTheDocument()
  })
})

// =============================================================================
// 1.2 Styling Tests (sr-only class)
// =============================================================================

describe('VisuallyHidden Styling', () => {
  // 1.17-UNIT-004: sr-only class is applied for visual hiding
  it('1.17-UNIT-004: sr-only class is applied for visual hiding', () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>)
    const element = screen.getByText('Hidden text')
    expect(element).toHaveClass('sr-only')
  })

  // 1.17-UNIT-005: Renders as a span element
  it('1.17-UNIT-005: Renders as a span element', () => {
    render(<VisuallyHidden>Span test</VisuallyHidden>)
    const element = screen.getByText('Span test')
    expect(element.tagName).toBe('SPAN')
  })
})

// =============================================================================
// 1.3 Accessibility Tests
// =============================================================================

describe('VisuallyHidden Accessibility', () => {
  // 1.17-UNIT-006: Content is accessible to screen readers
  it('1.17-UNIT-006: Content is accessible via accessible name', () => {
    render(
      <button>
        <VisuallyHidden>Close dialog</VisuallyHidden>
        {' '}X
      </button>
    )
    // Screen reader will announce "Close dialog X"
    const button = screen.getByRole('button')
    expect(button).toHaveAccessibleName('Close dialog X')
  })

  // 1.17-UNIT-007: Works with icon buttons for aria labeling
  it('1.17-UNIT-007: Works with icon buttons for aria labeling', () => {
    render(
      <button>
        <VisuallyHidden>Search</VisuallyHidden>
        <svg aria-hidden="true" data-testid="search-icon" />
      </button>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAccessibleName('Search')
  })
})

// =============================================================================
// 1.4 Props Passthrough Tests
// =============================================================================

describe('VisuallyHidden Props', () => {
  // 1.17-UNIT-008: Additional className can be merged
  it('1.17-UNIT-008: Additional className can be merged', () => {
    render(<VisuallyHidden className="custom-class">Text</VisuallyHidden>)
    const element = screen.getByText('Text')
    expect(element).toHaveClass('sr-only')
    expect(element).toHaveClass('custom-class')
  })

  // 1.17-UNIT-009: Other props pass through
  it('1.17-UNIT-009: Other props pass through', () => {
    render(
      <VisuallyHidden data-testid="hidden-element" id="my-hidden">
        Props test
      </VisuallyHidden>
    )
    const element = screen.getByTestId('hidden-element')
    expect(element).toHaveAttribute('id', 'my-hidden')
  })
})

// =============================================================================
// 1.5 Display Name Test
// =============================================================================

describe('VisuallyHidden DisplayName', () => {
  it('VisuallyHidden has displayName for debugging', () => {
    expect(VisuallyHidden.displayName).toBe('VisuallyHidden')
  })
})
