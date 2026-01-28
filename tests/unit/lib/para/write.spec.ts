/**
 * Tests for PARA Entity Write Access
 * Story 4.13: Agent Write Access to PARA
 *
 * TDD Phase: RED - Write failing tests first
 *
 * Provides generic functions to write PARA entities to YAML files with:
 * - Zod validation
 * - Atomic writes (temp file + rename)
 * - Backup creation
 * - Index management
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { stringify } from 'yaml';

// Mock the Tauri FS plugin before importing the module under test
vi.mock('@tauri-apps/plugin-fs', () => ({
  writeTextFile: vi.fn(),
  readTextFile: vi.fn(),
  exists: vi.fn(),
  rename: vi.fn(),
  copyFile: vi.fn(),
  remove: vi.fn(),
}));

// Mock the Tauri path API
vi.mock('@tauri-apps/api/path', () => ({
  BaseDirectory: {
    Home: 1,
  },
}));

// Import after mocking
import {
  writeTextFile,
  readTextFile,
  exists,
  rename,
  copyFile,
  remove,
} from '@tauri-apps/plugin-fs';
import {
  writeParaEntity,
  deleteParaEntity,
  type WriteOptions,
  type ParaWriteError,
} from '@/lib/para/write';
import { ProjectMetaSchema, type ProjectMeta } from '@/lib/para/schemas/project';
import { AreaMetaSchema, type AreaMeta } from '@/lib/para/schemas/area';
import { ContactCardSchema, type ContactCard } from '@/lib/para/schemas/contact';

// =============================================================================
// Test Data Fixtures
// =============================================================================

/** Valid project metadata for testing */
const validProject: ProjectMeta = {
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
const validArea: AreaMeta = {
  id: 'area_xyz987654321',
  name: 'Test Area',
  description: 'A test area for unit tests',
  status: 'active',
  created_at: '2026-01-28T00:00:00Z',
  updated_at: '2026-01-28T00:00:00Z',
};

/** Valid contact card for testing */
const validContact: ContactCard = {
  id: 'cont_def456789012',
  name: 'John Doe',
  type: 'person',
  email: 'john@example.com',
  created_at: '2026-01-28T00:00:00Z',
  updated_at: '2026-01-28T00:00:00Z',
};

/** Invalid project data (missing required fields) */
const invalidProject = {
  id: 'invalid', // Should start with 'proj_'
  name: 'Test',
  status: 'unknown_status', // Invalid enum
  priority: 'super', // Invalid enum
  created_at: '2026-01-28T00:00:00Z',
  updated_at: '2026-01-28T00:00:00Z',
};

// =============================================================================
// Result Type Tests
// =============================================================================

describe('writeParaEntity Result type (Story 4.13)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exists).mockResolvedValue(false);
    vi.mocked(writeTextFile).mockResolvedValue(undefined);
    vi.mocked(rename).mockResolvedValue(undefined);
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      projects: [],
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return a Result type with isOk and isErr methods', async () => {
    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(typeof result.isOk).toBe('function');
    expect(typeof result.isErr).toBe('function');
  });

  it('should return isOk() = true for successful writes', async () => {
    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(result.isOk()).toBe(true);
    expect(result.isErr()).toBe(false);
  });

  it('should return void on success (Result<void, ParaWriteError>)', async () => {
    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBeUndefined();
    }
  });
});

// =============================================================================
// Happy Path Tests
// =============================================================================

