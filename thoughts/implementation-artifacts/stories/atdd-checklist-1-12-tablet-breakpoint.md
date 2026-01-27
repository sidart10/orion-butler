# ATDD Checklist: 1-12-tablet-breakpoint

> **Story:** As a user, I want overlay navigation at viewport width <1024px, so that the app works on tablet screens.
>
> **Generated:** 2026-01-24
> **Test Architect:** TEA Agent
> **Prior Dependencies:** Stories 1.10 (Desktop breakpoint), 1.11 (Laptop breakpoint with sidebar collapse, canvas overlay patterns)

---

## Test Level Summary

| Level | Count | Purpose |
|-------|-------|---------|
| Unit | 12 | Component state, CSS calculations, prop handling, focus trap |
| E2E | 20 | Visual layout, responsive behavior, user interactions, accessibility |
| **Total** | **32** | - |

---

## AC1: Sidebar Hidden by Default, Chat Full Width

> **Given** a viewport width <1024px
> **When** the app is displayed
> **Then** sidebar is hidden by default
> **And** chat takes full width of the viewport

### Happy Path

- [ ] **1.12-E2E-001**: Sidebar is hidden at 1023px viewport
  - **Given:** App loaded at 1023px viewport width
  - **When:** Page renders
  - **Then:** Sidebar element is not visible (hidden or off-screen)
  - **Selector:** `[data-testid="sidebar"]`
  - **Assertion:** `expect(sidebar).not.toBeVisible()` OR `expect(sidebar.evaluate(el => el.offsetLeft)).toBeLessThan(0)`

- [ ] **1.12-E2E-002**: Sidebar is hidden at 768px viewport
  - **Given:** App loaded at 768px viewport width
  - **When:** Page renders
  - **Then:** Sidebar element is not visible
  - **Selector:** `[data-testid="sidebar"]`
  - **Assertion:** `expect(sidebar).not.toBeVisible()`

- [ ] **1.12-E2E-003**: Chat column takes full width at tablet breakpoint
  - **Given:** App loaded at 800px viewport width
  - **When:** Page renders
  - **Then:** Chat column width equals viewport width (800px)
  - **Selector:** `[data-testid="chat-column"]`
  - **Assertion:** `expect(chatWidth).toBe(800)`

- [ ] **1.12-UNIT-001**: Sidebar component respects isHidden prop at tablet breakpoint
  - **Given:** Sidebar component
  - **When:** Rendered with `isHidden={true}` at tablet breakpoint
  - **Then:** Component applies hidden CSS (transform: translateX(-100%))
  - **Test Tool:** Vitest + React Testing Library

### Edge Cases

- [ ] **1.12-E2E-004**: Layout at exact 1023px boundary (just below laptop)
  - **Given:** App loaded at exactly 1023px viewport
  - **When:** Page renders
  - **Then:** Tablet breakpoint layout is active (sidebar hidden, hamburger visible)
  - **Note:** Tests upper boundary of tablet range

- [ ] **1.12-E2E-005**: Layout at 769px (just above minimum tablet)
  - **Given:** App loaded at 769px viewport
  - **When:** Page renders
  - **Then:** Tablet breakpoint layout is active

### Error Handling

- [ ] **1.12-UNIT-002**: Sidebar handles undefined props gracefully at tablet breakpoint
  - **Given:** Sidebar component with no breakpoint-specific props
  - **When:** Rendered at tablet viewport
  - **Then:** Defaults to visible state without crash

---

## AC2: Hamburger Menu Opens Sidebar Overlay

> **Given** the tablet breakpoint is active
> **When** the hamburger menu icon is clicked
> **Then** sidebar slides in from the left as overlay
> **And** sidebar width is 280px (same as desktop)
> **And** a backdrop dims the content behind the sidebar

### Happy Path

- [ ] **1.12-E2E-006**: Hamburger menu click opens sidebar overlay
  - **Given:** App at 800px viewport with sidebar hidden
  - **When:** User clicks hamburger menu icon
  - **Then:** Sidebar becomes visible as overlay
  - **Selector:** `[data-testid="hamburger-menu"]`, `[data-testid="sidebar"]`
  - **Assertion:** After click, `expect(sidebar).toBeVisible()`

