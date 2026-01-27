# ATDD Checklist: 2-2-create-sdk-wrapper-interface

**Story:** Create SDK Wrapper Interface
**Epic:** Epic 2: First Conversation
**Generated:** 2026-01-24
**Author:** TEA (Master Test Architect)

---

## Overview

This ATDD checklist covers all acceptance criteria for Story 2.2, ensuring comprehensive test coverage for the SDK wrapper interface that abstracts Claude Agent SDK calls (NFR-6.1).

**Coverage Summary:**
- 3 Acceptance Criteria
- 15 Unit Tests
- 5 Integration Tests
- 2 Static Analysis Checks
- 3 Manual Verification Steps

---

## AC1: IAgentSDK Interface Definition

> **Given** the SDK is installed (Story 2.1)
> **When** I define the wrapper interface
> **Then** `IAgentSDK` interface exists with `query()`, `getSession()`, `endSession()` methods

### Happy Path Tests

- [ ] **2.2-UNIT-001**: IAgentSDK interface exists with query method
  - **Given:** `src/lib/sdk/types.ts` file exists
  - **When:** TypeScript compiler parses the interface
  - **Then:** `IAgentSDK` interface declares `query(prompt: string, options?: QueryOptions): AsyncGenerator<StreamMessage>`

- [ ] **2.2-UNIT-002**: IAgentSDK interface exists with getSession method
  - **Given:** `src/lib/sdk/types.ts` file exists
  - **When:** TypeScript compiler parses the interface
  - **Then:** `IAgentSDK` interface declares `getSession(type: SessionType, context?: string): Promise<OrionSession>`

- [ ] **2.2-UNIT-003**: IAgentSDK interface exists with endSession method
  - **Given:** `src/lib/sdk/types.ts` file exists
  - **When:** TypeScript compiler parses the interface
  - **Then:** `IAgentSDK` interface declares `endSession(sessionId: string): Promise<void>`

- [ ] **2.2-UNIT-004**: IAgentSDK interface exists with isReady method
  - **Given:** `src/lib/sdk/types.ts` file exists
  - **When:** TypeScript compiler parses the interface
  - **Then:** `IAgentSDK` interface declares `isReady(): Promise<boolean>`

### Supporting Type Tests

- [ ] **2.2-UNIT-005**: SessionType union type is defined correctly
  - **Given:** `src/lib/sdk/types.ts` file exists
  - **When:** SessionType is used in code
  - **Then:** Only allows values: "daily" | "project" | "inbox" | "adhoc"

- [ ] **2.2-UNIT-006**: OrionSession interface has required fields
  - **Given:** `src/lib/sdk/types.ts` file exists
  - **When:** OrionSession is instantiated
  - **Then:** Contains `id: string`, `type: SessionType`, `createdAt: Date`, `lastActivity: Date`, `context?: string`

- [ ] **2.2-UNIT-007**: QueryOptions interface has expected fields
  - **Given:** `src/lib/sdk/types.ts` file exists
  - **When:** QueryOptions is used
  - **Then:** Contains optional `sessionId`, `model`, `systemPrompt`, `maxTurns` fields

- [ ] **2.2-UNIT-008**: StreamMessage discriminated union covers all message types
  - **Given:** `src/lib/sdk/types.ts` file exists
  - **When:** StreamMessage type is used
  - **Then:** Includes variants: "text", "thinking", "tool_start", "tool_complete", "complete", "error"

### Edge Cases

- [ ] **2.2-UNIT-009**: QueryOptions model field restricts to valid model IDs
  - **Given:** `QueryOptions` interface
  - **When:** An invalid model string is assigned
  - **Then:** TypeScript compiler reports type error

- [ ] **2.2-UNIT-010**: StreamMessage error variant has required fields
  - **Given:** StreamMessage with `type: "error"`
  - **When:** Error message is constructed
  - **Then:** Must include `code: string`, `message: string`, `recoverable: boolean`

---

## AC2: Concrete Implementation

> **And** concrete implementation `ClaudeAgentSDK` implements the interface

### Happy Path Tests

- [ ] **2.2-UNIT-011**: ClaudeAgentSDK class implements IAgentSDK interface
  - **Given:** `src/lib/sdk/claude-agent-sdk.ts` file exists
  - **When:** ClaudeAgentSDK is instantiated
  - **Then:** TypeScript verifies it satisfies `IAgentSDK` interface contract

