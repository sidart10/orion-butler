# ATDD Checklist - Epic 2, Story 2.9: Render ToolUseBlock Status

**Date:** 2026-01-24
**Author:** Sid
**Primary Test Level:** Component

---

## Story Summary

Story 2.9 implements visual feedback when Claude invokes tools during a streaming response. The ToolStatusChip component displays a human-readable tool name with a spinning indicator, while ToolActivitySummary manages multiple concurrent tools.

**As a** user
**I want** to see when Claude invokes a tool
**So that** I understand what actions are being taken

---

## Acceptance Criteria

1. **AC #1**: Tool activity chip displays with human-readable tool name (e.g., "Reading file...")
2. **AC #2**: Chip shows loading/spinner state while tool runs
3. **AC #3**: Multiple concurrent tools show multiple chips
4. **AC #4**: Tool inputs are summarized (e.g., file path, command, search pattern)

---

## Failing Tests Created (RED Phase)

### Unit Tests (16 tests)

**File:** `tests/unit/components/chat/tool-display.spec.ts` (~180 lines)

| Test ID | Test Name | AC | Status | Expected Failure |
|---------|-----------|-----|--------|------------------|
| 2.9-UNIT-001 | humanizeToolName returns display name for known tools | #1 | RED | `src/lib/tool-display.ts` does not exist |
| 2.9-UNIT-002 | humanizeToolName handles unknown tools with fallback | #1 | RED | `humanizeToolName` function not found |
| 2.9-UNIT-003 | summarizeToolInput returns filename for Read/Write/Edit | #4 | RED | `summarizeToolInput` function not found |
| 2.9-UNIT-004 | summarizeToolInput returns truncated command for Bash | #4 | RED | Function not implemented |
| 2.9-UNIT-005 | summarizeToolInput returns pattern for Grep | #4 | RED | Function not implemented |
| 2.9-UNIT-006 | summarizeToolInput returns hostname for WebFetch | #4 | RED | Function not implemented |
| 2.9-UNIT-007 | summarizeToolInput returns null for unsupported tools | #4 | RED | Function not implemented |

**File:** `tests/unit/components/chat/ToolStatusChip.spec.tsx` (~200 lines)

| Test ID | Test Name | AC | Status | Expected Failure |
|---------|-----------|-----|--------|------------------|
| 2.9-UNIT-008 | ToolStatusChip renders with tool name | #1 | RED | Component does not exist |
| 2.9-UNIT-009 | ToolStatusChip shows StatusIndicator with acting state when running | #2 | RED | Component does not exist |
| 2.9-UNIT-010 | ToolStatusChip shows StatusIndicator with success state when complete | #2 | RED | Component does not exist |
| 2.9-UNIT-011 | ToolStatusChip shows input summary when provided | #4 | RED | Component does not exist |
| 2.9-UNIT-012 | ToolStatusChip has role="status" for accessibility | #1 | RED | Component does not exist |
| 2.9-UNIT-013 | ToolStatusChip has aria-label with tool name | #1 | RED | Component does not exist |

**File:** `tests/unit/components/chat/ToolActivitySummary.spec.tsx` (~150 lines)

| Test ID | Test Name | AC | Status | Expected Failure |
|---------|-----------|-----|--------|------------------|
| 2.9-UNIT-014 | ToolActivitySummary renders multiple chips | #3 | RED | Component does not exist |
| 2.9-UNIT-015 | ToolActivitySummary returns null for empty tools array | #3 | RED | Component does not exist |
| 2.9-UNIT-016 | ToolActivitySummary has aria-label with tool count | #3 | RED | Component does not exist |

### Component Tests (5 tests)

**File:** `tests/component/chat/ChatMessageListTools.spec.tsx` (~180 lines)

| Test ID | Test Name | AC | Status | Expected Failure |
|---------|-----------|-----|--------|------------------|
| 2.9-COMP-001 | ChatMessageList shows ToolActivitySummary when tools are running | #1, #3 | RED | ToolActivitySummary not integrated |
| 2.9-COMP-002 | ChatMessageList shows correct number of chips for concurrent tools | #3 | RED | ToolActivitySummary not integrated |
| 2.9-COMP-003 | ChatMessageList hides ToolActivitySummary when no active tools | #1 | RED | ToolActivitySummary not integrated |
| 2.9-COMP-004 | ChatMessageList positions tools below ThinkingIndicator | #1 | RED | Rendering order not implemented |
| 2.9-COMP-005 | ChatMessageList positions tools above AssistantMessage | #1 | RED | Rendering order not implemented |

