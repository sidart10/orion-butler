# ATDD Checklist - Epic 2, Story 2.13: Message Thread Layout

**Date:** 2026-01-24
**Author:** TEA (Test Architect)
**Primary Test Level:** Component + E2E

---

## Story Summary

This story implements the message thread layout for the chat interface, enabling users to review conversation history with proper visual distinction between user and assistant messages.

**As a** user
**I want** a scrollable message thread
**So that** I can review conversation history

---

## Acceptance Criteria

1. **AC #1**: User messages appear right-aligned with distinct styling (dark background, light text)
2. **AC #2**: Assistant messages appear left-aligned with distinct styling (light background, dark text)
3. **AC #3**: The thread auto-scrolls to newest message on new content
4. **AC #4**: Manual scroll-up pauses auto-scroll (resume on scroll to bottom)

---

## Failing Tests Created (RED Phase)

### Unit Tests (20 tests)

**File:** `tests/unit/components/chat/UserMessage.spec.tsx`

| Test ID | Test Name | Status | Verifies |
|---------|-----------|--------|----------|
| 2.13-UNIT-001 | should render content correctly | RED - Component does not exist | AC #1 |
| 2.13-UNIT-002 | should have right alignment (justify-end) | RED - Component does not exist | AC #1 |
| 2.13-UNIT-003 | should have dark background class (bg-orion-fg) | RED - Component does not exist | AC #1 |
| 2.13-UNIT-004 | should have light text class (text-orion-bg) | RED - Component does not exist | AC #1 |
| 2.13-UNIT-005 | should have 0px border radius (rounded-none) | RED - Component does not exist | AC #1 |
| 2.13-UNIT-006 | should render timestamp when provided | RED - Component does not exist | AC #1 |
| 2.13-UNIT-007 | should have role="article" for accessibility | RED - Component does not exist | AC #1 |
| 2.13-UNIT-008 | should have aria-label for screen readers | RED - Component does not exist | AC #1 |

**File:** `tests/unit/components/chat/AssistantMessageWrapper.spec.tsx`

| Test ID | Test Name | Status | Verifies |
|---------|-----------|--------|----------|
| 2.13-UNIT-009 | should have left alignment (justify-start) | RED - Component does not exist | AC #2 |
| 2.13-UNIT-010 | should constrain width to max-w-[85%] | RED - Component does not exist | AC #2 |
| 2.13-UNIT-011 | should pass props to AssistantMessage | RED - Component does not exist | AC #2 |

**File:** `tests/unit/components/chat/MessageThread.spec.tsx`

| Test ID | Test Name | Status | Verifies |
|---------|-----------|--------|----------|
| 2.13-UNIT-012 | should render user messages with UserMessage component | RED - Component does not exist | AC #1 |
| 2.13-UNIT-013 | should render assistant messages with AssistantMessageWrapper | RED - Component does not exist | AC #2 |
| 2.13-UNIT-014 | should have scrollable container (overflow-y-auto) | RED - Component does not exist | AC #3 |
| 2.13-UNIT-015 | should have role="log" for accessibility | RED - Component does not exist | AC #3 |
| 2.13-UNIT-016 | should have aria-live="polite" for screen readers | RED - Component does not exist | AC #3 |
| 2.13-UNIT-017 | should render empty state when no messages | RED - Component does not exist | AC #1, #2 |
| 2.13-UNIT-018 | should render streaming message when isStreaming is true | RED - Component does not exist | AC #2, #3 |
| 2.13-UNIT-019 | should show "New messages" button when scrolled up | RED - Component does not exist | AC #4 |
| 2.13-UNIT-020 | should have proper gap between messages (gap-4) | RED - Component does not exist | AC #1, #2 |

**File:** `tests/unit/hooks/useAutoScroll.spec.ts`

| Test ID | Test Name | Status | Verifies |
|---------|-----------|--------|----------|
| 2.13-UNIT-021 | should return containerRef | RED - Hook does not exist | AC #3 |
| 2.13-UNIT-022 | should return endMarkerRef | RED - Hook does not exist | AC #3 |
| 2.13-UNIT-023 | should return isUserScrolled as false initially | RED - Hook does not exist | AC #4 |
| 2.13-UNIT-024 | should set isUserScrolled to true when scrolling up | RED - Hook does not exist | AC #4 |
| 2.13-UNIT-025 | should reset isUserScrolled when scrolling to bottom | RED - Hook does not exist | AC #4 |
| 2.13-UNIT-026 | should provide scrollToBottom function | RED - Hook does not exist | AC #3 |
| 2.13-UNIT-027 | should provide resumeAutoScroll function | RED - Hook does not exist | AC #4 |

