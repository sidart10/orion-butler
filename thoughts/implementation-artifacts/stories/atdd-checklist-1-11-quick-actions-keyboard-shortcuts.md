# ATDD Checklist: 1-11-quick-actions-keyboard-shortcuts

**Story:** Quick Actions & Keyboard Shortcuts
**Priority:** P2
**Risk:** LOW
**Status:** ATDD Design Complete
**Date:** 2026-01-15
**Author:** TEA (Test Architect Agent)

---

## Summary

| Metric | Value |
|--------|-------|
| Acceptance Criteria | 10 |
| Total Test Cases | 52 |
| Unit Tests | 18 |
| Integration Tests | 8 |
| E2E Tests | 21 |
| Accessibility Tests | 5 |

---

## AC1: Cmd+Enter Sends Message

When focused in chat input and pressing Cmd+Enter (Mac) or Ctrl+Enter (fallback), the message sends immediately, input clears, and focus remains in input field.

### Happy Path

- [ ] **Test 1.1.1:** Cmd+Enter sends message on macOS
  - **Given:** User is focused in chat input with text "Hello"
  - **When:** User presses Cmd+Enter (Meta+Enter)
  - **Then:** Message appears in chat thread, input is cleared, focus remains in input
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

- [ ] **Test 1.1.2:** Ctrl+Enter sends message (Windows fallback)
  - **Given:** User is focused in chat input with text "Hello"
  - **When:** User presses Ctrl+Enter
  - **Then:** Message sends (cross-platform fallback works)
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

### Edge Cases

- [ ] **Test 1.1.3:** Empty input does not send
  - **Given:** Chat input is empty
  - **When:** User presses Cmd+Enter
  - **Then:** No message sent, no error, input remains focused
  - **Type:** Unit
  - **File:** `tests/unit/hooks/useKeyboardShortcuts.test.ts`

- [ ] **Test 1.1.4:** Whitespace-only input does not send
  - **Given:** Chat input contains only spaces/newlines
  - **When:** User presses Cmd+Enter
  - **Then:** No message sent (trimmed content is empty)
  - **Type:** Unit
  - **File:** `tests/unit/hooks/useKeyboardShortcuts.test.ts`

### Error Handling

- [ ] **Test 1.1.5:** Send failure shows error, input retained
  - **Given:** Network error occurs during send
  - **When:** User presses Cmd+Enter
  - **Then:** Error message displayed, original input preserved for retry
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

---

## AC2: Cmd+K Opens Command Palette

Pressing Cmd+K anywhere in the app opens a modal command palette with search input focused. Palette shows available commands filtered in real-time.

### Happy Path

- [ ] **Test 1.2.1:** Cmd+K opens command palette
  - **Given:** User is anywhere in the app (not in text input)
  - **When:** User presses Cmd+K
  - **Then:** Command palette modal opens, search input is auto-focused
  - **Type:** E2E
  - **File:** `tests/e2e/command-palette.spec.ts`

- [ ] **Test 1.2.2:** Palette shows available commands
  - **Given:** Command palette is open
  - **When:** User looks at results
  - **Then:** All registered commands are visible with names, descriptions, shortcuts
  - **Type:** E2E
  - **File:** `tests/e2e/command-palette.spec.ts`

### Edge Cases

- [ ] **Test 1.2.3:** Cmd+K toggles palette (open -> close)
  - **Given:** Command palette is already open
  - **When:** User presses Cmd+K again
  - **Then:** Palette closes, focus returns to previous element
  - **Type:** E2E
  - **File:** `tests/e2e/command-palette.spec.ts`

- [ ] **Test 1.2.4:** Cmd+K from within text input
  - **Given:** User is typing in chat input
  - **When:** User presses Cmd+K
  - **Then:** Palette opens (Cmd+K is global shortcut even in input)
  - **Type:** E2E
  - **File:** `tests/e2e/command-palette.spec.ts`

### Error Handling

- [ ] **Test 1.2.5:** Palette opens even if command registry empty
  - **Given:** No commands registered (edge case)
  - **When:** User presses Cmd+K
  - **Then:** Palette opens with "No commands available" message
  - **Type:** Unit
  - **File:** `tests/unit/components/CommandPalette.test.tsx`

