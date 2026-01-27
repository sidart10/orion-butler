# ATDD Checklist: Story 1.10 - Desktop Breakpoint

**Story:** Desktop Breakpoint
**Epic:** 1 - Harness Foundation (UI/UX Shell)
**Status:** ready-for-dev
**Created:** 2026-01-24
**Test Framework:** Vitest (unit), Playwright (E2E)
**Author:** TEA (Master Test Architect)

---

## Executive Summary

This ATDD checklist covers the desktop breakpoint (>=1280px) implementation that establishes the full three-column layout. Tests focus on layout behavior, overflow handling, and breakpoint transitions. Following the test pyramid: 70% unit (CSS variables, layout calculations), 25% integration (AppShell composition), 5% E2E (viewport-based layout verification).

**Test Coverage Target:**
- Unit: 8 tests (CSS variables, layout classes, overflow constraints)
- Integration: 5 tests (AppShell three-column composition, responsive behavior)
- E2E: 6 tests (viewport-based layout verification, scroll behavior)

---

## AC1: Three-Column Layout at >=1280px

> Given a viewport width >=1280px, When the app is displayed, Then sidebar (280px), chat (flex-1), and canvas (480px when visible) are all visible

### Happy Path

- [ ] Test: 1.10-UNIT-001 - All three columns render at desktop viewport
  - Given: AppShell rendered at viewport width 1280px
  - When: Canvas is visible
  - Then: Sidebar (280px), ChatColumn (flex-1), CanvasColumn (480px) all display

- [ ] Test: 1.10-UNIT-002 - Sidebar has fixed 280px width at desktop breakpoint
  - Given: AppShell at desktop breakpoint
  - When: Layout computed
  - Then: Sidebar width is 280px (var(--orion-sidebar-width))

- [ ] Test: 1.10-UNIT-003 - Canvas has fixed 480px width when visible
  - Given: AppShell at desktop breakpoint with canvas open
  - When: Layout computed
  - Then: Canvas width is 480px (var(--orion-canvas-width))

- [ ] Test: 1.10-UNIT-004 - Chat uses flex-1 and fills remaining space
  - Given: AppShell at 1280px with canvas visible
  - When: Layout computed
  - Then: Chat column has flex: 1 and computed width is 520px (1280 - 280 - 480)

### Edge Cases

- [ ] Test: 1.10-E2E-001 - Layout at exactly 1280px boundary
  - Given: Viewport set to exactly 1280px width
  - When: App is displayed
  - Then: Three-column layout renders correctly (not mobile/tablet fallback)

- [ ] Test: 1.10-E2E-002 - Layout at 1281px (just above breakpoint)
  - Given: Viewport set to 1281px width
  - When: App is displayed
  - Then: Three-column layout identical to 1280px (no layout shift)

- [ ] Test: 1.10-INT-001 - Chat minimum width (400px) is respected
  - Given: AppShell at 1280px with canvas visible
  - When: Layout computed
  - Then: Chat column width (520px) >= 400px (min-width)

### Error Handling

- [ ] Test: 1.10-UNIT-005 - Graceful handling when CSS variables undefined
  - Given: AppShell component
  - When: --orion-sidebar-width or --orion-canvas-width not defined
  - Then: Falls back to hardcoded pixel values (280px, 480px)

---

## AC2: Two-Column Layout When Canvas Hidden

> Given the three-column layout is active, When the canvas is hidden, Then sidebar (280px) and chat (flex-1) occupy the full width

### Happy Path

- [ ] Test: 1.10-UNIT-006 - Chat expands to fill space when canvas hidden
  - Given: AppShell at 1280px with canvas closed
  - When: Layout computed
  - Then: Chat column width is 1000px (1280 - 280)

- [ ] Test: 1.10-E2E-003 - Two-column layout when canvas is hidden
  - Given: Viewport at 1280px, canvas closed
  - When: App is displayed
  - Then: Sidebar (280px) + Chat (1000px) fill viewport

