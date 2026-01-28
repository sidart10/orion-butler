/**
 * Contacts Subdirectory Initialization
 * Story 4.10: Initialize Contacts Subdirectory
 *
 * Creates the contacts subdirectory index file within ~/Orion/Resources/contacts/.
 * The directory itself is created by resources.ts (Story 4.4).
 * Uses @tauri-apps/plugin-fs for filesystem access.
 */

import { ok, err, Result } from 'neverthrow';
import { writeTextFile, exists } from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/api/path';
import { stringify } from 'yaml';
import { ORION_ROOT, RESOURCES_DIR } from './paths';
import { RESOURCES_CONTACTS_DIR } from './resources';
import type { ContactsSubdirIndex } from './schemas/contact';

// =============================================================================
// Constants
// =============================================================================

/** Index filename for the contacts subdirectory */
export const CONTACTS_INDEX_FILENAME = '_index.yaml';

/** Full contacts path relative to home directory */
const CONTACTS_PATH = `${ORION_ROOT}/${RESOURCES_DIR}/${RESOURCES_CONTACTS_DIR}`;

/** Full index file path relative to home directory */
const INDEX_PATH = `${CONTACTS_PATH}/${CONTACTS_INDEX_FILENAME}`;

// =============================================================================
// Types
// =============================================================================

/**
 * Result of Contacts index initialization
 */
export interface ContactsIndexInitResult {
  /** Whether the index file was created (false if already existed) */
  created: boolean;
  /** Path to the index file */
  indexPath: string;
}

/**
 * Error during Contacts index initialization
 */
export interface ContactsIndexInitError {
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
 * Get the default empty contacts subdirectory index
 *
 * Creates a new index object with:
 * - version: 1
 * - generated_at: current timestamp
 * - contacts: empty array
 * - stats: all zeros
 *
 * @returns A valid ContactsSubdirIndex object
 */
function getDefaultContactsIndex(): ContactsSubdirIndex {
  return {
    version: 1,
    generated_at: new Date().toISOString(),
    contacts: [],
    stats: {
      total: 0,
      people: 0,
      organizations: 0,
    },
  };
}

// =============================================================================
// Main Initialization Function
// =============================================================================

/**
 * Initialize the Contacts subdirectory index file
 *
 * Creates ~/Orion/Resources/contacts/_index.yaml if it doesn't exist.
 * The contacts directory itself is created by initResourcesDirectory() in resources.ts.
 *
 * This function is idempotent - calling it multiple times will not error
 * if the index file already exists.
 *
 * @returns Result with creation info or error
 *
 * @example
 * const result = await initContactsIndex();
 * if (result.isOk()) {
 *   console.log('Index at:', result.value.indexPath);
 *   console.log('Created:', result.value.created);
 * } else {
 *   console.error('Failed:', result.error.message);
 * }
 */
export async function initContactsIndex(): Promise<
  Result<ContactsIndexInitResult, ContactsIndexInitError>
> {
  try {
    // Check if index file already exists
    const indexExists = await exists(INDEX_PATH, {
      baseDir: BaseDirectory.Home,
    });

    if (indexExists) {
      console.log(`[PARA] Contacts index already exists: ~/${INDEX_PATH}`);
      return ok({
        created: false,
        indexPath: INDEX_PATH,
      });
    }

    // Create default index
    const index = getDefaultContactsIndex();
    const yamlContent = stringify(index);

    try {
      await writeTextFile(INDEX_PATH, yamlContent, {
        baseDir: BaseDirectory.Home,
      });
      console.log(`[PARA] Created contacts index: ~/${INDEX_PATH}`);
      return ok({
        created: true,
        indexPath: INDEX_PATH,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      console.error(`[PARA] Contacts index write failed: ${errorMessage}`);

      return err({
        code: 'WRITE_ERROR',
        message: `Failed to write contacts index file: ${errorMessage}`,
        cause: error,
      });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error(`[PARA] Contacts index initialization failed: ${errorMessage}`);

    return err({
      code: 'FS_ERROR',
      message: `Failed to initialize contacts index: ${errorMessage}`,
      cause: error,
    });
  }
}
