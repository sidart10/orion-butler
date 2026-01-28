/**
 * Areas Directory Initialization
 * Story 4.3: Create Areas Directory
 *
 * Creates the ~/Orion/Areas directory and initializes the _index.yaml file.
 * Uses @tauri-apps/plugin-fs for filesystem access.
 */

import { ok, err, Result } from 'neverthrow';
import { mkdir, exists, writeTextFile } from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/api/path';
import yaml from 'js-yaml';
import { getOrionPaths } from './paths';
import type { AreaIndex } from './schemas/area';

// =============================================================================
// Constants
// =============================================================================

/** Index filename for the areas directory */
export const AREAS_INDEX_FILENAME = '_index.yaml';

// =============================================================================
// Types
// =============================================================================

/**
 * Result of Areas directory initialization
 */
export interface AreasInitResult {
  /** List of items that were created */
  created: string[];
  /** List of items that already existed (skipped) */
  skipped: string[];
}

/**
 * Error during Areas initialization
 */
export interface AreasInitError {
  /** Error code for categorization */
  code: 'FS_ERROR' | 'PERMISSION_ERROR' | 'UNKNOWN_ERROR';
  /** Human-readable error message */
  message: string;
  /** Original error, if any */
  cause?: Error | unknown;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Create the default areas index content
 *
 * @returns Default AreaIndex object
 */
function createDefaultAreasIndex(): AreaIndex {
  const now = new Date().toISOString();

  return {
    version: 1,
    updated_at: now,
    areas: [],
  };
}

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
 * Create the index file if it doesn't exist
 *
 * @param path - Path relative to home directory
 * @param content - Content to write
 * @returns true if created, false if already existed
 */
async function ensureIndexFile(path: string, content: string): Promise<boolean> {
  const pathExists = await exists(path, { baseDir: BaseDirectory.Home });

  if (pathExists) {
    console.log(`[PARA] Index file already exists: ~/${path}`);
    return false;
  }

  await writeTextFile(path, content, {
    baseDir: BaseDirectory.Home,
  });

  console.log(`[PARA] Created index file: ~/${path}`);
  return true;
}

// =============================================================================
// Main Initialization Function
// =============================================================================

/**
 * Initialize the Areas directory
 *
 * Creates the following if they don't exist:
 * - ~/Orion/Areas/ (directory)
 * - ~/Orion/Areas/_index.yaml (index file)
 *
 * The _index.yaml file is created with:
 * - version: 1
 * - updated_at: current ISO 8601 timestamp
 * - areas: [] (empty array)
 *
 * This function is idempotent - calling it multiple times will not error
 * if the directory or index file already exist.
 *
 * @returns Result with created items info or error
 *
 * @example
 * const result = await initAreasDirectory();
 * if (result.isOk()) {
 *   console.log('Created:', result.value.created);
 * } else {
 *   console.error('Failed:', result.error.message);
 * }
 */
export async function initAreasDirectory(): Promise<Result<AreasInitResult, AreasInitError>> {
  const created: string[] = [];
  const skipped: string[] = [];

  try {
    const paths = getOrionPaths();

    // Create areas directory: ~/Orion/Areas
    const dirPath = paths.areas;
    const dirCreated = await ensureDirectory(dirPath);
    if (dirCreated) {
      created.push(dirPath);
    } else {
      skipped.push(dirPath);
    }

    // Create index file: ~/Orion/Areas/_index.yaml
    const indexPath = `${dirPath}/${AREAS_INDEX_FILENAME}`;
    const indexContent = createDefaultAreasIndex();
    const yamlContent = yaml.dump(indexContent, {
      indent: 2,
      lineWidth: -1, // No line wrapping
      noRefs: true,
    });

    const indexCreated = await ensureIndexFile(indexPath, yamlContent);
    if (indexCreated) {
      created.push(indexPath);
    } else {
      skipped.push(indexPath);
    }

    console.log(`[PARA] Areas initialization complete. Created: ${created.length}, Skipped: ${skipped.length}`);

    return ok({ created, skipped });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error(`[PARA] Areas initialization failed: ${errorMessage}`);

    return err({
      code: 'FS_ERROR',
      message: `Failed to initialize Areas directory: ${errorMessage}`,
      cause: error,
    });
  }
}
