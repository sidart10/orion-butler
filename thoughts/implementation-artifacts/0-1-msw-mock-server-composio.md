# Story 0.1: MSW Mock Server with Composio MCP Patterns

Status: done

## Story

As a **developer**,
I want MSW (Mock Service Worker) configured to intercept Composio MCP protocol calls,
So that I can write integration tests without requiring live Composio connections.

## Acceptance Criteria

1. **Given** MSW is installed and configured
   **When** a test makes a Composio tool call (e.g., GMAIL_GET_EMAILS)
   **Then** MSW intercepts and returns mock data without network calls

2. **Given** mock responses are defined for MCP protocol
   **When** the test runs in CI
   **Then** no external network calls are made to Composio servers

## Tasks / Subtasks

- [x] Install MSW as dev dependency (AC: #1)
  - [x] `npm install msw@^2.0 --save-dev`
  - [x] Configure MSW service worker
- [x] Create mock handlers for Composio tools (AC: #1, #2)
  - [x] Create `tests/fixtures/mocks/composio/` directory
  - [x] Implement `GMAIL_GET_EMAILS` mock handler
  - [x] Implement `GMAIL_SEND_EMAIL` mock handler
  - [x] Implement `GMAIL_SEARCH` mock handler
  - [x] Implement `CALENDAR_LIST_EVENTS` mock handler
  - [x] Implement `CALENDAR_CREATE_EVENT` mock handler
- [x] Configure MSW for test environments (AC: #2)
  - [x] Setup MSW server for Node.js (Vitest)
  - [x] Ensure no network leakage in CI
- [x] Document mock patterns (AC: #1, #2)
  - [x] Update `tests/README.md` with Composio mock usage

### Code Review Follow-ups (Fixed)

- [x] [AI-Review][HIGH] Add error response mock handlers for rate limit, auth, network errors
- [x] [AI-Review][HIGH] Add TypeScript interfaces for request/response types
- [x] [AI-Review][HIGH] Fix test SC-006 module state pollution - properly test CI detection
- [x] [AI-Review][MEDIUM] Extract duplicated COMPOSIO_API_BASE to shared types.ts
- [x] [AI-Review][MEDIUM] Fix inconsistent type assertion style in setup.ts
- [x] [AI-Review][MEDIUM] Make CI detection case-insensitive (handles CI=TRUE, CI=True)

## Dev Notes

### Technical Requirements
- Install `msw@^2.0` as dev dependency
- Create `tests/fixtures/mocks/composio/` with mock handlers
- Support tool call patterns: `GMAIL_*`, `CALENDAR_*`
- Document mock patterns in `tests/README.md`

### Testability Concern Addressed
- **TC-1**: Composio MCP mocking strategy undefined (Score 6) — CRITICAL
- Source: `thoughts/planning-artifacts/test-design-system.md` Section 5.1

### Project Structure Notes
- Mock handlers go in `tests/fixtures/mocks/composio/`
- MSW setup files in `tests/fixtures/mocks/setup.ts`
- No changes to production code required

### References
- [Source: thoughts/planning-artifacts/test-design-system.md#5.1]
- [Source: thoughts/planning-artifacts/architecture.md#Composio SDK Integration]
- [MSW Documentation: https://mswjs.io/docs]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5

### Implementation Plan
1. Installed MSW v2.12.7 as explicit dev dependency
2. Created mock handlers for all 5 required Composio tools (Gmail and Calendar)
3. Implemented MSW server setup with CI-aware network isolation
4. Added comprehensive tests for all mock handlers
5. Updated tests/README.md with Composio mock usage documentation

### Completion Notes List
- MSW installed as explicit devDependency (msw@^2.12.7)
- Created `tests/fixtures/mocks/composio/` with organized handler files
- Gmail handlers: GMAIL_GET_EMAILS, GMAIL_SEND_EMAIL, GMAIL_SEARCH
- Calendar handlers: CALENDAR_LIST_EVENTS, CALENDAR_CREATE_EVENT
- MSW server configured with `onUnhandledRequest: 'error'` in CI for network isolation
- Added `setupMswServer()` convenience function for lifecycle hooks
- All 25 tests pass (3 MSW setup + 8 handler + 7 server config + 7 error handler tests)
- Pre-existing failing test (CV-004) unrelated to this story

### Code Review Fixes Applied (2026-01-24)
- Added `types.ts` with TypeScript interfaces for all request/response types
- Added error mock handlers (`gmailErrorHandlers`, `calendarErrorHandlers`) for:
  - Rate limit errors (429)
  - Authentication errors (401)
  - Network errors
- Extracted `COMPOSIO_API_BASE` to shared types.ts
- Fixed CI detection to handle case-insensitive values
- Added proper type annotations throughout
- Rewrote SC-006 test to properly test `isRunningInCI()` function
- Added SC-007 test for comprehensive CI value handling
- Added 7 new error handler tests (EH-001 through EH-007)

### File List
New files created:
- tests/fixtures/mocks/composio/index.ts
- tests/fixtures/mocks/composio/gmail-handlers.ts
- tests/fixtures/mocks/composio/calendar-handlers.ts
- tests/fixtures/mocks/composio/types.ts (added in review)
- tests/fixtures/mocks/setup.ts
- tests/unit/mocks/msw-setup.spec.ts
- tests/unit/mocks/composio-handlers.spec.ts
- tests/unit/mocks/msw-server-config.spec.ts
- tests/unit/mocks/composio-error-handlers.spec.ts (added in review)

Modified files:
- package.json (added msw to devDependencies)
- tests/README.md (added Composio mock documentation)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-24 | Story implementation complete - MSW configured with Composio mock handlers | Dev Agent (Opus 4.5) |
| 2026-01-24 | Code review fixes: Added error handlers, TypeScript types, improved CI detection, 8 new tests | Dev Agent (Opus 4.5) |
