# Story 2.10: Render ToolResultBlock Status

Status: drafted

---

## Story Definition

| Field | Value |
|-------|-------|
| **Story ID** | 2-10-render-toolresultblock-status |
| **Epic** | Epic 2: First Conversation |
| **Status** | drafted |
| **Priority** | High (visual feedback for tool completion) |
| **Created** | 2026-01-24 |

---

## User Story

As a **user**,
I want to see when a tool completes,
So that I know the action succeeded or failed.

---

## Acceptance Criteria

1. **Given** a tool chip is displayed
   **When** a `ToolResultBlock` event arrives matching the tool's `id`
   **Then** the chip updates to show success (checkmark) or error (X) icon

2. **And** if error, the chip shows red styling

3. **And** tool output is optionally expandable (collapsed by default)

---

## Design References

### From Epic Definition (thoughts/planning-artifacts/epics.md)

**Story 2.10: Render ToolResultBlock Status:**

> As a **user**,
> I want to see when a tool completes,
> So that I know the action succeeded or failed.
>
> **Acceptance Criteria:**
>
> **Given** a tool chip is displayed
> **When** a `ToolResultBlock` event arrives matching the tool's `id`
> **Then** the chip updates to show success (checkmark) or error (X) icon
> **And** if error, the chip shows red styling
> **And** tool output is optionally expandable (collapsed by default)

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

**IPC Event Names (lines 968-978):**

| Event | Direction | Payload |
|-------|-----------|---------|
| `orion://tool/start` | Backend -> Frontend | `ToolStartPayload` |
| `orion://tool/complete` | Backend -> Frontend | `ToolCompletePayload` |

### From UX Design Specification (thoughts/planning-artifacts/ux-design-specification.md)

**ActivityIndicator States (lines 1443-1451):**