### Integration Tests (4 tests)

**File:** `tests/integration/chat/tool-status-flow.spec.ts` (~200 lines)

| Test ID | Test Name | AC | Status | Expected Failure |
|---------|-----------|-----|--------|------------------|
| 2.9-INT-001 | Full flow: TOOL_START event shows chip with spinner | #1, #2 | RED | State machine not wired to UI |
| 2.9-INT-002 | Full flow: Multiple TOOL_START events show multiple chips | #3 | RED | Multiple tools not handled |
| 2.9-INT-003 | Full flow: Tool input is summarized in chip | #4 | RED | Input summarization not implemented |
| 2.9-INT-004 | Tool chip transforms SDK tool name to human-readable | #1 | RED | humanizeToolName not called |

### E2E Tests (6 tests)

**File:** `tests/e2e/chat/tool-status.spec.ts` (~250 lines)

| Test ID | Test Name | AC | Status | Expected Failure |
|---------|-----------|-----|--------|------------------|
| 2.9-E2E-001 | User sees "Reading file..." chip when Read tool invoked | #1 | RED | Feature not implemented |
| 2.9-E2E-002 | Chip shows spinning animation during execution | #2 | RED | StatusIndicator not integrated |
| 2.9-E2E-003 | Multiple concurrent tools show multiple chips | #3 | RED | Multiple tools not rendered |
| 2.9-E2E-004 | Chip shows filename when reading a file | #4 | RED | Input summarization missing |
| 2.9-E2E-005 | Dark mode renders correctly | #1 | RED | Styling not applied |
| 2.9-E2E-006 | Reduced motion preference disables spin animation | #2 | RED | prefers-reduced-motion not respected |

### Accessibility Tests (4 tests)

**File:** `tests/accessibility/chat/ToolStatusChip.a11y.spec.tsx` (~120 lines)

| Test ID | Test Name | AC | Status | Expected Failure |
|---------|-----------|-----|--------|------------------|
| 2.9-A11Y-001 | ToolStatusChip passes axe accessibility scan | #1 | RED | Component does not exist |
| 2.9-A11Y-002 | ToolStatusChip announces tool status to screen readers | #1 | RED | aria-label missing |
| 2.9-A11Y-003 | ToolActivitySummary announces tool count | #3 | RED | Component does not exist |
| 2.9-A11Y-004 | Keyboard navigation skips non-interactive chips | #1 | RED | tabindex not configured |

### Visual Regression Tests (4 tests)

**File:** `tests/visual/chat/ToolStatusChip.visual.spec.tsx` (~100 lines)

| Test ID | Test Name | AC | Status | Expected Failure |
|---------|-----------|-----|--------|------------------|
| 2.9-VIS-001 | ToolStatusChip running state matches snapshot | #2 | RED | Component does not exist |
| 2.9-VIS-002 | ToolStatusChip with input summary matches snapshot | #4 | RED | Component does not exist |
| 2.9-VIS-003 | ToolActivitySummary multiple chips matches snapshot | #3 | RED | Component does not exist |
| 2.9-VIS-004 | ToolStatusChip dark mode matches snapshot | #1 | RED | Component does not exist |

---

## Data Factories Required

### ToolStatus Factory

**File:** `tests/fixtures/factories/tool-status.ts`

**Purpose:** Generate test data for tool status tracking with realistic tool names and inputs.

**Exports:**
- `createToolStatus(overrides?)` - Create single ToolStatus
- `createToolStatusMap(count, overrides?)` - Create Map<toolId, ToolStatus>
- `createRunningTool(toolName, input)` - Shorthand for running tool
- `createCompleteTool(toolName, durationMs)` - Shorthand for complete tool

**Example Usage:**

```typescript
import { createToolStatus, createRunningTool, createToolStatusMap } from '@/tests/fixtures/factories/tool-status';

// Single running tool
const readTool = createRunningTool('Read', { file_path: '/src/index.ts' });

// Multiple concurrent tools
const tools = createToolStatusMap(3, { status: 'running' });

// Custom override
const bashTool = createToolStatus({
  name: 'Bash',
  status: 'running',
  input: { command: 'npm run build' },
});
```

### StreamingContext Factory Extension

