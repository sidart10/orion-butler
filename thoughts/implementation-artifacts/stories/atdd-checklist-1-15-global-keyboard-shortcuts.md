# ATDD Checklist: 1-15-global-keyboard-shortcuts

**Generated:** 2026-01-24
**Story:** Story 1.15: Global Keyboard Shortcuts
**Author:** TEA (Master Test Architect)
**Status:** Ready for Implementation

---

## Summary

This ATDD checklist covers comprehensive test scenarios for keyboard shortcut functionality in Orion Butler. Tests are organized by acceptance criterion with happy path, edge cases, and error handling for each.

**Test Counts:**
- Unit Tests: 18
- Component Tests: 8
- E2E Tests: 16
- **Total:** 42 test scenarios

**Test Framework Stack:**
- Unit/Integration: Vitest + React Testing Library
- E2E: Playwright with custom fixtures

---

## AC1: Cmd+N Quick Capture Trigger

> **Given** the app is focused
> **When** I press Cmd+N
> **Then** quick capture is triggered (placeholder action for MVP)
> **And** a visual indicator confirms the shortcut was received

### Happy Path

- [ ] **1.1-UNIT-001**: Test Cmd+N shortcut registration
  - Given: useKeyboardShortcuts hook is initialized with quick capture shortcut
  - When: KeyboardEvent with key='n' and metaKey=true is dispatched
  - Then: Quick capture action callback is invoked exactly once

- [ ] **1.1-UNIT-002**: Test quick capture modal opens
  - Given: KeyboardShortcutProvider is mounted
  - When: Cmd+N shortcut is triggered
  - Then: isQuickCaptureOpen state becomes true

- [ ] **1.1-E2E-001**: Test Cmd+N opens quick capture modal
  - Given: App is loaded at homepage
  - When: User presses Meta+n keyboard combination
  - Then: Quick capture input with data-testid="quick-capture-input" is visible
  - And: Quick capture input has focus

- [ ] **1.1-E2E-002**: Test visual indicator on shortcut activation
  - Given: App is loaded at homepage
  - When: User presses Meta+n keyboard combination
  - Then: Quick capture modal appears with visible overlay (bg-black/50)
  - And: Input field has focus ring indicator (ring-2 ring-orion-gold)

### Edge Cases

- [ ] **1.1-UNIT-003**: Test Cmd+N when quick capture already open
  - Given: isQuickCaptureOpen is already true
  - When: Cmd+N is pressed again
  - Then: Quick capture remains open (idempotent behavior)

- [ ] **1.1-E2E-003**: Test rapid successive Cmd+N presses
  - Given: App is loaded at homepage
  - When: User presses Meta+n three times rapidly (within 500ms)
  - Then: Only one quick capture modal is visible
  - And: No console errors are logged

- [ ] **1.1-UNIT-004**: Test Ctrl+N on Mac (should not trigger)
  - Given: Platform is Mac (navigator.platform contains "Mac")
  - When: KeyboardEvent with key='n' and ctrlKey=true (not metaKey) is dispatched
  - Then: Quick capture action is NOT invoked

### Error Handling

- [ ] **1.1-UNIT-005**: Test shortcut with missing action callback
  - Given: Shortcut is registered with undefined action
  - When: Shortcut key combination is pressed
  - Then: No error is thrown (graceful handling)

---

## AC2: Cmd+[ Sidebar Toggle

