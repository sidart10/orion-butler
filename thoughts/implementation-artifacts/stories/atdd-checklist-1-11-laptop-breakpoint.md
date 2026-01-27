# ATDD Checklist: 1-11-laptop-breakpoint

> **Story:** As a user, I want a compact layout at viewport width 1024-1279px, so that the app works on smaller laptop screens.
>
> **Generated:** 2026-01-24
> **Test Architect:** TEA Agent
> **Prior Dependencies:** Stories 1.1-1.10 (Design tokens, AppShell layout, components, desktop breakpoint at 1280px)

---

## Test Level Summary

| Level | Count | Purpose |
|-------|-------|---------|
| Unit | 8 | Component state, CSS calculations, prop handling |
| E2E | 14 | Visual layout, responsive behavior, user interactions |
| **Total** | **22** | - |

---

## AC1: Sidebar Collapses to Icon-Only Mode (48px)

> **Given** a viewport width between 1024px and 1279px
> **When** the app is displayed
> **Then** sidebar collapses to icon-only mode (48px width)
> **And** chat expands to fill remaining space

### Happy Path

- [ ] **1.11-E2E-001**: Sidebar width is 48px at 1024px viewport
  - **Given:** App loaded at 1024px viewport width
  - **When:** Page renders
  - **Then:** Sidebar element has computed width of 48px
  - **Selector:** `[data-testid="sidebar"]`
  - **Assertion:** `expect(await sidebar.evaluate(el => el.offsetWidth)).toBe(48)`

- [ ] **1.11-E2E-002**: Sidebar width is 48px at 1279px viewport
  - **Given:** App loaded at 1279px viewport width
  - **When:** Page renders
  - **Then:** Sidebar element has computed width of 48px
  - **Selector:** `[data-testid="sidebar"]`
  - **Assertion:** `expect(await sidebar.evaluate(el => el.offsetWidth)).toBe(48)`

- [ ] **1.11-E2E-003**: Chat column expands to fill remaining space
  - **Given:** App loaded at 1024px viewport width
  - **When:** Page renders
  - **Then:** Chat column width equals viewport minus sidebar (1024 - 48 = 976px)
  - **Selector:** `[data-testid="chat-column"]`
  - **Assertion:** `expect(chatWidth).toBeGreaterThanOrEqual(970)` (allowing for small variance)

- [ ] **1.11-UNIT-001**: Sidebar component accepts isCollapsed prop
  - **Given:** Sidebar component
  - **When:** Rendered with `isCollapsed={true}`
  - **Then:** Component applies collapsed CSS class
  - **Test Tool:** Vitest + React Testing Library

### Edge Cases

- [ ] **1.11-E2E-004**: Layout at exact 1024px boundary
  - **Given:** App loaded at exactly 1024px viewport
  - **When:** Page renders
  - **Then:** Laptop breakpoint layout is active (sidebar collapsed)
  - **Note:** Tests lower boundary of laptop range

- [ ] **1.11-E2E-005**: Layout at 1100px (mid-range laptop)
  - **Given:** App loaded at 1100px viewport
  - **When:** Page renders
  - **Then:** Sidebar is 48px, chat fills remainder

- [ ] **1.11-E2E-006**: Layout at exact 1279px boundary
  - **Given:** App loaded at exactly 1279px viewport
  - **When:** Page renders
  - **Then:** Laptop breakpoint layout is still active
  - **Note:** Tests upper boundary of laptop range

### Error Handling

- [ ] **1.11-UNIT-002**: Sidebar handles undefined isCollapsed prop gracefully
  - **Given:** Sidebar component with no isCollapsed prop
  - **When:** Rendered
  - **Then:** Defaults to expanded state (280px behavior)

---

## AC2: Canvas Overlays Chat Area

> **Given** the laptop breakpoint is active
> **When** the canvas is opened
> **Then:** canvas overlays the chat area (instead of side-by-side split)
> **And** canvas width is 480px (same as desktop)

### Happy Path

- [ ] **1.11-E2E-007**: Canvas uses fixed positioning at laptop breakpoint
  - **Given:** App at 1100px viewport with canvas closed
  - **When:** Canvas is opened
  - **Then:** Canvas element has `position: fixed`
  - **Selector:** `[data-testid="canvas-column"]`
  - **Assertion:** `expect(computedStyle.position).toBe('fixed')`

- [ ] **1.11-E2E-008**: Canvas width is 480px when open
  - **Given:** App at 1024px viewport with canvas open
  - **When:** Canvas renders
  - **Then:** Canvas width is 480px
  - **Selector:** `[data-testid="canvas-column"]`
  - **Assertion:** `expect(canvasWidth).toBe(480)`

- [ ] **1.11-E2E-009**: Canvas is right-aligned
  - **Given:** App at 1100px viewport with canvas open
  - **When:** Canvas renders
  - **Then:** Canvas right edge aligns with viewport right edge
  - **Assertion:** `expect(canvasRect.right).toBe(1100)`

