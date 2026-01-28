/**
 * Archive Directory Initialization
 * Story 4.5: Create Archive Directory
 *
 * Creates and manages the Archive directory structure for completed/inactive items.
 * Uses @tauri-apps/plugin-fs for filesystem access and YAML for serialization.
 */

import { ok, err, Result } from 'neverthrow';
import { mkdir, exists, writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/api/path';
import { stringify, parse } from 'yaml';
import { ArchiveIndexSchema, type ArchiveIndex } from './schemas/archive';
import { ORION_ROOT, ARCHIVE_DIR } from './paths';

// =============================================================================
// Constants
// =============================================================================

/** Archive index filename */
export const ARCHIVE_INDEX_FILENAME = '_index.yaml';

/** Full archive path relative to home directory */
const ARCHIVE_PATH = `${ORION_ROOT}/${ARCHIVE_DIR}`;

/** Projects subdirectory within archive */
const ARCHIVE_PROJECTS_PATH = `${ARCHIVE_PATH}/projects`;

/** Areas subdirectory within archive */
const ARCHIVE_AREAS_PATH = `${ARCHIVE_PATH}/areas`;

/** Full archive index path relative to home directory */
const ARCHIVE_INDEX_PATH = `${ARCHIVE_PATH}/${ARCHIVE_INDEX_FILENAME}`;

// =============================================================================
// Types
// =============================================================================

/**
 * Result of archive initialization
 */
export interface ArchiveInitResult {
  /** List of directories that were created */
  created: string[];
  /** List of directories that already existed */
  skipped: string[];
  /** Whether the index file was created */
  indexCreated: boolean;
}

/**
 * Error during archive operations
 */
export interface ArchiveError {
  /** Error code for categorization */
  code:
    | 'FS_ERROR'
    | 'WRITE_ERROR'
    | 'READ_ERROR'
    | 'NOT_FOUND'
    | 'PARSE_ERROR'
    | 'VALIDATION_ERROR';
  /** Human-readable error message */
  message: string;
  /** Original error, if any */
  cause?: Error | unknown;
}

// =============================================================================
// Directory Creation Helpers
// =============================================================================

/**
 * Create a directory if it doesn't exist
 *
 * @param path - Path relative to home directory
 * @returns true if created, false if already existed
 */
async function ensureDirectory(path: string): Promise<boolean> {
  const pathExists = await exists(path, { baseDir: BaseDirectory.Home });

  if (pathExists) {
    console.log(`[PARA] Directory already exists: ~/${path}`);
    return false;
  }

  await mkdir(path, {
    baseDir: BaseDirectory.Home,
    recursive: true,
  });

  console.log(`[PARA] Created directory: ~/${path}`);
  return true;
}

// =============================================================================
// Default Index Generator
// =============================================================================

/**
 * Get the default archive index
 *
 * Creates a new index object with:
 * - version: 1
 * - generated_at: current timestamp
 * - archived_items: empty array
 * - stats: all zeroed
 *
 * @returns A valid ArchiveIndex object
 *
 * @example
 * const index = getDefaultArchiveIndex();
 * console.log(index.version); // 1
 */
export function getDefaultArchiveIndex(): ArchiveIndex {
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
// Main Initialization Function
// =============================================================================

/**
 * Initialize the Archive directory structure
 *
 * Creates the following directories and files if they don't exist:
 * - ~/Orion/Archive/ (root archive directory)
 * - ~/Orion/Archive/projects/ (archived projects)
 * - ~/Orion/Archive/areas/ (archived areas)
 * - ~/Orion/Archive/_index.yaml (archive index)
 *
 * The archive structure is flat (no YYYY-MM/ date-based subdirectories).
 *
 * This function is idempotent - calling it multiple times will not error
 * if directories/files already exist.
 *
 * @returns Result with created directories info or error
 *
 * @example
 * const result = await initArchiveDirectory();
 * if (result.isOk()) {
 *   console.log('Created:', result.value.created);
 * } else {
 *   console.error('Failed:', result.error.message);
 * }
 */
export async function initArchiveDirectory(): Promise<
  Result<ArchiveInitResult, ArchiveError>
> {
  const created: string[] = [];
  const skipped: string[] = [];
  let indexCreated = false;

  try {
    // Create archive root directory: ~/Orion/Archive
    const archiveCreated = await ensureDirectory(ARCHIVE_PATH);
    if (archiveCreated) {
      created.push(ARCHIVE_PATH);
    } else {
      skipped.push(ARCHIVE_PATH);
    }

    // Create projects subdirectory: ~/Orion/Archive/projects
    const projectsCreated = await ensureDirectory(ARCHIVE_PROJECTS_PATH);
    if (projectsCreated) {
      created.push(ARCHIVE_PROJECTS_PATH);
    } else {
      skipped.push(ARCHIVE_PROJECTS_PATH);
    }

    // Create areas subdirectory: ~/Orion/Archive/areas
    const areasCreated = await ensureDirectory(ARCHIVE_AREAS_PATH);
    if (areasCreated) {
      created.push(ARCHIVE_AREAS_PATH);
    } else {
      skipped.push(ARCHIVE_AREAS_PATH);
    }

    // Create _index.yaml if it doesn't exist
    const indexExists = await exists(ARCHIVE_INDEX_PATH, {
      baseDir: BaseDirectory.Home,
    });

    if (!indexExists) {
      const defaultIndex = getDefaultArchiveIndex();
      const yamlContent = stringify(defaultIndex);

      try {
        await writeTextFile(ARCHIVE_INDEX_PATH, yamlContent, {
          baseDir: BaseDirectory.Home,
        });
        console.log(`[PARA] Created archive index: ~/${ARCHIVE_INDEX_PATH}`);
        indexCreated = true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        console.error(`[PARA] Archive index write failed: ${errorMessage}`);

        return err({
          code: 'WRITE_ERROR',
          message: `Failed to write archive index: ${errorMessage}`,
          cause: error,
        });
      }
    } else {
      console.log(`[PARA] Archive index already exists: ~/${ARCHIVE_INDEX_PATH}`);
    }

    console.log(
      `[PARA] Archive initialization complete. Created: ${created.length}, Skipped: ${skipped.length}`
    );

    return ok({ created, skipped, indexCreated });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error(`[PARA] Archive initialization failed: ${errorMessage}`);

    return err({
      code: 'FS_ERROR',
      message: `Failed to initialize archive directories: ${errorMessage}`,
      cause: error,
    });
  }
}

// =============================================================================
// Load Archive Index
// =============================================================================

/**
 * Load and validate the archive index file
 *
 * Reads ~/Orion/Archive/_index.yaml, parses YAML, and validates against schema.
 *
 * @returns Result with validated index or error
 *
 * @example
 * const result = await loadArchiveIndex();
 * if (result.isOk()) {
 *   console.log('Archived items:', result.value.archived_items.length);
 * }
 */
export async function loadArchiveIndex(): Promise<
  Result<ArchiveIndex, ArchiveError>
> {
  try {
    // Check if index exists
    const indexExists = await exists(ARCHIVE_INDEX_PATH, {
      baseDir: BaseDirectory.Home,
    });

    if (!indexExists) {
      return err({
        code: 'NOT_FOUND',
        message: `Archive index not found: ~/${ARCHIVE_INDEX_PATH}`,
      });
    }

    // Read file content
    let content: string;
    try {
      content = await readTextFile(ARCHIVE_INDEX_PATH, {
        baseDir: BaseDirectory.Home,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return err({
        code: 'READ_ERROR',
        message: `Failed to read archive index: ${errorMessage}`,
        cause: error,
      });
    }

    // Parse YAML
    let parsed: unknown;
    try {
      parsed = parse(content);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return err({
        code: 'PARSE_ERROR',
        message: `Failed to parse archive index YAML: ${errorMessage}`,
        cause: error,
      });
    }

    // Validate against schema
    const result = ArchiveIndexSchema.safeParse(parsed);

    if (!result.success) {
      return err({
        code: 'VALIDATION_ERROR',
        message: `Archive index validation failed: ${result.error.message}`,
        cause: result.error,
      });
    }

    console.log(`[PARA] Loaded archive index from ~/${ARCHIVE_INDEX_PATH}`);

    return ok(result.data);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    return err({
      code: 'FS_ERROR',
      message: `Unexpected error loading archive index: ${errorMessage}`,
      cause: error,
    });
  }
}
