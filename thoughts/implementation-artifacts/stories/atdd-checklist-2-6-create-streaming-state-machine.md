# ATDD Checklist: 2-6-create-streaming-state-machine

**Story:** Create Streaming State Machine
**Epic:** 2 - First Conversation
**Created:** 2026-01-24
**Test Architect:** TEA (Master Test Architect)

---

## Summary

This checklist defines comprehensive test scenarios for Story 2.6, which creates an XState v5 machine (`streamingMachine`) to manage chat UI state with 5 explicit states (idle, sending, streaming, complete, error) and predictable transitions.

**Key Testing Principles:**
- Use `@xstate/test` for state machine path coverage
- Mock stream events (do not rely on real Tauri IPC in unit tests)
- Test XState determinism to avoid TC-3 (race condition concern from test-design-system.md)
- Follow Test ID convention: `2.6-{LEVEL}-{SEQ}`

---

## AC1: States exist: idle, sending, streaming, complete, error

### Happy Path

- [ ] **2.6-UNIT-001**: Machine initial state is `idle`
  - Given: A new streamingMachine instance
  - When: Machine is created with initial context
  - Then: `snapshot.value` equals `'idle'`

- [ ] **2.6-UNIT-002**: Machine has exactly 5 states defined
  - Given: The streamingMachine definition
  - When: Inspecting machine.states
  - Then: States object contains keys: `idle`, `sending`, `streaming`, `complete`, `error`

- [ ] **2.6-UNIT-003**: Initial context has correct default values
  - Given: A new streamingMachine instance
  - When: Machine is created
  - Then: Context matches `initialContext` (requestId: null, sessionId: null, text: '', thinking: '', tools: empty Map, error: null, costUsd: null, durationMs: null, totalTokens: null)

### Edge Cases

- [ ] **2.6-UNIT-004**: Machine with custom initial context
  - Given: Creating machine with custom context via `.provide()`
  - When: Machine starts
  - Then: Initial state is still `idle` regardless of context values

- [ ] **2.6-UNIT-005**: State names are lowercase strings
  - Given: The streamingMachine
  - When: Checking state value types
  - Then: All state values are lowercase strings (not symbols or objects)

### Error Handling

- [ ] **2.6-UNIT-006**: Machine rejects invalid initial state configuration
  - Given: Attempting to configure machine with non-existent initial state
  - When: Machine is created
  - Then: XState throws configuration error

---

## AC2: Transitions exist (idle->sending->streaming->complete)

### Happy Path

- [ ] **2.6-UNIT-007**: Transition from `idle` to `sending` on SEND event
  - Given: Machine in `idle` state
  - When: SEND event dispatched with `{ type: 'SEND', prompt: 'hello', sessionId: 'test-session' }`
  - Then: State becomes `sending`

- [ ] **2.6-UNIT-008**: Context reset on SEND from idle
  - Given: Machine in `idle` state
  - When: SEND event dispatched
  - Then: Context has text: '', thinking: '', tools: empty Map, error: null

- [ ] **2.6-UNIT-009**: SessionId set in context on SEND
  - Given: Machine in `idle` state
  - When: SEND event dispatched with sessionId
  - Then: `context.sessionId` equals provided sessionId

- [ ] **2.6-UNIT-010**: Transition from `sending` to `streaming` on FIRST_EVENT
  - Given: Machine in `sending` state
  - When: FIRST_EVENT dispatched
  - Then: State becomes `streaming`

- [ ] **2.6-UNIT-011**: Transition from `sending` to `streaming` on TEXT_CHUNK
  - Given: Machine in `sending` state
  - When: TEXT_CHUNK event dispatched with `{ type: 'TEXT_CHUNK', content: 'Hello' }`
  - Then: State becomes `streaming`
  - And: `context.text` equals `'Hello'`

