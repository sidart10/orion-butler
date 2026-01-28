/**
 * Tests for Area Zod Schema
 * Story 4.1c: Initialize PARA Database Schema + Zod Schemas
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect } from 'vitest';

// Import schemas - will fail until implemented
import {
  GoalSchema,
  AreaMetaSchema,
  AreaIndexSchema,
  type Goal,
  type AreaMeta,
  type AreaIndex,
} from '@/lib/para/schemas/area';

describe('GoalSchema (Story 4.1c)', () => {
  it('should accept valid goal object', () => {
    const goal = {
      description: 'Increase test coverage to 80%',
      target_date: '2026-03-01T00:00:00Z',
      status: 'in_progress',
    };
    const result = GoalSchema.safeParse(goal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('Increase test coverage to 80%');
    }
  });

  it('should accept goal without optional target_date', () => {
    const goal = {
      description: 'Maintain code quality',
      status: 'ongoing',
    };
    const result = GoalSchema.safeParse(goal);
    expect(result.success).toBe(true);
  });

  it('should reject goal without description', () => {
    const goal = {
      status: 'completed',
    };
    const result = GoalSchema.safeParse(goal);
    expect(result.success).toBe(false);
  });

  it('should reject goal without status', () => {
    const goal = {
      description: 'Some goal',
    };
    const result = GoalSchema.safeParse(goal);
    expect(result.success).toBe(false);
  });
});

describe('AreaMetaSchema (Story 4.1c)', () => {
  const validArea = {
    id: 'area_abc123456789',
    name: 'Test Area',
    status: 'active',
    created_at: '2026-01-27T00:00:00Z',
    updated_at: '2026-01-27T00:00:00Z',
  };

  describe('id validation', () => {
    it('should accept id starting with area_', () => {
      const result = AreaMetaSchema.safeParse(validArea);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('area_abc123456789');
      }
    });

    it('should reject id not starting with area_', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        id: 'proj_abc123456789',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty id', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        id: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('name validation', () => {
    it('should accept non-empty name', () => {
      const result = AreaMetaSchema.safeParse(validArea);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Area');
      }
    });

    it('should reject empty name', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        name: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing name', () => {
      const { name, ...withoutName } = validArea;
      const result = AreaMetaSchema.safeParse(withoutName);
      expect(result.success).toBe(false);
    });
  });

  describe('status validation', () => {
    it('should accept "active" status', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        status: 'active',
      });
      expect(result.success).toBe(true);
    });

    it('should accept "dormant" status', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        status: 'dormant',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid status like "paused"', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        status: 'paused',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid status like "completed"', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        status: 'completed',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('review cadence validation', () => {
    it('should accept "daily" review cadence', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        review: 'daily',
      });
      expect(result.success).toBe(true);
    });

    it('should accept "weekly" review cadence', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        review: 'weekly',
      });
      expect(result.success).toBe(true);
    });

    it('should accept "monthly" review cadence', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        review: 'monthly',
      });
      expect(result.success).toBe(true);
    });

    it('should accept "quarterly" review cadence', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        review: 'quarterly',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid review cadence', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        review: 'yearly',
      });
      expect(result.success).toBe(false);
    });

    it('should accept missing review (optional)', () => {
      const result = AreaMetaSchema.safeParse(validArea);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.review).toBeUndefined();
      }
    });
  });

  describe('optional fields', () => {
    it('should accept optional description', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        description: 'An area description',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe('An area description');
      }
    });

    it('should accept optional responsibilities array', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        responsibilities: ['Code reviews', 'Documentation', 'Mentoring'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.responsibilities).toHaveLength(3);
      }
    });

    it('should accept optional goals array', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        goals: [
          { description: 'Goal 1', status: 'in_progress' },
          { description: 'Goal 2', status: 'completed' },
        ],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.goals).toHaveLength(2);
      }
    });

    it('should accept optional tags array', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        tags: ['personal', 'growth'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual(['personal', 'growth']);
      }
    });
  });

  describe('timestamp validation', () => {
    it('should accept valid ISO datetime for created_at', () => {
      const result = AreaMetaSchema.safeParse(validArea);
      expect(result.success).toBe(true);
    });

    it('should accept datetime with timezone offset', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        created_at: '2026-01-27T12:00:00+05:30',
        updated_at: '2026-01-27T12:00:00+05:30',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid datetime format', () => {
      const result = AreaMetaSchema.safeParse({
        ...validArea,
        created_at: 'not-a-date',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing created_at', () => {
      const { created_at, ...withoutCreatedAt } = validArea;
      const result = AreaMetaSchema.safeParse(withoutCreatedAt);
      expect(result.success).toBe(false);
    });

    it('should reject missing updated_at', () => {
      const { updated_at, ...withoutUpdatedAt } = validArea;
      const result = AreaMetaSchema.safeParse(withoutUpdatedAt);
      expect(result.success).toBe(false);
    });
  });

  describe('full area validation', () => {
    it('should accept complete valid area', () => {
      const fullArea = {
        id: 'area_abc123456789',
        name: 'Complete Area',
        description: 'A fully specified area',
        status: 'active',
        responsibilities: ['Task 1', 'Task 2'],
        goals: [{ description: 'Goal 1', status: 'ongoing' }],
        review: 'weekly',
        created_at: '2026-01-27T00:00:00Z',
        updated_at: '2026-01-27T00:00:00Z',
        tags: ['important'],
      };
      const result = AreaMetaSchema.safeParse(fullArea);
      expect(result.success).toBe(true);
    });
  });
});

describe('AreaIndexSchema (Story 4.1c)', () => {
  it('should accept valid area index with areas array', () => {
    const index = {
      version: 1,
      updated_at: '2026-01-27T00:00:00Z',
      areas: [
        {
          id: 'area_abc123456789',
          name: 'Area 1',
          status: 'active',
          created_at: '2026-01-27T00:00:00Z',
          updated_at: '2026-01-27T00:00:00Z',
        },
      ],
    };
    const result = AreaIndexSchema.safeParse(index);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.areas).toHaveLength(1);
    }
  });

  it('should accept empty areas array', () => {
    const index = {
      version: 1,
      updated_at: '2026-01-27T00:00:00Z',
      areas: [],
    };
    const result = AreaIndexSchema.safeParse(index);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.areas).toHaveLength(0);
    }
  });

  it('should reject missing version', () => {
    const index = {
      updated_at: '2026-01-27T00:00:00Z',
      areas: [],
    };
    const result = AreaIndexSchema.safeParse(index);
    expect(result.success).toBe(false);
  });

  it('should reject missing updated_at', () => {
    const index = {
      version: 1,
      areas: [],
    };
    const result = AreaIndexSchema.safeParse(index);
    expect(result.success).toBe(false);
  });

  it('should reject invalid area in array', () => {
    const index = {
      version: 1,
      updated_at: '2026-01-27T00:00:00Z',
      areas: [{ invalid: 'area' }],
    };
    const result = AreaIndexSchema.safeParse(index);
    expect(result.success).toBe(false);
  });
});

describe('Type exports (Story 4.1c)', () => {
  it('should export Goal type', () => {
    const goal: Goal = {
      description: 'Test Goal',
      status: 'in_progress',
      target_date: '2026-03-01T00:00:00Z',
    };
    expect(goal.description).toBe('Test Goal');
  });

  it('should export AreaMeta type', () => {
    const area: AreaMeta = {
      id: 'area_test123456',
      name: 'Test',
      status: 'active',
      created_at: '2026-01-27T00:00:00Z',
      updated_at: '2026-01-27T00:00:00Z',
    };
    expect(area.status).toBe('active');
  });

  it('should export AreaIndex type', () => {
    const index: AreaIndex = {
      version: 1,
      updated_at: '2026-01-27T00:00:00Z',
      areas: [],
    };
    expect(index.version).toBe(1);
  });
});
