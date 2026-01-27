# Story 2.7: Render TextBlock Messages

Status: drafted

---

## Story Definition

| Field | Value |
|-------|-------|
| **Story ID** | 2-7-render-textblock-messages |
| **Epic** | Epic 2: First Conversation |
| **Status** | drafted |
| **Priority** | Critical (first user-visible streaming output) |
| **Created** | 2026-01-24 |

---

## User Story

As a **user**,
I want to see Claude's text responses stream in real-time,
So that I get immediate feedback.

---

## Acceptance Criteria

1. **Given** a streaming response is active
   **When** a `TextBlock` event arrives
   **Then** text appends to the current assistant message bubble

2. **And** a typewriter effect displays characters smoothly (configurable speed)

3. **And** text supports markdown rendering (bold, italic, code, links)

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

**Loading States (lines 1558-1568):**

```typescript
**Loading States:**

| Pattern | Usage |
|---------|-------|
| Boolean (`isLoading`) | Simple operations |
| Status enum | When need idle/loading/success/error |
| XState matching | Complex multi-step flows |
```

### From UX Design Specification (thoughts/planning-artifacts/ux-design-specification.md)

**Animation Behavior (lines 944-950):**

- All animations are **non-blocking** - they never delay content rendering
- Streaming text renders immediately; animations run in parallel
- First token appears within 500ms target regardless of animation state
- User can interact during animations (no "wait for animation" states)

**MessageBubble Component (lines 1294-1298):**

- **Purpose:** User/agent messages in conversation
- **Variants:** `user` (black, right), `agent` (white, left with header)
- **States:** Default, streaming, with-canvas

**Editorial Luxury Aesthetic:**

