# Story 2.6: Create Streaming State Machine

Status: drafted

---

## Story Definition

| Field | Value |
|-------|-------|
| **Story ID** | 2-6-create-streaming-state-machine |
| **Epic** | Epic 2: First Conversation |
| **Status** | drafted |
| **Priority** | Critical (enables predictable chat UX) |
| **Created** | 2026-01-24 |

---

## User Story

As a **developer**,
I want an XState machine managing chat UI state,
So that streaming, errors, and completion are handled predictably.

---

## Acceptance Criteria

1. **Given** the chat component
   **When** I model the state machine
   **Then** states exist: `idle`, `sending`, `streaming`, `complete`, `error`

2. **And** transitions exist:
   - `idle -> sending` on user submit
   - `sending -> streaming` on first event
   - `streaming -> complete` on final event

3. **And** `error` state is reachable from `sending` or `streaming`

4. **And** machine resets to `idle` when starting new message

---

## Design References

### From Architecture (thoughts/planning-artifacts/architecture.md)

**State Management Decision (lines 238-250):**

```typescript
// Frontend Architecture decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| **UI State** | Zustand | Simple API, minimal boilerplate, great React integration |
| **Async/Streaming State** | XState | Already specified in PRD for streaming UX, handles complex state machines |
| **State Pattern** | Zustand (simple) + XState (complex) | Separation of concerns |
```

**State Boundaries (lines 243-250):**

| State Type | Manager | Examples |
|------------|---------|----------|
| UI Preferences | Zustand | Sidebar collapsed, theme, font size |
| Session Cache | Zustand | Active session ID, cached messages |
| Streaming Flow | XState | Token-by-token rendering, error recovery |
| Permission Dialogs | XState | Allow/deny flow, timeout handling |
| Canvas Interactions | XState | Calendar picker, email composer states |

**Communication Patterns (lines 1537-1544):**

```typescript
**State Management Boundaries:**

| Zustand (simple state) | XState (complex flows) |
|------------------------|------------------------|
| UI preferences | Streaming response |
| Session cache | Permission dialogs |
| Extension registry | Canvas interactions |
| User settings | Multi-step wizards |

**Store/Machine Naming:**
- Stores: `useSessionStore`, `usePreferencesStore`, `useExtensionStore`
- Machines: `streamingMachine`, `permissionMachine`, `canvasMachine`
```

**Process Patterns (lines 1558-1568):**

```typescript
**Loading States:**

| Pattern | Usage |
|---------|-------|
| Boolean (`isLoading`) | Simple operations |
| Status enum | When need idle/loading/success/error |
| XState matching | Complex multi-step flows |

**Error Categories:**

| Category | Code | Action |
|----------|------|--------|
| Recoverable | 1xxx | Toast + retry |
| Auth Required | 2xxx | Redirect to re-auth |
| Rate Limited | 3xxx | Auto-retry with backoff |
| Fatal | 9xxx | Error boundary |
```

### From Story Chain (.ralph/story-chain.md)

**Story 2.5 Established:**

- `useStreamListener()` hook for raw Tauri event handling
- `useBufferedStreamListener()` hook with RAF batching for accumulated state
- `useChat()` hook combining IPC command + stream listener
- `requestId` correlation pattern for multiplexed streams
- `StreamState` interface: `text`, `thinking`, `tools`, `isComplete`, `costUsd`, `durationMs`
- Listener cleanup pattern with `UnlistenFn` array
- Thinking content separation from text content

**Notes for Story 2.6 from Story 2.5:**

> - Use `StreamState` from `useBufferedStreamListener` as context input
> - XState states: `idle`, `sending`, `streaming`, `complete`, `error`
> - Transitions driven by stream events (text arrival -> streaming, complete event -> complete)
> - Consider using XState `invoke` for the IPC call
> - Machine should reset to `idle` on new message submission
> - Error state reachable from `sending` or `streaming`

**Story 2.4 Patterns (used by 2.5, relevant here):**

- Event namespace pattern: `orion://` prefix for all Orion Tauri events
- Event correlation pattern: `requestId` in all events for multiplexed stream handling
- `SessionErrorPayload` with `code`, `message`, `recoverable` fields

### From PRD NFR Requirements

**NFR-2.6 (Reliability):** Backoff and retry for rate-limited APIs
**NFR-6.2 (Maintainability):** Use only stable SDK features

