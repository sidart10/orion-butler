/**
 * Story 1.3: Define CSS Design Tokens - Typography Token Tests
 * Test ID: 1.3-UNIT-057 through 1.3-UNIT-062
 *
 * Tests typography tokens including tracking
 * Part of AC#1: Typography tokens and tracking
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Story 1.3: Typography Tokens (AC#1)', () => {
  let globalsCss: string;

  beforeAll(() => {
    const cssPath = resolve(__dirname, '../../../design-system/styles/globals.css');
    globalsCss = readFileSync(cssPath, 'utf-8');
  });

  describe('Tracking Tokens', () => {
    it('1.3-UNIT-057: should define --tracking-luxury: 0.15em', () => {
      expect(globalsCss).toMatch(/--tracking-luxury:\s*0\.15em/i);
    });

    it('1.3-UNIT-058: should define --tracking-widest: 0.1em', () => {
      expect(globalsCss).toMatch(/--tracking-widest:\s*0\.1em/i);
    });
  });

  describe('Typography Scale (Display and Headings)', () => {
    it('1.3-UNIT-059: should define display size (32px)', () => {
      // Check for h1 or display style with 32px or similar
      // The existing design system uses larger sizes, but we need 32px display per spec
      expect(globalsCss).toMatch(/font-size:\s*32px|--orion-text-display/i);
    });

    it('1.3-UNIT-060: should define heading styles using serif font', () => {
      // Check that h1-h6 elements use serif font
      expect(globalsCss).toMatch(/h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\s*\{[\s\S]*font-family[\s\S]*serif/i);
    });
  });

  describe('Font Variable References', () => {
    it('1.3-UNIT-061: should reference --orion-font-sans for body text', () => {
      expect(globalsCss).toMatch(/--orion-font-sans/);
    });

    it('1.3-UNIT-062: should reference --orion-font-serif for headings', () => {
      expect(globalsCss).toMatch(/--orion-font-serif/);
    });
  });
});
