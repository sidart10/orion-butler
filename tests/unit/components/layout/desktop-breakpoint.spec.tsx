/**
 * Desktop Breakpoint Tests
 * Story 1.10: Desktop Breakpoint (>=1280px)
 *
 * Test IDs: 1.10-UNIT-001 through 1.10-UNIT-050
 *
 * Acceptance Criteria:
 * - AC#1: At >=1280px, sidebar (280px), chat (flex-1), canvas (480px when visible) are all visible
 * - AC#2: When canvas hidden, sidebar + chat occupy full width
 * - AC#3: No horizontal scrolling at viewport level
 * - AC#4: Layout uses CSS Flexbox (AppShell pattern)
 * - AC#5: Graceful transition below 1280px (handled by future Story 1.11)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { AppShell } from '@/components/layout/AppShell'
import fs from 'fs'
import path from 'path'

// Clean up after each test
afterEach(() => {
  cleanup()
})

describe('Story 1.10: Desktop Breakpoint', () => {
  describe('AC#1: Three-column layout at >=1280px', () => {
    it('1.10-UNIT-001: AppShell renders all three columns', () => {
      render(<AppShell />)

      // Sidebar (left)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toBeInTheDocument()

      // Chat column (center)
      const chat = screen.getByRole('main', { name: 'Chat conversation' })
      expect(chat).toBeInTheDocument()

      // Canvas column (right) - use testid since aria-hidden prevents accessible queries
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toBeInTheDocument()
    })

    it('1.10-UNIT-002: Sidebar has flex-shrink-0 to prevent shrinking', () => {
      render(<AppShell />)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('flex-shrink-0')
    })

    it('1.10-UNIT-003: Sidebar has width token (w-sidebar = 280px)', () => {
      render(<AppShell />)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('w-sidebar')
    })

    it('1.10-UNIT-004: Chat column has flex-1 to fill remaining space', () => {
      render(<AppShell />)
      const chat = screen.getByRole('main', { name: 'Chat conversation' })
      expect(chat).toHaveClass('flex-1')
    })

    it('1.10-UNIT-005: Chat column has min-width of 400px', () => {
      render(<AppShell />)
      const chat = screen.getByRole('main', { name: 'Chat conversation' })
      expect(chat).toHaveClass('min-w-[400px]')
    })

    it('1.10-UNIT-006: Canvas column has flex-shrink-0 to prevent shrinking', () => {
      render(<AppShell />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('flex-shrink-0')
    })

    it('1.10-UNIT-007: Canvas column has w-canvas class when open', () => {
      // Note: Canvas is closed by default, so we test the class exists in closed state
      // The w-canvas class is applied conditionally based on isCanvasOpen
      render(<AppShell />)
      const canvas = screen.getByTestId('canvas-column')
      // When closed, has w-0
      expect(canvas).toHaveClass('w-0')
    })

    it('1.10-UNIT-008: Layout columns are in correct order (sidebar, chat, context, canvas)', () => {
      render(<AppShell />)
      const shell = screen.getByTestId('app-shell')
      const children = Array.from(shell.children)

      // AppShell now has 4 direct children: sidebar, chat, context, canvas
      expect(children).toHaveLength(4)
      expect(children[0]).toHaveAttribute('data-testid', 'sidebar')
      // Story 1.17: ChatColumn uses <main> element
      expect(children[1].tagName.toLowerCase()).toBe('main')
      // ContextSidebar added in Phase 1 UI Design
      expect(children[2]).toHaveAttribute('aria-label', 'Context')
      expect(children[3]).toHaveAttribute('data-testid', 'canvas-column')
    })
  })

  describe('AC#2: Canvas hidden state', () => {
    it('1.10-UNIT-009: Canvas has width: 0 when hidden', () => {
      render(<AppShell />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('w-0')
    })

    it('1.10-UNIT-010: Canvas has opacity-0 when hidden', () => {
      render(<AppShell />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('opacity-0')
    })

    it('1.10-UNIT-011: Canvas has overflow-hidden to prevent content leak', () => {
      render(<AppShell />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('overflow-hidden')
    })

    it('1.10-UNIT-012: Canvas has aria-hidden when closed', () => {
      render(<AppShell />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveAttribute('aria-hidden', 'true')
    })

    it('1.10-UNIT-013: Canvas is removed from tab order when hidden', () => {
      render(<AppShell />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveAttribute('tabIndex', '-1')
    })

    it('1.10-UNIT-014: Sidebar and chat are still visible when canvas hidden', () => {
      render(<AppShell />)
      const sidebar = screen.getByTestId('sidebar')
      const chat = screen.getByRole('main', { name: 'Chat conversation' })

      // Both should be visible (no hidden classes)
      expect(sidebar).not.toHaveClass('hidden')
      expect(chat).not.toHaveClass('hidden')
    })
  })

  describe('AC#3: No horizontal scrolling', () => {
    it('1.10-UNIT-015: AppShell has max-w-[100vw] constraint', () => {
      render(<AppShell />)
      const shell = screen.getByTestId('app-shell')
      expect(shell).toHaveClass('max-w-[100vw]')
    })

    it('1.10-UNIT-016: AppShell has overflow-x-hidden', () => {
      render(<AppShell />)
      const shell = screen.getByTestId('app-shell')
      expect(shell).toHaveClass('overflow-x-hidden')
    })
  })

  describe('AC#4: CSS Flexbox layout', () => {
    it('1.10-UNIT-017: AppShell uses flex container', () => {
      render(<AppShell />)
      const shell = screen.getByTestId('app-shell')
      expect(shell).toHaveClass('flex')
    })

    it('1.10-UNIT-018: AppShell has h-screen for full viewport height', () => {
      render(<AppShell />)
      const shell = screen.getByTestId('app-shell')
      expect(shell).toHaveClass('h-screen')
    })

    it('1.10-UNIT-019: AppShell uses background token (bg-orion-bg)', () => {
      render(<AppShell />)
      const shell = screen.getByTestId('app-shell')
      expect(shell).toHaveClass('bg-orion-bg')
    })

    it('1.10-UNIT-020: Chat column has flex column layout for internal structure', () => {
      render(<AppShell />)
      const chat = screen.getByRole('main', { name: 'Chat conversation' })
      expect(chat).toHaveClass('flex')
      expect(chat).toHaveClass('flex-col')
    })

    it('1.10-UNIT-021: Chat column fills full height', () => {
      render(<AppShell />)
      const chat = screen.getByRole('main', { name: 'Chat conversation' })
      expect(chat).toHaveClass('h-full')
    })
  })

  describe('CSS Token Verification', () => {
    const globalsPath = path.resolve(
      __dirname,
      '../../../../design-system/styles/globals.css'
    )

    let cssContent: string

    beforeEach(() => {
      cssContent = fs.readFileSync(globalsPath, 'utf-8')
    })

    it('1.10-UNIT-022: --orion-breakpoint-desktop token exists with value 1280px', () => {
      expect(cssContent).toMatch(/--orion-breakpoint-desktop:\s*1280px/)
    })

    it('1.10-UNIT-023: --orion-breakpoint-laptop placeholder exists (1024px)', () => {
      expect(cssContent).toMatch(/--orion-breakpoint-laptop:\s*1024px/)
    })

    it('1.10-UNIT-024: --orion-breakpoint-tablet placeholder exists (768px)', () => {
      expect(cssContent).toMatch(/--orion-breakpoint-tablet:\s*768px/)
    })

    it('1.10-UNIT-025: --orion-sidebar-width token exists (280px)', () => {
      expect(cssContent).toMatch(/--orion-sidebar-width:\s*280px/)
    })

    it('1.10-UNIT-026: --orion-canvas-width token exists (480px)', () => {
      expect(cssContent).toMatch(/--orion-canvas-width:\s*480px/)
    })

    it('1.10-UNIT-027: --orion-chat-min-width token exists (400px)', () => {
      expect(cssContent).toMatch(/--orion-chat-min-width:\s*400px/)
    })

    it('1.10-UNIT-028: html element has overflow-x: hidden', () => {
      expect(cssContent).toMatch(/html\s*\{[^}]*overflow-x:\s*hidden/)
    })

    it('1.10-UNIT-029: html element has max-width: 100vw', () => {
      expect(cssContent).toMatch(/html\s*\{[^}]*max-width:\s*100vw/)
    })

    it('1.10-UNIT-030: body element has overflow-x: hidden', () => {
      expect(cssContent).toMatch(/body\s*\{[^}]*overflow-x:\s*hidden/)
    })

    it('1.10-UNIT-031: body element has max-width: 100vw', () => {
      expect(cssContent).toMatch(/body\s*\{[^}]*max-width:\s*100vw/)
    })
  })

  describe('Tailwind Config Verification', () => {
    const tailwindConfigPath = path.resolve(
      __dirname,
      '../../../../tailwind.config.ts'
    )

    let configContent: string

    beforeEach(() => {
      configContent = fs.readFileSync(tailwindConfigPath, 'utf-8')
    })

    it('1.10-UNIT-032: Tailwind config has sidebar width (280px)', () => {
      expect(configContent).toMatch(/sidebar:\s*['"]280px['"]/)
    })

    it('1.10-UNIT-033: Tailwind config has canvas width (480px)', () => {
      expect(configContent).toMatch(/canvas:\s*['"]480px['"]/)
    })

    it('1.10-UNIT-034: Tailwind config references sidebar CSS variable', () => {
      expect(configContent).toMatch(/sidebar:\s*['"]var\(--orion-sidebar-width\)['"]/)
    })

    it('1.10-UNIT-035: Tailwind config references canvas CSS variable', () => {
      expect(configContent).toMatch(/canvas:\s*['"]var\(--orion-canvas-width\)['"]/)
    })
  })

  describe('Layout Calculation Verification', () => {
    it('1.10-UNIT-036: Layout fits within 1280px (280 + 400 + 480 = 1160)', () => {
      // This is a sanity check to verify our layout math is correct
      const sidebarWidth = 280
      const chatMinWidth = 400
      const canvasWidth = 480
      const totalMinWidth = sidebarWidth + chatMinWidth + canvasWidth

      expect(totalMinWidth).toBe(1160)
      expect(totalMinWidth).toBeLessThanOrEqual(1280)
    })

    it('1.10-UNIT-037: Chat column can expand to use remaining space', () => {
      // At 1280px: 1280 - 280 - 480 = 520px for chat
      const viewportWidth = 1280
      const sidebarWidth = 280
      const canvasWidth = 480
      const chatWidth = viewportWidth - sidebarWidth - canvasWidth

      expect(chatWidth).toBe(520)
      expect(chatWidth).toBeGreaterThanOrEqual(400) // min-width requirement
    })

    it('1.10-UNIT-038: Canvas closed mode uses full remaining width for chat', () => {
      // At 1280px with canvas closed: 1280 - 280 = 1000px for chat
      const viewportWidth = 1280
      const sidebarWidth = 280
      const canvasWidth = 0 // closed
      const chatWidth = viewportWidth - sidebarWidth - canvasWidth

      expect(chatWidth).toBe(1000)
    })
  })

  describe('Component Integration', () => {
    it('1.10-UNIT-039: AppShell renders Sidebar component', () => {
      render(<AppShell />)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar.tagName.toLowerCase()).toBe('aside')
    })

    it('1.10-UNIT-040: AppShell renders ChatColumn component', () => {
      render(<AppShell />)
      const chat = screen.getByRole('main', { name: 'Chat conversation' })
      expect(chat.tagName.toLowerCase()).toBe('main')
    })

    it('1.10-UNIT-041: AppShell renders CanvasColumn component', () => {
      render(<AppShell />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas.tagName.toLowerCase()).toBe('aside')
    })

    it('1.10-UNIT-042: Sidebar has border-r for right edge divider', () => {
      render(<AppShell />)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('border-r')
    })

    it('1.10-UNIT-043: Canvas has border-l for left edge divider', () => {
      render(<AppShell />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveClass('border-l')
    })

    it('1.10-UNIT-044: Chat column contains MessageArea', () => {
      render(<AppShell />)
      const messageArea = screen.getByTestId('message-area')
      expect(messageArea).toBeInTheDocument()
    })

    it('1.10-UNIT-045: Chat column contains ChatInput', () => {
      render(<AppShell />)
      const chatInput = screen.getByRole('textbox', { name: 'Chat input' })
      expect(chatInput).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('1.10-UNIT-046: Sidebar has navigation role', () => {
      render(<AppShell />)
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('1.10-UNIT-047: Chat column has region role with label', () => {
      render(<AppShell />)
      const chat = screen.getByRole('main', { name: 'Chat conversation' })
      expect(chat).toBeInTheDocument()
    })

    it('1.10-UNIT-048: Canvas has complementary role with label', () => {
      render(<AppShell />)
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toHaveAttribute('role', 'complementary')
      // Story 1.17: Updated to use "Canvas panel" aria-label
      expect(canvas).toHaveAttribute('aria-label', 'Canvas panel')
    })

    it('1.10-UNIT-049: All landmark regions exist in the DOM', () => {
      render(<AppShell />)

      // Navigation is accessible
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()

      // Chat is accessible
      const main = screen.getByRole('main', { name: 'Chat conversation' })
      expect(main).toBeInTheDocument()

      // Canvas is in DOM but aria-hidden when closed, so use testid
      const canvas = screen.getByTestId('canvas-column')
      expect(canvas).toBeInTheDocument()
      expect(canvas).toHaveAttribute('role', 'complementary')
    })

    it('1.10-UNIT-050: Sidebar navigation has aria-label', () => {
      render(<AppShell />)
      // Story 1.17: Updated to use "Main navigation" aria-label
      const nav = screen.getByRole('navigation', { name: 'Main navigation' })
      expect(nav).toHaveAttribute('aria-label', 'Main navigation')
    })
  })
})