- [ ] **1.11-UNIT-003**: CanvasColumn accepts isOverlay prop
  - **Given:** CanvasColumn component
  - **When:** Rendered with `isOverlay={true}`
  - **Then:** Component applies overlay positioning styles

### Edge Cases

- [ ] **1.11-E2E-010**: Chat remains visible behind canvas overlay
  - **Given:** App at 1024px viewport with canvas open
  - **When:** Canvas overlays chat
  - **Then:** Chat content is still rendered (just covered by canvas)
  - **Selector:** `[data-testid="chat-column"]`
  - **Assertion:** Chat element exists in DOM

- [ ] **1.11-E2E-011**: ESC key closes canvas overlay
  - **Given:** App at 1100px viewport with canvas open
  - **When:** User presses ESC key
  - **Then:** Canvas closes (slides out)
  - **Selector:** `[data-testid="canvas-column"]`
  - **Assertion:** `expect(canvas).not.toBeVisible()` OR `aria-hidden="true"`

### Error Handling

- [ ] **1.11-UNIT-004**: Canvas overlay handles rapid open/close gracefully
  - **Given:** CanvasColumn component
  - **When:** isOpen toggled rapidly multiple times
  - **Then:** Component does not throw errors, final state is correct

---

## AC3: Sidebar Icon-Only Mode Shows Icons with Tooltips

> **Given** the laptop breakpoint is active
> **When** the sidebar is in collapsed (icon-only) mode
> **Then** only icons are visible (no text labels)
> **And** tooltips appear on icon hover showing the label

### Happy Path

- [ ] **1.11-E2E-012**: Icons visible in collapsed sidebar
  - **Given:** App at 1024px viewport
  - **When:** Sidebar renders
  - **Then:** Navigation icons are visible
  - **Selector:** `[data-testid="sidebar"] [data-testid="gtd-inbox-icon"]`
  - **Assertion:** `expect(inboxIcon).toBeVisible()`

- [ ] **1.11-E2E-013**: Text labels hidden in collapsed sidebar
  - **Given:** App at 1024px viewport
  - **When:** Sidebar renders
  - **Then:** Navigation text labels are not visible
  - **Selector:** `[data-testid="sidebar"]`
  - **Assertion:** `expect(page.locator('[data-testid="sidebar"]').getByText('Inbox')).not.toBeVisible()`

- [ ] **1.11-E2E-014**: Tooltip appears on icon hover
  - **Given:** App at 1024px viewport
  - **When:** User hovers over Inbox icon
  - **Then:** Tooltip with "Inbox" text appears
  - **Selector:** `[role="tooltip"]`
  - **Assertion:** `expect(tooltip).toContainText('Inbox')`

- [ ] **1.11-UNIT-005**: SidebarNavItem renders tooltip in collapsed mode
  - **Given:** SidebarNavItem component with `isCollapsed={true}`
  - **When:** Rendered
  - **Then:** TooltipTrigger and TooltipContent are rendered

### Edge Cases

- [ ] **1.11-E2E-015**: Tooltip positioned to the right of icon
  - **Given:** App at 1024px viewport, Inbox icon hovered
  - **When:** Tooltip appears
  - **Then:** Tooltip is positioned to the right of the icon
  - **Note:** Tooltip should not overflow sidebar or overlap content awkwardly

- [ ] **1.11-UNIT-006**: Touch targets remain 44x44px minimum in collapsed state
  - **Given:** SidebarNavItem in collapsed mode
  - **When:** Rendered
  - **Then:** Clickable area is at least 44x44px
  - **Assertion:** Check computed height/padding equals minimum 44px

---

## AC4: No Horizontal Scrolling

> **Given** the laptop breakpoint is active
> **When** any content exceeds viewport width
> **Then** no horizontal scrolling occurs at the viewport level

### Happy Path

- [ ] **1.11-E2E-016**: No horizontal scrollbar at 1024px
  - **Given:** App loaded at 1024px viewport
  - **When:** Page renders with all content
  - **Then:** No horizontal scrollbar is present
  - **Assertion:** `expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(1024)`

- [ ] **1.11-E2E-017**: No horizontal scrollbar with canvas open at 1024px
  - **Given:** App loaded at 1024px viewport with canvas open
  - **When:** Canvas overlays chat
  - **Then:** No horizontal scrollbar appears
  - **Assertion:** Document scroll width <= viewport width

### Edge Cases

- [ ] **1.11-UNIT-007**: AppShell maintains overflow-x hidden at laptop breakpoint
  - **Given:** AppShell component at laptop breakpoint
  - **When:** Rendered
  - **Then:** Container has `overflow-x: hidden` applied

---

## AC5: Breakpoint Transition to Desktop (Above 1280px)

> **Given** the laptop breakpoint
> **When** window is resized above 1280px
> **Then** layout transitions to full three-column desktop mode
> **And** sidebar expands to 280px

### Happy Path

- [ ] **1.11-E2E-018**: Sidebar expands when resizing from 1024px to 1280px
  - **Given:** App loaded at 1024px viewport (sidebar collapsed)
  - **When:** Viewport resized to 1280px
  - **Then:** Sidebar width becomes 280px
  - **Selector:** `[data-testid="sidebar"]`
  - **Assertion:** After resize, sidebar width is 280px