**File:** `tests/fixtures/factories/streaming-context.ts` (extend existing)

**New Methods:**
- `createContextWithTools(tools: ToolInfo[])` - Create context with pre-populated tools Map
- `createContextWithRunningTool(toolName, input)` - Shorthand for single running tool

**Example Usage:**

```typescript
import { createContextWithTools } from '@/tests/fixtures/factories/streaming-context';

const context = createContextWithTools([
  { toolId: 'tool-1', toolName: 'Read', status: 'running', inputSummary: 'config.ts' },
  { toolId: 'tool-2', toolName: 'Grep', status: 'running', inputSummary: '"error"' },
]);
```

---

## Fixtures Required

### Tool Display Fixture

**File:** `tests/fixtures/tool-display.fixture.ts`

**Purpose:** Provide common tool display test scenarios.

**Fixtures:**

- `knownTools` - Array of all known tool names from TOOL_DISPLAY_NAMES
  - **Provides:** `{ name: string, displayName: string }[]`

- `unknownTools` - Array of unknown tool names for fallback testing
  - **Provides:** `{ name: string, expectedFallback: string }[]`

- `toolInputs` - Map of tool inputs for summarization testing
  - **Provides:** `{ toolName: string, input: Record<string, unknown>, expectedSummary: string | null }[]`

### Streaming Machine Test Fixture

**File:** `tests/fixtures/streaming-machine.fixture.ts` (extend existing)

**New Fixtures:**

- `machineWithRunningTools` - Machine in streaming state with active tools
  - **Setup:** Send TOOL_START events for multiple tools
  - **Provides:** `{ machine, tools: Map<string, ToolStatus> }`
  - **Cleanup:** Reset machine to idle

---

## Mock Requirements

### State Machine Tool Events

**Mock Scenario:** Simulate TOOL_START and TOOL_COMPLETE events

```typescript
// Simulate tool events for integration tests
const mockToolStartEvent = {
  type: 'TOOL_START',
  toolId: 'tool-123',
  toolName: 'Read',
  input: { file_path: '/src/index.ts' },
};

const mockToolCompleteEvent = {
  type: 'TOOL_COMPLETE',
  toolId: 'tool-123',
  result: { content: '...' },
  isError: false,
  durationMs: 150,
};
```

### Streaming Hook Mock

**Purpose:** Mock `useStreamingMachine()` for component isolation

```typescript
vi.mock('@/hooks/useStreamingMachine', () => ({
  useStreamingMachine: vi.fn(() => ({
    state: 'streaming',
    context: {
      tools: new Map([
        ['tool-1', { name: 'Read', status: 'running', input: { file_path: '/src/index.ts' } }],
      ]),
      text: '',
      thinking: [],
    },
    isLoading: true,
    isError: false,
    isComplete: false,
    send: vi.fn(),
    reset: vi.fn(),
  })),
}));
```

---

## Required data-testid Attributes

### ToolStatusChip Component

| data-testid | Element | Purpose |
|-------------|---------|---------|
| `tool-status-chip` | Root div | Container for single tool chip |
| `tool-status-indicator` | StatusIndicator | Spinning/status indicator |
| `tool-name` | span | Human-readable tool name text |
| `tool-input-summary` | span | Summarized input (optional) |

**Implementation Example:**

```tsx
<div data-testid="tool-status-chip" role="status" aria-label="Reading file: config.ts">
  <StatusIndicator data-testid="tool-status-indicator" status="acting" size="sm" />
  <span data-testid="tool-name">Reading file</span>
  <span data-testid="tool-input-summary">config.ts</span>
</div>
```

### ToolActivitySummary Component

| data-testid | Element | Purpose |
|-------------|---------|---------|
| `tool-activity-summary` | Root div | Container for all tool chips |

**Implementation Example:**

```tsx
<div data-testid="tool-activity-summary" role="region" aria-label="2 tools in progress">
  <ToolStatusChip ... />
  <ToolStatusChip ... />
</div>
```

### ChatMessageList Integration

| data-testid | Element | Purpose |
|-------------|---------|---------|
| `thinking-indicator` | ThinkingIndicator | (existing from Story 2.8) |
| `tool-activity-summary` | ToolActivitySummary | Tool status container |
| `assistant-message` | AssistantMessage | (existing from Story 2.7) |

---

## Implementation Checklist

### Task 1: Create Tool Display Helpers (AC #1, #4)

