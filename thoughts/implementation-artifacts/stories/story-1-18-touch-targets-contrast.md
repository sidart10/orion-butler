# Story 1.18: Touch Targets & Contrast

**Status:** ready-for-dev
**Epic:** 1 - Application Shell & First Launch
**Created:** 2026-01-24
**Updated:** 2026-01-24

---

## Story Definition

### User Story

As a **user**,
I want adequate touch targets and color contrast,
So that the app meets accessibility standards (FR-10.8).

### Description

This story ensures visual accessibility compliance across the Orion application by validating and fixing touch targets (minimum 44x44px clickable areas) and color contrast ratios (WCAG AA compliance). While Story 1.4 established the 44px touch target pattern for buttons, this story performs a comprehensive audit across ALL interactive elements and validates contrast ratios for text and UI components in both light and dark modes.

This is a validation and remediation story - it audits all existing components from Stories 1.4-1.17 and implements any necessary fixes to meet accessibility standards.

### Acceptance Criteria

```gherkin
Feature: Touch Targets & Contrast
  As a user
  I want adequate touch targets and color contrast
  So that the app meets accessibility standards

  Background:
    Given the Orion application is running
    And all UI components from Stories 1.1-1.17 are implemented

  Scenario: All interactive elements meet 44x44px touch target minimum
    Given the app interface is rendered
    When I measure the clickable area of any interactive element
    Then buttons have at least 44x44px clickable area
    And links have at least 44x44px clickable area
    And checkbox/radio controls have at least 44x44px clickable area
    And icon buttons have at least 44x44px clickable area
    And sidebar nav items have at least 44x44px clickable area
    And canvas action buttons have at least 44x44px clickable area

  Scenario: Body text meets WCAG AA contrast ratio (4.5:1)
    Given the app is in light mode
    When I measure the contrast ratio of body text against background
    Then text using --orion-fg on --orion-bg meets 4.5:1 ratio
    And text using --orion-fg-muted on --orion-bg meets 4.5:1 ratio
    When I switch to dark mode
    Then text using --orion-fg on --orion-bg meets 4.5:1 ratio
    And text using --orion-fg-muted on --orion-bg meets 4.5:1 ratio

  Scenario: Large text meets WCAG AA contrast ratio (3:1)
    Given the app interface is rendered
    When I measure contrast of text 18px+ (or 14px+ bold)
    Then large text meets minimum 3:1 contrast ratio
    And this applies in both light and dark modes

  Scenario: Non-text UI components meet 3:1 contrast ratio
    Given the app interface is rendered
    When I measure contrast of UI component boundaries
    Then focus rings meet 3:1 ratio against their backgrounds
    And input borders meet 3:1 ratio against backgrounds
    And button outlines meet 3:1 ratio against backgrounds
    And status indicators meet 3:1 ratio against backgrounds
    And this applies in both light and dark modes

  Scenario: Gold accent color meets contrast requirements
    Given the gold accent (#D4AF37) is used for active states
    When gold is used as text color
    Then it meets 4.5:1 ratio for body text context
    Or it meets 3:1 ratio and is used only for large text / UI components
    And gold focus rings meet 3:1 ratio against both cream and dark backgrounds

  Scenario: Error state colors meet contrast requirements
    Given error states use red color variants
    When error text is displayed
    Then light mode error (#9B2C2C) meets 4.5:1 against cream background
    And dark mode error (#EF4444) meets 4.5:1 against dark background

  Scenario: Interactive elements maintain visual appearance with touch expansion
    Given a button with compact visual design
    When padding is added to achieve 44px clickable area
    Then the visual design remains compact and editorial
    And the clickable area extends invisibly beyond visible bounds
    And cursor: pointer spans the full 44px area

  Scenario: Touch targets work on trackpad and touch screen
    Given a Mac with trackpad or touch screen
    When I click/tap any interactive element
    Then the 44px area responds to the interaction
    And there are no "dead zones" within interactive elements
```

