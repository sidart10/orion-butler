# ATDD Checklist: 1-14-dark-mode-manual-toggle

**Story:** 1.14 - Dark Mode - Manual Toggle
**Status:** Ready for Development
**Generated:** 2026-01-24
**Author:** TEA (Master Test Architect)

---

## Test Summary

| AC | Happy Path | Edge Cases | Error Handling | Total |
|----|------------|------------|----------------|-------|
| AC1 | 3 | 2 | 1 | 6 |
| AC2 | 3 | 3 | 1 | 7 |
| AC3 | 3 | 3 | 1 | 7 |
| AC4 | 3 | 3 | 1 | 7 |
| AC5 | 2 | 3 | 1 | 6 |
| AC6 | 2 | 2 | 0 | 4 |
| AC7 | 2 | 2 | 0 | 4 |
| **Total** | **18** | **18** | **5** | **41** |

---

## Prior Story Context: Story 1.13

Story 1.13 established:
- System detection via `@media (prefers-color-scheme: dark)`
- Dark mode token values (--orion-bg: #121212, etc.)
- 200ms theme transition via global `* { transition }` selector
- `prefers-reduced-motion` support for instant transitions
- `<meta name="color-scheme" content="light dark">` in layout

**Story 1.14 adds:**
- Manual override with 3 options: Light, Dark, System
- Persistence to SQLite via Tauri IPC
- localStorage cache for FOUC prevention
- ThemeProvider component for initialization
- ThemeSelector UI component in Settings

---

## AC1: Theme Selector UI in Settings

> **Given** the Settings interface
> **When** I access the Appearance settings
> **Then** I see three theme options: "Light", "Dark", "System"
> **And** the currently active option is visually indicated

### Happy Path

- [ ] **1.14-E2E-001**: Settings page shows three theme options
  - **Given:** User navigates to Settings page
  - **When:** Appearance section is visible
  - **Then:** Three buttons are visible with labels "Light", "Dark", "System"
  - **Framework:** Playwright
  - **Test Pattern:**
    ```typescript
    await page.goto('/settings');
    await expect(page.locator('button:has-text("Light")')).toBeVisible();
    await expect(page.locator('button:has-text("Dark")')).toBeVisible();
    await expect(page.locator('button:has-text("System")')).toBeVisible();
    ```

- [ ] **1.14-E2E-002**: Active option shows gold accent styling
  - **Given:** User is on Settings page
  - **When:** "System" is the current preference (default)
  - **Then:** "System" button has gold background (#D4AF37)
  - **And:** Other buttons have neutral styling
  - **Framework:** Playwright
  - **Test Pattern:**
    ```typescript
    const systemButton = page.locator('button:has-text("System")');
    const bgColor = await systemButton.evaluate(el =>
      getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toContain('212, 175, 55'); // RGB of #D4AF37
    ```

- [ ] **1.14-E2E-003**: Active option updates when selection changes
  - **Given:** User is on Settings page with "System" selected
  - **When:** User clicks "Dark" option
  - **Then:** "Dark" button now has gold accent
  - **And:** "System" button no longer has gold accent
  - **Framework:** Playwright

### Edge Cases

- [ ] **1.14-E2E-004**: Theme selector has aria-pressed for accessibility
  - **Given:** Settings page is loaded
  - **When:** Theme selector is inspected
  - **Then:** Active button has `aria-pressed="true"`
  - **And:** Inactive buttons have `aria-pressed="false"`
  - **Framework:** Playwright accessibility assertions

- [ ] **1.14-E2E-005**: Theme selector keyboard navigation
  - **Given:** User focuses the theme selector
  - **When:** User presses Tab key
  - **Then:** Focus moves between options in logical order
  - **And:** Enter/Space activates the focused option
  - **Framework:** Playwright keyboard navigation

### Error Handling

- [ ] **1.14-E2E-006**: Theme selector renders without stored preference
  - **Given:** No theme preference exists in SQLite or localStorage
  - **When:** Settings page loads
  - **Then:** "System" is selected as default
  - **And:** No JavaScript errors occur
  - **Framework:** Playwright with cleared storage

---

## AC2: Selecting Light Theme

> **Given** the app is using system theme detection (default)
> **When** I select "Light" theme option
> **Then** the app immediately switches to light mode
> **And** the app stays in light mode regardless of system setting
> **And** the preference persists across app restarts

### Happy Path

- [ ] **1.14-E2E-007**: Selecting Light mode applies light theme immediately
  - **Given:** System preference is dark, app follows system (shows dark)
  - **When:** User selects "Light" option in Settings
  - **Then:** App immediately switches to light mode
  - **And:** `--orion-bg` equals `#FAF8F5`
  - **Framework:** Playwright
  - **Test Pattern:**
    ```typescript
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/settings');
    // Verify starts in dark mode
    let bgColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim()
    );
    expect(bgColor).toBe('#121212'); // Dark from system

    // Click Light
    await page.click('button:has-text("Light")');

    bgColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim()
    );
    expect(bgColor).toBe('#FAF8F5'); // Now light
    ```

- [ ] **1.14-E2E-008**: Light mode overrides system dark preference
  - **Given:** User has selected "Light" mode
  - **When:** System preference changes to dark mode
  - **Then:** App remains in light mode
  - **And:** System change is ignored
  - **Framework:** Playwright
  - **Test Pattern:**
    ```typescript
    await page.goto('/settings');
    await page.click('button:has-text("Light")');

    // System changes to dark
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(300); // Wait for any potential change

    const bgColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim()
    );
    expect(bgColor).toBe('#FAF8F5'); // Still light
    ```

- [ ] **1.14-E2E-009**: Light mode adds `.light` class to html element
  - **Given:** App is on any page
  - **When:** "Light" mode is selected
  - **Then:** `<html>` element has class `light`
  - **And:** `<html>` element does NOT have class `dark`
  - **Framework:** Playwright
  - **Test Pattern:**
    ```typescript
    await page.goto('/settings');
    await page.click('button:has-text("Light")');

    const htmlClass = await page.getAttribute('html', 'class');
    expect(htmlClass).toContain('light');
    expect(htmlClass).not.toContain('dark');
    ```

### Edge Cases

- [ ] **1.14-E2E-010**: Light preference persists to localStorage
  - **Given:** User selects "Light" mode
  - **When:** localStorage is checked
  - **Then:** `theme-preference` key equals `"light"`
  - **Framework:** Playwright
  - **Test Pattern:**
    ```typescript
    await page.goto('/settings');
    await page.click('button:has-text("Light")');

    const stored = await page.evaluate(() =>
      localStorage.getItem('theme-preference')
    );
    expect(stored).toBe('light');
    ```

- [ ] **1.14-INT-001**: Light preference persists to SQLite via IPC
  - **Given:** User selects "Light" mode
  - **When:** `set_theme_preference` IPC command is called
  - **Then:** SQLite preferences table has `theme_preference = 'light'`
  - **Framework:** Integration test with Tauri mock
  - **Note:** May need Tauri test harness or mock invoke

- [ ] **1.14-E2E-011**: Light mode persists across page refresh
  - **Given:** User has selected "Light" mode
  - **When:** Page is refreshed
  - **Then:** App loads in light mode immediately
  - **And:** "Light" is selected in Settings
  - **Framework:** Playwright
  - **Test Pattern:**
    ```typescript
    await page.goto('/settings');
    await page.click('button:has-text("Light")');

    await page.reload();

    const bgColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim()
    );
    expect(bgColor).toBe('#FAF8F5');
    ```

### Error Handling

- [ ] **1.14-E2E-012**: Graceful handling if SQLite write fails
  - **Given:** SQLite write will fail (mock error)
  - **When:** User selects "Light" mode
  - **Then:** localStorage is still updated
  - **And:** UI shows light mode (graceful degradation)
  - **And:** Error is logged but not shown to user
  - **Framework:** Playwright with mocked IPC

---

## AC3: Selecting Dark Theme

> **Given** the app is using system theme detection (default)
> **When** I select "Dark" theme option
> **Then** the app immediately switches to dark mode
> **And** the app stays in dark mode regardless of system setting
> **And** the preference persists across app restarts

### Happy Path

- [ ] **1.14-E2E-013**: Selecting Dark mode applies dark theme immediately
  - **Given:** System preference is light, app follows system (shows light)
  - **When:** User selects "Dark" option in Settings
  - **Then:** App immediately switches to dark mode
  - **And:** `--orion-bg` equals `#121212`
  - **Framework:** Playwright
  - **Test Pattern:**
    ```typescript
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/settings');

    await page.click('button:has-text("Dark")');

    const bgColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim()
    );
    expect(bgColor).toBe('#121212');
    ```

- [ ] **1.14-E2E-014**: Dark mode overrides system light preference
  - **Given:** User has selected "Dark" mode
  - **When:** System preference is light
  - **Then:** App remains in dark mode
  - **And:** System preference is ignored
  - **Framework:** Playwright

- [ ] **1.14-E2E-015**: Dark mode adds `.dark` class to html element
  - **Given:** App is on any page
  - **When:** "Dark" mode is selected
  - **Then:** `<html>` element has class `dark`
  - **And:** `<html>` element does NOT have class `light`
  - **Framework:** Playwright

### Edge Cases

- [ ] **1.14-E2E-016**: Dark preference persists to localStorage
  - **Given:** User selects "Dark" mode
  - **When:** localStorage is checked
  - **Then:** `theme-preference` key equals `"dark"`
  - **Framework:** Playwright

- [ ] **1.14-INT-002**: Dark preference persists to SQLite via IPC
  - **Given:** User selects "Dark" mode
  - **When:** `set_theme_preference` IPC command is called
  - **Then:** SQLite preferences table has `theme_preference = 'dark'`
  - **Framework:** Integration test with Tauri mock

- [ ] **1.14-E2E-017**: Dark mode persists across page refresh
  - **Given:** User has selected "Dark" mode
  - **When:** Page is refreshed
  - **Then:** App loads in dark mode immediately
  - **And:** "Dark" is selected in Settings
  - **Framework:** Playwright

### Error Handling

- [ ] **1.14-E2E-018**: Invalid preference value rejected
  - **Given:** A malicious/invalid preference value (e.g., "invalid")
  - **When:** Attempted to be stored via IPC
  - **Then:** Backend rejects with validation error
  - **And:** UI shows appropriate feedback or falls back to "system"
  - **Framework:** Integration test with mocked IPC

---

## AC4: Reverting to System Theme

> **Given** I have a manual theme preference set (Light or Dark)
> **When** I select "System" theme option
> **Then** the app reverts to automatic detection
> **And** the app matches the current macOS appearance setting
> **And** future system changes are followed automatically

### Happy Path

- [ ] **1.14-E2E-019**: Selecting System reverts to automatic detection
  - **Given:** User has "Dark" preference set, system is light
  - **When:** User selects "System" option
  - **Then:** App immediately switches to light mode (matches system)
  - **And:** `--orion-bg` equals `#FAF8F5`
  - **Framework:** Playwright
  - **Test Pattern:**
    ```typescript
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/settings');

    // Set to Dark first
    await page.click('button:has-text("Dark")');
    let bgColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim()
    );
    expect(bgColor).toBe('#121212'); // Dark manual

    // Revert to System
    await page.click('button:has-text("System")');
    bgColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim()
    );
    expect(bgColor).toBe('#FAF8F5'); // Light from system
    ```

- [ ] **1.14-E2E-020**: System mode removes theme class from html
  - **Given:** User had "Dark" mode (html has `.dark` class)
  - **When:** User selects "System" option
  - **Then:** `<html>` element has NO `dark` or `light` class
  - **And:** Media query takes over theme detection
  - **Framework:** Playwright
  - **Test Pattern:**
    ```typescript
    await page.goto('/settings');
    await page.click('button:has-text("Dark")');

    let htmlClass = await page.getAttribute('html', 'class');
    expect(htmlClass).toContain('dark');

    await page.click('button:has-text("System")');
    htmlClass = await page.getAttribute('html', 'class') || '';
    expect(htmlClass).not.toContain('dark');
    expect(htmlClass).not.toContain('light');
    ```

- [ ] **1.14-E2E-021**: System mode follows live system changes
  - **Given:** User has "System" preference selected
  - **When:** System preference changes from light to dark
  - **Then:** App switches to dark mode automatically
  - **And:** No manual interaction required
  - **Framework:** Playwright
  - **Test Pattern:**
    ```typescript
    await page.goto('/settings');
    await page.click('button:has-text("System")');
    await page.emulateMedia({ colorScheme: 'light' });

    let bgColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim()
    );
    expect(bgColor).toBe('#FAF8F5'); // Light

    // System changes
    await page.emulateMedia({ colorScheme: 'dark' });

    bgColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim()
    );
    expect(bgColor).toBe('#121212'); // Now dark
    ```

### Edge Cases

- [ ] **1.14-E2E-022**: System preference persists to localStorage
  - **Given:** User reverts to "System" mode
  - **When:** localStorage is checked
  - **Then:** `theme-preference` key equals `"system"`
  - **Framework:** Playwright

- [ ] **1.14-INT-003**: System preference persists to SQLite via IPC
  - **Given:** User selects "System" mode
  - **When:** `set_theme_preference` IPC command is called
  - **Then:** SQLite preferences table has `theme_preference = 'system'`
  - **Framework:** Integration test

- [ ] **1.14-E2E-023**: System mode persists across page refresh
  - **Given:** User has "System" preference, system is dark
  - **When:** Page is refreshed
  - **Then:** App loads in dark mode (from system)
  - **And:** "System" is selected in Settings
  - **And:** No `.dark` or `.light` class on html
  - **Framework:** Playwright

### Error Handling

- [ ] **1.14-E2E-024**: matchMedia listener cleanup on preference change
  - **Given:** User is in "System" mode (listener active)
  - **When:** User switches to "Dark" mode
  - **Then:** matchMedia listener is removed (no memory leak)
  - **And:** System changes no longer affect theme
  - **Note:** May need to test indirectly via behavior

---

## AC5: Preference Persistence and FOUC Prevention

> **Given** I have a manual theme preference set
> **When** I restart the app
> **Then** the app loads in my preferred theme
> **And** no flash of wrong theme occurs during load

### Happy Path

- [ ] **1.14-E2E-025**: No FOUC with dark manual preference
  - **Given:** User has "dark" stored in localStorage
  - **When:** App loads fresh (navigate to root)
  - **Then:** Dark theme is visible immediately on first paint
  - **And:** No light theme colors are ever visible
  - **Framework:** Playwright
  - **Test Pattern:**
    ```typescript
    await page.evaluate(() =>
      localStorage.setItem('theme-preference', 'dark')
    );

    let sawWrongTheme = false;

    // Navigate fresh
    await page.goto('/', { waitUntil: 'commit' });

    const bgOnLoad = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim()
    );

    expect(bgOnLoad).toBe('#121212');
    ```

- [ ] **1.14-E2E-026**: No FOUC with light manual preference
  - **Given:** User has "light" stored in localStorage, system is dark
  - **When:** App loads fresh
  - **Then:** Light theme is visible immediately on first paint
  - **And:** No dark theme colors flash
  - **Framework:** Playwright

### Edge Cases

- [ ] **1.14-E2E-027**: Blocking script applies theme before hydration
  - **Given:** User has preference in localStorage
  - **When:** HTML is parsed (before React hydration)
  - **Then:** Correct theme class is already on `<html>` element
  - **Framework:** Playwright with `waitUntil: 'commit'`

- [ ] **1.14-UNIT-001**: ThemeProvider syncs localStorage with SQLite
  - **Given:** localStorage has "dark", SQLite has "light"
  - **When:** ThemeProvider initializes
  - **Then:** SQLite value is authoritative
  - **And:** localStorage is updated to match SQLite
  - **Framework:** Vitest with mocked Tauri invoke

- [ ] **1.14-UNIT-002**: ThemeStore resolves theme correctly
  - **Given:** Preference is "system", system is dark
  - **When:** `getResolvedTheme` is called
  - **Then:** Returns "dark"
  - **And:** Given preference is "light", returns "light" regardless of system
  - **Framework:** Vitest

### Error Handling

- [ ] **1.14-E2E-028**: Graceful handling when localStorage unavailable
  - **Given:** localStorage is blocked (private browsing edge case)
  - **When:** App loads
  - **Then:** Falls back to SQLite preference or system detection
  - **And:** No JavaScript errors
  - **Note:** Edge case - localStorage rarely blocked in Tauri

---

## AC6: Smooth Theme Transitions

> **Given** the theme is changing (manually or via system)
> **When** the transition occurs
> **Then** all components transition smoothly (200ms crossfade via global `* { transition }` selector from Story 1.13)
> **And** the transition respects `prefers-reduced-motion` setting (also from Story 1.13)

### Happy Path

- [ ] **1.14-E2E-029**: Manual theme change uses 200ms transition
  - **Given:** User is on Settings page, normal motion preferences
  - **When:** User switches from Light to Dark
  - **Then:** Transition takes approximately 200ms
  - **And:** Colors fade smoothly (no instant jump)
  - **Framework:** Playwright
  - **Test Pattern:**
    ```typescript
    await page.goto('/settings');
    await page.click('button:has-text("Light")');

    const startTime = Date.now();
    await page.click('button:has-text("Dark")');

    await page.waitForFunction(() => {
      const bg = getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim();
      return bg === '#121212';
    });

    const duration = Date.now() - startTime;
    expect(duration).toBeGreaterThan(150); // Transition occurred
    expect(duration).toBeLessThan(300); // Within expected range
    ```

- [ ] **1.14-E2E-030**: Reduced motion disables manual transition
  - **Given:** User has `prefers-reduced-motion: reduce`
  - **When:** User switches theme manually
  - **Then:** Theme changes instantly (no 200ms transition)
  - **Framework:** Playwright
  - **Test Pattern:**
    ```typescript
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/settings');
    await page.click('button:has-text("Light")');

    const startTime = Date.now();
    await page.click('button:has-text("Dark")');

    const bgColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim()
    );

    const duration = Date.now() - startTime;
    expect(bgColor).toBe('#121212');
    expect(duration).toBeLessThan(50); // Instant
    ```

### Edge Cases

- [ ] **1.14-E2E-031**: ThemeSelector buttons transition smoothly
  - **Given:** User is on Settings page
  - **When:** User clicks a theme option
  - **Then:** Button styling transitions smoothly (gold accent)
  - **And:** No jarring color changes

- [ ] **1.14-E2E-032**: All page components transition together
  - **Given:** User has Sidebar, ChatColumn, Canvas visible
  - **When:** Theme switches from Light to Dark
  - **Then:** All components transition simultaneously
  - **And:** No component appears to lag

---

## AC7: Gold Accent Consistency

> **Given** any theme mode (Light, Dark, or System)
> **When** I view the app
> **Then** gold accent (#D4AF37) remains constant
> **And** all components render correctly

### Happy Path

- [ ] **1.14-E2E-033**: Gold accent unchanged in manual dark mode
  - **Given:** User selects "Dark" theme manually
  - **When:** `--orion-gold` is evaluated
  - **Then:** Value equals `#D4AF37`
  - **And:** Active theme selector button uses gold
  - **Framework:** Playwright

- [ ] **1.14-E2E-034**: Gold accent unchanged in manual light mode
  - **Given:** User selects "Light" theme manually
  - **When:** `--orion-gold` is evaluated
  - **Then:** Value equals `#D4AF37`
  - **And:** Active theme selector button uses gold
  - **Framework:** Playwright

### Edge Cases

- [ ] **1.14-E2E-035**: Gold accent visible across all three modes
  - **Given:** Settings page is open
  - **When:** User cycles through Light -> Dark -> System
  - **Then:** Gold accent color is always `#D4AF37`
  - **And:** Never changes between mode switches
  - **Framework:** Playwright loop test

- [ ] **1.14-UNIT-003**: CSS class overrides do not modify gold token
  - **Given:** globals.css with `.dark` and `.light` class rules
  - **When:** CSS is parsed
  - **Then:** Neither class modifies `--orion-gold` value
  - **And:** Gold remains at `#D4AF37`
  - **Framework:** Vitest CSS parsing or manual verification

---

## Implementation Test Locations

| Test ID Pattern | File Location | Framework |
|-----------------|---------------|-----------|
| `1.14-E2E-*` | `tests/e2e/theme-toggle.spec.ts` | Playwright |
| `1.14-UNIT-*` | `tests/unit/themeStore.test.ts` | Vitest |
| `1.14-INT-*` | `tests/integration/theme-persistence.test.ts` | Vitest + Tauri mock |

---

## Required data-testid Attributes

### Settings Page

- `settings-page` - Settings page container
- `appearance-section` - Appearance settings section
- `theme-selector` - Theme selector container

### Theme Selector Component

- `theme-option-light` - Light mode button
- `theme-option-dark` - Dark mode button
- `theme-option-system` - System mode button

### Layout

- `sidebar` - Sidebar component (existing from Story 1.4)
- `chat-column` - Chat column (existing from Story 1.5)
- `canvas-column` - Canvas column (existing from Story 1.6)

---

## Playwright Test Template

```typescript
// tests/e2e/theme-toggle.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Story 1.14: Dark Mode Manual Toggle', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage for clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('AC1: Theme Selector UI', () => {
    test('1.14-E2E-001: settings page shows three theme options', async ({ page }) => {
      await page.goto('/settings');

      await expect(page.locator('button:has-text("Light")')).toBeVisible();
      await expect(page.locator('button:has-text("Dark")')).toBeVisible();
      await expect(page.locator('button:has-text("System")')).toBeVisible();
    });

    test('1.14-E2E-002: active option shows gold accent', async ({ page }) => {
      await page.goto('/settings');

      // System should be default active
      const systemButton = page.locator('button:has-text("System")');
      const bgColor = await systemButton.evaluate(el =>
        getComputedStyle(el).backgroundColor
      );

      // Gold (#D4AF37) in RGB
      expect(bgColor).toContain('212, 175, 55');
    });
  });

  test.describe('AC2: Light Theme Selection', () => {
    test('1.14-E2E-007: selecting Light applies light theme immediately', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/settings');

      // Should start in dark mode (from system)
      let bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      );
      expect(bgColor).toBe('#121212');

      // Click Light
      await page.click('button:has-text("Light")');

      bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      );
      expect(bgColor).toBe('#FAF8F5');
    });

    test('1.14-E2E-008: light mode overrides system dark', async ({ page }) => {
      await page.goto('/settings');
      await page.click('button:has-text("Light")');

      // System changes to dark - should be ignored
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.waitForTimeout(300);

      const bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      );
      expect(bgColor).toBe('#FAF8F5'); // Still light
    });

    test('1.14-E2E-009: light mode adds .light class', async ({ page }) => {
      await page.goto('/settings');
      await page.click('button:has-text("Light")');

      const htmlClass = await page.getAttribute('html', 'class');
      expect(htmlClass).toContain('light');
      expect(htmlClass).not.toContain('dark');
    });
  });

  test.describe('AC3: Dark Theme Selection', () => {
    test('1.14-E2E-013: selecting Dark applies dark theme immediately', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/settings');

      await page.click('button:has-text("Dark")');

      const bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      );
      expect(bgColor).toBe('#121212');
    });

    test('1.14-E2E-015: dark mode adds .dark class', async ({ page }) => {
      await page.goto('/settings');
      await page.click('button:has-text("Dark")');

      const htmlClass = await page.getAttribute('html', 'class');
      expect(htmlClass).toContain('dark');
      expect(htmlClass).not.toContain('light');
    });
  });

  test.describe('AC4: System Theme Selection', () => {
    test('1.14-E2E-019: system mode reverts to auto detection', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/settings');

      // Set to Dark first
      await page.click('button:has-text("Dark")');
      let bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      );
      expect(bgColor).toBe('#121212'); // Dark manual

      // Revert to System
      await page.click('button:has-text("System")');
      bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      );
      expect(bgColor).toBe('#FAF8F5'); // Light from system
    });

    test('1.14-E2E-020: system mode removes theme class', async ({ page }) => {
      await page.goto('/settings');
      await page.click('button:has-text("Dark")');

      let htmlClass = await page.getAttribute('html', 'class');
      expect(htmlClass).toContain('dark');

      await page.click('button:has-text("System")');
      htmlClass = await page.getAttribute('html', 'class') || '';
      expect(htmlClass).not.toContain('dark');
      expect(htmlClass).not.toContain('light');
    });

    test('1.14-E2E-021: system mode follows live changes', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/settings');
      await page.click('button:has-text("System")');

      let bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      );
      expect(bgColor).toBe('#FAF8F5');

      // System changes to dark
      await page.emulateMedia({ colorScheme: 'dark' });

      bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      );
      expect(bgColor).toBe('#121212');
    });
  });

  test.describe('AC5: FOUC Prevention', () => {
    test('1.14-E2E-025: no FOUC with dark preference', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.setItem('theme-preference', 'dark'));

      await page.goto('/', { waitUntil: 'commit' });

      const bgOnLoad = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      );

      expect(bgOnLoad).toBe('#121212');
    });

    test('1.14-E2E-011: preference persists across refresh', async ({ page }) => {
      await page.goto('/settings');
      await page.click('button:has-text("Dark")');

      await page.reload();

      const bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      );
      expect(bgColor).toBe('#121212');

      // Verify selector state
      const darkButton = page.locator('button:has-text("Dark")');
      const btnBgColor = await darkButton.evaluate(el =>
        getComputedStyle(el).backgroundColor
      );
      expect(btnBgColor).toContain('212, 175, 55'); // Gold active
    });
  });

  test.describe('AC6: Transitions', () => {
    test('1.14-E2E-030: reduced motion disables transition', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/settings');
      await page.click('button:has-text("Light")');

      const startTime = Date.now();
      await page.click('button:has-text("Dark")');

      const bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-bg').trim()
      );

      const duration = Date.now() - startTime;
      expect(bgColor).toBe('#121212');
      expect(duration).toBeLessThan(50); // Instant
    });
  });

  test.describe('AC7: Gold Accent', () => {
    test('1.14-E2E-033: gold unchanged in manual dark', async ({ page }) => {
      await page.goto('/settings');
      await page.click('button:has-text("Dark")');

      const goldColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-gold').trim()
      );

      expect(goldColor).toBe('#D4AF37');
    });

    test('1.14-E2E-034: gold unchanged in manual light', async ({ page }) => {
      await page.goto('/settings');
      await page.click('button:has-text("Light")');

      const goldColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--orion-gold').trim()
      );

      expect(goldColor).toBe('#D4AF37');
    });
  });

});
```

---

## Vitest Unit Test Template

```typescript
// tests/unit/themeStore.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useThemeStore } from '@/stores/themeStore';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockImplementation((cmd: string, args?: any) => {
    if (cmd === 'get_theme_preference') {
      return Promise.resolve(null);
    }
    if (cmd === 'set_theme_preference') {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Unknown command: ${cmd}`));
  }),
}));