- [ ] **1.12-E2E-007**: Sidebar overlay is 280px wide
  - **Given:** App at 800px viewport with sidebar open
  - **When:** Sidebar overlay renders
  - **Then:** Sidebar width is 280px (var(--orion-sidebar-width))
  - **Selector:** `[data-testid="sidebar"]`
  - **Assertion:** `expect(sidebarWidth).toBe(280)`

- [ ] **1.12-E2E-008**: Sidebar uses fixed positioning as overlay
  - **Given:** App at 800px viewport with sidebar open
  - **When:** Sidebar overlay renders
  - **Then:** Sidebar has `position: fixed`
  - **Selector:** `[data-testid="sidebar"]`
  - **Assertion:** `expect(computedStyle.position).toBe('fixed')`

- [ ] **1.12-E2E-009**: Backdrop appears behind sidebar overlay
  - **Given:** App at 800px viewport with sidebar closed
  - **When:** User opens sidebar
  - **Then:** Backdrop element is visible and dims content
  - **Selector:** `[data-testid="backdrop"]`
  - **Assertion:** `expect(backdrop).toBeVisible()` AND opacity > 0

- [ ] **1.12-UNIT-003**: Sidebar component supports overlay mode
  - **Given:** Sidebar component
  - **When:** Rendered with `isOverlay={true}`
  - **Then:** Component applies overlay positioning styles (position: fixed)

- [ ] **1.12-UNIT-004**: Backdrop component renders and handles click
  - **Given:** Backdrop component
  - **When:** Rendered with `visible={true}` and onClick handler
  - **Then:** Component renders semi-transparent overlay and onClick fires

### Edge Cases

- [ ] **1.12-E2E-010**: Sidebar slides in from left (animation)
  - **Given:** App at 800px viewport with sidebar closed
  - **When:** User clicks hamburger menu
  - **Then:** Sidebar animates from translateX(-100%) to translateX(0)
  - **Note:** CSS transition: 300ms cubic-bezier(0.4, 0, 0.2, 1)

- [ ] **1.12-UNIT-005**: Sidebar animation uses established 300ms timing
  - **Given:** Sidebar component styles
  - **When:** Examining CSS transitions
  - **Then:** Transition duration is 300ms with cubic-bezier(0.4, 0, 0.2, 1)

---

## AC3: Sidebar Overlay Closes on ESC, Click Outside, Focus Trap

> **Given** the tablet breakpoint is active
> **When** the sidebar overlay is open
> **Then** clicking outside the sidebar closes it
> **And** pressing ESC closes it
> **And** focus is trapped within the sidebar while open

### Happy Path

- [ ] **1.12-E2E-011**: ESC key closes sidebar overlay
  - **Given:** App at 800px viewport with sidebar open
  - **When:** User presses ESC key
  - **Then:** Sidebar closes (slides out)
  - **Selector:** `[data-testid="sidebar"]`
  - **Assertion:** After ESC, `expect(sidebar).not.toBeVisible()`

- [ ] **1.12-E2E-012**: Click on backdrop closes sidebar overlay
  - **Given:** App at 800px viewport with sidebar open
  - **When:** User clicks on backdrop
  - **Then:** Sidebar closes
  - **Selector:** `[data-testid="backdrop"]`, `[data-testid="sidebar"]`
  - **Assertion:** After backdrop click, `expect(sidebar).not.toBeVisible()`

- [ ] **1.12-E2E-013**: Focus is trapped within sidebar when open
  - **Given:** App at 800px viewport with sidebar open
  - **When:** User repeatedly presses Tab key
  - **Then:** Focus cycles only within sidebar elements (does not escape to chat)
  - **Assertion:** All focused elements are descendants of sidebar

- [ ] **1.12-E2E-014**: Focus moves to first focusable element when sidebar opens
  - **Given:** App at 800px viewport with sidebar closed
  - **When:** User opens sidebar via hamburger menu
  - **Then:** Focus moves to first focusable element inside sidebar
  - **Selector:** First focusable element in sidebar
  - **Assertion:** `expect(document.activeElement).toBe(firstFocusableInSidebar)`