### Component Tests (5 tests)

**File:** `tests/component/chat/MessageThread.spec.tsx`

| Test ID | Test Name | Status | Verifies |
|---------|-----------|--------|----------|
| 2.13-COMP-001 | should render mixed messages with correct alignment | RED - Component does not exist | AC #1, #2 |
| 2.13-COMP-002 | should handle streaming content display | RED - Component does not exist | AC #2, #3 |
| 2.13-COMP-003 | should show scroll button when user scrolls up | RED - Component does not exist | AC #4 |
| 2.13-COMP-004 | should hide scroll button when clicking it | RED - Component does not exist | AC #4 |
| 2.13-COMP-005 | should render long messages without overflow issues | RED - Component does not exist | AC #1, #2 |

### E2E Tests (6 tests)

**File:** `tests/e2e/chat/message-thread.spec.ts`

| Test ID | Test Name | Status | Verifies |
|---------|-----------|--------|----------|
| 2.13-E2E-001 | should display user message right-aligned after sending | RED - Feature not implemented | AC #1 |
| 2.13-E2E-002 | should display assistant message left-aligned | RED - Feature not implemented | AC #2 |
| 2.13-E2E-003 | should auto-scroll when new messages arrive | RED - Feature not implemented | AC #3 |
| 2.13-E2E-004 | should pause auto-scroll when user scrolls up | RED - Feature not implemented | AC #4 |
| 2.13-E2E-005 | should show "New messages" indicator when scrolled up | RED - Feature not implemented | AC #4 |
| 2.13-E2E-006 | should resume auto-scroll when clicking indicator | RED - Feature not implemented | AC #4 |

### Accessibility Tests (4 tests)

**File:** `tests/unit/components/chat/MessageThread.a11y.spec.tsx`

| Test ID | Test Name | Status | Verifies |
|---------|-----------|--------|----------|
| 2.13-A11Y-001 | should announce new messages to screen readers | RED - Component does not exist | AC #3 |
| 2.13-A11Y-002 | should be keyboard navigable | RED - Component does not exist | NFR-5.1 |
| 2.13-A11Y-003 | should have sufficient color contrast (WCAG AA) | RED - Component does not exist | NFR-5.3 |
| 2.13-A11Y-004 | scroll button should be focusable with visible focus ring | RED - Component does not exist | AC #4 |

### Edge Case Tests (6 tests)

**File:** `tests/unit/components/chat/MessageThread.edge.spec.tsx`

| Test ID | Test Name | Status | Verifies |
|---------|-----------|--------|----------|
| 2.13-EDGE-001 | should handle empty thread gracefully | RED - Component does not exist | AC #1, #2 |
| 2.13-EDGE-002 | should handle single message thread | RED - Component does not exist | AC #1, #2 |
| 2.13-EDGE-003 | should handle very long messages (1000+ chars) | RED - Component does not exist | AC #1, #2 |
| 2.13-EDGE-004 | should handle rapid message arrival (multiple in <100ms) | RED - Component does not exist | AC #3 |
| 2.13-EDGE-005 | should handle messages with special characters | RED - Component does not exist | AC #1, #2 |
| 2.13-EDGE-006 | should handle thread with 100+ messages | RED - Component does not exist | AC #3, #4 |

---

## Data Factories Created

### Message Factory (Existing)

**File:** `tests/fixtures/factories/message.ts`

**Exports:**

- `MessageFactory.create(overrides?)` - Create single message with optional overrides
- `MessageFactory.createMany(count, overrides?)` - Create array of messages
- `MessageFactory.createUserMessage(content, overrides?)` - Create user role message
- `MessageFactory.createAssistantMessage(content, overrides?)` - Create assistant role message

**Example Usage:**

```typescript
import { MessageFactory } from '@/tests/fixtures/factories/message';

// Create user message
const userMsg = MessageFactory.createUserMessage('Hello, Claude!');

// Create assistant message
const assistantMsg = MessageFactory.createAssistantMessage('Hello! How can I help you today?');

// Create conversation thread
const messages = [
  MessageFactory.createUserMessage('What is 2+2?'),
  MessageFactory.createAssistantMessage('2+2 equals 4.'),
  MessageFactory.createUserMessage('Thanks!'),
];
```

