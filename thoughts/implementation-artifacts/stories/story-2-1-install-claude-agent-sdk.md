# Story 2.1: Install Claude Agent SDK

Status: drafted

---

## Story Definition

| Field | Value |
|-------|-------|
| **Story ID** | 2-1-install-claude-agent-sdk |
| **Epic** | Epic 2: First Conversation |
| **Status** | drafted |
| **Priority** | Critical (foundation for all SDK integration) |
| **Created** | 2026-01-24 |

---

## User Story

As a **developer**,
I want the Claude Agent SDK installed as a dependency,
So that I can integrate with Claude's agentic capabilities.

---

## Acceptance Criteria

1. **Given** the Tauri project from Epic 1
   **When** I run `npm install @anthropic-ai/claude-agent-sdk`
   **Then** the package is added to package.json dependencies

2. **And** TypeScript types are available for SDK exports (Options, query, SDKMessage, SDKAssistantMessage, etc.)

3. **And** the SDK version uses stable v1 features only (NFR-6.2)

4. **And** the package resolves and builds without errors via `npm run build`

---

## Design References

### From Architecture (thoughts/planning-artifacts/architecture.md)

**NFR-6.1: Abstract SDK calls behind wrapper interface**
- SDK dependency is the prerequisite for creating the wrapper (Story 2.2)
- All application code will import from wrapper, never directly from SDK

**NFR-6.2: Use only stable SDK features**
- Avoid beta features unless explicitly approved
- Documented beta features requiring opt-in: context-1m-2025-08-07
- Stable v1 features: query(), Options, SDKMessage types, built-in tools, hooks, skills, MCP integration

### From Research (thoughts/research/claude-agent-sdk-deep-dive.md)

**Package Information:**

| Platform | Package | Installation | Latest Version |
|----------|---------|--------------|----------------|
| TypeScript | `@anthropic-ai/claude-agent-sdk` | `npm install @anthropic-ai/claude-agent-sdk` | 0.2.x |

**Note:** The `claude-code-sdk` package is deprecated. Use `claude-agent-sdk`.

**Available SDKs:**
- Python: `claude-agent-sdk` (pip) - NOT needed for Orion
- TypeScript: `@anthropic-ai/claude-agent-sdk` (npm) - REQUIRED for Orion

**Key SDK Exports (TypeScript):**
```typescript
import {
  query,                    // Streaming query function returning AsyncGenerator<SDKMessage>
  tool,                     // Type-safe MCP tool definition creator
  createSdkMcpServer,       // In-process MCP server creation
} from "@anthropic-ai/claude-agent-sdk";

import type {
  SDKMessage,               // Union of all message types
  SDKAssistantMessage,      // Assistant response messages
  SDKResultMessage,         // Final result with cost/duration
  SDKSystemMessage,         // System init with session_id
  SDKPartialAssistantMessage, // Streaming chunks
  Options,                  // Configuration options for query()
} from "@anthropic-ai/claude-agent-sdk";
```

### From Streaming Architecture (thoughts/research/streaming-architecture.md)

**SDK Streaming Pattern:**
- `query()` returns async iterator yielding messages
- Message types: SDKAssistantMessage, SDKResultMessage, SDKSystemMessage, SDKPartialAssistantMessage
- Content blocks (inside message.message.content): text, thinking, tool_use, tool_result
- Used for Stories 2.3-2.16 for streaming implementation

---

## Technical Requirements

### Package Installation

```bash
npm install @anthropic-ai/claude-agent-sdk
```

### Expected package.json Changes

```json
{
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^0.2.0"
  }
}
```

### TypeScript Types Verification

After installation, these imports should compile without errors:

```typescript
// Verify SDK types are available
import type {
  SDKMessage,
  SDKAssistantMessage,
  SDKUserMessage,
  SDKResultMessage,
  SDKSystemMessage,
  SDKPartialAssistantMessage,
  Options,
  Query,
  AgentDefinition,
} from "@anthropic-ai/claude-agent-sdk";

// Verify SDK functions are available
import {
  query,
  tool,
  createSdkMcpServer,
} from "@anthropic-ai/claude-agent-sdk";
```

### Stable v1 Features Only (NFR-6.2)

The following are STABLE features to be used:

| Feature | Status | Usage |
|---------|--------|-------|
| `query()` function | Stable | Returns `Query` (AsyncGenerator<SDKMessage>) |
| `Options` type | Stable | Configuration for query() |
| `resume` option | Stable | Session continuity via session ID |
| `includePartialMessages` option | Stable | Enable streaming chunks |
| Built-in tools (Read, Write, Edit, Bash, Glob, Grep) | Stable | File/command operations |
| Task tool (subagents) | Stable | Agent orchestration |
| Hooks system | Stable | Lifecycle interception |
| Skills system | Stable | Workflow definitions |
| MCP integration | Stable | External tool servers |
| Session management (resume, fork) | Stable | Conversation continuity |

The following are BETA features - DO NOT USE without explicit approval:

| Feature | Beta Header | Status |
|---------|-------------|--------|
| Structured Outputs | `structured-outputs-2025-11-13` | Beta |
| 1M Context Window | `context-1m-2025-08-07` | Beta |
| Interleaved Thinking | `interleaved-thinking-2025-05-14` | Beta |

---

## Implementation Tasks

