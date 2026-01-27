# Story 2.14: First Token Latency Tracking

Status: ready-for-dev

---

## Story Definition

| Field | Value |
|-------|-------|
| **Story ID** | 2-14-first-token-latency-tracking |
| **Epic** | Epic 2: First Conversation |
| **Status** | ready-for-dev |
| **Priority** | High (NFR performance validation) |
| **Created** | 2026-01-24 |

---

## User Story

As a **developer**,
I want to track time to first token,
So that I can verify NFR-1.1 (<500ms p95).

---

## Acceptance Criteria

1. **Given** a message is sent
   **When** the first `TextBlock` or `ToolUseBlock` arrives
   **Then** the elapsed time from send to first event is logged

2. **And** logs include `{ requestId, firstTokenMs, timestamp }`

3. **And** latency exceeding 500ms is flagged in logs

---

## Design References

### From Epic Definition (thoughts/planning-artifacts/epics.md)

**Story 2.14: First Token Latency Tracking:**

> As a **developer**,
> I want to track time to first token,
> So that I can verify NFR-1.1 (<500ms p95).
>
> **Acceptance Criteria:**
>
> **Given** a message is sent
> **When** the first `TextBlock` or `ToolUseBlock` arrives
> **Then** the elapsed time from send to first event is logged
> **And** logs include `{ requestId, firstTokenMs, timestamp }`
> **And** latency exceeding 500ms is flagged in logs

### From PRD NFR Requirements (thoughts/planning-artifacts/prd-v2.md)

**NFR-1.1 (Performance):** First token latency p95 < 500ms

From Section 7.7 Performance Targets:

| Metric | Target |
|--------|--------|
| **First Token** | < 500ms after send (p95) |

From Section 9.5 Harness Monitoring:

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| **API Latency (p95)** | < 500ms first token | > 1s |

**NFR-7.1 (Operational):** Track API latency at p95 percentile

### From Architecture (thoughts/planning-artifacts/architecture.md)

**Streaming IPC Event Schema (lines 904-940):**

```typescript
// src/lib/ipc/types.ts

// All events share this envelope
interface OrionEvent<T = unknown> {
  requestId: string;        // UUID for correlation
  sessionId: string;        // Active session
  timestamp: string;        // ISO 8601
  payload: T;
}

// Message chunk (text streaming)
interface MessageChunkPayload {
  type: 'text';
  content: string;          // Incremental text
  isComplete: boolean;      // Final chunk?
}

// Tool start
interface ToolStartPayload {
  type: 'tool_start';
  toolId: string;
  name: string;
  input: unknown;
}
```

**Event Names (lines 978-979):**

| Event | Direction | Payload |
|-------|-----------|---------|
| `orion://message/chunk` | Backend -> Frontend | `MessageChunkPayload` |
| `orion://tool/start` | Backend -> Frontend | `ToolStartPayload` |

### From Story Chain (.ralph/story-chain.md)

**Story 2.4 Established:**

- `chat_send` IPC command returns `requestId` immediately
- Events correlate via `requestId` field
- Event timestamps included in `OrionEvent` envelope

**Story 2.5 Established:**

- `useStreamListener(requestId, callbacks)` for raw event handling
- `onText` callback receives text chunk events
- `onToolStart` callback receives tool start events
- Event listening starts when requestId is set

**Story 2.6 Established:**

- `streamingMachine` with SEND event triggering sending state
- `useStreamingMachine()` hook composing send + listen
- Context contains `durationMs` from COMPLETE event

**Story 2.11 Established:**

- Token cost logging pattern: `console.log('[Orion] Session complete:', {...})`
- `StreamingContext` contains `costUsd`, `durationMs`, `totalTokens`
- Metadata logged in `onComplete` callback

---

## Technical Requirements

### Overview: First Token Latency Measurement

First token latency measures the time from when a user sends a message until the first meaningful response event arrives. This is a critical performance metric (NFR-1.1) that directly impacts perceived responsiveness.

**Measurement Points:**

1. **Start:** When `chat_send` IPC command is invoked (user clicks Send or presses Cmd+Enter)
2. **End:** When first `orion://message/chunk` OR `orion://tool/start` event arrives with matching `requestId`

