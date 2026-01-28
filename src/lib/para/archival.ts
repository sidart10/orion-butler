/**
 * Archival Operations for PARA System
 * Story 4.17: Archive Completed Items
 *
 * Provides functions to archive completed projects and dormant areas
 * to the Archive directory with proper index management.
 */

import { exists, mkdir, rename, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { homeDir } from '@tauri-apps/api/path';
import { BaseDirectory } from '@tauri-apps/api/path';
import { stringify, parse } from 'yaml';
import type { ProjectMeta } from './schemas/project';
import type { AreaMeta } from './schemas/area';
import type { ArchivedItem, ArchiveIndex } from './schemas/archive';
import { ORION_ROOT, ARCHIVE_DIR } from './paths';

// =============================================================================
// Types
// =============================================================================

/**
 * Result of a successful archive operation
 */
export interface ArchiveResult {
  /** Destination path in archive (e.g., "Orion/Archive/projects/2026-01/my-project") */
  archived_to: string;
  /** When the item was archived (ISO 8601) */
  archived_at: string;
  /** Original path before archiving */
  original_path: string;
}

/**
 * Error during archive operations
 */
export interface ArchiveError {
  /** Error code for categorization */
  code: 'NOT_ARCHIVABLE' | 'NOT_FOUND' | 'FS_ERROR' | 'ALREADY_ARCHIVED';
  /** Human-readable error message */
  message: string;
  /** Original error, if any */
  cause?: unknown;
}

/**
 * Entity type for archival operations
 */
type ArchivableEntityType = 'project' | 'area';

/**
 * Configuration for archiving different entity types
 */
interface ArchiveConfig {
  entityType: ArchivableEntityType;
  entityLabel: string;
  reason: 'completed' | 'inactive';
  statsField: 'projects' | 'areas';
}

// =============================================================================
// Constants
// =============================================================================

/** Archive index filename */
const ARCHIVE_INDEX_FILENAME = '_index.yaml';

/** Full archive path relative to home directory */
const ARCHIVE_PATH = `${ORION_ROOT}/${ARCHIVE_DIR}`;

/** Archive configuration for projects */
const PROJECT_CONFIG: ArchiveConfig = {
  entityType: 'project',
  entityLabel: 'Project',
  reason: 'completed',
  statsField: 'projects',
};

/** Archive configuration for areas */
const AREA_CONFIG: ArchiveConfig = {
  entityType: 'area',
  entityLabel: 'Area',
  reason: 'inactive',
  statsField: 'areas',
};

// =============================================================================
// Precondition Check Functions
// =============================================================================

/**
 * Check if a project can be archived
 *
 * Only completed projects can be archived.
 *
 * @param project - The project metadata to check
 * @returns true if project can be archived, false otherwise
 */
export function canArchiveProject(project: ProjectMeta): boolean {
  return project.status === 'completed';
}

/**
 * Check if an area can be archived
 *
 * Only dormant areas can be archived.
 *
 * @param area - The area metadata to check
 * @returns true if area can be archived, false otherwise
 */
export function canArchiveArea(area: AreaMeta): boolean {
  return area.status === 'dormant';
}

// =============================================================================
// Path Helpers
// =============================================================================

/**
 * Extract YYYY-MM from an ISO timestamp
 *
 * @param updatedAt - ISO 8601 timestamp
 * @returns Year-month string (e.g., "2026-01")
 */
function extractYearMonth(updatedAt: string): string {
  const date = new Date(updatedAt);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get the archive destination path for an entity
 *
 * @param entityType - Type of entity ('project' or 'area')
 * @param name - Entity name (used as directory name)
 * @param updatedAt - ISO 8601 timestamp for YYYY-MM extraction
 * @returns Archive path (e.g., "Archive/projects/2026-01/my-project")
 */
export function getArchivePath(
  entityType: ArchivableEntityType,
  name: string,
  updatedAt: string
): string {
  const yearMonth = extractYearMonth(updatedAt);
  const subdir = entityType === 'project' ? 'projects' : 'areas';
  return `${ARCHIVE_DIR}/${subdir}/${yearMonth}/${name}`;
}

// =============================================================================
// Archive Index Management
// =============================================================================

/**
 * Read the archive index file
 *
 * @returns The archive index or a default empty index
 */
async function readArchiveIndex(): Promise<ArchiveIndex> {
  const indexPath = `${ARCHIVE_PATH}/${ARCHIVE_INDEX_FILENAME}`;

  try {
    const content = await readTextFile(indexPath, { baseDir: BaseDirectory.Home });
    if (!content) {
      return getDefaultIndex();
    }
    return parse(content) as ArchiveIndex;
  } catch {
    return getDefaultIndex();
  }
}

/**
 * Write the archive index file
 *
 * @param index - The archive index to write
 */
async function writeArchiveIndex(index: ArchiveIndex): Promise<void> {
  const indexPath = `${ARCHIVE_PATH}/${ARCHIVE_INDEX_FILENAME}`;
  const content = stringify(index);
  await writeTextFile(indexPath, content, { baseDir: BaseDirectory.Home });
}

/**
 * Get a default empty archive index
 */
function getDefaultIndex(): ArchiveIndex {
  return {
    version: 1,
    generated_at: new Date().toISOString(),
    archived_items: [],
    stats: {
      total: 0,
      projects: 0,
      areas: 0,
    },
  };
}

// =============================================================================
// Core Archive Logic (Shared)
// =============================================================================

/**
 * Common entity interface for archiving
 */
interface ArchivableEntity {
  id: string;
  name: string;
  status: string;
  updated_at: string;
}

/**
 * Core archive operation shared by project and area archiving
 *
 * @param entity - The entity to archive (project or area)
 * @param originalPath - The current path of the entity
 * @param config - Archive configuration for the entity type
 * @param canArchive - Precondition check function
 * @param expectedStatus - The status required for archiving
 * @returns Archive result on success
 * @throws ArchiveError if preconditions fail or filesystem error occurs
 */
async function archiveEntity(
  entity: ArchivableEntity,
  originalPath: string,
  config: ArchiveConfig,
  canArchive: () => boolean,
  expectedStatus: string
): Promise<ArchiveResult> {
  // Check preconditions
  if (!canArchive()) {
    const error: ArchiveError = {
      code: 'NOT_ARCHIVABLE',
      message: `${config.entityLabel} "${entity.name}" is not ${expectedStatus} (status: ${entity.status})`,
    };
    throw error;
  }

  // Check if already archived
  if (originalPath.includes('Archive/')) {
    const error: ArchiveError = {
      code: 'ALREADY_ARCHIVED',
      message: `${config.entityLabel} "${entity.name}" is already in the archive`,
    };
    throw error;
  }

  // Get archive destination
  const dirName = originalPath.split('/').pop() || entity.name;
  const archiveSubPath = getArchivePath(config.entityType, dirName, entity.updated_at);
  const archiveFullPath = `${ORION_ROOT}/${archiveSubPath}`;
  const archiveParentPath = archiveFullPath.substring(0, archiveFullPath.lastIndexOf('/'));

  // Create archive subdirectory if needed
  const archiveDirExists = await exists(archiveParentPath, { baseDir: BaseDirectory.Home });
  if (!archiveDirExists) {
    await mkdir(archiveParentPath, { baseDir: BaseDirectory.Home, recursive: true });
  }

  // Get home directory and construct full paths
  const home = await homeDir();
  const sourcePath = `${home}/${ORION_ROOT}/${originalPath}`;
  const sourcePathRelative = `${ORION_ROOT}/${originalPath}`;

  // Check if source exists
  const sourceExists = await exists(sourcePathRelative, { baseDir: BaseDirectory.Home });
  if (!sourceExists) {
    const error: ArchiveError = {
      code: 'NOT_FOUND',
      message: `${config.entityLabel} directory not found: ${originalPath}`,
    };
    throw error;
  }

  // Perform the move
  const destPath = `${home}/${archiveFullPath}`;
  await rename(sourcePath, destPath);

  const archivedAt = new Date().toISOString();

  // Update archive index
  try {
    const index = await readArchiveIndex();
    const entry: ArchivedItem = {
      id: entity.id,
      type: config.entityType,
      original_path: originalPath,
      archived_to: archiveFullPath,
      archived_at: archivedAt,
      reason: config.reason,
      title: entity.name,
    };
    index.archived_items.push(entry);
    index.stats.total += 1;
    index.stats[config.statsField] += 1;
    index.generated_at = new Date().toISOString();
    await writeArchiveIndex(index);
  } catch (cause) {
    // Rollback: move back to original location
    await rename(destPath, sourcePath);
    const error: ArchiveError = {
      code: 'FS_ERROR',
      message: 'Failed to update archive index',
      cause,
    };
    throw error;
  }

  return {
    archived_to: archiveFullPath,
    archived_at: archivedAt,
    original_path: originalPath,
  };
}

// =============================================================================
// Public Archive Operations
// =============================================================================

/**
 * Archive a completed project
 *
 * Moves the project directory to Archive/projects/YYYY-MM/ and updates
 * the archive index.
 *
 * @param project - The project metadata (must have status 'completed')
 * @param originalPath - The current path of the project (e.g., "Projects/my-project")
 * @returns Archive result on success
 * @throws ArchiveError if preconditions fail or filesystem error occurs
 */
export async function archiveProject(
  project: ProjectMeta,
  originalPath: string
): Promise<ArchiveResult> {
  return archiveEntity(
    project,
    originalPath,
    PROJECT_CONFIG,
    () => canArchiveProject(project),
    'completed'
  );
}

/**
 * Archive a dormant area
 *
 * Moves the area directory to Archive/areas/YYYY-MM/ and updates
 * the archive index.
 *
 * @param area - The area metadata (must have status 'dormant')
 * @param originalPath - The current path of the area (e.g., "Areas/my-area")
 * @returns Archive result on success
 * @throws ArchiveError if preconditions fail or filesystem error occurs
 */
export async function archiveArea(
  area: AreaMeta,
  originalPath: string
): Promise<ArchiveResult> {
  return archiveEntity(
    area,
    originalPath,
    AREA_CONFIG,
    () => canArchiveArea(area),
    'dormant'
  );
}
