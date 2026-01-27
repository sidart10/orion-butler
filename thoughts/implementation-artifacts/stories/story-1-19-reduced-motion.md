# Story 1.19: Reduced Motion

**Status:** ready-for-dev
**Epic:** 1 - Application Shell & First Launch
**Created:** 2026-01-24
**Updated:** 2026-01-24

---

## Story Definition

### User Story

As a **user with motion sensitivity**,
I want animations to respect my system preference,
So that I'm not disoriented by motion.

### Description

This story implements comprehensive `prefers-reduced-motion` support across the Orion application. When macOS "Reduce motion" accessibility setting is enabled, all animations are replaced with instant transitions or subtle fades. This builds on the animation tokens established in Story 1.3 and ensures all animated components from Stories 1.4-1.18 properly respect the user's motion preference.

The implementation follows WCAG 2.1 Success Criterion 2.3.3 (Animation from Interactions) which recommends motion be disabled for users who request it. Orion will detect the system preference automatically and apply appropriate alternatives without user configuration.

### Acceptance Criteria

```gherkin
Feature: Reduced Motion Support
  As a user with motion sensitivity
  I want animations to respect my system preference
  So that I'm not disoriented by motion

  Background:
    Given the Orion application is running
    And all animated components from Stories 1.1-1.18 are implemented

  Scenario: Detect macOS "Reduce motion" system preference
    Given macOS "Reduce motion" is enabled in Accessibility settings
    When the app starts or preference changes
    Then the app detects prefers-reduced-motion: reduce
    And all animations are replaced with instant transitions

  Scenario: StatusIndicator pulse animation disabled
    Given macOS "Reduce motion" is enabled
    When a StatusIndicator has 'thinking' or 'waiting' state
    Then the pulse animation is replaced with a static indicator
    And the state color is still visible (gold for thinking, blue for waiting)

  Scenario: StatusIndicator spin animation disabled
    Given macOS "Reduce motion" is enabled
    When a StatusIndicator has 'acting' state
    Then the spin animation is replaced with a static gold indicator
    And the indicator remains visible without rotation

  Scenario: Canvas slide transitions become instant
    Given macOS "Reduce motion" is enabled
    When a canvas panel opens or closes
    Then the 300ms slide animation is replaced with instant show/hide
    And the opacity transition is also instant (no fade)

  Scenario: Theme switch crossfade becomes instant
    Given macOS "Reduce motion" is enabled
    When the user switches between light and dark mode
    Then the 200ms crossfade transition is replaced with instant change
    And there is no visible animation between themes

  Scenario: Element entrance animations become instant
    Given macOS "Reduce motion" is enabled
    When any element uses animate-reveal or animate-fade-in
    Then the animation is replaced with instant appearance
    And the element is immediately visible at full opacity

  Scenario: Focus state transitions remain instant
    Given macOS "Reduce motion" is enabled
    When I tab to an interactive element
    Then the focus ring appears instantly
    And no transition animation occurs
    Note: Focus states are already instant per Story 1.16

  Scenario: Sidebar collapse/expand becomes instant
    Given macOS "Reduce motion" is enabled
    When the sidebar collapses to icon-only mode
    Then the width transition is instant
    And tooltip animations are also instant

  Scenario: Modal open/close becomes instant
    Given macOS "Reduce motion" is enabled
    When a modal (QuickCapture, CommandPalette) opens or closes
    Then the slide/fade animation is replaced with instant show/hide

  Scenario: Functionality preserved without animation
    Given macOS "Reduce motion" is enabled
    When I interact with any animated component
    Then all functionality works correctly
    And only the animation is removed, not the state change
    And VoiceOver announcements are unaffected
    And contrast ratios are unaffected
```

---

## Technical Requirements

### Dependencies

| Story | Dependency Type | What It Provides |
|-------|----------------|------------------|
| 1.3 | Required | Animation tokens: --orion-anim-entrance, --orion-anim-exit, --orion-anim-state, --orion-anim-canvas |
| 1.6 | Required | Canvas column with 300ms slide transition |
| 1.9 | Required | StatusIndicator with pulse (1500ms) and spin (1000ms) animations |
| 1.11 | Required | Sidebar collapse animation |
| 1.13 | Required | Theme switch 200ms crossfade transition |
| 1.15 | Required | Modal open/close animations |
| 1.16 | Required | Focus states (already instant, validates no regression) |
| 1.17 | Required | VoiceOver support (must not be affected by reduced motion) |
| 1.18 | Required | Touch targets and contrast (must not be affected by reduced motion) |

