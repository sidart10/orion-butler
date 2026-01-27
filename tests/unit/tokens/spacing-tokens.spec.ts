/**
 * Story 1.3: Define CSS Design Tokens - Spacing Token Tests
 * Test ID: 1.3-UNIT-021 through 1.3-UNIT-036
 *
 * Tests that all spacing tokens are correctly defined
 * AC#2: Spacing tokens exist with 4px base unit
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Story 1.3: Spacing Tokens (AC#2)', () => {
  let globalsCss: string;

  beforeAll(() => {
    const cssPath = resolve(__dirname, '../../../design-system/styles/globals.css');
    globalsCss = readFileSync(cssPath, 'utf-8');
  });

  describe('Base Spacing Scale', () => {
    it('1.3-UNIT-021: should define --space-1: 4px', () => {
      expect(globalsCss).toMatch(/--space-1:\s*4px/i);
    });

    it('1.3-UNIT-022: should define --space-2: 8px', () => {
      expect(globalsCss).toMatch(/--space-2:\s*8px/i);
    });

    it('1.3-UNIT-023: should define --space-3: 12px', () => {
      expect(globalsCss).toMatch(/--space-3:\s*12px/i);
    });

    it('1.3-UNIT-024: should define --space-4: 16px', () => {
      expect(globalsCss).toMatch(/--space-4:\s*16px/i);
    });

    it('1.3-UNIT-025: should define --space-6: 24px', () => {
      expect(globalsCss).toMatch(/--space-6:\s*24px/i);
    });

    it('1.3-UNIT-026: should define --space-8: 32px', () => {
      expect(globalsCss).toMatch(/--space-8:\s*32px/i);
    });

    it('1.3-UNIT-027: should define --space-12: 48px', () => {
      expect(globalsCss).toMatch(/--space-12:\s*48px/i);
    });

    it('1.3-UNIT-028: should define --space-16: 64px', () => {
      expect(globalsCss).toMatch(/--space-16:\s*64px/i);
    });
  });

  describe('Layout Dimension Tokens', () => {
    it('1.3-UNIT-029: should define --orion-header-height: 80px', () => {
      expect(globalsCss).toMatch(/--orion-header-height:\s*80px/i);
    });

    it('1.3-UNIT-030: should define --orion-sidebar-width: 280px', () => {
      expect(globalsCss).toMatch(/--orion-sidebar-width:\s*280px/i);
    });

    it('1.3-UNIT-031: should define --orion-sidebar-collapsed: 72px', () => {
      expect(globalsCss).toMatch(/--orion-sidebar-collapsed:\s*72px/i);
    });

    it('1.3-UNIT-032: should define --orion-rail-width: 64px', () => {
      expect(globalsCss).toMatch(/--orion-rail-width:\s*64px/i);
    });

    it('1.3-UNIT-033: should define --orion-content-max-width: 850px', () => {
      expect(globalsCss).toMatch(/--orion-content-max-width:\s*850px/i);
    });

    it('1.3-UNIT-034: should define --orion-canvas-width: 480px', () => {
      expect(globalsCss).toMatch(/--orion-canvas-width:\s*480px/i);
    });

    it('1.3-UNIT-035: should define --orion-context-width: 320px', () => {
      expect(globalsCss).toMatch(/--orion-context-width:\s*320px/i);
    });
  });

  describe('Spacing Base Unit Documentation', () => {
    it('1.3-UNIT-036: should have base unit comment /* Base unit: 4px */', () => {
      expect(globalsCss).toMatch(/\/\*.*base\s*unit.*4px.*\*\//i);
    });
  });
});
