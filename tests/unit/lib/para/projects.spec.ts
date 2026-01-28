/**
 * Tests for PARA Projects Directory Initialization
 * Story 4.2: Create Projects Directory
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the Tauri FS plugin before importing the module under test
vi.mock('@tauri-apps/plugin-fs', () => ({
  mkdir: vi.fn(),
  exists: vi.fn(),
  writeTextFile: vi.fn(),
  readTextFile: vi.fn(),
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
import { mkdir, exists, writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import { initProjectsDirectory, type ProjectsInitResult, type ProjectsInitError } from '@/lib/para/projects';
import { ProjectIndexSchema } from '@/lib/para/schemas/project';
import YAML from 'yaml';

describe('PARA Projects Directory Initialization (Story 4.2)', () => {
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

  describe('initProjectsDirectory', () => {
    it('should return a Result type', async () => {
      const result = await initProjectsDirectory();

      // Result should have isOk/isErr methods (neverthrow pattern)
      expect(typeof result.isOk).toBe('function');
      expect(typeof result.isErr).toBe('function');
    });

    it('should create ~/Orion/Projects/ directory when it does not exist', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initProjectsDirectory();

      expect(result.isOk()).toBe(true);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Projects',
        expect.objectContaining({
          baseDir: expect.any(Number), // BaseDirectory.Home
          recursive: true,
        })
      );
    });

    it('should create ~/Orion/Projects/_index.yaml file', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initProjectsDirectory();

      expect(result.isOk()).toBe(true);
      expect(writeTextFile).toHaveBeenCalledWith(
        'Orion/Projects/_index.yaml',
        expect.any(String),
        expect.objectContaining({
          baseDir: expect.any(Number), // BaseDirectory.Home
        })
      );
    });

    it('should create _index.yaml with content that validates against ProjectIndexSchema', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path: string | URL, content: string) => {
        writtenContent = content;
      });

      const result = await initProjectsDirectory();

      expect(result.isOk()).toBe(true);

      // Parse the written YAML and validate against schema
      const parsedYaml = YAML.parse(writtenContent);
      const validationResult = ProjectIndexSchema.safeParse(parsedYaml);

      expect(validationResult.success).toBe(true);
    });

    it('should create _index.yaml with correct initial structure', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path: string | URL, content: string) => {
        writtenContent = content;
      });

      const result = await initProjectsDirectory();

      expect(result.isOk()).toBe(true);

      const parsedYaml = YAML.parse(writtenContent);

      // Check structure matches expected
      expect(parsedYaml.version).toBe(1);
      expect(parsedYaml.updated_at).toBeDefined();
      expect(typeof parsedYaml.updated_at).toBe('string');
      expect(parsedYaml.projects).toEqual([]);
    });

    it('should be idempotent - not error when directory and index already exist', async () => {
      // Directory and index already exist
      vi.mocked(exists).mockResolvedValue(true);

      const result1 = await initProjectsDirectory();
      const result2 = await initProjectsDirectory();

      expect(result1.isOk()).toBe(true);
      expect(result2.isOk()).toBe(true);
    });

    it('should skip directory creation if it already exists', async () => {
      // Directory exists, but file does not
      vi.mocked(exists)
        .mockResolvedValueOnce(true)   // Orion/Projects exists
        .mockResolvedValueOnce(false); // _index.yaml does not exist

      await initProjectsDirectory();

      // mkdir should not be called for the directory
      expect(mkdir).not.toHaveBeenCalled();
      // But writeTextFile should be called for the index
      expect(writeTextFile).toHaveBeenCalled();
    });

    it('should skip index creation if it already exists', async () => {
      // Both directory and index exist
      vi.mocked(exists).mockResolvedValue(true);

      await initProjectsDirectory();

      // Neither mkdir nor writeTextFile should be called
      expect(mkdir).not.toHaveBeenCalled();
      expect(writeTextFile).not.toHaveBeenCalled();
    });

    it('should return success result with created paths info', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initProjectsDirectory();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const value: ProjectsInitResult = result.value;
        expect(value.created).toBeDefined();
        expect(Array.isArray(value.created)).toBe(true);
        expect(value.created).toContain('Orion/Projects');
        expect(value.created).toContain('Orion/Projects/_index.yaml');
      }
    });

    it('should return error Result when mkdir fails', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(mkdir).mockRejectedValue(new Error('Permission denied'));

      const result = await initProjectsDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error: ProjectsInitError = result.error;
        expect(error.code).toBe('FS_ERROR');
        expect(error.message).toContain('Permission denied');
      }
    });

    it('should return error Result when writeTextFile fails', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(writeTextFile).mockRejectedValue(new Error('Disk full'));

      const result = await initProjectsDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
        expect(result.error.message).toContain('Disk full');
      }
    });

    it('should return error Result when exists check fails', async () => {
      vi.mocked(exists).mockRejectedValue(new Error('Network error'));

      const result = await initProjectsDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
      }
    });

    it('should log creation events', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.mocked(exists).mockResolvedValue(false);

      await initProjectsDirectory();

      // Should log something about projects directory creation
      expect(consoleSpy).toHaveBeenCalled();
      const logCalls = consoleSpy.mock.calls.flat().join(' ');
      expect(logCalls).toMatch(/project|creat/i);

      consoleSpy.mockRestore();
    });

    it('should create directory before index file', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      const operationOrder: string[] = [];

      vi.mocked(mkdir).mockImplementation(async (path: string | URL) => {
        operationOrder.push(`mkdir:${String(path)}`);
      });
      vi.mocked(writeTextFile).mockImplementation(async (path: string | URL) => {
        operationOrder.push(`write:${String(path)}`);
      });

      await initProjectsDirectory();

      // Directory should be created before index file
      const mkdirIndex = operationOrder.findIndex(op => op.startsWith('mkdir:'));
      const writeIndex = operationOrder.findIndex(op => op.startsWith('write:'));

      expect(mkdirIndex).toBeLessThan(writeIndex);
    });

    it('should handle partial existence (directory exists, index does not)', async () => {
      vi.mocked(exists)
        .mockResolvedValueOnce(true)   // Orion/Projects exists
        .mockResolvedValueOnce(false); // _index.yaml does not exist

      const result = await initProjectsDirectory();

      expect(result.isOk()).toBe(true);
      // Should only create index, not directory
      expect(mkdir).not.toHaveBeenCalled();
      expect(writeTextFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling', () => {
    it('should wrap unknown errors in ProjectsInitError', async () => {
      vi.mocked(exists).mockRejectedValue('unknown string error');

      const result = await initProjectsDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
        expect(result.error.message).toBeDefined();
      }
    });

    it('should preserve original error in ProjectsInitError', async () => {
      const originalError = new Error('Original error message');
      vi.mocked(exists).mockRejectedValue(originalError);

      const result = await initProjectsDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.cause).toBe(originalError);
      }
    });
  });

  describe('Index YAML validation', () => {
    it('should create index with ISO 8601 updated_at timestamp', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path: string | URL, content: string) => {
        writtenContent = content;
      });

      await initProjectsDirectory();

      const parsedYaml = YAML.parse(writtenContent);
      // ISO 8601 format with timezone offset
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)$/;
      expect(parsedYaml.updated_at).toMatch(iso8601Regex);
    });

    it('should create index with version 1', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path: string | URL, content: string) => {
        writtenContent = content;
      });

      await initProjectsDirectory();

      const parsedYaml = YAML.parse(writtenContent);
      expect(parsedYaml.version).toBe(1);
    });

    it('should create index with empty projects array', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path: string | URL, content: string) => {
        writtenContent = content;
      });

      await initProjectsDirectory();

      const parsedYaml = YAML.parse(writtenContent);
      expect(parsedYaml.projects).toEqual([]);
    });
  });
});
