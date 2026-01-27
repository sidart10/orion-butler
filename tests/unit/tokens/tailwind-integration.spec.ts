/**
 * Story 1.3: Define CSS Design Tokens - Tailwind Integration Tests
 * Test ID: 1.3-UNIT-071 through 1.3-UNIT-085
 *
 * Tests that Tailwind is correctly configured with Orion tokens
 * AC#1, AC#2, AC#3, AC#4: Tailwind extends with tokens
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Story 1.3: Tailwind Integration (AC#1, AC#2, AC#3, AC#4)', () => {
  let tailwindConfig: string;

  beforeAll(() => {
    const tailwindPath = resolve(__dirname, '../../../tailwind.config.ts');
    tailwindConfig = readFileSync(tailwindPath, 'utf-8');
  });

  describe('Color Extensions (AC#1)', () => {
    it('1.3-UNIT-071: should extend colors with orion namespace', () => {
      expect(tailwindConfig).toMatch(/colors:\s*\{[\s\S]*orion/);
    });

    it('1.3-UNIT-072: should include gold color reference', () => {
      expect(tailwindConfig).toMatch(/gold|primary.*#D4AF37/i);
    });

    it('1.3-UNIT-073: should include bg color reference', () => {
      expect(tailwindConfig).toMatch(/bg.*#F[9A]F8F[56]|bg:\s*\{/i);
    });

    it('1.3-UNIT-074: should include fg color reference', () => {
      expect(tailwindConfig).toMatch(/fg.*#1A1A1A|fg:\s*\{/i);
    });
  });

  describe('Spacing Extensions (AC#2)', () => {
    it('1.3-UNIT-075: should extend spacing configuration', () => {
      expect(tailwindConfig).toMatch(/spacing:\s*\{/);
    });

    it('1.3-UNIT-076: should include header spacing', () => {
      expect(tailwindConfig).toMatch(/header.*80px|header:/i);
    });

    it('1.3-UNIT-077: should include sidebar spacing', () => {
      expect(tailwindConfig).toMatch(/sidebar.*280px|sidebar:/i);
    });

    it('1.3-UNIT-078: should include content max width', () => {
      expect(tailwindConfig).toMatch(/content.*850px|maxWidth[\s\S]*content/i);
    });
  });

  describe('Border Radius Configuration (AC#3)', () => {
    it('1.3-UNIT-079: should configure borderRadius', () => {
      expect(tailwindConfig).toMatch(/borderRadius/);
    });

    it('1.3-UNIT-080: should have none borderRadius set to 0', () => {
      expect(tailwindConfig).toMatch(/none.*['"]?0['"]?/);
    });
  });

  describe('Animation Extensions (AC#4)', () => {
    it('1.3-UNIT-081: should extend transitionDuration', () => {
      expect(tailwindConfig).toMatch(/transitionDuration/);
    });

    it('1.3-UNIT-082: should extend transitionTimingFunction', () => {
      expect(tailwindConfig).toMatch(/transitionTimingFunction/);
    });

    it('1.3-UNIT-083: should define keyframes', () => {
      expect(tailwindConfig).toMatch(/keyframes/);
    });

    it('1.3-UNIT-084: should define animation utilities', () => {
      expect(tailwindConfig).toMatch(/animation:\s*\{/);
    });
  });

  describe('Letter Spacing Extensions', () => {
    it('1.3-UNIT-085: should extend letterSpacing with luxury', () => {
      expect(tailwindConfig).toMatch(/letterSpacing[\s\S]*luxury/);
    });
  });
});
