# ATDD Checklist: Story 1.7 - Button Component Hierarchy

**Story:** 1.7 - Button Component Hierarchy
**Generated:** 2026-01-24
**Test ID Convention:** `1.7-{LEVEL}-{SEQ}` (e.g., `1.7-UNIT-001`)
**Status:** Designed

---

## Test Summary

| Level | Count | Priority | Coverage Target |
|-------|-------|----------|-----------------|
| Unit | 28 | P0-P1 | 80%+ |
| Integration | 8 | P1 | 70%+ |
| E2E | 6 | P0 | Critical paths |
| **Total** | **42** | - | - |

---

## 1. Unit Tests (Vitest)

### 1.1 Variant Rendering Tests

| ID | Test Name | Priority | AC | Acceptance Criteria |
|----|-----------|----------|-----|---------------------|
| 1.7-UNIT-001 | Primary button renders with gold background | P0 | AC#1 | Background color is #D4AF37 (`bg-orion-gold`) |
| 1.7-UNIT-002 | Primary button renders with dark text | P0 | AC#1 | Text color is #1A1A1A regardless of theme |
| 1.7-UNIT-003 | Secondary button renders with transparent background | P0 | AC#2 | Background is transparent |
| 1.7-UNIT-004 | Secondary button renders with gold border | P0 | AC#2 | Border is 1px solid #D4AF37 |
| 1.7-UNIT-005 | Secondary button renders with gold text | P0 | AC#2 | Text color matches `--orion-gold` |
| 1.7-UNIT-006 | Tertiary button renders with no border | P0 | AC#3 | No border present |
| 1.7-UNIT-007 | Tertiary button renders with underline | P1 | AC#3 | Text has underline decoration |
| 1.7-UNIT-008 | Destructive button renders with red text | P0 | AC#4 | Text color is `--orion-error` |
| 1.7-UNIT-009 | Destructive button renders with no border | P1 | AC#4 | Background transparent, no border |

**Test Pattern:**
```typescript
// tests/unit/components/button-variants.spec.ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Variants', () => {
  it('1.7-UNIT-001: Primary button has gold background class', () => {
    render(<Button variant="default">Primary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-orion-gold');
  });

  it('1.7-UNIT-002: Primary button has dark text class', () => {
    render(<Button variant="default">Primary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('text-[#1A1A1A]');
  });
});
```

### 1.2 Border Radius Tests

| ID | Test Name | Priority | AC | Acceptance Criteria |
|----|-----------|----------|-----|---------------------|
| 1.7-UNIT-010 | All button variants have 0px border-radius | P0 | AC#5 | No rounded corners (Editorial Luxury) |
| 1.7-UNIT-011 | Primary button has sharp corners | P1 | AC#5 | `rounded-none` or equivalent |
| 1.7-UNIT-012 | Secondary button has sharp corners | P1 | AC#5 | `rounded-none` or equivalent |
| 1.7-UNIT-013 | Tertiary button has sharp corners | P1 | AC#5 | `rounded-none` or equivalent |
| 1.7-UNIT-014 | Destructive button has sharp corners | P1 | AC#5 | `rounded-none` or equivalent |

**Test Pattern:**
```typescript
describe('Button Border Radius', () => {
  const variants = ['default', 'secondary', 'tertiary', 'destructive'] as const;

  it.each(variants)('1.7-UNIT-010+: %s variant has sharp corners', (variant) => {
    render(<Button variant={variant}>Test</Button>);
    const button = screen.getByRole('button');
    const styles = getComputedStyle(button);
    expect(styles.borderRadius).toBe('0px');
  });
});
```

### 1.3 Size Tests

| ID | Test Name | Priority | AC | Acceptance Criteria |
|----|-----------|----------|-----|---------------------|
| 1.7-UNIT-015 | Default size has 44px minimum height | P0 | AC#6 | `h-11` (44px) for touch target |
| 1.7-UNIT-016 | Small size has 44px minimum height | P0 | AC#6 | `h-11` (44px) for touch target |
| 1.7-UNIT-017 | Large size has 52px minimum height | P1 | AC#6 | `h-13` (52px) |
| 1.7-UNIT-018 | Icon size is 44x44px square | P1 | AC#6 | `h-11 w-11` |
| 1.7-UNIT-019 | All sizes render with correct padding | P2 | AC#6 | Padding per size spec |

