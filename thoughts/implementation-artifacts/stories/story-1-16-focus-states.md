# Story 1.16: Focus States

Status: ready-for-dev

## Story

As a **user**,
I want visible focus indicators on all interactive elements,
So that I can navigate by keyboard (NFR-5.1).

## Acceptance Criteria

1. **Given** I am navigating with keyboard
   **When** I Tab to any interactive element (button, link, input, textarea, nav item)
   **Then** a 2px gold (#D4AF37) outline appears with 2px offset
   **And** the outline does not overlap with the element's content

2. **Given** I am using dark mode
   **When** I Tab to any interactive element
   **Then** the 2px gold outline is still clearly visible against the dark background
   **And** the focus indicator has the same styling as in light mode

3. **Given** I am navigating with keyboard
   **When** I Tab through the page
   **Then** focus order follows logical reading order (left-to-right, top-to-bottom)
   **And** focus never gets trapped in any component

4. **Given** I am using a mouse
   **When** I click on an interactive element
   **Then** the focus indicator does NOT appear for mouse clicks (focus-visible only)
   **And** the element still receives focus for accessibility purposes

5. **Given** I am in a modal or canvas overlay
   **When** I Tab through elements
   **Then** focus is trapped within the modal/canvas until closed
   **And** Esc key closes the modal and returns focus to the trigger element

6. **Given** I am navigating sidebar items
   **When** I use Arrow keys to move between nav items
   **Then** focus indicator is visible on the currently focused item
   **And** focus indicator uses the same 2px gold outline pattern

7. **Given** the focus indicator is visible
   **When** I observe the transition
   **Then** the focus indicator appears instantly (no animation delay)
   **And** the indicator has clean, sharp edges (0px border-radius matching Editorial Luxury)

8. **Given** I have prefers-reduced-motion enabled
   **When** focus changes between elements
   **Then** focus transitions are instant (no animation)
   **And** the focus indicator remains fully visible and functional

## Tasks / Subtasks

- [ ] Task 1: Audit existing focus states across all components (AC: #1, #2)
  - [ ] 1.1: Review Button component focus styles
  - [ ] 1.2: Review Input component focus styles
  - [ ] 1.3: Review Textarea component focus styles
  - [ ] 1.4: Review SidebarNavItem focus styles
  - [ ] 1.5: Review link/anchor element focus styles
  - [ ] 1.6: Document any inconsistencies with 2px gold outline pattern

- [ ] Task 2: Create unified focus ring utility class (AC: #1, #2, #7)
  - [ ] 2.1: Create `.focus-ring-gold` utility class in globals.css
  - [ ] 2.2: Implement `outline: 2px solid var(--orion-gold)` with `outline-offset: 2px`
  - [ ] 2.3: Ensure 0px border-radius on focus ring (sharp corners)
  - [ ] 2.4: Add Tailwind utility `focus-ring-orion` to tailwind config
  - [ ] 2.5: Test focus ring visibility in both light and dark modes

- [ ] Task 3: Implement focus-visible pattern (AC: #4)
  - [ ] 3.1: Use `:focus-visible` pseudo-class instead of `:focus` for outline
  - [ ] 3.2: Ensure `:focus` still sets focus state for accessibility (screen readers)
  - [ ] 3.3: Add polyfill for older browsers if needed (check browser support)
  - [ ] 3.4: Test mouse click vs keyboard Tab behavior

- [ ] Task 4: Apply consistent focus styles to Button component (AC: #1, #2, #4)
  - [ ] 4.1: Update primary button focus state to use focus-ring-gold
  - [ ] 4.2: Update secondary button focus state
  - [ ] 4.3: Update tertiary button focus state
  - [ ] 4.4: Update destructive button focus state (red outline for destructive)
  - [ ] 4.5: Ensure focus-visible pattern is used

- [ ] Task 5: Apply consistent focus styles to Input/Textarea components (AC: #1, #2, #4)
  - [ ] 5.1: Update Input component to use focus-ring-gold
  - [ ] 5.2: Update Textarea component to use focus-ring-gold
  - [ ] 5.3: Handle error state focus (red outline when invalid)
  - [ ] 5.4: Ensure icon-adorned inputs maintain focus visibility

- [ ] Task 6: Apply consistent focus styles to sidebar navigation (AC: #1, #3, #6)
  - [ ] 6.1: Update SidebarNavItem focus state
  - [ ] 6.2: Ensure arrow key navigation shows focus ring
  - [ ] 6.3: Verify focus order matches visual order
  - [ ] 6.4: Test Tab navigation into and out of sidebar

- [ ] Task 7: Apply focus styles to links and other interactive elements (AC: #1, #2)
  - [ ] 7.1: Style anchor/link elements with gold underline focus
  - [ ] 7.2: Style collapsible/expandable elements
  - [ ] 7.3: Style dropdown triggers and menu items
  - [ ] 7.4: Style any shadcn/ui components not yet covered

- [ ] Task 8: Implement focus trap for modals (AC: #5)
  - [ ] 8.1: Create useFocusTrap hook or use Radix FocusScope
  - [ ] 8.2: Apply focus trap to QuickCaptureModal (from Story 1.15)
  - [ ] 8.3: Apply focus trap to CommandPaletteModal (from Story 1.15)
  - [ ] 8.4: Apply focus trap to Canvas overlay (from Story 1.6)
  - [ ] 8.5: Ensure Esc key closes modal and restores focus

- [ ] Task 9: Verify logical focus order (AC: #3)
  - [ ] 9.1: Review HTML structure for natural tab order
  - [ ] 9.2: Add tabindex where needed for skip-navigation
  - [ ] 9.3: Ensure no elements have tabindex > 0 (anti-pattern)
  - [ ] 9.4: Test full page tab navigation sequence

- [ ] Task 10: Add reduced-motion support (AC: #8)
  - [ ] 10.1: Disable any focus transition animations in prefers-reduced-motion
  - [ ] 10.2: Verify focus indicator is still fully visible
  - [ ] 10.3: Test with macOS Reduce Motion setting enabled

- [ ] Task 11: Write unit tests for focus utilities
  - [ ] 11.1: Test focus-ring-gold utility class
  - [ ] 11.2: Test focus-visible behavior with keyboard events
  - [ ] 11.3: Test focus trap hook functionality

- [ ] Task 12: Write E2E tests for focus navigation
  - [ ] 12.1: Test Tab navigation through full page
  - [ ] 12.2: Test focus visibility in light mode
  - [ ] 12.3: Test focus visibility in dark mode
  - [ ] 12.4: Test focus trap in modals
  - [ ] 12.5: Test focus restoration after modal close
  - [ ] 12.6: Test sidebar arrow key navigation focus

## Dev Notes

### Architecture Compliance

**NFR-5.1 (Full Keyboard Navigation):**
- All actions reachable via keyboard
- Focus indicators visible on all interactive elements
- Logical tab order following reading flow

**NFR-5.3 (WCAG AA Contrast):**
- Gold (#D4AF37) on Cream (#FAF8F5) = 2.9:1 (passes AA for large text/graphics)
- Gold (#D4AF37) on Dark (#121212) = 4.4:1 (passes AA for large text/graphics)
- Focus indicator is a "graphical object" per WCAG, requiring 3:1 contrast

**Design System Reference:**
From UX Design Specification (ux-design-specification.md) - Focus States:

| Element | Focus Style |
|---------|-------------|
| Buttons | 2px gold outline, 2px offset |
| Inputs | Gold underline thickens |
| Cards | Subtle gold border |
| Links | Gold underline |

**Implementation Note:** Per Story 1.4 and Story 1.8, we established that ALL interactive elements use the `2px gold outline with 2px offset` pattern for consistency. The "gold underline thickens" for inputs was later unified to the outline pattern for better visibility and consistency.

### Focus Ring CSS Implementation

```css
/* src/app/globals.css */

/* Unified focus ring utility */
.focus-ring-gold:focus-visible {
  outline: 2px solid var(--orion-gold);
  outline-offset: 2px;
}

/* Remove default focus styles, rely on focus-visible */
.focus-ring-gold:focus {
  outline: none;
}

/* Error variant for destructive actions */
.focus-ring-error:focus-visible {
  outline: 2px solid var(--orion-error);
  outline-offset: 2px;
}

/* Reduced motion - ensure no transition delays */
@media (prefers-reduced-motion: reduce) {
  *:focus-visible {
    transition: none !important;
  }
}
```

### Tailwind Extension

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      // ... existing config
    },
  },
  plugins: [
    // Custom focus ring plugin
    function({ addUtilities }) {
      addUtilities({
        '.focus-ring-orion': {
          '&:focus-visible': {
            outline: '2px solid var(--orion-gold)',
            'outline-offset': '2px',
          },
          '&:focus': {
            outline: 'none',
          },
        },
        '.focus-ring-orion-error': {
          '&:focus-visible': {
            outline: '2px solid var(--orion-error)',
            'outline-offset': '2px',
          },
          '&:focus': {
            outline: 'none',
          },
        },
      });
    },
  ],
};
```

### Focus Trap Implementation

For modals, use Radix UI's built-in focus management or create a custom hook:

```tsx
// Option 1: Use Radix FocusScope (recommended if using shadcn/ui Dialog)
import * as FocusScope from '@radix-ui/react-focus-scope';

function Modal({ children, onClose }) {
  return (
    <FocusScope.Root trapped onEscapeKeyDown={onClose}>
      {children}
    </FocusScope.Root>
  );
}

// Option 2: Custom hook for non-Radix components
// src/hooks/useFocusTrap.ts
import { useEffect, useRef } from 'react';

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Get focusable elements
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = containerRef.current.querySelectorAll(focusableSelector);
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus first element
    firstElement?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift+Tab: if on first element, go to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: if on last element, go to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      previousFocusRef.current?.focus();
    };
  }, [isActive]);

  return containerRef;
}
```

### Focus Order Best Practices

1. **Use semantic HTML**: `<nav>`, `<main>`, `<aside>` establish landmarks
2. **Avoid positive tabindex**: Never use `tabindex="1"` or higher
3. **Use tabindex="0"**: Only for custom interactive elements
4. **Use tabindex="-1"**: For programmatically focusable but not tab-navigable elements
5. **Skip links**: Consider adding "Skip to main content" link for screen readers

### Visual Focus Ring Requirements

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Width | 2px | Visible but not overwhelming |
| Color | #D4AF37 (gold) | Brand color, good contrast |
| Offset | 2px | Prevents overlap with content |
| Border-radius | 0px | Editorial Luxury aesthetic |
| Transition | none | Instant visibility, reduced-motion safe |

### Dependencies on Prior Stories

| Story | Dependency |
|-------|------------|
| 1.3 | CSS Design Tokens (--orion-gold, --orion-error) |
| 1.4 | Sidebar component with keyboard navigation pattern |
| 1.7 | Button component hierarchy |
| 1.8 | Input field component |
| 1.13 | Dark mode token values |
| 1.15 | Modal components (QuickCapture, CommandPalette) requiring focus trap |

### Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useFocusTrap.ts` | Focus trap hook for modals (if not using Radix) |

### Files to Modify

| File | Change |
|------|--------|
| `src/app/globals.css` | Add focus-ring-gold utility class |
| `tailwind.config.ts` | Add focus-ring-orion plugin |
| `src/components/ui/button.tsx` | Apply focus-ring-orion utility |
| `src/components/ui/input.tsx` | Apply focus-ring-orion utility |
| `src/components/ui/textarea.tsx` | Apply focus-ring-orion utility |
| `src/components/sidebar/SidebarNavItem.tsx` | Apply focus-ring-orion utility |
| `src/components/modals/QuickCaptureModal.tsx` | Add focus trap |
| `src/components/modals/CommandPaletteModal.tsx` | Add focus trap |
| `src/components/layout/CanvasColumn.tsx` | Add focus trap when open |

### Testing Standards

**Unit Tests (Vitest):**

```typescript
// tests/unit/focus-states.test.ts
import { describe, it, expect } from 'vitest';

describe('Focus States', () => {
  it('applies gold outline on keyboard focus', async () => {
    // Render button, simulate Tab press, check computed styles
    const { getByRole } = render(<Button>Test</Button>);
    const button = getByRole('button');

    // Simulate keyboard focus
    await userEvent.tab();

    expect(button).toHaveFocus();
    expect(button).toHaveStyle({
      outline: '2px solid #D4AF37',
      outlineOffset: '2px',
    });
  });

  it('does NOT show focus ring on mouse click', async () => {
    const { getByRole } = render(<Button>Test</Button>);
    const button = getByRole('button');

    // Click with mouse
    await userEvent.click(button);

    expect(button).toHaveFocus();
    // focus-visible should NOT apply for mouse interaction
    expect(button).not.toHaveStyle({
      outline: '2px solid #D4AF37',
    });
  });
});
```

**E2E Tests (Playwright):**

```typescript
// tests/e2e/focus-states.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Focus States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Tab navigation shows visible focus ring', async ({ page }) => {
    // Tab to first focusable element
    await page.keyboard.press('Tab');

    // Check that focused element has gold outline
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Check computed style (approximate check)
    const outline = await focusedElement.evaluate(
      el => getComputedStyle(el).outline
    );
    expect(outline).toContain('rgb(212, 175, 55)'); // Gold in RGB
  });

  test('Focus order follows logical reading order', async ({ page }) => {
    const focusOrder: string[] = [];

    // Tab through all elements and record order
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.getAttribute('data-testid') || el?.tagName || 'unknown';
      });
      focusOrder.push(focused);
    }

    // Verify expected order (adjust based on actual page structure)
    // Sidebar should come before main content
    const sidebarIndex = focusOrder.findIndex(el => el.includes('sidebar'));
    const chatIndex = focusOrder.findIndex(el => el.includes('chat'));
    expect(sidebarIndex).toBeLessThan(chatIndex);
  });

  test('Focus is visible in dark mode', async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();

    // Tab to element
    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Gold should still be visible on dark background
    const outline = await focusedElement.evaluate(
      el => getComputedStyle(el).outline
    );
    expect(outline).toContain('rgb(212, 175, 55)');
  });

  test('Focus trapped in modal', async ({ page }) => {
    // Open command palette
    await page.keyboard.press('Meta+k');

    // Wait for modal
    await expect(page.locator('input[placeholder*="command"]')).toBeVisible();

    // Tab should stay within modal
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focus should still be within the modal
    const focusedParent = await page.evaluate(() => {
      return document.activeElement?.closest('[role="dialog"]') !== null;
    });
    expect(focusedParent).toBe(true);
  });

  test('Focus restored after modal close', async ({ page }) => {
    // Focus on a specific element first
    const chatInput = page.locator('textarea[placeholder*="Message"]');
    await chatInput.focus();

    // Open and close command palette
    await page.keyboard.press('Meta+k');
    await expect(page.locator('input[placeholder*="command"]')).toBeVisible();
    await page.keyboard.press('Escape');

    // Focus should return to chat input
    await expect(chatInput).toBeFocused();
  });

  test('Sidebar arrow key navigation shows focus', async ({ page }) => {
    // Focus sidebar
    const firstNavItem = page.locator('[data-testid="sidebar-nav-item"]').first();
    await firstNavItem.focus();

    // Use arrow down
    await page.keyboard.press('ArrowDown');

    // Check second item is focused
    const secondNavItem = page.locator('[data-testid="sidebar-nav-item"]').nth(1);
    await expect(secondNavItem).toBeFocused();

    // Should have gold outline
    const outline = await secondNavItem.evaluate(
      el => getComputedStyle(el).outline
    );
    expect(outline).toContain('rgb(212, 175, 55)');
  });
});
```

### UX Specification Reference

From UX Design Specification (ux-design-specification.md) - Visual Design Foundation:

**Focus States:**

| Element | Focus Style |
|---------|-------------|
| Buttons | 2px gold outline, 2px offset |
| Inputs | Gold underline thickens |
| Cards | Subtle gold border |
| Links | Gold underline |

**Accessibility:**
- Contrast ratios meet WCAG AA (black on cream = 14:1)
- Focus states visible for keyboard users
- `prefers-reduced-motion` supported (disable pulse animations)
- Error states use text explanations, not color alone

### References

- [Source: thoughts/planning-artifacts/epics.md#Story 1.16: Focus States]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Focus States]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Accessibility]
- [Source: thoughts/planning-artifacts/architecture.md#NFR-5.1]
- [Source: .ralph/story-chain.md#Story 1.15: Global Keyboard Shortcuts]

## Story Chain Context

### Prior Decisions to Honor

From **Story 1.4 (Sidebar Column)**:
- Focus state pattern established: 2px gold outline with 2px offset
- Keyboard navigation within sidebar using Arrow keys
- Touch targets: 44x44px minimum via padding expansion

From **Story 1.7 (Button Component Hierarchy)**:
- Button focus states: 2px outline, 2px offset, gold/red based on variant
- State animation: 100ms ease for hover/active transitions

From **Story 1.8 (Input Field Component)**:
- Input focus states: 2px gold outline, 2px offset (unified with buttons)
- Error state: Red border with matching focus ring

From **Story 1.13 (Dark Mode - System Detection)**:
- Dark mode token values defined
- Constant brand colors: Gold (#D4AF37) unchanged in both modes
- Theme transition: 200ms crossfade (not for focus states)

From **Story 1.15 (Global Keyboard Shortcuts)**:
- QuickCaptureModal and CommandPaletteModal exist as placeholder components
- Focus should return to previous element when modal closes (partial implementation)
- KeyboardShortcutProvider manages modal open/close state

### What This Story Establishes

1. **Unified Focus Ring Pattern:** `.focus-ring-gold` / `.focus-ring-orion` utility for all components
2. **Focus-Visible Pattern:** Only show focus ring on keyboard navigation, not mouse clicks
3. **Focus Trap Pattern:** Full focus trap implementation for modals using useFocusTrap hook or Radix FocusScope
4. **Focus Restoration Pattern:** Proper focus return when closing modals/overlays
5. **Logical Tab Order:** Verified and documented focus sequence through the application
6. **Dark Mode Compatibility:** Focus ring tested and visible in both light and dark modes

### Patterns Introduced

| Pattern | Description |
|---------|-------------|
| Unified Focus Ring | `.focus-ring-orion` utility class for 2px gold outline, 2px offset |
| Focus-Visible Only | Use `:focus-visible` instead of `:focus` for visual outline |
| Focus Trap Hook | `useFocusTrap(isActive)` returns containerRef with trapped focus |
| Focus Restoration | Store previousFocus, restore on modal close |
| Reduced Motion Focus | Instant focus transitions when prefers-reduced-motion enabled |

### Notes for Next Story (1.17: VoiceOver Support)

- All interactive elements now have visible focus states
- ARIA roles and labels should be added for screen reader support
- Landmarks (navigation, main, complementary) need proper labeling
- Dynamic content changes need ARIA live regions
- Focus states established here work well with VoiceOver focus tracking

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
