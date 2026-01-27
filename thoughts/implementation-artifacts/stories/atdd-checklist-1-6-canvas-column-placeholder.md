# ATDD Checklist: Story 1.6 - Canvas Column Placeholder

**Story:** Canvas Column Placeholder
**Status:** ready-for-dev
**Generated:** 2026-01-24
**Author:** TEA (Master Test Architect)

---

## Executive Summary

This ATDD checklist covers the hidden third column (canvas) that displays alongside chat. Tests are designed around the test pyramid: 70% unit (Zustand store, component logic), 25% integration (IPC, state sync), 5% E2E (critical user journeys).

**Test Coverage Target:**
- Unit: 8 tests (Zustand store + component logic)
- Integration: 4 tests (state management + animation)
- E2E: 3 tests (visibility toggle, keyboard, accessibility)

---

## Test Categories

### 1. Unit Tests (Vitest)

#### 1.6-UNIT-001: Canvas Store - Initial State

| Field | Value |
|-------|-------|
| **Test ID** | 1.6-UNIT-001 |
| **Requirement** | AC#1: Right column is hidden (width: 0) when no canvas active |
| **Priority** | P0 |
| **Type** | Unit |
| **Precondition** | Fresh store instance |
| **Input** | None (initial state) |
| **Expected** | `isCanvasOpen === false` |
| **Verification** | Assert store initial state |

```typescript
// tests/unit/stores/canvas-store.spec.ts
describe('canvasStore', () => {
  test('1.6-UNIT-001: initial state is closed', () => {
    const { isCanvasOpen } = useCanvasStore.getState();
    expect(isCanvasOpen).toBe(false);
  });
});
```

---

#### 1.6-UNIT-002: Canvas Store - openCanvas Action

| Field | Value |
|-------|-------|
| **Test ID** | 1.6-UNIT-002 |
| **Requirement** | AC#3: Column can be shown via state toggle |
| **Priority** | P0 |
| **Type** | Unit |
| **Precondition** | Store with `isCanvasOpen: false` |
| **Input** | Call `openCanvas()` |
| **Expected** | `isCanvasOpen === true` |
| **Verification** | Assert state transition |

```typescript
test('1.6-UNIT-002: openCanvas sets isCanvasOpen to true', () => {
  const store = useCanvasStore.getState();
  store.openCanvas();
  expect(useCanvasStore.getState().isCanvasOpen).toBe(true);
});
```

---

#### 1.6-UNIT-003: Canvas Store - closeCanvas Action

| Field | Value |
|-------|-------|
| **Test ID** | 1.6-UNIT-003 |
| **Requirement** | AC#3: Column can be hidden via state toggle |
| **Priority** | P0 |
| **Type** | Unit |
| **Precondition** | Store with `isCanvasOpen: true` |
| **Input** | Call `closeCanvas()` |
| **Expected** | `isCanvasOpen === false` |
| **Verification** | Assert state transition |

```typescript
test('1.6-UNIT-003: closeCanvas sets isCanvasOpen to false', () => {
  useCanvasStore.setState({ isCanvasOpen: true });
  useCanvasStore.getState().closeCanvas();
  expect(useCanvasStore.getState().isCanvasOpen).toBe(false);
});
```

---

#### 1.6-UNIT-004: Canvas Store - toggleCanvas Action

| Field | Value |
|-------|-------|
| **Test ID** | 1.6-UNIT-004 |
| **Requirement** | AC#3: Column can be toggled |
| **Priority** | P0 |
| **Type** | Unit |
| **Precondition** | Store with `isCanvasOpen: false` |
| **Input** | Call `toggleCanvas()` twice |
| **Expected** | `false -> true -> false` |
| **Verification** | Assert toggle behavior |

```typescript
test('1.6-UNIT-004: toggleCanvas alternates state', () => {
  const store = useCanvasStore.getState();
  expect(useCanvasStore.getState().isCanvasOpen).toBe(false);

  store.toggleCanvas();
  expect(useCanvasStore.getState().isCanvasOpen).toBe(true);

  store.toggleCanvas();
  expect(useCanvasStore.getState().isCanvasOpen).toBe(false);
});
```

