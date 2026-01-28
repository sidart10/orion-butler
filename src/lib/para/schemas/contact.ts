/**
 * Contact Zod Schema
 * Story 4.1c: Initialize PARA Database Schema + Zod Schemas
 *
 * Zod schemas for validating Contact card metadata and index files.
 * Used for type-safe YAML frontmatter parsing and index validation.
 */

import { z } from 'zod';

// =============================================================================
// Contact Card Schema
// =============================================================================

/**
 * Schema for contact card metadata (YAML frontmatter)
 *
 * Located in contact file as frontmatter or as standalone YAML.
 *
 * @example
 * ```yaml
 * id: cont_abc123456789
 * name: "John Doe"
 * type: person
 * email: "john@example.com"
 * phone: "+1-555-123-4567"
 * company: "Acme Corp"
 * role: "Engineering Manager"
 * relationship: "mentor"
 * notes: "Great for advice on career growth"
 * created_at: "2026-01-27T00:00:00Z"
 * updated_at: "2026-01-27T00:00:00Z"
 * tags:
 *   - work
 *   - mentor
 * projects:
 *   - proj_abc123
 * ```
 */
export const ContactCardSchema = z.object({
  /** Contact ID - must start with 'cont_' */
  id: z.string().startsWith('cont_'),

  /** Contact name (person or organization name) */
  name: z.string().min(1),

  /** Contact type: person or organization */
  type: z.enum(['person', 'organization']),

  /** Optional email address */
  email: z.string().optional(),

  /** Optional phone number */
  phone: z.string().optional(),

  /** Optional company/organization name */
  company: z.string().optional(),

  /** Optional role/title */
  role: z.string().optional(),

  /** Optional relationship descriptor */
  relationship: z.string().optional(),

  /** Optional notes about the contact */
  notes: z.string().optional(),

  /** Creation timestamp (ISO 8601) */
  created_at: z.string().datetime({ offset: true }),

  /** Last update timestamp (ISO 8601) */
  updated_at: z.string().datetime({ offset: true }),

  /** Optional tags array */
  tags: z.array(z.string()).optional(),

  /** Optional linked projects (proj_xxx references) */
  projects: z.array(z.string()).optional(),
});

/** TypeScript type for contact card */
export type ContactCard = z.infer<typeof ContactCardSchema>;

// =============================================================================
// Contact Index Schema
// =============================================================================

/**
 * Schema for contact index file
 *
 * Located at ~/Orion/Areas/Contacts/_index.yaml
 *
 * @example
 * ```yaml
 * version: 1
 * updated_at: "2026-01-27T00:00:00Z"
 * contacts:
 *   - id: cont_abc123456789
 *     name: "John Doe"
 *     type: person
 *     created_at: "2026-01-27T00:00:00Z"
 *     updated_at: "2026-01-27T00:00:00Z"
 * ```
 */
export const ContactIndexSchema = z.object({
  /** Index version (currently only v1 is supported) */
  version: z.number().int().positive(),

  /** Last update timestamp (ISO 8601) */
  updated_at: z.string().datetime({ offset: true }),

  /** Array of contact cards */
  contacts: z.array(ContactCardSchema),
});

/** TypeScript type for contact index */
export type ContactIndex = z.infer<typeof ContactIndexSchema>;

// =============================================================================
// Contacts Subdirectory Index Schema (for ~/Orion/Resources/contacts/)
// =============================================================================

/**
 * Schema for contacts subdirectory stats
 *
 * Tracks counts of contacts by type.
 */
export const ContactsSubdirStatsSchema = z.object({
  /** Total number of contacts */
  total: z.number().int().nonnegative(),

  /** Number of person contacts */
  people: z.number().int().nonnegative(),

  /** Number of organization contacts */
  organizations: z.number().int().nonnegative(),
});

/** TypeScript type for contacts subdirectory stats */
export type ContactsSubdirStats = z.infer<typeof ContactsSubdirStatsSchema>;

/**
 * Schema for contacts subdirectory index file
 *
 * Located at ~/Orion/Resources/contacts/_index.yaml
 * This is a lightweight index that references contact files by ID.
 *
 * @example
 * ```yaml
 * version: 1
 * generated_at: "2026-01-27T00:00:00Z"
 * contacts: []
 * stats:
 *   total: 0
 *   people: 0
 *   organizations: 0
 * ```
 */
export const ContactsSubdirIndexSchema = z.object({
  /** Index version (currently only v1 is supported) */
  version: z.number().int().positive(),

  /** Generation timestamp (ISO 8601) */
  generated_at: z.string().datetime({ offset: true }),

  /** Array of contact IDs (cont_xxx references) */
  contacts: z.array(z.string()),

  /** Contact statistics */
  stats: ContactsSubdirStatsSchema,
});

/** TypeScript type for contacts subdirectory index */
export type ContactsSubdirIndex = z.infer<typeof ContactsSubdirIndexSchema>;
