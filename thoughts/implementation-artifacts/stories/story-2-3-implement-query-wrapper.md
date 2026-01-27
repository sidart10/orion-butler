# Story 2.3: Implement query() Wrapper

Status: drafted

---

## Story Definition

| Field | Value |
|-------|-------|
| **Story ID** | 2-3-implement-query-wrapper |
| **Epic** | Epic 2: First Conversation |
| **Status** | drafted |
| **Priority** | Critical (enables all streaming functionality) |
| **Created** | 2026-01-24 |

---

## User Story

As a **developer**,
I want a wrapped `query()` function with error handling,
So that streaming responses are properly managed.

---

## Acceptance Criteria

1. **Given** the SDK wrapper interface (Story 2.2)
   **When** I call `agentSDK.query(prompt, options)`
   **Then** it returns an async iterator yielding SDK message types

2. **And** API errors are caught and wrapped in a consistent error type

3. **And** the wrapper supports optional `sessionId` for continuity

4. **And** the wrapper supports optional `model` selection (Opus, Sonnet)

---

## Design References

### From Architecture (thoughts/planning-artifacts/architecture.md)

**SDK Wrapper Pattern (lines 776-850):**

The architecture defines the SDK wrapper in `src/lib/sdk/client.ts`:
- Session naming conventions: `orion-daily-YYYY-MM-DD`, `orion-project-{slug}`, etc.
- Factory function `createAgentOptions()` builds `ClaudeAgentOptions`
- `streamQuery()` function as async generator

**Relevant Architecture Code:**

```typescript
// Main query function exposed to UI (from architecture.md)
export async function* streamQuery(
  prompt: string,
  sessionType: OrionSession['type'],
  context?: string
): AsyncGenerator<StreamMessage> {
  const sessionId = getSessionId(sessionType, context);
  const options = createAgentOptions({...});

  for await (const message of query({ prompt, options })) {
    // Transform SDK messages to Orion stream format
    yield transformMessage(message);
  }
}
```

**Error Handling Patterns (architecture.md lines 1151-1166):**

- Core layer uses `neverthrow` Result types
- Policy: Fail-open reads / Fail-closed writes
- Error flow: SDK Error -> Result<T, AppError> -> IPC serializes -> UI handles

**Error Categories (architecture.md):**

| Category | Code | Action |
|----------|------|--------|
| Recoverable | 1xxx | Toast + retry |
| Auth Required | 2xxx | Redirect to re-auth |
| Rate Limited | 3xxx | Auto-retry with backoff |
| Fatal | 9xxx | Error boundary |

### From Research (thoughts/research/claude-agent-sdk-deep-dive.md)

**SDK query() Function:**

```python
# Python SDK equivalent (TypeScript pattern is similar)
from claude_agent_sdk import query, AssistantMessage, TextBlock, ToolUseBlock, ResultMessage

async for message in query(prompt="What is 2 + 2?"):
    # Process each message as it arrives
    if isinstance(message, AssistantMessage):
        for block in message.content:
            if isinstance(block, TextBlock):
                yield {"type": "text", "content": block.text}
```

**TypeScript SDK Pattern:**

```typescript
import { query, ClaudeAgentOptions } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Hello",
  options: { model: 'claude-sonnet-4-5-20250929' }
})) {
  console.log(message);
}
```

**SDK Message Types:**

| Type | SDK Class | Description |
|------|-----------|-------------|
| Text content | `TextBlock` | Claude's text response |
| Thinking | `ThinkingBlock` | Internal reasoning |
| Tool invocation | `ToolUseBlock` | Tool being called |
| Tool result | `ToolResultBlock` | Tool output |
| Final result | `ResultMessage` | Completion info with cost, duration |

**Error Handling Notes:**

The Claude Agent SDK does NOT export specific error classes. Errors are detected via:

1. `SDKResultMessage.subtype !== 'success'`
   - `'error_max_turns'` - Hit turn limit
   - `'error_during_execution'` - Runtime error
   - `'error_max_budget_usd'` - Budget exceeded
   - `'error_max_structured_output_retries'` - Output parsing failed

2. Process spawn failures (Node.js level)
   - Handle via try/catch around `query()` iteration

3. Network/connection issues
   - Manifest as process errors or empty responses

### From Streaming Architecture (thoughts/research/streaming-architecture.md)

