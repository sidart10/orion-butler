# Story 2.9: Render ToolUseBlock Status

Status: drafted

---

## Story Definition

| Field | Value |
|-------|-------|
| **Story ID** | 2-9-render-tooluseblock-status |
| **Epic** | Epic 2: First Conversation |
| **Status** | drafted |
| **Priority** | High (user feedback during tool execution) |
| **Created** | 2026-01-24 |

---

## User Story

As a **user**,
I want to see when Claude invokes a tool,
So that I understand what actions are being taken.

---

## Acceptance Criteria

1. **Given** a streaming response is active
   **When** a `ToolUseBlock` event arrives
   **Then** a tool status chip displays with the tool name (e.g., "Reading file...")

2. **And** the chip shows a loading/spinner state

3. **And** multiple concurrent tools show multiple chips

4. **And** tool inputs are summarized (e.g., file path, command)

---

## Design References

### From Epic Definition (thoughts/planning-artifacts/epics.md)

**Story 2.9: Render ToolUseBlock Status:**

> As a **user**,
> I want to see when Claude invokes a tool,
> So that I understand what actions are being taken.
>
> **Acceptance Criteria:**
>
> **Given** a streaming response is active
> **When** a `ToolUseBlock` event arrives
> **Then** a tool status chip displays with the tool name (e.g., "Reading file...")
> **And** the chip shows a loading/spinner state
> **And** multiple concurrent tools show multiple chips
> **And** tool inputs are summarized (e.g., file path, command)

### From Architecture (thoughts/planning-artifacts/architecture.md)

**Tool Lifecycle Events (lines 928-942):**

```typescript
// Tool lifecycle
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
```

**Canvas-Streaming Protocol (lines 1497-1503):**

| Agent Output | Event | Canvas Action |
|--------------|-------|---------------|
| Text tokens | `message:chunk` | Append to chat bubble |
| `tool_use` block starts | `message:tool_start` | Show "Working..." indicator |
| `tool_use` completes with canvas schema | `canvas:render` | Parse JSON, render component |
| `tool_use` returns structured data | `canvas:data` | Update existing canvas |

### From UX Design Specification (thoughts/planning-artifacts/ux-design-specification.md)

**StatusIndicator States (lines 1422-1433):**

| State | Color | Animation |
|-------|-------|-----------|
| idle | Gray | None |
| thinking | Gold | Pulse |
| **acting** | **Gold** | **Spin** |
| waiting | Blue | Pulse |
| success | Gold | None (checkmark) |
| error | Red | None |

**ActivityIndicator Specification (lines 1435-1492):**

- **Purpose:** Show agent progress inline in conversation
- **Design Principle:** ONE component for ALL tool calls, regardless of how many tools execute
- **Anatomy:**
  - Collapsed: ~32px height summary bar
  - Expanded: Tool-by-tool breakdown panel

**States:**