| State | Icon | Color | Description |
|-------|------|-------|-------------|
| Running | `lucide:loader-2` (spinning) | Gold | Active execution |
| **Completed** | **`lucide:check-circle`** | **Green (#059669)** | **Success** |
| **Failed** | **`lucide:alert-circle`** | **Red (#9B2C2C)** | **Error occurred** |
| Cancelled | `lucide:square` | Gray + strikethrough | User cancelled |

**Collapsed State (Default) (lines 1455-1461):**
```
+------------------------------------------------+
| [check] Checked calendar, found contact... 2.8s v |
+------------------------------------------------+
```
- Icon: Status indicator
- Text: Summary of actions (truncated)
- Time: Total execution duration
- Chevron: Expand indicator

**Expanded State (On Click) (lines 1463-1473):**
```
+------------------------------------------------+
| [check] Checked calendar, found contact... 2.8s ^ |
+------------------------------------------------+
| [check] [calendar] Found 3 available slots       |
| [check] [user]     sarah.chen@company.com        |
| [check] [gmail]    Drafted meeting request       |
+------------------------------------------------+
```
- Each tool call shown with:
  - Status icon (check/spinner/X)
  - Integration icon (Google Calendar, Gmail, etc.)
  - Result description

**Design Principle (line 318):**

> No matter how many tools the agent uses (calendar check, contact lookup, email draft), bundle everything in ONE activity indicator. Users see a summary; click to expand for tool-by-tool breakdown.

### From Story Chain (.ralph/story-chain.md)

**Story 2.9 Established:**

- `ToolStatusChip` component showing tool name + status indicator
- `ToolActivitySummary` container for multiple chips
- `humanizeToolName()` function for human-readable tool names
- `summarizeToolInput()` function for input display
- `ToolExecutionStatus` type: 'running' | 'complete' | 'error'
- `ToolInfo` interface with toolId, toolName, status, inputSummary
- Integration with `ChatMessageList` using `context.tools` Map
- Tool helper functions in `src/lib/tool-display.ts`

**Story 2.6 Established:**

- `streamingMachine` with states: idle, sending, streaming, complete, error
- `useStreamingMachine()` hook returning: state, context, send, reset, isLoading, isError, isComplete
- **`context.tools`** is a `Map<toolId, ToolStatus>` for tracking concurrent tools
- ToolStatus contains: name, status (running/complete/error), durationMs, input
- TOOL_START and TOOL_COMPLETE events update the tools Map

**Story 1.9 Established:**

- `StatusIndicator` component with 6 states (idle, thinking, acting, waiting, success, error)
- Gold checkmark for success state (StatusIndicator)
- Three sizes: sm (6px), md (8px), lg (12px)
- Reduced motion support via `prefers-reduced-motion`

**DESIGN NOTE (Icon Color Clarification from Story 2.9):**

For **Story 2.10 completion states**:
- Use **Lucide icons directly** (NOT StatusIndicator success state)
- Success: `lucide:check-circle` with green (#059669 light, #10B981 dark)
- Error: `lucide:alert-circle` with red (#9B2C2C light, #EF4444 dark)
- This matches the ActivityIndicator spec from UX design specification

### From PRD NFR Requirements

**NFR-1.1 (Performance):** First token latency p95 < 500ms
**NFR-5.1 (Usability):** Full keyboard navigation
**NFR-5.3 (Usability):** WCAG AA contrast compliance

---

## Technical Requirements

### Overview: Tool Completion Flow

When a `tool_complete` event arrives from the backend (via IPC), the state machine updates `context.tools` Map, changing the tool's status from 'running' to 'complete' or 'error'. This story updates the UI components to:

1. **Show completion icons** - Replace spinner with checkmark (success) or X (error) (AC #1)
2. **Apply error styling** - Red color and styling for failed tools (AC #2)
3. **Add expandable output** - Allow users to see tool results on demand (AC #3)

### Updated ToolStatusChip Component

The existing `ToolStatusChip` from Story 2.9 needs updates to handle completion states:

```typescript
// src/components/chat/ToolStatusChip.tsx (UPDATED from Story 2.9)

import { cn } from '@/lib/utils';
import { StatusIndicator, StatusIndicatorState } from '@/components/ui/StatusIndicator';
import { CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

/**
 * Status of a tool execution
 */
export type ToolExecutionStatus = 'running' | 'complete' | 'error';

/**
 * Props for ToolStatusChip
 * AC #1: Updates chip based on ToolResultBlock status
 * AC #2: Error styling when status='error'
 * AC #3: Expandable output
 */
export interface ToolStatusChipProps {
  /** Human-readable tool name (e.g., "Reading file...") */
  toolName: string;
  /** Current execution status */
  status: ToolExecutionStatus;
  /** Optional summary of tool input (e.g., "config.ts") */
  inputSummary?: string | null;
  /** Optional tool result (for expansion) */
  result?: unknown;
  /** Optional error message (for expansion) */
  errorMessage?: string | null;
  /** Execution duration in milliseconds */
  durationMs?: number;
  /** Whether to show expandable result */
  expandable?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Renders a single tool's status as a compact chip with completion state
 * AC #1: Shows success checkmark or error X based on ToolResultBlock
 * AC #2: Red styling for errors
 * AC #3: Expandable output section
 */
export function ToolStatusChip({
  toolName,
  status,
  inputSummary,
  result,
  errorMessage,
  durationMs,
  expandable = false,
  className,
}: ToolStatusChipProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if expandable (has result or error message)
  const hasExpandableContent = expandable && (result !== undefined || errorMessage);
  const canExpand = hasExpandableContent && status !== 'running';

  // AC #2: Error state styling
  const isError = status === 'error';

  return (
    <div
      className={cn(
        // Chip styling
        'inline-flex flex-col',
        'bg-orion-surface',
        'border',
        // AC #2: Red border for errors
        isError ? 'border-orion-error' : 'border-orion-border',
        // 0px radius per Editorial Luxury
        'rounded-none',
        className
      )}
      role="status"
      aria-label={`${toolName}${inputSummary ? `: ${inputSummary}` : ''} - ${status}`}
    >
      {/* Main chip row */}
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-2',
          'px-2 py-1',
          'text-xs',
          // AC #2: Red text for errors
          isError ? 'text-orion-error' : 'text-orion-fg-muted',
          // Hover state for expandable chips
          canExpand && 'hover:bg-orion-bg cursor-pointer',
          !canExpand && 'cursor-default'
        )}
        onClick={() => canExpand && setIsExpanded(!isExpanded)}
        aria-expanded={canExpand ? isExpanded : undefined}
        disabled={!canExpand}
      >
        {/* AC #1: Status icon based on completion state */}
        <ToolStatusIcon status={status} />

        {/* Tool name */}
        <span className="font-medium">{toolName}</span>

        {/* Input summary (optional) */}
        {inputSummary && (
          <span className={cn(
            'truncate max-w-[150px]',
            isError ? 'text-orion-error opacity-70' : 'text-orion-fg-muted opacity-70'
          )}>
            {inputSummary}
          </span>
        )}

        {/* Duration (when complete) */}
        {status !== 'running' && durationMs !== undefined && (
          <span className="text-orion-fg-muted opacity-50 ml-auto">
            {formatDuration(durationMs)}
          </span>
        )}

        {/* AC #3: Expand/collapse chevron */}
        {canExpand && (
          <span className="text-orion-fg-muted">
            {isExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </span>
        )}
      </button>

      {/* AC #3: Expandable output section */}
      {canExpand && isExpanded && (
        <div
          className={cn(
            'px-2 py-2',
            'border-t',
            isError ? 'border-orion-error bg-orion-error/5' : 'border-orion-border bg-orion-bg',
            'text-xs font-mono',
            'overflow-x-auto max-h-32 overflow-y-auto'
          )}
        >
          {isError && errorMessage ? (
            <span className="text-orion-error">{errorMessage}</span>
          ) : (
            <span className="text-orion-fg-muted">
              {typeof result === 'string'
                ? result
                : JSON.stringify(result, null, 2)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

ToolStatusChip.displayName = 'ToolStatusChip';

/**
 * Renders the appropriate status icon
 * AC #1: Checkmark for success, X for error, spinner for running
 */
function ToolStatusIcon({ status }: { status: ToolExecutionStatus }) {
  switch (status) {
    case 'running':
      // Use StatusIndicator for running state (gold spin)
      return <StatusIndicator status="acting" size="sm" />;

    case 'complete':
      // AC #1: Green checkmark for success
      return (
        <CheckCircle
          className="w-3.5 h-3.5 text-orion-success"
          aria-label="Completed successfully"
        />
      );

    case 'error':
      // AC #1 & #2: Red X for error
      return (
        <AlertCircle
          className="w-3.5 h-3.5 text-orion-error"
          aria-label="Failed"
        />
      );

    default:
      return <StatusIndicator status="acting" size="sm" />;
  }
}

/**
 * Format duration in human-readable format
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}
```

### Updated ToolActivitySummary Component

Add collapse/expand for the entire activity summary and show aggregated status:

```typescript
// src/components/chat/ToolActivitySummary.tsx (UPDATED from Story 2.9)

import { cn } from '@/lib/utils';
import { ToolStatusChip, ToolExecutionStatus } from './ToolStatusChip';
import { CheckCircle, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo } from 'react';

/**
 * Tool information for display (extended from Story 2.9)
 */
export interface ToolInfo {
  toolId: string;
  toolName: string;
  status: ToolExecutionStatus;
  inputSummary?: string | null;
  result?: unknown;
  errorMessage?: string | null;
  durationMs?: number;
}

/**
 * Props for ToolActivitySummary
 * AC #1, #2, #3: Multiple tools with completion states and expandability
 */
export interface ToolActivitySummaryProps {
  /** Array of tools */
  tools: ToolInfo[];
  /** Whether to show expanded by default */
  defaultExpanded?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Renders the activity indicator with collapse/expand per UX spec
 * Collapsed: Shows summary bar with overall status
 * Expanded: Shows individual tool chips with details
 */
export function ToolActivitySummary({
  tools,
  defaultExpanded = false,
  className,
}: ToolActivitySummaryProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Don't render if no tools
  if (tools.length === 0) {
    return null;
  }

  // Calculate aggregate status
  const aggregateStatus = useMemo(() => {
    const hasRunning = tools.some(t => t.status === 'running');
    const hasError = tools.some(t => t.status === 'error');
    const allComplete = tools.every(t => t.status === 'complete' || t.status === 'error');

    if (hasRunning) return 'running';
    if (hasError) return 'error';
    if (allComplete) return 'complete';
    return 'running';
  }, [tools]);

  // Calculate total duration
  const totalDuration = useMemo(() => {
    return tools.reduce((sum, t) => sum + (t.durationMs ?? 0), 0);
  }, [tools]);

  // Generate summary text
  const summaryText = useMemo(() => {
    if (tools.length === 1) {
      return tools[0].toolName;
    }

    // Join first 2-3 tool names, truncate if more
    const names = tools.slice(0, 3).map(t => t.toolName);
    const suffix = tools.length > 3 ? `, +${tools.length - 3} more` : '';
    return names.join(', ') + suffix;
  }, [tools]);

  return (
    <div
      className={cn(
        // Container styling matching UX spec ActivityIndicator
        'bg-orion-surface',
        'border border-orion-border',
        'rounded-none', // Editorial Luxury
        className
      )}
      role="region"
      aria-label={`${tools.length} tool${tools.length > 1 ? 's' : ''} - ${aggregateStatus}`}
    >
      {/* Collapsed summary bar (always visible) */}
      <button
        type="button"
        className={cn(
          'w-full flex items-center gap-2',
          'px-3 py-2',
          'text-xs text-orion-fg-muted',
          'hover:bg-orion-bg cursor-pointer',
          'transition-colors duration-100'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        {/* Aggregate status icon */}
        <AggregateStatusIcon status={aggregateStatus} />

        {/* Summary text */}
        <span className="truncate flex-1 text-left">
          {summaryText}
        </span>

        {/* Total duration (when not running) */}
        {aggregateStatus !== 'running' && totalDuration > 0 && (
          <span className="text-orion-fg-muted opacity-50">
            {formatDuration(totalDuration)}
          </span>
        )}

        {/* Expand/collapse chevron */}
        <span className="text-orion-fg-muted">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </span>
      </button>

      {/* Expanded: Individual tool chips */}
      {isExpanded && (
        <div
          className={cn(
            'border-t border-orion-border',
            'px-3 py-2',
            'flex flex-col gap-2'
          )}
        >
          {tools.map((tool) => (
            <ToolStatusChip
              key={tool.toolId}
              toolName={tool.toolName}
              status={tool.status}
              inputSummary={tool.inputSummary}
              result={tool.result}
              errorMessage={tool.errorMessage}
              durationMs={tool.durationMs}
              expandable={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

ToolActivitySummary.displayName = 'ToolActivitySummary';

/**
 * Aggregate status icon for the summary bar
 */
function AggregateStatusIcon({ status }: { status: 'running' | 'complete' | 'error' }) {
  switch (status) {
    case 'running':
      return (
        <Loader2
          className="w-4 h-4 text-orion-gold animate-spin"
          aria-label="In progress"
        />
      );

    case 'complete':
      return (
        <CheckCircle
          className="w-4 h-4 text-orion-success"
          aria-label="All completed"
        />
      );

    case 'error':
      return (
        <AlertCircle
          className="w-4 h-4 text-orion-error"
          aria-label="Error occurred"
        />
      );
  }
}

/**
 * Format duration in human-readable format
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}
```

### State Machine ToolStatus Extension

Ensure the ToolStatus interface in the state machine includes result and error fields:

```typescript
// src/machines/streamingMachine.ts (UPDATE if needed)

/**
 * ToolStatus interface - MUST include result and error for Story 2.10
 */
export interface ToolStatus {
  name: string;
  status: 'running' | 'complete' | 'error';
  input: Record<string, unknown>;
  result?: unknown;          // AC #3: Tool result for expansion
  errorMessage?: string;     // AC #2: Error message for display
  durationMs?: number;       // Duration tracking
}

// TOOL_COMPLETE event handler should update result/errorMessage:
// context.tools.set(event.toolId, {
//   ...existingTool,
//   status: event.isError ? 'error' : 'complete',
//   result: event.result,
//   errorMessage: event.isError ? String(event.result) : undefined,
//   durationMs: event.durationMs,
// });
```

### Updated ChatMessageList Integration

```typescript
// src/components/chat/ChatMessageList.tsx (UPDATED from Story 2.9)

import { useStreamingMachine } from '@/hooks/useStreamingMachine';
import { AssistantMessage } from './AssistantMessage';
import { ThinkingIndicator } from './ThinkingIndicator';
import { ToolActivitySummary, ToolInfo } from './ToolActivitySummary';
import { UserMessage } from './UserMessage';
import { humanizeToolName, summarizeToolInput } from '@/lib/tool-display';

/**
 * Renders the chat message list with streaming, thinking, and tool support
 * Updated in Story 2.10 to include tool completion states
 */
export function ChatMessageList() {
  const { state, context, isLoading } = useStreamingMachine();

  // Story 2.8: Show thinking indicator when thinking content exists but no text yet
  const isThinkingActive =
    state === 'streaming' &&
    context.thinking.length > 0 &&
    context.text.length === 0 &&
    context.tools.size === 0;

  // Story 2.9 + 2.10: Transform context.tools Map to ToolInfo array
  // AC #1, #2, #3: Include completion status, result, and error info
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

### Design Token Updates

Add success color token if not already present:

```css
/* globals.css - add if not present from Story 1.3/1.13 */

:root {
  /* Success color for tool completion */
  --orion-success: #059669;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Brighter in dark mode for visibility */
    --orion-success: #10B981;
  }
}

.dark {
  --orion-success: #10B981;
}
```

---

## Implementation Tasks

- [ ] Task 1: Update design tokens for success color (AC: #1)
  - [ ] 1.1: Verify `--orion-success` token exists in globals.css
  - [ ] 1.2: If missing, add `--orion-success: #059669` (light) and `#10B981` (dark)
  - [ ] 1.3: Add Tailwind extension for `text-orion-success` class

- [ ] Task 2: Update ToolStatusChip for completion states (AC: #1, #2, #3)
  - [ ] 2.1: Import Lucide icons: `CheckCircle`, `AlertCircle`, `ChevronDown`, `ChevronUp`
  - [ ] 2.2: Add `result`, `errorMessage`, `durationMs`, `expandable` props
  - [ ] 2.3: Create `ToolStatusIcon` sub-component
  - [ ] 2.4: Implement status-based icon rendering:
    - `running`: StatusIndicator with acting state
    - `complete`: CheckCircle with green (AC #1)
    - `error`: AlertCircle with red (AC #1, #2)
  - [ ] 2.5: Add red border styling for error state (AC #2)
  - [ ] 2.6: Add red text color for error state (AC #2)
  - [ ] 2.7: Add duration display for completed tools
  - [ ] 2.8: Implement expandable section with toggle (AC #3)
  - [ ] 2.9: Show result/error in expanded section (AC #3)
  - [ ] 2.10: Add aria-expanded attribute for accessibility

- [ ] Task 3: Update ToolActivitySummary for collapse/expand (AC: #3)
  - [ ] 3.1: Import Lucide icons for aggregate status
  - [ ] 3.2: Add `defaultExpanded` prop
  - [ ] 3.3: Implement collapse/expand state toggle
  - [ ] 3.4: Create collapsed summary bar with:
    - Aggregate status icon
    - Summary text
    - Total duration
    - Chevron
  - [ ] 3.5: Create expanded section showing individual ToolStatusChips
  - [ ] 3.6: Calculate aggregate status (running/complete/error)
  - [ ] 3.7: Add `formatDuration()` helper function
  - [ ] 3.8: Add keyboard accessibility (Enter/Space to toggle)

- [ ] Task 4: Update state machine ToolStatus interface
  - [ ] 4.1: Verify ToolStatus includes `result?: unknown` field
  - [ ] 4.2: Verify ToolStatus includes `errorMessage?: string` field
  - [ ] 4.3: If missing, add fields to ToolStatus interface
  - [ ] 4.4: Update TOOL_COMPLETE event handler to store result/errorMessage
  - [ ] 4.5: Extract error message from result when `isError === true`

- [ ] Task 5: Update ChatMessageList integration
  - [ ] 5.1: Update ToolInfo transformation to include result and errorMessage
  - [ ] 5.2: Update ToolInfo transformation to include durationMs
  - [ ] 5.3: Pass defaultExpanded={false} to ToolActivitySummary
  - [ ] 5.4: Change visibility logic: show when hasTools (not just hasActiveTools)

- [ ] Task 6: Update type exports
  - [ ] 6.1: Export updated ToolStatusChipProps from component
  - [ ] 6.2: Export updated ToolInfo interface
  - [ ] 6.3: Update barrel exports in `src/components/chat/index.ts`

- [ ] Task 7: Manual testing
  - [ ] 7.1: Trigger a successful tool call and verify green checkmark appears (AC #1)
  - [ ] 7.2: Trigger a failing tool call and verify red X appears (AC #1)
  - [ ] 7.3: Verify error chip has red border and text (AC #2)
  - [ ] 7.4: Verify expandable section shows result on click (AC #3)
  - [ ] 7.5: Verify collapsed summary shows aggregate status
  - [ ] 7.6: Verify duration displays correctly
  - [ ] 7.7: Test multiple tools with mixed success/error states
  - [ ] 7.8: Verify screen reader announces completion status
  - [ ] 7.9: Test keyboard navigation (Tab, Enter/Space to expand)
  - [ ] 7.10: Test dark mode appearance
  - [ ] 7.11: Test with `prefers-reduced-motion` (no spin animation)

---

## Dependencies

### Requires (from prior stories)

| Story | What It Provides | Why Needed |
|-------|------------------|------------|
| Story 2.9 | `ToolStatusChip` component (base) | To extend with completion states |
| Story 2.9 | `ToolActivitySummary` component (base) | To extend with collapse/expand |
| Story 2.9 | `humanizeToolName()`, `summarizeToolInput()` | Tool display helpers |
| Story 2.9 | `ToolExecutionStatus` type | Status type (extended) |
| Story 2.6 | `useStreamingMachine()` hook | To get `context.tools` Map |
| Story 2.6 | `context.tools` Map<toolId, ToolStatus> | To track tool completion |
| Story 2.6 | TOOL_COMPLETE event handling | To trigger completion state |
| Story 2.8 | `ThinkingIndicator` component | Visual ordering reference |
| Story 2.7 | `AssistantMessage` component | Rendered after tools |
| Story 1.9 | `StatusIndicator` component | For running state indicator |
| Story 1.3 | `--orion-*` design tokens | For colors including error |
| Story 1.13/1.14 | Dark mode support | Success/error colors adapt |

### Provides For (future stories)

| Story | What This Story Provides |
|-------|--------------------------|
| Story 2.11 | Completion indicator pattern for ResultMessage |
| Story 2.12 | Duration display pattern for cost metrics |
| Epic 12 | Error styling pattern for permission denials |
| Epic 8 | Tool status UI for built-in tool servers |

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Screen reader support** | `role="status"` with status in aria-label |
| **Completion announcement** | aria-label includes "Completed successfully" or "Failed" |
| **Expandable content** | `aria-expanded` attribute on toggle button |
| **Keyboard navigation** | Tab to focus, Enter/Space to expand/collapse |
| **Error identification** | Error state announced via aria-label, not just color |
| **Reduced motion** | Loader2 spin animation respects `prefers-reduced-motion` |
| **Color contrast** | Green/red meet WCAG AA on respective backgrounds |

---

## File Locations

### Files to Create

| File | Purpose |
|------|---------|
| None | All components exist from Story 2.9, only modifications needed |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/chat/ToolStatusChip.tsx` | Add completion icons, error styling, expandable output |
| `src/components/chat/ToolActivitySummary.tsx` | Add collapse/expand, aggregate status |
| `src/components/chat/ChatMessageList.tsx` | Pass result/error to ToolInfo, update visibility logic |
| `src/machines/streamingMachine.ts` | Add result/errorMessage to ToolStatus (if missing) |
| `src/globals.css` | Add `--orion-success` token (if missing) |
| `tailwind.config.ts` | Add `orion-success` color (if missing) |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `src/lib/tool-display.ts` | Tool helpers complete from Story 2.9 |
| `src/components/ui/StatusIndicator.tsx` | Only used for running state (kept simple) |
| `src/components/chat/ThinkingIndicator.tsx` | Complete from Story 2.8 |
| `src/components/chat/AssistantMessage.tsx` | Complete from Story 2.7 |

---

## Definition of Done

- [ ] `--orion-success` design token exists (green color)
- [ ] ToolStatusChip shows green checkmark for complete status (AC #1)
- [ ] ToolStatusChip shows red X for error status (AC #1)
- [ ] Error chips have red border and text (AC #2)
- [ ] ToolStatusChip expands to show result/error on click (AC #3)
- [ ] ToolActivitySummary collapses to summary bar by default (AC #3)
- [ ] ToolActivitySummary expands to show individual chips (AC #3)
- [ ] Aggregate status icon reflects overall state (running/complete/error)
- [ ] Duration displays for completed tools
- [ ] ToolStatus in state machine includes result and errorMessage fields
- [ ] TOOL_COMPLETE event correctly updates tool status with result
- [ ] ChatMessageList shows tools even after all complete
- [ ] Components are accessible (ARIA attributes, keyboard nav)
- [ ] `npm run build` completes successfully
- [ ] `npm run typecheck` passes
- [ ] Manual testing confirms completion states work correctly
- [ ] Dark mode displays success/error colors correctly

---

## Test Strategy

> **Note:** The test cases below are the authoritative test reference for this story. The ATDD checklist will be generated from this specification during the TEA ATDD step.

### Unit Tests (Core)

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.10-UNIT-001 | ToolStatusIcon renders CheckCircle when status='complete' | #1 |
| 2.10-UNIT-002 | ToolStatusIcon renders AlertCircle when status='error' | #1 |
| 2.10-UNIT-003 | ToolStatusIcon renders StatusIndicator when status='running' | #1 |
| 2.10-UNIT-004 | CheckCircle has text-orion-success class | #1 |
| 2.10-UNIT-005 | AlertCircle has text-orion-error class | #1, #2 |
| 2.10-UNIT-006 | ToolStatusChip has red border when status='error' | #2 |
| 2.10-UNIT-007 | ToolStatusChip has red text when status='error' | #2 |
| 2.10-UNIT-008 | ToolStatusChip shows chevron when expandable=true and status!='running' | #3 |
| 2.10-UNIT-009 | ToolStatusChip hides chevron when status='running' | #3 |
| 2.10-UNIT-010 | ToolStatusChip expands on click when expandable | #3 |
| 2.10-UNIT-011 | ToolStatusChip shows result in expanded section | #3 |
| 2.10-UNIT-012 | ToolStatusChip shows errorMessage in expanded section when error | #3 |
| 2.10-UNIT-013 | ToolStatusChip has aria-expanded attribute when expandable | #3 |
| 2.10-UNIT-014 | ToolStatusChip displays duration in human format | #1 |
| 2.10-UNIT-015 | formatDuration returns "ms" for <1000ms | #1 |
| 2.10-UNIT-016 | formatDuration returns "s" with decimal for >=1000ms | #1 |
| 2.10-UNIT-017 | ToolActivitySummary renders collapsed by default | #3 |
| 2.10-UNIT-018 | ToolActivitySummary expands on click | #3 |
| 2.10-UNIT-019 | ToolActivitySummary shows individual chips when expanded | #3 |
| 2.10-UNIT-020 | ToolActivitySummary calculates aggregate status correctly - running | #1 |
| 2.10-UNIT-021 | ToolActivitySummary calculates aggregate status correctly - complete | #1 |
| 2.10-UNIT-022 | ToolActivitySummary calculates aggregate status correctly - error | #1, #2 |
| 2.10-UNIT-023 | ToolActivitySummary shows total duration when complete | #1 |
| 2.10-UNIT-024 | ToolActivitySummary shows Loader2 spinner when running | #1 |
| 2.10-UNIT-025 | ToolActivitySummary shows CheckCircle when all complete | #1 |
| 2.10-UNIT-026 | ToolActivitySummary shows AlertCircle when any error | #1, #2 |

### Component Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.10-COMP-001 | ChatMessageList passes result to ToolInfo | #3 |
| 2.10-COMP-002 | ChatMessageList passes errorMessage to ToolInfo | #2, #3 |
| 2.10-COMP-003 | ChatMessageList passes durationMs to ToolInfo | #1 |
| 2.10-COMP-004 | ChatMessageList shows ToolActivitySummary after all tools complete | #1 |
| 2.10-COMP-005 | ChatMessageList shows ToolActivitySummary with mixed states | #1, #2 |

### Integration Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.10-INT-001 | Full flow: TOOL_COMPLETE event updates chip to show checkmark | #1 |
| 2.10-INT-002 | Full flow: TOOL_COMPLETE with isError=true shows red X | #1, #2 |
| 2.10-INT-003 | Full flow: Clicking expand reveals tool result | #3 |
| 2.10-INT-004 | Full flow: Error result is stored in errorMessage | #2, #3 |
| 2.10-INT-005 | Full flow: Duration is calculated from TOOL_COMPLETE event | #1 |

### E2E Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.10-E2E-001 | User sees checkmark when tool completes successfully | #1 |
| 2.10-E2E-002 | User sees red X when tool fails | #1, #2 |
| 2.10-E2E-003 | Error chip has red styling | #2 |
| 2.10-E2E-004 | Clicking collapsed summary expands to show tools | #3 |
| 2.10-E2E-005 | Clicking chip expands to show result | #3 |
| 2.10-E2E-006 | Keyboard navigation works (Tab, Enter to expand) | #3 |
| 2.10-E2E-007 | Dark mode renders success/error colors correctly | #1, #2 |
| 2.10-E2E-008 | Reduced motion preference disables spin animation | #1 |

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| Design token updates | 30 minutes |
| ToolStatusChip updates (icons, error styling, expand) | 2 hours |
| ToolActivitySummary updates (collapse/expand, aggregate) | 2 hours |
| State machine updates (result/errorMessage fields) | 45 minutes |
| ChatMessageList integration | 45 minutes |
| Type exports | 15 minutes |
| Testing | 2.5 hours |
| Documentation | 30 minutes |
| **Total** | 9.5 hours |

---

## Notes

### Relationship to Story 2.9

Story 2.9 established the foundation:
- ToolStatusChip showing tool name and running spinner
- ToolActivitySummary showing multiple chips
- Tool display helpers (humanization, input summarization)

Story 2.10 extends this foundation with:
- Completion states (success checkmark, error X)
- Error styling (red border, red text)
- Expandable content (click to see result/error)
- Collapse/expand for entire activity summary

### Icon Color Design Decision

The UX spec defines different icon approaches for different contexts:
- **StatusIndicator** (Story 1.9): Gold checkmark for success
- **ActivityIndicator** (this story): Green checkmark for completion

We follow the ActivityIndicator spec because:
1. Green universally signals "success" more clearly than gold
2. Gold is already heavily used for "active/working" states
3. Semantic color distinction: gold = working, green = done, red = error

### Expandable Content Security

Tool results may contain sensitive information. The expandable section:
- Only shows when user explicitly clicks to expand
- Collapsed by default to avoid accidental data exposure
- Result is displayed as-is (string) or JSON.stringify() for objects
- No automatic truncation in expanded view (overflow scrolling instead)

### Aggregate Status Logic

When multiple tools are tracked:
- `running`: ANY tool is still running
- `error`: NO running tools AND at least one error
- `complete`: ALL tools are complete (no running, no error)

This ensures the user sees "running" until everything finishes, then sees "error" if anything failed.

### Future Enhancements (NOT in this story)

- Tool cancellation UI (ESC key to stop)
- Tool retry button
- Tool output syntax highlighting
- Copy tool output button
- Tool timeline visualization
- Tool execution analytics

---

## References

- [Source: thoughts/planning-artifacts/epics.md#Story 2.10: Render ToolResultBlock Status]
- [Source: thoughts/planning-artifacts/architecture.md#Tool Lifecycle (lines 928-942)]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#ActivityIndicator (lines 1435-1492)]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Dark Mode Token Palette (lines 658-680)]
- [Source: .ralph/story-chain.md#Story 2.9 Established]
- [Source: .ralph/story-chain.md#Story 2.6 Established]
- [Source: Story 2.9 Render ToolUseBlock Status]
- [Source: Story 1.9 Status Indicator Component]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - expected: updated ToolStatusChip.tsx, updated ToolActivitySummary.tsx, updated ChatMessageList.tsx, potentially updated streamingMachine.ts)
