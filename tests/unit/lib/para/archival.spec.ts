/**
 * Tests for Archive Completed Items
 * Epic 4 Plan 4, Story 4.17: Archive Completed Items
 *
 * TDD Phase: RED - Write failing tests first
 *
 * Tests archival logic for moving completed projects and dormant areas
 * to the Archive directory with proper index management.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Import the archival functions - will fail until implemented
import {
  archiveProject,
  archiveArea,
  canArchiveProject,
  canArchiveArea,
} from '@/lib/para/archival';
import type { ArchiveResult, ArchiveError } from '@/lib/para/archival';

// Import test fixtures (using relative paths)
import {
  createCompletedProject,
  createActiveProject,
  createPausedProject,
  createCancelledProject,
  createDormantArea,
  createActiveArea,
  createArchiveIndex,
  TEST_TIMESTAMPS,
} from '../../../fixtures/para';
import type { ProjectMeta } from '@/lib/para/schemas/project';
import type { AreaMeta } from '@/lib/para/schemas/area';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock Tauri FS plugin
vi.mock('@tauri-apps/plugin-fs', () => ({
  exists: vi.fn().mockResolvedValue(true),
  mkdir: vi.fn().mockResolvedValue(undefined),
  rename: vi.fn().mockResolvedValue(undefined),
  readTextFile: vi.fn().mockResolvedValue(''),
  writeTextFile: vi.fn().mockResolvedValue(undefined),
  readDir: vi.fn().mockResolvedValue([]),
}));

// Mock Tauri path API
vi.mock('@tauri-apps/api/path', () => ({
  homeDir: vi.fn().mockResolvedValue('/Users/testuser'),
  join: vi.fn((...parts: string[]) => parts.join('/')),
  BaseDirectory: { Home: 1 },
}));

// Import mocks after vi.mock() calls
import * as fs from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';

describe('Story 4.17: Archive Completed Items', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock responses
    vi.mocked(fs.exists).mockResolvedValue(true);
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.rename).mockResolvedValue(undefined);
    vi.mocked(fs.readTextFile).mockResolvedValue(
      JSON.stringify(createArchiveIndex())
    );
    vi.mocked(fs.writeTextFile).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ===========================================================================
  // Project Archival Tests
  // ===========================================================================
  describe('archiveProject', () => {
    it('should archive completed project to archive/projects/YYYY-MM/', async () => {
      const project = createCompletedProject({
        id: 'proj_test123456789',
        name: 'Test Project',
        updated_at: '2026-01-15T12:00:00Z',
      });

      const result = await archiveProject(project, 'Projects/test-project');

      expect(result.archived_to).toMatch(/Archive\/projects\/2026-01\/test-project/);
      expect(result.original_path).toBe('Projects/test-project');
      expect(result.archived_at).toBeDefined();
    });

    it('should use updated_at month for archive path', async () => {
      const project = createCompletedProject({
        updated_at: '2026-03-20T16:30:00Z',
        name: 'March Project',
      });

      const result = await archiveProject(project, 'Projects/march-project');

      expect(result.archived_to).toContain('2026-03');
    });

    it('should create YYYY-MM directory if not exists', async () => {
      vi.mocked(fs.exists).mockResolvedValueOnce(false); // Archive dir doesn't exist

      const project = createCompletedProject({
        updated_at: '2026-02-10T08:00:00Z',
        name: 'February Project',
      });

      await archiveProject(project, 'Projects/february-project');

      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('2026-02'),
        expect.objectContaining({ recursive: true })
      );
    });

    it('should move entire project directory', async () => {
      const project = createCompletedProject({
        name: 'Full Project',
        updated_at: '2026-01-15T12:00:00Z',
      });

      await archiveProject(project, 'Projects/full-project');

      expect(fs.rename).toHaveBeenCalledWith(
        expect.stringContaining('Projects/full-project'),
        expect.stringContaining('Archive/projects/2026-01/full-project')
      );
    });

    it('should update archive index with new entry', async () => {
      const existingIndex = createArchiveIndex({
        archived_items: [],
        stats: { total: 0, projects: 0, areas: 0 },
      });
      vi.mocked(fs.readTextFile).mockResolvedValue(JSON.stringify(existingIndex));

      const project = createCompletedProject({
        id: 'proj_newproject123',
        name: 'New Project',
      });

      await archiveProject(project, 'Projects/new-project');

      expect(fs.writeTextFile).toHaveBeenCalledWith(
        expect.stringContaining('_index.yaml'),
        expect.stringContaining('proj_newproject123'),
        expect.any(Object)
      );
    });

    it('should return ArchiveResult with all required fields', async () => {
      const project = createCompletedProject({
        name: 'Result Test Project',
        updated_at: '2026-01-15T12:00:00Z',
      });

      const result = await archiveProject(project, 'Projects/result-test');

      expect(result).toMatchObject({
        archived_to: expect.stringContaining('Archive/projects'),
        archived_at: expect.any(String),
        original_path: 'Projects/result-test',
      });

      // Verify archived_at is valid ISO timestamp
      expect(() => new Date(result.archived_at)).not.toThrow();
    });
  });

  // ===========================================================================
  // Area Archival Tests
  // ===========================================================================
  describe('archiveArea', () => {
    it('should archive dormant area to archive/areas/YYYY-MM/', async () => {
      const area = createDormantArea({
        id: 'area_test987654321',
        name: 'Old Hobby',
        updated_at: '2026-02-10T08:00:00Z',
      });

      const result = await archiveArea(area, 'Areas/old-hobby');

      expect(result.archived_to).toMatch(/Archive\/areas\/2026-02\/old-hobby/);
      expect(result.original_path).toBe('Areas/old-hobby');
    });

    it('should use updated_at month for archive path', async () => {
      const area = createDormantArea({
        updated_at: '2026-06-15T10:00:00Z',
        name: 'June Area',
      });

      const result = await archiveArea(area, 'Areas/june-area');

      expect(result.archived_to).toContain('2026-06');
    });

    it('should update archive index with area type', async () => {
      const existingIndex = createArchiveIndex();
      vi.mocked(fs.readTextFile).mockResolvedValue(JSON.stringify(existingIndex));

      const area = createDormantArea({
        id: 'area_archived123',
        name: 'Archived Area',
      });

      await archiveArea(area, 'Areas/archived-area');

      expect(fs.writeTextFile).toHaveBeenCalledWith(
        expect.stringContaining('_index.yaml'),
        expect.stringMatching(/type.*area/),
        expect.any(Object)
      );
    });
  });

  // ===========================================================================
  // Archival Precondition Tests
  // ===========================================================================
  describe('archival preconditions', () => {
    it('should reject archiving active project', async () => {
      const project = createActiveProject({
        name: 'Active Project',
      });

      await expect(
        archiveProject(project, 'Projects/active-project')
      ).rejects.toMatchObject({
        code: 'NOT_ARCHIVABLE',
        message: expect.stringContaining('not completed'),
      });
    });

    it('should reject archiving paused project', async () => {
      const project = createPausedProject({
        name: 'Paused Project',
      });

      await expect(
        archiveProject(project, 'Projects/paused-project')
      ).rejects.toMatchObject({
        code: 'NOT_ARCHIVABLE',
      });
    });

    it('should reject archiving cancelled project', async () => {
      const project = createCancelledProject({
        name: 'Cancelled Project',
      });

      await expect(
        archiveProject(project, 'Projects/cancelled-project')
      ).rejects.toMatchObject({
        code: 'NOT_ARCHIVABLE',
      });
    });

    it('should reject archiving active area', async () => {
      const area = createActiveArea({
        name: 'Active Area',
      });

      await expect(
        archiveArea(area, 'Areas/active-area')
      ).rejects.toMatchObject({
        code: 'NOT_ARCHIVABLE',
        message: expect.stringContaining('not dormant'),
      });
    });

    it('should reject non-existent project', async () => {
      vi.mocked(fs.exists).mockResolvedValue(false);

      const project = createCompletedProject({
        name: 'Missing Project',
      });

      await expect(
        archiveProject(project, 'Projects/missing-project')
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('should reject already archived item', async () => {
      const project = createCompletedProject({
        name: 'Already Archived',
      });

      await expect(
        archiveProject(project, 'Archive/projects/2026-01/already-archived')
      ).rejects.toMatchObject({
        code: 'ALREADY_ARCHIVED',
      });
    });
  });

  // ===========================================================================
  // Precondition Check Functions
  // ===========================================================================
  describe('canArchiveProject', () => {
    it('should return true for completed project', () => {
      const project = createCompletedProject();
      expect(canArchiveProject(project)).toBe(true);
    });

    it('should return false for active project', () => {
      const project = createActiveProject();
      expect(canArchiveProject(project)).toBe(false);
    });

    it('should return false for paused project', () => {
      const project = createPausedProject();
      expect(canArchiveProject(project)).toBe(false);
    });

    it('should return false for cancelled project', () => {
      const project = createCancelledProject();
      expect(canArchiveProject(project)).toBe(false);
    });
  });

  describe('canArchiveArea', () => {
    it('should return true for dormant area', () => {
      const area = createDormantArea();
      expect(canArchiveArea(area)).toBe(true);
    });

    it('should return false for active area', () => {
      const area = createActiveArea();
      expect(canArchiveArea(area)).toBe(false);
    });
  });

  // ===========================================================================
  // Archive Index Update Tests
  // ===========================================================================
  describe('archive index management', () => {
    it('should add entry to archived_items array', async () => {
      const existingIndex = createArchiveIndex({
        archived_items: [],
        stats: { total: 0, projects: 0, areas: 0 },
      });
      vi.mocked(fs.readTextFile).mockResolvedValue(JSON.stringify(existingIndex));

      const project = createCompletedProject({
        id: 'proj_indextest123',
        name: 'Index Test',
      });

      await archiveProject(project, 'Projects/index-test');

      const writeCall = vi.mocked(fs.writeTextFile).mock.calls[0];
      const writtenContent = writeCall[1] as string;
      expect(writtenContent).toContain('proj_indextest123');
    });

    it('should include all required fields in index entry', async () => {
      const existingIndex = createArchiveIndex();
      vi.mocked(fs.readTextFile).mockResolvedValue(JSON.stringify(existingIndex));

      const project = createCompletedProject({
        id: 'proj_fullfields123',
        name: 'Full Fields Test',
      });

      await archiveProject(project, 'Projects/full-fields-test');

      const writeCall = vi.mocked(fs.writeTextFile).mock.calls[0];
      const writtenContent = writeCall[1] as string;

      expect(writtenContent).toContain('id');
      expect(writtenContent).toContain('type');
      expect(writtenContent).toContain('original_path');
      expect(writtenContent).toContain('archived_at');
      expect(writtenContent).toContain('archived_to');
    });

    it('should set reason to "completed" for projects', async () => {
      const existingIndex = createArchiveIndex();
      vi.mocked(fs.readTextFile).mockResolvedValue(JSON.stringify(existingIndex));

      const project = createCompletedProject();
      await archiveProject(project, 'Projects/completed-test');

      const writeCall = vi.mocked(fs.writeTextFile).mock.calls[0];
      const writtenContent = writeCall[1] as string;
      expect(writtenContent).toContain('completed');
    });

    it('should set reason to "inactive" for dormant areas', async () => {
      const existingIndex = createArchiveIndex();
      vi.mocked(fs.readTextFile).mockResolvedValue(JSON.stringify(existingIndex));

      const area = createDormantArea();
      await archiveArea(area, 'Areas/dormant-test');

      const writeCall = vi.mocked(fs.writeTextFile).mock.calls[0];
      const writtenContent = writeCall[1] as string;
      expect(writtenContent).toContain('inactive');
    });

    it('should update stats.total', async () => {
      const existingIndex = createArchiveIndex({
        stats: { total: 5, projects: 3, areas: 2 },
      });
      vi.mocked(fs.readTextFile).mockResolvedValue(JSON.stringify(existingIndex));

      const project = createCompletedProject();
      await archiveProject(project, 'Projects/stats-test');

      const writeCall = vi.mocked(fs.writeTextFile).mock.calls[0];
      const writtenContent = writeCall[1] as string;
      // Total should now be 6
      expect(writtenContent).toMatch(/total.*6/);
    });

    it('should update stats.projects for projects', async () => {
      const existingIndex = createArchiveIndex({
        stats: { total: 5, projects: 3, areas: 2 },
      });
      vi.mocked(fs.readTextFile).mockResolvedValue(JSON.stringify(existingIndex));

      const project = createCompletedProject();
      await archiveProject(project, 'Projects/project-stats-test');

      const writeCall = vi.mocked(fs.writeTextFile).mock.calls[0];
      const writtenContent = writeCall[1] as string;
      // Projects should now be 4
      expect(writtenContent).toMatch(/projects.*4/);
    });

    it('should update stats.areas for areas', async () => {
      const existingIndex = createArchiveIndex({
        stats: { total: 5, projects: 3, areas: 2 },
      });
      vi.mocked(fs.readTextFile).mockResolvedValue(JSON.stringify(existingIndex));

      const area = createDormantArea();
      await archiveArea(area, 'Areas/area-stats-test');

      const writeCall = vi.mocked(fs.writeTextFile).mock.calls[0];
      const writtenContent = writeCall[1] as string;
      // Areas should now be 3
      expect(writtenContent).toMatch(/areas.*3/);
    });

    it('should update generated_at timestamp', async () => {
      const oldTimestamp = '2025-01-01T00:00:00Z';
      const existingIndex = createArchiveIndex({
        generated_at: oldTimestamp,
      });
      vi.mocked(fs.readTextFile).mockResolvedValue(JSON.stringify(existingIndex));

      const project = createCompletedProject();
      await archiveProject(project, 'Projects/timestamp-test');

      const writeCall = vi.mocked(fs.writeTextFile).mock.calls[0];
      const writtenContent = writeCall[1] as string;
      // Should have a new timestamp, not the old one
      expect(writtenContent).not.toContain(oldTimestamp);
      expect(writtenContent).toContain('2026'); // Current year
    });
  });

  // ===========================================================================
  // Filesystem Operation Tests
  // ===========================================================================
  describe('archival filesystem operations', () => {
    it('should call rename to move directory', async () => {
      const project = createCompletedProject({
        name: 'Move Test',
        updated_at: '2026-01-15T12:00:00Z',
      });

      await archiveProject(project, 'Projects/move-test');

      expect(fs.rename).toHaveBeenCalled();
    });

    it('should create archive subdirectory first', async () => {
      vi.mocked(fs.exists).mockResolvedValueOnce(false); // Dir doesn't exist

      const project = createCompletedProject({
        updated_at: '2026-04-01T00:00:00Z',
      });

      await archiveProject(project, 'Projects/subdir-test');

      // mkdir should be called before rename
      const mkdirCallOrder = vi.mocked(fs.mkdir).mock.invocationCallOrder[0];
      const renameCallOrder = vi.mocked(fs.rename).mock.invocationCallOrder[0];
      expect(mkdirCallOrder).toBeLessThan(renameCallOrder);
    });

    it('should handle directory already exists', async () => {
      vi.mocked(fs.exists).mockResolvedValue(true); // Dir exists

      const project = createCompletedProject();

      // Should not throw even if directory exists
      await expect(
        archiveProject(project, 'Projects/existing-dir-test')
      ).resolves.toBeDefined();
    });

    it('should use atomic move (rename, not copy+delete)', async () => {
      const project = createCompletedProject();

      await archiveProject(project, 'Projects/atomic-test');

      // Should use rename (atomic)
      expect(fs.rename).toHaveBeenCalled();
      // Should NOT use copy operations
      expect(fs.readDir).not.toHaveBeenCalled(); // No recursive copy
    });

    it('should clean up on partial failure', async () => {
      // Simulate index write failure after successful move
      vi.mocked(fs.rename).mockResolvedValue(undefined);
      vi.mocked(fs.writeTextFile).mockRejectedValue(new Error('Write failed'));

      const project = createCompletedProject();

      await expect(
        archiveProject(project, 'Projects/cleanup-test')
      ).rejects.toBeDefined();

      // Should have attempted to restore (rename back)
      // This tests rollback behavior
      expect(fs.rename).toHaveBeenCalledTimes(2); // Initial + rollback
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================
  describe('archival edge cases', () => {
    it('should handle year boundary (Dec -> Jan)', async () => {
      const project = createCompletedProject({
        updated_at: '2025-12-31T23:59:59Z',
        name: 'December Project',
      });

      const result = await archiveProject(project, 'Projects/december-project');

      expect(result.archived_to).toContain('2025-12');
    });

    it('should handle project name with special characters', async () => {
      const project = createCompletedProject({
        name: 'my-project (v2.0)',
        updated_at: '2026-01-15T12:00:00Z',
      });

      const result = await archiveProject(project, 'Projects/my-project (v2.0)');

      // Should preserve the name
      expect(result.archived_to).toContain('my-project (v2.0)');
    });

    it('should handle very old updated_at', async () => {
      const project = createCompletedProject({
        updated_at: '2020-01-01T00:00:00Z',
        name: 'Old Project',
      });

      const result = await archiveProject(project, 'Projects/old-project');

      expect(result.archived_to).toContain('2020-01');
    });

    it('should handle concurrent archive attempts', async () => {
      // First call succeeds
      vi.mocked(fs.exists)
        .mockResolvedValueOnce(true) // Project exists
        .mockResolvedValueOnce(false) // Archive dir doesn't exist
        .mockResolvedValueOnce(true) // Project exists (second call)
        .mockResolvedValueOnce(true); // But now it's already in archive

      const project = createCompletedProject({
        name: 'Concurrent Project',
      });

      // Start two concurrent archives
      const promise1 = archiveProject(project, 'Projects/concurrent-project');

      // Second call should fail with ALREADY_ARCHIVED
      vi.mocked(fs.rename).mockRejectedValueOnce(new Error('ENOENT'));

      const promise2 = archiveProject(project, 'Projects/concurrent-project');

      // One should succeed, one should fail
      const results = await Promise.allSettled([promise1, promise2]);
      const succeeded = results.filter((r) => r.status === 'fulfilled');
      const failed = results.filter((r) => r.status === 'rejected');

      expect(succeeded.length + failed.length).toBe(2);
    });

    it('should handle project with unicode name', async () => {
      const project = createCompletedProject({
        name: 'Project',
        updated_at: '2026-01-15T12:00:00Z',
      });

      const result = await archiveProject(project, 'Projects/project');

      expect(result).toBeDefined();
      expect(result.archived_to).toBeDefined();
    });
  });
});
