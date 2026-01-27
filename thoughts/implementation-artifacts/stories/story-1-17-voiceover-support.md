# Story 1.17: VoiceOver Support

Status: ready-for-dev

## Story

As a **user with visual impairment**,
I want the app to work with VoiceOver,
So that I can use Orion with a screen reader (NFR-5.2).

## Acceptance Criteria

1. **Given** VoiceOver is enabled on macOS
   **When** I navigate the app using VoiceOver
   **Then** all interactive elements (buttons, links, inputs) have accessible names
   **And** VoiceOver announces the element type and state (e.g., "Inbox, button", "Send message, text field")

2. **Given** VoiceOver is enabled on macOS
   **When** I navigate the app
   **Then** landmarks (navigation, main, complementary) are properly labeled
   **And** VoiceOver announces "Sidebar navigation" for the sidebar
   **And** VoiceOver announces "Main content" for the chat area
   **And** VoiceOver announces "Canvas panel" for the canvas column

3. **Given** VoiceOver is enabled on macOS
   **When** dynamic content changes occur (new message, status update)
   **Then** the changes are announced via ARIA live regions
   **And** new chat messages are announced to the user
   **And** status indicator changes are announced (e.g., "Working", "Complete")

4. **Given** VoiceOver is enabled on macOS
   **When** I navigate the sidebar navigation items
   **Then** VoiceOver reads the item label, count, and active state
   **And** the current item is identified (e.g., "Inbox, 12 items, current section")
   **And** arrow key navigation is announced correctly

5. **Given** VoiceOver is enabled on macOS
   **When** I focus on a button with a state
   **Then** VoiceOver announces the state (disabled, expanded, pressed)
   **And** toggle buttons announce their current state (e.g., "Sidebar toggle, collapsed")

6. **Given** VoiceOver is enabled on macOS
   **When** I focus on an input field
   **Then** VoiceOver announces the label, placeholder text (if no value), and any error messages
   **And** required fields are indicated
   **And** character limits are announced when approaching the limit

7. **Given** VoiceOver is enabled on macOS
   **When** I focus on the chat input
   **Then** VoiceOver announces "Message to Orion, text field"
   **And** the send shortcut hint is accessible (Cmd+Enter to send)

8. **Given** VoiceOver is enabled on macOS
   **When** streaming text is being received
   **Then** the text is announced progressively (not character-by-character)
   **And** the announcement does not interrupt user navigation
   **And** "Response complete" is announced when streaming finishes

9. **Given** VoiceOver is enabled on macOS
   **When** a modal or overlay opens
   **Then** VoiceOver announces the modal title/purpose
   **And** focus moves to the first focusable element in the modal
   **And** "Dialog" role is announced

10. **Given** VoiceOver is enabled on macOS
    **When** I use rotor navigation (VO+U)
    **Then** headings, landmarks, and links are properly grouped
    **And** heading levels are semantically correct (h1 > h2 > h3)

## Tasks / Subtasks

