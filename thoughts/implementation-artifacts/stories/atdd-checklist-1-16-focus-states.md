# ATDD Checklist: 1-16-focus-states

**Story:** Story 1.16 - Focus States
**Created:** 2026-01-24
**Author:** TEA (Master Test Architect)

---

## Overview

This ATDD checklist ensures all acceptance criteria for Story 1.16 (Focus States) are testable and covered. Story 1.16 implements visible focus indicators for keyboard navigation per NFR-5.1, establishing the unified `.focus-ring-orion` pattern across all interactive elements.

**Test ID Convention:** `1.16-{LEVEL}-{SEQ}` (e.g., `1.16-UNIT-001`, `1.16-E2E-001`)

---

## AC1: Keyboard Focus Shows Gold Outline

> **Given** I am navigating with keyboard
> **When** I Tab to any interactive element (button, link, input, textarea, nav item)
> **Then** a 2px gold (#D4AF37) outline appears with 2px offset
> **And** the outline does not overlap with the element's content

### Happy Path

- [ ] **1.16-UNIT-001**: Focus ring utility class applies correct styles
  - Given: The `.focus-ring-gold` or `.focus-ring-orion` utility class exists in globals.css
  - When: An element has this class and receives focus via keyboard
  - Then: Computed style shows `outline: 2px solid #D4AF37` and `outline-offset: 2px`

- [ ] **1.16-UNIT-002**: Button component has focus ring on Tab
  - Given: A Button component is rendered
  - When: User presses Tab to focus the button
  - Then: Button displays 2px gold outline with 2px offset

- [ ] **1.16-UNIT-003**: Input component has focus ring on Tab
  - Given: An Input component is rendered
  - When: User presses Tab to focus the input
  - Then: Input displays 2px gold outline with 2px offset

- [ ] **1.16-UNIT-004**: Textarea component has focus ring on Tab
  - Given: A Textarea component is rendered
  - When: User presses Tab to focus the textarea
  - Then: Textarea displays 2px gold outline with 2px offset

- [ ] **1.16-UNIT-005**: SidebarNavItem has focus ring on Tab
  - Given: A SidebarNavItem component is rendered
  - When: User presses Tab to focus the nav item
  - Then: Nav item displays 2px gold outline with 2px offset

- [ ] **1.16-E2E-001**: Tab navigation through page shows focus rings
  - Given: The application is loaded at root URL
  - When: User presses Tab repeatedly to navigate through focusable elements
  - Then: Each focused element displays the gold outline
  - And: Outline color is rgb(212, 175, 55) (gold in RGB)

### Edge Cases

- [ ] **1.16-UNIT-006**: Focus ring does not overlap element content
  - Given: A Button with text content is rendered
  - When: Button receives keyboard focus
  - Then: `outline-offset` is 2px (outline is outside element bounds)
  - And: Button text remains fully visible and readable

- [ ] **1.16-UNIT-007**: Focus ring works on anchor/link elements
  - Given: An anchor element with href is rendered
  - When: User Tabs to the link
  - Then: Link displays 2px gold outline with 2px offset

- [ ] **1.16-UNIT-008**: Focus ring has 0px border-radius (Editorial Luxury)
  - Given: A Button component receives focus
  - When: Inspecting the outline style
  - Then: Outline has sharp corners (no border-radius on outline)

### Error Handling

- [ ] **1.16-UNIT-009**: Destructive button variant uses red focus ring
  - Given: A Button with variant="destructive" is rendered
  - When: Button receives keyboard focus
  - Then: Button displays 2px red outline (using `--orion-error`) with 2px offset

---

## AC2: Dark Mode Focus Visibility

> **Given** I am using dark mode
> **When** I Tab to any interactive element
> **Then** the 2px gold outline is still clearly visible against the dark background
> **And** the focus indicator has the same styling as in light mode

### Happy Path

- [ ] **1.16-E2E-002**: Focus ring visible in dark mode
  - Given: The application is in dark mode (colorScheme: dark)
  - When: User presses Tab to focus an element
  - Then: Gold outline (#D4AF37) is visible against dark background (#121212)
  - And: Outline uses same 2px width and 2px offset as light mode

- [ ] **1.16-UNIT-010**: Gold color remains constant in dark mode
  - Given: Dark mode is enabled via `.dark` class or media query
  - When: Reading CSS variable `--orion-gold`
  - Then: Value is #D4AF37 (unchanged from light mode)

### Edge Cases

- [ ] **1.16-E2E-003**: Focus ring on elevated surfaces in dark mode
  - Given: Dark mode is enabled
  - When: User focuses an element on `--orion-surface-elevated` (#242424)
  - Then: Gold outline remains clearly visible (contrast ratio > 3:1)

- [ ] **1.16-UNIT-011**: All interactive components use consistent focus styling in dark mode
  - Given: Dark mode is enabled
  - When: Inspecting Button, Input, Textarea, SidebarNavItem focus styles
  - Then: All use identical `outline: 2px solid var(--orion-gold); outline-offset: 2px`

### Error Handling

- [ ] **1.16-UNIT-012**: Error variant focus ring visible in dark mode
  - Given: Dark mode is enabled and a destructive button receives focus
  - When: Inspecting the outline
  - Then: Red outline (#EF4444 in dark mode) is clearly visible

---

## AC3: Logical Focus Order

> **Given** I am navigating with keyboard
> **When** I Tab through the page
> **Then** focus order follows logical reading order (left-to-right, top-to-bottom)
> **And** focus never gets trapped in any component

### Happy Path

- [ ] **1.16-E2E-004**: Focus order follows reading flow
  - Given: Application is loaded with sidebar, chat, and canvas columns
  - When: User Tabs through the page
  - Then: Focus moves: sidebar items -> chat input -> canvas elements (when open)
  - And: Order is left-to-right, top-to-bottom within each region

- [ ] **1.16-E2E-005**: Sidebar navigation focus order
  - Given: Sidebar is visible with multiple nav items
  - When: User Tabs through sidebar
  - Then: Focus moves through nav items in visual order (top to bottom)

- [ ] **1.16-E2E-006**: No focus trap in main content
  - Given: Application is loaded (no modals open)
  - When: User Tabs through all elements and continues
  - Then: Focus eventually cycles back to the first element
  - And: Focus is never trapped in any component

### Edge Cases

- [ ] **1.16-UNIT-013**: No positive tabindex values used
  - Given: All components in the codebase
  - When: Searching for tabindex attributes
  - Then: No element has tabindex > 0 (anti-pattern)
  - And: Only tabindex="0" or tabindex="-1" are used

- [ ] **1.16-E2E-007**: Skip link functionality (if implemented)
  - Given: A skip-to-content link exists
  - When: User focuses skip link and activates it
  - Then: Focus moves directly to main content area

### Error Handling

- [ ] **1.16-E2E-008**: Focus recovery on component error
  - Given: A focusable component throws an error
  - When: Error boundary catches the error
  - Then: Focus does not get stuck on the errored component

---

## AC4: Focus-Visible Only (No Mouse Focus Ring)

> **Given** I am using a mouse
> **When** I click on an interactive element
> **Then** the focus indicator does NOT appear for mouse clicks (focus-visible only)
> **And** the element still receives focus for accessibility purposes

### Happy Path

- [ ] **1.16-UNIT-014**: Mouse click does not show focus ring
  - Given: A Button component is rendered
  - When: User clicks the button with mouse
  - Then: Button receives focus (document.activeElement === button)
  - And: No gold outline is visible (`:focus-visible` not matched)

- [ ] **1.16-UNIT-015**: Keyboard Tab shows focus ring
  - Given: A Button component is rendered
  - When: User presses Tab to focus the button
  - Then: Gold outline is visible (`:focus-visible` matched)

- [ ] **1.16-E2E-009**: Input receives focus on click without visible ring
  - Given: An Input component is rendered
  - When: User clicks inside the input with mouse
  - Then: Input receives focus and is editable
  - And: No focus outline is displayed (relies on cursor visibility)

### Edge Cases

- [ ] **1.16-UNIT-016**: Focus moves to element on click but ring only on Tab
  - Given: User clicks Button A, then Tabs forward
  - When: Focus moves to Button B via Tab
  - Then: Button B shows focus ring (keyboard navigation detected)

- [ ] **1.16-UNIT-017**: CSS uses :focus-visible not :focus for outline
  - Given: Inspecting the focus-ring utility CSS
  - When: Reading the selector
  - Then: Selector is `.focus-ring-orion:focus-visible` not `.focus-ring-orion:focus`

- [ ] **1.16-UNIT-018**: Base :focus removes outline (for mouse users)
  - Given: CSS for focus-ring utility
  - When: Checking `:focus` rule
  - Then: Rule sets `outline: none` to prevent default browser focus ring

### Error Handling

- [ ] **1.16-UNIT-019**: Touch input treated like mouse (no focus ring)
  - Given: User on touch device taps a button
  - When: Button receives focus
  - Then: No focus ring is displayed (same as mouse behavior)

---

## AC5: Focus Trap in Modals

> **Given** I am in a modal or canvas overlay
> **When** I Tab through elements
> **Then** focus is trapped within the modal/canvas until closed
> **And** Esc key closes the modal and returns focus to the trigger element

### Happy Path

- [ ] **1.16-E2E-010**: Command palette traps focus
  - Given: Command palette is opened via Cmd+K
  - When: User Tabs repeatedly
  - Then: Focus cycles only within the command palette elements
  - And: Focus never escapes to elements behind the modal

- [ ] **1.16-E2E-011**: Quick capture modal traps focus
  - Given: Quick capture modal is opened via Cmd+N
  - When: User Tabs repeatedly
  - Then: Focus cycles only within the quick capture modal

- [ ] **1.16-E2E-012**: Esc closes modal and restores focus
  - Given: User opened command palette from chat input (which had focus)
  - When: User presses Esc to close the modal
  - Then: Modal closes
  - And: Focus returns to chat input (the trigger element)

- [ ] **1.16-UNIT-020**: useFocusTrap hook traps focus correctly
  - Given: useFocusTrap(true) is called with a container ref
  - When: Container has 3 focusable elements
  - Then: Tab from last element moves focus to first element
  - And: Shift+Tab from first element moves focus to last element

### Edge Cases

- [ ] **1.16-E2E-013**: Focus trap with single focusable element
  - Given: A modal contains only one focusable element (close button)
  - When: User presses Tab
  - Then: Focus remains on the close button (no trap escape)

- [ ] **1.16-E2E-014**: Nested modals maintain separate focus traps
  - Given: Modal A is open, then Modal B opens on top
  - When: User Tabs in Modal B
  - Then: Focus is trapped in Modal B only
  - And: Closing Modal B restores focus to Modal A

- [ ] **1.16-UNIT-021**: Focus trap activates on modal open
  - Given: A modal component with useFocusTrap
  - When: Modal opens (isActive transitions to true)
  - Then: Focus automatically moves to first focusable element in modal

### Error Handling

- [ ] **1.16-UNIT-022**: Focus trap handles no focusable elements
  - Given: A modal with no focusable children (edge case)
  - When: Modal opens
  - Then: No error is thrown
  - And: Focus remains on modal container or backdrop

- [ ] **1.16-UNIT-023**: Focus restoration handles removed trigger
  - Given: Modal was opened from element X
  - When: Modal closes but element X was removed from DOM
  - Then: No error is thrown
  - And: Focus falls back to document.body or next available element

---

## AC6: Sidebar Arrow Key Navigation Focus

> **Given** I am navigating sidebar items
> **When** I use Arrow keys to move between nav items
> **Then** focus indicator is visible on the currently focused item
> **And** focus indicator uses the same 2px gold outline pattern

### Happy Path

- [ ] **1.16-E2E-015**: ArrowDown moves focus to next nav item
  - Given: Focus is on first sidebar nav item
  - When: User presses ArrowDown
  - Then: Focus moves to second nav item
  - And: Second nav item displays gold focus ring

- [ ] **1.16-E2E-016**: ArrowUp moves focus to previous nav item
  - Given: Focus is on third sidebar nav item
  - When: User presses ArrowUp
  - Then: Focus moves to second nav item
  - And: Second nav item displays gold focus ring

- [ ] **1.16-UNIT-024**: Arrow navigation uses same focus ring as Tab
  - Given: Focus moved to nav item via ArrowDown
  - When: Checking computed styles
  - Then: Outline is identical to Tab-focused elements (2px gold, 2px offset)

### Edge Cases

- [ ] **1.16-E2E-017**: ArrowDown at last item wraps to first
  - Given: Focus is on last sidebar nav item
  - When: User presses ArrowDown
  - Then: Focus wraps to first nav item (roving tabindex pattern)

- [ ] **1.16-E2E-018**: ArrowUp at first item wraps to last
  - Given: Focus is on first sidebar nav item
  - When: User presses ArrowUp
  - Then: Focus wraps to last nav item

- [ ] **1.16-UNIT-025**: Arrow key focus triggers :focus-visible
  - Given: Arrow key navigation implemented
  - When: ArrowDown moves focus between items
  - Then: `:focus-visible` matches (keyboard navigation detected)
  - And: Focus ring is displayed

### Error Handling

- [ ] **1.16-UNIT-026**: Arrow navigation with single item
  - Given: Sidebar has only one nav item
  - When: User presses ArrowDown or ArrowUp
  - Then: Focus remains on the single item (no error)

---

## AC7: Instant Focus Transition (No Animation)

> **Given** the focus indicator is visible
> **When** I observe the transition
> **Then** the focus indicator appears instantly (no animation delay)
> **And** the indicator has clean, sharp edges (0px border-radius matching Editorial Luxury)

### Happy Path

- [ ] **1.16-UNIT-027**: Focus outline has no transition
  - Given: Focus ring CSS utility
  - When: Checking transition property for outline
  - Then: No transition is defined for outline (instant appearance)

- [ ] **1.16-UNIT-028**: Focus ring has sharp corners
  - Given: A focused Button component
  - When: Inspecting outline rendering
  - Then: Outline follows element bounds with 0px border-radius

- [ ] **1.16-E2E-019**: Focus ring appears immediately on Tab
  - Given: Application loaded
  - When: User presses Tab
  - Then: Focus ring appears instantly (within 16ms / one frame)
  - And: No visible animation or fade-in effect

### Edge Cases

- [ ] **1.16-UNIT-029**: Focus ring on rounded element still has sharp outline
  - Given: An element with rounded corners (if any exist)
  - When: Element receives focus
  - Then: Focus outline maintains 0px border-radius (Editorial Luxury)
  - Note: Per design system, all elements should have 0px border-radius

### Error Handling

- [ ] **1.16-UNIT-030**: No animation remnants from theme transition
  - Given: Theme transition (200ms) just occurred
  - When: User immediately Tabs to an element
  - Then: Focus ring appears instantly (not affected by theme transition)

---

## AC8: Reduced Motion Support

> **Given** I have prefers-reduced-motion enabled
> **When** focus changes between elements
> **Then** focus transitions are instant (no animation)
> **And** the focus indicator remains fully visible and functional

### Happy Path

- [ ] **1.16-UNIT-031**: Focus ring respects prefers-reduced-motion
  - Given: `prefers-reduced-motion: reduce` is enabled
  - When: User Tabs to focus an element
  - Then: Focus ring appears instantly
  - And: No transition or animation is applied

- [ ] **1.16-E2E-020**: Focus still visible with reduced motion
  - Given: Reduced motion preference is enabled
  - When: User navigates via Tab
  - Then: Focus ring is fully visible with same styling
  - And: Gold outline remains 2px with 2px offset

- [ ] **1.16-UNIT-032**: CSS media query disables focus transitions
  - Given: CSS includes `@media (prefers-reduced-motion: reduce)` block
  - When: Inspecting rules for focus elements
  - Then: `transition: none !important` is applied to focus-related properties

### Edge Cases

- [ ] **1.16-E2E-021**: Focus trap still works with reduced motion
  - Given: Reduced motion is enabled and modal is open
  - When: User Tabs through modal
  - Then: Focus trap functions correctly
  - And: Focus ring appears instantly on each element

- [ ] **1.16-UNIT-033**: StatusIndicator pulse disabled with reduced motion
  - Given: Reduced motion is enabled
  - When: StatusIndicator is in "thinking" state (normally pulses)
  - Then: Pulse animation is disabled
  - And: Focus on adjacent elements still shows instant focus ring

### Error Handling

- [ ] **1.16-UNIT-034**: No animation fallback errors with reduced motion
  - Given: Animation keyframes are disabled
  - When: Focus changes occur
  - Then: No JavaScript errors related to animation APIs

---

## Integration Test: Full Focus Journey

- [ ] **1.16-INT-001**: Complete Tab navigation journey
  - Given: Application loaded with sidebar, chat input, and canvas (closed)
  - When: User Tabs through entire application
  - Then: Focus visits all interactive elements in logical order
  - And: Each element shows gold focus ring
  - And: Focus cycles back to beginning after last element

- [ ] **1.16-INT-002**: Modal focus journey
  - Given: User is in chat input
  - When: User presses Cmd+K to open command palette
  - Then: Focus moves into command palette and is trapped
  - When: User presses Esc
  - Then: Modal closes and focus returns to chat input

- [ ] **1.16-INT-003**: Theme switch maintains focus
  - Given: User has focused an element (e.g., button)
  - When: Theme switches from light to dark
  - Then: Focus remains on the same element
  - And: Focus ring color remains gold (unchanged)

---

## Accessibility Compliance Tests

- [ ] **1.16-A11Y-001**: Focus indicator contrast meets WCAG 2.1 AA
  - Given: Gold (#D4AF37) focus ring on light (#FAF8F5) and dark (#121212) backgrounds
  - When: Measuring contrast ratio
  - Then: Contrast is >= 3:1 for graphical objects (WCAG 1.4.11)
  - Note: Gold on cream = 2.9:1 (borderline); Gold on dark = 4.4:1 (pass)

- [ ] **1.16-A11Y-002**: Focus indicator is at least 2px thick
  - Given: WCAG 2.1 Focus Visible (Enhanced) guidance
  - When: Measuring focus indicator width
  - Then: Width is 2px (meets visibility requirement)

- [ ] **1.16-A11Y-003**: No keyboard traps outside modals
  - Given: All components in application
  - When: User navigates via keyboard only
  - Then: User can always Tab away from any component
  - And: User can reach all interactive elements

---

## Test Data Requirements

| Data | Description | Used In |
|------|-------------|---------|
| Light theme state | System in light mode | AC2, Theme tests |
| Dark theme state | System in dark mode | AC2, Theme tests |
| Reduced motion preference | `prefers-reduced-motion: reduce` | AC8 |
| Modal trigger element | Element to receive focus restoration | AC5 |
| Multiple nav items | 3+ sidebar nav items for arrow navigation | AC6 |

---

## Test Infrastructure Requirements

1. **Playwright helpers for focus testing:**
   - `expectFocusRing(locator)` - verify gold outline styles
   - `expectNoFocusRing(locator)` - verify no outline on mouse click
   - `tabTo(page, n)` - Tab n times and return focused element

2. **Vitest setup:**
   - Mock `matchMedia` for `prefers-reduced-motion`
   - Mock `matchMedia` for `prefers-color-scheme`
   - Keyboard event simulation via `@testing-library/user-event`

3. **CSS inspection utilities:**
   - `getComputedStyle` helpers for outline properties
   - RGB color parsing for gold verification

---

## Coverage Summary

| AC | Happy Path | Edge Cases | Error Handling | Total |
|----|------------|------------|----------------|-------|
| AC1 | 6 | 3 | 1 | 10 |
| AC2 | 2 | 2 | 1 | 5 |
| AC3 | 3 | 2 | 1 | 6 |
| AC4 | 3 | 3 | 1 | 7 |
| AC5 | 4 | 3 | 2 | 9 |
| AC6 | 3 | 3 | 1 | 7 |
| AC7 | 3 | 1 | 1 | 5 |
| AC8 | 3 | 2 | 1 | 6 |
| **Total** | **27** | **19** | **9** | **55** |

**Additional Tests:**
- Integration tests: 3
- Accessibility compliance: 3
- **Grand Total: 61 test scenarios**

---

*Generated by TEA (Master Test Architect) - Risk-based testing, depth scales with impact.*
