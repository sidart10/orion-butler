# Story 2.13: Message Thread Layout

Status: ready-for-dev

---

## Story Definition

| Field | Value |
|-------|-------|
| **Story ID** | 2-13-message-thread-layout |
| **Epic** | Epic 2: First Conversation |
| **Status** | ready-for-dev |
| **Priority** | High (critical for conversational UX) |
| **Created** | 2026-01-24 |

---

## User Story

As a **user**,
I want a scrollable message thread,
So that I can review conversation history.

---

## Acceptance Criteria

1. **Given** the chat column
   **When** messages are displayed
   **Then** user messages appear right-aligned with distinct styling

2. **And** assistant messages appear left-aligned with distinct styling

3. **And** the thread auto-scrolls to newest message on new content

4. **And** manual scroll-up pauses auto-scroll (resume on scroll to bottom)

---

## Design References

### From Epic Definition (thoughts/planning-artifacts/epics.md)

**Story 2.13: Message Thread Layout:**

> As a **user**,
> I want a scrollable message thread,
> So that I can review conversation history.
>
> **Acceptance Criteria:**
>
> **Given** the chat column
> **When** messages are displayed
> **Then** user messages appear right-aligned with distinct styling
> **And** assistant messages appear left-aligned with distinct styling
> **And** the thread auto-scrolls to newest message on new content
> **And** manual scroll-up pauses auto-scroll (resume on scroll to bottom)

### From UX Design Specification (thoughts/planning-artifacts/ux-design-specification.md)

**MessageBubble Component (lines 1295-1299):**

- **Purpose:** User/agent messages in conversation
- **Variants:** `user` (black, right), `agent` (white, left with header)
- **States:** Default, streaming, with-canvas
- **Features:** Streaming text, expandable steps, inline canvas slot

**Component Extensions (line 623):**

- `chat-user` / `chat-agent` - Message bubbles for conversation

**Editorial Luxury Aesthetic:**