**Message Protocol Reference:**

```typescript
type AgentMessage =
  | { type: 'thinking' }
  | { type: 'text', content: string }
  | { type: 'tool_start', toolName: string, toolId: string }
  | { type: 'tool_complete', toolId: string, isError: boolean }
  | { type: 'result', duration: number, cost: number | null, isError: boolean }
  | { type: 'complete' }
  | { type: 'error', error: string };
```

**Content Block Structure:**

```typescript
@dataclass
class TextBlock:
    text: str

@dataclass
class ToolUseBlock:
    id: str
    name: str
    input: dict[str, Any]

@dataclass
class ToolResultBlock:
    tool_use_id: str
    content: str | list[dict[str, Any]] | None
    is_error: bool | None

@dataclass
class ResultMessage:
    subtype: str
    duration_ms: int
    is_error: bool
    num_turns: int
    session_id: str
    total_cost_usd: float | None
    usage: dict[str, Any] | None
    result: str | None
```

### From Story Chain (.ralph/story-chain.md)

**Story 2.2 Established:**

- `IAgentSDK` interface with `query()`, `getSession()`, `endSession()`, `isReady()` methods
- `StreamMessage` discriminated union for streaming events
- `QueryOptions` interface with `sessionId?`, `model?` parameters
- `ClaudeAgentSDK` class with skeleton `query()` implementation
- Barrel export pattern via `src/lib/sdk/index.ts`
- Session ID naming pattern: `orion-{type}-{identifier}`

**Notes for Story 2.3 from Story 2.2:**

> - Implement full message transformation in `transformSdkMessages()`
> - Handle AssistantMessage, TextBlock, ToolUseBlock, ToolResultBlock, ResultMessage
> - Add error handling with retry logic
> - Support optional `sessionId` for continuity
> - Support optional `model` selection (Opus, Sonnet)
> - Return StreamMessage types that decouple from SDK

---

## Technical Requirements

### Complete query() Implementation

Implement the full `query()` method in `ClaudeAgentSDK` class with message transformation:

```typescript
// src/lib/sdk/claude-agent-sdk.ts

import { query as sdkQuery } from "@anthropic-ai/claude-agent-sdk";
import type {
  SDKMessage,
  SDKAssistantMessage,
  SDKResultMessage,
  SDKSystemMessage,
  SDKPartialAssistantMessage,
  Options,
} from "@anthropic-ai/claude-agent-sdk";

// Note: Content block types (TextBlock, ToolUseBlock, etc.) are from
// the Anthropic SDK and accessed via message.message.content
// They are not directly exported from the Agent SDK
import type {
  IAgentSDK,
  QueryOptions,
  SessionType,
  OrionSession,
  StreamMessage,
} from "./types";
import { OrionError, ErrorCode, isRetryableError } from "./errors";
```

### Message Transformation Implementation

Create `transformSdkMessage()` function to convert SDK messages to Orion `StreamMessage`:

```typescript
/**
 * Transform SDK messages to Orion StreamMessage format
 *
 * SDK Message Structure:
 * - SDKAssistantMessage: message.message.content contains blocks
 * - SDKPartialAssistantMessage: event contains RawMessageStreamEvent
 * - SDKResultMessage: subtype indicates success/error
 * - SDKSystemMessage: session_id for resume capability
 */
function* transformSdkMessage(
  sdkMessage: SDKMessage,
  sessionId: string
): Generator<StreamMessage> {
  // Handle complete assistant messages
  if (isAssistantMessage(sdkMessage)) {
    // Content is at message.message.content (nested!)
    const content = sdkMessage.message.content;

    for (const block of content) {
      if (isTextBlock(block)) {
        yield {
          type: "text",
          content: block.text,
        };
      } else if (isThinkingBlock(block)) {
        yield {
          type: "thinking",
          content: block.thinking,
        };
      } else if (isToolUseBlock(block)) {
        yield {
          type: "tool_start",
          toolId: block.id,
          toolName: block.name,
          input: block.input as Record<string, unknown>,
        };
      }
    }
  }

  // Handle streaming partial messages
  if (isPartialMessage(sdkMessage)) {
    // SDKPartialAssistantMessage has event: RawMessageStreamEvent
    // This contains delta events for streaming
    const event = sdkMessage.event;
    // Process streaming event delta...
  }

  // Handle result messages
  if (isResultMessage(sdkMessage)) {
    // Check subtype for success vs error
    if (sdkMessage.subtype === "success") {
      yield {
        type: "complete",
        sessionId: sdkMessage.session_id ?? sessionId,
        durationMs: sdkMessage.duration_ms ?? 0,
        costUsd: sdkMessage.total_cost_usd ?? null,
      };
    } else {
      // Error subtypes: error_max_turns, error_during_execution, etc.
      yield {
        type: "error",
        code: sdkMessage.subtype,
        message: sdkMessage.errors?.join("; ") ?? "Unknown error",
        recoverable: false,
      };
    }
  }

  // Handle system init message (capture session_id)
  if (isSystemMessage(sdkMessage)) {
    // Store session_id for resume capability
    // sdkMessage.session_id is the session ID
  }
}
```

