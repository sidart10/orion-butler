/**
 * Global Styles Tests - Story 1.2
 *
 * Tests 1.2-UNIT-016 through 1.2-UNIT-018: Verify globals.css base typography
 * styles, font smoothing, and .serif utility class
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// The design system globals contains the base typography styles
const DESIGN_SYSTEM_GLOBALS_PATH = path.join(process.cwd(), 'design-system/styles/globals.css');
const APP_GLOBALS_PATH = path.join(process.cwd(), 'src/app/globals.css');

describe('Story 1.2: Global CSS Typography Styles', () => {
  let designSystemGlobals: string;
  let appGlobals: string;

  beforeAll(() => {
    designSystemGlobals = fs.readFileSync(DESIGN_SYSTEM_GLOBALS_PATH, 'utf-8');
    appGlobals = fs.readFileSync(APP_GLOBALS_PATH, 'utf-8');
  });

  describe('AC5: Global CSS Base Typography', () => {
    /**
     * Verify app globals imports design system globals
     */
    it('should import design system globals', () => {
      // Check that app globals imports design system
      expect(appGlobals).toMatch(/@import.*design-system.*globals\.css/);
    });

    /**
     * 1.2-UNIT-016: Verify globals.css sets body font-family
     * Note: This is in design-system globals which is imported
     */
    it('1.2-UNIT-016: should set html font-family to Inter via CSS variable', () => {
      // Design system sets html { font-family: var(--orion-font-sans) }
      // where --orion-font-sans = 'Inter', system-ui, ...
      const htmlFontPattern = /html\s*{[^}]*font-family\s*:\s*var\(--orion-font-sans\)/;
      expect(designSystemGlobals).toMatch(htmlFontPattern);
    });

    /**
     * Verify --orion-font-sans CSS variable is defined with Inter
     */
    it('should define --orion-font-sans CSS variable with Inter', () => {
      const fontVarPattern = /--orion-font-sans\s*:\s*['"]?Inter['"]?/;
      expect(designSystemGlobals).toMatch(fontVarPattern);
    });

    /**
     * 1.2-UNIT-017: Verify globals.css includes font smoothing
     */
    it('1.2-UNIT-017: should include webkit font smoothing antialiased', () => {
      const webkitPattern = /-webkit-font-smoothing\s*:\s*antialiased/;
      expect(designSystemGlobals).toMatch(webkitPattern);
    });

    it('1.2-UNIT-017b: should include moz font smoothing grayscale', () => {
      const mozPattern = /-moz-osx-font-smoothing\s*:\s*grayscale/;
      expect(designSystemGlobals).toMatch(mozPattern);
    });

    /**
     * 1.2-UNIT-018: Verify .serif utility class defined
     */
    it('1.2-UNIT-018: should define .serif class with Playfair Display', () => {
      // Check for .serif { font-family: var(--orion-font-serif) }
      const serifPattern = /\.serif\s*{[^}]*font-family\s*:\s*var\(--orion-font-serif\)/;
      expect(designSystemGlobals).toMatch(serifPattern);
    });

    /**
     * Verify --orion-font-serif CSS variable is defined with Playfair Display
     */
    it('should define --orion-font-serif CSS variable with Playfair Display', () => {
      const fontVarPattern = /--orion-font-serif\s*:\s*['"]?Playfair Display['"]?/;
      expect(designSystemGlobals).toMatch(fontVarPattern);
    });
  });

  describe('Typography Scale (from UX Design Specification)', () => {
    /**
     * Verify heading elements use Playfair Display by default
     */
    it('should set h1-h6 to use serif font family', () => {
      // Check for h1, h2, h3, h4, h5, h6 { font-family: var(--orion-font-serif) }
      const headingsPattern = /h1\s*,\s*h2\s*,\s*h3\s*,\s*h4\s*,\s*h5\s*,\s*h6\s*{[^}]*font-family\s*:\s*var\(--orion-font-serif\)/;
      expect(designSystemGlobals).toMatch(headingsPattern);
    });
  });
});
