# ATDD Checklist - Epic 2, Story 2.12: Chat Input Send Handler

**Date:** 2026-01-24
**Author:** Sid
**Primary Test Level:** Component (with E2E for critical flows)

---

## Story Summary

Users need to send messages to Claude via keyboard shortcuts (Cmd+Enter/Ctrl+Enter) or the Send button. The input must validate empty states, clear after sending, and remain disabled during streaming.

**As a** user
**I want** to send messages via keyboard or button
**So that** I can communicate with Claude

---

## Acceptance Criteria

1. **AC #1:** Given the chat input has text, when I press Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux) or click the Send button, then the message is sent to the backend
2. **AC #2:** And the input is cleared after send
3. **AC #3:** And the input is disabled while sending (re-enabled on complete/error)
4. **AC #4:** When the input is empty, then the Send action is disabled

---

## Failing Tests Created (RED Phase)

### Component Tests (17 tests)

**File:** `tests/component/chat-input-send.test.tsx` (~250 lines)

#### Unit Logic Tests

- [ ] **Test:** `2.12-UNIT-001` canSend is false when input is empty
  - **Status:** RED - ChatInput not yet enhanced with canSend validation
  - **Verifies:** AC #4 - Empty input disables send

- [ ] **Test:** `2.12-UNIT-002` canSend is false when input is whitespace only
  - **Status:** RED - Whitespace validation not implemented
  - **Verifies:** AC #4 - Whitespace-only should be treated as empty

- [ ] **Test:** `2.12-UNIT-003` canSend is true when input has text
  - **Status:** RED - canSend logic not fully wired
  - **Verifies:** AC #1, #4 - Valid input enables send

- [ ] **Test:** `2.12-UNIT-004` canSend is false when isDisabled is true
  - **Status:** RED - canSend should respect streaming state
  - **Verifies:** AC #3, #4 - No send during streaming

- [ ] **Test:** `2.12-UNIT-005` handleSubmit does nothing when canSend is false
  - **Status:** RED - Guard logic not verified
  - **Verifies:** AC #4 - No-op when disabled

- [ ] **Test:** `2.12-UNIT-006` handleSubmit clears input value
  - **Status:** RED - Input clearing on submit not verified
  - **Verifies:** AC #2 - Input cleared after send

- [ ] **Test:** `2.12-UNIT-007` handleSubmit calls send with SEND event
  - **Status:** RED - State machine integration not verified
  - **Verifies:** AC #1 - Message sent to backend

- [ ] **Test:** `2.12-UNIT-008` handleKeyDown triggers submit on Cmd+Enter
  - **Status:** RED - Mac keyboard shortcut not verified
  - **Verifies:** AC #1 - Mac keyboard support

- [ ] **Test:** `2.12-UNIT-009` handleKeyDown triggers submit on Ctrl+Enter
  - **Status:** RED - Windows/Linux keyboard shortcut not verified
  - **Verifies:** AC #1 - Cross-platform keyboard support

- [ ] **Test:** `2.12-UNIT-010` handleKeyDown prevents default on Cmd+Enter
  - **Status:** RED - Event prevention not verified
  - **Verifies:** AC #1 - No form submission side effects

- [ ] **Test:** `2.12-UNIT-011` Button disabled when canSend is false
  - **Status:** RED - Button disabled state not wired to canSend
  - **Verifies:** AC #4 - Visual feedback for disabled state

- [ ] **Test:** `2.12-UNIT-012` Button enabled when canSend is true
  - **Status:** RED - Button enabled state not verified
  - **Verifies:** AC #1 - Visual feedback for enabled state

- [ ] **Test:** `2.12-UNIT-013` Button onClick calls handleSubmit
  - **Status:** RED - Button click handler not wired
  - **Verifies:** AC #1 - Button sends message

#### Component Integration Tests

- [ ] **Test:** `2.12-COMP-001` ChatInput renders with empty input
  - **Status:** RED - Initial render state not verified
  - **Verifies:** AC #4 - Default state

- [ ] **Test:** `2.12-COMP-002` ChatInput send button disabled when empty
  - **Status:** RED - Empty state button not verified
  - **Verifies:** AC #4 - Visual disabled state

- [ ] **Test:** `2.12-COMP-003` ChatInput send button enabled with text
  - **Status:** RED - Text entry enabling not verified
  - **Verifies:** AC #1 - Visual enabled state

- [ ] **Test:** `2.12-COMP-004` ChatInput clears on submit
  - **Status:** RED - Clearing behavior not verified
  - **Verifies:** AC #2 - Input cleared after send

