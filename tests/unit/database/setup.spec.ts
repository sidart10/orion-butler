/**
 * Tests for SQLite Test Database Fixtures
 *
 * @see Story 0-6: SQLite Test Fixtures with Auto-Cleanup
 * AC#1: Given test fixture is applied, When test creates database records, Then records exist only during that test execution
 * AC#2: Given test completes (pass or fail), When cleanup runs, Then all test-created data is removed automatically
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import {
  TestDatabaseFixture,
  TestTransaction,
  getUnitTestDatabase,
  createIntegrationTestDatabase,
  withTestTransaction,
  setupTestDatabase,
  teardownTestDatabase,
} from '../../fixtures/database/setup';

describe('TestDatabaseFixture', () => {
  describe('Constructor and Configuration', () => {
    it('should create an in-memory database by default', () => {
      const fixture = new TestDatabaseFixture();
      const config = fixture.getConfig();

      expect(config.mode).toBe('memory');
      expect(config.filePath).toBe(':memory:');
      expect(config.walMode).toBe(false);
      expect(config.verbose).toBe(false);
    });

    it('should accept memory mode configuration', () => {
      const fixture = new TestDatabaseFixture({ mode: 'memory' });
      const config = fixture.getConfig();

      expect(config.mode).toBe('memory');
      expect(config.filePath).toBe(':memory:');
    });

    it('should accept file mode configuration', () => {
      const fixture = new TestDatabaseFixture({
        mode: 'file',
        filePath: './custom-test.db',
      });
      const config = fixture.getConfig();

      expect(config.mode).toBe('file');
      expect(config.filePath).toBe('./custom-test.db');
      expect(config.walMode).toBe(true); // Default for file mode
    });

    it('should allow custom WAL mode configuration', () => {
      const fixture = new TestDatabaseFixture({
        mode: 'file',
        walMode: false,
      });
      const config = fixture.getConfig();

      expect(config.walMode).toBe(false);
    });

    it('should not be initialized before setup()', () => {
      const fixture = new TestDatabaseFixture();
      expect(fixture.isInitialized()).toBe(false);
    });
  });

  describe('Setup and Teardown', () => {
    let fixture: TestDatabaseFixture;

    beforeEach(() => {
      fixture = new TestDatabaseFixture({ mode: 'memory' });
    });

    afterEach(async () => {
      await fixture.teardown();
    });

    it('should initialize database on setup()', async () => {
      const db = await fixture.setup();

      expect(fixture.isInitialized()).toBe(true);
      expect(db).toBeDefined();
    });

    it('should return same database instance on repeated setup() calls', async () => {
      const db1 = await fixture.setup();
      const db2 = await fixture.setup();

      expect(db1).toBe(db2);
    });

    it('should create all required tables on setup()', async () => {
      await fixture.setup();
      const db = fixture.getDb();

      // Check all tables exist
      const tables = db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        )
        .all() as { name: string }[];
      const tableNames = tables.map((t) => t.name);

      expect(tableNames).toContain('users');
      expect(tableNames).toContain('sessions');
      expect(tableNames).toContain('messages');
      expect(tableNames).toContain('skills');
      expect(tableNames).toContain('hooks');
      expect(tableNames).toContain('canvas_state');
      expect(tableNames).toContain('preferences');
    });

    it('should throw error when getDb() called before setup()', () => {
      expect(() => fixture.getDb()).toThrow('Database not initialized');
    });

    it('should close database on teardown()', async () => {
      await fixture.setup();
      await fixture.teardown();

      expect(fixture.isInitialized()).toBe(false);
    });

    it('should handle teardown() when not initialized', async () => {
      // Should not throw
      await expect(fixture.teardown()).resolves.toBeUndefined();
    });
  });

  describe('Transaction-Based Test Isolation (AC#1, AC#2)', () => {
    let fixture: TestDatabaseFixture;

    beforeAll(async () => {
      fixture = new TestDatabaseFixture({ mode: 'memory' });
      await fixture.setup();
    });

    afterAll(async () => {
      await fixture.teardown();
    });

    it('AC#1: should isolate test data within transaction', async () => {
      const db = fixture.getDb();
      const tx = fixture.beginTransaction();

      // Insert test data
      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('test-id', 'test@example.com', 'Test User')"
      ).run();

      // Verify data exists during transaction
      const user = db.prepare("SELECT * FROM users WHERE id = 'test-id'").get();
      expect(user).toBeDefined();

      // Rollback transaction
      tx.rollback();

      // Verify data is removed after rollback
      const userAfterRollback = db.prepare("SELECT * FROM users WHERE id = 'test-id'").get();
      expect(userAfterRollback).toBeUndefined();
    });

    it('AC#2: should automatically rollback on cleanup', async () => {
      const { setup, cleanup } = withTestTransaction(fixture);

      // Start transaction
      await setup();
      const db = fixture.getDb();

      // Insert test data
      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('auto-cleanup-id', 'auto@example.com', 'Auto User')"
      ).run();

      // Verify data exists
      const userBefore = db.prepare("SELECT * FROM users WHERE id = 'auto-cleanup-id'").get();
      expect(userBefore).toBeDefined();

      // Run cleanup (simulates afterEach)
      cleanup();

      // Verify data is removed
      const userAfter = db.prepare("SELECT * FROM users WHERE id = 'auto-cleanup-id'").get();
      expect(userAfter).toBeUndefined();
    });

    it('should support nested transactions via savepoints', async () => {
      const db = fixture.getDb();

      // Outer transaction
      const tx1 = fixture.beginTransaction();
      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('outer-id', 'outer@example.com', 'Outer User')"
      ).run();

      // Inner transaction
      const tx2 = fixture.beginTransaction();
      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('inner-id', 'inner@example.com', 'Inner User')"
      ).run();

      // Both should exist
      expect(db.prepare("SELECT * FROM users WHERE id = 'outer-id'").get()).toBeDefined();
      expect(db.prepare("SELECT * FROM users WHERE id = 'inner-id'").get()).toBeDefined();

      // Rollback inner only
      tx2.rollback();

      // Inner should be gone, outer should remain
      expect(db.prepare("SELECT * FROM users WHERE id = 'outer-id'").get()).toBeDefined();
      expect(db.prepare("SELECT * FROM users WHERE id = 'inner-id'").get()).toBeUndefined();

      // Rollback outer
      tx1.rollback();

      // Both should be gone
      expect(db.prepare("SELECT * FROM users WHERE id = 'outer-id'").get()).toBeUndefined();
    });

    it('should support commit to persist changes', async () => {
      const db = fixture.getDb();
      const tx = fixture.beginTransaction();

      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('commit-id', 'commit@example.com', 'Commit User')"
      ).run();

      // Commit instead of rollback
      tx.commit();

      // Data should persist (manual cleanup needed)
      const user = db.prepare("SELECT * FROM users WHERE id = 'commit-id'").get();
      expect(user).toBeDefined();

      // Clean up manually
      db.prepare("DELETE FROM users WHERE id = 'commit-id'").run();
    });
  });

  describe('Test Data Cleanup Utilities', () => {
    let fixture: TestDatabaseFixture;

    beforeAll(async () => {
      fixture = new TestDatabaseFixture({ mode: 'memory' });
      await fixture.setup();
    });

    afterAll(async () => {
      await fixture.teardown();
    });

    it('should clean up all test data with cleanupTestData()', async () => {
      const db = fixture.getDb();

      // Insert test data in multiple tables
      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('cleanup-user', 'cleanup@example.com', 'Cleanup User')"
      ).run();
      db.prepare(
        "INSERT INTO sessions (id, user_id, type, name) VALUES ('cleanup-session', 'cleanup-user', 'Daily', 'Test Session')"
      ).run();
      db.prepare(
        "INSERT INTO messages (id, session_id, role, content) VALUES ('cleanup-msg', 'cleanup-session', 'user', 'Hello')"
      ).run();
      db.prepare(
        "INSERT INTO skills (id, name, trigger, prompt_template) VALUES ('cleanup-skill', 'test-skill', '/test', 'Test prompt')"
      ).run();

      // Verify data exists
      expect(db.prepare('SELECT COUNT(*) as count FROM users').get()).toEqual({ count: 1 });
      expect(db.prepare('SELECT COUNT(*) as count FROM sessions').get()).toEqual({ count: 1 });
      expect(db.prepare('SELECT COUNT(*) as count FROM messages').get()).toEqual({ count: 1 });
      expect(db.prepare('SELECT COUNT(*) as count FROM skills').get()).toEqual({ count: 1 });

      // Clean up
      fixture.cleanupTestData();

      // Verify all data is removed
      expect(db.prepare('SELECT COUNT(*) as count FROM users').get()).toEqual({ count: 0 });
      expect(db.prepare('SELECT COUNT(*) as count FROM sessions').get()).toEqual({ count: 0 });
      expect(db.prepare('SELECT COUNT(*) as count FROM messages').get()).toEqual({ count: 0 });
      expect(db.prepare('SELECT COUNT(*) as count FROM skills').get()).toEqual({ count: 0 });
    });

    it('should preserve schema after cleanup', async () => {
      fixture.cleanupTestData();
      const db = fixture.getDb();

      // Tables should still exist
      const tables = db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        )
        .all() as { name: string }[];

      expect(tables.length).toBeGreaterThan(0);
      expect(tables.map((t) => t.name)).toContain('users');
    });

    it('should reset counters with reset()', async () => {
      const db = fixture.getDb();

      // Insert some data
      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('reset-user', 'reset@example.com', 'Reset User')"
      ).run();

      // Reset
      fixture.reset();

      // Data should be cleaned
      expect(db.prepare('SELECT COUNT(*) as count FROM users').get()).toEqual({ count: 0 });
    });
  });

  describe('Schema Validation', () => {
    let fixture: TestDatabaseFixture;

    beforeAll(async () => {
      fixture = new TestDatabaseFixture({ mode: 'memory' });
      await fixture.setup();
    });

    afterAll(async () => {
      await fixture.teardown();
    });

    it('should enforce foreign key constraints', async () => {
      const db = fixture.getDb();

      // Try to insert session without user - should fail
      expect(() => {
        db.prepare(
          "INSERT INTO sessions (id, user_id, type, name) VALUES ('orphan-session', 'nonexistent-user', 'Daily', 'Orphan')"
        ).run();
      }).toThrow();
    });

    it('should enforce session type check constraint', async () => {
      const db = fixture.getDb();

      // Create user first
      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('constraint-user', 'constraint@example.com', 'Constraint User')"
      ).run();

      // Try to insert session with invalid type
      expect(() => {
        db.prepare(
          "INSERT INTO sessions (id, user_id, type, name) VALUES ('bad-session', 'constraint-user', 'InvalidType', 'Bad')"
        ).run();
      }).toThrow();

      // Clean up
      db.prepare("DELETE FROM users WHERE id = 'constraint-user'").run();
    });

    it('should enforce message role check constraint', async () => {
      const db = fixture.getDb();

      // Create user and session first
      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('role-user', 'role@example.com', 'Role User')"
      ).run();
      db.prepare(
        "INSERT INTO sessions (id, user_id, type, name) VALUES ('role-session', 'role-user', 'Daily', 'Role Session')"
      ).run();

      // Try to insert message with invalid role
      expect(() => {
        db.prepare(
          "INSERT INTO messages (id, session_id, role, content) VALUES ('bad-msg', 'role-session', 'invalid', 'Hello')"
        ).run();
      }).toThrow();

      // Clean up
      db.prepare("DELETE FROM sessions WHERE id = 'role-session'").run();
      db.prepare("DELETE FROM users WHERE id = 'role-user'").run();
    });

    it('should enforce hook event type check constraint', async () => {
      const db = fixture.getDb();

      // Try to insert hook with invalid event type
      expect(() => {
        db.prepare(
          "INSERT INTO hooks (id, event, handler) VALUES ('bad-hook', 'InvalidEvent', 'handler.ts')"
        ).run();
      }).toThrow();
    });

    it('should enforce unique email constraint on users', async () => {
      const db = fixture.getDb();

      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('unique-user-1', 'unique@example.com', 'User 1')"
      ).run();

      // Try to insert another user with same email
      expect(() => {
        db.prepare(
          "INSERT INTO users (id, email, display_name) VALUES ('unique-user-2', 'unique@example.com', 'User 2')"
        ).run();
      }).toThrow();

      // Clean up
      db.prepare("DELETE FROM users WHERE id = 'unique-user-1'").run();
    });
  });

  describe('Singleton and Factory Functions', () => {
    it('should return same instance for getUnitTestDatabase()', () => {
      const db1 = getUnitTestDatabase();
      const db2 = getUnitTestDatabase();

      expect(db1).toBe(db2);
    });

    it('should create new instance for createIntegrationTestDatabase()', () => {
      const db1 = createIntegrationTestDatabase('./test-1.db');
      const db2 = createIntegrationTestDatabase('./test-2.db');

      expect(db1).not.toBe(db2);
      expect(db1.getConfig().filePath).toBe('./test-1.db');
      expect(db2.getConfig().filePath).toBe('./test-2.db');
    });

    it('should configure WAL mode for integration test database', () => {
      const db = createIntegrationTestDatabase();
      const config = db.getConfig();

      expect(config.mode).toBe('file');
      expect(config.walMode).toBe(true);
    });
  });

  describe('withTestTransaction Helper', () => {
    let fixture: TestDatabaseFixture;

    beforeAll(async () => {
      fixture = new TestDatabaseFixture({ mode: 'memory' });
      await fixture.setup();
    });

    afterAll(async () => {
      await fixture.teardown();
    });

    it('should provide setup and cleanup functions', () => {
      const helper = withTestTransaction(fixture);

      expect(typeof helper.setup).toBe('function');
      expect(typeof helper.cleanup).toBe('function');
    });

    it('should return transaction from setup', async () => {
      const { setup, cleanup } = withTestTransaction(fixture);

      const tx = await setup();

      expect(tx).toBeDefined();
      expect(tx.db).toBeDefined();
      expect(tx.savepoint).toBeDefined();
      expect(typeof tx.rollback).toBe('function');
      expect(typeof tx.commit).toBe('function');

      cleanup();
    });

    it('should handle multiple setup/cleanup cycles', async () => {
      const { setup, cleanup } = withTestTransaction(fixture);

      // First cycle
      await setup();
      cleanup();

      // Second cycle
      await setup();
      cleanup();

      // Third cycle
      const tx = await setup();
      expect(tx).toBeDefined();
      cleanup();
    });
  });

  describe('setupTestDatabase and teardownTestDatabase', () => {
    afterEach(async () => {
      await teardownTestDatabase();
    });

    it('should setup shared unit test database', async () => {
      const fixture = await setupTestDatabase();

      expect(fixture.isInitialized()).toBe(true);
      expect(fixture.getConfig().mode).toBe('memory');
    });

    it('should teardown shared unit test database', async () => {
      const fixture = await setupTestDatabase();
      expect(fixture.isInitialized()).toBe(true);

      await teardownTestDatabase();

      // Getting a new instance should not be initialized
      const newFixture = getUnitTestDatabase();
      expect(newFixture.isInitialized()).toBe(false);
    });
  });
});

describe('Integration: Real Test Workflow (AC#1, AC#2)', () => {
  /**
   * This test suite simulates a real test workflow to verify
   * that AC#1 and AC#2 are satisfied end-to-end.
   */

  let fixture: TestDatabaseFixture;
  let testHelper: ReturnType<typeof withTestTransaction>;

  beforeAll(async () => {
    fixture = new TestDatabaseFixture({ mode: 'memory' });
    await fixture.setup();
    testHelper = withTestTransaction(fixture);
  });

  afterAll(async () => {
    await fixture.teardown();
  });

  describe('Test Suite A - Data Isolation', () => {
    beforeEach(async () => {
      await testHelper.setup();
    });

    afterEach(() => {
      testHelper.cleanup();
    });

    it('test 1: should create user that exists only during this test', () => {
      const db = fixture.getDb();

      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('suite-a-user', 'suite-a@example.com', 'Suite A User')"
      ).run();

      const user = db.prepare("SELECT * FROM users WHERE id = 'suite-a-user'").get();
      expect(user).toBeDefined();
    });

    it('test 2: should not see data from test 1', () => {
      const db = fixture.getDb();

      const user = db.prepare("SELECT * FROM users WHERE id = 'suite-a-user'").get();
      expect(user).toBeUndefined();
    });

    it('test 3: should create session with messages that are isolated', () => {
      const db = fixture.getDb();

      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('session-user', 'session@example.com', 'Session User')"
      ).run();
      db.prepare(
        "INSERT INTO sessions (id, user_id, type, name) VALUES ('test-session', 'session-user', 'Daily', 'Test')"
      ).run();
      db.prepare(
        "INSERT INTO messages (id, session_id, role, content) VALUES ('msg-1', 'test-session', 'user', 'Hello')"
      ).run();
      db.prepare(
        "INSERT INTO messages (id, session_id, role, content) VALUES ('msg-2', 'test-session', 'assistant', 'Hi there!')"
      ).run();

      const messages = db.prepare("SELECT * FROM messages WHERE session_id = 'test-session'").all();
      expect(messages).toHaveLength(2);
    });

    it('test 4: should not see session or messages from test 3', () => {
      const db = fixture.getDb();

      const session = db.prepare("SELECT * FROM sessions WHERE id = 'test-session'").get();
      expect(session).toBeUndefined();

      const messages = db.prepare("SELECT * FROM messages WHERE session_id = 'test-session'").all();
      expect(messages).toHaveLength(0);
    });
  });

  describe('Test Suite B - Failure Handling (AC#2)', () => {
    beforeEach(async () => {
      await testHelper.setup();
    });

    afterEach(() => {
      testHelper.cleanup();
    });

    it('should clean up data even when test fails assertion', () => {
      const db = fixture.getDb();

      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('failure-user', 'failure@example.com', 'Failure User')"
      ).run();

      // This test passes - but simulates a scenario where previous test might have failed
      const user = db.prepare("SELECT * FROM users WHERE id = 'failure-user'").get();
      expect(user).toBeDefined();
    });

    it('should verify cleanup happened regardless of previous test outcome', () => {
      const db = fixture.getDb();

      // Previous test's data should not exist
      const user = db.prepare("SELECT * FROM users WHERE id = 'failure-user'").get();
      expect(user).toBeUndefined();
    });
  });
});
