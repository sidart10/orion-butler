/**
 * Archive Zod Schema
 * Story 4.5: Create Archive Directory
 *
 * Zod schemas for validating Archive index and archived item metadata.
 * Used for type-safe YAML parsing and archive management.
 */

import { z } from 'zod';

// =============================================================================
// Archived Item Schema
// =============================================================================

/**
 * Schema for archived item metadata
 *
 * @example
 * ```yaml
 * id: proj_abc123456789
 * type: project
 * original_path: "Projects/my-project"
 * archived_at: "2026-01-27T00:00:00Z"
 * reason: completed
 * title: "My Project"
 * notes: "Completed successfully"
 * ```
 */
export const ArchivedItemSchema = z.object({
  /** Item ID - project or area ID */
  id: z.string().min(1),

  /** Item type: project or area */
  type: z.enum(['project', 'area']),

  /** Original path before archiving (relative to Orion root) */
  original_path: z.string().min(1),

  /** Destination path in archive (e.g., "Orion/Archive/projects/2026-01/my-project") */
  archived_to: z.string().min(1),

  /** When the item was archived (ISO 8601) */
  archived_at: z.string().datetime({ offset: true }),

  /** Reason for archiving */
  reason: z.enum(['completed', 'cancelled', 'inactive', 'manual']),

  /** Optional title for display */
  title: z.string().optional(),

  /** Optional notes about the archive */
  notes: z.string().optional(),
});

/** TypeScript type for archived item */
export type ArchivedItem = z.infer<typeof ArchivedItemSchema>;

// =============================================================================
// Archive Stats Schema
// =============================================================================

/**
 * Schema for archive statistics
 */
export const ArchiveStatsSchema = z.object({
  /** Total number of archived items */
  total: z.number().int().min(0),

  /** Number of archived projects */
  projects: z.number().int().min(0),

  /** Number of archived areas */
  areas: z.number().int().min(0),
});

/** TypeScript type for archive stats */
export type ArchiveStats = z.infer<typeof ArchiveStatsSchema>;

// =============================================================================
// Archive Index Schema
// =============================================================================

/**
 * Schema for archive index file
 *
 * Located at ~/Orion/Archive/_index.yaml
 *
 * @example
 * ```yaml
 * version: 1
 * generated_at: "2026-01-27T00:00:00Z"
 * archived_items: []
 * stats:
 *   total: 0
 *   projects: 0
 *   areas: 0
 * ```
 */
export const ArchiveIndexSchema = z.object({
  /** Index version (currently only v1 is supported) */
  version: z.number().int().positive(),

  /** When the index was generated (ISO 8601) */
  generated_at: z.string().datetime({ offset: true }),

  /** Array of archived items */
  archived_items: z.array(ArchivedItemSchema),

  /** Archive statistics */
  stats: ArchiveStatsSchema,
});

/** TypeScript type for archive index */
export type ArchiveIndex = z.infer<typeof ArchiveIndexSchema>;
