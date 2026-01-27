# ATDD Checklist: Story 2.5 - Implement IPC Event Streaming

Status: ready-for-dev

---

## Story Reference

| Field | Value |
|-------|-------|
| **Story ID** | 2-5-implement-ipc-event-streaming |
| **Epic** | Epic 2: First Conversation |
| **Created** | 2026-01-24 |
| **Test Architect** | TEA Agent |

---

## Acceptance Criteria Summary

| AC# | Description | Priority |
|-----|-------------|----------|
| AC1 | When SDK yields a message (TextBlock, ToolUseBlock, etc.), emit Tauri event with `{ requestId, type, payload }` | P0 |
| AC2 | When query completes, emit completion event with `{ requestId, cost, duration }` | P0 |
| AC3 | Events include `requestId` for multiplexed stream handling | P0 |

---

## Test Scenarios

### AC1: Message Event Emission

#### Unit Tests

| Test ID | Description | Priority | Notes |
|---------|-------------|----------|-------|
| 2.5-UNIT-001 | `useStreamListener` registers listener for `orion://message/chunk` event | P0 | Verify Tauri `listen()` called with correct event name |
| 2.5-UNIT-002 | `useStreamListener` registers listener for `orion://tool/start` event | P0 | Verify tool start listener setup |
| 2.5-UNIT-003 | `useStreamListener` registers listener for `orion://tool/complete` event | P0 | Verify tool complete listener setup |
| 2.5-UNIT-004 | `useStreamListener` registers listener for `orion://session/error` event | P0 | Verify error listener setup |
| 2.5-UNIT-005 | `useStreamListener` calls `onMessage` callback for text events | P0 | Mock event with `type: 'text'`, verify callback invoked |
| 2.5-UNIT-006 | `useStreamListener` calls `onMessage` callback for thinking events | P1 | Mock event with `type: 'thinking'`, verify callback invoked. Note: This extends architecture.md `MessageChunkPayload` which only defines `type: 'text'` - thinking support is an intentional extension per Story 2.5 |
| 2.5-UNIT-007 | `useStreamListener` calls `onToolStart` callback with correct payload | P0 | Verify toolId, toolName, input extracted |
| 2.5-UNIT-008 | `useStreamListener` calls `onToolComplete` callback with correct payload | P0 | Verify toolId, result, isError, durationMs extracted |
| 2.5-UNIT-009 | `useStreamListener` calls `onError` callback with error payload | P0 | Verify code, message, recoverable fields |
| 2.5-UNIT-010 | `useBufferedStreamListener` accumulates text content incrementally | P0 | Send multiple text chunks, verify concatenation |
| 2.5-UNIT-011 | `useBufferedStreamListener` accumulates thinking content separately | P1 | Thinking and text accumulate in separate fields |
| 2.5-UNIT-012 | `useBufferedStreamListener` tracks tool status on `tool_start` | P0 | Verify tool added to Map with 'running' status |
| 2.5-UNIT-013 | `useBufferedStreamListener` updates tool status on `tool_complete` | P0 | Verify status changes to 'complete' with durationMs |
| 2.5-UNIT-014 | `useBufferedStreamListener` sets tool status to 'error' when `isError=true` | P1 | Verify error state tracked |
| 2.5-UNIT-015 | `useBufferedStreamListener` handles rapid events via RAF batching | P1 | Send 10+ events rapidly, verify single state update |
| 2.5-UNIT-016 | `useChat` returns correct initial state | P1 | requestId=null, isLoading=false, empty stream |

#### Edge Cases (Unit)

| Test ID | Description | Priority | Notes |
|---------|-------------|----------|-------|
| 2.5-UNIT-017 | `useStreamListener` handles null requestId gracefully | P1 | No listeners registered when requestId is null |
| 2.5-UNIT-018 | `useBufferedStreamListener` handles empty content payload | P2 | Empty string content does not break accumulation |
| 2.5-UNIT-019 | `useBufferedStreamListener` handles unknown message type | P2 | Unrecognized type ignored without error |
| 2.5-UNIT-020 | Callback refs update without re-registering listeners | P1 | Changing callback does not recreate listeners |

---

### AC2: Completion Event

#### Unit Tests

| Test ID | Description | Priority | Notes |
|---------|-------------|----------|-------|
| 2.5-UNIT-021 | `useStreamListener` registers listener for `orion://session/complete` | P0 | Verify session complete listener setup |
| 2.5-UNIT-022 | `useStreamListener` calls `onComplete` callback with completion payload | P0 | Verify totalTokens, costUsd, durationMs extracted |
| 2.5-UNIT-023 | `useBufferedStreamListener` sets `isComplete=true` on session complete | P0 | Verify boolean flag changes |
| 2.5-UNIT-024 | `useBufferedStreamListener` captures `costUsd` from completion | P0 | Verify cost stored correctly |
| 2.5-UNIT-025 | `useBufferedStreamListener` captures `durationMs` from completion | P0 | Verify duration stored correctly |
| 2.5-UNIT-026 | `useChat` sets `isLoading=false` when stream completes | P0 | Verify loading state transitions |

