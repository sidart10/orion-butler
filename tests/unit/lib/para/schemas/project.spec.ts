/**
 * Tests for Project Zod Schema
 * Story 4.1c: Initialize PARA Database Schema + Zod Schemas
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect } from 'vitest';

// Import schemas - will fail until implemented
import {
  StakeholderSchema,
  ProjectMetaSchema,
  ProjectIndexSchema,
  type Stakeholder,
  type ProjectMeta,
  type ProjectIndex,
} from '@/lib/para/schemas/project';

describe('StakeholderSchema (Story 4.1c)', () => {
  it('should accept valid stakeholder object', () => {
    const stakeholder = {
      name: 'John Doe',
      role: 'Product Owner',
      contact: 'john@example.com',
    };
    const result = StakeholderSchema.safeParse(stakeholder);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('John Doe');
      expect(result.data.role).toBe('Product Owner');
      expect(result.data.contact).toBe('john@example.com');
    }
  });

  it('should accept stakeholder without optional contact', () => {
    const stakeholder = {
      name: 'John Doe',
      role: 'Developer',
    };
    const result = StakeholderSchema.safeParse(stakeholder);
    expect(result.success).toBe(true);
  });

  it('should reject stakeholder without name', () => {
    const stakeholder = {
      role: 'Developer',
    };
    const result = StakeholderSchema.safeParse(stakeholder);
    expect(result.success).toBe(false);
  });

  it('should reject stakeholder without role', () => {
    const stakeholder = {
      name: 'John Doe',
    };
    const result = StakeholderSchema.safeParse(stakeholder);
    expect(result.success).toBe(false);
  });
});

describe('ProjectMetaSchema (Story 4.1c)', () => {
  const validProject = {
    id: 'proj_abc123456789',
    name: 'Test Project',
    status: 'active',
    priority: 'high',
    created_at: '2026-01-27T00:00:00Z',
    updated_at: '2026-01-27T00:00:00Z',
  };

  describe('id validation', () => {
    it('should accept id starting with proj_', () => {
      const result = ProjectMetaSchema.safeParse(validProject);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('proj_abc123456789');
      }
    });

    it('should reject id not starting with proj_', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        id: 'area_abc123456789',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty id', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        id: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('name validation', () => {
    it('should accept non-empty name', () => {
      const result = ProjectMetaSchema.safeParse(validProject);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Project');
      }
    });

    it('should reject empty name', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        name: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing name', () => {
      const { name, ...withoutName } = validProject;
      const result = ProjectMetaSchema.safeParse(withoutName);
      expect(result.success).toBe(false);
    });
  });

  describe('status validation', () => {
    it('should accept "active" status', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        status: 'active',
      });
      expect(result.success).toBe(true);
    });

    it('should accept "paused" status', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        status: 'paused',
      });
      expect(result.success).toBe(true);
    });

    it('should accept "completed" status', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        status: 'completed',
      });
      expect(result.success).toBe(true);
    });

    it('should accept "cancelled" status', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        status: 'cancelled',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        status: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('priority validation', () => {
    it('should accept "high" priority', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        priority: 'high',
      });
      expect(result.success).toBe(true);
    });

    it('should accept "medium" priority', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        priority: 'medium',
      });
      expect(result.success).toBe(true);
    });

    it('should accept "low" priority', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        priority: 'low',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid priority', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        priority: 'urgent',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('should accept optional description', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        description: 'A test project description',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe('A test project description');
      }
    });

    it('should accept optional area reference', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        area: 'area_abc123456789',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.area).toBe('area_abc123456789');
      }
    });

    it('should accept optional deadline', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        deadline: '2026-03-01T00:00:00Z',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.deadline).toBe('2026-03-01T00:00:00Z');
      }
    });

    it('should accept optional stakeholders array', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        stakeholders: [
          { name: 'John', role: 'Lead' },
          { name: 'Jane', role: 'Developer', contact: 'jane@example.com' },
        ],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stakeholders).toHaveLength(2);
      }
    });

    it('should accept optional tags array', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        tags: ['work', 'urgent', 'Q1'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual(['work', 'urgent', 'Q1']);
      }
    });
  });

  describe('timestamp validation', () => {
    it('should accept valid ISO datetime for created_at', () => {
      const result = ProjectMetaSchema.safeParse(validProject);
      expect(result.success).toBe(true);
    });

    it('should accept datetime with timezone offset', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        created_at: '2026-01-27T12:00:00+05:30',
        updated_at: '2026-01-27T12:00:00+05:30',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid datetime format', () => {
      const result = ProjectMetaSchema.safeParse({
        ...validProject,
        created_at: 'not-a-date',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing created_at', () => {
      const { created_at, ...withoutCreatedAt } = validProject;
      const result = ProjectMetaSchema.safeParse(withoutCreatedAt);
      expect(result.success).toBe(false);
    });

    it('should reject missing updated_at', () => {
      const { updated_at, ...withoutUpdatedAt } = validProject;
      const result = ProjectMetaSchema.safeParse(withoutUpdatedAt);
      expect(result.success).toBe(false);
    });
  });

  describe('full project validation', () => {
    it('should accept complete valid project', () => {
      const fullProject = {
        id: 'proj_abc123456789',
        name: 'Complete Project',
        description: 'A fully specified project',
        status: 'active',
        priority: 'high',
        area: 'area_xyz987654321',
        deadline: '2026-06-01T00:00:00Z',
        created_at: '2026-01-27T00:00:00Z',
        updated_at: '2026-01-27T00:00:00Z',
        stakeholders: [{ name: 'John', role: 'Lead' }],
        tags: ['important', 'Q1'],
      };
      const result = ProjectMetaSchema.safeParse(fullProject);
      expect(result.success).toBe(true);
    });
  });
});

describe('ProjectIndexSchema (Story 4.1c)', () => {
  it('should accept valid project index with projects array', () => {
    const index = {
      version: 1,
      updated_at: '2026-01-27T00:00:00Z',
      projects: [
        {
          id: 'proj_abc123456789',
          name: 'Project 1',
          status: 'active',
          priority: 'high',
          created_at: '2026-01-27T00:00:00Z',
          updated_at: '2026-01-27T00:00:00Z',
        },
      ],
    };
    const result = ProjectIndexSchema.safeParse(index);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.projects).toHaveLength(1);
    }
  });

  it('should accept empty projects array', () => {
    const index = {
      version: 1,
      updated_at: '2026-01-27T00:00:00Z',
      projects: [],
    };
    const result = ProjectIndexSchema.safeParse(index);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.projects).toHaveLength(0);
    }
  });

  it('should reject missing version', () => {
    const index = {
      updated_at: '2026-01-27T00:00:00Z',
      projects: [],
    };
    const result = ProjectIndexSchema.safeParse(index);
    expect(result.success).toBe(false);
  });

  it('should reject missing updated_at', () => {
    const index = {
      version: 1,
      projects: [],
    };
    const result = ProjectIndexSchema.safeParse(index);
    expect(result.success).toBe(false);
  });

  it('should reject invalid project in array', () => {
    const index = {
      version: 1,
      updated_at: '2026-01-27T00:00:00Z',
      projects: [{ invalid: 'project' }],
    };
    const result = ProjectIndexSchema.safeParse(index);
    expect(result.success).toBe(false);
  });
});

describe('Type exports (Story 4.1c)', () => {
  it('should export Stakeholder type', () => {
    const stakeholder: Stakeholder = {
      name: 'John',
      role: 'Lead',
      contact: 'john@example.com',
    };
    expect(stakeholder.name).toBe('John');
  });

  it('should export ProjectMeta type', () => {
    const project: ProjectMeta = {
      id: 'proj_test123456',
      name: 'Test',
      status: 'active',
      priority: 'high',
      created_at: '2026-01-27T00:00:00Z',
      updated_at: '2026-01-27T00:00:00Z',
    };
    expect(project.status).toBe('active');
  });

  it('should export ProjectIndex type', () => {
    const index: ProjectIndex = {
      version: 1,
      updated_at: '2026-01-27T00:00:00Z',
      projects: [],
    };
    expect(index.version).toBe(1);
  });
});