- [ ] **2.6-UNIT-012**: Transition from `sending` to `streaming` on THINKING_CHUNK
  - Given: Machine in `sending` state
  - When: THINKING_CHUNK event dispatched with `{ type: 'THINKING_CHUNK', content: 'Let me think...' }`
  - Then: State becomes `streaming`
  - And: `context.thinking` equals `'Let me think...'`

- [ ] **2.6-UNIT-013**: Transition from `sending` to `streaming` on TOOL_START
  - Given: Machine in `sending` state
  - When: TOOL_START event dispatched with `{ type: 'TOOL_START', toolId: 't1', toolName: 'search' }`
  - Then: State becomes `streaming`
  - And: `context.tools.get('t1')` exists with status `'running'`

- [ ] **2.6-UNIT-014**: REQUEST_STARTED stores requestId in context
  - Given: Machine in `sending` state
  - When: REQUEST_STARTED event dispatched with `{ type: 'REQUEST_STARTED', requestId: 'req-123' }`
  - Then: State remains `sending`
  - And: `context.requestId` equals `'req-123'`

- [ ] **2.6-UNIT-015**: Transition from `streaming` to `complete` on COMPLETE
  - Given: Machine in `streaming` state
  - When: COMPLETE event dispatched with `{ type: 'COMPLETE', costUsd: 0.05, durationMs: 1200, totalTokens: 500 }`
  - Then: State becomes `complete`

- [ ] **2.6-UNIT-016**: Completion metadata stored in context
  - Given: Machine in `streaming` state
  - When: COMPLETE event dispatched
  - Then: `context.costUsd`, `context.durationMs`, `context.totalTokens` are set from event

### Edge Cases

- [ ] **2.6-UNIT-017**: Text accumulation across multiple TEXT_CHUNK events
  - Given: Machine in `streaming` state with existing text
  - When: Multiple TEXT_CHUNK events dispatched
  - Then: `context.text` is concatenation of all chunks in order

- [ ] **2.6-UNIT-018**: Thinking accumulation across multiple THINKING_CHUNK events
  - Given: Machine in `streaming` state with existing thinking content
  - When: Multiple THINKING_CHUNK events dispatched
  - Then: `context.thinking` is concatenation of all chunks in order

- [ ] **2.6-UNIT-019**: Multiple concurrent tools tracked
  - Given: Machine in `streaming` state
  - When: TOOL_START for 't1', then TOOL_START for 't2', then TOOL_COMPLETE for 't1'
  - Then: `context.tools` has both entries; 't1' is complete, 't2' is running

- [ ] **2.6-UNIT-020**: TOOL_COMPLETE updates existing tool status
  - Given: Machine in `streaming` state with tool 't1' running
  - When: TOOL_COMPLETE dispatched with `{ type: 'TOOL_COMPLETE', toolId: 't1', isError: false, durationMs: 250 }`
  - Then: `context.tools.get('t1').status` equals `'complete'`
  - And: `context.tools.get('t1').durationMs` equals 250

- [ ] **2.6-UNIT-021**: TOOL_COMPLETE with error sets error status
  - Given: Machine in `streaming` state with tool 't1' running
  - When: TOOL_COMPLETE dispatched with `isError: true`
  - Then: `context.tools.get('t1').status` equals `'error'`

- [ ] **2.6-UNIT-022**: TOOL_COMPLETE for unknown tool is no-op
  - Given: Machine in `streaming` state with no tools
  - When: TOOL_COMPLETE dispatched for non-existent 't1'
  - Then: State remains `streaming` (no error thrown)

- [ ] **2.6-UNIT-023**: Empty TEXT_CHUNK content is valid
  - Given: Machine in `streaming` state
  - When: TEXT_CHUNK dispatched with empty string content
  - Then: `context.text` unchanged (or concatenated with empty string)

- [ ] **2.6-UNIT-024**: SEND without sessionId defaults to null
  - Given: Machine in `idle` state
  - When: SEND event dispatched without sessionId property
  - Then: `context.sessionId` is null

### Error Handling

- [ ] **2.6-UNIT-025**: Invalid event in `idle` state is ignored
  - Given: Machine in `idle` state
  - When: TEXT_CHUNK event dispatched (invalid for idle)
  - Then: State remains `idle` (no crash)

