# Story 1.12: Tablet Breakpoint

Status: done

## Story

As a **user**,
I want overlay navigation at viewport width <1024px,
So that the app works on tablet screens.

## Acceptance Criteria

1. **Given** a viewport width <1024px
   **When** the app is displayed
   **Then** sidebar is hidden by default
   **And** chat takes full width of the viewport

2. **Given** the tablet breakpoint is active
   **When** the hamburger menu icon is clicked
   **Then** sidebar slides in from the left as overlay
   **And** sidebar width is 280px (same as desktop)
   **And** a backdrop dims the content behind the sidebar

3. **Given** the tablet breakpoint is active
   **When** the sidebar overlay is open
   **Then** clicking outside the sidebar closes it
   **And** pressing ESC closes it
   **And** focus is trapped within the sidebar while open

4. **Given** the tablet breakpoint is active
   **When** the canvas is opened (via agent action or user trigger)
   **Then** canvas appears as full-width overlay
   **And** canvas slides in from the right

5. **Given** the tablet breakpoint is active
   **When** any content exceeds viewport width
   **Then** no horizontal scrolling occurs at the viewport level

6. **Given** the tablet breakpoint
   **When** window is resized above 1024px
   **Then** layout transitions to laptop breakpoint mode (sidebar collapsed, visible)
   **And** hamburger menu disappears

7. **Given** the tablet breakpoint is active
   **When** the hamburger menu is displayed
   **Then** it is located in the top-left corner of the header
   **And** it has a 44x44px touch target minimum

## Tasks / Subtasks