describe('writeParaEntity happy path (Story 4.13)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exists).mockResolvedValue(false);
    vi.mocked(writeTextFile).mockResolvedValue(undefined);
    vi.mocked(rename).mockResolvedValue(undefined);
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      projects: [],
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should write YAML content to file', async () => {
    let writtenContent = '';
    vi.mocked(writeTextFile).mockImplementation(async (_path, content) => {
      writtenContent = content;
    });

    await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    // Verify YAML was written
    expect(writtenContent).toContain('id: proj_abc123456789');
    expect(writtenContent).toContain('name: Test Project');
    expect(writtenContent).toContain('status: active');
  });

  it('should use BaseDirectory.Home for file operations', async () => {
    await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    // Check rename was called with baseDir option
    // Note: rename uses oldPathBaseDir/newPathBaseDir, not fromPathBaseDir/toPathBaseDir
    expect(rename).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ oldPathBaseDir: expect.any(Number), newPathBaseDir: expect.any(Number) })
    );
  });

  it('should work with ProjectMetaSchema', async () => {
    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(result.isOk()).toBe(true);
  });

  it('should work with AreaMetaSchema', async () => {
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      areas: [],
    }));

    const result = await writeParaEntity(
      'Orion/Areas/test/_meta.yaml',
      validArea,
      AreaMetaSchema
    );

    expect(result.isOk()).toBe(true);
  });

  it('should work with ContactCardSchema', async () => {
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      contacts: [],
    }));

    const result = await writeParaEntity(
      'Orion/Resources/contacts/john-doe.yaml',
      validContact,
      ContactCardSchema
    );

    expect(result.isOk()).toBe(true);
  });
});

// =============================================================================
// Validation Tests
// =============================================================================

describe('writeParaEntity validation (Story 4.13)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exists).mockResolvedValue(false);
    vi.mocked(writeTextFile).mockResolvedValue(undefined);
    vi.mocked(rename).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should validate entity by default', async () => {
    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      invalidProject as unknown as ProjectMeta,
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should return VALIDATION_ERROR for invalid entity structure', async () => {
    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      { name: 'Test' } as unknown as ProjectMeta, // Missing required fields
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBeDefined();
    }
  });

  it('should skip validation when validate: false', async () => {
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      projects: [],
    }));

    const options: WriteOptions = { validate: false };
    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      invalidProject as unknown as ProjectMeta,
      ProjectMetaSchema,
      options
    );

    // Should succeed because validation is skipped
    expect(result.isOk()).toBe(true);
  });

  it('should validate when validate: true is explicit', async () => {
    const options: WriteOptions = { validate: true };
    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      invalidProject as unknown as ProjectMeta,
      ProjectMetaSchema,
      options
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should preserve Zod error details in cause field', async () => {
    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      { name: 'Test' } as unknown as ProjectMeta,
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.cause).toBeDefined();
    }
  });
});

// =============================================================================
// Atomic Write Tests
// =============================================================================

describe('writeParaEntity atomic writes (Story 4.13)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exists).mockResolvedValue(false);
    vi.mocked(writeTextFile).mockResolvedValue(undefined);
    vi.mocked(rename).mockResolvedValue(undefined);
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      projects: [],
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should write to .tmp file first', async () => {
    await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    // First write should be to a .tmp file
    const writeCall = vi.mocked(writeTextFile).mock.calls[0];
    expect(writeCall[0]).toMatch(/\.tmp$/);
  });

  it('should rename .tmp to target on success', async () => {
    await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(rename).toHaveBeenCalledWith(
      'Orion/Projects/test/_meta.yaml.tmp',
      'Orion/Projects/test/_meta.yaml',
      expect.any(Object)
    );
  });

  it('should preserve original file if rename fails', async () => {
    vi.mocked(rename).mockRejectedValue(new Error('Rename failed'));

    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('RENAME_ERROR');
    }
    // Original file should not be affected (no direct write to it)
  });

  it('should return WRITE_ERROR when writeTextFile fails', async () => {
    vi.mocked(writeTextFile).mockRejectedValue(new Error('Disk full'));

    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('WRITE_ERROR');
      expect(result.error.message).toContain('Disk full');
    }
  });
});

// =============================================================================
// Backup Tests
// =============================================================================