### Architecture Decisions

#### Decision 1: CSS Media Query Approach

**Pattern:** Use `@media (prefers-reduced-motion: reduce)` CSS media query as primary implementation

**Rationale:**
- Pure CSS solution requires no JavaScript runtime detection
- Applies immediately on page load (no flash of animated content)
- Browser handles preference change detection automatically
- Consistent with Story 1.13 system detection pattern for dark mode

**Implementation:**
```css
/* In globals.css */
@media (prefers-reduced-motion: reduce) {
  /* Disable all animations and transitions */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

#### Decision 2: Tailwind Variant Integration

**Pattern:** Add `motion-safe:` and `motion-reduce:` variants to Tailwind config

**Rationale:**
- Enables component-level control for specific reduced-motion alternatives
- Follows Tailwind best practices
- Allows gradual migration of inline animation styles

**Implementation:**
```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      // Existing tokens
    }
  },
  // motion-safe and motion-reduce are built-in Tailwind variants
}
```

Usage:
```jsx
<div className="motion-safe:animate-pulse motion-reduce:animate-none">
```

#### Decision 3: Selective Animation Alternatives

**Pattern:** Replace animations with appropriate static alternatives, not complete removal

**Rationale:** Some animations provide meaningful feedback. When motion is reduced:
- Pulse animations -> Static indicator with visible state color
- Spin animations -> Static indicator (no rotation)
- Slide transitions -> Instant opacity (0 or 1)
- Fade animations -> Instant opacity change

**Key principle:** State changes must still be perceivable, just without motion.

---

### Animation Inventory

Components requiring reduced motion support:

| Component | Animation | Duration | Reduced Motion Alternative |
|-----------|-----------|----------|---------------------------|
| StatusIndicator | Pulse (thinking, waiting) | 1500ms | Static indicator, visible color |
| StatusIndicator | Spin (acting) | 1000ms | Static indicator |
| CanvasColumn | Slide open/close | 300ms | Instant width/opacity |
| Theme switch | Crossfade | 200ms | Instant color change |
| Sidebar | Collapse/expand | 200ms | Instant width change |
| Sidebar tooltips | Fade in | 150ms | Instant show |
| Modals | Slide in/fade | 200ms | Instant show |
| Backdrop | Fade in | 200ms | Instant opacity |
| animate-reveal | Translate + opacity | 200ms | Instant opacity: 1 |
| animate-fade-in | Opacity | 200ms | Instant opacity: 1 |
| Button hover | Background slide | 100ms | Instant background change |

---

## Implementation Plan

### Phase 1: Global Reduced Motion Foundation

1. **Update globals.css with reduced motion media query**
   ```css
   /* src/app/globals.css */

   /* Reduced motion: respect user preference */
   @media (prefers-reduced-motion: reduce) {
     /* Global animation/transition override */
     *,
     *::before,
     *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }

     /* Remove specific keyframe animations */
     .animate-pulse,
     .animate-spin {
       animation: none !important;
     }
   }
   ```

2. **Create motion-aware animation tokens**
   ```css
   /* Animation tokens that respect reduced motion */
   :root {
     --orion-anim-entrance: 200ms;
     --orion-anim-exit: 150ms;
     --orion-anim-state: 100ms;
     --orion-anim-canvas: 300ms;
   }

   @media (prefers-reduced-motion: reduce) {
     :root {
       --orion-anim-entrance: 0ms;
       --orion-anim-exit: 0ms;
       --orion-anim-state: 0ms;
       --orion-anim-canvas: 0ms;
     }
   }
   ```

### Phase 2: Component-Specific Updates

1. **StatusIndicator reduced motion support**
   ```typescript
   // src/components/ui/status-indicator.tsx

   // Add motion-safe variants
   const pulseClass = cn(
     'rounded-full',
     'motion-safe:animate-pulse',
     'motion-reduce:animate-none',
     colorClasses[state]
   );

   const spinClass = cn(
     'rounded-full',
     'motion-safe:animate-spin',
     'motion-reduce:animate-none',
     colorClasses[state]
   );
   ```

2. **CanvasColumn instant transition**
   ```typescript
   // src/components/layout/CanvasColumn.tsx

   // Use CSS variable for transition duration
   const transitionStyle = {
     transition: `width var(--orion-anim-canvas), opacity var(--orion-anim-canvas)`,
     transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
   };
   // Duration automatically becomes 0ms when reduced motion is active
   ```

3. **Theme transition update**
   ```css
   /* Already in globals.css from Story 1.13 */
   /* Reduced motion override already handles theme transitions */
   ```

4. **Sidebar collapse animation**
   ```typescript
   // src/components/sidebar/Sidebar.tsx

   // Use animation token variable
   const sidebarStyle = {
     transition: `width var(--orion-anim-state)`,
   };
   ```

5. **Modal animations**
   ```typescript
   // src/components/modals/QuickCaptureModal.tsx
   // src/components/modals/CommandPaletteModal.tsx

   // Use animation token variables
   const modalTransition = {
     transition: `opacity var(--orion-anim-entrance), transform var(--orion-anim-entrance)`,
   };
   ```

### Phase 3: React Hook for Programmatic Detection

For cases requiring JavaScript awareness of motion preference:

```typescript
// src/hooks/useReducedMotion.ts
import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}
```

**Usage:**
```typescript
const reducedMotion = useReducedMotion();

