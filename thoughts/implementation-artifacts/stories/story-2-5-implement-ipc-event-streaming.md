# Story 2.5: Implement IPC Event Streaming

Status: drafted

---

## Story Definition

| Field | Value |
|-------|-------|
| **Story ID** | 2-5-implement-ipc-event-streaming |
| **Epic** | Epic 2: First Conversation |
| **Status** | drafted |
| **Priority** | Critical (completes streaming pipeline) |
| **Created** | 2026-01-24 |

---

## User Story

As a **developer**,
I want SDK messages streamed via Tauri events,
So that the frontend receives real-time updates.

---

## Acceptance Criteria

1. **Given** a chat query is in progress
   **When** the SDK yields a message (TextBlock, ToolUseBlock, etc.)
   **Then** Tauri events are emitted per architecture.md event naming:
   - `orion://message/chunk` for text/thinking content with `MessageChunkPayload`
   - `orion://tool/start` for tool invocations with `ToolStartPayload`
   - `orion://tool/complete` for tool results with `ToolCompletePayload`
   - `orion://session/error` for errors with `SessionErrorPayload`

2. **When** the query completes
   **Then** a final event `orion://session/complete` is emitted with `SessionCompletePayload` containing `{ totalTokens, costUsd, durationMs }`

3. **And** all events include the `requestId` for multiplexed stream handling

---

## Design References

### From Architecture (thoughts/planning-artifacts/architecture.md lines 903-1022)

**Streaming IPC Event Schema:**

```typescript
// Base event structure (architecture.md lines 914-918)
interface OrionEvent<T> {
  requestId: string;        // Correlate with query
  sessionId: string;        // Active session
  timestamp: string;        // ISO 8601
  payload: T;
}

// Message chunk payload (lines 922-926)
interface MessageChunkPayload {
  type: 'text';
  content: string;          // Incremental text
  isComplete: boolean;      // Final chunk?
}

// Tool lifecycle (lines 929-942)
interface ToolStartPayload {
  type: 'tool_start';
  toolId: string;
  toolName: string;
  input: Record<string, unknown>;
}

interface ToolCompletePayload {
  type: 'tool_complete';
  toolId: string;
  result: unknown;
  isError: boolean;
  durationMs: number;
}

// Session lifecycle (lines 954-966)
interface SessionCompletePayload {
  type: 'session_complete';
  totalTokens: number;
  costUsd: number;
  durationMs: number;
}

interface SessionErrorPayload {
  type: 'session_error';
  code: string;
  message: string;
  recoverable: boolean;
}
```

**Tauri Event Names (architecture.md lines 971-979):**

| Event | Direction | Payload | AC |
|-------|-----------|---------|-----|
| `orion://message/chunk` | Backend -> Frontend | `MessageChunkPayload` | #1 |
| `orion://tool/start` | Backend -> Frontend | `ToolStartPayload` | #1 |
| `orion://tool/complete` | Backend -> Frontend | `ToolCompletePayload` | #1 |
| `orion://session/complete` | Backend -> Frontend | `SessionCompletePayload` | #2 |
| `orion://session/error` | Backend -> Frontend | `SessionErrorPayload` | #1 |

**Frontend Listener Hook Pattern (architecture.md lines 984-1021):**

```typescript
// src/hooks/useStreaming.ts
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { useEffect, useRef } from 'react';

export function useStreamListener(
  requestId: string,
  onMessage: (payload: MessageChunkPayload) => void,
  onToolStart: (payload: ToolStartPayload) => void,
  onToolComplete: (payload: ToolCompletePayload) => void,
  onComplete: (payload: SessionCompletePayload) => void,
  onError: (payload: SessionErrorPayload) => void
) {
  const unlisteners = useRef<UnlistenFn[]>([]);

  useEffect(() => {
    const setup = async () => {
      unlisteners.current = [
        await listen<OrionEvent<MessageChunkPayload>>('orion://message/chunk', (e) => {
          if (e.payload.requestId === requestId) onMessage(e.payload.payload);
        }),
        await listen<OrionEvent<ToolStartPayload>>('orion://tool/start', (e) => {
          if (e.payload.requestId === requestId) onToolStart(e.payload.payload);
        }),
        // ... more listeners
      ];
    };
    setup();
    return () => unlisteners.current.forEach(fn => fn());
  }, [requestId]);
}
```

### From Streaming Architecture (thoughts/research/streaming-architecture.md)

**Message Types from SDK:**