---

#### 1.6-UNIT-005: CanvasColumn - Hidden State Classes

| Field | Value |
|-------|-------|
| **Test ID** | 1.6-UNIT-005 |
| **Requirement** | AC#1: Right column is hidden (width: 0) |
| **Priority** | P0 |
| **Type** | Unit (Component) |
| **Precondition** | `isCanvasOpen: false` |
| **Input** | Render CanvasColumn |
| **Expected** | Has classes: `w-0`, `opacity-0` |
| **Verification** | Assert className contains hidden state classes |

```typescript
// tests/unit/components/canvas-column.spec.tsx
import { render, screen } from '@testing-library/react';
import { CanvasColumn } from '@/components/canvas/CanvasColumn';
import { useCanvasStore } from '@/stores/canvasStore';

describe('CanvasColumn', () => {
  beforeEach(() => {
    useCanvasStore.setState({ isCanvasOpen: false });
  });

  test('1.6-UNIT-005: hidden state applies w-0 and opacity-0', () => {
    render(<CanvasColumn />);
    const aside = screen.getByRole('complementary');
    expect(aside).toHaveClass('w-0');
    expect(aside).toHaveClass('opacity-0');
  });
});
```

---

#### 1.6-UNIT-006: CanvasColumn - Visible State Classes

| Field | Value |
|-------|-------|
| **Test ID** | 1.6-UNIT-006 |
| **Requirement** | AC#2: CSS variable `--orion-canvas-width: 480px` |
| **Priority** | P0 |
| **Type** | Unit (Component) |
| **Precondition** | `isCanvasOpen: true` |
| **Input** | Render CanvasColumn |
| **Expected** | Has classes for visible state (width token, opacity-100) |
| **Verification** | Assert className contains visible state classes |

```typescript
test('1.6-UNIT-006: visible state applies w-canvas and opacity-100', () => {
  useCanvasStore.setState({ isCanvasOpen: true });
  render(<CanvasColumn />);
  const aside = screen.getByRole('complementary');
  expect(aside).toHaveClass('w-canvas');
  expect(aside).toHaveClass('opacity-100');
});
```

---

#### 1.6-UNIT-007: CanvasColumn - Semantic HTML

| Field | Value |
|-------|-------|
| **Test ID** | 1.6-UNIT-007 |
| **Requirement** | Task 8.1: `<aside>` semantic element |
| **Priority** | P1 |
| **Type** | Unit (Component) |
| **Precondition** | None |
| **Input** | Render CanvasColumn |
| **Expected** | Uses `<aside>` element with `role="complementary"` |
| **Verification** | Query by role |

```typescript
test('1.6-UNIT-007: renders as aside with complementary role', () => {
  render(<CanvasColumn />);
  const aside = screen.getByRole('complementary');
  expect(aside.tagName).toBe('ASIDE');
  expect(aside).toHaveAttribute('aria-label', 'Canvas');
});
```

---

#### 1.6-UNIT-008: CanvasColumn - Transition Classes

| Field | Value |
|-------|-------|
| **Test ID** | 1.6-UNIT-008 |
| **Requirement** | AC#4: 300ms cubic-bezier(0.4, 0, 0.2, 1) easing |
| **Priority** | P1 |
| **Type** | Unit (Component) |
| **Precondition** | None |
| **Input** | Render CanvasColumn |
| **Expected** | Has transition classes: `transition-all`, `duration-300`, `ease-luxury` |
| **Verification** | Assert className |

```typescript
test('1.6-UNIT-008: has animation transition classes', () => {
  render(<CanvasColumn />);
  const aside = screen.getByRole('complementary');
  expect(aside).toHaveClass('transition-all');
  expect(aside).toHaveClass('duration-300');
  // ease-luxury maps to cubic-bezier(0.4, 0, 0.2, 1)
  expect(aside).toHaveClass('ease-luxury');
});
```

---

### 2. Integration Tests (Vitest + Testing Library)

#### 1.6-INT-001: Canvas Accessibility - aria-hidden State

