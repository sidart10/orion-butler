# Story 1.11: Laptop Breakpoint

Status: done

## Story

As a **user**,
I want a compact layout at viewport width 1024-1279px,
So that the app works on smaller laptop screens.

## Acceptance Criteria

1. **Given** a viewport width between 1024px and 1279px
   **When** the app is displayed
   **Then** sidebar collapses to icon-only mode (48px width)
   **And** chat expands to fill remaining space

2. **Given** the laptop breakpoint is active
   **When** the canvas is opened
   **Then** canvas overlays the chat area (instead of side-by-side split)
   **And** canvas width is 480px (same as desktop)

3. **Given** the laptop breakpoint is active
   **When** the sidebar is in collapsed (icon-only) mode
   **Then** only icons are visible (no text labels)
   **And** tooltips appear on icon hover showing the label

4. **Given** the laptop breakpoint is active
   **When** any content exceeds viewport width
   **Then** no horizontal scrolling occurs at the viewport level

5. **Given** the laptop breakpoint
   **When** window is resized above 1280px
   **Then** layout transitions to full three-column desktop mode
   **And** sidebar expands to 280px

6. **Given** the laptop breakpoint
   **When** window is resized below 1024px
   **Then** layout transitions to tablet mode (handled by Story 1.12)

## Tasks / Subtasks

