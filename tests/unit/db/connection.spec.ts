/**
 * Tests for Database Connection Module
 * Database Initialization Fix - Phase 0.2
 *
 * TDD Phase: RED - Write failing tests first
 *
 * Tests connection management functions from src/db/connection.ts
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// These imports will fail until we implement the module
import {
  getDatabase,
  resetDatabase,
  setDatabase,
} from '@/db/connection';
import type { IDatabase } from '@/db/types';

describe('Database Connection', () => {
  beforeEach(() => {
    // Reset database instance before each test
    resetDatabase();
  });

  afterEach(() => {
    resetDatabase();
    vi.unstubAllGlobals();
  });

  describe('getDatabase', () => {
    it('should return the same instance on subsequent calls', async () => {
      // In non-Tauri environment, should return in-memory fallback
      vi.stubGlobal('window', {});

      const db1 = await getDatabase();
      const db2 = await getDatabase();

      expect(db1).toBe(db2);
    });

    it('should return in-memory fallback when not in Tauri environment', async () => {
      vi.stubGlobal('window', {});

      const db = await getDatabase();

      expect(db).toBeDefined();
      expect(typeof db.execute).toBe('function');
      expect(typeof db.select).toBe('function');
    });

    it('should return in-memory fallback when window is undefined (SSR)', async () => {
      vi.stubGlobal('window', undefined);

      const db = await getDatabase();

      expect(db).toBeDefined();
      expect(typeof db.execute).toBe('function');
      expect(typeof db.select).toBe('function');
    });
  });

  describe('resetDatabase', () => {
    it('should clear the singleton instance', async () => {
      vi.stubGlobal('window', {});

      const db1 = await getDatabase();
      resetDatabase();
      const db2 = await getDatabase();

      // After reset, should get a new instance
      expect(db1).not.toBe(db2);
    });
  });

  describe('setDatabase', () => {
    it('should allow setting a custom database instance', async () => {
      const customDb: IDatabase = {
        execute: vi.fn().mockResolvedValue(undefined),
        select: vi.fn().mockResolvedValue([{ custom: true }]),
      };

      setDatabase(customDb);
      const db = await getDatabase();

      expect(db).toBe(customDb);
      const result = await db.select<{ custom: boolean }>('SELECT 1');
      expect(result).toEqual([{ custom: true }]);
    });
  });

  describe('In-memory fallback', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {});
    });

    it('should handle basic INSERT operations', async () => {
      const db = await getDatabase();

      await db.execute('INSERT INTO conversations (id, type, started_at) VALUES (?, ?, ?)', [
        'conv-1',
        'daily',
        '2026-01-28T10:00:00Z',
      ]);

      // No error means success for in-memory
    });

    it('should handle basic SELECT operations', async () => {
      const db = await getDatabase();

      const result = await db.select<{ id: string }>('SELECT id FROM conversations');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle basic DELETE operations', async () => {
      const db = await getDatabase();

      // Insert first
      await db.execute('INSERT INTO conversations (id) VALUES (?)', ['conv-1']);

      // Then delete
      await db.execute('DELETE FROM conversations WHERE id = ?', ['conv-1']);

      // Verify deletion
      const result = await db.select<{ id: string }>('SELECT id FROM conversations WHERE id = ?', ['conv-1']);
      expect(result).toHaveLength(0);
    });
  });
});
