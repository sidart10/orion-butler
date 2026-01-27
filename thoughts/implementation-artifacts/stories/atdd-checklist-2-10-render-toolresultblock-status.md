# ATDD Checklist - Epic 2, Story 2.10: Render ToolResultBlock Status

**Date:** 2026-01-24
**Author:** TEA (Test Architect Agent)
**Primary Test Level:** Component + Unit

---

## Story Summary

This story implements visual feedback for tool completion states in the chat UI. When a `ToolResultBlock` event arrives, the corresponding tool chip updates to show success (green checkmark) or error (red X icon with red styling), and users can expand the chip to see tool results.

**As a** user
**I want** to see when a tool completes
**So that** I know the action succeeded or failed

---

## Acceptance Criteria

1. **AC #1**: Given a tool chip is displayed, When a `ToolResultBlock` event arrives matching the tool's `id`, Then the chip updates to show success (checkmark) or error (X) icon
2. **AC #2**: And if error, the chip shows red styling (border and text)
3. **AC #3**: And tool output is optionally expandable (collapsed by default)

---

## Failing Tests Created (RED Phase)

### Unit Tests (26 tests)

**File:** `tests/unit/components/chat/ToolStatusChip.spec.ts`

- **Test:** 2.10-UNIT-001: ToolStatusIcon renders CheckCircle when status='complete'
  - **Status:** RED - Component not updated with completion icons
  - **Verifies:** AC #1 - Success checkmark icon renders for completed tools

- **Test:** 2.10-UNIT-002: ToolStatusIcon renders AlertCircle when status='error'
  - **Status:** RED - Error icon implementation missing
  - **Verifies:** AC #1 - Error X icon renders for failed tools

- **Test:** 2.10-UNIT-003: ToolStatusIcon renders StatusIndicator when status='running'
  - **Status:** RED - Running state icon not implemented
  - **Verifies:** AC #1 - Running spinner continues to work

- **Test:** 2.10-UNIT-004: CheckCircle has text-orion-success class
  - **Status:** RED - Success color class not applied
  - **Verifies:** AC #1 - Green color for success state

- **Test:** 2.10-UNIT-005: AlertCircle has text-orion-error class
  - **Status:** RED - Error color class not applied
  - **Verifies:** AC #1, AC #2 - Red color for error state

- **Test:** 2.10-UNIT-006: ToolStatusChip has red border when status='error'
  - **Status:** RED - Error border styling missing
  - **Verifies:** AC #2 - Red border for error state

- **Test:** 2.10-UNIT-007: ToolStatusChip has red text when status='error'
  - **Status:** RED - Error text styling missing
  - **Verifies:** AC #2 - Red text color for error state

- **Test:** 2.10-UNIT-008: ToolStatusChip shows chevron when expandable=true and status!='running'
  - **Status:** RED - Expandable chevron not implemented
  - **Verifies:** AC #3 - Expand indicator visible

- **Test:** 2.10-UNIT-009: ToolStatusChip hides chevron when status='running'
  - **Status:** RED - Running state expand logic missing
  - **Verifies:** AC #3 - No expand while running

- **Test:** 2.10-UNIT-010: ToolStatusChip expands on click when expandable
  - **Status:** RED - Click expand behavior not implemented
  - **Verifies:** AC #3 - Expandable interaction works

- **Test:** 2.10-UNIT-011: ToolStatusChip shows result in expanded section
  - **Status:** RED - Result display not implemented
  - **Verifies:** AC #3 - Tool result visible when expanded

- **Test:** 2.10-UNIT-012: ToolStatusChip shows errorMessage in expanded section when error
  - **Status:** RED - Error message display missing
  - **Verifies:** AC #3 - Error message visible when expanded

- **Test:** 2.10-UNIT-013: ToolStatusChip has aria-expanded attribute when expandable
  - **Status:** RED - Accessibility attribute missing
  - **Verifies:** AC #3 - Accessibility for expandable state

- **Test:** 2.10-UNIT-014: ToolStatusChip displays duration in human format
  - **Status:** RED - Duration display not implemented
  - **Verifies:** AC #1 - Execution time shown

- **Test:** 2.10-UNIT-015: formatDuration returns "ms" for <1000ms
  - **Status:** RED - Duration formatter missing
  - **Verifies:** AC #1 - Millisecond format correct

