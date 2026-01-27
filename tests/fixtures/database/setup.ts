/**
 * SQLite Test Database Fixtures
 *
 * Provides test isolation through transaction-based cleanup.
 * Uses in-memory SQLite for unit tests and file-based SQLite for integration tests.
 *
 * @see Story 0-6: SQLite Test Fixtures with Auto-Cleanup
 * @see thoughts/planning-artifacts/architecture.md#Database Layer
 */

import Database from 'better-sqlite3';

/**
 * Database configuration types
 */
export interface TestDatabaseConfig {
  /**
   * Database mode:
   * - 'memory': In-memory SQLite for fast unit tests
   * - 'file': File-based SQLite for integration tests
   */
  mode: 'memory' | 'file';

  /**
   * File path for file-based mode (ignored for memory mode)
   * Default: ':memory:' for memory mode, './test.db' for file mode
   */
  filePath?: string;

  /**
   * Enable WAL mode for non-blocking reads in parallel tests
   * Default: true for file mode, false for memory mode
   */
  walMode?: boolean;

  /**
   * Enable verbose logging
   */
  verbose?: boolean;
}

/**
 * Test transaction context for isolation
 */
export interface TestTransaction {
  /**
   * The underlying database connection
   */
  db: Database.Database;

  /**
   * Savepoint name for nested transactions
   */
  savepoint: string;

  /**
   * Rollback the transaction (cleanup)
   */
  rollback: () => void;

  /**
   * Commit the transaction (persist changes)
   */
  commit: () => void;
}

/**
 * Database fixture manager for test isolation
 */
export class TestDatabaseFixture {
  private db: Database.Database | null = null;
  private config: Required<TestDatabaseConfig>;
  private transactionCounter = 0;
  private activeTransactions: Map<string, boolean> = new Map();

  constructor(config: TestDatabaseConfig = { mode: 'memory' }) {
    this.config = {
      mode: config.mode,
      filePath: config.filePath ?? (config.mode === 'memory' ? ':memory:' : './test.db'),
      walMode: config.walMode ?? config.mode === 'file',
      verbose: config.verbose ?? false,
    };
  }

  /**
   * Initialize the database connection
   */
  async setup(): Promise<Database.Database> {
    if (this.db) {
      return this.db;
    }

    const dbPath = this.config.mode === 'memory' ? ':memory:' : this.config.filePath;

    this.db = new Database(dbPath, {
      verbose: this.config.verbose ? console.log : undefined,
    });

    // Configure for testing
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('foreign_keys = ON');

    // Enable WAL mode for non-blocking reads if configured
    if (this.config.walMode && this.config.mode === 'file') {
      this.db.pragma('journal_mode = WAL');
    }

    // Create test schema
    this.createTestSchema();

    return this.db;
  }

  /**
   * Create the test database schema
   * Matches entity types from tests/fixtures/factories/types.ts
   */
  private createTestSchema(): void {
    if (!this.db) {
      throw new Error('Database not initialized. Call setup() first.');
    }

    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        preferences TEXT DEFAULT '{}',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // Sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK(type IN ('Daily', 'Project', 'Inbox', 'Ad-hoc')),
        name TEXT NOT NULL,
        metadata TEXT DEFAULT '{}',
        created_at TEXT DEFAULT (datetime('now')),
        last_accessed_at TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(type);
    `);

    // Messages table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
    `);