### XState Library Reference

```typescript
// XState v5 patterns (stable as of May 2025)
import { createMachine, assign, fromPromise } from 'xstate';
import { useMachine } from '@xstate/react';
```

---

## Technical Requirements

### State Machine Definition

The streaming state machine manages the lifecycle of a chat query from user submission through completion or error.

```
                    ┌─────────────────────────────────────────────────┐
                    │                                                 │
                    │                    SEND                         │
                    │                    (reset)                      │
                    │                      │                          │
                    ▼                      │                          │
               ┌────────┐                  │                          │
               │  idle  │ ◄────────────────┼──────────────────────────┤
               └───┬────┘                  │                          │
                   │                       │                          │
                   │ SEND                  │                          │
                   ▼                       │                          │
              ┌─────────┐                  │                          │
              │ sending │ ────────────────►│                          │
              └────┬────┘                  │                          │
                   │                       │                          │
         ┌─────────┼─────────┐             │                          │
         │ FIRST_  │  ERROR  │             │                          │
         │ EVENT   │         │             │                          │
         ▼         ▼         ▼             │                          │
   ┌───────────┐  ┌─────────┐              │                          │
   │ streaming │  │  error  │ ─────────────┘                          │
   └─────┬─────┘  └─────────┘                                         │
         │                                                            │
         │ COMPLETE / ERROR                                           │
         │                                                            │
         ▼                                                            │
   ┌──────────┐                                                       │
   │ complete │ ──────────────────────────────────────────────────────┘
   └──────────┘
```

### Machine Context

```typescript
// src/machines/streamingMachine.ts

import { createMachine, assign } from 'xstate';

/**
 * Streaming machine context
 * AC #1: Tracks state data for idle, sending, streaming, complete, error
 */
export interface StreamingContext {
  /** Current request ID for stream correlation (from chat_send) */
  requestId: string | null;
  /** Session ID for the conversation */
  sessionId: string | null;
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
  /** Error details if in error state */
  error: {
    code: string;
    message: string;
    recoverable: boolean;
  } | null;
  /** Session cost in USD (set on completion) */
  costUsd: number | null;
  /** Session duration in ms (set on completion) */
  durationMs: number | null;
  /** Total tokens used (set on completion) */
  totalTokens: number | null;
}

const initialContext: StreamingContext = {
  requestId: null,
  sessionId: null,
  text: '',
  thinking: '',
  tools: new Map(),
  error: null,
  costUsd: null,
  durationMs: null,
  totalTokens: null,
};
```

### Machine Events

```typescript
/**
 * Events that drive the streaming state machine
 * AC #2: SEND, FIRST_EVENT, COMPLETE events for transitions
 * AC #3: ERROR event for error transitions
 */
export type StreamingEvent =
  // User initiates a new message
  | { type: 'SEND'; prompt: string; sessionId?: string }
  // IPC command responded with requestId (sending -> wait for stream)
  | { type: 'REQUEST_STARTED'; requestId: string }
  // First streaming event arrived (sending -> streaming)
  | { type: 'FIRST_EVENT' }
  // Text chunk received
  | { type: 'TEXT_CHUNK'; content: string }
  // Thinking chunk received
  | { type: 'THINKING_CHUNK'; content: string }
  // Tool started
  | { type: 'TOOL_START'; toolId: string; toolName: string }
  // Tool completed
  | { type: 'TOOL_COMPLETE'; toolId: string; isError: boolean; durationMs: number }
  // Stream completed successfully
  | { type: 'COMPLETE'; costUsd: number; durationMs: number; totalTokens: number }
  // Error occurred
  | { type: 'ERROR'; code: string; message: string; recoverable: boolean }
  // AC #4: Reset machine to idle (new message or explicit reset)
  | { type: 'RESET' };
```

### Machine Implementation

