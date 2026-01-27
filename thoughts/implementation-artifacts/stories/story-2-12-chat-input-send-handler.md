# Story 2.12: Chat Input Send Handler

Status: ready-for-dev

---

## Story Definition

| Field | Value |
|-------|-------|
| **Story ID** | 2-12-chat-input-send-handler |
| **Epic** | Epic 2: First Conversation |
| **Status** | ready-for-dev |
| **Priority** | High (core user interaction) |
| **Created** | 2026-01-24 |

---

## User Story

As a **user**,
I want to send messages via keyboard or button,
So that I can communicate with Claude.

---

## Acceptance Criteria

1. **Given** the chat input has text
   **When** I press Cmd+Enter or click the Send button
   **Then** the message is sent to the backend

2. **And** the input is cleared

3. **And** the input is disabled while sending (re-enabled on complete/error)

4. **When** the input is empty
   **Then** the Send action is disabled

---

## Design References

### From Epic Definition (thoughts/planning-artifacts/epics.md)

**Story 2.12: Chat Input Send Handler:**

> As a **user**,
> I want to send messages via keyboard or button,
> So that I can communicate with Claude.
>
> **Acceptance Criteria:**
>
> **Given** the chat input has text
> **When** I press Cmd+Enter or click the Send button
> **Then** the message is sent to the backend
> **And** the input is cleared
> **And** the input is disabled while sending (re-enabled on complete/error)
> **When** the input is empty
> **Then** the Send action is disabled

### From Architecture (thoughts/planning-artifacts/architecture.md)

**Tauri Command Naming (lines 1406-1410):**

```
| Element | Convention | Example |
|---------|------------|---------|
| Tauri commands | snake_case | `get_session`, `send_message` |
```

**State Machine Naming (line 1548):**

```
Machines: `streamingMachine`, `permissionMachine`, `canvasMachine`
```

**IPC Streaming Pattern (lines 968-979):**

| Event | Direction | Payload |
|-------|-----------|---------|
| `orion://message/chunk` | Backend -> Frontend | `MessageChunkPayload` |
| `orion://session/complete` | Backend -> Frontend | `SessionCompletePayload` |
| `orion://session/error` | Backend -> Frontend | `SessionErrorPayload` |

### From UX Design Specification (thoughts/planning-artifacts/ux-design-specification.md)

**Keyboard Shortcuts (lines 1630-1633):**

| Key | Action | Context |
|-----|--------|---------|
| Cmd+Enter | Primary action | Context-dependent |

**FR-10.7 Requirement:** Support keyboard shortcuts for all primary actions (including Cmd+Enter for send)

### From Story Chain (.ralph/story-chain.md)

**Story 2.6 Established:**

- `streamingMachine` with states: idle, sending, streaming, complete, error
- `useStreamingMachine()` hook returns: state, context, send, reset, isLoading, isError, isComplete
- **SEND event** transitions idle/complete/error -> sending with prompt payload
- `send({ type: 'SEND', prompt: message })` triggers the state machine

**Story 2.11 Established:**

- `ChatInput` component foundation created (input + send button)
- Input disabled during sending/streaming states
- Input re-enabled and focused on complete/error states
- Placeholder text: "Claude is responding..." during send/stream
- Placeholder text: "Type a message..." when idle/complete
- `handleSubmit()` pattern with `send({ type: 'SEND', prompt })` call
- Cmd+Enter keyboard shortcut pattern (basic implementation exists)

**Story 1.15 Established:**

- Global keyboard shortcut patterns using `useEffect` with event listeners
- `e.metaKey` (Mac) and `e.ctrlKey` (Windows/Linux) for modifier detection
- Clean pattern for keyboard binding/unbinding

**Story 2.4 Established:**

- `chat_send` IPC command exists in backend
- Returns `requestId` for stream correlation
- Pattern: `invoke<string>('chat_send', { prompt, sessionId })`

---

## Technical Requirements

### Overview: Complete Send Handler Flow

Story 2.11 created the `ChatInput` component foundation with state-based enabling/disabling. Story 2.12 completes the send functionality by:

1. **Validating input** - Empty input disables send (AC #4)
2. **Keyboard shortcut** - Cmd+Enter sends message (AC #1)
3. **Button click** - Send button sends message (AC #1)
4. **IPC integration** - Message sent to backend via state machine (AC #1)
5. **Input clearing** - Clear input on successful send (AC #2)
6. **Disable during send** - Already handled by Story 2.11 (AC #3)

### What Story 2.11 Already Provides

From Story 2.11 implementation, `ChatInput` already has:

```typescript
// EXISTING from Story 2.11 - DO NOT RECREATE
- Input field with value state
- Send button with disabled state
- State machine integration (useStreamingMachine)
- isDisabled = state === 'sending' || state === 'streaming'
- Focus management on completion
- Placeholder state changes
- Basic handleSubmit function
- Basic Cmd+Enter handler (e.metaKey && e.key === 'Enter')
```

### Story 2.12 Enhancements Required

**1. Empty Input Validation (AC #4)**

The send action must be disabled when input is empty:

```typescript
// Enhancement to ChatInput
const canSend = value.trim().length > 0 && !isDisabled;

// Button disabled state
<Button disabled={!canSend}>

// handleSubmit guard
const handleSubmit = () => {
  if (!canSend) return;
  // ... rest of submit logic
};
```

**2. Robust Keyboard Handler (AC #1)**

Enhance the keyboard handler to support both Mac (Cmd) and Windows/Linux (Ctrl):

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  // Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    handleSubmit();
  }
};
```

**3. Input Clearing on Submit (AC #2)**

Ensure input clears immediately on submit (before async operations):

```typescript
const handleSubmit = () => {
  if (!canSend) return;

  const message = value.trim();
  setValue(''); // AC #2: Clear immediately

  // Send to state machine
  send({ type: 'SEND', prompt: message });
  onSend?.(message);
};
```

**4. Backend Integration Verification**

Verify the state machine's SEND event properly invokes the IPC command:

```typescript
// In streamingMachine (from Story 2.6) - VERIFY EXISTS
// The machine should invoke chat_send IPC when SEND event received
idle: {
  on: {
    SEND: {
      target: 'sending',
      actions: ['setPrompt', 'invokeChat']
    }
  }
}

// The invokeChat action should call:
// invoke<string>('chat_send', { prompt, sessionId })
```

### Updated ChatInput Component

```typescript
// src/components/chat/ChatInput.tsx (UPDATED from Story 2.11)

import { useStreamingMachine } from '@/hooks/useStreamingMachine';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Send } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
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
 * Story 2.12: Complete send functionality with keyboard shortcuts
 *
 * AC #1: Cmd+Enter or button click sends message
 * AC #2: Input cleared on send
 * AC #3: Input disabled while sending (from Story 2.11)
 * AC #4: Send disabled when input empty
 */
export function ChatInput({ onSend, className }: ChatInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { state, send, isLoading } = useStreamingMachine();

  // AC #3: Determine if input should be disabled (from Story 2.11)
  const isDisabled = state === 'sending' || state === 'streaming';

  // AC #4: Determine if send is allowed
  const canSend = value.trim().length > 0 && !isDisabled;

  // AC #3: Focus input on state transitions (from Story 2.11)
  useEffect(() => {
    if (state === 'complete' || state === 'error' || state === 'idle') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [state]);

  // AC #1, #2: Handle message submission
  const handleSubmit = useCallback(() => {
    if (!canSend) return;

    const message = value.trim();
    setValue(''); // AC #2: Clear input immediately

    // AC #1: Send to backend via state machine
    send({ type: 'SEND', prompt: message });

    // Optional callback
    onSend?.(message);
  }, [canSend, value, send, onSend]);

  // AC #1: Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

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
        aria-label="Chat message input"
        className="flex-1"
      />

      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={!canSend}
        aria-label={canSend ? 'Send message' : 'Enter a message to send'}
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}

ChatInput.displayName = 'ChatInput';
```

### Textarea Alternative (Optional Enhancement)

If multi-line input is desired, consider using Textarea instead of Input:

```typescript
// Alternative: src/components/chat/ChatInput.tsx with Textarea
// Only implement if UX design requires multi-line input

import { Textarea } from '@/components/ui/Textarea';

// Then in render:
<Textarea
  ref={textareaRef}
  value={value}
  onChange={(e) => setValue(e.target.value)}
  onKeyDown={handleKeyDown}
  placeholder={isDisabled ? 'Claude is responding...' : 'Type a message...'}
  disabled={isDisabled}
  aria-label="Chat message input"
  className="flex-1 min-h-[40px] max-h-[200px] resize-none"
  rows={1}
/>

// Note: Textarea requires different Enter handling:
// - Enter alone = new line
// - Cmd+Enter = send
```

### Test Helper Updates

```typescript
// src/lib/testing/chat-input-helpers.ts

/**
 * Simulate Cmd+Enter keyboard event
 */
export function simulateCmdEnter(element: HTMLElement) {
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    metaKey: true,
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(event);
}

/**
 * Simulate Ctrl+Enter keyboard event (Windows/Linux)
 */
export function simulateCtrlEnter(element: HTMLElement) {
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(event);
}

/**
 * Assert send button disabled state
 */
export function assertSendButtonDisabled(container: HTMLElement, expected: boolean) {
  const button = container.querySelector('button[aria-label*="Send"]') as HTMLButtonElement;
  expect(button?.disabled).toBe(expected);
}
```

---

## Implementation Tasks

- [ ] Task 1: Enhance ChatInput empty validation (AC: #4)
  - [ ] 1.1: Add `canSend` computed value based on `value.trim().length > 0 && !isDisabled`
  - [ ] 1.2: Update Button `disabled` prop to use `!canSend`
  - [ ] 1.3: Add guard in `handleSubmit` to check `canSend`
  - [ ] 1.4: Update aria-label to reflect disabled reason

- [ ] Task 2: Verify keyboard shortcut handling (AC: #1)
  - [ ] 2.1: Verify `handleKeyDown` checks both `e.metaKey` (Mac) and `e.ctrlKey` (Win/Linux)
  - [ ] 2.2: Verify `e.preventDefault()` is called to prevent form submission
  - [ ] 2.3: Test keyboard shortcut works in development

- [ ] Task 3: Verify input clearing (AC: #2)
  - [ ] 3.1: Verify `setValue('')` is called before `send()` in `handleSubmit`
  - [ ] 3.2: Test that input clears immediately, not after async response

- [ ] Task 4: Verify backend integration (AC: #1)
  - [ ] 4.1: Trace `send({ type: 'SEND', prompt })` through state machine
  - [ ] 4.2: Verify state machine invokes `chat_send` IPC command
  - [ ] 4.3: Test message appears in backend logs/console

- [ ] Task 5: Verify disable during send (AC: #3)
  - [ ] 5.1: Confirm `isDisabled` logic from Story 2.11 is intact
  - [ ] 5.2: Test input disabled during sending state
  - [ ] 5.3: Test input disabled during streaming state
  - [ ] 5.4: Test input re-enabled on complete/error

- [ ] Task 6: Create test helpers
  - [ ] 6.1: Create `simulateCmdEnter()` helper
  - [ ] 6.2: Create `simulateCtrlEnter()` helper
  - [ ] 6.3: Create `assertSendButtonDisabled()` helper

- [ ] Task 7: Unit/Integration testing
  - [ ] 7.1: Test send button disabled when input empty
  - [ ] 7.2: Test send button enabled when input has text
  - [ ] 7.3: Test Cmd+Enter triggers send
  - [ ] 7.4: Test Ctrl+Enter triggers send (cross-platform)
  - [ ] 7.5: Test input clears after send
  - [ ] 7.6: Test SEND event received by state machine

- [ ] Task 8: Manual testing
  - [ ] 8.1: Type message and press Cmd+Enter - verify sends
  - [ ] 8.2: Type message and click Send button - verify sends
  - [ ] 8.3: Empty input - verify Send button disabled
  - [ ] 8.4: Empty input - verify Cmd+Enter does nothing
  - [ ] 8.5: Verify input clears after send
  - [ ] 8.6: Verify input disabled during streaming
  - [ ] 8.7: Verify input re-enabled after response completes
  - [ ] 8.8: Test dark mode styling

---

## Dependencies

### Requires (from prior stories)

| Story | What It Provides | Why Needed |
|-------|------------------|------------|
| Story 2.6 | `streamingMachine` with SEND event | State machine handles send transition |
| Story 2.6 | `useStreamingMachine()` with send function | To dispatch SEND events |
| Story 2.11 | `ChatInput` component foundation | Base component to enhance |
| Story 2.11 | Disable/enable logic during streaming | AC #3 already implemented |
| Story 2.11 | Focus management pattern | Return focus after completion |
| Story 2.4 | `chat_send` IPC command | Backend integration |
| Story 1.7 | Button component | Send button UI |
| Story 1.8 | Input component | Text input UI |
| Story 1.15 | Keyboard shortcut patterns | Cmd+Enter implementation reference |

### Provides For (future stories)

| Story | What This Story Provides |
|-------|--------------------------|
| Story 2.13 | Complete send flow for message thread layout |
| Story 2.14 | Send timestamp for latency tracking |
| Story 2.15 | Send mechanism for retry-after-error flow |
| Epic 4 | Foundation for session continuation |
| Epic 6 | Send handler for GTD quick capture |

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard accessibility** | Cmd+Enter sends message (FR-10.7) |
| **Cross-platform** | Both Cmd (Mac) and Ctrl (Win/Linux) supported |
| **Button state** | aria-label reflects why button is disabled |
| **Focus management** | Input focused after completion (from 2.11) |
| **Screen reader** | aria-label on input and button |

---

## File Locations

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/chat/ChatInput.tsx` | Add `canSend` validation, verify keyboard handler |

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/testing/chat-input-helpers.ts` | Test helpers for keyboard simulation |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `src/machines/streamingMachine.ts` | SEND handling already complete in Story 2.6 |
| `src/hooks/useStreamingMachine.ts` | Hook already provides send function |
| `src/components/chat/ChatMessageList.tsx` | Not part of send flow |

---

## Definition of Done

- [ ] Send button disabled when input is empty (AC #4)
- [ ] Send button enabled when input has text (AC #4)
- [ ] Cmd+Enter sends message on Mac (AC #1)
- [ ] Ctrl+Enter sends message on Windows/Linux (AC #1)
- [ ] Click Send button sends message (AC #1)
- [ ] Message sent to backend via state machine SEND event (AC #1)
- [ ] Input cleared immediately on send (AC #2)
- [ ] Input disabled during sending state (AC #3)
- [ ] Input disabled during streaming state (AC #3)
- [ ] Input re-enabled on complete (AC #3)
- [ ] Input re-enabled on error (AC #3)
- [ ] `npm run build` completes successfully
- [ ] `npm run typecheck` passes
- [ ] Test helpers created for keyboard simulation
- [ ] Manual testing confirms full send flow works

---

## Test Strategy

> **Note:** The test cases below are the authoritative test reference for this story. The ATDD checklist will be generated from this specification during the TEA ATDD step.

### Unit Tests (Core)

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.12-UNIT-001 | canSend is false when input is empty | #4 |
| 2.12-UNIT-002 | canSend is false when input is whitespace only | #4 |
| 2.12-UNIT-003 | canSend is true when input has text | #1, #4 |
| 2.12-UNIT-004 | canSend is false when isDisabled is true | #3, #4 |
| 2.12-UNIT-005 | handleSubmit does nothing when canSend is false | #4 |
| 2.12-UNIT-006 | handleSubmit clears input value | #2 |
| 2.12-UNIT-007 | handleSubmit calls send with SEND event | #1 |
| 2.12-UNIT-008 | handleKeyDown triggers submit on Cmd+Enter | #1 |
| 2.12-UNIT-009 | handleKeyDown triggers submit on Ctrl+Enter | #1 |
| 2.12-UNIT-010 | handleKeyDown prevents default on Cmd+Enter | #1 |
| 2.12-UNIT-011 | Button disabled when canSend is false | #4 |
| 2.12-UNIT-012 | Button enabled when canSend is true | #1 |
| 2.12-UNIT-013 | Button onClick calls handleSubmit | #1 |

### Component Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.12-COMP-001 | ChatInput renders with empty input | #4 |
| 2.12-COMP-002 | ChatInput send button disabled when empty | #4 |
| 2.12-COMP-003 | ChatInput send button enabled with text | #1 |
| 2.12-COMP-004 | ChatInput clears on submit | #2 |
| 2.12-COMP-005 | ChatInput calls onSend callback | #1 |
| 2.12-COMP-006 | ChatInput keyboard Cmd+Enter works | #1 |

### Integration Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.12-INT-001 | Full flow: type -> Cmd+Enter -> SEND event dispatched | #1 |
| 2.12-INT-002 | Full flow: type -> click Send -> SEND event dispatched | #1 |
| 2.12-INT-003 | Full flow: input clears after SEND | #2 |
| 2.12-INT-004 | Full flow: input disabled during sending state | #3 |
| 2.12-INT-005 | Full flow: button stays disabled when re-enabled with empty input | #3, #4 |

### E2E Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.12-E2E-001 | User types message and presses Cmd+Enter - message sent | #1 |
| 2.12-E2E-002 | User types message and clicks Send - message sent | #1 |
| 2.12-E2E-003 | User cannot send with empty input | #4 |
| 2.12-E2E-004 | Input clears after sending | #2 |
| 2.12-E2E-005 | Input disabled during Claude response | #3 |
| 2.12-E2E-006 | Multiple messages can be sent in sequence | #1-4 |
| 2.12-E2E-007 | Dark mode renders correctly | - |

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| Empty validation enhancement | 30 minutes |
| Keyboard handler verification | 30 minutes |
| Test helper creation | 45 minutes |
| Unit/component tests | 1.5 hours |
| Integration tests | 1 hour |
| Manual testing | 30 minutes |
| Documentation | 15 minutes |
| **Total** | 5 hours |

---

## Notes

### Story 2.11 vs 2.12 Boundary

Story 2.11 focused on **completion handling** - ensuring the input re-enables when a response finishes. It created the `ChatInput` component with the state machine integration.

Story 2.12 focuses on the **send action** - ensuring users can actually send messages via keyboard or button. This story completes the input component by adding proper validation and verifying the send flow.

Key boundary: If it's about what happens **after** sending (streaming, completion), it's 2.11. If it's about the **act of sending** (validation, keyboard, button), it's 2.12.

### Cmd+Enter vs Enter

The decision to use Cmd+Enter (not plain Enter) for sending is intentional:
- Matches Slack, Discord, and other chat applications
- Allows future enhancement for multi-line input (Textarea)
- Prevents accidental sends while typing
- Cross-platform: Cmd on Mac, Ctrl on Windows/Linux

### Empty Input Validation

The `canSend` logic uses `value.trim().length > 0` to:
- Prevent sending whitespace-only messages
- Match user expectations (empty = nothing to send)
- Provide clear visual feedback via disabled button

### Input Clearing Timing

The input clears **immediately** on submit, before the async IPC call:
- Provides instant feedback that send was registered
- Prevents accidental double-sends
- Matches standard chat application patterns

If the send fails, the user can re-type (input is re-enabled on error).

### Future Enhancements (NOT in this story)

- Character limit with counter
- Message history (up arrow for previous messages)
- Draft persistence (save incomplete messages)
- @mentions and autocomplete
- Emoji picker integration
- File attachment support
- Multi-line Textarea upgrade

---

## References

- [Source: thoughts/planning-artifacts/epics.md#Story 2.12: Chat Input Send Handler]
- [Source: thoughts/planning-artifacts/architecture.md#Tauri Command Naming (lines 1406-1410)]
- [Source: thoughts/planning-artifacts/architecture.md#State Machine Naming (line 1548)]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Keyboard Shortcuts (lines 1630-1633)]
- [Source: .ralph/story-chain.md#Story 2.6 Established]
- [Source: .ralph/story-chain.md#Story 2.11 Established]
- [Source: .ralph/story-chain.md#Story 1.15 Established]
- [Source: Story 2.6 Create Streaming State Machine]
- [Source: Story 2.11 Display ResultMessage Completion]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - expected: updated ChatInput.tsx, chat-input-helpers.ts)
