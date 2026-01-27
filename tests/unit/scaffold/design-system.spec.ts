/**
 * Design System Integration Tests - Epic 1 Story 1.1
 *
 * Tests that verify the design system is properly integrated into the scaffold.
 * These tests should FAIL until the scaffold integrates the design system.
 *
 * Test IDs: DS-001 through DS-008
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();

describe('Design System Integration', () => {
  describe('Token Exports', () => {
    it('DS-001: should have design system tokens exported', () => {
      const indexPath = join(PROJECT_ROOT, 'design-system', 'index.ts');
      expect(existsSync(indexPath)).toBe(true);

      // Verify exports exist (static check)
      const content = readFileSync(indexPath, 'utf-8');
      expect(content).toContain('export');
    });

    it('DS-004: should have gold accent color defined', () => {
      const colorsPath = join(PROJECT_ROOT, 'design-system', 'tokens', 'colors.ts');
      expect(existsSync(colorsPath)).toBe(true);

      const content = readFileSync(colorsPath, 'utf-8');
      expect(content).toContain('#D4AF37');
    });

    it('DS-005: should have serif font family defined', () => {
      const typographyPath = join(PROJECT_ROOT, 'design-system', 'tokens', 'typography.ts');
      expect(existsSync(typographyPath)).toBe(true);

      const content = readFileSync(typographyPath, 'utf-8');
      expect(content).toContain('Playfair Display');
    });
  });

  describe('Global CSS', () => {
    it('DS-002: should have global CSS imported', () => {
      const globalsPath = join(PROJECT_ROOT, 'src', 'app', 'globals.css');
      expect(existsSync(globalsPath)).toBe(true);

      const content = readFileSync(globalsPath, 'utf-8');
      // Should either import design-system or contain orion tokens inline
      expect(
        content.includes('design-system') ||
        content.includes('--orion') ||
        content.includes('#D4AF37')
      ).toBe(true);
    });
  });

  describe('Tailwind Configuration', () => {
    it('DS-003: should have Tailwind preset configured', () => {
      const tailwindPath = join(PROJECT_ROOT, 'tailwind.config.ts');
      expect(existsSync(tailwindPath)).toBe(true);

      const content = readFileSync(tailwindPath, 'utf-8');
      // Should reference orion preset or orion colors
      expect(
        content.includes('orionTailwindPreset') ||
        content.includes('orion')
      ).toBe(true);
    });

    it('DS-006: should have zero border radius defined', () => {
      const tailwindPath = join(PROJECT_ROOT, 'design-system', 'tailwind.config.ts');
      expect(existsSync(tailwindPath)).toBe(true);

      const content = readFileSync(tailwindPath, 'utf-8');
      expect(content).toContain("none: '0'");
    });

    it('DS-007: should have layout dimensions defined', () => {
      const tailwindPath = join(PROJECT_ROOT, 'design-system', 'tailwind.config.ts');
      expect(existsSync(tailwindPath)).toBe(true);

      const content = readFileSync(tailwindPath, 'utf-8');
      expect(content).toContain("sidebar: '280px'");
      expect(content).toContain("header: '80px'");
    });
  });

  describe('shadcn Configuration', () => {
    it('DS-008: should have shadcn configured for orion', () => {
      const componentsPath = join(PROJECT_ROOT, 'components.json');
      expect(existsSync(componentsPath)).toBe(true);

      const config = JSON.parse(readFileSync(componentsPath, 'utf-8'));
      expect(config.tailwind).toBeDefined();
      // Verify it points to our globals
      expect(config.tailwind.css).toContain('globals.css');
    });
  });
});
