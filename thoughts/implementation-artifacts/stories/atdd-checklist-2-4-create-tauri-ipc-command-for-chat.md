# ATDD Checklist: Story 2.4 - Create Tauri IPC Command for Chat

**Story ID:** 2-4-create-tauri-ipc-command-for-chat
**Epic:** Epic 2: First Conversation
**Generated:** 2026-01-24
**Author:** TEA (Master Test Architect)

---

## Acceptance Criteria Summary

| AC# | Criterion |
|-----|-----------|
| AC1 | When frontend calls `invoke('chat_send', { prompt, sessionId })`, Rust backend spawns SDK query |
| AC2 | A unique `requestId` is returned immediately for stream correlation |
| AC3 | The command is non-blocking (streaming happens via events) |

---

## Test Scenarios

### AC1: SDK Query Spawning

**Given** the SDK wrapper is implemented (Story 2.3)
**When** frontend calls `invoke('chat_send', { prompt, sessionId })`
**Then** the Rust backend spawns the SDK query

#### Unit Tests (Rust)

| Test ID | Scenario | Input | Expected | Priority |
|---------|----------|-------|----------|----------|
| 2.4-UNIT-001 | chat_send command accepts valid request | `{ prompt: "Hello", sessionId: "sess-123" }` | Returns `Ok(ChatSendResponse)` | P0 |
| 2.4-UNIT-002 | chat_send command accepts request without sessionId | `{ prompt: "Hello" }` | Returns `Ok(ChatSendResponse)`, generates sessionId | P0 |
| 2.4-UNIT-003 | emit_stream_event parses text message correctly | `{"type":"text","content":"Hello","isComplete":false}` | Emits `StreamPayload::Text` with correct fields | P0 |
| 2.4-UNIT-004 | emit_stream_event parses thinking message correctly | `{"type":"thinking","content":"Analyzing...","isComplete":false}` | Emits `StreamPayload::Thinking` | P1 |
| 2.4-UNIT-005 | emit_stream_event parses tool_start message correctly | `{"type":"tool_start","toolId":"t1","toolName":"Bash","input":{}}` | Emits `StreamPayload::ToolStart` | P1 |
| 2.4-UNIT-006 | emit_stream_event parses tool_complete message correctly | `{"type":"tool_complete","toolId":"t1","result":{},"isError":false,"durationMs":100}` | Emits `StreamPayload::ToolComplete` | P1 |
| 2.4-UNIT-007 | emit_stream_event parses complete message correctly | `{"type":"complete","sessionId":"s1","durationMs":5000,"costUsd":0.05}` | Emits `StreamPayload::Complete` | P0 |
| 2.4-UNIT-008 | emit_stream_event parses error message correctly | `{"type":"error","code":"1001","message":"API error","recoverable":true}` | Emits `StreamPayload::Error` | P0 |
| 2.4-UNIT-009 | emit_stream_event ignores unknown message types | `{"type":"unknown","data":"foo"}` | Returns `Ok(())`, no event emitted | P2 |
| 2.4-UNIT-010 | emit_stream_event handles malformed JSON | `not-json` | Returns `Err` with parse error | P1 |
| 2.4-UNIT-011 | emit_error_event emits session error event | Error message string | Emits `orion://session/error` with code 9001 | P0 |

#### Unit Tests (TypeScript - SDK Runner)

| Test ID | Scenario | Input | Expected | Priority |
|---------|----------|-------|----------|----------|
| 2.4-UNIT-012 | SDK runner parses --prompt argument | `--prompt "Hello Claude"` | `values.prompt === "Hello Claude"` | P0 |
| 2.4-UNIT-013 | SDK runner parses --request-id argument | `--request-id "uuid-123"` | `values['request-id'] === "uuid-123"` | P0 |
| 2.4-UNIT-014 | SDK runner parses --session-id argument | `--session-id "sess-456"` | `values['session-id'] === "sess-456"` | P0 |
| 2.4-UNIT-015 | SDK runner exits with error if prompt missing | No --prompt arg | Outputs JSON error, exits code 1 | P0 |
| 2.4-UNIT-016 | SDK runner outputs valid JSON lines | Mock SDK stream | Each line is valid JSON with `type` field | P0 |
| 2.4-UNIT-017 | SDK runner handles SDK error gracefully | SDK throws error | Outputs JSON error with code 9001 | P0 |

#### Unit Tests (TypeScript - Frontend IPC Wrapper)

