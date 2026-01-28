import { customAlphabet } from 'nanoid';

// Alphabet optimized for readability (no confusing chars: 0/O, 1/l/I)
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 12);

/**
 * ID prefixes for different entity types
 * Format: prefix_xxxxxxxxxxxx (prefix + 12 char nanoid)
 */
export const ID_PREFIXES = {
  conversation: 'conv',
  message: 'msg',
  session: 'sess',
} as const;

export type IdPrefix = keyof typeof ID_PREFIXES;

/**
 * Generate a prefixed ID
 * @example generateId('conversation') => 'conv_a1b2c3d4e5f6'
 */
export function generateId(type: IdPrefix): string {
  return `${ID_PREFIXES[type]}_${nanoid()}`;
}

/**
 * Validate an ID has the expected prefix
 */
export function validateId(id: string, type: IdPrefix): boolean {
  const prefix = ID_PREFIXES[type];
  return id.startsWith(`${prefix}_`) && id.length === prefix.length + 13;
}

/**
 * Extract prefix from ID
 */
export function getIdPrefix(id: string): string | null {
  const match = id.match(/^([a-z]+)_/);
  return match ? match[1] : null;
}