| Field | Value |
|-------|-------|
| **Test ID** | 1.6-INT-001 |
| **Requirement** | Task 8.3: `aria-hidden="true"` when closed |
| **Priority** | P0 |
| **Type** | Integration |
| **Precondition** | Canvas closed |
| **Input** | Toggle canvas open/closed |
| **Expected** | `aria-hidden` toggles with state |
| **Verification** | Assert attribute changes |

```typescript
// tests/integration/canvas/canvas-accessibility.spec.tsx
describe('Canvas Accessibility', () => {
  test('1.6-INT-001: aria-hidden reflects canvas state', async () => {
    render(<CanvasColumn />);
    const aside = screen.getByRole('complementary', { hidden: true });

    // Initially hidden
    expect(aside).toHaveAttribute('aria-hidden', 'true');

    // Open canvas
    act(() => useCanvasStore.getState().openCanvas());
    expect(aside).toHaveAttribute('aria-hidden', 'false');

    // Close canvas
    act(() => useCanvasStore.getState().closeCanvas());
    expect(aside).toHaveAttribute('aria-hidden', 'true');
  });
});
```

---

#### 1.6-INT-002: Canvas Accessibility - tabIndex State

| Field | Value |
|-------|-------|
| **Test ID** | 1.6-INT-002 |
| **Requirement** | Task 8.4: `tabindex="-1"` when hidden |
| **Priority** | P0 |
| **Type** | Integration |
| **Precondition** | Canvas closed |
| **Input** | Toggle canvas open/closed |
| **Expected** | `tabIndex` changes: -1 (hidden) to 0 (visible) |
| **Verification** | Assert tabIndex attribute |

```typescript
test('1.6-INT-002: tabIndex reflects canvas state', async () => {
  render(<CanvasColumn />);
  const aside = screen.getByRole('complementary', { hidden: true });

  // Hidden: tabIndex = -1
  expect(aside).toHaveAttribute('tabindex', '-1');

  // Visible: tabIndex = 0
  act(() => useCanvasStore.getState().openCanvas());
  expect(aside).toHaveAttribute('tabindex', '0');
});
```

---

#### 1.6-INT-003: Canvas + AppShell Integration

| Field | Value |
|-------|-------|
| **Test ID** | 1.6-INT-003 |
| **Requirement** | Task 5: CanvasColumn in AppShell |
| **Priority** | P0 |
| **Type** | Integration |
| **Precondition** | AppShell rendered |
| **Input** | Render AppShell |
| **Expected** | CanvasColumn is present in layout |
| **Verification** | Assert complementary role exists |

```typescript
// tests/integration/layout/app-shell-canvas.spec.tsx
import { AppShell } from '@/components/layout/AppShell';

test('1.6-INT-003: AppShell includes CanvasColumn', () => {
  render(<AppShell />);

  // Canvas should be present (hidden by default)
  const canvas = screen.getByRole('complementary', { hidden: true });
  expect(canvas).toBeInTheDocument();
  expect(canvas).toHaveAttribute('aria-label', 'Canvas');
});
```

---

#### 1.6-INT-004: CSS Variable Validation

| Field | Value |
|-------|-------|
| **Test ID** | 1.6-INT-004 |
| **Requirement** | AC#2: `--orion-canvas-width: 480px` |
| **Priority** | P1 |
| **Type** | Integration |
| **Precondition** | CSS loaded |
| **Input** | Read computed style |
| **Expected** | `--orion-canvas-width` equals `480px` |
| **Verification** | getComputedStyle check |

```typescript
test('1.6-INT-004: CSS variable --orion-canvas-width is 480px', () => {
  render(<CanvasColumn />);
  const aside = screen.getByRole('complementary', { hidden: true });

  // Open to apply width
  act(() => useCanvasStore.getState().openCanvas());

  const computedStyle = window.getComputedStyle(aside);
  const canvasWidth = computedStyle.getPropertyValue('--orion-canvas-width').trim();
  expect(canvasWidth).toBe('480px');
});
```

---

### 3. E2E Tests (Playwright)

#### 1.6-E2E-001: Canvas Hidden by Default