#### Edge Cases (Unit)

| Test ID | Description | Priority | Notes |
|---------|-------------|----------|-------|
| 2.5-UNIT-027 | Completion event with `costUsd=0` is valid | P2 | Zero cost should not be treated as missing |
| 2.5-UNIT-028 | Completion event with missing optional fields | P2 | Graceful handling of partial payload |
| 2.5-UNIT-029 | `useBufferedStreamListener` sets `isComplete=true` on error event | P1 | Error also terminates the stream |

---

### AC3: RequestId Filtering (Multiplexing)

#### Unit Tests

| Test ID | Description | Priority | Notes |
|---------|-------------|----------|-------|
| 2.5-UNIT-030 | `useStreamListener` filters events by matching requestId | P0 | Events with different requestId ignored |
| 2.5-UNIT-031 | `useStreamListener` ignores events with null requestId in payload | P1 | Malformed events ignored |
| 2.5-UNIT-032 | `useStreamListener` ignores events with undefined payload | P1 | Malformed events handled gracefully |
| 2.5-UNIT-033 | `useBufferedStreamListener` resets state when requestId changes | P0 | New request clears accumulated text/tools |
| 2.5-UNIT-034 | `useChat` passes requestId from IPC response to listener | P0 | Verify requestId flows through |

#### Edge Cases (Unit)

| Test ID | Description | Priority | Notes |
|---------|-------------|----------|-------|
| 2.5-UNIT-035 | Events with similar but different requestId correctly filtered | P1 | "req-1" vs "req-10" not confused |
| 2.5-UNIT-036 | RequestId with special characters filtered correctly | P2 | UUID format with hyphens works |

---

### Cleanup and Memory Safety

#### Unit Tests

| Test ID | Description | Priority | Notes |
|---------|-------------|----------|-------|
| 2.5-UNIT-037 | `useStreamListener` cleans up listeners on unmount | P0 | All UnlistenFn called on cleanup |
| 2.5-UNIT-038 | `useStreamListener` cleans up listeners on requestId change | P0 | Old listeners removed before new setup |
| 2.5-UNIT-039 | Multiple mounts/unmounts do not leak listeners | P1 | Rapid mount/unmount cycles safe |
| 2.5-UNIT-040 | Buffer ref cleared on requestId change | P1 | No stale buffered events |

---

### Integration Tests

| Test ID | Description | Priority | Notes |
|---------|-------------|----------|-------|
| 2.5-INT-001 | Events emitted from backend reach frontend listener | P0 | End-to-end event delivery via Tauri |
| 2.5-INT-002 | Multiple concurrent streams isolated by requestId | P0 | Two requests do not interfere |
| 2.5-INT-003 | Session complete event with cost/duration reaches frontend | P0 | Verify full payload received |
| 2.5-INT-004 | Session error event reaches frontend with recoverable flag | P0 | Error payload complete |
| 2.5-INT-005 | Tool lifecycle (start -> complete) tracked correctly | P1 | Tool status transitions work |
| 2.5-INT-006 | Text + tool interleaved events accumulated correctly | P1 | Mixed event types work |

#### Edge Cases (Integration)

| Test ID | Description | Priority | Notes |
|---------|-------------|----------|-------|
| 2.5-INT-007 | Rapid event emission does not drop events | P1 | 50+ events/sec handled |
| 2.5-INT-008 | Component unmount during stream cleans up properly | P1 | No errors after unmount |
| 2.5-INT-009 | Backend emits event with malformed JSON | P2 | Frontend handles gracefully |

---

### E2E Tests

| Test ID | Description | Priority | Notes |
|---------|-------------|----------|-------|
| 2.5-E2E-001 | Send message, receive text chunks, stream state updates | P0 | Full flow: send -> events -> accumulated text |
| 2.5-E2E-002 | Send message with tool invocation, tool status tracked in UI | P1 | Tool appears running, then complete |
| 2.5-E2E-003 | Send message, completion event provides cost and duration | P0 | UI displays usage info |
| 2.5-E2E-004 | Two concurrent messages have separate stream states | P0 | Tab isolation or multi-message handling |
| 2.5-E2E-005 | Error during stream displays user-friendly error | P1 | Error message shown, stream terminated |

---

## Test Implementation Notes

### Mocking Strategy

For unit tests, mock the Tauri event API:

```typescript
// tests/mocks/tauri-events.ts
import { vi } from 'vitest';

type EventCallback<T> = (event: { payload: T }) => void;
const listeners = new Map<string, EventCallback<unknown>[]>();

export const mockListen = vi.fn(async <T>(eventName: string, callback: EventCallback<T>) => {
  if (!listeners.has(eventName)) {
    listeners.set(eventName, []);
  }
  listeners.get(eventName)!.push(callback as EventCallback<unknown>);

  // Return unlisten function
  return () => {
    const cbs = listeners.get(eventName) || [];
    const index = cbs.indexOf(callback as EventCallback<unknown>);
    if (index > -1) cbs.splice(index, 1);
  };
});

export const emitMockEvent = <T>(eventName: string, payload: T) => {
  const cbs = listeners.get(eventName) || [];
  cbs.forEach(cb => cb({ payload }));
};

export const clearMockListeners = () => {
  listeners.clear();
};

// Mock @tauri-apps/api/event
vi.mock('@tauri-apps/api/event', () => ({
  listen: mockListen,
}));
```

