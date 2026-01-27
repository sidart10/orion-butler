/**
 * ContextSidebar Component Tests
 * Phase 1: UI Design Template Match - Right Context Sidebar
 *
 * Test IDs: CONTEXT-UNIT-001 through CONTEXT-UNIT-012
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ContextSidebar } from '@/components/context/ContextSidebar'

describe('ContextSidebar Component', () => {
  describe('Layout and Structure', () => {
    it('CONTEXT-UNIT-001: should render as aside element', () => {
      render(<ContextSidebar />)
      const sidebar = screen.getByRole('complementary')
      expect(sidebar).toBeInTheDocument()
    })

    it('CONTEXT-UNIT-002: should have fixed width of 320px', () => {
      render(<ContextSidebar />)
      const sidebar = screen.getByRole('complementary')
      expect(sidebar).toHaveClass('w-context')
    })

    it('CONTEXT-UNIT-003: should have cream background', () => {
      render(<ContextSidebar />)
      const sidebar = screen.getByRole('complementary')
      expect(sidebar).toHaveClass('bg-orion-bg')
    })

    it('CONTEXT-UNIT-004: should have left border with gold tint', () => {
      render(<ContextSidebar />)
      const sidebar = screen.getByRole('complementary')
      expect(sidebar).toHaveClass('border-l')
      expect(sidebar).toHaveClass('border-orion-gold/20')
    })

    it('CONTEXT-UNIT-005: should have flex column layout', () => {
      render(<ContextSidebar />)
      const sidebar = screen.getByRole('complementary')
      expect(sidebar).toHaveClass('flex', 'flex-col')
    })

    it('CONTEXT-UNIT-006: should not shrink (shrink-0)', () => {
      render(<ContextSidebar />)
      const sidebar = screen.getByRole('complementary')
      expect(sidebar).toHaveClass('shrink-0')
    })
  })

  describe('Header Section', () => {
    it('CONTEXT-UNIT-007: should have header with 80px height', () => {
      render(<ContextSidebar />)
      const header = screen.getByTestId('context-sidebar-header')
      expect(header).toHaveClass('h-header')
    })

    it('CONTEXT-UNIT-008: should display "context" heading with luxury tracking', () => {
      render(<ContextSidebar />)
      const heading = screen.getByRole('heading', { name: /context/i })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveClass('tracking-luxury')
      expect(heading).toHaveClass('small-caps')
    })
  })

  describe('Empty State (UI Cleanup)', () => {
    it('CONTEXT-UNIT-009: should show empty state message', () => {
      render(<ContextSidebar />)
      const emptyMessage = screen.getByText(/no files or tools in context/i)
      expect(emptyMessage).toBeInTheDocument()
    })

    it('CONTEXT-UNIT-010: should not have project folder section (demo data removed)', () => {
      render(<ContextSidebar />)
      const section = screen.queryByTestId('context-project-folder')
      expect(section).not.toBeInTheDocument()
    })

    it('CONTEXT-UNIT-011: should not have tools section (demo data removed)', () => {
      render(<ContextSidebar />)
      const section = screen.queryByTestId('context-tools')
      expect(section).not.toBeInTheDocument()
    })

    it('CONTEXT-UNIT-012: empty message should use muted text color', () => {
      render(<ContextSidebar />)
      const emptyMessage = screen.getByText(/no files or tools in context/i)
      expect(emptyMessage).toHaveClass('text-orion-fg-muted')
    })
  })

  describe('Accessibility', () => {
    it('should have accessible name for complementary region', () => {
      render(<ContextSidebar />)
      const sidebar = screen.getByRole('complementary', { name: /context/i })
      expect(sidebar).toBeInTheDocument()
    })
  })
})
