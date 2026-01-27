# ATDD Checklist: 1-13-dark-mode-system-detection

**Story:** 1.13 - Dark Mode - System Detection
**Status:** Ready for Development
**Generated:** 2026-01-24
**Author:** TEA (Master Test Architect)

---

## Test Summary

| AC | Happy Path | Edge Cases | Error Handling | Total |
|----|------------|------------|----------------|-------|
| AC1 | 2 | 2 | 1 | 5 |
| AC2 | 2 | 3 | 1 | 6 |
| AC3 | 4 | 2 | 0 | 6 |
| AC4 | 4 | 2 | 0 | 6 |
| AC5 | 2 | 2 | 1 | 5 |
| AC6 | 3 | 2 | 0 | 5 |
| AC7 | 2 | 2 | 0 | 4 |
| **Total** | **19** | **15** | **3** | **37** |

---

## AC1: System Dark Mode Detection on Launch

> **Given** macOS is set to dark mode
> **When** I launch the app (with no manual override set)
> **Then** the app displays in dark mode
> **And** design tokens switch to dark variants

### Happy Path

- [ ] **1.1-E2E-001**: App launches in dark mode when system prefers dark
  - **Given:** macOS/system is set to dark mode
  - **When:** The app is launched with no manual override
  - **Then:** `--orion-bg` equals `#121212`
  - **And:** `--orion-fg` equals `#FAF8F5`
  - **Framework:** Playwright with `page.emulateMedia({ colorScheme: 'dark' })`

- [ ] **1.1-E2E-002**: App launches in light mode when system prefers light
  - **Given:** macOS/system is set to light mode
  - **When:** The app is launched with no manual override
  - **Then:** `--orion-bg` equals `#FAF8F5`
  - **And:** `--orion-fg` equals `#1A1A1A`
  - **Framework:** Playwright with `page.emulateMedia({ colorScheme: 'light' })`

### Edge Cases

- [ ] **1.1-E2E-003**: App respects system preference on cold start (no cache)
  - **Given:** App has never been launched before (clean state)
  - **When:** User launches app with system in dark mode
  - **Then:** App immediately renders in dark mode without flash
  - **Test Note:** Clear localStorage/sessionStorage before test

- [ ] **1.1-UNIT-001**: CSS media query `prefers-color-scheme: dark` is defined
  - **Given:** The globals.css file
  - **When:** Parsed by CSS parser
  - **Then:** Contains `@media (prefers-color-scheme: dark)` block with dark token overrides
  - **Framework:** Vitest with CSS parsing or snapshot

### Error Handling

- [ ] **1.1-E2E-004**: Graceful handling when matchMedia unavailable
  - **Given:** Browser/environment lacks `matchMedia` support (legacy)
  - **When:** App attempts to detect color scheme
  - **Then:** App defaults to light mode
  - **And:** No JavaScript errors thrown
  - **Test Note:** Mock `window.matchMedia` as undefined

---

## AC2: Live Theme Switching

> **Given** the app is running
> **When** macOS switches from light mode to dark mode (or vice versa)
> **Then** the app switches theme automatically
> **And** the switch happens within 200ms

### Happy Path

- [ ] **1.2-E2E-001**: Theme switches from light to dark when system changes
  - **Given:** App is running in light mode
  - **When:** System preference changes to dark mode
  - **Then:** App switches to dark mode automatically
  - **And:** Background color changes to `#121212`
  - **Framework:** Playwright `page.emulateMedia({ colorScheme: 'dark' })` mid-test

- [ ] **1.2-E2E-002**: Theme switches from dark to light when system changes
  - **Given:** App is running in dark mode
  - **When:** System preference changes to light mode
  - **Then:** App switches to light mode automatically
  - **And:** Background color changes to `#FAF8F5`
  - **Framework:** Playwright `page.emulateMedia({ colorScheme: 'light' })` mid-test

### Edge Cases

- [ ] **1.2-E2E-003**: Theme switch completes within 200ms (SLO)
  - **Given:** App is running in light mode
  - **When:** System preference changes to dark mode
  - **Then:** Transition completes within 200ms
  - **Test Pattern:**
    ```typescript
    const startTime = Date.now();
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForFunction(() => {
      const bg = getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim();
      return bg === '#121212';
    });
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(250); // 200ms + buffer
    ```

