/**
 * UserMessage Component Tests
 * Phase 2: Message Rendering
 *
 * Test IDs: USERMSG-UNIT-001 through USERMSG-UNIT-006
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UserMessage } from '@/components/chat/UserMessage'

describe('UserMessage Component', () => {
  describe('Layout and Structure', () => {
    it('USERMSG-UNIT-001: should render with right alignment (justify-end)', () => {
      render(<UserMessage content="Test message" />)
      const container = screen.getByTestId('user-message')
      expect(container).toHaveClass('flex', 'justify-end')
    })

    it('USERMSG-UNIT-002: should have dark brown background (#3D3831)', () => {
      render(<UserMessage content="Test message" />)
      const bubble = screen.getByTestId('user-message-bubble')
      expect(bubble).toHaveClass('bg-orion-user-bubble')
    })

    it('USERMSG-UNIT-003: should have white text', () => {
      render(<UserMessage content="Test message" />)
      const bubble = screen.getByTestId('user-message-bubble')
      expect(bubble).toHaveClass('text-white')
    })

    it('USERMSG-UNIT-004: should have correct padding (px-5 py-3.5)', () => {
      render(<UserMessage content="Test message" />)
      const bubble = screen.getByTestId('user-message-bubble')
      expect(bubble).toHaveClass('px-5', 'py-3.5')
    })

    it('USERMSG-UNIT-005: should constrain width to 85%', () => {
      render(<UserMessage content="Test message" />)
      const bubble = screen.getByTestId('user-message-bubble')
      expect(bubble).toHaveClass('max-w-[85%]')
    })
  })

  describe('Content Display', () => {
    it('USERMSG-UNIT-006: should display the provided content', () => {
      render(<UserMessage content="Draft an email to Sarah about the Q4 roadmap" />)
      expect(screen.getByText('Draft an email to Sarah about the Q4 roadmap')).toBeInTheDocument()
    })

    it('USERMSG-UNIT-007: should have 14px font size with relaxed leading', () => {
      render(<UserMessage content="Test message" />)
      const paragraph = screen.getByText('Test message')
      expect(paragraph).toHaveClass('text-[14px]', 'leading-relaxed')
    })
  })

  describe('Accessibility', () => {
    it('USERMSG-UNIT-008: should have article role for semantic markup', () => {
      render(<UserMessage content="Test message" />)
      const article = screen.getByRole('article')
      expect(article).toBeInTheDocument()
    })
  })
})