### Edge Cases

- [ ] Test: 1.10-INT-002 - Canvas toggle maintains sidebar width
  - Given: AppShell at desktop breakpoint
  - When: Canvas toggled from visible to hidden
  - Then: Sidebar remains at 280px (no width change)

- [ ] Test: 1.10-INT-003 - Canvas toggle uses smooth transition
  - Given: AppShell at desktop breakpoint
  - When: Canvas toggled
  - Then: Chat column smoothly expands/contracts (300ms transition from Story 1.6)

### Error Handling

- [ ] Test: 1.10-UNIT-007 - Layout stable during rapid canvas toggle
  - Given: AppShell at desktop breakpoint
  - When: Canvas rapidly toggled multiple times
  - Then: No layout thrashing or visual artifacts

---

## AC3: No Horizontal Scrolling

> Given the three-column layout is active, When any column content exceeds viewport, Then no horizontal scrolling occurs at the viewport level

### Happy Path

- [ ] Test: 1.10-E2E-004 - No horizontal scrollbar at viewport level
  - Given: AppShell at 1280px
  - When: App rendered with three columns
  - Then: document.body.scrollWidth <= window.innerWidth

- [ ] Test: 1.10-UNIT-008 - Root element has overflow-x: hidden
  - Given: AppShell component
  - When: CSS computed styles checked
  - Then: html and body have overflow-x: hidden

- [ ] Test: 1.10-UNIT-009 - AppShell has max-width: 100vw constraint
  - Given: AppShell component
  - When: CSS computed styles checked
  - Then: max-width is 100vw

### Edge Cases

- [ ] Test: 1.10-E2E-005 - No horizontal scroll with long content in chat
  - Given: AppShell at 1280px with very long text in chat
  - When: Content exceeds chat column width
  - Then: Content wraps or truncates; no horizontal viewport scroll

- [ ] Test: 1.10-INT-004 - Sidebar content does not cause horizontal scroll
  - Given: AppShell at 1280px with long sidebar item labels
  - When: Content exceeds sidebar width
  - Then: Content truncated with ellipsis; no horizontal scroll

- [ ] Test: 1.10-INT-005 - Canvas content does not cause horizontal scroll
  - Given: AppShell at 1280px with wide canvas content
  - When: Content exceeds canvas width
  - Then: Content handles overflow internally (scroll-y or truncation)

### Error Handling

- [ ] Test: 1.10-UNIT-010 - Columns use overflow constraints
  - Given: Each column component
  - When: CSS computed styles checked
  - Then: Sidebar, Chat, Canvas all have overflow-y: auto (or visible) and no overflow-x causing scroll

---

## AC4: CSS Flexbox Layout

> Given the three-column layout, When CSS is inspected, Then layout uses CSS Flexbox (consistent with established AppShell pattern)

### Happy Path

- [ ] Test: 1.10-UNIT-011 - AppShell uses flex container
  - Given: AppShell component
  - When: CSS computed styles checked
  - Then: display: flex

- [ ] Test: 1.10-UNIT-012 - AppShell uses row direction
  - Given: AppShell component
  - When: CSS computed styles checked
  - Then: flex-direction: row

- [ ] Test: 1.10-UNIT-013 - Sidebar has flex-shrink: 0
  - Given: Sidebar component within AppShell
  - When: CSS computed styles checked
  - Then: flex-shrink: 0 (width does not compress)

- [ ] Test: 1.10-UNIT-014 - Chat has flex: 1
  - Given: ChatColumn component within AppShell
  - When: CSS computed styles checked
  - Then: flex-grow: 1 (fills remaining space)

- [ ] Test: 1.10-UNIT-015 - Canvas has flex-shrink: 0
  - Given: CanvasColumn component within AppShell
  - When: CSS computed styles checked
  - Then: flex-shrink: 0 (width does not compress)

### Edge Cases

- [ ] Test: 1.10-INT-006 - Min-height: 100vh for full viewport coverage
  - Given: AppShell component
  - When: CSS computed styles checked
  - Then: min-height: 100vh