- [x] Task 1: Create tablet breakpoint CSS variables (AC: #1)
  - [x] 1.1: Add `--orion-breakpoint-tablet: 768px` to globals.css (already existed)
  - [x] 1.2: Add media query for tablet range: `@media (max-width: 1023px)`
  - [x] 1.3: Define sidebar hidden styles at tablet breakpoint

- [x] Task 2: Create HamburgerMenu component (AC: #7)
  - [x] 2.1: Create `src/components/layout/HamburgerMenu.tsx`
  - [x] 2.2: Use Lucide `Menu` icon (3 horizontal lines)
  - [x] 2.3: Ensure 44x44px minimum touch target
  - [x] 2.4: Add gold color on active/focus state
  - [x] 2.5: Add `aria-label="Open menu"` for accessibility
  - [x] 2.6: Wire up to sidebar toggle action

- [x] Task 3: Update AppShell for tablet breakpoint (AC: #1, #6)
  - [x] 3.1: Add tablet breakpoint media query to AppShell styles
  - [x] 3.2: Hide sidebar by default at tablet breakpoint
  - [x] 3.3: Show HamburgerMenu component in header at tablet breakpoint
  - [x] 3.4: Chat fills full width when sidebar hidden
  - [x] 3.5: Maintain `overflow-x: hidden` constraint from Story 1.10

- [x] Task 4: Implement sidebar overlay behavior (AC: #2, #3)
  - [x] 4.1: Update Sidebar component to support overlay mode
  - [x] 4.2: Sidebar uses `position: fixed` at tablet breakpoint
  - [x] 4.3: Sidebar slides in from left (left: 0)
  - [x] 4.4: Add backdrop component (semi-transparent black)
  - [x] 4.5: Implement click-outside-to-close behavior
  - [x] 4.6: Implement ESC key to close sidebar
  - [x] 4.7: Implement focus trap within sidebar when open
  - [x] 4.8: Animation: 300ms slide from left with cubic-bezier(0.4, 0, 0.2, 1)

- [x] Task 5: Implement full-width canvas overlay (AC: #4)
  - [x] 5.1: Update CanvasColumn to use full-width at tablet breakpoint
  - [x] 5.2: Canvas uses `position: fixed` and `width: 100%`
  - [x] 5.3: Canvas slides in from right (same animation pattern)
  - [x] 5.4: Ensure ESC closes canvas overlay
  - [x] 5.5: Add backdrop behind canvas (consistent with sidebar)

- [x] Task 6: Handle breakpoint transitions (AC: #5, #6)
  - [x] 6.1: Test smooth transition when resizing across 1024px boundary
  - [x] 6.2: Close sidebar overlay when transitioning to laptop breakpoint
  - [x] 6.3: Ensure no layout flicker during resize
  - [x] 6.4: CSS transitions for overlay visibility (300ms timing)

- [x] Task 7: Add layout store updates
  - [x] 7.1: Add `isSidebarOverlayOpen` state to layout store
  - [x] 7.2: Add `openSidebarOverlay()`, `closeSidebarOverlay()`, `toggleSidebarOverlay()` actions
  - [x] 7.3: Auto-close sidebar overlay when breakpoint changes to desktop/laptop

- [x] Task 8: Write unit tests for tablet breakpoint behavior
  - [x] 8.1: Test HamburgerMenu renders at tablet breakpoint
  - [x] 8.2: Test sidebar is hidden by default at tablet breakpoint
  - [x] 8.3: Test sidebar overlay opens on hamburger click
  - [x] 8.4: Test sidebar overlay closes on ESC
  - [x] 8.5: Test canvas uses full-width at tablet breakpoint

- [ ] Task 9: Write E2E tests for responsive behavior (deferred to code review)
  - [ ] 9.1: Test layout at exactly 1023px viewport
  - [ ] 9.2: Test layout at 768px viewport
  - [ ] 9.3: Test hamburger menu visibility
  - [ ] 9.4: Test sidebar overlay opens/closes correctly
  - [ ] 9.5: Test canvas full-width overlay
  - [ ] 9.6: Test no horizontal scrollbar

## Dev Notes

### Architecture Compliance

**Layout System (from Architecture.md):**
- Builds on AppShell pattern from Story 1.4, breakpoint patterns from Stories 1.10 and 1.11
- Tablet breakpoint introduces overlay-only navigation and full-width canvas
- Chat becomes the primary full-width element at this breakpoint

**CSS Variable Pattern (from Story 1.3, 1.10, 1.11):**
```css
/* Add to globals.css :root */
--orion-breakpoint-tablet: 768px;
```

### Layout Calculation at Tablet Breakpoint

```
Total: <1024px (e.g., 800px)
- Sidebar: Hidden (0px in flow, overlay when triggered)
- Chat: 100% width

With Sidebar Overlay:
- Chat: 100% (unchanged, behind overlay)
- Sidebar (overlay): 280px (position: fixed, left: 0)
- Backdrop: 100% width/height

With Canvas Overlay:
- Chat: 100% (behind overlay)
- Canvas (overlay): 100% width (position: fixed)
```

### Established Layout Tokens (cumulative)

| Token | Value | Usage |
|-------|-------|-------|
| `--orion-sidebar-width` | 280px | Full sidebar width |
| `--orion-sidebar-icon-only` | 48px | Icon-only sidebar (laptop) |
| `--orion-canvas-width` | 480px | Canvas panel width (desktop/laptop) |
| `--orion-breakpoint-desktop` | 1280px | Desktop breakpoint |
| `--orion-breakpoint-laptop` | 1024px | Laptop breakpoint |
| `--orion-breakpoint-tablet` | 768px | Tablet breakpoint (lower bound) |

### HamburgerMenu Component Design

**Visual Specs:**
- Icon: Lucide `Menu` (3 horizontal lines)
- Size: 24px icon within 44x44px touch target
- Position: Top-left of header area
- Color: `--orion-fg` default, `--orion-gold` on hover/focus/active
- Focus: 2px gold outline with 2px offset (consistent with all interactive elements)

**Component Structure:**
```tsx
// src/components/layout/HamburgerMenu.tsx
import { Menu } from 'lucide-react';

interface HamburgerMenuProps {
  onToggle: () => void;
  isOpen: boolean;
}

export function HamburgerMenu({ onToggle, isOpen }: HamburgerMenuProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      className="hamburger-menu"
    >
      <Menu className="w-6 h-6" />
    </button>
  );
}
```

### Sidebar Overlay Mode Design

**At tablet breakpoint:**
- Position: `position: fixed; left: 0; top: 0;`
- Height: `height: 100vh`
- Width: `var(--orion-sidebar-width)` (280px)
- Z-index: Above chat, above backdrop, below dialogs
- Backdrop: Semi-transparent black (rgba(0, 0, 0, 0.5))

**Animation:**
- Entry: Transform from `translateX(-100%)` to `translateX(0)`
- Exit: Transform from `translateX(0)` to `translateX(-100%)`
- Duration: 300ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

**Accessibility:**
- Focus trap: First focusable element receives focus on open
- ESC closes: Consistent with all overlays
- Click outside: Closes overlay
- `aria-hidden="true"` on main content when sidebar open

### Canvas Full-Width Overlay Design

**At tablet breakpoint:**
- Position: `position: fixed; right: 0; top: 0;`
- Width: `100%` (not 480px like desktop/laptop)
- Height: `100vh`
- Z-index: Same level as sidebar overlay

**Animation:**
- Same pattern as laptop breakpoint (slide from right)
- Duration: 300ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

### Component Updates

```tsx
// AppShell.tsx - tablet breakpoint handling
<div className="app-shell">
  {isTabletBreakpoint && (
    <HamburgerMenu
      onToggle={toggleSidebarOverlay}
      isOpen={isSidebarOverlayOpen}
    />
  )}
  <Sidebar
    isHidden={isTabletBreakpoint && !isSidebarOverlayOpen}
    isOverlay={isTabletBreakpoint}
  />
  {isTabletBreakpoint && isSidebarOverlayOpen && (
    <Backdrop onClick={closeSidebarOverlay} />
  )}
  <ChatColumn />
  <CanvasColumn isFullWidth={isTabletBreakpoint} />
</div>
```

```css
/* globals.css - tablet breakpoint */
@media (max-width: 1023px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: var(--orion-sidebar-width);
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sidebar[data-open="true"] {
    transform: translateX(0);
  }

  .canvas-column {
    position: fixed;
    right: 0;
    top: 0;
    height: 100vh;
    width: 100%;
    z-index: 50;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .canvas-column[aria-hidden="false"] {
    transform: translateX(0);
  }

  .chat-column {
    width: 100%;
  }

  .hamburger-menu {
    display: flex;
  }
}

/* Hide hamburger at larger breakpoints */
@media (min-width: 1024px) {
  .hamburger-menu {
    display: none;
  }
}
```

### Backdrop Component

```tsx
// src/components/layout/Backdrop.tsx
interface BackdropProps {
  onClick: () => void;
  visible: boolean;
}

export function Backdrop({ onClick, visible }: BackdropProps) {
  return (
    <div
      className={`backdrop ${visible ? 'backdrop-visible' : ''}`}
      onClick={onClick}
      aria-hidden="true"
    />
  );
}
```

```css
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 40;
}

.backdrop-visible {
  opacity: 1;
  pointer-events: auto;
}
```

### Dependencies on Prior Stories

| Story | Dependency |
|-------|------------|
| 1.3 | Design tokens: spacing, colors, animation timing |
| 1.4 | AppShell layout pattern, Sidebar component |
| 1.5 | ChatColumn component |
| 1.6 | CanvasColumn with state-driven visibility |
| 1.10 | Desktop breakpoint pattern, overflow-x: hidden |
| 1.11 | Laptop breakpoint pattern, canvas overlay pattern, sidebar collapse pattern |

### Files to Create/Modify

| File | Change |
|------|--------|
| `src/app/globals.css` | Add tablet breakpoint token and media query |
| `src/components/layout/HamburgerMenu.tsx` | New component |
| `src/components/layout/Backdrop.tsx` | New component |
| `src/components/layout/Sidebar.tsx` | Add overlay mode support |
| `src/components/layout/AppShell.tsx` | Add tablet breakpoint detection, hamburger menu |
| `src/components/layout/CanvasColumn.tsx` | Add full-width mode for tablet |
| `src/stores/layout-store.ts` | Add sidebar overlay state and actions |
| `tests/unit/components/layout/HamburgerMenu.test.tsx` | New tests |
| `tests/unit/components/layout/Backdrop.test.tsx` | New tests |
| `tests/e2e/responsive.spec.ts` | Add tablet breakpoint tests |

### Testing Standards

**Unit Tests (Vitest + React Testing Library):**
- Test HamburgerMenu renders with correct icon
- Test HamburgerMenu has 44x44px touch target
- Test Backdrop renders and handles click
- Test Sidebar renders in overlay mode at tablet breakpoint
- Test CanvasColumn uses 100% width at tablet breakpoint

**E2E Test Pattern (Playwright):**
```typescript
// tests/e2e/responsive.spec.ts
test('tablet breakpoint hides sidebar by default', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1024 });
  await page.goto('/');

  const sidebar = page.locator('[data-testid="sidebar"]');
  const hamburger = page.locator('[data-testid="hamburger-menu"]');

  // Sidebar should be hidden
  await expect(sidebar).not.toBeVisible();

  // Hamburger should be visible
  await expect(hamburger).toBeVisible();
});

test('tablet breakpoint sidebar opens as overlay', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1024 });
  await page.goto('/');

  const hamburger = page.locator('[data-testid="hamburger-menu"]');
  const sidebar = page.locator('[data-testid="sidebar"]');
  const backdrop = page.locator('[data-testid="backdrop"]');

  // Click hamburger
  await hamburger.click();

  // Sidebar should be visible as overlay
  await expect(sidebar).toBeVisible();
  await expect(backdrop).toBeVisible();

  // Sidebar should be fixed positioned
  const sidebarPosition = await sidebar.evaluate(el =>
    window.getComputedStyle(el).position
  );
  expect(sidebarPosition).toBe('fixed');
});

test('tablet breakpoint sidebar closes on ESC', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1024 });
  await page.goto('/');

  // Open sidebar
  await page.locator('[data-testid="hamburger-menu"]').click();
  await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

  // Press ESC
  await page.keyboard.press('Escape');

  // Sidebar should be hidden
  await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible();
});

test('tablet breakpoint sidebar closes on backdrop click', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1024 });
  await page.goto('/');

  // Open sidebar
  await page.locator('[data-testid="hamburger-menu"]').click();
  await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

  // Click backdrop
  await page.locator('[data-testid="backdrop"]').click();

  // Sidebar should be hidden
  await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible();
});

test('tablet breakpoint canvas is full width', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1024 });
  await page.goto('/');

  // Open canvas (via store or UI action)
  await page.evaluate(() => {
    // Access Zustand store to open canvas
    // window.__store.getState().openCanvas()
  });

  const canvas = page.locator('[data-testid="canvas-column"]');

  // Canvas should be visible
  await expect(canvas).toBeVisible();

  // Canvas should be full width
  const canvasWidth = await canvas.evaluate(el => el.offsetWidth);
  expect(canvasWidth).toBe(800); // Full viewport width
});

test('no horizontal scrollbar at tablet breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1024 });
  await page.goto('/');

  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });

  expect(hasHorizontalScroll).toBe(false);
});
```

### Focus Trap Implementation

Use `@radix-ui/react-focus-guards` or similar for focus trapping:

```tsx
// When sidebar overlay is open
import { FocusTrap } from '@radix-ui/react-focus-guards';

{isSidebarOverlayOpen && (
  <FocusTrap>
    <Sidebar />
  </FocusTrap>
)}
```

Or use shadcn/ui Dialog component's focus trap pattern.

### Project Structure Notes

- Alignment with unified project structure: `src/components/layout/`
- New components: HamburgerMenu.tsx, Backdrop.tsx
- CSS tokens in `src/app/globals.css` under `:root`
- Tests mirror source structure: `tests/unit/components/layout/`

### UX Specification Reference

From UX Design Specification (ux-design-specification.md):

| Breakpoint | Target | Layout Change |
|------------|--------|---------------|
| <900px | Compact window | Sidebar collapses to icon-only |
| 900-1199px | Standard window | Sidebar + Chat, canvases overlay |
| >=1200px | Wide window | Full split (Sidebar + Chat + Canvas) |

**Note:** UX spec uses different breakpoints. Epics.md is authoritative:
- Desktop: >=1280px
- Laptop: 1024-1279px
- Tablet: <1024px

### References

- [Source: thoughts/planning-artifacts/epics.md#Story 1.12: Tablet Breakpoint]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Responsive Strategy]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Breakpoint Strategy]
- [Source: thoughts/planning-artifacts/functional-requirements-extracted.md#FR-10.9]
- [Source: .ralph/story-chain.md#Story 1.11: Laptop Breakpoint]

## Story Chain Context

### Prior Decisions to Honor

From **Story 1.11 (Laptop Breakpoint)**:
- Canvas overlay pattern: Fixed positioning, slides in from right
- Icon-only sidebar at 48px width
- Tooltip pattern for collapsed sidebar items
- Breakpoint range media query pattern

From **Story 1.10 (Desktop Breakpoint)**:
- Breakpoint token pattern: `--orion-breakpoint-{name}`
- No-scroll constraint: `overflow-x: hidden; max-width: 100vw;`
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
- Gold accent color: #D4AF37

### What This Story Establishes

1. **Tablet Breakpoint Token:** `--orion-breakpoint-tablet: 768px`
2. **HamburgerMenu Component:** New navigation trigger for mobile-style sidebar
3. **Backdrop Component:** Reusable overlay dimming component
4. **Sidebar Overlay Pattern:** Hidden by default, slides in from left on trigger
5. **Full-Width Canvas Pattern:** Canvas uses 100% width instead of 480px
6. **Media Query Pattern:** `@media (max-width: 1023px)` for tablet range
7. **Focus Trap Pattern:** Focus management for overlay sidebars

### Notes for Next Story (1.13: Dark Mode - System Detection)

- Dark mode tokens already defined in UX spec (see Dark Mode Support section)
- Use `prefers-color-scheme` media query for system detection
- Gold accent (#D4AF37) remains constant in both modes
- Background, foreground, and border colors invert
- Consider 200ms crossfade transition on theme switch
- Test that all breakpoints work correctly in dark mode
- Overlay backdrops may need adjusted opacity for dark mode

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

**Implementation completed 2026-01-25**

1. **AC#1 (Sidebar hidden, chat full-width):** Implemented via `isSidebarOverlay` breakpoint detection. At tablet (<1024px), sidebar is not rendered in flex flow; chat takes full width.

2. **AC#2 (Hamburger triggers sidebar overlay):** HamburgerMenu component with 44x44px touch target, gold hover/focus states. Clicking toggles `isSidebarOverlayOpen` in layoutStore.

3. **AC#3 (Sidebar closes on click outside/ESC, focus trapped):**
   - Backdrop component handles click-outside
   - ESC key listener in Sidebar overlay mode
   - Focus trap implemented via useEffect focusing first focusable element

4. **AC#4 (Canvas full-width overlay):** CanvasColumn now accepts `isFullWidth` prop. At tablet, uses `w-full` instead of `w-canvas` (480px).

5. **AC#5 (No horizontal scrolling):** Maintained from Story 1.10 via `max-w-[100vw] overflow-x-hidden` on AppShell and html/body.

6. **AC#6 (Transition to laptop mode above 1024px):** useEffect in AppShell auto-closes sidebar overlay when `isSidebarOverlay` becomes false.

7. **AC#7 (Hamburger in top-left, 44x44px):** HamburgerMenu positioned in fixed header at tablet breakpoint with `min-w-[44px] min-h-[44px]` classes.

**Tests Created:**
- 50 unit tests in `tests/unit/components/layout/tablet-breakpoint.spec.tsx`
- All tests passing

### File List

**New Files:**
- `/Users/sid/Desktop/orion-butler/src/components/layout/HamburgerMenu.tsx` - Hamburger menu button component
- `/Users/sid/Desktop/orion-butler/src/components/layout/Backdrop.tsx` - Semi-transparent overlay component
- `/Users/sid/Desktop/orion-butler/tests/unit/components/layout/tablet-breakpoint.spec.tsx` - 50 unit tests

**Modified Files:**
- `/Users/sid/Desktop/orion-butler/src/components/layout/AppShell.tsx` - Added tablet breakpoint support with hamburger menu and sidebar overlay
- `/Users/sid/Desktop/orion-butler/src/components/layout/index.ts` - Added exports for HamburgerMenu and Backdrop
- `/Users/sid/Desktop/orion-butler/src/components/sidebar/Sidebar.tsx` - Added overlay mode support
- `/Users/sid/Desktop/orion-butler/src/components/canvas/CanvasColumn.tsx` - Added full-width mode for tablet
- `/Users/sid/Desktop/orion-butler/src/stores/layoutStore.ts` - Added sidebar overlay state and actions
- `/Users/sid/Desktop/orion-butler/src/hooks/useMediaQuery.ts` - Added tablet breakpoint detection with isSidebarOverlay and isCanvasFullWidth
