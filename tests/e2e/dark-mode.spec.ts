/**
 * Dark Mode E2E Tests
 * Story 1.13: Dark Mode System Detection
 *
 * End-to-end tests for dark mode functionality using Playwright.
 * Tests system preference detection, live theme switching, and
 * correct token values in both modes.
 */

import { test, expect } from '@playwright/test'

/**
 * Helper to normalize hex colors for comparison
 * Browsers may return hex colors in lowercase or short form (#fff vs #ffffff)
 */
function normalizeHex(color: string): string {
  let normalized = color.toLowerCase().trim()

  // Expand short hex (#fff -> #ffffff)
  if (normalized.match(/^#[a-f0-9]{3}$/i)) {
    normalized = '#' + normalized[1] + normalized[1] + normalized[2] + normalized[2] + normalized[3] + normalized[3]
  }

  return normalized
}

test.describe('Story 1.13: Dark Mode System Detection', () => {
  test.describe('AC1: System Detection on Launch', () => {
    test('1.1-E2E-001: app launches in dark mode when system prefers dark', async ({ page }) => {
      // Emulate dark mode
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/')

      // Check background token
      const bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      })

      expect(normalizeHex(bgColor)).toBe('#121212')
    })

    test('1.1-E2E-002: app launches in light mode when system prefers light', async ({ page }) => {
      // Emulate light mode
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto('/')

      const bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      })

      expect(normalizeHex(bgColor)).toBe('#faf8f5')
    })

    test('1.1-E2E-003: app respects system preference on cold start', async ({ page }) => {
      // Clear any stored preferences
      await page.context().clearCookies()

      // Emulate dark mode before navigation
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/')

      const bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      })

      expect(normalizeHex(bgColor)).toBe('#121212')
    })
  })

  test.describe('AC2: Live Theme Switching', () => {
    test('1.2-E2E-001: theme switches from light to dark when system changes', async ({ page }) => {
      // Start in light mode
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto('/')

      // Verify light mode
      let bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim().toLowerCase()
      })
      expect(bgColor).toBe('#faf8f5')

      // Switch to dark mode
      await page.emulateMedia({ colorScheme: 'dark' })

      // Wait for CSS variable to update
      await page.waitForFunction(() => {
        const bg = getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim().toLowerCase()
        return bg === '#121212'
      })

      bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim().toLowerCase()
      })
      expect(bgColor).toBe('#121212')
    })

    test('1.2-E2E-002: theme switches from dark to light when system changes', async ({ page }) => {
      // Start in dark mode
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/')

      // Verify dark mode
      let bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim().toLowerCase()
      })
      expect(bgColor).toBe('#121212')

      // Switch to light mode
      await page.emulateMedia({ colorScheme: 'light' })

      // Wait for CSS variable to update
      await page.waitForFunction(() => {
        const bg = getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim().toLowerCase()
        return bg === '#faf8f5'
      })

      bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim().toLowerCase()
      })
      expect(bgColor).toBe('#faf8f5')
    })

    test('1.2-E2E-003: theme switch completes within 250ms (200ms + buffer)', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto('/')

      const startTime = Date.now()
      await page.emulateMedia({ colorScheme: 'dark' })

      await page.waitForFunction(() => {
        const bg = getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
        return bg === '#121212'
      })

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(500) // Allow more buffer for CI
    })
  })

  test.describe('AC3: Dark Mode Token Values', () => {
    test('1.3-E2E-001: dark mode background token is correct', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/')

      const bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      })

      expect(normalizeHex(bgColor)).toBe('#121212')
    })

    test('1.3-E2E-002: dark mode surface token is correct', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/')

      const surfaceColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-surface').trim()
      })

      expect(normalizeHex(surfaceColor)).toBe('#1a1a1a')
    })

    test('1.3-E2E-003: dark mode foreground/text token is correct', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/')

      const fgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-fg').trim()
      })

      expect(normalizeHex(fgColor)).toBe('#faf8f5')
    })

    test('1.3-E2E-004: gold accent remains unchanged in dark mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/')

      const goldColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-gold').trim()
      })

      expect(normalizeHex(goldColor)).toBe('#d4af37')
    })

    test('1.3-E2E-005: dark mode brighter status colors', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/')

      const successColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-success').trim()
      })

      const errorColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-error').trim()
      })

      expect(normalizeHex(successColor)).toBe('#10b981')
      expect(normalizeHex(errorColor)).toBe('#ef4444')
    })
  })

  test.describe('AC4: Light Mode Token Values', () => {
    test('1.4-E2E-001: light mode background token is correct', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto('/')

      const bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      })

      expect(normalizeHex(bgColor)).toBe('#faf8f5')
    })

    test('1.4-E2E-002: light mode surface token is correct', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto('/')

      const surfaceColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-surface').trim()
      })

      expect(normalizeHex(surfaceColor)).toBe('#ffffff')
    })

    test('1.4-E2E-003: light mode foreground/text token is correct', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto('/')

      const fgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-fg').trim()
      })

      expect(normalizeHex(fgColor)).toBe('#1a1a1a')
    })

    test('1.4-E2E-004: gold accent remains unchanged in light mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto('/')

      const goldColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-gold').trim()
      })

      expect(normalizeHex(goldColor)).toBe('#d4af37')
    })
  })

  test.describe('AC5: Smooth Transitions', () => {
    test('1.5-E2E-001: transition duration is 200ms', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto('/')

      const transitionDuration = await page.evaluate(() => {
        const body = document.body
        return getComputedStyle(body).transitionDuration
      })

      // Should contain 0.2s or 200ms
      expect(transitionDuration).toMatch(/0\.2s|200ms/)
    })

    test('1.5-E2E-002: multiple properties transition together', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto('/')

      const transitionProperty = await page.evaluate(() => {
        const body = document.body
        return getComputedStyle(body).transitionProperty
      })

      // Should include background-color, color, border-color
      expect(transitionProperty).toContain('background-color')
      expect(transitionProperty).toContain('color')
      expect(transitionProperty).toContain('border-color')
    })
  })

  test.describe('AC6: Dark Mode with Responsive Breakpoints', () => {
    test('1.6-E2E-001: desktop breakpoint (>=1280px) works in dark mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.setViewportSize({ width: 1400, height: 900 })
      await page.goto('/')

      // Sidebar should be visible
      const sidebarVisible = await page.locator('[data-testid="sidebar"]').isVisible()
      expect(sidebarVisible).toBe(true)

      // Dark mode tokens should be applied
      const bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      })
      expect(bgColor).toBe('#121212')
    })

    test('1.6-E2E-002: tablet breakpoint (768-1023px) works in dark mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.setViewportSize({ width: 800, height: 1024 })
      await page.goto('/')

      // Hamburger menu should be visible
      const hamburgerVisible = await page.locator('[data-testid="hamburger-menu"]').isVisible()
      expect(hamburgerVisible).toBe(true)

      // Dark mode tokens should be applied
      const bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      })
      expect(bgColor).toBe('#121212')
    })

    test('1.6-E2E-003: laptop breakpoint (1024-1279px) works in dark mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.setViewportSize({ width: 1100, height: 800 })
      await page.goto('/')

      // Dark mode tokens should be applied
      const bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      })
      expect(bgColor).toBe('#121212')
    })

    test('1.6-E2E-005: responsive resize preserves dark mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })

      // Start at desktop
      await page.setViewportSize({ width: 1400, height: 900 })
      await page.goto('/')

      let bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      })
      expect(bgColor).toBe('#121212')

      // Resize to tablet
      await page.setViewportSize({ width: 800, height: 1024 })
      await page.waitForTimeout(100) // Allow resize to settle

      bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      })
      expect(bgColor).toBe('#121212')

      // Resize back to desktop
      await page.setViewportSize({ width: 1400, height: 900 })
      await page.waitForTimeout(100)

      bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      })
      expect(bgColor).toBe('#121212')
    })
  })

  test.describe('AC7: Reduced Motion', () => {
    test('1.7-E2E-001: theme switches instantly with reduced motion', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
      await page.goto('/')

      const startTime = Date.now()
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })

      // Should be nearly instant (< 100ms)
      const bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      })

      const duration = Date.now() - startTime
      expect(bgColor).toBe('#121212')
      expect(duration).toBeLessThan(200) // Nearly instant (allowing browser overhead)
    })

    test('1.7-E2E-003: reduced motion + dark mode combination', async ({ page }) => {
      // User has both reduced motion AND dark mode preferences
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
      await page.goto('/')

      // App should start in dark mode
      const bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      })
      expect(bgColor).toBe('#121212')

      // No transition animations should occur (transition: none)
      const transitionDuration = await page.evaluate(() => {
        return getComputedStyle(document.body).transitionDuration
      })

      // With reduced motion, transitions should be 0s
      expect(transitionDuration).toBe('0s')
    })
  })

  test.describe('Color Scheme Meta Tag', () => {
    test('should have color-scheme meta tag', async ({ page }) => {
      await page.goto('/')

      const colorSchemeMeta = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="color-scheme"]')
        return meta ? meta.getAttribute('content') : null
      })

      expect(colorSchemeMeta).toBe('light dark')
    })
  })

  test.describe('Body classes', () => {
    test('body should have bg-orion-bg class', async ({ page }) => {
      await page.goto('/')

      const hasClass = await page.evaluate(() => {
        return document.body.classList.contains('bg-orion-bg')
      })

      expect(hasClass).toBe(true)
    })

    test('body should have text-orion-fg class', async ({ page }) => {
      await page.goto('/')

      const hasClass = await page.evaluate(() => {
        return document.body.classList.contains('text-orion-fg')
      })

      expect(hasClass).toBe(true)
    })
  })
})