---

## AC5: Below-Breakpoint Graceful Transition

> Given the desktop breakpoint, When window is resized below 1280px, Then layout gracefully transitions (handled by future Story 1.11)

### Happy Path

- [ ] Test: 1.10-E2E-006 - Layout degrades at 1279px (placeholder test)
  - Given: Viewport resized from 1280px to 1279px
  - When: Resize completes
  - Then: Layout handles transition without error (may show incomplete/placeholder state)

### Edge Cases

- [ ] Test: 1.10-INT-007 - Breakpoint token is defined
  - Given: globals.css loaded
  - When: CSS variable checked
  - Then: --orion-breakpoint-desktop: 1280px is defined

### Notes for Story 1.11

- [ ] Placeholder: Laptop breakpoint (1024-1279px) will be implemented in Story 1.11
- [ ] Placeholder: Sidebar collapse behavior at laptop breakpoint
- [ ] Placeholder: Canvas auto-hide or overlay behavior at narrower widths

---

## CSS Variable Tests

### Happy Path

- [ ] Test: 1.10-UNIT-016 - Breakpoint token exists in globals.css
  - Given: globals.css parsed
  - When: CSS variables checked
  - Then: --orion-breakpoint-desktop: 1280px exists in :root

- [ ] Test: 1.10-UNIT-017 - Media query uses breakpoint token
  - Given: AppShell or globals.css
  - When: Media queries inspected
  - Then: @media (min-width: 1280px) rule exists for desktop layout

### Edge Cases

- [ ] Test: 1.10-UNIT-018 - Breakpoint tokens for future responsive use
  - Given: globals.css
  - When: CSS variables checked
  - Then: Placeholder tokens exist: --orion-breakpoint-laptop: 1024px, --orion-breakpoint-tablet: 768px (may be commented)

---

## Integration with Prior Stories

### Story 1.3 (CSS Design Tokens)

- [ ] Test: 1.10-INT-008 - Uses --orion-sidebar-width token from Story 1.3
  - Given: AppShell at desktop breakpoint
  - When: Sidebar rendered
  - Then: Width uses var(--orion-sidebar-width) = 280px

- [ ] Test: 1.10-INT-009 - Uses --orion-canvas-width token from Story 1.3
  - Given: AppShell at desktop breakpoint with canvas visible
  - When: Canvas rendered
  - Then: Width uses var(--orion-canvas-width) = 480px

### Story 1.4 (AppShell + Sidebar)

- [ ] Test: 1.10-INT-010 - Extends existing AppShell flex pattern
  - Given: AppShell from Story 1.4
  - When: Three columns rendered
  - Then: Same flex container pattern with third column added

### Story 1.5 (ChatColumn)

- [ ] Test: 1.10-INT-011 - ChatColumn min-width constraint preserved
  - Given: ChatColumn from Story 1.5
  - When: Rendered at desktop breakpoint
  - Then: min-width: 400px still enforced

### Story 1.6 (CanvasColumn)

- [ ] Test: 1.10-INT-012 - CanvasColumn width states preserved
  - Given: CanvasColumn from Story 1.6
  - When: Toggled at desktop breakpoint
  - Then: Width transitions between 0px (hidden) and 480px (visible)

---

## Accessibility Tests

### Happy Path

- [ ] Test: 1.10-A11Y-001 - Layout landmark regions remain accessible
  - Given: AppShell at desktop breakpoint
  - When: Screen reader parses page
  - Then: Sidebar (aside), Main content (main), Canvas (complementary) landmarks present

- [ ] Test: 1.10-A11Y-002 - Tab order logical across three columns
  - Given: AppShell at desktop breakpoint
  - When: User tabs through interface
  - Then: Tab order follows: Sidebar -> Chat -> Canvas (left to right)

### Edge Cases