```typescript
/**
 * Streaming state machine
 * AC #1: States - idle, sending, streaming, complete, error
 * AC #2: Transitions - idle->sending->streaming->complete
 * AC #3: Error reachable from sending or streaming
 * AC #4: Reset to idle on new message
 */
export const streamingMachine = createMachine({
  id: 'streaming',
  initial: 'idle',
  context: initialContext,

  states: {
    /**
     * idle: Waiting for user to send a message
     * AC #1: Initial state
     */
    idle: {
      on: {
        // AC #2: idle -> sending on user submit
        SEND: {
          target: 'sending',
          actions: assign({
            // AC #4: Reset context for new message
            text: '',
            thinking: '',
            tools: () => new Map(),
            error: null,
            costUsd: null,
            durationMs: null,
            totalTokens: null,
            sessionId: ({ event }) => event.sessionId ?? null,
          }),
        },
      },
    },

    /**
     * sending: IPC command invoked, waiting for stream to begin
     * AC #1: Sending state
     */
    sending: {
      on: {
        // Store requestId when IPC responds
        REQUEST_STARTED: {
          actions: assign({
            requestId: ({ event }) => event.requestId,
          }),
        },
        // AC #2: sending -> streaming on first event
        FIRST_EVENT: {
          target: 'streaming',
        },
        // Text chunk counts as first event
        TEXT_CHUNK: {
          target: 'streaming',
          actions: 'appendText',
        },
        // Thinking chunk counts as first event
        THINKING_CHUNK: {
          target: 'streaming',
          actions: 'appendThinking',
        },
        // Tool start counts as first event
        TOOL_START: {
          target: 'streaming',
          actions: 'startTool',
        },
        // AC #3: error reachable from sending
        ERROR: {
          target: 'error',
          actions: 'setError',
        },
      },
    },

    /**
     * streaming: Receiving events from the stream
     * AC #1: Streaming state
     */
    streaming: {
      on: {
        // Accumulate text chunks
        TEXT_CHUNK: {
          actions: 'appendText',
        },
        // Accumulate thinking chunks
        THINKING_CHUNK: {
          actions: 'appendThinking',
        },
        // Track tool lifecycle
        TOOL_START: {
          actions: 'startTool',
        },
        TOOL_COMPLETE: {
          actions: 'completeTool',
        },
        // AC #2: streaming -> complete on final event
        COMPLETE: {
          target: 'complete',
          actions: 'setCompletion',
        },
        // AC #3: error reachable from streaming
        ERROR: {
          target: 'error',
          actions: 'setError',
        },
      },
    },

    /**
     * complete: Stream finished successfully
     * AC #1: Complete state
     */
    complete: {
      on: {
        // AC #4: Reset to idle when starting new message
        SEND: {
          target: 'sending',
          actions: 'resetForNewMessage',
        },
        RESET: {
          target: 'idle',
          actions: 'fullReset',
        },
      },
    },

    /**
     * error: An error occurred during sending or streaming
     * AC #1, #3: Error state reachable from sending or streaming
     */
    error: {
      on: {
        // AC #4: Reset to idle when starting new message
        SEND: {
          target: 'sending',
          actions: 'resetForNewMessage',
        },
        RESET: {
          target: 'idle',
          actions: 'fullReset',
        },
      },
    },
  },
}, {
  actions: {
    /**
     * Append text content to context
     */
    appendText: assign({
      text: ({ context, event }) =>
        context.text + (event as { content: string }).content,
    }),

    /**
     * Append thinking content to context
     */
    appendThinking: assign({
      thinking: ({ context, event }) =>
        context.thinking + (event as { content: string }).content,
    }),

    /**
     * Start tracking a tool
     */
    startTool: assign({
      tools: ({ context, event }) => {
        const tools = new Map(context.tools);
        const e = event as { toolId: string; toolName: string };
        tools.set(e.toolId, {
          name: e.toolName,
          status: 'running',
        });
        return tools;
      },
    }),

    /**
     * Complete a tool
     */
    completeTool: assign({
      tools: ({ context, event }) => {
        const tools = new Map(context.tools);
        const e = event as { toolId: string; isError: boolean; durationMs: number };
        const existing = tools.get(e.toolId);
        if (existing) {
          tools.set(e.toolId, {
            ...existing,
            status: e.isError ? 'error' : 'complete',
            durationMs: e.durationMs,
          });
        }
        return tools;
      },
    }),

    /**
     * Set error in context
     * AC #3: Captures error details
     */
    setError: assign({
      error: ({ event }) => {
        const e = event as { code: string; message: string; recoverable: boolean };
        return {
          code: e.code,
          message: e.message,
          recoverable: e.recoverable,
        };
      },
    }),

    /**
     * Set completion metadata
     * AC #2: Captures cost, duration, tokens on complete
     */
    setCompletion: assign({
      costUsd: ({ event }) => (event as { costUsd: number }).costUsd,
      durationMs: ({ event }) => (event as { durationMs: number }).durationMs,
      totalTokens: ({ event }) => (event as { totalTokens: number }).totalTokens,
    }),

    /**
     * Reset context for new message
     * AC #4: Preserves sessionId, resets everything else
     */
    resetForNewMessage: assign({
      requestId: null,
      text: '',
      thinking: '',
      tools: () => new Map(),
      error: null,
      costUsd: null,
      durationMs: null,
      totalTokens: null,
      sessionId: ({ event }) => (event as { sessionId?: string }).sessionId ?? null,
    }),

    /**
     * Full reset to initial context
     * AC #4: Complete reset
     */
    fullReset: assign(initialContext),
  },
});
```