- [ ] **2.2-UNIT-012**: generateSessionId produces correct format for daily sessions
  - **Given:** SessionType is "daily"
  - **When:** `generateSessionId("daily")` is called
  - **Then:** Returns string matching pattern `orion-daily-YYYY-MM-DD`

- [ ] **2.2-UNIT-013**: generateSessionId produces correct format for project sessions
  - **Given:** SessionType is "project" with context "inbox-redesign"
  - **When:** `generateSessionId("project", "inbox-redesign")` is called
  - **Then:** Returns `orion-project-inbox-redesign`

- [ ] **2.2-UNIT-014**: generateSessionId produces correct format for inbox sessions
  - **Given:** SessionType is "inbox"
  - **When:** `generateSessionId("inbox")` is called
  - **Then:** Returns string matching pattern `orion-inbox-YYYY-MM-DD`

- [ ] **2.2-UNIT-015**: generateSessionId produces correct format for adhoc sessions
  - **Given:** SessionType is "adhoc"
  - **When:** `generateSessionId("adhoc")` is called
  - **Then:** Returns string matching pattern `orion-adhoc-{timestamp}` where timestamp is numeric

### getSession Tests

- [ ] **2.2-INT-001**: getSession returns new session when none exists
  - **Given:** ClaudeAgentSDK instance with empty session map
  - **When:** `getSession("daily")` is called
  - **Then:** Returns new `OrionSession` with correct `id`, `type: "daily"`, `createdAt`, `lastActivity`

- [ ] **2.2-INT-002**: getSession returns existing session and updates lastActivity
  - **Given:** ClaudeAgentSDK instance with existing "daily" session created 5 minutes ago
  - **When:** `getSession("daily")` is called again
  - **Then:** Returns same session with updated `lastActivity` timestamp

### endSession Tests

- [ ] **2.2-INT-003**: endSession removes session from tracking
  - **Given:** ClaudeAgentSDK instance with active session "orion-daily-2026-01-24"
  - **When:** `endSession("orion-daily-2026-01-24")` is called
  - **Then:** Subsequent `getSession("daily")` returns a new session (not the ended one)

### isReady Tests

- [ ] **2.2-INT-004**: isReady returns true when ANTHROPIC_API_KEY is set
  - **Given:** Environment variable `ANTHROPIC_API_KEY` is set
  - **When:** `isReady()` is called
  - **Then:** Returns `Promise<true>`

- [ ] **2.2-INT-005**: isReady returns false when ANTHROPIC_API_KEY is not set
  - **Given:** Environment variable `ANTHROPIC_API_KEY` is unset
  - **When:** `isReady()` is called
  - **Then:** Returns `Promise<false>`

### Error Handling Tests

- [ ] **2.2-UNIT-016**: generateSessionId throws for project without context
  - **Given:** SessionType is "project" with no context provided
  - **When:** `generateSessionId("project")` is called
  - **Then:** Throws Error with message "Project sessions require context"

- [ ] **2.2-UNIT-017**: query yields error StreamMessage on SDK failure
  - **Given:** ClaudeAgentSDK instance with mocked SDK that throws
  - **When:** `query("test prompt")` is iterated
  - **Then:** Yields `StreamMessage` with `type: "error"`, `code: "SDK_ERROR"`, `recoverable: true`

### Boundary Conditions

- [ ] **2.2-UNIT-018**: Multiple concurrent sessions are tracked independently
  - **Given:** ClaudeAgentSDK instance
  - **When:** `getSession("daily")` and `getSession("inbox")` are called
  - **Then:** Both sessions exist with different IDs and can be retrieved independently

- [ ] **2.2-UNIT-019**: endSession is idempotent for non-existent sessions
  - **Given:** ClaudeAgentSDK instance with no active sessions
  - **When:** `endSession("non-existent-id")` is called
  - **Then:** No error is thrown, operation completes silently

---

## AC3: Application Import Pattern

> **And** all application code imports from the wrapper, never directly from SDK

### Happy Path Tests

- [ ] **2.2-INT-006**: Barrel export provides all expected types
  - **Given:** `src/lib/sdk/index.ts` file exists
  - **When:** Importing `{ IAgentSDK, QueryOptions, SessionType, OrionSession, StreamMessage }` from `@/lib/sdk`
  - **Then:** All types are available without TypeScript errors

