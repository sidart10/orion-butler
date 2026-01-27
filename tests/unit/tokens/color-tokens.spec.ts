/**
 * Story 1.3: Define CSS Design Tokens - Color Token Tests
 * Test ID: 1.3-UNIT-001 through 1.3-UNIT-020
 *
 * Tests that all color tokens are correctly defined in globals.css
 * AC#1: Color tokens exist with correct values
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Story 1.3: Color Tokens (AC#1)', () => {
  let globalsCss: string;

  beforeAll(() => {
    const cssPath = resolve(__dirname, '../../../design-system/styles/globals.css');
    globalsCss = readFileSync(cssPath, 'utf-8');
  });

  describe('Primary Colors', () => {
    it('1.3-UNIT-001: should define gold accent color --orion-gold: #D4AF37', () => {
      expect(globalsCss).toMatch(/--orion-gold:\s*#D4AF37/i);
    });

    it('1.3-UNIT-002: should define gold muted variant --orion-gold-muted: #C4A052', () => {
      expect(globalsCss).toMatch(/--orion-gold-muted:\s*#C4A052/i);
    });
  });

  describe('Background Colors (Light Mode)', () => {
    it('1.3-UNIT-003: should define background --orion-bg: #FAF8F5 (cream)', () => {
      expect(globalsCss).toMatch(/--orion-bg:\s*#FAF8F5/i);
    });

    it('1.3-UNIT-004: should define surface --orion-surface: #FFFFFF', () => {
      expect(globalsCss).toMatch(/--orion-surface:\s*#FFFFFF/i);
    });

    it('1.3-UNIT-005: should define surface elevated --orion-surface-elevated: #FFFFFF', () => {
      expect(globalsCss).toMatch(/--orion-surface-elevated:\s*#FFFFFF/i);
    });
  });

  describe('Foreground Colors (Light Mode)', () => {
    it('1.3-UNIT-006: should define foreground --orion-fg: #1A1A1A', () => {
      expect(globalsCss).toMatch(/--orion-fg:\s*#1A1A1A/i);
    });

    it('1.3-UNIT-007: should define foreground muted --orion-fg-muted: #6B6B6B', () => {
      expect(globalsCss).toMatch(/--orion-fg-muted:\s*#6B6B6B/i);
    });
  });

  describe('Border Colors (Light Mode)', () => {
    it('1.3-UNIT-008: should define border --orion-border: #E5E5E5', () => {
      expect(globalsCss).toMatch(/--orion-border:\s*#E5E5E5/i);
    });
  });

  describe('Status Colors (Light Mode)', () => {
    it('1.3-UNIT-009: should define blue (waiting) --orion-blue: #3B82F6', () => {
      expect(globalsCss).toMatch(/--orion-blue:\s*#3B82F6/i);
    });

    it('1.3-UNIT-010: should define success --orion-success: #059669', () => {
      expect(globalsCss).toMatch(/--orion-success:\s*#059669/i);
    });

    it('1.3-UNIT-011: should define error --orion-error: #9B2C2C', () => {
      expect(globalsCss).toMatch(/--orion-error:\s*#9B2C2C/i);
    });
  });

  describe('Scrollbar Colors', () => {
    it('1.3-UNIT-012: should define scrollbar --orion-scrollbar: #CCCCCC', () => {
      expect(globalsCss).toMatch(/--orion-scrollbar:\s*#CCCCCC/i);
    });
  });

  describe('Dark Mode Colors', () => {
    it('1.3-UNIT-013: should have dark mode media query', () => {
      expect(globalsCss).toMatch(/@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)/);
    });

    it('1.3-UNIT-014: should override --orion-bg to #121212 in dark mode', () => {
      // Check that #121212 appears in a dark mode context
      const darkModeMatch = globalsCss.match(/@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{[^}]*--orion-bg:\s*#121212/i);
      expect(darkModeMatch).toBeTruthy();
    });

    it('1.3-UNIT-015: should override --orion-surface to #1A1A1A in dark mode', () => {
      const darkModeMatch = globalsCss.match(/@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{[^}]*--orion-surface:\s*#1A1A1A/i);
      expect(darkModeMatch).toBeTruthy();
    });

    it('1.3-UNIT-016: should override --orion-surface-elevated to #242424 in dark mode', () => {
      const darkModeMatch = globalsCss.match(/@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{[^}]*--orion-surface-elevated:\s*#242424/i);
      expect(darkModeMatch).toBeTruthy();
    });

    it('1.3-UNIT-017: should override --orion-fg to #FAF8F5 in dark mode', () => {
      const darkModeMatch = globalsCss.match(/@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{[^}]*--orion-fg:\s*#FAF8F5/i);
      expect(darkModeMatch).toBeTruthy();
    });

    it('1.3-UNIT-018: should override --orion-fg-muted to #9CA3AF in dark mode', () => {
      const darkModeMatch = globalsCss.match(/@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{[^}]*--orion-fg-muted:\s*#9CA3AF/i);
      expect(darkModeMatch).toBeTruthy();
    });

    it('1.3-UNIT-019: should override --orion-border to #2D2D2D in dark mode', () => {
      const darkModeMatch = globalsCss.match(/@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{[^}]*--orion-border:\s*#2D2D2D/i);
      expect(darkModeMatch).toBeTruthy();
    });

    it('1.3-UNIT-020: should have .dark class for manual toggle', () => {
      expect(globalsCss).toMatch(/\.dark\s*\{/);
    });
  });
});
