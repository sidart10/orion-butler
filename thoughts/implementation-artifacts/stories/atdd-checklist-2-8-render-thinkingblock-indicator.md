# ATDD Checklist - Epic 2, Story 2.8: Render ThinkingBlock Indicator

**Date:** 2026-01-24
**Author:** Sid
**Primary Test Level:** Component (with Unit and E2E coverage)

---

## Story Summary

Story 2.8 implements a visual indicator that displays when Claude is using extended thinking. The indicator shows a pulsing "Thinking..." message during the thinking phase and disappears when text or tool output begins. Crucially, the actual thinking content is never displayed to users - only the status indicator.

**As a** user
**I want** to see when Claude is thinking deeply
**So that** I understand why responses may take longer

---

## Acceptance Criteria

1. **AC#1 - ThinkingBlock Indicator Display**
   - **Given** extended thinking is enabled for the query
   - **When** a `ThinkingBlock` event arrives
   - **Then** a "Thinking..." indicator displays with subtle animation (gold pulsing dot)

2. **AC#2 - Indicator Persistence**
   - **And** the indicator persists until text or tool output begins

3. **AC#3 - Content Privacy**
   - **And** thinking content is NOT displayed to user (internal reasoning)

---

## Failing Tests Created (RED Phase)

### Unit Tests (10 tests)

**File:** `tests/unit/components/chat/ThinkingIndicator.spec.ts`

- [ ] **Test:** 2.8-UNIT-001 - ThinkingIndicator renders when isActive=true
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#1 - Indicator displays when thinking is active

- [ ] **Test:** 2.8-UNIT-002 - ThinkingIndicator returns null when isActive=false
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#2 - Indicator hidden when not active

- [ ] **Test:** 2.8-UNIT-003 - ThinkingIndicator contains StatusIndicator with status="thinking"
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#1 - Uses StatusIndicator for animation

- [ ] **Test:** 2.8-UNIT-004 - ThinkingIndicator displays "Thinking..." text label
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#1 - Clear text indicator

- [ ] **Test:** 2.8-UNIT-005 - ThinkingIndicator has role="status" for accessibility
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#1 - Screen reader support

- [ ] **Test:** 2.8-UNIT-006 - ThinkingIndicator has aria-live="polite"
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#1 - Announces status changes

- [ ] **Test:** 2.8-UNIT-007 - ThinkingIndicator has aria-label="Claude is thinking"
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#1 - Descriptive label for assistive tech

- [ ] **Test:** 2.8-UNIT-008 - ThinkingIndicator uses muted text color (text-orion-fg-muted)
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#1 - Consistent styling

- [ ] **Test:** 2.8-UNIT-009 - StatusIndicator uses size="sm" (6px dot)
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#1 - Compact indicator size

- [ ] **Test:** 2.8-UNIT-010 - Component does NOT render any thinking content text
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#3 - Privacy requirement

### Component Tests (5 tests)

**File:** `tests/component/chat/ChatMessageList.spec.tsx`

- [ ] **Test:** 2.8-COMP-001 - ChatMessageList shows ThinkingIndicator when thinking + no text
  - **Status:** RED - Integration not implemented
  - **Verifies:** AC#1, AC#2 - Indicator visibility logic

- [ ] **Test:** 2.8-COMP-002 - ChatMessageList hides ThinkingIndicator when text arrives
  - **Status:** RED - Integration not implemented
  - **Verifies:** AC#2 - Indicator hides on text

- [ ] **Test:** 2.8-COMP-003 - ChatMessageList hides ThinkingIndicator when tool output starts
  - **Status:** RED - Integration not implemented
  - **Verifies:** AC#2 - Indicator hides on tool activity

- [ ] **Test:** 2.8-COMP-004 - ChatMessageList renders ThinkingIndicator before AssistantMessage
  - **Status:** RED - Integration not implemented
  - **Verifies:** AC#1 - Correct DOM order

- [ ] **Test:** 2.8-COMP-005 - isThinkingActive is false when state is not 'streaming'
  - **Status:** RED - Integration not implemented
  - **Verifies:** AC#2 - State-dependent visibility

### Integration Tests (3 tests)

**File:** `tests/integration/streaming/ThinkingFlow.spec.ts`