// Use for programmatic animation decisions
if (!reducedMotion) {
  startAnimation();
}
```

### Phase 4: Testing & Validation

1. **Create E2E tests for reduced motion**
2. **Validate with macOS accessibility settings**
3. **Ensure no functionality loss when animations disabled**

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useReducedMotion.ts` | React hook for programmatic motion preference detection |
| `tests/e2e/a11y/reduced-motion.spec.ts` | E2E tests for reduced motion behavior |
| `tests/unit/hooks/useReducedMotion.test.ts` | Unit tests for the hook |

## Files to Modify

| File | Change |
|------|--------|
| `src/app/globals.css` | Add @media (prefers-reduced-motion: reduce) rules |
| `src/components/ui/status-indicator.tsx` | Add motion-safe/motion-reduce variants |
| `src/components/layout/CanvasColumn.tsx` | Use animation token variables |
| `src/components/sidebar/Sidebar.tsx` | Use animation token variables for collapse |
| `src/components/modals/QuickCaptureModal.tsx` | Use animation token variables |
| `src/components/modals/CommandPaletteModal.tsx` | Use animation token variables |
| `src/components/navigation/HamburgerMenu.tsx` | Use animation token variables |
| `src/components/settings/ThemeSelector.tsx` | Ensure transition respects reduced motion |
| `tailwind.config.ts` | Verify motion-safe/motion-reduce variants enabled |

---

## Test Cases

### Unit Tests

```typescript
// src/hooks/__tests__/useReducedMotion.test.ts
import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from '../useReducedMotion';

describe('useReducedMotion', () => {
  let mockMatchMedia: jest.Mock;

  beforeEach(() => {
    mockMatchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    window.matchMedia = mockMatchMedia;
  });

  it('returns false when reduced motion is not preferred', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when reduced motion is preferred', () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when preference changes', () => {
    let changeHandler: (event: MediaQueryListEvent) => void;

    mockMatchMedia.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn((event, handler) => {
        changeHandler = handler;
      }),
      removeEventListener: jest.fn(),
    }));

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      changeHandler({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });

  it('cleans up event listener on unmount', () => {
    const removeEventListener = jest.fn();
    mockMatchMedia.mockImplementation(() => ({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener,
    }));

    const { unmount } = renderHook(() => useReducedMotion());
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
```

### E2E Tests

