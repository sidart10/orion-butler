/**
 * Tests for Areas Directory Initialization
 * Story 4.3: Create Areas Directory
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
import { AreaIndexSchema } from '@/lib/para/schemas/area';
import { parse } from 'yaml';

// Will be imported after implementation
// import { initAreasDirectory, type AreasInitResult, type AreasInitError } from '@/lib/para/areas';

describe('Areas Directory Initialization (Story 4.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: directories don't exist yet
    vi.mocked(exists).mockResolvedValue(false);
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeTextFile).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initAreasDirectory', () => {
    it('should return a Result type', async () => {
      // Import the module under test
      const { initAreasDirectory } = await import('@/lib/para/areas');

      const result = await initAreasDirectory();

      // Result should have isOk/isErr methods (neverthrow pattern)
      expect(typeof result.isOk).toBe('function');
      expect(typeof result.isErr).toBe('function');
    });

    it('should create ~/Orion/Areas/ directory when it does not exist', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const { initAreasDirectory } = await import('@/lib/para/areas');
      const result = await initAreasDirectory();

      expect(result.isOk()).toBe(true);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Areas',
        expect.objectContaining({
          baseDir: expect.any(Number), // BaseDirectory.Home
          recursive: true,
        })
      );
    });

    it('should create _index.yaml file in ~/Orion/Areas/', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const { initAreasDirectory } = await import('@/lib/para/areas');
      const result = await initAreasDirectory();

      expect(result.isOk()).toBe(true);
      expect(writeTextFile).toHaveBeenCalledWith(
        'Orion/Areas/_index.yaml',
        expect.any(String),
        expect.objectContaining({
          baseDir: expect.any(Number), // BaseDirectory.Home
        })
      );
    });

    it('should create _index.yaml content that validates against AreaIndexSchema', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path: string | URL, content: string) => {
        writtenContent = content;
      });

      const { initAreasDirectory } = await import('@/lib/para/areas');
      await initAreasDirectory();

      // Parse the YAML and validate against schema
      const parsedContent = parse(writtenContent) as unknown;
      const validationResult = AreaIndexSchema.safeParse(parsedContent);

      expect(validationResult.success).toBe(true);
    });

    it('should create _index.yaml with version 1', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path: string | URL, content: string) => {
        writtenContent = content;
      });

      const { initAreasDirectory } = await import('@/lib/para/areas');
      await initAreasDirectory();

      const parsedContent = parse(writtenContent) as Record<string, unknown>;
      expect(parsedContent.version).toBe(1);
    });

    it('should create _index.yaml with empty areas array', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path: string | URL, content: string) => {
        writtenContent = content;
      });

      const { initAreasDirectory } = await import('@/lib/para/areas');
      await initAreasDirectory();

      const parsedContent = parse(writtenContent) as Record<string, unknown>;
      expect(parsedContent.areas).toEqual([]);
    });

    it('should create _index.yaml with valid ISO 8601 updated_at timestamp', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path: string | URL, content: string) => {
        writtenContent = content;
      });

      const { initAreasDirectory } = await import('@/lib/para/areas');
      await initAreasDirectory();

      const parsedContent = parse(writtenContent) as Record<string, unknown>;
      expect(typeof parsedContent.updated_at).toBe('string');

      // Should be valid ISO 8601 datetime with timezone
      const date = new Date(parsedContent.updated_at as string);
      expect(date.toISOString()).toBeTruthy();
    });

    it('should be idempotent - not error when directory already exists', async () => {
      // Directory exists but index file doesn't
      vi.mocked(exists)
        .mockResolvedValueOnce(true)   // Directory exists
        .mockResolvedValueOnce(false)  // Index file doesn't exist
        .mockResolvedValueOnce(true)   // Second call: Directory exists
        .mockResolvedValueOnce(true);  // Second call: Index file exists

      const { initAreasDirectory } = await import('@/lib/para/areas');

      const result1 = await initAreasDirectory();
      const result2 = await initAreasDirectory();

      expect(result1.isOk()).toBe(true);
      expect(result2.isOk()).toBe(true);
    });

    it('should skip directory creation if it already exists', async () => {
      vi.mocked(exists)
        .mockResolvedValueOnce(true)   // Directory exists
        .mockResolvedValueOnce(false); // Index file doesn't exist

      const { initAreasDirectory } = await import('@/lib/para/areas');
      await initAreasDirectory();

      // mkdir should not be called if directory exists
      expect(mkdir).not.toHaveBeenCalled();
    });

    it('should skip index file creation if it already exists', async () => {
      vi.mocked(exists)
        .mockResolvedValueOnce(true)  // Directory exists
        .mockResolvedValueOnce(true); // Index file exists

      const { initAreasDirectory } = await import('@/lib/para/areas');
      await initAreasDirectory();

      // writeTextFile should not be called if index exists
      expect(writeTextFile).not.toHaveBeenCalled();
    });

    it('should return success result with created items info', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const { initAreasDirectory } = await import('@/lib/para/areas');
      const result = await initAreasDirectory();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.created).toBeDefined();
        expect(Array.isArray(result.value.created)).toBe(true);
      }
    });

    it('should return error Result when mkdir fails', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(mkdir).mockRejectedValue(new Error('Permission denied'));

      const { initAreasDirectory } = await import('@/lib/para/areas');
      const result = await initAreasDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
        expect(result.error.message).toContain('Permission denied');
      }
    });

    it('should return error Result when writeTextFile fails', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(writeTextFile).mockRejectedValue(new Error('Disk full'));

      const { initAreasDirectory } = await import('@/lib/para/areas');
      const result = await initAreasDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
        expect(result.error.message).toContain('Disk full');
      }
    });

    it('should return error Result when exists check fails', async () => {
      vi.mocked(exists).mockRejectedValue(new Error('Network error'));

      const { initAreasDirectory } = await import('@/lib/para/areas');
      const result = await initAreasDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
      }
    });

    it('should log creation events', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.mocked(exists).mockResolvedValue(false);

      const { initAreasDirectory } = await import('@/lib/para/areas');
      await initAreasDirectory();

      // Should log something about directory/file creation
      expect(consoleSpy).toHaveBeenCalled();
      const logCalls = consoleSpy.mock.calls.flat().join(' ');
      expect(logCalls).toMatch(/areas|creat/i);

      consoleSpy.mockRestore();
    });

    it('should create directory before index file', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      const operations: string[] = [];

      vi.mocked(mkdir).mockImplementation(async (path: string | URL) => {
        operations.push(`mkdir:${String(path)}`);
      });
      vi.mocked(writeTextFile).mockImplementation(async (path: string | URL) => {
        operations.push(`write:${String(path)}`);
      });

      const { initAreasDirectory } = await import('@/lib/para/areas');
      await initAreasDirectory();

      // Directory should be created before index file
      expect(operations[0]).toBe('mkdir:Orion/Areas');
      expect(operations[1]).toBe('write:Orion/Areas/_index.yaml');
    });
  });

  describe('Error handling', () => {
    it('should wrap unknown errors in AreasInitError', async () => {
      vi.mocked(exists).mockRejectedValue('unknown string error');

      const { initAreasDirectory } = await import('@/lib/para/areas');
      const result = await initAreasDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
        expect(result.error.message).toBeDefined();
      }
    });

    it('should preserve original error in AreasInitError', async () => {
      const originalError = new Error('Original error message');
      vi.mocked(exists).mockRejectedValue(originalError);

      const { initAreasDirectory } = await import('@/lib/para/areas');
      const result = await initAreasDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.cause).toBe(originalError);
      }
    });
  });

  describe('Index file schema compliance', () => {
    it('should create index that passes Zod schema validation', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path: string | URL, content: string) => {
        writtenContent = content;
      });

      const { initAreasDirectory } = await import('@/lib/para/areas');
      await initAreasDirectory();

      const parsedContent = parse(writtenContent) as unknown;
      const result = AreaIndexSchema.safeParse(parsedContent);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.version).toBe(1);
        expect(result.data.areas).toEqual([]);
        expect(typeof result.data.updated_at).toBe('string');
      }
    });
  });
});
