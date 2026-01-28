/**
 * PARA Entity Write Access
 * Story 4.13: Agent Write Access to PARA
 *
 * TDD Phase: GREEN - Implementation to pass tests
 *
 * Provides generic functions to write PARA entities to YAML files with:
 * - Zod validation
 * - Atomic writes (temp file + rename)
 * - Backup creation
 * - Index management
 */

import { Result, ok, err } from 'neverthrow';
import {
  writeTextFile,
  readTextFile,
  exists,
  rename,
  copyFile,
  remove,
} from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/api/path';
import { stringify, parse } from 'yaml';
import type { z } from 'zod';
import {
  getEntityTypeFromPath,
  getIndexPathForType,
  getIndexListKey,
} from './index-manager';

// =============================================================================
// Types
// =============================================================================

/**
 * Options for writing PARA entities
 */
export interface WriteOptions {
  /** Whether to validate against the schema (default: true) */
  validate?: boolean;
  /** Whether to update the index file (default: true) */
  updateIndex?: boolean;
  /** Whether to create a backup of existing file (default: true) */
  createBackup?: boolean;
}

/**
 * Error during PARA entity write operations
 */
export interface ParaWriteError {
  /** Error code for categorization */
  code:
    | 'VALIDATION_ERROR'
    | 'WRITE_ERROR'
    | 'RENAME_ERROR'
    | 'BACKUP_ERROR'
    | 'NOT_PARA_PATH'
    | 'FS_ERROR'
    | 'NOT_FOUND'
    | 'DELETE_ERROR';
  /** Human-readable error message */
  message: string;
  /** Original error, if any */
  cause?: unknown;
}

/**
 * Options for deleting PARA entities
 */
