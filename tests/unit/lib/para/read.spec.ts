/**
 * Tests for PARA Entity Read Access
 * Story 4.12: Agent Read Access to PARA
 *
 * TDD Phase: RED - Write failing tests first
 *
 * Provides a generic function to read and validate PARA entities from YAML files.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { stringify } from 'yaml';

// Mock the Tauri FS plugin before importing the module under test
vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: vi.fn(),
  exists: vi.fn(),
}));

// Mock the Tauri path API
vi.mock('@tauri-apps/api/path', () => ({
  BaseDirectory: {
    Home: 1,
  },
}));

// Import after mocking
import { readTextFile, exists } from '@tauri-apps/plugin-fs';
import {
  readParaEntity,
  type ParaReadError,
  type ReadOptions,
} from '@/lib/para/read';
import { ProjectMetaSchema } from '@/lib/para/schemas/project';
import { AreaMetaSchema } from '@/lib/para/schemas/area';
import { ContactCardSchema } from '@/lib/para/schemas/contact';

// =============================================================================
// Test Data Fixtures
// =============================================================================

/** Valid project metadata for testing */
const validProjectMeta = {
  id: 'proj_abc123456789',
  name: 'Test Project',
  description: 'A test project for unit tests',
  status: 'active',
  priority: 'high',
  created_at: '2026-01-28T00:00:00Z',
  updated_at: '2026-01-28T00:00:00Z',
  tags: ['test', 'unit'],
};

/** Valid area metadata for testing */
const validAreaMeta = {
  id: 'area_xyz987654321',
  name: 'Test Area',
  description: 'A test area for unit tests',
  status: 'active',
  created_at: '2026-01-28T00:00:00Z',
  updated_at: '2026-01-28T00:00:00Z',
};

/** Valid contact card for testing */
const validContactCard = {
  id: 'cont_def456789012',
  name: 'John Doe',
  type: 'person',
  email: 'john@example.com',
  created_at: '2026-01-28T00:00:00Z',
  updated_at: '2026-01-28T00:00:00Z',
};

// =============================================================================
// Result Type Tests
// =============================================================================

describe('readParaEntity Result type (Story 4.12)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue(stringify(validProjectMeta));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return a Result type with isOk and isErr methods', async () => {
    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(typeof result.isOk).toBe('function');
    expect(typeof result.isErr).toBe('function');
  });

  it('should return isOk() = true for successful reads', async () => {
    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isOk()).toBe(true);
    expect(result.isErr()).toBe(false);
  });
});

// =============================================================================
// Happy Path Tests
// =============================================================================

describe('readParaEntity happy path (Story 4.12)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exists).mockResolvedValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should read valid YAML and return parsed entity', async () => {
    vi.mocked(readTextFile).mockResolvedValue(stringify(validProjectMeta));

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.id).toBe('proj_abc123456789');
      expect(result.value.name).toBe('Test Project');
    }
  });

  it('should validate against ProjectMetaSchema', async () => {
    vi.mocked(readTextFile).mockResolvedValue(stringify(validProjectMeta));

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      // Type should match ProjectMeta
      expect(result.value.status).toBe('active');
      expect(result.value.priority).toBe('high');
    }
  });

  it('should validate against AreaMetaSchema', async () => {
    vi.mocked(readTextFile).mockResolvedValue(stringify(validAreaMeta));

    const result = await readParaEntity(
      'Orion/Areas/test/_meta.yaml',
      AreaMetaSchema
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.id).toBe('area_xyz987654321');
      expect(result.value.status).toBe('active');
    }
  });

  it('should validate against ContactCardSchema', async () => {
    vi.mocked(readTextFile).mockResolvedValue(stringify(validContactCard));

    const result = await readParaEntity(
      'Orion/Areas/Contacts/john-doe.yaml',
      ContactCardSchema
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.id).toBe('cont_def456789012');
      expect(result.value.type).toBe('person');
    }
  });

  it('should return typed entity matching the provided schema', async () => {
    vi.mocked(readTextFile).mockResolvedValue(stringify(validProjectMeta));

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      // TypeScript should infer the correct type from the schema
      const project = result.value;
      expect(project.id).toMatch(/^proj_/);
      expect(project.created_at).toBeDefined();
      expect(project.updated_at).toBeDefined();
    }
  });

  it('should call exists() with the provided path', async () => {
    vi.mocked(readTextFile).mockResolvedValue(stringify(validProjectMeta));

    await readParaEntity('Orion/Projects/test/_meta.yaml', ProjectMetaSchema);

    expect(exists).toHaveBeenCalledWith(
      'Orion/Projects/test/_meta.yaml',
      expect.objectContaining({ baseDir: expect.any(Number) })
    );
  });

  it('should call readTextFile() with the provided path', async () => {
    vi.mocked(readTextFile).mockResolvedValue(stringify(validProjectMeta));

    await readParaEntity('Orion/Projects/test/_meta.yaml', ProjectMetaSchema);

    expect(readTextFile).toHaveBeenCalledWith(
      'Orion/Projects/test/_meta.yaml',
      expect.objectContaining({ baseDir: expect.any(Number) })
    );
  });
});

