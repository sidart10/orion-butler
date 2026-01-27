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

  describe('Project Folder Section', () => {
    it('CONTEXT-UNIT-009: should have project folder section', () => {
      render(<ContextSidebar />)
      const section = screen.getByTestId('context-project-folder')
      expect(section).toBeInTheDocument()
    })

    it('CONTEXT-UNIT-010: should display "project folder" section heading', () => {
      render(<ContextSidebar />)
      const heading = screen.getByText(/project folder/i)
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveClass('small-caps')
    })
  })

  describe('Tools Section', () => {
    it('CONTEXT-UNIT-011: should have tools section', () => {
      render(<ContextSidebar />)
      const section = screen.getByTestId('context-tools')
      expect(section).toBeInTheDocument()
    })

    it('CONTEXT-UNIT-012: should display "tools" section heading', () => {
      render(<ContextSidebar />)
      const heading = screen.getByText(/^tools$/i)
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveClass('small-caps')
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