### Type Guard Functions

Create type guards for SDK message types:

```typescript
// src/lib/sdk/type-guards.ts

import type {
  AssistantMessage,
  ResultMessage,
  TextBlock,
  ThinkingBlock,
  ToolUseBlock,
  ToolResultBlock,
} from "@anthropic-ai/claude-agent-sdk";

/**
 * Type guard for SDKAssistantMessage
 * Has type: 'assistant' and message.content array
 */
export function isAssistantMessage(msg: SDKMessage): msg is SDKAssistantMessage {
  return msg.type === "assistant";
}

/**
 * Type guard for SDKResultMessage
 * Has type: 'result' and subtype: 'success' | 'error_*'
 */
export function isResultMessage(msg: SDKMessage): msg is SDKResultMessage {
  return msg.type === "result";
}

/**
 * Type guard for SDKSystemMessage
 * Has type: 'system' and subtype: 'init' | 'compact_boundary'
 */
export function isSystemMessage(msg: SDKMessage): msg is SDKSystemMessage {
  return msg.type === "system" && msg.subtype === "init";
}

/**
 * Type guard for SDKPartialAssistantMessage (streaming)
 * Has type: 'stream_event'
 */
export function isPartialMessage(msg: SDKMessage): msg is SDKPartialAssistantMessage {
  return msg.type === "stream_event";
}

/**
 * Content block type guards (for blocks inside message.message.content)
 */
export function isTextBlock(block: unknown): block is { type: 'text'; text: string } {
  return (
    typeof block === "object" &&
    block !== null &&
    "type" in block &&
    (block as { type: string }).type === "text"
  );
}

export function isThinkingBlock(block: unknown): block is { type: 'thinking'; thinking: string } {
  return (
    typeof block === "object" &&
    block !== null &&
    "type" in block &&
    (block as { type: string }).type === "thinking"
  );
}

export function isToolUseBlock(block: unknown): block is { type: 'tool_use'; id: string; name: string; input: unknown } {
  return (
    typeof block === "object" &&
    block !== null &&
    "type" in block &&
    (block as { type: string }).type === "tool_use"
  );
}

export function isToolResultBlock(block: unknown): block is { type: 'tool_result'; tool_use_id: string; content: unknown } {
  return (
    typeof block === "object" &&
    block !== null &&
    "type" in block &&
    (block as { type: string }).type === "tool_result"
  );
}

export function isTextBlock(block: unknown): block is TextBlock {
  return (
    typeof block === "object" &&
    block !== null &&
    "type" in block &&
    (block as { type: string }).type === "text"
  );
}

export function isThinkingBlock(block: unknown): block is ThinkingBlock {
  return (
    typeof block === "object" &&
    block !== null &&
    "type" in block &&
    (block as { type: string }).type === "thinking"
  );
}

export function isToolUseBlock(block: unknown): block is ToolUseBlock {
  return (
    typeof block === "object" &&
    block !== null &&
    "type" in block &&
    (block as { type: string }).type === "tool_use"
  );
}

export function isToolResultBlock(block: unknown): block is ToolResultBlock {
  return (
    typeof block === "object" &&
    block !== null &&
    "type" in block &&
    (block as { type: string }).type === "tool_result"
  );
}
```

### Error Types

Create consistent error types for the wrapper:

```typescript
// src/lib/sdk/errors.ts

/**
 * Error codes following architecture.md error categories
 */
export enum ErrorCode {
  // Recoverable (1xxx)
  SDK_ERROR = "1001",
  NETWORK_ERROR = "1002",
  TIMEOUT_ERROR = "1003",

  // Auth Required (2xxx)
  AUTH_REQUIRED = "2001",
  API_KEY_MISSING = "2002",

  // Rate Limited (3xxx)
  RATE_LIMITED = "3001",
  QUOTA_EXCEEDED = "3002",

  // Fatal (9xxx)
  FATAL_ERROR = "9001",
  CLI_NOT_FOUND = "9002",
}

/**
 * Orion SDK Error - wraps all SDK errors in consistent format
 */
export class OrionError extends Error {
  code: ErrorCode;
  recoverable: boolean;
  originalError?: Error;
  retryAfterMs?: number;

  constructor(
    message: string,
    code: ErrorCode,
    options?: {
      recoverable?: boolean;
      originalError?: Error;
      retryAfterMs?: number;
    }
  ) {
    super(message);
    this.name = "OrionError";
    this.code = code;
    this.recoverable = options?.recoverable ?? isRecoverableCode(code);
    this.originalError = options?.originalError;
    this.retryAfterMs = options?.retryAfterMs;
  }
}

/**
 * Determine if error code is recoverable based on architecture categories
 */
function isRecoverableCode(code: ErrorCode): boolean {
  return code.startsWith("1") || code.startsWith("3");
}

/**
 * Error Handling Notes:
 *
 * The Claude Agent SDK does NOT export specific error classes.
 * Errors are detected via:
 *
 * 1. SDKResultMessage.subtype !== 'success'
 *    - 'error_max_turns' - Hit turn limit
 *    - 'error_during_execution' - Runtime error
 *    - 'error_max_budget_usd' - Budget exceeded
 *    - 'error_max_structured_output_retries' - Output parsing failed
 *
 * 2. Process spawn failures (Node.js level)
 *    - Handle via try/catch around query() iteration
 *
 * 3. Network/connection issues
 *    - Manifest as process errors or empty responses
 */
export function wrapSdkError(error: unknown): OrionError {
  const message = error instanceof Error ? error.message : String(error);

  // Detect error patterns from message content
  if (message.includes("max_turns") || message.includes("turn limit")) {
    return new OrionError("Maximum turns exceeded", ErrorCode.SDK_ERROR, { recoverable: false });
  }

  if (message.includes("budget") || message.includes("cost")) {
    return new OrionError("Budget limit exceeded", ErrorCode.QUOTA_EXCEEDED, { recoverable: false });
  }

  // Detect CLI not found
  if (message.includes("CLI not found") || message.includes("claude not installed")) {
    return new OrionError(
      "Claude Code CLI is not installed",
      ErrorCode.CLI_NOT_FOUND,
      { recoverable: false }
    );
  }

  // Detect rate limiting
  if (message.includes("rate limit") || message.includes("429")) {
    return new OrionError(
      "API rate limit exceeded. Please try again later.",
      ErrorCode.RATE_LIMITED,
      { recoverable: true, retryAfterMs: 60000 }
    );
  }

  // Detect auth errors
  if (message.includes("unauthorized") || message.includes("401") || message.includes("API key")) {
    return new OrionError(
      "Authentication required. Please check your API key.",
      ErrorCode.AUTH_REQUIRED,
      { recoverable: false }
    );
  }

  // Detect network errors
  if (message.includes("network") || message.includes("connection") || message.includes("ECONNREFUSED")) {
    return new OrionError(
      "Network error. Please check your connection.",
      ErrorCode.NETWORK_ERROR,
      { recoverable: true }
    );
  }

  // Default to generic SDK error
  return new OrionError(
    message || "An unexpected error occurred",
    ErrorCode.SDK_ERROR,
    { recoverable: true }
  );
}
```

### Full query() Implementation

Complete implementation with error handling and model selection:

```typescript
// In src/lib/sdk/claude-agent-sdk.ts

export class ClaudeAgentSDK implements IAgentSDK {
  private sessions: Map<string, OrionSession> = new Map();

  /**
   * Send a query and stream responses
   * AC: #1, #2, #3, #4
   */
  async *query(prompt: string, options?: QueryOptions): AsyncGenerator<StreamMessage> {
    // AC #3: Support optional sessionId for continuity
    const sessionId = options?.sessionId ?? this.generateSessionId("adhoc");

    // AC #4: Support optional model selection (Opus, Sonnet)
    const model = options?.model ?? "claude-sonnet-4-20250514";

    const sdkOptions: ClaudeAgentOptions = {
      model,
      resume: sessionId,
      persistSession: true,
      maxTurns: options?.maxTurns ?? 100,
    };

    if (options?.systemPrompt) {
      sdkOptions.systemPrompt = options.systemPrompt;
    }

    try {
      // AC #1: Return async iterator yielding SDK message types
      for await (const message of sdkQuery({ prompt, options: sdkOptions })) {
        yield* this.transformSdkMessage(message, sessionId);
      }
    } catch (error) {
      // AC #2: API errors caught and wrapped in consistent error type
      const orionError = wrapSdkError(error);

      yield {
        type: "error",
        code: orionError.code,
        message: orionError.message,
        recoverable: orionError.recoverable,
      };
    }
  }

  /**
   * Transform SDK messages to Orion StreamMessage format
   * Decouples application from SDK message structure
   */
  private *transformSdkMessage(
    sdkMessage: unknown,
    sessionId: string
  ): Generator<StreamMessage> {
    // Handle AssistantMessage with content blocks
    if (isAssistantMessage(sdkMessage)) {
      for (const block of sdkMessage.message.content) {
        if (isTextBlock(block)) {
          yield {
            type: "text",
            content: block.text,
          };
        } else if (isThinkingBlock(block)) {
          yield {
            type: "thinking",
            content: block.thinking,
          };
        } else if (isToolUseBlock(block)) {
          yield {
            type: "tool_start",
            toolId: block.id,
            toolName: block.name,
            input: block.input as Record<string, unknown>,
          };
        } else if (isToolResultBlock(block)) {
          yield {
            type: "tool_complete",
            toolId: block.tool_use_id,
            result: block.content,
            isError: block.is_error ?? false,
          };
        }
      }
    }

    // Handle ResultMessage (completion)
    if (isResultMessage(sdkMessage)) {
      yield {
        type: "complete",
        sessionId: sdkMessage.session_id ?? sessionId,
        durationMs: sdkMessage.duration_ms ?? 0,
        costUsd: sdkMessage.total_cost_usd ?? null,
      };
    }
  }

  /**
   * Generate session ID following architecture naming convention
   */
  private generateSessionId(type: SessionType, context?: string): string {
    const date = new Date().toISOString().split("T")[0];
    switch (type) {
      case "daily":
        return `orion-daily-${date}`;
      case "project":
        if (!context) throw new Error("Project sessions require context");
        return `orion-project-${context}`;
      case "inbox":
        return `orion-inbox-${date}`;
      case "adhoc":
        return `orion-adhoc-${Date.now()}`;
    }
  }

  // ... getSession, endSession, isReady from Story 2.2
}
```

### Updated Types

Ensure `QueryOptions` supports model selection (from Story 2.2 types.ts):

```typescript
// Verify in src/lib/sdk/types.ts

/**
 * Query options for SDK interactions
 * AC #3: Optional sessionId for continuity
 * AC #4: Optional model selection
 */
export interface QueryOptions {
  /** Session ID for conversation continuity (AC #3) */
  sessionId?: string;

  /** Model selection: Opus or Sonnet (AC #4) */
  model?: "claude-opus-4-5-20250514" | "claude-sonnet-4-20250514";

  /** Custom system prompt */
  systemPrompt?: string;

  /** Maximum number of turns */
  maxTurns?: number;
}
```

---

## Implementation Tasks

