# ATDD Checklist: Story 1.3 - Design System Foundation

**Story ID:** 1-3-design-system-foundation
**Epic:** 1 - Foundation & First Chat
**Generated:** 2026-01-15
**Status:** Ready for TDD Implementation

---

## Test Summary

| Metric | Value |
|--------|-------|
| Total Test Scenarios | 28 |
| Unit Tests | 10 |
| Integration Tests | 4 |
| E2E/Visual Tests | 12 |
| Accessibility Tests | 2 |
| Priority | P1 |
| Risk Level | LOW |

---

## AC1: Typography System

**Given** the app is running
**When** any screen loads
**Then** typography uses Playfair Display for headlines and Inter for body text

### Test Scenarios

| ID | Type | Test Description | Expected Result | Priority |
|----|------|------------------|-----------------|----------|
| 1.3.1 | Unit | Verify serif class maps to Playfair Display | `fontFamily.serif[0]` = 'Playfair Display' | P0 |
| 1.3.2 | Unit | Verify sans class maps to Inter | `fontFamily.sans[0]` = 'Inter' | P0 |
| 1.3.3 | E2E | Headlines render with Playfair Display | `.serif` elements have `font-family: 'Playfair Display'` | P0 |
| 1.3.4 | E2E | Body text renders with Inter | `body` has `font-family: 'Inter'` | P0 |
| 1.3.5 | E2E | Google Fonts preload links present | `<link rel="preconnect">` to fonts.googleapis.com | P1 |
| 1.3.6 | Unit | Font weight tokens match spec | Headline weights: 400-900, Body: 100-900 | P1 |

### Playwright Test Code

```typescript
// tests/e2e/story-1.3-typography.spec.ts
import { test, expect } from '@playwright/test';

test.describe('AC1: Typography System', () => {

  test('1.3.3 - headlines render with Playfair Display', async ({ page }) => {
    await page.goto('/');

    const headline = page.locator('.serif').first();
    const fontFamily = await headline.evaluate(el =>
      getComputedStyle(el).fontFamily
    );

    expect(fontFamily).toMatch(/Playfair Display/i);
  });

  test('1.3.4 - body text renders with Inter', async ({ page }) => {
    await page.goto('/');

    const body = page.locator('body');
    const fontFamily = await body.evaluate(el =>
      getComputedStyle(el).fontFamily
    );

    expect(fontFamily).toMatch(/Inter/i);
  });

  test('1.3.5 - Google Fonts preconnect links present', async ({ page }) => {
    await page.goto('/');

    const preconnectGoogle = page.locator('link[rel="preconnect"][href*="fonts.googleapis.com"]');
    const preconnectGstatic = page.locator('link[rel="preconnect"][href*="fonts.gstatic.com"]');

    await expect(preconnectGoogle).toHaveCount(1);
    await expect(preconnectGstatic).toHaveCount(1);
  });

});
```

### Unit Test Code

```typescript
// tests/unit/story-1.3-typography.spec.ts
import { describe, test, expect } from 'vitest';
import { typography } from '@/design-system/tokens';

describe('AC1: Typography System - Unit Tests', () => {

  test('1.3.1 - serif class maps to Playfair Display', () => {
    expect(typography.fontFamily.serif[0]).toBe('Playfair Display');
  });

  test('1.3.2 - sans class maps to Inter', () => {
    expect(typography.fontFamily.sans[0]).toBe('Inter');
  });

  test('1.3.6 - font weight tokens include full range', () => {
    const weights = typography.fontWeight;
    expect(weights).toHaveProperty('thin', '100');
    expect(weights).toHaveProperty('normal', '400');
    expect(weights).toHaveProperty('bold', '700');
    expect(weights).toHaveProperty('black', '900');
  });

});
```

---

## AC2: Color Palette

