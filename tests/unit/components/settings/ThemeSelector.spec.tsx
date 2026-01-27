/**
 * ThemeSelector Unit Tests
 * Story 1.14: Dark Mode - Manual Toggle
 *
 * Tests for ThemeSelector component including:
 * - Rendering of theme options
 * - Active state indication
 * - Click handling
 * - Accessibility attributes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeSelector } from '@/components/settings/ThemeSelector'
import { useThemeStore } from '@/stores/themeStore'

describe('Story 1.14: ThemeSelector Component', () => {
  beforeEach(() => {
    // Reset store state
    useThemeStore.setState({
      preference: 'system',
      resolvedTheme: 'light',
      isInitialized: true,
    })

    // Clear localStorage
    localStorage.clear()

    // Remove theme classes
    document.documentElement.classList.remove('light', 'dark')
  })

  describe('1.14-UNIT: Rendering', () => {
    it('should render three theme options', () => {
      render(<ThemeSelector />)

      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('System')).toBeInTheDocument()
    })

    it('should render with correct test ids', () => {
      render(<ThemeSelector />)

      expect(screen.getByTestId('theme-selector')).toBeInTheDocument()
      expect(screen.getByTestId('theme-option-light')).toBeInTheDocument()
      expect(screen.getByTestId('theme-option-dark')).toBeInTheDocument()
      expect(screen.getByTestId('theme-option-system')).toBeInTheDocument()
    })

    it('should render buttons', () => {
      render(<ThemeSelector />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(3)
    })
  })

  describe('1.14-UNIT: Active state indication', () => {
    it('should show System as active by default', () => {
      render(<ThemeSelector />)

      const systemButton = screen.getByTestId('theme-option-system')
      expect(systemButton).toHaveAttribute('aria-pressed', 'true')

      // Other options should not be active
      const lightButton = screen.getByTestId('theme-option-light')
      const darkButton = screen.getByTestId('theme-option-dark')
      expect(lightButton).toHaveAttribute('aria-pressed', 'false')
      expect(darkButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('should show Light as active when preference is light', () => {
      useThemeStore.setState({ preference: 'light' })

      render(<ThemeSelector />)

      const lightButton = screen.getByTestId('theme-option-light')
      expect(lightButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('should show Dark as active when preference is dark', () => {
      useThemeStore.setState({ preference: 'dark' })

      render(<ThemeSelector />)

      const darkButton = screen.getByTestId('theme-option-dark')
      expect(darkButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('should apply gold background class to active button', () => {
      useThemeStore.setState({ preference: 'dark' })

      render(<ThemeSelector />)

      const darkButton = screen.getByTestId('theme-option-dark')
      expect(darkButton.className).toContain('bg-orion-gold')
    })

    it('should apply surface background class to inactive buttons', () => {
      useThemeStore.setState({ preference: 'dark' })

      render(<ThemeSelector />)

      const lightButton = screen.getByTestId('theme-option-light')
      expect(lightButton.className).toContain('bg-orion-surface')
    })
  })

  describe('1.14-UNIT: Click handling', () => {
    it('should call setPreference when Light is clicked', () => {
      render(<ThemeSelector />)

      const lightButton = screen.getByTestId('theme-option-light')
      fireEvent.click(lightButton)

      expect(useThemeStore.getState().preference).toBe('light')
    })

    it('should call setPreference when Dark is clicked', () => {
      render(<ThemeSelector />)

      const darkButton = screen.getByTestId('theme-option-dark')
      fireEvent.click(darkButton)

      expect(useThemeStore.getState().preference).toBe('dark')
    })

    it('should call setPreference when System is clicked', () => {
      useThemeStore.setState({ preference: 'dark' })

      render(<ThemeSelector />)

      const systemButton = screen.getByTestId('theme-option-system')
      fireEvent.click(systemButton)

      expect(useThemeStore.getState().preference).toBe('system')
    })

    it('should update active state after click', () => {
      render(<ThemeSelector />)

      // Initially system is active
      expect(screen.getByTestId('theme-option-system')).toHaveAttribute('aria-pressed', 'true')

      // Click dark
      fireEvent.click(screen.getByTestId('theme-option-dark'))

      // Dark should now be active (re-render happens automatically via Zustand)
      const darkButton = screen.getByTestId('theme-option-dark')
      expect(darkButton).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('1.14-UNIT: Accessibility', () => {
    it('should have aria-label on the group', () => {
      render(<ThemeSelector />)

      const group = screen.getByRole('group')
      expect(group).toHaveAttribute('aria-label', 'Theme selection')
    })

    it('should have aria-pressed on all buttons', () => {
      render(<ThemeSelector />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed')
      })
    })

    it('should be keyboard focusable', () => {
      render(<ThemeSelector />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        // Buttons are focusable by default
        expect(button.tagName).toBe('BUTTON')
      })
    })
  })

  describe('1.14-UNIT: Styling', () => {
    it('should have 0px border radius (Editorial Luxury via global CSS)', () => {
      render(<ThemeSelector />)

      // Editorial Luxury aesthetic uses 0px border radius via global CSS rule
      // We verify buttons exist and don't have rounded classes
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        // Should not have rounded-md, rounded-lg, etc. (only rounded-*-none allowed)
        expect(button.className).not.toMatch(/rounded-md|rounded-lg|rounded-xl|rounded-full/)
      })
    })

    it('should have transition classes', () => {
      render(<ThemeSelector />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button.className).toContain('transition-colors')
        expect(button.className).toContain('duration-100')
      })
    })

    it('should have focus-visible outline classes', () => {
      render(<ThemeSelector />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button.className).toContain('focus-visible:outline')
        expect(button.className).toContain('focus-visible:outline-orion-gold')
      })
    })
  })

  describe('1.14-UNIT: State sync with store', () => {
    it('should reflect store state changes via click', () => {
      render(<ThemeSelector />)

      // Initially system
      expect(screen.getByTestId('theme-option-system')).toHaveAttribute('aria-pressed', 'true')

      // Click dark to change state
      fireEvent.click(screen.getByTestId('theme-option-dark'))

      // Zustand auto-updates the component
      expect(screen.getByTestId('theme-option-dark')).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByTestId('theme-option-system')).toHaveAttribute('aria-pressed', 'false')
    })
  })
})