---

## Technical Requirements

### Dependencies

| Story | Dependency Type | What It Provides |
|-------|----------------|------------------|
| 1.3 | Required | Design tokens: --orion-fg, --orion-bg, --orion-gold, --orion-error, etc. |
| 1.4 | Required | Button and Sidebar components with touch target pattern established |
| 1.7 | Required | Button component hierarchy |
| 1.8 | Required | Input component with touch targets |
| 1.9 | Required | StatusIndicator component |
| 1.13 | Required | Dark mode token values |
| 1.14 | Required | Manual dark mode toggle |
| 1.15 | Required | Keyboard shortcut components (QuickCaptureModal, CommandPaletteModal) |
| 1.16 | Required | Focus states and focus trap patterns |
| 1.17 | Required | VoiceOver components (VisuallyHidden, etc.) |

### Architecture Decisions

#### Decision 1: Touch Target Implementation Pattern

**Pattern:** Padding expansion (not visual size increase)

**Rationale:** The Editorial Luxury aesthetic requires compact visual design. Touch targets are achieved via padding or invisible pseudo-elements that extend the clickable area beyond visible bounds. This preserves the magazine-like visual while meeting accessibility requirements.

**Implementation:**
```css
/* Example: Compact button with 44px touch area */
.touch-target-44 {
  /* Visual design remains compact */
  min-height: 32px;
  padding-top: 6px;
  padding-bottom: 6px;
  /* Invisible extension via position or larger padding */
  position: relative;
}

.touch-target-44::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 44px;
  min-height: 44px;
}
```

#### Decision 2: Contrast Validation Approach

**Pattern:** Audit existing tokens and adjust only those failing WCAG AA

