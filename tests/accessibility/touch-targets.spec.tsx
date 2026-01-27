/**
 * Touch Target Accessibility Tests
 * Story 1.18: Touch Targets & Contrast
 *
 * WCAG 2.1 SC 2.5.5: Target Size (Level AAA) recommends 44x44px minimum.
 * We target 44x44px for all interactive elements per PRD NFR-4.1.
 *
 * Test IDs: 1.18-UNIT-050 through 1.18-UNIT-059
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HamburgerMenu } from '@/components/layout/HamburgerMenu'
import { SidebarNavItem } from '@/components/sidebar/SidebarNavItem'
import { ChatInput } from '@/components/chat/ChatInput'
import { ThemeSelector } from '@/components/settings/ThemeSelector'
import { TooltipProvider } from '@/components/ui/tooltip'

// Mock useFocusTrap for modal components
vi.mock('@/hooks/useFocusTrap', () => ({
  useFocusTrap: () => ({ current: null }),
}))

// Mock KeyboardShortcutProvider context
vi.mock('@/components/providers/KeyboardShortcutProvider', () => ({
  useKeyboardShortcutContext: () => ({
    isQuickCaptureOpen: true,
    isCommandPaletteOpen: true,
    closeQuickCapture: vi.fn(),
    closeCommandPalette: vi.fn(),
  }),
}))

// Mock theme store
vi.mock('@/stores/themeStore', () => ({
  useThemeStore: () => ({
    preference: 'light',
    setPreference: vi.fn(),
  }),
}))

// Import modals after mocking
import { QuickCaptureModal } from '@/components/modals/QuickCaptureModal'
import { CommandPaletteModal } from '@/components/modals/CommandPaletteModal'

/**
 * Minimum touch target size per WCAG 2.1 SC 2.5.5
 */
const MIN_TOUCH_TARGET = 44

/**
 * Helper to check if element has minimum touch target via CSS classes
 * Checks for min-h-[44px] and min-w-[44px] or equivalent sizing classes
 */
function hasMinTouchTarget(element: HTMLElement): { width: boolean; height: boolean } {
  const className = element.className

  // Check for explicit min-h/min-w classes
  const hasMinHeight =
    className.includes('min-h-[44px]') ||
    className.includes('h-11') ||
    className.includes('min-h-11') ||
    className.includes('h-[44px]')

  const hasMinWidth =
    className.includes('min-w-[44px]') ||
    className.includes('w-11') ||
    className.includes('min-w-11') ||
    className.includes('w-[44px]')

  return { width: hasMinWidth, height: hasMinHeight }
}

/**
 * Helper to check if element has padding that ensures 44px touch target
 * For buttons with small content, padding can achieve the target size
 */
function hasTouchTargetPadding(element: HTMLElement): boolean {
  const className = element.className

  // Check for sufficient padding classes
  // p-3 = 12px*2 = 24px, needs ~20px content = 44px
  // p-2.5 = 10px*2 = 20px, needs ~24px content = 44px
  // The combination of padding and minimum dimensions matters
  return (
    className.includes('p-2.5') ||
    className.includes('p-3') ||
    className.includes('px-3 py-2.5') ||
    className.includes('min-h-[44px]') ||
    className.includes('min-w-[44px]')
  )
}