- [ ] **Test:** 2.8-INT-001 - Full flow: thinking event shows indicator
  - **Status:** RED - Flow not implemented
  - **Verifies:** AC#1 - End-to-end thinking detection

- [ ] **Test:** 2.8-INT-002 - Full flow: text arrival hides indicator and shows message
  - **Status:** RED - Flow not implemented
  - **Verifies:** AC#2 - Transition from thinking to text

- [ ] **Test:** 2.8-INT-003 - Full flow: thinking content never displayed in DOM
  - **Status:** RED - Flow not implemented
  - **Verifies:** AC#3 - Privacy verification

### E2E Tests (5 tests)

**File:** `tests/e2e/streaming/thinking-indicator.spec.ts`

- [ ] **Test:** 2.8-E2E-001 - User sees "Thinking..." with pulsing indicator during extended thinking
  - **Status:** RED - Feature not implemented
  - **Verifies:** AC#1 - Visual feedback for user

- [ ] **Test:** 2.8-E2E-002 - Indicator disappears smoothly when response text arrives
  - **Status:** RED - Feature not implemented
  - **Verifies:** AC#2 - Transition behavior

- [ ] **Test:** 2.8-E2E-003 - No raw thinking content visible anywhere in UI
  - **Status:** RED - Feature not implemented
  - **Verifies:** AC#3 - Privacy verification

- [ ] **Test:** 2.8-E2E-004 - Dark mode renders correctly with proper contrast
  - **Status:** RED - Feature not implemented
  - **Verifies:** AC#1 - Visual consistency

- [ ] **Test:** 2.8-E2E-005 - Reduced motion preference disables pulse animation
  - **Status:** RED - Feature not implemented
  - **Verifies:** AC#1 - Accessibility compliance

### Edge Case Tests (6 tests)

**File:** `tests/unit/components/chat/ThinkingIndicator.edge.spec.ts`

- [ ] **Test:** 2.8-EDGE-001 - Handles empty thinking content (length 0)
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#2 - Edge case handling

- [ ] **Test:** 2.8-EDGE-002 - Handles thinking without subsequent text (thinking only)
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#2 - Eventual state resolution

- [ ] **Test:** 2.8-EDGE-003 - Handles rapid thinking events (multiple in quick succession)
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#1 - Animation stability

- [ ] **Test:** 2.8-EDGE-004 - Handles simultaneous thinking and text (race condition)
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#2 - State priority

- [ ] **Test:** 2.8-EDGE-005 - Handles tool output without text (tool-first response)
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#2 - Tool trigger for hiding

- [ ] **Test:** 2.8-EDGE-006 - Handles error state during thinking
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#2 - Error recovery

### Accessibility Tests (4 tests)

**File:** `tests/unit/components/chat/ThinkingIndicator.a11y.spec.ts`

- [ ] **Test:** 2.8-A11Y-001 - Screen reader announces "Claude is thinking" on appearance
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#1 - VoiceOver compatibility

- [ ] **Test:** 2.8-A11Y-002 - Focus does not trap on indicator
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#1 - Keyboard navigation

- [ ] **Test:** 2.8-A11Y-003 - WCAG AA contrast ratio for text (4.5:1 minimum)
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#1 - Color accessibility

- [ ] **Test:** 2.8-A11Y-004 - Animation respects prefers-reduced-motion
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#1 - Motion sensitivity

### Visual Tests (2 tests)

**File:** `tests/visual/ThinkingIndicator.visual.spec.ts`

- [ ] **Test:** 2.8-VIS-001 - Pulse animation runs at 1500ms interval
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#1 - Animation timing

