/**
 * AppShell Component Tests
 * Story 1.4 + Story 1.5: Layout Structure
 *
 * Test IDs: 1.4-UNIT-040 through 1.4-UNIT-050
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppShell } from '@/components/layout/AppShell'

describe('AppShell Component', () => {
  describe('Layout structure', () => {
    it('1.4-UNIT-041: should have flex layout', () => {
      render(<AppShell />)
      const shell = screen.getByTestId('app-shell')
      expect(shell).toHaveClass('flex')
    })

    it('1.4-UNIT-042: should have full screen height', () => {
      render(<AppShell />)
      const shell = screen.getByTestId('app-shell')
      expect(shell).toHaveClass('h-screen')
    })

    it('1.4-UNIT-043: should use bg-orion-bg background', () => {
      render(<AppShell />)
      const shell = screen.getByTestId('app-shell')
      expect(shell).toHaveClass('bg-orion-bg')
    })

    it('1.4-UNIT-044: should include Sidebar component', () => {
      render(<AppShell />)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toBeInTheDocument()
    })

    it('1.4-UNIT-045: should render main content area', () => {
      render(<AppShell />)
      // ChatColumn uses <main> with role="region" for the chat area
      const main = screen.getByRole('main', { name: 'Chat conversation' })
      expect(main).toBeInTheDocument()
      expect(main.tagName.toLowerCase()).toBe('main')
    })

    it('1.4-UNIT-046: main area should have flex-1 to fill remaining space', () => {
      render(<AppShell />)
      const main = screen.getByRole('main', { name: 'Chat conversation' })
      expect(main).toHaveClass('flex-1')
    })

    it('1.4-UNIT-047: main area should have flex column layout', () => {
      render(<AppShell />)
      const main = screen.getByRole('main', { name: 'Chat conversation' })
      expect(main).toHaveClass('flex')
      expect(main).toHaveClass('flex-col')
    })
  })

  describe('Sidebar placement', () => {
    it('1.4-UNIT-049: sidebar should be first child (left side)', () => {
      render(<AppShell />)
      const shell = screen.getByTestId('app-shell')
      const firstChild = shell.firstElementChild
      expect(firstChild).toHaveAttribute('data-testid', 'sidebar')
    })
  })

  describe('Story 1.5 integration: ChatColumn', () => {
    it('1.5-INT-001a: should render ChatColumn as sibling to Sidebar', () => {
      render(<AppShell />)
      // Story 1.17: Sidebar now uses <nav aria-label="Main navigation"> for navigation landmark
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
      // ChatColumn exists as main content
      expect(screen.getByRole('main', { name: 'Chat conversation' })).toBeInTheDocument()
    })

    it('1.5-INT-001b: should position ChatColumn after Sidebar in flex container', () => {
      render(<AppShell />)
      const sidebar = screen.getByTestId('sidebar')
      const chatColumn = screen.getByRole('main', { name: 'Chat conversation' })
      // ChatColumn is wrapped in a flex container div, so it's nested one level deeper
      // Verify the structure: app-shell > [sidebar, wrapper > chatColumn]
      const appShell = screen.getByTestId('app-shell')
      expect(sidebar.parentElement).toBe(appShell)
      // ChatColumn's parent should be the main content wrapper
      expect(chatColumn.parentElement?.parentElement).toBe(appShell)
    })

    it('should render ChatColumn with ChatInput', () => {
      render(<AppShell />)
      const chatInput = screen.getByRole('textbox', { name: 'Chat input' })
      expect(chatInput).toBeInTheDocument()
    })

    it('should render ChatColumn with MessageArea', () => {
      render(<AppShell />)
      const messageArea = screen.getByTestId('message-area')
      expect(messageArea).toBeInTheDocument()
    })
  })
})
