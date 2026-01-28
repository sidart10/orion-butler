/**
 * Tests for PARA Directory Initialization
 * Story 4.1a: Create PARA Root Directory Structure
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Result } from 'neverthrow';

// Mock the Tauri FS plugin before importing the module under test
vi.mock('@tauri-apps/plugin-fs', () => ({
  mkdir: vi.fn(),
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
import { mkdir, exists } from '@tauri-apps/plugin-fs';
import { initParaRoot, type ParaInitResult, type ParaInitError } from '@/lib/para/init';

describe('PARA Directory Initialization (Story 4.1a)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: directories don't exist yet
    vi.mocked(exists).mockResolvedValue(false);
    vi.mocked(mkdir).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initParaRoot', () => {
    it('should return a Result type', async () => {
      const result = await initParaRoot();

      // Result should have isOk/isErr methods (neverthrow pattern)
      expect(typeof result.isOk).toBe('function');
      expect(typeof result.isErr).toBe('function');
    });

    it('should create ~/Orion/ directory when it does not exist', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initParaRoot();

      expect(result.isOk()).toBe(true);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion',
        expect.objectContaining({
          baseDir: expect.any(Number), // BaseDirectory.Home
          recursive: true,
        })
      );
    });

    it('should create ~/Orion/.orion/ system directory', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initParaRoot();

      expect(result.isOk()).toBe(true);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/.orion',
        expect.objectContaining({
          baseDir: expect.any(Number),
          recursive: true,
        })
      );
    });

    it('should be idempotent - not error when directories already exist', async () => {
      // Directories already exist
      vi.mocked(exists).mockResolvedValue(true);

      const result1 = await initParaRoot();
      const result2 = await initParaRoot();

      expect(result1.isOk()).toBe(true);
      expect(result2.isOk()).toBe(true);
    });

    it('should skip creation if directories already exist', async () => {
      vi.mocked(exists).mockResolvedValue(true);

      await initParaRoot();

      // mkdir should not be called if directories exist
      expect(mkdir).not.toHaveBeenCalled();
    });

    it('should return success result with created directories info', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initParaRoot();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const value: ParaInitResult = result.value;
        expect(value.created).toBeDefined();
        expect(Array.isArray(value.created)).toBe(true);
        expect(value.created.length).toBeGreaterThan(0);
      }
    });

    it('should return error Result when mkdir fails', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(mkdir).mockRejectedValue(new Error('Permission denied'));

      const result = await initParaRoot();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error: ParaInitError = result.error;
        expect(error.code).toBe('FS_ERROR');
        expect(error.message).toContain('Permission denied');
      }
    });

    it('should return error Result when exists check fails', async () => {
      vi.mocked(exists).mockRejectedValue(new Error('Network error'));

      const result = await initParaRoot();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
      }
    });

    it('should log creation events', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.mocked(exists).mockResolvedValue(false);

      await initParaRoot();

      // Should log something about directory creation
      expect(consoleSpy).toHaveBeenCalled();
      const logCalls = consoleSpy.mock.calls.flat().join(' ');
      expect(logCalls).toMatch(/para|orion|creat/i);

      consoleSpy.mockRestore();
    });

    it('should create both root and system directories in correct order', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      const mkdirCalls: string[] = [];
      vi.mocked(mkdir).mockImplementation(async (path: string) => {
        mkdirCalls.push(path);
      });

      await initParaRoot();

      // Root should be created before system dir
      expect(mkdirCalls[0]).toBe('Orion');
      expect(mkdirCalls[1]).toBe('Orion/.orion');
    });

    it('should handle partial existence (root exists, system does not)', async () => {
      vi.mocked(exists)
        .mockResolvedValueOnce(true)  // Orion exists
        .mockResolvedValueOnce(false); // .orion does not exist

      const result = await initParaRoot();

      expect(result.isOk()).toBe(true);
      // Should only create .orion
      expect(mkdir).toHaveBeenCalledTimes(1);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/.orion',
        expect.objectContaining({ recursive: true })
      );
    });
  });

  describe('Error handling', () => {
    it('should wrap unknown errors in ParaInitError', async () => {
      vi.mocked(exists).mockRejectedValue('unknown string error');

      const result = await initParaRoot();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
        expect(result.error.message).toBeDefined();
      }
    });

    it('should preserve original error in ParaInitError', async () => {
      const originalError = new Error('Original error message');
      vi.mocked(exists).mockRejectedValue(originalError);

      const result = await initParaRoot();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.cause).toBe(originalError);
      }
    });
  });
});
