# Story 2.2: Create SDK Wrapper Interface

Status: drafted

---

## Story Definition

| Field | Value |
|-------|-------|
| **Story ID** | 2-2-create-sdk-wrapper-interface |
| **Epic** | Epic 2: First Conversation |
| **Status** | drafted |
| **Priority** | Critical (enables SDK abstraction for all future stories) |
| **Created** | 2026-01-24 |

---

## User Story

As a **developer**,
I want SDK calls abstracted behind a wrapper interface,
So that SDK upgrades don't require changes throughout the codebase (NFR-6.1).

---

## Acceptance Criteria

1. **Given** the SDK is installed (Story 2.1)
   **When** I define the wrapper interface
   **Then** `IAgentSDK` interface exists with `query()`, `getSession()`, `endSession()` methods

2. **And** concrete implementation `ClaudeAgentSDK` implements the interface

3. **And** all application code imports from the wrapper, never directly from SDK

---

## Design References

### From Architecture (thoughts/planning-artifacts/architecture.md)

**NFR-6.1: Abstract SDK calls behind wrapper interface**
> The system shall abstract SDK calls behind wrapper interface

This ensures:
- SDK upgrades isolated to wrapper implementation
- Consistent error handling patterns
- Application code decoupled from SDK version changes
- Single point of change for SDK configuration

**SDK Initialization Pattern (architecture.md lines 776-850):**

The architecture defines the SDK wrapper pattern:
- `src/lib/sdk/client.ts` handles session creation, streaming, and hook registration
- Session naming conventions: `orion-daily-YYYY-MM-DD`, `orion-project-{slug}`, etc.
- Factory function `createAgentOptions()` builds `ClaudeAgentOptions`

**Project Structure (architecture.md lines 1426-1434):**

```
src/
├── lib/
│   ├── sdk/                # FR-1: Claude Agent SDK wrapper
│   │   ├── client.ts       # SDK wrapper implementation
│   │   ├── streaming.ts    # Streaming utilities
│   │   ├── tools.ts        # Tool integration
│   │   └── types.ts        # TypeScript interfaces
```

### From Research (thoughts/research/claude-agent-sdk-deep-dive.md)

**SDK Entry Points:**

| Entry Point | Purpose | Use Case |
|-------------|---------|----------|
| `query()` | Simple streaming queries | One-shot interactions |
| `ClaudeSDKClient` | Full multi-turn with hooks | Session-based conversations |

**Key SDK Exports:**

```typescript
import {
  query,                    // Simple streaming query function
  ClaudeSDKClient,          // Full client with multi-turn support
  ClaudeAgentOptions,       // Configuration options
  createTool,               // Custom tool creation
  createMcpServer,          // MCP server creation
} from "@anthropic-ai/claude-agent-sdk";
```

### From Streaming Architecture (thoughts/research/streaming-architecture.md)

**Message Types for Interface Design:**

| Type | SDK Class | Description |
|------|-----------|-------------|
| Text content | `TextBlock` | Claude's text response |
| Thinking | `ThinkingBlock` | Internal reasoning |
| Tool invocation | `ToolUseBlock` | Tool being called |
| Tool result | `ToolResultBlock` | Tool output |
| Final result | `ResultMessage` | Completion info |

### From Story Chain (.ralph/story-chain.md)

**Story 2.1 Established:**
- SDK package: `@anthropic-ai/claude-agent-sdk` TypeScript package
- SDK import pattern: Import from `@anthropic-ai/claude-agent-sdk`
- Stable features documented in STABLE_FEATURES.md
- Beta features require explicit approval

**Notes for Story 2.2 from Story 2.1:**
> - Create `IAgentSDK` interface in `src/lib/sdk/types.ts`
> - Define methods: `query()`, `getSession()`, `endSession()`
> - Create concrete `ClaudeAgentSDK` implementation
> - All application code imports from wrapper, never directly from SDK
> - This enables SDK upgrades without codebase-wide changes (NFR-6.1)

---

## Technical Requirements

### Interface Definition

Create `IAgentSDK` interface that abstracts all SDK interactions:

```typescript
// src/lib/sdk/types.ts

import type {
  ClaudeAgentOptions,
  AssistantMessage,
  TextBlock,
  ToolUseBlock,
  ToolResultBlock,
  ResultMessage,
  ThinkingBlock,
} from "@anthropic-ai/claude-agent-sdk";

/**
 * Session types following architecture.md session naming pattern
 */
export type SessionType = "daily" | "project" | "inbox" | "adhoc";

/**
 * Orion session metadata
 */
export interface OrionSession {
  id: string;
  type: SessionType;
  createdAt: Date;
  lastActivity: Date;
  context?: string; // For project sessions
}

/**
 * Query options for SDK interactions
 */
export interface QueryOptions {
  sessionId?: string;
  model?: "claude-opus-4-5-20250514" | "claude-sonnet-4-20250514";
  systemPrompt?: string;
  maxTurns?: number;
}

/**
 * Stream message types yielded by query()
 * Re-exported to decouple application from SDK types
 */
export type StreamMessage =
  | { type: "text"; content: string }
  | { type: "thinking"; content: string }
  | { type: "tool_start"; toolId: string; toolName: string; input: Record<string, unknown> }
  | { type: "tool_complete"; toolId: string; result: unknown; isError: boolean }
  | { type: "complete"; sessionId: string; durationMs: number; costUsd: number | null }
  | { type: "error"; code: string; message: string; recoverable: boolean };

/**
 * IAgentSDK interface - abstracts Claude Agent SDK
 * NFR-6.1: All SDK calls go through this interface
 */
export interface IAgentSDK {
  /**
   * Send a query and stream responses
   * @param prompt - User prompt
   * @param options - Query configuration
   * @returns Async iterator of stream messages
   */
  query(prompt: string, options?: QueryOptions): AsyncGenerator<StreamMessage>;

  /**
   * Get or create a session by type
   * @param type - Session type (daily, project, inbox, adhoc)
   * @param context - Optional context (e.g., project slug)
   * @returns Session metadata
   */
  getSession(type: SessionType, context?: string): Promise<OrionSession>;

  /**
   * End a session and persist state
   * @param sessionId - Session to end
   */
  endSession(sessionId: string): Promise<void>;

  /**
   * Check if SDK is ready (API key configured, etc.)
   */
  isReady(): Promise<boolean>;
}
```

### Concrete Implementation

Create `ClaudeAgentSDK` class implementing `IAgentSDK`:

```typescript
// src/lib/sdk/claude-agent-sdk.ts

import { query, ClaudeAgentOptions } from "@anthropic-ai/claude-agent-sdk";
import type {
  IAgentSDK,
  QueryOptions,
  SessionType,
  OrionSession,
  StreamMessage,
} from "./types";

/**
 * Generate session ID following architecture.md naming convention
 */
function generateSessionId(type: SessionType, context?: string): string {
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

/**
 * Transform SDK messages to Orion StreamMessage format
 */
function* transformSdkMessages(
  sdkMessage: unknown,
  sessionId: string
): Generator<StreamMessage> {
  // Implementation will handle AssistantMessage, TextBlock, ToolUseBlock, etc.
  // This decouples application from SDK message structure
  // Full implementation in Story 2.3
}

/**
 * ClaudeAgentSDK - Concrete implementation of IAgentSDK
 * Wraps @anthropic-ai/claude-agent-sdk with Orion-specific patterns
 */
export class ClaudeAgentSDK implements IAgentSDK {
  private sessions: Map<string, OrionSession> = new Map();

  async *query(prompt: string, options?: QueryOptions): AsyncGenerator<StreamMessage> {
    const sessionId = options?.sessionId ?? generateSessionId("adhoc");

    const sdkOptions: ClaudeAgentOptions = {
      model: options?.model ?? "claude-sonnet-4-20250514",
      resume: sessionId,
      persistSession: true,
      maxTurns: options?.maxTurns ?? 100,
    };

    if (options?.systemPrompt) {
      sdkOptions.systemPrompt = options.systemPrompt;
    }

    try {
      for await (const message of query({ prompt, options: sdkOptions })) {
        yield* transformSdkMessages(message, sessionId);
      }
    } catch (error) {
      yield {
        type: "error",
        code: "SDK_ERROR",
        message: error instanceof Error ? error.message : String(error),
        recoverable: true,
      };
    }
  }

  async getSession(type: SessionType, context?: string): Promise<OrionSession> {
    const sessionId = generateSessionId(type, context);

    // Check if session exists in memory
    const existing = this.sessions.get(sessionId);
    if (existing) {
      existing.lastActivity = new Date();
      return existing;
    }

    // Create new session
    const session: OrionSession = {
      id: sessionId,
      type,
      createdAt: new Date(),
      lastActivity: new Date(),
      context,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  async endSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    // Additional cleanup will be added when session persistence is implemented
  }

  async isReady(): Promise<boolean> {
    // Check if ANTHROPIC_API_KEY is available
    // Full implementation will check Keychain via Tauri IPC
    return !!process.env.ANTHROPIC_API_KEY;
  }
}
```

