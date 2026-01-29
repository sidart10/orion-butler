/**
 * Integration Tests for PARA Read Refactor
 * Epic 4 Plan 3: Verifies refactored loadConfig() and loadArchiveIndex()
 *
 * These tests ensure that the refactored functions using readParaEntity()
 * work correctly with actual YAML content (mocked filesystem).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { stringify } from 'yaml';

// Mock the Tauri FS plugin
vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
  exists: vi.fn(),
  mkdir: vi.fn(),
}));

vi.mock('@tauri-apps/api/path', () => ({
  BaseDirectory: { Home: 1 },
}));

import { readTextFile, exists } from '@tauri-apps/plugin-fs';
import { loadConfig, getDefaultConfig } from '@/lib/para/config';
import { loadArchiveIndex, getDefaultArchiveIndex } from '@/lib/para/archive';
import { readParaEntity } from '@/lib/para/read';
import { OrionConfigSchema } from '@/lib/para/schemas/config';
import { ArchiveIndexSchema } from '@/lib/para/schemas/archive';

// =============================================================================
// Test Fixtures
// =============================================================================

const validConfig = {
  version: 1,
  created_at: '2026-01-28T00:00:00Z',
  para_root: '~/Orion',
  preferences: {
    theme: 'system',
    archive_after_days: 30,
  },
};

const validArchiveIndex = {
  version: 1,
  generated_at: '2026-01-28T00:00:00Z',
  archived_items: [],
  stats: {
    total: 0,
    projects: 0,
    areas: 0,
  },
};

// =============================================================================
// Integration: loadConfig() uses readParaEntity()
// =============================================================================

describe('loadConfig() integration with readParaEntity() (Plan 3 Refactor)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should successfully load valid config through refactored function', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue(stringify(validConfig));

    const result = await loadConfig();

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.version).toBe(1);
      expect(result.value.para_root).toBe('~/Orion');
      expect(result.value.preferences.theme).toBe('system');
    }
  });

  it('should return ConfigError with NOT_FOUND code when config missing', async () => {
    vi.mocked(exists).mockResolvedValue(false);

    const result = await loadConfig();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('NOT_FOUND');
      expect(result.error.message).toContain('not found');
    }
  });

  it('should return ConfigError with PARSE_ERROR for invalid YAML', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue('invalid: yaml: {broken');

    const result = await loadConfig();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('PARSE_ERROR');
    }
  });

  it('should return ConfigError with VALIDATION_ERROR for invalid schema', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 'not-a-number', // Should be number
      created_at: '2026-01-28T00:00:00Z',
    }));

    const result = await loadConfig();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should preserve error cause from underlying readParaEntity', async () => {
    const fsError = new Error('Filesystem error');
    vi.mocked(exists).mockRejectedValue(fsError);

    const result = await loadConfig();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('FS_ERROR');
      expect(result.error.cause).toBe(fsError);
    }
  });

  it('should match behavior of direct readParaEntity call', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue(stringify(validConfig));

    // Call both the refactored function and direct readParaEntity
    const configResult = await loadConfig();
    const directResult = await readParaEntity(
      'Orion/.orion/config.yaml',
      OrionConfigSchema
    );

    // Both should succeed
    expect(configResult.isOk()).toBe(true);
    expect(directResult.isOk()).toBe(true);

    // Both should return equivalent data
    if (configResult.isOk() && directResult.isOk()) {
      expect(configResult.value.version).toBe(directResult.value.version);
      expect(configResult.value.para_root).toBe(directResult.value.para_root);
    }
  });
});

// =============================================================================
// Integration: loadArchiveIndex() uses readParaEntity()
// =============================================================================

describe('loadArchiveIndex() integration with readParaEntity() (Plan 3 Refactor)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should successfully load valid archive index through refactored function', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue(stringify(validArchiveIndex));

    const result = await loadArchiveIndex();

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.version).toBe(1);
      expect(result.value.archived_items).toEqual([]);
      expect(result.value.stats.total).toBe(0);
    }
  });

  it('should return ArchiveError with NOT_FOUND code when index missing', async () => {
    vi.mocked(exists).mockResolvedValue(false);

    const result = await loadArchiveIndex();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('NOT_FOUND');
    }
  });

  it('should return ArchiveError with PARSE_ERROR for invalid YAML', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue('not: valid: yaml: {');

    const result = await loadArchiveIndex();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('PARSE_ERROR');
    }
  });

  it('should return ArchiveError with VALIDATION_ERROR for invalid schema', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      // Missing required fields: generated_at, archived_items, stats
    }));

    const result = await loadArchiveIndex();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should handle archive index with populated items', async () => {
    const populatedIndex = {
      version: 1,
      generated_at: '2026-01-28T00:00:00Z',
      archived_items: [
        {
          id: 'proj_archived123456',
          type: 'project',
          original_path: 'Projects/old-project',
          archived_to: 'Orion/Archive/projects/2026-01/old-project',
          archived_at: '2026-01-15T00:00:00Z',
          reason: 'completed',
        },
      ],
      stats: {
        total: 1,
        projects: 1,
        areas: 0,
      },
    };

    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue(stringify(populatedIndex));

    const result = await loadArchiveIndex();

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.archived_items).toHaveLength(1);
      expect(result.value.archived_items[0].id).toBe('proj_archived123456');
      expect(result.value.stats.total).toBe(1);
    }
  });

  it('should match behavior of direct readParaEntity call', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue(stringify(validArchiveIndex));

    // Call both the refactored function and direct readParaEntity
    const archiveResult = await loadArchiveIndex();
    const directResult = await readParaEntity(
      'Orion/Archive/_index.yaml',
      ArchiveIndexSchema
    );

    // Both should succeed
    expect(archiveResult.isOk()).toBe(true);
    expect(directResult.isOk()).toBe(true);

    // Both should return equivalent data
    if (archiveResult.isOk() && directResult.isOk()) {
      expect(archiveResult.value.version).toBe(directResult.value.version);
      expect(archiveResult.value.stats).toEqual(directResult.value.stats);
    }
  });
});

// =============================================================================
// Error Type Mapping Tests
// =============================================================================

describe('Error type mapping from ParaReadError to module errors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should map ParaReadError codes to ConfigError correctly', async () => {
    // Test each error code mapping
    const errorScenarios = [
      { setup: () => vi.mocked(exists).mockResolvedValue(false), expectedCode: 'NOT_FOUND' },
      { setup: () => {
          vi.mocked(exists).mockResolvedValue(true);
          vi.mocked(readTextFile).mockRejectedValue(new Error('Read failed'));
        }, expectedCode: 'READ_ERROR' },
      { setup: () => {
          vi.mocked(exists).mockResolvedValue(true);
          vi.mocked(readTextFile).mockResolvedValue('bad: yaml: {');
        }, expectedCode: 'PARSE_ERROR' },
    ];

    for (const scenario of errorScenarios) {
      vi.clearAllMocks();
      scenario.setup();

      const result = await loadConfig();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe(scenario.expectedCode);
      }
    }
  });

  it('should map ParaReadError codes to ArchiveError correctly', async () => {
    const errorScenarios = [
      { setup: () => vi.mocked(exists).mockResolvedValue(false), expectedCode: 'NOT_FOUND' },
      { setup: () => {
          vi.mocked(exists).mockResolvedValue(true);
          vi.mocked(readTextFile).mockRejectedValue(new Error('Read failed'));
        }, expectedCode: 'READ_ERROR' },
    ];

    for (const scenario of errorScenarios) {
      vi.clearAllMocks();
      scenario.setup();

      const result = await loadArchiveIndex();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe(scenario.expectedCode);
      }
    }
  });
});

// =============================================================================
// Default Value Tests (Regression)
// =============================================================================

describe('Default config/index generators (Regression)', () => {
  it('getDefaultConfig should return valid OrionConfig', () => {
    const config = getDefaultConfig();

    // Should pass schema validation
    const result = OrionConfigSchema.safeParse(config);
    expect(result.success).toBe(true);

    // Should have expected structure
    expect(config.version).toBe(1);
    expect(config.para_root).toBe('~/Orion');
    expect(config.preferences.theme).toBe('system');
  });

  it('getDefaultArchiveIndex should return valid ArchiveIndex', () => {
    const index = getDefaultArchiveIndex();

    // Should pass schema validation
    const result = ArchiveIndexSchema.safeParse(index);
    expect(result.success).toBe(true);

    // Should have expected structure
    expect(index.version).toBe(1);
    expect(index.archived_items).toEqual([]);
    expect(index.stats.total).toBe(0);
  });
});
