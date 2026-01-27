# ATDD Checklist: Story 1.19 - Reduced Motion

**Story:** 1.19 - Reduced Motion Support
**Created:** 2026-01-24
**Test Architect:** TEA Agent (Ralph Orchestration)

---

## Test Coverage Matrix

| Acceptance Criteria | Normal Motion Tests | Reduced Motion Tests |
|---------------------|---------------------|----------------------|
| AC1: Detect macOS preference | TC-1.1, TC-1.2 | TC-1.3, TC-1.4, TC-1.5 |
| AC2: StatusIndicator pulse disabled | TC-2.1, TC-2.2 | TC-2.3, TC-2.4, TC-2.5, TC-2.6 |
| AC3: StatusIndicator spin disabled | TC-3.1, TC-3.2 | TC-3.3, TC-3.4, TC-3.5 |
| AC4: Canvas slide instant | TC-4.1, TC-4.2 | TC-4.3, TC-4.4, TC-4.5 |
| AC5: Theme crossfade instant | TC-5.1, TC-5.2 | TC-5.3, TC-5.4, TC-5.5 |
| AC6: Element entrance instant | TC-6.1, TC-6.2 | TC-6.3, TC-6.4, TC-6.5 |
| AC7: Focus states instant | TC-7.1, TC-7.2 | TC-7.3, TC-7.4 |
| AC8: Sidebar collapse instant | TC-8.1, TC-8.2 | TC-8.3, TC-8.4, TC-8.5 |
| AC9: Modal open/close instant | TC-9.1, TC-9.2 | TC-9.3, TC-9.4, TC-9.5 |
| AC10: Functionality preserved | TC-10.1 | TC-10.2, TC-10.3, TC-10.4, TC-10.5 |

---

## AC1: Detect macOS "Reduce motion" System Preference

### Normal Motion State (`prefers-reduced-motion: no-preference`)

#### TC-1.1: Animation tokens have standard values
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Navigate to application
  2. Query CSS custom property `--orion-anim-entrance`
  3. Query CSS custom property `--orion-anim-exit`
  4. Query CSS custom property `--orion-anim-state`
  5. Query CSS custom property `--orion-anim-canvas`
- **Expected:**
  - `--orion-anim-entrance` equals `200ms`
  - `--orion-anim-exit` equals `150ms`
  - `--orion-anim-state` equals `100ms`
  - `--orion-anim-canvas` equals `300ms`

#### TC-1.2: Animation duration properties have non-zero values
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Navigate to application
  2. Get computed style `animation-duration` on animated elements
  3. Get computed style `transition-duration` on transitioning elements
- **Expected:**
  - Animation durations are non-zero (e.g., `1.5s`, `1s`)
  - Transition durations match token values

### Reduced Motion State (`prefers-reduced-motion: reduce`)

#### TC-1.3: Animation tokens become zero
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Navigate to application
  2. Query CSS custom property `--orion-anim-entrance`
  3. Query CSS custom property `--orion-anim-exit`
  4. Query CSS custom property `--orion-anim-state`
  5. Query CSS custom property `--orion-anim-canvas`
- **Expected:**
  - `--orion-anim-entrance` equals `0ms`
  - `--orion-anim-exit` equals `0ms`
  - `--orion-anim-state` equals `0ms`
  - `--orion-anim-canvas` equals `0ms`

#### TC-1.4: Global animation-duration override applied
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Navigate to application
  2. Check computed style on any element with animation
- **Expected:**
  - `animation-duration` is `0.01ms` or `0s`
  - `animation-iteration-count` is `1`
  - `transition-duration` is `0.01ms` or `0s`

#### TC-1.5: useReducedMotion hook detects preference
- **Type:** Unit (Vitest)
- **Steps:**
  1. Mock `window.matchMedia` to return `matches: true` for `prefers-reduced-motion: reduce`
  2. Render hook
  3. Check return value
- **Expected:**
  - Hook returns `true` when reduced motion is preferred
  - Hook returns `false` when reduced motion is not preferred

---

## AC2: StatusIndicator Pulse Animation Disabled

### Normal Motion State

#### TC-2.1: Thinking state shows pulse animation
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Render StatusIndicator with `state="thinking"`
  2. Get computed `animation-name` style
- **Expected:**
  - `animation-name` contains `pulse` (not `none`)
  - `animation-duration` is `1500ms` (from Story 1.9)

