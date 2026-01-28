/**
 * Tests for Orion Config Functions
 * Story 4.1b: Initialize Orion Config
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { stringify, parse } from 'yaml';

// Mock the Tauri FS plugin before importing the module under test
vi.mock('@tauri-apps/plugin-fs', () => ({
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
import { writeTextFile, readTextFile, exists } from '@tauri-apps/plugin-fs';
import {
  getDefaultConfig,
  initOrionConfig,
  loadConfig,
  CONFIG_FILENAME,
  type ConfigInitResult,
  type ConfigError,
} from '@/lib/para/config';
import { OrionConfigSchema, type OrionConfig } from '@/lib/para/schemas/config';

describe('Config Constants (Story 4.1b)', () => {
  it('should export CONFIG_FILENAME as "config.yaml"', () => {
    expect(CONFIG_FILENAME).toBe('config.yaml');
  });
});

describe('getDefaultConfig (Story 4.1b)', () => {
  it('should return a valid OrionConfig object', () => {
    const config = getDefaultConfig();
    const result = OrionConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should return version 1', () => {
    const config = getDefaultConfig();
    expect(config.version).toBe(1);
  });

  it('should return para_root as "~/Orion"', () => {
    const config = getDefaultConfig();
    expect(config.para_root).toBe('~/Orion');
  });

  it('should return created_at as a valid ISO 8601 datetime', () => {
    const config = getDefaultConfig();
    // Should be parseable as a date
    const date = new Date(config.created_at);
    expect(date.toString()).not.toBe('Invalid Date');
  });

  it('should return created_at close to current time', () => {
    const before = Date.now();
    const config = getDefaultConfig();
    const after = Date.now();

    const createdAt = new Date(config.created_at).getTime();
    expect(createdAt).toBeGreaterThanOrEqual(before);
    expect(createdAt).toBeLessThanOrEqual(after);
  });

  it('should return default preferences', () => {
    const config = getDefaultConfig();
    expect(config.preferences.theme).toBe('system');
    expect(config.preferences.archive_after_days).toBe(30);
  });

  it('should generate a new timestamp on each call', async () => {
    const config1 = getDefaultConfig();
    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));
    const config2 = getDefaultConfig();

    // Timestamps might be the same if called quickly, but they should be valid
    expect(new Date(config1.created_at).getTime()).toBeLessThanOrEqual(
      new Date(config2.created_at).getTime()
    );
  });
});

describe('initOrionConfig (Story 4.1b)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: config file does not exist
    vi.mocked(exists).mockResolvedValue(false);
    vi.mocked(writeTextFile).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return a Result type', async () => {
    const result = await initOrionConfig();
    expect(typeof result.isOk).toBe('function');
    expect(typeof result.isErr).toBe('function');
  });

  it('should create config.yaml when it does not exist', async () => {
    vi.mocked(exists).mockResolvedValue(false);

    const result = await initOrionConfig();

    expect(result.isOk()).toBe(true);
    expect(writeTextFile).toHaveBeenCalledTimes(1);
    expect(writeTextFile).toHaveBeenCalledWith(
      'Orion/.orion/config.yaml',
      expect.any(String),
      expect.objectContaining({ baseDir: expect.any(Number) })
    );
  });

  it('should write valid YAML content', async () => {
    vi.mocked(exists).mockResolvedValue(false);
    let writtenContent = '';
    vi.mocked(writeTextFile).mockImplementation(async (_path, content) => {
      writtenContent = content;
    });

    await initOrionConfig();

    // Parse the written YAML
    const parsed = parse(writtenContent);
    expect(parsed.version).toBe(1);
    expect(parsed.para_root).toBe('~/Orion');
    expect(parsed.preferences).toBeDefined();
  });

  it('should write YAML that validates against OrionConfigSchema', async () => {
    vi.mocked(exists).mockResolvedValue(false);
    let writtenContent = '';
    vi.mocked(writeTextFile).mockImplementation(async (_path, content) => {
      writtenContent = content;
    });

    await initOrionConfig();

    const parsed = parse(writtenContent);
    const result = OrionConfigSchema.safeParse(parsed);
    expect(result.success).toBe(true);
  });

  it('should be idempotent - not overwrite existing config', async () => {
    vi.mocked(exists).mockResolvedValue(true);

    const result = await initOrionConfig();

    expect(result.isOk()).toBe(true);
    expect(writeTextFile).not.toHaveBeenCalled();
  });

  it('should return ConfigInitResult with created=true when file created', async () => {
    vi.mocked(exists).mockResolvedValue(false);

    const result = await initOrionConfig();

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const value: ConfigInitResult = result.value;
      expect(value.created).toBe(true);
      expect(value.path).toBe('Orion/.orion/config.yaml');
    }
  });

  it('should return ConfigInitResult with created=false when file exists', async () => {
    vi.mocked(exists).mockResolvedValue(true);

    const result = await initOrionConfig();

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.created).toBe(false);
      expect(result.value.path).toBe('Orion/.orion/config.yaml');
    }
  });

  it('should return error Result when write fails', async () => {
    vi.mocked(exists).mockResolvedValue(false);
    vi.mocked(writeTextFile).mockRejectedValue(new Error('Disk full'));

    const result = await initOrionConfig();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error: ConfigError = result.error;
      expect(error.code).toBe('WRITE_ERROR');
      expect(error.message).toContain('Disk full');
    }
  });

  it('should return error Result when exists check fails', async () => {
    vi.mocked(exists).mockRejectedValue(new Error('Permission denied'));

    const result = await initOrionConfig();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('FS_ERROR');
    }
  });

  it('should log creation event', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.mocked(exists).mockResolvedValue(false);

    await initOrionConfig();

    expect(consoleSpy).toHaveBeenCalled();
    const logCalls = consoleSpy.mock.calls.flat().join(' ');
    expect(logCalls).toMatch(/config|orion/i);

    consoleSpy.mockRestore();
  });
});

describe('loadConfig (Story 4.1b)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const validYamlContent = stringify({
    version: 1,
    created_at: '2026-01-27T00:00:00Z',
    para_root: '~/Orion',
    preferences: {
      theme: 'system',
      archive_after_days: 30,
    },
  });

  it('should return a Result type', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue(validYamlContent);

    const result = await loadConfig();
    expect(typeof result.isOk).toBe('function');
    expect(typeof result.isErr).toBe('function');
  });

  it('should read and parse config.yaml file', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue(validYamlContent);

    const result = await loadConfig();

    expect(result.isOk()).toBe(true);
    expect(readTextFile).toHaveBeenCalledWith(
      'Orion/.orion/config.yaml',
      expect.objectContaining({ baseDir: expect.any(Number) })
    );
  });

  it('should return validated OrionConfig', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue(validYamlContent);

    const result = await loadConfig();

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const config: OrionConfig = result.value;
      expect(config.version).toBe(1);
      expect(config.para_root).toBe('~/Orion');
      expect(config.preferences.theme).toBe('system');
    }
  });

  it('should return error when config file does not exist', async () => {
    vi.mocked(exists).mockResolvedValue(false);

    const result = await loadConfig();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('NOT_FOUND');
    }
  });

  it('should return error when YAML is invalid', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue('not: valid: yaml: content:');

    const result = await loadConfig();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('PARSE_ERROR');
    }
  });

  it('should return error when config fails Zod validation', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue(
      stringify({
        version: 99, // Invalid version
        created_at: '2026-01-27T00:00:00Z',
        para_root: '~/Orion',
        preferences: {},
      })
    );

    const result = await loadConfig();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should return error when read fails', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockRejectedValue(new Error('Read permission denied'));

    const result = await loadConfig();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('READ_ERROR');
      expect(result.error.message).toContain('Read permission denied');
    }
  });

  it('should apply defaults for missing optional preferences', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue(
      stringify({
        version: 1,
        created_at: '2026-01-27T00:00:00Z',
        para_root: '~/Orion',
        preferences: {}, // Empty - should get defaults
      })
    );

    const result = await loadConfig();

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.preferences.theme).toBe('system');
      expect(result.value.preferences.archive_after_days).toBe(30);
    }
  });
});

describe('Error types (Story 4.1b)', () => {
  it('should have ConfigError with code and message', async () => {
    vi.mocked(exists).mockRejectedValue(new Error('Test error'));

    const result = await initOrionConfig();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error: ConfigError = result.error;
      expect(error.code).toBeDefined();
      expect(error.message).toBeDefined();
      expect(typeof error.code).toBe('string');
      expect(typeof error.message).toBe('string');
    }
  });

  it('should preserve original error in ConfigError.cause', async () => {
    const originalError = new Error('Original error');
    vi.mocked(exists).mockRejectedValue(originalError);

    const result = await initOrionConfig();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.cause).toBe(originalError);
    }
  });
});