**Given** the app is running
**When** colors are applied
**Then** Gold (#D4AF37), Cream (#F9F8F6), and Black (#1A1A1A) are used correctly

### Test Scenarios

| ID | Type | Test Description | Expected Result | Priority |
|----|------|------------------|-----------------|----------|
| 1.3.7 | Unit | Gold color token is #D4AF37 | `colors.primary.DEFAULT` = '#D4AF37' | P0 |
| 1.3.8 | Unit | Cream color token is #F9F8F6 | `colors.background` = '#F9F8F6' | P0 |
| 1.3.9 | Unit | Black color token is #1A1A1A | `colors.foreground` = '#1A1A1A' | P0 |
| 1.3.10 | E2E | Background renders as cream | `body` background-color = rgb(249, 248, 246) | P0 |
| 1.3.11 | E2E | Text renders as black | `body` color = rgb(26, 26, 26) | P0 |
| 1.3.12 | E2E | Tailwind classes work (bg-orion-primary) | Element has gold background | P1 |

### Playwright Test Code

```typescript
// tests/e2e/story-1.3-colors.spec.ts
import { test, expect } from '@playwright/test';

test.describe('AC2: Color Palette', () => {

  test('1.3.10 - background renders as cream (#F9F8F6)', async ({ page }) => {
    await page.goto('/');

    const body = page.locator('body');
    const bgColor = await body.evaluate(el =>
      getComputedStyle(el).backgroundColor
    );

    // #F9F8F6 = rgb(249, 248, 246)
    expect(bgColor).toBe('rgb(249, 248, 246)');
  });

  test('1.3.11 - text renders as black (#1A1A1A)', async ({ page }) => {
    await page.goto('/');

    const body = page.locator('body');
    const textColor = await body.evaluate(el =>
      getComputedStyle(el).color
    );

    // #1A1A1A = rgb(26, 26, 26)
    expect(textColor).toBe('rgb(26, 26, 26)');
  });

  test('1.3.12 - Tailwind orion-primary class applies gold', async ({ page }) => {
    await page.goto('/design-system-test');

    const goldElement = page.locator('.bg-orion-primary').first();
    const bgColor = await goldElement.evaluate(el =>
      getComputedStyle(el).backgroundColor
    );

    // #D4AF37 = rgb(212, 175, 55)
    expect(bgColor).toBe('rgb(212, 175, 55)');
  });

});
```

### Unit Test Code

```typescript
// tests/unit/story-1.3-colors.spec.ts
import { describe, test, expect } from 'vitest';
import { colors } from '@/design-system/tokens';

describe('AC2: Color Palette - Unit Tests', () => {

  test('1.3.7 - gold color is #D4AF37', () => {
    expect(colors.primary.DEFAULT).toBe('#D4AF37');
  });

  test('1.3.8 - cream color is #F9F8F6', () => {
    expect(colors.background).toBe('#F9F8F6');
  });

  test('1.3.9 - black color is #1A1A1A', () => {
    expect(colors.foreground).toBe('#1A1A1A');
  });

});
```

---

## AC3: Zero Border Radius

**Given** any UI component renders
**When** it has borders or backgrounds
**Then** all corners are sharp (border-radius: 0)

### Test Scenarios

| ID | Type | Test Description | Expected Result | Priority |
|----|------|------------------|-----------------|----------|
| 1.3.13 | E2E | shadcn Button has zero border radius | `border-radius: 0px` | P0 |
| 1.3.14 | E2E | shadcn Card has zero border radius | `border-radius: 0px` | P0 |
| 1.3.15 | E2E | Input fields have zero border radius | `border-radius: 0px` | P1 |
| 1.3.16 | Unit | CSS variable --radius is 0 | `--radius: 0rem` | P0 |

### Playwright Test Code

```typescript
// tests/e2e/story-1.3-radius.spec.ts
import { test, expect } from '@playwright/test';

test.describe('AC3: Zero Border Radius', () => {

  test('1.3.13 - shadcn Button has zero border radius', async ({ page }) => {
    await page.goto('/design-system-test');

    const button = page.locator('button').first();
    const borderRadius = await button.evaluate(el =>
      getComputedStyle(el).borderRadius
    );

    expect(borderRadius).toBe('0px');
  });

  test('1.3.14 - luxury-card has zero border radius', async ({ page }) => {
    await page.goto('/design-system-test');

    const card = page.locator('.luxury-card').first();
    const borderRadius = await card.evaluate(el =>
      getComputedStyle(el).borderRadius
    );

    expect(borderRadius).toBe('0px');
  });

  test('1.3.15 - input fields have zero border radius', async ({ page }) => {
    await page.goto('/design-system-test');

    const input = page.locator('input').first();
    const borderRadius = await input.evaluate(el =>
      getComputedStyle(el).borderRadius
    );

    expect(borderRadius).toBe('0px');
  });

  test('1.3.16 - CSS variable --radius is 0', async ({ page }) => {
    await page.goto('/');

    const radius = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--radius').trim()
    );

    expect(radius).toBe('0rem');
  });

});
```

---

## AC4: Layout Grid

**Given** the app shell loads
**When** measuring the layout
**Then** dimensions match: header 80px, sidebar 280px, agent rail 64px, content max-width 850px

### Test Scenarios

| ID | Type | Test Description | Expected Result | Priority |
|----|------|------------------|-----------------|----------|
| 1.3.17 | E2E | CSS variable --orion-header-height | `80px` | P0 |
| 1.3.18 | E2E | CSS variable --orion-sidebar-width | `280px` | P0 |
| 1.3.19 | E2E | CSS variable --orion-rail-width | `64px` | P0 |
| 1.3.20 | E2E | CSS variable --orion-content-max-width | `850px` | P0 |

### Playwright Test Code

```typescript
// tests/e2e/story-1.3-layout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('AC4: Layout Grid', () => {

  test('1.3.17 - header height CSS variable is 80px', async ({ page }) => {
    await page.goto('/');

    const headerHeight = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--orion-header-height').trim()
    );

    expect(headerHeight).toBe('80px');
  });

  test('1.3.18 - sidebar width CSS variable is 280px', async ({ page }) => {
    await page.goto('/');

    const sidebarWidth = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--orion-sidebar-width').trim()
    );

    expect(sidebarWidth).toBe('280px');
  });

  test('1.3.19 - rail width CSS variable is 64px', async ({ page }) => {
    await page.goto('/');

    const railWidth = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--orion-rail-width').trim()
    );

    expect(railWidth).toBe('64px');
  });

  test('1.3.20 - content max-width CSS variable is 850px', async ({ page }) => {
    await page.goto('/');

    const contentMaxWidth = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--orion-content-max-width').trim()
    );

    expect(contentMaxWidth).toBe('850px');
  });

});
```

---

## AC5: Tailwind Config Enforces Design

**Given** a developer uses Tailwind classes
**When** they apply design tokens
**Then** only Orion palette colors are available

### Test Scenarios

| ID | Type | Test Description | Expected Result | Priority |
|----|------|------------------|-----------------|----------|
| 1.3.21 | Integration | Tailwind preset exports orionTailwindPreset | Export exists and is valid | P0 |
| 1.3.22 | Integration | Preset includes orion color tokens | `theme.extend.colors.orion` defined | P0 |
| 1.3.23 | E2E | Tailwind build succeeds with preset | `pnpm dev` runs without errors | P0 |

### Integration Test Code

```typescript
// tests/integration/story-1.3-tailwind.spec.ts
import { describe, test, expect } from 'vitest';
import { orionTailwindPreset } from '@/design-system/tailwind.config';

describe('AC5: Tailwind Config - Integration Tests', () => {

  test('1.3.21 - orionTailwindPreset is exported', () => {
    expect(orionTailwindPreset).toBeDefined();
    expect(orionTailwindPreset).toHaveProperty('theme');
  });

  test('1.3.22 - preset includes orion color tokens', () => {
    const colors = orionTailwindPreset.theme?.extend?.colors;

    expect(colors).toHaveProperty('orion');
    expect(colors.orion).toHaveProperty('primary');
    expect(colors.orion).toHaveProperty('bg');
    expect(colors.orion).toHaveProperty('fg');
  });

  test('1.3.23 - preset includes typography', () => {
    const fontFamily = orionTailwindPreset.theme?.extend?.fontFamily;

    expect(fontFamily).toHaveProperty('serif');
    expect(fontFamily).toHaveProperty('sans');
  });

});
```

---

## AC6: Component Classes Work

**Given** components use design system classes
**When** they render
**Then** semantic classes resolve correctly

### Test Scenarios

| ID | Type | Test Description | Expected Result | Priority |
|----|------|------------------|-----------------|----------|
| 1.3.24 | E2E | .btn-gold-slide has correct hover effect | Gold slide-in on hover | P1 |
| 1.3.25 | E2E | .luxury-card has gold top border | `border-top: 1px solid gold` | P1 |
| 1.3.26 | E2E | .input-editorial has underline style | Border-bottom only | P1 |
| 1.3.27 | E2E | .chat-user has black bg, cream text | Correct colors | P1 |
| 1.3.28 | E2E | .chat-agent has gold left border | `border-left: gold` | P1 |
| 1.3.29 | Visual | Design system test page matches baseline | Screenshot diff < 1% | P1 |

### Playwright Test Code

```typescript
// tests/e2e/story-1.3-components.spec.ts
import { test, expect } from '@playwright/test';

test.describe('AC6: Component Classes', () => {

  test('1.3.25 - luxury-card has gold top border', async ({ page }) => {
    await page.goto('/design-system-test');

    const card = page.locator('.luxury-card').first();
    const borderTop = await card.evaluate(el =>
      getComputedStyle(el).borderTopColor
    );

    // Gold = rgb(212, 175, 55)
    expect(borderTop).toBe('rgb(212, 175, 55)');
  });

  test('1.3.27 - chat-user has black bg and cream text', async ({ page }) => {
    await page.goto('/design-system-test');

    const chatUser = page.locator('.chat-user').first();

    const bgColor = await chatUser.evaluate(el =>
      getComputedStyle(el).backgroundColor
    );
    const textColor = await chatUser.evaluate(el =>
      getComputedStyle(el).color
    );

    // Black bg = rgb(26, 26, 26), Cream text = rgb(249, 248, 246)
    expect(bgColor).toBe('rgb(26, 26, 26)');
    expect(textColor).toBe('rgb(249, 248, 246)');
  });

  test('1.3.28 - chat-agent has gold left border', async ({ page }) => {
    await page.goto('/design-system-test');

    const chatAgent = page.locator('.chat-agent').first();
    const borderLeft = await chatAgent.evaluate(el =>
      getComputedStyle(el).borderLeftColor
    );

    // Gold = rgb(212, 175, 55)
    expect(borderLeft).toBe('rgb(212, 175, 55)');
  });

});

// tests/visual/story-1.3-visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('AC6: Visual Regression', () => {

  test('1.3.29 - design system test page matches baseline', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/design-system-test');

    // Wait for fonts to load
    await page.waitForFunction(() => document.fonts.ready);

    await expect(page).toHaveScreenshot('design-system-foundation.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

});
```

---

## AC7: Accessibility (WCAG AA)

**Given** text is displayed
**When** measuring contrast ratios
**Then** all text meets WCAG AA (4.5:1 minimum)

### Test Scenarios

| ID | Type | Test Description | Expected Result | Priority |
|----|------|------------------|-----------------|----------|
| 1.3.30 | Accessibility | Black on Cream contrast | Ratio >= 14:1 (PASS) | P0 |
| 1.3.31 | Accessibility | axe-core finds no contrast violations | violations.length = 0 | P0 |

### Accessibility Test Code

```typescript
// tests/a11y/story-1.3-contrast.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('AC7: Accessibility - Color Contrast', () => {

  test('1.3.30 - primary text meets WCAG AA contrast', async ({ page }) => {
    await page.goto('/');

    // Verify black (#1A1A1A) on cream (#F9F8F6) programmatically
    // Contrast ratio should be ~14.7:1 (well above 4.5:1 minimum)
    const contrast = await page.evaluate(() => {
      // Get computed colors
      const body = document.body;
      const style = getComputedStyle(body);
      const bg = style.backgroundColor; // rgb(249, 248, 246)
      const fg = style.color; // rgb(26, 26, 26)

      // Parse RGB values
      const parseBg = bg.match(/\d+/g)!.map(Number);
      const parseFg = fg.match(/\d+/g)!.map(Number);

      // Calculate relative luminance (simplified)
      const luminance = (rgb: number[]) => {
        const [r, g, b] = rgb.map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };

      const l1 = luminance(parseBg);
      const l2 = luminance(parseFg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

      return ratio;
    });

    // WCAG AA requires 4.5:1 for normal text
    expect(contrast).toBeGreaterThan(4.5);
    // Our combination should be ~14.7:1
    expect(contrast).toBeGreaterThan(14);
  });

  test('1.3.31 - axe-core finds no color contrast violations', async ({ page }) => {
    await page.goto('/design-system-test');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    // Filter to only color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    if (contrastViolations.length > 0) {
      console.log('Contrast violations found:');
      contrastViolations.forEach(v => {
        v.nodes.forEach(node => {
          console.log(`  - ${node.html}: ${node.failureSummary}`);
        });
      });
    }

    expect(contrastViolations).toHaveLength(0);
  });

});
```

---

## Test Infrastructure Requirements

### Dependencies to Install

```bash
# Playwright with accessibility testing
pnpm add -D @playwright/test @axe-core/playwright

# Unit testing
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

### Test File Structure

```
tests/
├── unit/
│   ├── story-1.3-typography.spec.ts
│   └── story-1.3-colors.spec.ts
├── integration/
│   └── story-1.3-tailwind.spec.ts
├── e2e/
│   ├── story-1.3-typography.spec.ts
│   ├── story-1.3-colors.spec.ts
│   ├── story-1.3-radius.spec.ts
│   ├── story-1.3-layout.spec.ts
│   └── story-1.3-components.spec.ts
├── visual/
│   └── story-1.3-visual.spec.ts
└── a11y/
    └── story-1.3-contrast.spec.ts
```

### Test Page Required

Create `/design-system-test` page with all component classes for testing:

```tsx
// src/app/design-system-test/page.tsx
export default function DesignSystemTest() {
  return (
    <div className="bg-orion-bg min-h-screen p-8">
      <h1 className="serif text-7xl text-orion-fg mb-8">Design System</h1>

      {/* Typography */}
      <section className="mb-12">
        <h2 className="serif text-4xl mb-4">Typography</h2>
        <h1 className="serif text-7xl">Headline 1 - Playfair Display</h1>
        <p className="text-base">Body text in Inter</p>
      </section>

      {/* Colors */}
      <section className="mb-12">
        <h2 className="serif text-4xl mb-4">Colors</h2>
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-orion-primary" title="Gold" />
          <div className="w-24 h-24 bg-orion-bg border" title="Cream" />
          <div className="w-24 h-24 bg-orion-fg" title="Black" />
        </div>
      </section>

      {/* Components */}
      <section className="mb-12">
        <h2 className="serif text-4xl mb-4">Components</h2>
        <button className="btn-gold-slide px-8 py-3">Button</button>
        <div className="luxury-card mt-8 p-4 max-w-sm">
          <h3 className="serif text-xl">Luxury Card</h3>
        </div>
        <input className="input-editorial mt-8 max-w-md" placeholder="Input" />
      </section>

      {/* Chat Messages */}
      <section className="mb-12">
        <h2 className="serif text-4xl mb-4">Chat Messages</h2>
        <div className="chat-user max-w-md mb-4 p-4">User message</div>
        <div className="chat-agent max-w-md p-4">Agent response</div>
      </section>
    </div>
  );
}
```

---

## Execution Checklist

### Before Implementation (RED Phase)

- [ ] All test files created and failing
- [ ] Test infrastructure configured (Playwright, Vitest)
- [ ] Design system test page route created
- [ ] Visual baseline screenshots do not exist yet

### During Implementation (GREEN Phase)

- [ ] AC1 Typography tests passing
- [ ] AC2 Color tests passing
- [ ] AC3 Border radius tests passing
- [ ] AC4 Layout grid tests passing
- [ ] AC5 Tailwind config tests passing
- [ ] AC6 Component class tests passing
- [ ] AC7 Accessibility tests passing

### After Implementation (REFACTOR Phase)

- [ ] Visual regression baseline captured
- [ ] All 28 tests green
- [ ] Test coverage report generated
- [ ] No accessibility violations

---

## Gate Criteria

| Criterion | Threshold | Status |
|-----------|-----------|--------|
| Unit tests passing | 10/10 | [ ] |
| Integration tests passing | 4/4 | [ ] |
| E2E tests passing | 12/12 | [ ] |
| Accessibility tests passing | 2/2 | [ ] |
| Visual regression captured | Yes | [ ] |
| WCAG AA contrast | All pass | [ ] |

---

## References

- [Story 1.3: Design System Foundation](./story-1-3-design-system-foundation.md)
- [Epic 1 Test Design](../../planning-artifacts/test-design-epic-1.md)
- [Design System README](../../../design-system/README.md)
- [architecture.md#3.4 Orion Design System](../../planning-artifacts/architecture.md)

---

**Document Status:** Ready for TDD Implementation
**Next Step:** Implement failing tests first (RED), then implementation (GREEN)

_Generated by TEA (Test Architect Agent) - 2026-01-15_
