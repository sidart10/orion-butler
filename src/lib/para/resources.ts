/**
 * Resources Directory Initialization
 * Story 4.4: Create Resources Directory
 *
 * Creates the Orion Resources directory structure with subdirectories and initializes the index file.
 * Uses @tauri-apps/plugin-fs for filesystem access.
 */

import { ok, err, Result } from 'neverthrow';
import { mkdir, writeTextFile, exists } from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/api/path';
import { stringify } from 'yaml';
import { ORION_ROOT, RESOURCES_DIR } from './paths';
import type { ResourcesIndex } from './schemas/resources';

// =============================================================================
// Constants
// =============================================================================

/** Index filename for the resources directory */
export const RESOURCES_INDEX_FILENAME = '_index.yaml';

/** Contacts subdirectory for storing contact information */
export const RESOURCES_CONTACTS_DIR = 'contacts';

/** Templates subdirectory for reusable templates */
export const RESOURCES_TEMPLATES_DIR = 'templates';

/** Procedures subdirectory for standard operating procedures */
export const RESOURCES_PROCEDURES_DIR = 'procedures';

/** Preferences subdirectory for app/tool preferences */
export const RESOURCES_PREFERENCES_DIR = 'preferences';

/** Notes subdirectory for reference notes */
export const RESOURCES_NOTES_DIR = 'notes';

/** All resource subdirectories */
const RESOURCE_SUBDIRS = [
  RESOURCES_CONTACTS_DIR,
  RESOURCES_TEMPLATES_DIR,
  RESOURCES_PROCEDURES_DIR,
  RESOURCES_PREFERENCES_DIR,
  RESOURCES_NOTES_DIR,
] as const;

/** Full resources path relative to home directory */
const RESOURCES_PATH = `${ORION_ROOT}/${RESOURCES_DIR}`;

/** Full index file path relative to home directory */
const INDEX_PATH = `${RESOURCES_PATH}/${RESOURCES_INDEX_FILENAME}`;

// =============================================================================
// Types
// =============================================================================

/**
 * Result of Resources directory initialization
 */
export interface ResourcesInitResult {
  /** List of directories/files that were created */
  created: string[];
  /** List of directories/files that already existed */
  skipped: string[];
  /** Path to the index file */
  indexPath: string;
}

/**
 * Error during Resources initialization
 */
export interface ResourcesInitError {
  /** Error code for categorization */
  code: 'FS_ERROR' | 'WRITE_ERROR' | 'UNKNOWN_ERROR';
  /** Human-readable error message */
  message: string;
  /** Original error, if any */
  cause?: Error | unknown;
}

// =============================================================================
// Helper Functions
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

/**
 * Get the default empty resources index
 *
 * Creates a new index object with:
 * - version: 1
 * - updated_at: current timestamp
 * - subdirectories: list of all resource subdirectory names
 *
 * @returns A valid ResourcesIndex object
 */
function getDefaultResourcesIndex(): ResourcesIndex {
  return {
    version: 1,
    updated_at: new Date().toISOString(),
    subdirectories: [...RESOURCE_SUBDIRS],
  };
}

// =============================================================================
// Main Initialization Function
// =============================================================================

/**
 * Initialize the Resources directory structure
 *
 * Creates the following if they don't exist:
 * - ~/Orion/Resources/ (resources root)
 * - ~/Orion/Resources/contacts/ (contact information)
 * - ~/Orion/Resources/templates/ (reusable templates)
 * - ~/Orion/Resources/procedures/ (SOPs)
 * - ~/Orion/Resources/preferences/ (app preferences)
 * - ~/Orion/Resources/notes/ (reference notes)
 * - ~/Orion/Resources/_index.yaml (index file)
 *
 * This function is idempotent - calling it multiple times will not error
 * if directories or files already exist.
 *
 * @returns Result with created directories info or error
 *
 * @example
 * const result = await initResourcesDirectory();
 * if (result.isOk()) {
 *   console.log('Created:', result.value.created);
 *   console.log('Index at:', result.value.indexPath);
 * } else {
 *   console.error('Failed:', result.error.message);
 * }
 */
export async function initResourcesDirectory(): Promise<
  Result<ResourcesInitResult, ResourcesInitError>
> {
  const created: string[] = [];
  const skipped: string[] = [];

  try {
    // Create main resources directory: ~/Orion/Resources
    const mainCreated = await ensureDirectory(RESOURCES_PATH);
    if (mainCreated) {
      created.push(RESOURCES_PATH);
    } else {
      skipped.push(RESOURCES_PATH);
    }

    // Create all subdirectories
    for (const subdir of RESOURCE_SUBDIRS) {
      const subdirPath = `${RESOURCES_PATH}/${subdir}`;
      const subdirCreated = await ensureDirectory(subdirPath);
      if (subdirCreated) {
        created.push(subdirPath);
      } else {
        skipped.push(subdirPath);
      }
    }

    // Create index file: ~/Orion/Resources/_index.yaml
    const indexExists = await exists(INDEX_PATH, {
      baseDir: BaseDirectory.Home,
    });

    if (indexExists) {
      console.log(`[PARA] Index file already exists: ~/${INDEX_PATH}`);
      skipped.push(INDEX_PATH);
    } else {
      // Create default index
      const index = getDefaultResourcesIndex();
      const yamlContent = stringify(index);

      try {
        await writeTextFile(INDEX_PATH, yamlContent, {
          baseDir: BaseDirectory.Home,
        });
        console.log(`[PARA] Created index file: ~/${INDEX_PATH}`);
        created.push(INDEX_PATH);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        console.error(`[PARA] Index file write failed: ${errorMessage}`);

        return err({
          code: 'WRITE_ERROR',
          message: `Failed to write index file: ${errorMessage}`,
          cause: error,
        });
      }
    }

    console.log(
      `[PARA] Resources initialization complete. Created: ${created.length}, Skipped: ${skipped.length}`
    );

    return ok({
      created,
      skipped,
      indexPath: INDEX_PATH,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error(`[PARA] Resources initialization failed: ${errorMessage}`);

    return err({
      code: 'FS_ERROR',
      message: `Failed to initialize Resources directory: ${errorMessage}`,
      cause: error,
    });
  }
}