- **Test:** 2.10-UNIT-016: formatDuration returns "s" with decimal for >=1000ms
  - **Status:** RED - Duration formatter missing
  - **Verifies:** AC #1 - Seconds format correct

**File:** `tests/unit/components/chat/ToolActivitySummary.spec.ts`

- **Test:** 2.10-UNIT-017: ToolActivitySummary renders collapsed by default
  - **Status:** RED - Collapsed state not implemented
  - **Verifies:** AC #3 - Default collapsed state

- **Test:** 2.10-UNIT-018: ToolActivitySummary expands on click
  - **Status:** RED - Expand interaction missing
  - **Verifies:** AC #3 - Summary expands on click

- **Test:** 2.10-UNIT-019: ToolActivitySummary shows individual chips when expanded
  - **Status:** RED - Individual chip rendering missing
  - **Verifies:** AC #3 - Tool chips visible when expanded

- **Test:** 2.10-UNIT-020: ToolActivitySummary calculates aggregate status - running
  - **Status:** RED - Aggregate status logic missing
  - **Verifies:** AC #1 - Running when any tool running

- **Test:** 2.10-UNIT-021: ToolActivitySummary calculates aggregate status - complete
  - **Status:** RED - Aggregate status logic missing
  - **Verifies:** AC #1 - Complete when all tools complete

- **Test:** 2.10-UNIT-022: ToolActivitySummary calculates aggregate status - error
  - **Status:** RED - Aggregate status logic missing
  - **Verifies:** AC #1, AC #2 - Error when any tool errored

- **Test:** 2.10-UNIT-023: ToolActivitySummary shows total duration when complete
  - **Status:** RED - Total duration calculation missing
  - **Verifies:** AC #1 - Total time displayed

- **Test:** 2.10-UNIT-024: ToolActivitySummary shows Loader2 spinner when running
  - **Status:** RED - Running indicator missing
  - **Verifies:** AC #1 - Spinner during execution

- **Test:** 2.10-UNIT-025: ToolActivitySummary shows CheckCircle when all complete
  - **Status:** RED - Success aggregate icon missing
  - **Verifies:** AC #1 - Green checkmark for all success

- **Test:** 2.10-UNIT-026: ToolActivitySummary shows AlertCircle when any error
  - **Status:** RED - Error aggregate icon missing
  - **Verifies:** AC #1, AC #2 - Red icon for any error

### Component Tests (5 tests)

**File:** `tests/unit/components/chat/ChatMessageList.spec.ts`

- **Test:** 2.10-COMP-001: ChatMessageList passes result to ToolInfo
  - **Status:** RED - Result mapping not implemented
  - **Verifies:** AC #3 - Result data flows to components

- **Test:** 2.10-COMP-002: ChatMessageList passes errorMessage to ToolInfo
  - **Status:** RED - Error message mapping missing
  - **Verifies:** AC #2, AC #3 - Error data flows to components

- **Test:** 2.10-COMP-003: ChatMessageList passes durationMs to ToolInfo
  - **Status:** RED - Duration mapping missing
  - **Verifies:** AC #1 - Duration data flows to components

- **Test:** 2.10-COMP-004: ChatMessageList shows ToolActivitySummary after all tools complete
  - **Status:** RED - Visibility logic not updated
  - **Verifies:** AC #1 - Tools remain visible after completion

- **Test:** 2.10-COMP-005: ChatMessageList shows ToolActivitySummary with mixed states
  - **Status:** RED - Mixed state rendering not tested
  - **Verifies:** AC #1, AC #2 - Multiple tools with different states

### Integration Tests (5 tests)

**File:** `tests/integration/chat/tool-completion.spec.ts`

- **Test:** 2.10-INT-001: Full flow - TOOL_COMPLETE event updates chip to show checkmark
  - **Status:** RED - Event handling to UI update not wired
  - **Verifies:** AC #1 - Success state machine to UI flow

- **Test:** 2.10-INT-002: Full flow - TOOL_COMPLETE with isError=true shows red X
  - **Status:** RED - Error event handling missing
  - **Verifies:** AC #1, AC #2 - Error state machine to UI flow

- **Test:** 2.10-INT-003: Full flow - Clicking expand reveals tool result
  - **Status:** RED - Expand interaction not wired
  - **Verifies:** AC #3 - User interaction shows result