export interface DeleteOptions {
  /** Whether to remove from the index file (default: true) */
  removeFromIndex?: boolean;
  /** Whether to create a backup before deleting (default: true) */
  createBackup?: boolean;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Extract the entity ID from the entity object
 * Assumes the entity has an `id` property
 */
function getEntityId(entity: unknown): string | undefined {
  if (entity && typeof entity === 'object' && 'id' in entity) {
    return (entity as { id: string }).id;
  }
  return undefined;
}

/**
 * Read and update an index file, adding an entity if not already present
 */
async function addToIndex(
  entityType: string,
  entity: unknown
): Promise<void> {
  const indexPath = getIndexPathForType(entityType);
  const listKey = getIndexListKey(entityType);

  // Read existing index
  const indexContent = await readTextFile(indexPath, { baseDir: BaseDirectory.Home });
  const indexData = parse(indexContent) as Record<string, unknown>;

  // Get the list array
  const list = (indexData[listKey] as unknown[]) || [];

  // Check if entity or entity ID already exists
  const entityId = getEntityId(entity);
  const alreadyExists = list.some((item) => {
    const itemId = getEntityId(item);
    return itemId && entityId && itemId === entityId;
  });

  if (!alreadyExists && entityId) {
    // Add entity to the list
    list.push(entity);
    indexData[listKey] = list;
    indexData.updated_at = new Date().toISOString();

    // Write updated index (using atomic write pattern)
    const tmpPath = `${indexPath}.tmp`;
    const yamlContent = stringify(indexData, { indent: 2, lineWidth: 0 });
    await writeTextFile(tmpPath, yamlContent, { baseDir: BaseDirectory.Home });
    await rename(tmpPath, indexPath, {
      oldPathBaseDir: BaseDirectory.Home,
      newPathBaseDir: BaseDirectory.Home,
    });
  }
}

/**
 * Read and update an index file, removing an entity by ID
 */
async function removeFromIndexFile(
  entityType: string,
  entityId: string
): Promise<void> {
  const indexPath = getIndexPathForType(entityType);
  const listKey = getIndexListKey(entityType);

  // Read existing index
  const indexContent = await readTextFile(indexPath, { baseDir: BaseDirectory.Home });
  const indexData = parse(indexContent) as Record<string, unknown>;

  // Get the list array
  const list = (indexData[listKey] as unknown[]) || [];

  // Filter out the entity with matching ID
  const filteredList = list.filter((item) => {
    const itemId = getEntityId(item);
    return itemId !== entityId;
  });

  // Only update if something was removed
  if (filteredList.length !== list.length) {
    indexData[listKey] = filteredList;
    indexData.updated_at = new Date().toISOString();

    // Write updated index (using atomic write pattern)
    const tmpPath = `${indexPath}.tmp`;
    const yamlContent = stringify(indexData, { indent: 2, lineWidth: 0 });
    await writeTextFile(tmpPath, yamlContent, { baseDir: BaseDirectory.Home });
    await rename(tmpPath, indexPath, {
      oldPathBaseDir: BaseDirectory.Home,
      newPathBaseDir: BaseDirectory.Home,
    });
  }
}

/**
 * Read entity ID from a YAML file
 */
async function readEntityIdFromFile(path: string): Promise<string | undefined> {
  try {
    const content = await readTextFile(path, { baseDir: BaseDirectory.Home });
    const data = parse(content) as Record<string, unknown>;
    return data.id as string | undefined;
  } catch {
    return undefined;
  }
}

// =============================================================================
// Main Functions
// =============================================================================

/**
 * Write a PARA entity to a YAML file with validation and atomic write
 *
 * Features:
 * - Validates entity against Zod schema (optional)
 * - Atomic write via temp file + rename
 * - Creates backup of existing file (optional)
 * - Updates index file (optional)
 *
 * @param path - Path to the YAML file (relative to home directory)
 * @param entity - The entity to write
 * @param schema - Zod schema for validation
 * @param options - Write options (optional)
 * @returns Result with void on success or error
 *
 * @example
 * const result = await writeParaEntity(
 *   'Orion/Projects/test/_meta.yaml',
 *   projectData,
 *   ProjectMetaSchema
 * );
 * if (result.isErr()) {
 *   console.error(result.error.message);
 * }
 */
export async function writeParaEntity<T>(
  path: string,
  entity: T,
  schema: z.ZodSchema<T>,
  options: WriteOptions = {}
): Promise<Result<void, ParaWriteError>> {
  const { validate = true, updateIndex = true, createBackup = true } = options;

  // 1. Validate entity if enabled
  if (validate) {
    const result = schema.safeParse(entity);
    if (!result.success) {
      return err({
        code: 'VALIDATION_ERROR',
        message: `Validation failed: ${result.error.message}`,
        cause: result.error,
      });
    }
  }

  // 2. Check if file exists (for backup decision) - this can fail with FS_ERROR
  let fileExists = false;
  try {
    fileExists = await exists(path, { baseDir: BaseDirectory.Home });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return err({
      code: 'FS_ERROR',
      message: `Failed to check file existence: ${msg}`,
      cause: error,
    });
  }

  // 3. Create backup if file exists and backup enabled
  if (createBackup && fileExists) {
    try {
      await copyFile(path, `${path}.bak`, {
        fromPathBaseDir: BaseDirectory.Home,
        toPathBaseDir: BaseDirectory.Home,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return err({
        code: 'BACKUP_ERROR',
        message: `Failed to create backup: ${msg}`,
        cause: error,
      });
    }
  }

  // 4. Atomic write: write to .tmp, then rename
  const tmpPath = `${path}.tmp`;
  const yamlContent = stringify(entity, { indent: 2, lineWidth: 0 });

  try {
    await writeTextFile(tmpPath, yamlContent, { baseDir: BaseDirectory.Home });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return err({
      code: 'WRITE_ERROR',
      message: `Failed to write file: ${msg}`,
      cause: error,
    });
  }

  try {
    await rename(tmpPath, path, {
      oldPathBaseDir: BaseDirectory.Home,
      newPathBaseDir: BaseDirectory.Home,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return err({
      code: 'RENAME_ERROR',
      message: `Failed to rename temp file: ${msg}`,
      cause: error,
    });
  }

  // 5. Update index if enabled
  if (updateIndex) {
    const entityType = getEntityTypeFromPath(path);
    if (entityType) {
      try {
        await addToIndex(entityType, entity);
      } catch {
        // Best-effort: don't fail the write if index update fails
      }
    }
  }

  return ok(undefined);
}

/**
 * Delete a PARA entity from the filesystem
 *
 * Features:
 * - Creates backup before deletion (optional)
 * - Removes entity from index (optional)
 *
 * @param path - Path to the YAML file (relative to home directory)
 * @param options - Delete options (optional)
 * @returns Result with void on success or error
 *
 * @example
 * const result = await deleteParaEntity('Orion/Projects/old/_meta.yaml');
 * if (result.isErr()) {
 *   console.error(result.error.message);
 * }
 */
export async function deleteParaEntity(
  path: string,
  options: DeleteOptions = {}
): Promise<Result<void, ParaWriteError>> {
  const { removeFromIndex = true, createBackup = true } = options;

  // 1. Check if file exists
  try {
    const fileExists = await exists(path, { baseDir: BaseDirectory.Home });
    if (!fileExists) {
      return err({
        code: 'NOT_FOUND',
        message: `File not found: ~/${path}`,
      });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return err({
      code: 'FS_ERROR',
      message: `Failed to check file: ${msg}`,
      cause: error,
    });
  }

  // 2. Read entity ID before deleting (needed for index removal)
  let entityId: string | undefined;
  if (removeFromIndex) {
    entityId = await readEntityIdFromFile(path);
  }

  // 3. Create backup before delete
  if (createBackup) {
    try {
      await copyFile(path, `${path}.bak`, {
        fromPathBaseDir: BaseDirectory.Home,
        toPathBaseDir: BaseDirectory.Home,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return err({
        code: 'BACKUP_ERROR',
        message: `Failed to create backup: ${msg}`,
        cause: error,
      });
    }
  }

  // 4. Delete file
  try {
    await remove(path, { baseDir: BaseDirectory.Home });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return err({
      code: 'DELETE_ERROR',
      message: `Failed to delete file: ${msg}`,
      cause: error,
    });
  }

  // 5. Remove from index if enabled
  if (removeFromIndex && entityId) {
    const entityType = getEntityTypeFromPath(path);
    if (entityType) {
      try {
        await removeFromIndexFile(entityType, entityId);
      } catch {
        // Best-effort: don't fail the delete if index update fails
      }
    }
  }

  return ok(undefined);
}
