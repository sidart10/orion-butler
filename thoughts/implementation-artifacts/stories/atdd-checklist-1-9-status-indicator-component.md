# ATDD Checklist: 1-9-status-indicator-component

**Story:** Status Indicator Component
**Epic:** 1 - Harness Foundation (UI/UX Shell)
**Created:** 2026-01-24
**Test Framework:** Vitest (unit), Playwright (E2E)

---

## AC1: Working Indicator with Pulse Animation

> Given the chat interface, when the agent is processing, then a "Working" indicator displays with pulse animation

### Happy Path
- [ ] Test: Renders gold-colored indicator when status is "thinking"
  - Given: StatusIndicator component with status="thinking"
  - When: Component mounts
  - Then: Indicator has gold color (--orion-gold / #D4AF37)

- [ ] Test: Applies pulse animation class for thinking state
  - Given: StatusIndicator component with status="thinking"
  - When: Component renders
  - Then: Element has CSS class with animation-name matching "status-pulse"

- [ ] Test: Pulse animation timing is 1500ms
  - Given: StatusIndicator component with status="thinking"
  - When: Animation is applied
  - Then: animation-duration is 1500ms with ease-in-out timing function

### Edge Cases
- [ ] Test: Transitions from idle to thinking state
  - Given: StatusIndicator with status="idle"
  - When: Status prop changes to "thinking"
  - Then: Animation starts smoothly without visual glitch

- [ ] Test: Handles rapid status changes gracefully
  - Given: StatusIndicator with status="thinking"
  - When: Status rapidly toggles between "thinking" and "idle"
  - Then: No animation artifacts or stuck states

### Error Handling
- [ ] Test: Invalid thinking variant doesn't crash
  - Given: StatusIndicator component
  - When: status prop is "thinking" but CSS token is missing
  - Then: Component renders with fallback color

---

## AC2: Waiting Indicator in Blue

> Given the chat interface, when the agent is waiting for external response, then a "Waiting" indicator displays in blue (#3B82F6)

### Happy Path
- [ ] Test: Renders blue-colored indicator when status is "waiting"
  - Given: StatusIndicator component with status="waiting"
  - When: Component mounts
  - Then: Indicator has blue color (#3B82F6 / --orion-waiting)

- [ ] Test: Waiting state has pulse animation
  - Given: StatusIndicator component with status="waiting"
  - When: Component renders
  - Then: Element has pulse animation (same as thinking state)

### Edge Cases
- [ ] Test: Blue color is distinct from gold in both light and dark modes
  - Given: StatusIndicator with status="waiting"
  - When: System theme changes between light/dark
  - Then: Blue color (#3B82F6) remains consistent

### Error Handling
- [ ] Test: Falls back gracefully if --orion-waiting token undefined
  - Given: StatusIndicator component
  - When: CSS variable --orion-waiting is not defined
  - Then: Uses inline fallback blue (#3B82F6)

---

## AC3: Idle Indicator in Muted Gray

> Given the chat interface, when the agent is idle, then an "Idle" indicator displays in muted gray

### Happy Path
- [ ] Test: Renders muted gray indicator when status is "idle"
  - Given: StatusIndicator component with status="idle"
  - When: Component mounts
  - Then: Indicator has muted gray color (--orion-fg-muted)

- [ ] Test: Idle state has no animation
  - Given: StatusIndicator component with status="idle"
  - When: Component renders
  - Then: No animation class is applied

### Edge Cases
- [ ] Test: Idle is the default/initial state
  - Given: StatusIndicator component without explicit status prop
  - When: Component mounts
  - Then: Default to idle state (gray, no animation)

- [ ] Test: Gray color has sufficient contrast in both themes
  - Given: StatusIndicator with status="idle"
  - When: Theme is light mode
  - Then: Gray indicator is visible against light background

---

## AC4: Geometric Dots Only (No Emojis)

> Status indicator uses geometric dots (filled circle) - no emojis per Editorial Luxury aesthetic

### Happy Path
- [ ] Test: Renders as geometric filled circle for idle state
  - Given: StatusIndicator component with status="idle"
  - When: Component renders
  - Then: Renders as div/span with border-radius: 50% (circular shape)

- [ ] Test: Uses filled circle for thinking state
  - Given: StatusIndicator component with status="thinking"
  - When: Component renders
  - Then: No emoji characters in DOM, uses CSS-styled circle

- [ ] Test: Uses filled circle for acting state
  - Given: StatusIndicator component with status="acting"
  - When: Component renders
  - Then: Geometric circle with spin animation

- [ ] Test: Uses filled circle for waiting state
  - Given: StatusIndicator component with status="waiting"
  - When: Component renders
  - Then: Geometric blue circle with pulse

- [ ] Test: Uses filled circle for error state
  - Given: StatusIndicator component with status="error"
  - When: Component renders
  - Then: Geometric red circle, no emoji

### Edge Cases
- [ ] Test: No emoji characters in rendered output
  - Given: StatusIndicator with any valid status
  - When: Inspecting DOM textContent
  - Then: No unicode emoji code points present

---

## AC5: Success State with Gold Checkmark

> Success state displays gold checkmark icon (from Lucide) instead of filled dot

### Happy Path
- [ ] Test: Renders Lucide checkmark icon for success state
  - Given: StatusIndicator component with status="success"
  - When: Component renders
  - Then: Lucide Check icon is rendered (not filled circle)

- [ ] Test: Checkmark is gold colored
  - Given: StatusIndicator component with status="success"
  - When: Component renders
  - Then: Check icon has gold color (--orion-gold / #D4AF37)

- [ ] Test: Success state has no animation
  - Given: StatusIndicator component with status="success"
  - When: Component renders
  - Then: No pulse or spin animation class

### Edge Cases
- [ ] Test: Checkmark scales correctly at all sizes
  - Given: StatusIndicator with status="success" and size="lg"
  - When: Component renders
  - Then: Checkmark icon scales to 12px appropriately

- [ ] Test: Checkmark maintains aspect ratio
  - Given: StatusIndicator with status="success" and size="sm"
  - When: Component renders at 6px
  - Then: Checkmark icon is proportional (not stretched)

### Error Handling
- [ ] Test: Falls back to circle if Lucide icon fails to load
  - Given: StatusIndicator with status="success"
  - When: Lucide Check component is unavailable
  - Then: Graceful fallback (not crash)

---

## AC6: Error State in Red

> Error state displays red indicator

### Happy Path
- [ ] Test: Renders red indicator when status is "error"
  - Given: StatusIndicator component with status="error"
  - When: Component mounts
  - Then: Indicator has red color (--orion-error / #9B2C2C)

- [ ] Test: Error state has no animation
  - Given: StatusIndicator component with status="error"
  - When: Component renders
  - Then: No animation class applied (static indicator)

- [ ] Test: Error uses filled circle (not icon)
  - Given: StatusIndicator component with status="error"
  - When: Component renders
  - Then: Geometric filled circle in red

### Edge Cases
- [ ] Test: Error red is distinct from destructive button red
  - Given: StatusIndicator with status="error"
  - When: Placed near destructive button
  - Then: Uses consistent --orion-error token (#9B2C2C)

---

## AC7: Three Size Variants (6px, 8px, 12px)

> Three size variants available: 6px (inline), 8px (sidebar), 12px (activity panel)

### Happy Path
- [ ] Test: Small size (sm) renders at 6px
  - Given: StatusIndicator component with size="sm"
  - When: Component renders
  - Then: Width and height are 6px (0.375rem)

- [ ] Test: Medium size (md) renders at 8px
  - Given: StatusIndicator component with size="md"
  - When: Component renders
  - Then: Width and height are 8px (0.5rem)

- [ ] Test: Large size (lg) renders at 12px
  - Given: StatusIndicator component with size="lg"
  - When: Component renders
  - Then: Width and height are 12px (0.75rem)

- [ ] Test: Default size is medium (md)
  - Given: StatusIndicator component without size prop
  - When: Component renders
  - Then: Defaults to 8px (md size)

### Edge Cases
- [ ] Test: All status states work at sm size
  - Given: StatusIndicator with size="sm"
  - When: Cycling through all 6 states
  - Then: Each state renders correctly at 6px

- [ ] Test: All status states work at lg size
  - Given: StatusIndicator with size="lg"
  - When: Cycling through all 6 states
  - Then: Each state renders correctly at 12px

- [ ] Test: Checkmark icon scales at each size
  - Given: StatusIndicator with status="success"
  - When: Rendered at sm, md, lg sizes
  - Then: Checkmark proportionally sized (not clipped)

### Error Handling
- [ ] Test: Invalid size prop falls back to default
  - Given: StatusIndicator with size="xlarge" (invalid)
  - When: Component renders
  - Then: Falls back to md (8px) size

---

## AC8: Pulse Animation Timing (1500ms ease-in-out)

> Pulse animation runs at 1500ms ease-in-out loop for thinking/waiting states

### Happy Path
- [ ] Test: Pulse animation duration is 1500ms
  - Given: StatusIndicator with status="thinking"
  - When: Computed style is checked
  - Then: animation-duration is 1500ms (1.5s)

- [ ] Test: Pulse uses ease-in-out timing function
  - Given: StatusIndicator with status="thinking"
  - When: Computed style is checked
  - Then: animation-timing-function is ease-in-out

- [ ] Test: Pulse animation loops infinitely
  - Given: StatusIndicator with status="thinking"
  - When: Animation is running
  - Then: animation-iteration-count is infinite

- [ ] Test: Pulse includes opacity and scale transforms
  - Given: StatusIndicator with status="thinking"
  - When: Animation keyframes are inspected
  - Then: Animation includes opacity (1 to 0.5) and scale (1 to 0.9)

### Edge Cases
- [ ] Test: Spin animation for acting is different from pulse
  - Given: StatusIndicator with status="acting"
  - When: Animation is applied
  - Then: Uses spin animation (rotation) not pulse

- [ ] Test: Spin animation is 1000ms linear
  - Given: StatusIndicator with status="acting"
  - When: Computed style is checked
  - Then: animation-duration is 1000ms with linear timing

---

## AC9: Accessibility with ARIA Labels

> Component is accessible with appropriate ARIA labels for screen readers

### Happy Path
- [ ] Test: Has role="status" attribute
  - Given: StatusIndicator component
  - When: Component renders
  - Then: Element has role="status" for live region

- [ ] Test: Idle state has descriptive aria-label
  - Given: StatusIndicator with status="idle"
  - When: Component renders
  - Then: aria-label="Agent is idle" (or similar)

- [ ] Test: Thinking state has descriptive aria-label
  - Given: StatusIndicator with status="thinking"
  - When: Component renders
  - Then: aria-label="Agent is thinking" (or similar)

- [ ] Test: Acting state has descriptive aria-label
  - Given: StatusIndicator with status="acting"
  - When: Component renders
  - Then: aria-label="Agent is acting" (or similar)

- [ ] Test: Waiting state has descriptive aria-label
  - Given: StatusIndicator with status="waiting"
  - When: Component renders
  - Then: aria-label="Agent is waiting" (or similar)

- [ ] Test: Success state has descriptive aria-label
  - Given: StatusIndicator with status="success"
  - When: Component renders
  - Then: aria-label="Success" (or similar)

- [ ] Test: Error state has descriptive aria-label
  - Given: StatusIndicator with status="error"
  - When: Component renders
  - Then: aria-label="Error" (or similar)

### Edge Cases
- [ ] Test: Screen reader announces status changes
  - Given: StatusIndicator with aria-live="polite"
  - When: Status changes from "idle" to "thinking"
  - Then: Change is announced by screen readers

- [ ] Test: Custom aria-label can be provided via props
  - Given: StatusIndicator with custom aria-label prop
  - When: Component renders
  - Then: Custom label overrides default

### Error Handling
- [ ] Test: Component is not aria-hidden
  - Given: StatusIndicator component
  - When: Component renders
  - Then: aria-hidden is false (or not present)

---

## AC10: Focus States with 2px Gold Outline

> Focus states use 2px gold outline with 2px offset (consistent with buttons/inputs)

### Happy Path
- [ ] Test: Focusable element has 2px gold outline on focus
  - Given: StatusIndicator with showLabel=true (focusable)
  - When: Element receives focus
  - Then: Outline is 2px solid gold (--orion-gold)

- [ ] Test: Focus outline has 2px offset
  - Given: StatusIndicator with focus
  - When: Focus styles are computed
  - Then: outline-offset is 2px

- [ ] Test: Focus visible only on keyboard navigation
  - Given: StatusIndicator component
  - When: Focused via click (mouse)
  - Then: No focus ring visible (focus-visible pattern)

### Edge Cases
- [ ] Test: Focus state works at all sizes
  - Given: StatusIndicator at sm, md, lg sizes
  - When: Each receives focus
  - Then: Focus ring properly sized for each variant

- [ ] Test: Focus ring doesn't clip with small indicator
  - Given: StatusIndicator with size="sm" (6px)
  - When: Element receives focus
  - Then: 2px outline + 2px offset fully visible

### Error Handling
- [ ] Test: Indicator-only (no label) may not need focus
  - Given: StatusIndicator without showLabel
  - When: Component renders
  - Then: May not be in tab order (purely decorative)

---

## Integration Tests

### With Prior Stories

- [ ] Test: Uses design tokens from Story 1.3
  - Given: StatusIndicator component
  - When: Rendered in app context
  - Then: Uses --orion-gold, --orion-fg-muted, --orion-error tokens

- [ ] Test: Focus pattern matches Story 1.7/1.8
  - Given: StatusIndicator with focusable state
  - When: Focus applied
  - Then: Same 2px outline, 2px offset pattern as Button/Input

- [ ] Test: Works within AppShell layout (Story 1.4)
  - Given: StatusIndicator placed in sidebar
  - When: Sidebar renders
  - Then: Indicator displays correctly within sidebar context

### With Future Stories

- [ ] Test: Can be composed with text label
  - Given: StatusIndicator with showLabel=true
  - When: Component renders
  - Then: Label appears beside indicator with proper spacing

---

## Reduced Motion Support

> Per accessibility requirements: No animation for users with prefers-reduced-motion: reduce

### Happy Path
- [ ] Test: Pulse animation disabled with prefers-reduced-motion
  - Given: StatusIndicator with status="thinking"
  - When: User has prefers-reduced-motion: reduce
  - Then: No animation is applied (static indicator)

- [ ] Test: Spin animation disabled with prefers-reduced-motion
  - Given: StatusIndicator with status="acting"
  - When: User has prefers-reduced-motion: reduce
  - Then: No rotation animation (static indicator)

### Edge Cases
- [ ] Test: Color still indicates state when animation disabled
  - Given: StatusIndicator with status="thinking" + reduced motion
  - When: Component renders
  - Then: Gold color still visible (state communicated via color)

---

## TypeScript Type Safety

### Happy Path
- [ ] Test: Status type is enforced
  - Given: StatusIndicator props interface
  - When: Invalid status value passed
  - Then: TypeScript compile error

- [ ] Test: Size type is enforced
  - Given: StatusIndicator props interface
  - When: Invalid size value passed
  - Then: TypeScript compile error

### Props Interface Validation
- [ ] Test: All props have correct types
  - Given: StatusIndicatorProps interface
  - When: Type checking enabled
  - Then: status: union type, size?: optional union, showLabel?: boolean, className?: string

---

## Visual Regression Tests (E2E/Playwright)

- [ ] Test: All 6 states render correctly in light mode
  - Given: StatusIndicator gallery page
  - When: Screenshot captured
  - Then: Matches baseline for all states

- [ ] Test: All 6 states render correctly in dark mode
  - Given: StatusIndicator gallery page with dark theme
  - When: Screenshot captured
  - Then: Matches baseline for dark mode

- [ ] Test: All 3 sizes render correctly
  - Given: StatusIndicator at sm, md, lg
  - When: Screenshot captured
  - Then: Sizes match 6px, 8px, 12px specifications

---

## Summary

| Category | Test Count |
|----------|------------|
| AC1: Working Indicator | 5 |
| AC2: Waiting Indicator | 3 |
| AC3: Idle Indicator | 3 |
| AC4: Geometric Dots | 5 |
| AC5: Success Checkmark | 5 |
| AC6: Error State | 3 |
| AC7: Size Variants | 7 |
| AC8: Animation Timing | 5 |
| AC9: Accessibility | 10 |
| AC10: Focus States | 6 |
| Integration | 5 |
| Reduced Motion | 3 |
| TypeScript | 3 |
| Visual Regression | 3 |
| **Total** | **66** |

---

## Test File Structure

```
tests/
  unit/
    components/
      StatusIndicator.test.tsx      # Unit tests (AC1-AC10)
  integration/
    components/
      StatusIndicator.integration.test.tsx  # Integration tests
  e2e/
    components/
      StatusIndicator.spec.ts       # Visual regression (Playwright)
```

---

## Dependencies for Testing

- `@testing-library/react` - Component rendering
- `vitest` - Test runner
- `@playwright/test` - E2E/visual tests
- `lucide-react` - Check icon for success state
- CSS animation testing utilities (computed styles)
