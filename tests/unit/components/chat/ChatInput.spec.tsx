/**
 * ChatInput Component Tests
 * Story 1.5: Main Chat Column
 *
 * Test IDs: 1.5-UNIT-005 through 1.5-UNIT-007, 1.5-UNIT-010
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatInput } from '@/components/chat/ChatInput'

describe('ChatInput Component', () => {
  describe('AC#3: Fixed input area at bottom', () => {
    it('1.5-UNIT-005a: should render with flex-shrink-0 to prevent compression', () => {
      render(<ChatInput />)
      const inputContainer = screen.getByTestId('chat-input-container')
      expect(inputContainer).toHaveClass('flex-shrink-0')
    })

    it('1.5-UNIT-005b: should render input with placeholder text', () => {
      render(<ChatInput />)
      const input = screen.getByPlaceholderText('Ask Orion...')
      expect(input).toBeInTheDocument()
    })

    it('1.5-UNIT-005c: should have top border', () => {
      render(<ChatInput />)
      const inputContainer = screen.getByTestId('chat-input-container')
      expect(inputContainer).toHaveClass('border-t', 'border-orion-border')
    })
  })

  describe('AC#3: Editorial Luxury styling', () => {
    it('1.5-UNIT-006a: should have 0px border-radius (Editorial Luxury)', () => {
      render(<ChatInput />)
      const input = screen.getByRole('textbox', { name: 'Chat input' })
      expect(input).toHaveClass('rounded-none')
    })

    it('1.5-UNIT-006b: should use surface background color', () => {
      render(<ChatInput />)
      const input = screen.getByRole('textbox', { name: 'Chat input' })
      expect(input).toHaveClass('bg-orion-surface')
    })

    it('1.5-UNIT-006c: should use muted color for placeholder text', () => {
      render(<ChatInput />)
      const input = screen.getByRole('textbox', { name: 'Chat input' })
      expect(input).toHaveClass('placeholder:text-orion-fg-muted')
    })
  })

  describe('AC#3 + NFR-5.1: Focus state', () => {
    it('1.5-UNIT-007a: should have gold outline on focus', () => {
      render(<ChatInput />)
      const input = screen.getByRole('textbox', { name: 'Chat input' })
      expect(input).toHaveClass('focus-visible:outline-2', 'focus-visible:outline-orion-gold')
    })

    it('1.5-UNIT-007b: should have 2px outline offset on focus', () => {
      render(<ChatInput />)
      const input = screen.getByRole('textbox', { name: 'Chat input' })
      expect(input).toHaveClass('focus-visible:outline-offset-2')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label for screen readers', () => {
      render(<ChatInput />)
      const input = screen.getByRole('textbox', { name: 'Chat input' })
      expect(input).toHaveAttribute('aria-label', 'Chat input')
    })

    it('should accept text input', async () => {
      const user = userEvent.setup()
      render(<ChatInput />)
      const input = screen.getByRole('textbox', { name: 'Chat input' })

      await user.type(input, 'Hello Orion')
      expect(input).toHaveValue('Hello Orion')
    })

    it('should be focusable via Tab', async () => {
      const user = userEvent.setup()
      render(<ChatInput />)
      const input = screen.getByRole('textbox', { name: 'Chat input' })

      await user.tab()
      expect(input).toHaveFocus()
    })
  })
})