| Type | Class | Description | Event Mapping |
|------|-------|-------------|---------------|
| Text content | `TextBlock` | Claude's text response | `orion://message/chunk` with `type: 'text'` |
| Thinking | `ThinkingBlock` | Internal reasoning | `orion://message/chunk` with `type: 'thinking'` |
| Tool invocation | `ToolUseBlock` | Tool being called | `orion://tool/start` |
| Tool result | `ToolResultBlock` | Tool output | `orion://tool/complete` |
| Final result | `ResultMessage` | Completion info | `orion://session/complete` |

**Buffered Streaming Pattern (streaming-architecture.md):**

> The key insight is to **decouple network streaming from visual streaming**. Text arrives in chunks, but displays character-by-character.

This story establishes the event delivery; Story 2.7+ handles the visual rendering.

### From Story Chain (.ralph/story-chain.md)

**Story 2.4 Established:**

- Tauri command `chat_send` returns `requestId` immediately
- Sidecar pattern: Node.js process for SDK execution
- JSON-line protocol for sidecar -> Rust communication
- Event namespace pattern: `orion://` prefix
- `OrionStreamEvent` struct with `requestId`, `sessionId`, `timestamp`, `payload`

**Notes for Story 2.5 from Story 2.4:**

> - Use `listen()` from `@tauri-apps/api/event` to receive events
> - Filter events by `requestId` from Story 2.4
> - Create `useStreamListener()` hook following architecture.md pattern
> - Handle cleanup with `UnlistenFn` on component unmount
> - Consider event buffering for rapid message delivery

---

## Technical Requirements

### Frontend Event Listener Hook

This story creates the frontend infrastructure to receive and process Tauri events emitted by the backend (established in Story 2.4).

```
Backend (Story 2.4)                    Frontend (Story 2.5)
       |                                      |
       | emit('orion://message/chunk', ...)   |
       |------------------------------------->|
       |                                      | listen('orion://message/chunk')
       |                                      | filter by requestId
       |                                      | dispatch to callbacks
       |                                      |
       | emit('orion://session/complete', ...)|
       |------------------------------------->|
       |                                      | cleanup listeners
```

### Hook Implementation

```typescript
// src/hooks/useStreamListener.ts

import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { useEffect, useRef, useCallback } from 'react';
import type {
  OrionStreamEvent,
  MessageChunkPayload,
  ToolStartPayload,
  ToolCompletePayload,
  SessionCompletePayload,
  SessionErrorPayload,
} from '@/lib/ipc/types';

/**
 * Event callback types
 */
export interface StreamCallbacks {
  onMessage?: (payload: MessageChunkPayload) => void;
  onToolStart?: (payload: ToolStartPayload) => void;
  onToolComplete?: (payload: ToolCompletePayload) => void;
  onComplete?: (payload: SessionCompletePayload) => void;
  onError?: (payload: SessionErrorPayload) => void;
}

/**
 * Hook for listening to streaming events from a specific request
 * AC #3: Filters events by requestId for multiplexed stream handling
 *
 * @param requestId - The request ID to filter events by (from chat_send response)
 * @param callbacks - Event handlers for different message types
 */
export function useStreamListener(
  requestId: string | null,
  callbacks: StreamCallbacks
): void {
  const unlisteners = useRef<UnlistenFn[]>([]);
  const callbacksRef = useRef(callbacks);

  // Keep callbacks ref updated without re-running effect
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    // Don't setup listeners if no requestId
    if (!requestId) {
      return;
    }

    const setup = async () => {
      const listeners: UnlistenFn[] = [];

      // AC #1: Listen for message chunks (text, thinking)
      listeners.push(
        await listen<OrionStreamEvent<MessageChunkPayload>>(
          'orion://message/chunk',
          (event) => {
            // AC #3: Filter by requestId
            if (event.payload.requestId === requestId) {
              callbacksRef.current.onMessage?.(event.payload.payload);
            }
          }
        )
      );

      // AC #1: Listen for tool start events
      listeners.push(
        await listen<OrionStreamEvent<ToolStartPayload>>(
          'orion://tool/start',
          (event) => {
            if (event.payload.requestId === requestId) {
              callbacksRef.current.onToolStart?.(event.payload.payload);
            }
          }
        )
      );

      // AC #1: Listen for tool complete events
      listeners.push(
        await listen<OrionStreamEvent<ToolCompletePayload>>(
          'orion://tool/complete',
          (event) => {
            if (event.payload.requestId === requestId) {
              callbacksRef.current.onToolComplete?.(event.payload.payload);
            }
          }
        )
      );

      // AC #2: Listen for session complete events
      listeners.push(
        await listen<OrionStreamEvent<SessionCompletePayload>>(
          'orion://session/complete',
          (event) => {
            if (event.payload.requestId === requestId) {
              callbacksRef.current.onComplete?.(event.payload.payload);
            }
          }
        )
      );

      // AC #1: Listen for error events
      listeners.push(
        await listen<OrionStreamEvent<SessionErrorPayload>>(
          'orion://session/error',
          (event) => {
            if (event.payload.requestId === requestId) {
              callbacksRef.current.onError?.(event.payload.payload);
            }
          }
        )
      );

      unlisteners.current = listeners;
    };

    setup();

    // Cleanup: unsubscribe all listeners on unmount or requestId change
    return () => {
      unlisteners.current.forEach((unlisten) => unlisten());
      unlisteners.current = [];
    };
  }, [requestId]);
}
```

