/**
 * Backdrop Dark Mode Unit Tests
 * Story 1.13: Dark Mode System Detection - AC#6
 *
 * Tests for Backdrop component dark mode styling.
 * Validates that overlay backdrops render appropriately for dark mode.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Backdrop } from '@/components/layout/Backdrop'

describe('Story 1.13: Backdrop Dark Mode (AC#6)', () => {
  describe('Light mode backdrop opacity', () => {
    it('should have bg-black/50 class for light mode', () => {
      render(<Backdrop visible={true} onClick={() => {}} />)
      const backdrop = screen.getByTestId('backdrop')
      expect(backdrop.className).toContain('bg-black/50')
    })
  })

  describe('Dark mode backdrop opacity', () => {
    it('should have dark:bg-black/70 class for dark mode', () => {
      render(<Backdrop visible={true} onClick={() => {}} />)
      const backdrop = screen.getByTestId('backdrop')
      expect(backdrop.className).toContain('dark:bg-black/70')
    })
  })

  describe('Backdrop visibility states', () => {
    it('should be visible when visible=true', () => {
      render(<Backdrop visible={true} onClick={() => {}} />)
      const backdrop = screen.getByTestId('backdrop')
      expect(backdrop.className).toContain('opacity-100')
      expect(backdrop.className).not.toContain('pointer-events-none')
    })

    it('should be hidden when visible=false', () => {
      render(<Backdrop visible={false} onClick={() => {}} />)
      const backdrop = screen.getByTestId('backdrop')
      expect(backdrop.className).toContain('opacity-0')
      expect(backdrop.className).toContain('pointer-events-none')
    })
  })

  describe('Backdrop transition', () => {
    it('should have transition-opacity for smooth transitions', () => {
      render(<Backdrop visible={true} onClick={() => {}} />)
      const backdrop = screen.getByTestId('backdrop')
      expect(backdrop.className).toContain('transition-opacity')
    })

    it('should have duration-300 for 300ms transition', () => {
      render(<Backdrop visible={true} onClick={() => {}} />)
      const backdrop = screen.getByTestId('backdrop')
      expect(backdrop.className).toContain('duration-300')
    })

    it('should use ease-luxury easing', () => {
      render(<Backdrop visible={true} onClick={() => {}} />)
      const backdrop = screen.getByTestId('backdrop')
      expect(backdrop.className).toContain('ease-luxury')
    })
  })

  describe('Backdrop positioning', () => {
    it('should be fixed position', () => {
      render(<Backdrop visible={true} onClick={() => {}} />)
      const backdrop = screen.getByTestId('backdrop')
      expect(backdrop.className).toContain('fixed')
    })

    it('should cover full viewport with inset-0', () => {
      render(<Backdrop visible={true} onClick={() => {}} />)
      const backdrop = screen.getByTestId('backdrop')
      expect(backdrop.className).toContain('inset-0')
    })
  })

  describe('Backdrop z-index', () => {
    it('should have z-40 by default', () => {
      render(<Backdrop visible={true} onClick={() => {}} />)
      const backdrop = screen.getByTestId('backdrop')
      expect(backdrop.className).toContain('z-40')
    })

    it('should accept z-30 as alternative', () => {
      render(<Backdrop visible={true} onClick={() => {}} zIndex="z-30" />)
      const backdrop = screen.getByTestId('backdrop')
      expect(backdrop.className).toContain('z-30')
    })
  })

  describe('Backdrop accessibility', () => {
    it('should have aria-hidden="true"', () => {
      render(<Backdrop visible={true} onClick={() => {}} />)
      const backdrop = screen.getByTestId('backdrop')
      expect(backdrop.getAttribute('aria-hidden')).toBe('true')
    })
  })
})
