/**
 * Theme Toggle E2E Tests
 * Story 1.14: Dark Mode - Manual Toggle
 *
 * End-to-end tests for manual theme toggle functionality.
 * Tests the complete user flow from settings page to theme persistence.
 */

import { test, expect } from '@playwright/test'

test.describe('Story 1.14: Manual Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test.describe('AC1: Theme Selector UI', () => {
    test('1.14-E2E-001: settings page shows three theme options', async ({ page }) => {
      await page.goto('/settings')

      await expect(page.locator('button:has-text("Light")')).toBeVisible()
      await expect(page.locator('button:has-text("Dark")')).toBeVisible()
      await expect(page.locator('button:has-text("System")')).toBeVisible()
    })

    test('1.14-E2E-002: active option has visual distinction', async ({ page }) => {
      await page.goto('/settings')

      // Wait for theme selector to render
      await page.waitForSelector('[data-testid="theme-selector"]')

      // Click Dark to make it active
      await page.click('[data-testid="theme-option-dark"]')

      // Verify Dark button is active via aria-pressed
      const darkButton = page.locator('[data-testid="theme-option-dark"]')
      await expect(darkButton).toHaveAttribute('aria-pressed', 'true')

      // Verify other buttons are not active
      const lightButton = page.locator('[data-testid="theme-option-light"]')
      const systemButton = page.locator('[data-testid="theme-option-system"]')
      await expect(lightButton).toHaveAttribute('aria-pressed', 'false')
      await expect(systemButton).toHaveAttribute('aria-pressed', 'false')
    })

    test('1.14-E2E-003: active option updates when selection changes', async ({ page }) => {
      await page.goto('/settings')

      // Initially System is active
      await expect(page.locator('[data-testid="theme-option-system"]')).toHaveAttribute('aria-pressed', 'true')

      // Click Dark
      await page.click('[data-testid="theme-option-dark"]')

      // Dark should now be active
      await expect(page.locator('[data-testid="theme-option-dark"]')).toHaveAttribute('aria-pressed', 'true')
      await expect(page.locator('[data-testid="theme-option-system"]')).toHaveAttribute('aria-pressed', 'false')
    })

    test('1.14-E2E-004: theme selector has aria-pressed for accessibility', async ({ page }) => {
      await page.goto('/settings')

      // All buttons should have aria-pressed
      await expect(page.locator('[data-testid="theme-option-light"]')).toHaveAttribute('aria-pressed')
      await expect(page.locator('[data-testid="theme-option-dark"]')).toHaveAttribute('aria-pressed')
      await expect(page.locator('[data-testid="theme-option-system"]')).toHaveAttribute('aria-pressed')
    })
  })

  test.describe('AC2: Light Theme Selection', () => {
    test('1.14-E2E-007: selecting Light applies light theme immediately', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/settings')

      // Should start following system (dark)
      let bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      )
      expect(bgColor.toLowerCase()).toBe('#121212') // Dark from system

      // Click Light
      await page.click('[data-testid="theme-option-light"]')

      bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      )
      expect(bgColor.toLowerCase()).toBe('#faf8f5') // Now light
    })

    test('1.14-E2E-008: light mode overrides system dark preference', async ({ page }) => {
      await page.goto('/settings')
      await page.click('[data-testid="theme-option-light"]')

      // System changes to dark - should be ignored
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.waitForTimeout(300)

      const bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      )
      expect(bgColor.toLowerCase()).toBe('#faf8f5') // Still light
    })

    test('1.14-E2E-009: light mode adds .light class', async ({ page }) => {
      await page.goto('/settings')
      await page.click('[data-testid="theme-option-light"]')

      const htmlClass = await page.getAttribute('html', 'class')
      expect(htmlClass).toContain('light')
      expect(htmlClass).not.toContain('dark')
    })

    test('1.14-E2E-010: light preference persists to localStorage', async ({ page }) => {
      await page.goto('/settings')
      await page.click('[data-testid="theme-option-light"]')

      const stored = await page.evaluate(() =>
        localStorage.getItem('theme-preference')
      )
      expect(stored).toBe('light')
    })

    test('1.14-E2E-011: light mode persists across page refresh', async ({ page }) => {
      await page.goto('/settings')
      await page.click('[data-testid="theme-option-light"]')

      await page.reload()

      const bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      )
      expect(bgColor.toLowerCase()).toBe('#faf8f5')
    })
  })

  test.describe('AC3: Dark Theme Selection', () => {
    test('1.14-E2E-013: selecting Dark applies dark theme immediately', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto('/settings')

      await page.click('[data-testid="theme-option-dark"]')

      const bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      )
      expect(bgColor.toLowerCase()).toBe('#121212')
    })

    test('1.14-E2E-014: dark mode overrides system light preference', async ({ page }) => {
      await page.goto('/settings')
      await page.click('[data-testid="theme-option-dark"]')

      // Ensure system is light
      await page.emulateMedia({ colorScheme: 'light' })
      await page.waitForTimeout(300)

      const bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      )
      expect(bgColor.toLowerCase()).toBe('#121212') // Still dark
    })

    test('1.14-E2E-015: dark mode adds .dark class', async ({ page }) => {
      await page.goto('/settings')
      await page.click('[data-testid="theme-option-dark"]')

      const htmlClass = await page.getAttribute('html', 'class')
      expect(htmlClass).toContain('dark')
      expect(htmlClass).not.toContain('light')
    })

    test('1.14-E2E-016: dark preference persists to localStorage', async ({ page }) => {
      await page.goto('/settings')
      await page.click('[data-testid="theme-option-dark"]')

      const stored = await page.evaluate(() =>
        localStorage.getItem('theme-preference')
      )
      expect(stored).toBe('dark')
    })

    test('1.14-E2E-017: dark mode persists across page refresh', async ({ page }) => {
      await page.goto('/settings')
      await page.click('[data-testid="theme-option-dark"]')

      await page.reload()

      const bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      )
      expect(bgColor.toLowerCase()).toBe('#121212')
    })
  })

  test.describe('AC4: System Theme Selection', () => {
    test('1.14-E2E-019: selecting System reverts to auto detection', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto('/settings')

      // Set to Dark first
      await page.click('[data-testid="theme-option-dark"]')
      let bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      )
      expect(bgColor.toLowerCase()).toBe('#121212') // Dark manual

      // Revert to System
      await page.click('[data-testid="theme-option-system"]')
      bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      )
      expect(bgColor.toLowerCase()).toBe('#faf8f5') // Light from system
    })

    test('1.14-E2E-020: system mode removes theme class', async ({ page }) => {
      await page.goto('/settings')
      await page.click('[data-testid="theme-option-dark"]')

      let htmlClass = await page.getAttribute('html', 'class')
      expect(htmlClass).toContain('dark')

      await page.click('[data-testid="theme-option-system"]')
      htmlClass = await page.getAttribute('html', 'class') || ''
      expect(htmlClass).not.toContain('dark')
      expect(htmlClass).not.toContain('light')
    })

    test('1.14-E2E-021: system mode follows live system changes', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto('/settings')
      await page.click('[data-testid="theme-option-system"]')

      let bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      )
      expect(bgColor.toLowerCase()).toBe('#faf8f5')

      // System changes to dark
      await page.emulateMedia({ colorScheme: 'dark' })

      // Wait for the change to be detected
      await page.waitForFunction(() => {
        const bg = getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim().toLowerCase()
        return bg === '#121212'
      })

      bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      )
      expect(bgColor.toLowerCase()).toBe('#121212')
    })

    test('1.14-E2E-022: system preference persists to localStorage', async ({ page }) => {
      await page.goto('/settings')
      await page.click('[data-testid="theme-option-dark"]') // Set to dark first
      await page.click('[data-testid="theme-option-system"]') // Revert to system

      const stored = await page.evaluate(() =>
        localStorage.getItem('theme-preference')
      )
      expect(stored).toBe('system')
    })
  })

  test.describe('AC5: FOUC Prevention', () => {
    test('1.14-E2E-025: no FOUC with dark preference', async ({ page }) => {
      // First visit to set localStorage
      await page.goto('/')
      await page.evaluate(() => localStorage.setItem('theme-preference', 'dark'))

      // Navigate away and back to test flash prevention
      await page.goto('/settings')
      await page.goto('/')

      // Check theme is dark immediately
      const bgOnLoad = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      )

      expect(bgOnLoad.toLowerCase()).toBe('#121212')
    })

    test('1.14-E2E-026: no FOUC with light preference', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' }) // System is dark

      // First visit to set localStorage
      await page.goto('/')
      await page.evaluate(() => localStorage.setItem('theme-preference', 'light'))

      // Navigate away and back to test flash prevention
      await page.goto('/settings')
      await page.goto('/')

      // Check theme is light immediately despite system being dark
      const bgOnLoad = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      )

      expect(bgOnLoad.toLowerCase()).toBe('#faf8f5')
    })

    test('1.14-E2E-027: blocking script applies theme before hydration', async ({ page }) => {
      // First visit to set localStorage
      await page.goto('/')
      await page.evaluate(() => localStorage.setItem('theme-preference', 'dark'))

      // Navigate away and back
      await page.goto('/settings')
      await page.goto('/')

      // Check that dark class is present
      const htmlClass = await page.getAttribute('html', 'class')
      expect(htmlClass).toContain('dark')
    })
  })

  test.describe('AC6: Transitions', () => {
    test('1.14-E2E-029: manual theme change uses transition', async ({ page }) => {
      await page.goto('/settings')
      await page.click('[data-testid="theme-option-light"]')

      // Check that transition property is set
      const transitionDuration = await page.evaluate(() => {
        const el = document.documentElement
        return getComputedStyle(el).transitionDuration
      })

      // Should include 200ms (0.2s) transition
      // Note: may be "0.2s" or "0s, 0.2s" depending on properties
      expect(transitionDuration).toMatch(/0\.2s|200ms/)
    })

    test('1.14-E2E-030: reduced motion disables transition', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto('/settings')
      await page.click('[data-testid="theme-option-light"]')

      // With reduced motion, transitions should be disabled
      const transitionDuration = await page.evaluate(() => {
        const el = document.documentElement
        return getComputedStyle(el).transitionDuration
      })

      // Should be 0s or not set
      expect(transitionDuration).toMatch(/^0s|^0$/)
    })
  })

  test.describe('AC7: Gold Accent', () => {
    test('1.14-E2E-033: gold accent unchanged in manual dark', async ({ page }) => {
      await page.goto('/settings')
      await page.click('[data-testid="theme-option-dark"]')

      const goldColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-gold').trim()
      )

      expect(goldColor.toLowerCase()).toBe('#d4af37')
    })

    test('1.14-E2E-034: gold accent unchanged in manual light', async ({ page }) => {
      await page.goto('/settings')
      await page.click('[data-testid="theme-option-light"]')

      const goldColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-gold').trim()
      )

      expect(goldColor.toLowerCase()).toBe('#d4af37')
    })

    test('1.14-E2E-035: gold accent visible across all three modes', async ({ page }) => {
      await page.goto('/settings')

      // Check Light
      await page.click('[data-testid="theme-option-light"]')
      let goldColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-gold').trim()
      )
      expect(goldColor.toLowerCase()).toBe('#d4af37')

      // Check Dark
      await page.click('[data-testid="theme-option-dark"]')
      goldColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-gold').trim()
      )
      expect(goldColor.toLowerCase()).toBe('#d4af37')

      // Check System
      await page.click('[data-testid="theme-option-system"]')
      goldColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-gold').trim()
      )
      expect(goldColor.toLowerCase()).toBe('#d4af37')
    })
  })

  test.describe('Settings Page', () => {
    test('settings page renders correctly', async ({ page }) => {
      await page.goto('/settings')

      await expect(page.locator('[data-testid="settings-page"]')).toBeVisible()
      await expect(page.locator('h1:has-text("Settings")')).toBeVisible()
      await expect(page.locator('[data-testid="appearance-section"]')).toBeVisible()
    })

    test('back link is visible and clickable', async ({ page }) => {
      await page.goto('/settings')

      // Check that back link exists and is visible
      const backLink = page.locator('a[href="/"]')
      await expect(backLink).toBeVisible()
      await expect(backLink).toHaveAttribute('aria-label', 'Back to home')
    })
  })
})