### Event Buffer for Rapid Delivery

Events may arrive faster than React can process them. Implement buffering:

```typescript
// src/hooks/useBufferedStreamListener.ts

import { useState, useCallback, useRef, useEffect } from 'react';
import { useStreamListener, StreamCallbacks } from './useStreamListener';
import type {
  MessageChunkPayload,
  ToolStartPayload,
  ToolCompletePayload,
  SessionCompletePayload,
  SessionErrorPayload,
} from '@/lib/ipc/types';

/**
 * Accumulated stream state
 */
export interface StreamState {
  /** Accumulated text content */
  text: string;
  /** Accumulated thinking content */
  thinking: string;
  /** Active tools (keyed by toolId) */
  tools: Map<string, {
    name: string;
    status: 'running' | 'complete' | 'error';
    durationMs?: number;
  }>;
  /** Whether streaming is complete */
  isComplete: boolean;
  /** Session cost in USD (if available) */
  costUsd: number | null;
  /** Session duration in ms */
  durationMs: number | null;
  /** Error if any */
  error: { code: string; message: string; recoverable: boolean } | null;
}

const initialState: StreamState = {
  text: '',
  thinking: '',
  tools: new Map(),
  isComplete: false,
  costUsd: null,
  durationMs: null,
  error: null,
};

/**
 * Buffered stream listener that accumulates state
 * Handles rapid event delivery by batching state updates
 *
 * @param requestId - The request ID to listen for
 * @returns Current accumulated stream state
 */
export function useBufferedStreamListener(
  requestId: string | null
): StreamState {
  const [state, setState] = useState<StreamState>(initialState);
  const bufferRef = useRef<Partial<StreamState>>({});
  const flushScheduledRef = useRef(false);

  // Reset state when requestId changes
  useEffect(() => {
    setState(initialState);
    bufferRef.current = {};
  }, [requestId]);

  // Flush buffer to state using requestAnimationFrame
  const scheduleFlush = useCallback(() => {
    if (flushScheduledRef.current) return;
    flushScheduledRef.current = true;

    requestAnimationFrame(() => {
      flushScheduledRef.current = false;
      const buffer = bufferRef.current;
      if (Object.keys(buffer).length > 0) {
        setState((prev) => ({
          ...prev,
          ...buffer,
          text: buffer.text !== undefined ? prev.text + buffer.text : prev.text,
          thinking: buffer.thinking !== undefined ? prev.thinking + buffer.thinking : prev.thinking,
          tools: buffer.tools !== undefined ? buffer.tools : prev.tools,
        }));
        bufferRef.current = {};
      }
    });
  }, []);

  // AC #1: Handle message chunks
  const onMessage = useCallback(
    (payload: MessageChunkPayload) => {
      if (payload.type === 'text') {
        bufferRef.current.text = (bufferRef.current.text || '') + payload.content;
      } else if (payload.type === 'thinking') {
        bufferRef.current.thinking = (bufferRef.current.thinking || '') + payload.content;
      }
      scheduleFlush();
    },
    [scheduleFlush]
  );

  // AC #1: Handle tool start
  const onToolStart = useCallback(
    (payload: ToolStartPayload) => {
      setState((prev) => {
        const tools = new Map(prev.tools);
        tools.set(payload.toolId, {
          name: payload.toolName,
          status: 'running',
        });
        return { ...prev, tools };
      });
    },
    []
  );

  // AC #1: Handle tool complete
  const onToolComplete = useCallback(
    (payload: ToolCompletePayload) => {
      setState((prev) => {
        const tools = new Map(prev.tools);
        const existing = tools.get(payload.toolId);
        if (existing) {
          tools.set(payload.toolId, {
            ...existing,
            status: payload.isError ? 'error' : 'complete',
            durationMs: payload.durationMs,
          });
        }
        return { ...prev, tools };
      });
    },
    []
  );

  // AC #2: Handle session complete
  const onComplete = useCallback(
    (payload: SessionCompletePayload) => {
      setState((prev) => ({
        ...prev,
        isComplete: true,
        costUsd: payload.costUsd,
        durationMs: payload.durationMs,
      }));
    },
    []
  );

  // Handle errors
  const onError = useCallback(
    (payload: SessionErrorPayload) => {
      setState((prev) => ({
        ...prev,
        isComplete: true,
        error: {
          code: payload.code,
          message: payload.message,
          recoverable: payload.recoverable,
        },
      }));
    },
    []
  );

  // Setup listeners
  useStreamListener(requestId, {
    onMessage,
    onToolStart,
    onToolComplete,
    onComplete,
    onError,
  });

  return state;
}
```