    // Skills table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS skills (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        trigger TEXT NOT NULL,
        prompt_template TEXT NOT NULL,
        is_active INTEGER DEFAULT 1
      );
    `);

    // Hooks table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS hooks (
        id TEXT PRIMARY KEY,
        event TEXT NOT NULL CHECK(event IN (
          'SessionStart', 'SessionEnd', 'PreToolUse', 'PostToolUse',
          'PreMessage', 'PostMessage', 'PreSubagent', 'PostSubagent',
          'PreMcp', 'PostMcp', 'OnError', 'OnContextCompaction'
        )),
        handler TEXT NOT NULL,
        timeout INTEGER DEFAULT 5000,
        is_active INTEGER DEFAULT 1
      );
    `);

    // Canvas state table (FR-8.9)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS canvas_state (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        message_id TEXT,
        mode TEXT NOT NULL CHECK(mode IN ('display', 'edit', 'collapsed')),
        component TEXT,
        props TEXT,
        edit_type TEXT,
        edit_content TEXT,
        is_dirty INTEGER DEFAULT 0,
        interaction_result TEXT,
        interaction_at TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_canvas_conversation ON canvas_state(conversation_id);
    `);

    // Preferences table (for permission storage)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS preferences (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        UNIQUE(user_id, category, key)
      );
      CREATE INDEX IF NOT EXISTS idx_preferences_user_category ON preferences(user_id, category);
    `);
  }

  /**
   * Get the database connection
   * @throws Error if database not initialized
   */
  getDb(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call setup() first.');
    }
    return this.db;
  }

  /**
   * Begin a new transaction for test isolation
   * Uses savepoints for nested transaction support
   */
  beginTransaction(): TestTransaction {
    if (!this.db) {
      throw new Error('Database not initialized. Call setup() first.');
    }

    const savepoint = `test_sp_${++this.transactionCounter}`;
    this.db.exec(`SAVEPOINT ${savepoint}`);
    this.activeTransactions.set(savepoint, true);

    return {
      db: this.db,
      savepoint,
      rollback: () => {
        if (this.db && this.activeTransactions.has(savepoint)) {
          this.db.exec(`ROLLBACK TO SAVEPOINT ${savepoint}`);
          this.db.exec(`RELEASE SAVEPOINT ${savepoint}`);
          this.activeTransactions.delete(savepoint);
        }
      },
      commit: () => {
        if (this.db && this.activeTransactions.has(savepoint)) {
          this.db.exec(`RELEASE SAVEPOINT ${savepoint}`);
          this.activeTransactions.delete(savepoint);
        }
      },
    };
  }

  /**
   * Clean up all test data
   * Deletes all rows from all tables (preserves schema)
   */
  cleanupTestData(): void {
    if (!this.db) {
      return;
    }

    // Disable foreign key checks temporarily for cleanup
    this.db.exec('PRAGMA foreign_keys = OFF');

    // Delete from all tables in reverse dependency order
    const tables = [
      'preferences',
      'canvas_state',
      'messages',
      'sessions',
      'hooks',
      'skills',
      'users',
    ];

    for (const table of tables) {
      this.db.exec(`DELETE FROM ${table}`);
    }

    // Re-enable foreign key checks
    this.db.exec('PRAGMA foreign_keys = ON');
  }

  /**
   * Tear down the database connection
   */
  async teardown(): Promise<void> {
    if (this.db) {
      // Rollback any active transactions
      for (const [savepoint] of this.activeTransactions) {
        try {
          this.db.exec(`ROLLBACK TO SAVEPOINT ${savepoint}`);
          this.db.exec(`RELEASE SAVEPOINT ${savepoint}`);
        } catch {
          // Ignore errors during cleanup
        }
      }
      this.activeTransactions.clear();

      this.db.close();
      this.db = null;
    }

    this.transactionCounter = 0;
  }

  /**
   * Reset counters and state for fresh test runs
   */
  reset(): void {
    this.transactionCounter = 0;
    this.activeTransactions.clear();
    this.cleanupTestData();
  }

  /**
   * Check if database is initialized
   */
  isInitialized(): boolean {
    return this.db !== null;
  }

  /**
   * Get database configuration
   */
  getConfig(): Required<TestDatabaseConfig> {
    return { ...this.config };
  }
}

/**
 * Shared in-memory database instance for unit tests
 */
let unitTestDb: TestDatabaseFixture | null = null;

/**
 * Get or create the shared unit test database fixture
 */
export function getUnitTestDatabase(): TestDatabaseFixture {
  if (!unitTestDb) {
    unitTestDb = new TestDatabaseFixture({ mode: 'memory' });
  }
  return unitTestDb;
}

/**
 * Create a new file-based database fixture for integration tests
 * @param filePath Path to the database file (default: './test-integration.db')
 */
export function createIntegrationTestDatabase(
  filePath = './test-integration.db'
): TestDatabaseFixture {
  return new TestDatabaseFixture({
    mode: 'file',
    filePath,
    walMode: true,
  });
}

/**
 * Vitest beforeEach/afterEach helper for transaction-based test isolation
 *
 * @example
 * ```typescript
 * import { describe, it, beforeEach, afterEach, expect } from 'vitest';
 * import { withTestTransaction } from '@/tests/fixtures/database/setup';
 *
 * describe('MyDatabaseTests', () => {
 *   const { setup, cleanup } = withTestTransaction();
 *
 *   beforeEach(setup);
 *   afterEach(cleanup);
 *
 *   it('should isolate test data', () => {
 *     // Test code here - all changes rolled back after test
 *   });
 * });
 * ```
 */
export function withTestTransaction(fixture?: TestDatabaseFixture): {
  setup: () => Promise<TestTransaction>;
  cleanup: () => void;
} {
  let transaction: TestTransaction | null = null;
  const db = fixture ?? getUnitTestDatabase();

  return {
    setup: async () => {
      if (!db.isInitialized()) {
        await db.setup();
      }
      transaction = db.beginTransaction();
      return transaction;
    },
    cleanup: () => {
      if (transaction) {
        transaction.rollback();
        transaction = null;
      }
    },
  };
}

/**
 * Vitest setup helper for database fixtures
 * Call in vitest.setup.ts or test file setup
 */
export async function setupTestDatabase(): Promise<TestDatabaseFixture> {
  const fixture = getUnitTestDatabase();
  await fixture.setup();
  return fixture;
}

/**
 * Vitest teardown helper for database fixtures
 * Call in vitest cleanup or afterAll
 */
export async function teardownTestDatabase(): Promise<void> {
  const fixture = getUnitTestDatabase();
  await fixture.teardown();
  unitTestDb = null;
}