**Note:** ThinkingBlock events are NOT counted as first token because they represent internal processing, not visible output. The first token is the first content the user can perceive (text or tool indication).

### Latency Tracker Module

```typescript
// src/lib/metrics/latency-tracker.ts

export interface LatencyMetric {
  requestId: string;
  firstTokenMs: number;
  timestamp: string;
  exceedsThreshold: boolean;
}

interface LatencyRecord {
  requestId: string;
  sendTimestamp: number;  // performance.now() at send time
  firstTokenReceived: boolean;
}

// In-memory storage for active request timings
const activeRequests = new Map<string, LatencyRecord>();

// Threshold from NFR-1.1
const FIRST_TOKEN_THRESHOLD_MS = 500;

/**
 * Mark the start of a request (when SEND is triggered)
 * Called from useStreamingMachine when send() is invoked
 */
export function markRequestStart(requestId: string): void {
  activeRequests.set(requestId, {
    requestId,
    sendTimestamp: performance.now(),
    firstTokenReceived: false,
  });
}

/**
 * Mark the first token arrival
 * Called from stream listener when first text/tool event arrives
 * Returns the latency metric if this was the first token, null otherwise
 */
export function markFirstToken(requestId: string): LatencyMetric | null {
  const record = activeRequests.get(requestId);

  if (!record || record.firstTokenReceived) {
    // Either unknown request or already received first token
    return null;
  }

  // Calculate latency
  const firstTokenMs = Math.round(performance.now() - record.sendTimestamp);
  const exceedsThreshold = firstTokenMs > FIRST_TOKEN_THRESHOLD_MS;

  // Mark as received
  record.firstTokenReceived = true;

  const metric: LatencyMetric = {
    requestId,
    firstTokenMs,
    timestamp: new Date().toISOString(),
    exceedsThreshold,
  };

  // AC #2, #3: Log with appropriate level
  if (exceedsThreshold) {
    console.warn('[Orion] First token latency exceeded threshold:', metric);
  } else {
    console.log('[Orion] First token latency:', metric);
  }

  return metric;
}

/**
 * Clean up tracking for completed requests
 * Called from onComplete or onError callbacks
 */
export function clearRequest(requestId: string): void {
  activeRequests.delete(requestId);
}

/**
 * Get the current first token threshold (for testing/display)
 */
export function getFirstTokenThreshold(): number {
  return FIRST_TOKEN_THRESHOLD_MS;
}
```

### Integration with useStreamingMachine

```typescript
// src/hooks/useStreamingMachine.ts (UPDATE)

import {
  markRequestStart,
  markFirstToken,
  clearRequest,
} from '@/lib/metrics/latency-tracker';

// ... existing imports and code ...

export function useStreamingMachine() {
  // ... existing code ...

  // When SEND event is triggered
  const handleSend = useCallback(async (prompt: string) => {
    const response = await invoke<{ requestId: string }>('chat_send', {
      request: { prompt, sessionId },
    });

    // AC #1: Mark request start for latency tracking
    markRequestStart(response.requestId);

    // Set the requestId to start listening
    setActiveRequestId(response.requestId);

    // Send to state machine
    send({ type: 'SEND', prompt, requestId: response.requestId });
  }, [sessionId, send]);

  // In the stream listener setup
  useStreamListener(activeRequestId, {
    onText: (payload) => {
      // AC #1: Track first token on text arrival
      markFirstToken(activeRequestId);

      // ... existing text handling ...
      send({ type: 'TEXT', content: payload.content });
    },

    onToolStart: (payload) => {
      // AC #1: Track first token on tool start (if text hasn't arrived first)
      markFirstToken(activeRequestId);

      // ... existing tool handling ...
      send({ type: 'TOOL_START', toolId: payload.toolId, name: payload.name });
    },

    onComplete: (payload) => {
      // Clean up latency tracking
      clearRequest(activeRequestId);

      // ... existing completion handling ...
    },

    onError: (payload) => {
      // Clean up latency tracking
      clearRequest(activeRequestId);

      // ... existing error handling ...
    },
  });

  // ... rest of hook ...
}
```

### Alternative: Dedicated First Token Hook

For better separation of concerns, the latency tracking can be encapsulated in a dedicated hook:

```typescript
// src/hooks/useFirstTokenLatency.ts

import { useCallback, useRef } from 'react';
import {
  markRequestStart,
  markFirstToken,
  clearRequest,
  LatencyMetric,
} from '@/lib/metrics/latency-tracker';

interface UseFirstTokenLatencyReturn {
  /** Call when request starts (SEND triggered) */
  startTracking: (requestId: string) => void;
  /** Call on first text or tool event */
  recordFirstToken: (requestId: string) => LatencyMetric | null;
  /** Call on complete or error */
  stopTracking: (requestId: string) => void;
  /** Get the last recorded latency */
  lastLatency: LatencyMetric | null;
}

/**
 * Hook for tracking first token latency per request
 * Encapsulates NFR-1.1 latency measurement
 */
export function useFirstTokenLatency(): UseFirstTokenLatencyReturn {
  const lastLatencyRef = useRef<LatencyMetric | null>(null);

  const startTracking = useCallback((requestId: string) => {
    markRequestStart(requestId);
  }, []);

  const recordFirstToken = useCallback((requestId: string) => {
    const metric = markFirstToken(requestId);
    if (metric) {
      lastLatencyRef.current = metric;
    }
    return metric;
  }, []);

  const stopTracking = useCallback((requestId: string) => {
    clearRequest(requestId);
  }, []);

  return {
    startTracking,
    recordFirstToken,
    stopTracking,
    lastLatency: lastLatencyRef.current,
  };
}
```

### Log Output Format (AC #2)

```javascript
// Normal latency (< 500ms)
console.log('[Orion] First token latency:', {
  requestId: '550e8400-e29b-41d4-a716-446655440000',
  firstTokenMs: 342,
  timestamp: '2026-01-24T14:30:45.123Z',
  exceedsThreshold: false,
});

// Exceeded threshold (>= 500ms) - AC #3
console.warn('[Orion] First token latency exceeded threshold:', {
  requestId: '550e8400-e29b-41d4-a716-446655440001',
  firstTokenMs: 687,
  timestamp: '2026-01-24T14:31:12.456Z',
  exceedsThreshold: true,
});
```

### Backend Timestamp Support (Enhancement)

For more accurate latency measurement, the backend can include the send timestamp in the IPC response:

```typescript
// src-tauri/src/commands/chat.rs (enhancement)

#[tauri::command]
pub async fn chat_send(request: ChatRequest) -> Result<ChatSendResponse, String> {
    let request_id = Uuid::new_v4().to_string();
    let send_timestamp = chrono::Utc::now().timestamp_millis();

    // ... spawn query ...

    Ok(ChatSendResponse {
        request_id,
        send_timestamp,
    })
}
```

```typescript
// Frontend can then use backend timestamp for cross-process accuracy
interface ChatSendResponse {
  requestId: string;
  sendTimestamp: number;  // Server-side timestamp in ms
}
```

**Note:** For MVP, frontend-only `performance.now()` measurement is sufficient since both timing points are in the same process (frontend React code).

### Test Helpers

```typescript
// src/lib/testing/latency-helpers.ts

import { LatencyMetric } from '@/lib/metrics/latency-tracker';

/**
 * Create a mock latency metric for testing
 */
export function createMockLatencyMetric(
  overrides: Partial<LatencyMetric> = {}
): LatencyMetric {
  return {
    requestId: 'test-request-id',
    firstTokenMs: 250,
    timestamp: new Date().toISOString(),
    exceedsThreshold: false,
    ...overrides,
  };
}

/**
 * Create a slow latency metric that exceeds threshold
 */
export function createSlowLatencyMetric(
  overrides: Partial<LatencyMetric> = {}
): LatencyMetric {
  return createMockLatencyMetric({
    firstTokenMs: 750,
    exceedsThreshold: true,
    ...overrides,
  });
}

/**
 * Assert latency metric structure
 */
export function assertLatencyMetric(metric: LatencyMetric): void {
  expect(metric.requestId).toBeDefined();
  expect(typeof metric.firstTokenMs).toBe('number');
  expect(metric.firstTokenMs).toBeGreaterThanOrEqual(0);
  expect(metric.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601
  expect(typeof metric.exceedsThreshold).toBe('boolean');
}

/**
 * Mock console for testing log output
 */
export function mockConsoleForLatencyTests() {
  const logs: Array<{ level: string; args: unknown[] }> = [];

  const originalLog = console.log;
  const originalWarn = console.warn;

  console.log = (...args) => logs.push({ level: 'log', args });
  console.warn = (...args) => logs.push({ level: 'warn', args });

  return {
    logs,
    restore: () => {
      console.log = originalLog;
      console.warn = originalWarn;
    },
    getLatencyLogs: () => logs.filter(l =>
      l.args[0] === '[Orion] First token latency:' ||
      l.args[0] === '[Orion] First token latency exceeded threshold:'
    ),
  };
}
```

