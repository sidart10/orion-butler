/**
 * ChatHeader Component Tests
 * Phase 1: UI Design Template Match - Chat Header
 *
 * Test IDs: CHATHEADER-UNIT-001 through CHATHEADER-UNIT-010
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatHeader } from '@/components/chat/ChatHeader'

describe('ChatHeader Component', () => {
  describe('Layout and Structure', () => {
    it('CHATHEADER-UNIT-001: should render as header element', () => {
      render(<ChatHeader title="Test Title" />)
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
    })

    it('CHATHEADER-UNIT-002: should have 80px height', () => {
      render(<ChatHeader title="Test Title" />)
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('h-header')
    })

    it('CHATHEADER-UNIT-003: should have cream background with transparency', () => {
      render(<ChatHeader title="Test Title" />)
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('bg-orion-bg/50')
    })

    it('CHATHEADER-UNIT-004: should have bottom border', () => {
      render(<ChatHeader title="Test Title" />)
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('border-b')
      expect(header).toHaveClass('border-orion-bg')
    })

    it('CHATHEADER-UNIT-005: should not shrink (shrink-0)', () => {
      render(<ChatHeader title="Test Title" />)
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('shrink-0')
    })

    it('CHATHEADER-UNIT-006: should have flex layout with space between', () => {
      render(<ChatHeader title="Test Title" />)
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('flex', 'items-center', 'justify-between')
    })
  })

  describe('Title Display', () => {
    it('CHATHEADER-UNIT-007: should display the provided title', () => {
      render(<ChatHeader title="Email to Sarah" />)
      const heading = screen.getByRole('heading', { name: 'Email to Sarah' })
      expect(heading).toBeInTheDocument()
    })

    it('CHATHEADER-UNIT-008: should have luxury tracking and small-caps on title', () => {
      render(<ChatHeader title="Test Title" />)
      const heading = screen.getByRole('heading')
      expect(heading).toHaveClass('tracking-luxury')
      expect(heading).toHaveClass('small-caps')
    })

    it('CHATHEADER-UNIT-009: should have 14px font size on title', () => {
      render(<ChatHeader title="Test Title" />)
      const heading = screen.getByRole('heading')
      expect(heading).toHaveClass('text-sm')
    })
  })

  describe('Search Button', () => {
    it('CHATHEADER-UNIT-010: should have search button', () => {
      render(<ChatHeader title="Test Title" />)
      const searchButton = screen.getByRole('button', { name: /search/i })
      expect(searchButton).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have heading level 2', () => {
      render(<ChatHeader title="Test Title" />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
    })
  })
})