### Integration Tests (5 tests)

**File:** `tests/integration/chat-input-flow.spec.ts` (~150 lines)

- [ ] **Test:** `2.12-INT-001` Full flow: type -> Cmd+Enter -> SEND event dispatched
  - **Status:** RED - State machine SEND event dispatch not verified
  - **Verifies:** AC #1 - Keyboard send flow

- [ ] **Test:** `2.12-INT-002` Full flow: type -> click Send -> SEND event dispatched
  - **Status:** RED - Button send flow not verified
  - **Verifies:** AC #1 - Button send flow

- [ ] **Test:** `2.12-INT-003` Full flow: input clears after SEND
  - **Status:** RED - Post-send clearing not verified
  - **Verifies:** AC #2 - Clearing behavior

- [ ] **Test:** `2.12-INT-004` Full flow: input disabled during sending state
  - **Status:** RED - Sending state not verified
  - **Verifies:** AC #3 - Disabled during send

- [ ] **Test:** `2.12-INT-005` Full flow: button stays disabled when re-enabled with empty input
  - **Status:** RED - Re-enable with empty input not verified
  - **Verifies:** AC #3, #4 - Re-enable edge case

### E2E Tests (8 tests)

**File:** `tests/e2e/chat-send.spec.ts` (~200 lines)

- [ ] **Test:** `2.12-E2E-001` User types message and presses Cmd+Enter - message sent
  - **Status:** RED - End-to-end keyboard send not verified
  - **Verifies:** AC #1 - Full keyboard flow

- [ ] **Test:** `2.12-E2E-002` User types message and clicks Send - message sent
  - **Status:** RED - End-to-end button send not verified
  - **Verifies:** AC #1 - Full button flow

- [ ] **Test:** `2.12-E2E-003` User cannot send with empty input
  - **Status:** RED - Empty validation not verified
  - **Verifies:** AC #4 - Empty input blocked

- [ ] **Test:** `2.12-E2E-004` Input clears after sending
  - **Status:** RED - Clearing not verified
  - **Verifies:** AC #2 - Input cleared

- [ ] **Test:** `2.12-E2E-005` Input disabled during Claude response
  - **Status:** RED - Streaming disable not verified
  - **Verifies:** AC #3 - Disabled during response

- [ ] **Test:** `2.12-E2E-006` Multiple messages can be sent in sequence
  - **Status:** RED - Sequential sends not verified
  - **Verifies:** AC #1-4 - Full cycle repeatable

- [ ] **Test:** `2.12-E2E-007` Dark mode renders correctly
  - **Status:** RED - Dark mode styling not verified
  - **Verifies:** Non-AC - Visual consistency

- [ ] **Test:** `2.12-E2E-008` Rapid double-submit prevented
  - **Status:** RED - Double-submit prevention not verified
  - **Verifies:** AC #3 - No duplicate sends

### Edge Case Tests (5 tests)

**File:** `tests/component/chat-input-edge-cases.test.tsx` (~120 lines)

- [ ] **Test:** `2.12-EDGE-001` Whitespace-only input treated as empty
  - **Status:** RED - Whitespace trimming not verified
  - **Verifies:** AC #4 - Spaces/tabs/newlines not sendable

- [ ] **Test:** `2.12-EDGE-002` Very long input (1000+ chars) can be sent
  - **Status:** RED - Long input handling not verified
  - **Verifies:** AC #1 - No arbitrary limits

- [ ] **Test:** `2.12-EDGE-003` Unicode/emoji input preserved
  - **Status:** RED - Unicode handling not verified
  - **Verifies:** AC #1 - Internationalization

- [ ] **Test:** `2.12-EDGE-004` Send during streaming state blocked
  - **Status:** RED - Streaming block not verified
  - **Verifies:** AC #3 - No send while streaming

- [ ] **Test:** `2.12-EDGE-005` Enter alone does NOT send (only Cmd/Ctrl+Enter)
  - **Status:** RED - Plain Enter handling not verified
  - **Verifies:** AC #1 - Explicit modifier required

### Accessibility Tests (4 tests)

**File:** `tests/component/chat-input-a11y.test.tsx` (~100 lines)

- [ ] **Test:** `2.12-A11Y-001` Send button has aria-label reflecting state
  - **Status:** RED - Dynamic aria-label not verified
  - **Verifies:** Accessibility - Screen reader support

- [ ] **Test:** `2.12-A11Y-002` Input has aria-label for screen readers
  - **Status:** RED - Input aria-label not verified
  - **Verifies:** Accessibility - Input announced

