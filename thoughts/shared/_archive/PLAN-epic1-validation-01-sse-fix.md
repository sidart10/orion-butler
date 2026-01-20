# Plan: Epic 1 Validation - SSE Integration Fix

## Goal
Fix the 9 failing integration tests in `tests/integration/streaming/sse-endpoint.test.ts` that are hitting "Not Found" errors when testing the Agent Server SSE endpoint.

## Technical Choices
- **Test strategy**: Tests should either start the server before running OR be properly skipped when server unavailable
- **Server management**: Add vitest globalSetup/teardown for agent-server lifecycle management
- **Mocking**: For CI environments without API key, use mock SSE responses

## Current State Analysis

The integration tests fail because:
1. Tests expect Agent Server running on `localhost:3001`
2. Tests check `serverAvailable` but still run assertions when false
3. Route `/api/stream/health` returns 404 → indicates route mounting issue or server not started

### Key Files:
- `tests/integration/streaming/sse-endpoint.test.ts` - Failing tests
- `agent-server/src/index.ts` - Server entry point (routes look correct)
- `agent-server/src/routes/stream.ts` - SSE endpoint implementation
- `vitest.config.ts` - Test configuration (needs globalSetup)

## Tasks

### Task 1: Diagnose Route Mounting Issue
Verify the agent server routes are correctly mounted and responding.
- [ ] Start agent-server manually: `cd agent-server && npm run dev`
- [ ] Curl test: `curl http://localhost:3001/api/stream/health`
- [ ] Curl test: `curl http://localhost:3001/health`
- [ ] Document actual response vs expected

**Files to verify:**
- `agent-server/src/index.ts` - Line 62-64 route mounting
- `agent-server/package.json` - Start scripts

### Task 2: Fix Test Skip Logic
Ensure tests properly skip when server unavailable instead of running and failing.
- [ ] Change `if (!serverAvailable) { console.log(); return; }` to `test.skip()`
- [ ] Add vitest `skipIf` helper for cleaner conditionals
- [ ] Ensure beforeAll sets serverAvailable correctly

**Files to modify:**
- `tests/integration/streaming/sse-endpoint.test.ts`

### Task 3: Add Test Server Lifecycle Management
Create global setup/teardown to manage agent-server for integration tests.
- [ ] Create `tests/integration/setup.ts` with server spawn logic
- [ ] Create `tests/integration/teardown.ts` with cleanup
- [ ] Configure vitest to use these files
- [ ] Add health check wait loop before tests run

**Files to create:**
- `tests/integration/setup.ts`
- `tests/integration/teardown.ts`

**Files to modify:**
- `vitest.config.ts`

### Task 4: Add Mock Mode for CI
Support running SSE tests without real Claude API in CI.
- [ ] Create mock SSE response fixtures
- [ ] Add MOCK_CLAUDE_API env var check
- [ ] Implement mock stream endpoint for tests
- [ ] Update tests to use mock when API key unavailable

**Files to create:**
- `tests/fixtures/sse-mock-responses.ts`

**Files to modify:**
- `tests/integration/streaming/sse-endpoint.test.ts`

### Task 5: Verify All Integration Tests Pass
Run full integration test suite and confirm fixes.
- [ ] Run `pnpm test:integration` - expect 0 failures
- [ ] Document any remaining issues

## Success Criteria

### Automated Verification:
- [ ] `pnpm test:integration` passes with 0 failures
- [ ] Tests properly skip when server unavailable (no false failures)
- [ ] CI can run tests with mock responses (no API key required)

### Manual Verification:
- [ ] Agent server starts correctly: `cd agent-server && npm run dev`
- [ ] Health endpoint responds: `curl http://localhost:3001/api/stream/health`

## Out of Scope
- E2E test infrastructure (separate plan)
- Test coverage improvements (separate plan)
- ATDD test ID alignment (separate plan)

## Risks

### Tigers:
- **Agent server dependency issues** (MEDIUM)
  - Mitigation: Check node_modules, run npm install in agent-server/
- **Port conflicts** (LOW)
  - Mitigation: Make port configurable, check for existing processes

## Estimated Effort
~2-3 hours

## Dependencies
None - can start immediately