- [ ] Task 1: Create error types (AC: #2)
  - [ ] 1.1: Create `src/lib/sdk/errors.ts`
  - [ ] 1.2: Define `ErrorCode` enum following architecture categories (1xxx, 2xxx, 3xxx, 9xxx)
  - [ ] 1.3: Create `OrionError` class with code, recoverable, originalError, retryAfterMs
  - [ ] 1.4: Implement `wrapSdkError()` function with error detection patterns

- [ ] Task 2: Create type guards (AC: #1)
  - [ ] 2.1: Create `src/lib/sdk/type-guards.ts`
  - [ ] 2.2: Implement `isAssistantMessage()` type guard
  - [ ] 2.3: Implement `isResultMessage()` type guard
  - [ ] 2.4: Implement `isTextBlock()` type guard
  - [ ] 2.5: Implement `isThinkingBlock()` type guard
  - [ ] 2.6: Implement `isToolUseBlock()` type guard
  - [ ] 2.7: Implement `isToolResultBlock()` type guard

- [ ] Task 3: Implement message transformation (AC: #1)
  - [ ] 3.1: Add `transformSdkMessage()` method to `ClaudeAgentSDK` class
  - [ ] 3.2: Handle `AssistantMessage` -> iterate content blocks
  - [ ] 3.3: Transform `TextBlock` -> `{ type: "text", content }`
  - [ ] 3.4: Transform `ThinkingBlock` -> `{ type: "thinking", content }`
  - [ ] 3.5: Transform `ToolUseBlock` -> `{ type: "tool_start", toolId, toolName, input }`
  - [ ] 3.6: Transform `ToolResultBlock` -> `{ type: "tool_complete", toolId, result, isError }`
  - [ ] 3.7: Transform `ResultMessage` -> `{ type: "complete", sessionId, durationMs, costUsd }`

- [ ] Task 4: Complete query() implementation (AC: #1, #2, #3, #4)
  - [ ] 4.1: Update `query()` method to use real SDK `query()` call
  - [ ] 4.2: Add sessionId parameter support from `QueryOptions` (AC #3)
  - [ ] 4.3: Add model parameter support from `QueryOptions` (AC #4)
  - [ ] 4.4: Wrap SDK calls in try/catch
  - [ ] 4.5: Convert caught errors to `OrionError` via `wrapSdkError()` (AC #2)
  - [ ] 4.6: Yield error as `StreamMessage` of type "error"

- [ ] Task 5: Update barrel exports
  - [ ] 5.1: Export `OrionError` and `ErrorCode` from `src/lib/sdk/index.ts`
  - [ ] 5.2: Export type guards from `src/lib/sdk/index.ts`

- [ ] Task 6: Build verification
  - [ ] 6.1: Run `npm run build` to verify TypeScript compiles
  - [ ] 6.2: Run `npm run tauri dev` to verify app still launches
  - [ ] 6.3: Verify no TypeScript errors in `src/lib/sdk/` files

---

## Dependencies

### Requires (from prior stories)

| Story | What It Provides | Why Needed |
|-------|------------------|------------|
| Story 2.1 | SDK package `@anthropic-ai/claude-agent-sdk` | SDK types and `query()` function to wrap |
| Story 2.2 | `IAgentSDK` interface with `query()` signature | Interface contract to implement |
| Story 2.2 | `StreamMessage` type | Return type for query() method |
| Story 2.2 | `QueryOptions` interface | Parameters for sessionId and model |
| Story 2.2 | `ClaudeAgentSDK` class skeleton | Class to add implementation to |

### Provides For (future stories)

| Story | What This Story Provides |
|-------|--------------------------|
| Story 2.4 | Working `agentSDK.query()` for IPC command to call |
| Story 2.5 | `StreamMessage` events for frontend event handler |
| Story 2.6 | Text streaming messages for chat bubble rendering |
| Story 2.7 | Thinking messages for indicator display |
| Story 2.8 | Tool start/complete messages for status chips |
| Story 2.9-2.16 | Full SDK streaming for all chat features |

---

## Accessibility Requirements

N/A - This is a developer-facing architecture story with no UI impact.

---

## File Locations

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/sdk/errors.ts` | Error types and `wrapSdkError()` function |
| `src/lib/sdk/type-guards.ts` | Type guard functions for SDK message types |

### Files to Modify

| File | Changes |
|------|---------|
| `src/lib/sdk/claude-agent-sdk.ts` | Add `transformSdkMessage()`, complete `query()` implementation |
| `src/lib/sdk/index.ts` | Export new error types and type guards |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `src/lib/sdk/types.ts` | Types already defined in Story 2.2 |
| SDK node_modules | Never modify vendor code |

---

## Definition of Done

- [ ] `transformSdkMessage()` method transforms all SDK message types
- [ ] `query()` method calls real SDK `query()` function
- [ ] `query()` wraps all errors in `OrionError` type (AC #2)
- [ ] `query()` accepts optional `sessionId` in options (AC #3)
- [ ] `query()` accepts optional `model` in options (AC #4)
- [ ] `query()` yields `StreamMessage` types (AC #1)
- [ ] `OrionError` class defined with error codes following architecture patterns
- [ ] Type guards exist for all SDK message types
- [ ] `npm run build` completes successfully
- [ ] `npm run tauri dev` still launches the app
- [ ] PR passes CI checks

---

## Test Strategy

### Unit Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.3-UNIT-001 | `transformSdkMessage()` handles `TextBlock` correctly | #1 |
| 2.3-UNIT-002 | `transformSdkMessage()` handles `ThinkingBlock` correctly | #1 |
| 2.3-UNIT-003 | `transformSdkMessage()` handles `ToolUseBlock` correctly | #1 |
| 2.3-UNIT-004 | `transformSdkMessage()` handles `ToolResultBlock` correctly | #1 |
| 2.3-UNIT-005 | `transformSdkMessage()` handles `ResultMessage` correctly | #1 |
| 2.3-UNIT-006 | `wrapSdkError()` wraps network errors correctly | #2 |
| 2.3-UNIT-007 | `wrapSdkError()` wraps auth errors correctly | #2 |
| 2.3-UNIT-008 | `wrapSdkError()` wraps rate limit errors correctly | #2 |
| 2.3-UNIT-009 | `query()` uses provided `sessionId` when present | #3 |
| 2.3-UNIT-010 | `query()` generates adhoc sessionId when absent | #3 |
| 2.3-UNIT-011 | `query()` uses provided `model` when present | #4 |
| 2.3-UNIT-012 | `query()` defaults to Sonnet when model absent | #4 |
| 2.3-UNIT-013 | Type guards correctly identify SDK message types | #1 |

### Integration Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.3-INT-001 | `query()` yields `StreamMessage` types that match interface | #1 |
| 2.3-INT-002 | Error from SDK becomes `StreamMessage` of type "error" | #2 |
| 2.3-INT-003 | Barrel export provides `OrionError` and `ErrorCode` | #2 |

### Mock Tests

Since SDK calls require API key, use mocking for CI:

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.3-MOCK-001 | Mock SDK `query()` to yield text messages | #1 |
| 2.3-MOCK-002 | Mock SDK `query()` to yield tool messages | #1 |
| 2.3-MOCK-003 | Mock SDK `query()` to throw errors | #2 |

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| Implementation | 3 hours |
| Testing | 2 hours |
| Documentation | 30 minutes |
| **Total** | 5.5 hours |

---

## Notes

### Message Transformation Strategy

The SDK yields complex nested structures. Our transformation:

1. **Flattens** nested content blocks into individual `StreamMessage` events
2. **Decouples** application from SDK message shape
3. **Simplifies** frontend rendering logic

### Error Handling Philosophy

Per architecture.md:
- Recoverable errors (1xxx, 3xxx): UI shows toast with retry option
- Auth errors (2xxx): Redirect to re-auth flow
- Fatal errors (9xxx): Error boundary catches and shows recovery UI

### Model Selection

Per NFR-6.2 (stable SDK features only):
- `claude-opus-4-5-20250514` - More capable, higher cost
- `claude-sonnet-4-20250514` - Default, good balance

Model selection is exposed via `QueryOptions.model` for flexibility but defaults to Sonnet.

### Session Continuity

When `sessionId` is provided:
- SDK resumes the session from where it left off
- Conversation history is preserved
- Context from prior turns is available

When `sessionId` is omitted:
- A new adhoc session is created
- Fresh context, no history

### Future Enhancements (NOT in this story)

- Retry logic with exponential backoff (architecture defines patterns)
- Hook integration (Epic 19)
- Session persistence to SQLite
- Token budget tracking (NFR-3)

---

## References

- [Source: thoughts/planning-artifacts/architecture.md#SDK Initialization Pattern]
- [Source: thoughts/planning-artifacts/architecture.md#Error Handling Patterns]
- [Source: thoughts/planning-artifacts/epics.md#Story 2.3: Implement query() Wrapper]
- [Source: thoughts/research/claude-agent-sdk-deep-dive.md#SDK query() Function]
- [Source: thoughts/research/streaming-architecture.md#Message Protocol Reference]
- [Source: .ralph/story-chain.md#Story 2.2 Notes for Next Story]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - expected: errors.ts, type-guards.ts, updated claude-agent-sdk.ts, updated index.ts)
