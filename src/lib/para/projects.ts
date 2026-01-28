/**
 * PARA Projects Directory Initialization
 * Story 4.2: Create Projects Directory
 *
 * Creates the Orion Projects directory and initializes the project index.
 * Uses @tauri-apps/plugin-fs for filesystem access.
 */

import { ok, err, Result } from 'neverthrow';
import { mkdir, exists, writeTextFile } from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/api/path';
import { ORION_ROOT, PROJECTS_DIR } from './paths';
import type { ProjectIndex } from './schemas/project';
import { stringify } from 'yaml';

// =============================================================================
// Types
// =============================================================================

/**
 * Result of Projects directory initialization
 */
export interface ProjectsInitResult {
  /** List of paths that were created */
  created: string[];
  /** List of paths that already existed */
  skipped: string[];
}

/**
 * Error during Projects initialization
 */
export interface ProjectsInitError {
  /** Error code for categorization */
  code: 'FS_ERROR' | 'PERMISSION_ERROR' | 'UNKNOWN_ERROR';
  /** Human-readable error message */
  message: string;
  /** Original error, if any */
  cause?: Error | unknown;
}

// =============================================================================
// Constants
// =============================================================================

/** Path to projects directory relative to home */
const PROJECTS_PATH = `${ORION_ROOT}/${PROJECTS_DIR}`;

/** Path to projects index file relative to home */
const PROJECTS_INDEX_PATH = `${PROJECTS_PATH}/_index.yaml`;

// =============================================================================
// Helpers
// =============================================================================

/**
 * Generate initial project index content
 *
 * @returns ProjectIndex object with empty projects array
 */
function generateInitialIndex(): ProjectIndex {
  const now = new Date().toISOString();

  return {
    version: 1,
    updated_at: now,
    projects: [],
  };
}

/**
 * Serialize ProjectIndex to YAML string
 *
 * @param index - ProjectIndex object to serialize
 * @returns YAML string representation
 */
function serializeIndex(index: ProjectIndex): string {
  return stringify(index);
}

// =============================================================================
// Main Initialization Function
// =============================================================================

/**
 * Initialize the PARA Projects directory structure
 *
 * Creates the following if they don't exist:
 * - ~/Orion/Projects/ (directory)
 * - ~/Orion/Projects/_index.yaml (index file)
 *
 * This function is idempotent - calling it multiple times will not error
 * if directory/files already exist.
 *
 * @returns Result with created paths info or error
 *
 * @example
 * const result = await initProjectsDirectory();
 * if (result.isOk()) {
 *   console.log('Created:', result.value.created);
 * } else {
 *   console.error('Failed:', result.error.message);
 * }
 */
export async function initProjectsDirectory(): Promise<Result<ProjectsInitResult, ProjectsInitError>> {
  const created: string[] = [];
  const skipped: string[] = [];

  try {
    // Check if Projects directory exists
    const dirExists = await exists(PROJECTS_PATH, { baseDir: BaseDirectory.Home });

    if (dirExists) {
      console.log(`[PARA] Projects directory already exists: ~/${PROJECTS_PATH}`);
      skipped.push(PROJECTS_PATH);
    } else {
      // Create Projects directory
      await mkdir(PROJECTS_PATH, {
        baseDir: BaseDirectory.Home,
        recursive: true,
      });
      console.log(`[PARA] Created Projects directory: ~/${PROJECTS_PATH}`);
      created.push(PROJECTS_PATH);
    }

    // Check if index file exists
    const indexExists = await exists(PROJECTS_INDEX_PATH, { baseDir: BaseDirectory.Home });

    if (indexExists) {
      console.log(`[PARA] Projects index already exists: ~/${PROJECTS_INDEX_PATH}`);
      skipped.push(PROJECTS_INDEX_PATH);
    } else {
      // Create index file
      const initialIndex = generateInitialIndex();
      const indexContent = serializeIndex(initialIndex);

      await writeTextFile(PROJECTS_INDEX_PATH, indexContent, {
        baseDir: BaseDirectory.Home,
      });
      console.log(`[PARA] Created Projects index: ~/${PROJECTS_INDEX_PATH}`);
      created.push(PROJECTS_INDEX_PATH);
    }

    console.log(`[PARA] Projects initialization complete. Created: ${created.length}, Skipped: ${skipped.length}`);

    return ok({ created, skipped });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error(`[PARA] Projects initialization failed: ${errorMessage}`);

    return err({
      code: 'FS_ERROR',
      message: `Failed to initialize Projects directory: ${errorMessage}`,
      cause: error,
    });
  }
}