```typescript
// tests/e2e/a11y/reduced-motion.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Reduced Motion', () => {
  test.beforeEach(async ({ page }) => {
    // Enable reduced motion via Playwright
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('StatusIndicator shows static indicator when reduced motion enabled', async ({ page }) => {
    await page.goto('/');

    // Find a status indicator with thinking state
    const indicator = page.locator('[data-testid="status-indicator"][data-state="thinking"]');

    if (await indicator.count() > 0) {
      // Verify no animation is applied
      const animationName = await indicator.evaluate(el => {
        return window.getComputedStyle(el).animationName;
      });

      expect(animationName).toBe('none');
    }
  });

  test('Canvas opens instantly without slide animation', async ({ page }) => {
    await page.goto('/');

    // Trigger canvas open (implementation-dependent)
    // This test validates the canvas appears without waiting for animation
    const canvas = page.locator('[data-testid="canvas-column"]');

    // Check transition duration is effectively 0
    const transitionDuration = await canvas.evaluate(el => {
      return window.getComputedStyle(el).transitionDuration;
    });

    // Should be '0s' or '0.01ms' (near-instant)
    expect(parseFloat(transitionDuration)).toBeLessThan(0.1);
  });

  test('Theme switch happens instantly without crossfade', async ({ page }) => {
    await page.goto('/');

    // Get initial background color
    const initialBg = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).backgroundColor;
    });

    // Toggle theme
    await page.evaluate(() => {
      document.documentElement.classList.toggle('dark');
    });

    // Immediately check color changed (no waiting for transition)
    const newBg = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).backgroundColor;
    });

    expect(newBg).not.toBe(initialBg);
  });

  test('All animation durations are near-zero with reduced motion', async ({ page }) => {
    await page.goto('/');

    // Check CSS custom property values
    const animEntrance = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--orion-anim-entrance').trim();
    });

    const animCanvas = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--orion-anim-canvas').trim();
    });

    expect(animEntrance).toBe('0ms');
    expect(animCanvas).toBe('0ms');
  });

  test('Focus states work correctly with reduced motion', async ({ page }) => {
    await page.goto('/');

    // Tab to first focusable element
    await page.keyboard.press('Tab');

    // Focus ring should be visible (instant, as per Story 1.16)
    const focusedElement = page.locator(':focus-visible');
    const outlineColor = await focusedElement.evaluate(el => {
      return window.getComputedStyle(el).outlineColor;
    });

    expect(outlineColor).not.toBe('transparent');
  });

  test('VoiceOver announcements work with reduced motion', async ({ page }) => {
    await page.goto('/');

    // Verify ARIA live regions still exist
    const liveRegions = await page.locator('[aria-live]').count();
    expect(liveRegions).toBeGreaterThan(0);

    // Verify status announcements work
    const statusRegion = page.locator('[role="status"]');
    expect(await statusRegion.count()).toBeGreaterThan(0);
  });

  test('Functionality preserved without animation', async ({ page }) => {
    await page.goto('/');

    // Test sidebar toggle still works
    const sidebarToggle = page.locator('[data-testid="sidebar-toggle"]');
    if (await sidebarToggle.count() > 0) {
      await sidebarToggle.click();

      // Verify sidebar state changed (implementation-dependent)
      const sidebar = page.locator('[data-testid="sidebar"]');
      // Check some attribute or class that indicates collapsed state
    }
  });
});

test.describe('No Reduced Motion (Control)', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure reduced motion is NOT enabled
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  });

  test('Animations are active when reduced motion not preferred', async ({ page }) => {
    await page.goto('/');

    // Check animation tokens have non-zero values
    const animEntrance = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--orion-anim-entrance').trim();
    });

    expect(animEntrance).toBe('200ms');
  });

  test('StatusIndicator pulse animation is active', async ({ page }) => {
    await page.goto('/');

    const indicator = page.locator('[data-testid="status-indicator"][data-state="thinking"]');

    if (await indicator.count() > 0) {
      const animationName = await indicator.evaluate(el => {
        return window.getComputedStyle(el).animationName;
      });

      // Should have some animation name (not 'none')
      expect(animationName).not.toBe('none');
    }
  });
});
```

### Manual Testing Checklist

- [ ] Enable macOS "Reduce motion" in System Preferences > Accessibility > Display
- [ ] Verify StatusIndicator thinking state shows static gold dot (no pulse)
- [ ] Verify StatusIndicator acting state shows static gold dot (no spin)
- [ ] Verify StatusIndicator waiting state shows static blue dot (no pulse)
- [ ] Verify canvas panel appears instantly (no slide animation)
- [ ] Verify canvas panel closes instantly (no slide animation)
- [ ] Toggle theme and verify instant switch (no crossfade)
- [ ] Toggle sidebar and verify instant collapse (no width animation)
- [ ] Open QuickCapture modal and verify instant appearance
- [ ] Close modal and verify instant disappearance
- [ ] Tab through interface - focus rings appear instantly
- [ ] Verify all interactive functionality still works correctly
- [ ] Verify VoiceOver announcements still work
- [ ] Verify contrast ratios unchanged from Story 1.18
- [ ] Disable macOS "Reduce motion" and verify animations return

---

## Design Decisions

### Global Override vs. Component-by-Component

**Decision:** Use global `@media (prefers-reduced-motion: reduce)` override

**Rationale:**
- Catches all animations automatically, including third-party
- No risk of missing a component
- Simpler maintenance - single source of truth
- Component-specific overrides only needed for meaningful alternatives

### Animation Alternatives

