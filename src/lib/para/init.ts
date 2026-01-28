/**
 * PARA Directory Initialization
 * Story 4.1a: Create PARA Root Directory Structure
 *
 * Creates the Orion PARA filesystem structure in the user's home directory.
 * Uses @tauri-apps/plugin-fs for filesystem access.
 */

import { ok, err, Result } from 'neverthrow';
import { mkdir, exists } from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/api/path';
import { ORION_ROOT, ORION_SYSTEM_DIR } from './paths';

// =============================================================================
// Types
// =============================================================================

/**
 * Result of PARA initialization
 */
export interface ParaInitResult {
  /** List of directories that were created */
  created: string[];
  /** List of directories that already existed */
  skipped: string[];
}

/**
 * Error during PARA initialization
 */
export interface ParaInitError {
  /** Error code for categorization */
  code: 'FS_ERROR' | 'PERMISSION_ERROR' | 'UNKNOWN_ERROR';
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
// Main Initialization Function
// =============================================================================

/**
 * Initialize the PARA root directory structure
 *
 * Creates the following directories if they don't exist:
 * - ~/Orion/ (root)
 * - ~/Orion/.orion/ (system metadata)
 *
 * This function is idempotent - calling it multiple times will not error
 * if directories already exist.
 *
 * @returns Result with created directories info or error
 *
 * @example
 * const result = await initParaRoot();
 * if (result.isOk()) {
 *   console.log('Created:', result.value.created);
 * } else {
 *   console.error('Failed:', result.error.message);
 * }
 */
export async function initParaRoot(): Promise<Result<ParaInitResult, ParaInitError>> {
  const created: string[] = [];
  const skipped: string[] = [];

  try {
    // Create root directory: ~/Orion
    const rootPath = ORION_ROOT;
    const rootCreated = await ensureDirectory(rootPath);
    if (rootCreated) {
      created.push(rootPath);
    } else {
      skipped.push(rootPath);
    }

    // Create system directory: ~/Orion/.orion
    const systemPath = `${ORION_ROOT}/${ORION_SYSTEM_DIR}`;
    const systemCreated = await ensureDirectory(systemPath);
    if (systemCreated) {
      created.push(systemPath);
    } else {
      skipped.push(systemPath);
    }

    console.log(`[PARA] Initialization complete. Created: ${created.length}, Skipped: ${skipped.length}`);

    return ok({ created, skipped });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error(`[PARA] Initialization failed: ${errorMessage}`);

    return err({
      code: 'FS_ERROR',
      message: `Failed to initialize PARA directories: ${errorMessage}`,
      cause: error,
    });
  }
}
