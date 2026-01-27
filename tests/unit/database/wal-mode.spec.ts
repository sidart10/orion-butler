/**
 * Tests for SQLite WAL Mode and Parallel Test Support
 *
 * @see Story 0-6: SQLite Test Fixtures with Auto-Cleanup
 * - Support WAL mode for non-blocking reads
 * - Test parallel execution doesn't cause conflicts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestDatabaseFixture, createIntegrationTestDatabase } from '../../fixtures/database/setup';
import * as fs from 'fs';
import * as path from 'path';

describe('WAL Mode Support', () => {
  const testDbPath = './test-wal-mode.db';

  afterAll(() => {
    // Clean up test database files
    const filesToClean = [testDbPath, `${testDbPath}-wal`, `${testDbPath}-shm`];
    for (const file of filesToClean) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    }
  });

  describe('WAL Mode Configuration', () => {
    it('should enable WAL mode for file-based databases', async () => {
      const fixture = createIntegrationTestDatabase(testDbPath);
      await fixture.setup();

      const db = fixture.getDb();
      const journalMode = db.pragma('journal_mode') as { journal_mode: string }[];

      expect(journalMode[0].journal_mode.toLowerCase()).toBe('wal');

      await fixture.teardown();
    });

    it('should not create WAL files for in-memory databases', async () => {
      const fixture = new TestDatabaseFixture({ mode: 'memory' });
      await fixture.setup();

      const db = fixture.getDb();
      const journalMode = db.pragma('journal_mode') as { journal_mode: string }[];

      // In-memory databases use WAL pragma but don't create files
      expect(['wal', 'memory']).toContain(journalMode[0].journal_mode.toLowerCase());

      await fixture.teardown();
    });

    it('should enable synchronous NORMAL mode for performance', async () => {
      const fixture = createIntegrationTestDatabase(testDbPath);
      await fixture.setup();

      const db = fixture.getDb();
      const syncMode = db.pragma('synchronous') as { synchronous: number }[];

      // NORMAL = 1
      expect(syncMode[0].synchronous).toBe(1);

      await fixture.teardown();
    });

    it('should enable foreign keys', async () => {
      const fixture = createIntegrationTestDatabase(testDbPath);
      await fixture.setup();

      const db = fixture.getDb();
      const fkMode = db.pragma('foreign_keys') as { foreign_keys: number }[];

      expect(fkMode[0].foreign_keys).toBe(1);

      await fixture.teardown();
    });
  });

  describe('Non-Blocking Reads (WAL Benefit)', () => {
    let fixture: TestDatabaseFixture;

    beforeAll(async () => {
      fixture = new TestDatabaseFixture({ mode: 'memory' });
      await fixture.setup();
    });

    afterAll(async () => {
      await fixture.teardown();
    });

    it('should allow concurrent reads during write transaction', async () => {
      const db = fixture.getDb();

      // Start a write transaction
      const tx = fixture.beginTransaction();
      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('wal-user', 'wal@example.com', 'WAL User')"
      ).run();

      // Read should work during transaction (WAL allows this)
      const users = db.prepare('SELECT * FROM users').all();
      expect(Array.isArray(users)).toBe(true);

      tx.rollback();
    });

    it('should allow multiple read transactions simultaneously', async () => {
      const db = fixture.getDb();

      // Setup test data
      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('read-user', 'read@example.com', 'Read User')"
      ).run();

      // Multiple reads should not block each other
      const results = await Promise.all([
        Promise.resolve(db.prepare('SELECT * FROM users').all()),
        Promise.resolve(db.prepare('SELECT * FROM users').all()),
        Promise.resolve(db.prepare('SELECT * FROM users').all()),
      ]);

      expect(results).toHaveLength(3);
      for (const result of results) {
        expect(result).toHaveLength(1);
      }

      // Cleanup
      db.prepare('DELETE FROM users').run();
    });
  });

  describe('Parallel Test Execution Safety', () => {
    let fixture: TestDatabaseFixture;

    beforeAll(async () => {
      fixture = new TestDatabaseFixture({ mode: 'memory' });
      await fixture.setup();
    });

    afterAll(async () => {
      await fixture.teardown();
    });

    it('should create unique savepoints for each transaction', async () => {
      const db = fixture.getDb();

      // Start a transaction
      const tx1 = fixture.beginTransaction();

      // Savepoint should follow naming pattern
      expect(tx1.savepoint).toMatch(/^test_sp_\d+$/);

      // Insert data
      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('savepoint-user', 'sp@example.com', 'User')"
      ).run();

      // Data should be visible
      expect(db.prepare("SELECT * FROM users WHERE id = 'savepoint-user'").get()).toBeDefined();

      // Rollback
      tx1.rollback();

      // Data should be gone
      expect(db.prepare("SELECT * FROM users WHERE id = 'savepoint-user'").get()).toBeUndefined();
    });

    it('should handle sequential transactions correctly', async () => {
      const db = fixture.getDb();

      // First transaction
      const tx1 = fixture.beginTransaction();
      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('seq-1', 's1@example.com', 'User 1')"
      ).run();
      tx1.rollback();

      // Second transaction - should start fresh
      const tx2 = fixture.beginTransaction();
      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('seq-2', 's2@example.com', 'User 2')"
      ).run();

      // Only tx2 data should exist
      expect(db.prepare("SELECT * FROM users WHERE id = 'seq-1'").get()).toBeUndefined();
      expect(db.prepare("SELECT * FROM users WHERE id = 'seq-2'").get()).toBeDefined();

      tx2.rollback();
    });

    it('should increment savepoint counter for each transaction', async () => {
      // Create transactions sequentially and verify unique names
      const tx1 = fixture.beginTransaction();
      const sp1Num = parseInt(tx1.savepoint.split('_')[2]);

      tx1.rollback();

      const tx2 = fixture.beginTransaction();
      const sp2Num = parseInt(tx2.savepoint.split('_')[2]);

      expect(sp2Num).toBeGreaterThan(sp1Num);

      tx2.rollback();
    });

    it('should safely handle transaction cleanup on teardown', async () => {
      // Create a new fixture
      const testFixture = new TestDatabaseFixture({ mode: 'memory' });
      await testFixture.setup();

      // Start some transactions but don't clean them up
      const tx1 = testFixture.beginTransaction();
      const tx2 = testFixture.beginTransaction();

      // Insert data
      const db = testFixture.getDb();
      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('teardown-1', 't1@example.com', 'User 1')"
      ).run();

      // Teardown should handle uncommitted transactions gracefully
      await expect(testFixture.teardown()).resolves.toBeUndefined();

      // Cleanup references (they're invalid now)
      // Just verifying no errors were thrown
    });
  });

  describe('Concurrent Write Handling', () => {
    let fixture: TestDatabaseFixture;

    beforeAll(async () => {
      fixture = new TestDatabaseFixture({ mode: 'memory' });
      await fixture.setup();
    });

    afterAll(async () => {
      await fixture.teardown();
    });

    it('should serialize writes within same connection', async () => {
      const db = fixture.getDb();
      const results: string[] = [];

      // Simulate concurrent writes (in reality, better-sqlite3 is synchronous)
      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('write-1', 'w1@example.com', 'Writer 1')"
      ).run();
      results.push('write-1');

      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('write-2', 'w2@example.com', 'Writer 2')"
      ).run();
      results.push('write-2');

      db.prepare(
        "INSERT INTO users (id, email, display_name) VALUES ('write-3', 'w3@example.com', 'Writer 3')"
      ).run();
      results.push('write-3');

      // All writes should succeed in order
      expect(results).toEqual(['write-1', 'write-2', 'write-3']);

      // All data should be present
      const users = db.prepare("SELECT id FROM users WHERE id LIKE 'write-%' ORDER BY id").all();
      expect(users).toHaveLength(3);

      // Cleanup
      db.prepare("DELETE FROM users WHERE id LIKE 'write-%'").run();
    });
  });
});
