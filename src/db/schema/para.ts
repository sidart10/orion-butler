/**
 * PARA Database Schema (Drizzle ORM)
 * Story 4.1c: Initialize PARA Database Schema + Zod Schemas
 *
 * Defines SQLite tables for PARA entities:
 * - para_projects - Projects with deadlines and priorities
 * - para_areas - Areas of responsibility
 * - para_contacts - Contact cards (people/organizations)
 * - para_inbox_items - Inbox queue items
 */
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// =============================================================================
// PARA Projects Table
// =============================================================================

/**
 * Projects table - stores project metadata and state
 *
 * Projects have:
 * - Status: active, paused, completed, cancelled
 * - Priority: high, medium, low
 * - Optional deadline and area linkage
 * - Path to filesystem location
 */
export const paraProjects = sqliteTable(
  'para_projects',
  {
    // Primary key with prefix format: proj_xxx
    id: text('id').primaryKey(),

    // Display name
    name: text('name').notNull(),

    // Status: active, paused, completed, cancelled
    status: text('status')
      .notNull()
      .$type<'active' | 'paused' | 'completed' | 'cancelled'>(),

    // Priority: high, medium, low
    priority: text('priority').notNull().$type<'high' | 'medium' | 'low'>(),

    // Optional deadline (ISO datetime)
    deadline: text('deadline'),

    // Optional FK to areas (weak reference - no constraint)
    areaId: text('area_id'),

    // Filesystem path to project directory
    path: text('path').notNull(),

    // JSON metadata (stakeholders, tags, etc.)
    metadata: text('metadata'),

    // Timestamps (ISO format)
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_para_projects_status').on(table.status),
    index('idx_para_projects_priority').on(table.priority),
    index('idx_para_projects_area').on(table.areaId),
    index('idx_para_projects_updated').on(table.updatedAt),
  ]
);

// Type inference exports
export type ParaProject = typeof paraProjects.$inferSelect;
export type NewParaProject = typeof paraProjects.$inferInsert;

// =============================================================================
// PARA Areas Table
// =============================================================================

/**
 * Areas table - stores areas of responsibility
 *
 * Areas have:
 * - Status: active, dormant
 * - Optional review cadence
 * - Path to filesystem location
 */
export const paraAreas = sqliteTable(
  'para_areas',
  {
    // Primary key with prefix format: area_xxx
    id: text('id').primaryKey(),

    // Display name
    name: text('name').notNull(),

    // Status: active, dormant
    status: text('status').notNull().$type<'active' | 'dormant'>(),

    // Review cadence: daily, weekly, monthly, quarterly
    reviewCadence: text('review_cadence').$type<
      'daily' | 'weekly' | 'monthly' | 'quarterly'
    >(),

    // Filesystem path to area directory
    path: text('path').notNull(),

    // JSON metadata (responsibilities, goals, tags, etc.)
    metadata: text('metadata'),

    // Timestamps (ISO format)
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_para_areas_status').on(table.status),
    index('idx_para_areas_updated').on(table.updatedAt),
  ]
);

// Type inference exports
export type ParaArea = typeof paraAreas.$inferSelect;
export type NewParaArea = typeof paraAreas.$inferInsert;

// =============================================================================
// PARA Contacts Table
// =============================================================================

/**
 * Contacts table - stores contact cards
 *
 * Contacts can be:
 * - Type: person, organization
 * - Optional email, relationship
 * - Path to filesystem location
 */
export const paraContacts = sqliteTable(
  'para_contacts',
  {
    // Primary key with prefix format: cont_xxx
    id: text('id').primaryKey(),

    // Display name
    name: text('name').notNull(),

    // Type: person, organization
    type: text('type').notNull().$type<'person' | 'organization'>(),

    // Optional email
    email: text('email'),

    // Optional relationship descriptor
    relationship: text('relationship'),

    // Filesystem path to contact file/directory
    path: text('path').notNull(),

    // JSON metadata (phone, company, role, notes, tags, projects, etc.)
    metadata: text('metadata'),

    // Timestamps (ISO format)
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_para_contacts_type').on(table.type),
    index('idx_para_contacts_email').on(table.email),
    index('idx_para_contacts_updated').on(table.updatedAt),
  ]
);

// Type inference exports
export type ParaContact = typeof paraContacts.$inferSelect;
export type NewParaContact = typeof paraContacts.$inferInsert;

// =============================================================================
// PARA Inbox Items Table
// =============================================================================

/**
 * Inbox items table - stores items in the inbox queue
 *
 * Items have:
 * - Type: task, note, idea, reference, capture
 * - Optional source, priority_score
 * - Processed flag
 * - Path to filesystem location
 */
export const paraInboxItems = sqliteTable(
  'para_inbox_items',
  {
    // Primary key with prefix format: inbox_xxx
    id: text('id').primaryKey(),

    // Type: task, note, idea, reference, capture
    type: text('type')
      .notNull()
      .$type<'task' | 'note' | 'idea' | 'reference' | 'capture'>(),

    // Source of the item (e.g., email, slack, manual)
    source: text('source'),

    // Priority score (0-100)
    priorityScore: integer('priority_score'),

    // Whether the item has been processed (0 = false, 1 = true)
    processed: integer('processed').default(0),

    // Filesystem path to inbox item file
    path: text('path').notNull(),

    // JSON metadata (title, content, tags, target_project, target_area, due_date, etc.)
    metadata: text('metadata'),

    // Timestamps (ISO format)
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_para_inbox_type').on(table.type),
    index('idx_para_inbox_processed').on(table.processed),
    index('idx_para_inbox_priority').on(table.priorityScore),
    index('idx_para_inbox_created').on(table.createdAt),
  ]
);

// Type inference exports
export type ParaInboxItem = typeof paraInboxItems.$inferSelect;
export type NewParaInboxItem = typeof paraInboxItems.$inferInsert;