describe('writeParaEntity backup (Story 4.13)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(writeTextFile).mockResolvedValue(undefined);
    vi.mocked(rename).mockResolvedValue(undefined);
    vi.mocked(copyFile).mockResolvedValue(undefined);
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      projects: [],
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create .bak backup for existing files', async () => {
    vi.mocked(exists).mockResolvedValue(true); // File exists

    await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(copyFile).toHaveBeenCalledWith(
      'Orion/Projects/test/_meta.yaml',
      'Orion/Projects/test/_meta.yaml.bak',
      expect.any(Object)
    );
  });

  it('should NOT create backup for new files', async () => {
    vi.mocked(exists).mockResolvedValue(false); // File does not exist

    await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(copyFile).not.toHaveBeenCalled();
  });

  it('should skip backup when createBackup: false', async () => {
    vi.mocked(exists).mockResolvedValue(true); // File exists

    const options: WriteOptions = { createBackup: false };
    await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema,
      options
    );

    expect(copyFile).not.toHaveBeenCalled();
  });

  it('should return BACKUP_ERROR when copyFile fails', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(copyFile).mockRejectedValue(new Error('Backup failed'));

    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('BACKUP_ERROR');
    }
  });

  it('should create backup by default (createBackup: true)', async () => {
    vi.mocked(exists).mockResolvedValue(true);

    await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(copyFile).toHaveBeenCalled();
  });
});

// =============================================================================
// Index Update Tests
// =============================================================================

describe('writeParaEntity index updates (Story 4.13)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exists).mockResolvedValue(false);
    vi.mocked(writeTextFile).mockResolvedValue(undefined);
    vi.mocked(rename).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should update index by default', async () => {
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      projects: [],
    }));

    await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    // Should read the index file
    expect(readTextFile).toHaveBeenCalledWith(
      'Orion/Projects/_index.yaml',
      expect.any(Object)
    );
  });

  it('should add entity ID to index array', async () => {
    let updatedIndexContent = '';
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      projects: [],
    }));
    vi.mocked(writeTextFile).mockImplementation(async (path, content) => {
      if (typeof path === 'string' && path.includes('_index')) {
        updatedIndexContent = content;
      }
    });

    await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(updatedIndexContent).toContain('proj_abc123456789');
  });

  it('should NOT add duplicate entries to index', async () => {
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      projects: [validProject], // Already in index
    }));

    let updatedIndexContent = '';
    vi.mocked(writeTextFile).mockImplementation(async (path, content) => {
      if (typeof path === 'string' && path.includes('_index')) {
        updatedIndexContent = content;
      }
    });

    await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    // Count occurrences of the ID
    const matches = updatedIndexContent.match(/proj_abc123456789/g) || [];
    expect(matches.length).toBeLessThanOrEqual(1);
  });

  it('should skip index update when updateIndex: false', async () => {
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      projects: [],
    }));

    const options: WriteOptions = { updateIndex: false };
    await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema,
      options
    );

    // Should NOT read the index file
    expect(readTextFile).not.toHaveBeenCalledWith(
      'Orion/Projects/_index.yaml',
      expect.any(Object)
    );
  });

  it('should update area index for area entities', async () => {
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      areas: [],
    }));

    await writeParaEntity(
      'Orion/Areas/test/_meta.yaml',
      validArea,
      AreaMetaSchema
    );

    expect(readTextFile).toHaveBeenCalledWith(
      'Orion/Areas/_index.yaml',
      expect.any(Object)
    );
  });

  it('should update contact index for contact entities', async () => {
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      contacts: [],
    }));

    await writeParaEntity(
      'Orion/Resources/contacts/john-doe.yaml',
      validContact,
      ContactCardSchema
    );

    expect(readTextFile).toHaveBeenCalledWith(
      'Orion/Resources/contacts/_index.yaml',
      expect.any(Object)
    );
  });
});

// =============================================================================
// Error Handling Tests
// =============================================================================

describe('writeParaEntity error handling (Story 4.13)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exists).mockResolvedValue(false);
    vi.mocked(writeTextFile).mockResolvedValue(undefined);
    vi.mocked(rename).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return VALIDATION_ERROR for invalid entity', async () => {
    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      invalidProject as unknown as ProjectMeta,
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should return WRITE_ERROR when writeTextFile fails', async () => {
    vi.mocked(writeTextFile).mockRejectedValue(new Error('Write failed'));
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      projects: [],
    }));

    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('WRITE_ERROR');
    }
  });

  it('should return RENAME_ERROR when rename fails', async () => {
    vi.mocked(rename).mockRejectedValue(new Error('Rename failed'));
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      projects: [],
    }));

    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('RENAME_ERROR');
    }
  });

  it('should return BACKUP_ERROR when copyFile fails', async () => {
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(copyFile).mockRejectedValue(new Error('Copy failed'));

    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('BACKUP_ERROR');
    }
  });

  it('should preserve original error in cause field', async () => {
    const originalError = new Error('Original write error');
    vi.mocked(writeTextFile).mockRejectedValue(originalError);
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      projects: [],
    }));

    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.cause).toBe(originalError);
    }
  });

  it('should return FS_ERROR for unexpected filesystem errors', async () => {
    vi.mocked(exists).mockRejectedValue(new Error('Unexpected FS error'));

    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('FS_ERROR');
    }
  });
});

