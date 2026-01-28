/**
 * Orion Config Schema
 * Story 4.1b: Initialize Orion Config
 *
 * Zod schema for validating Orion configuration files.
 * Used for type-safe configuration management.
 */

import { z } from 'zod';

// =============================================================================
// Preferences Schema
// =============================================================================

/**
 * Schema for user preferences
 *
 * All fields have sensible defaults, making partial configs valid.
 */
export const OrionPreferencesSchema = z.object({
  /** UI theme preference */
  theme: z.enum(['system', 'light', 'dark']).default('system'),

  /** Days before items are auto-archived (positive integer) */
  archive_after_days: z.number().int().positive().default(30),
});

/** TypeScript type for preferences (output of schema) */
export type OrionPreferences = z.infer<typeof OrionPreferencesSchema>;

// =============================================================================
// Config Schema
// =============================================================================

/**
 * Schema for the main Orion configuration file
 *
 * Located at ~/Orion/.orion/config.yaml
 *
 * @example
 * ```yaml
 * version: 1
 * created_at: "2026-01-27T00:00:00Z"
 * para_root: "~/Orion"
 * preferences:
 *   theme: "system"
 *   archive_after_days: 30
 * ```
 */
export const OrionConfigSchema = z.object({
  /** Config version (currently only v1 is supported) */
  version: z.literal(1),

  /** ISO 8601 datetime when config was created */
  created_at: z.string().datetime({ offset: true }),

  /** Root path for PARA structure */
  para_root: z.string().min(1),

  /** User preferences */
  preferences: OrionPreferencesSchema,
});

/** TypeScript type for config (output of schema) */
export type OrionConfig = z.infer<typeof OrionConfigSchema>;