### Combined Chat Hook

Compose the IPC command (Story 2.4) with the stream listener:

```typescript
// src/hooks/useChat.ts

import { useState, useCallback } from 'react';
import { sendChatMessage } from '@/lib/ipc/chat';
import { useBufferedStreamListener, StreamState } from './useBufferedStreamListener';

export interface UseChatReturn {
  /** Send a message and start streaming */
  send: (prompt: string, sessionId?: string) => Promise<void>;
  /** Current stream state */
  stream: StreamState;
  /** Whether a request is in progress */
  isLoading: boolean;
  /** Current request ID (for debugging) */
  requestId: string | null;
}

/**
 * Combined hook for sending chat messages and receiving streams
 * Composes Story 2.4 (IPC command) + Story 2.5 (event streaming)
 */
export function useChat(): UseChatReturn {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // AC #3: Stream listener filtered by requestId
  const stream = useBufferedStreamListener(requestId);

  // Send message and setup streaming
  const send = useCallback(async (prompt: string, sessionId?: string) => {
    setIsLoading(true);

    try {
      // Story 2.4: Invoke chat_send, get requestId immediately
      const response = await sendChatMessage(prompt, sessionId);

      // AC #3: Set requestId to activate stream listener
      setRequestId(response.requestId);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  // Update loading state when stream completes
  if (stream.isComplete && isLoading) {
    setIsLoading(false);
  }

  return {
    send,
    stream,
    isLoading,
    requestId,
  };
}
```

### Type Updates

Extend types from Story 2.4 to include thinking content:

```typescript
// src/lib/ipc/types.ts (additions)

/**
 * Extended MessageChunkPayload to support thinking content
 * AC #1: Supports both 'text' and 'thinking' types
 */
export interface MessageChunkPayload {
  type: 'text' | 'thinking';
  content: string;
  isComplete: boolean;
}

/**
 * Session complete payload
 * AC #2: Contains cost and duration
 */
export interface SessionCompletePayload {
  type: 'session_complete';
  sessionId: string;
  totalTokens: number;
  costUsd: number;
  durationMs: number;
}
```

### Barrel Exports

```typescript
// src/hooks/index.ts

export { useStreamListener } from './useStreamListener';
export type { StreamCallbacks } from './useStreamListener';

export { useBufferedStreamListener } from './useBufferedStreamListener';
export type { StreamState } from './useBufferedStreamListener';

export { useChat } from './useChat';
export type { UseChatReturn } from './useChat';
```

---

## Implementation Tasks