- [ ] **1.12-UNIT-006**: Sidebar implements focus trap when overlay mode active
  - **Given:** Sidebar component in overlay mode
  - **When:** Rendered with focus trap enabled
  - **Then:** Focus trap wrapper is present (e.g., Radix FocusTrap)

### Edge Cases

- [ ] **1.12-E2E-015**: Click inside sidebar does NOT close it
  - **Given:** App at 800px viewport with sidebar open
  - **When:** User clicks inside sidebar content
  - **Then:** Sidebar remains open
  - **Assertion:** After click inside, `expect(sidebar).toBeVisible()`

- [ ] **1.12-UNIT-007**: Sidebar handles rapid open/close without errors
  - **Given:** Sidebar component at tablet breakpoint
  - **When:** isOpen toggled rapidly multiple times
  - **Then:** Component does not throw errors, final state is correct

### Error Handling

- [ ] **1.12-E2E-016**: Focus returns to hamburger menu when sidebar closes
  - **Given:** App at 800px viewport, sidebar opened via hamburger
  - **When:** User presses ESC to close
  - **Then:** Focus returns to hamburger menu button
  - **Assertion:** `expect(document.activeElement).toBe(hamburgerMenu)`

---

## AC4: Canvas as Full-Width Overlay

> **Given** the tablet breakpoint is active
> **When** the canvas is opened (via agent action or user trigger)
> **Then** canvas appears as full-width overlay
> **And** canvas slides in from the right

### Happy Path

- [ ] **1.12-E2E-017**: Canvas is full viewport width at tablet breakpoint
  - **Given:** App at 800px viewport with canvas open
  - **When:** Canvas renders
  - **Then:** Canvas width is 800px (100% of viewport)
  - **Selector:** `[data-testid="canvas-column"]`
  - **Assertion:** `expect(canvasWidth).toBe(800)`

- [ ] **1.12-E2E-018**: Canvas uses fixed positioning at tablet breakpoint
  - **Given:** App at 800px viewport with canvas open
  - **When:** Canvas renders
  - **Then:** Canvas has `position: fixed` and `width: 100%`
  - **Selector:** `[data-testid="canvas-column"]`
  - **Assertion:** `expect(computedStyle.position).toBe('fixed')`

- [ ] **1.12-E2E-019**: Canvas slides in from right
  - **Given:** App at 800px viewport with canvas closed
  - **When:** Canvas is opened
  - **Then:** Canvas animates from translateX(100%) to translateX(0)
  - **Note:** Same 300ms timing as sidebar

- [ ] **1.12-UNIT-008**: CanvasColumn accepts isFullWidth prop for tablet mode
  - **Given:** CanvasColumn component
  - **When:** Rendered with `isFullWidth={true}`
  - **Then:** Component applies full-width styles (width: 100%)

### Edge Cases

- [ ] **1.12-E2E-020**: ESC key closes canvas overlay at tablet breakpoint
  - **Given:** App at 800px viewport with canvas open
  - **When:** User presses ESC key
  - **Then:** Canvas closes
  - **Assertion:** After ESC, `expect(canvas).not.toBeVisible()`

- [ ] **1.12-E2E-021**: Backdrop appears behind canvas overlay (optional, but consistent with sidebar)
  - **Given:** App at 800px viewport with canvas open
  - **When:** Canvas overlay renders
  - **Then:** Backdrop element is visible (if implemented per design)
  - **Note:** May share backdrop component with sidebar

---

## AC5: No Horizontal Scrolling

> **Given** the tablet breakpoint is active
> **When** any content exceeds viewport width
> **Then** no horizontal scrolling occurs at the viewport level

### Happy Path

- [ ] **1.12-E2E-022**: No horizontal scrollbar at 800px viewport
  - **Given:** App loaded at 800px viewport
  - **When:** Page renders with all content
  - **Then:** No horizontal scrollbar is present
  - **Assertion:** `expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(800)`