- Font: Inter for body text (not Playfair for message content)
- Color: `--orion-fg` for text on `--orion-surface` background
- Border radius: 0px (sharp corners)
- Gold accent (#D4AF37) for streaming cursor/indicator

### From Story Chain (.ralph/story-chain.md)

**Story 2.6 Established:**

- `streamingMachine` with states: idle, sending, streaming, complete, error
- `useStreamingMachine()` hook returning: state, context, send, reset, isLoading, isError, isComplete
- `context.text` contains accumulated text content
- `context.thinking` contains accumulated thinking content (separate from text)
- Tool tracking in `context.tools` Map

**Story 2.5 Established:**

- `StreamState` interface with: text, thinking, tools, isComplete, costUsd, durationMs
- RAF batching pattern for rapid state updates
- Event correlation with requestId

**Epic 1 Established:**

- Design tokens (`--orion-*`) for colors, spacing, animation
- 0px border-radius for Editorial Luxury aesthetic
- Font variables: `--font-inter`, `--font-playfair`
- Animation timing: 200ms entrance, 150ms exit, 100ms state change

**Notes for Story 2.7 from Story 2.6:**

> - Use `useStreamingMachine()` hook to get state and context
> - Check `state === 'streaming'` or `state === 'complete'` before rendering text
> - Access `context.text` for accumulated text content
> - Implement typewriter effect with configurable speed
> - Support markdown rendering (bold, italic, code, links)
> - Use `isLoading` to show streaming cursor
> - Consider character-by-character display decoupled from event arrival

### From PRD NFR Requirements

**NFR-1.1 (Performance):** First token latency p95 < 500ms
**NFR-5.1 (Usability):** Full keyboard navigation
**NFR-5.3 (Usability):** WCAG AA contrast compliance

---

## Technical Requirements

### AssistantMessage Component

The `AssistantMessage` component renders Claude's response with streaming support and markdown formatting.

```
+------------------------------------------+
| Orion                                    |  <- Agent header (optional)
+------------------------------------------+
| Lorem ipsum dolor sit amet, **bold**     |  <- Streamed text with markdown
| text and `inline code` and more...       |
|                                          |
| ```javascript                            |  <- Code block
| const x = 42;                            |
| ```                                      |
|                                          |
| - List item one                          |  <- Lists
| - List item two                          |
|                                    |     |  <- Streaming cursor when active
+------------------------------------------+
```

### Component Architecture

```typescript
// src/components/chat/AssistantMessage.tsx

import { useMemo, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from './MarkdownRenderer';
import { StreamingCursor } from './StreamingCursor';

/**
 * Props for AssistantMessage
 * AC #1: Receives text content
 * AC #2: Supports configurable typewriter speed
 */
export interface AssistantMessageProps {
  /** Raw text content (may include markdown) */
  content: string;
  /** Whether currently streaming (shows cursor) */
  isStreaming?: boolean;
  /** Typewriter effect speed (chars/sec, 0 = instant) */
  typewriterSpeed?: number;
  /** Additional class names */
  className?: string;
}

/**
 * Renders an assistant message with streaming support
 * AC #1: Text appends to message bubble
 * AC #2: Typewriter effect for smooth display
 * AC #3: Markdown rendering
 */
export function AssistantMessage({
  content,
  isStreaming = false,
  typewriterSpeed = 0, // Default: instant (no artificial delay)
  className,
}: AssistantMessageProps) {
  // Track displayed character count for typewriter effect
  const [displayedLength, setDisplayedLength] = useState(content.length);
  const frameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  // AC #2: Typewriter effect (configurable, disabled by default)
  useEffect(() => {
    // If typewriter disabled or content fully displayed, sync immediately
    if (typewriterSpeed === 0 || displayedLength >= content.length) {
      setDisplayedLength(content.length);
      return;
    }

    // Animate display length toward content length
    const msPerChar = 1000 / typewriterSpeed;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastUpdateRef.current;

      if (elapsed >= msPerChar) {
        const charsToAdd = Math.floor(elapsed / msPerChar);
        setDisplayedLength((prev) =>
          Math.min(prev + charsToAdd, content.length)
        );
        lastUpdateRef.current = timestamp;
      }

      if (displayedLength < content.length) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    lastUpdateRef.current = performance.now();
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [content.length, displayedLength, typewriterSpeed]);

  // Reset displayed length when content grows (new streaming data)
  useEffect(() => {
    if (typewriterSpeed === 0) {
      setDisplayedLength(content.length);
    }
  }, [content, typewriterSpeed]);

  // AC #1: Displayed content (may be partial if typewriter active)
  const displayedContent = useMemo(
    () => content.slice(0, displayedLength),
    [content, displayedLength]
  );

  return (
    <div
      className={cn(
        // AC #3: Editorial Luxury styling
        'relative w-full max-w-prose',
        'bg-orion-surface border border-orion-border',
        'p-4', // 16px padding
        'rounded-none', // 0px border radius per design system
        className
      )}
      role="article"
      aria-label="Assistant message"
    >
      {/* Agent header */}
      <div className="mb-2 text-sm font-medium text-orion-fg-muted">
        Orion
      </div>

      {/* AC #3: Markdown rendered content */}
      <div className="prose prose-orion">
        <MarkdownRenderer content={displayedContent} />
      </div>

      {/* AC #2: Streaming cursor (visible when streaming) */}
      {isStreaming && (
        <StreamingCursor className="inline-block ml-0.5" />
      )}
    </div>
  );
}
```

### MarkdownRenderer Component

```typescript
// src/components/chat/MarkdownRenderer.tsx

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

/**
 * Props for MarkdownRenderer
 */
export interface MarkdownRendererProps {
  /** Markdown content to render */
  content: string;
  /** Additional class names */
  className?: string;
}

/**
 * Renders markdown with Orion's Editorial Luxury styling
 * AC #3: Supports bold, italic, code, links
 */
export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className={cn('text-orion-fg leading-relaxed', className)}
      remarkPlugins={[remarkGfm]}
      components={{
        // AC #3: Bold text
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),

        // AC #3: Italic text
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),

        // AC #3: Inline code
        code: ({ inline, className, children, ...props }) => {
          if (inline) {
            return (
              <code
                className={cn(
                  'px-1.5 py-0.5',
                  'bg-orion-bg font-mono text-sm',
                  'rounded-none' // Editorial Luxury
                )}
                {...props}
              >
                {children}
              </code>
            );
          }

          // Code blocks (fenced)
          return (
            <code
              className={cn(
                'block p-4 my-2',
                'bg-orion-bg font-mono text-sm',
                'overflow-x-auto',
                'rounded-none border border-orion-border',
                className
              )}
              {...props}
            >
              {children}
            </code>
          );
        },

        // AC #3: Links
        a: ({ href, children }) => (
          <a
            href={href}
            className={cn(
              'text-orion-gold underline',
              'hover:text-orion-gold-muted',
              'focus:outline-none focus:ring-2 focus:ring-orion-gold focus:ring-offset-2'
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),

        // Paragraphs
        p: ({ children }) => (
          <p className="mb-3 last:mb-0">{children}</p>
        ),

        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-3 space-y-1">
            {children}
          </ul>
        ),

        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-3 space-y-1">
            {children}
          </ol>
        ),

        li: ({ children }) => (
          <li className="text-orion-fg">{children}</li>
        ),

        // Headings (within message - rare but supported)
        h1: ({ children }) => (
          <h1 className="text-xl font-semibold mb-2">{children}</h1>
        ),

        h2: ({ children }) => (
          <h2 className="text-lg font-semibold mb-2">{children}</h2>
        ),

        h3: ({ children }) => (
          <h3 className="text-base font-semibold mb-2">{children}</h3>
        ),

        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote
            className={cn(
              'pl-4 border-l-2 border-orion-gold',
              'text-orion-fg-muted italic'
            )}
          >
            {children}
          </blockquote>
        ),

        // Horizontal rule
        hr: () => (
          <hr className="my-4 border-t border-orion-border" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
```

### StreamingCursor Component

```typescript
// src/components/chat/StreamingCursor.tsx

import { cn } from '@/lib/utils';

/**
 * Props for StreamingCursor
 */
export interface StreamingCursorProps {
  /** Additional class names */
  className?: string;
}

/**
 * Animated cursor shown during streaming
 * AC #2: Visual feedback that more content is coming
 */
export function StreamingCursor({ className }: StreamingCursorProps) {
  return (
    <span
      className={cn(
        'w-2 h-4',
        'bg-orion-gold',
        'animate-pulse',
        className
      )}
      aria-hidden="true"
    />
  );
}
```

### Hook Integration

```typescript
// src/components/chat/ChatMessageList.tsx

import { useStreamingMachine } from '@/hooks/useStreamingMachine';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';

/**
 * Renders the chat message list with streaming support
 * Uses state machine from Story 2.6
 */
export function ChatMessageList() {
  const { state, context, isLoading } = useStreamingMachine();

  // Determine if we should show the assistant message
  const showAssistantMessage =
    state === 'streaming' ||
    state === 'complete' ||
    (state === 'error' && context.text.length > 0);

  // AC #1: Show streaming message when text available
  const isCurrentlyStreaming = state === 'streaming';

  return (
    <div
      className="flex flex-col gap-4 p-4"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {/* Previous messages would be rendered here */}

      {/* Current assistant response */}
      {showAssistantMessage && context.text && (
        <AssistantMessage
          content={context.text}
          isStreaming={isCurrentlyStreaming}
          typewriterSpeed={0} // Instant by default, user configurable
        />
      )}
    </div>
  );
}
```

### Tailwind Configuration Extensions

```typescript
// tailwind.config.ts (additions to existing config)

// Add prose-orion variant for markdown styling
const config = {
  theme: {
    extend: {
      typography: {
        orion: {
          css: {
            '--tw-prose-body': 'var(--orion-fg)',
            '--tw-prose-headings': 'var(--orion-fg)',
            '--tw-prose-lead': 'var(--orion-fg)',
            '--tw-prose-links': 'var(--orion-gold)',
            '--tw-prose-bold': 'var(--orion-fg)',
            '--tw-prose-counters': 'var(--orion-fg-muted)',
            '--tw-prose-bullets': 'var(--orion-fg-muted)',
            '--tw-prose-hr': 'var(--orion-border)',
            '--tw-prose-quotes': 'var(--orion-fg)',
            '--tw-prose-quote-borders': 'var(--orion-gold)',
            '--tw-prose-captions': 'var(--orion-fg-muted)',
            '--tw-prose-code': 'var(--orion-fg)',
            '--tw-prose-pre-code': 'var(--orion-fg)',
            '--tw-prose-pre-bg': 'var(--orion-bg)',
            '--tw-prose-th-borders': 'var(--orion-border)',
            '--tw-prose-td-borders': 'var(--orion-border)',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
```

---

## Implementation Tasks

- [ ] Task 1: Install markdown dependencies (AC: #3)
  - [ ] 1.1: Run `npm install react-markdown remark-gfm`
  - [ ] 1.2: Run `npm install @tailwindcss/typography`
  - [ ] 1.3: Verify package.json updated

- [ ] Task 2: Create MarkdownRenderer component (AC: #3)
  - [ ] 2.1: Create `src/components/chat/` directory if not exists
  - [ ] 2.2: Create `src/components/chat/MarkdownRenderer.tsx`
  - [ ] 2.3: Import react-markdown and remark-gfm
  - [ ] 2.4: Implement custom renderers for strong, em, code, a (AC #3)
  - [ ] 2.5: Implement paragraph, list, blockquote renderers
  - [ ] 2.6: Apply Orion design tokens (0px radius, gold links)
  - [ ] 2.7: Export component and types

- [ ] Task 3: Create StreamingCursor component (AC: #2)
  - [ ] 3.1: Create `src/components/chat/StreamingCursor.tsx`
  - [ ] 3.2: Implement gold pulsing cursor
  - [ ] 3.3: Add aria-hidden for accessibility
  - [ ] 3.4: Export component

- [ ] Task 4: Create AssistantMessage component (AC: #1, #2, #3)
  - [ ] 4.1: Create `src/components/chat/AssistantMessage.tsx`
  - [ ] 4.2: Implement content prop to receive text (AC #1)
  - [ ] 4.3: Implement typewriter effect with configurable speed (AC #2)
  - [ ] 4.4: Integrate MarkdownRenderer (AC #3)
  - [ ] 4.5: Integrate StreamingCursor when isStreaming
  - [ ] 4.6: Apply Editorial Luxury styling (0px radius, surface bg)
  - [ ] 4.7: Add role="article" and aria-label for accessibility
  - [ ] 4.8: Export component and types

- [ ] Task 5: Update Tailwind config
  - [ ] 5.1: Add @tailwindcss/typography to plugins
  - [ ] 5.2: Add prose-orion variant with Orion design tokens
  - [ ] 5.3: Verify build completes with new config

- [ ] Task 6: Create barrel exports
  - [ ] 6.1: Create `src/components/chat/index.ts`
  - [ ] 6.2: Export AssistantMessage, MarkdownRenderer, StreamingCursor

- [ ] Task 7: Integration with state machine
  - [ ] 7.1: Create `src/components/chat/ChatMessageList.tsx` (or update existing)
  - [ ] 7.2: Import useStreamingMachine from Story 2.6
  - [ ] 7.3: Render AssistantMessage when context.text has content
  - [ ] 7.4: Pass isStreaming based on state === 'streaming'
  - [ ] 7.5: Add aria-live="polite" for screen reader support

- [ ] Task 8: Manual testing
  - [ ] 8.1: Verify text streams and appends correctly (AC #1)
  - [ ] 8.2: Verify typewriter effect works when enabled (AC #2)
  - [ ] 8.3: Verify markdown renders correctly:
    - [ ] Bold text (**bold**)
    - [ ] Italic text (*italic*)
    - [ ] Inline code (`code`)
    - [ ] Code blocks (```)
    - [ ] Links [text](url)
    - [ ] Lists (ordered and unordered)
    - [ ] Blockquotes
  - [ ] 8.4: Verify streaming cursor appears during streaming
  - [ ] 8.5: Verify cursor disappears when complete
  - [ ] 8.6: Verify 0px border radius on message bubble
  - [ ] 8.7: Verify gold link color
  - [ ] 8.8: Test dark mode appearance

---

## Dependencies

### Requires (from prior stories)

| Story | What It Provides | Why Needed |
|-------|------------------|------------|
| Story 2.6 | `useStreamingMachine()` hook | To get `state`, `context.text`, `isLoading` |
| Story 2.6 | `StreamingContext` with `text` field | To access accumulated text content |
| Story 1.3 | `--orion-*` design tokens | For colors, spacing, styling |
| Story 1.3 | `--orion-gold` color token | For links and streaming cursor |
| Story 1.5 | ChatColumn/MessageArea | Container for message rendering |

### Provides For (future stories)

| Story | What This Story Provides |
|-------|--------------------------|
| Story 2.8 | Pattern for rendering thinking blocks (similar structure) |
| Story 2.9 | ToolUseBlock can use same markdown renderer |
| Story 2.10 | Completion state can display final message |
| Story 2.11 | Error messages can use similar styling |
| All Epic 2 UI | Base message rendering component |

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Screen reader support** | `role="article"`, `aria-label="Assistant message"` |
| **Live updates** | Parent container has `aria-live="polite"` |
| **Focus visible** | Links have visible focus ring |
| **Color contrast** | Text meets WCAG AA (4.5:1 ratio) via design tokens |
| **Reduced motion** | Cursor animation respects `prefers-reduced-motion` |
| **Keyboard navigation** | Links focusable via Tab |

---

## File Locations

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/chat/AssistantMessage.tsx` | Main message component with streaming |
| `src/components/chat/MarkdownRenderer.tsx` | Markdown to React rendering |
| `src/components/chat/StreamingCursor.tsx` | Animated cursor during streaming |
| `src/components/chat/ChatMessageList.tsx` | Message list with state machine integration |
| `src/components/chat/index.ts` | Barrel exports for chat components |

### Files to Modify

| File | Changes |
|------|---------|
| `tailwind.config.ts` | Add @tailwindcss/typography plugin, prose-orion variant |
| `package.json` | Add react-markdown, remark-gfm, @tailwindcss/typography |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `src/machines/streamingMachine.ts` | Machine from Story 2.6 is complete |
| `src/hooks/useStreamingMachine.ts` | Hook from Story 2.6 is complete |
| `src/lib/ipc/*` | IPC layer from Story 2.4 is complete |
| `src/hooks/useStreamListener.ts` | Hook from Story 2.5 is complete |

---

## Definition of Done

- [ ] AssistantMessage component exists and renders text content (AC #1)
- [ ] Text appends correctly as streaming events arrive (AC #1)
- [ ] Typewriter effect works with configurable speed (AC #2)
- [ ] Default typewriter speed is 0 (instant) for performance
- [ ] StreamingCursor appears during streaming state
- [ ] StreamingCursor disappears on complete/error states
- [ ] Markdown rendering supports bold text (AC #3)
- [ ] Markdown rendering supports italic text (AC #3)
- [ ] Markdown rendering supports inline code (AC #3)
- [ ] Markdown rendering supports code blocks (AC #3)
- [ ] Markdown rendering supports links (AC #3)
- [ ] Markdown rendering supports lists (ordered and unordered)
- [ ] Message bubble has 0px border radius (Editorial Luxury)
- [ ] Links use gold color from design tokens
- [ ] Tailwind typography plugin configured with prose-orion variant
- [ ] react-markdown and remark-gfm packages installed
- [ ] `npm run build` completes successfully
- [ ] `npm run typecheck` passes
- [ ] Manual testing confirms streaming display works
- [ ] Component is accessible (ARIA labels, live regions)

---

## Test Strategy

> **Note:** The summary below lists core test cases. The authoritative test list will be in the ATDD checklist (`atdd-checklist-2-7-render-textblock-messages.md`) which expands these to 40+ unit tests including edge cases.

### Unit Tests (Core)

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.7-UNIT-001 | AssistantMessage renders provided content | #1 |
| 2.7-UNIT-002 | AssistantMessage appends content as it grows | #1 |
| 2.7-UNIT-003 | AssistantMessage shows streaming cursor when isStreaming=true | #2 |
| 2.7-UNIT-004 | AssistantMessage hides cursor when isStreaming=false | #2 |
| 2.7-UNIT-005 | Typewriter effect displays chars progressively when speed > 0 | #2 |
| 2.7-UNIT-006 | Typewriter effect instant when speed = 0 | #2 |
| 2.7-UNIT-007 | MarkdownRenderer renders **bold** as strong element | #3 |
| 2.7-UNIT-008 | MarkdownRenderer renders *italic* as em element | #3 |
| 2.7-UNIT-009 | MarkdownRenderer renders `code` as code element | #3 |
| 2.7-UNIT-010 | MarkdownRenderer renders fenced code blocks | #3 |
| 2.7-UNIT-011 | MarkdownRenderer renders [links](url) with gold color | #3 |
| 2.7-UNIT-012 | MarkdownRenderer renders unordered lists | #3 |
| 2.7-UNIT-013 | MarkdownRenderer renders ordered lists | #3 |
| 2.7-UNIT-014 | MarkdownRenderer renders blockquotes | #3 |
| 2.7-UNIT-015 | StreamingCursor has pulse animation class | #2 |
| 2.7-UNIT-016 | StreamingCursor has aria-hidden="true" | #2 |
| 2.7-UNIT-017 | AssistantMessage has role="article" | #1 |
| 2.7-UNIT-018 | AssistantMessage has aria-label | #1 |
| 2.7-UNIT-019 | Message bubble has 0px border radius | #1 |
| 2.7-UNIT-020 | Links open in new tab (target="_blank") | #3 |

### Component Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.7-COMP-001 | ChatMessageList renders AssistantMessage when state is streaming | #1 |
| 2.7-COMP-002 | ChatMessageList renders AssistantMessage when state is complete | #1 |
| 2.7-COMP-003 | ChatMessageList passes isStreaming=true during streaming state | #2 |
| 2.7-COMP-004 | ChatMessageList passes isStreaming=false during complete state | #2 |
| 2.7-COMP-005 | ChatMessageList has aria-live="polite" | #1 |

### Integration Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.7-INT-001 | Full flow: text chunk events render in message bubble | #1, #3 |
| 2.7-INT-002 | Full flow: streaming cursor appears then disappears | #2 |
| 2.7-INT-003 | Full flow: markdown renders correctly in streamed content | #3 |

### E2E Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.7-E2E-001 | User sees text stream in real-time | #1 |
| 2.7-E2E-002 | Streaming cursor visible during response | #2 |
| 2.7-E2E-003 | Markdown formatting displays correctly | #3 |
| 2.7-E2E-004 | Message persists after streaming completes | #1 |
| 2.7-E2E-005 | Dark mode renders correctly | #1, #3 |

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| Markdown dependencies setup | 30 minutes |
| MarkdownRenderer component | 1.5 hours |
| StreamingCursor component | 30 minutes |
| AssistantMessage component | 2 hours |
| ChatMessageList integration | 1 hour |
| Tailwind config updates | 30 minutes |
| Testing | 2.5 hours |
| Documentation | 30 minutes |
| **Total** | 9 hours |

---

## Notes

### Typewriter Effect Decision

The typewriter effect is **disabled by default** (speed = 0) for performance and UX reasons:

1. **NFR-1.1 compliance**: First token must appear within 500ms
2. **User preference**: Power users prefer instant display
3. **Streaming is already animated**: Text chunks arrive progressively from SDK

The typewriter effect can be enabled via user preference for users who prefer the visual effect.

### Markdown Library Choice

**react-markdown + remark-gfm** chosen because:

1. Well-maintained with React 19 support
2. GFM (GitHub Flavored Markdown) for tables, strikethrough, task lists
3. Custom component renderers for design system integration
4. Tree-shakeable bundle size

**Not chosen:**
- marked: Not React-native, requires dangerouslySetInnerHTML
- markdown-it: Requires additional React wrapper
- mdx: Overkill for simple content rendering

### Editorial Luxury Styling

Per design system:
- **0px border radius** on all elements (message bubble, code blocks)
- **Gold (#D4AF37)** for links and cursor
- **Inter font** for message content
- **Cream background** (`--orion-surface`) for message bubble
- **No emojis** in UI chrome

### Future Enhancements (NOT in this story)

- Syntax highlighting for code blocks (Story 2.x+)
- Copy code button for code blocks
- Image rendering
- Table rendering
- LaTeX/math rendering
- User message component (UserMessage)
- Message history persistence
- Virtualized message list for performance

---

## References

- [Source: thoughts/planning-artifacts/epics.md#Story 2.7: Render TextBlock Messages]
- [Source: thoughts/planning-artifacts/architecture.md#State Management (lines 238-250)]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Animation Behavior (lines 944-950)]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#MessageBubble (lines 1294-1298)]
- [Source: .ralph/story-chain.md#Story 2.6 Notes for Next Story]
- [react-markdown Documentation: https://github.com/remarkjs/react-markdown]
- [remark-gfm Documentation: https://github.com/remarkjs/remark-gfm]
- [Tailwind Typography: https://tailwindcss.com/docs/typography-plugin]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - expected: AssistantMessage.tsx, MarkdownRenderer.tsx, StreamingCursor.tsx, ChatMessageList.tsx, index.ts)