**File:** `src/lib/tool-display.ts`

**Tasks to make tests pass:**

- [ ] Create `src/lib/tool-display.ts` file
- [ ] Implement `TOOL_DISPLAY_NAMES` constant with known tool mappings
- [ ] Implement `humanizeToolName(toolName: string): string` function
- [ ] Add fallback logic for unknown tools (replace `_` with space, capitalize)
- [ ] Implement `summarizeToolInput(toolName: string, input: Record<string, unknown>): string | null`
- [ ] Handle Read/Write/Edit: extract filename from path
- [ ] Handle Bash: truncate command to 40 chars
- [ ] Handle Grep: wrap pattern in quotes
- [ ] Handle Glob: return pattern directly
- [ ] Handle WebFetch/WebSearch: extract hostname from URL
- [ ] Handle Composio tools: extract email/calendar summary
- [ ] Return null for unsupported tools
- [ ] Export all functions from module
- [ ] Run tests: `npm run test -- tool-display.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Task 2: Create ToolStatusChip Component (AC #1, #2, #4)

**File:** `src/components/chat/ToolStatusChip.tsx`

**Tasks to make tests pass:**

- [ ] Create `src/components/chat/ToolStatusChip.tsx` file
- [ ] Define `ToolExecutionStatus` type: `'running' | 'complete' | 'error'`
- [ ] Define `ToolStatusChipProps` interface
- [ ] Import `StatusIndicator` from `@/components/ui/StatusIndicator`
- [ ] Import `cn` from `@/lib/utils`
- [ ] Implement `getStatusIndicatorState()` mapping function
- [ ] Implement `ToolStatusChip` functional component
- [ ] Add StatusIndicator with correct state mapping
- [ ] Display tool name in span element
- [ ] Display input summary when provided (optional)
- [ ] Apply Editorial Luxury styling (0px radius, muted colors)
- [ ] Add `role="status"` for screen reader support
- [ ] Add `aria-label` with tool name and input summary
- [ ] Add `data-testid="tool-status-chip"` for testing
- [ ] Add `displayName` to component
- [ ] Export component and types
- [ ] Run tests: `npm run test -- ToolStatusChip.spec.tsx`
- [ ] Test passes (green phase)

**Estimated Effort:** 1.5 hours

---

### Task 3: Create ToolActivitySummary Component (AC #3)

**File:** `src/components/chat/ToolActivitySummary.tsx`

**Tasks to make tests pass:**

- [ ] Create `src/components/chat/ToolActivitySummary.tsx` file
- [ ] Define `ToolInfo` interface
- [ ] Define `ToolActivitySummaryProps` interface
- [ ] Import `ToolStatusChip` from `./ToolStatusChip`
- [ ] Implement `ToolActivitySummary` functional component
- [ ] Return null for empty tools array
- [ ] Map over tools array and render ToolStatusChip for each
- [ ] Use `tool.toolId` as React key
- [ ] Apply flex-wrap layout for multiple chips
- [ ] Add `role="region"` for screen reader support
- [ ] Add `aria-label` with tool count (e.g., "2 tools in progress")
- [ ] Add `data-testid="tool-activity-summary"` for testing
- [ ] Add `displayName` to component
- [ ] Export component and types
- [ ] Run tests: `npm run test -- ToolActivitySummary.spec.tsx`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Task 4: Verify State Machine ToolStatus Interface (AC #4)

**File:** `src/machines/streamingMachine.ts`

**Tasks to make tests pass:**

- [ ] Open `src/machines/streamingMachine.ts`
- [ ] Locate `ToolStatus` interface definition
- [ ] Verify it includes `input: Record<string, unknown>` field
- [ ] If `input` field is missing, add it to ToolStatus interface
- [ ] Locate TOOL_START event handler
- [ ] Verify `event.input` is stored in ToolStatus entry
- [ ] If not stored, update handler to persist input
- [ ] Verify TypeScript compilation succeeds
- [ ] Run tests: `npm run test -- streamingMachine.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 45 minutes

---

### Task 5: Integrate with ChatMessageList (AC all)

**File:** `src/components/chat/ChatMessageList.tsx`

**Tasks to make tests pass:**

