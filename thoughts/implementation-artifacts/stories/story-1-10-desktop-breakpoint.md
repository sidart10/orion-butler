# Story 1.10: Desktop Breakpoint

Status: done

## Story

As a **user**,
I want the full three-column layout at viewport width >=1280px,
So that I can see sidebar, chat, and canvas together without horizontal scrolling.

## Acceptance Criteria

1. **Given** a viewport width >=1280px
   **When** the app is displayed
   **Then** sidebar (280px), chat (flex-1), and canvas (480px when visible) are all visible

2. **Given** the three-column layout is active
   **When** the canvas is hidden
   **Then** sidebar (280px) and chat (flex-1) occupy the full width

3. **Given** the three-column layout is active
   **When** any column content exceeds viewport
   **Then** no horizontal scrolling occurs at the viewport level

4. **Given** the three-column layout
   **When** CSS is inspected
   **Then** layout uses CSS Flexbox (consistent with established AppShell pattern)

5. **Given** the desktop breakpoint
   **When** window is resized below 1280px
   **Then** layout gracefully transitions (handled by future Story 1.11)

## Tasks / Subtasks

- [x] Task 1: Create breakpoint CSS variables (AC: #1, #2)
  - [x] 1.1: Add `--orion-breakpoint-desktop: 1280px` to globals.css
  - [x] 1.2: Add breakpoint placeholders for future stories (laptop: 1024px, tablet: 768px)

- [x] Task 2: Update AppShell component for explicit desktop layout (AC: #1, #4)
  - [x] 2.1: Ensure AppShell uses flex container for three columns
  - [x] 2.2: Apply max-width: 100vw constraint for desktop breakpoint
  - [x] 2.3: Verify sidebar uses `flex-shrink: 0` with `width: 280px`
  - [x] 2.4: Verify chat uses `flex: 1` with `min-width: 400px`
  - [x] 2.5: Verify canvas uses `flex-shrink: 0` with `width: 480px` (when visible)

- [x] Task 3: Prevent horizontal overflow (AC: #3)
  - [x] 3.1: Add `overflow-x: hidden` to html and body in globals.css
  - [x] 3.2: Add `max-width: 100vw` to html and body
  - [x] 3.3: Add `max-w-[100vw] overflow-x-hidden` to AppShell container

- [x] Task 4: Test responsive behavior at breakpoint boundary (AC: #5)
  - [x] 4.1: Layout calculation verified: 280 + 400 + 480 = 1160px fits in 1280px
  - [x] 4.2: Chat expands to 520px at 1280px with canvas open
  - [x] 4.3: AC#5 deferred to Story 1.11 (laptop breakpoint)

- [x] Task 5: Write unit tests for breakpoint behavior
  - [x] 5.1: Test AppShell renders three columns (50 tests in desktop-breakpoint.spec.tsx)
  - [x] 5.2: Test canvas width is 0 when hidden, w-canvas when visible
  - [x] 5.3: Test overflow-x-hidden and max-w-[100vw] on AppShell

## Dev Notes

### Architecture Compliance

**Layout System (from Architecture.md):**
- AppShell pattern established in Story 1.4
- Flex container with `sidebar + main content` structure
- Add canvas as third column element (rightmost, flex-shrink: 0)

**CSS Variable Pattern (from Story 1.3):**
```css
/* Add to globals.css :root */
--orion-breakpoint-desktop: 1280px;
--orion-breakpoint-laptop: 1024px;  /* Placeholder for Story 1.11 */
--orion-breakpoint-tablet: 768px;   /* Placeholder for Story 1.12 */
```

### Established Layout Tokens (from Story 1.3)

| Token | Value | Usage |
|-------|-------|-------|
| `--orion-sidebar-width` | 280px | Sidebar column width |
| `--orion-sidebar-collapsed` | 72px | Collapsed sidebar width |
| `--orion-canvas-width` | 480px | Canvas panel width |
| `--orion-content-max-width` | 850px | Optional content constraint |

### Layout Calculation at 1280px

```
Total: 1280px
- Sidebar: 280px
- Canvas (visible): 480px
- Chat: 520px (flex-1, min 400px) ✓

Total: 1280px
- Sidebar: 280px
- Canvas (hidden): 0px
- Chat: 1000px (flex-1) ✓
```

### Component Structure

```tsx
// AppShell.tsx (update existing from Story 1.4)
<div className="app-shell">
  <Sidebar />        {/* flex-shrink-0, w-sidebar (280px) */}
  <ChatColumn />     {/* flex-1, min-w-[400px] */}
  <CanvasColumn />   {/* flex-shrink-0, w-canvas (480px) OR w-0 */}
</div>
```

### CSS Implementation Pattern

```css
/* globals.css */
@media (min-width: 1280px) {
  .app-shell {
    /* Already flex from Story 1.4, ensure it's row direction */
    display: flex;
    flex-direction: row;
    min-height: 100vh;
    max-width: 100vw;
    overflow-x: hidden;
  }
}

/* Ensure no horizontal scroll at any breakpoint */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}
```

### Dependencies on Prior Stories

| Story | Dependency |
|-------|------------|
| 1.3 | Design tokens: `--orion-sidebar-width`, `--orion-canvas-width` |
| 1.4 | AppShell layout pattern with Sidebar |
| 1.5 | ChatColumn with `min-width: 400px` |
| 1.6 | CanvasColumn with state-driven width (0 or 480px) |

### Files to Modify

| File | Change |
|------|--------|
| `src/app/globals.css` | Add breakpoint tokens, desktop media query |
| `src/components/layout/AppShell.tsx` | Verify flex layout, add max-width constraint |
| `tests/unit/components/layout/AppShell.test.tsx` | Add breakpoint tests |

### Testing Standards

**Unit Tests (Vitest + React Testing Library):**
- Test AppShell renders all three columns
- Test column widths at desktop breakpoint
- Test canvas visibility toggle

**E2E Test Pattern (Playwright):**
```typescript
// tests/e2e/responsive.spec.ts
test('desktop breakpoint shows three columns', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');

  const sidebar = page.locator('[data-testid="sidebar"]');
  const chat = page.locator('[data-testid="chat-column"]');
  const canvas = page.locator('[data-testid="canvas-column"]');

  await expect(sidebar).toBeVisible();
  await expect(chat).toBeVisible();
  await expect(canvas).toBeVisible(); // If canvas is open

  // No horizontal scroll
  const body = await page.evaluate(() => document.body.scrollWidth);
  const viewport = await page.evaluate(() => window.innerWidth);
  expect(body).toBeLessThanOrEqual(viewport);
});
```

### Project Structure Notes

- Alignment with unified project structure: `src/components/layout/AppShell.tsx`
- CSS tokens in `src/app/globals.css` under `:root`
- Tests mirror source structure: `tests/unit/components/layout/`

### UX Specification Reference

From UX Design Specification (ux-design-specification.md):

| Mode | Min Width | Layout |
|------|-----------|--------|
| Full window wide | 1200px+ | Sidebar + Chat + Canvas split |

**Note:** PRD uses 1200px+, but epics.md specifies 1280px for desktop breakpoint. Use **1280px** per epics.md as the authoritative source.

### References

- [Source: thoughts/planning-artifacts/epics.md#Story 1.10: Desktop Breakpoint]
- [Source: thoughts/planning-artifacts/architecture.md#Project Structure]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Responsive Strategy]
- [Source: thoughts/planning-artifacts/design-system-adoption.md#Layout]
- [Source: .ralph/story-chain.md#Story 1.6: Canvas Column Placeholder]

## Story Chain Context

### Prior Decisions to Honor

From **Story 1.4 (Sidebar Column)**:
- AppShell uses flex container
- Sidebar is `flex-shrink: 0` with `width: var(--orion-sidebar-width)`
- Focus state: 2px gold outline with 2px offset

From **Story 1.5 (Main Chat Column)**:
- ChatColumn uses `flex: 1` with `min-width: 400px`
- Empty state: minimal placeholder text

From **Story 1.6 (Canvas Column Placeholder)**:
- Canvas uses `flex-shrink: 0` with conditional width
- Hidden: `width: 0`, `overflow: hidden`, `aria-hidden`
- Visible: `width: var(--orion-canvas-width)` (480px)
- Zustand store: `isCanvasOpen`, `open()`, `close()`, `toggle()`

From **Story 1.3 (CSS Design Tokens)**:
- All layout dimensions as CSS variables
- Tailwind integration via `orion-*` naming

### What This Story Establishes

1. **Desktop Breakpoint Token:** `--orion-breakpoint-desktop: 1280px`
2. **No-Scroll Constraint:** `overflow-x: hidden` on root
3. **Explicit Media Query:** `@media (min-width: 1280px)` for desktop-specific styles
4. **Three-Column Verification:** All columns render correctly at breakpoint

### Notes for Next Story (1.11: Laptop Breakpoint)

- Laptop breakpoint: 1024-1279px
- Sidebar should collapse to 72px OR remain full 280px (user preference)
- Canvas may auto-hide or become overlay
- Use `--orion-breakpoint-laptop: 1024px`
- Reference this story's breakpoint pattern

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None - implementation completed without issues.

### Completion Notes List

**2026-01-25: Story 1.10 Implementation Complete**

**AC Implementation Summary:**
- AC#1: Three columns visible at >=1280px - COMPLETE
  - Sidebar: 280px fixed (`w-sidebar flex-shrink-0`)
  - Chat: flexible (`flex-1 min-w-[400px]`)
  - Canvas: 480px when open (`w-canvas flex-shrink-0`), 0 when closed
- AC#2: Canvas hidden state - COMPLETE
  - Canvas uses `w-0 opacity-0` when closed
  - Sidebar + Chat occupy full width (chat expands to fill)
- AC#3: No horizontal scrolling - COMPLETE
  - html/body: `overflow-x: hidden; max-width: 100vw`
  - AppShell: `max-w-[100vw] overflow-x-hidden`
- AC#4: CSS Flexbox layout - COMPLETE
  - AppShell uses `flex h-screen` container
  - All columns properly configured
- AC#5: Graceful transition below 1280px - DEFERRED to Story 1.11

**CSS Tokens Added:**
- `--orion-breakpoint-desktop: 1280px`
- `--orion-breakpoint-laptop: 1024px` (placeholder)
- `--orion-breakpoint-tablet: 768px` (placeholder)
- `--orion-chat-min-width: 400px`

**Layout Math Verification:**
- At 1280px with canvas open: 280 + 520 + 480 = 1280px (chat gets 520px)
- At 1280px with canvas closed: 280 + 1000 = 1280px (chat gets 1000px)
- Minimum: 280 + 400 + 480 = 1160px (fits in 1280px with 120px to spare)

**Tests Created:** 50 unit tests in `tests/unit/components/layout/desktop-breakpoint.spec.tsx`
- All tests passing
- Full test suite passing (700+ tests)
- TypeScript compilation successful

### File List

**Modified:**
- `/Users/sid/Desktop/orion-butler/design-system/styles/globals.css` - Added breakpoint tokens, overflow-x hidden
- `/Users/sid/Desktop/orion-butler/src/components/layout/AppShell.tsx` - Added max-w-[100vw] overflow-x-hidden
- `/Users/sid/Desktop/orion-butler/src/components/canvas/CanvasColumn.tsx` - Added data-testid="canvas-column"

**Created:**
- `/Users/sid/Desktop/orion-butler/tests/unit/components/layout/desktop-breakpoint.spec.tsx` - 50 unit tests
