/**
 * Tailwind Integration Tests - Story 1.2
 *
 * Tests 1.2-UNIT-013 through 1.2-UNIT-015: Verify Tailwind CSS font family
 * configuration uses CSS variables correctly
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// The tailwind config is now at root level (design-system config was merged)
const TAILWIND_CONFIG_PATH = path.join(process.cwd(), 'tailwind.config.ts');

describe('Story 1.2: Tailwind CSS Integration', () => {
  let tailwindConfig: string;

  beforeAll(() => {
    tailwindConfig = fs.readFileSync(TAILWIND_CONFIG_PATH, 'utf-8');
  });

  describe('AC4: Tailwind fontFamily Configuration', () => {
    /**
     * Verify that the tailwind config includes design system configuration
     * Note: Design system preset was merged into root tailwind.config.ts
     */
    it('should include design system configuration', () => {
      // Config should have orion color namespace
      expect(tailwindConfig).toMatch(/orion:/);
      // Config should have font family configuration
      expect(tailwindConfig).toMatch(/fontFamily:/);
    });

    /**
     * 1.2-UNIT-013: Verify Tailwind fontFamily.sans configured with Inter variable
     */
    it('1.2-UNIT-013: should configure fontFamily.sans with Inter', () => {
      // Design system should have Inter in fontFamily.sans
      // Pattern: fontFamily: { sans: ['Inter', ...] }
      const fontFamilyPattern = /fontFamily\s*:\s*{[\s\S]*?sans\s*:\s*\[[^\]]*['"]Inter['"][^\]]*\]/;
      expect(tailwindConfig).toMatch(fontFamilyPattern);
    });

    /**
     * 1.2-UNIT-014: Verify Tailwind fontFamily.serif configured with Playfair Display variable
     */
    it('1.2-UNIT-014: should configure fontFamily.serif with Playfair Display', () => {
      // Design system should have Playfair Display in fontFamily.serif
      const fontFamilyPattern = /fontFamily\s*:\s*{[\s\S]*?serif\s*:\s*\[[^\]]*['"]Playfair Display['"][^\]]*\]/;
      expect(tailwindConfig).toMatch(fontFamilyPattern);
    });

    /**
     * 1.2-UNIT-015: Verify Tailwind fallback fonts configured
     */
    it('1.2-UNIT-015: should configure fontFamily.sans with system-ui fallback', () => {
      // Check for system-ui in sans fallback
      const sansPattern = /sans\s*:\s*\[[^\]]*['"]system-ui['"][^\]]*\]/;
      expect(tailwindConfig).toMatch(sansPattern);
    });

    it('1.2-UNIT-015b: should configure fontFamily.serif with Georgia fallback', () => {
      // Check for Georgia in serif fallback
      const serifPattern = /serif\s*:\s*\[[^\]]*['"]Georgia['"][^\]]*\]/;
      expect(tailwindConfig).toMatch(serifPattern);
    });
  });

  describe('Design System Plugin Utilities', () => {
    /**
     * Verify .serif utility class is defined in design system
     */
    it('should define .serif utility class', () => {
      // The design system plugin should add a .serif utility
      const serifUtilityPattern = /['"]\.serif['"]\s*:\s*{[\s\S]*?fontFamily/;
      expect(tailwindConfig).toMatch(serifUtilityPattern);
    });

    /**
     * Verify .serif uses Playfair Display
     */
    it('should configure .serif utility with Playfair Display', () => {
      // Check that .serif uses Playfair Display
      const serifPattern = /['"]\.serif['"]\s*:\s*{[\s\S]*?Playfair Display/;
      expect(tailwindConfig).toMatch(serifPattern);
    });
  });
});