| Field | Value |
|-------|-------|
| **Test ID** | 1.6-E2E-001 |
| **Requirement** | AC#1: Right column hidden when no canvas active |
| **Priority** | P0 |
| **Type** | E2E |
| **Precondition** | Fresh app load |
| **Input** | Navigate to homepage |
| **Expected** | Canvas not visible (width: 0) |
| **Verification** | Visual assertion |

```typescript
// tests/e2e/canvas/canvas-visibility.spec.ts
import { test, expect } from '../../support/fixtures';

test.describe('Canvas Column', () => {
  test('1.6-E2E-001: canvas hidden by default', async ({ page, log }) => {
    await log.step('Navigate to homepage');
    await page.goto('/');

    await log.step('Verify canvas is not visible');
    const canvas = page.getByRole('complementary', { name: 'Canvas' });

    // Canvas exists in DOM but has width: 0
    await expect(canvas).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas).toHaveCSS('width', '0px');
    await expect(canvas).toHaveCSS('opacity', '0');
  });
});
```

---

#### 1.6-E2E-002: Canvas Toggle Visibility

| Field | Value |
|-------|-------|
| **Test ID** | 1.6-E2E-002 |
| **Requirement** | AC#3: Column can be shown/hidden via state toggle |
| **Priority** | P0 |
| **Type** | E2E |
| **Precondition** | App loaded |
| **Input** | Trigger canvas open (dev button or action) |
| **Expected** | Canvas expands to 480px with animation |
| **Verification** | CSS assertion |

```typescript
test('1.6-E2E-002: canvas expands to 480px when opened', async ({ page, log }) => {
  await log.step('Navigate to homepage');
  await page.goto('/');

  await log.step('Open canvas via dev toggle');
  // Note: Actual trigger depends on implementation
  // Could be a button, keyboard shortcut, or store action
  await page.evaluate(() => {
    // Access store directly for testing
    const store = (window as any).__CANVAS_STORE__;
    if (store) store.openCanvas();
  });

  await log.step('Verify canvas is visible with correct width');
  const canvas = page.getByRole('complementary', { name: 'Canvas' });

  // Wait for animation using transitionend event (more reliable than arbitrary timeout)
  await canvas.evaluate((el) => {
    return new Promise<void>((resolve) => {
      const onEnd = () => {
        el.removeEventListener('transitionend', onEnd);
        resolve();
      };
      el.addEventListener('transitionend', onEnd);
      // Fallback timeout in case transitionend doesn't fire (e.g., visibility: hidden)
      setTimeout(resolve, 500);
    });
  });

  await expect(canvas).toHaveAttribute('aria-hidden', 'false');
  await expect(canvas).toHaveCSS('width', '480px');
  await expect(canvas).toHaveCSS('opacity', '1');
});
```

---

#### 1.6-E2E-003: ESC Key Closes Canvas

| Field | Value |
|-------|-------|
| **Test ID** | 1.6-E2E-003 |
| **Requirement** | Task 7: ESC key closes canvas |
| **Priority** | P1 |
| **Type** | E2E |
| **Precondition** | Canvas is open |
| **Input** | Press ESC key |
| **Expected** | Canvas closes (width: 0) |
| **Verification** | Keyboard interaction + CSS assertion |

```typescript
test('1.6-E2E-003: ESC key closes canvas', async ({ page, log }) => {
  await log.step('Navigate and open canvas');
  await page.goto('/');

  // Open canvas first
  await page.evaluate(() => {
    const store = (window as any).__CANVAS_STORE__;
    if (store) store.openCanvas();
  });

  await log.step('Wait for canvas to open');
  const canvas = page.getByRole('complementary', { name: 'Canvas' });

  // Wait for open animation to complete
  await canvas.evaluate((el) => {
    return new Promise<void>((resolve) => {
      const onEnd = () => {
        el.removeEventListener('transitionend', onEnd);
        resolve();
      };
      el.addEventListener('transitionend', onEnd);
      setTimeout(resolve, 500);
    });
  });
  await expect(canvas).toHaveCSS('width', '480px');

  await log.step('Press ESC to close canvas');
  await page.keyboard.press('Escape');

  await log.step('Verify canvas is closed');
  // Wait for close animation using transitionend event
  await canvas.evaluate((el) => {
    return new Promise<void>((resolve) => {
      const onEnd = () => {
        el.removeEventListener('transitionend', onEnd);
        resolve();
      };
      el.addEventListener('transitionend', onEnd);
      setTimeout(resolve, 500);
    });
  });
  await expect(canvas).toHaveCSS('width', '0px');
  await expect(canvas).toHaveAttribute('aria-hidden', 'true');
});
```