---

## AC3: Quick Action Chips After Response

When Claude's response completes with suggested actions, clickable chips appear below the message. Clicking a chip triggers the associated action (pre-fills input or navigates).

### Happy Path

- [ ] **Test 1.3.1:** Quick action chips appear after response
  - **Given:** Claude responds with suggested_actions event
  - **When:** Streaming completes
  - **Then:** Chips appear below the message with correct labels
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

- [ ] **Test 1.3.2:** Clicking chip with "prefill" action
  - **Given:** Chip with action="prefill", value="Schedule meeting"
  - **When:** User clicks the chip
  - **Then:** Chat input is populated with "Schedule meeting"
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

- [ ] **Test 1.3.3:** Clicking chip with "navigate" action
  - **Given:** Chip with action="navigate", value="/calendar"
  - **When:** User clicks the chip
  - **Then:** App navigates to /calendar route
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

### Edge Cases

- [ ] **Test 1.3.4:** No chips when no suggested_actions event
  - **Given:** Claude responds without suggested_actions
  - **When:** Streaming completes
  - **Then:** No chips displayed below message
  - **Type:** Integration
  - **File:** `tests/integration/story-1.11-streaming.spec.ts`

- [ ] **Test 1.3.5:** Chips cleared on new user message
  - **Given:** Previous message has chips displayed
  - **When:** User sends a new message
  - **Then:** Previous chips are cleared/hidden
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

- [ ] **Test 1.3.6:** Multiple chips render correctly (3+)
  - **Given:** Response includes 4 suggested actions
  - **When:** Streaming completes
  - **Then:** All 4 chips render in horizontal layout, no overflow
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

### Error Handling

- [ ] **Test 1.3.7:** Malformed action handled gracefully
  - **Given:** Chip with invalid action type
  - **When:** User clicks chip
  - **Then:** No crash, console warning logged, chip disabled
  - **Type:** Unit
  - **File:** `tests/unit/components/QuickActionChip.test.tsx`

---

## AC4: Command Palette Real-time Filtering

Typing in command palette filters commands instantly (within 50ms). Commands show name, description, and keyboard shortcut hint.

### Happy Path

- [ ] **Test 1.4.1:** Typing filters commands in real-time
  - **Given:** Command palette open with 10+ commands
  - **When:** User types "new"
  - **Then:** Only commands containing "new" are visible
  - **Type:** E2E
  - **File:** `tests/e2e/command-palette.spec.ts`

- [ ] **Test 1.4.2:** Filtering completes within 50ms
  - **Given:** Command palette with 50 commands
  - **When:** User types a filter string
  - **Then:** Results update within 50ms (performance assertion)
  - **Type:** E2E
  - **File:** `tests/e2e/command-palette.spec.ts`

- [ ] **Test 1.4.3:** Commands display full metadata
  - **Given:** Command palette open
  - **When:** User views any command item
  - **Then:** Name, description, and shortcut hint (e.g., "Cmd+N") visible
  - **Type:** E2E
  - **File:** `tests/e2e/command-palette.spec.ts`

### Edge Cases

- [ ] **Test 1.4.4:** Filter with no matches
  - **Given:** Command palette open
  - **When:** User types "xyznonexistent"
  - **Then:** "No matching commands" message shown
  - **Type:** Unit
  - **File:** `tests/unit/components/CommandPalette.test.tsx`

- [ ] **Test 1.4.5:** Case-insensitive filtering
  - **Given:** Command "New Chat" exists
  - **When:** User types "NEW CHAT" or "new chat"
  - **Then:** Command matches regardless of case
  - **Type:** Unit
  - **File:** `tests/unit/lib/commands.test.ts`

- [ ] **Test 1.4.6:** Fuzzy matching (partial match)
  - **Given:** Command "Toggle Sidebar" exists
  - **When:** User types "side" or "tog"
  - **Then:** Command appears in filtered results
  - **Type:** Unit
  - **File:** `tests/unit/lib/commands.test.ts`

### Boundary Conditions

- [ ] **Test 1.4.7:** Long filter string handled
  - **Given:** Command palette open
  - **When:** User pastes 500+ character string
  - **Then:** No crash, results empty, input truncated gracefully
  - **Type:** Unit
  - **File:** `tests/unit/components/CommandPalette.test.tsx`