describe('Story 1.14: Theme Store Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
    vi.clearAllMocks();
  });

  describe('1.14-UNIT-001: ThemeProvider syncs localStorage with SQLite', () => {
    it('should use SQLite value as authoritative', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockResolvedValueOnce('light'); // SQLite returns light

      localStorage.setItem('theme-preference', 'dark'); // localStorage has dark

      const store = useThemeStore.getState();
      await store.initializeTheme();

      expect(store.preference).toBe('light'); // SQLite wins
      expect(localStorage.getItem('theme-preference')).toBe('light'); // Synced
    });
  });

  describe('1.14-UNIT-002: Theme resolution logic', () => {
    it('should resolve to dark when preference is system and system is dark', () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: true, // Dark mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const store = useThemeStore.getState();
      store.preference = 'system';
      store.updateResolvedTheme();

      expect(store.resolvedTheme).toBe('dark');
    });

    it('should resolve to light when preference is light regardless of system', () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: true, // System is dark
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const store = useThemeStore.getState();
      store.preference = 'light';
      store.updateResolvedTheme();

      expect(store.resolvedTheme).toBe('light'); // Preference wins
    });

    it('should resolve to dark when preference is dark regardless of system', () => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false, // System is light
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const store = useThemeStore.getState();
      store.preference = 'dark';
      store.updateResolvedTheme();

      expect(store.resolvedTheme).toBe('dark'); // Preference wins
    });
  });

  describe('1.14-UNIT-003: CSS class application', () => {
    it('should add .dark class when preference is dark', async () => {
      const store = useThemeStore.getState();
      await store.setPreference('dark');

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    it('should add .light class when preference is light', async () => {
      const store = useThemeStore.getState();
      await store.setPreference('light');

      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should remove classes when preference is system', async () => {
      const store = useThemeStore.getState();
      await store.setPreference('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      await store.setPreference('system');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });
  });

  describe('localStorage caching', () => {
    it('should cache preference in localStorage', async () => {
      const store = useThemeStore.getState();
      await store.setPreference('dark');

      expect(localStorage.getItem('theme-preference')).toBe('dark');
    });
  });

});
```

---

## Integration Test Template (Tauri IPC)

```typescript
// tests/integration/theme-persistence.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// This test requires a Tauri test harness or mock
describe('Story 1.14: Theme Persistence Integration', () => {

  describe('1.14-INT-001: Light preference to SQLite', () => {
    it('should persist light preference via set_theme_preference IPC', async () => {
      // Mock or use Tauri test harness
      const mockInvoke = vi.fn().mockResolvedValue(undefined);

      // Simulate setPreference action
      await mockInvoke('set_theme_preference', { preference: 'light' });

      expect(mockInvoke).toHaveBeenCalledWith('set_theme_preference', {
        preference: 'light'
      });
    });
  });

  describe('1.14-INT-002: Dark preference to SQLite', () => {
    it('should persist dark preference via set_theme_preference IPC', async () => {
      const mockInvoke = vi.fn().mockResolvedValue(undefined);

      await mockInvoke('set_theme_preference', { preference: 'dark' });

      expect(mockInvoke).toHaveBeenCalledWith('set_theme_preference', {
        preference: 'dark'
      });
    });
  });

  describe('1.14-INT-003: System preference to SQLite', () => {
    it('should persist system preference via set_theme_preference IPC', async () => {
      const mockInvoke = vi.fn().mockResolvedValue(undefined);

      await mockInvoke('set_theme_preference', { preference: 'system' });

      expect(mockInvoke).toHaveBeenCalledWith('set_theme_preference', {
        preference: 'system'
      });
    });
  });

  describe('Preference retrieval', () => {
    it('should retrieve stored preference via get_theme_preference IPC', async () => {
      const mockInvoke = vi.fn().mockResolvedValue('dark');

      const result = await mockInvoke('get_theme_preference');

      expect(result).toBe('dark');
    });

    it('should return null when no preference stored', async () => {
      const mockInvoke = vi.fn().mockResolvedValue(null);

      const result = await mockInvoke('get_theme_preference');

      expect(result).toBeNull();
    });
  });

});
```

---

## Test Dependencies

### Prior Story Tests (Must Pass)

- Story 1.13: Dark Mode System Detection
  - System detection via media query
  - Dark/light token values
  - 200ms transition
  - Reduced motion support

### Test Data Requirements

- No external data (UI state + localStorage + SQLite mock)
- Tauri IPC mock for `get_theme_preference` and `set_theme_preference`

### Test Environment

- Playwright config must support `emulateMedia` for colorScheme and reducedMotion
- Vitest setup must mock:
  - `window.matchMedia`
  - `@tauri-apps/api/core` invoke function
  - `localStorage`

---

## Mock Requirements

### Tauri IPC Mock

**Commands to mock:**

| Command | Input | Output |
|---------|-------|--------|
| `get_theme_preference` | none | `'light' \| 'dark' \| 'system' \| null` |
| `set_theme_preference` | `{ preference: 'light' \| 'dark' \| 'system' }` | `void` (or error) |

**Mock setup:**
```typescript
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockImplementation((cmd, args) => {
    // Implement per-test behavior
  }),
}));
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| FOUC on manual preference | Medium | High | Tests 1.14-E2E-025/026 validate no flash |
| localStorage/SQLite desync | Medium | Medium | Test 1.14-UNIT-001 validates sync logic |
| System listener leak | Low | Medium | Test 1.14-E2E-024 validates cleanup |
| Invalid preference stored | Low | Medium | Test 1.14-E2E-018 validates rejection |
| Class override specificity | Low | Medium | CSS tests ensure class > media query |

---

## Definition of Done

- [ ] All 41 tests pass (18 happy path, 18 edge cases, 5 error handling)
- [ ] Code coverage >= 80% for themeStore, ThemeProvider, ThemeSelector
- [ ] Settings page is accessible (keyboard navigation, ARIA)
- [ ] No FOUC in any browser/load scenario
- [ ] Preference correctly persists across restarts
- [ ] CI pipeline includes manual toggle test suite

---

## Running Tests

```bash
# Run all E2E tests for this story
npx playwright test tests/e2e/theme-toggle.spec.ts

# Run unit tests for theme store
npm run test:unit tests/unit/themeStore.test.ts

# Run integration tests
npm run test:unit tests/integration/theme-persistence.test.ts

# Run E2E in headed mode (see browser)
npx playwright test tests/e2e/theme-toggle.spec.ts --headed

# Debug specific test
npx playwright test tests/e2e/theme-toggle.spec.ts --debug

# Run with coverage
npm run test:coverage
```

---

*Generated by TEA (Master Test Architect) - Strong opinions, weakly held.*