- [ ] **2.6-UNIT-026**: COMPLETE event in `idle` state is ignored
  - Given: Machine in `idle` state
  - When: COMPLETE event dispatched
  - Then: State remains `idle` (no crash)

### Boundary Conditions

- [ ] **2.6-UNIT-027**: Very long text accumulation (10KB+)
  - Given: Machine in `streaming` state
  - When: 100 TEXT_CHUNK events each with 100 characters
  - Then: `context.text.length` equals 10000 (performance acceptable)

- [ ] **2.6-UNIT-028**: Unicode content in TEXT_CHUNK
  - Given: Machine in `streaming` state
  - When: TEXT_CHUNK with emoji and non-ASCII characters
  - Then: `context.text` preserves exact Unicode content

---

## AC3: Error state reachable from sending or streaming

### Happy Path

- [ ] **2.6-UNIT-029**: Transition from `sending` to `error` on ERROR
  - Given: Machine in `sending` state
  - When: ERROR event dispatched with `{ type: 'ERROR', code: '1001', message: 'Network error', recoverable: true }`
  - Then: State becomes `error`

- [ ] **2.6-UNIT-030**: Transition from `streaming` to `error` on ERROR
  - Given: Machine in `streaming` state
  - When: ERROR event dispatched
  - Then: State becomes `error`

- [ ] **2.6-UNIT-031**: Error context populated correctly
  - Given: Machine in `sending` state
  - When: ERROR event dispatched with code, message, recoverable
  - Then: `context.error` object has matching code, message, recoverable properties

- [ ] **2.6-UNIT-032**: Recoverable error flag stored
  - Given: Machine in `sending` state
  - When: ERROR event with `recoverable: true`
  - Then: `context.error.recoverable` equals true

- [ ] **2.6-UNIT-033**: Non-recoverable error flag stored
  - Given: Machine in `streaming` state
  - When: ERROR event with `recoverable: false`
  - Then: `context.error.recoverable` equals false

### Edge Cases

- [ ] **2.6-UNIT-034**: ERROR event preserves accumulated text
  - Given: Machine in `streaming` state with `context.text = 'partial response'`
  - When: ERROR event dispatched
  - Then: State becomes `error`
  - And: `context.text` still equals `'partial response'`

- [ ] **2.6-UNIT-035**: ERROR event preserves accumulated thinking
  - Given: Machine in `streaming` state with thinking content
  - When: ERROR event dispatched
  - Then: `context.thinking` is preserved

- [ ] **2.6-UNIT-036**: ERROR event preserves tool tracking
  - Given: Machine in `streaming` state with tools in progress
  - When: ERROR event dispatched
  - Then: `context.tools` Map is preserved

### Error Handling

- [ ] **2.6-UNIT-037**: ERROR event in `idle` state is ignored
  - Given: Machine in `idle` state
  - When: ERROR event dispatched
  - Then: State remains `idle`

- [ ] **2.6-UNIT-038**: ERROR event in `complete` state is ignored
  - Given: Machine in `complete` state
  - When: ERROR event dispatched
  - Then: State remains `complete`

- [ ] **2.6-UNIT-039**: ERROR event in `error` state is ignored (no double error)
  - Given: Machine already in `error` state with error context
  - When: Another ERROR event dispatched
  - Then: State remains `error` (original error context unchanged)

### Boundary Conditions

- [ ] **2.6-UNIT-040**: Empty error message is valid
  - Given: Machine in `sending` state
  - When: ERROR event with `message: ''`
  - Then: State becomes `error` with empty message

- [ ] **2.6-UNIT-041**: Long error message (1000+ chars)
  - Given: Machine in `streaming` state
  - When: ERROR event with very long message
  - Then: Full message stored in context.error.message

---

## AC4: Machine resets to idle when starting new message

### Happy Path

