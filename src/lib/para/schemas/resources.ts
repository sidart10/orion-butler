/**
 * Resources Zod Schema
 * Story 4.4: Create Resources Directory
 *
 * Zod schemas for validating Resources index file.
 * Used for type-safe YAML parsing and index validation.
 */

import { z } from 'zod';

// =============================================================================
// Resources Index Schema
// =============================================================================

/**
 * Schema for resources index file
 *
 * Located at ~/Orion/Resources/_index.yaml
 *
 * @example
 * ```yaml
 * version: 1
 * updated_at: "2026-01-27T00:00:00Z"
 * subdirectories:
 *   - contacts
 *   - templates
 *   - procedures
 *   - preferences
 *   - notes
 * description: "Reference materials and reusable content"
 * ```
 */
export const ResourcesIndexSchema = z.object({
  /** Index version (currently only v1 is supported) */
  version: z.number().int().positive(),

  /** Last update timestamp (ISO 8601) */
  updated_at: z.string().datetime({ offset: true }),

  /** List of subdirectory names */
  subdirectories: z.array(z.string().min(1)),

  /** Optional description of the resources directory */
  description: z.string().optional(),
});

/** TypeScript type for resources index */
export type ResourcesIndex = z.infer<typeof ResourcesIndexSchema>;