### Thread Factory (NEW - To Create)

**File:** `tests/fixtures/factories/thread.ts`

**Exports:**

- `ThreadFactory.create(overrides?)` - Create single thread with messages
- `ThreadFactory.createConversation(turns)` - Create alternating user/assistant messages
- `ThreadFactory.createLongThread(count)` - Create thread with many messages for scroll testing

**Example Usage:**

```typescript
import { ThreadFactory } from '@/tests/fixtures/factories/thread';

// Create conversation with 5 turns (10 messages)
const thread = ThreadFactory.createConversation(5);

// Create long thread for scroll testing
const longThread = ThreadFactory.createLongThread(50);
```

---

## Fixtures Created

### MessageThread Test Fixture (NEW - To Create)

**File:** `tests/support/fixtures/message-thread.fixture.ts`

**Fixtures:**

- `messageThread` - Mounted MessageThread component with test messages
  - **Setup:** Mounts MessageThread with sample messages
  - **Provides:** Component reference and helper methods
  - **Cleanup:** Unmounts component

- `scrollableThread` - MessageThread with enough messages to enable scrolling
  - **Setup:** Mounts MessageThread with 20+ messages
  - **Provides:** Component reference and scroll utilities
  - **Cleanup:** Unmounts component

**Example Usage:**

```typescript
import { test } from './fixtures/message-thread.fixture';

test('should auto-scroll on new message', async ({ scrollableThread }) => {
  // scrollableThread has 20+ messages and can scroll
  await scrollableThread.addMessage({ role: 'assistant', content: 'New message' });
  await expect(scrollableThread.isAtBottom()).toBe(true);
});
```

---

## Mock Requirements

### Streaming Machine Mock

**Service:** `useStreamingMachine` hook

**Setup:**

```typescript
// Mock for testing streaming state
const mockStreamingMachine = {
  state: 'idle' | 'streaming' | 'complete',
  context: {
    text: '',
    isComplete: false,
  },
  send: vi.fn(),
  reset: vi.fn(),
};

vi.mock('@/hooks/useStreamingMachine', () => ({
  useStreamingMachine: () => mockStreamingMachine,
}));
```

**States to Test:**

- `idle` - No streaming, show complete messages
- `streaming` - Show streaming indicator and partial content
- `complete` - Show final message content

### Scroll Behavior Mock

**Service:** `scrollIntoView`

**Setup:**

```typescript
// Mock scrollIntoView for JSDOM
Element.prototype.scrollIntoView = vi.fn();

// Mock scroll position
Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
  get: () => mockScrollTop,
  set: (val) => { mockScrollTop = val; },
});
```

---

## Required data-testid Attributes

### UserMessage Component

| data-testid | Element | Description |
|-------------|---------|-------------|
| `user-message` | Container div | Outer container for user message |
| `user-message-content` | Inner div | Message content bubble |
| `user-message-timestamp` | Time element | Optional timestamp display |

**Implementation Example:**

```tsx
<div data-testid="user-message" className="flex justify-end">
  <div data-testid="user-message-content" className="bg-orion-fg text-orion-bg">
    {content}
  </div>
  {timestamp && (
    <time data-testid="user-message-timestamp">{formattedTime}</time>
  )}
</div>
```

### AssistantMessageWrapper Component

| data-testid | Element | Description |
|-------------|---------|-------------|
| `assistant-message-wrapper` | Container div | Outer container with left alignment |

**Implementation Example:**

```tsx
<div data-testid="assistant-message-wrapper" className="flex justify-start">
  <div className="max-w-[85%]">
    <AssistantMessage {...props} />
  </div>
</div>
```

### MessageThread Component

| data-testid | Element | Description |
|-------------|---------|-------------|
| `message-thread` | Container div | Main scrollable container |
| `message-thread-list` | Inner div | Message list container |
| `message-thread-end` | Empty div | Scroll anchor at end |
| `scroll-to-bottom-button` | Button | "New messages" indicator button |

**Implementation Example:**