---

## Implementation Tasks

- [ ] Task 1: Create latency tracker module (AC: #1, #2, #3)
  - [ ] 1.1: Create `src/lib/metrics/latency-tracker.ts`
  - [ ] 1.2: Implement `markRequestStart()` function
  - [ ] 1.3: Implement `markFirstToken()` function with threshold check
  - [ ] 1.4: Implement `clearRequest()` cleanup function
  - [ ] 1.5: Define `LatencyMetric` interface
  - [ ] 1.6: Export `FIRST_TOKEN_THRESHOLD_MS` constant (500ms)

- [ ] Task 2: Integrate with useStreamingMachine (AC: #1)
  - [ ] 2.1: Import latency tracker functions
  - [ ] 2.2: Call `markRequestStart()` when SEND is triggered
  - [ ] 2.3: Call `markFirstToken()` in onText callback
  - [ ] 2.4: Call `markFirstToken()` in onToolStart callback
  - [ ] 2.5: Call `clearRequest()` in onComplete callback
  - [ ] 2.6: Call `clearRequest()` in onError callback

- [ ] Task 3: Implement logging (AC: #2, #3)
  - [ ] 3.1: Log includes requestId field
  - [ ] 3.2: Log includes firstTokenMs field
  - [ ] 3.3: Log includes timestamp field (ISO 8601)
  - [ ] 3.4: Normal latency uses console.log
  - [ ] 3.5: Exceeded latency (>500ms) uses console.warn

- [ ] Task 4: Create test helpers
  - [ ] 4.1: Create `src/lib/testing/latency-helpers.ts`
  - [ ] 4.2: Implement `createMockLatencyMetric()`
  - [ ] 4.3: Implement `createSlowLatencyMetric()`
  - [ ] 4.4: Implement `assertLatencyMetric()`
  - [ ] 4.5: Implement `mockConsoleForLatencyTests()`

- [ ] Task 5: Optional dedicated hook
  - [ ] 5.1: Create `src/hooks/useFirstTokenLatency.ts`
  - [ ] 5.2: Implement hook with startTracking, recordFirstToken, stopTracking
  - [ ] 5.3: Export lastLatency ref for debugging

- [ ] Task 6: Unit tests
  - [ ] 6.1: Test markRequestStart() creates record
  - [ ] 6.2: Test markFirstToken() calculates latency correctly
  - [ ] 6.3: Test markFirstToken() returns null on duplicate call
  - [ ] 6.4: Test clearRequest() removes record
  - [ ] 6.5: Test threshold detection (< 500ms vs >= 500ms)
  - [ ] 6.6: Test log format matches AC #2

- [ ] Task 7: Integration tests
  - [ ] 7.1: Test full flow: send -> text event -> latency logged
  - [ ] 7.2: Test full flow: send -> tool event -> latency logged
  - [ ] 7.3: Test text event before tool event only logs once
  - [ ] 7.4: Test tool event before text event only logs once
  - [ ] 7.5: Test slow response logs with warn level

- [ ] Task 8: Manual testing
  - [ ] 8.1: Send message and verify latency appears in console
  - [ ] 8.2: Verify log format matches `{ requestId, firstTokenMs, timestamp }`
  - [ ] 8.3: Simulate slow network and verify warn log
  - [ ] 8.4: Verify multiple sequential messages track separately
  - [ ] 8.5: Verify concurrent requests track correctly

---

## Dependencies

### Requires (from prior stories)

| Story | What It Provides | Why Needed |
|-------|------------------|------------|
| Story 2.4 | `chat_send` IPC command returning `requestId` | Start point for latency measurement |
| Story 2.5 | `useStreamListener()` with onText, onToolStart callbacks | End point detection for latency measurement |
| Story 2.5 | Event timestamps in `OrionEvent` envelope | Correlation via requestId |
| Story 2.6 | `useStreamingMachine()` composing send + listen | Integration point for tracking |
| Story 2.6 | SEND event triggering request flow | Timing start trigger |
| Story 2.11 | Logging pattern `[Orion] ...` | Consistent log formatting |

### Provides For (future stories)

| Story | What This Story Provides |
|-------|--------------------------|
| Story 2.15 | Latency tracking pattern extends to error timing |
| Story 2.16 | Latency context for abort handling |
| Story 22.1+ | Foundation for metrics dashboard |
| Epic 26 | Performance regression test baseline |
| Future | P95 aggregation and alerting infrastructure |

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| **No UI impact** | This is a developer metric, no user-facing UI |
| **Performance monitoring** | Tracking enables performance improvements |

---

## File Locations

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/metrics/latency-tracker.ts` | Core latency tracking module |
| `src/lib/metrics/index.ts` | Barrel export for metrics modules |
| `src/hooks/useFirstTokenLatency.ts` | Optional dedicated hook |
| `src/lib/testing/latency-helpers.ts` | Test utilities for latency testing |

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useStreamingMachine.ts` | Integrate latency tracking calls |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `src/machines/streamingMachine.ts` | Latency tracking is external to state machine |
| `src/lib/ipc/types.ts` | Event types already have timestamp and requestId |
| UI components | No visual changes for this story |

---

## Definition of Done

- [ ] `markRequestStart()` records timestamp when called (AC #1)
- [ ] `markFirstToken()` calculates elapsed time on first text/tool event (AC #1)
- [ ] `markFirstToken()` returns null on subsequent calls for same requestId (AC #1)
- [ ] Log output includes `requestId` field (AC #2)
- [ ] Log output includes `firstTokenMs` field (AC #2)
- [ ] Log output includes `timestamp` field in ISO 8601 format (AC #2)
- [ ] Latency < 500ms logs at `console.log` level (AC #3)
- [ ] Latency >= 500ms logs at `console.warn` level with "exceeded threshold" (AC #3)
- [ ] `clearRequest()` cleans up tracking on complete/error (memory management)
- [ ] `npm run build` completes successfully
- [ ] `npm run typecheck` passes
- [ ] Unit tests pass for latency tracker module
- [ ] Integration tests pass for full flow
- [ ] Manual testing confirms latency appears in browser console
- [ ] Multiple concurrent requests track independently

---

## Test Strategy

> **Note:** The test cases below are the authoritative test reference for this story. The ATDD checklist will be generated from this specification during the TEA ATDD step.

### Unit Tests (Core)

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.14-UNIT-001 | markRequestStart creates record with timestamp | #1 |
| 2.14-UNIT-002 | markFirstToken calculates elapsed time correctly | #1 |
| 2.14-UNIT-003 | markFirstToken returns LatencyMetric on first call | #1, #2 |
| 2.14-UNIT-004 | markFirstToken returns null on second call (same requestId) | #1 |
| 2.14-UNIT-005 | markFirstToken returns null for unknown requestId | #1 |
| 2.14-UNIT-006 | LatencyMetric includes requestId field | #2 |
| 2.14-UNIT-007 | LatencyMetric includes firstTokenMs field | #2 |
| 2.14-UNIT-008 | LatencyMetric includes timestamp in ISO 8601 format | #2 |
| 2.14-UNIT-009 | LatencyMetric includes exceedsThreshold boolean | #3 |
| 2.14-UNIT-010 | exceedsThreshold is false when firstTokenMs < 500 | #3 |
| 2.14-UNIT-011 | exceedsThreshold is true when firstTokenMs >= 500 | #3 |
| 2.14-UNIT-012 | console.log called for normal latency | #3 |
| 2.14-UNIT-013 | console.warn called for exceeded latency | #3 |
| 2.14-UNIT-014 | clearRequest removes tracking record | #1 |
| 2.14-UNIT-015 | Multiple concurrent requests tracked independently | #1 |

### Integration Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.14-INT-001 | Send -> text event triggers latency measurement | #1 |
| 2.14-INT-002 | Send -> tool event triggers latency measurement | #1 |
| 2.14-INT-003 | Text before tool only logs once | #1 |
| 2.14-INT-004 | Tool before text only logs once | #1 |
| 2.14-INT-005 | Complete event clears tracking | #1 |
| 2.14-INT-006 | Error event clears tracking | #1 |
| 2.14-INT-007 | Log format matches `{ requestId, firstTokenMs, timestamp }` | #2 |
| 2.14-INT-008 | Slow response (>500ms) logs as warning | #3 |

### E2E Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.14-E2E-001 | Sending message produces latency log in console | #1, #2 |
| 2.14-E2E-002 | Latency log contains expected fields | #2 |
| 2.14-E2E-003 | Sequential messages produce separate latency logs | #1 |
| 2.14-E2E-004 | Console shows warning level for slow responses | #3 |

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| Latency tracker module | 1 hour |
| Integration with useStreamingMachine | 45 minutes |
| Optional dedicated hook | 30 minutes |
| Test helpers | 30 minutes |
| Unit tests | 1.5 hours |
| Integration tests | 1 hour |
| Manual testing | 30 minutes |
| Documentation | 15 minutes |
| **Total** | 6 hours |

---

## Notes

### Why First Token, Not ThinkingBlock

ThinkingBlock events represent Claude's internal reasoning process. While they arrive before visible output, they are not "first token" in the user-perceived sense. The first token is the first content that changes the UI:

1. **TextBlock** - Claude starts typing a response
2. **ToolUseBlock** - Claude indicates it's using a tool

Either of these events marks the end of the perceived "waiting" period.

### Relationship to Story 2.11

Story 2.11 tracks overall request duration (`durationMs`) from COMPLETE event. Story 2.14 tracks the initial responsiveness (`firstTokenMs`). Both metrics are valuable:

- **firstTokenMs** (this story): Measures perceived responsiveness
- **durationMs** (Story 2.11): Measures total processing time

### Performance.now() Accuracy

Using `performance.now()` provides sub-millisecond precision and is monotonic (not affected by system clock changes). This is sufficient for measuring first token latency in the frontend.

### Future: P95 Aggregation

This story implements per-request logging. Future stories (Epic 22/26) will aggregate these logs to calculate p95 percentiles for NFR-1.1 validation:

```typescript
// Future: src/lib/metrics/latency-aggregator.ts
export function calculateP95Latency(metrics: LatencyMetric[]): number {
  const sorted = metrics.map(m => m.firstTokenMs).sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * 0.95) - 1;
  return sorted[index];
}
```

### Memory Management

The `clearRequest()` function must be called on both success and error paths to prevent memory leaks from abandoned requests. The integration ensures cleanup happens in both onComplete and onError callbacks.

### Threshold Configuration

The 500ms threshold is hardcoded per NFR-1.1. Future enhancement could make this configurable via environment variable:

```typescript
const FIRST_TOKEN_THRESHOLD_MS =
  parseInt(process.env.NEXT_PUBLIC_FIRST_TOKEN_THRESHOLD_MS || '500', 10);
```

---

## References

- [Source: thoughts/planning-artifacts/epics.md#Story 2.14: First Token Latency Tracking]
- [Source: thoughts/planning-artifacts/prd-v2.md#Section 7.7 Performance Targets]
- [Source: thoughts/planning-artifacts/prd-v2.md#Section 9.5 Harness Monitoring]
- [Source: thoughts/planning-artifacts/prd-v2.md#NFR-1.1, NFR-7.1]
- [Source: thoughts/planning-artifacts/architecture.md#Streaming IPC Event Schema (lines 904-940)]
- [Source: .ralph/story-chain.md#Story 2.4 Established]
- [Source: .ralph/story-chain.md#Story 2.5 Established]
- [Source: .ralph/story-chain.md#Story 2.6 Established]
- [Source: .ralph/story-chain.md#Story 2.11 Established]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - expected: latency-tracker.ts, useFirstTokenLatency.ts, latency-helpers.ts, updated useStreamingMachine.ts)