| State | Icon | Color | Description |
|-------|------|-------|-------------|
| Running | `lucide:loader-2` (spinning) | Gold | Active execution |
| Completed | `lucide:check-circle` | Green (#059669) | Success |
| Failed | `lucide:alert-circle` | Red (#9B2C2C) | Error occurred |
| Cancelled | `lucide:square` | Gray + strikethrough | User cancelled |

**DESIGN NOTE (Icon Color Clarification):** The UX spec defines two different color schemes:
- **StatusIndicator** (Story 1.9): Uses gold checkmark for success state
- **ActivityIndicator** (collapsed/expanded view): Uses green `#059669` for completion

For **Story 2.9 ToolStatusChip**:
- **Running state**: Use `StatusIndicator` with `status="acting"` (gold spin) - reuses existing component
- **Completion states** (Story 2.10): Should use Lucide icons directly (`lucide:check-circle` green for success, `lucide:alert-circle` red for error) to match ActivityIndicator spec, NOT StatusIndicator success state

This allows Story 2.9 to reuse StatusIndicator for running state while Story 2.10 will add Lucide icons for completion, matching the ActivityIndicator visual design.

**Collapsed State (Default):**
```
+------------------------------------------------+
| [spinner] Checking calendar, finding contact... |
+------------------------------------------------+
```
- Icon: Status indicator (spinner for running)
- Text: Summary of actions (tool names joined)
- Chevron: Expand indicator

**Expanded State (On Click):**
```
+------------------------------------------------+
| [spinner] Checking calendar, finding contact... ^ |
+------------------------------------------------+
| [spinner] [calendar] Checking available slots   |
| [check]   [user]     sarah.chen@company.com     |
+------------------------------------------------+
```

**Design Principle (line 318):**

> No matter how many tools the agent uses (calendar check, contact lookup, email draft), bundle everything in ONE activity indicator. Users see a summary; click to expand for tool-by-tool breakdown.

**One Component for All Tools (line 1933):**

> Clean UX regardless of complexity - separate indicators per tool was rejected

### From Story Chain (.ralph/story-chain.md)

**Story 2.8 Established:**

- `ThinkingIndicator` component pattern (compact indicator with StatusIndicator + label)
- `isThinkingActive` pattern: Multi-condition check for visibility
- Content privacy pattern: Track content internally while hiding from UI
- Integration pattern with `ChatMessageList`

**Story 2.7 Established:**

- `AssistantMessage` component with streaming support
- `MarkdownRenderer` for rich text formatting
- Pattern for components in `src/components/chat/`
- Integration with `useStreamingMachine()` hook

**Story 2.6 Established:**

- `streamingMachine` with states: idle, sending, streaming, complete, error
- `useStreamingMachine()` hook returning: state, context, send, reset, isLoading, isError, isComplete
- **`context.tools`** is a `Map<toolId, ToolStatus>` for tracking concurrent tools
- ToolStatus contains: name, status (running/complete/error), durationMs

**Story 1.9 Established:**

- `StatusIndicator` component with 6 states (idle, thinking, acting, waiting, success, error)
- Gold color for acting state with **spin animation** (1000ms)
- Three sizes: sm (6px), md (8px), lg (12px)
- `--orion-anim-spin: 1000ms` timing token
- Reduced motion support via `prefers-reduced-motion`

**Notes from Story 2.8 for Story 2.9:**

> - Use StatusIndicator with `status="acting"` (gold spin animation)
> - Create ToolStatusChip component showing tool name + status
> - Tool name should be human-readable (e.g., "Reading file..." not "Bash")
> - Chip shows loading state while tool runs, success/error on completion
> - Multiple concurrent tools show multiple chips
> - Tool inputs summarized (e.g., file path, not full command)
> - Pattern from ThinkingIndicator: compact, muted styling
> - Consider expandable detail for advanced users

### From PRD NFR Requirements

**NFR-1.1 (Performance):** First token latency p95 < 500ms
**NFR-5.1 (Usability):** Full keyboard navigation
**NFR-5.3 (Usability):** WCAG AA contrast compliance

---

## Technical Requirements

### Overview: ActivityIndicator vs ToolStatusChip

Per UX specification, the design uses a **single ActivityIndicator** that bundles ALL tool calls, with expandable detail showing individual tool chips. However, for Story 2.9, we implement the **building block components**:

1. **ToolStatusChip** - Individual chip showing one tool's status (AC #1, #2, #4)
2. **ToolActivitySummary** - Container showing multiple chips (AC #3)

The full ActivityIndicator with collapse/expand behavior will be refined in Story 2.10 when tool completion is added.

### Human-Readable Tool Names

Tool names from the SDK are technical (e.g., "Bash", "Read", "Write"). We transform them to human-readable descriptions:

```typescript
// Tool name mapping
const TOOL_DISPLAY_NAMES: Record<string, string> = {
  'Bash': 'Running command',
  'Read': 'Reading file',
  'Write': 'Writing file',
  'Grep': 'Searching',
  'Glob': 'Finding files',
  'Edit': 'Editing file',
  'WebFetch': 'Fetching page',
  'WebSearch': 'Searching web',
  // Composio tools
  'GMAIL_SEND_MESSAGE': 'Sending email',
  'GMAIL_GET_MESSAGES': 'Checking email',
  'GOOGLE_CALENDAR_GET_EVENTS': 'Checking calendar',
  'GOOGLE_CALENDAR_CREATE_EVENT': 'Creating event',
};

// Fallback: humanize tool name
function humanizeToolName(toolName: string): string {
  return TOOL_DISPLAY_NAMES[toolName] ??
    toolName.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
}
```

### Tool Input Summarization (AC #4)

Tool inputs should be summarized to show context without overwhelming detail:

```typescript
function summarizeToolInput(toolName: string, input: Record<string, unknown>): string | null {
  switch (toolName) {
    case 'Bash':
      // Show truncated command
      const cmd = String(input.command ?? '');
      return cmd.length > 40 ? cmd.slice(0, 40) + '...' : cmd;

    case 'Read':
    case 'Write':
    case 'Edit':
      // Show file path
      const path = String(input.file_path ?? input.path ?? '');
      return path.split('/').pop() ?? path; // Just filename

    case 'Grep':
      // Show search pattern
      return `"${String(input.pattern ?? '')}"`;

    case 'WebFetch':
      // Show URL domain
      try {
        const url = new URL(String(input.url ?? ''));
        return url.hostname;
      } catch {
        return null;
      }

    default:
      return null;
  }
}
```

### Component Architecture

#### ToolStatusChip Component

```typescript
// src/components/chat/ToolStatusChip.tsx

import { cn } from '@/lib/utils';
import { StatusIndicator, StatusIndicatorState } from '@/components/ui/StatusIndicator';
import { Loader2 } from 'lucide-react';

/**
 * Status of a tool execution
 */
export type ToolExecutionStatus = 'running' | 'complete' | 'error';

/**
 * Props for ToolStatusChip
 * AC #1: Displays when ToolUseBlock event arrives
 */
export interface ToolStatusChipProps {
  /** Human-readable tool name (e.g., "Reading file...") */
  toolName: string;
  /** Current execution status */
  status: ToolExecutionStatus;
  /** Optional summary of tool input (e.g., "config.ts") */
  inputSummary?: string | null;
  /** Additional class names */
  className?: string;
}

/**
 * Maps tool execution status to StatusIndicator state
 * AC #2: Running shows spinner/loading state
 */
function getStatusIndicatorState(status: ToolExecutionStatus): StatusIndicatorState {
  switch (status) {
    case 'running':
      return 'acting'; // Gold spin animation
    case 'complete':
      return 'success'; // Gold checkmark
    case 'error':
      return 'error'; // Red
    default:
      return 'acting';
  }
}

/**
 * Renders a single tool's status as a compact chip
 * AC #1: Shows tool name
 * AC #2: Shows loading/spinner state
 * AC #4: Shows input summary
 */
export function ToolStatusChip({
  toolName,
  status,
  inputSummary,
  className,
}: ToolStatusChipProps) {
  const indicatorState = getStatusIndicatorState(status);

  return (
    <div
      className={cn(
        // Chip styling
        'inline-flex items-center gap-2',
        'px-2 py-1',
        'text-xs text-orion-fg-muted',
        'bg-orion-surface',
        'border border-orion-border',
        // 0px radius per Editorial Luxury
        'rounded-none',
        className
      )}
      role="status"
      aria-label={`${toolName}${inputSummary ? `: ${inputSummary}` : ''}`}
    >
      {/* AC #2: StatusIndicator with acting state (gold spin) for running */}
      <StatusIndicator status={indicatorState} size="sm" />

      {/* AC #1: Tool name */}
      <span className="font-medium">{toolName}</span>

      {/* AC #4: Input summary (optional) */}
      {inputSummary && (
        <span className="text-orion-fg-muted opacity-70 truncate max-w-[150px]">
          {inputSummary}
        </span>
      )}
    </div>
  );
}

ToolStatusChip.displayName = 'ToolStatusChip';
```

#### ToolActivitySummary Component

```typescript
// src/components/chat/ToolActivitySummary.tsx

import { cn } from '@/lib/utils';
import { ToolStatusChip, ToolExecutionStatus } from './ToolStatusChip';

/**
 * Tool information for display
 */
export interface ToolInfo {
  toolId: string;
  toolName: string;
  status: ToolExecutionStatus;
  inputSummary?: string | null;
}

/**
 * Props for ToolActivitySummary
 * AC #3: Multiple concurrent tools show multiple chips
 */
export interface ToolActivitySummaryProps {
  /** Array of active tools */
  tools: ToolInfo[];
  /** Additional class names */
  className?: string;
}

/**
 * Renders multiple ToolStatusChips for concurrent tool execution
 * AC #3: Shows multiple chips for concurrent tools
 */
export function ToolActivitySummary({
  tools,
  className,
}: ToolActivitySummaryProps) {
  // Don't render if no tools
  if (tools.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        // Container styling
        'flex flex-wrap gap-2',
        'px-3 py-2',
        className
      )}
      role="region"
      aria-label={`${tools.length} tool${tools.length > 1 ? 's' : ''} in progress`}
    >
      {/* AC #3: Render chip for each tool */}
      {tools.map((tool) => (
        <ToolStatusChip
          key={tool.toolId}
          toolName={tool.toolName}
          status={tool.status}
          inputSummary={tool.inputSummary}
        />
      ))}
    </div>
  );
}

ToolActivitySummary.displayName = 'ToolActivitySummary';
```

#### Helper Functions

```typescript
// src/lib/tool-display.ts

/**
 * Human-readable names for SDK tools
 */
export const TOOL_DISPLAY_NAMES: Record<string, string> = {
  // Claude Agent SDK native tools
  'Bash': 'Running command',
  'Read': 'Reading file',
  'Write': 'Writing file',
  'Grep': 'Searching',
  'Glob': 'Finding files',
  'Edit': 'Editing file',
  'WebFetch': 'Fetching page',
  'WebSearch': 'Searching web',
  'TodoWrite': 'Updating tasks',

  // Composio integrations
  'GMAIL_SEND_MESSAGE': 'Sending email',
  'GMAIL_GET_MESSAGES': 'Checking email',
  'GMAIL_REPLY_TO_MESSAGE': 'Replying to email',
  'GOOGLE_CALENDAR_GET_EVENTS': 'Checking calendar',
  'GOOGLE_CALENDAR_CREATE_EVENT': 'Creating event',
  'GOOGLE_CALENDAR_DELETE_EVENT': 'Removing event',
  'SLACK_SEND_MESSAGE': 'Sending Slack message',
  'SLACK_GET_MESSAGES': 'Reading Slack',
};

/**
 * Convert SDK tool name to human-readable display name
 * AC #1: Tool name should be human-readable
 */
export function humanizeToolName(toolName: string): string {
  // Check for explicit mapping
  if (TOOL_DISPLAY_NAMES[toolName]) {
    return TOOL_DISPLAY_NAMES[toolName];
  }

  // Fallback: humanize snake_case/PascalCase
  return toolName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Summarize tool input for display
 * AC #4: Tool inputs are summarized
 */
export function summarizeToolInput(
  toolName: string,
  input: Record<string, unknown>
): string | null {
  try {
    switch (toolName) {
      case 'Bash': {
        const cmd = String(input.command ?? '');
        // Truncate long commands
        return cmd.length > 40 ? `${cmd.slice(0, 40)}...` : cmd;
      }

      case 'Read':
      case 'Write':
      case 'Edit': {
        const filePath = String(input.file_path ?? input.path ?? '');
        // Show just filename for brevity
        const filename = filePath.split('/').pop();
        return filename || null;
      }

      case 'Grep': {
        const pattern = String(input.pattern ?? '');
        return pattern ? `"${pattern}"` : null;
      }

      case 'Glob': {
        const pattern = String(input.pattern ?? '');
        return pattern || null;
      }

      case 'WebFetch':
      case 'WebSearch': {
        const url = String(input.url ?? '');
        if (!url) return null;
        try {
          const parsed = new URL(url);
          return parsed.hostname;
        } catch {
          return url.slice(0, 30);
        }
      }

      case 'GMAIL_SEND_MESSAGE':
      case 'GMAIL_REPLY_TO_MESSAGE': {
        const to = input.to ?? input.recipient;
        return to ? String(to) : null;
      }

      case 'GOOGLE_CALENDAR_CREATE_EVENT': {
        const title = input.title ?? input.summary;
        return title ? String(title) : null;
      }

      default:
        return null;
    }
  } catch {
    return null;
  }
}
```

### Integration with ChatMessageList

```typescript
// src/components/chat/ChatMessageList.tsx (updated from Story 2.8)

import { useStreamingMachine } from '@/hooks/useStreamingMachine';
import { AssistantMessage } from './AssistantMessage';
import { ThinkingIndicator } from './ThinkingIndicator';
import { ToolActivitySummary, ToolInfo } from './ToolActivitySummary';
import { UserMessage } from './UserMessage';
import { humanizeToolName, summarizeToolInput } from '@/lib/tool-display';

/**
 * Renders the chat message list with streaming, thinking, and tool support
 * Uses state machine from Story 2.6
 */
export function ChatMessageList() {
  const { state, context, isLoading } = useStreamingMachine();

  // Story 2.8: Show thinking indicator when thinking content exists but no text yet
  const isThinkingActive =
    state === 'streaming' &&
    context.thinking.length > 0 &&
    context.text.length === 0 &&
    context.tools.size === 0;

  // Story 2.9: Transform context.tools Map to ToolInfo array for display
  // AC #3: Multiple concurrent tools show multiple chips
  const activeTools: ToolInfo[] = Array.from(context.tools.entries()).map(
    ([toolId, toolStatus]) => ({
      toolId,
      toolName: humanizeToolName(toolStatus.name),
      status: toolStatus.status,
      inputSummary: toolStatus.input
        ? summarizeToolInput(toolStatus.name, toolStatus.input)
        : null,
    })
  );

  // Show tools when any are active (running)
  const hasActiveTools = activeTools.some((t) => t.status === 'running');

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

      {/* Story 2.8: Thinking indicator (appears BEFORE tool activity) */}
      <ThinkingIndicator isActive={isThinkingActive} />

      {/* Story 2.9: Tool activity summary (AC #1, #2, #3, #4) */}
      {/* Tools display when ANY are active, regardless of thinking state */}
      {/* Claude can invoke tools while thinking, so both can be true */}
      {hasActiveTools && (
        <ToolActivitySummary tools={activeTools} />
      )}

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

### State Machine Tool Tracking

The state machine from Story 2.6 already tracks tools via `context.tools` Map. This story relies on that existing infrastructure:

```typescript
// From Story 2.6: ToolStatus interface (REQUIRED for Story 2.9)
interface ToolStatus {
  name: string;
  status: 'running' | 'complete' | 'error';
  durationMs?: number;
  input: Record<string, unknown>; // REQUIRED for AC #4 input summarization
}

// context.tools is Map<toolId, ToolStatus>
```

**IMPLEMENTATION NOTE:** Story 2.6 ToolStatus **must** include `input: Record<string, unknown>`. During Task 4, the dev agent must:
1. Verify Story 2.6's ToolStatus interface includes the `input` field
2. If `input` field is missing, add it to the ToolStatus interface in `src/machines/streamingMachine.ts`
3. Ensure the TOOL_START event handler stores `event.input` in the ToolStatus entry
4. The architecture.md ToolStartPayload (lines 928-942) confirms `input: Record<string, unknown>` is part of the payload - this must be persisted to ToolStatus

---

## Implementation Tasks

- [ ] Task 1: Create tool display helpers (AC: #1, #4)
  - [ ] 1.1: Create `src/lib/tool-display.ts`
  - [ ] 1.2: Implement `TOOL_DISPLAY_NAMES` mapping
  - [ ] 1.3: Implement `humanizeToolName()` function with fallback
  - [ ] 1.4: Implement `summarizeToolInput()` for each tool type
  - [ ] 1.5: Export all functions from lib module

- [ ] Task 2: Create ToolStatusChip component (AC: #1, #2, #4)
  - [ ] 2.1: Create `src/components/chat/ToolStatusChip.tsx`
  - [ ] 2.2: Define ToolExecutionStatus type
  - [ ] 2.3: Import StatusIndicator from `@/components/ui/StatusIndicator`
  - [ ] 2.4: Implement getStatusIndicatorState() mapping
  - [ ] 2.5: Add StatusIndicator with `status="acting"` for running
  - [ ] 2.6: Display human-readable tool name (AC #1)
  - [ ] 2.7: Display input summary when available (AC #4)
  - [ ] 2.8: Apply Editorial Luxury styling (0px radius, muted colors)
  - [ ] 2.9: Add role="status" and aria-label for accessibility
  - [ ] 2.10: Export component with displayName

- [ ] Task 3: Create ToolActivitySummary component (AC: #3)
  - [ ] 3.1: Create `src/components/chat/ToolActivitySummary.tsx`
  - [ ] 3.2: Define ToolInfo interface
  - [ ] 3.3: Render multiple ToolStatusChip components (AC #3)
  - [ ] 3.4: Handle empty tools array (return null)
  - [ ] 3.5: Add role="region" and aria-label for accessibility
  - [ ] 3.6: Export component with displayName

- [ ] Task 4: Update state machine types (AC: #4)
  - [ ] 4.1: Verify ToolStatus includes `input` field in Story 2.6 machine
  - [ ] 4.2: If missing, update ToolStatus interface to include `input: Record<string, unknown>`
  - [ ] 4.3: Update TOOL_START event handler to store input

- [ ] Task 5: Update ChatMessageList component (AC: all)
  - [ ] 5.1: Import ToolActivitySummary and ToolInfo
  - [ ] 5.2: Import humanizeToolName and summarizeToolInput from tool-display
  - [ ] 5.3: Transform context.tools Map to ToolInfo array
  - [ ] 5.4: Add hasActiveTools check
  - [ ] 5.5: Render ToolActivitySummary when tools are active
  - [ ] 5.6: Ensure tool summary appears below ThinkingIndicator, above AssistantMessage

- [ ] Task 6: Update barrel exports
  - [ ] 6.1: Add ToolStatusChip to `src/components/chat/index.ts`
  - [ ] 6.2: Add ToolActivitySummary to `src/components/chat/index.ts`
  - [ ] 6.3: Add ToolInfo and ToolExecutionStatus types to exports

- [ ] Task 7: Manual testing
  - [ ] 7.1: Trigger a tool call (e.g., file read) and verify chip appears (AC #1)
  - [ ] 7.2: Verify chip shows spinning/loading state (AC #2)
  - [ ] 7.3: Trigger multiple concurrent tools and verify multiple chips appear (AC #3)
  - [ ] 7.4: Verify tool inputs are summarized (filename, command, etc.) (AC #4)
  - [ ] 7.5: Verify human-readable tool names (not "Bash", "Read")
  - [ ] 7.6: Test with unknown tool name (verify fallback humanization)
  - [ ] 7.7: Verify screen reader announces tool status
  - [ ] 7.8: Test with `prefers-reduced-motion` (no spin animation)
  - [ ] 7.9: Test dark mode appearance

---

## Dependencies

### Requires (from prior stories)

| Story | What It Provides | Why Needed |
|-------|------------------|------------|
| Story 2.6 | `useStreamingMachine()` hook | To get `context.tools` Map |
| Story 2.6 | `context.tools` Map<toolId, ToolStatus> | To track running tools |
| Story 2.6 | TOOL_START / TOOL_COMPLETE events | To trigger tool state changes |
| Story 2.8 | `ThinkingIndicator` component | Visual ordering reference |
| Story 2.8 | `ChatMessageList` integration pattern | Component to update |
| Story 2.7 | `AssistantMessage` component | Rendered after tools |
| Story 2.7 | `src/components/chat/` directory | Component location |
| Story 1.9 | `StatusIndicator` component | For spinning indicator |
| Story 1.9 | Spin animation (1000ms) | Acting animation |
| Story 1.3 | `--orion-gold` color token | Gold indicator color |
| Story 1.3 | `--orion-fg-muted` color token | Muted text color |
| Story 1.3 | `--orion-surface` color token | Chip background |
| Story 1.3 | `--orion-border` color token | Chip border |

### Provides For (future stories)

| Story | What This Story Provides |
|-------|--------------------------|
| Story 2.10 | ToolStatusChip ready to show completion state |
| Story 2.10 | ToolActivitySummary ready for collapse/expand behavior |
| Story 2.10 | Tool display helpers for ToolResultBlock |
| Story 2.11 | Error state styling patterns already in chip |
| Story 2.12 | Tool duration tracking (context.tools has durationMs) |

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Screen reader support** | `role="status"` on each chip, `role="region"` on container |
| **Tool announcement** | aria-label includes tool name and input summary |
| **Multiple tools** | Container aria-label announces tool count |
| **Reduced motion** | StatusIndicator respects `prefers-reduced-motion` (no spin) |
| **Color contrast** | Gold on surface meets WCAG AA via design tokens |
| **Non-blocking** | Tool chips are non-interactive display elements (`role="status"`) and do not receive keyboard focus - users Tab past them naturally. No tabindex needed; chips are purely informational. |

---

## File Locations

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/tool-display.ts` | Tool name humanization and input summarization |
| `src/components/chat/ToolStatusChip.tsx` | Individual tool status chip |
| `src/components/chat/ToolActivitySummary.tsx` | Container for multiple tool chips |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/chat/ChatMessageList.tsx` | Add ToolActivitySummary integration |
| `src/components/chat/index.ts` | Export new components and types |
| `src/machines/streamingMachine.ts` | Potentially add `input` to ToolStatus (if missing) |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `src/components/ui/StatusIndicator.tsx` | Already complete from Story 1.9 |
| `src/components/chat/ThinkingIndicator.tsx` | Complete from Story 2.8 |
| `src/components/chat/AssistantMessage.tsx` | Complete from Story 2.7 |
| `src/globals.css` | Animation tokens already defined |

---

## Definition of Done

- [ ] `src/lib/tool-display.ts` exists with humanizeToolName() and summarizeToolInput()
- [ ] ToolStatusChip component exists at `src/components/chat/ToolStatusChip.tsx`
- [ ] ToolActivitySummary component exists at `src/components/chat/ToolActivitySummary.tsx`
- [ ] Tool chip displays human-readable name (AC #1)
- [ ] Tool chip shows spinning indicator when status='running' (AC #2)
- [ ] Multiple concurrent tools show multiple chips (AC #3)
- [ ] Tool inputs summarized (filename, pattern, domain) (AC #4)
- [ ] Components are accessible (ARIA labels, roles)
- [ ] StatusIndicator with `status="acting"` used for running state
- [ ] ChatMessageList renders ToolActivitySummary when tools active
- [ ] Tool activity appears below ThinkingIndicator, above AssistantMessage
- [ ] Barrel exports updated in `src/components/chat/index.ts`
- [ ] `npm run build` completes successfully
- [ ] `npm run typecheck` passes
- [ ] Manual testing confirms tools appear correctly

---

## Test Strategy

> **Note:** The test cases below are the authoritative test reference for this story. The ATDD checklist will be generated from this specification during the TEA ATDD step.

### Unit Tests (Core)

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.9-UNIT-001 | humanizeToolName returns display name for known tools | #1 |
| 2.9-UNIT-002 | humanizeToolName handles unknown tools with fallback | #1 |
| 2.9-UNIT-003 | summarizeToolInput returns filename for Read/Write/Edit | #4 |
| 2.9-UNIT-004 | summarizeToolInput returns truncated command for Bash | #4 |
| 2.9-UNIT-005 | summarizeToolInput returns pattern for Grep | #4 |
| 2.9-UNIT-006 | summarizeToolInput returns hostname for WebFetch | #4 |
| 2.9-UNIT-007 | summarizeToolInput returns null for unsupported tools | #4 |
| 2.9-UNIT-008 | ToolStatusChip renders with tool name | #1 |
| 2.9-UNIT-009 | ToolStatusChip shows StatusIndicator with acting state when running | #2 |
| 2.9-UNIT-010 | ToolStatusChip shows StatusIndicator with success state when complete | #2 |
| 2.9-UNIT-011 | ToolStatusChip shows input summary when provided | #4 |
| 2.9-UNIT-012 | ToolStatusChip has role="status" | #1 |
| 2.9-UNIT-013 | ToolStatusChip has aria-label with tool name | #1 |
| 2.9-UNIT-014 | ToolActivitySummary renders multiple chips | #3 |
| 2.9-UNIT-015 | ToolActivitySummary returns null for empty tools array | #3 |
| 2.9-UNIT-016 | ToolActivitySummary has aria-label with tool count | #3 |

### Component Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.9-COMP-001 | ChatMessageList shows ToolActivitySummary when tools are running | #1, #3 |
| 2.9-COMP-002 | ChatMessageList shows correct number of chips for concurrent tools | #3 |
| 2.9-COMP-003 | ChatMessageList hides ToolActivitySummary when no active tools | #1 |
| 2.9-COMP-004 | ChatMessageList positions tools below ThinkingIndicator | #1 |
| 2.9-COMP-005 | ChatMessageList positions tools above AssistantMessage | #1 |

### Integration Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.9-INT-001 | Full flow: TOOL_START event shows chip with spinner | #1, #2 |
| 2.9-INT-002 | Full flow: Multiple TOOL_START events show multiple chips | #3 |
| 2.9-INT-003 | Full flow: Tool input is summarized in chip | #4 |
| 2.9-INT-004 | Tool chip transforms SDK tool name to human-readable | #1 |

### E2E Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.9-E2E-001 | User sees "Reading file..." chip when Read tool invoked | #1 |
| 2.9-E2E-002 | Chip shows spinning animation during execution | #2 |
| 2.9-E2E-003 | Multiple concurrent tools show multiple chips | #3 |
| 2.9-E2E-004 | Chip shows filename when reading a file | #4 |
| 2.9-E2E-005 | Dark mode renders correctly | #1 |
| 2.9-E2E-006 | Reduced motion preference disables spin animation | #2 |

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| Tool display helpers | 1 hour |
| ToolStatusChip component | 1.5 hours |
| ToolActivitySummary component | 1 hour |
| ChatMessageList integration | 1 hour |
| State machine update (verify + add `input` if missing) | 45 minutes |
| Barrel exports | 15 minutes |
| Testing | 2 hours |
| Documentation | 30 minutes |
| **Total** | 8 hours |

**Estimation Note:** The state machine update is budgeted at 45 minutes (increased from 30 minutes) to account for verifying ToolStatus interface and adding the `input` field if not present in Story 2.6's implementation. This is a required change per architecture.md ToolStartPayload specification.

---

## Notes

### UX Design Decision: Bundled Activity Indicator

The UX specification states that all tools should be bundled in ONE activity indicator with expandable detail. However, for Story 2.9, we implement the **building blocks** (ToolStatusChip, ToolActivitySummary) that show individual chips. The collapse/expand behavior will be added in Story 2.10 when we handle tool completion.

Current implementation shows:
- Multiple chips when multiple tools are running
- Each chip shows tool name + input summary

Story 2.10 will add:
- Collapse/expand toggle
- Summary text when collapsed
- Completion state transitions

### Human-Readable Tool Names

A critical UX requirement is that tool names are human-readable. Users should see:
- "Reading file..." not "Read"
- "Searching..." not "Grep"
- "Checking calendar..." not "GOOGLE_CALENDAR_GET_EVENTS"

The `humanizeToolName()` function provides explicit mappings with a sensible fallback for unknown tools.

### Tool Input Privacy

Some tool inputs may contain sensitive information. The `summarizeToolInput()` function only extracts minimal context:
- Filenames (not full paths)
- Search patterns (not file contents)
- Domains (not full URLs with params)

This balances user understanding with privacy concerns.

### Relationship to Story 2.10

Story 2.10 (Render ToolResultBlock Status) will:
- Update chip state from 'running' to 'complete' or 'error'
- Add success/error icons
- Add optional expandable output
- Add collapse/expand for ActivityIndicator

This story focuses purely on **tool invocation** (ToolUseBlock), not completion.

### State Machine Tool Input

The streaming state machine from Story 2.6 tracks tools in `context.tools` Map. For AC #4 (input summarization), the ToolStatus interface **requires** an `input` field. Per architecture.md ToolStartPayload (lines 928-942), the `input: Record<string, unknown>` is provided in tool_start events. Task 4 explicitly requires verifying this field exists and adding it if missing.

### Tool Visibility During Thinking

Tools should display when `hasActiveTools === true` regardless of whether thinking is active. Claude can invoke tools while in the thinking phase, so both thinking indicator and tool chips may appear simultaneously. The rendering order is:
1. ThinkingIndicator (if thinking active)
2. ToolActivitySummary (if any tools running)
3. AssistantMessage (if text content exists)

### Future Enhancements (NOT in this story)

- ActivityIndicator collapse/expand (Story 2.10)
- Tool completion states with checkmark/X (Story 2.10)
- Tool output preview (Story 2.10)
- Tool cancellation (user presses ESC)
- Tool duration display
- Tool retry indicators

---

## References

- [Source: thoughts/planning-artifacts/epics.md#Story 2.9: Render ToolUseBlock Status]
- [Source: thoughts/planning-artifacts/architecture.md#Tool Lifecycle (lines 928-942)]
- [Source: thoughts/planning-artifacts/architecture.md#Canvas-Streaming Protocol (lines 1497-1503)]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#StatusIndicator (lines 1422-1433)]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#ActivityIndicator (lines 1435-1492)]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Design Principle (line 318)]
- [Source: .ralph/story-chain.md#Story 2.8 Notes for Next Story]
- [Source: Story 1.9 Status Indicator Component]
- [Source: Story 2.6 Create Streaming State Machine]
- [Source: Story 2.8 Render ThinkingBlock Indicator]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - expected: tool-display.ts, ToolStatusChip.tsx, ToolActivitySummary.tsx, updated ChatMessageList.tsx, updated index.ts)