// =============================================================================
// deleteParaEntity Tests
// =============================================================================

describe('deleteParaEntity (Story 4.13)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exists).mockResolvedValue(true);
    vi.mocked(remove).mockResolvedValue(undefined);
    vi.mocked(copyFile).mockResolvedValue(undefined);
    vi.mocked(writeTextFile).mockResolvedValue(undefined);
    vi.mocked(rename).mockResolvedValue(undefined);
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      projects: [validProject],
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return a Result type', async () => {
    const result = await deleteParaEntity('Orion/Projects/test/_meta.yaml');

    expect(typeof result.isOk).toBe('function');
    expect(typeof result.isErr).toBe('function');
  });

  it('should remove file from filesystem', async () => {
    await deleteParaEntity('Orion/Projects/test/_meta.yaml');

    expect(remove).toHaveBeenCalledWith(
      'Orion/Projects/test/_meta.yaml',
      expect.any(Object)
    );
  });

  it('should remove entity from index by default', async () => {
    let updatedIndexContent = '';
    vi.mocked(writeTextFile).mockImplementation(async (path, content) => {
      if (typeof path === 'string' && path.includes('_index')) {
        updatedIndexContent = content;
      }
    });

    await deleteParaEntity('Orion/Projects/test/_meta.yaml');

    // Project should be removed from index
    expect(updatedIndexContent).not.toContain('proj_abc123456789');
  });

  it('should create backup before delete by default', async () => {
    await deleteParaEntity('Orion/Projects/test/_meta.yaml');

    expect(copyFile).toHaveBeenCalledWith(
      'Orion/Projects/test/_meta.yaml',
      'Orion/Projects/test/_meta.yaml.bak',
      expect.any(Object)
    );
  });

  it('should return NOT_FOUND if file does not exist', async () => {
    vi.mocked(exists).mockResolvedValue(false);

    const result = await deleteParaEntity('Orion/Projects/nonexistent/_meta.yaml');

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('NOT_FOUND');
    }
  });

  it('should return DELETE_ERROR if remove fails', async () => {
    vi.mocked(remove).mockRejectedValue(new Error('Delete failed'));

    const result = await deleteParaEntity('Orion/Projects/test/_meta.yaml');

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe('DELETE_ERROR');
    }
  });

  it('should skip index update when removeFromIndex: false', async () => {
    await deleteParaEntity('Orion/Projects/test/_meta.yaml', {
      removeFromIndex: false,
    });

    // Should NOT read or write index
    expect(readTextFile).not.toHaveBeenCalledWith(
      'Orion/Projects/_index.yaml',
      expect.any(Object)
    );
  });

  it('should skip backup when createBackup: false', async () => {
    await deleteParaEntity('Orion/Projects/test/_meta.yaml', {
      createBackup: false,
    });

    expect(copyFile).not.toHaveBeenCalled();
  });

  it('should preserve original error in cause field', async () => {
    const originalError = new Error('Original delete error');
    vi.mocked(remove).mockRejectedValue(originalError);

    const result = await deleteParaEntity('Orion/Projects/test/_meta.yaml');

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.cause).toBe(originalError);
    }
  });
});

// =============================================================================
// WriteOptions Type Tests
// =============================================================================