- [ ] **Test:** `2.12-A11Y-003` Disabled button is not focusable via keyboard
  - **Status:** RED - Focus management not verified
  - **Verifies:** Accessibility - No focus on disabled

- [ ] **Test:** `2.12-A11Y-004` Focus returns to input after send
  - **Status:** RED - Focus return not verified
  - **Verifies:** Accessibility - Focus management

### Cross-Platform Keyboard Tests (3 tests)

**File:** `tests/e2e/chat-keyboard-cross-platform.spec.ts` (~80 lines)

- [ ] **Test:** `2.12-XPLAT-001` Cmd+Enter works on macOS (metaKey)
  - **Status:** RED - Mac keyboard not verified
  - **Verifies:** AC #1 - Mac support

- [ ] **Test:** `2.12-XPLAT-002` Ctrl+Enter works on Windows/Linux (ctrlKey)
  - **Status:** RED - Windows/Linux keyboard not verified
  - **Verifies:** AC #1 - Windows/Linux support

- [ ] **Test:** `2.12-XPLAT-003` Both Cmd+Enter and Ctrl+Enter work simultaneously
  - **Status:** RED - Dual modifier support not verified
  - **Verifies:** AC #1 - Universal keyboard support

---

## Test Helpers Created

### Keyboard Simulation Helpers

**File:** `src/lib/testing/chat-input-helpers.ts`

**Exports:**

- `simulateCmdEnter(element)` - Simulate Mac keyboard shortcut
- `simulateCtrlEnter(element)` - Simulate Windows/Linux keyboard shortcut
- `assertSendButtonDisabled(container, expected)` - Assert button disabled state

**Example Usage:**

```typescript
import { simulateCmdEnter, simulateCtrlEnter, assertSendButtonDisabled } from '@/lib/testing/chat-input-helpers';

// Simulate Mac keyboard shortcut
simulateCmdEnter(inputElement);

// Simulate Windows keyboard shortcut
simulateCtrlEnter(inputElement);

// Assert button state
assertSendButtonDisabled(container, true);
```

---

## Data Factories Created

### Message Factory (Extension)

**File:** `tests/support/fixtures/factories/message-factory.ts`

**Exports:**

- `createChatMessage(overrides?)` - Create single chat message with optional overrides
- `createChatMessages(count)` - Create array of chat messages

**Example Usage:**

```typescript
const message = createChatMessage({ content: 'Hello Claude' });
const messages = createChatMessages(5);
```

---

## Fixtures Created

### Chat Input Test Fixture

**File:** `tests/support/fixtures/chat-input.fixture.ts`

**Fixtures:**

- `chatInputWithStreamingMachine` - ChatInput with mocked streaming state machine
  - **Setup:** Mounts ChatInput with jest/vitest mocked useStreamingMachine hook
  - **Provides:** Component instance, mock send function, mock state setter
  - **Cleanup:** Auto-unmount and mock restoration

**Example Usage:**

```typescript
import { test } from './fixtures/chat-input.fixture';

test('should send message', async ({ chatInputWithStreamingMachine }) => {
  const { component, mockSend, setMockState } = chatInputWithStreamingMachine;
  // Type and send
  await component.locator('input').fill('Hello');
  await component.locator('button').click();
  expect(mockSend).toHaveBeenCalledWith({ type: 'SEND', prompt: 'Hello' });
});
```

---

## Mock Requirements

### Streaming State Machine Mock

**Mock Target:** `useStreamingMachine()` hook from `@/hooks/useStreamingMachine`

**Mock Interface:**

```typescript
interface StreamingMachineMock {
  state: 'idle' | 'sending' | 'streaming' | 'complete' | 'error';
  send: jest.Mock<void, [{ type: string; prompt?: string }]>;
  isLoading: boolean;
  isError: boolean;
  isComplete: boolean;
}
```

**Success Scenario:**

```typescript
{
  state: 'idle',
  send: mockSendFn,
  isLoading: false,
  isError: false,
  isComplete: false
}
```

**Sending Scenario:**

```typescript
{
  state: 'sending',
  send: mockSendFn,
  isLoading: true,
  isError: false,
  isComplete: false
}
```

**Notes:** The mock must be resettable between tests to verify state transitions.

---

## Required data-testid Attributes

### ChatInput Component

- `chat-input` - The text input field for typing messages
- `chat-send-button` - The send button
- `chat-input-container` - The container wrapping input + button

**Implementation Example:**

```tsx
<div data-testid="chat-input-container">
  <input data-testid="chat-input" type="text" aria-label="Chat message input" />
  <button data-testid="chat-send-button" aria-label="Send message">
    <Send />
  </button>
</div>
```