- [ ] Task 1: Install SDK package (AC: #1)
  - [ ] 1.1: Run `npm install @anthropic-ai/claude-agent-sdk` in project root
  - [ ] 1.2: Verify package.json includes the dependency
  - [ ] 1.3: Run `npm install` to ensure clean dependency resolution
  - [ ] 1.4: Verify no peer dependency warnings or conflicts

- [ ] Task 2: Verify TypeScript types (AC: #2)
  - [ ] 2.1: Create temporary type verification file `src/lib/sdk-types-check.ts`
  - [ ] 2.2: Add imports for all major SDK types (ClaudeAgentOptions, message types, etc.)
  - [ ] 2.3: Run `npm run build` or `npx tsc --noEmit` to verify types compile
  - [ ] 2.4: Delete the temporary file after verification (or keep as reference)

- [ ] Task 3: Document stable features (AC: #3)
  - [ ] 3.1: Add `src/lib/agent/STABLE_FEATURES.md` documenting approved SDK features
  - [ ] 3.2: List stable features that can be used
  - [ ] 3.3: List beta features that require explicit approval
  - [ ] 3.4: Reference NFR-6.2 requirement

- [ ] Task 4: Build verification (AC: #4)
  - [ ] 4.1: Run `npm run build` to verify full project builds
  - [ ] 4.2: Run `npm run tauri dev` to verify Tauri app still launches
  - [ ] 4.3: Verify no TypeScript errors related to SDK

---

## Dependencies

### Requires (from prior stories)

| Story | What It Provides | Why Needed |
|-------|------------------|------------|
| Story 1.1 | Tauri + Next.js project scaffold | Project must exist to add dependency |
| Epic 1 complete | Working build system | npm install and build must work |

### Provides For (future stories)

| Story | What This Story Provides |
|-------|--------------------------|
| Story 2.2 | SDK package for creating wrapper interface |
| Story 2.3 | SDK types for query() wrapper implementation |
| Story 2.4-2.16 | SDK dependency for all streaming/chat stories |
| Epic 8 | SDK for built-in tool servers |
| Epic 17 | SDK for skills system |
| Epic 18 | SDK for subagent/Task tool |
| Epic 19 | SDK for hooks system |

---

## Accessibility Requirements

N/A - This is a developer-facing dependency installation story with no UI impact.

---

## File Locations

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/agent/STABLE_FEATURES.md` | Document stable vs beta SDK features |

### Files to Modify

| File | Change |
|------|--------|
| `package.json` | Add `@anthropic-ai/claude-agent-sdk` dependency |
| `package-lock.json` | Updated by npm install |

### Files for Verification (temporary)

| File | Purpose |
|------|---------|
| `src/lib/sdk-types-check.ts` | Verify TypeScript types compile (delete after) |

---

## Definition of Done

- [ ] Package `@anthropic-ai/claude-agent-sdk` is in package.json dependencies
- [ ] `npm install` completes without errors or peer dependency warnings
- [ ] TypeScript types for SDK are available (imports compile)
- [ ] `npm run build` completes successfully
- [ ] `npm run tauri dev` still launches the app
- [ ] STABLE_FEATURES.md documents approved SDK features per NFR-6.2
- [ ] No beta features are imported or used in this story
- [ ] PR passes CI checks

---

## Test Strategy

### Unit Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.1-UNIT-001 | Verify SDK package is in dependencies | #1 |
| 2.1-UNIT-002 | Verify SDK types can be imported | #2 |

### Integration Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.1-INT-001 | Verify project builds with SDK dependency | #4 |
| 2.1-INT-002 | Verify Tauri app launches with SDK dependency | #4 |

### Manual Verification

| Step | Expected Result |
|------|-----------------|
| Run `npm ls @anthropic-ai/claude-agent-sdk` | Shows installed version |
| Check `node_modules/@anthropic-ai/claude-agent-sdk` exists | Directory present |
| Open TypeScript file, import SDK types, no red squiggles | Types available |

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| Implementation | 30 minutes |
| Testing | 15 minutes |
| Documentation | 15 minutes |
| **Total** | 1 hour |

---

## Notes

### Version Pinning Strategy

Consider whether to:
1. Use caret range (`^0.2.0`) for minor version updates - RECOMMENDED for active development
2. Pin exact version (`0.2.x`) for production stability

Given we are in early development, use caret range to get SDK improvements automatically.

### SDK vs API Distinction

**Claude Agent SDK** is NOT the same as **Claude API**:
- Claude API: You implement tool execution
- Claude Agent SDK: SDK executes tools directly, manages context, handles sessions

This project uses the Agent SDK because we want:
- Built-in tool execution (Read, Write, Edit, Bash, Glob, Grep)
- Automatic context compaction
- Session management
- Subagent orchestration via Task tool

### Future Stories Build On This

This story is the foundation. It installs the dependency but does NOT:
- Create wrapper interfaces (Story 2.2)
- Implement query() (Story 2.3)
- Create IPC commands (Story 2.4)
- Handle streaming (Story 2.5+)

Those are all separate stories that depend on this one.

---

## References

- [Source: thoughts/planning-artifacts/architecture.md#NFR-6 Maintainability]
- [Source: thoughts/planning-artifacts/epics.md#Story 2.1: Install Claude Agent SDK]
- [Source: thoughts/research/claude-agent-sdk-deep-dive.md#Available SDKs]
- [Source: thoughts/research/claude-agent-sdk-deep-dive.md#SDK Overview]
- [Source: thoughts/research/streaming-architecture.md#Claude Agent SDK Streaming]
- [Source: project-context.md#Technology Stack]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - expected: package.json, STABLE_FEATURES.md)