describe('WriteOptions type (Story 4.13)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exists).mockResolvedValue(false);
    vi.mocked(writeTextFile).mockResolvedValue(undefined);
    vi.mocked(rename).mockResolvedValue(undefined);
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      projects: [],
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should accept empty options object', async () => {
    const options: WriteOptions = {};
    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema,
      options
    );

    expect(result.isOk()).toBe(true);
  });

  it('should accept all boolean options', async () => {
    const options: WriteOptions = {
      validate: true,
      updateIndex: true,
      createBackup: true,
    };
    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema,
      options
    );

    expect(result.isOk()).toBe(true);
  });

  it('should work without options parameter', async () => {
    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(result.isOk()).toBe(true);
  });
});

// =============================================================================
// ParaWriteError Type Tests
// =============================================================================

describe('ParaWriteError type (Story 4.13)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should have code property with valid error codes', async () => {
    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      invalidProject as unknown as ProjectMeta,
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error: ParaWriteError = result.error;
      const validCodes = [
        'VALIDATION_ERROR',
        'WRITE_ERROR',
        'RENAME_ERROR',
        'BACKUP_ERROR',
        'NOT_PARA_PATH',
        'FS_ERROR',
        'NOT_FOUND',
        'DELETE_ERROR',
      ];
      expect(validCodes).toContain(error.code);
    }
  });

  it('should have message property as string', async () => {
    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      invalidProject as unknown as ProjectMeta,
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error: ParaWriteError = result.error;
      expect(typeof error.message).toBe('string');
      expect(error.message.length).toBeGreaterThan(0);
    }
  });

  it('should have optional cause property', async () => {
    vi.mocked(exists).mockRejectedValue(new Error('Test error'));

    const result = await writeParaEntity(
      'Orion/Projects/test/_meta.yaml',
      validProject,
      ProjectMetaSchema
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error: ParaWriteError = result.error;
      expect(error).toHaveProperty('cause');
    }
  });
});

// =============================================================================
// Edge Cases Tests
// =============================================================================

describe('writeParaEntity edge cases (Story 4.13)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exists).mockResolvedValue(false);
    vi.mocked(writeTextFile).mockResolvedValue(undefined);
    vi.mocked(rename).mockResolvedValue(undefined);
    vi.mocked(readTextFile).mockResolvedValue(stringify({
      version: 1,
      updated_at: '2026-01-28T00:00:00Z',
      projects: [],
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should handle paths with special characters', async () => {
    const specialPath = 'Orion/Projects/test-project (2026)/_meta.yaml';

    const result = await writeParaEntity(
      specialPath,
      validProject,
      ProjectMetaSchema
    );

    expect(result.isOk()).toBe(true);
  });

  it('should handle very long file paths', async () => {
    const longPath = 'Orion/' + 'deeply/nested/'.repeat(10) + '_meta.yaml';

    const result = await writeParaEntity(
      longPath,
      validProject,
      ProjectMetaSchema
    );

    // Should at least attempt the write
    expect(writeTextFile).toHaveBeenCalled();
  });

  it('should handle entity with optional fields omitted', async () => {
    const minimalProject: ProjectMeta = {
      id: 'proj_minimal123456',
      name: 'Minimal Project',
      status: 'active',
      priority: 'medium',
      created_at: '2026-01-28T00:00:00Z',
      updated_at: '2026-01-28T00:00:00Z',
      // No optional fields
    };

    const result = await writeParaEntity(
      'Orion/Projects/minimal/_meta.yaml',
      minimalProject,
      ProjectMetaSchema
    );

    expect(result.isOk()).toBe(true);
  });

  it('should handle entity with all optional fields populated', async () => {
    const fullProject: ProjectMeta = {
      id: 'proj_full1234567890',
      name: 'Full Project',
      description: 'A project with all fields',
      status: 'active',
      priority: 'high',
      area: 'area_xyz987654321',
      deadline: '2026-12-31T23:59:59Z',
      created_at: '2026-01-28T00:00:00Z',
      updated_at: '2026-01-28T00:00:00Z',
      stakeholders: [{ name: 'Alice', role: 'Owner' }],
      tags: ['full', 'complete'],
    };

    const result = await writeParaEntity(
      'Orion/Projects/full/_meta.yaml',
      fullProject,
      ProjectMetaSchema
    );

    expect(result.isOk()).toBe(true);
  });
});
