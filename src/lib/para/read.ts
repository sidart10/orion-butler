/**
 * PARA Entity Read Access
 * Story 4.12: Agent Read Access to PARA
 *
 * Provides a generic function to read and validate PARA entities from YAML files.
 */

import { Result, ok, err } from 'neverthrow';
import { readTextFile, exists } from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/api/path';
import { parse } from 'yaml';
import type { z } from 'zod';

// =============================================================================
// Types (exported for tests to import)
// =============================================================================

/**
 * Options for reading PARA entities
 */
export interface ReadOptions {
  /** Whether to validate against the schema (default: true) */
  validate?: boolean;
}

/**
 * Error during PARA entity read operations
 */
export interface ParaReadError {
  /** Error code for categorization */
  code: 'NOT_FOUND' | 'READ_ERROR' | 'PARSE_ERROR' | 'VALIDATION_ERROR' | 'FS_ERROR';
  /** Human-readable error message */
  message: string;
  /** Original error, if any */
  cause?: unknown;
}

// =============================================================================
// Functions
// =============================================================================

/**
 * Read and validate a PARA entity from a YAML file
 *
 * @param path - Path to the YAML file (relative to home directory)
 * @param schema - Zod schema for validation
 * @param options - Read options (optional)
 * @returns Result with parsed entity or error
 *
 * @example
 * const result = await readParaEntity(
 *   'Orion/Projects/test/_meta.yaml',
 *   ProjectMetaSchema
 * );
 * if (result.isOk()) {
 *   console.log(result.value.name);
 * }
 */
export async function readParaEntity<T>(
  path: string,
  schema: z.ZodSchema<T>,
  options: ReadOptions = {}
): Promise<Result<T, ParaReadError>> {
  const { validate = true } = options;

  try {
    // 1. Check if file exists
    const fileExists = await exists(path, { baseDir: BaseDirectory.Home });
    if (!fileExists) {
      return err({ code: 'NOT_FOUND', message: `File not found: ~/${path}` });
    }

    // 2. Read file content
    let content: string;
    try {
      content = await readTextFile(path, { baseDir: BaseDirectory.Home });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return err({
        code: 'READ_ERROR',
        message: `Failed to read file: ${errorMessage}`,
        cause: error,
      });
    }

    // 3. Parse YAML
    let parsed: unknown;
    try {
      parsed = parse(content);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return err({
        code: 'PARSE_ERROR',
        message: `Failed to parse YAML: ${errorMessage}`,
        cause: error,
      });
    }

    // 4. Validate against schema (optional)
    if (validate) {
      const result = schema.safeParse(parsed);
      if (!result.success) {
        return err({
          code: 'VALIDATION_ERROR',
          message: `Validation failed: ${result.error.message}`,
          cause: result.error,
        });
      }
      return ok(result.data);
    }

    return ok(parsed as T);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return err({
      code: 'FS_ERROR',
      message: `Unexpected error: ${errorMessage}`,
      cause: error,
    });
  }
}
