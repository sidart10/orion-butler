/**
 * Project Zod Schema
 * Story 4.1c: Initialize PARA Database Schema + Zod Schemas
 *
 * Zod schemas for validating Project metadata and index files.
 * Used for type-safe YAML frontmatter parsing and index validation.
 */

import { z } from 'zod';

// =============================================================================
// Stakeholder Schema
// =============================================================================

/**
 * Schema for project stakeholders
 *
 * Stakeholders are people involved in the project with defined roles.
 */
export const StakeholderSchema = z.object({
  /** Stakeholder name */
  name: z.string().min(1),

  /** Role in the project */
  role: z.string().min(1),

  /** Optional contact information */
  contact: z.string().optional(),
});

/** TypeScript type for stakeholder */
export type Stakeholder = z.infer<typeof StakeholderSchema>;

// =============================================================================
// Project Meta Schema
// =============================================================================

/**
 * Schema for project metadata (YAML frontmatter)
 *
 * Located in project directory as _meta.yaml or index.md frontmatter.
 *
 * @example
 * ```yaml
 * id: proj_abc123456789
 * name: "My Project"
 * description: "A sample project"
 * status: active
 * priority: high
 * area: area_xyz987654321
 * deadline: "2026-06-01T00:00:00Z"
 * created_at: "2026-01-27T00:00:00Z"
 * updated_at: "2026-01-27T00:00:00Z"
 * stakeholders:
 *   - name: "John"
 *     role: "Lead"
 * tags:
 *   - important
 *   - Q1
 * ```
 */
export const ProjectMetaSchema = z.object({
  /** Project ID - must start with 'proj_' */
  id: z.string().startsWith('proj_'),

  /** Project name */
  name: z.string().min(1),

  /** Optional description */
  description: z.string().optional(),

  /** Project status */
  status: z.enum(['active', 'paused', 'completed', 'cancelled']),

  /** Project priority */
  priority: z.enum(['high', 'medium', 'low']),

  /** Optional area reference (area_xxx format) */
  area: z.string().optional(),

  /** Optional deadline (ISO 8601 datetime) */
  deadline: z.string().datetime({ offset: true }).optional(),

  /** Creation timestamp (ISO 8601) */
  created_at: z.string().datetime({ offset: true }),

  /** Last update timestamp (ISO 8601) */
  updated_at: z.string().datetime({ offset: true }),

  /** Optional stakeholders array */
  stakeholders: z.array(StakeholderSchema).optional(),

  /** Optional tags array */
  tags: z.array(z.string()).optional(),
});

/** TypeScript type for project metadata */
export type ProjectMeta = z.infer<typeof ProjectMetaSchema>;

// =============================================================================
// Project Index Schema
// =============================================================================

/**
 * Schema for project index file
 *
 * Located at ~/Orion/Projects/_index.yaml
 *
 * @example
 * ```yaml
 * version: 1
 * updated_at: "2026-01-27T00:00:00Z"
 * projects:
 *   - id: proj_abc123456789
 *     name: "My Project"
 *     status: active
 *     priority: high
 *     created_at: "2026-01-27T00:00:00Z"
 *     updated_at: "2026-01-27T00:00:00Z"
 * ```
 */
export const ProjectIndexSchema = z.object({
  /** Index version (currently only v1 is supported) */
  version: z.number().int().positive(),

  /** Last update timestamp (ISO 8601) */
  updated_at: z.string().datetime({ offset: true }),

  /** Array of project metadata */
  projects: z.array(ProjectMetaSchema),
});

/** TypeScript type for project index */
export type ProjectIndex = z.infer<typeof ProjectIndexSchema>;