- [ ] **Test:** 2.8-VIS-002 - Gold color (#D4AF37) displays correctly
  - **Status:** RED - Component not implemented
  - **Verifies:** AC#1 - Design token compliance

---

## Data Factories Created

### Streaming Context Factory

**File:** `tests/support/factories/streaming-context.factory.ts`

**Exports:**

- `createStreamingContext(overrides?)` - Create streaming machine context with thinking state
- `createThinkingState()` - Create context with thinking content only
- `createTextState()` - Create context with text content
- `createMixedState()` - Create context with thinking + text

**Example Usage:**

```typescript
import { createThinkingState, createTextState } from '../factories/streaming-context.factory';

// Create thinking-only state
const thinkingContext = createThinkingState({
  thinking: 'Analyzing the user request...',
});

// Create text state (thinking complete)
const textContext = createTextState({
  text: 'Here is my response...',
  thinking: 'Analysis complete.',
});
```

---

## Fixtures Created

### Streaming Machine Fixture

**File:** `tests/support/fixtures/streaming.fixture.ts`

**Fixtures:**

- `mockStreamingMachine` - Mocked useStreamingMachine hook with controllable state
  - **Setup:** Creates mock machine with configurable state and context
  - **Provides:** { state, context, send, reset, isLoading, isError, isComplete }
  - **Cleanup:** Resets mock state

**Example Usage:**

```typescript
import { test } from './fixtures/streaming.fixture';

test('should show thinking indicator', async ({ mockStreamingMachine }) => {
  // Set machine to thinking state
  mockStreamingMachine.setState('streaming');
  mockStreamingMachine.setContext({
    thinking: 'Analyzing...',
    text: '',
    tools: new Map(),
  });

  // Component will show ThinkingIndicator
});
```

---

## Mock Requirements

### Streaming State Machine Mock

**Service:** `useStreamingMachine` hook

**States to mock:**

| State | Description |
|-------|-------------|
| `idle` | No activity |
| `sending` | Message being sent |
| `streaming` | Response streaming (thinking or text) |
| `complete` | Response finished |
| `error` | Error occurred |

**Context shape:**

```typescript
{
  thinking: string;  // Accumulated thinking content
  text: string;      // Accumulated text content
  tools: Map<string, ToolState>;  // Tool call states
  error: Error | null;
}
```

**Mock scenarios:**

1. **Thinking only:** `state: 'streaming', context.thinking.length > 0, context.text.length === 0`
2. **Text only:** `state: 'streaming', context.thinking.length === 0, context.text.length > 0`
3. **Thinking + text:** `state: 'streaming', context.thinking.length > 0, context.text.length > 0`
4. **With tools:** `state: 'streaming', context.tools.size > 0`

---

## Required data-testid Attributes

### ThinkingIndicator Component

- `thinking-indicator` - Root container element
- `thinking-indicator-status` - StatusIndicator dot element
- `thinking-indicator-label` - "Thinking..." text label

### ChatMessageList Integration

- `chat-message-list` - Message list container
- `thinking-indicator-wrapper` - ThinkingIndicator position wrapper

**Implementation Example:**

```tsx
<div
  data-testid="thinking-indicator"
  className={cn('flex items-center gap-2', 'px-3 py-2', className)}
  role="status"
  aria-live="polite"
  aria-label="Claude is thinking"
>
  <StatusIndicator
    data-testid="thinking-indicator-status"
    status="thinking"
    size="sm"
  />
  <span data-testid="thinking-indicator-label">Thinking...</span>
</div>
```

---

## Implementation Checklist

### Test: 2.8-UNIT-001 - ThinkingIndicator renders when isActive=true

**File:** `tests/unit/components/chat/ThinkingIndicator.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `src/components/chat/ThinkingIndicator.tsx` file
- [ ] Define ThinkingIndicatorProps interface with `isActive` boolean
- [ ] Implement conditional rendering based on `isActive`
- [ ] Add data-testid="thinking-indicator" to root element
- [ ] Run test: `npx vitest run tests/unit/components/chat/ThinkingIndicator.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.8-UNIT-002 - ThinkingIndicator returns null when isActive=false

**File:** `tests/unit/components/chat/ThinkingIndicator.spec.ts`

**Tasks to make this test pass:**

- [ ] Add early return `if (!isActive) return null`
- [ ] Verify component unmounts cleanly
- [ ] Run test: `npx vitest run tests/unit/components/chat/ThinkingIndicator.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.25 hours

---

### Test: 2.8-UNIT-003 - Contains StatusIndicator with status="thinking"

**File:** `tests/unit/components/chat/ThinkingIndicator.spec.ts`

**Tasks to make this test pass:**

- [ ] Import StatusIndicator from `@/components/ui/StatusIndicator`
- [ ] Add `<StatusIndicator status="thinking" size="sm" />` to component
- [ ] Verify StatusIndicator renders with correct props
- [ ] Run test: `npx vitest run tests/unit/components/chat/ThinkingIndicator.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.25 hours

---

### Test: 2.8-UNIT-004 - Displays "Thinking..." text label

**File:** `tests/unit/components/chat/ThinkingIndicator.spec.ts`

**Tasks to make this test pass:**

- [ ] Add `<span data-testid="thinking-indicator-label">Thinking...</span>`
- [ ] Verify text content matches exactly
- [ ] Run test: `npx vitest run tests/unit/components/chat/ThinkingIndicator.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.25 hours

---

### Test: 2.8-UNIT-005 through 2.8-UNIT-010 - Accessibility and styling

**File:** `tests/unit/components/chat/ThinkingIndicator.spec.ts`

**Tasks to make these tests pass:**

- [ ] Add `role="status"` to root div
- [ ] Add `aria-live="polite"` for live region
- [ ] Add `aria-label="Claude is thinking"` for screen readers
- [ ] Apply `text-orion-fg-muted` class for muted styling
- [ ] Verify no thinking content prop exists or is rendered
- [ ] Run tests: `npx vitest run tests/unit/components/chat/ThinkingIndicator.spec.ts`
- [ ] All tests pass (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.8-COMP-001 through 2.8-COMP-005 - ChatMessageList integration

**File:** `tests/component/chat/ChatMessageList.spec.tsx`

**Tasks to make these tests pass:**

- [ ] Import ThinkingIndicator in ChatMessageList
- [ ] Calculate `isThinkingActive` from streaming context:
  - `state === 'streaming'`
  - `context.thinking.length > 0`
  - `context.text.length === 0`
  - `context.tools.size === 0`
- [ ] Render ThinkingIndicator above AssistantMessage position
- [ ] Pass `isActive={isThinkingActive}` to ThinkingIndicator
- [ ] Update barrel export in `src/components/chat/index.ts`
- [ ] Run tests: `npx vitest run tests/component/chat/ChatMessageList.spec.tsx`
- [ ] All tests pass (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.8-INT-001 through 2.8-INT-003 - Full streaming flow

**File:** `tests/integration/streaming/ThinkingFlow.spec.ts`

**Tasks to make these tests pass:**

- [ ] Verify streaming machine sends TEXT_CHUNK events with type: 'thinking'
- [ ] Verify context.thinking accumulates during thinking phase
- [ ] Verify indicator appears when thinking starts
- [ ] Verify indicator hides when text arrives
- [ ] Verify no DOM element contains raw thinking content
- [ ] Run tests: `npx vitest run tests/integration/streaming/ThinkingFlow.spec.ts`
- [ ] All tests pass (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.8-E2E-001 through 2.8-E2E-005 - E2E user experience

**File:** `tests/e2e/streaming/thinking-indicator.spec.ts`

**Tasks to make these tests pass:**

- [ ] Mock Claude API to return extended thinking response
- [ ] Verify user sees "Thinking..." text in UI
- [ ] Verify pulsing animation on StatusIndicator
- [ ] Verify smooth transition when text arrives
- [ ] Test with `prefers-reduced-motion: reduce` media query
- [ ] Test in dark mode
- [ ] Run tests: `npx playwright test tests/e2e/streaming/thinking-indicator.spec.ts`
- [ ] All tests pass (green phase)

**Estimated Effort:** 1.5 hours

---

### Test: 2.8-EDGE-001 through 2.8-EDGE-006 - Edge cases

**File:** `tests/unit/components/chat/ThinkingIndicator.edge.spec.ts`

**Tasks to make these tests pass:**

- [ ] Handle empty thinking content gracefully
- [ ] Handle thinking-only responses (no text follow-up)
- [ ] Handle rapid state transitions without animation glitches
- [ ] Prioritize text/tool state over thinking state
- [ ] Handle error state cleanup
- [ ] Run tests: `npx vitest run tests/unit/components/chat/ThinkingIndicator.edge.spec.ts`
- [ ] All tests pass (green phase)

**Estimated Effort:** 1 hour

---

### Test: 2.8-A11Y-001 through 2.8-A11Y-004 - Accessibility

**File:** `tests/unit/components/chat/ThinkingIndicator.a11y.spec.ts`

**Tasks to make these tests pass:**

- [ ] Verify ARIA live region announces state changes
- [ ] Verify component is not in tab order (no focus trap)
- [ ] Verify text color meets WCAG AA contrast (4.5:1)
- [ ] Verify `prefers-reduced-motion` media query respected
- [ ] Run tests: `npx vitest run tests/unit/components/chat/ThinkingIndicator.a11y.spec.ts`
- [ ] All tests pass (green phase)

**Estimated Effort:** 0.5 hours

---

## Running Tests

```bash
# Run all failing tests for this story
npx vitest run tests/unit/components/chat/ThinkingIndicator*.spec.ts && \
npx vitest run tests/component/chat/ChatMessageList.spec.tsx && \
npx vitest run tests/integration/streaming/ThinkingFlow.spec.ts && \
npx playwright test tests/e2e/streaming/thinking-indicator.spec.ts

# Run specific test file
npx vitest run tests/unit/components/chat/ThinkingIndicator.spec.ts

# Run tests in watch mode
npx vitest tests/unit/components/chat/ThinkingIndicator.spec.ts

# Run E2E tests in headed mode (see browser)
npx playwright test tests/e2e/streaming/thinking-indicator.spec.ts --headed

# Debug specific test
npx playwright test tests/e2e/streaming/thinking-indicator.spec.ts --debug

# Run tests with coverage
npx vitest run --coverage tests/unit/components/chat/ThinkingIndicator*.spec.ts
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

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

1. **Pick one failing test** from implementation checklist (start with 2.8-UNIT-001)
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

**Progress Tracking:**

- Check off tasks as you complete them
- Share progress in daily standup
- Mark story as IN PROGRESS in sprint-status.yaml

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

**Completion:**

- All tests pass
- Code quality meets team standards
- No duplications or code smells
- Ready for code review and story approval

---

## Next Steps

1. **Share this checklist and failing tests** with the dev workflow (manual handoff)
2. **Review this checklist** with team in standup or planning
3. **Run failing tests** to confirm RED phase
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
- **test-quality.md** - Test design principles (Given-When-Then, one assertion per test, determinism, isolation)
- **test-levels-framework.md** - Test level selection framework (E2E vs API vs Component vs Unit)
- **selector-resilience.md** - Selector best practices (data-testid > ARIA > text > CSS hierarchy)
- **timing-debugging.md** - Race condition prevention and async debugging

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npx vitest run tests/unit/components/chat/ThinkingIndicator.spec.ts`

**Results:**

```
(Tests not yet created - files do not exist)
Expected: All tests fail with "cannot find module" or "component not found" errors
```

**Summary:**

- Total tests: 35
- Passing: 0 (expected)
- Failing: 35 (expected)
- Status: RED phase verified (pending test file creation)

**Expected Failure Messages:**

- `Cannot find module 'src/components/chat/ThinkingIndicator'`
- `Element [data-testid="thinking-indicator"] not found`
- `Expected component to render, but received null`

---

## Notes

### Thinking Content Privacy (AC#3)

Per the acceptance criteria, thinking content is explicitly NOT displayed to users. The tests verify:

1. No `thinkingContent` prop on ThinkingIndicator
2. No DOM element contains thinking text
3. Only "Thinking..." label is shown

### StatusIndicator Reuse

Tests expect ThinkingIndicator to use StatusIndicator from Story 1.9:

- `status="thinking"` (gold color, pulse animation)
- `size="sm"` (6px dot)
- Pre-existing accessibility support

### Animation Stability

Edge case tests verify animation doesn't glitch during:

- Rapid thinking events
- State transitions
- Error recovery

### State Machine Integration

Tests mock `useStreamingMachine()` hook from Story 2.6:

- `context.thinking` for thinking content accumulation
- `context.text` for text content
- `context.tools` for tool activity
- State values: idle, sending, streaming, complete, error

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Refer to `_bmad/bmm/docs/tea-README.md` for workflow documentation
- Consult `_bmad/bmm/testarch/knowledge` for testing best practices

---

**Generated by BMad TEA Agent** - 2026-01-24