- [ ] **1.12-E2E-023**: No horizontal scrollbar with sidebar overlay open
  - **Given:** App at 800px viewport with sidebar overlay open
  - **When:** Sidebar renders
  - **Then:** No horizontal scrollbar appears
  - **Assertion:** Document scroll width <= viewport width

- [ ] **1.12-E2E-024**: No horizontal scrollbar with canvas overlay open
  - **Given:** App at 800px viewport with canvas overlay open
  - **When:** Canvas renders
  - **Then:** No horizontal scrollbar appears

### Edge Cases

- [ ] **1.12-UNIT-009**: AppShell maintains overflow-x hidden at tablet breakpoint
  - **Given:** AppShell component at tablet breakpoint
  - **When:** Rendered
  - **Then:** Container has `overflow-x: hidden` applied (inherited from Story 1.10)

---

## AC6: Breakpoint Transition to Laptop (Above 1024px)

> **Given** the tablet breakpoint
> **When** window is resized above 1024px
> **Then** layout transitions to laptop breakpoint mode (sidebar collapsed, visible)
> **And** hamburger menu disappears

### Happy Path

- [ ] **1.12-E2E-025**: Hamburger menu disappears when resizing to 1024px
  - **Given:** App at 1000px viewport (hamburger visible)
  - **When:** Viewport resized to 1024px
  - **Then:** Hamburger menu is hidden
  - **Selector:** `[data-testid="hamburger-menu"]`
  - **Assertion:** After resize, `expect(hamburger).not.toBeVisible()`

- [ ] **1.12-E2E-026**: Sidebar becomes visible (collapsed) when crossing to laptop
  - **Given:** App at 1000px viewport (sidebar hidden)
  - **When:** Viewport resized to 1024px
  - **Then:** Sidebar becomes visible at 48px width (icon-only mode from Story 1.11)
  - **Assertion:** `expect(sidebar).toBeVisible()` AND `sidebarWidth === 48`

- [ ] **1.12-E2E-027**: Sidebar overlay auto-closes when transitioning to laptop
  - **Given:** App at 800px viewport with sidebar overlay open
  - **When:** Viewport resized to 1024px
  - **Then:** Sidebar overlay closes and transitions to collapsed (48px) mode
  - **Assertion:** Sidebar visible, not fixed positioned

### Edge Cases

- [ ] **1.12-E2E-028**: No layout flicker during rapid resize around 1024px
  - **Given:** App at 1020px viewport
  - **When:** Rapidly resizing between 1020px and 1030px
  - **Then:** Layout responds correctly without visual glitches

- [ ] **1.12-UNIT-010**: Layout store closes sidebar overlay on breakpoint change
  - **Given:** Layout store with `isSidebarOverlayOpen: true`
  - **When:** Breakpoint changes to laptop/desktop
  - **Then:** `isSidebarOverlayOpen` is automatically set to `false`

---

## AC7: Hamburger Menu Positioning and Touch Target

> **Given** the tablet breakpoint is active
> **When** the hamburger menu is displayed
> **Then** it is located in the top-left corner of the header
> **And** it has a 44x44px touch target minimum

### Happy Path

- [ ] **1.12-E2E-029**: Hamburger menu visible at tablet breakpoint
  - **Given:** App loaded at 800px viewport
  - **When:** Page renders
  - **Then:** Hamburger menu icon is visible
  - **Selector:** `[data-testid="hamburger-menu"]`
  - **Assertion:** `expect(hamburger).toBeVisible()`

- [ ] **1.12-E2E-030**: Hamburger menu positioned in top-left of header
  - **Given:** App at 800px viewport
  - **When:** Hamburger menu renders
  - **Then:** Hamburger is positioned in header area, left side
  - **Assertion:** hamburgerRect.left <= 20 (allowing for padding)

- [ ] **1.12-UNIT-011**: HamburgerMenu has 44x44px minimum touch target
  - **Given:** HamburgerMenu component
  - **When:** Rendered
  - **Then:** Clickable area is at least 44x44px
  - **Assertion:** `expect(hamburger.offsetWidth).toBeGreaterThanOrEqual(44)` AND height >= 44