- [ ] Test: 1.10-A11Y-003 - Focus management on canvas toggle
  - Given: AppShell at desktop breakpoint
  - When: Canvas toggled open
  - Then: Focus moves appropriately (or remains on trigger element)

---

## Performance Tests

### Happy Path

- [ ] Test: 1.10-PERF-001 - Layout repaint on resize is efficient
  - Given: AppShell at desktop breakpoint
  - When: Viewport resized within desktop range (1280-1920px)
  - Then: No layout thrashing (single repaint per frame)

- [ ] Test: 1.10-PERF-002 - Canvas toggle transition is smooth
  - Given: AppShell at desktop breakpoint
  - When: Canvas toggled
  - Then: Transition runs at 60fps (no jank)

---

## Layout Calculation Verification

### Desktop Layout Math

- [ ] Test: 1.10-CALC-001 - Layout at 1280px with canvas visible
  - Given: Viewport 1280px, canvas visible
  - When: Widths calculated
  - Then: 280px + 520px + 480px = 1280px (no overflow)

- [ ] Test: 1.10-CALC-002 - Layout at 1280px with canvas hidden
  - Given: Viewport 1280px, canvas hidden
  - When: Widths calculated
  - Then: 280px + 1000px + 0px = 1280px (no overflow)

- [ ] Test: 1.10-CALC-003 - Layout at 1440px (common desktop)
  - Given: Viewport 1440px, canvas visible
  - When: Widths calculated
  - Then: 280px + 680px + 480px = 1440px (chat grows to fill)

- [ ] Test: 1.10-CALC-004 - Layout at 1920px (full HD)
  - Given: Viewport 1920px, canvas visible
  - When: Widths calculated
  - Then: 280px + 1160px + 480px = 1920px (chat maximizes)

---

## Test File Structure

```
tests/
  unit/
    layout/
      AppShell.desktop.spec.ts        # 1.10-UNIT-001 to 018
    css/
      breakpoint-tokens.spec.ts       # CSS variable validation
  integration/
    layout/
      three-column-layout.spec.ts     # 1.10-INT-001 to 012
  e2e/
    responsive/
      desktop-breakpoint.spec.ts      # 1.10-E2E-001 to 006
    accessibility/
      layout-a11y.spec.ts             # 1.10-A11Y-001 to 003
```

---

## Summary

| Category | Test Count |
|----------|------------|
| AC1: Three-Column Layout | 8 |
| AC2: Two-Column (Canvas Hidden) | 5 |
| AC3: No Horizontal Scrolling | 7 |
| AC4: Flexbox Layout | 6 |
| AC5: Below-Breakpoint (Placeholder) | 3 |
| CSS Variables | 3 |
| Integration with Prior Stories | 5 |
| Accessibility | 3 |
| Performance | 2 |
| Layout Calculations | 4 |
| **Total** | **46** |

---

## Acceptance Criteria Traceability

| AC | Test IDs |
|----|----------|
| AC#1: Three-column at >=1280px | 1.10-UNIT-001 to 005, 1.10-E2E-001, 1.10-E2E-002, 1.10-INT-001 |
| AC#2: Two-column when canvas hidden | 1.10-UNIT-006, 1.10-UNIT-007, 1.10-E2E-003, 1.10-INT-002, 1.10-INT-003 |
| AC#3: No horizontal scrolling | 1.10-UNIT-008 to 010, 1.10-E2E-004, 1.10-E2E-005, 1.10-INT-004, 1.10-INT-005 |
| AC#4: Flexbox layout | 1.10-UNIT-011 to 015, 1.10-INT-006 |
| AC#5: Below-breakpoint transition | 1.10-E2E-006, 1.10-INT-007 |

---

## Dependencies for Testing

- `@testing-library/react` - Component rendering
- `vitest` - Test runner
- `@playwright/test` - E2E/viewport tests
- CSS computed style inspection utilities
- Viewport resize capabilities in Playwright

---

## Code Examples

### Unit Test Example (Vitest)