- 0px border-radius on all elements
- Gold (#D4AF37) for accent elements
- Inter font for message content
- No emojis in UI chrome

### From Architecture (thoughts/planning-artifacts/architecture.md)

**Chat Component Structure (lines 1667-1672):**

```
components/chat/
  ChatContainer.tsx
  MessageBubble.tsx
  MessageInput.tsx
  StreamingMessage.tsx
  ToolCallCard.tsx
```

**Canvas Triggering Pattern (lines 1497-1503):**

| Agent Output | Event | Canvas Action |
|--------------|-------|---------------|
| Text tokens | `message:chunk` | Append to chat bubble |

### From Story Chain (.ralph/story-chain.md)

**Story 2.7 Established:**

- `AssistantMessage` component for Claude's responses
- `MarkdownRenderer` component for markdown formatting
- `StreamingCursor` component for streaming indication
- Editorial Luxury styling (0px border-radius, gold accents)
- `ChatMessageList` component foundation
- Prose-orion typography variant

**Story 2.12 Established:**

- `ChatInput` component with send handler
- Cmd+Enter keyboard shortcut for sending
- Input disabled during streaming
- Integration with `useStreamingMachine()` hook

**Story 1.5 Established:**

- `ChatColumn` layout structure with MessageArea + ChatInput
- Minimum width: 400px for chat area
- Scrollable message area with fixed input at bottom
- Empty state placeholder

**Story 2.6 Established:**

- `streamingMachine` with states: idle, sending, streaming, complete, error
- `useStreamingMachine()` hook with state, context, send, reset
- `StreamingContext` with text, thinking, tools, isComplete, costUsd, durationMs

### From PRD NFR Requirements

**NFR-1.1 (Performance):** First token latency p95 < 500ms
**NFR-5.1 (Usability):** Full keyboard navigation
**NFR-5.3 (Usability):** WCAG AA contrast compliance

---

## Technical Requirements

### Overview: Message Thread Architecture

This story creates the complete message thread layout with:

1. **UserMessage component** - Right-aligned user messages with distinct styling (AC #1)
2. **Message alignment** - User messages right, assistant messages left (AC #1, #2)
3. **Auto-scroll behavior** - Scroll to newest message on new content (AC #3)
4. **Smart scroll pause** - Manual scroll-up pauses auto-scroll (AC #4)
5. **MessageThread component** - Container managing message list and scroll

### Message Visual Specifications

Per UX Design Specification MessageBubble variants:

| Variant | Alignment | Background | Text Color | Border |
|---------|-----------|------------|------------|--------|
| User | Right | `--orion-fg` (dark) | `--orion-bg` (light) | None |
| Assistant | Left | `--orion-surface` (white) | `--orion-fg` (dark) | `--orion-border` |

### UserMessage Component

```typescript
// src/components/chat/UserMessage.tsx

import { cn } from '@/lib/utils';

/**
 * Props for UserMessage
 */
export interface UserMessageProps {
  /** Message content (plain text, no markdown) */
  content: string;
  /** Optional timestamp */
  timestamp?: Date;
  /** Additional class names */
  className?: string;
}

/**
 * Renders a user message with right alignment and distinct styling
 * AC #1: User messages appear right-aligned with distinct styling
 */
export function UserMessage({
  content,
  timestamp,
  className,
}: UserMessageProps) {
  return (
    <div
      className={cn(
        // AC #1: Right alignment
        'flex justify-end',
        className
      )}
    >
      <div
        className={cn(
          // Bubble styling
          'max-w-[80%] px-4 py-3',
          // AC #1: User distinct styling (black background, light text)
          'bg-orion-fg text-orion-bg',
          // Editorial Luxury: 0px border radius
          'rounded-none',
          // Typography
          'text-sm leading-relaxed font-sans'
        )}
        role="article"
        aria-label="Your message"
      >
        {content}
        {timestamp && (
          <div className="mt-1 text-xs opacity-70">
            {timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Enhanced AssistantMessage Alignment

The existing `AssistantMessage` from Story 2.7 needs alignment wrapper:

```typescript
// src/components/chat/AssistantMessageWrapper.tsx

import { AssistantMessage, AssistantMessageProps } from './AssistantMessage';
import { cn } from '@/lib/utils';

/**
 * Wrapper for AssistantMessage with left alignment
 * AC #2: Assistant messages appear left-aligned with distinct styling
 */
export function AssistantMessageWrapper(props: AssistantMessageProps) {
  return (
    <div className={cn('flex justify-start')}>
      <div className="max-w-[85%]">
        <AssistantMessage {...props} />
      </div>
    </div>
  );
}
```

### MessageThread Component with Scroll Logic

```typescript
// src/components/chat/MessageThread.tsx

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { cn } from '@/lib/utils';
import { UserMessage } from './UserMessage';
import { AssistantMessageWrapper } from './AssistantMessageWrapper';
import { useStreamingMachine } from '@/hooks/useStreamingMachine';

/**
 * Message type for the thread
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
}

/**
 * Props for MessageThread
 */
export interface MessageThreadProps {
  /** Array of messages to display */
  messages: Message[];
  /** Current streaming content (if any) */
  streamingContent?: string;
  /** Whether currently streaming */
  isStreaming?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Scrollable message thread with auto-scroll and pause behavior
 * AC #3: Auto-scrolls to newest message
 * AC #4: Manual scroll-up pauses auto-scroll
 */
export function MessageThread({
  messages,
  streamingContent,
  isStreaming = false,
  className,
}: MessageThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AC #4: Track if user has scrolled up (pause auto-scroll)
  const [isUserScrolled, setIsUserScrolled] = useState(false);
  const lastScrollTop = useRef<number>(0);
  const isNearBottom = useRef(true);

  // Threshold for "near bottom" detection (px)
  const SCROLL_THRESHOLD = 100;

  // AC #4: Detect manual scroll
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // User scrolled up
    if (scrollTop < lastScrollTop.current && distanceFromBottom > SCROLL_THRESHOLD) {
      setIsUserScrolled(true);
    }

    // User scrolled back to bottom
    if (distanceFromBottom <= SCROLL_THRESHOLD) {
      setIsUserScrolled(false);
    }

    isNearBottom.current = distanceFromBottom <= SCROLL_THRESHOLD;
    lastScrollTop.current = scrollTop;
  }, []);

  // AC #3: Auto-scroll to bottom on new content
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // AC #3: Scroll on new messages (unless user scrolled up)
  useEffect(() => {
    if (!isUserScrolled) {
      scrollToBottom();
    }
  }, [messages, streamingContent, isUserScrolled, scrollToBottom]);

  // Combine messages with streaming content for display
  const displayMessages = useMemo(() => {
    const allMessages = [...messages];

    // If streaming, add/update the streaming message
    if (isStreaming && streamingContent) {
      const lastMessage = allMessages[allMessages.length - 1];

      // If last message is from assistant and streaming, update it
      if (lastMessage?.role === 'assistant' && lastMessage.isStreaming) {
        allMessages[allMessages.length - 1] = {
          ...lastMessage,
          content: streamingContent,
        };
      } else {
        // Add new streaming message
        allMessages.push({
          id: 'streaming',
          role: 'assistant',
          content: streamingContent,
          isStreaming: true,
        });
      }
    }

    return allMessages;
  }, [messages, streamingContent, isStreaming]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className={cn(
        // Scrollable container
        'flex-1 overflow-y-auto',
        // Scroll styling (Editorial Luxury)
        'scrollbar-thin scrollbar-track-transparent',
        'scrollbar-thumb-orion-scrollbar',
        // Padding
        'px-4 py-6',
        className
      )}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Conversation messages"
    >
      {/* Message list */}
      <div className="flex flex-col gap-4 max-w-3xl mx-auto">
        {displayMessages.map((message) => (
          <div key={message.id}>
            {message.role === 'user' ? (
              // AC #1: User messages right-aligned
              <UserMessage
                content={message.content}
                timestamp={message.timestamp}
              />
            ) : (
              // AC #2: Assistant messages left-aligned
              <AssistantMessageWrapper
                content={message.content}
                isStreaming={message.isStreaming}
              />
            )}
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* AC #4: Scroll to bottom indicator (when scrolled up) */}
      {isUserScrolled && (
        <button
          onClick={() => {
            setIsUserScrolled(false);
            scrollToBottom();
          }}
          className={cn(
            'fixed bottom-24 right-8',
            'px-4 py-2',
            'bg-orion-surface border border-orion-border',
            'text-orion-fg text-sm font-medium',
            'rounded-none shadow-lg',
            'hover:bg-orion-bg transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-orion-gold focus:ring-offset-2'
          )}
          aria-label="Scroll to latest message"
        >
          New messages
        </button>
      )}
    </div>
  );
}
```

### useAutoScroll Hook (Reusable)

```typescript
// src/hooks/useAutoScroll.ts

import { useRef, useState, useCallback, useEffect } from 'react';

interface UseAutoScrollOptions {
  /** Threshold in px from bottom to consider "at bottom" */
  threshold?: number;
  /** Scroll behavior */
  behavior?: ScrollBehavior;
}

interface UseAutoScrollReturn {
  /** Ref to attach to scrollable container */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Ref to attach to end marker element */
  endMarkerRef: React.RefObject<HTMLDivElement>;
  /** Whether user has manually scrolled up */
  isUserScrolled: boolean;
  /** Scroll event handler */
  handleScroll: () => void;
  /** Programmatically scroll to bottom */
  scrollToBottom: () => void;
  /** Resume auto-scroll (user explicitly wants to go back to bottom) */
  resumeAutoScroll: () => void;
}

/**
 * Hook for auto-scrolling with manual pause behavior
 * AC #3: Auto-scroll to newest message
 * AC #4: Manual scroll-up pauses auto-scroll
 */
export function useAutoScroll({
  threshold = 100,
  behavior = 'smooth',
}: UseAutoScrollOptions = {}): UseAutoScrollReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const endMarkerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolled, setIsUserScrolled] = useState(false);
  const lastScrollTop = useRef<number>(0);

  // AC #4: Detect manual scroll
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // User scrolled up
    if (
      scrollTop < lastScrollTop.current &&
      distanceFromBottom > threshold
    ) {
      setIsUserScrolled(true);
    }

    // User scrolled back to bottom
    if (distanceFromBottom <= threshold) {
      setIsUserScrolled(false);
    }

    lastScrollTop.current = scrollTop;
  }, [threshold]);

  // AC #3: Scroll to bottom
  const scrollToBottom = useCallback(() => {
    endMarkerRef.current?.scrollIntoView({ behavior });
  }, [behavior]);

  // Resume auto-scroll
  const resumeAutoScroll = useCallback(() => {
    setIsUserScrolled(false);
    scrollToBottom();
  }, [scrollToBottom]);

  return {
    containerRef,
    endMarkerRef,
    isUserScrolled,
    handleScroll,
    scrollToBottom,
    resumeAutoScroll,
  };
}
```

### Integration with ChatColumn

Update ChatColumn from Story 1.5 to use MessageThread:

```typescript
// Updates to src/components/layout/ChatColumn.tsx

import { MessageThread } from '@/components/chat/MessageThread';
import { ChatInput } from '@/components/chat/ChatInput';
import { useStreamingMachine } from '@/hooks/useStreamingMachine';

export function ChatColumn() {
  const { state, context } = useStreamingMachine();

  // Get messages from message store (to be implemented)
  const messages = useMessageStore((s) => s.messages);

  const isStreaming = state === 'streaming';

  return (
    <div className="flex flex-col flex-1 min-w-[400px]">
      {/* AC #1, #2, #3, #4: Message thread with scroll behavior */}
      <MessageThread
        messages={messages}
        streamingContent={context.text}
        isStreaming={isStreaming}
      />

      {/* Chat input (from Story 2.12) */}
      <ChatInput />
    </div>
  );
}
```

---

## Implementation Tasks

- [ ] Task 1: Create UserMessage component (AC: #1)
  - [ ] 1.1: Create `src/components/chat/UserMessage.tsx`
  - [ ] 1.2: Implement right alignment with flex justify-end
  - [ ] 1.3: Apply distinct styling (dark bg, light text, 0px radius)
  - [ ] 1.4: Add ARIA attributes for accessibility
  - [ ] 1.5: Export component and types

- [ ] Task 2: Create AssistantMessageWrapper component (AC: #2)
  - [ ] 2.1: Create `src/components/chat/AssistantMessageWrapper.tsx`
  - [ ] 2.2: Wrap AssistantMessage with left alignment
  - [ ] 2.3: Apply max-width constraint (85%)
  - [ ] 2.4: Export component

- [ ] Task 3: Create useAutoScroll hook (AC: #3, #4)
  - [ ] 3.1: Create `src/hooks/useAutoScroll.ts`
  - [ ] 3.2: Implement containerRef and endMarkerRef
  - [ ] 3.3: Implement scroll position tracking
  - [ ] 3.4: Implement isUserScrolled state
  - [ ] 3.5: Implement scrollToBottom function
  - [ ] 3.6: Implement resumeAutoScroll function
  - [ ] 3.7: Export hook and types

- [ ] Task 4: Create MessageThread component (AC: #1, #2, #3, #4)
  - [ ] 4.1: Create `src/components/chat/MessageThread.tsx`
  - [ ] 4.2: Implement scrollable container with styling
  - [ ] 4.3: Render messages based on role (user/assistant)
  - [ ] 4.4: Integrate useAutoScroll hook
  - [ ] 4.5: Handle streaming content display
  - [ ] 4.6: Add "New messages" button for scroll-up state
  - [ ] 4.7: Add ARIA live region for accessibility
  - [ ] 4.8: Export component and types

- [ ] Task 5: Define Message type (AC: #1, #2)
  - [ ] 5.1: Create `src/types/message.ts` with Message interface
  - [ ] 5.2: Include id, role, content, timestamp, isStreaming fields
  - [ ] 5.3: Export types

- [ ] Task 6: Update ChatColumn integration
  - [ ] 6.1: Import MessageThread in ChatColumn
  - [ ] 6.2: Connect to streaming machine context
  - [ ] 6.3: Pass messages and streaming state to MessageThread
  - [ ] 6.4: Verify layout with ChatInput

- [ ] Task 7: Update barrel exports
  - [ ] 7.1: Update `src/components/chat/index.ts`
  - [ ] 7.2: Export UserMessage, AssistantMessageWrapper, MessageThread
  - [ ] 7.3: Update `src/hooks/index.ts` with useAutoScroll

- [ ] Task 8: Manual testing
  - [ ] 8.1: Verify user messages display right-aligned (AC #1)
  - [ ] 8.2: Verify assistant messages display left-aligned (AC #2)
  - [ ] 8.3: Verify auto-scroll on new messages (AC #3)
  - [ ] 8.4: Verify scroll-up pauses auto-scroll (AC #4)
  - [ ] 8.5: Verify scroll to bottom resumes auto-scroll (AC #4)
  - [ ] 8.6: Verify "New messages" button appears when scrolled up
  - [ ] 8.7: Test dark mode appearance
  - [ ] 8.8: Test keyboard navigation
  - [ ] 8.9: Test with VoiceOver (screen reader)

---

## Dependencies

### Requires (from prior stories)

| Story | What It Provides | Why Needed |
|-------|------------------|------------|
| Story 2.7 | `AssistantMessage`, `MarkdownRenderer` | For assistant message rendering |
| Story 2.6 | `useStreamingMachine()` hook | For streaming state and context |
| Story 2.12 | `ChatInput` component | For message input at bottom |
| Story 1.5 | `ChatColumn` layout | Container for message thread |
| Story 1.3 | `--orion-*` design tokens | For colors and styling |
| Story 1.17 | VoiceOver patterns | ARIA live regions |

### Provides For (future stories)

| Story | What This Story Provides |
|-------|--------------------------|
| Story 2.14 | MessageThread for latency measurement UI |
| Story 2.15 | Error state display in thread |
| Story 2.16 | Retry UI context |
| Story 3.x | Message persistence integration |
| Epic 8+ | Canvas inline rendering context |

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Screen reader support** | `role="log"`, `aria-live="polite"` on thread |
| **Message roles** | `role="article"`, `aria-label` on each message |
| **Live updates** | `aria-relevant="additions"` for new messages |
| **Scroll button** | `aria-label="Scroll to latest message"` |
| **Focus visible** | Focus ring on scroll button |
| **Keyboard navigation** | Tab to scroll button when visible |

---

## File Locations

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/chat/UserMessage.tsx` | Right-aligned user message |
| `src/components/chat/AssistantMessageWrapper.tsx` | Left-aligned assistant wrapper |
| `src/components/chat/MessageThread.tsx` | Scrollable message container |
| `src/hooks/useAutoScroll.ts` | Auto-scroll with pause behavior |
| `src/types/message.ts` | Message type definition |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/chat/index.ts` | Add exports for new components |
| `src/components/layout/ChatColumn.tsx` | Integrate MessageThread |
| `src/hooks/index.ts` | Export useAutoScroll |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `src/components/chat/AssistantMessage.tsx` | Story 2.7 complete; wrap don't modify |
| `src/components/chat/MarkdownRenderer.tsx` | Story 2.7 complete |
| `src/components/chat/ChatInput.tsx` | Story 2.12 complete |
| `src/machines/streamingMachine.ts` | Story 2.6 complete |

---

## Definition of Done

- [ ] UserMessage component exists with right alignment (AC #1)
- [ ] User messages have dark background, light text (AC #1)
- [ ] AssistantMessageWrapper provides left alignment (AC #2)
- [ ] Assistant messages retain Story 2.7 styling (AC #2)
- [ ] MessageThread container is scrollable
- [ ] Auto-scroll works when new messages arrive (AC #3)
- [ ] Manual scroll-up pauses auto-scroll (AC #4)
- [ ] Scrolling back to bottom resumes auto-scroll (AC #4)
- [ ] "New messages" indicator appears when scrolled up
- [ ] useAutoScroll hook is reusable
- [ ] Message type interface is defined
- [ ] All messages have 0px border radius (Editorial Luxury)
- [ ] ARIA live region announces new messages
- [ ] `npm run build` completes successfully
- [ ] `npm run typecheck` passes
- [ ] Manual testing confirms scroll behavior

---

## Test Strategy

> **Note:** The summary below lists core test cases. The authoritative test list will be in the ATDD checklist (`atdd-checklist-2-13-message-thread-layout.md`).

### Unit Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.13-UNIT-001 | UserMessage renders with right alignment | #1 |
| 2.13-UNIT-002 | UserMessage has dark background class | #1 |
| 2.13-UNIT-003 | UserMessage has light text class | #1 |
| 2.13-UNIT-004 | UserMessage has 0px border radius | #1 |
| 2.13-UNIT-005 | UserMessage renders content correctly | #1 |
| 2.13-UNIT-006 | UserMessage renders timestamp when provided | #1 |
| 2.13-UNIT-007 | UserMessage has role="article" | #1 |
| 2.13-UNIT-008 | AssistantMessageWrapper has left alignment | #2 |
| 2.13-UNIT-009 | AssistantMessageWrapper constrains width | #2 |
| 2.13-UNIT-010 | AssistantMessageWrapper passes props to AssistantMessage | #2 |
| 2.13-UNIT-011 | MessageThread has scrollable container | #3 |
| 2.13-UNIT-012 | MessageThread renders user messages | #1 |
| 2.13-UNIT-013 | MessageThread renders assistant messages | #2 |
| 2.13-UNIT-014 | MessageThread has aria-live="polite" | #3 |
| 2.13-UNIT-015 | MessageThread has role="log" | #3 |
| 2.13-UNIT-016 | useAutoScroll returns containerRef | #3 |
| 2.13-UNIT-017 | useAutoScroll returns endMarkerRef | #3 |
| 2.13-UNIT-018 | useAutoScroll returns isUserScrolled false initially | #4 |
| 2.13-UNIT-019 | useAutoScroll detects scroll up | #4 |
| 2.13-UNIT-020 | useAutoScroll resets at bottom | #4 |

### Component Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.13-COMP-001 | MessageThread renders mixed messages correctly | #1, #2 |
| 2.13-COMP-002 | MessageThread shows streaming message | #2 |
| 2.13-COMP-003 | MessageThread scroll button appears when scrolled | #4 |
| 2.13-COMP-004 | MessageThread scroll button click scrolls to bottom | #4 |
| 2.13-COMP-005 | ChatColumn integrates MessageThread | #1, #2, #3, #4 |

### Integration Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.13-INT-001 | Full flow: new message triggers auto-scroll | #3 |
| 2.13-INT-002 | Full flow: scroll up pauses, scroll down resumes | #4 |
| 2.13-INT-003 | Full flow: streaming content scrolls thread | #3 |

### E2E Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.13-E2E-001 | User sends message, sees it right-aligned | #1 |
| 2.13-E2E-002 | User sees assistant response left-aligned | #2 |
| 2.13-E2E-003 | Thread auto-scrolls on new messages | #3 |
| 2.13-E2E-004 | Scrolling up shows "New messages" button | #4 |
| 2.13-E2E-005 | Clicking button scrolls to bottom | #4 |
| 2.13-E2E-006 | Dark mode renders correctly | #1, #2 |

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| UserMessage component | 1 hour |
| AssistantMessageWrapper | 30 minutes |
| useAutoScroll hook | 1.5 hours |
| MessageThread component | 2.5 hours |
| Message types | 30 minutes |
| ChatColumn integration | 1 hour |
| Testing | 2.5 hours |
| Documentation | 30 minutes |
| **Total** | 10 hours |

---

## Notes

### Scroll Behavior Design Decisions

**Auto-scroll threshold: 100px**
- Within 100px of bottom = considered "at bottom"
- Allows small overscroll without triggering pause

**Scroll behavior: smooth**
- Uses native smooth scrolling for performance
- Respects `prefers-reduced-motion` via browser

**"New messages" button position: fixed bottom-right**
- Consistent with chat app patterns (Slack, Discord)
- Does not obstruct message reading
- Easy tap/click target

### Message Alignment Rationale

**User messages: Right-aligned, dark**
- Standard chat convention (user on right)
- Dark background for visual distinction
- Creates clear visual separation from assistant

**Assistant messages: Left-aligned, light**
- Standard chat convention (other party on left)
- Light background with border for subtlety
- Header shows "Orion" for clarity

### Editorial Luxury Considerations

- 0px border radius on all message bubbles
- Gold accent for the "New messages" button focus ring
- Inter font throughout
- No emojis or decorative elements
- Generous whitespace between messages (gap-4 = 16px)

### Future Enhancements (NOT in this story)

- Message grouping by time (10min intervals)
- Date separators ("Today", "Yesterday")
- Message reactions
- Message editing
- Message deletion
- Copy message action
- Message search
- Virtualized list for performance (1000+ messages)
- Message persistence to database

---

## References

- [Source: thoughts/planning-artifacts/epics.md#Story 2.13: Message Thread Layout]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#MessageBubble (lines 1295-1299)]
- [Source: thoughts/planning-artifacts/architecture.md#Chat Components (lines 1667-1672)]
- [Source: .ralph/story-chain.md#Story 2.7 (AssistantMessage)]
- [Source: .ralph/story-chain.md#Story 2.12 (ChatInput)]
- [Source: .ralph/story-chain.md#Story 1.5 (ChatColumn)]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - expected: UserMessage.tsx, AssistantMessageWrapper.tsx, MessageThread.tsx, useAutoScroll.ts, message.ts)
