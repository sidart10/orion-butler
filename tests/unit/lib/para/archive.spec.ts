/**
 * Tests for Archive Directory Initialization
 * Story 4.5: Create Archive Directory
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Result } from 'neverthrow';

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
import {
  initArchiveDirectory,
  loadArchiveIndex,
  getDefaultArchiveIndex,
  type ArchiveInitResult,
  type ArchiveError,
} from '@/lib/para/archive';

describe('Archive Directory Initialization (Story 4.5)', () => {
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

  describe('initArchiveDirectory', () => {
    it('should return a Result type', async () => {
      const result = await initArchiveDirectory();

      // Result should have isOk/isErr methods (neverthrow pattern)
      expect(typeof result.isOk).toBe('function');
      expect(typeof result.isErr).toBe('function');
    });

    it('should create ~/Orion/Archive directory when it does not exist', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initArchiveDirectory();

      expect(result.isOk()).toBe(true);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Archive',
        expect.objectContaining({
          baseDir: expect.any(Number),
          recursive: true,
        })
      );
    });

    it('should create ~/Orion/Archive/projects subdirectory', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initArchiveDirectory();

      expect(result.isOk()).toBe(true);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Archive/projects',
        expect.objectContaining({
          baseDir: expect.any(Number),
          recursive: true,
        })
      );
    });

    it('should create ~/Orion/Archive/areas subdirectory', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initArchiveDirectory();

      expect(result.isOk()).toBe(true);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Archive/areas',
        expect.objectContaining({
          baseDir: expect.any(Number),
          recursive: true,
        })
      );
    });

    it('should create _index.yaml with correct schema', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initArchiveDirectory();

      expect(result.isOk()).toBe(true);
      expect(writeTextFile).toHaveBeenCalledWith(
        'Orion/Archive/_index.yaml',
        expect.stringContaining('version: 1'),
        expect.objectContaining({
          baseDir: expect.any(Number),
        })
      );
    });

    it('should create _index.yaml with archived_items empty array', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      await initArchiveDirectory();

      expect(writeTextFile).toHaveBeenCalledWith(
        'Orion/Archive/_index.yaml',
        expect.stringContaining('archived_items: []'),
        expect.any(Object)
      );
    });

    it('should create _index.yaml with stats zeroed', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      await initArchiveDirectory();

      const writeCall = vi.mocked(writeTextFile).mock.calls.find(
        (call) => call[0] === 'Orion/Archive/_index.yaml'
      );
      expect(writeCall).toBeDefined();
      const content = writeCall![1] as string;
      expect(content).toMatch(/total: 0/);
      expect(content).toMatch(/projects: 0/);
      expect(content).toMatch(/areas: 0/);
    });

    it('should be idempotent - not error when directories already exist', async () => {
      vi.mocked(exists).mockResolvedValue(true);

      const result1 = await initArchiveDirectory();
      const result2 = await initArchiveDirectory();

      expect(result1.isOk()).toBe(true);
      expect(result2.isOk()).toBe(true);
    });

    it('should skip directory creation if directories already exist', async () => {
      vi.mocked(exists).mockResolvedValue(true);

      await initArchiveDirectory();

      // mkdir should not be called if directories exist
      expect(mkdir).not.toHaveBeenCalled();
    });

    it('should skip _index.yaml creation if it already exists', async () => {
      // Archive dir exists, index exists
      vi.mocked(exists).mockImplementation(async (path: string | URL) => {
        return true; // Everything exists
      });

      await initArchiveDirectory();

      // writeTextFile should not be called if index exists
      expect(writeTextFile).not.toHaveBeenCalled();
    });

    it('should return success result with created directories info', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initArchiveDirectory();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const value: ArchiveInitResult = result.value;
        expect(value.created).toBeDefined();
        expect(Array.isArray(value.created)).toBe(true);
        expect(value.created.length).toBeGreaterThan(0);
      }
    });

    it('should return error Result when mkdir fails', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(mkdir).mockRejectedValue(new Error('Permission denied'));

      const result = await initArchiveDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error: ArchiveError = result.error;
        expect(error.code).toBe('FS_ERROR');
        expect(error.message).toContain('Permission denied');
      }
    });

    it('should return error Result when writeTextFile fails', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(writeTextFile).mockRejectedValue(new Error('Disk full'));

      const result = await initArchiveDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('WRITE_ERROR');
        expect(result.error.message).toContain('Disk full');
      }
    });

    it('should return error Result when exists check fails', async () => {
      vi.mocked(exists).mockRejectedValue(new Error('Network error'));

      const result = await initArchiveDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
      }
    });

    it('should log creation events', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.mocked(exists).mockResolvedValue(false);

      await initArchiveDirectory();

      expect(consoleSpy).toHaveBeenCalled();
      const logCalls = consoleSpy.mock.calls.flat().join(' ');
      expect(logCalls).toMatch(/archive|Archive|PARA/i);

      consoleSpy.mockRestore();
    });

    it('should create directories in correct order', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      const mkdirCalls: string[] = [];
      vi.mocked(mkdir).mockImplementation(async (path: string | URL) => {
        mkdirCalls.push(String(path));
      });

      await initArchiveDirectory();

      // Archive root should be created before subdirectories
      expect(mkdirCalls[0]).toBe('Orion/Archive');
      expect(mkdirCalls).toContain('Orion/Archive/projects');
      expect(mkdirCalls).toContain('Orion/Archive/areas');
    });

    it('should handle partial existence (archive exists, subdirs do not)', async () => {
      vi.mocked(exists).mockImplementation(async (path: string | URL) => {
        if (String(path) === 'Orion/Archive') return true;
        return false;
      });

      const result = await initArchiveDirectory();

      expect(result.isOk()).toBe(true);
      // Should only create subdirs, not archive root
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Archive/projects',
        expect.any(Object)
      );
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Archive/areas',
        expect.any(Object)
      );
    });
  });

  describe('getDefaultArchiveIndex', () => {
    it('should return valid ArchiveIndex with version 1', () => {
      const index = getDefaultArchiveIndex();
      expect(index.version).toBe(1);
    });

    it('should return valid ArchiveIndex with generated_at ISO timestamp', () => {
      const index = getDefaultArchiveIndex();
      expect(index.generated_at).toBeDefined();
      // Should be a valid ISO string
      expect(() => new Date(index.generated_at)).not.toThrow();
    });

    it('should return valid ArchiveIndex with empty archived_items array', () => {
      const index = getDefaultArchiveIndex();
      expect(index.archived_items).toEqual([]);
    });

    it('should return valid ArchiveIndex with zeroed stats', () => {
      const index = getDefaultArchiveIndex();
      expect(index.stats).toEqual({
        total: 0,
        projects: 0,
        areas: 0,
      });
    });
  });

  describe('loadArchiveIndex', () => {
    it('should return Result type', async () => {
      vi.mocked(exists).mockResolvedValue(true);
      vi.mocked(readTextFile).mockResolvedValue(`
version: 1
generated_at: "2026-01-27T00:00:00Z"
archived_items: []
stats:
  total: 0
  projects: 0
  areas: 0
`);

      const result = await loadArchiveIndex();

      expect(typeof result.isOk).toBe('function');
      expect(typeof result.isErr).toBe('function');
    });

    it('should return NOT_FOUND error when index does not exist', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await loadArchiveIndex();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });

    it('should return PARSE_ERROR for invalid YAML', async () => {
      vi.mocked(exists).mockResolvedValue(true);
      vi.mocked(readTextFile).mockResolvedValue('{ invalid yaml ::');

      const result = await loadArchiveIndex();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('PARSE_ERROR');
      }
    });

    it('should return VALIDATION_ERROR for schema mismatch', async () => {
      vi.mocked(exists).mockResolvedValue(true);
      vi.mocked(readTextFile).mockResolvedValue(`
version: 1
missing_required_fields: true
`);

      const result = await loadArchiveIndex();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should return validated ArchiveIndex on success', async () => {
      vi.mocked(exists).mockResolvedValue(true);
      vi.mocked(readTextFile).mockResolvedValue(`
version: 1
generated_at: "2026-01-27T00:00:00Z"
archived_items: []
stats:
  total: 0
  projects: 0
  areas: 0
`);

      const result = await loadArchiveIndex();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.version).toBe(1);
        expect(result.value.archived_items).toEqual([]);
      }
    });
  });

  describe('Error handling', () => {
    it('should wrap unknown errors in ArchiveError', async () => {
      vi.mocked(exists).mockRejectedValue('unknown string error');

      const result = await initArchiveDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
        expect(result.error.message).toBeDefined();
      }
    });

    it('should preserve original error in ArchiveError', async () => {
      const originalError = new Error('Original error message');
      vi.mocked(exists).mockRejectedValue(originalError);

      const result = await initArchiveDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.cause).toBe(originalError);
      }
    });
  });
});

describe('Archive structure requirements (Story 4.5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exists).mockResolvedValue(false);
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeTextFile).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should use flat structure (no YYYY-MM/ subdirectories)', async () => {
    const mkdirCalls: string[] = [];
    vi.mocked(mkdir).mockImplementation(async (path: string | URL) => {
      mkdirCalls.push(String(path));
    });

    await initArchiveDirectory();

    // Should only create Archive, Archive/projects, Archive/areas
    // Should NOT create any date-based subdirectories
    mkdirCalls.forEach((path) => {
      expect(path).not.toMatch(/\d{4}-\d{2}/); // No YYYY-MM patterns
    });
  });

  it('should create projects subdirectory at Archive/projects', async () => {
    const result = await initArchiveDirectory();

    expect(result.isOk()).toBe(true);
    expect(mkdir).toHaveBeenCalledWith(
      'Orion/Archive/projects',
      expect.any(Object)
    );
  });

  it('should create areas subdirectory at Archive/areas', async () => {
    const result = await initArchiveDirectory();

    expect(result.isOk()).toBe(true);
    expect(mkdir).toHaveBeenCalledWith(
      'Orion/Archive/areas',
      expect.any(Object)
    );
  });
});