```typescript
// tests/unit/layout/AppShell.desktop.spec.ts
import { render, screen } from '@testing-library/react';
import { AppShell } from '@/components/layout/AppShell';
import { useCanvasStore } from '@/stores/canvasStore';

describe('AppShell Desktop Layout', () => {
  beforeEach(() => {
    // Reset canvas store
    useCanvasStore.setState({ isCanvasOpen: false });
    // Set viewport to desktop size
    Object.defineProperty(window, 'innerWidth', { value: 1280 });
  });

  test('1.10-UNIT-011: AppShell uses flex container', () => {
    render(<AppShell />);
    const shell = screen.getByTestId('app-shell');
    expect(shell).toHaveStyle({ display: 'flex' });
  });

  test('1.10-UNIT-012: AppShell uses row direction', () => {
    render(<AppShell />);
    const shell = screen.getByTestId('app-shell');
    expect(shell).toHaveStyle({ flexDirection: 'row' });
  });

  test('1.10-UNIT-013: Sidebar has flex-shrink: 0', () => {
    render(<AppShell />);
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveStyle({ flexShrink: '0' });
  });
});
```

### E2E Test Example (Playwright)

```typescript
// tests/e2e/responsive/desktop-breakpoint.spec.ts
import { test, expect } from '../../support/fixtures';

test.describe('Desktop Breakpoint (>=1280px)', () => {
  test('1.10-E2E-001: layout at exactly 1280px boundary', async ({ page, log }) => {
    await log.step('Set viewport to exactly 1280px');
    await page.setViewportSize({ width: 1280, height: 800 });

    await log.step('Navigate to homepage');
    await page.goto('/');

    await log.step('Verify three-column layout');
    const sidebar = page.getByTestId('sidebar');
    const chat = page.getByTestId('chat-column');
    const canvas = page.getByRole('complementary', { name: 'Canvas' });

    await expect(sidebar).toBeVisible();
    await expect(chat).toBeVisible();
    // Canvas may be hidden by default (width: 0)
    await expect(canvas).toBeAttached();

    await log.step('Verify sidebar width');
    const sidebarBox = await sidebar.boundingBox();
    expect(sidebarBox?.width).toBe(280);
  });

  test('1.10-E2E-004: no horizontal scrollbar at viewport level', async ({ page, log }) => {
    await log.step('Set viewport to 1280px');
    await page.setViewportSize({ width: 1280, height: 800 });

    await log.step('Navigate to homepage');
    await page.goto('/');

    await log.step('Verify no horizontal scroll');
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('1.10-E2E-003: two-column layout when canvas hidden', async ({ page, log }) => {
    await log.step('Set viewport to 1280px');
    await page.setViewportSize({ width: 1280, height: 800 });

    await log.step('Navigate to homepage');
    await page.goto('/');

    await log.step('Verify canvas is hidden');
    const canvas = page.getByRole('complementary', { name: 'Canvas' });
    await expect(canvas).toHaveCSS('width', '0px');

    await log.step('Verify chat fills remaining space');
    const chat = page.getByTestId('chat-column');
    const chatBox = await chat.boundingBox();
    // Chat should be 1000px (1280 - 280 sidebar)
    expect(chatBox?.width).toBe(1000);
  });
});
```

### CSS Variable Test Example

```typescript
// tests/unit/css/breakpoint-tokens.spec.ts
import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Breakpoint CSS Tokens', () => {
  const globalsCSS = fs.readFileSync(
    path.join(process.cwd(), 'src/app/globals.css'),
    'utf-8'
  );

  test('1.10-UNIT-016: --orion-breakpoint-desktop is defined', () => {
    expect(globalsCSS).toContain('--orion-breakpoint-desktop: 1280px');
  });

  test('1.10-UNIT-017: media query uses 1280px breakpoint', () => {
    expect(globalsCSS).toMatch(/@media\s*\(\s*min-width:\s*1280px\s*\)/);
  });
});
```

---

*Generated by TEA (Master Test Architect) - Strong opinions, weakly held.*
