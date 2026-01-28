/**
 * PARA Path Constants and Helpers
 * Story 4.1a: Create PARA Root Directory Structure
 * Story 4.14: PARA Path Resolver
 *
 * Defines the directory structure for the Orion PARA filesystem.
 * All paths are relative to the user's home directory (~/).
 */

import { Result, ok, err } from 'neverthrow';

// =============================================================================
// Path Constants
// =============================================================================

/** Root directory name for Orion (relative to $HOME) */
export const ORION_ROOT = 'Orion';

/** System directory name (hidden, stores Orion metadata) */
export const ORION_SYSTEM_DIR = '.orion';

// =============================================================================
// PARA Directory Names
// =============================================================================

/** Projects directory - active work with deadlines */
export const PROJECTS_DIR = 'Projects';

/** Areas directory - ongoing responsibilities */
export const AREAS_DIR = 'Areas';

/** Resources directory - reference materials */
export const RESOURCES_DIR = 'Resources';

/** Archive directory - completed/inactive items */
export const ARCHIVE_DIR = 'Archive';

/** Inbox directory - unsorted incoming items */
export const INBOX_DIR = 'Inbox';

// =============================================================================
// Types
// =============================================================================

/**
 * All Orion directory paths (relative to $HOME)
 */
export interface OrionPaths {
  /** Root directory: ~/Orion */
  root: string;
  /** System directory: ~/Orion/.orion */
  system: string;
  /** Projects directory: ~/Orion/Projects */
  projects: string;
  /** Areas directory: ~/Orion/Areas */
  areas: string;
  /** Resources directory: ~/Orion/Resources */
  resources: string;
  /** Archive directory: ~/Orion/Archive */
  archive: string;
  /** Inbox directory: ~/Orion/Inbox */
  inbox: string;
}

// =============================================================================
// Path Helpers
// =============================================================================

/**
 * Get all Orion directory paths (relative to $HOME)
 *
 * @returns Object containing all PARA directory paths
 *
 * @example
 * const paths = getOrionPaths();
 * // paths.root === 'Orion'
 * // paths.projects === 'Orion/Projects'
 */
export function getOrionPaths(): OrionPaths {
  return {
    root: ORION_ROOT,
    system: `${ORION_ROOT}/${ORION_SYSTEM_DIR}`,
    projects: `${ORION_ROOT}/${PROJECTS_DIR}`,
    areas: `${ORION_ROOT}/${AREAS_DIR}`,
    resources: `${ORION_ROOT}/${RESOURCES_DIR}`,
    archive: `${ORION_ROOT}/${ARCHIVE_DIR}`,
    inbox: `${ORION_ROOT}/${INBOX_DIR}`,
  };
}

/**
 * Build a path under the Orion root
 *
 * @param segments - Path segments to join under Orion root
 * @returns Full path relative to $HOME
 *
 * @example
 * buildOrionPath('Projects', 'my-project')
 * // returns 'Orion/Projects/my-project'
 */
export function buildOrionPath(...segments: string[]): string {
  return [ORION_ROOT, ...segments].join('/');
}

// =============================================================================
// Path Resolver (Story 4.14)
// =============================================================================

/**
 * Error types for path resolution
 */
export interface PathResolveError {
  code: 'NOT_PARA_PATH' | 'INVALID_CATEGORY';
  message: string;
  path?: string;
  category?: string;
  valid?: string[];
}

/**
 * Mapping from para:// category names to actual directory paths
 */
const PATH_MAPPINGS: Record<string, string> = {
  projects: `${ORION_ROOT}/${PROJECTS_DIR}`,
  areas: `${ORION_ROOT}/${AREAS_DIR}`,
  resources: `${ORION_ROOT}/${RESOURCES_DIR}`,
  archive: `${ORION_ROOT}/${ARCHIVE_DIR}`,
  inbox: `${ORION_ROOT}/${INBOX_DIR}`,
  contacts: `${ORION_ROOT}/${RESOURCES_DIR}/contacts`,
  templates: `${ORION_ROOT}/${RESOURCES_DIR}/templates`,
  notes: `${ORION_ROOT}/${RESOURCES_DIR}/notes`,
  procedures: `${ORION_ROOT}/${RESOURCES_DIR}/procedures`,
  preferences: `${ORION_ROOT}/${RESOURCES_DIR}/preferences`,
};

/** Categories that should have .yaml auto-appended for entity files */
const YAML_ENTITY_CATEGORIES = new Set([
  'contacts',
  'templates',
  'notes',
  'procedures',
  'preferences',
]);

/** Valid category names for error messages */
const VALID_CATEGORIES = Object.keys(PATH_MAPPINGS);

/**
 * Resolve a para:// URI or relative path to an actual filesystem path
 *
 * @param path - A para:// URI, Orion-relative path, or category-relative path
 * @returns Result with resolved path or error
 *
 * @example
 * resolveParaPath('para://projects/q1')  // Ok('Orion/Projects/q1')
 * resolveParaPath('Orion/Projects/q1')   // Ok('Orion/Projects/q1')
 * resolveParaPath('projects/q1')         // Ok('Orion/Projects/q1')
 * resolveParaPath('para://contacts/john') // Ok('Orion/Resources/contacts/john.yaml')
 */