- [ ] Import `ToolActivitySummary` and `ToolInfo` from `./ToolActivitySummary`
- [ ] Import `humanizeToolName` and `summarizeToolInput` from `@/lib/tool-display`
- [ ] Transform `context.tools` Map to `ToolInfo[]` array
- [ ] Use `humanizeToolName()` on tool.name
- [ ] Use `summarizeToolInput()` on tool.name and tool.input
- [ ] Create `hasActiveTools` check: `activeTools.some(t => t.status === 'running')`
- [ ] Render `ToolActivitySummary` below `ThinkingIndicator`
- [ ] Render `ToolActivitySummary` above `AssistantMessage`
- [ ] Conditionally render only when `hasActiveTools` is true
- [ ] Verify rendering order: ThinkingIndicator -> ToolActivitySummary -> AssistantMessage
- [ ] Run tests: `npm run test -- ChatMessageListTools.spec.tsx`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Task 6: Update Barrel Exports

**File:** `src/components/chat/index.ts`

**Tasks to make tests pass:**

- [ ] Add export for `ToolStatusChip` component
- [ ] Add export for `ToolStatusChipProps` type
- [ ] Add export for `ToolExecutionStatus` type
- [ ] Add export for `ToolActivitySummary` component
- [ ] Add export for `ToolActivitySummaryProps` type
- [ ] Add export for `ToolInfo` type
- [ ] Verify imports work from `@/components/chat`
- [ ] Run tests: `npm run test`
- [ ] Test passes (green phase)

**Estimated Effort:** 15 minutes

---

### Task 7: Create Test Factories

**File:** `tests/fixtures/factories/tool-status.ts`

**Tasks to make tests pass:**

- [ ] Create `tests/fixtures/factories/tool-status.ts` file
- [ ] Define `ToolStatusFactory` following existing factory patterns
- [ ] Implement `create(overrides?)` method
- [ ] Implement `createMany(count, overrides?)` method
- [ ] Implement `createRunningTool(toolName, input)` helper
- [ ] Implement `createCompleteTool(toolName, durationMs)` helper
- [ ] Implement `createToolStatusMap(count, overrides?)` helper
- [ ] Use faker for random data generation
- [ ] Export all factory methods
- [ ] Add factory tests to verify it works
- [ ] Run tests: `npm run test -- tool-status.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Task 8: Write Unit Tests (RED Phase)

**Files:**
- `tests/unit/components/chat/tool-display.spec.ts`
- `tests/unit/components/chat/ToolStatusChip.spec.tsx`
- `tests/unit/components/chat/ToolActivitySummary.spec.tsx`

**Tasks:**

- [ ] Create test files following existing test patterns
- [ ] Write tests for 2.9-UNIT-001 through 2.9-UNIT-016
- [ ] Use Given-When-Then format in test descriptions
- [ ] Mock dependencies appropriately
- [ ] Run all unit tests: `npm run test:unit`
- [ ] Verify all tests FAIL (red phase)
- [ ] Document expected failure messages

**Estimated Effort:** 2 hours

---

### Task 9: Write Component Tests (RED Phase)

**File:** `tests/component/chat/ChatMessageListTools.spec.tsx`

**Tasks:**

- [ ] Create test file
- [ ] Write tests for 2.9-COMP-001 through 2.9-COMP-005
- [ ] Mock useStreamingMachine hook
- [ ] Test rendering order and conditional display
- [ ] Run component tests: `npm run test:component`
- [ ] Verify all tests FAIL (red phase)

**Estimated Effort:** 1.5 hours

---

### Task 10: Write Integration Tests (RED Phase)

**File:** `tests/integration/chat/tool-status-flow.spec.ts`

**Tasks:**

- [ ] Create test file
- [ ] Write tests for 2.9-INT-001 through 2.9-INT-004
- [ ] Test full state machine -> UI flow
- [ ] Verify tool events trigger correct UI updates
- [ ] Run integration tests: `npm run test:integration`
- [ ] Verify all tests FAIL (red phase)

**Estimated Effort:** 1.5 hours

---

### Task 11: Write E2E Tests (RED Phase)

**File:** `tests/e2e/chat/tool-status.spec.ts`

**Tasks:**

- [ ] Create test file
- [ ] Write tests for 2.9-E2E-001 through 2.9-E2E-006
- [ ] Use Playwright for browser automation
- [ ] Test user-visible behavior
- [ ] Include dark mode and reduced motion tests
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Verify all tests FAIL (red phase)

**Estimated Effort:** 2 hours

---

### Task 12: Write Accessibility Tests (RED Phase)

**File:** `tests/accessibility/chat/ToolStatusChip.a11y.spec.tsx`

**Tasks:**

- [ ] Create test file
- [ ] Write tests for 2.9-A11Y-001 through 2.9-A11Y-004
- [ ] Use axe-core for accessibility scanning
- [ ] Test screen reader announcements
- [ ] Test keyboard navigation (chips should be skipped)
- [ ] Run accessibility tests: `npm run test:a11y`
- [ ] Verify all tests FAIL (red phase)

**Estimated Effort:** 1 hour

---

### Task 13: Write Visual Regression Tests (RED Phase)

**File:** `tests/visual/chat/ToolStatusChip.visual.spec.tsx`

**Tasks:**

- [ ] Create test file
- [ ] Write tests for 2.9-VIS-001 through 2.9-VIS-004
- [ ] Capture baseline snapshots for chip states
- [ ] Include dark mode snapshots
- [ ] Run visual tests: `npm run test:visual`
- [ ] Verify all tests FAIL (red phase - no snapshots yet)

**Estimated Effort:** 1 hour

---

## Running Tests

```bash
# Run all failing tests for this story
npm run test -- --grep "2.9"