**Test Pattern:**
```typescript
describe('Button Sizes', () => {
  it('1.7-UNIT-015: Default size has h-11 class for 44px touch target', () => {
    render(<Button size="default">Default</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('h-11');
  });

  it('1.7-UNIT-018: Icon size is 44x44px square', () => {
    render(<Button size="icon"><span>X</span></Button>);
    const button = screen.getByRole('button');
    expect(button.className).toMatch(/h-11.*w-11|w-11.*h-11/);
  });
});
```

### 1.4 Disabled State Tests

| ID | Test Name | Priority | AC | Acceptance Criteria |
|----|-----------|----------|-----|---------------------|
| 1.7-UNIT-020 | Disabled button has opacity-50 | P1 | Task 7 | Visual dimming at 50% |
| 1.7-UNIT-021 | Disabled button has pointer-events-none | P1 | Task 7 | No click response |
| 1.7-UNIT-022 | Disabled button is not focusable | P1 | Task 7 | Excluded from tab order |

**Test Pattern:**
```typescript
describe('Button Disabled State', () => {
  it('1.7-UNIT-020: Disabled button has opacity-50 class', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('disabled:opacity-50');
  });

  it('1.7-UNIT-022: Disabled button is not in tab order', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
```

### 1.5 Loading State Tests

| ID | Test Name | Priority | AC | Acceptance Criteria |
|----|-----------|----------|-----|---------------------|
| 1.7-UNIT-023 | Loading button shows spinner | P1 | Task 7.5 | Spinner icon visible |
| 1.7-UNIT-024 | Loading button has aria-busy="true" | P0 | Task 7.6 | Accessibility attribute |
| 1.7-UNIT-025 | Loading button is disabled | P1 | Task 7.7 | No interactions while loading |

**Test Pattern:**
```typescript
describe('Button Loading State', () => {
  it('1.7-UNIT-024: Loading button has aria-busy attribute', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('1.7-UNIT-025: Loading button is disabled', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
```

### 1.6 Component API Tests

| ID | Test Name | Priority | AC | Acceptance Criteria |
|----|-----------|----------|-----|---------------------|
| 1.7-UNIT-026 | Button forwards ref correctly | P1 | Dev | Ref attached to button element |
| 1.7-UNIT-027 | asChild prop works with Slot | P2 | Dev | Renders child as button |
| 1.7-UNIT-028 | className prop merges correctly | P1 | Dev | Custom classes applied |

**Test Pattern:**
```typescript
describe('Button Component API', () => {
  it('1.7-UNIT-026: Button forwards ref', () => {
    const ref = { current: null };
    render(<Button ref={ref}>Ref Test</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('1.7-UNIT-028: className merges with variant classes', () => {
    render(<Button className="custom-class">Merge</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('custom-class');
    expect(button.className).toContain('bg-orion-gold'); // default variant
  });
});
```

---

## 2. Integration Tests (Vitest + Testing Library)

### 2.1 Theme Integration Tests

| ID | Test Name | Priority | AC | Acceptance Criteria |
|----|-----------|----------|-----|---------------------|
| 1.7-INT-001 | Primary button gold persists in dark mode | P0 | Task 8.1 | Gold stays #D4AF37 |
| 1.7-INT-002 | Primary button text stays dark in both themes | P0 | Task 8.2 | #1A1A1A always (contrast) |
| 1.7-INT-003 | Destructive error color adapts in dark mode | P1 | Task 8.3 | Brighter red in dark |
| 1.7-INT-004 | Secondary border uses theme variable | P1 | Task 8.4 | `--orion-gold` border |

**Test Pattern:**
```typescript
// tests/integration/components/button-theme.spec.ts
describe('Button Theme Integration', () => {
  it('1.7-INT-001: Gold background persists in dark mode', () => {
    // Set dark mode class on document
    document.documentElement.classList.add('dark');

    render(<Button variant="default">Primary</Button>);
    const button = screen.getByRole('button');
    const styles = getComputedStyle(button);

    // Gold should remain constant
    expect(styles.backgroundColor).toBe('rgb(212, 175, 55)'); // #D4AF37

    document.documentElement.classList.remove('dark');
  });
});
```

### 2.2 Design Token Integration Tests

| ID | Test Name | Priority | AC | Acceptance Criteria |
|----|-----------|----------|-----|---------------------|
| 1.7-INT-005 | Button uses --orion-gold CSS variable | P1 | Dev | Design token applied |
| 1.7-INT-006 | Button uses --orion-error CSS variable | P1 | Dev | Design token applied |
| 1.7-INT-007 | Button uses --orion-anim-state timing | P2 | Dev | 100ms transition |
| 1.7-INT-008 | Focus ring uses design system tokens | P1 | AC#7 | Gold outline, 2px offset |