### React Hook Integration

```typescript
// src/hooks/useStreamingMachine.ts

import { useMachine } from '@xstate/react';
import { useEffect, useCallback } from 'react';
import { streamingMachine, StreamingContext, StreamingEvent } from '@/machines/streamingMachine';
import { sendChatMessage } from '@/lib/ipc/chat';
import { useStreamListener, StreamCallbacks } from './useStreamListener';

/**
 * Return type for useStreamingMachine
 */
export interface UseStreamingMachineReturn {
  /** Current state name */
  state: 'idle' | 'sending' | 'streaming' | 'complete' | 'error';
  /** Machine context with accumulated data */
  context: StreamingContext;
  /** Send a message (triggers SEND event) */
  send: (prompt: string, sessionId?: string) => Promise<void>;
  /** Reset the machine to idle */
  reset: () => void;
  /** Whether currently loading (sending or streaming) */
  isLoading: boolean;
  /** Whether in error state */
  isError: boolean;
  /** Whether completed successfully */
  isComplete: boolean;
}

/**
 * Hook combining XState machine with Tauri event streaming
 * Bridges Story 2.5 (useStreamListener) with Story 2.6 (state machine)
 *
 * @returns Machine state, context, and actions
 */
export function useStreamingMachine(): UseStreamingMachineReturn {
  const [snapshot, sendEvent, actorRef] = useMachine(streamingMachine);

  // AC #4: Reset to idle
  const reset = useCallback(() => {
    sendEvent({ type: 'RESET' });
  }, [sendEvent]);

  // AC #2: Send message and initiate stream
  const send = useCallback(async (prompt: string, sessionId?: string) => {
    // AC #4: SEND event resets to sending state
    sendEvent({ type: 'SEND', prompt, sessionId });

    try {
      // Invoke IPC command (Story 2.4)
      const response = await sendChatMessage(prompt, sessionId);

      // Store requestId for stream correlation
      sendEvent({ type: 'REQUEST_STARTED', requestId: response.requestId });
    } catch (error) {
      // AC #3: Error during IPC call
      sendEvent({
        type: 'ERROR',
        code: '1001',
        message: error instanceof Error ? error.message : 'Failed to send message',
        recoverable: true,
      });
    }
  }, [sendEvent]);

  // Setup stream listener callbacks that dispatch events to machine
  const callbacks: StreamCallbacks = {
    onMessage: useCallback((payload) => {
      if (payload.type === 'text') {
        sendEvent({ type: 'TEXT_CHUNK', content: payload.content });
      } else if (payload.type === 'thinking') {
        sendEvent({ type: 'THINKING_CHUNK', content: payload.content });
      }
    }, [sendEvent]),

    onToolStart: useCallback((payload) => {
      sendEvent({
        type: 'TOOL_START',
        toolId: payload.toolId,
        toolName: payload.toolName,
      });
    }, [sendEvent]),

    onToolComplete: useCallback((payload) => {
      sendEvent({
        type: 'TOOL_COMPLETE',
        toolId: payload.toolId,
        isError: payload.isError,
        durationMs: payload.durationMs,
      });
    }, [sendEvent]),

    onComplete: useCallback((payload) => {
      sendEvent({
        type: 'COMPLETE',
        costUsd: payload.costUsd,
        durationMs: payload.durationMs,
        totalTokens: payload.totalTokens,
      });
    }, [sendEvent]),

    onError: useCallback((payload) => {
      sendEvent({
        type: 'ERROR',
        code: payload.code,
        message: payload.message,
        recoverable: payload.recoverable,
      });
    }, [sendEvent]),
  };

  // Connect to Tauri event stream (Story 2.5)
  useStreamListener(snapshot.context.requestId, callbacks);

  // Derive convenience flags
  const state = snapshot.value as 'idle' | 'sending' | 'streaming' | 'complete' | 'error';
  const isLoading = state === 'sending' || state === 'streaming';
  const isError = state === 'error';
  const isComplete = state === 'complete';

  return {
    state,
    context: snapshot.context,
    send,
    reset,
    isLoading,
    isError,
    isComplete,
  };
}
```