---

## AC5: Command Palette Keyboard Navigation

Arrow keys navigate filtered results, Enter selects highlighted command, Escape closes palette returning focus to previous element.

### Happy Path

- [ ] **Test 1.5.1:** Arrow down navigates to next item
  - **Given:** Command palette open, first item highlighted
  - **When:** User presses Arrow Down
  - **Then:** Second item becomes highlighted
  - **Type:** E2E
  - **File:** `tests/e2e/command-palette.spec.ts`

- [ ] **Test 1.5.2:** Arrow up navigates to previous item
  - **Given:** Command palette open, second item highlighted
  - **When:** User presses Arrow Up
  - **Then:** First item becomes highlighted
  - **Type:** E2E
  - **File:** `tests/e2e/command-palette.spec.ts`

- [ ] **Test 1.5.3:** Enter executes highlighted command
  - **Given:** "New Chat" command highlighted
  - **When:** User presses Enter
  - **Then:** New chat action triggered, palette closes
  - **Type:** E2E
  - **File:** `tests/e2e/command-palette.spec.ts`

- [ ] **Test 1.5.4:** Escape closes palette
  - **Given:** Command palette open, chat input had focus before
  - **When:** User presses Escape
  - **Then:** Palette closes, focus returns to chat input
  - **Type:** E2E
  - **File:** `tests/e2e/command-palette.spec.ts`

### Edge Cases

- [ ] **Test 1.5.5:** Arrow down at last item wraps to first
  - **Given:** Last command item highlighted
  - **When:** User presses Arrow Down
  - **Then:** First item becomes highlighted (wrap around)
  - **Type:** Unit
  - **File:** `tests/unit/components/CommandPalette.test.tsx`

- [ ] **Test 1.5.6:** Arrow up at first item wraps to last
  - **Given:** First command item highlighted
  - **When:** User presses Arrow Up
  - **Then:** Last item becomes highlighted (wrap around)
  - **Type:** Unit
  - **File:** `tests/unit/components/CommandPalette.test.tsx`

- [ ] **Test 1.5.7:** Enter with no results does nothing
  - **Given:** Filter shows "No matching commands"
  - **When:** User presses Enter
  - **Then:** Nothing happens, palette remains open
  - **Type:** Unit
  - **File:** `tests/unit/components/CommandPalette.test.tsx`

---

## AC6: Global Keyboard Shortcuts

Implement: Cmd+/ toggle sidebar, Cmd+N new chat, ? help overlay, Esc close/cancel. All shortcuts work globally except when in text input (then only Escape works).

### Happy Path

- [ ] **Test 1.6.1:** Cmd+/ toggles sidebar
  - **Given:** Sidebar is visible
  - **When:** User presses Cmd+/
  - **Then:** Sidebar collapses; press again to expand
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

- [ ] **Test 1.6.2:** Cmd+N creates new chat
  - **Given:** User is in any view
  - **When:** User presses Cmd+N
  - **Then:** New conversation created, input focused
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

- [ ] **Test 1.6.3:** ? key opens help overlay
  - **Given:** User is not in text input
  - **When:** User presses ? (Shift+/)
  - **Then:** Help overlay modal opens showing all shortcuts
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

- [ ] **Test 1.6.4:** Esc closes any open modal
  - **Given:** Help overlay is open
  - **When:** User presses Escape
  - **Then:** Help overlay closes
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

### Edge Cases

- [ ] **Test 1.6.5:** Shortcuts skip when typing in input
  - **Given:** User is typing in chat input
  - **When:** User types "?" character
  - **Then:** "?" appears in input (not treated as shortcut)
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

- [ ] **Test 1.6.6:** Escape works even in text input
  - **Given:** User is typing in chat input
  - **When:** User presses Escape
  - **Then:** Input is blurred or modal closes (Esc always works)
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

- [ ] **Test 1.6.7:** Shortcuts skip in contenteditable
  - **Given:** User is editing in TipTap editor (contenteditable)
  - **When:** User types "/" character
  - **Then:** Character inserted, no sidebar toggle
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

### Error Handling

