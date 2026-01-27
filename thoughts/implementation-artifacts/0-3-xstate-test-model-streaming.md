# Story 0.3: XState Test Model for Streaming Determinism

Status: done

## Story

As a **developer**,
I want XState test model configuration for streaming state machine,
So that I can achieve deterministic test coverage of all streaming states without race conditions.

## Acceptance Criteria

1. **Given** XState test model is configured
   **When** I run `npx vitest run --project=xstate-tests`
   **Then** all streaming state paths are tested deterministically

2. **Given** streaming UI test runs
   **When** state transitions occur
   **Then** tests use `waitForResponse` instead of `waitForTimeout`

## Tasks / Subtasks

- [x] Install XState test package (AC: #1)
  - [x] `npm install @xstate/test@^0.5 --save-dev`
  - [x] Configure Vitest project for XState tests
- [x] **Create stub streaming state machine** (AC: #1) — PREREQUISITE
  - [x] Create `tests/fixtures/machines/streaming-stub.ts`
  - [x] Define minimal streaming machine with 5 states: idle, streaming, complete, error, cancelled
  - [x] Implement transitions: START, TOKEN, COMPLETE, ERROR, CANCEL
  - [x] Note: Production machine in Epic 2 must match this interface
  ```typescript
  // Stub machine interface (must match Epic 2 implementation)
  export const streamingMachine = createMachine({
    id: 'streaming',
    initial: 'idle',
    states: {
      idle: { on: { START: 'streaming' } },
      streaming: { on: { TOKEN: 'streaming', COMPLETE: 'complete', ERROR: 'error', CANCEL: 'cancelled' } },
      complete: { type: 'final' },
      error: { type: 'final' },
      cancelled: { type: 'final' }
    }
  });
  ```
- [x] Create streaming state machine test model (AC: #1)
  - [x] Create `tests/unit/state-management/streaming.xstate-test.ts`
  - [x] Import stub machine from `tests/fixtures/machines/streaming-stub.ts`
  - [x] Define test model for streaming machine
  - [x] Cover path: idle → streaming → complete
  - [x] Cover path: idle → streaming → error
  - [x] Cover path: idle → streaming → cancelled
- [x] Ensure deterministic waits (AC: #2)
  - [x] Replace all `waitForTimeout` with `waitForResponse`
  - [x] Implement custom XState test event adapters
- [x] Achieve 100% state coverage (AC: #1)
  - [x] Run coverage report on state transitions
  - [x] Add missing state path tests

## Dev Notes

### Technical Requirements
- Install `@xstate/test@^0.5` as dev dependency
- Create `tests/unit/state-management/streaming.xstate-test.ts`
- Define test model covering: idle → streaming → complete, idle → streaming → error
- Ensure all state transitions use deterministic waits
- Target: 100% state coverage for streaming machine

### Testability Concern Addressed
- **TC-3**: Streaming UI determinism (XState race conditions) (Score 6) — CRITICAL
- Source: `thoughts/planning-artifacts/test-design-system.md` Section 5.1

### Streaming States to Cover
From architecture.md - streaming state machine:
- `idle` - waiting for user input
- `streaming` - receiving tokens
- `complete` - response finished
- `error` - error occurred
- `cancelled` - user cancelled

### Project Structure Notes
- Test model in `tests/unit/state-management/`
- **Stub machine** in `tests/fixtures/machines/streaming-stub.ts` (created in this story)
- Production machine in `src/lib/state/streaming.ts` (Epic 2 must match stub interface)

### Dependency Resolution
This story creates a **stub streaming machine** to unblock test development.
Epic 2 Story 2.6 must implement the production machine matching this interface.
Tests written against the stub will validate the production implementation.

### References
- [Source: thoughts/planning-artifacts/test-design-system.md#5.1]
- [Source: thoughts/planning-artifacts/architecture.md#State Management]
- [XState Test Docs: https://xstate.js.org/docs/packages/xstate-test/]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List
1. Installed @xstate/test@^0.5.1 as dev dependency (note: package shows deprecation warning suggesting @xstate/graph instead, but proceeded with specified version per story requirements)
2. Created vitest.config.ts at project root with three projects: unit, integration, xstate-tests
3. Added `npm run test:xstate` script to package.json for running XState tests
4. Created stub streaming machine at tests/fixtures/machines/streaming-stub.ts with:
   - 5 states: idle, streaming, complete, error, cancelled
   - 5 events: START, TOKEN, COMPLETE, ERROR, CANCEL
   - Context tracking: content, errorMessage, tokenCount, startedAt, endedAt
   - Used predictableActionArguments: true per XState best practices
5. Created XState test model at tests/unit/state-management/streaming.xstate-test.ts with:
   - 32 passing tests covering all state paths
   - Deterministic waitForState pattern instead of waitForTimeout (AC#2)
   - Model-based path generation using @xstate/test createModel
   - TOKEN self-loop tested explicitly (excluded from model path generation to prevent infinite loops)
   - Event adapters for all streaming events
6. All 32 tests pass via `npm run test:xstate`

### File List
- /Users/sid/Desktop/orion-butler/package.json (modified: added @xstate/test dependency and test:xstate script)
- /Users/sid/Desktop/orion-butler/vitest.config.ts (created: Vitest configuration with xstate-tests project)
- /Users/sid/Desktop/orion-butler/tests/fixtures/machines/streaming-stub.ts (created: stub streaming state machine)
- /Users/sid/Desktop/orion-butler/tests/unit/state-management/streaming.xstate-test.ts (created: XState test model with 32 tests)
