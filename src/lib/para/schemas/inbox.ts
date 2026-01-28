/**
 * Inbox Zod Schema
 * Story 4.1c: Initialize PARA Database Schema + Zod Schemas
 *
 * Zod schemas for validating Inbox item metadata and queue files.
 * Used for type-safe YAML parsing and queue validation.
 */

import { z } from 'zod';

// =============================================================================
// Inbox Item Schema
// =============================================================================

/**
 * Schema for inbox item metadata (YAML frontmatter or standalone)
 *
 * @example
 * ```yaml
 * id: inbox_abc12345678
 * title: "Review PR #123"
 * type: task
 * content: "Need to review the authentication changes"
 * source: "github"
 * priority_score: 75
 * processed: false
 * target_project: proj_abc123
 * due_date: "2026-02-01T00:00:00Z"
 * created_at: "2026-01-27T00:00:00Z"
 * updated_at: "2026-01-27T00:00:00Z"
 * tags:
 *   - urgent
 *   - code-review
 * ```
 */
export const InboxItemSchema = z.object({
  /** Inbox item ID - must start with 'inbox_' */
  id: z.string().startsWith('inbox_'),

  /** Item title */
  title: z.string().min(1),

  /** Item type: task, note, idea, reference, capture */
  type: z.enum(['task', 'note', 'idea', 'reference', 'capture']),

  /** Optional detailed content */
  content: z.string().optional(),

  /** Optional source of the item (e.g., email, slack, github, manual) */
  source: z.string().optional(),

  /** Optional priority score (0-100) */
  priority_score: z.number().int().min(0).max(100).optional(),

  /** Whether the item has been processed (default: false) */
  processed: z.boolean().default(false),

  /** Optional target project reference (proj_xxx) */
  target_project: z.string().optional(),

  /** Optional target area reference (area_xxx) */
  target_area: z.string().optional(),

  /** Optional due date (ISO 8601) */
  due_date: z.string().datetime({ offset: true }).optional(),

  /** Creation timestamp (ISO 8601) */
  created_at: z.string().datetime({ offset: true }),

  /** Last update timestamp (ISO 8601) */
  updated_at: z.string().datetime({ offset: true }),

  /** Optional tags array */
  tags: z.array(z.string()).optional(),
});

/** TypeScript type for inbox item */
export type InboxItem = z.infer<typeof InboxItemSchema>;

// =============================================================================
// Inbox Queue Stats Schema
// =============================================================================

/**
 * Schema for inbox queue statistics
 */
export const InboxStatsSchema = z.object({
  /** Total number of items in the queue */
  total: z.number().int().min(0),

  /** Number of unprocessed items */
  unprocessed: z.number().int().min(0),

  /** Count by item type */
  by_type: z.record(z.string(), z.number().int().min(0)),
});

/** TypeScript type for inbox stats */
export type InboxStats = z.infer<typeof InboxStatsSchema>;

// =============================================================================
// Inbox Queue Schema
// =============================================================================

/**
 * Schema for inbox queue file
 *
 * Located at ~/Orion/Inbox/_queue.yaml
 *
 * @example
 * ```yaml
 * version: 1
 * updated_at: "2026-01-27T00:00:00Z"
 * items:
 *   - id: inbox_abc12345678
 *     title: "Review PR #123"
 *     type: task
 *     created_at: "2026-01-27T00:00:00Z"
 *     updated_at: "2026-01-27T00:00:00Z"
 * stats:
 *   total: 1
 *   unprocessed: 1
 *   by_type:
 *     task: 1
 *     note: 0
 *     idea: 0
 *     reference: 0
 *     capture: 0
 * ```
 */
export const InboxQueueSchema = z.object({
  /** Queue version (currently only v1 is supported) */
  version: z.number().int().positive(),

  /** Last update timestamp (ISO 8601) */
  updated_at: z.string().datetime({ offset: true }),

  /** Array of inbox items */
  items: z.array(InboxItemSchema),

  /** Queue statistics */
  stats: InboxStatsSchema,
});

/** TypeScript type for inbox queue */
export type InboxQueue = z.infer<typeof InboxQueueSchema>;