- [ ] **2.2-INT-007**: Barrel export provides ClaudeAgentSDK class
  - **Given:** `src/lib/sdk/index.ts` file exists
  - **When:** Importing `{ ClaudeAgentSDK }` from `@/lib/sdk`
  - **Then:** Class is available and can be instantiated

- [ ] **2.2-INT-008**: Barrel export provides singleton agentSDK instance
  - **Given:** `src/lib/sdk/index.ts` file exists
  - **When:** Importing `{ agentSDK }` from `@/lib/sdk`
  - **Then:** `agentSDK` is an instance implementing `IAgentSDK`

### Static Analysis Checks

- [ ] **2.2-LINT-001**: No direct SDK imports outside src/lib/sdk/
  - **Given:** Complete codebase
  - **When:** Running `grep -r "import.*from.*@anthropic-ai/claude-agent-sdk" src/ --include="*.ts" --include="*.tsx"`
  - **Then:** Only matches files within `src/lib/sdk/` directory

- [ ] **2.2-LINT-002**: TypeScript compiles with wrapper imports
  - **Given:** Application code importing from `@/lib/sdk`
  - **When:** `npm run build` is executed
  - **Then:** Build completes without import-related errors

### Error Handling

- [ ] **2.2-UNIT-020**: Importing non-exported SDK types causes compile error
  - **Given:** Application code attempting `import { ClaudeAgentOptions } from "@/lib/sdk"`
  - **When:** TypeScript compiler runs
  - **Then:** Reports error that `ClaudeAgentOptions` is not exported (ensuring SDK types stay encapsulated)

---

## Build Verification Tests

### Compilation Tests

- [ ] **2.2-BUILD-001**: npm run build completes successfully
  - **Given:** All Story 2.2 files are created
  - **When:** `npm run build` is executed
  - **Then:** Exit code is 0, no TypeScript compilation errors

- [ ] **2.2-BUILD-002**: npm run tauri dev launches application
  - **Given:** Story 2.2 implementation complete
  - **When:** `npm run tauri dev` is executed
  - **Then:** Application window opens without runtime errors related to SDK wrapper

---

## Manual Verification Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Import `{ agentSDK }` from `@/lib/sdk` in a test file | No TypeScript errors |
| 2 | Call `await agentSDK.isReady()` | Returns `Promise<boolean>` |
| 3 | Inspect `agentSDK.query()` signature | Returns `AsyncGenerator<StreamMessage>` |

---

## Test Coverage Matrix

| Acceptance Criterion | Unit Tests | Integration Tests | Static Analysis | Total |
|---------------------|------------|-------------------|-----------------|-------|
| AC1: Interface Definition | 10 | 0 | 0 | 10 |
| AC2: Concrete Implementation | 7 | 5 | 0 | 12 |
| AC3: Import Pattern | 1 | 3 | 2 | 6 |
| Build Verification | 0 | 0 | 2 | 2 |
| **Total** | **18** | **8** | **4** | **30** |

---

## Dependencies

### Requires from Prior Stories

| Story | Artifact | Purpose |
|-------|----------|---------|
| Story 2.1 | `@anthropic-ai/claude-agent-sdk` package | SDK types to wrap |
| Story 2.1 | STABLE_FEATURES.md | Feature approval guidance |

### Test Infrastructure Required

| Component | Source | Purpose |
|-----------|--------|---------|
| Vitest | Sprint 0 | Unit + Integration test runner |
| TypeScript config | Existing | Path alias `@/lib/sdk` resolution |

---

## Notes

### Why These Tests?

Per NFR-6.1 (SDK Abstraction), these tests ensure:
1. **Interface contract** is correctly defined (AC1)
2. **Implementation** satisfies the contract (AC2)
3. **Import discipline** is enforced across the codebase (AC3)

### Test Priority

| Priority | Tests | Rationale |
|----------|-------|-----------|
| P0 (Blocking) | 2.2-UNIT-001 to 004, 2.2-UNIT-011, 2.2-LINT-001 | Core contract verification |
| P1 (High) | 2.2-UNIT-012 to 015, 2.2-INT-001 to 005 | Session management correctness |
| P2 (Medium) | 2.2-UNIT-016 to 020, 2.2-INT-006 to 008 | Error handling and export verification |

### Future Test Hooks

Story 2.3 (Streaming Wrapper) will extend these tests to cover:
- Full `query()` message transformation
- Streaming state machine coverage via @xstate/test
- First-token latency measurement (NFR-1.1)

---

*Generated by TEA (Master Test Architect) - Risk-based testing with depth scaled to impact.*
