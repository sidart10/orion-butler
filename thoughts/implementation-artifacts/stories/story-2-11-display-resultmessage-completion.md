# Story 2.11: Display ResultMessage Completion

Status: drafted

---

## Story Definition

| Field | Value |
|-------|-------|
| **Story ID** | 2-11-display-resultmessage-completion |
| **Epic** | Epic 2: First Conversation |
| **Status** | drafted |
| **Priority** | High (core completion feedback) |
| **Created** | 2026-01-24 |

---

## User Story

As a **user**,
I want to see when a response is fully complete,
So that I know Claude has finished.

---

## Acceptance Criteria

1. **Given** a streaming response is active
   **When** a `ResultMessage` event arrives
   **Then** the loading/streaming indicators stop

2. **And** the message is marked as complete in the UI

3. **And** token cost is logged for internal tracking (not displayed by default)

4. **And** the chat input is re-enabled for the next message

---

## Design References

### From Epic Definition (thoughts/planning-artifacts/epics.md)

**Story 2.11: Display ResultMessage Completion:**

> As a **user**,
> I want to see when a response is fully complete,
> So that I know Claude has finished.
>
> **Acceptance Criteria:**
>
> **Given** a streaming response is active
> **When** a `ResultMessage` event arrives
> **Then** the loading/streaming indicators stop
> **And** the message is marked as complete in the UI
> **And** token cost is logged for internal tracking (not displayed by default)
> **And** the chat input is re-enabled for the next message

### From Architecture (thoughts/planning-artifacts/architecture.md)

**Session Complete Payload (lines 954-959):**

```typescript
// Session lifecycle
interface SessionCompletePayload {
  type: 'session_complete';
  totalTokens: number;
  costUsd: number;
  durationMs: number;
}
```

**IPC Event Names (lines 978-979):**

| Event | Direction | Payload |
|-------|-----------|---------|
| `orion://session/complete` | Backend -> Frontend | `SessionCompletePayload` |

**Frontend Listener Hook (lines 1010-1012):**

```typescript
await listen<OrionEvent<SessionCompletePayload>>('orion://session/complete', (e) => {
  if (e.payload.requestId === requestId) onComplete(e.payload.payload);
}),
```

### From UX Design Specification (thoughts/planning-artifacts/ux-design-specification.md)

**ActivityIndicator Completed State (from Story 2.10 established patterns):**

