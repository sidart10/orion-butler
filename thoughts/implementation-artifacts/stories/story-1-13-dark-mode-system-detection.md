# Story 1.13: Dark Mode - System Detection

Status: done

## Story

As a **user**,
I want the app to match my system dark/light preference,
So that it feels native to my macOS settings.

## Acceptance Criteria

1. **Given** macOS is set to dark mode
   **When** I launch the app (with no manual override set)
   **Then** the app displays in dark mode
   **And** design tokens switch to dark variants

2. **Given** the app is running
   **When** macOS switches from light mode to dark mode (or vice versa)
   **Then** the app switches theme automatically
   **And** the switch happens within 200ms

3. **Given** dark mode is active
   **When** I view any component
   **Then** gold accent (#D4AF37) remains unchanged
   **And** backgrounds use `--orion-bg: #121212`
   **And** surfaces use `--orion-surface: #1A1A1A`
   **And** text uses `--orion-fg: #FAF8F5`

4. **Given** light mode is active
   **When** I view any component
   **Then** gold accent (#D4AF37) remains unchanged
   **And** backgrounds use `--orion-bg: #FAF8F5`
   **And** surfaces use `--orion-surface: #FFFFFF`
   **And** text uses `--orion-fg: #1A1A1A`

5. **Given** either theme mode
   **When** theme transitions occur
   **Then** all components transition smoothly (200ms crossfade)
   **And** no jarring color flashes occur

6. **Given** the tablet/laptop/desktop breakpoints from Stories 1.10-1.12
   **When** dark mode is active
   **Then** all responsive layouts work correctly in dark mode
   **And** overlay backdrops render appropriately for dark mode

7. **Given** reduced motion preferences enabled
   **When** theme changes
   **Then** transition animation is disabled (instant switch)

## Tasks / Subtasks

- [x] Task 1: Define dark mode CSS custom properties (AC: #3, #4)
  - [x] 1.1: Add dark mode color tokens to globals.css
  - [x] 1.2: Add `@media (prefers-color-scheme: dark)` media query block
  - [x] 1.3: Define all --orion-* dark variants as specified in UX spec
  - [x] 1.4: Ensure gold accent (#D4AF37) is NOT changed in dark mode

- [x] Task 2: Configure theme transition styles (AC: #5)
  - [x] 2.1: Add color transition CSS for theme changes
  - [x] 2.2: Set transition duration to 200ms
  - [x] 2.3: Apply transitions to background-color, color, border-color, fill, stroke
  - [x] 2.4: Use `prefers-reduced-motion` to disable transitions when needed

- [x] Task 3: Update root layout for dark mode support (AC: #1, #2)
  - [x] 3.1: Ensure `<html>` element supports color-scheme
  - [x] 3.2: Add `color-scheme: light dark` to root CSS
  - [x] 3.3: Verify system preference detection works on load

- [x] Task 4: Update component tokens for dark mode (AC: #3, #4)
  - [x] 4.1: Audit all components using --orion-* tokens
  - [x] 4.2: Verify Sidebar component uses correct tokens
  - [x] 4.3: Verify ChatColumn component uses correct tokens
  - [x] 4.4: Verify CanvasColumn component uses correct tokens
  - [x] 4.5: Verify Button variants use correct tokens
  - [x] 4.6: Verify Input/Textarea components use correct tokens
  - [x] 4.7: Verify StatusIndicator component uses correct tokens

- [x] Task 5: Update overlay/backdrop for dark mode (AC: #6)
  - [x] 5.1: Adjust backdrop opacity for dark mode if needed
  - [x] 5.2: Verify sidebar overlay renders correctly in dark mode
  - [x] 5.3: Verify canvas overlay renders correctly in dark mode

- [x] Task 6: Add reduced motion support (AC: #7)
  - [x] 6.1: Add `@media (prefers-reduced-motion: reduce)` block
  - [x] 6.2: Disable theme transition when reduced motion active
  - [x] 6.3: Test instant theme switch with reduced motion

- [x] Task 7: Write unit tests for dark mode detection
  - [x] 7.1: Test dark mode tokens are applied when prefers-color-scheme: dark
  - [x] 7.2: Test light mode tokens are applied when prefers-color-scheme: light
  - [x] 7.3: Test gold accent remains constant in both modes
  - [x] 7.4: Test transition duration is 200ms

- [x] Task 8: Write E2E tests for dark mode behavior
  - [x] 8.1: Test app starts in dark mode when system is dark
  - [x] 8.2: Test app starts in light mode when system is light
  - [x] 8.3: Test all breakpoints work in dark mode
  - [x] 8.4: Test no color flash on initial load

## Dev Notes

### Architecture Compliance

**Design Token Pattern (from Story 1.3, Architecture.md):**
- All colors use `--orion-*` CSS custom properties
- Dark mode variants defined in same globals.css file
- Media query approach allows automatic system detection

**UX Specification Reference (Dark Mode Support section):**
- Gold accent (#D4AF37) remains constant - brand signature, unchanged in dark mode
- Background and foreground colors invert while preserving Editorial Luxury aesthetic
- 200ms crossfade transition on theme switch

### Dark Mode Token Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--orion-bg` | #FAF8F5 (cream) | #121212 | Main background |
| `--orion-surface` | #FFFFFF | #1A1A1A | Cards, panels, inputs |
| `--orion-surface-elevated` | #FFFFFF | #242424 | Modals, popovers, elevated content |
| `--orion-fg` | #1A1A1A | #FAF8F5 | Primary text |
| `--orion-fg-muted` | #6B6B6B | #9CA3AF | Secondary text, placeholders |
| `--orion-border` | #E5E5E5 | #2D2D2D | Borders, dividers |
| `--orion-scrollbar` | #CCCCCC | #333333 | Scrollbar thumb |
| `--orion-success` | #059669 | #10B981 | Success states (brighter in dark) |
| `--orion-error` | #9B2C2C | #EF4444 | Error states (brighter in dark) |

### Constant Tokens (Same in Both Modes)

| Token | Value | Usage |
|-------|-------|-------|
| `--orion-gold` | #D4AF37 | Primary accent, success, active |
| `--orion-gold-muted` | #C4A052 | Subtle accents, backgrounds |
| `--orion-waiting` | #3B82F6 | Waiting/blocked states (from Story 1.9) |

### CSS Implementation

```css
/* globals.css */

:root {
  /* Light mode (default) */
  --orion-bg: #FAF8F5;
  --orion-surface: #FFFFFF;
  --orion-surface-elevated: #FFFFFF;
  --orion-fg: #1A1A1A;
  --orion-fg-muted: #6B6B6B;
  --orion-border: #E5E5E5;
  --orion-scrollbar: #CCCCCC;
  --orion-success: #059669;
  --orion-error: #9B2C2C;

  /* Constant tokens (same in both modes) */
  --orion-gold: #D4AF37;
  --orion-gold-muted: #C4A052;
  --orion-waiting: #3B82F6;

  /* Color scheme support */
  color-scheme: light dark;
}

/* System dark mode detection */
@media (prefers-color-scheme: dark) {
  :root {
    --orion-bg: #121212;
    --orion-surface: #1A1A1A;
    --orion-surface-elevated: #242424;
    --orion-fg: #FAF8F5;
    --orion-fg-muted: #9CA3AF;
    --orion-border: #2D2D2D;
    --orion-scrollbar: #333333;
    --orion-success: #10B981;
    --orion-error: #EF4444;
  }
}

/* Theme transition */
*,
*::before,
*::after {
  transition: background-color 200ms ease,
              color 200ms ease,
              border-color 200ms ease,
              fill 200ms ease,
              stroke 200ms ease;
}

/* Disable transitions for reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition: none !important;
  }
}
```

### Overlay Opacity Adjustments for Dark Mode

Dark mode may need adjusted backdrop opacity for proper contrast:

```css
/* Light mode backdrop */
.backdrop {
  background: rgba(0, 0, 0, 0.5);
}

/* Dark mode backdrop - potentially lighter for better contrast */
@media (prefers-color-scheme: dark) {
  .backdrop {
    background: rgba(0, 0, 0, 0.7); /* Slightly more opaque */
  }
}
```

### Gold Hover/Active State Overlays (Dark Mode)

From UX spec, use these opacity overlays for interactive states:

| Value | Usage |
|-------|-------|
| `rgba(212, 175, 55, 0.05)` | Gold hover background |
| `rgba(212, 175, 55, 0.08)` | Running/active state background |
| `rgba(212, 175, 55, 0.10)` | Gold active/pressed state |
| `rgba(239, 68, 68, 0.08)` | Error state background |

### Root Layout Configuration

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Color scheme meta tag for proper browser behavior */}
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="bg-orion-bg text-orion-fg">
        {children}
      </body>
    </html>
  );
}
```

### Dependencies on Prior Stories

| Story | Dependency |
|-------|------------|
| 1.3 | CSS Design Tokens - all `--orion-*` variables defined |
| 1.4 | Sidebar uses design tokens |
| 1.5 | ChatColumn uses design tokens |
| 1.6 | CanvasColumn uses design tokens |
| 1.7 | Button variants use design tokens |
| 1.8 | Input/Textarea use design tokens |
| 1.9 | StatusIndicator uses design tokens |
| 1.10-1.12 | Breakpoints must work in dark mode |

### Files to Create/Modify

| File | Change |
|------|--------|
| `src/app/globals.css` | Add dark mode media query and tokens |
| `src/app/layout.tsx` | Add color-scheme meta and html attributes |
| `src/components/layout/Backdrop.tsx` | Adjust opacity for dark mode if needed |
| `tests/unit/dark-mode.test.ts` | New unit tests for token values |
| `tests/e2e/dark-mode.spec.ts` | New E2E tests for dark mode behavior |

### Testing Standards

**Unit Tests (Vitest):**
- Mock `window.matchMedia` to simulate system preference
- Test CSS custom property values in both modes
- Test that gold accent is unchanged

```typescript
// tests/unit/dark-mode.test.ts
describe('Dark Mode Tokens', () => {
  it('uses light mode tokens by default', () => {
    // Setup light mode
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const root = document.documentElement;
    const styles = getComputedStyle(root);

    expect(styles.getPropertyValue('--orion-bg').trim()).toBe('#FAF8F5');
  });

  it('uses dark mode tokens when system prefers dark', () => {
    // Setup dark mode
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    // Force style recalculation
    // ...

    const root = document.documentElement;
    const styles = getComputedStyle(root);

    expect(styles.getPropertyValue('--orion-bg').trim()).toBe('#121212');
  });

  it('gold accent remains constant in both modes', () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    // Gold should be the same regardless of mode
    expect(styles.getPropertyValue('--orion-gold').trim()).toBe('#D4AF37');
  });
});
```

**E2E Tests (Playwright):**

```typescript
// tests/e2e/dark-mode.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dark Mode System Detection', () => {
  test('app renders in dark mode when system prefers dark', async ({ page }) => {
    // Emulate dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    // Check background color
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim();
    });

    expect(bgColor).toBe('#121212');
  });

  test('app renders in light mode when system prefers light', async ({ page }) => {
    // Emulate light mode
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim();
    });

    expect(bgColor).toBe('#FAF8F5');
  });

  test('gold accent is constant in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    const goldColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-gold').trim();
    });

    expect(goldColor).toBe('#D4AF37');
  });

  test('gold accent is constant in light mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    const goldColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-gold').trim();
    });

    expect(goldColor).toBe('#D4AF37');
  });

  test('theme transition is 200ms', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    const transitionDuration = await page.evaluate(() => {
      const body = document.body;
      const styles = getComputedStyle(body);
      return styles.transitionDuration;
    });

    // Transition should include 200ms (0.2s)
    expect(transitionDuration).toContain('0.2s');
  });

  test('all breakpoints work in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });

    // Test desktop breakpoint
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('/');

    const sidebarVisible = await page.locator('[data-testid="sidebar"]').isVisible();
    expect(sidebarVisible).toBe(true);

    // Test tablet breakpoint
    await page.setViewportSize({ width: 800, height: 1024 });

    const hamburgerVisible = await page.locator('[data-testid="hamburger-menu"]').isVisible();
    expect(hamburgerVisible).toBe(true);
  });

  test('no flash of wrong theme on load', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });

    // Listen for any style changes during load
    let sawLightBg = false;
    await page.exposeFunction('checkBg', (bg: string) => {
      if (bg === '#FAF8F5' || bg.includes('250, 248, 245')) {
        sawLightBg = true;
      }
    });

    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        const bg = getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg');
        (window as any).checkBg(bg);
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Should not have flashed light mode
    expect(sawLightBg).toBe(false);
  });
});
```

### Project Structure Notes

- CSS tokens in `src/app/globals.css` under `:root` and media query
- No new components required - this story modifies existing tokens
- Tests in `tests/unit/` and `tests/e2e/`

### UX Specification Reference

From UX Design Specification (ux-design-specification.md) - Dark Mode Support section:

**Design Principles:**
- Gold accent (#D4AF37) remains constant - brand signature, unchanged in dark mode
- Background and foreground colors invert while preserving Editorial Luxury aesthetic
- Borders and surfaces use complementary dark values
- Status colors (success, error) are slightly brighter in dark mode for visibility

**Detection & Toggle:**
- System preference: `prefers-color-scheme` media query (default)
- Manual toggle: Settings -> Appearance (Story 1.14)
- Transition: 200ms crossfade on theme switch

### References

- [Source: thoughts/planning-artifacts/epics.md#Story 1.13: Dark Mode - System Detection]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Dark Mode Support]
- [Source: thoughts/planning-artifacts/design-system-adoption.md]
- [Source: .ralph/story-chain.md#Story 1.12: Tablet Breakpoint]

## Story Chain Context

### Prior Decisions to Honor

From **Story 1.12 (Tablet Breakpoint)**:
- Backdrop component uses `rgba(0, 0, 0, 0.5)` - may need dark mode adjustment
- HamburgerMenu uses `--orion-fg` and `--orion-gold` for colors

From **Story 1.11 (Laptop Breakpoint)**:
- Canvas overlay uses design tokens
- Tooltip pattern relies on surface/border tokens

From **Story 1.10 (Desktop Breakpoint)**:
- No-scroll constraint - unaffected by dark mode
- Layout tokens - dimensions unchanged

From **Story 1.9 (StatusIndicator)**:
- Uses `--orion-gold`, `--orion-fg-muted`, `--orion-waiting` (`#3B82F6`), `--orion-error`
- Colors must work in both modes
- Waiting color (#3B82F6) is constant like gold

From **Story 1.8 (Input Field)**:
- Uses `--orion-surface`, `--orion-border`, `--orion-fg`, `--orion-fg-muted`, `--orion-gold`, `--orion-error`
- Focus state uses gold outline - unchanged in dark mode

From **Story 1.7 (Button)**:
- Primary button uses gold fill - unchanged
- Destructive uses `--orion-error` - brighter in dark mode

From **Story 1.3 (CSS Design Tokens)**:
- Established `--orion-*` naming pattern
- Dark mode tokens mentioned but not fully implemented
- This story completes the dark mode token implementation

### What This Story Establishes

1. **System Dark Mode Detection:** `@media (prefers-color-scheme: dark)` for automatic theme
2. **Dark Mode Token Values:** Complete dark palette as specified in UX spec
3. **Theme Transition:** 200ms crossfade for smooth switching
4. **Constant Brand Colors:** Gold accent and waiting blue unchanged in both modes
5. **Reduced Motion Support:** Instant theme switch when `prefers-reduced-motion: reduce`
6. **Color Scheme Meta:** `<meta name="color-scheme" content="light dark">`

### Notes for Next Story (1.14: Dark Mode - Manual Toggle)

- Build on system detection from this story
- Add manual override via Settings UI
- Three options: "Light", "Dark", "System"
- Preference stored in SQLite preferences table
- Manual preference overrides media query
- Add `.dark` class to html element for manual dark mode
- "System" option reverts to media query behavior

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Implementation Date

2026-01-26

### Debug Log References

None - implementation completed without significant debugging required.

### Completion Notes

1. **Dark Mode Tokens Already Existed**: The dark mode CSS tokens were already defined in `design-system/styles/globals.css` from Story 1.3. This story verified their completeness and added missing infrastructure.

2. **Added Theme Transitions**: Added 200ms transition for `background-color`, `color`, `border-color`, `fill`, `stroke` to all elements.

3. **Added color-scheme Support**: Added `color-scheme: light dark` to `:root` CSS and `<meta name="color-scheme" content="light dark">` to layout.tsx.

4. **Updated Root Layout**: Added `suppressHydrationWarning` to `<html>` element, moved meta tag to `<head>`, added `bg-orion-bg text-orion-fg` classes to body.

5. **Updated Backdrop Components**: Added `dark:bg-black/70` for higher opacity in dark mode (vs `bg-black/50` in light mode) for better contrast.

6. **Added Reduced Motion Support**: Added `@media (prefers-reduced-motion: reduce)` with `transition: none !important` to disable theme transitions.

7. **Fixed Pre-existing Test**: Updated `tests/unit/fonts/font-configuration.spec.ts` to handle both template literal and string className formats on body element.

8. **Enabled webServer in Playwright Config**: Uncommented the webServer block in `playwright.config.ts` to allow E2E tests to run with automatic dev server startup.

### Test Summary

- **Unit Tests**: 69 tests pass (56 dark-mode specific + 13 font config)
- **E2E Tests**: 26 tests pass

### File List

**Modified:**
- `/Users/sid/Desktop/orion-butler/design-system/styles/globals.css` - Added theme transition styles, color-scheme support, reduced motion support
- `/Users/sid/Desktop/orion-butler/src/app/layout.tsx` - Added color-scheme meta tag, suppressHydrationWarning, design token classes on body
- `/Users/sid/Desktop/orion-butler/src/components/layout/Backdrop.tsx` - Added dark:bg-black/70 for dark mode backdrop
- `/Users/sid/Desktop/orion-butler/src/components/canvas/CanvasColumn.tsx` - Added dark:bg-black/40 for dark mode canvas backdrop
- `/Users/sid/Desktop/orion-butler/tests/unit/fonts/font-configuration.spec.ts` - Fixed test to handle string className format
- `/Users/sid/Desktop/orion-butler/playwright.config.ts` - Enabled webServer for E2E tests

**Created:**
- `/Users/sid/Desktop/orion-butler/tests/unit/dark-mode/dark-mode-tokens.spec.ts` - 35 unit tests for CSS token definitions
- `/Users/sid/Desktop/orion-butler/tests/unit/dark-mode/layout-dark-mode.spec.ts` - 9 unit tests for layout configuration
- `/Users/sid/Desktop/orion-butler/tests/unit/dark-mode/backdrop-dark-mode.spec.tsx` - 12 unit tests for Backdrop dark mode styling
- `/Users/sid/Desktop/orion-butler/tests/e2e/dark-mode.spec.ts` - 26 E2E tests for dark mode behavior
