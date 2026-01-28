/**
 * Tests for Archive Zod Schema
 * Story 4.5: Create Archive Directory
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect } from 'vitest';

// Import schemas - will fail until implemented
import {
  ArchivedItemSchema,
  ArchiveStatsSchema,
  ArchiveIndexSchema,
  type ArchivedItem,
  type ArchiveStats,
  type ArchiveIndex,
} from '@/lib/para/schemas/archive';

describe('ArchivedItemSchema (Story 4.5)', () => {
  const validArchivedItem = {
    id: 'proj_abc123456789',
    type: 'project',
    original_path: 'Projects/my-project',
    archived_at: '2026-01-27T00:00:00Z',
    reason: 'completed',
  };

  describe('id validation', () => {
    it('should accept project id starting with proj_', () => {
      const result = ArchivedItemSchema.safeParse(validArchivedItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('proj_abc123456789');
      }
    });

    it('should accept area id starting with area_', () => {
      const result = ArchivedItemSchema.safeParse({
        ...validArchivedItem,
        id: 'area_abc123456789',
        type: 'area',
        original_path: 'Areas/my-area',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('area_abc123456789');
      }
    });

    it('should reject empty id', () => {
      const result = ArchivedItemSchema.safeParse({
        ...validArchivedItem,
        id: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('type validation', () => {
    it('should accept "project" type', () => {
      const result = ArchivedItemSchema.safeParse(validArchivedItem);
      expect(result.success).toBe(true);
    });

    it('should accept "area" type', () => {
      const result = ArchivedItemSchema.safeParse({
        ...validArchivedItem,
        id: 'area_abc123456789',
        type: 'area',
        original_path: 'Areas/my-area',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid type', () => {
      const result = ArchivedItemSchema.safeParse({
        ...validArchivedItem,
        type: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('original_path validation', () => {
    it('should accept non-empty original_path', () => {
      const result = ArchivedItemSchema.safeParse(validArchivedItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.original_path).toBe('Projects/my-project');
      }
    });

    it('should reject empty original_path', () => {
      const result = ArchivedItemSchema.safeParse({
        ...validArchivedItem,
        original_path: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('archived_at validation', () => {
    it('should accept valid ISO datetime', () => {
      const result = ArchivedItemSchema.safeParse(validArchivedItem);
      expect(result.success).toBe(true);
    });

    it('should accept datetime with timezone offset', () => {
      const result = ArchivedItemSchema.safeParse({
        ...validArchivedItem,
        archived_at: '2026-01-27T12:00:00+05:30',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid datetime format', () => {
      const result = ArchivedItemSchema.safeParse({
        ...validArchivedItem,
        archived_at: 'not-a-date',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('reason validation', () => {
    it('should accept "completed" reason', () => {
      const result = ArchivedItemSchema.safeParse(validArchivedItem);
      expect(result.success).toBe(true);
    });

    it('should accept "cancelled" reason', () => {
      const result = ArchivedItemSchema.safeParse({
        ...validArchivedItem,
        reason: 'cancelled',
      });
      expect(result.success).toBe(true);
    });

    it('should accept "inactive" reason', () => {
      const result = ArchivedItemSchema.safeParse({
        ...validArchivedItem,
        reason: 'inactive',
      });
      expect(result.success).toBe(true);
    });

    it('should accept "manual" reason', () => {
      const result = ArchivedItemSchema.safeParse({
        ...validArchivedItem,
        reason: 'manual',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid reason', () => {
      const result = ArchivedItemSchema.safeParse({
        ...validArchivedItem,
        reason: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('should accept optional title', () => {
      const result = ArchivedItemSchema.safeParse({
        ...validArchivedItem,
        title: 'My Archived Project',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('My Archived Project');
      }
    });

    it('should accept optional notes', () => {
      const result = ArchivedItemSchema.safeParse({
        ...validArchivedItem,
        notes: 'Archived because the project was completed successfully.',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBe(
          'Archived because the project was completed successfully.'
        );
      }
    });
  });
});

describe('ArchiveStatsSchema (Story 4.5)', () => {
  it('should accept valid stats', () => {
    const stats = {
      total: 5,
      projects: 3,
      areas: 2,
    };
    const result = ArchiveStatsSchema.safeParse(stats);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.total).toBe(5);
      expect(result.data.projects).toBe(3);
      expect(result.data.areas).toBe(2);
    }
  });

  it('should accept zero stats', () => {
    const stats = {
      total: 0,
      projects: 0,
      areas: 0,
    };
    const result = ArchiveStatsSchema.safeParse(stats);
    expect(result.success).toBe(true);
  });

  it('should reject negative total', () => {
    const stats = {
      total: -1,
      projects: 0,
      areas: 0,
    };
    const result = ArchiveStatsSchema.safeParse(stats);
    expect(result.success).toBe(false);
  });

  it('should reject negative projects count', () => {
    const stats = {
      total: 0,
      projects: -1,
      areas: 0,
    };
    const result = ArchiveStatsSchema.safeParse(stats);
    expect(result.success).toBe(false);
  });

  it('should reject negative areas count', () => {
    const stats = {
      total: 0,
      projects: 0,
      areas: -1,
    };
    const result = ArchiveStatsSchema.safeParse(stats);
    expect(result.success).toBe(false);
  });
});

describe('ArchiveIndexSchema (Story 4.5)', () => {
  const validIndex = {
    version: 1,
    generated_at: '2026-01-27T00:00:00Z',
    archived_items: [],
    stats: {
      total: 0,
      projects: 0,
      areas: 0,
    },
  };

  it('should accept valid empty archive index', () => {
    const result = ArchiveIndexSchema.safeParse(validIndex);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.version).toBe(1);
      expect(result.data.archived_items).toHaveLength(0);
      expect(result.data.stats.total).toBe(0);
    }
  });

  it('should accept archive index with items', () => {
    const indexWithItems = {
      ...validIndex,
      archived_items: [
        {
          id: 'proj_abc123456789',
          type: 'project',
          original_path: 'Projects/my-project',
          archived_at: '2026-01-27T00:00:00Z',
          reason: 'completed',
        },
      ],
      stats: {
        total: 1,
        projects: 1,
        areas: 0,
      },
    };
    const result = ArchiveIndexSchema.safeParse(indexWithItems);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.archived_items).toHaveLength(1);
      expect(result.data.stats.total).toBe(1);
    }
  });

  it('should reject missing version', () => {
    const { version, ...withoutVersion } = validIndex;
    const result = ArchiveIndexSchema.safeParse(withoutVersion);
    expect(result.success).toBe(false);
  });

  it('should reject missing generated_at', () => {
    const { generated_at, ...withoutGeneratedAt } = validIndex;
    const result = ArchiveIndexSchema.safeParse(withoutGeneratedAt);
    expect(result.success).toBe(false);
  });

  it('should reject missing archived_items', () => {
    const { archived_items, ...withoutItems } = validIndex;
    const result = ArchiveIndexSchema.safeParse(withoutItems);
    expect(result.success).toBe(false);
  });

  it('should reject missing stats', () => {
    const { stats, ...withoutStats } = validIndex;
    const result = ArchiveIndexSchema.safeParse(withoutStats);
    expect(result.success).toBe(false);
  });

  it('should reject invalid archived_item in array', () => {
    const indexWithInvalidItem = {
      ...validIndex,
      archived_items: [{ invalid: 'item' }],
    };
    const result = ArchiveIndexSchema.safeParse(indexWithInvalidItem);
    expect(result.success).toBe(false);
  });

  it('should reject invalid generated_at format', () => {
    const result = ArchiveIndexSchema.safeParse({
      ...validIndex,
      generated_at: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });
});

describe('Type exports (Story 4.5)', () => {
  it('should export ArchivedItem type', () => {
    const item: ArchivedItem = {
      id: 'proj_test12345',
      type: 'project',
      original_path: 'Projects/test',
      archived_at: '2026-01-27T00:00:00Z',
      reason: 'completed',
    };
    expect(item.type).toBe('project');
  });

  it('should export ArchiveStats type', () => {
    const stats: ArchiveStats = {
      total: 0,
      projects: 0,
      areas: 0,
    };
    expect(stats.total).toBe(0);
  });

  it('should export ArchiveIndex type', () => {
    const index: ArchiveIndex = {
      version: 1,
      generated_at: '2026-01-27T00:00:00Z',
      archived_items: [],
      stats: {
        total: 0,
        projects: 0,
        areas: 0,
      },
    };
    expect(index.version).toBe(1);
  });
});