#### TC-2.2: Waiting state shows pulse animation
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Render StatusIndicator with `state="waiting"`
  2. Get computed `animation-name` style
- **Expected:**
  - `animation-name` contains `pulse` (not `none`)
  - `animation-duration` is `1500ms`

### Reduced Motion State

#### TC-2.3: Thinking state shows static indicator (no pulse)
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Render StatusIndicator with `state="thinking"`
  2. Get computed `animation-name` style
  3. Get computed `background-color` style
- **Expected:**
  - `animation-name` is `none`
  - Background color is gold (thinking color visible)

#### TC-2.4: Waiting state shows static indicator (no pulse)
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Render StatusIndicator with `state="waiting"`
  2. Get computed `animation-name` style
  3. Get computed `background-color` style
- **Expected:**
  - `animation-name` is `none`
  - Background color is blue (waiting color visible)

#### TC-2.5: State color remains visible without animation
- **Type:** Visual Regression (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Render StatusIndicator with `state="thinking"`
  2. Take screenshot
  3. Compare with baseline showing gold dot
- **Expected:**
  - Gold indicator visible at full opacity
  - No visual difference except lack of pulsing

#### TC-2.6: motion-reduce variant applied to pulse class
- **Type:** Component Unit (Vitest)
- **Steps:**
  1. Render StatusIndicator with thinking state
  2. Check element classes
- **Expected:**
  - Element has `motion-safe:animate-pulse` class
  - Element has `motion-reduce:animate-none` class

---

## AC3: StatusIndicator Spin Animation Disabled

### Normal Motion State

#### TC-3.1: Acting state shows spin animation
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Render StatusIndicator with `state="acting"`
  2. Get computed `animation-name` style
- **Expected:**
  - `animation-name` contains `spin` (not `none`)
  - `animation-duration` is `1000ms` (from Story 1.9)

#### TC-3.2: Acting state rotates continuously
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Render StatusIndicator with `state="acting"`
  2. Check animation-iteration-count
- **Expected:**
  - `animation-iteration-count` is `infinite`

### Reduced Motion State

#### TC-3.3: Acting state shows static indicator (no spin)
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Render StatusIndicator with `state="acting"`
  2. Get computed `animation-name` style
  3. Get computed `background-color` style
- **Expected:**
  - `animation-name` is `none`
  - Background color is gold (acting color visible)

#### TC-3.4: Indicator remains visible without rotation
- **Type:** Visual Regression (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Render StatusIndicator with `state="acting"`
  2. Take screenshot
  3. Compare with baseline showing gold dot
- **Expected:**
  - Gold indicator visible at full opacity
  - Static position (no rotation)

#### TC-3.5: motion-reduce variant applied to spin class
- **Type:** Component Unit (Vitest)
- **Steps:**
  1. Render StatusIndicator with acting state
  2. Check element classes
- **Expected:**
  - Element has `motion-safe:animate-spin` class
  - Element has `motion-reduce:animate-none` class

---

## AC4: Canvas Slide Transitions Become Instant

### Normal Motion State

#### TC-4.1: Canvas opens with 300ms slide animation
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Navigate to application
  2. Trigger canvas open
  3. Measure time for canvas to fully appear
- **Expected:**
  - Canvas takes approximately 300ms to open
  - `transition-duration` computed style is `300ms` or uses `--orion-anim-canvas`

#### TC-4.2: Canvas closes with 300ms slide animation
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Open canvas
  2. Trigger canvas close
  3. Measure time for canvas to fully hide
- **Expected:**
  - Canvas takes approximately 300ms to close

### Reduced Motion State

#### TC-4.3: Canvas opens instantly (no slide)
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Trigger canvas open
  2. Get computed `transition-duration` on canvas element
- **Expected:**
  - `transition-duration` is `0ms` or `0.01ms`
  - Canvas appears immediately

#### TC-4.4: Canvas closes instantly (no slide)
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Open canvas
  2. Trigger canvas close
  3. Get computed `transition-duration` on canvas element
- **Expected:**
  - `transition-duration` is `0ms` or `0.01ms`
  - Canvas disappears immediately

#### TC-4.5: Canvas opacity transition is also instant
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Trigger canvas open
  2. Check opacity immediately after trigger
- **Expected:**
  - Opacity is 1 immediately (no fade)

---

## AC5: Theme Switch Crossfade Becomes Instant

### Normal Motion State

#### TC-5.1: Theme switch has 200ms crossfade
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Get current background color
  2. Toggle theme
  3. Sample background color at 100ms
  4. Sample background color at 250ms
- **Expected:**
  - At 100ms, color is transitioning (intermediate value)
  - At 250ms, color has fully changed

#### TC-5.2: Theme transition uses 200ms duration
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Check CSS transition on :root or body for theme
- **Expected:**
  - Transition duration includes `200ms` (from Story 1.13)

### Reduced Motion State

#### TC-5.3: Theme switch is instant (no crossfade)
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Get current background color
  2. Toggle theme
  3. Immediately get new background color (no await)
- **Expected:**
  - Background color changed immediately
  - No intermediate transition state

#### TC-5.4: No visible animation between themes
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Toggle theme
  2. Check `transition-duration` on html/body
- **Expected:**
  - `transition-duration` is `0ms` or `0.01ms`

#### TC-5.5: Theme colors still change correctly
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Start in light mode
  2. Record background color
  3. Toggle to dark mode
  4. Record new background color
- **Expected:**
  - Colors are distinct between light and dark mode
  - Change is instant but complete

---

## AC6: Element Entrance Animations Become Instant

### Normal Motion State

#### TC-6.1: animate-reveal has 200ms animation
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Find element with `animate-reveal` class
  2. Get computed animation properties
- **Expected:**
  - `animation-duration` is `200ms`
  - Animation includes transform and opacity

#### TC-6.2: animate-fade-in has 200ms animation
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Find element with `animate-fade-in` class
  2. Get computed animation properties
- **Expected:**
  - `animation-duration` is `200ms`

### Reduced Motion State

#### TC-6.3: animate-reveal is instant
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Trigger appearance of element with `animate-reveal`
  2. Check computed `animation-duration`
- **Expected:**
  - `animation-duration` is `0.01ms` or `0s`
  - Element immediately at full opacity

#### TC-6.4: animate-fade-in is instant
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Trigger appearance of element with `animate-fade-in`
  2. Check computed `animation-duration`
- **Expected:**
  - `animation-duration` is `0.01ms` or `0s`
  - Element immediately at full opacity

#### TC-6.5: Elements immediately visible at full opacity
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Trigger entrance animation
  2. Immediately check opacity
- **Expected:**
  - Opacity is `1` (not transitioning from 0)

---

## AC7: Focus State Transitions Remain Instant

### Normal Motion State

#### TC-7.1: Focus ring appears instantly (baseline from Story 1.16)
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Tab to interactive element
  2. Check focus ring visibility immediately
- **Expected:**
  - Focus ring visible immediately
  - No transition animation (already instant per Story 1.16)

#### TC-7.2: Focus ring visible with correct outline
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Tab to interactive element
  2. Get computed `outline-color` and `outline-width`
- **Expected:**
  - `outline-color` is not transparent
  - `outline-width` is at least 2px

### Reduced Motion State

#### TC-7.3: Focus ring still appears instantly (no regression)
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Tab to interactive element
  2. Check focus ring visibility immediately
- **Expected:**
  - Focus ring visible immediately
  - Behavior identical to normal motion state

#### TC-7.4: Focus ring styling unchanged
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Tab to interactive element
  2. Get computed focus styles
- **Expected:**
  - `outline-color` matches normal motion state
  - `outline-width` matches normal motion state
  - No transition properties on outline

---

## AC8: Sidebar Collapse/Expand Becomes Instant

### Normal Motion State

#### TC-8.1: Sidebar collapse has width transition
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Record sidebar width (expanded)
  2. Trigger collapse
  3. Sample width at 50ms intervals
- **Expected:**
  - Width transitions over ~200ms (per Story 1.11)
  - Smooth animation between states

#### TC-8.2: Sidebar tooltip fade has animation
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Collapse sidebar
  2. Hover over icon to show tooltip
  3. Check tooltip transition
- **Expected:**
  - Tooltip fades in with animation (150ms)

### Reduced Motion State

#### TC-8.3: Sidebar collapse is instant
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Trigger sidebar collapse
  2. Immediately check width
- **Expected:**
  - Width change is instant
  - `transition-duration` is `0ms` or `0.01ms`

#### TC-8.4: Sidebar expand is instant
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Start with collapsed sidebar
  2. Trigger expand
  3. Immediately check width
- **Expected:**
  - Width change is instant

#### TC-8.5: Sidebar tooltip appears instantly
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Collapse sidebar
  2. Hover over icon
  3. Check tooltip visibility immediately
- **Expected:**
  - Tooltip visible immediately (no fade)
  - `transition-duration` on tooltip is `0ms` or `0.01ms`

---

## AC9: Modal Open/Close Becomes Instant

### Normal Motion State

#### TC-9.1: QuickCapture modal opens with animation
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Trigger QuickCapture modal open (Cmd+Space or click)
  2. Observe animation
- **Expected:**
  - Modal slides/fades in over ~200ms
  - Backdrop fades in

#### TC-9.2: CommandPalette modal opens with animation
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Trigger CommandPalette open (Cmd+K)
  2. Observe animation
- **Expected:**
  - Modal slides/fades in over ~200ms

### Reduced Motion State

#### TC-9.3: QuickCapture modal opens instantly
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Trigger QuickCapture modal open
  2. Immediately check modal visibility
- **Expected:**
  - Modal visible immediately
  - No slide or fade animation

#### TC-9.4: CommandPalette modal opens instantly
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Trigger CommandPalette open
  2. Immediately check modal visibility
- **Expected:**
  - Modal visible immediately
  - No slide or fade animation

#### TC-9.5: Modal backdrop appears instantly
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Open any modal
  2. Immediately check backdrop opacity
- **Expected:**
  - Backdrop at full opacity immediately
  - `transition-duration` is `0ms` or `0.01ms`

---

## AC10: Functionality Preserved Without Animation

### Normal Motion State

#### TC-10.1: All components functional with animations
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'no-preference'` emulated
- **Steps:**
  1. Test all interactive components
  2. Verify state changes work correctly
- **Expected:**
  - All functionality works as expected
  - Animations enhance but don't block interaction

### Reduced Motion State

#### TC-10.2: All interactive functionality works
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Toggle sidebar collapse/expand
  2. Open/close canvas
  3. Toggle theme
  4. Open/close modals
  5. Tab through interface
- **Expected:**
  - All state changes occur correctly
  - No functionality blocked by missing animation

#### TC-10.3: State changes are perceivable without animation
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Change StatusIndicator state
  2. Verify color change is visible
- **Expected:**
  - State color changes are instant but visible
  - User can perceive state change without motion

#### TC-10.4: VoiceOver announcements unaffected
- **Type:** E2E (Playwright)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Verify ARIA live regions exist
  2. Trigger status change
  3. Check live region updates
- **Expected:**
  - `[aria-live]` regions still present
  - `[role="status"]` elements still announce
  - No dependency on animation for announcements

#### TC-10.5: Contrast ratios unchanged
- **Type:** Accessibility Audit (Playwright axe)
- **Precondition:** `reducedMotion: 'reduce'` emulated
- **Steps:**
  1. Run axe accessibility audit
  2. Check color contrast violations
- **Expected:**
  - No new contrast violations
  - Contrast ratios same as with animations enabled

---

## useReducedMotion Hook Tests

### Unit Tests (Vitest)

#### TC-HOOK-1: Returns false when reduced motion not preferred
- **Type:** Unit
- **Steps:**
  1. Mock `matchMedia` to return `matches: false`
  2. Render hook
- **Expected:** Hook returns `false`

#### TC-HOOK-2: Returns true when reduced motion preferred
- **Type:** Unit
- **Steps:**
  1. Mock `matchMedia` to return `matches: true`
  2. Render hook
- **Expected:** Hook returns `true`

#### TC-HOOK-3: Updates when preference changes dynamically
- **Type:** Unit
- **Steps:**
  1. Mock `matchMedia` with `matches: false`
  2. Render hook
  3. Simulate change event with `matches: true`
- **Expected:**
  - Initial value is `false`
  - After change event, value is `true`

#### TC-HOOK-4: Cleans up event listener on unmount
- **Type:** Unit
- **Steps:**
  1. Render hook
  2. Unmount component
  3. Check `removeEventListener` was called
- **Expected:** `removeEventListener` called with `'change'` event

---

## Manual Testing Checklist

### macOS System Preferences Integration

- [ ] **MAN-1:** Enable macOS "Reduce motion" in System Preferences > Accessibility > Display
- [ ] **MAN-2:** Restart Orion application (or verify preference detected on reload)
- [ ] **MAN-3:** Verify StatusIndicator thinking state shows static gold dot (no pulse)
- [ ] **MAN-4:** Verify StatusIndicator acting state shows static gold dot (no spin)
- [ ] **MAN-5:** Verify StatusIndicator waiting state shows static blue dot (no pulse)
- [ ] **MAN-6:** Verify StatusIndicator idle state shows static green dot (unchanged)
- [ ] **MAN-7:** Open canvas panel - verify appears instantly (no slide)
- [ ] **MAN-8:** Close canvas panel - verify disappears instantly (no slide)
- [ ] **MAN-9:** Toggle light/dark theme - verify instant switch (no crossfade)
- [ ] **MAN-10:** Collapse sidebar - verify instant width change
- [ ] **MAN-11:** Expand sidebar - verify instant width change
- [ ] **MAN-12:** Hover collapsed sidebar icon - verify tooltip appears instantly
- [ ] **MAN-13:** Open QuickCapture modal (Cmd+Space) - verify instant appearance
- [ ] **MAN-14:** Close QuickCapture modal - verify instant disappearance
- [ ] **MAN-15:** Open CommandPalette (Cmd+K) - verify instant appearance
- [ ] **MAN-16:** Close CommandPalette (Escape) - verify instant disappearance
- [ ] **MAN-17:** Tab through interface - verify focus rings appear instantly
- [ ] **MAN-18:** Verify all interactive functionality still works correctly
- [ ] **MAN-19:** Enable VoiceOver (Cmd+F5) - verify all announcements work
- [ ] **MAN-20:** Verify contrast ratios unchanged (visual inspection)
- [ ] **MAN-21:** Disable macOS "Reduce motion" - verify all animations return
- [ ] **MAN-22:** Toggle "Reduce motion" while app is running - verify preference detected dynamically

---

## Test Implementation Files

| Test Type | File Path | Coverage |
|-----------|-----------|----------|
| Unit (Hook) | `tests/unit/hooks/useReducedMotion.test.ts` | TC-HOOK-1 to TC-HOOK-4 |
| E2E (Reduced) | `tests/e2e/a11y/reduced-motion.spec.ts` | TC-1.3 to TC-10.5 |
| E2E (Normal) | `tests/e2e/a11y/reduced-motion-control.spec.ts` | TC-1.1 to TC-10.1 |
| Visual | `tests/e2e/visual/status-indicator-reduced.spec.ts` | TC-2.5, TC-3.4 |

---

## Test Execution Commands

```bash
# Run all reduced motion tests
npm run test:e2e -- --grep "Reduced Motion"

# Run unit tests for hook
npm run test:unit -- useReducedMotion

# Run with reduced motion emulated
npx playwright test --project=chromium tests/e2e/a11y/reduced-motion.spec.ts

# Run accessibility audit with reduced motion
npx playwright test --project=chromium tests/e2e/a11y/ --grep "reduced"
```

---

## Playwright Configuration for Motion Testing

```typescript
// playwright.config.ts additions
{
  projects: [
    {
      name: 'reduced-motion',
      use: {
        ...devices['Desktop Chrome'],
        reducedMotion: 'reduce',
      },
    },
    {
      name: 'normal-motion',
      use: {
        ...devices['Desktop Chrome'],
        reducedMotion: 'no-preference',
      },
    },
  ],
}
```

---

## Definition of Done for Tests

1. [ ] All TC-* test cases implemented
2. [ ] All tests pass with `reducedMotion: 'reduce'` emulated
3. [ ] All tests pass with `reducedMotion: 'no-preference'` emulated
4. [ ] useReducedMotion hook has 100% unit test coverage
5. [ ] Manual checklist completed on macOS with actual System Preferences
6. [ ] No accessibility regressions from Story 1.16-1.18
7. [ ] Visual regression baselines captured for reduced motion state
8. [ ] CI pipeline includes reduced motion test configuration

---

## Dependencies from Prior Stories

| Story | Test Dependency |
|-------|-----------------|
| 1.3 | Animation token values to verify (200ms, 150ms, 100ms, 300ms) |
| 1.9 | StatusIndicator pulse (1500ms) and spin (1000ms) durations |
| 1.13 | Theme crossfade (200ms) baseline |
| 1.16 | Focus states already instant (regression check) |
| 1.17 | VoiceOver compatibility (must not regress) |
| 1.18 | Contrast ratios (must not regress) |
