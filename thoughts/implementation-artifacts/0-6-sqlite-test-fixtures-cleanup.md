# Story 0.6: SQLite Test Fixtures with Auto-Cleanup

Status: done

## Story

As a **developer**,
I want SQLite test fixtures with automatic cleanup after each test,
So that tests remain isolated and don't pollute the database.

## Acceptance Criteria

1. **Given** test fixture is applied
   **When** test creates database records
   **Then** records exist only during that test execution

2. **Given** test completes (pass or fail)
   **When** cleanup runs
   **Then** all test-created data is removed automatically

## Tasks / Subtasks

- [x] Create database fixture setup (AC: #1)
  - [x] Create `tests/fixtures/database/setup.ts`
  - [x] Configure in-memory SQLite for unit tests (`:memory:`)
  - [x] Configure file-based SQLite for integration tests
- [x] Implement test isolation (AC: #1, #2)
  - [x] Use transactions for test isolation (savepoints)
  - [x] Implement `withTestTransaction()` helper with `setup` and `cleanup`
  - [x] Implement `afterEach` hook for rollback
- [x] Support WAL mode for parallel tests (AC: #1)
  - [x] Configure WAL mode for non-blocking reads
  - [x] Test parallel execution doesn't cause conflicts
- [x] Create cleanup utilities (AC: #2)
  - [x] Implement `cleanupTestData()` helper
  - [x] Handle cleanup on test failure (transaction rollback)
- [x] Document fixture usage (AC: #1, #2)
  - [x] Add examples to `tests/README.md`

## Dev Notes

### Technical Requirements
- Create `tests/fixtures/database/setup.ts`
- Use in-memory SQLite for unit tests (`:memory:`)
- Use file-based SQLite with transactions for integration tests
- Implement `beforeEach` / `afterEach` hooks for cleanup
- Support WAL mode for non-blocking reads in parallel tests

### Test Isolation Pattern
```typescript
// In vitest.setup.ts
beforeEach(async () => {
  await db.transaction(async (tx) => {
    // Test runs inside transaction
    testTx = tx;
  });
});

afterEach(async () => {
  // Transaction automatically rolled back
  await testTx.rollback();
});
```

### SQLite Configuration
- Unit tests: `:memory:` database (fastest)
- Integration tests: `test.db` with WAL mode
- CI: Fresh database per test run

### Project Structure Notes
- Database setup in `tests/fixtures/database/`
- Integrates with Drizzle ORM from Epic 3

### References
- [Source: thoughts/planning-artifacts/test-design-system.md#6.1]
- [Source: thoughts/planning-artifacts/architecture.md#Database Layer]
- [SQLite WAL Mode: https://www.sqlite.org/wal.html]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **TestDatabaseFixture Class**: Created main fixture class with:
   - Constructor with config options (mode: 'memory' | 'file', walMode, filePath, verbose)
   - `setup()` / `teardown()` lifecycle methods
   - `beginTransaction()` returns TestTransaction with rollback/commit
   - `cleanupTestData()` / `reset()` cleanup utilities
   - Schema creation for all entity types (users, sessions, messages, skills, hooks, canvas_state, preferences)

2. **Transaction-Based Test Isolation (AC#1, AC#2)**:
   - Uses SQLite savepoints for transaction isolation
   - `withTestTransaction()` helper provides `setup()` and `cleanup()` functions for beforeEach/afterEach
   - Automatic rollback ensures test data exists only during test execution
   - Cleanup runs on both test pass and fail

3. **WAL Mode Support**:
   - File-based databases use WAL mode by default for non-blocking reads
   - `journal_mode = WAL`, `synchronous = NORMAL` for performance
   - Foreign keys enabled for referential integrity

4. **Factory Functions**:
   - `getUnitTestDatabase()` - singleton in-memory database for unit tests
   - `createIntegrationTestDatabase(path)` - file-based database for integration tests
   - `setupTestDatabase()` / `teardownTestDatabase()` for Vitest global setup

5. **Tests Created**:
   - 37 tests in `setup.spec.ts` covering all functionality
   - 11 tests in `wal-mode.spec.ts` covering WAL mode and parallel execution
   - Total: 48 tests, all passing

### File List

**New Files:**
- `tests/fixtures/database/setup.ts` - Main TestDatabaseFixture implementation (300 lines)
- `tests/fixtures/database/index.ts` - Public API exports
- `tests/unit/database/setup.spec.ts` - Unit tests (37 tests)
- `tests/unit/database/wal-mode.spec.ts` - WAL mode tests (11 tests)

**Modified Files:**
- `tests/README.md` - Added SQLite Database Fixtures documentation section
