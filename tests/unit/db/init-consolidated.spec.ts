/**
 * Tests for Consolidated Database Initialization
 * Database Initialization Fix - Phase 0.3
 *
 * TDD Phase: RED - Write failing tests first
 *
 * Tests the NEW combined init.ts module that:
 * 1. Runs PRAGMA statements
 * 2. Creates tables using Drizzle-generated SQL
 * 3. Verifies configuration
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// These imports will work after implementation
import {
  initializeDatabase,
  initializeDatabaseWithConnection,
  verifyConfig,
} from '@/db/init';
import { resetDatabase, setDatabase } from '@/db/connection';
import type { IDatabase, DbConfigResult } from '@/db/types';

describe('Database Initialization (Consolidated)', () => {
  let mockDb: IDatabase;

  beforeEach(() => {
    resetDatabase();
  });

  afterEach(() => {
    resetDatabase();
    vi.clearAllMocks();
  });

  describe('verifyConfig', () => {
    it('should pass valid configuration with all tables', () => {
      const config: DbConfigResult = {
        walEnabled: true,
        foreignKeysEnabled: true,
        journalMode: 'wal',
        tablesCreated: ['conversations', 'messages', 'session_index'],
      };

      const result = verifyConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when WAL mode is not enabled', () => {
      const config: DbConfigResult = {
        walEnabled: false,
        foreignKeysEnabled: true,
        journalMode: 'delete',
        tablesCreated: ['conversations', 'messages', 'session_index'],
      };

      const result = verifyConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('WAL mode not enabled. Current mode: delete');
    });

    it('should fail when foreign keys are not enabled', () => {
      const config: DbConfigResult = {
        walEnabled: true,
        foreignKeysEnabled: false,
        journalMode: 'wal',
        tablesCreated: ['conversations', 'messages', 'session_index'],
      };

      const result = verifyConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Foreign keys not enabled');
    });

    it('should fail when required tables are missing', () => {
      const config: DbConfigResult = {
        walEnabled: true,
        foreignKeysEnabled: true,
        journalMode: 'wal',
        tablesCreated: ['conversations'], // Missing messages, session_index
      };

      const result = verifyConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Missing tables');
      expect(result.errors[0]).toContain('messages');
      expect(result.errors[0]).toContain('session_index');
    });

    it('should report multiple errors', () => {
      const config: DbConfigResult = {
        walEnabled: false,
        foreignKeysEnabled: false,
        journalMode: 'delete',
        tablesCreated: [], // All tables missing
      };

      const result = verifyConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('initializeDatabaseWithConnection', () => {
    beforeEach(() => {
      mockDb = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn()
          .mockResolvedValueOnce([{ journal_mode: 'wal' }]) // PRAGMA journal_mode
          .mockResolvedValueOnce([{ foreign_keys: 1 }]) // PRAGMA foreign_keys
          .mockResolvedValue([
            // sqlite_master query
            { name: 'conversations' },
            { name: 'messages' },
            { name: 'session_index' },
          ]),
      };
    });

    it('should execute PRAGMA statements', async () => {
      const config = await initializeDatabaseWithConnection(mockDb);

      // Verify PRAGMA statements were executed
      expect(mockDb.execute).toHaveBeenCalledWith('PRAGMA journal_mode = WAL');
      expect(mockDb.execute).toHaveBeenCalledWith('PRAGMA foreign_keys = ON');
      expect(mockDb.execute).toHaveBeenCalledWith('PRAGMA synchronous = NORMAL');
      expect(mockDb.execute).toHaveBeenCalledWith('PRAGMA cache_size = -64000');
      expect(mockDb.execute).toHaveBeenCalledWith('PRAGMA temp_store = MEMORY');
    });

    it('should create tables using Drizzle-generated SQL', async () => {
      await initializeDatabaseWithConnection(mockDb);

      // Verify CREATE TABLE statements were executed
      const executeCalls = vi.mocked(mockDb.execute).mock.calls;
      const createTableCalls = executeCalls.filter(([sql]) =>
        sql.includes('CREATE TABLE IF NOT EXISTS')
      );

      expect(createTableCalls.length).toBeGreaterThan(0);
    });

    it('should return correct config with tablesCreated', async () => {
      const config = await initializeDatabaseWithConnection(mockDb);

      expect(config.walEnabled).toBe(true);
      expect(config.foreignKeysEnabled).toBe(true);
      expect(config.journalMode).toBe('wal');
      expect(config.tablesCreated).toContain('conversations');
      expect(config.tablesCreated).toContain('messages');
      expect(config.tablesCreated).toContain('session_index');
    });

    it('should handle WAL uppercase response', async () => {
      mockDb.select = vi.fn()
        .mockResolvedValueOnce([{ journal_mode: 'WAL' }]) // Uppercase
        .mockResolvedValueOnce([{ foreign_keys: 1 }])
        .mockResolvedValue([
          { name: 'conversations' },
          { name: 'messages' },
          { name: 'session_index' },
        ]);

      const config = await initializeDatabaseWithConnection(mockDb);

      expect(config.walEnabled).toBe(true);
      expect(config.journalMode).toBe('WAL');
    });

    it('should throw error when required tables are missing', async () => {
      mockDb.select = vi.fn()
        .mockResolvedValueOnce([{ journal_mode: 'wal' }])
        .mockResolvedValueOnce([{ foreign_keys: 1 }])
        .mockResolvedValue([]); // No tables found

      await expect(initializeDatabaseWithConnection(mockDb))
        .rejects.toThrow('Database init incomplete. Missing tables');
    });

    it('should handle foreign keys disabled', async () => {
      mockDb.select = vi.fn()
        .mockResolvedValueOnce([{ journal_mode: 'wal' }])
        .mockResolvedValueOnce([{ foreign_keys: 0 }]) // Disabled
        .mockResolvedValue([
          { name: 'conversations' },
          { name: 'messages' },
          { name: 'session_index' },
        ]);

      const config = await initializeDatabaseWithConnection(mockDb);

      expect(config.foreignKeysEnabled).toBe(false);
    });

    it('should handle missing PRAGMA results gracefully', async () => {
      mockDb.select = vi.fn()
        .mockResolvedValueOnce([]) // Empty journal_mode
        .mockResolvedValueOnce([]) // Empty foreign_keys
        .mockResolvedValue([
          { name: 'conversations' },
          { name: 'messages' },
          { name: 'session_index' },
        ]);

      const config = await initializeDatabaseWithConnection(mockDb);

      expect(config.journalMode).toBe('unknown');
      expect(config.walEnabled).toBe(false);
      expect(config.foreignKeysEnabled).toBe(false);
    });
  });

  describe('initializeDatabase (uses getDatabase)', () => {
    it('should call initializeDatabaseWithConnection with the db instance', async () => {
      // Set up a mock database
      mockDb = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn()
          .mockResolvedValueOnce([{ journal_mode: 'wal' }])
          .mockResolvedValueOnce([{ foreign_keys: 1 }])
          .mockResolvedValue([
            { name: 'conversations' },
            { name: 'messages' },
            { name: 'session_index' },
          ]),
      };

      setDatabase(mockDb);

      const config = await initializeDatabase();

      expect(config.walEnabled).toBe(true);
      expect(mockDb.execute).toHaveBeenCalled();
    });
  });
});
