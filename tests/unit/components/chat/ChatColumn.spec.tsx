/**
 * ChatColumn Component Tests
 * Story 1.5: Main Chat Column
 *
 * Test IDs: 1.5-UNIT-001 through 1.5-UNIT-009
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatColumn } from '@/components/chat/ChatColumn'

// Mock streaming machine for tests
const mockStreamingMachine = {
  messages: [],
  isStreaming: false,
  isSending: false,
  error: null,
  send: vi.fn(),
  cancel: vi.fn(),
  reset: vi.fn(),
  retry: vi.fn(),
  stateValue: 'idle' as const,
  toolUses: [],
  session: null,
  budgetWarning: false,
  currentThinking: '',
}

describe('ChatColumn Component', () => {
  describe('AC#1: Center column fills remaining space (flex-1)', () => {
    it('1.5-UNIT-001a: should render with flex-1 for flexible width', () => {
      render(<ChatColumn streamingMachine={mockStreamingMachine} />)
      const chatColumn = screen.getByRole('main', { name: 'Chat conversation' })
      expect(chatColumn).toHaveClass('flex-1')
    })

    it('1.5-UNIT-001b: should render as main semantic element', () => {
      render(<ChatColumn streamingMachine={mockStreamingMachine} />)
      // Story 1.17: ChatColumn uses <main> with aria-label for accessibility
      const chatColumn = screen.getByRole('main', { name: 'Chat conversation' })
      expect(chatColumn.tagName.toLowerCase()).toBe('main')
    })
  })

  describe('AC#4: Chat area has minimum width of 400px', () => {
    it('1.5-UNIT-001c: should have min-width of 400px', () => {
      render(<ChatColumn streamingMachine={mockStreamingMachine} />)
      const chatColumn = screen.getByRole('main', { name: 'Chat conversation' })
      expect(chatColumn).toHaveClass('min-w-[400px]')
    })
  })

  describe('AC#1: Flex column layout for internal structure', () => {
    it('1.5-UNIT-002a: should have flex column layout for children', () => {
      render(<ChatColumn streamingMachine={mockStreamingMachine} />)
      const chatColumn = screen.getByRole('main', { name: 'Chat conversation' })
      expect(chatColumn).toHaveClass('flex', 'flex-col')
    })

    it('1.5-UNIT-002b: should fill container height', () => {
      render(<ChatColumn streamingMachine={mockStreamingMachine} />)
      const chatColumn = screen.getByRole('main', { name: 'Chat conversation' })
      expect(chatColumn).toHaveClass('h-full')
    })
  })

  describe('Design system tokens', () => {
    it('1.5-UNIT-009: should use white background (per design template)', () => {
      // Design template (chat-full-flow-final.html line 114):
      // <main class="chat-area flex-1 bg-white...">
      render(<ChatColumn streamingMachine={mockStreamingMachine} />)
      const chatColumn = screen.getByRole('main', { name: 'Chat conversation' })
      expect(chatColumn).toHaveClass('bg-white')
    })
  })

  describe('Internal composition', () => {
    it('should render ChatHeader child (Phase 1 UI Design Match)', () => {
      render(<ChatColumn streamingMachine={mockStreamingMachine} />)
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
    })

    it('should render MessageArea child', () => {
      render(<ChatColumn streamingMachine={mockStreamingMachine} />)
      const messageArea = screen.getByTestId('message-area')
      expect(messageArea).toBeInTheDocument()
    })

    it('should render ChatInput child', () => {
      render(<ChatColumn streamingMachine={mockStreamingMachine} />)
      const chatInput = screen.getByRole('textbox', { name: 'Chat input' })
      expect(chatInput).toBeInTheDocument()
    })
  })
})