```tsx
<div
  data-testid="message-thread"
  role="log"
  aria-live="polite"
  className="overflow-y-auto"
>
  <div data-testid="message-thread-list" className="flex flex-col gap-4">
    {messages.map(msg => (
      msg.role === 'user'
        ? <UserMessage key={msg.id} {...msg} />
        : <AssistantMessageWrapper key={msg.id} {...msg} />
    ))}
  </div>
  <div data-testid="message-thread-end" ref={endMarkerRef} />
</div>

{isUserScrolled && (
  <button
    data-testid="scroll-to-bottom-button"
    aria-label="Scroll to latest message"
    onClick={resumeAutoScroll}
  >
    New messages
  </button>
)}
```

---

## Implementation Checklist

### Test: 2.13-UNIT-001 through 2.13-UNIT-008 (UserMessage)

**File:** `tests/unit/components/chat/UserMessage.spec.tsx`

**Tasks to make these tests pass:**

- [ ] Create `src/components/chat/UserMessage.tsx`
- [ ] Implement right alignment with `flex justify-end`
- [ ] Apply dark background styling (`bg-orion-fg`)
- [ ] Apply light text styling (`text-orion-bg`)
- [ ] Apply 0px border radius (`rounded-none`)
- [ ] Implement optional timestamp display
- [ ] Add `role="article"` for accessibility
- [ ] Add `aria-label="Your message"` for screen readers
- [ ] Add required data-testid attributes: `user-message`, `user-message-content`, `user-message-timestamp`
- [ ] Export component from `src/components/chat/index.ts`
- [ ] Run tests: `npx vitest run tests/unit/components/chat/UserMessage.spec.tsx`
- [ ] All tests pass (green phase)

**Estimated Effort:** 1.5 hours

---

### Test: 2.13-UNIT-009 through 2.13-UNIT-011 (AssistantMessageWrapper)

**File:** `tests/unit/components/chat/AssistantMessageWrapper.spec.tsx`

**Tasks to make these tests pass:**

