/**
 * Tests for Resources Directory Initialization
 * Story 4.4: Create Resources Directory
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parse } from 'yaml';

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
import { mkdir, writeTextFile, exists } from '@tauri-apps/plugin-fs';
import {
  initResourcesDirectory,
  RESOURCES_INDEX_FILENAME,
  RESOURCES_CONTACTS_DIR,
  RESOURCES_TEMPLATES_DIR,
  RESOURCES_PROCEDURES_DIR,
  RESOURCES_PREFERENCES_DIR,
  RESOURCES_NOTES_DIR,
  type ResourcesInitResult,
  type ResourcesInitError,
} from '@/lib/para/resources';
import { ResourcesIndexSchema } from '@/lib/para/schemas/resources';

describe('Resources Directory Initialization (Story 4.4)', () => {
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
    it('should export RESOURCES_INDEX_FILENAME as "_index.yaml"', () => {
      expect(RESOURCES_INDEX_FILENAME).toBe('_index.yaml');
    });

    it('should export RESOURCES_CONTACTS_DIR as "contacts"', () => {
      expect(RESOURCES_CONTACTS_DIR).toBe('contacts');
    });

    it('should export RESOURCES_TEMPLATES_DIR as "templates"', () => {
      expect(RESOURCES_TEMPLATES_DIR).toBe('templates');
    });

    it('should export RESOURCES_PROCEDURES_DIR as "procedures"', () => {
      expect(RESOURCES_PROCEDURES_DIR).toBe('procedures');
    });

    it('should export RESOURCES_PREFERENCES_DIR as "preferences"', () => {
      expect(RESOURCES_PREFERENCES_DIR).toBe('preferences');
    });

    it('should export RESOURCES_NOTES_DIR as "notes"', () => {
      expect(RESOURCES_NOTES_DIR).toBe('notes');
    });
  });

  describe('initResourcesDirectory', () => {
    it('should return a Result type', async () => {
      const result = await initResourcesDirectory();

      // Result should have isOk/isErr methods (neverthrow pattern)
      expect(typeof result.isOk).toBe('function');
      expect(typeof result.isErr).toBe('function');
    });

    it('should create ~/Orion/Resources/ directory when it does not exist', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initResourcesDirectory();

      expect(result.isOk()).toBe(true);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Resources',
        expect.objectContaining({
          baseDir: expect.any(Number), // BaseDirectory.Home
          recursive: true,
        })
      );
    });

    it('should create ~/Orion/Resources/_index.yaml file', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initResourcesDirectory();

      expect(result.isOk()).toBe(true);
      expect(writeTextFile).toHaveBeenCalledWith(
        'Orion/Resources/_index.yaml',
        expect.any(String),
        expect.objectContaining({ baseDir: expect.any(Number) })
      );
    });

    it('should create ~/Orion/Resources/contacts/ subdirectory', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initResourcesDirectory();

      expect(result.isOk()).toBe(true);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Resources/contacts',
        expect.objectContaining({
          baseDir: expect.any(Number),
          recursive: true,
        })
      );
    });

    it('should create ~/Orion/Resources/templates/ subdirectory', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initResourcesDirectory();

      expect(result.isOk()).toBe(true);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Resources/templates',
        expect.objectContaining({
          baseDir: expect.any(Number),
          recursive: true,
        })
      );
    });

    it('should create ~/Orion/Resources/procedures/ subdirectory', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initResourcesDirectory();

      expect(result.isOk()).toBe(true);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Resources/procedures',
        expect.objectContaining({
          baseDir: expect.any(Number),
          recursive: true,
        })
      );
    });

    it('should create ~/Orion/Resources/preferences/ subdirectory', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initResourcesDirectory();

      expect(result.isOk()).toBe(true);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Resources/preferences',
        expect.objectContaining({
          baseDir: expect.any(Number),
          recursive: true,
        })
      );
    });

    it('should create ~/Orion/Resources/notes/ subdirectory', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initResourcesDirectory();

      expect(result.isOk()).toBe(true);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Resources/notes',
        expect.objectContaining({
          baseDir: expect.any(Number),
          recursive: true,
        })
      );
    });

    it('should write _index.yaml content that validates against ResourcesIndexSchema', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path, content) => {
        writtenContent = content;
      });

      await initResourcesDirectory();

      // Parse the written YAML
      const parsed = parse(writtenContent);
      const validationResult = ResourcesIndexSchema.safeParse(parsed);
      expect(validationResult.success).toBe(true);
    });

    it('should write _index.yaml with version 1', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path, content) => {
        writtenContent = content;
      });

      await initResourcesDirectory();

      const parsed = parse(writtenContent);
      expect(parsed.version).toBe(1);
    });

    it('should write _index.yaml with all subdirectory names', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path, content) => {
        writtenContent = content;
      });

      await initResourcesDirectory();

      const parsed = parse(writtenContent);
      expect(parsed.subdirectories).toContain('contacts');
      expect(parsed.subdirectories).toContain('templates');
      expect(parsed.subdirectories).toContain('procedures');
      expect(parsed.subdirectories).toContain('preferences');
      expect(parsed.subdirectories).toContain('notes');
    });

    it('should write _index.yaml with valid updated_at timestamp', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path, content) => {
        writtenContent = content;
      });

      await initResourcesDirectory();

      const parsed = parse(writtenContent);
      expect(parsed.updated_at).toBeDefined();
      // Should be a valid ISO date
      const date = new Date(parsed.updated_at);
      expect(date.toString()).not.toBe('Invalid Date');
    });

    it('should be idempotent - not error when directories already exist', async () => {
      // Directories already exist
      vi.mocked(exists).mockResolvedValue(true);

      const result1 = await initResourcesDirectory();
      const result2 = await initResourcesDirectory();

      expect(result1.isOk()).toBe(true);
      expect(result2.isOk()).toBe(true);
    });

    it('should skip directory creation if directories already exist', async () => {
      vi.mocked(exists).mockResolvedValue(true);

      await initResourcesDirectory();

      // mkdir should not be called if directories exist
      expect(mkdir).not.toHaveBeenCalled();
      // writeTextFile should not be called if index file exists
      expect(writeTextFile).not.toHaveBeenCalled();
    });

    it('should return ResourcesInitResult with created directories info', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initResourcesDirectory();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const value: ResourcesInitResult = result.value;
        expect(value.created).toBeDefined();
        expect(Array.isArray(value.created)).toBe(true);
        expect(value.skipped).toBeDefined();
        expect(Array.isArray(value.skipped)).toBe(true);
      }
    });

    it('should return created list with Resources directory and all subdirectories', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initResourcesDirectory();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.created).toContain('Orion/Resources');
        expect(result.value.created).toContain('Orion/Resources/contacts');
        expect(result.value.created).toContain('Orion/Resources/templates');
        expect(result.value.created).toContain('Orion/Resources/procedures');
        expect(result.value.created).toContain('Orion/Resources/preferences');
        expect(result.value.created).toContain('Orion/Resources/notes');
      }
    });

    it('should return index file path in result', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initResourcesDirectory();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.indexPath).toBe('Orion/Resources/_index.yaml');
      }
    });

    it('should return error Result when mkdir fails', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(mkdir).mockRejectedValue(new Error('Permission denied'));

      const result = await initResourcesDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error: ResourcesInitError = result.error;
        expect(error.code).toBe('FS_ERROR');
        expect(error.message).toContain('Permission denied');
      }
    });

    it('should return error Result when writeTextFile fails', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(writeTextFile).mockRejectedValue(new Error('Disk full'));

      const result = await initResourcesDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('WRITE_ERROR');
        expect(result.error.message).toContain('Disk full');
      }
    });

    it('should return error Result when exists check fails', async () => {
      vi.mocked(exists).mockRejectedValue(new Error('Network error'));

      const result = await initResourcesDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
      }
    });

    it('should log creation events', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.mocked(exists).mockResolvedValue(false);

      await initResourcesDirectory();

      // Should log something about directory creation
      expect(consoleSpy).toHaveBeenCalled();
      const logCalls = consoleSpy.mock.calls.flat().join(' ');
      expect(logCalls).toMatch(/resource|orion|creat/i);

      consoleSpy.mockRestore();
    });

    it('should create directories before index file', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      const operations: string[] = [];
      vi.mocked(mkdir).mockImplementation(async (path: string | URL) => {
        operations.push(`mkdir:${String(path)}`);
      });
      vi.mocked(writeTextFile).mockImplementation(async (path: string | URL) => {
        operations.push(`write:${String(path)}`);
      });

      await initResourcesDirectory();

      // All mkdir operations should happen before any write operation
      const lastMkdirIdx = operations
        .map((op, i) => (op.startsWith('mkdir:') ? i : -1))
        .filter((i) => i >= 0)
        .pop() ?? -1;
      const firstWriteIdx = operations.findIndex((op) => op.startsWith('write:'));

      expect(lastMkdirIdx).toBeLessThan(firstWriteIdx);
    });

    it('should handle partial existence (Resources exists, subdirs do not)', async () => {
      // Resources exists, but subdirs and index don't
      vi.mocked(exists)
        .mockResolvedValueOnce(true)   // Orion/Resources exists
        .mockResolvedValueOnce(false)  // contacts doesn't exist
        .mockResolvedValueOnce(false)  // templates doesn't exist
        .mockResolvedValueOnce(false)  // procedures doesn't exist
        .mockResolvedValueOnce(false)  // preferences doesn't exist
        .mockResolvedValueOnce(false)  // notes doesn't exist
        .mockResolvedValueOnce(false); // _index.yaml doesn't exist

      const result = await initResourcesDirectory();

      expect(result.isOk()).toBe(true);
      // Should create 5 subdirs + index, but not main dir
      expect(mkdir).toHaveBeenCalledTimes(5);
      expect(writeTextFile).toHaveBeenCalledTimes(1);
    });

    it('should handle partial existence (directories exist, index does not)', async () => {
      // All directories exist, only index doesn't
      vi.mocked(exists)
        .mockResolvedValueOnce(true)   // Orion/Resources exists
        .mockResolvedValueOnce(true)   // contacts exists
        .mockResolvedValueOnce(true)   // templates exists
        .mockResolvedValueOnce(true)   // procedures exists
        .mockResolvedValueOnce(true)   // preferences exists
        .mockResolvedValueOnce(true)   // notes exists
        .mockResolvedValueOnce(false); // _index.yaml doesn't exist

      const result = await initResourcesDirectory();

      expect(result.isOk()).toBe(true);
      // Should not create any directories
      expect(mkdir).not.toHaveBeenCalled();
      // But should create the index file
      expect(writeTextFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling', () => {
    it('should wrap unknown errors in ResourcesInitError', async () => {
      vi.mocked(exists).mockRejectedValue('unknown string error');

      const result = await initResourcesDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
        expect(result.error.message).toBeDefined();
      }
    });

    it('should preserve original error in ResourcesInitError', async () => {
      const originalError = new Error('Original error message');
      vi.mocked(exists).mockRejectedValue(originalError);

      const result = await initResourcesDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.cause).toBe(originalError);
      }
    });
  });
});
