# Story 0.2: Tauri IPC Streaming Test Helpers

Status: done

## Story

As a **developer**,
I want Playwright helpers to intercept Tauri IPC streaming events,
So that I can test first-token latency and streaming UI behavior deterministically.

## Acceptance Criteria

1. **Given** the Playwright test helper is imported
   **When** I call `await tauriHelper.waitForStreamEvent('text_block')`
   **Then** the test waits for the specific IPC event without timing-based waits

2. **Given** streaming is in progress
   **When** I measure first-token latency using the helper
   **Then** I get accurate timing that matches NFR-1.1 (<500ms p95)

## Tasks / Subtasks

- [x] Create Tauri IPC helper module (AC: #1)
  - [x] Create `tests/fixtures/helpers/tauri-ipc.ts`
  - [x] Implement `waitForStreamEvent(type: string)` method
  - [x] Implement event type constants for streaming blocks
- [x] Implement latency measurement (AC: #2)
  - [x] Implement `measureFirstTokenLatency()` method
  - [x] Add timing instrumentation hooks
  - [x] Validate against NFR-1.1 threshold
- [x] Support `tauri://` protocol interception (AC: #1)
  - [x] Research Tauri Playwright integration patterns
  - [x] Implement protocol handler registration
- [x] Document helper usage (AC: #1, #2)
  - [x] Add usage examples to `tests/README.md`
  - [x] Document available event types

## Dev Notes

### Technical Requirements
- Create `tests/fixtures/helpers/tauri-ipc.ts`
- Support `tauri://` protocol event interception
- Provide `waitForStreamEvent(type)` method
- Provide `measureFirstTokenLatency()` method
- Document usage in `tests/README.md`

### Testability Concern Addressed
- **TC-2**: Tauri IPC streaming intercept not documented (Score 6) — CRITICAL
- Source: `thoughts/planning-artifacts/test-design-system.md` Section 5.1

### Key Insight
Replace all `waitForTimeout()` calls with deterministic `waitForStreamEvent()` calls to eliminate race conditions in streaming tests.

### Project Structure Notes
- Helper goes in `tests/fixtures/helpers/tauri-ipc.ts`
- Will be imported by E2E tests in `tests/e2e/`

### References
- [Source: thoughts/planning-artifacts/test-design-system.md#5.1]
- [Source: thoughts/planning-artifacts/architecture.md#Tauri IPC]
- [Tauri Testing Docs: https://tauri.app/v1/guides/testing/]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5

### Completion Notes List

**Implementation Summary:**
- Created `TauriIPCHelper` class with full Playwright Page integration
- Implemented `waitForStreamEvent()` for deterministic event waiting (eliminates waitForTimeout)
- Implemented `measureFirstTokenLatency()` for NFR-1.1 validation
- Added `validateLatencySLO()` helper for direct SLO checks
- Implemented `installStreamingHooks()` to inject event capture into Tauri webview
- Added `collectStreamEvents()` and `reset()` for comprehensive event debugging

**Event Types Defined:**
- TEXT_BLOCK, THINKING_BLOCK, TOOL_USE_BLOCK, TOOL_RESULT_BLOCK
- STREAM_START, STREAM_END, FIRST_TOKEN, STREAM_ERROR, CONTENT_DELTA

**Testing Approach:**
- TDD: Wrote tests first (RED), then implemented (GREEN)
- All 24 unit tests pass (increased from 20 during code review)
- Tests verify both AC#1 (deterministic event waiting) and AC#2 (latency measurement)

**Documentation:**
- Added comprehensive section to tests/README.md
- Includes quick setup, available event types, latency measurement examples
- Updated directory structure in README

### Change Log

| Date | Change |
|------|--------|
| 2026-01-24 | Story implementation complete - all tasks done, 20 tests passing |
| 2026-01-24 | Code review fixes: Removed eval() security issue, added reset() tests, added STREAM_ERROR/CONTENT_DELTA tests, improved error messages, removed dead code (partial option). Now 24 tests passing. |

### File List

**New Files:**
- `tests/fixtures/helpers/tauri-ipc.ts` - Main Tauri IPC streaming helper
- `tests/unit/tauri-ipc-helper.spec.ts` - Unit tests (24 tests)

**Modified Files:**
- `tests/README.md` - Added Tauri IPC Streaming Helpers documentation section
- `thoughts/implementation-artifacts/sprint-status.yaml` - Status: ready-for-dev → in-progress → review → done
