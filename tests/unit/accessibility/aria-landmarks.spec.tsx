/**
 * ARIA Landmarks Tests
 * Story 1.17: Accessibility Foundation - ARIA Landmarks
 *
 * Test IDs: 1.17-UNIT-030 through 1.17-UNIT-039
 *
 * Requirements:
 * - <nav aria-label="Main navigation"> for sidebar
 * - <main aria-label="Chat conversation"> for chat
 * - <aside aria-label="Canvas panel"> for canvas
 */

import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppShell } from '@/components/layout/AppShell'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { ChatColumn } from '@/components/chat/ChatColumn'
import { CanvasColumn } from '@/components/canvas/CanvasColumn'

// Mock streaming machine for ChatColumn tests
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
  retryAttempt: 0,
  saveError: null, // Issue #7: Track save failures
  clearSaveError: vi.fn(), // Issue #7: Clear save error state
}

// Mock window.matchMedia for responsive hooks (desktop breakpoint)
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

// Mock stores to control state
vi.mock('@/stores/canvasStore', () => ({
  useCanvasStore: vi.fn((selector) => {
    const state = {
      isCanvasOpen: true,
      closeCanvas: vi.fn(),
    }
    return selector(state)
  }),
}))

describe('Story 1.17: ARIA Landmarks', () => {
  describe('AppShell landmarks integration', () => {
    it('1.17-UNIT-030: should have nav landmark with "Main navigation" label', () => {
      render(<AppShell />)
      const nav = screen.getByRole('navigation', { name: 'Main navigation' })
      expect(nav).toBeInTheDocument()
    })

    it('1.17-UNIT-031: should have main landmark with "Chat conversation" label', () => {
      render(<AppShell />)
      const main = screen.getByRole('main', { name: 'Chat conversation' })
      expect(main).toBeInTheDocument()
    })

    it('1.17-UNIT-032: should have complementary landmark with "Canvas panel" label', () => {
      render(<AppShell />)
      const aside = screen.getByRole('complementary', { name: 'Canvas panel' })
      expect(aside).toBeInTheDocument()
    })
  })

  describe('Sidebar navigation landmark', () => {
    it('1.17-UNIT-033: Sidebar should use nav element with aria-label', () => {
      render(<Sidebar />)
      const nav = screen.getByRole('navigation', { name: 'Main navigation' })
      expect(nav).toBeInTheDocument()
      expect(nav.tagName.toLowerCase()).toBe('nav')
    })

    it('1.17-UNIT-034: Sidebar overlay mode should have aria-label "Main navigation"', () => {
      render(<Sidebar isOverlay={true} isOverlayOpen={true} />)
      const nav = screen.getByRole('navigation', { name: 'Main navigation' })
      expect(nav).toBeInTheDocument()
    })

    it('1.17-UNIT-035: Sidebar collapsed mode should maintain aria-label', () => {
      render(<Sidebar isCollapsed={true} />)
      const nav = screen.getByRole('navigation', { name: 'Main navigation' })
      expect(nav).toBeInTheDocument()
    })
  })

  describe('ChatColumn main landmark', () => {
    it('1.17-UNIT-036: ChatColumn should use main element', () => {
      render(<ChatColumn streamingMachine={mockStreamingMachine} />)
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
      expect(main.tagName.toLowerCase()).toBe('main')
    })

    it('1.17-UNIT-037: ChatColumn should have aria-label "Chat conversation"', () => {
      render(<ChatColumn streamingMachine={mockStreamingMachine} />)
      const main = screen.getByRole('main', { name: 'Chat conversation' })
      expect(main).toBeInTheDocument()
    })
  })

  describe('CanvasColumn complementary landmark', () => {
    it('1.17-UNIT-038: CanvasColumn should use aside element', () => {
      render(<CanvasColumn />)
      const aside = screen.getByRole('complementary')
      expect(aside).toBeInTheDocument()
      expect(aside.tagName.toLowerCase()).toBe('aside')
    })

    it('1.17-UNIT-039: CanvasColumn should have aria-label "Canvas panel"', () => {
      render(<CanvasColumn />)
      const aside = screen.getByRole('complementary', { name: 'Canvas panel' })
      expect(aside).toBeInTheDocument()
    })
  })
})
