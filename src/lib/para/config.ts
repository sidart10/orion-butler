/**
 * Orion Config Functions
 * Story 4.1b: Initialize Orion Config
 *
 * Provides functions for creating, loading, and managing the Orion config file.
 * Uses @tauri-apps/plugin-fs for filesystem access and YAML for serialization.
 */

import { ok, err, Result } from 'neverthrow';
import { writeTextFile, readTextFile, exists } from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/api/path';
import { stringify, parse } from 'yaml';
import { OrionConfigSchema, type OrionConfig } from './schemas/config';
import { ORION_ROOT, ORION_SYSTEM_DIR } from './paths';

// =============================================================================
// Constants
// =============================================================================

/** Config filename */
export const CONFIG_FILENAME = 'config.yaml';

/** Full config path relative to home directory */
const CONFIG_PATH = `${ORION_ROOT}/${ORION_SYSTEM_DIR}/${CONFIG_FILENAME}`;

// =============================================================================
// Types
// =============================================================================

/**
 * Result of config initialization
 */
export interface ConfigInitResult {
  /** Whether the config file was created (false if already existed) */
  created: boolean;
  /** Path to the config file (relative to home) */
  path: string;
}

/**
 * Error during config operations
 */
export interface ConfigError {
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
// Config Functions
// =============================================================================

/**
 * Get the default Orion configuration
 *
 * Creates a new config object with:
 * - version: 1
 * - created_at: current timestamp
 * - para_root: "~/Orion"
 * - preferences: default values
 *
 * @returns A valid OrionConfig object
 *
 * @example
 * const config = getDefaultConfig();
 * console.log(config.version); // 1
 */
export function getDefaultConfig(): OrionConfig {
  return {
    version: 1,
    created_at: new Date().toISOString(),
    para_root: '~/Orion',
    preferences: {
      theme: 'system',
      archive_after_days: 30,
    },
  };
}

/**
 * Initialize the Orion config file
 *
 * Creates ~/Orion/.orion/config.yaml with default values if it doesn't exist.
 * This function is idempotent - calling it multiple times will not overwrite
 * an existing config file.
 *
 * @returns Result with creation info or error
 *
 * @example
 * const result = await initOrionConfig();
 * if (result.isOk()) {
 *   console.log(result.value.created ? 'Created' : 'Already exists');
 * }
 */
export async function initOrionConfig(): Promise<
  Result<ConfigInitResult, ConfigError>
> {
  // Check if config already exists
  let configExists: boolean;
  try {
    configExists = await exists(CONFIG_PATH, {
      baseDir: BaseDirectory.Home,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error(`[PARA] Config check failed: ${errorMessage}`);

    return err({
      code: 'FS_ERROR',
      message: `Failed to check config existence: ${errorMessage}`,
      cause: error,
    });
  }

  if (configExists) {
    console.log(`[PARA] Config file already exists: ~/${CONFIG_PATH}`);
    return ok({ created: false, path: CONFIG_PATH });
  }

  // Create default config
  const config = getDefaultConfig();

  // Serialize to YAML
  const yamlContent = stringify(config);

  // Write to file
  try {
    await writeTextFile(CONFIG_PATH, yamlContent, {
      baseDir: BaseDirectory.Home,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error(`[PARA] Config write failed: ${errorMessage}`);

    return err({
      code: 'WRITE_ERROR',
      message: `Failed to write config file: ${errorMessage}`,
      cause: error,
    });
  }

  console.log(`[PARA] Created config file: ~/${CONFIG_PATH}`);

  return ok({ created: true, path: CONFIG_PATH });
}

/**
 * Load and validate the Orion config file
 *
 * Reads ~/Orion/.orion/config.yaml, parses YAML, and validates against schema.
 * Applies defaults for any missing optional fields.
 *
 * @returns Result with validated config or error
 *
 * @example
 * const result = await loadConfig();
 * if (result.isOk()) {
 *   console.log(result.value.preferences.theme);
 * }
 */
export async function loadConfig(): Promise<Result<OrionConfig, ConfigError>> {
  try {
    // Check if config exists
    const configExists = await exists(CONFIG_PATH, {
      baseDir: BaseDirectory.Home,
    });

    if (!configExists) {
      return err({
        code: 'NOT_FOUND',
        message: `Config file not found: ~/${CONFIG_PATH}`,
      });
    }

    // Read file content
    let content: string;
    try {
      content = await readTextFile(CONFIG_PATH, {
        baseDir: BaseDirectory.Home,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return err({
        code: 'READ_ERROR',
        message: `Failed to read config file: ${errorMessage}`,
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
        message: `Failed to parse config YAML: ${errorMessage}`,
        cause: error,
      });
    }

    // Validate against schema
    const result = OrionConfigSchema.safeParse(parsed);

    if (!result.success) {
      return err({
        code: 'VALIDATION_ERROR',
        message: `Config validation failed: ${result.error.message}`,
        cause: result.error,
      });
    }

    console.log(`[PARA] Loaded config from ~/${CONFIG_PATH}`);

    return ok(result.data);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    return err({
      code: 'FS_ERROR',
      message: `Unexpected error loading config: ${errorMessage}`,
      cause: error,
    });
  }
}