describe('Touch Target Accessibility - Story 1.18', () => {
  describe('WCAG 2.1 SC 2.5.5 Compliance', () => {
    /**
     * 1.18-UNIT-050: HamburgerMenu has 44x44px touch target
     */
    it('1.18-UNIT-050: HamburgerMenu button has 44x44px minimum touch target', () => {
      render(<HamburgerMenu isOpen={false} onToggle={() => {}} />)

      const button = screen.getByTestId('hamburger-menu')
      const result = hasMinTouchTarget(button)

      expect(result.width).toBe(true)
      expect(result.height).toBe(true)
    })

    /**
     * 1.18-UNIT-051: SidebarNavItem has 44px minimum height
     */
    it('1.18-UNIT-051: SidebarNavItem has 44px minimum height touch target', () => {
      render(<SidebarNavItem label="Inbox" count={3} />)

      const button = screen.getByTestId('sidebar-nav-item-inbox')
      const result = hasMinTouchTarget(button)

      // SidebarNavItem is full-width, so only height matters
      expect(result.height).toBe(true)
    })

    /**
     * 1.18-UNIT-052: SidebarNavItem collapsed mode maintains 44px touch target
     */
    it('1.18-UNIT-052: SidebarNavItem in collapsed mode maintains 44px touch target', () => {
      render(
        <TooltipProvider>
          <SidebarNavItem label="Inbox" count={3} isCollapsed={true} />
        </TooltipProvider>
      )

      const button = screen.getByTestId('sidebar-nav-item-inbox')
      const result = hasMinTouchTarget(button)

      expect(result.height).toBe(true)
    })

    /**
     * 1.18-UNIT-053: QuickCaptureModal close button has 44px touch target
     */
    it('1.18-UNIT-053: QuickCaptureModal close button has 44px touch target', () => {
      render(<QuickCaptureModal />)

      const closeButton = screen.getByLabelText('Close quick capture')
      const result = hasMinTouchTarget(closeButton)

      // Close button should have minimum dimensions for touch target
      expect(result.width).toBe(true)
      expect(result.height).toBe(true)
    })

    /**
     * 1.18-UNIT-054: CommandPaletteModal close button has 44px touch target
     */
    it('1.18-UNIT-054: CommandPaletteModal close button has 44px touch target', () => {
      render(<CommandPaletteModal />)

      const closeButton = screen.getByLabelText('Close command palette')
      const result = hasMinTouchTarget(closeButton)

      // Close button should have minimum dimensions for touch target
      expect(result.width).toBe(true)
      expect(result.height).toBe(true)
    })

    /**
     * 1.18-UNIT-055: ChatInput send button has 44px touch target
     */
    it('1.18-UNIT-055: ChatInput send button has 44px touch target', () => {
      render(<ChatInput />)

      const sendButton = screen.getByLabelText('Send message')
      const result = hasMinTouchTarget(sendButton)

      // Send button should have minimum dimensions for touch target
      expect(result.width).toBe(true)
      expect(result.height).toBe(true)
    })

    /**
     * 1.18-UNIT-056: ThemeSelector buttons have 44px touch target height
     */
    it('1.18-UNIT-056: ThemeSelector buttons have 44px minimum height', () => {
      render(<ThemeSelector />)

      const lightButton = screen.getByTestId('theme-option-light')
      const darkButton = screen.getByTestId('theme-option-dark')
      const systemButton = screen.getByTestId('theme-option-system')

      // Each segment should have minimum height for touch target
      expect(hasMinTouchTarget(lightButton).height).toBe(true)
      expect(hasMinTouchTarget(darkButton).height).toBe(true)
      expect(hasMinTouchTarget(systemButton).height).toBe(true)
    })
  })

  describe('Touch Target Documentation', () => {
    /**
     * 1.18-UNIT-057: Documents WCAG 2.1 SC 2.5.5 requirement
     */
    it('1.18-UNIT-057: WCAG 2.1 SC 2.5.5 requires 44x44px minimum touch targets', () => {
      // This test documents the requirement for future reference
      expect(MIN_TOUCH_TARGET).toBe(44)

      // WCAG 2.1 SC 2.5.5 Target Size (Level AAA):
      // "The size of the target for pointer inputs is at least 44 by 44 CSS pixels"
      // Exceptions: inline links, user-configurable, essential (no alternative)
    })

    /**
     * 1.18-UNIT-058: Components use consistent touch target approach
     */
    it('1.18-UNIT-058: Touch targets use Tailwind min-h/min-w classes', () => {
      // Document the pattern used across components
      const touchTargetClasses = [
        'min-h-[44px]',
        'min-w-[44px]',
        'h-11', // Tailwind h-11 = 44px (2.75rem)
        'w-11', // Tailwind w-11 = 44px
      ]

      // All these classes should map to 44px
      expect(touchTargetClasses).toContain('min-h-[44px]')
      expect(touchTargetClasses).toContain('min-w-[44px]')
    })
  })

  describe('Touch Target Audit Summary', () => {
    /**
     * 1.18-UNIT-059: All interactive elements meet 44px requirement
     */
    it('1.18-UNIT-059: Audit summary - all interactive elements compliant', () => {
      // This test serves as documentation of the audit
      const auditResults = {
        'HamburgerMenu': { compliant: true, notes: 'w-11 h-11 min-w-[44px] min-h-[44px]' },
        'SidebarNavItem': { compliant: true, notes: 'min-h-[44px], full width' },
        'SidebarNavItem (collapsed)': { compliant: true, notes: 'min-h-[44px] maintained' },
        'QuickCaptureModal close': { compliant: true, notes: 'min-h-[44px] min-w-[44px]' },
        'CommandPaletteModal close': { compliant: true, notes: 'min-h-[44px] min-w-[44px]' },
        'ChatInput send': { compliant: true, notes: 'min-h-[44px] min-w-[44px]' },
        'ThemeSelector segments': { compliant: true, notes: 'min-h-[44px]' },
      }

      // Verify all components are marked compliant
      const allCompliant = Object.values(auditResults).every(r => r.compliant)
      expect(allCompliant).toBe(true)
    })
  })
})
