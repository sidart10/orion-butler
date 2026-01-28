/**
 * Inbox Directory Initialization
 * Story 4.6: Create Inbox Directory
 *
 * Creates the Orion Inbox directory structure and initializes the queue file.
 * Uses @tauri-apps/plugin-fs for filesystem access.
 */

import { ok, err, Result } from 'neverthrow';
import { mkdir, writeTextFile, exists } from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/api/path';
import { stringify } from 'yaml';
import { ORION_ROOT, INBOX_DIR } from './paths';
import type { InboxQueue } from './schemas/inbox';

// =============================================================================
// Constants
// =============================================================================

/** Queue filename for the inbox */
export const INBOX_QUEUE_FILENAME = '_queue.yaml';

/** Items subdirectory for individual captures */
export const INBOX_ITEMS_DIR = 'items';

/** Full inbox path relative to home directory */
const INBOX_PATH = `${ORION_ROOT}/${INBOX_DIR}`;

/** Full items path relative to home directory */
const ITEMS_PATH = `${INBOX_PATH}/${INBOX_ITEMS_DIR}`;

/** Full queue file path relative to home directory */
const QUEUE_PATH = `${INBOX_PATH}/${INBOX_QUEUE_FILENAME}`;

// =============================================================================
// Types
// =============================================================================

/**
 * Result of Inbox initialization
 */
export interface InboxInitResult {
  /** List of directories/files that were created */
  created: string[];
  /** List of directories/files that already existed */
  skipped: string[];
  /** Path to the queue file */
  queuePath: string;
}

/**
 * Error during Inbox initialization
 */
export interface InboxInitError {
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
 * Get the default empty inbox queue
 *
 * Creates a new queue object with:
 * - version: 1
 * - updated_at: current timestamp
 * - items: empty array
 * - stats: all zeros with by_type breakdown
 *
 * @returns A valid InboxQueue object
 */
function getDefaultInboxQueue(): InboxQueue {
  return {
    version: 1,
    updated_at: new Date().toISOString(),
    items: [],
    stats: {
      total: 0,
      unprocessed: 0,
      by_type: {
        task: 0,
        note: 0,
        idea: 0,
        reference: 0,
        capture: 0,
      },
    },
  };
}

// =============================================================================
// Main Initialization Function
// =============================================================================

/**
 * Initialize the Inbox directory structure
 *
 * Creates the following if they don't exist:
 * - ~/Orion/Inbox/ (inbox root)
 * - ~/Orion/Inbox/items/ (subdirectory for individual captures)
 * - ~/Orion/Inbox/_queue.yaml (queue file with empty items)
 *
 * This function is idempotent - calling it multiple times will not error
 * if directories or files already exist.
 *
 * @returns Result with created directories info or error
 *
 * @example
 * const result = await initInboxDirectory();
 * if (result.isOk()) {
 *   console.log('Created:', result.value.created);
 *   console.log('Queue at:', result.value.queuePath);
 * } else {
 *   console.error('Failed:', result.error.message);
 * }
 */
export async function initInboxDirectory(): Promise<
  Result<InboxInitResult, InboxInitError>
> {
  const created: string[] = [];
  const skipped: string[] = [];

  try {
    // Create inbox directory: ~/Orion/Inbox
    const inboxCreated = await ensureDirectory(INBOX_PATH);
    if (inboxCreated) {
      created.push(INBOX_PATH);
    } else {
      skipped.push(INBOX_PATH);
    }

    // Create items subdirectory: ~/Orion/Inbox/items
    const itemsCreated = await ensureDirectory(ITEMS_PATH);
    if (itemsCreated) {
      created.push(ITEMS_PATH);
    } else {
      skipped.push(ITEMS_PATH);
    }

    // Create queue file: ~/Orion/Inbox/_queue.yaml
    const queueExists = await exists(QUEUE_PATH, {
      baseDir: BaseDirectory.Home,
    });

    if (queueExists) {
      console.log(`[PARA] Queue file already exists: ~/${QUEUE_PATH}`);
      skipped.push(QUEUE_PATH);
    } else {
      // Create default queue
      const queue = getDefaultInboxQueue();
      const yamlContent = stringify(queue);

      try {
        await writeTextFile(QUEUE_PATH, yamlContent, {
          baseDir: BaseDirectory.Home,
        });
        console.log(`[PARA] Created queue file: ~/${QUEUE_PATH}`);
        created.push(QUEUE_PATH);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        console.error(`[PARA] Queue file write failed: ${errorMessage}`);

        return err({
          code: 'WRITE_ERROR',
          message: `Failed to write queue file: ${errorMessage}`,
          cause: error,
        });
      }
    }

    console.log(
      `[PARA] Inbox initialization complete. Created: ${created.length}, Skipped: ${skipped.length}`
    );

    return ok({
      created,
      skipped,
      queuePath: QUEUE_PATH,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error(`[PARA] Inbox initialization failed: ${errorMessage}`);

    return err({
      code: 'FS_ERROR',
      message: `Failed to initialize Inbox directory: ${errorMessage}`,
      cause: error,
    });
  }
}