- [ ] **1.12-UNIT-012**: HamburgerMenu has proper ARIA attributes
  - **Given:** HamburgerMenu component
  - **When:** Rendered with isOpen state
  - **Then:** Has `aria-label`, `aria-expanded` attributes
  - **Assertion:** `expect(hamburger).toHaveAttribute('aria-label')` AND `aria-expanded={isOpen}`

### Edge Cases

- [ ] **1.12-E2E-031**: Hamburger menu hidden at laptop breakpoint (>=1024px)
  - **Given:** App loaded at 1024px viewport
  - **When:** Page renders
  - **Then:** Hamburger menu is not visible
  - **Selector:** `[data-testid="hamburger-menu"]`
  - **Assertion:** `expect(hamburger).not.toBeVisible()`

---

## Integration Points with Prior Stories

### Story 1.11 Dependencies (Laptop Breakpoint)
- Canvas overlay pattern: Fixed positioning, slides in from right
- Icon-only sidebar at 48px width
- Tooltip pattern for collapsed sidebar items
- Breakpoint range media query pattern

### Story 1.10 Dependencies (Desktop Breakpoint)
- Breakpoint token pattern: `--orion-breakpoint-{name}`
- No-scroll constraint: `overflow-x: hidden; max-width: 100vw;`
- CSS Flexbox for layout (consistent pattern)

### Story 1.6 Dependencies (Canvas Column)
- Canvas animation: 300ms with cubic-bezier(0.4, 0, 0.2, 1)
- Canvas state: Zustand store with `isCanvasOpen`, `open()`, `close()`, `toggle()`
- ESC key closes canvas

### Story 1.4 Dependencies (Sidebar Column)
- SidebarNavItem component structure
- Active state: Gold left border (4px) + subtle gold background
- Touch targets: 44x44px minimum via padding
- Focus state: 2px gold outline with 2px offset

### Story 1.3 Dependencies (CSS Design Tokens)
- Animation timing: 300ms entrance/canvas, cubic-bezier(0.4, 0, 0.2, 1)
- Spacing: 4px base unit, space-12 = 48px

---

## Test Data Requirements

### Viewport Sizes
```typescript
const TABLET_VIEWPORTS = {
  upperBound: { width: 1023, height: 768 },
  midRange: { width: 800, height: 1024 },
  lowerBound: { width: 769, height: 1024 },
  minimum: { width: 768, height: 1024 },
};

const LAPTOP_VIEWPORT = { width: 1024, height: 800 };
const DESKTOP_VIEWPORT = { width: 1280, height: 900 };
```

### CSS Token Values
```typescript
const CSS_TOKENS = {
  sidebarWidth: 280,           // pixels (overlay width)
  sidebarIconOnly: 48,         // pixels (laptop collapsed)
  canvasWidthDesktop: 480,     // pixels
  canvasWidthTablet: '100%',   // full width
  hamburgerTouchTarget: 44,    // pixels minimum
  transitionDuration: 300,     // ms
  backdropOpacity: 0.5,        // semi-transparent
};
```

---

## Test File Structure

```
tests/
  unit/
    components/
      layout/
        HamburgerMenu.test.tsx     # UNIT-011, UNIT-012
        Backdrop.test.tsx          # UNIT-004
        Sidebar.tablet.test.tsx    # UNIT-001, UNIT-002, UNIT-003, UNIT-005, UNIT-006, UNIT-007
        CanvasColumn.tablet.test.tsx  # UNIT-008
        AppShell.tablet.test.tsx   # UNIT-009
    stores/
      layout-store.test.ts         # UNIT-010
  e2e/
    responsive/
      tablet-breakpoint.spec.ts    # E2E-001 through E2E-031
```

---

## Selector Strategy

Following TEA selector resilience guidelines (data-testid > ARIA > text):

| Element | Primary Selector | Fallback |
|---------|-----------------|----------|
| Sidebar | `[data-testid="sidebar"]` | `[role="navigation"]` |
| Chat Column | `[data-testid="chat-column"]` | `[role="main"]` |
| Canvas Column | `[data-testid="canvas-column"]` | `[data-testid="canvas-panel"]` |
| Hamburger Menu | `[data-testid="hamburger-menu"]` | `[aria-label="Open menu"]` |
| Backdrop | `[data-testid="backdrop"]` | `.backdrop` |
| First focusable in sidebar | `[data-testid="sidebar"] :focusable:first` | - |