- **Test:** 2.10-INT-004: Full flow - Error result is stored in errorMessage
  - **Status:** RED - Error storage in state machine missing
  - **Verifies:** AC #2, AC #3 - Error data preserved

- **Test:** 2.10-INT-005: Full flow - Duration is calculated from TOOL_COMPLETE event
  - **Status:** RED - Duration tracking missing
  - **Verifies:** AC #1 - Execution time calculated

### E2E Tests (8 tests)

**File:** `tests/e2e/chat/tool-completion.spec.ts`

- **Test:** 2.10-E2E-001: User sees checkmark when tool completes successfully
  - **Status:** RED - Full UI flow not implemented
  - **Verifies:** AC #1 - Visual feedback for success

- **Test:** 2.10-E2E-002: User sees red X when tool fails
  - **Status:** RED - Error visual feedback missing
  - **Verifies:** AC #1, AC #2 - Visual feedback for error

- **Test:** 2.10-E2E-003: Error chip has red styling
  - **Status:** RED - Red styling not applied
  - **Verifies:** AC #2 - Error visual treatment

- **Test:** 2.10-E2E-004: Clicking collapsed summary expands to show tools
  - **Status:** RED - Expand UI not implemented
  - **Verifies:** AC #3 - Expandable summary interaction

- **Test:** 2.10-E2E-005: Clicking chip expands to show result
  - **Status:** RED - Chip expand not implemented
  - **Verifies:** AC #3 - Expandable chip interaction

- **Test:** 2.10-E2E-006: Keyboard navigation works (Tab, Enter to expand)
  - **Status:** RED - Keyboard accessibility missing
  - **Verifies:** AC #3 - Keyboard accessible expand

- **Test:** 2.10-E2E-007: Dark mode renders success/error colors correctly
  - **Status:** RED - Dark mode colors not verified
  - **Verifies:** AC #1, AC #2 - Theme-appropriate colors

- **Test:** 2.10-E2E-008: Reduced motion preference disables spin animation
  - **Status:** RED - Motion preference not respected
  - **Verifies:** AC #1 - Accessibility motion preference

### Edge Case Tests (6 tests)

**File:** `tests/unit/components/chat/ToolStatusChip.edge.spec.ts`

- **Test:** 2.10-EDGE-001: Partial completion - some tools complete, others running
  - **Status:** RED - Mixed state handling missing
  - **Verifies:** AC #1 - Aggregate shows running when any running

- **Test:** 2.10-EDGE-002: Mixed success/error - some complete, some error
  - **Status:** RED - Mixed result handling missing
  - **Verifies:** AC #1, AC #2 - Aggregate shows error when any error

- **Test:** 2.10-EDGE-003: Rapid completion - tools complete faster than render cycle
  - **Status:** RED - Fast completion race condition
  - **Verifies:** AC #1 - UI updates reliably on rapid events

- **Test:** 2.10-EDGE-004: Empty result - tool completes with undefined result
  - **Status:** RED - Undefined result handling missing
  - **Verifies:** AC #3 - Graceful handling of no result

- **Test:** 2.10-EDGE-005: Very long error message - truncation in expanded section
  - **Status:** RED - Long content handling missing
  - **Verifies:** AC #3 - Scrollable overflow for long content

- **Test:** 2.10-EDGE-006: JSON result object - formatted display in expanded section
  - **Status:** RED - Object formatting missing
  - **Verifies:** AC #3 - JSON result prettified

### Accessibility Tests (6 tests)

**File:** `tests/unit/components/chat/ToolStatusChip.a11y.spec.ts`

- **Test:** 2.10-A11Y-001: Success icon has aria-label "Completed successfully"
  - **Status:** RED - Aria label missing
  - **Verifies:** AC #1 - Screen reader announces success

- **Test:** 2.10-A11Y-002: Error icon has aria-label "Failed"
  - **Status:** RED - Aria label missing
  - **Verifies:** AC #1, AC #2 - Screen reader announces error

- **Test:** 2.10-A11Y-003: Expandable chip has role="button"
  - **Status:** RED - Role attribute missing
  - **Verifies:** AC #3 - Semantic button role

- **Test:** 2.10-A11Y-004: Expanded section is announced to screen readers
  - **Status:** RED - Live region missing
  - **Verifies:** AC #3 - Screen reader announces expansion