- [ ] Task 1: Audit and add ARIA labels to all interactive elements (AC: #1)
  - [ ] 1.1: Add aria-label to Button components without visible text labels
  - [ ] 1.2: Add aria-label to icon-only buttons (hamburger menu, close buttons)
  - [ ] 1.3: Verify Input components have associated labels (htmlFor or aria-labelledby)
  - [ ] 1.4: Add aria-label to Textarea/ChatInput component
  - [ ] 1.5: Ensure all links have descriptive text or aria-label

- [ ] Task 2: Implement landmark regions (AC: #2)
  - [ ] 2.1: Add role="navigation" and aria-label="Sidebar navigation" to Sidebar
  - [ ] 2.2: Add role="main" and aria-label="Main content" to ChatColumn
  - [ ] 2.3: Add role="complementary" and aria-label="Canvas panel" to CanvasColumn
  - [ ] 2.4: Add role="banner" to header/titlebar if present
  - [ ] 2.5: Add role="contentinfo" to footer if present
  - [ ] 2.6: Verify landmarks are exposed correctly in VoiceOver rotor

- [ ] Task 3: Implement ARIA live regions for dynamic content (AC: #3, #8)
  - [ ] 3.1: Add aria-live="polite" to MessageArea for new messages
  - [ ] 3.2: Add aria-live="assertive" for error messages
  - [ ] 3.3: Implement aria-busy for streaming content area
  - [ ] 3.4: Create announcement component for status changes
  - [ ] 3.5: Add aria-live="polite" to StatusIndicator component
  - [ ] 3.6: Implement "Response complete" announcement

- [ ] Task 4: Enhance sidebar navigation accessibility (AC: #4)
  - [ ] 4.1: Add aria-current="page" to active sidebar item
  - [ ] 4.2: Add aria-describedby for item counts (e.g., "12 items")
  - [ ] 4.3: Ensure nav items have proper role="listitem" within role="list"
  - [ ] 4.4: Add aria-expanded for collapsible sections
  - [ ] 4.5: Test arrow key navigation with VoiceOver

- [ ] Task 5: Add button state announcements (AC: #5)
  - [ ] 5.1: Add aria-disabled="true" for disabled buttons
  - [ ] 5.2: Add aria-pressed for toggle buttons (sidebar toggle)
  - [ ] 5.3: Add aria-expanded for buttons controlling expandable content
  - [ ] 5.4: Add aria-haspopup for dropdown trigger buttons

- [ ] Task 6: Enhance input field accessibility (AC: #6)
  - [ ] 6.1: Ensure all inputs have visible or screen-reader-only labels
  - [ ] 6.2: Add aria-required="true" for required fields
  - [ ] 6.3: Add aria-invalid="true" and aria-describedby for error states
  - [ ] 6.4: Implement character count announcements at thresholds
  - [ ] 6.5: Add aria-placeholder if placeholder text provides additional context

- [ ] Task 7: Enhance chat input accessibility (AC: #7)
  - [ ] 7.1: Add aria-label="Message to Orion" to ChatInput
  - [ ] 7.2: Add aria-describedby linking to shortcut hint
  - [ ] 7.3: Create visually-hidden shortcut hint "Press Command Enter to send"
  - [ ] 7.4: Ensure textarea announces multi-line capability

- [ ] Task 8: Implement streaming content accessibility (AC: #8)
  - [ ] 8.1: Add aria-live="polite" to AssistantMessage component
  - [ ] 8.2: Set aria-busy="true" during streaming, "false" when complete
  - [ ] 8.3: Implement debounced announcements for streaming text
  - [ ] 8.4: Add "Response complete" announcement via live region
  - [ ] 8.5: Test announcement timing to avoid interrupting user

- [ ] Task 9: Enhance modal accessibility (AC: #9)
  - [ ] 9.1: Add role="dialog" to all modals
  - [ ] 9.2: Add aria-modal="true" to modals
  - [ ] 9.3: Add aria-labelledby pointing to modal title
  - [ ] 9.4: Add aria-describedby for modal description if present
  - [ ] 9.5: Verify QuickCaptureModal announces correctly
  - [ ] 9.6: Verify CommandPaletteModal announces correctly
  - [ ] 9.7: Verify Canvas overlay announces correctly

- [ ] Task 10: Implement proper heading structure (AC: #10)
  - [ ] 10.1: Audit existing heading levels for semantic correctness
  - [ ] 10.2: Ensure only one h1 per page/view
  - [ ] 10.3: Ensure heading levels don't skip (no h1 > h3)
  - [ ] 10.4: Add appropriate headings to sidebar sections
  - [ ] 10.5: Add headings to canvas content areas
  - [ ] 10.6: Test rotor navigation for headings

- [ ] Task 11: Create VisuallyHidden utility component
  - [ ] 11.1: Create VisuallyHidden component for screen-reader-only text
  - [ ] 11.2: Use pattern: clip-path, position absolute, 1px dimensions
  - [ ] 11.3: Document usage in component library

- [ ] Task 12: Write VoiceOver-specific E2E tests
  - [ ] 12.1: Test landmark announcements
  - [ ] 12.2: Test button state announcements
  - [ ] 12.3: Test dynamic content announcements
  - [ ] 12.4: Test modal announcements
  - [ ] 12.5: Test sidebar navigation announcements
  - [ ] 12.6: Test heading structure via rotor

- [ ] Task 13: Manual VoiceOver testing
  - [ ] 13.1: Complete full app navigation with VoiceOver
  - [ ] 13.2: Test first-run experience with VoiceOver
  - [ ] 13.3: Test chat interaction flow with VoiceOver
  - [ ] 13.4: Document any VoiceOver-specific issues

## Dev Notes

### Architecture Compliance

**NFR-5.2 (Screen Reader Compatibility):**
- Compatible with macOS VoiceOver
- All interactive elements have accessible names
- Landmarks properly labeled
- Dynamic content announced via ARIA live regions

**FR-10.8 (WCAG AA Accessibility):**
- UI meets WCAG AA standards
- Screen reader support is part of WCAG compliance
- Proper ARIA usage per WAI-ARIA 1.2 specification

### VoiceOver Fundamentals

**Navigation Modes:**
- **Standard navigation:** VO+Arrow keys navigate sequentially
- **Quick Nav:** Arrow keys alone when VO+Q enabled
- **Rotor navigation:** VO+U accesses headings, landmarks, links

**Key VoiceOver Commands:**
| Shortcut | Action |
|----------|--------|
| VO+F1 | VoiceOver help |
| VO+Left/Right | Navigate items |
| VO+Space | Activate current item |
| VO+U | Open rotor |
| VO+Shift+Down | Interact with group |

### ARIA Roles and Properties Reference

**Landmark Roles:**
```tsx
<aside role="navigation" aria-label="Sidebar navigation">
  ...
</aside>
<main role="main" aria-label="Main content">
  ...
</main>
<aside role="complementary" aria-label="Canvas panel">
  ...
</aside>
```

**Button States:**
```tsx
// Disabled button
<Button aria-disabled="true" disabled>Disabled</Button>

// Toggle button
<Button
  aria-pressed={isCollapsed}
  onClick={toggleSidebar}
>
  Toggle sidebar
</Button>

// Expandable button
<Button
  aria-expanded={isOpen}
  aria-haspopup="dialog"
  onClick={openModal}
>
  Open menu
</Button>
```

**Live Regions:**
```tsx
// Message area - polite for new messages
<div
  role="log"
  aria-live="polite"
  aria-label="Conversation messages"
>
  {messages.map(...)}
</div>

// Status announcements
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {statusMessage}
</div>

// Error announcements
<div
  role="alert"
  aria-live="assertive"
>
  {errorMessage}
</div>
```

**Streaming Content:**
```tsx
// During streaming
<div
  aria-live="polite"
  aria-busy={isStreaming}
  aria-label="Orion response"
>
  {content}
</div>

// Completion announcement (visually hidden)
{!isStreaming && <VisuallyHidden role="status">Response complete</VisuallyHidden>}
```

### VisuallyHidden Component Implementation

```tsx
// src/components/ui/visually-hidden.tsx
import { cn } from '@/lib/utils';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  className?: string;
  as?: 'span' | 'div';
}

export function VisuallyHidden({
  children,
  className,
  as: Component = 'span',
  ...props
}: VisuallyHiddenProps) {
  return (
    <Component
      className={cn(
        'absolute w-[1px] h-[1px] p-0 -m-[1px] overflow-hidden',
        'clip-[rect(0,0,0,0)] whitespace-nowrap border-0',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
```

### Sidebar Navigation Enhancement

```tsx
// Enhanced SidebarNavItem with full accessibility
function SidebarNavItem({
  label,
  count,
  isActive,
  href,
  icon: Icon
}: NavItemProps) {
  const countId = `${label.toLowerCase()}-count`;

  return (
    <a
      href={href}
      role="listitem"
      aria-current={isActive ? 'page' : undefined}
      aria-describedby={count ? countId : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2 focus-ring-orion',
        isActive && 'bg-orion-gold/5 border-l-4 border-orion-gold'
      )}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      <span>{label}</span>
      {count && (
        <>
          <span
            id={countId}
            className="ml-auto text-sm text-orion-fg-muted"
          >
            {count}
          </span>
          <VisuallyHidden>{count} items</VisuallyHidden>
        </>
      )}
    </a>
  );
}
```

### Chat Input Enhancement

```tsx
// Enhanced ChatInput with full accessibility
function ChatInput({ onSend, disabled }: ChatInputProps) {
  const hintId = 'chat-input-hint';

  return (
    <div className="border-t border-orion-border p-4">
      <label htmlFor="chat-input" className="sr-only">
        Message to Orion
      </label>
      <textarea
        id="chat-input"
        aria-label="Message to Orion"
        aria-describedby={hintId}
        aria-disabled={disabled}
        placeholder="Type your message..."
        className="w-full resize-none focus-ring-orion"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.metaKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <span id={hintId} className="sr-only">
        Press Command Enter to send
      </span>
    </div>
  );
}
```

### Status Indicator Enhancement

```tsx
// Enhanced StatusIndicator with announcements
function StatusIndicator({ status, size = 'md' }: StatusIndicatorProps) {
  const statusText = {
    idle: 'Ready',
    thinking: 'Thinking',
    acting: 'Working',
    waiting: 'Waiting for input',
    success: 'Complete',
    error: 'Error occurred',
  };

  return (
    <>
      <span
        className={cn(
          'inline-block rounded-full',
          statusStyles[status],
          sizeStyles[size]
        )}
        aria-hidden="true"
      />
      <VisuallyHidden role="status" aria-live="polite">
        {statusText[status]}
      </VisuallyHidden>
    </>
  );
}
```

### Dependencies on Prior Stories

| Story | Dependency |
|-------|------------|
| 1.4 | Sidebar component with keyboard navigation |
| 1.5 | ChatColumn and ChatInput components |
| 1.6 | CanvasColumn component |
| 1.9 | StatusIndicator component |
| 1.15 | Modal components (QuickCapture, CommandPalette) |
| 1.16 | Focus states working with VoiceOver |

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/ui/visually-hidden.tsx` | VisuallyHidden component for screen-reader-only text |
| `src/hooks/useAnnounce.ts` | Hook for programmatic screen reader announcements |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/sidebar/Sidebar.tsx` | Add landmark role and aria-label |
| `src/components/sidebar/SidebarNavItem.tsx` | Add ARIA states and descriptions |
| `src/components/layout/ChatColumn.tsx` | Add main landmark role |
| `src/components/layout/CanvasColumn.tsx` | Add complementary landmark role |
| `src/components/chat/ChatInput.tsx` | Add aria-label and describedby |
| `src/components/chat/MessageArea.tsx` | Add aria-live region |
| `src/components/chat/AssistantMessage.tsx` | Add aria-busy for streaming |
| `src/components/ui/button.tsx` | Add aria-pressed, aria-expanded support |
| `src/components/ui/input.tsx` | Add aria-invalid, aria-describedby support |
| `src/components/ui/status-indicator.tsx` | Add screen reader announcements |
| `src/components/modals/QuickCaptureModal.tsx` | Add dialog role and labels |
| `src/components/modals/CommandPaletteModal.tsx` | Add dialog role and labels |

### useAnnounce Hook Implementation

```typescript
// src/hooks/useAnnounce.ts
import { useCallback, useRef, useEffect } from 'react';

interface AnnounceOptions {
  priority?: 'polite' | 'assertive';
  clearDelay?: number;
}

export function useAnnounce() {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  // Create live region on mount
  useEffect(() => {
    const region = document.createElement('div');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.setAttribute('role', 'status');
    region.className = 'sr-only'; // visually hidden
    document.body.appendChild(region);
    liveRegionRef.current = region;

    return () => {
      document.body.removeChild(region);
    };
  }, []);

  const announce = useCallback((message: string, options: AnnounceOptions = {}) => {
    const { priority = 'polite', clearDelay = 1000 } = options;

    if (!liveRegionRef.current) return;

    // Set priority
    liveRegionRef.current.setAttribute('aria-live', priority);

    // Clear and set message (forces re-announcement)
    liveRegionRef.current.textContent = '';

    // Use setTimeout to ensure DOM update is processed
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = message;
      }
    }, 50);

    // Clear after delay
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = '';
      }
    }, clearDelay);
  }, []);

  return { announce };
}
```

### Testing Standards

**E2E Tests (Playwright with VoiceOver simulation):**

Note: Playwright cannot directly test VoiceOver, but we can test ARIA attributes and structure.

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('VoiceOver Support', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('landmarks are properly labeled', async ({ page }) => {
    // Check sidebar landmark
    const sidebar = page.locator('aside[role="navigation"]');
    await expect(sidebar).toHaveAttribute('aria-label', 'Sidebar navigation');

    // Check main content landmark
    const main = page.locator('[role="main"]');
    await expect(main).toHaveAttribute('aria-label', 'Main content');

    // Check canvas landmark (when visible)
    const canvas = page.locator('aside[role="complementary"]');
    await expect(canvas).toHaveAttribute('aria-label', 'Canvas panel');
  });

  test('interactive elements have accessible names', async ({ page }) => {
    // All buttons should have accessible names
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const hasLabel = await button.evaluate((el) => {
        const name = el.getAttribute('aria-label') || el.textContent?.trim();
        return name && name.length > 0;
      });
      expect(hasLabel).toBe(true);
    }
  });

  test('sidebar nav items have proper ARIA attributes', async ({ page }) => {
    const navItems = page.locator('[role="listitem"]');
    const activeItem = page.locator('[aria-current="page"]');

    // Should have list items
    await expect(navItems.first()).toBeVisible();

    // Active item should have aria-current
    await expect(activeItem).toBeVisible();
  });

  test('chat input has proper labeling', async ({ page }) => {
    const chatInput = page.locator('textarea');

    await expect(chatInput).toHaveAttribute('aria-label', 'Message to Orion');
    await expect(chatInput).toHaveAttribute('aria-describedby');
  });

  test('message area is a live region', async ({ page }) => {
    const messageArea = page.locator('[role="log"]');

    await expect(messageArea).toHaveAttribute('aria-live', 'polite');
  });

  test('modals have dialog role and labels', async ({ page }) => {
    // Open command palette
    await page.keyboard.press('Meta+k');

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-labelledby');
  });

  test('no accessibility violations (axe-core)', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('heading structure is semantic', async ({ page }) => {
    // Get all headings
    const headings = await page.evaluate(() => {
      const hs = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(hs).map(h => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent?.trim()
      }));
    });

    // Should have at most one h1
    const h1Count = headings.filter(h => h.level === 1).length;
    expect(h1Count).toBeLessThanOrEqual(1);

    // Headings should not skip levels
    for (let i = 1; i < headings.length; i++) {
      const diff = headings[i].level - headings[i-1].level;
      expect(diff).toBeLessThanOrEqual(1);
    }
  });

  test('buttons with states have proper ARIA', async ({ page }) => {
    // Toggle button should have aria-pressed
    const sidebarToggle = page.locator('button[aria-pressed]');
    await expect(sidebarToggle).toBeVisible();

    // Check it toggles
    const initialState = await sidebarToggle.getAttribute('aria-pressed');
    await sidebarToggle.click();
    const newState = await sidebarToggle.getAttribute('aria-pressed');
    expect(newState).not.toBe(initialState);
  });
});
```

**Manual VoiceOver Testing Checklist:**

```markdown
## VoiceOver Manual Testing Checklist

### Setup
- [ ] Enable VoiceOver: Cmd+F5
- [ ] Set speech rate to comfortable level: VO+Cmd+Shift+Right/Left

### Landmark Navigation (VO+U, then Arrow to Landmarks)
- [ ] Sidebar navigation landmark is listed
- [ ] Main content landmark is listed
- [ ] Canvas panel landmark is listed (when visible)

### Heading Navigation (VO+U, then Arrow to Headings)
- [ ] Headings are in logical order
- [ ] Heading levels are correct (h1 > h2 > h3)
- [ ] All major sections have headings

### Interactive Elements
- [ ] All buttons announce their purpose
- [ ] Disabled buttons announce "dimmed"
- [ ] Toggle buttons announce pressed/not pressed state
- [ ] Links announce destination

### Forms
- [ ] Chat input announces "Message to Orion"
- [ ] Shortcut hint is accessible
- [ ] Error states are announced
- [ ] Required fields are identified

### Dynamic Content
- [ ] New messages are announced
- [ ] Status changes are announced
- [ ] "Response complete" is announced
- [ ] Errors are announced assertively

### Modals
- [ ] Modal title is announced on open
- [ ] Focus moves into modal
- [ ] "Dialog" is announced
- [ ] Esc closes and focus returns

### Sidebar Navigation
- [ ] Items announce label and count
- [ ] Active item announces "current page"
- [ ] Arrow keys work for navigation
```

### UX Specification Reference

From UX Design Specification (ux-design-specification.md) - Accessibility:
- Contrast ratios meet WCAG AA (black on cream = 14:1)
- Focus states visible for keyboard users
- `prefers-reduced-motion` supported (disable pulse animations)
- Error states use text explanations, not color alone

### References

- [Source: thoughts/planning-artifacts/epics.md#Story 1.17: VoiceOver Support]
- [Source: thoughts/planning-artifacts/nfr-extracted-from-prd-v2.md#NFR-5.2]
- [Source: thoughts/planning-artifacts/functional-requirements-extracted.md#FR-10.8]
- [Source: thoughts/planning-artifacts/architecture.md#NFR-5: Usability]
- [Source: .ralph/story-chain.md#Story 1.16: Focus States]

## Story Chain Context

### Prior Decisions to Honor

From **Story 1.4 (Sidebar Column)**:
- Semantic HTML: `<aside>` + `<nav>` with ARIA attributes (needs enhancement)
- Keyboard navigation within sidebar using Arrow keys
- SidebarNavItem component exists with basic structure

From **Story 1.5 (Main Chat Column)**:
- ChatColumn with MessageArea (aria-live="polite" for announcements)
- ChatInput with Editorial Luxury styling (needs aria-label)

From **Story 1.6 (Canvas Column Placeholder)**:
- CanvasColumn with `<aside>` semantic HTML (needs aria-label)
- Canvas accessibility: `aria-hidden` when closed

From **Story 1.9 (Status Indicator Component)**:
- 6 states: idle, thinking, acting, waiting, success, error
- Needs screen reader announcements for state changes
- Reduced motion support already implemented

From **Story 1.15 (Global Keyboard Shortcuts)**:
- QuickCaptureModal and CommandPaletteModal exist
- Need dialog role and aria-modal enhancement

From **Story 1.16 (Focus States)**:
- Focus-visible pattern implemented (keyboard-only focus indicators)
- Focus trap pattern for modals (needs to work with VoiceOver)
- Focus restoration pattern (needs to be announced)

### What This Story Establishes

1. **Landmark Pattern:** All major sections have ARIA landmark roles with labels
2. **Live Region Pattern:** Dynamic content uses aria-live for announcements
3. **Dialog Pattern:** Modals have proper role="dialog" and aria-modal
4. **State Announcement Pattern:** Buttons and status indicators announce state changes
5. **VisuallyHidden Component:** Reusable component for screen-reader-only text
6. **useAnnounce Hook:** Programmatic screen reader announcements

### Patterns Introduced

| Pattern | Description |
|---------|-------------|
| Landmark Labeling | role + aria-label for navigation, main, complementary regions |
| Live Regions | aria-live="polite" for messages, "assertive" for errors |
| Dialog ARIA | role="dialog", aria-modal, aria-labelledby for modals |
| State Announcements | aria-pressed, aria-expanded, aria-current for interactive elements |
| VisuallyHidden | CSS clip-path pattern for screen-reader-only text |
| useAnnounce Hook | Programmatic announcements via live region |
| Streaming Accessibility | aria-busy during streaming, completion announcements |

### Notes for Next Story (1.18: Touch Targets & Contrast)

- VoiceOver support is now complete
- All interactive elements have accessible names
- Focus management works with screen readers
- Next: Ensure visual accessibility (44x44px touch targets, WCAG AA contrast ratios)
- Consider contrast of focus rings, status indicators, and text
- Verify contrast in both light and dark modes

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