- [x] Task 1: Create laptop breakpoint CSS variables (AC: #1)
  - [x] 1.1: Add `--orion-breakpoint-laptop: 1024px` to globals.css (placeholder from 1.10)
  - [x] 1.2: Add `--orion-sidebar-icon-only: 48px` token for collapsed sidebar width
  - [x] 1.3: Add media query for laptop range: `@media (min-width: 1024px) and (max-width: 1279px)`

- [x] Task 2: Update Sidebar component for icon-only mode (AC: #1, #3)
  - [x] 2.1: Add `isCollapsed` state to Sidebar (can be driven by breakpoint or user toggle)
  - [x] 2.2: Create SidebarIcon subcomponent for icon-only display
  - [x] 2.3: Hide text labels when collapsed (use CSS or conditional render)
  - [x] 2.4: Add tooltip component for hover labels on collapsed items
  - [x] 2.5: Ensure touch targets remain 44x44px minimum in collapsed state
  - [x] 2.6: Update sidebar width to 48px in collapsed state

- [x] Task 3: Update AppShell for laptop breakpoint layout (AC: #1, #4)
  - [x] 3.1: Add laptop breakpoint media query to AppShell styles
  - [x] 3.2: Use `--orion-sidebar-icon-only` width at laptop breakpoint
  - [x] 3.3: Chat expands to `flex: 1` (filling remaining space)
  - [x] 3.4: Maintain `overflow-x: hidden` constraint from Story 1.10

- [x] Task 4: Implement canvas overlay behavior (AC: #2)
  - [x] 4.1: Update CanvasColumn to use overlay positioning at laptop breakpoint
  - [x] 4.2: Canvas should be `position: absolute` or `fixed` at laptop breakpoint
  - [x] 4.3: Canvas overlays chat (right-aligned), same 480px width
  - [x] 4.4: Add backdrop/dimming behind canvas overlay (optional, subtle)
  - [x] 4.5: Ensure ESC closes canvas overlay (matches desktop behavior from 1.6)

- [x] Task 5: Handle breakpoint transitions (AC: #5, #6)
  - [x] 5.1: Test smooth transition when resizing across 1280px boundary
  - [x] 5.2: Test smooth transition when resizing across 1024px boundary
  - [x] 5.3: Ensure no layout flicker during resize
  - [x] 5.4: CSS transitions for sidebar width changes (use established 300ms timing)

- [x] Task 6: Write unit tests for laptop breakpoint behavior
  - [x] 6.1: Test Sidebar renders icon-only at laptop breakpoint
  - [x] 6.2: Test tooltip appears on hover in collapsed sidebar
  - [x] 6.3: Test canvas uses overlay mode at laptop breakpoint
  - [x] 6.4: Test no horizontal scrollbar at 1024px

- [x] Task 7: Write E2E tests for responsive behavior
  - [x] 7.1: Test layout at exactly 1024px viewport
  - [x] 7.2: Test layout at 1279px viewport (upper boundary)
  - [x] 7.3: Test canvas overlay opens/closes correctly
  - [x] 7.4: Test sidebar collapse/expand animation

## Dev Notes

### Architecture Compliance

**Layout System (from Architecture.md):**
- Builds on AppShell pattern from Story 1.4 and breakpoint pattern from Story 1.10
- Laptop breakpoint introduces sidebar collapse and canvas overlay
- Maintains flex container structure, only column widths and canvas positioning change

**CSS Variable Pattern (from Story 1.3, 1.10):**
```css
/* Add to globals.css :root (1.10 should have placeholders) */
--orion-breakpoint-laptop: 1024px;
--orion-sidebar-icon-only: 48px;
```

### Layout Calculation at 1024px

```
Total: 1024px
- Sidebar (collapsed): 48px
- Chat: 976px (flex-1) ✓

With Canvas Overlay (doesn't affect flow):
- Sidebar (collapsed): 48px
- Chat: 976px (underneath)
- Canvas (overlay): 480px (positioned absolute/fixed)
```

### Established Layout Tokens (from Story 1.3, updated in 1.10)

| Token | Value | Usage |
|-------|-------|-------|
| `--orion-sidebar-width` | 280px | Full sidebar width (desktop) |
| `--orion-sidebar-collapsed` | 72px | Legacy collapsed width (update to 48px per epics) |
| `--orion-sidebar-icon-only` | 48px | Icon-only sidebar width (laptop) |
| `--orion-canvas-width` | 480px | Canvas panel width |
| `--orion-breakpoint-desktop` | 1280px | Desktop breakpoint |
| `--orion-breakpoint-laptop` | 1024px | Laptop breakpoint |

### Sidebar Icon-Only Mode Design

**Visual Specs (from UX spec):**
- Width: 48px (matching space-12 token)
- Icons: 24px (Lucide icons, centered)
- Active state: Gold left border (4px) + subtle gold background
- Hover: Tooltip with label appears to the right

**Component Structure:**
```tsx
// SidebarNavItem.tsx - collapsed mode
<div className="sidebar-item-collapsed">
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="w-full h-11 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {label}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>
```

### Canvas Overlay Mode Design

**At laptop breakpoint:**
- Canvas uses `position: fixed` or `position: absolute`
- Right-aligned: `right: 0`
- Full height: `height: 100vh` or `height: 100%`
- Width: `var(--orion-canvas-width)` (480px)
- Z-index: Above chat but below modals
- Optional: Semi-transparent backdrop behind canvas

**Animation:**
- Same 300ms cubic-bezier(0.4, 0, 0.2, 1) from Story 1.6
- Slides in from right

### Component Updates

```tsx
// AppShell.tsx - add laptop breakpoint handling
<div className="app-shell">
  <Sidebar isCollapsed={isLaptopBreakpoint} />
  <ChatColumn />
  <CanvasColumn isOverlay={isLaptopBreakpoint} />
</div>
```

```css
/* globals.css - laptop breakpoint */
@media (min-width: 1024px) and (max-width: 1279px) {
  .sidebar {
    width: var(--orion-sidebar-icon-only);
  }

  .canvas-column {
    position: fixed;
    right: 0;
    top: 0;
    height: 100vh;
    z-index: 50;
  }

  .canvas-column[aria-hidden="true"] {
    transform: translateX(100%);
  }

  .canvas-column[aria-hidden="false"] {
    transform: translateX(0);
  }
}
```

### Dependencies on Prior Stories

| Story | Dependency |
|-------|------------|
| 1.3 | Design tokens: spacing, colors, animation timing |
| 1.4 | AppShell layout pattern, Sidebar component |
| 1.5 | ChatColumn with flex-1 |
| 1.6 | CanvasColumn with state-driven visibility |
| 1.7 | Button component for icon buttons |
| 1.10 | Desktop breakpoint pattern, overflow-x: hidden |

### Files to Create/Modify

| File | Change |
|------|--------|
| `src/app/globals.css` | Add laptop breakpoint tokens and media query |
| `src/components/layout/Sidebar.tsx` | Add collapsed/icon-only mode |
| `src/components/layout/SidebarNavItem.tsx` | Add collapsed variant with tooltip |
| `src/components/layout/AppShell.tsx` | Add breakpoint detection, pass props to children |
| `src/components/layout/CanvasColumn.tsx` | Add overlay mode for laptop |
| `src/stores/layout-store.ts` | Add `isCollapsed` state (optional, could be CSS-only) |
| `tests/unit/components/layout/Sidebar.test.tsx` | Add collapsed mode tests |
| `tests/e2e/responsive.spec.ts` | Add laptop breakpoint tests |

### Testing Standards

**Unit Tests (Vitest + React Testing Library):**
- Test Sidebar renders collapsed at laptop breakpoint
- Test tooltip renders on hover
- Test CanvasColumn uses overlay positioning
- Test AppShell passes correct props

**E2E Test Pattern (Playwright):**
```typescript
// tests/e2e/responsive.spec.ts
test('laptop breakpoint collapses sidebar to icon-only', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto('/');

  const sidebar = page.locator('[data-testid="sidebar"]');

  // Check sidebar width is collapsed
  const sidebarWidth = await sidebar.evaluate(el => el.offsetWidth);
  expect(sidebarWidth).toBe(48);

  // Check icon is visible
  await expect(sidebar.locator('[data-testid="inbox-icon"]')).toBeVisible();

  // Check label is NOT visible
  await expect(sidebar.locator('text=Inbox')).not.toBeVisible();
});

test('laptop breakpoint canvas overlays chat', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.goto('/');

  // Open canvas (simulate via store or UI action)
  await page.evaluate(() => {
    // Access Zustand store to open canvas
    // window.__store.getState().openCanvas()
  });

  const canvas = page.locator('[data-testid="canvas-column"]');
  const canvasPosition = await canvas.evaluate(el =>
    window.getComputedStyle(el).position
  );

  expect(canvasPosition).toBe('fixed');
});

test('laptop breakpoint shows tooltip on sidebar hover', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto('/');

  const inboxIcon = page.locator('[data-testid="inbox-icon"]');
  await inboxIcon.hover();

  // Tooltip should appear
  await expect(page.locator('role=tooltip')).toContainText('Inbox');
});
```

### Project Structure Notes

- Alignment with unified project structure: `src/components/layout/`
- Tooltip component: May need to add from shadcn/ui if not already installed
- CSS tokens in `src/app/globals.css` under `:root`
- Tests mirror source structure: `tests/unit/components/layout/`

### UX Specification Reference

From UX Design Specification (ux-design-specification.md):

| Breakpoint | Target | Layout Change |
|------------|--------|---------------|
| <900px | Compact window | Sidebar collapses to icon-only |
| 900-1199px | Standard window | Sidebar + Chat, canvases overlay |
| >=1200px | Wide window | Full split (Sidebar + Chat + Canvas) |

**Note:** UX spec uses 900px for collapse, but epics.md specifies 1024px for laptop breakpoint. Use **1024px** per epics.md as the authoritative source. The epics also specify 48px for icon-only width (not 72px from earlier design tokens).

**Sidebar Collapse Note:** Per epics.md acceptance criteria, at laptop breakpoint the sidebar collapses to icon-only mode (48px), not the 72px "collapsed" width mentioned in earlier design tokens. The 72px token may be for user-initiated collapse at desktop.

### References

- [Source: thoughts/planning-artifacts/epics.md#Story 1.11: Laptop Breakpoint]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Breakpoint Strategy]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Responsive Strategy]
- [Source: thoughts/planning-artifacts/functional-requirements-extracted.md#FR-10.9]
- [Source: .ralph/story-chain.md#Story 1.10: Desktop Breakpoint]

## Story Chain Context

### Prior Decisions to Honor

From **Story 1.10 (Desktop Breakpoint)**:
- Breakpoint token pattern: `--orion-breakpoint-{name}`
- No-scroll constraint: `overflow-x: hidden; max-width: 100vw;`
- Three-column layout: Sidebar (280px) + Chat (flex-1, min 400px) + Canvas (480px)
- CSS Flexbox for layout (consistent pattern)

From **Story 1.6 (Canvas Column Placeholder)**:
- Canvas animation: 300ms with cubic-bezier(0.4, 0, 0.2, 1)
- Canvas state: Zustand store with `isCanvasOpen`, `open()`, `close()`, `toggle()`
- ESC key closes canvas

From **Story 1.4 (Sidebar Column)**:
- Sidebar component with SidebarNavItem
- Active state: Gold left border (4px) + subtle gold background
- Touch targets: 44x44px minimum via padding
- Focus state: 2px gold outline with 2px offset

From **Story 1.3 (CSS Design Tokens)**:
- Animation timing: 300ms entrance/canvas, cubic-bezier(0.4, 0, 0.2, 1)
- Spacing: 4px base unit, space-12 = 48px

### What This Story Establishes

1. **Laptop Breakpoint Token:** `--orion-breakpoint-laptop: 1024px`
2. **Icon-Only Sidebar Token:** `--orion-sidebar-icon-only: 48px`
3. **Sidebar Collapse Pattern:** Icon-only mode with tooltips at laptop breakpoint
4. **Canvas Overlay Pattern:** Fixed positioning, slides in from right
5. **Breakpoint Media Query:** `@media (min-width: 1024px) and (max-width: 1279px)`
6. **Tooltip Pattern:** Right-side tooltips for collapsed sidebar items

### Notes for Next Story (1.12: Tablet Breakpoint)

- Tablet breakpoint: <1024px
- Sidebar becomes hidden overlay (hamburger menu trigger)
- Canvas becomes full-width overlay
- Use `--orion-breakpoint-tablet: 768px` or similar
- Add hamburger menu icon component
- Sidebar slides in from left as overlay
- Reference this story's overlay pattern for canvas
- Consider touch-first interactions (bottom nav bar for mobile future)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None

### Completion Notes List

1. **Task 1 - CSS Variables:** Added `--orion-sidebar-icon-only: 48px` token to globals.css. Updated Tailwind config with `w-sidebar-icon-only` and `spacing.sidebar-icon-only` entries.

2. **Task 2 - Sidebar Component:** Updated Sidebar to accept `isCollapsed` prop. Updated SidebarNavItem to show icons with Lucide icons and hide text labels when collapsed. Added Tooltip component from shadcn/ui with Editorial Luxury styling (0px radius). Maintained 44px touch targets.

3. **Task 3 - AppShell:** Added `useBreakpoint` hook to detect laptop breakpoint (1024-1279px). Passes `isSidebarCollapsed` to Sidebar and `isCanvasOverlay` to CanvasColumn.

4. **Task 4 - Canvas Overlay:** Updated CanvasColumn to accept `isOverlay` prop. At laptop breakpoint, canvas uses fixed positioning with slide-in animation from right. Added backdrop overlay with click-to-close. Close button added for overlay mode.

5. **Task 5 - Transitions:** All transitions use 300ms duration with `ease-luxury` timing function. Sidebar has `transition-all`, canvas has `transition-transform`.

6. **Task 6 - Unit Tests:** Created 50 unit tests in `tests/unit/components/layout/laptop-breakpoint.spec.tsx`. All tests pass. Updated test setup to mock `window.matchMedia`.

7. **Task 7 - E2E Tests:** Created 20 E2E tests in `tests/e2e/responsive/laptop-breakpoint.spec.ts` covering all acceptance criteria.

### File List

**New Files:**
- `/Users/sid/Desktop/orion-butler/src/hooks/useMediaQuery.ts` - useMediaQuery and useBreakpoint hooks
- `/Users/sid/Desktop/orion-butler/src/hooks/index.ts` - Hooks barrel export
- `/Users/sid/Desktop/orion-butler/src/stores/layoutStore.ts` - Layout state management
- `/Users/sid/Desktop/orion-butler/src/components/ui/tooltip.tsx` - shadcn/ui Tooltip with Orion styling
- `/Users/sid/Desktop/orion-butler/tests/unit/components/layout/laptop-breakpoint.spec.tsx` - 50 unit tests
- `/Users/sid/Desktop/orion-butler/tests/e2e/responsive/laptop-breakpoint.spec.ts` - 20 E2E tests

**Modified Files:**
- `/Users/sid/Desktop/orion-butler/design-system/styles/globals.css` - Added `--orion-sidebar-icon-only: 48px`
- `/Users/sid/Desktop/orion-butler/design-system/tailwind.config.ts` - Added sidebar-icon-only width and spacing
- `/Users/sid/Desktop/orion-butler/src/components/sidebar/Sidebar.tsx` - Added isCollapsed prop, TooltipProvider
- `/Users/sid/Desktop/orion-butler/src/components/sidebar/SidebarNavItem.tsx` - Added icon-only mode with tooltips
- `/Users/sid/Desktop/orion-butler/src/components/layout/AppShell.tsx` - Added useBreakpoint hook integration
- `/Users/sid/Desktop/orion-butler/src/components/canvas/CanvasColumn.tsx` - Added isOverlay prop for fixed positioning
- `/Users/sid/Desktop/orion-butler/src/stores/index.ts` - Added layoutStore export
- `/Users/sid/Desktop/orion-butler/tests/setup.tsx` - Added matchMedia mock
- `/Users/sid/Desktop/orion-butler/tests/unit/components/sidebar/SidebarNavItem.spec.tsx` - Fixed test for icon structure