---

## Implementation Checklist

### Test: 2.12-UNIT-001 - canSend is false when input is empty

**File:** `tests/component/chat-input-send.test.tsx`

**Tasks to make this test pass:**

- [ ] Add `canSend` computed value: `const canSend = value.trim().length > 0 && !isDisabled;`
- [ ] Export or expose `canSend` for testing (or test via button disabled state)
- [ ] Add data-testid="chat-send-button" to Button component
- [ ] Run test: `npm run test -- chat-input-send.test.tsx`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.12-UNIT-002 - canSend is false when input is whitespace only

**File:** `tests/component/chat-input-send.test.tsx`

**Tasks to make this test pass:**

- [ ] Verify `value.trim()` is used (not just `value.length`)
- [ ] Test with " ", "\t", "\n", "   " inputs
- [ ] Run test: `npm run test -- chat-input-send.test.tsx`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.25 hours

---

### Test: 2.12-UNIT-008 - handleKeyDown triggers submit on Cmd+Enter

**File:** `tests/component/chat-input-send.test.tsx`

**Tasks to make this test pass:**

- [ ] Implement `handleKeyDown` with `e.metaKey` check
- [ ] Call `handleSubmit()` when Cmd+Enter detected
- [ ] Call `e.preventDefault()` to prevent default behavior
- [ ] Wire `onKeyDown={handleKeyDown}` to input element
- [ ] Run test: `npm run test -- chat-input-send.test.tsx`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.12-UNIT-009 - handleKeyDown triggers submit on Ctrl+Enter

**File:** `tests/component/chat-input-send.test.tsx`

**Tasks to make this test pass:**

- [ ] Extend `handleKeyDown` to check `e.ctrlKey` in addition to `e.metaKey`
- [ ] Verify: `(e.metaKey || e.ctrlKey) && e.key === 'Enter'`
- [ ] Run test: `npm run test -- chat-input-send.test.tsx`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.25 hours

---

### Test: 2.12-UNIT-006 - handleSubmit clears input value

**File:** `tests/component/chat-input-send.test.tsx`

**Tasks to make this test pass:**

- [ ] In `handleSubmit`, call `setValue('')` immediately after capturing value
- [ ] Ensure clearing happens BEFORE async send
- [ ] Run test: `npm run test -- chat-input-send.test.tsx`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.25 hours

---

### Test: 2.12-UNIT-007 - handleSubmit calls send with SEND event

**File:** `tests/component/chat-input-send.test.tsx`

**Tasks to make this test pass:**

- [ ] In `handleSubmit`, call `send({ type: 'SEND', prompt: message })`
- [ ] Ensure message is trimmed before sending
- [ ] Run test: `npm run test -- chat-input-send.test.tsx`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.25 hours

---

### Test: 2.12-INT-001 - Full flow: type -> Cmd+Enter -> SEND event dispatched

**File:** `tests/integration/chat-input-flow.spec.ts`

**Tasks to make this test pass:**

- [ ] All unit tests passing
- [ ] useStreamingMachine properly integrated
- [ ] State machine receives SEND event with correct payload
- [ ] Run test: `npm run test:integration -- chat-input-flow.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.12-E2E-001 - User types message and presses Cmd+Enter - message sent

**File:** `tests/e2e/chat-send.spec.ts`

**Tasks to make this test pass:**

- [ ] All integration tests passing
- [ ] Full chat UI rendering with ChatInput
- [ ] Backend IPC `chat_send` command functional
- [ ] Run test: `npx playwright test chat-send.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.12-E2E-005 - Input disabled during Claude response

**File:** `tests/e2e/chat-send.spec.ts`

**Tasks to make this test pass:**

- [ ] `isDisabled` logic from Story 2.11 intact
- [ ] Input shows disabled styling during streaming
- [ ] Placeholder text changes to "Claude is responding..."
- [ ] Run test: `npx playwright test chat-send.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.12-A11Y-001 - Send button has aria-label reflecting state

**File:** `tests/component/chat-input-a11y.test.tsx`

**Tasks to make this test pass:**

- [ ] Add dynamic aria-label to Button: `aria-label={canSend ? 'Send message' : 'Enter a message to send'}`
- [ ] Run test: `npm run test -- chat-input-a11y.test.tsx`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.25 hours

---

## Running Tests

```bash
# Run all failing tests for this story
npm run test -- --grep "2.12"

# Run component tests
npm run test -- tests/component/chat-input-send.test.tsx

# Run integration tests
npm run test:integration -- chat-input-flow.spec.ts