- **Test:** 2.10-A11Y-005: Focus indicator visible on expandable elements
  - **Status:** RED - Focus ring styling missing
  - **Verifies:** AC #3 - Visual focus indicator

- **Test:** 2.10-A11Y-006: Color contrast meets WCAG AA for success/error colors
  - **Status:** RED - Contrast not verified
  - **Verifies:** AC #1, AC #2 - Accessible color contrast

### Visual State Tests (4 tests)

**File:** `tests/unit/components/chat/ToolStatusChip.visual.spec.ts`

- **Test:** 2.10-VIS-001: Running state shows gold spinner
  - **Status:** RED - Running visual state incomplete
  - **Verifies:** AC #1 - Gold spinner during execution

- **Test:** 2.10-VIS-002: Complete state shows green checkmark (#059669 light / #10B981 dark)
  - **Status:** RED - Success color token missing
  - **Verifies:** AC #1 - Correct green shade

- **Test:** 2.10-VIS-003: Error state shows red X (#9B2C2C light / #EF4444 dark)
  - **Status:** RED - Error colors missing
  - **Verifies:** AC #1, AC #2 - Correct red shade

- **Test:** 2.10-VIS-004: Expanded section has distinct background for error state
  - **Status:** RED - Error expand background missing
  - **Verifies:** AC #2, AC #3 - Error visual treatment in expanded

---

## Data Factories Created

### ToolStatus Factory

**File:** `tests/fixtures/factories/tool-status.ts`

**Exports:**

- `createToolStatus(overrides?)` - Create single ToolStatus with optional overrides
- `createRunningTool(toolName, input)` - Create tool in running state
- `createCompleteTool(toolName, result, durationMs)` - Create successfully completed tool
- `createErrorTool(toolName, errorMessage, durationMs)` - Create failed tool

**Example Usage:**

```typescript
import { createToolStatus, createCompleteTool, createErrorTool } from './tool-status';

// Running tool
const running = createToolStatus({ status: 'running', name: 'Read' });

// Completed tool with result
const complete = createCompleteTool('Read', 'File contents here', 250);

// Failed tool with error
const error = createErrorTool('Write', 'Permission denied', 150);
```

### ToolInfo Factory

**File:** `tests/fixtures/factories/tool-info.ts`

**Exports:**

- `createToolInfo(overrides?)` - Create single ToolInfo with optional overrides
- `createToolInfoArray(configs[])` - Create array of ToolInfo with mixed states

**Example Usage:**

```typescript
import { createToolInfo, createToolInfoArray } from './tool-info';

// Single tool info
const info = createToolInfo({
  toolId: 'tool-123',
  toolName: 'Reading file',
  status: 'complete',
  result: 'File contents',
  durationMs: 250,
});

// Mixed state array
const tools = createToolInfoArray([
  { status: 'complete', toolName: 'Read' },
  { status: 'error', toolName: 'Write', errorMessage: 'Failed' },
  { status: 'running', toolName: 'Search' },
]);
```

---

## Fixtures Created

### Tool Status Fixture

**File:** `tests/support/fixtures/tool-status.fixture.ts`

**Fixtures:**

- `mockStreamingMachine` - Mocked streaming machine with tools Map
  - **Setup:** Creates XState machine mock with configurable tool states
  - **Provides:** Machine actor and context accessor
  - **Cleanup:** Resets machine state after test

- `toolStatusChipMount` - Mounting helper for ToolStatusChip
  - **Setup:** Configures React Testing Library render with providers
  - **Provides:** Render function with accessibility helpers
  - **Cleanup:** Unmounts component

**Example Usage:**

```typescript
import { test } from './fixtures/tool-status.fixture';

test('should show checkmark when complete', async ({ toolStatusChipMount }) => {
  const { getByRole, getByLabelText } = await toolStatusChipMount({
    status: 'complete',
    toolName: 'Reading file',
    result: 'Success',
  });

  expect(getByLabelText('Completed successfully')).toBeInTheDocument();
});
```

---

## Mock Requirements

### Streaming Machine Mock

**Mock Target:** `src/machines/streamingMachine.ts`

**Success Scenario:**

```typescript
const mockTools = new Map([
  [
    'tool-123',
    {
      name: 'Read',
      status: 'complete',
      input: { path: 'config.ts' },
      result: 'File contents',
      durationMs: 250,
    },
  ],
]);

const mockContext = {
  text: '',
  thinking: [],
  tools: mockTools,
};
```

**Error Scenario:**

```typescript
const mockTools = new Map([
  [
    'tool-456',
    {
      name: 'Write',
      status: 'error',
      input: { path: 'readonly.ts' },
      errorMessage: 'Permission denied: read-only file',
      durationMs: 150,
    },
  ],
]);
```

**Notes:**
- Mock `useStreamingMachine()` hook return value
- Tools Map must be properly typed as `Map<string, ToolStatus>`
- Result can be string or object (tests both cases)

### IPC Event Mocks

**Mock Target:** `@tauri-apps/api/event`

**TOOL_COMPLETE Success Event:**

```typescript
const toolCompleteSuccess = {
  type: 'tool_complete',
  toolId: 'tool-123',
  result: 'Operation successful',
  isError: false,
  durationMs: 250,
};
```

**TOOL_COMPLETE Error Event:**

```typescript
const toolCompleteError = {
  type: 'tool_complete',
  toolId: 'tool-456',
  result: 'Permission denied',
  isError: true,
  durationMs: 150,
};
```

---

## Required data-testid Attributes

### ToolStatusChip Component

- `tool-status-chip` - Root container element
- `tool-status-icon` - Status icon wrapper (checkmark/X/spinner)
- `tool-name` - Tool name text
- `tool-input-summary` - Input summary text (optional)
- `tool-duration` - Duration display
- `tool-expand-button` - Expand/collapse button
- `tool-expand-icon` - Chevron icon
- `tool-expanded-content` - Expanded result section
- `tool-result` - Result text/content
- `tool-error-message` - Error message text

### ToolActivitySummary Component

- `tool-activity-summary` - Root container
- `tool-summary-bar` - Collapsed summary bar
- `tool-aggregate-icon` - Aggregate status icon
- `tool-summary-text` - Summary description text
- `tool-total-duration` - Total duration display
- `tool-summary-expand-icon` - Summary expand chevron
- `tool-expanded-tools` - Container for individual tool chips

**Implementation Example:**

```tsx
<div data-testid="tool-status-chip" className={...}>
  <button data-testid="tool-expand-button" aria-expanded={isExpanded}>
    <span data-testid="tool-status-icon">
      <CheckCircle aria-label="Completed successfully" />
    </span>
    <span data-testid="tool-name">{toolName}</span>
    <span data-testid="tool-duration">{formatDuration(durationMs)}</span>
    <span data-testid="tool-expand-icon">
      <ChevronDown />
    </span>
  </button>
  {isExpanded && (
    <div data-testid="tool-expanded-content">
      <span data-testid="tool-result">{result}</span>
    </div>
  )}
</div>
```

---

## Implementation Checklist

### Test: 2.10-UNIT-001 - ToolStatusIcon renders CheckCircle when status='complete'

**File:** `tests/unit/components/chat/ToolStatusChip.spec.ts`

**Tasks to make this test pass:**

- [ ] Import CheckCircle from lucide-react in ToolStatusChip.tsx
- [ ] Create ToolStatusIcon sub-component with status switch
- [ ] Return CheckCircle for status='complete'
- [ ] Add data-testid="tool-status-icon" to wrapper
- [ ] Run test: `npm run test -- tests/unit/components/chat/ToolStatusChip.spec.ts -t "2.10-UNIT-001"`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.10-UNIT-002 - ToolStatusIcon renders AlertCircle when status='error'

**File:** `tests/unit/components/chat/ToolStatusChip.spec.ts`

**Tasks to make this test pass:**

- [ ] Import AlertCircle from lucide-react
- [ ] Add case for status='error' returning AlertCircle
- [ ] Run test: `npm run test -- tests/unit/components/chat/ToolStatusChip.spec.ts -t "2.10-UNIT-002"`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.25 hours

---

### Test: 2.10-UNIT-006 - ToolStatusChip has red border when status='error'

**File:** `tests/unit/components/chat/ToolStatusChip.spec.ts`

**Tasks to make this test pass:**

- [ ] Add conditional className for border color based on isError
- [ ] Apply border-orion-error when status='error'
- [ ] Apply border-orion-border otherwise
- [ ] Run test: `npm run test -- tests/unit/components/chat/ToolStatusChip.spec.ts -t "2.10-UNIT-006"`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.25 hours

---

### Test: 2.10-UNIT-010 - ToolStatusChip expands on click when expandable

**File:** `tests/unit/components/chat/ToolStatusChip.spec.ts`

**Tasks to make this test pass:**

- [ ] Add useState for isExpanded
- [ ] Add onClick handler to toggle isExpanded
- [ ] Conditionally render expanded section based on isExpanded
- [ ] Only allow expand when expandable=true and status!='running'
- [ ] Add data-testid="tool-expand-button" and data-testid="tool-expanded-content"
- [ ] Run test: `npm run test -- tests/unit/components/chat/ToolStatusChip.spec.ts -t "2.10-UNIT-010"`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.75 hours

---

### Test: 2.10-UNIT-017 - ToolActivitySummary renders collapsed by default

**File:** `tests/unit/components/chat/ToolActivitySummary.spec.ts`

**Tasks to make this test pass:**

- [ ] Add useState for isExpanded with defaultExpanded prop
- [ ] Render summary bar always visible
- [ ] Conditionally render expanded section based on isExpanded
- [ ] Add data-testid="tool-activity-summary" and data-testid="tool-summary-bar"
- [ ] Run test: `npm run test -- tests/unit/components/chat/ToolActivitySummary.spec.ts -t "2.10-UNIT-017"`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.75 hours

---

### Test: 2.10-UNIT-020 - ToolActivitySummary calculates aggregate status - running

**File:** `tests/unit/components/chat/ToolActivitySummary.spec.ts`

**Tasks to make this test pass:**

- [ ] Create useMemo for aggregateStatus calculation
- [ ] Check if any tool has status='running' -> return 'running'
- [ ] Check if any tool has status='error' -> return 'error'
- [ ] Otherwise return 'complete'
- [ ] Run test: `npm run test -- tests/unit/components/chat/ToolActivitySummary.spec.ts -t "2.10-UNIT-020"`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: 2.10-INT-001 - Full flow TOOL_COMPLETE event updates chip to show checkmark

**File:** `tests/integration/chat/tool-completion.spec.ts`

**Tasks to make this test pass:**

- [ ] Verify TOOL_COMPLETE event handler in streamingMachine updates tools Map
- [ ] Verify status changes from 'running' to 'complete'
- [ ] Verify result is stored in ToolStatus
- [ ] Verify ChatMessageList re-renders with updated ToolInfo
- [ ] Verify ToolStatusChip shows CheckCircle
- [ ] Run test: `npm run test -- tests/integration/chat/tool-completion.spec.ts -t "2.10-INT-001"`
- [ ] Test passes (green phase)

**Estimated Effort:** 1.5 hours

---

### Test: 2.10-E2E-006 - Keyboard navigation works (Tab, Enter to expand)

**File:** `tests/e2e/chat/tool-completion.spec.ts`

**Tasks to make this test pass:**

- [ ] Ensure expand button is focusable (tabindex or button element)
- [ ] Add keydown handler for Enter and Space
- [ ] Trigger expansion on Enter/Space key
- [ ] Add visible focus ring styles
- [ ] Run test: `npx playwright test tests/e2e/chat/tool-completion.spec.ts -g "2.10-E2E-006"`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.75 hours

---

### Test: 2.10-A11Y-001 - Success icon has aria-label "Completed successfully"

**File:** `tests/unit/components/chat/ToolStatusChip.a11y.spec.ts`

**Tasks to make this test pass:**

- [ ] Add aria-label="Completed successfully" to CheckCircle icon
- [ ] Verify screen reader announces completion state
- [ ] Run test: `npm run test -- tests/unit/components/chat/ToolStatusChip.a11y.spec.ts -t "2.10-A11Y-001"`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.25 hours

---

## Running Tests

```bash
# Run all failing tests for this story
npm run test -- --grep "2.10-"

# Run specific test file
npm run test -- tests/unit/components/chat/ToolStatusChip.spec.ts

# Run unit tests only
npm run test -- tests/unit/components/chat/

# Run integration tests
npm run test -- tests/integration/chat/tool-completion.spec.ts

# Run E2E tests (Playwright)
npx playwright test tests/e2e/chat/tool-completion.spec.ts

# Run tests in headed mode (see browser)
npx playwright test tests/e2e/chat/ --headed

# Debug specific test
npx playwright test tests/e2e/chat/tool-completion.spec.ts --debug

# Run tests with coverage
npm run test:coverage -- tests/unit/components/chat/
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- All tests written and failing
- Fixtures and factories created with auto-cleanup
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

1. **Pick one failing test** from implementation checklist (start with 2.10-UNIT-001)
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

**Recommended Order:**

1. Unit tests for ToolStatusIcon (2.10-UNIT-001 through 005) - establishes icons
2. Unit tests for error styling (2.10-UNIT-006, 007) - establishes error treatment
3. Unit tests for expand behavior (2.10-UNIT-008 through 013) - establishes expand UX
4. Unit tests for ToolActivitySummary (2.10-UNIT-017 through 026) - establishes summary
5. Component tests (2.10-COMP-001 through 005) - establishes data flow
6. Integration tests (2.10-INT-001 through 005) - establishes state machine
7. Accessibility tests (2.10-A11Y-001 through 006) - polishes accessibility
8. E2E tests (2.10-E2E-001 through 008) - validates full flow

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability, performance)
3. **Extract duplications** (DRY principle)
4. **Optimize performance** (useMemo for aggregateStatus, etc.)
5. **Ensure tests still pass** after each refactor
6. **Update documentation** (if API contracts change)

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Make small refactors (easier to debug if tests fail)
- Run tests after each change
- Don't change test behavior (only implementation)

**Completion:**

- All 60 tests pass
- Code quality meets team standards
- No duplications or code smells
- Ready for code review and story approval

---

## Next Steps

1. **Share this checklist and failing tests** with the dev workflow (manual handoff)
2. **Review this checklist** with team in standup or planning
3. **Run failing tests** to confirm RED phase: `npm run test -- --grep "2.10-"`
4. **Begin implementation** using implementation checklist as guide
5. **Work one test at a time** (red -> green for each)
6. **Share progress** in daily standup
7. **When all tests pass**, refactor code for quality
8. **When refactoring complete**, manually update story status to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **component-tdd.md** - Red-green-refactor cycle, provider isolation, accessibility assertions for component testing
- **test-levels-framework.md** - Test level selection (unit vs component vs integration vs E2E)
- **test-quality.md** - Deterministic tests, isolation with cleanup, explicit assertions, length/time limits

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npm run test -- --grep "2.10-"`

**Results:**

```
Test Suites: 8 failed, 0 passed, 8 total
Tests:       60 failed, 0 passed, 60 total
Time:        12.5s
```

**Summary:**

- Total tests: 60
- Passing: 0 (expected)
- Failing: 60 (expected)
- Status: RED phase verified

**Expected Failure Messages:**

- 2.10-UNIT-001: "Cannot find module './ToolStatusIcon'" or "CheckCircle not rendered"
- 2.10-UNIT-006: "Expected element to have class 'border-orion-error'"
- 2.10-UNIT-010: "Expected expanded section to be visible after click"
- 2.10-UNIT-017: "Expected summary bar to be visible"
- 2.10-INT-001: "Expected checkmark icon to be rendered after TOOL_COMPLETE event"

---

## Notes

### Icon Color Design Decision

Per story spec, use Lucide icons directly for completion states (not StatusIndicator):
- Success: `lucide:check-circle` with green (#059669 light, #10B981 dark)
- Error: `lucide:alert-circle` with red (#9B2C2C light, #EF4444 dark)
- Running: StatusIndicator with 'acting' state (gold spin)

### Aggregate Status Logic

Priority order for aggregate status:
1. `running` - If ANY tool is still running
2. `error` - If NO running AND any error
3. `complete` - If ALL tools complete successfully

### Expandable Security

Tool results may contain sensitive data:
- Collapsed by default
- No auto-expansion
- Overflow scrolling for long content
- JSON prettified for object results

### Design Token Verification

Before testing, verify `--orion-success` exists in globals.css:
```css
:root { --orion-success: #059669; }
.dark { --orion-success: #10B981; }
```

If missing, add as first implementation task.

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Refer to `_bmad/bmm/testarch/knowledge/` for testing best practices
- See story definition at `thoughts/implementation-artifacts/stories/story-2-10-render-toolresultblock-status.md`

---

**Generated by BMad TEA Agent** - 2026-01-24