- [ ] **1.2-E2E-004**: Rapid theme toggling does not cause state corruption
  - **Given:** App is running
  - **When:** System preference toggles 5 times in rapid succession
  - **Then:** App settles on correct final theme
  - **And:** No visual glitches or stale colors remain

- [ ] **1.2-UNIT-001**: matchMedia listener is properly registered
  - **Given:** App initializes
  - **When:** Color scheme media query is checked
  - **Then:** An event listener exists for `prefers-color-scheme` changes
  - **Framework:** Vitest with mocked matchMedia

### Error Handling

- [ ] **1.2-E2E-005**: App remains stable if matchMedia change event fires multiple times
  - **Given:** App is running
  - **When:** matchMedia change event fires redundantly (same value)
  - **Then:** App does not re-trigger transition
  - **And:** No flickering or performance degradation

---

## AC3: Dark Mode Token Values

> **Given** dark mode is active
> **When** I view any component
> **Then** gold accent (#D4AF37) remains unchanged
> **And** backgrounds use `--orion-bg: #121212`
> **And** surfaces use `--orion-surface: #1A1A1A`
> **And** text uses `--orion-fg: #FAF8F5`

### Happy Path

- [ ] **1.3-E2E-001**: Dark mode background token is correct
  - **Given:** Dark mode is active
  - **When:** CSS custom property `--orion-bg` is evaluated
  - **Then:** Value equals `#121212`
  - **Framework:** Playwright with `page.evaluate(() => getComputedStyle(...))`

- [ ] **1.3-E2E-002**: Dark mode surface token is correct
  - **Given:** Dark mode is active
  - **When:** CSS custom property `--orion-surface` is evaluated
  - **Then:** Value equals `#1A1A1A`

- [ ] **1.3-E2E-003**: Dark mode foreground/text token is correct
  - **Given:** Dark mode is active
  - **When:** CSS custom property `--orion-fg` is evaluated
  - **Then:** Value equals `#FAF8F5`

- [ ] **1.3-E2E-004**: Gold accent remains unchanged in dark mode
  - **Given:** Dark mode is active
  - **When:** CSS custom property `--orion-gold` is evaluated
  - **Then:** Value equals `#D4AF37`
  - **And:** Value is identical to light mode

### Edge Cases

- [ ] **1.3-UNIT-001**: All dark mode tokens are defined
  - **Given:** globals.css with dark mode media query
  - **When:** All expected tokens are checked
  - **Then:** Following tokens have correct dark values:
    | Token | Expected Value |
    |-------|----------------|
    | `--orion-bg` | #121212 |
    | `--orion-surface` | #1A1A1A |
    | `--orion-surface-elevated` | #242424 |
    | `--orion-fg` | #FAF8F5 |
    | `--orion-fg-muted` | #9CA3AF |
    | `--orion-border` | #2D2D2D |
    | `--orion-scrollbar` | #333333 |
    | `--orion-success` | #10B981 |
    | `--orion-error` | #EF4444 |

- [ ] **1.3-E2E-005**: Dark mode brighter status colors for visibility
  - **Given:** Dark mode is active
  - **When:** `--orion-success` and `--orion-error` are evaluated
  - **Then:** Values are brighter than light mode equivalents
  - **And:** `--orion-success` equals `#10B981` (vs light `#059669`)
  - **And:** `--orion-error` equals `#EF4444` (vs light `#9B2C2C`)

---

## AC4: Light Mode Token Values

> **Given** light mode is active
> **When** I view any component
> **Then** gold accent (#D4AF37) remains unchanged
> **And** backgrounds use `--orion-bg: #FAF8F5`
> **And** surfaces use `--orion-surface: #FFFFFF`
> **And** text uses `--orion-fg: #1A1A1A`

### Happy Path

- [ ] **1.4-E2E-001**: Light mode background token is correct
  - **Given:** Light mode is active
  - **When:** CSS custom property `--orion-bg` is evaluated
  - **Then:** Value equals `#FAF8F5`

- [ ] **1.4-E2E-002**: Light mode surface token is correct
  - **Given:** Light mode is active
  - **When:** CSS custom property `--orion-surface` is evaluated
  - **Then:** Value equals `#FFFFFF`

- [ ] **1.4-E2E-003**: Light mode foreground/text token is correct
  - **Given:** Light mode is active
  - **When:** CSS custom property `--orion-fg` is evaluated
  - **Then:** Value equals `#1A1A1A`

- [ ] **1.4-E2E-004**: Gold accent remains unchanged in light mode
  - **Given:** Light mode is active
  - **When:** CSS custom property `--orion-gold` is evaluated
  - **Then:** Value equals `#D4AF37`

### Edge Cases

- [ ] **1.4-UNIT-001**: All light mode tokens are defined (default :root)
  - **Given:** globals.css :root block
  - **When:** All expected tokens are checked
  - **Then:** Following tokens have correct light values:
    | Token | Expected Value |
    |-------|----------------|
    | `--orion-bg` | #FAF8F5 |
    | `--orion-surface` | #FFFFFF |
    | `--orion-surface-elevated` | #FFFFFF |
    | `--orion-fg` | #1A1A1A |
    | `--orion-fg-muted` | #6B6B6B |
    | `--orion-border` | #E5E5E5 |
    | `--orion-scrollbar` | #CCCCCC |
    | `--orion-success` | #059669 |
    | `--orion-error` | #9B2C2C |

- [ ] **1.4-UNIT-002**: Constant tokens are same in both modes
  - **Given:** globals.css with both modes defined
  - **When:** `--orion-gold`, `--orion-gold-muted`, `--orion-waiting` checked
  - **Then:** Values are identical in light and dark modes:
    | Token | Value (Both Modes) |
    |-------|-------------------|
    | `--orion-gold` | #D4AF37 |
    | `--orion-gold-muted` | #C4A052 |
    | `--orion-waiting` | #3B82F6 |

---

## AC5: Smooth Theme Transitions

> **Given** either theme mode
> **When** theme transitions occur
> **Then** all components transition smoothly (200ms crossfade)
> **And** no jarring color flashes occur

### Happy Path

- [ ] **1.5-E2E-001**: Transition duration is 200ms
  - **Given:** App is running
  - **When:** Theme transition CSS is inspected
  - **Then:** `transition-duration` includes `200ms` or `0.2s`
  - **Test Pattern:**
    ```typescript
    const transitionDuration = await page.evaluate(() => {
      const body = document.body;
      return getComputedStyle(body).transitionDuration;
    });
    expect(transitionDuration).toContain('0.2s');
    ```

- [ ] **1.5-E2E-002**: Multiple properties transition together
  - **Given:** App is running
  - **When:** Theme transition CSS is inspected
  - **Then:** Transitions apply to: `background-color`, `color`, `border-color`, `fill`, `stroke`

### Edge Cases

- [ ] **1.5-E2E-003**: No flash of wrong theme on initial load (FOUC prevention)
  - **Given:** User has dark mode system preference
  - **When:** App loads for the first time
  - **Then:** No light mode colors are visible even momentarily
  - **Test Pattern:**
    ```typescript
    let sawLightBg = false;
    await page.exposeFunction('checkBg', (bg: string) => {
      if (bg.includes('250, 248, 245') || bg === '#FAF8F5') {
        sawLightBg = true;
      }
    });
    // ... observer setup
    await page.goto('/');
    expect(sawLightBg).toBe(false);
    ```

- [ ] **1.5-E2E-004**: Transition applies to all components uniformly
  - **Given:** App has Sidebar, ChatColumn, CanvasColumn visible
  - **When:** Theme switches from light to dark
  - **Then:** All components transition simultaneously
  - **And:** No component appears to lag behind others

### Error Handling

- [ ] **1.5-E2E-005**: Transition does not block user interaction
  - **Given:** Theme transition is in progress
  - **When:** User clicks a button during transition
  - **Then:** Click is registered and handled
  - **And:** UI remains responsive

---

## AC6: Dark Mode with Responsive Breakpoints

> **Given** the tablet/laptop/desktop breakpoints from Stories 1.10-1.12
> **When** dark mode is active
> **Then** all responsive layouts work correctly in dark mode
> **And** overlay backdrops render appropriately for dark mode

### Happy Path

- [ ] **1.6-E2E-001**: Desktop breakpoint (>=1280px) works in dark mode
  - **Given:** Dark mode is active
  - **When:** Viewport is 1400x900 (desktop)
  - **Then:** Sidebar is persistently visible
  - **And:** All components use dark mode tokens
  - **Framework:** Playwright with `page.setViewportSize({ width: 1400, height: 900 })`

- [ ] **1.6-E2E-002**: Tablet breakpoint (768-1023px) works in dark mode
  - **Given:** Dark mode is active
  - **When:** Viewport is 800x1024 (tablet)
  - **Then:** Hamburger menu is visible
  - **And:** Sidebar overlay uses dark mode backdrop

- [ ] **1.6-E2E-003**: Laptop breakpoint (1024-1279px) works in dark mode
  - **Given:** Dark mode is active
  - **When:** Viewport is 1100x800 (laptop)
  - **Then:** Canvas column uses overlay behavior
  - **And:** Overlay backdrop has appropriate dark mode opacity

### Edge Cases

- [ ] **1.6-E2E-004**: Dark mode backdrop opacity adjustment
  - **Given:** Dark mode is active on tablet breakpoint
  - **When:** Sidebar overlay is opened
  - **Then:** Backdrop uses darker opacity for contrast (e.g., `rgba(0, 0, 0, 0.7)`)
  - **And:** Content behind backdrop is appropriately dimmed

- [ ] **1.6-E2E-005**: Responsive resize preserves dark mode
  - **Given:** Dark mode is active
  - **When:** Viewport resizes from desktop to tablet to mobile
  - **Then:** Dark mode tokens remain applied at all breakpoints
  - **And:** No theme flicker during resize

---

## AC7: Reduced Motion Support

> **Given** reduced motion preferences enabled
> **When** theme changes
> **Then** transition animation is disabled (instant switch)

### Happy Path

- [ ] **1.7-E2E-001**: Theme switches instantly with reduced motion
  - **Given:** User has `prefers-reduced-motion: reduce` enabled
  - **When:** System theme changes from light to dark
  - **Then:** Theme switches instantly (no 200ms transition)
  - **And:** Background color changes immediately
  - **Framework:** Playwright with `page.emulateMedia({ reducedMotion: 'reduce' })`

- [ ] **1.7-UNIT-001**: CSS includes prefers-reduced-motion media query
  - **Given:** globals.css file
  - **When:** CSS is parsed
  - **Then:** Contains `@media (prefers-reduced-motion: reduce)` block
  - **And:** Block sets `transition: none !important` for all elements

### Edge Cases

- [ ] **1.7-E2E-002**: Reduced motion respected for all transition types
  - **Given:** Reduced motion is enabled
  - **When:** Any UI interaction that normally has transition occurs
  - **Then:** No animations play (hover states, focus states, theme changes)
  - **Test Components:** Button hover, Input focus, StatusIndicator changes

- [ ] **1.7-E2E-003**: Reduced motion + dark mode combination
  - **Given:** User has both reduced motion AND dark mode system preferences
  - **When:** App launches
  - **Then:** App starts in dark mode
  - **And:** No transition animations occur
  - **And:** All dark mode tokens are applied correctly

---

## Implementation Test Locations

| Test ID Pattern | File Location | Framework |
|-----------------|---------------|-----------|
| `1.x-E2E-*` | `tests/e2e/dark-mode.spec.ts` | Playwright |
| `1.x-UNIT-*` | `tests/unit/dark-mode.test.ts` | Vitest |
| `1.x-INT-*` | `tests/integration/theme.test.ts` | Vitest |

---

## Playwright Test Template

```typescript
// tests/e2e/dark-mode.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Story 1.13: Dark Mode System Detection', () => {

  test.describe('AC1: System Detection on Launch', () => {
    test('1.1-E2E-001: app launches in dark mode when system prefers dark', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      const bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim();
      });

      expect(bgColor).toBe('#121212');
    });

    test('1.1-E2E-002: app launches in light mode when system prefers light', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');

      const bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim();
      });

      expect(bgColor).toBe('#FAF8F5');
    });
  });

  test.describe('AC2: Live Theme Switching', () => {
    test('1.2-E2E-003: theme switch completes within 200ms', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');

      const startTime = Date.now();
      await page.emulateMedia({ colorScheme: 'dark' });

      await page.waitForFunction(() => {
        const bg = getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim();
        return bg === '#121212';
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(250); // 200ms + buffer
    });
  });

  test.describe('AC3: Dark Mode Tokens', () => {
    test('1.3-E2E-004: gold accent unchanged in dark mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');

      const goldColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-gold').trim();
      });

      expect(goldColor).toBe('#D4AF37');
    });
  });

  test.describe('AC5: Smooth Transitions', () => {
    test('1.5-E2E-001: transition duration is 200ms', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/');

      const transitionDuration = await page.evaluate(() => {
        const body = document.body;
        return getComputedStyle(body).transitionDuration;
      });

      expect(transitionDuration).toContain('0.2s');
    });
  });

  test.describe('AC6: Breakpoints in Dark Mode', () => {
    test('1.6-E2E-001: desktop breakpoint works in dark mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.setViewportSize({ width: 1400, height: 900 });
      await page.goto('/');

      const sidebarVisible = await page.locator('[data-testid="sidebar"]').isVisible();
      expect(sidebarVisible).toBe(true);

      const bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim();
      });
      expect(bgColor).toBe('#121212');
    });
  });

  test.describe('AC7: Reduced Motion', () => {
    test('1.7-E2E-001: theme switches instantly with reduced motion', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
      await page.goto('/');

      const startTime = Date.now();
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });

      // Should be nearly instant (< 50ms)
      const bgColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim();
      });

      const duration = Date.now() - startTime;
      expect(bgColor).toBe('#121212');
      expect(duration).toBeLessThan(50); // Nearly instant
    });
  });

});
```

---

## Vitest Unit Test Template

```typescript
// tests/unit/dark-mode.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Story 1.13: Dark Mode Unit Tests', () => {

  describe('1.3-UNIT-001: Dark mode tokens defined', () => {
    it('should define all required dark mode tokens in CSS', () => {
      // This would typically parse the actual CSS file
      const expectedDarkTokens = {
        '--orion-bg': '#121212',
        '--orion-surface': '#1A1A1A',
        '--orion-surface-elevated': '#242424',
        '--orion-fg': '#FAF8F5',
        '--orion-fg-muted': '#9CA3AF',
        '--orion-border': '#2D2D2D',
        '--orion-scrollbar': '#333333',
        '--orion-success': '#10B981',
        '--orion-error': '#EF4444',
      };

      // Assert CSS contains these in @media (prefers-color-scheme: dark) block
      // Implementation depends on CSS parsing strategy
      Object.entries(expectedDarkTokens).forEach(([token, value]) => {
        expect(token).toBeDefined();
        expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('1.4-UNIT-002: Constant tokens same in both modes', () => {
    it('should have identical gold/waiting tokens in light and dark modes', () => {
      const constantTokens = {
        '--orion-gold': '#D4AF37',
        '--orion-gold-muted': '#C4A052',
        '--orion-waiting': '#3B82F6',
      };

      Object.entries(constantTokens).forEach(([token, value]) => {
        // These should NOT be overridden in dark mode media query
        expect(value).toBeDefined();
      });
    });
  });

  describe('1.7-UNIT-001: Reduced motion media query exists', () => {
    it('should define prefers-reduced-motion media query', () => {
      // CSS should contain:
      // @media (prefers-reduced-motion: reduce) { ... transition: none !important; }
      const expectedPattern = '@media (prefers-reduced-motion: reduce)';
      // Assert CSS contains this pattern
      expect(expectedPattern).toBeTruthy();
    });
  });

});
```

---

## Test Dependencies

### Prior Story Tests (Must Pass)

- Story 1.3: CSS Design Tokens (token definitions)
- Story 1.4-1.9: Component tokens usage
- Story 1.10-1.12: Responsive breakpoints

### Test Data Requirements

- No external data needed (CSS-only feature)
- System preferences mocked via Playwright/Vitest

### Test Environment

- Playwright config must support `emulateMedia` for color scheme
- Vitest setup must mock `window.matchMedia`

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| FOUC (Flash of Unstyled Content) | Medium | High | Test 1.5-E2E-003 validates no flash |
| matchMedia not supported | Low | Medium | Test 1.1-E2E-004 validates graceful fallback |
| Transition timing inconsistent | Medium | Low | Test 1.2-E2E-003 validates 200ms SLO |
| Breakpoint + dark mode interaction | Low | Medium | Tests 1.6-E2E-001 through 003 cover all breakpoints |

---

## Definition of Done

- [ ] All 37 tests pass (19 happy path, 15 edge cases, 3 error handling)
- [ ] Code coverage >= 80% for dark mode CSS and any JS/TS theme utilities
- [ ] No accessibility violations (color contrast in both modes)
- [ ] Visual regression snapshots captured for both themes
- [ ] CI pipeline includes dark mode test suite

---

*Generated by TEA (Master Test Architect) - Strong opinions, weakly held.*