### Re-Export Pattern

Create barrel file so application code imports from wrapper:

```typescript
// src/lib/sdk/index.ts

// Export interface and types
export type {
  IAgentSDK,
  QueryOptions,
  SessionType,
  OrionSession,
  StreamMessage,
} from "./types";

// Export concrete implementation
export { ClaudeAgentSDK } from "./claude-agent-sdk";

// Export singleton instance for easy usage
import { ClaudeAgentSDK } from "./claude-agent-sdk";
export const agentSDK: IAgentSDK = new ClaudeAgentSDK();

// DO NOT re-export SDK types directly
// Application code should use Orion types from ./types
```

### Application Import Pattern

All application code MUST import from the wrapper:

```typescript
// CORRECT: Import from wrapper
import { agentSDK, StreamMessage } from "@/lib/sdk";

// INCORRECT: Never import directly from SDK
// import { query } from "@anthropic-ai/claude-agent-sdk";  // WRONG!
```

---

## Implementation Tasks

- [ ] Task 1: Create type definitions (AC: #1)
  - [ ] 1.1: Create `src/lib/sdk/types.ts`
  - [ ] 1.2: Define `SessionType` union type
  - [ ] 1.3: Define `OrionSession` interface
  - [ ] 1.4: Define `QueryOptions` interface
  - [ ] 1.5: Define `StreamMessage` discriminated union
  - [ ] 1.6: Define `IAgentSDK` interface with `query()`, `getSession()`, `endSession()`, `isReady()` methods

- [ ] Task 2: Create concrete implementation (AC: #2)
  - [ ] 2.1: Create `src/lib/sdk/claude-agent-sdk.ts`
  - [ ] 2.2: Implement `generateSessionId()` helper following architecture naming convention
  - [ ] 2.3: Implement `ClaudeAgentSDK` class
  - [ ] 2.4: Implement `query()` method with async generator pattern
  - [ ] 2.5: Implement `getSession()` method with in-memory session tracking
  - [ ] 2.6: Implement `endSession()` method
  - [ ] 2.7: Implement `isReady()` method

- [ ] Task 3: Create barrel export (AC: #3)
  - [ ] 3.1: Create `src/lib/sdk/index.ts`
  - [ ] 3.2: Re-export types from `./types`
  - [ ] 3.3: Re-export `ClaudeAgentSDK` class
  - [ ] 3.4: Export singleton `agentSDK` instance
  - [ ] 3.5: Add comment warning against direct SDK imports

- [ ] Task 4: Build verification
  - [ ] 4.1: Run `npm run build` to verify TypeScript compiles
  - [ ] 4.2: Verify no direct SDK imports outside `src/lib/sdk/`
  - [ ] 4.3: Run `npm run tauri dev` to verify app still launches

- [ ] Task 5: Add ESLint rule (optional but recommended)
  - [ ] 5.1: Add `no-restricted-imports` rule to prevent direct SDK imports outside wrapper

---

## Dependencies

### Requires (from prior stories)

| Story | What It Provides | Why Needed |
|-------|------------------|------------|
| Story 2.1 | SDK package `@anthropic-ai/claude-agent-sdk` | SDK types and functions to wrap |
| Story 2.1 | STABLE_FEATURES.md | Guidance on which SDK features are approved |

### Provides For (future stories)

| Story | What This Story Provides |
|-------|--------------------------|
| Story 2.3 | `IAgentSDK.query()` method for implementing streaming wrapper |
| Story 2.4 | Interface types for IPC command definitions |
| Story 2.5 | `StreamMessage` type for chat rendering |
| Story 2.6-2.16 | Abstracted SDK access for all streaming/chat stories |
| Epic 8 | Session management via `getSession()` / `endSession()` |
| Epic 17-19 | Extensible wrapper for skills, agents, hooks integration |

---

## Accessibility Requirements

N/A - This is a developer-facing architecture story with no UI impact.

---

## File Locations

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/sdk/types.ts` | TypeScript interfaces for SDK abstraction |
| `src/lib/sdk/claude-agent-sdk.ts` | Concrete `ClaudeAgentSDK` implementation |
| `src/lib/sdk/index.ts` | Barrel export for clean imports |

### Files NOT to Modify

| File | Reason |
|------|--------|
| SDK node_modules | Never modify vendor code |

---

## Definition of Done

- [ ] `IAgentSDK` interface exists in `src/lib/sdk/types.ts`
- [ ] Interface has `query()`, `getSession()`, `endSession()`, `isReady()` methods
- [ ] `ClaudeAgentSDK` class implements `IAgentSDK` in `src/lib/sdk/claude-agent-sdk.ts`
- [ ] Barrel export exists in `src/lib/sdk/index.ts`
- [ ] Application code can import `{ agentSDK, StreamMessage }` from `@/lib/sdk`
- [ ] No direct imports from `@anthropic-ai/claude-agent-sdk` outside `src/lib/sdk/`
- [ ] `npm run build` completes successfully
- [ ] `npm run tauri dev` still launches the app
- [ ] PR passes CI checks

---

## Test Strategy

### Unit Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.2-UNIT-001 | `IAgentSDK` interface has required methods | #1 |
| 2.2-UNIT-002 | `ClaudeAgentSDK` implements `IAgentSDK` | #2 |
| 2.2-UNIT-003 | `generateSessionId()` produces correct formats | #1, #2 |
| 2.2-UNIT-004 | `getSession()` returns valid `OrionSession` | #2 |
| 2.2-UNIT-005 | `endSession()` removes session from tracking | #2 |

### Integration Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.2-INT-001 | Barrel export provides all expected types | #3 |
| 2.2-INT-002 | TypeScript compiles with wrapper imports | #3 |

### Static Analysis

| Check | Description | AC |
|-------|-------------|-----|
| 2.2-LINT-001 | No direct SDK imports outside `src/lib/sdk/` | #3 |

### Manual Verification

| Step | Expected Result |
|------|-----------------|
| Import `{ agentSDK }` from `@/lib/sdk` | No TypeScript errors |
| Call `agentSDK.isReady()` | Returns Promise<boolean> |
| Check `agentSDK.query()` signature | Returns AsyncGenerator<StreamMessage> |

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| Implementation | 2 hours |
| Testing | 1 hour |
| Documentation | 30 minutes |
| **Total** | 3.5 hours |

---

## Notes

### Why Interface Abstraction?

Per NFR-6.1, SDK abstraction provides:

1. **Upgrade Isolation**: SDK breaking changes only affect `claude-agent-sdk.ts`
2. **Testability**: Can mock `IAgentSDK` for unit tests
3. **Flexibility**: Can swap SDK implementations if needed
4. **Type Safety**: Application uses Orion types, not SDK types

### Minimal Implementation Strategy

This story creates the interface contract and minimal implementation. The `query()` method is a skeleton that:
- Returns the async generator signature
- Handles basic error wrapping
- Does NOT fully implement message transformation (that's Story 2.3)

This allows Story 2.2 to be completed and tested independently.

### Session ID Format

Following architecture.md session naming pattern:

| Type | Pattern | Example |
|------|---------|---------|
| daily | `orion-daily-YYYY-MM-DD` | `orion-daily-2026-01-24` |
| project | `orion-project-{slug}` | `orion-project-inbox-redesign` |
| inbox | `orion-inbox-YYYY-MM-DD` | `orion-inbox-2026-01-24` |
| adhoc | `orion-adhoc-{timestamp}` | `orion-adhoc-1737734400000` |

### Future Enhancements (NOT in this story)

- Hook registration (Epic 19)
- Session persistence to SQLite (Epic 2 later stories)
- API key retrieval from Keychain (Story 2.4)
- Full message transformation (Story 2.3)

---

## References

- [Source: thoughts/planning-artifacts/architecture.md#SDK Initialization Pattern]
- [Source: thoughts/planning-artifacts/architecture.md#NFR-6 Maintainability]
- [Source: thoughts/planning-artifacts/epics.md#Story 2.2: Create SDK Wrapper Interface]
- [Source: thoughts/research/claude-agent-sdk-deep-dive.md#SDK Overview]
- [Source: thoughts/research/streaming-architecture.md#Message Types]
- [Source: .ralph/story-chain.md#Story 2.1 Notes for Next Story]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - expected: types.ts, claude-agent-sdk.ts, index.ts)