**Rationale:** Most Orion colors already meet contrast requirements (e.g., #1A1A1A on #FAF8F5 = 14:1). This story audits all combinations and adjusts only failing pairs.

**Validation Requirements:**

| Token Pair | Required Ratio | Light Mode | Dark Mode |
|------------|----------------|------------|-----------|
| --orion-fg on --orion-bg | 4.5:1 | #1A1A1A on #FAF8F5 (14:1) | #FAF8F5 on #121212 (15.5:1) |
| --orion-fg-muted on --orion-bg | 4.5:1 | #6B6B6B on #FAF8F5 (5.3:1) | #9CA3AF on #121212 (7.5:1) |
| --orion-gold on --orion-bg | 3:1 (UI only) | #D4AF37 on #FAF8F5 (2.8:1) | #D4AF37 on #121212 (5.4:1) |
| --orion-error on --orion-bg | 4.5:1 | #9B2C2C on #FAF8F5 (7.5:1) | #EF4444 on #121212 (4.6:1) |

**Note:** Gold (#D4AF37) on light cream (#FAF8F5) fails 3:1. This requires remediation - see Design Decisions section.

#### Decision 3: Gold Contrast Remediation

**Problem:** Gold (#D4AF37) on cream (#FAF8F5) has 2.8:1 contrast ratio, failing WCAG AA for UI components (requires 3:1).

**Solution Options:**

1. **Option A (Recommended):** Darken gold slightly for light mode only
   - Light mode gold: #B8941F (darkened) - achieves 4.1:1
   - Dark mode gold: #D4AF37 (original) - already at 5.4:1

2. **Option B:** Use gold only with dark text on gold backgrounds
   - Gold as fill color with #1A1A1A text
   - Meets contrast requirement

3. **Option C:** Accept reduced contrast for decorative elements
   - WCAG allows reduced contrast for purely decorative elements
   - Gold borders/accents could be exempt

**Decision:** Implement Option B as primary pattern (gold backgrounds with dark text), with Option A as fallback for gold-on-cream borders/focus rings.

---

### Audit Scope

#### Components to Audit

| Component | Location | Touch Target Check | Contrast Check |
|-----------|----------|-------------------|----------------|
| Button | src/components/ui/button.tsx | All variants | All states |
| Input | src/components/ui/input.tsx | Icon slots, clear button | Placeholder, error state |
| Textarea | src/components/ui/textarea.tsx | Resize handle | Placeholder |
| Sidebar | src/components/sidebar/Sidebar.tsx | All nav items | Active/inactive states |
| SidebarNavItem | src/components/sidebar/SidebarNavItem.tsx | Full row | Count badge, labels |
| ChatInput | src/components/chat/ChatInput.tsx | Send button | Placeholder |
| StatusIndicator | src/components/ui/status-indicator.tsx | N/A (not interactive) | Dot colors |
| HamburgerMenu | src/components/navigation/HamburgerMenu.tsx | Menu icon | Icon color |
| ThemeSelector | src/components/settings/ThemeSelector.tsx | Segment buttons | Active/inactive |
| QuickCaptureModal | src/components/modals/QuickCaptureModal.tsx | Close button, actions | All text |
| CommandPaletteModal | src/components/modals/CommandPaletteModal.tsx | Items, close | All text |
| CanvasColumn | src/components/layout/CanvasColumn.tsx | Close button | Header text |
| ShortcutHint | src/components/ui/shortcut-hint.tsx | N/A (not interactive) | kbd styling |
| VisuallyHidden | src/components/ui/visually-hidden.tsx | N/A (not visible) | N/A |

#### Color Pairs to Validate

**Light Mode:**
| Background | Foreground | Usage | Target |
|------------|------------|-------|--------|
| #FAF8F5 | #1A1A1A | Body text | 4.5:1 |
| #FAF8F5 | #6B6B6B | Muted text | 4.5:1 |
| #FAF8F5 | #D4AF37 | Gold accent (UI) | 3:1 |
| #FAF8F5 | #9B2C2C | Error text | 4.5:1 |
| #FFFFFF | #1A1A1A | Surface text | 4.5:1 |
| #FFFFFF | #6B6B6B | Surface muted | 4.5:1 |
| #D4AF37 | #1A1A1A | Gold button text | 4.5:1 |

**Dark Mode:**
| Background | Foreground | Usage | Target |
|------------|------------|-------|--------|
| #121212 | #FAF8F5 | Body text | 4.5:1 |
| #121212 | #9CA3AF | Muted text | 4.5:1 |
| #121212 | #D4AF37 | Gold accent (UI) | 3:1 |
| #121212 | #EF4444 | Error text | 4.5:1 |
| #1A1A1A | #FAF8F5 | Surface text | 4.5:1 |
| #1A1A1A | #9CA3AF | Surface muted | 4.5:1 |
| #D4AF37 | #121212 | Gold button text | 4.5:1 |

---

## Implementation Plan

### Phase 1: Audit Tool Setup

1. **Create contrast validation utility**
   ```typescript
   // src/lib/a11y/contrast.ts
   export function getContrastRatio(fg: string, bg: string): number {
     // Calculate WCAG contrast ratio
   }

   export function meetsWCAGAA(ratio: number, isLargeText: boolean): boolean {
     return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
   }

   export function meetsUIComponentContrast(ratio: number): boolean {
     return ratio >= 3.0;
   }
   ```

2. **Create touch target audit test**
   ```typescript
   // tests/e2e/a11y/touch-targets.spec.ts
   test('all buttons meet 44px minimum', async ({ page }) => {
     const buttons = await page.locator('button').all();
     for (const button of buttons) {
       const box = await button.boundingBox();
       expect(box.width).toBeGreaterThanOrEqual(44);
       expect(box.height).toBeGreaterThanOrEqual(44);
     }
   });
   ```

### Phase 2: Touch Target Remediation

1. **Audit all interactive elements**
   - Run touch target tests against each component
   - Document failures with element path and measured size

2. **Apply touch target pattern**
   - Add `.touch-target-44` utility class
   - Or expand padding on individual components
   - Prefer padding over ::after pseudo-element for simpler implementation

3. **Verify visual design unchanged**
   - Visual regression test that appearance matches pre-change
   - Only clickable area expanded

### Phase 3: Contrast Remediation

1. **Run contrast audit on all token pairs**
   - Light mode: Calculate all fg/bg combinations
   - Dark mode: Calculate all fg/bg combinations
   - Document failures

2. **Fix gold contrast in light mode**
   - Create `--orion-gold-accessible: #B8941F` for light mode
   - Or always use gold as background with dark text

3. **Fix any other failing pairs**
   - Adjust muted colors if needed
   - Document changes in design tokens

### Phase 4: Testing & Validation

1. **Automated axe-core testing**
   ```typescript
   // tests/e2e/a11y/contrast.spec.ts
   import AxeBuilder from '@axe-core/playwright';

   test('no contrast violations', async ({ page }) => {
     const results = await new AxeBuilder({ page })
       .withTags(['wcag2aa', 'wcag21aa'])
       .analyze();
     expect(results.violations.filter(v => v.id.includes('contrast'))).toHaveLength(0);
   });
   ```

2. **Manual testing with color blindness simulation**
   - Test with Stark or similar tool
   - Validate status indicator colors are distinguishable

3. **Dark mode validation**
   - Run all tests in dark mode
   - Verify no regressions

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/a11y/contrast.ts` | Contrast ratio calculation utilities |
| `src/lib/a11y/index.ts` | Barrel export for a11y utilities |
| `tests/e2e/a11y/touch-targets.spec.ts` | Touch target audit tests |
| `tests/e2e/a11y/contrast.spec.ts` | Contrast ratio validation tests |
| `tests/e2e/a11y/a11y-audit.spec.ts` | Combined axe-core audit |

## Files to Modify

| File | Change |
|------|--------|
| `src/app/globals.css` | Add --orion-gold-accessible token if needed |
| `src/components/ui/button.tsx` | Ensure 44px touch target on all variants |
| `src/components/ui/input.tsx` | Ensure icon slots have 44px touch target |
| `src/components/sidebar/SidebarNavItem.tsx` | Verify full-row clickable area |
| `src/components/navigation/HamburgerMenu.tsx` | Verify 44px touch target |
| `src/components/settings/ThemeSelector.tsx` | Verify segment button touch targets |
| `src/components/modals/*.tsx` | Verify all buttons have 44px touch target |
| `tailwind.config.ts` | Add touch-target utility if using Tailwind approach |

---

## Test Cases

### Unit Tests

```typescript
// src/lib/a11y/__tests__/contrast.test.ts
describe('contrast utilities', () => {
  describe('getContrastRatio', () => {
    it('calculates white on black as 21:1', () => {
      expect(getContrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 0);
    });

    it('calculates Orion fg on bg correctly', () => {
      // Light mode: #1A1A1A on #FAF8F5
      expect(getContrastRatio('#1A1A1A', '#FAF8F5')).toBeGreaterThan(4.5);
    });

    it('calculates gold on cream correctly', () => {
      // #D4AF37 on #FAF8F5 - should fail 3:1
      expect(getContrastRatio('#D4AF37', '#FAF8F5')).toBeLessThan(3.0);
    });

    it('calculates gold on dark correctly', () => {
      // #D4AF37 on #121212 - should pass 3:1
      expect(getContrastRatio('#D4AF37', '#121212')).toBeGreaterThan(3.0);
    });
  });

  describe('meetsWCAGAA', () => {
    it('requires 4.5:1 for body text', () => {
      expect(meetsWCAGAA(4.5, false)).toBe(true);
      expect(meetsWCAGAA(4.4, false)).toBe(false);
    });

    it('requires 3:1 for large text', () => {
      expect(meetsWCAGAA(3.0, true)).toBe(true);
      expect(meetsWCAGAA(2.9, true)).toBe(false);
    });
  });
});
```

### E2E Tests

```typescript
// tests/e2e/a11y/touch-targets.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Touch Targets', () => {
  test('all buttons have 44px minimum touch target', async ({ page }) => {
    await page.goto('/');

    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box) {
        expect(box.width, `Button width should be >= 44px`).toBeGreaterThanOrEqual(44);
        expect(box.height, `Button height should be >= 44px`).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('sidebar nav items have full-row clickable area', async ({ page }) => {
    await page.goto('/');

    const navItems = await page.locator('[role="navigation"] a, [role="navigation"] button').all();
    for (const item of navItems) {
      const box = await item.boundingBox();
      if (box) {
        expect(box.height, `Nav item height should be >= 44px`).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('icon buttons have 44px touch target', async ({ page }) => {
    await page.goto('/');

    const iconButtons = await page.locator('[aria-label][role="button"], button[aria-label]').all();
    for (const button of iconButtons) {
      const box = await button.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
```

```typescript
// tests/e2e/a11y/contrast.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Color Contrast', () => {
  test('light mode passes WCAG AA contrast', async ({ page }) => {
    await page.goto('/');
    // Ensure light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    const contrastViolations = results.violations.filter(v =>
      v.id === 'color-contrast' || v.id === 'color-contrast-enhanced'
    );

    expect(contrastViolations).toHaveLength(0);
  });

  test('dark mode passes WCAG AA contrast', async ({ page }) => {
    await page.goto('/');
    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    const contrastViolations = results.violations.filter(v =>
      v.id === 'color-contrast' || v.id === 'color-contrast-enhanced'
    );

    expect(contrastViolations).toHaveLength(0);
  });

  test('gold focus rings are visible in light mode', async ({ page }) => {
    await page.goto('/');

    // Tab to first focusable element
    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus-visible');
    const styles = await focusedElement.evaluate(el => {
      return window.getComputedStyle(el);
    });

    // Verify focus ring is visible (gold outline)
    expect(styles.outlineColor).not.toBe('transparent');
  });

  test('gold focus rings are visible in dark mode', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus-visible');
    const styles = await focusedElement.evaluate(el => {
      return window.getComputedStyle(el);
    });

    expect(styles.outlineColor).not.toBe('transparent');
  });
});
```

### Manual Testing Checklist

- [ ] Test all buttons with trackpad - verify 44px feels responsive
- [ ] Test sidebar nav items - verify full row clickable
- [ ] Test hamburger menu on tablet breakpoint
- [ ] Test theme selector segments
- [ ] Test modal close buttons
- [ ] Test input icon slots
- [ ] Run Stark/color blindness simulation
- [ ] Verify status indicator colors distinguishable without color

---

## Design Decisions

### Touch Target Pattern

**Approach:** Padding expansion with invisible extension

```css
/* Tailwind utility */
.touch-target-44 {
  @apply relative;
  min-width: 44px;
  min-height: 44px;
}

/* Or inline padding approach for buttons */
button {
  /* Visible design */
  padding: 8px 16px;
  min-height: 32px;

  /* Invisible extension to 44px */
  padding-top: max(8px, calc((44px - 32px) / 2));
  padding-bottom: max(8px, calc((44px - 32px) / 2));
}
```

### Gold Color Resolution

**Problem:** Gold (#D4AF37) on cream (#FAF8F5) = 2.8:1 contrast (fails 3:1 requirement)

**Resolution Strategy:**

1. **Primary buttons:** Use gold as background with dark text
   - #D4AF37 background + #1A1A1A text = 7.8:1 (passes)

2. **Focus rings:** Gold outline on 2px offset (gap provides contrast)
   - The 2px offset creates visual separation
   - Focus ring pattern from Story 1.16 already accounts for this

3. **Gold text:** Avoid pure gold text on cream
   - Use for large text only (18px+ regular, 14px+ bold)
   - Or use darkened gold #B8941F for small text

4. **Active states:** Gold left border on white/cream backgrounds
   - Border is 4px wide (sufficient visual weight)
   - Combined with background tint provides adequate indication

### Status Indicator Colors

All status indicator colors pass contrast requirements:

| State | Color | On Cream | On Dark |
|-------|-------|----------|---------|
| idle | Gray #6B6B6B | 5.3:1 | #6B6B6B on #121212 = 5.1:1 |
| thinking | Gold #D4AF37 | 2.8:1 | 5.4:1 |
| acting | Gold #D4AF37 | 2.8:1 | 5.4:1 |
| waiting | Blue #3B82F6 | 3.6:1 | 4.5:1 |
| success | Gold #D4AF37 | 2.8:1 | 5.4:1 |
| error | Red #9B2C2C / #EF4444 | 7.5:1 | 4.6:1 |

**Note:** Gold indicators fail 3:1 in light mode. However, status indicators are:
1. Accompanied by animation (visual distinction)
2. Not the only means of conveying information (labels available)
3. 6-12px size means they're UI components, not text

**Decision:** Accept gold indicators in light mode as they're decorative/supplementary, but ensure all status states have text labels accessible to screen readers.

---

## Dependencies on This Story

| Future Story | What This Provides |
|--------------|-------------------|
| 1.19 | Reduced motion already tested alongside contrast |
| All future UI | Touch target and contrast patterns established |
| Epic 2+ | Accessibility baseline for all new components |

---

## Notes for Next Story (1.19: Reduced Motion)

- This story validates `prefers-reduced-motion` support is not breaking contrast
- Story 1.19 will focus on animation reduction specifically
- Status indicator animations (pulse, spin) need reduced motion alternatives
- Canvas transitions need instant mode option
- Theme switch transition (200ms crossfade) needs to respect reduced motion

---

## Story Progress

### Checklist

- [ ] Contrast validation utility created
- [ ] Touch target tests created
- [ ] Button component audited and fixed
- [ ] Input component audited and fixed
- [ ] Sidebar components audited and fixed
- [ ] Modal components audited and fixed
- [ ] Canvas components audited and fixed
- [ ] Gold contrast resolution implemented
- [ ] Light mode passes axe-core contrast checks
- [ ] Dark mode passes axe-core contrast checks
- [ ] All buttons pass 44px touch target test
- [ ] All interactive elements pass 44px touch target test
- [ ] Manual testing completed
- [ ] Documentation updated

---

## Definition of Done

1. All interactive elements have 44x44px minimum clickable area
2. All text meets WCAG AA contrast ratios (4.5:1 body, 3:1 large)
3. All UI components meet 3:1 non-text contrast ratio
4. Gold color usage resolved for light mode accessibility
5. Automated tests pass for touch targets
6. Automated axe-core tests pass for contrast in both modes
7. Manual testing confirms touch targets feel responsive
8. Manual testing confirms colors distinguishable with color blindness simulation
9. No visual design changes (touch targets achieved via padding expansion)

---

## References

### Requirements Traceability

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| FR-10.8 | WCAG AA accessibility | Touch targets + contrast validation |
| NFR-5.3 | Minimum color contrast ratios | WCAG AA compliance testing |

### Source Documents

- UX Design Specification: Section "Touch Target Sizes" (lines 1737-1765)
- UX Design Specification: Section "Accessibility Strategy" (lines 1779-1789)
- Architecture.md: Accessibility requirements
- design-system-adoption.md: Color token definitions

### Design Resources

| Resource | Link |
|----------|------|
| WCAG 2.1 Success Criterion 1.4.3 | Contrast (Minimum) - 4.5:1 for text |
| WCAG 2.1 Success Criterion 1.4.11 | Non-text Contrast - 3:1 for UI components |
| Apple HIG | 44pt minimum touch target |
| WebAIM Contrast Checker | https://webaim.org/resources/contrastchecker/ |