// =============================================================================
// Error Handling Tests
// =============================================================================

describe('readParaEntity error handling (Story 4.12)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return NOT_FOUND error when exists() returns false', async () => {
    vi.mocked(exists).mockResolvedValue(false);

    const result = await readParaEntity(
      'Orion/Projects/nonexistent/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error: ParaReadError = result.error;
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toContain('not found');
    }
  });

  it('should return READ_ERROR when readTextFile() throws', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockRejectedValue(new Error('Permission denied'));

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error: ParaReadError = result.error;
      expect(error.code).toBe('READ_ERROR');
      expect(error.message).toContain('Permission denied');
    }
  });

  it('should return PARSE_ERROR for invalid YAML syntax', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    // Invalid YAML - unbalanced braces and bad structure
    vi.mocked(readTextFile).mockResolvedValue('not: valid: yaml: {broken');

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error: ParaReadError = result.error;
      expect(error.code).toBe('PARSE_ERROR');
    }
  });

  it('should return VALIDATION_ERROR for valid YAML but wrong structure', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    // Valid YAML but doesn't match ProjectMetaSchema
    vi.mocked(readTextFile).mockResolvedValue(
      stringify({
        id: 'invalid_prefix', // Should start with 'proj_'
        name: 'Test',
        status: 'unknown_status', // Invalid enum value
        priority: 'super_high', // Invalid enum value
        created_at: '2026-01-28T00:00:00Z',
        updated_at: '2026-01-28T00:00:00Z',
      })
    );

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error: ParaReadError = result.error;
      expect(error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should return FS_ERROR for unexpected errors from exists()', async () => {
    vi.mocked(exists).mockRejectedValue(new Error('Filesystem corrupted'));

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error: ParaReadError = result.error;
      expect(error.code).toBe('FS_ERROR');
    }
  });

  it('should preserve original error in cause field for READ_ERROR', async () => {
    const originalError = new Error('Original read error');
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockRejectedValue(originalError);

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.cause).toBe(originalError);
    }
  });

  it('should preserve original error in cause field for FS_ERROR', async () => {
    const originalError = new Error('Original filesystem error');
    vi.mocked(exists).mockRejectedValue(originalError);

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.cause).toBe(originalError);
    }
  });

  it('should preserve original error in cause field for PARSE_ERROR', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue('invalid: yaml: {broken');

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      // YAML parse errors should be captured in cause
      expect(result.error.cause).toBeDefined();
    }
  });

  it('should preserve Zod error details in cause field for VALIDATION_ERROR', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue(
      stringify({
        // Missing required fields
        name: 'Test',
      })
    );

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.cause).toBeDefined();
    }
  });
});

// =============================================================================
// ReadOptions Tests
// =============================================================================

describe('readParaEntity options (Story 4.12)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exists).mockResolvedValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should validate by default (validate: true)', async () => {
    vi.mocked(readTextFile).mockResolvedValue(
      stringify({
        id: 'invalid', // Missing proj_ prefix
        name: 'Test',
        status: 'active',
        priority: 'high',
        created_at: '2026-01-28T00:00:00Z',
        updated_at: '2026-01-28T00:00:00Z',
      })
    );

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    // Default behavior should validate
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should validate when validate: true is explicit', async () => {
    vi.mocked(readTextFile).mockResolvedValue(
      stringify({
        id: 'invalid',
        name: 'Test',
        status: 'active',
        priority: 'high',
        created_at: '2026-01-28T00:00:00Z',
        updated_at: '2026-01-28T00:00:00Z',
      })
    );

    const options: ReadOptions = { validate: true };
    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema,
      options
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should skip validation when validate: false', async () => {
    vi.mocked(readTextFile).mockResolvedValue(
      stringify({
        id: 'invalid_prefix', // Would fail validation
        name: 'Test',
        status: 'unknown', // Would fail validation
        priority: 'super', // Would fail validation
        created_at: '2026-01-28T00:00:00Z',
        updated_at: '2026-01-28T00:00:00Z',
      })
    );

    const options: ReadOptions = { validate: false };
    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema,
      options
    );

    // Should succeed because validation is skipped
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      // Returns raw parsed data without validation
      expect(result.value.id).toBe('invalid_prefix');
      expect(result.value.status).toBe('unknown');
    }
  });

  it('should still return PARSE_ERROR even with validate: false for invalid YAML', async () => {
    vi.mocked(readTextFile).mockResolvedValue('invalid: yaml: {broken');

    const options: ReadOptions = { validate: false };
    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema,
      options
    );

    // YAML parsing still happens even without validation
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('PARSE_ERROR');
    }
  });
});

// =============================================================================
// Edge Cases Tests
// =============================================================================

