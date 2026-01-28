/**
 * Tests for Consolidated Database Types
 * Database Initialization Fix - Phase 0.1
 *
 * TDD Phase: RED - Write failing tests first
 *
 * These tests verify the consolidated type exports from src/db/types.ts
 */
import { describe, it, expect } from 'vitest';

// Import types that MUST exist after consolidation
import type {
  DbHealthStatus,
  DbConfigResult,
  DbConnectionState,
  IDatabase,
} from '@/db/types';

describe('Database Types (Consolidated)', () => {
  describe('DbHealthStatus', () => {
    it('should have correct shape', () => {
      const status: DbHealthStatus = {
        initialized: true,
        journalMode: 'wal',
        foreignKeysEnabled: true,
        dbPath: '/test/path/orion.db',
        dbSizeBytes: 4096,
      };

      expect(status.initialized).toBe(true);
      expect(status.journalMode).toBe('wal');
      expect(status.foreignKeysEnabled).toBe(true);
      expect(status.dbPath).toBe('/test/path/orion.db');
      expect(status.dbSizeBytes).toBe(4096);
    });
  });

  describe('DbConfigResult', () => {
    it('should have correct shape with tablesCreated array', () => {
      // NEW: tablesCreated field added in consolidation
      const config: DbConfigResult = {
        walEnabled: true,
        foreignKeysEnabled: true,
        journalMode: 'wal',
        tablesCreated: ['conversations', 'messages', 'session_index'],
      };

      expect(config.walEnabled).toBe(true);
      expect(config.foreignKeysEnabled).toBe(true);
      expect(config.journalMode).toBe('wal');
      expect(config.tablesCreated).toContain('conversations');
      expect(config.tablesCreated).toContain('messages');
      expect(config.tablesCreated).toContain('session_index');
    });
  });

  describe('DbConnectionState', () => {
    it('should accept all valid states', () => {
      const states: DbConnectionState[] = [
        'disconnected',
        'connecting',
        'connected',
        'error',
      ];

      expect(states).toHaveLength(4);
      expect(states).toContain('disconnected');
      expect(states).toContain('connecting');
      expect(states).toContain('connected');
      expect(states).toContain('error');
    });
  });

  describe('IDatabase', () => {
    it('should define execute and select methods', () => {
      // Type check - create a mock that satisfies IDatabase
      const mockDb: IDatabase = {
        execute: async (_query: string, _params?: unknown[]): Promise<void> => {},
        select: async <T>(_query: string, _params?: unknown[]): Promise<T[]> => [],
      };

      expect(typeof mockDb.execute).toBe('function');
      expect(typeof mockDb.select).toBe('function');
    });

    it('should allow optional close method', () => {
      // IDatabase should have optional close
      const mockDbWithClose: IDatabase = {
        execute: async () => {},
        select: async <T>(): Promise<T[]> => [],
        close: async () => {},
      };

      expect(typeof mockDbWithClose.close).toBe('function');
    });
  });
});
