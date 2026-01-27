/**
 * Story 1.3: Define CSS Design Tokens - Animation Token Tests
 * Test ID: 1.3-UNIT-041 through 1.3-UNIT-056
 *
 * Tests that all animation tokens are correctly defined
 * AC#4: Animation tokens exist: 200ms entrance, 150ms exit, 100ms state change
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Story 1.3: Animation Tokens (AC#4)', () => {
  let globalsCss: string;
  let tailwindConfig: string;

  beforeAll(() => {
    const cssPath = resolve(__dirname, '../../../design-system/styles/globals.css');
    globalsCss = readFileSync(cssPath, 'utf-8');

    const tailwindPath = resolve(__dirname, '../../../tailwind.config.ts');
    tailwindConfig = readFileSync(tailwindPath, 'utf-8');
  });

  describe('Duration Tokens', () => {
    it('1.3-UNIT-041: should define --duration-entrance: 200ms', () => {
      expect(globalsCss).toMatch(/--duration-entrance:\s*200ms/i);
    });

    it('1.3-UNIT-042: should define --duration-exit: 150ms', () => {
      expect(globalsCss).toMatch(/--duration-exit:\s*150ms/i);
    });

    it('1.3-UNIT-043: should define --duration-state: 100ms', () => {
      expect(globalsCss).toMatch(/--duration-state:\s*100ms/i);
    });

    it('1.3-UNIT-044: should define --duration-canvas: 300ms', () => {
      expect(globalsCss).toMatch(/--duration-canvas:\s*300ms/i);
    });

    it('1.3-UNIT-045: should define --duration-pulse: 1500ms', () => {
      expect(globalsCss).toMatch(/--duration-pulse:\s*1500ms/i);
    });

    it('1.3-UNIT-046: should define --duration-spinner: 1000ms', () => {
      expect(globalsCss).toMatch(/--duration-spinner:\s*1000ms/i);
    });
  });

  describe('Easing Tokens', () => {
    it('1.3-UNIT-047: should define --easing-luxury: cubic-bezier(0.4, 0, 0.2, 1)', () => {
      expect(globalsCss).toMatch(/--easing-luxury:\s*cubic-bezier\(\s*0\.4\s*,\s*0\s*,\s*0\.2\s*,\s*1\s*\)/i);
    });

    it('1.3-UNIT-048: should define --easing-in: ease-in', () => {
      expect(globalsCss).toMatch(/--easing-in:\s*ease-in/i);
    });

    it('1.3-UNIT-049: should define --easing-out: ease-out', () => {
      expect(globalsCss).toMatch(/--easing-out:\s*ease-out/i);
    });
  });

  describe('Animation Keyframes', () => {
    it('1.3-UNIT-050: should define @keyframes reveal', () => {
      expect(globalsCss).toMatch(/@keyframes\s+(reveal|slideInUp)/);
    });

    it('1.3-UNIT-051: should define @keyframes fade-in or fadeIn', () => {
      expect(globalsCss).toMatch(/@keyframes\s+(fade-in|fadeIn)/);
    });

    it('1.3-UNIT-052: should define @keyframes pulse', () => {
      expect(globalsCss).toMatch(/@keyframes\s+pulse/);
    });

    it('1.3-UNIT-053: should define @keyframes spin', () => {
      expect(globalsCss).toMatch(/@keyframes\s+spin/);
    });
  });

  describe('Animation Utility Classes', () => {
    it('1.3-UNIT-054: should define .animate-reveal class', () => {
      expect(globalsCss).toMatch(/\.animate-reveal/);
    });

    it('1.3-UNIT-055: should define .animate-fade-in class', () => {
      expect(globalsCss).toMatch(/\.animate-fade-in/);
    });

    it('1.3-UNIT-056: should define stagger delay classes (.delay-1, .delay-2, .delay-3)', () => {
      expect(globalsCss).toMatch(/\.delay-1/);
      expect(globalsCss).toMatch(/\.delay-2/);
      expect(globalsCss).toMatch(/\.delay-3/);
    });
  });
});
