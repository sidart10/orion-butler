/**
 * Story 1.3: Define CSS Design Tokens - shadcn/ui Override Tests
 * Test ID: 1.3-UNIT-063 through 1.3-UNIT-070
 *
 * Tests that shadcn/ui CSS variables are correctly overridden
 * AC#1, AC#3: shadcn/ui compatibility with Orion design tokens
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Story 1.3: shadcn/ui CSS Variable Overrides (AC#1, AC#3)', () => {
  let globalsCss: string;

  beforeAll(() => {
    const cssPath = resolve(__dirname, '../../../design-system/styles/globals.css');
    globalsCss = readFileSync(cssPath, 'utf-8');
  });

  describe('shadcn/ui Background Overrides', () => {
    it('1.3-UNIT-063: should override --background to Orion cream HSL value', () => {
      // Cream #FAF8F5 in HSL is approximately 38 33% 97%
      expect(globalsCss).toMatch(/--background:\s*38\s+33%?\s+97%?/i);
    });
  });

  describe('shadcn/ui Foreground Overrides', () => {
    it('1.3-UNIT-064: should override --foreground to Orion black HSL value', () => {
      // Black #1A1A1A in HSL is approximately 0 0% 10%
      expect(globalsCss).toMatch(/--foreground:\s*0\s+0%?\s+10%?/i);
    });
  });

  describe('shadcn/ui Primary Color Overrides', () => {
    it('1.3-UNIT-065: should override --primary to Orion gold HSL value', () => {
      // Gold #D4AF37 in HSL is approximately 43 65% 52%
      expect(globalsCss).toMatch(/--primary:\s*43\s+65%?\s+52%?/i);
    });

    it('1.3-UNIT-066: should override --primary-foreground', () => {
      expect(globalsCss).toMatch(/--primary-foreground/);
    });
  });

  describe('shadcn/ui Radius Override', () => {
    it('1.3-UNIT-067: should override --radius to 0rem', () => {
      expect(globalsCss).toMatch(/--radius:\s*0(rem)?/i);
    });
  });

  describe('Dark Mode shadcn/ui Overrides', () => {
    it('1.3-UNIT-068: should override --background in dark mode', () => {
      // Dark background #121212 in HSL is approximately 0 0% 7%
      const darkSection = globalsCss.match(/@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{[\s\S]*?--background:[^;]*/);
      expect(darkSection).toBeTruthy();
    });

    it('1.3-UNIT-069: should override --foreground in dark mode', () => {
      // Dark foreground #FAF8F5 in HSL is approximately 38 33% 97%
      const darkSection = globalsCss.match(/@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{[\s\S]*?--foreground:[^;]*/);
      expect(darkSection).toBeTruthy();
    });
  });

  describe('Variable Completeness', () => {
    it('1.3-UNIT-070: should have all required shadcn/ui base variables', () => {
      expect(globalsCss).toMatch(/--background/);
      expect(globalsCss).toMatch(/--foreground/);
      expect(globalsCss).toMatch(/--primary/);
      expect(globalsCss).toMatch(/--radius/);
    });
  });
});
