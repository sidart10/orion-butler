# Story 2.8: Render ThinkingBlock Indicator

Status: drafted

---

## Story Definition

| Field | Value |
|-------|-------|
| **Story ID** | 2-8-render-thinkingblock-indicator |
| **Epic** | Epic 2: First Conversation |
| **Status** | drafted |
| **Priority** | High (user feedback during extended thinking) |
| **Created** | 2026-01-24 |

---

## User Story

As a **user**,
I want to see when Claude is thinking deeply,
So that I understand why responses may take longer.

---

## Acceptance Criteria

1. **Given** extended thinking is enabled for the query
   **When** a `ThinkingBlock` event arrives
   **Then** a "Thinking..." indicator displays with subtle animation

2. **And** the indicator persists until text or tool output begins

3. **And** thinking content is NOT displayed to user (internal reasoning)

---

## Design References

### From Epic Definition (thoughts/planning-artifacts/epics.md)

**Story 2.8: Render ThinkingBlock Indicator:**

> As a **user**,
> I want to see when Claude is thinking deeply,
> So that I understand why responses may take longer.
>
> **Acceptance Criteria:**
>
> **Given** extended thinking is enabled for the query
> **When** a `ThinkingBlock` event arrives
> **Then** a "Thinking..." indicator displays with subtle animation
> **And** the indicator persists until text or tool output begins
> **And** thinking content is NOT displayed to user (internal reasoning)

### From Architecture (thoughts/planning-artifacts/architecture.md)

**Extended Thinking Feature (SDK Capability):**

The Claude Agent SDK supports extended thinking for complex reasoning tasks. When enabled, the model may spend additional time reasoning before responding. The SDK emits `ThinkingBlock` events during this phase.

**State Machine Integration:**

The streaming state machine from Story 2.6 already tracks thinking content in `context.thinking`. This story focuses on the UI indicator, not the state accumulation.

### From UX Design Specification (thoughts/planning-artifacts/ux-design-specification.md)

**StatusIndicator States (lines 1422-1433):**

| State | Color | Animation |
|-------|-------|-----------|
| idle | Gray | None |
| **thinking** | **Gold** | **Pulse** |
| acting | Gold | Spin |
| waiting | Blue | Pulse |
| success | Gold | None (checkmark) |
| error | Red | None |

**Animation Behavior (lines 944-950):**

- All animations are **non-blocking** - they never delay content rendering
- Streaming text renders immediately; animations run in parallel
- First token appears within 500ms target regardless of animation state
- User can interact during animations (no "wait for animation" states)

**Key UX Design Principles (lines 367-369):**

- Gold accent for active/progress states
- Subtle animations, never distracting
- Confidence over alarm

**Inline Chat Indicators (lines 281-294):**

```
|  User                                          |
|  Schedule a call with Sarah                    |
|                                                |
|  +------------------------------------------+  |
|  | [spinner] Checking calendar...         v |  |
|  +------------------------------------------+  |
|  Press ESC to cancel                           |
```

### From Story Chain (.ralph/story-chain.md)

**Story 2.7 Established:**

- `AssistantMessage` component with streaming support
- `MarkdownRenderer` for rich text formatting
- `StreamingCursor` with gold pulsing animation
- Pattern for components in `src/components/chat/`
- Integration with `useStreamingMachine()` hook

**Story 2.6 Established:**

- `streamingMachine` with states: idle, sending, streaming, complete, error
- `useStreamingMachine()` hook returning: state, context, send, reset, isLoading, isError, isComplete
- **`context.thinking`** contains accumulated thinking content (separate from text)
- Thinking content tracked via `TEXT_CHUNK` events with type: 'thinking'

**Story 1.9 Established:**

- `StatusIndicator` component with 6 states (idle, thinking, acting, waiting, success, error)
- Gold color for thinking state with pulse animation (1500ms)
- Three sizes: sm (6px), md (8px), lg (12px)
- `--orion-waiting: #3B82F6` design token
- `--orion-anim-pulse: 1500ms` timing token
- Reduced motion support via `prefers-reduced-motion`

**Notes from Story 2.7 for Story 2.8:**

> - Use `context.thinking` from state machine (separate from `context.text`)
> - Create `ThinkingIndicator` component (collapsible)
> - Show thinking content in collapsed state with expand toggle
> - Consider StatusIndicator integration (from Story 1.9)
> - ThinkingBlock should appear BEFORE text content in conversation
> - Use muted/secondary styling to distinguish from main response

### From PRD NFR Requirements

**NFR-1.1 (Performance):** First token latency p95 < 500ms
**NFR-5.1 (Usability):** Full keyboard navigation
**NFR-5.3 (Usability):** WCAG AA contrast compliance

---

## Technical Requirements

### ThinkingIndicator Component

