/**
 * PARA Path Constants and Helpers
 * Story 4.1a: Create PARA Root Directory Structure
 *
 * Defines the directory structure for the Orion PARA filesystem.
 * All paths are relative to the user's home directory (~/).
 */

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