- [ ] **1.11-E2E-019**: Text labels reappear when crossing to desktop
  - **Given:** App at 1024px (labels hidden)
  - **When:** Viewport resized to 1280px
  - **Then:** Navigation text labels become visible
  - **Assertion:** `expect(page.locator('[data-testid="sidebar"]').getByText('Inbox')).toBeVisible()`

### Edge Cases

- [ ] **1.11-E2E-020**: Smooth transition animation when crossing breakpoint
  - **Given:** App at 1100px viewport
  - **When:** Viewport resized to 1300px
  - **Then:** Sidebar width transitions smoothly (300ms)
  - **Note:** Check CSS transition is applied, not instant jump

- [ ] **1.11-UNIT-008**: Sidebar CSS transition uses established timing (300ms)
  - **Given:** Sidebar component styles
  - **When:** Examining CSS
  - **Then:** Transition duration is 300ms with proper easing

---

## AC6: Breakpoint Transition to Tablet (Below 1024px)

> **Given** the laptop breakpoint
> **When** window is resized below 1024px
> **Then** layout transitions to tablet mode (handled by Story 1.12)

### Happy Path

- [ ] **1.11-E2E-021**: Layout changes when resizing below 1024px
  - **Given:** App at 1024px viewport (laptop mode)
  - **When:** Viewport resized to 1023px
  - **Then:** Layout is no longer laptop mode
  - **Note:** Exact tablet behavior is Story 1.12 scope; this tests boundary detection

### Edge Cases

- [ ] **1.11-E2E-022**: No layout flicker during rapid resize around 1024px
  - **Given:** App at 1020px viewport
  - **When:** Rapidly resizing between 1020px and 1030px
  - **Then:** Layout responds correctly without visual glitches
  - **Note:** Tests transition stability at boundary

---

## Integration Points with Prior Stories

### Story 1.10 Dependencies (Desktop Breakpoint)
- Breakpoint token pattern: `--orion-breakpoint-{name}`
- No-scroll constraint: `overflow-x: hidden; max-width: 100vw;`
- Three-column layout reference for desktop mode

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
const LAPTOP_VIEWPORTS = {
  lowerBound: { width: 1024, height: 800 },
  midRange: { width: 1100, height: 800 },
  upperBound: { width: 1279, height: 800 },
};

const DESKTOP_VIEWPORT = { width: 1280, height: 900 };
const TABLET_VIEWPORT = { width: 1023, height: 768 };
```

### CSS Token Values
```typescript
const CSS_TOKENS = {
  sidebarIconOnly: 48,   // pixels
  sidebarFull: 280,      // pixels
  canvasWidth: 480,      // pixels
  transitionDuration: 300, // ms
};
```

---

## Test File Structure

```
tests/
  unit/
    components/
      layout/
        Sidebar.test.tsx          # UNIT-001, UNIT-002, UNIT-006, UNIT-008
        SidebarNavItem.test.tsx   # UNIT-005
        CanvasColumn.test.tsx     # UNIT-003, UNIT-004
        AppShell.test.tsx         # UNIT-007
  e2e/
    responsive/
      laptop-breakpoint.spec.ts   # E2E-001 through E2E-022
```

---

## Selector Strategy

Following TEA selector resilience guidelines (data-testid > ARIA > text):

| Element | Primary Selector | Fallback |
|---------|-----------------|----------|
| Sidebar | `[data-testid="sidebar"]` | `[role="navigation"]` |
| Chat Column | `[data-testid="chat-column"]` | `[role="main"]` |
| Canvas Column | `[data-testid="canvas-column"]` | `[data-testid="canvas-panel"]` |
| Inbox Icon | `[data-testid="gtd-inbox-icon"]` | - |
| Tooltip | `[role="tooltip"]` | - |

---

## Risk Assessment

| Test ID | Risk Level | Rationale |
|---------|------------|-----------|
| E2E-001, E2E-002 | HIGH | Core breakpoint behavior |
| E2E-007, E2E-008 | HIGH | Canvas overlay is critical for laptop UX |
| E2E-014 | MEDIUM | Tooltip is UX polish |
| E2E-020 | LOW | Animation is enhancement |
| E2E-022 | MEDIUM | Flicker prevention for quality |

---

## Definition of Done

- [ ] All 22 tests written and passing
- [ ] E2E tests run at 1024px, 1100px, and 1279px viewports
- [ ] Unit tests cover component props and edge cases
- [ ] No horizontal scrollbar at any laptop viewport
- [ ] Sidebar transition animation is smooth (300ms)
- [ ] Tooltips accessible and positioned correctly
- [ ] Canvas overlay z-index correct (above chat, below modals)

---

*Generated by TEA Agent following BMAD ATDD workflow*
*Test patterns based on TEA knowledge fragments: test-levels-framework.md, selector-resilience.md, playwright-config.md*