| State | Icon | Color | Description |
|-------|------|-------|-------------|
| Completed | `lucide:check-circle` | Green (#059669) | Success |

**When Complete (lines 301-308):**
```
|  User                                          |
|  Schedule a call with Sarah                    |
|                                                |
|  +------------------------------------------+  |
|  | [check] Checked calendar, found contact... v |
|  +------------------------------------------+  |
```

**Animation Behavior (lines 944-950):**

> All animations are **non-blocking** - they never delay content rendering

### From Story Chain (.ralph/story-chain.md)

**Story 2.6 Established:**

- `streamingMachine` with states: idle, sending, streaming, **complete**, error
- `useStreamingMachine()` hook returning: state, context, send, reset, isLoading, isError, **isComplete**
- `StreamingContext` contains: text, thinking, tools, error, **costUsd**, **durationMs**, **totalTokens**
- **COMPLETE event** transitions streaming -> complete with metadata
- Recovery: SEND from complete state starts new message (resets context)

**Story 2.7 Established:**

- `AssistantMessage` component with `isStreaming` prop
- `StreamingCursor` shown when `isStreaming=true`, hidden when false
- `ChatMessageList` checks `state === 'streaming'` vs `state === 'complete'`

**Story 2.10 Established:**

- `ToolActivitySummary` with aggregate status (running/complete/error)
- Completion icons: CheckCircle (green) for success
- Collapse/expand pattern for tool results
- Duration display via `formatDuration()` helper

**Notes for Story 2.11 from Story 2.6 Provides For table:**

> | Story | What This Provides |
> |-------|-------------------|
> | 2.10 | `isComplete` and completion metadata for completion UI |

### From PRD NFR Requirements

**NFR-1.1 (Performance):** First token latency p95 < 500ms
**NFR-5.1 (Usability):** Full keyboard navigation
**NFR-5.3 (Usability):** WCAG AA contrast compliance

---

## Technical Requirements

### Overview: Completion Flow

When the SDK finishes processing a query, it emits a `ResultMessage` which the backend translates to an `orion://session/complete` IPC event. This story ensures the UI:

1. **Stops streaming indicators** - StreamingCursor disappears, tool spinners stop (AC #1)
2. **Marks message complete** - Visual state change showing response is finalized (AC #2)
3. **Logs usage internally** - Token cost tracked for future display (AC #3)
4. **Re-enables input** - User can send next message (AC #4)

### State Machine Integration

The state machine from Story 2.6 already handles the COMPLETE event:

```typescript
// From Story 2.6 - already implemented
// src/machines/streamingMachine.ts

// COMPLETE event handler (streaming -> complete)
COMPLETE: {
  target: 'complete',
  actions: assign({
    costUsd: ({ event }) => event.costUsd,
    durationMs: ({ event }) => event.durationMs,
    totalTokens: ({ event }) => event.totalTokens,
  }),
}

// State definition for 'complete'
complete: {
  on: {
    SEND: {
      target: 'sending',
      actions: 'resetContext',
    },
    RESET: {
      target: 'idle',
      actions: 'resetContext',
    },
  },
}
```

**Story 2.11 ensures the UI reacts to `state === 'complete'` correctly.**

### Updated ChatMessageList Component

```typescript
// src/components/chat/ChatMessageList.tsx (UPDATED from Story 2.10)

import { useStreamingMachine } from '@/hooks/useStreamingMachine';
import { AssistantMessage } from './AssistantMessage';
import { ThinkingIndicator } from './ThinkingIndicator';
import { ToolActivitySummary, ToolInfo } from './ToolActivitySummary';
import { UserMessage } from './UserMessage';
import { humanizeToolName, summarizeToolInput } from '@/lib/tool-display';

/**
 * Renders the chat message list with streaming, thinking, tool, and completion support
 * Updated in Story 2.11 for ResultMessage completion handling
 */
export function ChatMessageList() {
  const { state, context, isLoading, isComplete } = useStreamingMachine();

  // Story 2.8: Show thinking indicator when thinking content exists but no text yet
  const isThinkingActive =
    state === 'streaming' &&
    context.thinking.length > 0 &&
    context.text.length === 0 &&
    context.tools.size === 0;

  // Story 2.9 + 2.10: Transform context.tools Map to ToolInfo array
  const tools: ToolInfo[] = Array.from(context.tools.entries()).map(
    ([toolId, toolStatus]) => ({
      toolId,
      toolName: humanizeToolName(toolStatus.name),
      status: toolStatus.status,
      inputSummary: toolStatus.input
        ? summarizeToolInput(toolStatus.name, toolStatus.input)
        : null,
      result: toolStatus.result,
      errorMessage: toolStatus.errorMessage,
      durationMs: toolStatus.durationMs,
    })
  );

  // Show tools when any exist (running or completed)
  const hasTools = tools.length > 0;

  // Determine if we should show the assistant message
  const showAssistantMessage =
    state === 'streaming' ||
    state === 'complete' ||
    (state === 'error' && context.text.length > 0);

  // Show message only when text content exists
  const hasTextContent = context.text.length > 0;

  // AC #1: isStreaming is false when state is 'complete'
  // This stops the StreamingCursor from rendering
  const isCurrentlyStreaming = state === 'streaming' && hasTextContent;

  return (
    <div
      className="flex flex-col gap-4 p-4"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {/* Previous messages would be rendered here */}

      {/* Story 2.8: Thinking indicator (appears BEFORE tool activity) */}
      <ThinkingIndicator isActive={isThinkingActive} />

      {/* Story 2.9 + 2.10: Tool activity summary with completion states */}
      {hasTools && (
        <ToolActivitySummary
          tools={tools}
          defaultExpanded={false}
        />
      )}

      {/* Story 2.7 + 2.11: Assistant message with completion state */}
      {/* AC #1, #2: isStreaming=false when complete, message persists */}
      {showAssistantMessage && hasTextContent && (
        <AssistantMessage
          content={context.text}
          isStreaming={isCurrentlyStreaming}
          typewriterSpeed={0}
        />
      )}
    </div>
  );
}
```

### Updated ChatInput Component

The `ChatInput` component needs to respond to state changes for enabling/disabling:

```typescript
// src/components/chat/ChatInput.tsx (UPDATE)

import { useStreamingMachine } from '@/hooks/useStreamingMachine';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for ChatInput
 */
export interface ChatInputProps {
  /** Optional callback when message sent */
  onSend?: (message: string) => void;
  /** Additional class names */
  className?: string;
}

/**
 * Chat input component with send handler
 * AC #4: Disabled during streaming, re-enabled on complete/error
 */
export function ChatInput({ onSend, className }: ChatInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { state, send, isLoading, isComplete } = useStreamingMachine();

  // AC #4: Determine if input should be disabled
  // Disabled during 'sending' and 'streaming' states
  const isDisabled = state === 'sending' || state === 'streaming';

  // AC #4: Focus input when state transitions to 'complete' or 'error' or 'idle'
  useEffect(() => {
    if (state === 'complete' || state === 'error' || state === 'idle') {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [state]);

  const handleSubmit = () => {
    if (!value.trim() || isDisabled) return;

    const message = value.trim();
    setValue('');

    // Trigger state machine SEND event
    send({ type: 'SEND', prompt: message });

    // Optional callback
    onSend?.(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Command+Enter to send (per Story 2.12 AC)
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-4',
        'border-t border-orion-border',
        'bg-orion-surface',
        className
      )}
    >
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isDisabled ? 'Claude is responding...' : 'Type a message...'}
        disabled={isDisabled}
        aria-label="Chat input"
        className="flex-1"
      />

      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={isDisabled || !value.trim()}
        aria-label="Send message"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}

ChatInput.displayName = 'ChatInput';
```

### Logging Token Cost (AC #3)

Token cost should be logged for internal tracking (not displayed by default per AC):

```typescript
// src/hooks/useStreamingMachine.ts (UPDATE - add logging in COMPLETE handler)

// Within the stream listener callbacks, when onComplete is called:
onComplete: (payload) => {
  // AC #3: Log token cost for internal tracking
  console.log('[Orion] Session complete:', {
    totalTokens: payload.totalTokens,
    costUsd: payload.costUsd,
    durationMs: payload.durationMs,
    timestamp: new Date().toISOString(),
  });

  // Send COMPLETE event to state machine
  send({
    type: 'COMPLETE',
    totalTokens: payload.totalTokens,
    costUsd: payload.costUsd,
    durationMs: payload.durationMs,
  });
}
```

### Completion State Styling

The message and tool activity indicators should visually change on completion:

```typescript
// src/components/chat/AssistantMessage.tsx (minor update for clarity)

// The component already handles completion via isStreaming prop:
// - When isStreaming=true: Shows StreamingCursor
// - When isStreaming=false: Hides StreamingCursor (message appears finalized)

// No visual "complete" indicator needed per AC - the ABSENCE of the cursor IS the indicator
// The message simply persists and appears stable (not animated)
```

### Integration Test Helpers

```typescript
// src/lib/testing/completion-helpers.ts (for test support)

/**
 * Simulate a complete streaming flow for testing
 */
export function createMockCompletionPayload() {
  return {
    totalTokens: 150,
    costUsd: 0.0045,
    durationMs: 2340,
  };
}

/**
 * Assert completion state in tests
 */
export function assertCompletionState(state: string, context: StreamingContext) {
  expect(state).toBe('complete');
  expect(context.costUsd).toBeGreaterThan(0);
  expect(context.durationMs).toBeGreaterThan(0);
  expect(context.totalTokens).toBeGreaterThan(0);
}
```

---

## Implementation Tasks

- [ ] Task 1: Verify state machine COMPLETE handling (AC: #1, #2)
  - [ ] 1.1: Confirm `streamingMachine` has COMPLETE event in streaming state
  - [ ] 1.2: Confirm complete state stores costUsd, durationMs, totalTokens
  - [ ] 1.3: Confirm `isComplete` flag returns true when state === 'complete'

- [ ] Task 2: Update ChatMessageList for completion (AC: #1, #2)
  - [ ] 2.1: Verify `isCurrentlyStreaming` is false when state === 'complete'
  - [ ] 2.2: Verify AssistantMessage receives `isStreaming=false` on completion
  - [ ] 2.3: Verify message content persists after completion (not cleared)
  - [ ] 2.4: Verify ToolActivitySummary shows aggregate complete status

- [ ] Task 3: Update ChatInput for re-enabling (AC: #4)
  - [ ] 3.1: Create or update `ChatInput` component
  - [ ] 3.2: Add `isDisabled` logic based on state === 'sending' || 'streaming'
  - [ ] 3.3: Re-enable input when state === 'complete' or 'error' or 'idle'
  - [ ] 3.4: Add focus management to return focus to input on completion
  - [ ] 3.5: Update placeholder text to indicate streaming state

- [ ] Task 4: Add token cost logging (AC: #3)
  - [ ] 4.1: Add console.log in onComplete callback with cost metadata
  - [ ] 4.2: Include totalTokens, costUsd, durationMs, timestamp
  - [ ] 4.3: Verify logging works in development mode

- [ ] Task 5: Verify streaming cursor stops (AC: #1)
  - [ ] 5.1: Confirm StreamingCursor not rendered when isStreaming=false
  - [ ] 5.2: Confirm no animation artifacts remain after completion
  - [ ] 5.3: Test with rapid successive messages

- [ ] Task 6: Integration testing
  - [ ] 6.1: Create test helpers for completion simulation
  - [ ] 6.2: Test full flow: send -> streaming -> complete -> input enabled
  - [ ] 6.3: Test that new message can be sent after completion
  - [ ] 6.4: Test error recovery path (error -> input enabled)

- [ ] Task 7: Manual testing
  - [ ] 7.1: Trigger a real streaming response and verify cursor stops on completion
  - [ ] 7.2: Verify chat input is re-enabled after completion
  - [ ] 7.3: Verify token cost is logged to console
  - [ ] 7.4: Verify tool activity shows complete state
  - [ ] 7.5: Verify message persists and is not cleared
  - [ ] 7.6: Test sending multiple messages in sequence
  - [ ] 7.7: Test keyboard navigation (Tab to input, Cmd+Enter to send)
  - [ ] 7.8: Test dark mode appearance

---

## Dependencies

### Requires (from prior stories)

| Story | What It Provides | Why Needed |
|-------|------------------|------------|
| Story 2.6 | `streamingMachine` with COMPLETE event | State machine handles completion transition |
| Story 2.6 | `useStreamingMachine()` with isComplete flag | To detect completion state |
| Story 2.6 | `StreamingContext` with costUsd, durationMs, totalTokens | To store completion metadata |
| Story 2.7 | `AssistantMessage` with `isStreaming` prop | Cursor stops when isStreaming=false |
| Story 2.7 | `StreamingCursor` component | Hidden on completion |
| Story 2.10 | `ToolActivitySummary` aggregate completion | Tools show complete state |
| Story 2.10 | Green checkmark for success | Consistent completion visual |
| Story 2.5 | `useStreamListener()` with onComplete callback | Receives completion event |
| Story 2.4 | `orion://session/complete` IPC event | Backend signals completion |
| Story 1.7 | Button component | For send button |
| Story 1.8 | Input component | For chat input |

### Provides For (future stories)

| Story | What This Story Provides |
|-------|--------------------------|
| Story 2.12 | Input send handler foundation (Cmd+Enter, button) |
| Story 2.13 | Input/output relationship for thread layout |
| Story 2.14 | Completion timing data for latency metrics |
| Story 2.15 | Error state handling pattern (similar re-enable flow) |
| Epic 22 | Token cost logging for usage tracking features |

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Screen reader support** | `aria-live="polite"` announces completion |
| **Focus management** | Input receives focus on completion (AC #4) |
| **Keyboard navigation** | Tab navigates to enabled input |
| **State announcement** | Placeholder text changes to indicate ready state |
| **Reduced motion** | Completion transition respects `prefers-reduced-motion` |

---

## File Locations

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/chat/ChatInput.tsx` | Chat input with send handler and disable logic |
| `src/lib/testing/completion-helpers.ts` | Test helpers for completion simulation |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/chat/ChatMessageList.tsx` | Ensure isStreaming=false on complete |
| `src/hooks/useStreamingMachine.ts` | Add logging in onComplete callback |
| `src/components/chat/index.ts` | Export ChatInput component |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `src/machines/streamingMachine.ts` | COMPLETE handling already implemented in Story 2.6 |
| `src/components/chat/AssistantMessage.tsx` | Already handles isStreaming prop correctly |
| `src/components/chat/StreamingCursor.tsx` | Renders/hides based on parent prop |
| `src/components/chat/ToolActivitySummary.tsx` | Already shows aggregate completion |

---

## Definition of Done

- [ ] State machine transitions to 'complete' when COMPLETE event received
- [ ] StreamingCursor stops rendering when state === 'complete' (AC #1)
- [ ] AssistantMessage receives isStreaming=false on completion (AC #1)
- [ ] Message content persists after completion, not cleared (AC #2)
- [ ] ToolActivitySummary shows aggregate complete status with checkmark (AC #2)
- [ ] Token cost logged to console: totalTokens, costUsd, durationMs (AC #3)
- [ ] Chat input disabled during sending and streaming (AC #4)
- [ ] Chat input re-enabled when state === 'complete' (AC #4)
- [ ] Chat input re-enabled when state === 'error' (AC #4)
- [ ] Chat input receives focus on completion (AC #4)
- [ ] Placeholder text indicates streaming state ("Claude is responding...")
- [ ] `npm run build` completes successfully
- [ ] `npm run typecheck` passes
- [ ] Manual testing confirms completion flow works correctly
- [ ] New message can be sent after completion
- [ ] Multiple sequential messages work correctly

---

## Test Strategy

> **Note:** The test cases below are the authoritative test reference for this story. The ATDD checklist will be generated from this specification during the TEA ATDD step.

### Unit Tests (Core)

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.11-UNIT-001 | State machine transitions streaming -> complete on COMPLETE event | #1, #2 |
| 2.11-UNIT-002 | isComplete returns true when state === 'complete' | #1, #2 |
| 2.11-UNIT-003 | Context stores costUsd from COMPLETE event | #3 |
| 2.11-UNIT-004 | Context stores durationMs from COMPLETE event | #3 |
| 2.11-UNIT-005 | Context stores totalTokens from COMPLETE event | #3 |
| 2.11-UNIT-006 | isCurrentlyStreaming is false when state === 'complete' | #1 |
| 2.11-UNIT-007 | ChatInput disabled when state === 'sending' | #4 |
| 2.11-UNIT-008 | ChatInput disabled when state === 'streaming' | #4 |
| 2.11-UNIT-009 | ChatInput enabled when state === 'complete' | #4 |
| 2.11-UNIT-010 | ChatInput enabled when state === 'error' | #4 |
| 2.11-UNIT-011 | ChatInput enabled when state === 'idle' | #4 |
| 2.11-UNIT-012 | ChatInput placeholder changes based on disabled state | #4 |
| 2.11-UNIT-013 | Focus returns to input on completion | #4 |
| 2.11-UNIT-014 | AssistantMessage persists content when isStreaming changes to false | #2 |
| 2.11-UNIT-015 | StreamingCursor not rendered when isStreaming=false | #1 |

### Component Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.11-COMP-001 | ChatMessageList passes isStreaming=false to AssistantMessage when complete | #1, #2 |
| 2.11-COMP-002 | ChatMessageList shows ToolActivitySummary with complete aggregate status | #2 |
| 2.11-COMP-003 | ChatInput calls send() with SEND event on submit | #4 |
| 2.11-COMP-004 | ChatInput clears value after submit | #4 |
| 2.11-COMP-005 | ChatInput responds to Cmd+Enter keydown | #4 |

### Integration Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.11-INT-001 | Full flow: COMPLETE event stops streaming cursor | #1 |
| 2.11-INT-002 | Full flow: COMPLETE event marks message complete | #2 |
| 2.11-INT-003 | Full flow: COMPLETE event logs cost to console | #3 |
| 2.11-INT-004 | Full flow: COMPLETE event re-enables input | #4 |
| 2.11-INT-005 | Full flow: New message can be sent after COMPLETE | #4 |
| 2.11-INT-006 | Full flow: Error state also re-enables input | #4 |

### E2E Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.11-E2E-001 | User sees streaming stop when response completes | #1 |
| 2.11-E2E-002 | Message remains visible after completion | #2 |
| 2.11-E2E-003 | User can type new message after completion | #4 |
| 2.11-E2E-004 | User can send new message with Cmd+Enter after completion | #4 |
| 2.11-E2E-005 | Console shows token cost on completion | #3 |
| 2.11-E2E-006 | Multiple messages can be sent in sequence | #4 |
| 2.11-E2E-007 | Dark mode renders completion state correctly | #1, #2 |

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| State machine verification | 30 minutes |
| ChatMessageList updates | 30 minutes |
| ChatInput component creation | 1.5 hours |
| Token cost logging | 30 minutes |
| Test helpers | 45 minutes |
| Testing | 2.5 hours |
| Documentation | 30 minutes |
| **Total** | 6.75 hours |

---

## Notes

### Completion Indicator Design Decision

Per the acceptance criteria, completion is indicated by the **absence** of streaming indicators rather than adding a new "complete" badge:

1. StreamingCursor disappears (no more gold pulsing cursor)
2. Tool spinners become checkmarks (from Story 2.10)
3. Input becomes enabled with normal placeholder
4. Message appears stable (no animation)

This is the standard chat UX pattern - completion is signaled by the stream stopping, not by adding extra UI elements.

### Token Cost Logging

AC #3 specifies "logged for internal tracking (not displayed by default)". The implementation uses `console.log` with structured data:

```javascript
console.log('[Orion] Session complete:', {
  totalTokens: 150,
  costUsd: 0.0045,
  durationMs: 2340,
  timestamp: '2026-01-24T12:30:45.123Z',
});
```

This enables:
- Developer debugging during development
- Future integration with analytics (Epic 22)
- Easy filtering in browser dev tools

### Input Focus Management

AC #4 requires re-enabling the input. Best practice is also to return focus to the input so users can immediately type their next message. The implementation uses a small timeout (100ms) to ensure the DOM is ready before focusing.

### Relationship to Story 2.12

Story 2.12 (Chat Input Send Handler) covers the detailed send mechanics (Cmd+Enter, button, validation). This story (2.11) focuses on the completion side of the interaction - ensuring the input is ready for the next message after completion.

The ChatInput component created here provides the foundation that Story 2.12 will expand upon with:
- Empty input validation
- More sophisticated keyboard shortcuts
- Loading state indication in button

### Error State Handling

The input re-enable logic also handles error states to ensure users can retry after failures. This provides a consistent experience whether the response completes successfully or errors out.

### Future Enhancements (NOT in this story)

- Visual completion badge on message
- Toast notification on completion
- Sound effect on completion
- Token cost display in UI
- Response rating/feedback UI
- Copy response button appearing on completion

---

## References

- [Source: thoughts/planning-artifacts/epics.md#Story 2.11: Display ResultMessage Completion]
- [Source: thoughts/planning-artifacts/architecture.md#Session Complete Payload (lines 954-959)]
- [Source: thoughts/planning-artifacts/architecture.md#IPC Event Names (lines 978-979)]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Animation Behavior (lines 944-950)]
- [Source: .ralph/story-chain.md#Story 2.6 Established]
- [Source: .ralph/story-chain.md#Story 2.7 Established]
- [Source: .ralph/story-chain.md#Story 2.10 Established]
- [Source: Story 2.6 Create Streaming State Machine]
- [Source: Story 2.7 Render TextBlock Messages]
- [Source: Story 2.10 Render ToolResultBlock Status]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - expected: ChatInput.tsx, updated ChatMessageList.tsx, updated useStreamingMachine.ts, completion-helpers.ts)
