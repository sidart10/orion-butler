/**
 * Story 1.3: Define CSS Design Tokens - Border Radius Token Tests
 * Test ID: 1.3-UNIT-037 through 1.3-UNIT-040
 *
 * Tests that border radius is 0px throughout (Editorial Luxury principle)
 * AC#3: Border-radius is 0px throughout
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Story 1.3: Border Radius Tokens (AC#3)', () => {
  let globalsCss: string;
  let tailwindConfig: string;

  beforeAll(() => {
    const cssPath = resolve(__dirname, '../../../design-system/styles/globals.css');
    globalsCss = readFileSync(cssPath, 'utf-8');

    const tailwindPath = resolve(__dirname, '../../../tailwind.config.ts');
    tailwindConfig = readFileSync(tailwindPath, 'utf-8');
  });

  describe('CSS Variables', () => {
    it('1.3-UNIT-037: should define --radius: 0rem for shadcn/ui compatibility', () => {
      expect(globalsCss).toMatch(/--radius:\s*0(rem|px)?/i);
    });

    it('1.3-UNIT-038: should enforce 0 border-radius on all elements', () => {
      // The design system should have a rule that enforces 0 border-radius
      expect(globalsCss).toMatch(/border-radius:\s*0/i);
    });
  });

  describe('Tailwind Configuration', () => {
    it('1.3-UNIT-039: should configure borderRadius.none as 0', () => {
      expect(tailwindConfig).toMatch(/borderRadius/);
      expect(tailwindConfig).toMatch(/none.*['"]?0['"]?/);
    });
  });

  describe('Global Enforcement', () => {
    it('1.3-UNIT-040: should have global border-radius: 0 !important rule', () => {
      // Check for the global enforcement rule
      expect(globalsCss).toMatch(/border-radius:\s*0\s*!important/i);
    });
  });
});
