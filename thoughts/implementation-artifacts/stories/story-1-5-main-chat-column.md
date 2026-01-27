# Story 1.5: Main Chat Column

Status: done

---

## Story

As a **user**,
I want a flexible center column for chat,
So that conversations have room to display.

---

## Acceptance Criteria

1. **Given** the app is launched
   **When** I view the main screen
   **Then** the center column fills remaining space (flex: 1)

2. **And** it has a scrollable message area for future chat messages

3. **And** it has a fixed input area at the bottom for future chat input

4. **And** the chat area has a minimum width of 400px (from canvas split spec)

---

## Tasks / Subtasks

- [x] Task 1: Create ChatColumn container component (AC: #1, #4)
  - [x] 1.1: Create `src/components/chat/ChatColumn.tsx` file
  - [x] 1.2: Set flex-1 to fill remaining horizontal space
  - [x] 1.3: Set min-width to 400px (canvas split spec requirement)
  - [x] 1.4: Apply background color `var(--orion-bg)` for cream background
  - [x] 1.5: Set height to fill container (h-full)
  - [x] 1.6: Create flex column layout for internal structure

- [x] Task 2: Create scrollable message area (AC: #2)
  - [x] 2.1: Create `src/components/chat/MessageArea.tsx` file
  - [x] 2.2: Set flex-1 to fill available space above input
  - [x] 2.3: Enable vertical scrolling (overflow-y-auto)
  - [x] 2.4: Add appropriate padding using design tokens (`--space-4`, `--space-6`)
  - [x] 2.5: Style scrollbar using `--orion-scrollbar` token (global CSS)
  - [x] 2.6: Add empty state placeholder ("Start a conversation...")

- [x] Task 3: Create fixed input area (AC: #3)
  - [x] 3.1: Create `src/components/chat/ChatInput.tsx` file
  - [x] 3.2: Position at bottom of ChatColumn (flex-shrink-0)
  - [x] 3.3: Add padding using design tokens
  - [x] 3.4: Add top border using `var(--orion-border)`
  - [x] 3.5: Create text input with placeholder ("Ask Orion...")
  - [x] 3.6: Apply Editorial Luxury styling (0px border-radius)
  - [x] 3.7: Add visible focus state (2px gold outline, 2px offset)

- [x] Task 4: Integrate ChatColumn into AppShell (AC: #1)
  - [x] 4.1: Modify `src/components/layout/AppShell.tsx` to include ChatColumn
  - [x] 4.2: Position ChatColumn as main content area (flex-1 sibling to Sidebar)
  - [x] 4.3: Ensure proper flex layout (sidebar fixed, chat flexible)

- [x] Task 5: Apply design system styling (AC: #1, #2, #3)
  - [x] 5.1: Verify background color matches light mode (`#FAF8F5` cream)
  - [x] 5.2: Verify background color matches dark mode (`#121212`)
  - [x] 5.3: Verify border colors match design tokens
  - [x] 5.4: Ensure 0px border-radius on all elements
  - [x] 5.5: Apply Inter font for body text per typography spec

- [x] Task 6: Add accessibility attributes (NFR-5.1, NFR-5.2)
  - [x] 6.1: Add `<main>` semantic element for chat area
  - [x] 6.2: Add `role="region"` and `aria-label="Chat"` for screen readers
  - [x] 6.3: Ensure input is focusable and labeled
  - [x] 6.4: Add `aria-live="polite"` region for future message updates
  - [ ] 6.5: Test with VoiceOver on macOS (manual testing required)

- [x] Task 7: Create barrel exports (AC: #1)
  - [x] 7.1: Create `src/components/chat/index.ts` with exports
  - [x] 7.2: Export ChatColumn, MessageArea, ChatInput

---

## Dev Notes

### Architecture Compliance

This story creates the main chat column following the UX Design Specification and Architecture patterns. The ChatColumn is the center piece of the three-column layout.

**Layout Reference (from ux-design-specification.md):**

```
+----------------+----------------------+------------------+
|  LEFT SIDEBAR  |      CHAT AREA       |   RIGHT PANEL    |
|     280px      |      (flex-1)        |   (320px/480px)  |
+----------------+----------------------+------------------+
```

**Closed State (Default - from Story 1.4):**
```
+--------+---------------------+------------+
| GTD    |        CHAT         |  CONTEXT   |
| 280px  |       flex-1        |   320px    |
+--------+---------------------+------------+
```

**With Canvas Open (from ux-design-specification.md):**
```
+--------+---------------+------------------+
| GTD    |     CHAT      |      CANVAS      |
| 280px  |   min:400px   |       480px      |
+--------+---------------+------------------+
```

### Design System Tokens to Use

**From Story 1.3 established tokens:**

| Token | Value | Usage |
|-------|-------|-------|
| `--orion-bg` | #FAF8F5 (light) / #121212 (dark) | Chat area background |
| `--orion-surface` | #FFFFFF (light) / #1A1A1A (dark) | Input background |
| `--orion-border` | #E5E5E5 (light) / #2D2D2D (dark) | Input area top border |
| `--orion-fg` | #1A1A1A (light) / #FAF8F5 (dark) | Primary text |
| `--orion-fg-muted` | #6B6B6B (light) / #9CA3AF (dark) | Placeholder text |
| `--orion-gold` | #D4AF37 | Focus state outline |
| `--orion-scrollbar` | #CCCCCC (light) / #333333 (dark) | Scrollbar thumb |

### Chat Area Specifications (from ux-design-specification.md)

**Minimum Width:** 400px - ensures chat remains usable when canvas is open

**Internal Layout:**
- Message area: flex-1, scrollable, contains future message bubbles
- Input area: flex-shrink-0, fixed at bottom, contains text input

**Empty State:**
- Minimal prompt, not lonely messaging
- "Start a conversation..." or similar placeholder
- No decorative elements (Editorial Luxury principle)

### Input Field Styling (from ux-design-specification.md)

From Component Strategy section:
- 0px border-radius (Editorial Luxury aesthetic)
- 2px gold outline on focus with 2px offset
- Placeholder text uses muted color (`--orion-fg-muted`)
- Background uses surface color (`--orion-surface`)

### Keyboard Navigation Requirements (NFR-5.1)

From architecture.md:
- Full keyboard navigation for all actions
- Input auto-focused on app launch (accessibility option)
- Cmd+Enter to send (future story)
- Escape to cancel (future story)

### ChatColumn Component Pattern

```tsx
// src/components/chat/ChatColumn.tsx
export function ChatColumn() {
  return (
    <main
      className="flex-1 min-w-[400px] flex flex-col h-full bg-orion-bg"
      role="region"
      aria-label="Chat"
    >
      <MessageArea />
      <ChatInput />
    </main>
  );
}
```

### MessageArea Component Pattern

```tsx
// src/components/chat/MessageArea.tsx
export function MessageArea() {
  return (
    <div
      className="flex-1 overflow-y-auto px-space-6 py-space-4"
      aria-live="polite"
    >
      {/* Empty state placeholder */}
      <div className="h-full flex items-center justify-center">
        <p className="text-orion-fg-muted text-sm">
          Start a conversation...
        </p>
      </div>
    </div>
  );
}
```

### ChatInput Component Pattern

```tsx
// src/components/chat/ChatInput.tsx
export function ChatInput() {
  return (
    <div className="flex-shrink-0 border-t border-orion-border px-space-6 py-space-4">
      <input
        type="text"
        placeholder="Ask Orion..."
        className={cn(
          "w-full px-space-4 py-space-3",
          "bg-orion-surface text-orion-fg",
          "border border-orion-border rounded-none",
          "placeholder:text-orion-fg-muted",
          "focus-visible:outline-2 focus-visible:outline-orion-gold focus-visible:outline-offset-2"
        )}
        aria-label="Chat input"
      />
    </div>
  );
}
```

### Updated AppShell Pattern

```tsx
// src/components/layout/AppShell.tsx (modified from Story 1.4)
import { Sidebar } from '../sidebar';
import { ChatColumn } from '../chat';

export function AppShell() {
  return (
    <div className="flex h-screen bg-orion-bg">
      <Sidebar />
      <ChatColumn />
      {/* Future: Canvas column will go here */}
    </div>
  );
}
```

### Scrollbar Styling (Editorial Luxury)

Custom scrollbar styling for message area:

```css
/* Scrollbar styling */
.message-area::-webkit-scrollbar {
  width: 8px;
}

.message-area::-webkit-scrollbar-track {
  background: transparent;
}

.message-area::-webkit-scrollbar-thumb {
  background-color: var(--orion-scrollbar);
  border-radius: 0px; /* Editorial Luxury - sharp corners even on scrollbar */
}
```

### Dependency on Story 1.4

This story requires the AppShell and Sidebar components from Story 1.4:
- `src/components/layout/AppShell.tsx` exists
- `src/components/sidebar/Sidebar.tsx` exists
- Sidebar is flex-shrink-0 (fixed width, doesn't compress)
- Main content area is flex-1 (flexible)

This story also depends on Story 1.3 design tokens:
- `--orion-bg` / `bg-orion-bg`
- `--orion-surface` / `bg-orion-surface`
- `--orion-border` / `border-orion-border`
- `--orion-fg` / `text-orion-fg`
- `--orion-fg-muted` / `text-orion-fg-muted`
- `--orion-gold` / `outline-orion-gold`
- Spacing tokens: `--space-3`, `--space-4`, `--space-6`

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/chat/ChatColumn.tsx` | Create - main chat column container |
| `src/components/chat/MessageArea.tsx` | Create - scrollable message area |
| `src/components/chat/ChatInput.tsx` | Create - fixed input at bottom |
| `src/components/chat/index.ts` | Create - barrel export |
| `src/components/layout/AppShell.tsx` | Modify - add ChatColumn to layout |

### Testing Considerations

**Visual Tests:**
- ChatColumn fills remaining space after sidebar
- Chat area respects 400px minimum width
- Background colors match design tokens
- Dark mode colors switch correctly
- Empty state displays centered placeholder

**Layout Tests:**
- With sidebar at 280px, chat fills remaining viewport width
- When viewport is narrow, chat maintains 400px minimum
- Scrollbar appears when content overflows

**Accessibility Tests:**
- Tab navigation focuses the input
- Focus visible outline appears on input focus
- VoiceOver announces chat region landmarks
- Input has proper aria-label

**Unit Tests:**
- ChatColumn renders with correct classes
- MessageArea renders with empty state
- ChatInput renders with placeholder text
- ChatInput shows focus state on keyboard focus

Test ID Convention: `1.5-UNIT-001`, `1.5-E2E-001`

### References

- [Source: thoughts/planning-artifacts/ux-design-specification.md#Canvas Split View Pattern]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Component Strategy]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Visual Design Foundation]
- [Source: thoughts/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: thoughts/planning-artifacts/epics.md#Story 1.5: Main Chat Column]
- [Dependency: story-1-4-sidebar-column.md]
- [Dependency: story-1-3-define-css-design-tokens.md]

---

## Technical Requirements

### Layout Specifications

| Property | Value |
|----------|-------|
| Width | flex-1 (fills remaining space) |
| Min Width | 400px |
| Height | 100% of parent (h-full) |
| Background | `--orion-bg` (cream/dark) |
| Border-radius | 0px (Editorial Luxury) |

### Internal Layout

| Section | Sizing | Purpose |
|---------|--------|---------|
| MessageArea | flex-1 | Scrollable area for messages |
| ChatInput | flex-shrink-0 | Fixed input at bottom |

### Input Specifications

| Property | Value |
|----------|-------|
| Background | `--orion-surface` |
| Border | 1px `--orion-border` |
| Border-radius | 0px |
| Padding | `--space-4` horizontal, `--space-3` vertical |
| Focus | 2px gold outline, 2px offset |

### Accessibility Specifications

| Requirement | Implementation |
|-------------|----------------|
| Semantic HTML | `<main>` element for chat area |
| ARIA role | `role="region"` |
| ARIA label | `aria-label="Chat"` |
| Live region | `aria-live="polite"` for message updates |
| Input label | `aria-label="Chat input"` |
| Focus style | 2px gold outline, 2px offset |

### Dark Mode Compatibility

The component must work with both light and dark modes using CSS variables:
- No hardcoded colors
- All colors via `--orion-*` tokens
- Automatic switching via CSS media query or `.dark` class

### Performance Metrics

- ChatColumn renders on initial paint (no lazy loading)
- No layout shift during hydration
- Smooth 60fps scroll in MessageArea
- Input remains fixed during scroll

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All unit tests pass (79 component tests)
- Build passes with no TypeScript errors

### Completion Notes List

1. Created ChatColumn component with flex-1, min-w-[400px], h-full, flex-col layout
2. Created MessageArea component with overflow-y-auto, aria-live="polite", empty state placeholder
3. Created ChatInput component with flex-shrink-0, Editorial Luxury styling (rounded-none), 2px gold focus outline
4. Updated AppShell to integrate ChatColumn directly (removed children prop pattern)
5. Updated page.tsx to use AppShell without children
6. All accessibility attributes implemented:
   - `<main>` semantic element with role="region" and aria-label="Chat"
   - aria-live="polite" on MessageArea
   - aria-label="Chat input" on text input
   - Keyboard focusable input with visible focus state

### File List

**Created:**
- src/components/chat/ChatColumn.tsx - Main chat column container
- src/components/chat/MessageArea.tsx - Scrollable message area with empty state
- src/components/chat/ChatInput.tsx - Fixed input at bottom with focus styling
- src/components/chat/index.ts - Barrel exports
- tests/unit/components/chat/ChatColumn.spec.tsx - 8 unit tests
- tests/unit/components/chat/MessageArea.spec.tsx - 7 unit tests
- tests/unit/components/chat/ChatInput.spec.tsx - 11 unit tests
- tests/unit/components/chat/index.spec.ts - 3 export tests

**Modified:**
- src/components/layout/AppShell.tsx - Integrated ChatColumn directly
- src/components/layout/index.ts - Updated exports (removed AppShellProps)
- src/app/page.tsx - Simplified to use AppShell without children
- tests/unit/components/layout/AppShell.spec.tsx - Updated for new structure