### React Hook Testing Pattern

Use `@testing-library/react` with `renderHook`:

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStreamListener } from '@/hooks/useStreamListener';
import { emitMockEvent } from '../mocks/tauri-events';

test('2.5-UNIT-005: calls onMessage callback for text events', async () => {
  const onMessage = vi.fn();
  const requestId = 'test-request-123';

  renderHook(() => useStreamListener(requestId, { onMessage }));

  // Allow async listener setup
  await waitFor(() => expect(mockListen).toHaveBeenCalled());

  // Emit mock event
  // NOTE: OrionEvent<T> wraps the inner payload in a `payload` field.
  // The outer `payload` is the OrionEvent structure (requestId, sessionId, timestamp, payload).
  // The inner `payload` is the actual MessageChunkPayload.
  // This creates the pattern: event.payload.requestId and event.payload.payload (the inner payload).
  act(() => {
    emitMockEvent('orion://message/chunk', {
      requestId: 'test-request-123',
      sessionId: 'session-1',
      timestamp: '2026-01-24T12:00:00Z',
      payload: { type: 'text', content: 'Hello', isComplete: false },
    });
  });

  // Callback receives the inner payload (MessageChunkPayload), not the full OrionEvent
  expect(onMessage).toHaveBeenCalledWith({
    type: 'text',
    content: 'Hello',
    isComplete: false,
  });
});
```

### Integration Test Setup

For integration tests with Tauri:

```typescript
// tests/integration/streaming.spec.ts
import { test, expect } from '@playwright/test';

test('2.5-INT-001: events from backend reach frontend', async ({ page }) => {
  await page.goto('/chat');

  // Spy on console to capture event receipt
  const events: unknown[] = [];
  page.on('console', msg => {
    if (msg.text().includes('orion://')) {
      events.push(msg.text());
    }
  });

  // Trigger chat send (which triggers backend events)
  await page.getByTestId('chat-input').fill('Hello');
  await page.getByTestId('send-button').click();

  // Wait for events to be received
  await expect(async () => {
    expect(events.some(e => String(e).includes('message/chunk'))).toBe(true);
  }).toPass({ timeout: 5000 });
});
```

---

## Priority Summary

| Priority | Count | Description |
|----------|-------|-------------|
| P0 | 29 | Core functionality - must pass for story completion |
| P1 | 19 | Important edge cases and secondary paths |
| P2 | 6 | Nice-to-have defensive tests |

**Total Tests: 54** (40 unit + 9 integration + 5 E2E)

---

## Coverage Requirements

| Level | Target | Rationale |
|-------|--------|-----------|
| Unit | >90% | Core hooks are pure logic - highly testable |
| Integration | >80% | Event delivery is critical path |
| E2E | 5 critical paths | Validates full streaming flow |

---

## Dependencies

### Test Infrastructure Required

- Vitest for unit tests
- React Testing Library for hook testing
- Tauri event mocking utilities
- Playwright for E2E tests

### Files to Test

> **Note:** architecture.md references `src/hooks/useStreaming.ts` as the example file. This story creates `src/hooks/useStreamListener.ts` which follows the same pattern but with a more descriptive name. Both names are valid - use `useStreamListener.ts` per the story specification.

| File | Test Coverage Target |
|------|---------------------|
| `src/hooks/useStreamListener.ts` | >95% (pure hook logic) |
| `src/hooks/useBufferedStreamListener.ts` | >90% (buffering logic) |
| `src/hooks/useChat.ts` | >85% (composition layer) |
| `src/lib/ipc/types.ts` | N/A (type definitions only) |

---

## Definition of Done (Testing)

- [ ] All P0 tests pass
- [ ] All P1 tests pass (or documented exceptions)
- [ ] Unit test coverage >90% for hook files
- [ ] Integration tests verify event delivery
- [ ] E2E tests confirm full streaming flow
- [ ] No memory leaks in listener cleanup (verified)
- [ ] TypeScript types compile without errors
- [ ] Tests run in CI pipeline (<30s for unit suite)

---

## References

- [Story 2.5 Details](./story-2-5-implement-ipc-event-streaming.md)
- [Architecture: Streaming IPC Event Schema](../../planning-artifacts/architecture.md#streaming-ipc-event-schema)
- [TEA Knowledge: Component TDD](./_bmad/bmm/testarch/knowledge/component-tdd.md) (project-root relative: `_bmad/bmm/testarch/knowledge/component-tdd.md`)
- [TEA Knowledge: Test Levels Framework](./_bmad/bmm/testarch/knowledge/test-levels-framework.md) (project-root relative: `_bmad/bmm/testarch/knowledge/test-levels-framework.md`)

---

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-24 | TEA Agent | Initial ATDD checklist created |
