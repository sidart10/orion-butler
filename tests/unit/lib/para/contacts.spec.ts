/**
 * Tests for Contacts Subdirectory Initialization
 * Story 4.10: Initialize Contacts Subdirectory
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
  initContactsIndex,
  CONTACTS_INDEX_FILENAME,
  type ContactsIndexInitResult,
  type ContactsIndexInitError,
} from '@/lib/para/contacts';
import { ContactsSubdirIndexSchema } from '@/lib/para/schemas/contact';

describe('Contacts Subdirectory Initialization (Story 4.10)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: files don't exist yet
    vi.mocked(exists).mockResolvedValue(false);
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeTextFile).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Constants', () => {
    it('should export CONTACTS_INDEX_FILENAME as "_index.yaml"', () => {
      expect(CONTACTS_INDEX_FILENAME).toBe('_index.yaml');
    });
  });

  describe('initContactsIndex', () => {
    it('should return a Result type', async () => {
      const result = await initContactsIndex();

      // Result should have isOk/isErr methods (neverthrow pattern)
      expect(typeof result.isOk).toBe('function');
      expect(typeof result.isErr).toBe('function');
    });

    it('should create _index.yaml in ~/Orion/Resources/contacts/', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initContactsIndex();

      expect(result.isOk()).toBe(true);
      expect(writeTextFile).toHaveBeenCalledWith(
        'Orion/Resources/contacts/_index.yaml',
        expect.any(String),
        expect.objectContaining({ baseDir: expect.any(Number) })
      );
    });

    it('should write _index.yaml content that validates against ContactsSubdirIndexSchema', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path, content) => {
        writtenContent = content;
      });

      await initContactsIndex();

      // Parse the written YAML
      const parsed = parse(writtenContent);
      const validationResult = ContactsSubdirIndexSchema.safeParse(parsed);
      expect(validationResult.success).toBe(true);
    });

    it('should write _index.yaml with version 1', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path, content) => {
        writtenContent = content;
      });

      await initContactsIndex();

      const parsed = parse(writtenContent);
      expect(parsed.version).toBe(1);
    });

    it('should write _index.yaml with generated_at timestamp', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path, content) => {
        writtenContent = content;
      });

      await initContactsIndex();

      const parsed = parse(writtenContent);
      expect(parsed.generated_at).toBeDefined();
      // Should be a valid ISO date
      const date = new Date(parsed.generated_at);
      expect(date.toString()).not.toBe('Invalid Date');
    });

    it('should write _index.yaml with empty contacts array', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path, content) => {
        writtenContent = content;
      });

      await initContactsIndex();

      const parsed = parse(writtenContent);
      expect(parsed.contacts).toBeDefined();
      expect(Array.isArray(parsed.contacts)).toBe(true);
      expect(parsed.contacts).toHaveLength(0);
    });

    it('should write _index.yaml with stats object', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      let writtenContent = '';
      vi.mocked(writeTextFile).mockImplementation(async (_path, content) => {
        writtenContent = content;
      });

      await initContactsIndex();

      const parsed = parse(writtenContent);
      expect(parsed.stats).toBeDefined();
      expect(parsed.stats.total).toBe(0);
      expect(parsed.stats.people).toBe(0);
      expect(parsed.stats.organizations).toBe(0);
    });

    it('should be idempotent - not error when index file already exists', async () => {
      // Index file already exists
      vi.mocked(exists).mockResolvedValue(true);

      const result1 = await initContactsIndex();
      const result2 = await initContactsIndex();

      expect(result1.isOk()).toBe(true);
      expect(result2.isOk()).toBe(true);
    });

    it('should skip index creation if _index.yaml already exists', async () => {
      vi.mocked(exists).mockResolvedValue(true);

      await initContactsIndex();

      // writeTextFile should not be called if index file exists
      expect(writeTextFile).not.toHaveBeenCalled();
    });

    it('should return ContactsIndexInitResult with indexPath', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initContactsIndex();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const value: ContactsIndexInitResult = result.value;
        expect(value.indexPath).toBe('Orion/Resources/contacts/_index.yaml');
      }
    });

    it('should return created: true when index was created', async () => {
      vi.mocked(exists).mockResolvedValue(false);

      const result = await initContactsIndex();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.created).toBe(true);
      }
    });

    it('should return created: false when index already existed', async () => {
      vi.mocked(exists).mockResolvedValue(true);

      const result = await initContactsIndex();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.created).toBe(false);
      }
    });

    it('should return error Result when writeTextFile fails', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(writeTextFile).mockRejectedValue(new Error('Disk full'));

      const result = await initContactsIndex();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error: ContactsIndexInitError = result.error;
        expect(error.code).toBe('WRITE_ERROR');
        expect(error.message).toContain('Disk full');
      }
    });

    it('should return error Result when exists check fails', async () => {
      vi.mocked(exists).mockRejectedValue(new Error('Network error'));

      const result = await initContactsIndex();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
      }
    });

    it('should log creation events', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.mocked(exists).mockResolvedValue(false);

      await initContactsIndex();

      // Should log something about contacts index creation
      expect(consoleSpy).toHaveBeenCalled();
      const logCalls = consoleSpy.mock.calls.flat().join(' ');
      expect(logCalls).toMatch(/contact|index|creat/i);

      consoleSpy.mockRestore();
    });

    it('should preserve original error in ContactsIndexInitError', async () => {
      const originalError = new Error('Original error message');
      vi.mocked(exists).mockRejectedValue(originalError);

      const result = await initContactsIndex();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.cause).toBe(originalError);
      }
    });

    it('should wrap unknown errors in ContactsIndexInitError', async () => {
      vi.mocked(exists).mockRejectedValue('unknown string error');

      const result = await initContactsIndex();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('FS_ERROR');
        expect(result.error.message).toBeDefined();
      }
    });

    it('should work even if contacts directory already existed (created by resources init)', async () => {
      // Directory exists (from resources.ts), but index file doesn't
      vi.mocked(exists)
        .mockResolvedValueOnce(false); // _index.yaml doesn't exist

      const result = await initContactsIndex();

      expect(result.isOk()).toBe(true);
      // Should still create the index
      expect(writeTextFile).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle permission denied errors', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      vi.mocked(writeTextFile).mockRejectedValue(new Error('Permission denied'));

      const result = await initContactsIndex();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain('Permission denied');
      }
    });
  });
});

describe('ContactsSubdirIndexSchema', () => {
  it('should validate correct schema structure', () => {
    const validIndex = {
      version: 1,
      generated_at: '2026-01-27T00:00:00Z',
      contacts: [],
      stats: {
        total: 0,
        people: 0,
        organizations: 0,
      },
    };

    const result = ContactsSubdirIndexSchema.safeParse(validIndex);
    expect(result.success).toBe(true);
  });

  it('should reject schema without version', () => {
    const invalidIndex = {
      generated_at: '2026-01-27T00:00:00Z',
      contacts: [],
      stats: { total: 0, people: 0, organizations: 0 },
    };

    const result = ContactsSubdirIndexSchema.safeParse(invalidIndex);
    expect(result.success).toBe(false);
  });

  it('should reject schema without generated_at', () => {
    const invalidIndex = {
      version: 1,
      contacts: [],
      stats: { total: 0, people: 0, organizations: 0 },
    };

    const result = ContactsSubdirIndexSchema.safeParse(invalidIndex);
    expect(result.success).toBe(false);
  });

  it('should reject schema without contacts array', () => {
    const invalidIndex = {
      version: 1,
      generated_at: '2026-01-27T00:00:00Z',
      stats: { total: 0, people: 0, organizations: 0 },
    };

    const result = ContactsSubdirIndexSchema.safeParse(invalidIndex);
    expect(result.success).toBe(false);
  });

  it('should reject schema without stats object', () => {
    const invalidIndex = {
      version: 1,
      generated_at: '2026-01-27T00:00:00Z',
      contacts: [],
    };

    const result = ContactsSubdirIndexSchema.safeParse(invalidIndex);
    expect(result.success).toBe(false);
  });

  it('should validate schema with contact references in array', () => {
    const indexWithContacts = {
      version: 1,
      generated_at: '2026-01-27T00:00:00Z',
      contacts: ['cont_abc123', 'cont_def456'],
      stats: {
        total: 2,
        people: 1,
        organizations: 1,
      },
    };

    const result = ContactsSubdirIndexSchema.safeParse(indexWithContacts);
    expect(result.success).toBe(true);
  });

  it('should validate stats with positive numbers', () => {
    const validIndex = {
      version: 1,
      generated_at: '2026-01-27T00:00:00Z',
      contacts: [],
      stats: {
        total: 10,
        people: 7,
        organizations: 3,
      },
    };

    const result = ContactsSubdirIndexSchema.safeParse(validIndex);
    expect(result.success).toBe(true);
  });
});
