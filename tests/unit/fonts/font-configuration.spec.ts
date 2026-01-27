/**
 * Font Configuration Tests - Story 1.2
 *
 * Tests 1.2-UNIT-001 through 1.2-UNIT-012: Verify font imports, configuration,
 * CSS variables, and HTML element application in layout.tsx
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const LAYOUT_PATH = path.join(process.cwd(), 'src/app/layout.tsx');

describe('Story 1.2: Font Configuration', () => {
  let layoutContent: string;

  beforeAll(() => {
    layoutContent = fs.readFileSync(LAYOUT_PATH, 'utf-8');
  });

  describe('AC1: Playfair Display Configuration', () => {
    /**
     * 1.2-UNIT-001: Verify Playfair Display font imported in layout.tsx
     */
    it('1.2-UNIT-001: should import Playfair_Display from next/font/google', () => {
      // Check for Playfair_Display import from next/font/google
      const importPattern = /import\s*{[^}]*Playfair_Display[^}]*}\s*from\s*['"]next\/font\/google['"]/;
      expect(layoutContent).toMatch(importPattern);
    });

    /**
     * 1.2-UNIT-002: Verify Playfair Display font configuration includes required weights
     */
    it('1.2-UNIT-002: should configure Playfair_Display with weights 400-900', () => {
      // Per story requirements: weights 400, 500, 600, 700, 800, 900
      const requiredWeights = ['400', '500', '600', '700', '800', '900'];

      // Check for weight configuration in Playfair_Display call
      const playfairConfigPattern = /Playfair_Display\s*\(\s*{[\s\S]*?weight\s*:\s*\[([^\]]+)\]/;
      const match = layoutContent.match(playfairConfigPattern);

      expect(match).toBeTruthy();
      if (match) {
        const weightsStr = match[1];
        for (const weight of requiredWeights) {
          // Match either single or double quotes around weight values
          expect(weightsStr).toMatch(new RegExp(`['"]${weight}['"]`));
        }
      }
    });

    /**
     * 1.2-UNIT-003: Verify Playfair Display includes italic variant
     */
    it('1.2-UNIT-003: should configure Playfair_Display with italic style', () => {
      // Check for style configuration including 'italic'
      const stylePattern = /Playfair_Display\s*\(\s*{[\s\S]*?style\s*:\s*\[[^\]]*['"]italic['"][^\]]*\]/;
      expect(layoutContent).toMatch(stylePattern);
    });

    /**
     * 1.2-UNIT-004: Verify Playfair Display CSS variable defined
     */
    it('1.2-UNIT-004: should define --font-playfair CSS variable', () => {
      // Check for variable: '--font-playfair' in Playfair_Display config
      const variablePattern = /Playfair_Display\s*\(\s*{[\s\S]*?variable\s*:\s*['"]--font-playfair['"]/;
      expect(layoutContent).toMatch(variablePattern);
    });

    /**
     * 1.2-UNIT-005: Verify Playfair Display applied to HTML element
     */
    it('1.2-UNIT-005: should apply playfair.variable to HTML element className', () => {
      // Check that playfair.variable is used in className on html element
      // Pattern matches template literal: className={`...${playfair.variable}...`}
      // The template literal uses backticks and ${} for interpolation
      const htmlPattern = /<html[^>]*className\s*=\s*\{`[^`]*\$\{playfair\.variable\}[^`]*`\}/;
      expect(layoutContent).toMatch(htmlPattern);
    });

    /**
     * 1.2-UNIT-006: Verify Playfair Display subset is 'latin'
     */
    it('1.2-UNIT-006: should configure Playfair_Display with latin subset', () => {
      const subsetPattern = /Playfair_Display\s*\(\s*{[\s\S]*?subsets\s*:\s*\[[^\]]*['"]latin['"][^\]]*\]/;
      expect(layoutContent).toMatch(subsetPattern);
    });
  });

  describe('AC2: Inter Font Configuration', () => {
    /**
     * 1.2-UNIT-007: Verify Inter font imported in layout.tsx
     */
    it('1.2-UNIT-007: should import Inter from next/font/google', () => {
      const importPattern = /import\s*{[^}]*Inter[^}]*}\s*from\s*['"]next\/font\/google['"]/;
      expect(layoutContent).toMatch(importPattern);
    });

    /**
     * 1.2-UNIT-008: Verify Inter font configuration includes latin subset
     * Note: Inter is a variable font, so weights are included by default
     */
    it('1.2-UNIT-008: should configure Inter with latin subset', () => {
      const subsetPattern = /Inter\s*\(\s*{[\s\S]*?subsets\s*:\s*\[[^\]]*['"]latin['"][^\]]*\]/;
      expect(layoutContent).toMatch(subsetPattern);
    });

    /**
     * 1.2-UNIT-009: Verify Inter CSS variable defined
     */
    it('1.2-UNIT-009: should define --font-inter CSS variable', () => {
      const variablePattern = /Inter\s*\(\s*{[\s\S]*?variable\s*:\s*['"]--font-inter['"]/;
      expect(layoutContent).toMatch(variablePattern);
    });

    /**
     * 1.2-UNIT-010: Verify Inter applied to HTML element
     */
    it('1.2-UNIT-010: should apply inter.variable to HTML element className', () => {
      // Pattern matches template literal: className={`...${inter.variable}...`}
      const htmlPattern = /<html[^>]*className\s*=\s*\{`[^`]*\$\{inter\.variable\}[^`]*`\}/;
      expect(layoutContent).toMatch(htmlPattern);
    });

    /**
     * 1.2-UNIT-011: Verify body default font is Inter (font-sans class)
     */
    it('1.2-UNIT-011: should apply font-sans class to body element', () => {
      // Check that body has font-sans class for Inter as default
      // Pattern matches either template literal: className={`...font-sans...`}
      // or regular string: className="...font-sans..."
      const bodyPatternTemplate = /<body[^>]*className\s*=\s*\{`[^`]*font-sans[^`]*`\}/;
      const bodyPatternString = /<body[^>]*className\s*=\s*"[^"]*font-sans[^"]*"/;
      const matchesTemplate = bodyPatternTemplate.test(layoutContent);
      const matchesString = bodyPatternString.test(layoutContent);
      expect(matchesTemplate || matchesString).toBe(true);
    });
  });

  describe('AC3: FOUT Prevention Configuration', () => {
    /**
     * 1.2-UNIT-012: Verify font-display is set to 'swap' for both fonts
     */
    it('1.2-UNIT-012: should set display: swap for Inter font', () => {
      const interDisplayPattern = /Inter\s*\(\s*{[\s\S]*?display\s*:\s*['"]swap['"]/;
      expect(layoutContent).toMatch(interDisplayPattern);
    });

    it('1.2-UNIT-012b: should set display: swap for Playfair_Display font', () => {
      const playfairDisplayPattern = /Playfair_Display\s*\(\s*{[\s\S]*?display\s*:\s*['"]swap['"]/;
      expect(layoutContent).toMatch(playfairDisplayPattern);
    });
  });
});
