/**
 * Tests for Database Initialization
 * Story 3.1: SQLite Database Initialization
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect, vi } from 'vitest';

// These imports will fail until we implement the modules
import { initializeDatabase, verifyConfig } from '@/lib/db/init';

describe('Database Initialization', () => {
  describe('verifyConfig', () => {
    it('should pass valid configuration', () => {
      const result = verifyConfig({
        walEnabled: true,
        foreignKeysEnabled: true,
        journalMode: 'wal',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when WAL mode is not enabled', () => {
      const result = verifyConfig({
        walEnabled: false,
        foreignKeysEnabled: true,
        journalMode: 'delete',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('WAL mode not enabled. Current mode: delete');
    });

    it('should fail when foreign keys are not enabled', () => {
      const result = verifyConfig({
        walEnabled: true,
        foreignKeysEnabled: false,
        journalMode: 'wal',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Foreign keys not enabled');
    });

    it('should report multiple errors when both checks fail', () => {
      const result = verifyConfig({
        walEnabled: false,
        foreignKeysEnabled: false,
        journalMode: 'delete',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('initializeDatabase', () => {
    it('should execute PRAGMA statements', async () => {
      const mockDb = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn()
          .mockResolvedValueOnce([{ journal_mode: 'wal' }])
          .mockResolvedValueOnce([{ foreign_keys: 1 }]),
      };

      const result = await initializeDatabase(mockDb);

      expect(mockDb.execute).toHaveBeenCalledTimes(6); // 5 PRAGMA statements + schema_migrations
      expect(result.walEnabled).toBe(true);
      expect(result.foreignKeysEnabled).toBe(true);
    });

    it('should handle WAL uppercase response', async () => {
      const mockDb = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn()
          .mockResolvedValueOnce([{ journal_mode: 'WAL' }])  // Uppercase
          .mockResolvedValueOnce([{ foreign_keys: 1 }]),
      };

      const result = await initializeDatabase(mockDb);

      expect(result.walEnabled).toBe(true);
      expect(result.journalMode).toBe('WAL');
    });

    it('should return foreignKeysEnabled false when foreign_keys is 0', async () => {
      const mockDb = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn()
          .mockResolvedValueOnce([{ journal_mode: 'wal' }])
          .mockResolvedValueOnce([{ foreign_keys: 0 }]),
      };

      const result = await initializeDatabase(mockDb);

      expect(result.foreignKeysEnabled).toBe(false);
    });

    it('should handle missing PRAGMA results gracefully', async () => {
      const mockDb = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn()
          .mockResolvedValueOnce([])  // Empty result
          .mockResolvedValueOnce([]),
      };

      const result = await initializeDatabase(mockDb);

      expect(result.journalMode).toBe('unknown');
      expect(result.walEnabled).toBe(false);
      expect(result.foreignKeysEnabled).toBe(false);
    });
  });
});