---

## Risk Assessment

| Test ID | Risk Level | Rationale |
|---------|------------|-----------|
| E2E-001, E2E-002, E2E-003 | HIGH | Core breakpoint behavior - sidebar hidden, chat full width |
| E2E-006, E2E-011, E2E-012 | HIGH | Hamburger/overlay UX is critical for tablet usability |
| E2E-013, E2E-014, E2E-016 | HIGH | Focus trapping is accessibility requirement |
| E2E-017, E2E-018 | HIGH | Full-width canvas is unique to tablet |
| E2E-022, E2E-023, E2E-024 | MEDIUM | No horizontal scroll (inherited pattern) |
| E2E-010, E2E-019 | LOW | Animation polish |
| UNIT-011 | MEDIUM | Touch target for mobile accessibility |

---

## Required data-testid Attributes

### New Components (Story 1.12)

- `hamburger-menu` - Hamburger menu button in header
- `backdrop` - Semi-transparent backdrop overlay

### Existing Components (verify present)

- `sidebar` - Sidebar container
- `chat-column` - Chat column container
- `canvas-column` - Canvas column container
- `app-shell` - AppShell root container

---

## Definition of Done

- [ ] All 32 tests written and passing
- [ ] E2E tests run at 768px, 800px, 1023px viewports
- [ ] Unit tests cover component props and edge cases
- [ ] No horizontal scrollbar at any tablet viewport
- [ ] Sidebar overlay opens/closes smoothly (300ms animation)
- [ ] Focus trap works correctly for sidebar overlay
- [ ] Hamburger menu has 44x44px touch target
- [ ] Backdrop click and ESC close sidebar
- [ ] Canvas uses full width at tablet breakpoint
- [ ] Breakpoint transition to laptop works smoothly
- [ ] Accessibility: aria-label, aria-expanded, focus management

---

## Running Tests

```bash
# Run all failing tests for this story
npx playwright test tests/e2e/responsive/tablet-breakpoint.spec.ts
npx vitest run tests/unit/components/layout/*.tablet.test.tsx

# Run specific test file
npx playwright test tablet-breakpoint --headed

# Run tests in headed mode (see browser)
npx playwright test tablet-breakpoint --headed --project=chromium

# Debug specific test
npx playwright test tablet-breakpoint --debug

# Run unit tests with coverage
npx vitest run --coverage tests/unit/components/layout/
```

---

## Acceptance Criteria Traceability

| AC | Test IDs |
|----|----------|
| AC#1: Sidebar hidden, chat full width | E2E-001 to E2E-005, UNIT-001, UNIT-002 |
| AC#2: Hamburger opens sidebar overlay | E2E-006 to E2E-010, UNIT-003 to UNIT-005 |
| AC#3: Close on ESC/click, focus trap | E2E-011 to E2E-016, UNIT-006, UNIT-007 |
| AC#4: Full-width canvas overlay | E2E-017 to E2E-021, UNIT-008 |
| AC#5: No horizontal scrolling | E2E-022 to E2E-024, UNIT-009 |
| AC#6: Breakpoint transition | E2E-025 to E2E-028, UNIT-010 |
| AC#7: Hamburger position/touch target | E2E-029 to E2E-031, UNIT-011, UNIT-012 |

---

## Notes

- **Focus trap implementation:** Recommend using `@radix-ui/react-focus-guards` or shadcn Dialog pattern for focus trapping
- **Backdrop z-index:** Should be below sidebar (z-40) while sidebar is z-50
- **Canvas vs Sidebar conflict:** If both overlays open, decide priority (recommend: only one overlay at a time)
- **Transition to mobile (<768px):** Story 1.13+ scope - this story covers tablet range only

---

*Generated by TEA Agent following BMAD ATDD workflow*
*Test patterns based on TEA knowledge fragments: test-levels-framework.md, selector-resilience.md, playwright-config.md, fixture-architecture.md*
