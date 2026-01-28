/**
 * Tests for OrionDatabase Client
 * Story 3.1: SQLite Database Initialization
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Tauri IPC before importing
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('OrionDatabase', () => {
  beforeEach(() => {
    vi.resetModules();
    // Mock window.__TAURI__ for Tauri environment detection
    vi.stubGlobal('window', { __TAURI__: {} });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('State Management', () => {
    it('should start in disconnected state', async () => {
      const { OrionDatabase } = await import('@/lib/db/client');
      const db = new OrionDatabase();

      expect(db.getState()).toBe('disconnected');
    });

    it('should return null config before initialization', async () => {
      const { OrionDatabase } = await import('@/lib/db/client');
      const db = new OrionDatabase();

      expect(db.getConfig()).toBeNull();
    });
  });

  describe('Initialization', () => {
    it('should throw error in non-Tauri environment', async () => {
      // Remove __TAURI__ from window
      vi.stubGlobal('window', {});

      const { OrionDatabase } = await import('@/lib/db/client');
      const db = new OrionDatabase();

      await expect(db.init()).rejects.toThrow('SQLite not available outside Tauri environment');
      expect(db.getState()).toBe('error');
    });

    it('should not retry init if already in error state', async () => {
      vi.stubGlobal('window', {});

      const { OrionDatabase } = await import('@/lib/db/client');
      const db = new OrionDatabase();

      // First init fails
      await expect(db.init()).rejects.toThrow('SQLite not available');

      // Second init should throw immediately without retrying
      await expect(db.init()).rejects.toThrow('Database initialization failed previously');
    });

    it('should not call init twice if already connected', async () => {
      // Mock full Tauri environment for this test - use default export
      vi.doMock('@tauri-apps/plugin-sql', () => ({
        default: {
          load: vi.fn().mockResolvedValue({
            execute: vi.fn().mockResolvedValue(undefined),
            select: vi.fn()
              .mockResolvedValueOnce([{ journal_mode: 'wal' }])
              .mockResolvedValueOnce([{ foreign_keys: 1 }]),
            close: vi.fn(),
          }),
        },
      }));

      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockResolvedValue('/test/dir');

      const { OrionDatabase } = await import('@/lib/db/client');
      const db = new OrionDatabase();

      // Call init twice
      await db.init();
      const firstState = db.getState();
      await db.init();
      const secondState = db.getState();

      // Both should result in connected (no reinit)
      expect(firstState).toBe('connected');
      expect(secondState).toBe('connected');
    });
  });

  describe('Health Check', () => {
    it('should call db_health_check IPC command', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const { OrionDatabase } = await import('@/lib/db/client');

      const mockHealthStatus = {
        initialized: true,
        journalMode: 'wal',
        foreignKeysEnabled: true,
        dbPath: '/test/path/orion.db',
        dbSizeBytes: 4096,
      };
      vi.mocked(invoke).mockResolvedValue(mockHealthStatus);

      const db = new OrionDatabase();
      const result = await db.healthCheck();

      expect(invoke).toHaveBeenCalledWith('db_health_check');
      expect(result).toEqual(mockHealthStatus);
    });
  });

  describe('Close', () => {
    it('should reset state on close', async () => {
      const { OrionDatabase } = await import('@/lib/db/client');
      const db = new OrionDatabase();

      // Close should reset state to disconnected
      await db.close();

      expect(db.getState()).toBe('disconnected');
      expect(db.getConfig()).toBeNull();
    });
  });

  describe('Operations', () => {
    it('should throw error on execute in non-Tauri environment', async () => {
      vi.stubGlobal('window', {});

      const { OrionDatabase } = await import('@/lib/db/client');
      const db = new OrionDatabase();

      await expect(db.execute('SELECT 1')).rejects.toThrow('SQLite not available outside Tauri environment');
    });

    it('should throw error on select in non-Tauri environment', async () => {
      vi.stubGlobal('window', {});

      const { OrionDatabase } = await import('@/lib/db/client');
      const db = new OrionDatabase();

      await expect(db.select('SELECT 1')).rejects.toThrow('SQLite not available outside Tauri environment');
    });
  });

  describe('Error Recovery', () => {
    it('should allow retry after close() resets error state', async () => {
      vi.stubGlobal('window', {});

      const { OrionDatabase } = await import('@/lib/db/client');
      const db = new OrionDatabase();

      // First init fails
      await expect(db.init()).rejects.toThrow('SQLite not available');
      expect(db.getState()).toBe('error');

      // Close resets state
      await db.close();
      expect(db.getState()).toBe('disconnected');

      // Now we can try again (will still fail in non-Tauri but won't throw "failed previously")
      await expect(db.init()).rejects.toThrow('SQLite not available outside Tauri environment');
    });
  });
});
