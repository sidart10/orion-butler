/**
 * Area Zod Schema
 * Story 4.1c: Initialize PARA Database Schema + Zod Schemas
 *
 * Zod schemas for validating Area metadata and index files.
 * Used for type-safe YAML frontmatter parsing and index validation.
 */

import { z } from 'zod';

// =============================================================================
// Goal Schema
// =============================================================================

/**
 * Schema for area goals
 *
 * Goals are objectives within an area with target dates and status tracking.
 */
export const GoalSchema = z.object({
  /** Goal description */
  description: z.string().min(1),

  /** Goal status (freeform - in_progress, completed, ongoing, etc.) */
  status: z.string().min(1),

  /** Optional target date (ISO 8601 datetime) */
  target_date: z.string().datetime({ offset: true }).optional(),
});

/** TypeScript type for goal */
export type Goal = z.infer<typeof GoalSchema>;

// =============================================================================
// Area Meta Schema
// =============================================================================

/**
 * Schema for area metadata (YAML frontmatter)
 *
 * Located in area directory as _meta.yaml or index.md frontmatter.
 *
 * @example
 * ```yaml
 * id: area_abc123456789
 * name: "Health & Fitness"
 * description: "Personal health maintenance"
 * status: active
 * responsibilities:
 *   - Exercise regularly
 *   - Maintain nutrition
 * goals:
 *   - description: "Run 5K"
 *     status: in_progress
 *     target_date: "2026-03-01T00:00:00Z"
 * review_cadence: weekly
 * created_at: "2026-01-27T00:00:00Z"
 * updated_at: "2026-01-27T00:00:00Z"
 * tags:
 *   - personal
 *   - health
 * ```
 */
export const AreaMetaSchema = z.object({
  /** Area ID - must start with 'area_' */
  id: z.string().startsWith('area_'),

  /** Area name */
  name: z.string().min(1),

  /** Optional description */
  description: z.string().optional(),

  /** Area status - active or dormant (unlike projects) */
  status: z.enum(['active', 'dormant']),

  /** Optional responsibilities list */
  responsibilities: z.array(z.string()).optional(),

  /** Optional goals array */
  goals: z.array(GoalSchema).optional(),

  /** Optional review cadence (matches DB column review_cadence) */
  review_cadence: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).optional(),

  /** Creation timestamp (ISO 8601) */
  created_at: z.string().datetime({ offset: true }),

  /** Last update timestamp (ISO 8601) */
  updated_at: z.string().datetime({ offset: true }),

  /** Optional tags array */
  tags: z.array(z.string()).optional(),
});

/** TypeScript type for area metadata */
export type AreaMeta = z.infer<typeof AreaMetaSchema>;

// =============================================================================
// Area Index Schema
// =============================================================================

/**
 * Schema for area index file
 *
 * Located at ~/Orion/Areas/_index.yaml
 *
 * @example
 * ```yaml
 * version: 1
 * updated_at: "2026-01-27T00:00:00Z"
 * areas:
 *   - id: area_abc123456789
 *     name: "Health & Fitness"
 *     status: active
 *     created_at: "2026-01-27T00:00:00Z"
 *     updated_at: "2026-01-27T00:00:00Z"
 * ```
 */
export const AreaIndexSchema = z.object({
  /** Index version (currently only v1 is supported) */
  version: z.number().int().positive(),

  /** Last update timestamp (ISO 8601) */
  updated_at: z.string().datetime({ offset: true }),

  /** Array of area metadata */
  areas: z.array(AreaMetaSchema),
});

/** TypeScript type for area index */
export type AreaIndex = z.infer<typeof AreaIndexSchema>;