- [ ] **2.6-UNIT-042**: SEND from `complete` state transitions to `sending`
  - Given: Machine in `complete` state with completion metadata
  - When: SEND event dispatched
  - Then: State becomes `sending`

- [ ] **2.6-UNIT-043**: SEND from `error` state transitions to `sending`
  - Given: Machine in `error` state
  - When: SEND event dispatched
  - Then: State becomes `sending`

- [ ] **2.6-UNIT-044**: Context reset on SEND from `complete`
  - Given: Machine in `complete` state with text, thinking, tools, costUsd, durationMs
  - When: SEND event dispatched
  - Then: `context.text` equals ''
  - And: `context.thinking` equals ''
  - And: `context.tools` is empty Map
  - And: `context.error` is null
  - And: `context.costUsd` is null
  - And: `context.durationMs` is null
  - And: `context.totalTokens` is null

- [ ] **2.6-UNIT-045**: Context reset on SEND from `error`
  - Given: Machine in `error` state with error context
  - When: SEND event dispatched
  - Then: `context.error` is null
  - And: All accumulation fields reset

- [ ] **2.6-UNIT-046**: SessionId updated on SEND from `complete`
  - Given: Machine in `complete` state with `sessionId: 'old-session'`
  - When: SEND event dispatched with `sessionId: 'new-session'`
  - Then: `context.sessionId` equals `'new-session'`

- [ ] **2.6-UNIT-047**: RequestId cleared on SEND
  - Given: Machine in `complete` state with `requestId: 'req-old'`
  - When: SEND event dispatched
  - Then: `context.requestId` is null (until new REQUEST_STARTED)

- [ ] **2.6-UNIT-048**: RESET from `complete` transitions to `idle`
  - Given: Machine in `complete` state
  - When: RESET event dispatched
  - Then: State becomes `idle`

- [ ] **2.6-UNIT-049**: RESET from `error` transitions to `idle`
  - Given: Machine in `error` state
  - When: RESET event dispatched
  - Then: State becomes `idle`

- [ ] **2.6-UNIT-050**: Full context reset on RESET
  - Given: Machine in `complete` state with all context populated
  - When: RESET event dispatched
  - Then: Context matches `initialContext` exactly

### Edge Cases

- [ ] **2.6-UNIT-051**: SEND from `complete` without sessionId clears sessionId
  - Given: Machine in `complete` state with existing sessionId
  - When: SEND event dispatched without sessionId
  - Then: `context.sessionId` is null

- [ ] **2.6-UNIT-052**: Rapid SEND events (debounce behavior)
  - Given: Machine in `idle` state
  - When: Two SEND events dispatched in rapid succession
  - Then: Machine processes second SEND (no queuing, last wins)

- [ ] **2.6-UNIT-053**: RESET clears sessionId (unlike SEND which can preserve)
  - Given: Machine in `complete` state with sessionId
  - When: RESET event dispatched
  - Then: `context.sessionId` is null

### Error Handling

- [ ] **2.6-UNIT-054**: RESET from `idle` is no-op
  - Given: Machine in `idle` state
  - When: RESET event dispatched
  - Then: State remains `idle` (no error)

- [ ] **2.6-UNIT-055**: RESET from `sending` is ignored
  - Given: Machine in `sending` state
  - When: RESET event dispatched
  - Then: State remains `sending` (RESET only valid from terminal states)

- [ ] **2.6-UNIT-056**: RESET from `streaming` is ignored
  - Given: Machine in `streaming` state
  - When: RESET event dispatched
  - Then: State remains `streaming`

---

## Hook Tests: useStreamingMachine

### Happy Path

- [ ] **2.6-HOOK-001**: Hook returns correct initial state
  - Given: Component rendering `useStreamingMachine`
  - When: Hook initializes
  - Then: `state` equals `'idle'`
  - And: `isLoading` equals false
  - And: `isError` equals false
  - And: `isComplete` equals false

