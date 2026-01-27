/**
 * Layout Dark Mode Unit Tests
 * Story 1.13: Dark Mode System Detection
 *
 * Tests for layout.tsx dark mode configuration.
 * Validates color-scheme meta tag and html element attributes.
 *
 * Test Pattern: Read TSX file as text and verify configuration
 * Location: src/app/layout.tsx
 */

import { describe, it, expect, beforeAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

// Read the layout.tsx file
const layoutPath = path.resolve(__dirname, '../../../src/app/layout.tsx')
let layoutContent: string

beforeAll(() => {
  layoutContent = fs.readFileSync(layoutPath, 'utf-8')
})

describe('Story 1.13: Layout Dark Mode Configuration', () => {
  describe('AC#1: Color scheme meta tag', () => {
    it('should have <meta name="color-scheme" content="light dark" />', () => {
      expect(layoutContent).toContain('name="color-scheme"')
      expect(layoutContent).toContain('content="light dark"')
    })

    it('should have <head> element for meta tag', () => {
      expect(layoutContent).toContain('<head>')
      expect(layoutContent).toContain('</head>')
    })
  })

  describe('AC#1: HTML element configuration', () => {
    it('should have suppressHydrationWarning on html element', () => {
      expect(layoutContent).toContain('suppressHydrationWarning')
    })

    it('should have lang="en" on html element', () => {
      expect(layoutContent).toContain('lang="en"')
    })
  })

  describe('AC#1: Body uses design system tokens', () => {
    it('should use bg-orion-bg class on body', () => {
      expect(layoutContent).toContain('bg-orion-bg')
    })

    it('should use text-orion-fg class on body', () => {
      expect(layoutContent).toContain('text-orion-fg')
    })

    it('should have font-sans antialiased classes on body', () => {
      expect(layoutContent).toContain('font-sans')
      expect(layoutContent).toContain('antialiased')
    })
  })

  describe('Font configuration preserved', () => {
    it('should have inter font variable', () => {
      expect(layoutContent).toContain('inter.variable')
    })

    it('should have playfair font variable', () => {
      expect(layoutContent).toContain('playfair.variable')
    })
  })
})
