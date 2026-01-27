/**
 * SQLite Test Database Fixtures - Public API
 *
 * @see Story 0-6: SQLite Test Fixtures with Auto-Cleanup
 * @see tests/README.md#SQLite Database Fixtures
 */

export {
  // Main fixture class
  TestDatabaseFixture,

  // Configuration types
  type TestDatabaseConfig,
  type TestTransaction,

  // Factory functions
  getUnitTestDatabase,
  createIntegrationTestDatabase,

  // Vitest helpers
  withTestTransaction,
  setupTestDatabase,
  teardownTestDatabase,
} from './setup';