---

## 3. E2E Tests (Playwright)

### 3.1 Visual Tests

| ID | Test Name | Priority | AC | Acceptance Criteria |
|----|-----------|----------|-----|---------------------|
| 1.7-E2E-001 | Primary button visual appearance | P0 | AC#1-7 | Matches design spec |
| 1.7-E2E-002 | Secondary button visual appearance | P0 | AC#2 | Transparent + gold border |
| 1.7-E2E-003 | Button states visual (hover, active, focus) | P1 | Dev | State transitions work |

**Test Pattern:**
```typescript
// tests/e2e/components/button.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Button Visual Tests', () => {
  test('1.7-E2E-001: Primary button matches design', async ({ page }) => {
    await page.goto('/storybook?path=/story/button--primary');

    const button = page.getByRole('button', { name: 'Primary' });
    await expect(button).toBeVisible();

    // Visual regression
    await expect(button).toHaveScreenshot('button-primary.png');
  });

  test('1.7-E2E-003: Button focus state visible', async ({ page }) => {
    await page.goto('/storybook?path=/story/button--primary');

    const button = page.getByRole('button');
    await button.focus();

    await expect(button).toHaveScreenshot('button-primary-focused.png');
  });
});
```

### 3.2 Accessibility Tests

| ID | Test Name | Priority | AC | Acceptance Criteria |
|----|-----------|----------|-----|---------------------|
| 1.7-E2E-004 | Button keyboard navigation works | P0 | AC#7 | Tab to focus, Enter to activate |
| 1.7-E2E-005 | Button contrast meets WCAG AA | P0 | NFR-5.1 | 4.5:1 contrast ratio |
| 1.7-E2E-006 | Touch target is 44x44px minimum | P0 | AC#6 | Clickable area adequate |

**Test Pattern:**
```typescript
import AxeBuilder from '@axe-core/playwright';

test.describe('Button Accessibility', () => {
  test('1.7-E2E-004: Keyboard navigation', async ({ page }) => {
    await page.goto('/storybook?path=/story/button--all-variants');

    // Tab to first button
    await page.keyboard.press('Tab');
    const primaryButton = page.getByRole('button', { name: 'Primary' });
    await expect(primaryButton).toBeFocused();

    // Enter activates button
    let clicked = false;
    await page.exposeFunction('onButtonClick', () => { clicked = true; });
    await page.evaluate(() => {
      document.querySelector('button')?.addEventListener('click', () => window.onButtonClick());
    });
    await page.keyboard.press('Enter');
    expect(clicked).toBe(true);
  });

  test('1.7-E2E-005: No accessibility violations', async ({ page }) => {
    await page.goto('/storybook?path=/story/button--all-variants');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="button-showcase"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('1.7-E2E-006: Touch target minimum size', async ({ page }) => {
    await page.goto('/storybook?path=/story/button--primary');

    const button = page.getByRole('button');
    const box = await button.boundingBox();

    expect(box?.height).toBeGreaterThanOrEqual(44);
    // Width varies by content, but check it's reasonable
    expect(box?.width).toBeGreaterThanOrEqual(44);
  });
});
```

---

## 4. Test Data Requirements

### 4.1 Button Props Combinations

| Variant | Size | State | Theme | Expected Result |
|---------|------|-------|-------|-----------------|
| default (Primary) | default | normal | light | Gold bg, dark text |
| default (Primary) | default | normal | dark | Gold bg, dark text (same) |
| default (Primary) | default | disabled | light | Gold bg, 50% opacity |
| default (Primary) | default | loading | light | Spinner, aria-busy |
| secondary | default | normal | light | Transparent, gold border |
| tertiary | default | normal | light | No border, underline |
| destructive | default | normal | light | Red text |
| destructive | default | normal | dark | Brighter red text |
| default | sm | normal | light | h-11 (44px) |
| default | lg | normal | light | h-13 (52px) |
| default | icon | normal | light | 44x44px square |

