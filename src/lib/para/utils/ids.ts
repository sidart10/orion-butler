/**
 * PARA Entity ID Generators
 * Epic 4: PARA-Based File Structure
 *
 * Provides type-safe ID generation for all PARA entities.
 * Uses nanoid with a custom alphanumeric alphabet for readable IDs.
 *
 * ID Format: <prefix>_<12 alphanumeric chars>
 * Examples: proj_a1b2c3d4e5f6, area_x9y8z7w6v5u4
 */

import { customAlphabet } from 'nanoid';

// =============================================================================
// Constants
// =============================================================================

/** ID length (excluding prefix) */
const ID_LENGTH = 12;

/** Alphanumeric alphabet for readable IDs */
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

/** Entity prefixes */
export const ID_PREFIXES = {
  PROJECT: 'proj',
  AREA: 'area',
  CONTACT: 'cont',
  INBOX: 'inbox',
  RESOURCE: 'res',
  TEMPLATE: 'tmpl',
} as const;

// =============================================================================
// ID Generator
// =============================================================================

/**
 * Create a nanoid generator with alphanumeric alphabet
 */
const generateId = customAlphabet(ALPHABET, ID_LENGTH);

// =============================================================================
// Entity ID Generators
// =============================================================================

/**
 * Generate a project ID
 * @returns ID in format: proj_xxxxxxxxxxxx
 *
 * @example
 * const id = generateProjectId();
 * // id = "proj_a1b2c3d4e5f6"
 */
export function generateProjectId(): string {
  return `${ID_PREFIXES.PROJECT}_${generateId()}`;
}

/**
 * Generate an area ID
 * @returns ID in format: area_xxxxxxxxxxxx
 *
 * @example
 * const id = generateAreaId();
 * // id = "area_x9y8z7w6v5u4"
 */
export function generateAreaId(): string {
  return `${ID_PREFIXES.AREA}_${generateId()}`;
}

/**
 * Generate a contact ID
 * @returns ID in format: cont_xxxxxxxxxxxx
 *
 * @example
 * const id = generateContactId();
 * // id = "cont_m3n4o5p6q7r8"
 */
export function generateContactId(): string {
  return `${ID_PREFIXES.CONTACT}_${generateId()}`;
}

/**
 * Generate an inbox item ID
 * @returns ID in format: inbox_xxxxxxxxxxxx
 *
 * @example
 * const id = generateInboxId();
 * // id = "inbox_s1t2u3v4w5x6"
 */
export function generateInboxId(): string {
  return `${ID_PREFIXES.INBOX}_${generateId()}`;
}

/**
 * Generate a resource ID
 * @returns ID in format: res_xxxxxxxxxxxx
 *
 * @example
 * const id = generateResourceId();
 * // id = "res_y7z8a9b0c1d2"
 */
export function generateResourceId(): string {
  return `${ID_PREFIXES.RESOURCE}_${generateId()}`;
}

/**
 * Generate a template ID
 * @returns ID in format: tmpl_xxxxxxxxxxxx
 *
 * @example
 * const id = generateTemplateId();
 * // id = "tmpl_e3f4g5h6i7j8"
 */
export function generateTemplateId(): string {
  return `${ID_PREFIXES.TEMPLATE}_${generateId()}`;
}

// =============================================================================
// ID Validation Helpers
// =============================================================================

/**
 * Check if a string is a valid PARA entity ID
 * @param id - The ID to validate
 * @param prefix - Expected prefix (proj, area, cont, inbox, res, tmpl)
 * @returns true if valid, false otherwise
 *
 * @example
 * isValidId('proj_a1b2c3d4e5f6', 'proj'); // true
 * isValidId('proj_short', 'proj'); // false (too short)
 * isValidId('area_a1b2c3d4e5f6', 'proj'); // false (wrong prefix)
 */
export function isValidId(id: string, prefix: string): boolean {
  const pattern = new RegExp(`^${prefix}_[a-z0-9]{${ID_LENGTH}}$`);
  return pattern.test(id);
}

/**
 * Check if a string is a valid project ID
 */
export function isValidProjectId(id: string): boolean {
  return isValidId(id, ID_PREFIXES.PROJECT);
}

/**
 * Check if a string is a valid area ID
 */
export function isValidAreaId(id: string): boolean {
  return isValidId(id, ID_PREFIXES.AREA);
}

/**
 * Check if a string is a valid contact ID
 */
export function isValidContactId(id: string): boolean {
  return isValidId(id, ID_PREFIXES.CONTACT);
}

/**
 * Check if a string is a valid inbox ID
 */
export function isValidInboxId(id: string): boolean {
  return isValidId(id, ID_PREFIXES.INBOX);
}

/**
 * Check if a string is a valid resource ID
 */
export function isValidResourceId(id: string): boolean {
  return isValidId(id, ID_PREFIXES.RESOURCE);
}

/**
 * Check if a string is a valid template ID
 */
export function isValidTemplateId(id: string): boolean {
  return isValidId(id, ID_PREFIXES.TEMPLATE);
}

// =============================================================================
// ID Extraction Helpers
// =============================================================================

/**
 * Extract the prefix from an ID
 * @param id - The full ID
 * @returns The prefix portion (proj, area, etc.) or null if invalid
 *
 * @example
 * getIdPrefix('proj_a1b2c3d4e5f6'); // 'proj'
 * getIdPrefix('invalid'); // null
 */
export function getIdPrefix(id: string): string | null {
  const match = id.match(/^([a-z]+)_/);
  return match ? match[1] : null;
}

/**
 * Extract the unique portion from an ID (without prefix)
 * @param id - The full ID
 * @returns The unique portion or null if invalid
 *
 * @example
 * getIdSuffix('proj_a1b2c3d4e5f6'); // 'a1b2c3d4e5f6'
 * getIdSuffix('invalid'); // null
 */
export function getIdSuffix(id: string): string | null {
  const match = id.match(/^[a-z]+_([a-z0-9]+)$/);
  return match ? match[1] : null;
}