| Test ID | Scenario | Input | Expected | Priority |
|---------|----------|-------|----------|----------|
| 2.4-UNIT-018 | sendChatMessage calls invoke with correct command | `prompt: "Hi"` | Calls `invoke('chat_send', { request: { prompt: "Hi" } })` | P0 |
| 2.4-UNIT-019 | sendChatMessage passes sessionId when provided | `prompt: "Hi", sessionId: "s1"` | Request includes `sessionId: "s1"` | P0 |
| 2.4-UNIT-020 | sendChatMessage returns ChatSendResponse | Mock invoke response | Returns `{ requestId: "uuid" }` | P0 |
| 2.4-UNIT-021 | sendChatMessage propagates invoke error | Mock invoke throws | Throws error to caller | P1 |

---

### AC2: Unique requestId Returned Immediately

**And** a unique `requestId` is returned immediately for stream correlation

#### Unit Tests (Rust)

| Test ID | Scenario | Input | Expected | Priority |
|---------|----------|-------|----------|----------|
| 2.4-UNIT-022 | chat_send returns valid UUID v4 as requestId | Valid request | `requestId` matches UUID v4 format | P0 |
| 2.4-UNIT-023 | requestId is unique across sequential calls | Two calls | Two different requestIds | P0 |

#### Integration Tests

| Test ID | Scenario | Setup | Action | Expected | Priority |
|---------|----------|-------|--------|----------|----------|
| 2.4-INT-001 | Frontend invoke receives requestId | Tauri app running | Call `invoke('chat_send', {...})` | Response contains `requestId` string | P0 |
| 2.4-INT-002 | requestId is unique across concurrent calls | Tauri app running | Fire 10 concurrent invokes | All 10 requestIds are unique | P0 |
| 2.4-INT-003 | Events contain matching requestId | Tauri app running | Send message, listen for events | All events have same `requestId` as response | P0 |
| 2.4-INT-004 | Multiple sessions use separate requestIds | Tauri app running | Send messages with different sessionIds | Each has unique requestId | P1 |

---

### AC3: Non-Blocking Command (Streaming via Events)

**And** the command is non-blocking (streaming happens via events)

#### Unit Tests (Rust)

| Test ID | Scenario | Input | Expected | Priority |
|---------|----------|-------|----------|----------|
| 2.4-UNIT-024 | chat_send spawns async task | Valid request | `tokio::spawn` called before return | P0 |
| 2.4-UNIT-025 | chat_send returns before SDK completes | Slow mock SDK | Returns immediately, SDK runs in background | P0 |

#### Integration Tests

| Test ID | Scenario | Setup | Action | Expected | Priority |
|---------|----------|-------|--------|----------|----------|
| 2.4-INT-005 | invoke returns before first event arrives | Mock slow SDK | Time invoke vs first event | Invoke resolves before event | P0 |
| 2.4-INT-006 | Events emitted on correct channels | Tauri app running | Send message | Events on `orion://message/chunk`, `orion://session/complete` | P0 |
| 2.4-INT-007 | Text events have correct structure | Tauri app running | Send message | Event has `requestId`, `sessionId`, `timestamp`, `payload` | P0 |
| 2.4-INT-008 | Complete event arrives after text events | Tauri app running | Send message | `orion://session/complete` is final event | P0 |
| 2.4-INT-009 | Error event emitted on SDK failure | Mock SDK error | Send message | `orion://session/error` emitted with code | P0 |
| 2.4-INT-010 | Multiple concurrent requests stream independently | Tauri app running | Send 3 messages rapidly | Each request's events have correct requestId | P1 |

#### E2E Tests

| Test ID | Scenario | Setup | Action | Expected | Priority |
|---------|----------|-------|--------|----------|----------|
| 2.4-E2E-001 | Send message returns requestId within 100ms | App launched | Click send, time response | Response in < 100ms | P0 |
| 2.4-E2E-002 | Events arrive with matching requestId | App launched | Send message, capture events | All event requestIds match | P0 |
| 2.4-E2E-003 | Complete event arrives after stream | App launched | Send message, wait for completion | `complete` event received with `durationMs` | P0 |
| 2.4-E2E-004 | Error displays on SDK failure | Mock API error | Send message | Error event contains message | P1 |

---

## Edge Cases and Error Handling

| Test ID | Scenario | Input | Expected | Priority |
|---------|----------|-------|----------|----------|
| 2.4-EDGE-001 | Empty prompt string | `{ prompt: "" }` | Error or graceful handling | P1 |
| 2.4-EDGE-002 | Very long prompt (10k chars) | Large prompt string | Accepts and processes | P2 |
| 2.4-EDGE-003 | Invalid sessionId format | `{ sessionId: "not-uuid" }` | Generates new sessionId or accepts | P2 |
| 2.4-EDGE-004 | Sidecar process crash | Node.js exits unexpectedly | Error event emitted, no hang | P0 |
| 2.4-EDGE-005 | Sidecar not found | Missing sdk-runner.mjs | Clear error, no crash | P0 |
| 2.4-EDGE-006 | Sidecar outputs invalid JSON | Malformed output line | Logs error, continues reading | P1 |
| 2.4-EDGE-007 | Concurrent rapid requests | 50 requests in 1 second | All get unique requestIds, no race | P1 |
| 2.4-EDGE-008 | Network timeout during SDK call | Simulated timeout | Error event with timeout code | P1 |
| 2.4-EDGE-009 | Event emission failure | Mock emit failure | Logged, doesn't crash command | P2 |