> **Given** the app is focused
> **When** I press Cmd+[
> **Then** the sidebar collapses if expanded
> **Or** the sidebar expands if collapsed
> **And** the transition is smooth (300ms with luxury easing from Story 1.6)

### Happy Path

- [ ] **1.2-UNIT-001**: Test Cmd+[ shortcut calls sidebar toggle
  - Given: useKeyboardShortcuts hook with sidebar toggle shortcut
  - When: KeyboardEvent with key='[' and metaKey=true is dispatched
  - Then: toggleSidebar action from useSidebarStore is invoked

- [ ] **1.2-E2E-001**: Test Cmd+[ collapses expanded sidebar
  - Given: App is loaded and sidebar is visible with width 280px
  - When: User presses Meta+[
  - Then: Sidebar width transitions to collapsed state (0px or 48px)
  - And: Transition duration is approximately 300ms

- [ ] **1.2-E2E-002**: Test Cmd+[ expands collapsed sidebar
  - Given: Sidebar is in collapsed state
  - When: User presses Meta+[
  - Then: Sidebar width transitions to 280px
  - And: Sidebar content becomes visible

- [ ] **1.2-E2E-003**: Test smooth transition animation
  - Given: App is loaded with expanded sidebar
  - When: User presses Meta+[
  - Then: CSS transition property includes "300ms"
  - And: CSS timing function is cubic-bezier(0.4, 0, 0.2, 1)

### Edge Cases

- [ ] **1.2-UNIT-002**: Test multiple rapid toggles
  - Given: Sidebar toggle shortcut is registered
  - When: Cmd+[ is pressed 5 times within 300ms
  - Then: Final sidebar state is opposite of initial state (odd number of toggles)

- [ ] **1.2-E2E-004**: Test sidebar toggle during animation
  - Given: Sidebar is mid-transition (toggling)
  - When: User presses Meta+[ again before animation completes
  - Then: Animation reverses smoothly without visual glitches

### Error Handling

- [ ] **1.2-UNIT-003**: Test sidebar toggle when store unavailable
  - Given: useSidebarStore returns undefined toggle function
  - When: Cmd+[ is pressed
  - Then: No error is thrown (null-safe handling)

---

## AC3: Cmd+K Command Palette

> **Given** the app is focused
> **When** I press Cmd+K
> **Then** command palette opens (placeholder modal for MVP)
> **And** focus moves to the palette input

### Happy Path

- [ ] **1.3-UNIT-001**: Test Cmd+K shortcut registration
  - Given: useKeyboardShortcuts hook with command palette shortcut
  - When: KeyboardEvent with key='k' and metaKey=true is dispatched
  - Then: Command palette toggle action is invoked

- [ ] **1.3-E2E-001**: Test Cmd+K opens command palette
  - Given: App is loaded at homepage
  - When: User presses Meta+k
  - Then: Command palette modal is visible
  - And: Input with placeholder containing "command" is visible

- [ ] **1.3-E2E-002**: Test command palette input receives focus
  - Given: Command palette is closed
  - When: User presses Meta+k to open palette
  - Then: Command palette input element is focused
  - And: User can immediately start typing

- [ ] **1.3-E2E-003**: Test Cmd+K toggles command palette
  - Given: Command palette is open
  - When: User presses Meta+k again
  - Then: Command palette closes
  - And: Focus returns to previous element

### Edge Cases

- [ ] **1.3-UNIT-002**: Test command palette when quick capture is open
  - Given: isQuickCaptureOpen is true
  - When: Cmd+K is pressed
  - Then: Command palette opens (both can be open, or one closes - verify expected behavior)

- [ ] **1.3-E2E-004**: Test command palette with existing text selection
  - Given: User has selected text in the main content area
  - When: User presses Meta+k
  - Then: Command palette opens
  - And: Text selection in main content is preserved

### Error Handling

- [ ] **1.3-UNIT-003**: Test command palette action when context missing
  - Given: Component renders outside KeyboardShortcutProvider
  - When: useKeyboardShortcutContext is called
  - Then: Error is thrown with helpful message about provider requirement

---

## AC4: Cmd+Enter Send Message

> **Given** the chat input is focused
> **When** I press Cmd+Enter
> **Then** the message is sent
> **And** the input clears after successful send

### Happy Path

- [ ] **1.4-COMP-001**: Test Cmd+Enter triggers send in chat input
  - Given: ChatInput component is rendered with onSend callback
  - When: User types "Hello" and presses Cmd+Enter
  - Then: onSend callback is called with "Hello"
  - And: Input value is cleared to empty string

- [ ] **1.4-E2E-001**: Test Cmd+Enter sends message
  - Given: App is loaded and chat input is focused
  - When: User types "Test message" and presses Meta+Enter
  - Then: Input value becomes empty
  - And: Message appears in chat history (or placeholder confirmation)

- [ ] **1.4-E2E-002**: Test Ctrl+Enter sends message (Windows compatibility)
  - Given: App is loaded and chat input is focused
  - When: User types "Test message" and presses Control+Enter
  - Then: Message is sent (cross-platform support)

### Edge Cases

- [ ] **1.4-COMP-002**: Test Cmd+Enter with empty input
  - Given: ChatInput component with empty value
  - When: User presses Cmd+Enter
  - Then: onSend callback is NOT called (empty message blocked)

- [ ] **1.4-COMP-003**: Test Cmd+Enter with whitespace-only input
  - Given: ChatInput component with value "   " (whitespace)
  - When: User presses Cmd+Enter
  - Then: onSend callback is NOT called (trimmed empty blocked)

- [ ] **1.4-E2E-003**: Test Enter without Cmd does not send
  - Given: Chat input is focused with text "Hello"
  - When: User presses Enter (without Cmd modifier)
  - Then: Newline is inserted in textarea (multi-line input)
  - And: Message is NOT sent

- [ ] **1.4-COMP-004**: Test Cmd+Enter only active when chat input focused
  - Given: Chat input exists but is not focused (focus elsewhere)
  - When: User presses Cmd+Enter
  - Then: No message send action is triggered

### Error Handling

- [ ] **1.4-COMP-005**: Test Cmd+Enter when send fails
  - Given: onSend callback throws an error
  - When: User presses Cmd+Enter with valid message
  - Then: Input is NOT cleared (preserve user's message on failure)
  - And: Error state is communicated to user

---

## AC5: Esc Dismiss Shortcut

> **Given** the app is focused
> **When** I press Esc
> **Then** the currently open canvas closes (if any)
> **Or** the currently open modal/palette closes (if any)
> **And** focus returns to the previous element

### Happy Path

- [ ] **1.5-UNIT-001**: Test Esc shortcut with allowInInput flag
  - Given: Esc shortcut is registered with allowInInput: true
  - When: KeyboardEvent with key='Escape' is dispatched
  - Then: Esc action is invoked regardless of focus context

- [ ] **1.5-E2E-001**: Test Esc closes command palette
  - Given: Command palette is open
  - When: User presses Escape
  - Then: Command palette closes
  - And: Focus returns to element that was focused before palette opened

- [ ] **1.5-E2E-002**: Test Esc closes quick capture modal
  - Given: Quick capture modal is open
  - When: User presses Escape
  - Then: Quick capture modal closes

- [ ] **1.5-E2E-003**: Test Esc closes canvas
  - Given: Canvas panel is open
  - When: User presses Escape (with no modals open)
  - Then: Canvas closes
  - And: Main chat area remains visible

### Edge Cases

- [ ] **1.5-UNIT-002**: Test Esc priority: quick capture > command palette > canvas
  - Given: Quick capture, command palette, and canvas are all open
  - When: User presses Escape once
  - Then: Quick capture closes first
  - When: User presses Escape again
  - Then: Command palette closes second
  - When: User presses Escape again
  - Then: Canvas closes third

- [ ] **1.5-E2E-004**: Test Esc with nothing to close
  - Given: No modals or canvas are open
  - When: User presses Escape
  - Then: No action is taken (no error, no UI change)

- [ ] **1.5-E2E-005**: Test Esc in input field still closes modal
  - Given: Quick capture modal is open and input is focused
  - When: User presses Escape while typing
  - Then: Modal closes (Esc works even in input context)

### Error Handling

- [ ] **1.5-UNIT-003**: Test Esc when canvas store unavailable
  - Given: useCanvasStore returns undefined
  - When: Esc is pressed with canvas supposedly open
  - Then: No error is thrown, other close actions still work

---

## AC6: System Shortcut Conflict Prevention

> **Given** any keyboard shortcut is pressed
> **Then** the shortcut does not conflict with system shortcuts (Cmd+C, Cmd+V, Cmd+Q, etc.)
> **And** standard text editing shortcuts work normally in input fields

### Happy Path

- [ ] **1.6-UNIT-001**: Test system shortcuts are not overridden
  - Given: useKeyboardShortcuts hook is active
  - When: KeyboardEvent with key='c' and metaKey=true is dispatched
  - Then: event.preventDefault() is NOT called (system copy works)

- [ ] **1.6-E2E-001**: Test Cmd+C works for copy
  - Given: User has selected text in the app
  - When: User presses Meta+c
  - Then: Text is copied to clipboard (system behavior)

- [ ] **1.6-E2E-002**: Test Cmd+V works for paste
  - Given: User has text in clipboard and input is focused
  - When: User presses Meta+v
  - Then: Clipboard content is pasted into input

- [ ] **1.6-E2E-003**: Test Cmd+A works for select all
  - Given: Chat input is focused with text content
  - When: User presses Meta+a
  - Then: All text in input is selected

### Edge Cases

- [ ] **1.6-UNIT-002**: Test no shortcuts registered on reserved keys
  - Given: List of reserved system shortcuts (Cmd+C, Cmd+V, Cmd+X, Cmd+Z, Cmd+Q, Cmd+W, Cmd+Tab)
  - When: Checking registered shortcuts in KeyboardShortcutProvider
  - Then: None of these key combinations have registered actions

### Error Handling

- [ ] **1.6-UNIT-003**: Test shortcut registration rejects system shortcuts
  - Given: Attempt to register shortcut with key='c' and modifiers={meta: true}
  - When: Registration is attempted
  - Then: Registration fails or warns (defensive programming)

---

## AC7: Shortcut Hints and Discoverability

> **Given** the app is running
> **When** shortcuts are used
> **Then** each shortcut has a visual hint available via tooltip (shown on hover)
> **And** shortcuts are discoverable through a help mechanism

### Happy Path

- [ ] **1.7-COMP-001**: Test ShortcutHint component renders correctly
  - Given: ShortcutHint component with shortcut="Cmd+K"
  - When: Component is rendered
  - Then: Rendered output contains "Cmd+K" in kbd element with proper styling

- [ ] **1.7-E2E-001**: Test shortcut hints in settings page
  - Given: User navigates to /settings
  - When: Page loads
  - Then: Keyboard Shortcuts section is visible
  - And: All registered shortcuts are listed with descriptions

- [ ] **1.7-E2E-002**: Test shortcut grouping by category
  - Given: User is on settings keyboard section
  - When: Examining shortcuts list
  - Then: Shortcuts are grouped by category (Global, Navigation, Chat)
  - And: Each category has descriptive heading

### Edge Cases

- [ ] **1.7-COMP-002**: Test ShortcutHint with special characters
  - Given: ShortcutHint with shortcut="Cmd+["
  - When: Component is rendered
  - Then: Special character [ displays correctly without escaping issues

- [ ] **1.7-E2E-003**: Test tooltip hover on button with shortcut
  - Given: Button or control that has an associated keyboard shortcut
  - When: User hovers over the element for 500ms
  - Then: Tooltip appears showing the keyboard shortcut
  - And: Tooltip uses consistent format (e.g., "Cmd+K" not "Command+K")

### Error Handling

- [ ] **1.7-COMP-003**: Test ShortcutHint with empty shortcut string
  - Given: ShortcutHint with shortcut=""
  - When: Component is rendered
  - Then: Component renders empty or with placeholder (no crash)

---

## AC8: Input Field Scope Management

> **Given** an input field or text area has focus
> **When** I press a keyboard shortcut
> **Then** shortcuts that would interfere with typing are disabled (except Cmd+Enter for send)
> **And** standard editing shortcuts work normally

### Happy Path

- [ ] **1.8-UNIT-001**: Test isInputElement detection for input
  - Given: document.activeElement is an input element
  - When: isInputElement() is called
  - Then: Returns true

- [ ] **1.8-UNIT-002**: Test isInputElement detection for textarea
  - Given: document.activeElement is a textarea element
  - When: isInputElement() is called
  - Then: Returns true

- [ ] **1.8-UNIT-003**: Test isInputElement detection for contenteditable
  - Given: document.activeElement has contenteditable="true"
  - When: isInputElement() is called
  - Then: Returns true

- [ ] **1.8-E2E-001**: Test Cmd+N disabled in input field
  - Given: Chat input textarea is focused
  - When: User presses Meta+n
  - Then: Quick capture does NOT open
  - And: "n" may be typed into input (default behavior)

- [ ] **1.8-E2E-002**: Test Cmd+K disabled in input field
  - Given: Chat input textarea is focused
  - When: User presses Meta+k
  - Then: Command palette does NOT open (preserves typing context)

- [ ] **1.8-E2E-003**: Test Cmd+[ disabled in input field
  - Given: Chat input textarea is focused
  - When: User presses Meta+[
  - Then: Sidebar does NOT toggle (preserves typing context)

### Edge Cases

- [ ] **1.8-UNIT-004**: Test shortcuts with allowInInput: true still work
  - Given: Esc shortcut registered with allowInInput: true
  - When: Input is focused and Escape is pressed
  - Then: Esc action IS invoked (configured to work in input)

- [ ] **1.8-E2E-004**: Test Cmd+Enter works in chat input (exception)
  - Given: Chat input is focused with text
  - When: User presses Meta+Enter
  - Then: Message is sent (Cmd+Enter is explicitly allowed in chat input)

- [ ] **1.8-UNIT-005**: Test non-input element with focus
  - Given: document.activeElement is a div (not input/textarea/contenteditable)
  - When: isInputElement() is called
  - Then: Returns false

### Error Handling

- [ ] **1.8-UNIT-006**: Test isInputElement with null activeElement
  - Given: document.activeElement is null
  - When: isInputElement() is called
  - Then: Returns false (no error thrown)

---

## Cross-Cutting Concerns

### Performance

- [ ] **1.X-PERF-001**: Test keydown handler performance
  - Given: 100 rapid keydown events dispatched
  - When: Measuring total handling time
  - Then: Average handling time per event < 1ms

### Accessibility

- [ ] **1.X-A11Y-001**: Test shortcuts announced to screen readers
  - Given: Screen reader is active
  - When: Shortcut action is performed (e.g., modal opens)
  - Then: Focus change is announced
  - And: Modal has appropriate aria-label

- [ ] **1.X-A11Y-002**: Test focus restoration after modal close
  - Given: Command palette opened from specific button
  - When: User presses Escape to close
  - Then: Focus returns to the button that was focused before

### Cross-Platform

- [ ] **1.X-XPLAT-001**: Test Ctrl used on non-Mac platforms
  - Given: Platform detection returns non-Mac (e.g., Windows)
  - When: KeyboardEvent with ctrlKey=true is dispatched
  - Then: Shortcut is recognized as modifier+key combination

---

## Test Data Requirements

### Fixtures

- **Page fixture**: Standard Playwright page with Orion app loaded
- **Log fixture**: Custom logging utility for test steps (from existing fixtures)
- **Store mocks**: Vitest mocks for useSidebarStore, useCanvasStore

### Test IDs Required (data-testid)

| Element | Test ID |
|---------|---------|
| Quick capture input | `quick-capture-input` |
| Quick capture modal | `quick-capture-modal` |
| Command palette input | `command-palette-input` |
| Command palette modal | `command-palette-modal` |
| Chat input | `chat-input` |
| Sidebar | `sidebar` |
| Sidebar toggle button | `sidebar-toggle` |
| Settings keyboard section | `settings-keyboard` |

---

## Execution Priority

### P0 (Critical) - Run on every commit

| Test ID | Description |
|---------|-------------|
| 1.1-E2E-001 | Cmd+N opens quick capture |
| 1.2-E2E-001 | Cmd+[ collapses sidebar |
| 1.3-E2E-001 | Cmd+K opens command palette |
| 1.4-E2E-001 | Cmd+Enter sends message |
| 1.5-E2E-001 | Esc closes command palette |
| 1.6-E2E-001 | Cmd+C copy works |
| 1.8-E2E-001 | Cmd+N disabled in input |

### P1 (High) - Run on PR

| Test ID | Description |
|---------|-------------|
| 1.1-UNIT-001 | Shortcut registration |
| 1.2-E2E-002 | Sidebar expand |
| 1.3-E2E-002 | Palette focus |
| 1.4-COMP-001 | Send handler |
| 1.5-UNIT-002 | Esc priority |
| 1.7-E2E-001 | Settings shortcuts list |
| 1.8-UNIT-001-003 | Input detection |

### P2 (Medium) - Run nightly

| Test ID | Description |
|---------|-------------|
| 1.1-UNIT-002-004 | Edge cases |
| 1.2-UNIT-002-003 | Toggle edge cases |
| 1.4-COMP-002-005 | Send edge cases |
| 1.7-COMP-001-003 | Hint components |
| 1.X-PERF-001 | Handler performance |

### P3 (Low) - Run on-demand

| Test ID | Description |
|---------|-------------|
| 1.X-A11Y-001-002 | Accessibility |
| 1.X-XPLAT-001 | Cross-platform |

---

## References

- Story: `/thoughts/implementation-artifacts/stories/story-1-15-global-keyboard-shortcuts.md`
- Test Design System: `/thoughts/planning-artifacts/test-design-system.md`
- E2E Patterns: `/tests/e2e/homepage.spec.ts`
- TEA Knowledge: `/_bmad/bmm/testarch/knowledge/`

---

*Generated by TEA (Master Test Architect) - Strong opinions, weakly held.*
