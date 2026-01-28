/**
 * Tests for Inbox Directory Initialization
 * Story 4.6: Create Inbox Directory
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { stringify, parse } from 'yaml';

// Mock the Tauri FS plugin before importing the module under test
vi.mock('@tauri-apps/plugin-fs', () => ({
  mkdir: vi.fn(),
  writeTextFile: vi.fn(),
  readTextFile: vi.fn(),
  exists: vi.fn(),
}));

// Mock the Tauri path API
vi.mock('@tauri-apps/api/path', () => ({
  homeDir: vi.fn().mockResolvedValue('/Users/test'),
  join: vi.fn((...parts: string[]) => parts.join('/')),
  BaseDirectory: {
    Home: 1,
  },
}));

// Import after mocking
import { mkdir, writeTextFile, readTextFile, exists } from '@tauri-apps/plugin-fs';
import {
  initInboxDirectory,
  INBOX_QUEUE_FILENAME,
  INBOX_ITEMS_DIR,
  type InboxInitResult,
  type InboxInitError,
} from '@/lib/para/inbox';
import { InboxQueueSchema } from '@/lib/para/schemas/inbox';

describe('Inbox Directory Initialization (Story 4.6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: directories/files don't exist yet
    vi.mocked(exists).mockResolvedValue(false);
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeTextFile).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Constants', () => {
    it('should export INBOX_QUEUE_FILENAME as "_queue.yaml"', () => {
      expect(INBOX_QUEUE_FILENAME).toBe('_queue.yaml');
    });

    it('should export INBOX_ITEMS_DIR as "items"', () => {
      expect(INBOX_ITEMS_DIR).toBe('items');
    });
  });

  describe('initInboxDirectory', () => {
    it('should return a Result type', async () => {
      const result = await initInboxDirectory();

      // Result should have isOk/isErr methods (neverthrow pattern)
      expect(typeof result.isOk).toBe('function');
      expect(typeof result.isErr).toBe('function');
    });

    it('should create ~/Orion/Inbox/ directory when it does not exist', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initInboxDirectory();

      expect(result.isOk()).toBe(true);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Inbox',
        expect.objectContaining({
          baseDir: expect.any(Number), // BaseDirectory.Home
          recursive: true,
        })
      );
    });

    it('should create ~/Orion/Inbox/items/ subdirectory', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initInboxDirectory();

      expect(result.isOk()).toBe(true);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Inbox/items',
        expect.objectContaining({
          baseDir: expect.any(Number),
          recursive: true,
        })
      );
    });

    it('should create _queue.yaml (not _index.yaml)', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initInboxDirectory();

      expect(result.isOk()).toBe(true);
      expect(writeTextFile).toHaveBeenCalledWith(
        'Orion/Inbox/_queue.yaml',
        expect.any(String),
        expect.objectContaining({ baseDir: expect.any(Number) })
      );
    });

    it('should write _queue.yaml content that validates against InboxQueueSchema', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path, content) => {
        writtenContent = content;
      });

      await initInboxDirectory();

      // Parse the written YAML
      const parsed = parse(writtenContent);
      const validationResult = InboxQueueSchema.safeParse(parsed);
      expect(validationResult.success).toBe(true);
    });

    it('should write _queue.yaml with version 1', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path, content) => {
        writtenContent = content;
      });

      await initInboxDirectory();

      const parsed = parse(writtenContent);
      expect(parsed.version).toBe(1);
    });

    it('should write _queue.yaml with empty items array', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path, content) => {
        writtenContent = content;
      });

      await initInboxDirectory();

      const parsed = parse(writtenContent);
      expect(parsed.items).toEqual([]);
    });

    it('should write _queue.yaml with stats totaling to zero', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path, content) => {
        writtenContent = content;
      });

      await initInboxDirectory();

      const parsed = parse(writtenContent);
      expect(parsed.stats.total).toBe(0);
      expect(parsed.stats.unprocessed).toBe(0);
    });

    it('should write _queue.yaml with valid updated_at timestamp', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path, content) => {
        writtenContent = content;
      });

      await initInboxDirectory();

      const parsed = parse(writtenContent);
      expect(parsed.updated_at).toBeDefined();
      // Should be a valid ISO date
      const date = new Date(parsed.updated_at);
      expect(date.toString()).not.toBe('Invalid Date');
    });

    it('should be idempotent - not error when directories already exist', async () => {
      // Directories already exist
      vi.mocked(exists).mockResolvedValue(true);

      const result1 = await initInboxDirectory();
      const result2 = await initInboxDirectory();

      expect(result1.isOk()).toBe(true);
      expect(result2.isOk()).toBe(true);
    });

    it('should skip directory creation if directories already exist', async () => {
      vi.mocked(exists).mockResolvedValue(true);

      await initInboxDirectory();

      // mkdir should not be called if directories exist
      expect(mkdir).not.toHaveBeenCalled();
      // writeTextFile should not be called if queue file exists
      expect(writeTextFile).not.toHaveBeenCalled();
    });

    it('should return InboxInitResult with created directories info', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initInboxDirectory();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const value: InboxInitResult = result.value;
        expect(value.created).toBeDefined();
        expect(Array.isArray(value.created)).toBe(true);
        expect(value.skipped).toBeDefined();
        expect(Array.isArray(value.skipped)).toBe(true);
      }
    });

    it('should return created list with Inbox directory and items subdirectory', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initInboxDirectory();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.created).toContain('Orion/Inbox');
        expect(result.value.created).toContain('Orion/Inbox/items');
      }
    });

    it('should return queue file path in result', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initInboxDirectory();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.queuePath).toBe('Orion/Inbox/_queue.yaml');
      }
    });

    it('should return error Result when mkdir fails', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(mkdir).mockRejectedValue(new Error('Permission denied'));

      const result = await initInboxDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error: InboxInitError = result.error;
        expect(error.code).toBe('FS_ERROR');
        expect(error.message).toContain('Permission denied');
      }
    });

    it('should return error Result when writeTextFile fails', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(writeTextFile).mockRejectedValue(new Error('Disk full'));

      const result = await initInboxDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('WRITE_ERROR');
        expect(result.error.message).toContain('Disk full');
      }
    });

    it('should return error Result when exists check fails', async () => {
      vi.mocked(exists).mockRejectedValue(new Error('Network error'));

      const result = await initInboxDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
      }
    });

    it('should log creation events', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.mocked(exists).mockResolvedValue(false);

      await initInboxDirectory();

      // Should log something about directory creation
      expect(consoleSpy).toHaveBeenCalled();
      const logCalls = consoleSpy.mock.calls.flat().join(' ');
      expect(logCalls).toMatch(/inbox|orion|creat/i);

      consoleSpy.mockRestore();
    });

    it('should create directories and queue file in correct order', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      const operations: string[] = [];
      vi.mocked(mkdir).mockImplementation(async (path: string | URL) => {
        operations.push(`mkdir:${String(path)}`);
      });
      vi.mocked(writeTextFile).mockImplementation(async (path: string | URL) => {
        operations.push(`write:${String(path)}`);
      });

      await initInboxDirectory();

      // Directories should be created before the queue file is written
      const inboxDirIdx = operations.findIndex((op) =>
        op.includes('mkdir:Orion/Inbox')
      );
      const itemsDirIdx = operations.findIndex((op) =>
        op.includes('mkdir:Orion/Inbox/items')
      );
      const queueFileIdx = operations.findIndex((op) =>
        op.includes('write:Orion/Inbox/_queue.yaml')
      );

      expect(inboxDirIdx).toBeLessThan(queueFileIdx);
      expect(itemsDirIdx).toBeLessThan(queueFileIdx);
    });

    it('should handle partial existence (Inbox exists, items does not)', async () => {
      // First two calls (Inbox dir, items dir) - Inbox exists, items doesn't
      // Third call (queue file) - doesn't exist
      vi.mocked(exists)
        .mockResolvedValueOnce(true) // Orion/Inbox exists
        .mockResolvedValueOnce(false) // Orion/Inbox/items does not exist
        .mockResolvedValueOnce(false); // _queue.yaml does not exist

      const result = await initInboxDirectory();

      expect(result.isOk()).toBe(true);
      // Should only create items dir, not inbox dir
      expect(mkdir).toHaveBeenCalledTimes(1);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Inbox/items',
        expect.objectContaining({ recursive: true })
      );
    });

    it('should handle partial existence (directories exist, queue does not)', async () => {
      vi.mocked(exists)
        .mockResolvedValueOnce(true) // Orion/Inbox exists
        .mockResolvedValueOnce(true) // Orion/Inbox/items exists
        .mockResolvedValueOnce(false); // _queue.yaml does not exist

      const result = await initInboxDirectory();

      expect(result.isOk()).toBe(true);
      // Should not create directories
      expect(mkdir).not.toHaveBeenCalled();
      // But should create the queue file
      expect(writeTextFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling', () => {
    it('should wrap unknown errors in InboxInitError', async () => {
      vi.mocked(exists).mockRejectedValue('unknown string error');

      const result = await initInboxDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
        expect(result.error.message).toBeDefined();
      }
    });

    it('should preserve original error in InboxInitError', async () => {
      const originalError = new Error('Original error message');
      vi.mocked(exists).mockRejectedValue(originalError);

      const result = await initInboxDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.cause).toBe(originalError);
      }
    });
  });
});