---

## Performance Tests

| Test ID | Scenario | Target | Tool | Priority |
|---------|----------|--------|------|----------|
| 2.4-PERF-001 | invoke response latency | p95 < 50ms | k6/Playwright | P1 |
| 2.4-PERF-002 | First event latency from invoke | p95 < 500ms (NFR-1.1) | k6 | P0 |
| 2.4-PERF-003 | Concurrent request handling | 10 concurrent, no timeout | Playwright | P1 |
| 2.4-PERF-004 | Memory stability under load | No leak over 100 requests | Profiler | P2 |

---

## Test Implementation Notes

### Mock Strategies

1. **SDK Runner Mocking (Unit Tests)**
   - Mock `agentSDK.query()` to return controlled async iterables
   - Test JSON line output without real API calls

2. **Sidecar Mocking (Integration Tests)**
   - Create test script that outputs predefined JSON lines
   - Simulate delays, errors, and edge cases

3. **Tauri Event Mocking (E2E Tests)**
   - Use Playwright's `page.evaluate()` to set up event listeners
   - Capture events with timestamps for ordering assertions

### Test Data Factories

```typescript
// tests/fixtures/factories/chat.ts
export const createChatSendRequest = (overrides = {}) => ({
  prompt: 'Test prompt',
  sessionId: 'test-session-123',
  ...overrides,
});

export const createStreamEvent = (type: string, overrides = {}) => ({
  requestId: 'req-123',
  sessionId: 'sess-123',
  timestamp: new Date().toISOString(),
  payload: { type, ...overrides },
});
```

### Event Assertion Helper

```typescript
// tests/fixtures/helpers/events.ts
export async function collectEvents(
  page: Page,
  requestId: string,
  timeout = 5000
): Promise<OrionStreamEvent[]> {
  return page.evaluate(
    ({ requestId, timeout }) => {
      return new Promise((resolve) => {
        const events: any[] = [];
        const channels = [
          'orion://message/chunk',
          'orion://tool/start',
          'orion://tool/complete',
          'orion://session/complete',
          'orion://session/error',
        ];

        channels.forEach((channel) => {
          window.__TAURI__.event.listen(channel, (event) => {
            if (event.payload.requestId === requestId) {
              events.push(event.payload);
              if (event.payload.payload.type === 'complete' ||
                  event.payload.payload.type === 'error') {
                resolve(events);
              }
            }
          });
        });

        setTimeout(() => resolve(events), timeout);
      });
    },
    { requestId, timeout }
  );
}
```

---

## Definition of Done Checklist

- [ ] All P0 unit tests passing
- [ ] All P0 integration tests passing
- [ ] All P0 E2E tests passing
- [ ] Coverage: >80% for Rust command module
- [ ] Coverage: >80% for TypeScript IPC wrapper
- [ ] No flaky tests in CI (3 consecutive green runs)
- [ ] Performance: invoke < 50ms p95
- [ ] Performance: first event < 500ms p95 (NFR-1.1)

---

## Test File Locations

| Test Type | Location |
|-----------|----------|
| Rust Unit Tests | `src-tauri/src/commands/chat_test.rs` |
| Rust Unit Tests | `src-tauri/src/commands/events_test.rs` |
| TS Unit Tests | `tests/unit/ipc/chat.test.ts` |
| TS Unit Tests | `tests/unit/sidecar/sdk-runner.test.ts` |
| Integration Tests | `tests/integration/ipc/chat-send.test.ts` |
| E2E Tests | `tests/e2e/journeys/chat-send.spec.ts` |
| Performance Tests | `tests/performance/chat-latency.k6.js` |

---

## References

- Story: `thoughts/implementation-artifacts/stories/story-2-4-create-tauri-ipc-command-for-chat.md`
- Architecture: `thoughts/planning-artifacts/architecture.md` (lines 903-1022)
- Test Design System: `thoughts/planning-artifacts/test-design-system.md`
- NFR-1.1: First token latency p95 < 500ms

---

*Generated by TEA (Master Test Architect) - Risk-based testing, depth scales with impact.*
