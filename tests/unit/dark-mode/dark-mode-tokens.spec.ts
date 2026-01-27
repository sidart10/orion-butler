/**
 * Dark Mode Unit Tests
 * Story 1.13: Dark Mode System Detection
 *
 * Tests for CSS custom property definitions in both light and dark modes.
 * Validates that all tokens have correct values per the UX specification.
 *
 * Test Pattern: Read CSS files as text and verify token definitions
 * Location: design-system/styles/globals.css
 */

import { describe, it, expect, beforeAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

// Read the globals.css file
const globalsPath = path.resolve(__dirname, '../../../design-system/styles/globals.css')
let cssContent: string

beforeAll(() => {
  cssContent = fs.readFileSync(globalsPath, 'utf-8')
})

describe('Story 1.13: Dark Mode CSS Tokens', () => {
  describe('1.3-UNIT-001: Dark mode tokens are defined', () => {
    it('should have @media (prefers-color-scheme: dark) block', () => {
      expect(cssContent).toContain('@media (prefers-color-scheme: dark)')
    })

    it('should define --orion-bg as #121212 in dark mode', () => {
      // Look for the token inside dark mode media query
      const darkModeBlock = cssContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\n\}/)?.[0]
      expect(darkModeBlock).toBeDefined()
      expect(darkModeBlock).toContain('--orion-bg: #121212')
    })

    it('should define --orion-surface as #1A1A1A in dark mode', () => {
      const darkModeBlock = cssContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\n\}/)?.[0]
      expect(darkModeBlock).toBeDefined()
      expect(darkModeBlock).toContain('--orion-surface: #1A1A1A')
    })

    it('should define --orion-surface-elevated as #242424 in dark mode', () => {
      const darkModeBlock = cssContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\n\}/)?.[0]
      expect(darkModeBlock).toBeDefined()
      expect(darkModeBlock).toContain('--orion-surface-elevated: #242424')
    })

    it('should define --orion-fg as #FAF8F5 in dark mode', () => {
      const darkModeBlock = cssContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\n\}/)?.[0]
      expect(darkModeBlock).toBeDefined()
      expect(darkModeBlock).toContain('--orion-fg: #FAF8F5')
    })

    it('should define --orion-fg-muted as #9CA3AF in dark mode', () => {
      const darkModeBlock = cssContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\n\}/)?.[0]
      expect(darkModeBlock).toBeDefined()
      expect(darkModeBlock).toContain('--orion-fg-muted: #9CA3AF')
    })

    it('should define --orion-border as #2D2D2D in dark mode', () => {
      const darkModeBlock = cssContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\n\}/)?.[0]
      expect(darkModeBlock).toBeDefined()
      expect(darkModeBlock).toContain('--orion-border: #2D2D2D')
    })

    it('should define --orion-scrollbar as #333333 in dark mode', () => {
      const darkModeBlock = cssContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\n\}/)?.[0]
      expect(darkModeBlock).toBeDefined()
      expect(darkModeBlock).toContain('--orion-scrollbar: #333333')
    })

    it('should define --orion-success as #10B981 in dark mode (brighter)', () => {
      const darkModeBlock = cssContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\n\}/)?.[0]
      expect(darkModeBlock).toBeDefined()
      expect(darkModeBlock).toContain('--orion-success: #10B981')
    })

    it('should define --orion-error as #EF4444 in dark mode (brighter)', () => {
      const darkModeBlock = cssContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\n\}/)?.[0]
      expect(darkModeBlock).toBeDefined()
      expect(darkModeBlock).toContain('--orion-error: #EF4444')
    })
  })

  describe('1.4-UNIT-001: Light mode tokens are defined (default :root)', () => {
    it('should define --orion-bg as #FAF8F5 in light mode (default)', () => {
      // Light mode is defined in :root
      expect(cssContent).toContain('--orion-bg: #FAF8F5')
    })

    it('should define --orion-surface as #FFFFFF in light mode', () => {
      expect(cssContent).toContain('--orion-surface: #FFFFFF')
    })

    it('should define --orion-surface-elevated as #FFFFFF in light mode', () => {
      expect(cssContent).toContain('--orion-surface-elevated: #FFFFFF')
    })

    it('should define --orion-fg as #1A1A1A in light mode', () => {
      expect(cssContent).toContain('--orion-fg: #1A1A1A')
    })

    it('should define --orion-fg-muted as #6B6B6B in light mode', () => {
      expect(cssContent).toContain('--orion-fg-muted: #6B6B6B')
    })

    it('should define --orion-border as #E5E5E5 in light mode', () => {
      expect(cssContent).toContain('--orion-border: #E5E5E5')
    })

    it('should define --orion-scrollbar as #CCCCCC in light mode', () => {
      expect(cssContent).toContain('--orion-scrollbar: #CCCCCC')
    })

    it('should define --orion-success as #059669 in light mode', () => {
      expect(cssContent).toContain('--orion-success: #059669')
    })

    it('should define --orion-error as #9B2C2C in light mode', () => {
      expect(cssContent).toContain('--orion-error: #9B2C2C')
    })
  })

  describe('1.4-UNIT-002: Constant tokens are same in both modes', () => {
    it('should define --orion-gold as #D4AF37 (unchanged in dark mode)', () => {
      // Gold accent should be in :root only, NOT in dark mode block
      expect(cssContent).toContain('--orion-gold: #D4AF37')

      // Verify gold is NOT overridden in dark mode
      const darkModeBlock = cssContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\n\}/)?.[0]
      expect(darkModeBlock).not.toContain('--orion-gold:')
    })

    it('should define --orion-gold-muted as #C4A052 (unchanged in dark mode)', () => {
      expect(cssContent).toContain('--orion-gold-muted: #C4A052')

      const darkModeBlock = cssContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\n\}/)?.[0]
      expect(darkModeBlock).not.toContain('--orion-gold-muted:')
    })

    it('should define --orion-blue as #3B82F6 (unchanged in dark mode - waiting state)', () => {
      expect(cssContent).toContain('--orion-blue: #3B82F6')

      const darkModeBlock = cssContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\n\}/)?.[0]
      expect(darkModeBlock).not.toContain('--orion-blue:')
    })
  })

  describe('1.5-E2E-001 (Unit): Theme transition is 200ms', () => {
    it('should define 200ms transition for background-color', () => {
      expect(cssContent).toContain('background-color 200ms')
    })

    it('should define 200ms transition for color', () => {
      expect(cssContent).toContain('color 200ms')
    })

    it('should define 200ms transition for border-color', () => {
      expect(cssContent).toContain('border-color 200ms')
    })

    it('should define 200ms transition for fill', () => {
      expect(cssContent).toContain('fill 200ms')
    })

    it('should define 200ms transition for stroke', () => {
      expect(cssContent).toContain('stroke 200ms')
    })
  })

  describe('1.7-UNIT-001: Reduced motion media query exists', () => {
    it('should have @media (prefers-reduced-motion: reduce) block', () => {
      expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)')
    })

    it('should disable transitions when reduced motion is active', () => {
      // Look for transition: none in reduced motion block
      const reducedMotionMatch = cssContent.match(
        /@media \(prefers-reduced-motion: reduce\)[\s\S]*?transition:\s*none\s*!important/
      )
      expect(reducedMotionMatch).toBeTruthy()
    })
  })

  describe('1.1-UNIT-001: Color scheme support', () => {
    it('should define color-scheme: light dark in :root', () => {
      expect(cssContent).toContain('color-scheme: light dark')
    })
  })

  describe('Manual dark mode toggle (.dark class)', () => {
    it('should have .dark class with same overrides as media query', () => {
      expect(cssContent).toContain('.dark {')

      // Extract .dark block
      const darkClassBlock = cssContent.match(/\.dark\s*\{[\s\S]*?\n\}/)?.[0]
      expect(darkClassBlock).toBeDefined()

      // Should have same tokens as media query
      expect(darkClassBlock).toContain('--orion-bg: #121212')
      expect(darkClassBlock).toContain('--orion-surface: #1A1A1A')
      expect(darkClassBlock).toContain('--orion-fg: #FAF8F5')
    })
  })
})

describe('Story 1.13: Dark Mode shadcn/ui Overrides', () => {
  describe('shadcn/ui HSL variables in dark mode', () => {
    it('should override --background HSL value in dark mode', () => {
      const darkModeBlock = cssContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\n\}/)?.[0]
      expect(darkModeBlock).toContain('--background:')
    })

    it('should override --foreground HSL value in dark mode', () => {
      const darkModeBlock = cssContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\n\}/)?.[0]
      expect(darkModeBlock).toContain('--foreground:')
    })

    it('should override --card HSL value in dark mode', () => {
      const darkModeBlock = cssContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\n\}/)?.[0]
      expect(darkModeBlock).toContain('--card:')
    })

    it('should override --border HSL value in dark mode', () => {
      const darkModeBlock = cssContent.match(/@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*?\n\}/)?.[0]
      expect(darkModeBlock).toContain('--border:')
    })
  })
})
