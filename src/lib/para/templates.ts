/**
 * Templates Subdirectory Initialization
 * Story 4.11: Initialize Templates Subdirectory
 *
 * Creates the Orion Templates subdirectory structure with email-templates,
 * meeting-templates subdirectories and initializes the index file and starter templates.
 * Uses @tauri-apps/plugin-fs for filesystem access.
 */

import { ok, err, Result } from 'neverthrow';
import { mkdir, writeTextFile, exists } from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/api/path';
import { stringify } from 'yaml';
import { ORION_ROOT, RESOURCES_DIR } from './paths';
import { RESOURCES_TEMPLATES_DIR } from './resources';
import type { TemplatesIndex } from './schemas/templates';

// =============================================================================
// Constants
// =============================================================================

/** Index filename for the templates directory */
export const TEMPLATES_INDEX_FILENAME = '_index.yaml';

/** Email templates subdirectory */
export const TEMPLATES_EMAIL_DIR = 'email-templates';

/** Meeting templates subdirectory */
export const TEMPLATES_MEETING_DIR = 'meeting-templates';

/** Follow-up email template filename */
export const FOLLOW_UP_TEMPLATE_FILENAME = 'follow-up.md';

/** Follow-up email template content */
export const FOLLOW_UP_TEMPLATE_CONTENT = `# Follow-up Email

Subject: Following up on {{topic}}

Hi {{name}},

I wanted to follow up on {{topic}} from our conversation on {{date}}.

{{body}}

Best,
{{signature}}
`;

/** All templates subdirectories */
const TEMPLATES_SUBDIRS = [
  TEMPLATES_EMAIL_DIR,
  TEMPLATES_MEETING_DIR,
] as const;

/** Full templates path relative to home directory */
const TEMPLATES_PATH = `${ORION_ROOT}/${RESOURCES_DIR}/${RESOURCES_TEMPLATES_DIR}`;

/** Full index file path relative to home directory */
const INDEX_PATH = `${TEMPLATES_PATH}/${TEMPLATES_INDEX_FILENAME}`;

/** Full follow-up template path relative to home directory */
const FOLLOW_UP_PATH = `${TEMPLATES_PATH}/${TEMPLATES_EMAIL_DIR}/${FOLLOW_UP_TEMPLATE_FILENAME}`;

// =============================================================================
// Types
// =============================================================================

/**
 * Result of Templates directory initialization
 */
export interface TemplatesInitResult {
  /** List of directories/files that were created */
  created: string[];
  /** List of directories/files that already existed */
  skipped: string[];
  /** Path to the index file */
  indexPath: string;
  /** Paths to starter templates created */
  starterTemplates: string[];
}

/**
 * Error during Templates initialization
 */
export interface TemplatesInitError {
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
 * Create a file if it doesn't exist
 *
 * @param path - Path relative to home directory
 * @param content - File content
 * @returns true if created, false if already existed
 */
async function ensureFile(path: string, content: string): Promise<boolean> {
  const pathExists = await exists(path, { baseDir: BaseDirectory.Home });

  if (pathExists) {
    console.log(`[PARA] File already exists: ~/${path}`);
    return false;
  }

  await writeTextFile(path, content, {
    baseDir: BaseDirectory.Home,
  });

  console.log(`[PARA] Created file: ~/${path}`);
  return true;
}

/**
 * Get the default templates index
 *
 * Creates a new index object with:
 * - version: 1
 * - updated_at: current timestamp
 * - subdirectories: list of all templates subdirectory names
 *
 * @returns A valid TemplatesIndex object
 */
function getDefaultTemplatesIndex(): TemplatesIndex {
  return {
    version: 1,
    updated_at: new Date().toISOString(),
    subdirectories: [...TEMPLATES_SUBDIRS],
    description: 'Reusable templates for emails, meetings, and other documents',
    templates: [
      {
        name: 'follow-up',
        path: `${TEMPLATES_EMAIL_DIR}/${FOLLOW_UP_TEMPLATE_FILENAME}`,
        category: 'email',
        description: 'Email template for following up on conversations',
      },
    ],
  };
}

// =============================================================================
// Main Initialization Function
// =============================================================================

/**
 * Initialize the Templates subdirectory structure
 *
 * Creates the following if they don't exist:
 * - ~/Orion/Resources/templates/email-templates/ (email templates)
 * - ~/Orion/Resources/templates/meeting-templates/ (meeting templates)
 * - ~/Orion/Resources/templates/_index.yaml (index file)
 * - ~/Orion/Resources/templates/email-templates/follow-up.md (starter template)
 *
 * This function is idempotent - calling it multiple times will not error
 * if directories or files already exist.
 *
 * @returns Result with created directories info or error
 *
 * @example
 * const result = await initTemplatesDirectory();
 * if (result.isOk()) {
 *   console.log('Created:', result.value.created);
 *   console.log('Index at:', result.value.indexPath);
 *   console.log('Starter templates:', result.value.starterTemplates);
 * } else {
 *   console.error('Failed:', result.error.message);
 * }
 */
export async function initTemplatesDirectory(): Promise<
  Result<TemplatesInitResult, TemplatesInitError>
> {
  const created: string[] = [];
  const skipped: string[] = [];
  const starterTemplates: string[] = [];

  try {
    // Create all subdirectories
    for (const subdir of TEMPLATES_SUBDIRS) {
      const subdirPath = `${TEMPLATES_PATH}/${subdir}`;
      const subdirCreated = await ensureDirectory(subdirPath);
      if (subdirCreated) {
        created.push(subdirPath);
      } else {
        skipped.push(subdirPath);
      }
    }

    // Create index file: ~/Orion/Resources/templates/_index.yaml
    try {
      const index = getDefaultTemplatesIndex();
      const yamlContent = stringify(index);
      const indexCreated = await ensureFile(INDEX_PATH, yamlContent);

      if (indexCreated) {
        created.push(INDEX_PATH);
      } else {
        skipped.push(INDEX_PATH);
      }
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

    // Create follow-up.md starter template
    try {
      const followUpCreated = await ensureFile(FOLLOW_UP_PATH, FOLLOW_UP_TEMPLATE_CONTENT);

      if (followUpCreated) {
        created.push(FOLLOW_UP_PATH);
        starterTemplates.push(FOLLOW_UP_PATH);
      } else {
        skipped.push(FOLLOW_UP_PATH);
        // Still include in starterTemplates if it exists
        starterTemplates.push(FOLLOW_UP_PATH);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      console.error(`[PARA] Starter template write failed: ${errorMessage}`);

      return err({
        code: 'WRITE_ERROR',
        message: `Failed to write starter template: ${errorMessage}`,
        cause: error,
      });
    }

    console.log(
      `[PARA] Templates initialization complete. Created: ${created.length}, Skipped: ${skipped.length}`
    );

    return ok({
      created,
      skipped,
      indexPath: INDEX_PATH,
      starterTemplates,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error(`[PARA] Templates initialization failed: ${errorMessage}`);

    return err({
      code: 'FS_ERROR',
      message: `Failed to initialize Templates directory: ${errorMessage}`,
      cause: error,
    });
  }
}