---

## Test Data Requirements

| Data Type | Source | Notes |
|-----------|--------|-------|
| Canvas store state | In-memory Zustand | No persistence needed |
| CSS variables | globals.css | Must be loaded in test environment |

---

## Dependencies

| Dependency | Required For | Status |
|------------|--------------|--------|
| Story 1.3 CSS tokens | `--orion-canvas-width`, `--orion-anim-reveal` | Must be complete |
| Story 1.5 ChatColumn | AppShell integration | Must be complete |
| Zustand | State management | Installed |
| @testing-library/react | Component tests | Installed |
| Playwright | E2E tests | Installed |

---

## Risk Assessment

| Test ID | Risk Level | Mitigation |
|---------|------------|------------|
| 1.6-E2E-002 | Low | Animation timing uses `transitionend` event listener with 500ms fallback |
| 1.6-INT-004 | Low | CSS variable may not be computed in JSDOM - may need real browser |
| 1.6-E2E-003 | Low | Uses `transitionend` event for reliable animation completion detection |

---

## Checklist Summary

### Unit Tests (8)

- [ ] 1.6-UNIT-001: Canvas store initial state is closed
- [ ] 1.6-UNIT-002: openCanvas action works
- [ ] 1.6-UNIT-003: closeCanvas action works
- [ ] 1.6-UNIT-004: toggleCanvas alternates state
- [ ] 1.6-UNIT-005: Hidden state applies w-0, opacity-0
- [ ] 1.6-UNIT-006: Visible state applies w-canvas, opacity-100
- [ ] 1.6-UNIT-007: Semantic HTML with aside/complementary
- [ ] 1.6-UNIT-008: Animation transition classes present

### Integration Tests (4)

- [ ] 1.6-INT-001: aria-hidden toggles with state
- [ ] 1.6-INT-002: tabIndex toggles with state
- [ ] 1.6-INT-003: AppShell includes CanvasColumn
- [ ] 1.6-INT-004: CSS variable is 480px

### E2E Tests (3)

- [ ] 1.6-E2E-001: Canvas hidden by default
- [ ] 1.6-E2E-002: Canvas expands to 480px when opened
- [ ] 1.6-E2E-003: ESC key closes canvas

---

## Acceptance Criteria Traceability

| AC | Test IDs |
|----|----------|
| AC#1: Right column hidden (width: 0) | 1.6-UNIT-001, 1.6-UNIT-005, 1.6-E2E-001 |
| AC#2: CSS variable 480px | 1.6-UNIT-006, 1.6-INT-004, 1.6-E2E-002 |
| AC#3: Show/hide via state toggle | 1.6-UNIT-002, 1.6-UNIT-003, 1.6-UNIT-004, 1.6-E2E-002 |
| AC#4: 300ms cubic-bezier animation | 1.6-UNIT-008, 1.6-E2E-002 |
| Task 7: ESC key closes | 1.6-E2E-003 |
| Task 8: Accessibility | 1.6-UNIT-007, 1.6-INT-001, 1.6-INT-002 |

---

## File Structure

```
tests/
├── unit/
│   ├── stores/
│   │   └── canvas-store.spec.ts          # 1.6-UNIT-001 to 004
│   └── components/
│       └── canvas-column.spec.tsx        # 1.6-UNIT-005 to 008
├── integration/
│   ├── canvas/
│   │   └── canvas-accessibility.spec.tsx # 1.6-INT-001, 002
│   └── layout/
│       └── app-shell-canvas.spec.tsx     # 1.6-INT-003, 004
└── e2e/
    └── canvas/
        └── canvas-visibility.spec.ts     # 1.6-E2E-001 to 003
```

---

*Generated by TEA (Master Test Architect) - Strong opinions, weakly held.*