- [ ] **2.6-HOOK-002**: `send()` function dispatches SEND and invokes IPC
  - Given: Hook rendered with mocked `sendChatMessage`
  - When: `send('test prompt', 'session-id')` called
  - Then: Machine receives SEND event
  - And: `sendChatMessage` IPC called with prompt and sessionId

- [ ] **2.6-HOOK-003**: `send()` dispatches REQUEST_STARTED with requestId
  - Given: Hook rendered with mocked IPC returning `{ requestId: 'req-123' }`
  - When: `send()` called and IPC resolves
  - Then: `context.requestId` equals `'req-123'`

- [ ] **2.6-HOOK-004**: `send()` handles IPC error
  - Given: Hook rendered with IPC that rejects with error
  - When: `send()` called
  - Then: State becomes `error`
  - And: `context.error.code` equals `'1001'`

- [ ] **2.6-HOOK-005**: `reset()` function dispatches RESET event
  - Given: Hook in `complete` state
  - When: `reset()` called
  - Then: State becomes `idle`

- [ ] **2.6-HOOK-006**: `isLoading` true in `sending` state
  - Given: Hook in `sending` state
  - When: Checking `isLoading`
  - Then: Returns true

- [ ] **2.6-HOOK-007**: `isLoading` true in `streaming` state
  - Given: Hook in `streaming` state
  - When: Checking `isLoading`
  - Then: Returns true

- [ ] **2.6-HOOK-008**: `isLoading` false in other states
  - Given: Hook in `idle`, `complete`, or `error` state
  - When: Checking `isLoading`
  - Then: Returns false

- [ ] **2.6-HOOK-009**: `isError` true only in `error` state
  - Given: Hook in `error` state
  - When: Checking `isError`
  - Then: Returns true

- [ ] **2.6-HOOK-010**: `isComplete` true only in `complete` state
  - Given: Hook in `complete` state
  - When: Checking `isComplete`
  - Then: Returns true

### Stream Event Integration

- [ ] **2.6-HOOK-011**: Stream TEXT_CHUNK dispatches TEXT_CHUNK event to machine
  - Given: Hook with active requestId and mocked stream listener
  - When: Stream emits text message
  - Then: Machine receives TEXT_CHUNK event
  - And: `context.text` updated

- [ ] **2.6-HOOK-012**: Stream THINKING_CHUNK dispatches THINKING_CHUNK event
  - Given: Hook with active requestId
  - When: Stream emits thinking message
  - Then: Machine receives THINKING_CHUNK event
  - And: `context.thinking` updated

- [ ] **2.6-HOOK-013**: Stream tool start dispatches TOOL_START event
  - Given: Hook with active requestId
  - When: Stream emits tool start
  - Then: Machine receives TOOL_START event
  - And: Tool added to `context.tools`

- [ ] **2.6-HOOK-014**: Stream tool complete dispatches TOOL_COMPLETE event
  - Given: Hook with active requestId and running tool
  - When: Stream emits tool complete
  - Then: Machine receives TOOL_COMPLETE event
  - And: Tool status updated

- [ ] **2.6-HOOK-015**: Stream complete dispatches COMPLETE event
  - Given: Hook in `streaming` state
  - When: Stream emits complete
  - Then: Machine receives COMPLETE event
  - And: State becomes `complete`

- [ ] **2.6-HOOK-016**: Stream error dispatches ERROR event
  - Given: Hook in `streaming` state
  - When: Stream emits error
  - Then: Machine receives ERROR event
  - And: State becomes `error`

### Edge Cases

- [ ] **2.6-HOOK-017**: Hook cleans up on unmount
  - Given: Component with hook mounted
  - When: Component unmounts
  - Then: No memory leaks (verify with React testing-library cleanup)

- [ ] **2.6-HOOK-018**: Hook handles missing requestId gracefully
  - Given: Hook with null requestId
  - When: Stream listener tries to filter
  - Then: No events processed (no errors thrown)

---

## Integration Tests

### Full Flow