The `ThinkingIndicator` component displays a compact indicator when Claude is using extended thinking. Per AC #3, the actual thinking content is NOT displayed to users - only an animated indicator showing that thinking is occurring.

**Visual Design:**

```
+------------------------------------------+
|  [pulse] Thinking...                     |
+------------------------------------------+
```

**Behavior:**

1. Appears when `context.thinking` has content AND state is 'streaming'
2. Disappears when first text chunk arrives (state still 'streaming' but text exists)
3. Uses StatusIndicator internally for the pulsing dot
4. Includes "Thinking..." label for clarity
5. Positioned above the AssistantMessage in the conversation flow

### Component Architecture

```typescript
// src/components/chat/ThinkingIndicator.tsx

import { cn } from '@/lib/utils';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

/**
 * Props for ThinkingIndicator
 * AC #1: Displays when ThinkingBlock events arrive
 */
export interface ThinkingIndicatorProps {
  /** Whether thinking is currently active */
  isActive: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Renders a "Thinking..." indicator during extended thinking
 * AC #1: Shows subtle animation
 * AC #2: Persists until text/tool output begins
 * AC #3: Does NOT display thinking content
 */
export function ThinkingIndicator({
  isActive,
  className,
}: ThinkingIndicatorProps) {
  // AC #2: Don't render when not active
  if (!isActive) {
    return null;
  }

  return (
    <div
      className={cn(
        // Compact styling, muted appearance
        'flex items-center gap-2',
        'px-3 py-2',
        'text-sm text-orion-fg-muted',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Claude is thinking"
    >
      {/* AC #1: StatusIndicator with thinking state (gold pulse) */}
      <StatusIndicator status="thinking" size="sm" />

      {/* Label */}
      <span>Thinking...</span>
    </div>
  );
}

ThinkingIndicator.displayName = 'ThinkingIndicator';
```

### Integration with ChatMessageList

```typescript
// src/components/chat/ChatMessageList.tsx (updated from Story 2.7)

import { useStreamingMachine } from '@/hooks/useStreamingMachine';
import { AssistantMessage } from './AssistantMessage';
import { ThinkingIndicator } from './ThinkingIndicator';
import { UserMessage } from './UserMessage';

/**
 * Renders the chat message list with streaming and thinking support
 * Uses state machine from Story 2.6
 */
export function ChatMessageList() {
  const { state, context, isLoading } = useStreamingMachine();

  // AC #1: Show thinking indicator when thinking content exists but no text yet
  // AC #2: Indicator persists until text or tool output begins
  const isThinkingActive =
    state === 'streaming' &&
    context.thinking.length > 0 &&
    context.text.length === 0 &&
    context.tools.size === 0;

  // Determine if we should show the assistant message
  const showAssistantMessage =
    state === 'streaming' ||
    state === 'complete' ||
    (state === 'error' && context.text.length > 0);

  // Show message only when text content exists
  const hasTextContent = context.text.length > 0;
  const isCurrentlyStreaming = state === 'streaming' && hasTextContent;

  return (
    <div
      className="flex flex-col gap-4 p-4"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {/* Previous messages would be rendered here */}

      {/* AC #1, #2: Thinking indicator (appears BEFORE assistant message) */}
      <ThinkingIndicator isActive={isThinkingActive} />

      {/* Current assistant response (from Story 2.7) */}
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

### State Transitions

The thinking indicator's visibility is determined by the streaming state machine context:

```
Timeline:
1. User sends message -> state: 'sending'
2. SDK starts extended thinking -> state: 'streaming', context.thinking grows
   - ThinkingIndicator: VISIBLE (isActive: true)
3. First text chunk arrives -> state: 'streaming', context.text grows
   - ThinkingIndicator: HIDDEN (text exists)
   - AssistantMessage: VISIBLE
4. Response complete -> state: 'complete'
   - ThinkingIndicator: HIDDEN
   - AssistantMessage: VISIBLE (complete)
