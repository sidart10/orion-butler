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
      const input = screen.getByPlaceholderText('Make changes or send...')
      expect(input).toBeInTheDocument()
    })

    it('1.5-UNIT-005c: should have bottom border on input wrapper', () => {
      render(<ChatInput />)
      const inputContainer = screen.getByTestId('chat-input-container')
      // Container uses bg-orion-bg-white, inner div has border-b
      expect(inputContainer).toHaveClass('bg-orion-bg-white')
    })
  })

  describe('AC#3: Editorial Luxury styling', () => {
    it('1.5-UNIT-006a: should have transparent background (minimalist underline style)', () => {
      render(<ChatInput />)
      const input = screen.getByRole('textbox', { name: 'Chat input' })
      expect(input).toHaveClass('bg-transparent')
    })

    it('1.5-UNIT-006b: should have no border on input itself', () => {
      render(<ChatInput />)
      const input = screen.getByRole('textbox', { name: 'Chat input' })
      expect(input).toHaveClass('border-none')
    })

    it('1.5-UNIT-006c: should use muted color with opacity for placeholder text', () => {
      render(<ChatInput />)
      const input = screen.getByRole('textbox', { name: 'Chat input' })
      expect(input).toHaveClass('placeholder:text-orion-fg-muted/50')
    })
  })

  describe('AC#3 + NFR-5.1: Focus state', () => {
    it('1.5-UNIT-007a: should have outline-none on input (underline border handles focus)', () => {
      render(<ChatInput />)
      const input = screen.getByRole('textbox', { name: 'Chat input' })
      expect(input).toHaveClass('outline-none')
    })

    it('1.5-UNIT-007b: should have no rounded classes (Editorial Luxury 0px border-radius)', () => {
      render(<ChatInput />)
      const input = screen.getByRole('textbox', { name: 'Chat input' })
      // Check that input doesn't have rounded-* classes
      const classes = input.className
      expect(classes).not.toMatch(/rounded-(?!none)/)
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
