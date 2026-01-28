/**
 * Templates Zod Schema
 * Story 4.11: Initialize Templates Subdirectory
 *
 * Zod schemas for validating Templates index file.
 * Used for type-safe YAML parsing and index validation.
 */

import { z } from 'zod';

// =============================================================================
// Template Entry Schema (for registry)
// =============================================================================

/**
 * Schema for a template entry in the registry
 *
 * @example
 * ```yaml
 * name: follow-up
 * path: email-templates/follow-up.md
 * category: email
 * ```
 */
export const TemplateEntrySchema = z.object({
  /** Template name identifier */
  name: z.string().min(1),

  /** Path relative to templates directory */
  path: z.string().min(1),

  /** Template category (e.g., email, meeting) */
  category: z.string().optional(),

  /** Optional description */
  description: z.string().optional(),
});

/** TypeScript type for template entry */
export type TemplateEntry = z.infer<typeof TemplateEntrySchema>;

// =============================================================================
// Templates Index Schema
// =============================================================================

/**
 * Schema for templates index file
 *
 * Located at ~/Orion/Resources/templates/_index.yaml
 *
 * @example
 * ```yaml
 * version: 1
 * updated_at: "2026-01-27T00:00:00Z"
 * subdirectories:
 *   - email-templates
 *   - meeting-templates
 * description: "Reusable templates for various document types"
 * templates:
 *   - name: follow-up
 *     path: email-templates/follow-up.md
 *     category: email
 * ```
 */
export const TemplatesIndexSchema = z.object({
  /** Index version (currently only v1 is supported) */
  version: z.number().int().positive(),

  /** Last update timestamp (ISO 8601) */
  updated_at: z.string().datetime({ offset: true }),

  /** List of subdirectory names */
  subdirectories: z.array(z.string().min(1)),

  /** Optional description of the templates directory */
  description: z.string().optional(),

  /** Optional list of registered templates */
  templates: z.array(TemplateEntrySchema).optional(),
});

/** TypeScript type for templates index */
export type TemplatesIndex = z.infer<typeof TemplatesIndexSchema>;