### Type Exports

```typescript
// src/machines/index.ts

export { streamingMachine } from './streamingMachine';
export type {
  StreamingContext,
  StreamingEvent,
} from './streamingMachine';

// src/hooks/index.ts (add to existing exports from Story 2.5)

export { useStreamingMachine } from './useStreamingMachine';
export type { UseStreamingMachineReturn } from './useStreamingMachine';
```

---

## Implementation Tasks

- [ ] Task 1: Create streaming machine (AC: #1, #2, #3)
  - [ ] 1.1: Create `src/machines/` directory if not exists
  - [ ] 1.2: Create `src/machines/streamingMachine.ts`
  - [ ] 1.3: Define `StreamingContext` interface with all fields
  - [ ] 1.4: Define `StreamingEvent` union type with all event types
  - [ ] 1.5: Implement `streamingMachine` with 5 states (AC #1)
  - [ ] 1.6: Implement `idle -> sending` transition on SEND (AC #2)
  - [ ] 1.7: Implement `sending -> streaming` transition on first event (AC #2)
  - [ ] 1.8: Implement `streaming -> complete` transition on COMPLETE (AC #2)
  - [ ] 1.9: Implement `sending -> error` transition on ERROR (AC #3)
  - [ ] 1.10: Implement `streaming -> error` transition on ERROR (AC #3)
  - [ ] 1.11: Implement all actions (appendText, appendThinking, startTool, completeTool, setError, setCompletion, resetForNewMessage, fullReset)

- [ ] Task 2: Create React hook integration (AC: #2, #4)
  - [ ] 2.1: Create `src/hooks/useStreamingMachine.ts`
  - [ ] 2.2: Import `useMachine` from `@xstate/react`
  - [ ] 2.3: Import `useStreamListener` from Story 2.5
  - [ ] 2.4: Implement `send()` function that dispatches SEND and invokes IPC
  - [ ] 2.5: Implement `reset()` function that dispatches RESET (AC #4)
  - [ ] 2.6: Connect stream listener callbacks to machine events
  - [ ] 2.7: Derive convenience flags (isLoading, isError, isComplete)
  - [ ] 2.8: Return typed interface matching `UseStreamingMachineReturn`

- [ ] Task 3: Create barrel exports
  - [ ] 3.1: Create `src/machines/index.ts`
  - [ ] 3.2: Export machine and types from streamingMachine
  - [ ] 3.3: Update `src/hooks/index.ts` to include useStreamingMachine

- [ ] Task 4: Install XState dependencies
  - [ ] 4.1: Run `npm install xstate @xstate/react`
  - [ ] 4.2: Verify package.json updated

- [ ] Task 5: Manual testing
  - [ ] 5.1: Verify state transitions in React DevTools
  - [ ] 5.2: Test idle -> sending -> streaming -> complete flow
  - [ ] 5.3: Test error state from sending
  - [ ] 5.4: Test error state from streaming
  - [ ] 5.5: Test SEND from complete state resets properly (AC #4)
  - [ ] 5.6: Test SEND from error state resets properly (AC #4)

---

## Dependencies

### Requires (from prior stories)

| Story | What It Provides | Why Needed |
|-------|------------------|------------|
| Story 2.4 | `sendChatMessage()` IPC function | To initiate chat and get requestId |
| Story 2.4 | Event type definitions | `MessageChunkPayload`, `SessionCompletePayload`, etc. |
| Story 2.5 | `useStreamListener()` hook | To receive Tauri events and dispatch to machine |
| Story 2.5 | `StreamCallbacks` interface | For callback type definitions |

### Provides For (future stories)

| Story | What This Story Provides |
|-------|--------------------------|
| Story 2.7 | `state` and `context.text` for rendering TextBlock messages |
| Story 2.8 | `context.thinking` for rendering thinking indicator |
| Story 2.9 | `context.tools` for rendering ToolUseBlock status |
| Story 2.10 | `isComplete` and completion metadata for UI |
| Story 2.11 | `context.error` for error display |
| Story 2.12 | `context.costUsd` for usage display |
| All Epic 2 UI | Predictable state for UI rendering |

---

## Accessibility Requirements

N/A - This is a developer-facing infrastructure story. Accessibility for streaming content and states is handled in rendering stories (2.7+).

---

## File Locations

### Files to Create

| File | Purpose |
|------|---------|
| `src/machines/streamingMachine.ts` | XState machine definition with states and actions |
| `src/machines/index.ts` | Barrel exports for machines |
| `src/hooks/useStreamingMachine.ts` | React hook integrating machine with stream listener |

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/index.ts` | Add export for `useStreamingMachine` |
| `package.json` | Add xstate and @xstate/react dependencies |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `src/hooks/useStreamListener.ts` | Hook from Story 2.5 is complete |
| `src/hooks/useBufferedStreamListener.ts` | Hook from Story 2.5 is complete |
| `src/lib/ipc/*` | IPC layer from Story 2.4 is complete |

---

## Definition of Done

- [ ] XState machine exists with 5 states: idle, sending, streaming, complete, error (AC #1)
- [ ] Transition `idle -> sending` works on SEND event (AC #2)
- [ ] Transition `sending -> streaming` works on first stream event (AC #2)
- [ ] Transition `streaming -> complete` works on COMPLETE event (AC #2)
- [ ] Transition `sending -> error` works on ERROR event (AC #3)
- [ ] Transition `streaming -> error` works on ERROR event (AC #3)
- [ ] SEND from `complete` or `error` resets to `sending` (AC #4)
- [ ] RESET from `complete` or `error` returns to `idle` (AC #4)
- [ ] `useStreamingMachine` hook connects machine to stream listener
- [ ] Convenience flags (isLoading, isError, isComplete) derived correctly
- [ ] Barrel exports created for machine and hook
- [ ] xstate and @xstate/react installed
- [ ] `npm run build` completes successfully
- [ ] `npm run typecheck` passes
- [ ] Manual testing confirms all state transitions work

---

## Test Strategy

> **Note:** The summary below lists core test cases. The authoritative test list will be in the ATDD checklist (`atdd-checklist-2-6-create-streaming-state-machine.md`) which expands these to 40+ unit tests including edge cases.

### Unit Tests (Core)

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.6-UNIT-001 | Machine initial state is `idle` | #1 |
| 2.6-UNIT-002 | Machine transitions from `idle` to `sending` on SEND | #2 |
| 2.6-UNIT-003 | Machine transitions from `sending` to `streaming` on TEXT_CHUNK | #2 |
| 2.6-UNIT-004 | Machine transitions from `sending` to `streaming` on THINKING_CHUNK | #2 |
| 2.6-UNIT-005 | Machine transitions from `sending` to `streaming` on TOOL_START | #2 |
| 2.6-UNIT-006 | Machine transitions from `sending` to `streaming` on FIRST_EVENT | #2 |
| 2.6-UNIT-007 | Machine transitions from `streaming` to `complete` on COMPLETE | #2 |
| 2.6-UNIT-008 | Machine transitions from `sending` to `error` on ERROR | #3 |
| 2.6-UNIT-009 | Machine transitions from `streaming` to `error` on ERROR | #3 |
| 2.6-UNIT-010 | Machine transitions from `complete` to `sending` on SEND | #4 |
| 2.6-UNIT-011 | Machine transitions from `error` to `sending` on SEND | #4 |
| 2.6-UNIT-012 | Machine transitions from `complete` to `idle` on RESET | #4 |
| 2.6-UNIT-013 | Machine transitions from `error` to `idle` on RESET | #4 |
| 2.6-UNIT-014 | Context text accumulates on TEXT_CHUNK events | #2 |
| 2.6-UNIT-015 | Context thinking accumulates on THINKING_CHUNK events | #2 |
| 2.6-UNIT-016 | Context tools tracks TOOL_START events | #2 |
| 2.6-UNIT-017 | Context tools updates on TOOL_COMPLETE events | #2 |
| 2.6-UNIT-018 | Context error populated on ERROR event | #3 |
| 2.6-UNIT-019 | Context costUsd/durationMs/totalTokens populated on COMPLETE | #2 |
| 2.6-UNIT-020 | Context reset on SEND from complete state | #4 |
| 2.6-UNIT-021 | Context reset on SEND from error state | #4 |
| 2.6-UNIT-022 | Context sessionId preserved across resets | #4 |

### Hook Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.6-HOOK-001 | `useStreamingMachine` returns correct initial state | #1 |
| 2.6-HOOK-002 | `send()` dispatches SEND and invokes IPC | #2 |
| 2.6-HOOK-003 | `reset()` dispatches RESET event | #4 |
| 2.6-HOOK-004 | `isLoading` true in sending and streaming states | #1 |
| 2.6-HOOK-005 | `isError` true in error state | #3 |
| 2.6-HOOK-006 | `isComplete` true in complete state | #2 |
| 2.6-HOOK-007 | Stream events dispatch correct machine events | #2, #3 |

### Integration Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.6-INT-001 | Full flow: send -> streaming events -> complete | #1, #2 |
| 2.6-INT-002 | Error flow: send -> error event -> error state | #3 |
| 2.6-INT-003 | Recovery flow: error -> send -> streaming | #4 |
| 2.6-INT-004 | Multiple messages: complete -> send -> streaming | #4 |

### E2E Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.6-E2E-001 | UI reflects idle state on initial load | #1 |
| 2.6-E2E-002 | UI shows loading during sending/streaming | #1, #2 |
| 2.6-E2E-003 | UI shows completion state with metadata | #2 |
| 2.6-E2E-004 | UI shows error state with message | #3 |
| 2.6-E2E-005 | New message after completion works | #4 |

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| Machine definition with states/actions | 2 hours |
| React hook integration | 1.5 hours |
| Barrel exports and types | 30 minutes |
| Testing | 2.5 hours |
| Documentation | 30 minutes |
| **Total** | 7 hours |

---

## Notes

### XState Version

This story uses XState v5 patterns (stable as of May 2025):

```typescript
// XState v5 imports
import { createMachine, assign } from 'xstate';
import { useMachine } from '@xstate/react';

// Note: v5 uses snapshot.context, not state.context
const [snapshot, send] = useMachine(machine);
const context = snapshot.context;
const value = snapshot.value; // state name
```

### State Machine vs Buffered Hook

Story 2.5 provided `useBufferedStreamListener` which accumulates state. This story's machine provides:

1. **Explicit states** (idle, sending, streaming, complete, error) vs implicit `isLoading`
2. **Type-safe transitions** enforced by XState
3. **Testable state logic** separate from React rendering
4. **Guard conditions** (not implemented in MVP but enabled by pattern)

The buffered hook from Story 2.5 can still be used directly for simpler use cases. The state machine is for components needing explicit state handling.

### Error Recovery Pattern

The machine supports two recovery paths from error:

1. **SEND** - Start a new message (most common)
2. **RESET** - Return to idle without starting new message

This matches UX patterns where users either retry or abandon after errors.

### Tool Tracking

Tools are tracked in a Map by `toolId`:

```typescript
tools: Map<string, {
  name: string;
  status: 'running' | 'complete' | 'error';
  durationMs?: number;
}>
```

This enables:
- Showing multiple concurrent tools
- Tracking individual tool success/failure
- Displaying timing information

### Future Enhancements (NOT in this story)

- Retry action from error state (with exponential backoff)
- Cancel action to abort streaming
- Timeout transitions for stuck states
- Guard conditions for complex transition rules
- Invoked promises for IPC calls
- Parallel states for canvas + streaming

---

## References

- [Source: thoughts/planning-artifacts/architecture.md#State Management (lines 238-250)]
- [Source: thoughts/planning-artifacts/architecture.md#State Boundaries (lines 243-250)]
- [Source: thoughts/planning-artifacts/architecture.md#Communication Patterns (lines 1537-1544)]
- [Source: thoughts/planning-artifacts/epics.md#Story 2.6: Create Streaming State Machine]
- [Source: .ralph/story-chain.md#Story 2.5 Notes for Next Story]
- [XState v5 Documentation: https://stately.ai/docs/xstate-v5]
- [XState React Integration: https://stately.ai/docs/xstate-react]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - expected: streamingMachine.ts, useStreamingMachine.ts, index.ts)