- [ ] **Test 1.6.8:** Multiple modals - Esc closes topmost
  - **Given:** Command palette open, then help overlay opened
  - **When:** User presses Escape
  - **Then:** Help overlay closes first, command palette remains
  - **Type:** Unit
  - **File:** `tests/unit/hooks/useKeyboardShortcuts.test.ts`

---

## AC7: Keyboard Hint Display

Buttons and actions show keyboard shortcut hints via tooltips (on hover) and aria-label attributes. Help overlay (?) shows complete shortcut reference.

### Happy Path

- [ ] **Test 1.7.1:** Send button shows shortcut tooltip
  - **Given:** User hovers over send button
  - **When:** Tooltip appears after delay
  - **Then:** Tooltip shows "Send (Cmd+Enter)" or similar
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

- [ ] **Test 1.7.2:** Button has aria-label with shortcut
  - **Given:** Send button in DOM
  - **When:** Screen reader queries aria-label
  - **Then:** aria-label includes "Cmd+Enter" hint
  - **Type:** Accessibility
  - **File:** `tests/e2e/shortcuts-a11y.spec.ts`

- [ ] **Test 1.7.3:** Help overlay shows all shortcuts
  - **Given:** Help overlay is open
  - **When:** User views content
  - **Then:** All global, chat, and canvas shortcuts listed with descriptions
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

### Edge Cases

- [ ] **Test 1.7.4:** Keyboard hint component renders correctly
  - **Given:** KeyboardHint component with "Cmd+K"
  - **When:** Component renders
  - **Then:** Badge shows styled shortcut text (mono font, light bg)
  - **Type:** Unit
  - **File:** `tests/unit/components/KeyboardHint.test.tsx`

---

## AC8: Accessibility Compliance

All shortcuts have visible hints, focus management is correct, screen reader announces palette open/close, Enter/Space activates any interactive element.

### Happy Path

- [ ] **Test 1.8.1:** Screen reader announces palette open
  - **Given:** Screen reader active
  - **When:** User opens command palette with Cmd+K
  - **Then:** "Command palette opened" announced (via aria-live)
  - **Type:** Accessibility
  - **File:** `tests/e2e/shortcuts-a11y.spec.ts`

- [ ] **Test 1.8.2:** Screen reader announces palette close
  - **Given:** Screen reader active, palette open
  - **When:** User closes palette with Escape
  - **Then:** "Command palette closed" announced
  - **Type:** Accessibility
  - **File:** `tests/e2e/shortcuts-a11y.spec.ts`

- [ ] **Test 1.8.3:** Focus trapped inside palette
  - **Given:** Command palette open
  - **When:** User presses Tab repeatedly
  - **Then:** Focus cycles within palette (search input -> items -> search input)
  - **Type:** E2E
  - **File:** `tests/e2e/shortcuts-a11y.spec.ts`

- [ ] **Test 1.8.4:** Enter/Space activates quick action chips
  - **Given:** Quick action chip has keyboard focus
  - **When:** User presses Enter or Space
  - **Then:** Chip action is triggered
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

### Error Handling

- [ ] **Test 1.8.5:** axe-core accessibility audit passes
  - **Given:** Command palette open
  - **When:** axe-core audit runs
  - **Then:** No critical or serious accessibility violations
  - **Type:** Accessibility
  - **File:** `tests/e2e/shortcuts-a11y.spec.ts`

---

## AC9: Quick Action Chip Design

Chips follow Orion Design System: sharp corners, gold border on hover, cream background, Inter font at 13px, 8px horizontal padding.

### Happy Path

- [ ] **Test 1.9.1:** Chip has cream background
  - **Given:** Quick action chip rendered
  - **When:** Inspecting styles
  - **Then:** Background color is #F9F8F6 (orion-bg)
  - **Type:** Unit
  - **File:** `tests/unit/components/QuickActionChip.test.tsx`

- [ ] **Test 1.9.2:** Chip has sharp corners (no border-radius)
  - **Given:** Quick action chip rendered
  - **When:** Inspecting styles
  - **Then:** border-radius is 0
  - **Type:** Unit
  - **File:** `tests/unit/components/QuickActionChip.test.tsx`

