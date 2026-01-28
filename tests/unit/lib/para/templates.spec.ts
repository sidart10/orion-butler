/**
 * Tests for Templates Subdirectory Initialization
 * Story 4.11: Initialize Templates Subdirectory
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
import { mkdir, writeTextFile, exists, readTextFile } from '@tauri-apps/plugin-fs';
import {
  initTemplatesDirectory,
  TEMPLATES_INDEX_FILENAME,
  TEMPLATES_EMAIL_DIR,
  TEMPLATES_MEETING_DIR,
  FOLLOW_UP_TEMPLATE_FILENAME,
  FOLLOW_UP_TEMPLATE_CONTENT,
  type TemplatesInitResult,
  type TemplatesInitError,
} from '@/lib/para/templates';
import { TemplatesIndexSchema } from '@/lib/para/schemas/templates';

describe('Templates Subdirectory Initialization (Story 4.11)', () => {
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
    it('should export TEMPLATES_INDEX_FILENAME as "_index.yaml"', () => {
      expect(TEMPLATES_INDEX_FILENAME).toBe('_index.yaml');
    });

    it('should export TEMPLATES_EMAIL_DIR as "email-templates"', () => {
      expect(TEMPLATES_EMAIL_DIR).toBe('email-templates');
    });

    it('should export TEMPLATES_MEETING_DIR as "meeting-templates"', () => {
      expect(TEMPLATES_MEETING_DIR).toBe('meeting-templates');
    });

    it('should export FOLLOW_UP_TEMPLATE_FILENAME as "follow-up.md"', () => {
      expect(FOLLOW_UP_TEMPLATE_FILENAME).toBe('follow-up.md');
    });

    it('should export FOLLOW_UP_TEMPLATE_CONTENT with expected markdown content', () => {
      expect(FOLLOW_UP_TEMPLATE_CONTENT).toContain('# Follow-up Email');
      expect(FOLLOW_UP_TEMPLATE_CONTENT).toContain('Subject: Following up on {{topic}}');
      expect(FOLLOW_UP_TEMPLATE_CONTENT).toContain('Hi {{name}}');
      expect(FOLLOW_UP_TEMPLATE_CONTENT).toContain('{{date}}');
      expect(FOLLOW_UP_TEMPLATE_CONTENT).toContain('{{body}}');
      expect(FOLLOW_UP_TEMPLATE_CONTENT).toContain('{{signature}}');
    });
  });

  describe('initTemplatesDirectory', () => {
    it('should return a Result type', async () => {
      const result = await initTemplatesDirectory();

      // Result should have isOk/isErr methods (neverthrow pattern)
      expect(typeof result.isOk).toBe('function');
      expect(typeof result.isErr).toBe('function');
    });

    it('should create ~/Orion/Resources/templates/email-templates/ subdirectory', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initTemplatesDirectory();

      expect(result.isOk()).toBe(true);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Resources/templates/email-templates',
        expect.objectContaining({
          baseDir: expect.any(Number), // BaseDirectory.Home
          recursive: true,
        })
      );
    });

    it('should create ~/Orion/Resources/templates/meeting-templates/ subdirectory', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initTemplatesDirectory();

      expect(result.isOk()).toBe(true);
      expect(mkdir).toHaveBeenCalledWith(
        'Orion/Resources/templates/meeting-templates',
        expect.objectContaining({
          baseDir: expect.any(Number),
          recursive: true,
        })
      );
    });

    it('should create ~/Orion/Resources/templates/_index.yaml file', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initTemplatesDirectory();

      expect(result.isOk()).toBe(true);
      expect(writeTextFile).toHaveBeenCalledWith(
        'Orion/Resources/templates/_index.yaml',
        expect.any(String),
        expect.objectContaining({ baseDir: expect.any(Number) })
      );
    });

    it('should create ~/Orion/Resources/templates/email-templates/follow-up.md starter template', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initTemplatesDirectory();

      expect(result.isOk()).toBe(true);
      expect(writeTextFile).toHaveBeenCalledWith(
        'Orion/Resources/templates/email-templates/follow-up.md',
        expect.any(String),
        expect.objectContaining({ baseDir: expect.any(Number) })
      );
    });

    it('should write follow-up.md with correct template content', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (path: string, content: string) => {
        if (path.endsWith('follow-up.md')) {
          writtenContent = content;
        }
      });

      await initTemplatesDirectory();

      expect(writtenContent).toContain('# Follow-up Email');
      expect(writtenContent).toContain('Subject: Following up on {{topic}}');
      expect(writtenContent).toContain('Hi {{name}},');
      expect(writtenContent).toContain('I wanted to follow up on {{topic}} from our conversation on {{date}}.');
      expect(writtenContent).toContain('{{body}}');
      expect(writtenContent).toContain('Best,');
      expect(writtenContent).toContain('{{signature}}');
    });

    it('should write _index.yaml content that validates against TemplatesIndexSchema', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (path: string, content: string) => {
        if (path.endsWith('_index.yaml')) {
          writtenContent = content;
        }
      });

      await initTemplatesDirectory();

      // Parse the written YAML
      const parsed = parse(writtenContent);
      const validationResult = TemplatesIndexSchema.safeParse(parsed);
      expect(validationResult.success).toBe(true);
    });

    it('should write _index.yaml with version 1', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (path: string, content: string) => {
        if (path.endsWith('_index.yaml')) {
          writtenContent = content;
        }
      });

      await initTemplatesDirectory();

      const parsed = parse(writtenContent);
      expect(parsed.version).toBe(1);
    });

    it('should write _index.yaml with all subdirectory names', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (path: string, content: string) => {
        if (path.endsWith('_index.yaml')) {
          writtenContent = content;
        }
      });

      await initTemplatesDirectory();

      const parsed = parse(writtenContent);
      expect(parsed.subdirectories).toContain('email-templates');
      expect(parsed.subdirectories).toContain('meeting-templates');
    });

    it('should write _index.yaml with valid updated_at timestamp', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (path: string, content: string) => {
        if (path.endsWith('_index.yaml')) {
          writtenContent = content;
        }
      });

      await initTemplatesDirectory();

      const parsed = parse(writtenContent);
      expect(parsed.updated_at).toBeDefined();
      // Should be a valid ISO date
      const date = new Date(parsed.updated_at);
      expect(date.toString()).not.toBe('Invalid Date');
    });

    it('should be idempotent - not error when directories already exist', async () => {
      // Directories already exist
      vi.mocked(exists).mockResolvedValue(true);

      const result1 = await initTemplatesDirectory();
      const result2 = await initTemplatesDirectory();

      expect(result1.isOk()).toBe(true);
      expect(result2.isOk()).toBe(true);
    });

    it('should skip directory creation if directories already exist', async () => {
      vi.mocked(exists).mockResolvedValue(true);

      await initTemplatesDirectory();

      // mkdir should not be called if directories exist
      expect(mkdir).not.toHaveBeenCalled();
      // writeTextFile should not be called if files exist
      expect(writeTextFile).not.toHaveBeenCalled();
    });

    it('should return TemplatesInitResult with created directories info', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initTemplatesDirectory();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const value: TemplatesInitResult = result.value;
        expect(value.created).toBeDefined();
        expect(Array.isArray(value.created)).toBe(true);
        expect(value.skipped).toBeDefined();
        expect(Array.isArray(value.skipped)).toBe(true);
      }
    });

    it('should return created list with all subdirectories', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initTemplatesDirectory();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.created).toContain('Orion/Resources/templates/email-templates');
        expect(result.value.created).toContain('Orion/Resources/templates/meeting-templates');
      }
    });

    it('should return index file path in result', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initTemplatesDirectory();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.indexPath).toBe('Orion/Resources/templates/_index.yaml');
      }
    });

    it('should return starter template path in result', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initTemplatesDirectory();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.starterTemplates).toContain('Orion/Resources/templates/email-templates/follow-up.md');
      }
    });

    it('should return error Result when mkdir fails', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(mkdir).mockRejectedValue(new Error('Permission denied'));

      const result = await initTemplatesDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error: TemplatesInitError = result.error;
        expect(error.code).toBe('FS_ERROR');
        expect(error.message).toContain('Permission denied');
      }
    });

    it('should return error Result when writeTextFile fails', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(writeTextFile).mockRejectedValue(new Error('Disk full'));

      const result = await initTemplatesDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('WRITE_ERROR');
        expect(result.error.message).toContain('Disk full');
      }
    });

    it('should return error Result when exists check fails', async () => {
      vi.mocked(exists).mockRejectedValue(new Error('Network error'));

      const result = await initTemplatesDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
      }
    });

    it('should log creation events', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.mocked(exists).mockResolvedValue(false);

      await initTemplatesDirectory();

      // Should log something about directory creation
      expect(consoleSpy).toHaveBeenCalled();
      const logCalls = consoleSpy.mock.calls.flat().join(' ');
      expect(logCalls).toMatch(/template|creat/i);

      consoleSpy.mockRestore();
    });

    it('should create directories before files', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      const operations: string[] = [];
      vi.mocked(mkdir).mockImplementation(async (path: string) => {
        operations.push(`mkdir:${path}`);
      });
      vi.mocked(writeTextFile).mockImplementation(async (path: string) => {
        operations.push(`write:${path}`);
      });

      await initTemplatesDirectory();

      // All mkdir operations should happen before any write operation
      const lastMkdirIdx = operations
        .map((op, i) => (op.startsWith('mkdir:') ? i : -1))
        .filter((i) => i >= 0)
        .pop() ?? -1;
      const firstWriteIdx = operations.findIndex((op) => op.startsWith('write:'));

      expect(lastMkdirIdx).toBeLessThan(firstWriteIdx);
    });

    it('should handle partial existence (email-templates exists, meeting-templates does not)', async () => {
      // email-templates exists, but meeting-templates and files don't
      vi.mocked(exists)
        .mockResolvedValueOnce(true)   // email-templates exists
        .mockResolvedValueOnce(false)  // meeting-templates doesn't exist
        .mockResolvedValueOnce(false)  // _index.yaml doesn't exist
        .mockResolvedValueOnce(false); // follow-up.md doesn't exist

      const result = await initTemplatesDirectory();

      expect(result.isOk()).toBe(true);
      // Should create 1 subdir + 2 files
      expect(mkdir).toHaveBeenCalledTimes(1);
      expect(writeTextFile).toHaveBeenCalledTimes(2);
    });

    it('should handle partial existence (directories exist, files do not)', async () => {
      // All directories exist, only files don't
      vi.mocked(exists)
        .mockResolvedValueOnce(true)   // email-templates exists
        .mockResolvedValueOnce(true)   // meeting-templates exists
        .mockResolvedValueOnce(false)  // _index.yaml doesn't exist
        .mockResolvedValueOnce(false); // follow-up.md doesn't exist

      const result = await initTemplatesDirectory();

      expect(result.isOk()).toBe(true);
      // Should not create any directories
      expect(mkdir).not.toHaveBeenCalled();
      // But should create the files
      expect(writeTextFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error handling', () => {
    it('should wrap unknown errors in TemplatesInitError', async () => {
      vi.mocked(exists).mockRejectedValue('unknown string error');

      const result = await initTemplatesDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
        expect(result.error.message).toBeDefined();
      }
    });

    it('should preserve original error in TemplatesInitError', async () => {
      const originalError = new Error('Original error message');
      vi.mocked(exists).mockRejectedValue(originalError);

      const result = await initTemplatesDirectory();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.cause).toBe(originalError);
      }
    });
  });
});
