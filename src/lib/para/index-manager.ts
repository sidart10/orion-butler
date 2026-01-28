/**
 * PARA Index Manager Utilities
 * Story 4.13: Agent Write Access to PARA
 *
 * TDD Phase: GREEN - Implementation to pass tests
 *
 * Provides utility functions for managing PARA index files:
 * - getIndexPathForType: Get index file path for an entity type
 * - getIndexListKey: Get the array key name in the index file
 * - getEntityTypeFromPath: Determine entity type from file path
 */

import {
  ORION_ROOT,
  PROJECTS_DIR,
  AREAS_DIR,
  RESOURCES_DIR,
  ARCHIVE_DIR,
  INBOX_DIR,
} from './paths';

// =============================================================================
// Types
// =============================================================================

/**
 * Valid entity types for PARA index management
 */
export type ParaEntityType =
  | 'project'
  | 'area'
  | 'archive'
  | 'inbox'
  | 'contact'
  | 'note'
  | 'template'
  | 'procedure'
  | 'preference';

// =============================================================================
// Constants
// =============================================================================

/**
 * Mapping from entity type to index file path (relative to home directory)
 */
const INDEX_PATHS: Record<ParaEntityType, string> = {
  project: `${ORION_ROOT}/${PROJECTS_DIR}/_index.yaml`,
  area: `${ORION_ROOT}/${AREAS_DIR}/_index.yaml`,
  archive: `${ORION_ROOT}/${ARCHIVE_DIR}/_index.yaml`,
  inbox: `${ORION_ROOT}/${INBOX_DIR}/_index.yaml`,
  contact: `${ORION_ROOT}/${RESOURCES_DIR}/contacts/_index.yaml`,
  note: `${ORION_ROOT}/${RESOURCES_DIR}/notes/_index.yaml`,
  template: `${ORION_ROOT}/${RESOURCES_DIR}/templates/_index.yaml`,
  procedure: `${ORION_ROOT}/${RESOURCES_DIR}/procedures/_index.yaml`,
  preference: `${ORION_ROOT}/${RESOURCES_DIR}/preferences/_index.yaml`,
};

/**
 * Mapping from entity type to list key in index file
 */
const LIST_KEYS: Record<ParaEntityType, string> = {
  project: 'projects',
  area: 'areas',
  archive: 'archived',
  inbox: 'items',
  contact: 'contacts',
  note: 'notes',
  template: 'templates',
  procedure: 'procedures',
  preference: 'preferences',
};

// =============================================================================
// Functions
// =============================================================================

/**
 * Get the index file path for a given entity type
 *
 * @param entityType - The type of PARA entity
 * @returns Path to the index file (relative to home directory)
 * @throws Error for unknown entity types
 *
 * @example
 * getIndexPathForType('project')  // 'Orion/Projects/_index.yaml'
 * getIndexPathForType('contact')  // 'Orion/Resources/contacts/_index.yaml'
 */
export function getIndexPathForType(entityType: string): string {
  const path = INDEX_PATHS[entityType as ParaEntityType];
  if (!path) {
    throw new Error(`Unknown entity type: ${entityType}`);
  }
  return path;
}

/**
 * Get the array key name used in the index file for a given entity type
 *
 * @param entityType - The type of PARA entity
 * @returns Key name for the array in the index file (e.g., 'projects', 'contacts')
 * @throws Error for unknown entity types
 *
 * @example
 * getIndexListKey('project')  // 'projects'
 * getIndexListKey('area')     // 'areas'
 * getIndexListKey('inbox')    // 'items'
 */
export function getIndexListKey(entityType: string): string {
  const key = LIST_KEYS[entityType as ParaEntityType];
  if (!key) {
    throw new Error(`Unknown entity type: ${entityType}`);
  }
  return key;
}

/**
 * Determine the entity type from a file path
 *
 * @param path - File path (relative to home directory)
 * @returns Entity type or null if path is not a PARA path
 *
 * @example
 * getEntityTypeFromPath('Orion/Projects/test/_meta.yaml')  // 'project'
 * getEntityTypeFromPath('Orion/Resources/contacts/john.yaml')  // 'contact'
 * getEntityTypeFromPath('Documents/file.txt')  // null
 */
export function getEntityTypeFromPath(path: string): ParaEntityType | null {
  // Must start with exactly "Orion/" (case-sensitive)
  if (!path.startsWith(`${ORION_ROOT}/`)) {
    return null;
  }

  // Check Resources sub-paths FIRST (more specific before general)
  if (path.includes(`${RESOURCES_DIR}/contacts/`)) return 'contact';
  if (path.includes(`${RESOURCES_DIR}/notes/`)) return 'note';
  if (path.includes(`${RESOURCES_DIR}/templates/`)) return 'template';
  if (path.includes(`${RESOURCES_DIR}/procedures/`)) return 'procedure';
  if (path.includes(`${RESOURCES_DIR}/preferences/`)) return 'preference';

  // Check main PARA directories
  if (path.includes(`${PROJECTS_DIR}/`)) return 'project';
  if (path.includes(`${AREAS_DIR}/`)) return 'area';
  if (path.includes(`${ARCHIVE_DIR}/`)) return 'archive';
  if (path.includes(`${INBOX_DIR}/`)) return 'inbox';

  // Not a recognized PARA path
  return null;
}