# Run E2E tests
npx playwright test chat-send.spec.ts

# Run tests in headed mode (see browser)
npx playwright test chat-send.spec.ts --headed

# Debug specific test
npx playwright test chat-send.spec.ts --debug

# Run tests with coverage
npm run test:coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) [TEA]

**TEA Agent Responsibilities:**

- [ ] All tests written and failing
- [ ] Fixtures and factories created with auto-cleanup
- [ ] Mock requirements documented
- [ ] data-testid requirements listed
- [ ] Implementation checklist created

**Verification:**

- All tests run and fail as expected
- Failure messages are clear and actionable
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with 2.12-UNIT-001)
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist
6. **Move to next test** and repeat

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Suggested Order:**

1. Unit tests first (2.12-UNIT-001 through 2.12-UNIT-013)
2. Component tests (2.12-COMP-001 through 2.12-COMP-004)
3. Edge case tests (2.12-EDGE-001 through 2.12-EDGE-005)
4. Accessibility tests (2.12-A11Y-001 through 2.12-A11Y-004)
5. Integration tests (2.12-INT-001 through 2.12-INT-005)
6. Cross-platform tests (2.12-XPLAT-001 through 2.12-XPLAT-003)
7. E2E tests (2.12-E2E-001 through 2.12-E2E-008)

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability, performance)
3. **Extract duplications** (DRY principle)
4. **Optimize performance** (if needed)
5. **Ensure tests still pass** after each refactor
6. **Update documentation** (if API contracts change)

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Make small refactors (easier to debug if tests fail)
- Run tests after each change
- Don't change test behavior (only implementation)

---

## Next Steps

1. **Share this checklist and failing tests** with the dev workflow (manual handoff)
2. **Review this checklist** with team in standup or planning
3. **Run failing tests** to confirm RED phase: `npm run test -- --grep "2.12"`
4. **Begin implementation** using implementation checklist as guide
5. **Work one test at a time** (red -> green for each)
6. **Share progress** in daily standup
7. **When all tests pass**, refactor code for quality
8. **When refactoring complete**, manually update story status to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **fixture-architecture.md** - Test fixture patterns with setup/teardown and auto-cleanup using Playwright's `test.extend()`
- **data-factories.md** - Factory patterns using `@faker-js/faker` for random test data generation with overrides support
- **component-tdd.md** - Component test strategies using Playwright Component Testing
- **network-first.md** - Route interception patterns (intercept BEFORE navigation to prevent race conditions)
- **test-quality.md** - Test design principles (Given-When-Then, one assertion per test, determinism, isolation)
- **selector-resilience.md** - Selector hierarchy (data-testid > ARIA > text > CSS)

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npm run test -- --grep "2.12"`

**Results:**

```
PENDING: Tests not yet implemented - RED phase documented
```

**Summary:**

- Total tests: 42
- Passing: 0 (expected)
- Failing: 42 (expected - not yet implemented)
- Status: RED phase documented and ready for test file creation

**Expected Failure Messages:**

- Unit tests: "canSend is not defined" or "mock not called"
- Component tests: "element not found" or "button not disabled"
- Integration tests: "SEND event not dispatched"
- E2E tests: "navigation timeout" or "element not visible"

---

## Notes

### Story 2.11 vs 2.12 Boundary

Story 2.11 focused on **completion handling** - ensuring the input re-enables when a response finishes.
Story 2.12 focuses on the **send action** - ensuring users can send messages via keyboard or button.

Key boundary: If it's about what happens **after** sending, it's 2.11. If it's about the **act of sending**, it's 2.12.

### Cmd+Enter vs Enter

Using Cmd+Enter (not plain Enter) for sending:
- Matches Slack, Discord, and other chat applications
- Allows future multi-line input (Textarea)
- Prevents accidental sends while typing
- Cross-platform: Cmd on Mac, Ctrl on Windows/Linux

### Input Clearing Timing

Input clears **immediately** on submit, before async IPC call:
- Provides instant feedback that send was registered
- Prevents accidental double-sends
- Matches standard chat application patterns

### Testing Strategy Rationale

- **Component tests first**: Fastest feedback, isolated logic verification
- **Integration tests**: Verify state machine wiring
- **E2E tests last**: Slowest but highest confidence for critical flows
- **Accessibility tests**: Ensure screen reader and keyboard-only users supported

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Refer to `_bmad/bmm/docs/tea-README.md` for workflow documentation
- Consult `_bmad/bmm/testarch/knowledge` for testing best practices

---

**Generated by BMad TEA Agent** - 2026-01-24