- [ ] **Test 1.9.3:** Chip has gold border on hover
  - **Given:** Quick action chip rendered
  - **When:** User hovers over chip
  - **Then:** Border color changes to #D4AF37 (orion-primary)
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

- [ ] **Test 1.9.4:** Chip uses Inter font at 13px
  - **Given:** Quick action chip rendered
  - **When:** Inspecting styles
  - **Then:** font-family is Inter, font-size is 13px
  - **Type:** Unit
  - **File:** `tests/unit/components/QuickActionChip.test.tsx`

### Visual Regression

- [ ] **Test 1.9.5:** Chip visual matches design spec
  - **Given:** Quick action chips rendered in chat
  - **When:** Screenshot captured
  - **Then:** Matches baseline image within 1% pixel diff
  - **Type:** Visual
  - **File:** `tests/visual/story-1.11-chips.spec.ts`

---

## AC10: Shortcut Conflict Prevention

Shortcuts don't conflict with browser defaults (Cmd+R, Cmd+T). Text inputs capture typing without triggering global shortcuts.

### Happy Path

- [ ] **Test 1.10.1:** Cmd+R not intercepted (browser refresh)
  - **Given:** User presses Cmd+R
  - **When:** Event fires
  - **Then:** Browser refresh occurs (not blocked by app)
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

- [ ] **Test 1.10.2:** Cmd+T not intercepted (new tab)
  - **Given:** User presses Cmd+T
  - **When:** Event fires
  - **Then:** Browser new tab (not blocked by app)
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

### Edge Cases

- [ ] **Test 1.10.3:** Text in input not treated as shortcuts
  - **Given:** User typing in chat input
  - **When:** User types "n" (would be Cmd+N without modifier)
  - **Then:** "n" appears in input, no new chat created
  - **Type:** E2E
  - **File:** `tests/e2e/story-1.11-shortcuts.spec.ts`

- [ ] **Test 1.10.4:** Modifier-only shortcuts require modifier
  - **Given:** User has focus outside input
  - **When:** User types just "k" (without Cmd)
  - **Then:** No command palette opens
  - **Type:** Unit
  - **File:** `tests/unit/hooks/useKeyboardShortcuts.test.ts`

### Boundary Conditions

- [ ] **Test 1.10.5:** Shortcut hook cleanup on unmount
  - **Given:** Component with keyboard shortcuts mounted
  - **When:** Component unmounts
  - **Then:** Event listeners removed (no memory leak)
  - **Type:** Unit
  - **File:** `tests/unit/hooks/useKeyboardShortcuts.test.ts`

---

## Test File Summary

| File Path | Test Count | Type |
|-----------|------------|------|
| `tests/unit/hooks/useKeyboardShortcuts.test.ts` | 8 | Unit |
| `tests/unit/lib/commands.test.ts` | 2 | Unit |
| `tests/unit/components/CommandPalette.test.tsx` | 5 | Unit |
| `tests/unit/components/QuickActionChip.test.tsx` | 5 | Unit |
| `tests/unit/components/KeyboardHint.test.tsx` | 1 | Unit |
| `tests/integration/story-1.11-streaming.spec.ts` | 1 | Integration |
| `tests/e2e/story-1.11-shortcuts.spec.ts` | 21 | E2E |
| `tests/e2e/command-palette.spec.ts` | 9 | E2E |
| `tests/e2e/shortcuts-a11y.spec.ts` | 5 | Accessibility |
| `tests/visual/story-1.11-chips.spec.ts` | 1 | Visual |
| **Total** | **52** | - |

---

## Gate Criteria Checklist

Before marking story as complete:

- [ ] All 52 tests implemented and passing
- [ ] Unit test coverage >= 80% for shortcut hooks and components
- [ ] E2E tests pass on macOS (Cmd key) and with Ctrl fallback
- [ ] Accessibility audit passes (axe-core)
- [ ] No shortcut conflicts with browser defaults verified
- [ ] Performance: Command palette opens in < 100ms
- [ ] Performance: Filtering updates within 50ms
- [ ] Code review approved
- [ ] No P0/P1 bugs open

---

**Document Status:** Ready for Implementation
**Next Step:** Implement test files alongside component development

_Generated by TEA (Test Architect Agent) - 2026-01-15_