- [ ] **2.6-INT-001**: Complete happy path flow
  - Given: useStreamingMachine hook with mocked IPC and stream
  - When: send() -> stream events -> COMPLETE
  - Then: idle -> sending -> streaming -> complete transitions observed
  - And: Final context has accumulated text, costUsd, durationMs

- [ ] **2.6-INT-002**: Error recovery flow
  - Given: Hook in error state
  - When: send() called with new prompt
  - Then: error -> sending transition
  - And: Error context cleared

- [ ] **2.6-INT-003**: Multiple message flow
  - Given: Hook completed first message (complete state)
  - When: send() called for second message
  - Then: complete -> sending transition
  - And: Previous text cleared

- [ ] **2.6-INT-004**: Tool execution within streaming
  - Given: Hook in streaming state
  - When: TOOL_START -> TEXT_CHUNK -> TOOL_COMPLETE -> COMPLETE events
  - Then: All state transitions correct
  - And: Final context has both text and tool tracking

---

## E2E Tests

### UI State Reflection

- [ ] **2.6-E2E-001**: UI reflects idle state on initial load
  - Given: Fresh app load
  - When: Chat component renders
  - Then: No loading indicators visible
  - And: Input field enabled

- [ ] **2.6-E2E-002**: UI shows loading during sending/streaming
  - Given: User sends message
  - When: State is sending or streaming
  - Then: Loading indicator visible
  - And: Input may be disabled or show pending state

- [ ] **2.6-E2E-003**: UI shows completion with metadata
  - Given: Stream completes
  - When: State is complete
  - Then: Response text visible
  - And: Cost/duration metadata accessible

- [ ] **2.6-E2E-004**: UI shows error state
  - Given: Stream errors
  - When: State is error
  - Then: Error message displayed
  - And: Retry affordance visible (if recoverable)

- [ ] **2.6-E2E-005**: New message after completion works
  - Given: Previous message completed
  - When: User sends new message
  - Then: UI resets to loading state
  - And: New response begins streaming

---

## XState Model-Based Testing (TC-3 Mitigation)

### State Machine Path Coverage

- [ ] **2.6-MODEL-001**: All state transitions covered via @xstate/test
  - Given: XState test model configuration
  - When: Generating all reachable paths
  - Then: Every defined transition exercised at least once

- [ ] **2.6-MODEL-002**: No unreachable states
  - Given: XState test model
  - When: Analyzing state graph
  - Then: All states reachable from initial state

- [ ] **2.6-MODEL-003**: No race conditions in rapid event sequences
  - Given: Machine in streaming state
  - When: Rapid TEXT_CHUNK, TOOL_START, TOOL_COMPLETE, COMPLETE events
  - Then: All events processed in order (deterministic final state)

---

## Coverage Summary

| Category | Test Count | Priority |
|----------|------------|----------|
| AC1: States | 6 | High |
| AC2: Transitions | 22 | High |
| AC3: Error States | 13 | High |
| AC4: Reset | 15 | High |
| Hook Tests | 18 | High |
| Integration | 4 | Medium |
| E2E | 5 | Medium |
| Model-Based | 3 | Medium |
| **Total** | **86** | - |

---

## Test Infrastructure Requirements

1. **XState Testing:** Install `@xstate/test` for model-based coverage
2. **React Testing Library:** For hook tests with `renderHook`
3. **Mock IPC:** Create `mockSendChatMessage` fixture for isolation
4. **Mock Stream Listener:** Create `mockUseStreamListener` fixture for controlled event dispatch
5. **Vitest Config:** Configure `@xstate/react` in test environment

---

## Definition of Done

- [ ] All 86 test cases have passing implementations
- [ ] Unit test coverage >= 80% on `streamingMachine.ts`
- [ ] Unit test coverage >= 80% on `useStreamingMachine.ts`
- [ ] XState model-based tests generate all reachable paths
- [ ] No flaky tests (run 3x consecutively without failure)
- [ ] E2E tests pass in CI pipeline
- [ ] Tests documented in this checklist marked as passing

---

*Generated by TEA (Master Test Architect) - Strong opinions, weakly held.*