# Run specific test file
npm run test -- tests/unit/components/chat/tool-display.spec.ts

# Run tests in watch mode
npm run test -- --watch tool-display

# Run component tests
npm run test -- tests/component/chat/ChatMessageListTools.spec.tsx

# Run E2E tests
npm run test:e2e -- tests/e2e/chat/tool-status.spec.ts

# Run E2E in headed mode (see browser)
npm run test:e2e -- tests/e2e/chat/tool-status.spec.ts --headed

# Debug specific test
npm run test:e2e -- tests/e2e/chat/tool-status.spec.ts --debug

# Run accessibility tests
npm run test -- tests/accessibility/chat/ToolStatusChip.a11y.spec.tsx

# Run visual regression tests
npm run test -- tests/visual/chat/ToolStatusChip.visual.spec.tsx --update-snapshots

# Run all tests with coverage
npm run test -- --coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- All tests written and failing
- Factories and fixtures created with auto-cleanup
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

1. **Pick one failing test** from implementation checklist (start with Task 1)
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

1. Task 1: Tool display helpers (foundation)
2. Task 7: Test factories (enable other tests)
3. Task 2: ToolStatusChip component
4. Task 3: ToolActivitySummary component
5. Task 4: State machine verification
6. Task 5: ChatMessageList integration
7. Task 6: Barrel exports

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability, performance)
3. **Extract duplications** (DRY principle)
4. **Optimize performance** (if needed)
5. **Ensure tests still pass** after each refactor
6. **Update documentation** (if API contracts change)

---

## Edge Cases Coverage

### Unknown Tool Names (AC #1)

| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Known SDK tool | `"Read"` | `"Reading file"` |
| Known Composio tool | `"GMAIL_SEND_MESSAGE"` | `"Sending email"` |
| Unknown snake_case | `"CUSTOM_TOOL"` | `"Custom tool"` |
| Unknown PascalCase | `"MyCustomTool"` | `"My custom tool"` |
| Single word | `"Unknown"` | `"Unknown"` |

### Missing Tool Input (AC #4)

| Scenario | Tool | Input | Expected Summary |
|----------|------|-------|------------------|
| Missing file_path | Read | `{}` | `null` |
| Empty command | Bash | `{ command: '' }` | `null` |
| Invalid URL | WebFetch | `{ url: 'not-a-url' }` | `"not-a-url"` (truncated) |
| Null input | Grep | `null` | `null` |

### Many Concurrent Tools (AC #3)

| Scenario | Tool Count | Expected Behavior |
|----------|------------|-------------------|
| Zero tools | 0 | ToolActivitySummary returns null |
| One tool | 1 | Single chip rendered |
| Three tools | 3 | Three chips, flex-wrap layout |
| Ten tools | 10 | Ten chips, wraps to multiple rows |
| Mixed states | 5 (2 running, 3 complete) | All 5 visible, correct states |

### Concurrent Tools and Thinking (AC #3)

| Scenario | Thinking Active | Tools Running | Expected Render Order |
|----------|-----------------|---------------|----------------------|
| Only thinking | true | 0 | ThinkingIndicator only |
| Only tools | false | 2 | ToolActivitySummary only |
| Both active | true | 2 | ThinkingIndicator -> ToolActivitySummary |
| Neither | false | 0 | Nothing rendered |