```

### CSS Additions

No new CSS required - uses existing StatusIndicator animations from Story 1.9:

- Pulse animation: 1500ms ease-in-out (already defined)
- Gold color: `--orion-gold` (already defined)
- Reduced motion support (already implemented)

---

## Implementation Tasks

- [ ] Task 1: Create ThinkingIndicator component (AC: #1, #3)
  - [ ] 1.1: Create `src/components/chat/ThinkingIndicator.tsx`
  - [ ] 1.2: Import StatusIndicator from `@/components/ui/StatusIndicator`
  - [ ] 1.3: Implement isActive prop to control visibility
  - [ ] 1.4: Add StatusIndicator with `status="thinking"` and `size="sm"`
  - [ ] 1.5: Add "Thinking..." text label
  - [ ] 1.6: Apply muted styling (text-orion-fg-muted)
  - [ ] 1.7: Add role="status" and aria-live="polite" for accessibility
  - [ ] 1.8: Add aria-label for screen readers
  - [ ] 1.9: Export component with displayName

- [ ] Task 2: Update ChatMessageList component (AC: #2)
  - [ ] 2.1: Import ThinkingIndicator
  - [ ] 2.2: Add isThinkingActive calculation:
    - state === 'streaming'
    - context.thinking.length > 0
    - context.text.length === 0
    - context.tools.size === 0
  - [ ] 2.3: Render ThinkingIndicator above AssistantMessage
  - [ ] 2.4: Update hasTextContent check for AssistantMessage rendering

- [ ] Task 3: Update barrel exports
  - [ ] 3.1: Add ThinkingIndicator to `src/components/chat/index.ts`

- [ ] Task 4: Manual testing
  - [ ] 4.1: Verify thinking indicator appears when extended thinking enabled (AC #1)
  - [ ] 4.2: Verify indicator has gold pulsing dot (AC #1)
  - [ ] 4.3: Verify indicator shows "Thinking..." label (AC #1)
  - [ ] 4.4: Verify indicator disappears when text arrives (AC #2)
  - [ ] 4.5: Verify indicator disappears when tool call starts (AC #2)
  - [ ] 4.6: Verify NO thinking content is displayed (AC #3)
  - [ ] 4.7: Verify screen reader announces "Claude is thinking"
  - [ ] 4.8: Test with `prefers-reduced-motion` (no animation)
  - [ ] 4.9: Test dark mode appearance

---

## Dependencies

### Requires (from prior stories)

| Story | What It Provides | Why Needed |
|-------|------------------|------------|
| Story 2.6 | `useStreamingMachine()` hook | To get `context.thinking` |
| Story 2.6 | `context.thinking` field | To detect thinking activity |
| Story 2.6 | `context.tools` Map | To detect tool activity |
| Story 2.7 | `AssistantMessage` component | Rendered after thinking |
| Story 2.7 | `src/components/chat/` directory | Component location |
| Story 2.7 | `ChatMessageList` integration | Component to update |
| Story 1.9 | `StatusIndicator` component | For pulsing indicator |
| Story 1.9 | Pulse animation (1500ms) | Thinking animation |
| Story 1.3 | `--orion-gold` color token | Gold indicator color |
| Story 1.3 | `--orion-fg-muted` color token | Muted text color |

### Provides For (future stories)

| Story | What This Story Provides |
|-------|--------------------------|
| Story 2.9 | Pattern for ToolUseBlock indicator (similar approach) |
| Story 2.10 | Understanding of when indicators disappear |
| Story 2.11 | Indicator styling patterns for error states |

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Screen reader support** | `role="status"`, `aria-live="polite"`, `aria-label="Claude is thinking"` |
| **Status announcement** | Live region announces when thinking starts |
| **Reduced motion** | StatusIndicator respects `prefers-reduced-motion` (no pulse) |
| **Color contrast** | Gold on cream meets WCAG AA via design tokens |
| **Non-blocking** | Indicator does not block keyboard navigation |

---

## File Locations

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/chat/ThinkingIndicator.tsx` | Thinking indicator component |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/chat/ChatMessageList.tsx` | Add ThinkingIndicator integration |
| `src/components/chat/index.ts` | Export ThinkingIndicator |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `src/components/ui/StatusIndicator.tsx` | Already complete from Story 1.9 |
| `src/machines/streamingMachine.ts` | Machine from Story 2.6 already tracks thinking |
| `src/hooks/useStreamingMachine.ts` | Hook from Story 2.6 already exposes context.thinking |
| `src/components/chat/AssistantMessage.tsx` | Component from Story 2.7 is complete |
| `src/globals.css` | Animation tokens already defined in Story 1.9 |

---

## Definition of Done

- [ ] ThinkingIndicator component exists at `src/components/chat/ThinkingIndicator.tsx`
- [ ] Component shows pulsing gold dot when isActive=true (AC #1)
- [ ] Component shows "Thinking..." text label (AC #1)
- [ ] Component hidden when isActive=false (AC #2)
- [ ] Component is accessible (ARIA labels, live region)
- [ ] StatusIndicator with `status="thinking"` used for animation
- [ ] ChatMessageList renders ThinkingIndicator above AssistantMessage
- [ ] isThinkingActive calculation correctly detects thinking phase
- [ ] Indicator disappears when text content arrives (AC #2)
- [ ] Indicator disappears when tool output starts (AC #2)
- [ ] NO thinking content is ever displayed to user (AC #3)
- [ ] Barrel export updated in `src/components/chat/index.ts`
- [ ] `npm run build` completes successfully
- [ ] `npm run typecheck` passes
- [ ] Manual testing confirms indicator appears and disappears correctly

---

## Test Strategy

> **Note:** The summary below lists core test cases. The authoritative test list will be in the ATDD checklist (`atdd-checklist-2-8-render-thinkingblock-indicator.md`).

### Unit Tests (Core)

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.8-UNIT-001 | ThinkingIndicator renders when isActive=true | #1 |
| 2.8-UNIT-002 | ThinkingIndicator returns null when isActive=false | #2 |
| 2.8-UNIT-003 | ThinkingIndicator contains StatusIndicator with status="thinking" | #1 |
| 2.8-UNIT-004 | ThinkingIndicator contains "Thinking..." text | #1 |
| 2.8-UNIT-005 | ThinkingIndicator has role="status" | #1 |
| 2.8-UNIT-006 | ThinkingIndicator has aria-live="polite" | #1 |
| 2.8-UNIT-007 | ThinkingIndicator has aria-label | #1 |
| 2.8-UNIT-008 | ThinkingIndicator uses muted text color | #1 |
| 2.8-UNIT-009 | StatusIndicator uses size="sm" | #1 |
| 2.8-UNIT-010 | Component does NOT render any thinking content text | #3 |

### Component Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.8-COMP-001 | ChatMessageList shows ThinkingIndicator when thinking + no text | #1, #2 |
| 2.8-COMP-002 | ChatMessageList hides ThinkingIndicator when text arrives | #2 |
| 2.8-COMP-003 | ChatMessageList hides ThinkingIndicator when tool starts | #2 |
| 2.8-COMP-004 | ChatMessageList renders ThinkingIndicator before AssistantMessage | #1 |
| 2.8-COMP-005 | isThinkingActive is false when state is not 'streaming' | #2 |

### Integration Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.8-INT-001 | Full flow: thinking event shows indicator | #1 |
| 2.8-INT-002 | Full flow: text arrival hides indicator and shows message | #2 |
| 2.8-INT-003 | Full flow: thinking content never displayed | #3 |

### E2E Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.8-E2E-001 | User sees "Thinking..." with pulsing indicator during extended thinking | #1 |
| 2.8-E2E-002 | Indicator disappears smoothly when response text arrives | #2 |
| 2.8-E2E-003 | No raw thinking content visible anywhere in UI | #3 |
| 2.8-E2E-004 | Dark mode renders correctly | #1 |
| 2.8-E2E-005 | Reduced motion preference disables pulse animation | #1 |

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| ThinkingIndicator component | 1 hour |
| ChatMessageList integration | 1 hour |
| Barrel exports | 15 minutes |
| Testing | 1.5 hours |
| Documentation | 30 minutes |
| **Total** | 4.25 hours |

---

## Notes

### Thinking Content Privacy (AC #3)

Per the acceptance criteria, thinking content is explicitly NOT displayed to users. This is intentional:

1. **User experience**: Internal reasoning steps would be overwhelming and confusing
2. **Interface clarity**: Users need to see results, not the reasoning process
3. **Performance perception**: Showing "Thinking..." is enough feedback; details would feel slow

The thinking content IS tracked in `context.thinking` for:
- Determining when to show/hide the indicator
- Potential future debugging features (admin mode)
- Analytics on thinking time

### StatusIndicator Reuse

This story leverages the StatusIndicator from Story 1.9 rather than creating custom animation logic:

- **Consistent animation timing** (1500ms pulse)
- **Consistent color** (gold for thinking state)
- **Reduced motion support** already implemented
- **Tested component** reduces risk

### Indicator Positioning

The ThinkingIndicator appears ABOVE the AssistantMessage position:

1. When thinking starts: Only ThinkingIndicator visible
2. When text arrives: ThinkingIndicator disappears, AssistantMessage appears
3. This creates smooth visual transition without jarring layout shifts

### Tool Output Detection

The indicator also disappears when tool output begins (not just text). This handles scenarios where Claude might use a tool immediately without text:

```typescript
const isThinkingActive =
  state === 'streaming' &&
  context.thinking.length > 0 &&
  context.text.length === 0 &&
  context.tools.size === 0;  // <- Also checks for tools
```

### Future Enhancements (NOT in this story)

- Expandable thinking content for power users/debugging
- Thinking time display ("Thinking for 5.2s...")
- Different indicators for different thinking "depths"
- Animation showing progress through thinking phases

---

## References

- [Source: thoughts/planning-artifacts/epics.md#Story 2.8: Render ThinkingBlock Indicator]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#StatusIndicator (lines 1422-1433)]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Animation Behavior (lines 944-950)]
- [Source: .ralph/story-chain.md#Story 2.7 Notes for Next Story]
- [Source: Story 1.9 Status Indicator Component]
- [Source: Story 2.6 Create Streaming State Machine]
- [Source: Story 2.7 Render TextBlock Messages]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - expected: ThinkingIndicator.tsx, updated ChatMessageList.tsx, updated index.ts)