export function resolveParaPath(path: string): Result<string, PathResolveError> {
  // Handle para:// scheme (case-insensitive)
  const paraMatch = path.match(/^para:\/\//i);
  if (paraMatch) {
    const afterScheme = path.slice(paraMatch[0].length);
    return resolveParaScheme(afterScheme);
  }

  // Handle Orion/ passthrough
  if (path === ORION_ROOT || path.startsWith(`${ORION_ROOT}/`)) {
    return ok(path);
  }

  // Handle relative paths starting with a category
  const firstSegment = path.split('/')[0].toLowerCase();
  if (PATH_MAPPINGS[firstSegment]) {
    const rest = path.slice(firstSegment.length);
    return resolveParaScheme(firstSegment + rest);
  }

  // Not a PARA path
  return err({
    code: 'NOT_PARA_PATH',
    message: `Path '${path}' is not a valid PARA path`,
    path,
  });
}

/**
 * Resolve path after para:// scheme
 */
function resolveParaScheme(afterScheme: string): Result<string, PathResolveError> {
  // Handle empty path (para://)
  if (!afterScheme || afterScheme === '/') {
    return ok(ORION_ROOT);
  }

  // Normalize: remove leading slash, multiple slashes, trailing slash
  const normalized = afterScheme
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/')
    .replace(/\/+$/, '');

  if (!normalized) {
    return ok(ORION_ROOT);
  }

  // Extract category (case-insensitive)
  const segments = normalized.split('/');
  const category = segments[0].toLowerCase();
  const restSegments = segments.slice(1);

  // Check if category is valid
  if (!PATH_MAPPINGS[category]) {
    return err({
      code: 'INVALID_CATEGORY',
      message: `Invalid category '${category}'. Valid categories: ${VALID_CATEGORIES.join(', ')}`,
      category,
      valid: VALID_CATEGORIES,
    });
  }

  // Build the resolved path
  let resolvedPath = PATH_MAPPINGS[category];
  if (restSegments.length > 0) {
    const restPath = restSegments.join('/');
    resolvedPath = `${resolvedPath}/${restPath}`;

    // Auto-append .yaml for entity categories (if not already present)
    if (YAML_ENTITY_CATEGORIES.has(category) && !restPath.endsWith('.yaml')) {
      resolvedPath = `${resolvedPath}.yaml`;
    }
  }

  return ok(resolvedPath);
}

/**
 * Check if a relative path is within the Orion PARA structure
 *
 * @param relativePath - Path to check (relative to home directory)
 * @returns true if path starts with Orion root
 *
 * @example
 * isParaPath('Orion/Projects/q1')  // true
 * isParaPath('Documents/file.txt') // false
 * isParaPath('OrionExtra/file')    // false (partial match)
 */
export function isParaPath(relativePath: string): boolean {
  if (!relativePath) {
    return false;
  }
  // Must be exactly "Orion" or start with "Orion/"
  return relativePath === ORION_ROOT || relativePath.startsWith(`${ORION_ROOT}/`);
}

/**
 * Convert an Orion filesystem path to a para:// URI
 *
 * @param relativePath - Path relative to home (must start with Orion/)
 * @returns Result with para:// URI or error
 *
 * @example
 * toParaUri('Orion/Projects/q1')  // Ok('para://projects/q1')
 * toParaUri('Orion')              // Ok('para://')
 * toParaUri('Documents/file')     // Err({ code: 'NOT_PARA_PATH' })
 */
export function toParaUri(relativePath: string): Result<string, PathResolveError> {
  if (!isParaPath(relativePath)) {
    return err({
      code: 'NOT_PARA_PATH',
      message: `Path '${relativePath}' is not a valid PARA path`,
      path: relativePath,
    });
  }

  // Handle bare Orion root
  if (relativePath === ORION_ROOT) {
    return ok('para://');
  }

  // Remove "Orion/" prefix
  const afterOrion = relativePath.slice(ORION_ROOT.length + 1);

  // Convert first segment to lowercase category
  const segments = afterOrion.split('/');
  const firstSegment = segments[0].toLowerCase();
  const restSegments = segments.slice(1);

  // Map directory name to category
  const categoryMap: Record<string, string> = {
    projects: 'projects',
    areas: 'areas',
    resources: 'resources',
    archive: 'archive',
    inbox: 'inbox',
  };

  const category = categoryMap[firstSegment];
  if (!category) {
    // Unknown directory, just lowercase it
    const rest = restSegments.length > 0 ? `/${restSegments.join('/')}` : '';
    return ok(`para://${firstSegment}${rest}`);
  }

  if (restSegments.length === 0) {
    return ok(`para://${category}`);
  }

  return ok(`para://${category}/${restSegments.join('/')}`);
}