### 4.2 Color Values Reference

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--orion-gold` | #D4AF37 | #D4AF37 | Primary bg, secondary border |
| `--orion-fg` | #1A1A1A | #FAF8F5 | Tertiary text |
| `--orion-error` | #9B2C2C | #EF4444 | Destructive text |
| Primary text | #1A1A1A | #1A1A1A | Always dark on gold |

---

## 5. Test Environment Setup

### 5.1 Required Test Infrastructure

- [ ] Vitest configured with Testing Library React
- [ ] Playwright with component testing support
- [ ] axe-core for accessibility testing
- [ ] CSS variables loaded in test environment
- [ ] Dark mode toggle utility for theme tests

### 5.2 Test File Structure

```
tests/
  unit/
    components/
      button-variants.spec.ts      # 1.7-UNIT-001 to 009
      button-border-radius.spec.ts # 1.7-UNIT-010 to 014
      button-sizes.spec.ts         # 1.7-UNIT-015 to 019
      button-states.spec.ts        # 1.7-UNIT-020 to 025
      button-api.spec.ts           # 1.7-UNIT-026 to 028
  integration/
    components/
      button-theme.spec.ts         # 1.7-INT-001 to 004
      button-tokens.spec.ts        # 1.7-INT-005 to 008
  e2e/
    components/
      button.spec.ts               # 1.7-E2E-001 to 006
```

---

## 6. Acceptance Criteria Traceability

| AC# | Requirement | Test Coverage |
|-----|-------------|---------------|
| AC#1 | Primary buttons have gold background with dark text | 1.7-UNIT-001, 1.7-UNIT-002, 1.7-INT-001, 1.7-INT-002 |
| AC#2 | Secondary buttons have transparent bg with gold border | 1.7-UNIT-003, 1.7-UNIT-004, 1.7-UNIT-005, 1.7-E2E-002 |
| AC#3 | Tertiary buttons have no border, text only with underline | 1.7-UNIT-006, 1.7-UNIT-007 |
| AC#4 | Destructive buttons have red text | 1.7-UNIT-008, 1.7-UNIT-009, 1.7-INT-003 |
| AC#5 | All buttons have 0px border-radius | 1.7-UNIT-010 to 014 |
| AC#6 | All buttons have 44x44px minimum touch target | 1.7-UNIT-015 to 018, 1.7-E2E-006 |
| AC#7 | All buttons have proper keyboard focus states | 1.7-INT-008, 1.7-E2E-004 |

---

## 7. Risk-Based Test Prioritization

### P0 - Must Pass (Blocks Story Acceptance)

| Test ID | Risk | Rationale |
|---------|------|-----------|
| 1.7-UNIT-001 | Design | Primary button is main CTA |
| 1.7-UNIT-002 | A11y | Contrast critical for accessibility |
| 1.7-UNIT-015 | A11y | Touch target per WCAG |
| 1.7-UNIT-024 | A11y | Loading state accessibility |
| 1.7-INT-001 | UX | Gold must persist in dark mode |
| 1.7-INT-002 | A11y | Contrast must work in both themes |
| 1.7-E2E-004 | A11y | Keyboard navigation required |
| 1.7-E2E-005 | A11y | WCAG AA compliance |
| 1.7-E2E-006 | A11y | Touch target per WCAG |

### P1 - Should Pass (High Value)

| Test ID | Risk | Rationale |
|---------|------|-----------|
| 1.7-UNIT-003 to 009 | Design | All variant styling |
| 1.7-UNIT-010 to 014 | Design | Editorial Luxury aesthetic |
| 1.7-UNIT-020 to 022 | UX | Disabled state UX |
| 1.7-INT-003, 1.7-INT-004 | Design | Theme consistency |
| 1.7-E2E-001, 1.7-E2E-002 | Visual | Design fidelity |

### P2 - Nice to Have

| Test ID | Risk | Rationale |
|---------|------|-----------|
| 1.7-UNIT-019 | Design | Padding details |
| 1.7-UNIT-027 | Dev | Edge case API |
| 1.7-INT-007 | UX | Animation timing |
| 1.7-E2E-003 | Visual | State transitions |

---

## 8. Definition of Done

- [ ] All P0 tests pass
- [ ] All P1 tests pass
- [ ] No accessibility violations from axe-core
- [ ] Visual regression snapshots approved
- [ ] Test coverage > 80% for button.tsx
- [ ] Tests run in < 30 seconds total
- [ ] All tests isolated (no state bleed)

---

## References

- **Story:** `thoughts/implementation-artifacts/stories/story-1-7-button-component-hierarchy.md`
- **Test Design System:** `thoughts/planning-artifacts/test-design-system.md`
- **Component TDD Knowledge:** `_bmad/bmm/testarch/knowledge/component-tdd.md`
- **UX Specification:** `thoughts/planning-artifacts/ux-design-specification.md`

---

*Generated by TEA (Master Test Architect) - Strong opinions, weakly held.*