describe('readParaEntity edge cases (Story 4.12)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exists).mockResolvedValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should handle empty file (0 bytes) with appropriate error', async () => {
    vi.mocked(readTextFile).mockResolvedValue('');

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      // Empty content should fail either parsing or validation
      expect(['PARSE_ERROR', 'VALIDATION_ERROR']).toContain(result.error.code);
    }
  });

  it('should handle whitespace-only file with VALIDATION_ERROR', async () => {
    vi.mocked(readTextFile).mockResolvedValue('   \n\t\n  ');

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      // Whitespace-only parses to null in YAML, which fails validation
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should parse YAML with anchors and references correctly', async () => {
    // YAML with anchors (&anchor) and aliases (*alias)
    const yamlWithAnchors = `
id: proj_abc123456789
name: Test Project
status: active
priority: &prio high
created_at: &timestamp "2026-01-28T00:00:00Z"
updated_at: *timestamp
tags:
  - test
`;
    vi.mocked(readTextFile).mockResolvedValue(yamlWithAnchors);

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.created_at).toBe('2026-01-28T00:00:00Z');
      expect(result.value.updated_at).toBe('2026-01-28T00:00:00Z');
    }
  });

  it('should handle YAML with comments', async () => {
    const yamlWithComments = `
# This is a project metadata file
id: proj_abc123456789  # The unique identifier
name: Test Project
status: active # Currently active
priority: high
created_at: "2026-01-28T00:00:00Z"
updated_at: "2026-01-28T00:00:00Z"
# Optional fields below
tags:
  - test
`;
    vi.mocked(readTextFile).mockResolvedValue(yamlWithComments);

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.id).toBe('proj_abc123456789');
    }
  });

  it('should handle YAML with multiline strings', async () => {
    const yamlWithMultiline = `
id: proj_abc123456789
name: Test Project
description: |
  This is a multiline description
  that spans several lines
  and preserves newlines.
status: active
priority: high
created_at: "2026-01-28T00:00:00Z"
updated_at: "2026-01-28T00:00:00Z"
`;
    vi.mocked(readTextFile).mockResolvedValue(yamlWithMultiline);

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.description).toContain('multiline');
      expect(result.value.description).toContain('\n');
    }
  });

  it('should handle very long file paths', async () => {
    const longPath = 'Orion/' + 'deeply/nested/'.repeat(50) + '_meta.yaml';
    vi.mocked(readTextFile).mockResolvedValue(stringify(validProjectMeta));

    const result = await readParaEntity(longPath, ProjectMetaSchema);

    expect(result.isOk()).toBe(true);
    expect(readTextFile).toHaveBeenCalledWith(
      longPath,
      expect.objectContaining({ baseDir: expect.any(Number) })
    );
  });

  it('should handle paths with special characters', async () => {
    const specialPath = 'Orion/Projects/test-project (2026)/_meta.yaml';
    vi.mocked(readTextFile).mockResolvedValue(stringify(validProjectMeta));

    const result = await readParaEntity(specialPath, ProjectMetaSchema);

    expect(result.isOk()).toBe(true);
    expect(readTextFile).toHaveBeenCalledWith(
      specialPath,
      expect.objectContaining({ baseDir: expect.any(Number) })
    );
  });
});

// =============================================================================
// Type Export Tests
// =============================================================================

describe('ParaReadError type (Story 4.12)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should have code property with valid error codes', async () => {
    vi.mocked(exists).mockResolvedValue(false);

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error: ParaReadError = result.error;
      const validCodes = [
        'NOT_FOUND',
        'READ_ERROR',
        'PARSE_ERROR',
        'VALIDATION_ERROR',
        'FS_ERROR',
      ];
      expect(validCodes).toContain(error.code);
    }
  });

  it('should have message property as string', async () => {
    vi.mocked(exists).mockResolvedValue(false);

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error: ParaReadError = result.error;
      expect(typeof error.message).toBe('string');
      expect(error.message.length).toBeGreaterThan(0);
    }
  });

  it('should have optional cause property', async () => {
    const originalError = new Error('Test error');
    vi.mocked(exists).mockRejectedValue(originalError);

    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error: ParaReadError = result.error;
      // cause can be undefined or have a value
      expect(error).toHaveProperty('cause');
    }
  });
});

// =============================================================================
// ReadOptions Type Tests
// =============================================================================

describe('ReadOptions type (Story 4.12)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(readTextFile).mockResolvedValue(stringify(validProjectMeta));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should accept empty options object', async () => {
    const options: ReadOptions = {};
    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema,
      options
    );

    expect(result.isOk()).toBe(true);
  });

  it('should accept validate boolean option', async () => {
    const options: ReadOptions = { validate: true };
    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema,
      options
    );

    expect(result.isOk()).toBe(true);
  });

  it('should work without options parameter', async () => {
    const result = await readParaEntity(
      'Orion/Projects/test/_meta.yaml',
      ProjectMetaSchema
    );

    expect(result.isOk()).toBe(true);
  });
});