| Original Animation | Reduced Motion Alternative | Rationale |
|-------------------|---------------------------|-----------|
| Pulse (opacity + scale) | Static at full opacity | State color still communicates status |
| Spin (360deg rotation) | Static indicator | State is conveyed by color, not motion |
| Slide (translateX/Y) | Instant opacity: 1 | Element appears immediately |
| Crossfade (opacity transition) | Instant opacity change | Theme switch is instantaneous |
| Scale (transform: scale) | No transform, full size | Element visible immediately |

### Animation Token Strategy

Animation tokens (`--orion-anim-*`) are set to 0ms in reduced motion context. This means:
- Components using these variables automatically respect the preference
- No component code changes needed for basic compliance
- Consistent behavior across all animated elements

### prefers-reduced-motion Support Level

**Target:** Full support for `prefers-reduced-motion: reduce`

**Behavior:**
- `reduce` - All motion disabled, instant transitions
- `no-preference` (default) - Full animations enabled

---

## Dependencies on This Story

| Future Story | What This Provides |
|--------------|-------------------|
| 1.20+ | Reduced motion pattern for any future animated components |
| Epic 2+ | Streaming responses must respect reduced motion |
| All UI stories | Motion accessibility baseline |

---

## Notes for Next Story

Story 1.19 completes the accessibility stories in Epic 1. The next story (1.20 or Epic 2) should:
- Ensure any new animations follow the reduced motion pattern
- Use animation token variables for all transitions
- Add `motion-safe:` / `motion-reduce:` variants where needed
- Test with macOS "Reduce motion" enabled

---

## Story Progress

### Checklist

- [ ] Global reduced motion media query added to globals.css
- [ ] Animation token variables update to 0ms in reduced motion
- [ ] StatusIndicator pulse animation has reduced motion alternative
- [ ] StatusIndicator spin animation has reduced motion alternative
- [ ] CanvasColumn uses animation token variables
- [ ] Sidebar collapse uses animation token variables
- [ ] Theme switch respects reduced motion (from Story 1.13)
- [ ] Modal animations use animation token variables
- [ ] useReducedMotion hook created for programmatic detection
- [ ] Unit tests for useReducedMotion hook pass
- [ ] E2E tests for reduced motion behavior pass
- [ ] Manual testing with macOS "Reduce motion" completed
- [ ] Verify no functionality loss with animations disabled
- [ ] Verify VoiceOver still works correctly
- [ ] Verify contrast ratios unchanged
- [ ] Documentation updated

---

## Definition of Done

1. All animations respect `prefers-reduced-motion: reduce` system preference
2. StatusIndicator pulse and spin animations replaced with static alternatives
3. Canvas 300ms slide transition becomes instant
4. Theme 200ms crossfade becomes instant
5. All entrance animations (animate-reveal, animate-fade-in) become instant
6. Sidebar and modal animations become instant
7. Animation token variables set to 0ms when reduced motion preferred
8. useReducedMotion hook available for programmatic detection
9. All functionality preserved without animation
10. VoiceOver support unaffected
11. Contrast ratios unaffected
12. E2E tests pass with reduced motion emulated
13. Manual testing completed with macOS accessibility setting

---

## References

### Requirements Traceability

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| FR-10.8 | WCAG AA accessibility | prefers-reduced-motion support |
| NFR-5.1 | Keyboard navigation | Focus states instant (no regression) |
| NFR-5.2 | VoiceOver compatibility | Announcements unaffected by reduced motion |

### Source Documents

- UX Design Specification: Section "Animation Timing" (lines 916-928) - defines animation durations
- UX Design Specification: Section "Accessibility" (lines 967-972) - mentions prefers-reduced-motion
- UX Design Specification: Section "Canvas Accessibility" (lines 1635-1641) - prefers-reduced-motion disables slide animations
- Architecture.md: Accessibility requirements in Accessibility Strategy section
- Story 1.3: Animation tokens (200ms entrance, 150ms exit, 100ms state change, 300ms canvas)
- Story 1.9: StatusIndicator animations (pulse 1500ms, spin 1000ms)
- Story 1.13: Theme transition 200ms crossfade with prefers-reduced-motion: reduce instant

### Design Resources

| Resource | Link |
|----------|------|
| WCAG 2.1 Success Criterion 2.3.3 | Animation from Interactions (AAA) |
| MDN prefers-reduced-motion | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion |
| Apple HIG - Motion | https://developer.apple.com/design/human-interface-guidelines/motion |
| Tailwind motion variants | https://tailwindcss.com/docs/hover-focus-and-other-states#prefers-reduced-motion |