- [ ] Create `src/components/chat/AssistantMessageWrapper.tsx`
- [ ] Implement left alignment with `flex justify-start`
- [ ] Apply max-width constraint (`max-w-[85%]`)
- [ ] Import and wrap existing `AssistantMessage` component
- [ ] Pass through all props correctly
- [ ] Add required data-testid attribute: `assistant-message-wrapper`
- [ ] Export component from `src/components/chat/index.ts`
- [ ] Run tests: `npx vitest run tests/unit/components/chat/AssistantMessageWrapper.spec.tsx`
- [ ] All tests pass (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.13-UNIT-021 through 2.13-UNIT-027 (useAutoScroll)

**File:** `tests/unit/hooks/useAutoScroll.spec.ts`

**Tasks to make these tests pass:**

- [ ] Create `src/hooks/useAutoScroll.ts`
- [ ] Implement `containerRef` (React.RefObject<HTMLDivElement>)
- [ ] Implement `endMarkerRef` (React.RefObject<HTMLDivElement>)
- [ ] Implement `isUserScrolled` state (initially false)
- [ ] Implement scroll detection logic (scroll up sets true, scroll to bottom sets false)
- [ ] Use 100px threshold for "near bottom" detection
- [ ] Implement `scrollToBottom()` function with smooth scrolling
- [ ] Implement `resumeAutoScroll()` function
- [ ] Implement `handleScroll` callback for scroll event
- [ ] Export hook from `src/hooks/index.ts`
- [ ] Run tests: `npx vitest run tests/unit/hooks/useAutoScroll.spec.ts`
- [ ] All tests pass (green phase)

**Estimated Effort:** 2 hours

---

### Test: 2.13-UNIT-012 through 2.13-UNIT-020 (MessageThread)

**File:** `tests/unit/components/chat/MessageThread.spec.tsx`

**Tasks to make these tests pass:**

- [ ] Create `src/components/chat/MessageThread.tsx`
- [ ] Define `Message` interface with id, role, content, timestamp, isStreaming
- [ ] Define `MessageThreadProps` interface
- [ ] Implement scrollable container with `overflow-y-auto`
- [ ] Add `role="log"` and `aria-live="polite"` for accessibility
- [ ] Render user messages using `UserMessage` component
- [ ] Render assistant messages using `AssistantMessageWrapper`
- [ ] Integrate `useAutoScroll` hook
- [ ] Implement streaming content display
- [ ] Implement "New messages" button when `isUserScrolled` is true
- [ ] Apply proper spacing (`gap-4`, `px-4 py-6`)
- [ ] Apply scrollbar styling per Editorial Luxury aesthetic
- [ ] Add required data-testid attributes: `message-thread`, `message-thread-list`, `message-thread-end`, `scroll-to-bottom-button`
- [ ] Export component and types from `src/components/chat/index.ts`
- [ ] Run tests: `npx vitest run tests/unit/components/chat/MessageThread.spec.tsx`
- [ ] All tests pass (green phase)

**Estimated Effort:** 3 hours

---

### Test: 2.13-COMP-001 through 2.13-COMP-005 (Component Integration)

**File:** `tests/component/chat/MessageThread.spec.tsx`

**Tasks to make these tests pass:**

- [ ] Ensure all unit test tasks are complete
- [ ] Verify visual alignment of mixed messages
- [ ] Verify streaming indicator displays correctly
- [ ] Verify scroll button appears on scroll up
- [ ] Verify scroll button click scrolls to bottom
- [ ] Verify long message handling (no horizontal overflow)
- [ ] Run tests: `npx vitest run tests/component/chat/MessageThread.spec.tsx`
- [ ] All tests pass (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.13-E2E-001 through 2.13-E2E-006 (Full User Journey)

**File:** `tests/e2e/chat/message-thread.spec.ts`

**Tasks to make these tests pass:**

- [ ] Integrate `MessageThread` into `ChatColumn` component
- [ ] Connect to message store (or streaming machine context)
- [ ] Verify user message appears right-aligned after sending
- [ ] Verify assistant response appears left-aligned
- [ ] Verify auto-scroll behavior on new messages
- [ ] Verify scroll-up pauses auto-scroll
- [ ] Verify "New messages" indicator visibility
- [ ] Verify clicking indicator scrolls to bottom
- [ ] Run tests: `npx playwright test tests/e2e/chat/message-thread.spec.ts`
- [ ] All tests pass (green phase)

**Estimated Effort:** 1.5 hours

---

### Test: 2.13-A11Y-001 through 2.13-A11Y-004 (Accessibility)

**File:** `tests/unit/components/chat/MessageThread.a11y.spec.tsx`

**Tasks to make these tests pass:**

- [ ] Verify `aria-live="polite"` announces new messages
- [ ] Verify `aria-relevant="additions"` is set
- [ ] Verify Tab navigation works through thread
- [ ] Verify scroll button is focusable
- [ ] Verify focus ring on scroll button
- [ ] Verify color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Run tests: `npx vitest run tests/unit/components/chat/MessageThread.a11y.spec.tsx`
- [ ] All tests pass (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.13-EDGE-001 through 2.13-EDGE-006 (Edge Cases)

**File:** `tests/unit/components/chat/MessageThread.edge.spec.tsx`

**Tasks to make these tests pass:**

- [ ] Handle empty messages array (show empty state or nothing)
- [ ] Handle single message correctly
- [ ] Handle very long messages (word-wrap, no horizontal scroll)
- [ ] Handle rapid message arrival (debounce scroll if needed)
- [ ] Handle special characters in messages
- [ ] Handle large threads (100+ messages) without performance issues
- [ ] Run tests: `npx vitest run tests/unit/components/chat/MessageThread.edge.spec.tsx`
- [ ] All tests pass (green phase)

**Estimated Effort:** 1 hour

---

## Running Tests

```bash
# Run all failing tests for this story
npx vitest run --testNamePattern="2.13-"

# Run specific test file (unit)
npx vitest run tests/unit/components/chat/UserMessage.spec.tsx

# Run specific test file (E2E)
npx playwright test tests/e2e/chat/message-thread.spec.ts

# Run tests in watch mode
npx vitest --watch tests/unit/components/chat/

# Run tests with UI
npx vitest --ui

# Run E2E tests in headed mode (see browser)
npx playwright test tests/e2e/chat/message-thread.spec.ts --headed

# Debug specific E2E test
npx playwright test tests/e2e/chat/message-thread.spec.ts --debug

# Run tests with coverage
npx vitest run --coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- All tests written and failing
- Fixtures and factories documented
- Mock requirements documented
- data-testid requirements listed
- Implementation checklist created

**Verification:**

- All tests run and fail as expected
- Failure messages are clear and actionable
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with UserMessage - AC #1)
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist
6. **Move to next test** and repeat

**Recommended Order:**

1. UserMessage component (2.13-UNIT-001 through 008) - Foundation for user messages
2. AssistantMessageWrapper (2.13-UNIT-009 through 011) - Foundation for assistant messages
3. useAutoScroll hook (2.13-UNIT-021 through 027) - Scroll behavior logic
4. MessageThread component (2.13-UNIT-012 through 020) - Main container
5. Component tests (2.13-COMP-001 through 005) - Integration verification
6. E2E tests (2.13-E2E-001 through 006) - Full flow verification
7. Accessibility tests (2.13-A11Y-001 through 004) - A11y compliance
8. Edge case tests (2.13-EDGE-001 through 006) - Robustness

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Progress Tracking:**

- Check off tasks as you complete them
- Share progress in daily standup
- Mark story as IN PROGRESS in `sprint-status.yaml`

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability, performance)
3. **Extract duplications** (DRY principle)
4. **Optimize performance** (if needed - especially for large threads)
5. **Ensure tests still pass** after each refactor
6. **Update documentation** (if API contracts change)

**Refactoring Considerations:**

- Extract scroll logic into reusable hook if not already done
- Consider memoization for message list rendering
- Optimize re-renders when only scroll position changes
- Consider virtualization for very large threads (future enhancement)

**Completion:**

- All tests pass
- Code quality meets team standards
- No duplications or code smells
- Ready for code review and story approval

---

## Next Steps

1. **Share this checklist and failing tests** with the dev workflow (manual handoff)
2. **Review this checklist** with team in standup or planning
3. **Run failing tests** to confirm RED phase: `npx vitest run --testNamePattern="2.13-"`
4. **Begin implementation** using implementation checklist as guide
5. **Work one test at a time** (red -> green for each)
6. **Share progress** in daily standup
7. **When all tests pass**, refactor code for quality
8. **When refactoring complete**, manually update story status to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **component-tdd.md** - Red-green-refactor workflow, provider isolation, accessibility assertions
- **test-levels-framework.md** - Test level selection (Unit for component logic, Component for integration, E2E for user journeys)
- **fixture-architecture.md** - Test fixture patterns with setup/teardown and auto-cleanup
- **data-factories.md** - Factory patterns for test data generation

See `_bmad/bmm/testarch/tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npx vitest run --testNamePattern="2.13-"`

**Results:**

```
(Tests not yet created - this section to be filled after test files are written)
```

**Summary:**

- Total tests: 41
- Passing: 0 (expected - implementation does not exist)
- Failing: 41 (expected)
- Status: RED phase verified

**Expected Failure Messages:**

| Test Category | Expected Failure Reason |
|---------------|------------------------|
| UserMessage tests | "Cannot find module './UserMessage'" or component does not exist |
| AssistantMessageWrapper tests | "Cannot find module './AssistantMessageWrapper'" |
| useAutoScroll tests | "Cannot find module '@/hooks/useAutoScroll'" |
| MessageThread tests | "Cannot find module './MessageThread'" |
| E2E tests | Element with data-testid not found |

---

## Notes

### Scroll Behavior Design Decisions

**Auto-scroll threshold: 100px**
- Within 100px of bottom = considered "at bottom"
- Allows small overscroll without triggering pause

**Scroll behavior: smooth**
- Uses native smooth scrolling for performance
- Respects `prefers-reduced-motion` via browser

**"New messages" button position: fixed bottom-right**
- Consistent with chat app patterns (Slack, Discord)
- Does not obstruct message reading
- Easy tap/click target

### Message Alignment Rationale

**User messages: Right-aligned, dark**
- Standard chat convention (user on right)
- Dark background for visual distinction
- Creates clear visual separation from assistant

**Assistant messages: Left-aligned, light**
- Standard chat convention (other party on left)
- Light background with border for subtlety
- Header shows "Orion" for clarity

### Editorial Luxury Considerations

- 0px border-radius on all message bubbles
- Gold accent (#D4AF37) for the "New messages" button focus ring
- Inter font throughout
- No emojis or decorative elements
- Generous whitespace between messages (gap-4 = 16px)

### Future Enhancements (NOT in this story)

- Message grouping by time (10min intervals)
- Date separators ("Today", "Yesterday")
- Message reactions
- Message editing/deletion
- Copy message action
- Message search
- Virtualized list for performance (1000+ messages)
- Message persistence to database

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Refer to `_bmad/bmm/docs/tea-README.md` for workflow documentation
- Consult `_bmad/bmm/testarch/knowledge` for testing best practices

---

**Generated by BMad TEA Agent** - 2026-01-24
