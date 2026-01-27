# ATDD Checklist: 1-18-touch-targets-contrast

**Story:** Story 1.18 - Touch Targets & Contrast
**Created:** 2026-01-24
**Author:** TEA (Master Test Architect)

---

## Overview

This ATDD checklist ensures all acceptance criteria for Story 1.18 (Touch Targets & Contrast) are testable and covered. Story 1.18 is a validation and remediation story that audits all existing components from Stories 1.1-1.17 for accessibility compliance with WCAG AA standards, specifically:

1. **Touch Targets:** Minimum 44x44px clickable area for all interactive elements
2. **Color Contrast:** WCAG AA compliance for text (4.5:1) and UI components (3:1)

**Prior Story Context:**
- Story 1.4: Established 44px touch target pattern for sidebar nav items
- Story 1.16: Established 2px gold focus ring with 2px offset
- Story 1.3: Defined design tokens including gold (#D4AF37) which has contrast issues on cream

**Test ID Convention:** `1.18-{LEVEL}-{SEQ}` (e.g., `1.18-UNIT-001`, `1.18-E2E-001`)

---

## AC1: All Interactive Elements Meet 44x44px Touch Target Minimum

> **Given** the app interface is rendered
> **When** I measure the clickable area of any interactive element
> **Then** buttons have at least 44x44px clickable area
> **And** links have at least 44x44px clickable area
> **And** checkbox/radio controls have at least 44x44px clickable area
> **And** icon buttons have at least 44x44px clickable area
> **And** sidebar nav items have at least 44x44px clickable area
> **And** canvas action buttons have at least 44x44px clickable area

### Happy Path

- [ ] **1.18-E2E-001**: All buttons meet 44px minimum touch target
  - Given: The application is loaded at root URL
  - When: Measuring bounding box of all `<button>` elements
  - Then: Every button has `width >= 44` and `height >= 44`
  - Test command: `npx playwright test tests/e2e/a11y/touch-targets.spec.ts --grep "all buttons"`

- [ ] **1.18-E2E-002**: Sidebar nav items have full-row 44px clickable area
  - Given: Sidebar is visible with nav items
  - When: Measuring bounding box of `[data-testid="sidebar-nav-item"]` elements
  - Then: Every nav item has `height >= 44`
  - And: Clickable area spans full row width (not just text)

- [ ] **1.18-E2E-003**: Icon buttons meet 44px minimum
  - Given: Icon-only buttons exist (hamburger menu, close buttons)
  - When: Measuring bounding box of `button[aria-label]` elements
  - Then: Every icon button has `width >= 44` and `height >= 44`

- [ ] **1.18-E2E-004**: Link elements meet 44px minimum height
  - Given: Anchor elements exist in the application
  - When: Measuring bounding box of `<a>` elements with href
  - Then: Every link has `height >= 44` (width may vary for inline links)

- [ ] **1.18-E2E-005**: Form controls (checkbox/radio) meet 44px touch target
  - Given: Checkbox or radio inputs exist (future components)
  - When: Measuring clickable area including label
  - Then: Combined label+input clickable area is `>= 44x44px`

- [ ] **1.18-E2E-006**: Canvas action buttons meet 44px minimum
  - Given: Canvas column is open with action buttons
  - When: Measuring bounding box of canvas buttons
  - Then: All canvas buttons have `width >= 44` and `height >= 44`

### Edge Cases

- [ ] **1.18-E2E-007**: Touch target achieved via padding (visual remains compact)
  - Given: A compact visual button (e.g., 32px tall visual design)
  - When: Inspecting the element
  - Then: Padding extends clickable area to 44px
  - And: Visual appearance remains compact (Editorial Luxury preserved)

- [ ] **1.18-E2E-008**: Close button in modal meets 44px
  - Given: QuickCaptureModal or CommandPaletteModal is open
  - When: Measuring the close button
  - Then: Close button has `width >= 44` and `height >= 44`

- [ ] **1.18-UNIT-001**: Touch target utility class applies correctly
  - Given: A `.touch-target-44` utility class exists
  - When: Applied to an element
  - Then: `min-width: 44px` and `min-height: 44px` are set

- [ ] **1.18-E2E-009**: Input icon slots have 44px touch target
  - Given: Input component with icon adornment (clear button, search icon)
  - When: Measuring icon slot button
  - Then: Icon button has `width >= 44` and `height >= 44`

### Boundary Conditions

- [ ] **1.18-UNIT-002**: Exactly 44px touch target is acceptable
  - Given: An element with exactly 44x44px dimensions
  - When: Validating against touch target requirement
  - Then: Element passes (44px is minimum, not exclusive)

- [ ] **1.18-UNIT-003**: 43px touch target fails validation
  - Given: An element with 43x43px dimensions
  - When: Validating against touch target requirement
  - Then: Element fails validation (below 44px minimum)

### Error Handling

- [ ] **1.18-E2E-010**: Hidden interactive elements excluded from audit
  - Given: Some buttons are hidden (`display: none` or `visibility: hidden`)
  - When: Running touch target audit
  - Then: Hidden elements are skipped (no false failures)

---

## AC2: Body Text Meets WCAG AA Contrast (4.5:1)

> **Given** the app is in light mode
> **When** I measure the contrast ratio of body text against background
> **Then** text using --orion-fg on --orion-bg meets 4.5:1 ratio
> **And** text using --orion-fg-muted on --orion-bg meets 4.5:1 ratio
> **When** I switch to dark mode
> **Then** text using --orion-fg on --orion-bg meets 4.5:1 ratio
> **And** text using --orion-fg-muted on --orion-bg meets 4.5:1 ratio

### Happy Path

- [ ] **1.18-UNIT-004**: getContrastRatio utility calculates correctly
  - Given: Contrast utility function `getContrastRatio(fg, bg)`
  - When: Calculating white (#FFFFFF) on black (#000000)
  - Then: Returns approximately 21:1

- [ ] **1.18-UNIT-005**: Light mode --orion-fg on --orion-bg meets 4.5:1
  - Given: Light mode colors #1A1A1A (fg) on #FAF8F5 (bg)
  - When: Calculating contrast ratio
  - Then: Ratio is >= 4.5 (expected ~14:1)

- [ ] **1.18-UNIT-006**: Light mode --orion-fg-muted on --orion-bg meets 4.5:1
  - Given: Light mode colors #6B6B6B (fg-muted) on #FAF8F5 (bg)
  - When: Calculating contrast ratio
  - Then: Ratio is >= 4.5 (expected ~5.3:1)

- [ ] **1.18-UNIT-007**: Dark mode --orion-fg on --orion-bg meets 4.5:1
  - Given: Dark mode colors #FAF8F5 (fg) on #121212 (bg)
  - When: Calculating contrast ratio
  - Then: Ratio is >= 4.5 (expected ~15.5:1)

- [ ] **1.18-UNIT-008**: Dark mode --orion-fg-muted on --orion-bg meets 4.5:1
  - Given: Dark mode colors #9CA3AF (fg-muted) on #121212 (bg)
  - When: Calculating contrast ratio
  - Then: Ratio is >= 4.5 (expected ~7.5:1)

- [ ] **1.18-E2E-011**: axe-core detects no contrast violations in light mode
  - Given: Application loaded in light mode
  - When: Running axe-core with `wcag2aa` tags
  - Then: No `color-contrast` violations are reported

- [ ] **1.18-E2E-012**: axe-core detects no contrast violations in dark mode
  - Given: Application loaded with dark mode enabled
  - When: Running axe-core with `wcag2aa` tags
  - Then: No `color-contrast` violations are reported

### Edge Cases

- [ ] **1.18-UNIT-009**: meetsWCAGAA utility function validates correctly
  - Given: `meetsWCAGAA(ratio, isLargeText)` utility function
  - When: Testing boundary values
  - Then: `meetsWCAGAA(4.5, false)` returns true
  - And: `meetsWCAGAA(4.49, false)` returns false
  - And: `meetsWCAGAA(3.0, true)` returns true

- [ ] **1.18-UNIT-010**: Surface text contrast (white surface in light mode)
  - Given: Light mode colors #1A1A1A on #FFFFFF (surface)
  - When: Calculating contrast ratio
  - Then: Ratio is >= 4.5 (expected 21:1)

- [ ] **1.18-UNIT-011**: Elevated surface contrast in dark mode
  - Given: Dark mode colors #FAF8F5 on #1A1A1A (surface-elevated)
  - When: Calculating contrast ratio
  - Then: Ratio is >= 4.5 (expected ~14:1)

### Boundary Conditions

- [ ] **1.18-UNIT-012**: Exactly 4.5:1 contrast is acceptable for body text
  - Given: A color pair with exactly 4.5:1 contrast
  - When: Validating against WCAG AA for body text
  - Then: Validation passes (4.5:1 is minimum)

- [ ] **1.18-UNIT-013**: 4.49:1 contrast fails for body text
  - Given: A color pair with 4.49:1 contrast
  - When: Validating against WCAG AA for body text
  - Then: Validation fails (below 4.5:1 threshold)

### Error Handling

- [ ] **1.18-UNIT-014**: getContrastRatio handles hex without hash
  - Given: Colors specified without # prefix (e.g., "1A1A1A")
  - When: Calculating contrast
  - Then: Function handles gracefully (normalizes input)

- [ ] **1.18-UNIT-015**: getContrastRatio handles RGB format
  - Given: Colors in RGB format (e.g., "rgb(26, 26, 26)")
  - When: Calculating contrast
  - Then: Function parses and calculates correctly

---

## AC3: Large Text Meets WCAG AA Contrast (3:1)

> **Given** the app interface is rendered
> **When** I measure contrast of text 18px+ (or 14px+ bold)
> **Then** large text meets minimum 3:1 contrast ratio
> **And** this applies in both light and dark modes

### Happy Path

- [ ] **1.18-UNIT-016**: Large text (18px+) at 3:1 passes WCAG AA
  - Given: Text at 18px regular weight
  - When: Validating with 3:1 contrast ratio
  - Then: Validation passes for large text threshold

- [ ] **1.18-UNIT-017**: Bold text (14px+ bold) at 3:1 passes WCAG AA
  - Given: Text at 14px with font-weight >= 700
  - When: Validating with 3:1 contrast ratio
  - Then: Validation passes for large text threshold

- [ ] **1.18-E2E-013**: Heading text meets 3:1 contrast in light mode
  - Given: Application with heading elements (h1, h2, h3)
  - When: Measuring heading contrast ratios
  - Then: All headings meet minimum 3:1 ratio

- [ ] **1.18-E2E-014**: Heading text meets 3:1 contrast in dark mode
  - Given: Dark mode enabled with heading elements
  - When: Measuring heading contrast ratios
  - Then: All headings meet minimum 3:1 ratio

### Edge Cases

- [ ] **1.18-UNIT-018**: Text at 17px does NOT qualify as large text
  - Given: Text at 17px regular weight
  - When: Determining if it qualifies as large text
  - Then: Returns false (must be 18px+ for large text)

- [ ] **1.18-UNIT-019**: Bold text at 13px does NOT qualify as large text
  - Given: Text at 13px with font-weight 700
  - When: Determining if it qualifies as large text
  - Then: Returns false (must be 14px+ bold for large text)

### Boundary Conditions

- [ ] **1.18-UNIT-020**: Exactly 3:1 contrast is acceptable for large text
  - Given: A color pair with exactly 3.0:1 contrast for large text
  - When: Validating against WCAG AA for large text
  - Then: Validation passes

- [ ] **1.18-UNIT-021**: 2.99:1 contrast fails for large text
  - Given: A color pair with 2.99:1 contrast
  - When: Validating against WCAG AA for large text
  - Then: Validation fails

---

## AC4: Non-text UI Components Meet 3:1 Contrast

> **Given** the app interface is rendered
> **When** I measure contrast of UI component boundaries
> **Then** focus rings meet 3:1 ratio against their backgrounds
> **And** input borders meet 3:1 ratio against backgrounds
> **And** button outlines meet 3:1 ratio against backgrounds
> **And** status indicators meet 3:1 ratio against backgrounds
> **And** this applies in both light and dark modes

### Happy Path

- [ ] **1.18-UNIT-022**: Focus ring contrast in light mode
  - Given: Gold focus ring (#D4AF37) on cream background (#FAF8F5)
  - When: Calculating contrast ratio
  - Then: Ratio is noted (expected 2.8:1 - below 3:1)
  - Note: Focus ring has 2px offset creating visual separation; may use darkened gold

- [ ] **1.18-UNIT-023**: Focus ring contrast in dark mode
  - Given: Gold focus ring (#D4AF37) on dark background (#121212)
  - When: Calculating contrast ratio
  - Then: Ratio is >= 3:1 (expected 5.4:1)

- [ ] **1.18-UNIT-024**: Input border contrast in light mode
  - Given: Input border (#E5E5E5) on cream background (#FAF8F5)
  - When: Calculating contrast ratio
  - Then: Ratio is >= 3:1 or alternative contrast method used

- [ ] **1.18-UNIT-025**: Input border contrast in dark mode
  - Given: Input border (#2D2D2D) on dark background (#121212)
  - When: Calculating contrast ratio
  - Then: Ratio is >= 3:1

- [ ] **1.18-UNIT-026**: Status indicator contrast (gray/idle) in both modes
  - Given: Gray status indicator (#6B6B6B)
  - When: On cream (#FAF8F5) or dark (#121212) background
  - Then: Ratio is >= 3:1 in both modes

- [ ] **1.18-E2E-015**: axe-core detects no non-text contrast violations in light mode
  - Given: Application loaded in light mode
  - When: Running axe-core with `wcag21aa` tags (includes 1.4.11)
  - Then: No UI component contrast violations reported

- [ ] **1.18-E2E-016**: axe-core detects no non-text contrast violations in dark mode
  - Given: Dark mode enabled
  - When: Running axe-core with `wcag21aa` tags
  - Then: No UI component contrast violations reported

### Edge Cases

- [ ] **1.18-UNIT-027**: Focus ring with 2px offset provides visual separation
  - Given: Focus ring has 2px outline-offset
  - When: Evaluating accessibility
  - Then: The offset creates a "gap" that aids visibility even with lower contrast

- [ ] **1.18-UNIT-028**: Button outline contrast in light mode
  - Given: Secondary button with border on cream background
  - When: Calculating border contrast
  - Then: Ratio is >= 3:1

### Boundary Conditions

- [ ] **1.18-UNIT-029**: Exactly 3:1 contrast is acceptable for UI components
  - Given: A UI component border with exactly 3.0:1 contrast
  - When: Validating against WCAG AA for non-text
  - Then: Validation passes

- [ ] **1.18-UNIT-030**: 2.99:1 contrast fails for UI components
  - Given: A UI component border with 2.99:1 contrast
  - When: Validating against WCAG AA for non-text
  - Then: Validation fails

### Error Handling

- [ ] **1.18-UNIT-031**: meetsUIComponentContrast utility validates correctly
  - Given: `meetsUIComponentContrast(ratio)` utility
  - When: Testing threshold
  - Then: Returns true for ratio >= 3.0, false otherwise

---

## AC5: Gold Accent Color Meets Contrast Requirements

> **Given** the gold accent (#D4AF37) is used for active states
> **When** gold is used as text color
> **Then** it meets 4.5:1 ratio for body text context
> **Or** it meets 3:1 ratio and is used only for large text / UI components
> **And** gold focus rings meet 3:1 ratio against both cream and dark backgrounds

### Happy Path

- [ ] **1.18-UNIT-032**: Gold on dark background meets 3:1 for UI
  - Given: Gold (#D4AF37) on dark (#121212) background
  - When: Calculating contrast ratio
  - Then: Ratio is >= 3:1 (expected 5.4:1)

- [ ] **1.18-UNIT-033**: Gold background with dark text meets 4.5:1
  - Given: Dark text (#1A1A1A) on gold (#D4AF37) background
  - When: Calculating contrast ratio
  - Then: Ratio is >= 4.5 (expected 7.8:1)

- [ ] **1.18-UNIT-034**: Accessible gold (#B8941F) on cream meets 3:1
  - Given: Darkened gold (#B8941F) on cream (#FAF8F5)
  - When: Calculating contrast ratio
  - Then: Ratio is >= 3:1 (expected ~4.1:1)

- [ ] **1.18-E2E-017**: Gold focus rings visible in light mode
  - Given: Application in light mode
  - When: Tabbing to focus an element
  - Then: Gold focus ring is visually distinguishable
  - And: 2px offset creates separation from cream background

- [ ] **1.18-E2E-018**: Gold focus rings visible in dark mode
  - Given: Application in dark mode
  - When: Tabbing to focus an element
  - Then: Gold focus ring is clearly visible against dark background

### Edge Cases

- [ ] **1.18-UNIT-035**: Original gold (#D4AF37) on cream fails 3:1
  - Given: Gold (#D4AF37) on cream (#FAF8F5)
  - When: Calculating contrast ratio
  - Then: Ratio is < 3:1 (expected 2.8:1)
  - Note: This documents the known limitation requiring remediation

- [ ] **1.18-E2E-019**: Gold used as fill with dark text (primary button pattern)
  - Given: Primary button with gold background
  - When: Text is #1A1A1A on gold
  - Then: Text is readable with >= 4.5:1 contrast

- [ ] **1.18-UNIT-036**: Active nav item gold border visible
  - Given: Active sidebar nav item with 4px gold left border
  - When: On cream background
  - Then: Border is visible (may use background tint for additional indication)

### Boundary Conditions

- [ ] **1.18-UNIT-037**: Gold as body text requires 4.5:1 or avoidance
  - Given: Gold used as body text (< 18px)
  - When: On any background
  - Then: Must meet 4.5:1 or use darkened gold variant

### Error Handling

- [ ] **1.18-UNIT-038**: Gold remediation documented in design tokens
  - Given: Gold contrast issue on light backgrounds
  - When: Checking design tokens
  - Then: `--orion-gold-accessible` variant exists for light mode use

---

## AC6: Error State Colors Meet Contrast Requirements

> **Given** error states use red color variants
> **When** error text is displayed
> **Then** light mode error (#9B2C2C) meets 4.5:1 against cream background
> **And** dark mode error (#EF4444) meets 4.5:1 against dark background

### Happy Path

- [ ] **1.18-UNIT-039**: Light mode error text contrast
  - Given: Error text (#9B2C2C) on cream (#FAF8F5)
  - When: Calculating contrast ratio
  - Then: Ratio is >= 4.5 (expected ~7.5:1)

- [ ] **1.18-UNIT-040**: Dark mode error text contrast
  - Given: Error text (#EF4444) on dark (#121212)
  - When: Calculating contrast ratio
  - Then: Ratio is >= 4.5 (expected ~4.6:1)

- [ ] **1.18-E2E-020**: Error messages pass axe-core contrast in light mode
  - Given: Form with validation error displayed
  - When: Running axe-core contrast check
  - Then: Error text has no contrast violations

- [ ] **1.18-E2E-021**: Error messages pass axe-core contrast in dark mode
  - Given: Dark mode with form validation error
  - When: Running axe-core contrast check
  - Then: Error text has no contrast violations

### Edge Cases

- [ ] **1.18-UNIT-041**: Error border contrast on inputs
  - Given: Input with error state border
  - When: Calculating border contrast against background
  - Then: Error border meets 3:1 for UI components

- [ ] **1.18-UNIT-042**: Destructive button focus ring uses error color
  - Given: Destructive button variant with `--orion-error` focus ring
  - When: Calculating focus ring contrast
  - Then: Red focus ring meets 3:1 against background

### Boundary Conditions

- [ ] **1.18-UNIT-043**: Error color at exactly 4.5:1 is acceptable
  - Given: An error color with exactly 4.5:1 contrast
  - When: Validating against WCAG AA
  - Then: Validation passes

---

## AC7: Visual Design Preserved with Touch Target Expansion

> **Given** a button with compact visual design
> **When** padding is added to achieve 44px clickable area
> **Then** the visual design remains compact and editorial
> **And** the clickable area extends invisibly beyond visible bounds
> **And** cursor: pointer spans the full 44px area

### Happy Path

- [ ] **1.18-E2E-022**: Button visual appearance unchanged with touch expansion
  - Given: A button with 32px visual height
  - When: Padding extends clickable area to 44px
  - Then: Visual appearance remains compact
  - And: Extended padding is transparent/invisible

- [ ] **1.18-E2E-023**: Cursor pointer spans full 44px area
  - Given: An icon button with 44px touch target
  - When: Hovering at edges of the 44px area
  - Then: Cursor shows pointer throughout the area

- [ ] **1.18-UNIT-044**: Touch target CSS pattern preserves visual design
  - Given: Touch target utility using padding expansion
  - When: Applied to compact button
  - Then: Visual bounds are smaller than clickable bounds

### Edge Cases

- [ ] **1.18-E2E-024**: Pseudo-element approach for touch expansion
  - Given: Element using ::after for invisible touch expansion
  - When: Clicking in the pseudo-element area
  - Then: Click registers on the element

- [ ] **1.18-E2E-025**: Adjacent elements do not overlap touch targets
  - Given: Two buttons with 44px touch targets close together
  - When: Clicking between them
  - Then: Only one element activates (no overlapping touch areas)

### Boundary Conditions

- [ ] **1.18-UNIT-045**: Visual size can be < 44px with padding compensation
  - Given: A 24px icon with padding to make 44px touch target
  - When: Calculating total clickable area
  - Then: Total area is 44x44px despite smaller visual element

---

## AC8: Touch Targets Work on Trackpad and Touch Screen

> **Given** a Mac with trackpad or touch screen
> **When** I click/tap any interactive element
> **Then** the 44px area responds to the interaction
> **And** there are no "dead zones" within interactive elements

### Happy Path

- [ ] **1.18-E2E-026**: Click at center of touch target activates element
  - Given: A 44px touch target button
  - When: Clicking at the center
  - Then: Element activates (receives click event)

- [ ] **1.18-E2E-027**: Click at edge of touch target activates element
  - Given: A 44px touch target button
  - When: Clicking at the edge (within 44px bounds)
  - Then: Element activates

- [ ] **1.18-E2E-028**: No dead zones within button bounds
  - Given: A button with icon and text
  - When: Clicking anywhere within the 44px area
  - Then: Button activates (no unresponsive gaps)

### Edge Cases

- [ ] **1.18-E2E-029**: Touch target on sidebar nav item spans full row
  - Given: Sidebar nav item with label and count
  - When: Clicking on the count badge area
  - Then: Nav item activates (full row is clickable)

- [ ] **1.18-E2E-030**: Modal close button touch target
  - Given: Modal with X close button in corner
  - When: Tapping near the corner
  - Then: Close button activates within 44px area

### Error Handling

- [ ] **1.18-E2E-031**: Disabled elements excluded from touch target requirements
  - Given: A disabled button
  - When: Auditing touch targets
  - Then: Disabled element is skipped (not interactive)

---

## Contrast Validation Utility Tests

### Unit Tests for src/lib/a11y/contrast.ts

- [ ] **1.18-UNIT-046**: getContrastRatio returns correct value for black/white
  - Given: `getContrastRatio('#FFFFFF', '#000000')`
  - When: Function executes
  - Then: Returns approximately 21 (21:1 ratio)

- [ ] **1.18-UNIT-047**: getContrastRatio returns 1:1 for same colors
  - Given: `getContrastRatio('#FAF8F5', '#FAF8F5')`
  - When: Function executes
  - Then: Returns 1 (1:1 ratio, no contrast)

- [ ] **1.18-UNIT-048**: Relative luminance calculated correctly
  - Given: White color (#FFFFFF)
  - When: Calculating relative luminance
  - Then: Returns 1.0

- [ ] **1.18-UNIT-049**: Relative luminance for black
  - Given: Black color (#000000)
  - When: Calculating relative luminance
  - Then: Returns 0.0

- [ ] **1.18-UNIT-050**: isLargeText utility correctly identifies large text
  - Given: Text properties (fontSize, fontWeight)
  - When: Checking `isLargeText(18, 400)` and `isLargeText(14, 700)`
  - Then: Both return true (large text thresholds)

---

## Integration Tests: Full Accessibility Audit

- [ ] **1.18-INT-001**: Complete axe-core audit in light mode
  - Given: Application loaded at root URL in light mode
  - When: Running full axe-core analysis with wcag2aa and wcag21aa tags
  - Then: Zero violations for contrast and touch target related rules

- [ ] **1.18-INT-002**: Complete axe-core audit in dark mode
  - Given: Application with dark mode enabled
  - When: Running full axe-core analysis
  - Then: Zero violations for contrast and touch target related rules

- [ ] **1.18-INT-003**: Touch target audit for all interactive elements
  - Given: Application loaded
  - When: Iterating all buttons, links, and interactive elements
  - Then: All meet 44x44px minimum OR are appropriately excluded

- [ ] **1.18-INT-004**: Contrast audit for all color token pairs
  - Given: Design token color pairs from globals.css
  - When: Calculating contrast for each fg/bg combination
  - Then: All pairs meet appropriate WCAG thresholds (4.5:1 or 3:1)

---

## Manual Testing Checklist

### Touch Target Manual Tests

- [ ] **1.18-MANUAL-001**: Test all buttons with trackpad feel responsive
  - Verify: Clicking buttons feels natural, not cramped
  - Areas: Sidebar nav items, chat input send, modal buttons

- [ ] **1.18-MANUAL-002**: Test hamburger menu at tablet breakpoint
  - Verify: Menu icon has adequate touch target on smaller screen

- [ ] **1.18-MANUAL-003**: Test theme selector segment buttons
  - Verify: Each segment (Light/Dark/System) is easy to tap

- [ ] **1.18-MANUAL-004**: Test modal close buttons
  - Verify: X buttons in QuickCapture and CommandPalette modals are easily clickable

- [ ] **1.18-MANUAL-005**: Test input icon slots
  - Verify: Clear button or search icon in inputs is easy to click

### Color Contrast Manual Tests

- [ ] **1.18-MANUAL-006**: Run Stark/color blindness simulation
  - Verify: UI remains usable with protanopia, deuteranopia, tritanopia simulation

- [ ] **1.18-MANUAL-007**: Verify status indicator colors distinguishable without color alone
  - Verify: Status states have additional indicators (animation, labels) not just color

- [ ] **1.18-MANUAL-008**: Visual inspection of gold on cream
  - Verify: Gold accents are visible (focus rings, active borders)
  - Note: May require darkened gold variant for adequate visibility

- [ ] **1.18-MANUAL-009**: Visual inspection of muted text in both modes
  - Verify: Muted text (timestamps, counts) is readable but visually subordinate

- [ ] **1.18-MANUAL-010**: Error state visibility
  - Verify: Error messages and borders are clearly visible in both themes

---

## Test Data Requirements

| Data | Description | Used In |
|------|-------------|---------|
| Light theme state | System in light mode, `.dark` class absent | AC2, AC4, AC5, AC6 |
| Dark theme state | `.dark` class on documentElement | AC2, AC4, AC5, AC6 |
| Color token values | Hex values from globals.css | All contrast tests |
| Interactive elements | All buttons, links, inputs on page | AC1, AC8 |
| Error state trigger | Form validation that shows error | AC6 |

---

## Test Infrastructure Requirements

1. **axe-core Playwright integration:**
   ```typescript
   import AxeBuilder from '@axe-core/playwright';
   ```

2. **Contrast calculation utility:**
   ```typescript
   // src/lib/a11y/contrast.ts
   export function getContrastRatio(fg: string, bg: string): number;
   export function meetsWCAGAA(ratio: number, isLargeText: boolean): boolean;
   export function meetsUIComponentContrast(ratio: number): boolean;
   ```

3. **Touch target measurement helper:**
   ```typescript
   async function measureTouchTarget(locator: Locator): Promise<{width: number, height: number}>;
   ```

4. **Test file locations:**
   - Unit tests: `src/lib/a11y/__tests__/contrast.test.ts`
   - E2E tests: `tests/e2e/a11y/touch-targets.spec.ts`
   - E2E tests: `tests/e2e/a11y/contrast.spec.ts`
   - E2E tests: `tests/e2e/a11y/a11y-audit.spec.ts`

---

## Running Tests

```bash
# Run all accessibility tests for this story
npx playwright test tests/e2e/a11y/

# Run touch target tests only
npx playwright test tests/e2e/a11y/touch-targets.spec.ts

# Run contrast tests only
npx playwright test tests/e2e/a11y/contrast.spec.ts

# Run unit tests for contrast utilities
npm run test -- src/lib/a11y/__tests__/contrast.test.ts

# Run tests in headed mode (see browser)
npx playwright test tests/e2e/a11y/ --headed

# Run axe-core audit only
npx playwright test tests/e2e/a11y/a11y-audit.spec.ts

# Debug specific test
npx playwright test tests/e2e/a11y/touch-targets.spec.ts --debug
```

---

## Coverage Summary

| AC | Happy Path | Edge Cases | Boundary | Error | Total |
|----|------------|------------|----------|-------|-------|
| AC1 (Touch Targets) | 6 | 4 | 2 | 1 | 13 |
| AC2 (Body Text 4.5:1) | 7 | 3 | 2 | 2 | 14 |
| AC3 (Large Text 3:1) | 4 | 2 | 2 | 0 | 8 |
| AC4 (UI Components 3:1) | 7 | 2 | 2 | 1 | 12 |
| AC5 (Gold Accent) | 5 | 3 | 1 | 1 | 10 |
| AC6 (Error Colors) | 4 | 2 | 1 | 0 | 7 |
| AC7 (Visual Preserved) | 3 | 2 | 1 | 0 | 6 |
| AC8 (Trackpad/Touch) | 3 | 2 | 1 | 0 | 6 |
| **Subtotal** | **39** | **20** | **12** | **5** | **76** |

**Additional Tests:**
- Utility function tests: 5
- Integration tests: 4
- Manual tests: 10
- **Grand Total: 95 test scenarios**

---

## Required data-testid Attributes

### Sidebar Components
- `sidebar-nav-item` - Each navigation item in sidebar

### Button Components
- `button-primary` - Primary action buttons
- `button-secondary` - Secondary action buttons
- `button-icon` - Icon-only buttons

### Modal Components
- `modal-close-button` - Close buttons in modals
- `quick-capture-modal` - Quick capture modal container
- `command-palette-modal` - Command palette container

### Input Components
- `input-icon-slot` - Icon buttons within inputs

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **fixture-architecture.md** - Test fixture patterns with setup/teardown
- **component-tdd.md** - Component test strategies using Playwright
- **test-quality.md** - Test design principles (Given-When-Then, determinism, isolation)
- **test-levels-framework.md** - Test level selection (E2E for accessibility, Unit for utilities)

---

## Notes

1. **Gold contrast remediation:** Story 1.18 must address the known issue of gold (#D4AF37) on cream (#FAF8F5) failing 3:1 contrast. Options include:
   - Using darkened gold (#B8941F) for light mode
   - Using gold as background with dark text
   - Accepting lower contrast for decorative elements with additional visual indicators

2. **axe-core limitations:** Some contrast issues may require manual verification if axe-core cannot measure pseudo-elements or complex backgrounds.

3. **Touch target measurement:** Use `boundingBox()` which measures the actual clickable area, not just visual appearance.

4. **Prior story patterns:**
   - Story 1.4 established 44px touch target pattern via padding
   - Story 1.16 established 2px gold outline with 2px offset for focus rings

---

*Generated by TEA (Master Test Architect) - Risk-based testing, depth scales with impact.*