- [ ] Task 1: Create base stream listener hook (AC: #1, #3)
  - [ ] 1.1: Create `src/hooks/useStreamListener.ts`
  - [ ] 1.2: Import `listen` and `UnlistenFn` from `@tauri-apps/api/event`
  - [ ] 1.3: Define `StreamCallbacks` interface with all event handlers
  - [ ] 1.4: Implement `useStreamListener()` hook with requestId filtering (AC #3)
  - [ ] 1.5: Setup listeners for all 5 event types (AC #1)
  - [ ] 1.6: Implement cleanup with `UnlistenFn` array

- [ ] Task 2: Create buffered stream listener (AC: #1, #2)
  - [ ] 2.1: Create `src/hooks/useBufferedStreamListener.ts`
  - [ ] 2.2: Define `StreamState` interface for accumulated state
  - [ ] 2.3: Implement buffer with `requestAnimationFrame` batching
  - [ ] 2.4: Handle text and thinking content accumulation (AC #1)
  - [ ] 2.5: Handle tool tracking (start/complete)
  - [ ] 2.6: Handle completion with cost/duration (AC #2)
  - [ ] 2.7: Handle error state
  - [ ] 2.8: Reset state on requestId change

- [ ] Task 3: Create combined chat hook (AC: #1, #2, #3)
  - [ ] 3.1: Create `src/hooks/useChat.ts`
  - [ ] 3.2: Import `sendChatMessage` from Story 2.4
  - [ ] 3.3: Import `useBufferedStreamListener` from Task 2
  - [ ] 3.4: Implement `send()` function that invokes IPC command
  - [ ] 3.5: Wire requestId from IPC response to stream listener (AC #3)
  - [ ] 3.6: Track loading state based on stream completion

- [ ] Task 4: Update type definitions (AC: #1, #2)
  - [ ] 4.1: Add 'thinking' type to `MessageChunkPayload` (AC #1)
  - [ ] 4.2: Add `totalTokens` to `SessionCompletePayload` (AC #2)
  - [ ] 4.3: Ensure type alignment with backend (Story 2.4)

- [ ] Task 5: Create barrel exports
  - [ ] 5.1: Create `src/hooks/index.ts`
  - [ ] 5.2: Export all hooks and types

- [ ] Task 6: Manual testing
  - [ ] 6.1: Verify events received in DevTools
  - [ ] 6.2: Test with mock backend events
  - [ ] 6.3: Verify requestId filtering works (AC #3)
  - [ ] 6.4: Verify cleanup on unmount

---

## Dependencies

### Requires (from prior stories)

| Story | What It Provides | Why Needed |
|-------|------------------|------------|
| Story 2.4 | `sendChatMessage()` IPC function | To initiate chat and get requestId |
| Story 2.4 | `OrionStreamEvent<T>` type | For event payload typing |
| Story 2.4 | Event emission from backend | Source of streaming events |
| Story 2.4 | Event type definitions | `MessageChunkPayload`, etc. |

### Provides For (future stories)

| Story | What This Story Provides |
|-------|--------------------------|
| Story 2.6 | `StreamState` for XState machine integration |
| Story 2.7 | `useChat()` hook for rendering TextBlock messages |
| Story 2.8 | `onToolStart` callback for ToolUseBlock rendering |
| Story 2.9 | Streaming state for cursor component |
| Story 2.10 | `isComplete` state for completion handling |
| Story 2.11 | Tool status tracking for tool result display |
| Story 2.12 | `costUsd` and usage for daily usage display |

---

## Accessibility Requirements

N/A - This is a developer-facing infrastructure story. Accessibility for streaming content is handled in rendering stories (2.7+).

---

## File Locations

### Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useStreamListener.ts` | Base Tauri event listener hook |
| `src/hooks/useBufferedStreamListener.ts` | Buffered state accumulation hook |
| `src/hooks/useChat.ts` | Combined send + listen hook |
| `src/hooks/index.ts` | Barrel exports |

### Files to Modify

| File | Changes |
|------|---------|
| `src/lib/ipc/types.ts` | Add 'thinking' type, `totalTokens` field |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `src/lib/ipc/chat.ts` | IPC command from Story 2.4 is complete |
| `src-tauri/*` | Backend event emission from Story 2.4 is complete |

---

## Definition of Done

- [ ] `useStreamListener()` hook exists and listens to all 5 event channels
- [ ] Events are filtered by `requestId` (AC #3)
- [ ] Listener cleanup works on unmount (no memory leaks)
- [ ] `useBufferedStreamListener()` accumulates text and thinking content (AC #1)
- [ ] Tool start/complete events update tool tracking (AC #1)
- [ ] Session complete event provides cost and duration (AC #2)
- [ ] `useChat()` composes IPC command with stream listener
- [ ] Type definitions extended for thinking content
- [ ] Barrel exports created
- [ ] `npm run build` completes successfully
- [ ] `npm run typecheck` passes
- [ ] Manual testing confirms events received in DevTools

---

## Test Strategy

> **Note:** The summary below lists core test cases. The authoritative test list is in the ATDD checklist (`atdd-checklist-2-5-implement-ipc-event-streaming.md`) which expands these to 40 unit tests including edge cases.

### Unit Tests (Core)

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.5-UNIT-001 | `useStreamListener` registers listeners for all event types | #1 |
| 2.5-UNIT-002 | `useStreamListener` filters events by requestId | #3 |
| 2.5-UNIT-003 | `useStreamListener` calls correct callback for text events | #1 |
| 2.5-UNIT-004 | `useStreamListener` calls correct callback for thinking events | #1 |
| 2.5-UNIT-005 | `useStreamListener` calls correct callback for tool_start | #1 |
| 2.5-UNIT-006 | `useStreamListener` calls correct callback for tool_complete | #1 |
| 2.5-UNIT-007 | `useStreamListener` calls correct callback for session_complete | #2 |
| 2.5-UNIT-008 | `useStreamListener` calls correct callback for session_error | #1 |
| 2.5-UNIT-009 | `useStreamListener` cleans up listeners on unmount | #3 |
| 2.5-UNIT-010 | `useBufferedStreamListener` accumulates text content | #1 |
| 2.5-UNIT-011 | `useBufferedStreamListener` accumulates thinking content | #1 |
| 2.5-UNIT-012 | `useBufferedStreamListener` tracks tool status | #1 |
| 2.5-UNIT-013 | `useBufferedStreamListener` sets isComplete on completion | #2 |
| 2.5-UNIT-014 | `useBufferedStreamListener` captures cost and duration | #2 |
| 2.5-UNIT-015 | `useBufferedStreamListener` resets state on requestId change | #3 |
| 2.5-UNIT-016 | `useChat` sets requestId from sendChatMessage response | #3 |

### Integration Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.5-INT-001 | Events from backend reach frontend listener | #1 |
| 2.5-INT-002 | Multiple concurrent streams are isolated by requestId | #3 |
| 2.5-INT-003 | Complete event with cost/duration reaches frontend | #2 |
| 2.5-INT-004 | Error event reaches frontend with proper structure | #1 |

### E2E Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.5-E2E-001 | Send message, receive text chunks, stream state updates | #1, #3 |
| 2.5-E2E-002 | Send message, tool invoked, tool status tracked | #1 |
| 2.5-E2E-003 | Send message, complete event has cost and duration | #2 |
| 2.5-E2E-004 | Two concurrent messages receive separate streams | #3 |

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| Base stream listener hook | 1.5 hours |
| Buffered state hook | 2 hours |
| Combined chat hook | 1 hour |
| Type updates | 30 minutes |
| Testing | 2 hours |
| Documentation | 30 minutes |
| **Total** | 7.5 hours |

---

## Notes

### Event Channel Architecture

This story completes the frontend half of the streaming pipeline:

```
Story 2.4 (Backend)                Story 2.5 (Frontend)
==================                ==================
chat_send command                 useStreamListener
       |                                 |
       v                                 v
spawn sidecar  ---stdout--->  parse JSON  -->  Tauri emit
       |                                              |
       v                                              v
SDK query()                              listen() callbacks
       |                                              |
       v                                              v
StreamMessage  ---JSON--->  OrionStreamEvent  --->  StreamState
```

### Buffering Strategy

Events may arrive faster than React's 16ms render cycle. The buffered hook:

1. Collects incoming events in a mutable ref (no state updates)
2. Schedules a single `requestAnimationFrame` flush
3. Applies all buffered changes in one `setState` call
4. Prevents render thrashing during rapid streaming

### requestId Filtering

AC #3 requires events to include `requestId` for multiplexing. The pattern:

1. `chat_send` returns `requestId` immediately (Story 2.4)
2. All emitted events include `requestId` (Story 2.4 backend)
3. `useStreamListener` filters events by matching `requestId`
4. Multiple concurrent queries use separate requestIds

This enables:
- Multiple simultaneous conversations
- Tab/window isolation
- Request cancellation tracking (future story)

### Thinking Content

Claude may emit thinking content (reasoning before final response). This is:
- Captured via `type: 'thinking'` in `MessageChunkPayload`
- Accumulated separately from text content
- Available for rendering in future stories (e.g., thinking indicator)

### Future Enhancements (NOT in this story)

- Request cancellation support
- Event replay for reconnection
- Offline queue with persistence
- Rate limiting for event emission
- Event compression for large payloads

---

## References

- [Source: thoughts/planning-artifacts/architecture.md#Streaming IPC Event Schema (lines 903-1022)]
- [Source: thoughts/planning-artifacts/epics.md#Story 2.5: Implement IPC Event Streaming]
- [Source: thoughts/research/streaming-architecture.md]
- [Source: .ralph/story-chain.md#Story 2.4 Notes for Next Story]
- [Tauri Events API: https://tauri.app/develop/calling-rust/#event-system]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - expected: useStreamListener.ts, useBufferedStreamListener.ts, useChat.ts, index.ts)