---

## Accessibility Requirements Verification

| Requirement | Test ID | Implementation |
|-------------|---------|----------------|
| Screen reader support | 2.9-A11Y-001, 002 | `role="status"` on ToolStatusChip |
| Tool announcement | 2.9-A11Y-002 | `aria-label` includes tool name + summary |
| Multiple tools count | 2.9-A11Y-003 | Container `aria-label` announces count |
| Reduced motion | 2.9-E2E-006 | StatusIndicator respects `prefers-reduced-motion` |
| Color contrast | 2.9-A11Y-001 | Gold on surface meets WCAG AA |
| Non-blocking nav | 2.9-A11Y-004 | Chips are non-interactive, no tabindex |

---

## Next Steps

1. **Review this checklist** with team in standup or planning
2. **Run failing tests** to confirm RED phase: `npm run test -- --grep "2.9"`
3. **Begin implementation** using implementation checklist as guide
4. **Work one test at a time** (red -> green for each)
5. **Share progress** in daily standup
6. **When all tests pass**, refactor code for quality
7. **When refactoring complete**, update story status to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **component-tdd.md** - Red-green-refactor workflow, provider isolation, accessibility assertions, visual regression patterns
- **test-levels-framework.md** - Test level selection (unit vs component vs integration vs E2E)
- **selector-resilience.md** - data-testid hierarchy, ARIA roles for semantic elements
- **test-quality.md** - Given-When-Then format, deterministic tests, isolation principles
- **fixture-architecture.md** - Factory patterns with override support

See `_bmad/bmm/testarch/tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npm run test -- --grep "2.9"`

**Expected Results:**

```
FAIL tests/unit/components/chat/tool-display.spec.ts
FAIL tests/unit/components/chat/ToolStatusChip.spec.tsx
FAIL tests/unit/components/chat/ToolActivitySummary.spec.tsx
FAIL tests/component/chat/ChatMessageListTools.spec.tsx
FAIL tests/integration/chat/tool-status-flow.spec.ts
FAIL tests/e2e/chat/tool-status.spec.ts
FAIL tests/accessibility/chat/ToolStatusChip.a11y.spec.tsx
FAIL tests/visual/chat/ToolStatusChip.visual.spec.tsx

Test Suites: 8 failed, 8 total
Tests: 39 failed, 39 total
```

**Summary:**

- Total tests: 39
- Passing: 0 (expected)
- Failing: 39 (expected)
- Status: RED phase ready

**Expected Failure Messages:**

- `Cannot find module 'src/lib/tool-display'`
- `Cannot find module 'src/components/chat/ToolStatusChip'`
- `Cannot find module 'src/components/chat/ToolActivitySummary'`
- `humanizeToolName is not a function`
- `summarizeToolInput is not a function`
- `Element with data-testid="tool-status-chip" not found`

---

## Notes

### UX Design Alignment

Per UX specification (lines 1435-1492), the full ActivityIndicator with collapse/expand behavior will be refined in Story 2.10. This story focuses on the building blocks:
- ToolStatusChip - individual tool status display
- ToolActivitySummary - container for multiple chips

### Human-Readable Tool Names

Critical UX requirement: Users see friendly names, not SDK identifiers:
- "Reading file" not "Read"
- "Searching" not "Grep"
- "Checking calendar" not "GOOGLE_CALENDAR_GET_EVENTS"

### Tool Input Privacy

The `summarizeToolInput()` function extracts minimal context:
- Filenames only (not full paths)
- Search patterns (not file contents)
- Domains (not full URLs with parameters)

### StatusIndicator Reuse

Story 2.9 reuses StatusIndicator from Story 1.9:
- `status="acting"` for running tools (gold spin animation)
- Already supports `prefers-reduced-motion`
- Already has correct sizing (sm/md/lg)

### State Machine Dependency

Verify Story 2.6 ToolStatus interface includes `input` field. If missing, add it per architecture.md ToolStartPayload specification.

---

## Contact

**Questions or Issues?**

- Review story definition: `thoughts/implementation-artifacts/stories/story-2-9-render-tooluseblock-status.md`
- Consult TEA knowledge base: `_bmad/bmm/testarch/knowledge/`
- Reference architecture: `thoughts/planning-artifacts/architecture.md` (lines 928-942)

---

**Generated by BMad TEA Agent** - 2026-01-24
