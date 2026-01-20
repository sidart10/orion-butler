# Plan: Epic 1 Validation - Test Coverage Audit

## Goal
Audit test coverage against ATDD checklists to identify gaps between what was specified and what was implemented. Create traceability from ATDD test IDs to actual tests.

## Technical Choices
- **Audit approach**: Compare each story's ATDD checklist against actual test files
- **Traceability**: Create mapping document linking ATDD IDs to test files
- **Gap tracking**: Document missing tests with priority based on AC criticality

## Current State Analysis

The test coverage has issues:
1. **No ATDD test ID usage**: Tests don't reference IDs like `1.8-UNIT-001`
2. **Test naming inconsistent**: Mix of story-prefixed and feature-named tests
3. **Coverage claims unverifiable**: No way to trace AC→Test→Implementation
4. **VALIDATION-SUMMARY.md stale**: Shows pre-implementation status

### Key Files:
- `thoughts/implementation-artifacts/stories/atdd-checklist-1-*.md` - Test specifications
- `tests/unit/**/*.test.ts` - Unit tests (606 passing)
- `tests/integration/**/*.test.ts` - Integration tests (104 passing, 9 failing)
- `tests/e2e/**/*.spec.ts` - E2E tests (not running)

## Tasks

### Task 1: Inventory ATDD Checklists
List all ATDD checklists and extract test counts.
- [ ] Glob all `atdd-checklist-1-*.md` files
- [ ] Extract test ID counts per story (UNIT, INT, E2E, PERF)
- [ ] Create summary table: Story | Unit | Int | E2E | Perf | Total

**Files to examine:**
- `thoughts/implementation-artifacts/stories/atdd-checklist-1-*.md`

### Task 2: Inventory Actual Tests
List all test files and count tests per story.
- [ ] Map test files to stories by name pattern
- [ ] Count tests per file using `describe` and `test` blocks
- [ ] Create summary table: Story | File | Test Count

**Files to examine:**
- `tests/unit/**/*.test.ts`
- `tests/integration/**/*.test.ts`
- `tests/e2e/**/*.spec.ts`

### Task 3: Create Coverage Matrix
Compare ATDD specs vs actual tests per story.
- [ ] For each story, compare expected vs actual test counts
- [ ] Mark coverage status: ✅ Complete, ⚠️ Partial, ❌ Missing
- [ ] Calculate overall coverage percentage

**Files to create:**
- `thoughts/implementation-artifacts/validation/coverage-matrix.md`

### Task 4: Deep Dive Story 1.8 (Streaming)
Detailed trace of Story 1.8 as example audit.
- [ ] List all 38 specified tests from ATDD checklist
- [ ] Find corresponding actual test in test files
- [ ] Mark each: ✅ Found, ⚠️ Partial, ❌ Missing
- [ ] Document specific gaps

**Files to examine:**
- `thoughts/implementation-artifacts/stories/atdd-checklist-1-8-streaming-responses.md`
- `tests/unit/services/streamingService.test.ts`
- `tests/unit/stores/chatStore.streaming.test.ts`
- `tests/e2e/story-1.8-streaming.spec.ts`

### Task 5: Deep Dive Story 1.7 (Claude Integration)
Detailed trace of Story 1.7.
- [ ] Extract test specs from ATDD checklist
- [ ] Map to actual tests
- [ ] Document gaps

**Files to examine:**
- Story 1.7 ATDD checklist
- `tests/unit/stores/chatStore-claude.test.ts`
- Related integration tests

### Task 6: Identify Critical Gaps
Prioritize missing tests by AC importance.
- [ ] List all P0 (critical) tests that are missing
- [ ] List all P1 tests that are missing
- [ ] Create prioritized backlog of tests to add

**Files to create:**
- `thoughts/implementation-artifacts/validation/test-gaps.md`

### Task 7: Update VALIDATION-SUMMARY.md
Refresh the validation summary with audit results.
- [ ] Update status from "ready for development" to current state
- [ ] Add coverage statistics
- [ ] Add links to coverage matrix and gap analysis
- [ ] Note remaining work needed

**Files to modify:**
- `thoughts/implementation-artifacts/validation/VALIDATION-SUMMARY.md`

## Success Criteria

### Automated Verification:
- [ ] Coverage matrix document created
- [ ] Gap analysis document created
- [ ] All 11 stories audited

### Manual Verification:
- [ ] Coverage percentage calculated
- [ ] Critical (P0) gaps identified and listed
- [ ] VALIDATION-SUMMARY.md reflects current state

## Out of Scope
- Writing the missing tests (separate implementation work)
- Fixing the SSE integration tests (Plan 1)
- Fixing E2E infrastructure (Plan 2)
- Adding ATDD test IDs to existing tests (future improvement)

## Deliverables

1. **coverage-matrix.md**: Story-by-story comparison
2. **test-gaps.md**: Prioritized list of missing tests
3. **Updated VALIDATION-SUMMARY.md**: Current state documentation

## Estimated Effort
~4-6 hours (documentation-heavy)

## Dependencies
- None - can start immediately
- However, completion of Plans 1 & 2 will affect final coverage numbers

## Notes

### Stories to Audit (Epic 1):
1. Story 1.1: Tauri Desktop Shell
2. Story 1.2: Next.js Frontend Integration
3. Story 1.3: Design System Foundation
4. Story 1.4: SQLite Database Setup
5. Story 1.5: Agent Server Process
6. Story 1.6: Chat Message Storage
7. Story 1.7: Claude Integration
8. Story 1.8: Streaming Responses
9. Story 1.9: Split Screen Layout
10. Story 1.10: Tool Call Visualization
11. Story 1.11: Quick Actions & Keyboard Shortcuts

### Expected Output Format (Coverage Matrix):

| Story | ATDD Tests | Actual Tests | Coverage | Status |
|-------|------------|--------------|----------|--------|
| 1.1   | 25         | 18           | 72%      | ⚠️     |
| 1.2   | 20         | 15           | 75%      | ⚠️     |
| ...   | ...        | ...          | ...      | ...    |
