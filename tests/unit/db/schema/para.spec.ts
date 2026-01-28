/**
 * Tests for PARA Database Schema (Drizzle ORM)
 * Story 4.1c: Initialize PARA Database Schema + Zod Schemas
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect } from 'vitest';
import { sql } from 'drizzle-orm';
import type { SQLiteColumn } from 'drizzle-orm/sqlite-core';

// Import schemas - will fail until implemented
import {
  paraProjects,
  paraAreas,
  paraContacts,
  paraInboxItems,
  type ParaProject,
  type NewParaProject,
  type ParaArea,
  type NewParaArea,
  type ParaContact,
  type NewParaContact,
  type ParaInboxItem,
  type NewParaInboxItem,
} from '@/db/schema/para';

// Helper to check if column exists and get its properties
function getColumnName(column: SQLiteColumn): string {
  return column.name;
}

describe('paraProjects table (Story 4.1c)', () => {
  it('should have id column as primary key', () => {
    expect(paraProjects.id).toBeDefined();
    expect(getColumnName(paraProjects.id)).toBe('id');
    expect(paraProjects.id.primary).toBe(true);
  });

  it('should have name column (text, not null)', () => {
    expect(paraProjects.name).toBeDefined();
    expect(getColumnName(paraProjects.name)).toBe('name');
    expect(paraProjects.name.notNull).toBe(true);
  });

  it('should have status column (text, not null)', () => {
    expect(paraProjects.status).toBeDefined();
    expect(getColumnName(paraProjects.status)).toBe('status');
    expect(paraProjects.status.notNull).toBe(true);
  });

  it('should have priority column (text, not null)', () => {
    expect(paraProjects.priority).toBeDefined();
    expect(getColumnName(paraProjects.priority)).toBe('priority');
    expect(paraProjects.priority.notNull).toBe(true);
  });

  it('should have deadline column (text, optional)', () => {
    expect(paraProjects.deadline).toBeDefined();
    expect(getColumnName(paraProjects.deadline)).toBe('deadline');
    expect(paraProjects.deadline.notNull).toBe(false);
  });

  it('should have areaId column (text, optional - FK to areas)', () => {
    expect(paraProjects.areaId).toBeDefined();
    expect(getColumnName(paraProjects.areaId)).toBe('area_id');
  });

  it('should have path column (text, not null)', () => {
    expect(paraProjects.path).toBeDefined();
    expect(getColumnName(paraProjects.path)).toBe('path');
    expect(paraProjects.path.notNull).toBe(true);
  });

  it('should have metadata column (text/json)', () => {
    expect(paraProjects.metadata).toBeDefined();
    expect(getColumnName(paraProjects.metadata)).toBe('metadata');
  });

  it('should have createdAt column (text, not null)', () => {
    expect(paraProjects.createdAt).toBeDefined();
    expect(getColumnName(paraProjects.createdAt)).toBe('created_at');
    expect(paraProjects.createdAt.notNull).toBe(true);
  });

  it('should have updatedAt column (text, not null)', () => {
    expect(paraProjects.updatedAt).toBeDefined();
    expect(getColumnName(paraProjects.updatedAt)).toBe('updated_at');
    expect(paraProjects.updatedAt.notNull).toBe(true);
  });

  it('should infer ParaProject type correctly', () => {
    // Type test - if this compiles, the type is correct
    const project: ParaProject = {
      id: 'proj_test123456',
      name: 'Test Project',
      status: 'active',
      priority: 'high',
      deadline: null,
      areaId: null,
      path: '/Projects/test',
      metadata: null,
      createdAt: '2026-01-27T00:00:00Z',
      updatedAt: '2026-01-27T00:00:00Z',
    };
    expect(project.id).toBe('proj_test123456');
  });

  it('should infer NewParaProject type correctly', () => {
    // Type test - if this compiles, the type is correct
    const newProject: NewParaProject = {
      id: 'proj_test123456',
      name: 'Test Project',
      status: 'active',
      priority: 'high',
      path: '/Projects/test',
      createdAt: '2026-01-27T00:00:00Z',
      updatedAt: '2026-01-27T00:00:00Z',
    };
    expect(newProject.id).toBe('proj_test123456');
  });
});

describe('paraAreas table (Story 4.1c)', () => {
  it('should have id column as primary key', () => {
    expect(paraAreas.id).toBeDefined();
    expect(getColumnName(paraAreas.id)).toBe('id');
    expect(paraAreas.id.primary).toBe(true);
  });

  it('should have name column (text, not null)', () => {
    expect(paraAreas.name).toBeDefined();
    expect(getColumnName(paraAreas.name)).toBe('name');
    expect(paraAreas.name.notNull).toBe(true);
  });

  it('should have status column (text, not null)', () => {
    expect(paraAreas.status).toBeDefined();
    expect(getColumnName(paraAreas.status)).toBe('status');
    expect(paraAreas.status.notNull).toBe(true);
  });

  it('should have reviewCadence column (text, optional)', () => {
    expect(paraAreas.reviewCadence).toBeDefined();
    expect(getColumnName(paraAreas.reviewCadence)).toBe('review_cadence');
    expect(paraAreas.reviewCadence.notNull).toBe(false);
  });

  it('should have path column (text, not null)', () => {
    expect(paraAreas.path).toBeDefined();
    expect(getColumnName(paraAreas.path)).toBe('path');
    expect(paraAreas.path.notNull).toBe(true);
  });

  it('should have metadata column (text/json)', () => {
    expect(paraAreas.metadata).toBeDefined();
    expect(getColumnName(paraAreas.metadata)).toBe('metadata');
  });

  it('should have createdAt column (text, not null)', () => {
    expect(paraAreas.createdAt).toBeDefined();
    expect(getColumnName(paraAreas.createdAt)).toBe('created_at');
    expect(paraAreas.createdAt.notNull).toBe(true);
  });

  it('should have updatedAt column (text, not null)', () => {
    expect(paraAreas.updatedAt).toBeDefined();
    expect(getColumnName(paraAreas.updatedAt)).toBe('updated_at');
    expect(paraAreas.updatedAt.notNull).toBe(true);
  });

  it('should infer ParaArea type correctly', () => {
    const area: ParaArea = {
      id: 'area_test123456',
      name: 'Test Area',
      status: 'active',
      reviewCadence: 'weekly',
      path: '/Areas/test',
      metadata: null,
      createdAt: '2026-01-27T00:00:00Z',
      updatedAt: '2026-01-27T00:00:00Z',
    };
    expect(area.id).toBe('area_test123456');
  });

  it('should infer NewParaArea type correctly', () => {
    const newArea: NewParaArea = {
      id: 'area_test123456',
      name: 'Test Area',
      status: 'active',
      path: '/Areas/test',
      createdAt: '2026-01-27T00:00:00Z',
      updatedAt: '2026-01-27T00:00:00Z',
    };
    expect(newArea.id).toBe('area_test123456');
  });
});

describe('paraContacts table (Story 4.1c)', () => {
  it('should have id column as primary key', () => {
    expect(paraContacts.id).toBeDefined();
    expect(getColumnName(paraContacts.id)).toBe('id');
    expect(paraContacts.id.primary).toBe(true);
  });

  it('should have name column (text, not null)', () => {
    expect(paraContacts.name).toBeDefined();
    expect(getColumnName(paraContacts.name)).toBe('name');
    expect(paraContacts.name.notNull).toBe(true);
  });

  it('should have type column (text, not null)', () => {
    expect(paraContacts.type).toBeDefined();
    expect(getColumnName(paraContacts.type)).toBe('type');
    expect(paraContacts.type.notNull).toBe(true);
  });

  it('should have email column (text, optional)', () => {
    expect(paraContacts.email).toBeDefined();
    expect(getColumnName(paraContacts.email)).toBe('email');
    expect(paraContacts.email.notNull).toBe(false);
  });

  it('should have relationship column (text, optional)', () => {
    expect(paraContacts.relationship).toBeDefined();
    expect(getColumnName(paraContacts.relationship)).toBe('relationship');
    expect(paraContacts.relationship.notNull).toBe(false);
  });

  it('should have path column (text, not null)', () => {
    expect(paraContacts.path).toBeDefined();
    expect(getColumnName(paraContacts.path)).toBe('path');
    expect(paraContacts.path.notNull).toBe(true);
  });

  it('should have metadata column (text/json)', () => {
    expect(paraContacts.metadata).toBeDefined();
    expect(getColumnName(paraContacts.metadata)).toBe('metadata');
  });

  it('should have createdAt column (text, not null)', () => {
    expect(paraContacts.createdAt).toBeDefined();
    expect(getColumnName(paraContacts.createdAt)).toBe('created_at');
    expect(paraContacts.createdAt.notNull).toBe(true);
  });

  it('should have updatedAt column (text, not null)', () => {
    expect(paraContacts.updatedAt).toBeDefined();
    expect(getColumnName(paraContacts.updatedAt)).toBe('updated_at');
    expect(paraContacts.updatedAt.notNull).toBe(true);
  });

  it('should infer ParaContact type correctly', () => {
    const contact: ParaContact = {
      id: 'cont_test123456',
      name: 'Test Contact',
      type: 'person',
      email: 'test@example.com',
      relationship: 'colleague',
      path: '/Areas/Contacts/test',
      metadata: null,
      createdAt: '2026-01-27T00:00:00Z',
      updatedAt: '2026-01-27T00:00:00Z',
    };
    expect(contact.id).toBe('cont_test123456');
  });
});

describe('paraInboxItems table (Story 4.1c)', () => {
  it('should have id column as primary key', () => {
    expect(paraInboxItems.id).toBeDefined();
    expect(getColumnName(paraInboxItems.id)).toBe('id');
    expect(paraInboxItems.id.primary).toBe(true);
  });

  it('should have type column (text, not null)', () => {
    expect(paraInboxItems.type).toBeDefined();
    expect(getColumnName(paraInboxItems.type)).toBe('type');
    expect(paraInboxItems.type.notNull).toBe(true);
  });

  it('should have source column (text, optional)', () => {
    expect(paraInboxItems.source).toBeDefined();
    expect(getColumnName(paraInboxItems.source)).toBe('source');
    expect(paraInboxItems.source.notNull).toBe(false);
  });

  it('should have priorityScore column (integer, optional)', () => {
    expect(paraInboxItems.priorityScore).toBeDefined();
    expect(getColumnName(paraInboxItems.priorityScore)).toBe('priority_score');
  });

  it('should have processed column (integer - boolean, default false)', () => {
    expect(paraInboxItems.processed).toBeDefined();
    expect(getColumnName(paraInboxItems.processed)).toBe('processed');
  });

  it('should have path column (text, not null)', () => {
    expect(paraInboxItems.path).toBeDefined();
    expect(getColumnName(paraInboxItems.path)).toBe('path');
    expect(paraInboxItems.path.notNull).toBe(true);
  });

  it('should have metadata column (text/json)', () => {
    expect(paraInboxItems.metadata).toBeDefined();
    expect(getColumnName(paraInboxItems.metadata)).toBe('metadata');
  });

  it('should have createdAt column (text, not null)', () => {
    expect(paraInboxItems.createdAt).toBeDefined();
    expect(getColumnName(paraInboxItems.createdAt)).toBe('created_at');
    expect(paraInboxItems.createdAt.notNull).toBe(true);
  });

  it('should have updatedAt column (text, not null)', () => {
    expect(paraInboxItems.updatedAt).toBeDefined();
    expect(getColumnName(paraInboxItems.updatedAt)).toBe('updated_at');
    expect(paraInboxItems.updatedAt.notNull).toBe(true);
  });

  it('should infer ParaInboxItem type correctly', () => {
    const item: ParaInboxItem = {
      id: 'inbox_test12345',
      type: 'task',
      source: 'email',
      priorityScore: 50,
      processed: 0,
      path: '/Inbox/test',
      metadata: null,
      createdAt: '2026-01-27T00:00:00Z',
      updatedAt: '2026-01-27T00:00:00Z',
    };
    expect(item.id).toBe('inbox_test12345');
  });

  it('should infer NewParaInboxItem type correctly', () => {
    const newItem: NewParaInboxItem = {
      id: 'inbox_test12345',
      type: 'task',
      path: '/Inbox/test',
      createdAt: '2026-01-27T00:00:00Z',
      updatedAt: '2026-01-27T00:00:00Z',
    };
    expect(newItem.id).toBe('inbox_test12345');
  });
});
