/**
 * MessageArea Component Tests
 * Story 1.5: Main Chat Column
 *
 * Test IDs: 1.5-UNIT-003, 1.5-UNIT-004, 1.5-UNIT-011
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MessageArea } from '@/components/chat/MessageArea'

describe('MessageArea Component', () => {
  describe('AC#2: Scrollable message area', () => {
    it('1.5-UNIT-003a: should render with flex-1 for flexible height', () => {
      render(<MessageArea />)
      const messageArea = screen.getByTestId('message-area')
      expect(messageArea).toHaveClass('flex-1')
    })

    it('1.5-UNIT-003b: should enable vertical scrolling', () => {
      render(<MessageArea />)
      const messageArea = screen.getByTestId('message-area')
      expect(messageArea).toHaveClass('overflow-y-auto')
    })

    it('1.5-UNIT-003c: should render aria-live region for screen readers', () => {
      render(<MessageArea />)
      const messageArea = screen.getByTestId('message-area')
      expect(messageArea).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('AC#2: Empty state placeholder', () => {
    it('1.5-UNIT-004a: should display empty state placeholder when showDemo is false', () => {
      render(<MessageArea showDemo={false} />)
      expect(screen.getByText('Start a conversation...')).toBeVisible()
    })

    it('1.5-UNIT-004b: should center empty state vertically', () => {
      render(<MessageArea showDemo={false} />)
      const emptyStateContainer = screen.getByTestId('empty-state-container')
      expect(emptyStateContainer).toHaveClass('flex', 'items-center', 'justify-center')
    })

    it('1.5-UNIT-004c: should use muted text color for placeholder', () => {
      render(<MessageArea showDemo={false} />)
      const placeholder = screen.getByText('Start a conversation...')
      expect(placeholder).toHaveClass('text-orion-fg-muted')
    })
  })

  describe('Phase 2: Demo conversation', () => {
    it('should display demo conversation when showDemo is true (default)', () => {
      render(<MessageArea />)
      expect(screen.getByTestId('user-message')).toBeInTheDocument()
      expect(screen.getByTestId('agent-message')).toBeInTheDocument()
    })

    it('should show activity bar in demo', () => {
      render(<MessageArea />)
      expect(screen.getByTestId('activity-bar')).toBeInTheDocument()
    })

    it('should show artifact card in demo', () => {
      render(<MessageArea />)
      expect(screen.getByTestId('artifact-card')).toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('1.5-UNIT-011a: should not throw on rapid re-renders', () => {
      const { rerender } = render(<MessageArea />)

      // Simulate rapid re-renders
      for (let i = 0; i < 10; i++) {
        rerender(<MessageArea key={i} />)
      }

      // No error thrown = pass
      expect(screen.getByTestId('message-area')).toBeInTheDocument()
    })
  })
})
