/**
 * PARA Filesystem Module
 * Epic 4: PARA-Based File Structure
 *
 * Provides filesystem operations for the Orion PARA structure.
 *
 * @example
 * import { initParaRoot, getOrionPaths } from '@/lib/para';
 *
 * // Initialize directories
 * const result = await initParaRoot();
 * if (result.isOk()) {
 *   console.log('PARA initialized');
 * }
 *
 * // Get paths
 * const paths = getOrionPaths();
 * console.log(paths.projects); // 'Orion/Projects'
 */

// Path constants and helpers
export {
  ORION_ROOT,
  ORION_SYSTEM_DIR,
  PROJECTS_DIR,
  AREAS_DIR,
  RESOURCES_DIR,
  ARCHIVE_DIR,
  INBOX_DIR,
  getOrionPaths,
  buildOrionPath,
  type OrionPaths,
} from './paths';

// Initialization
export { initParaRoot, type ParaInitResult, type ParaInitError } from './init';

// Projects
export {
  initProjectsDirectory,
  type ProjectsInitResult,
  type ProjectsInitError,
} from './projects';

// Areas
export {
  initAreasDirectory,
  AREAS_INDEX_FILENAME,
  type AreasInitResult,
  type AreasInitError,
} from './areas';

// Inbox
export {
  initInboxDirectory,
  INBOX_QUEUE_FILENAME,
  INBOX_ITEMS_DIR,
  type InboxInitResult,
  type InboxInitError,
} from './inbox';

// Archive
export {
  initArchiveDirectory,
  loadArchiveIndex,
  getDefaultArchiveIndex,
  ARCHIVE_INDEX_FILENAME,
  type ArchiveInitResult,
  type ArchiveError,
} from './archive';

// Resources
export {
  initResourcesDirectory,
  RESOURCES_INDEX_FILENAME,
  RESOURCES_CONTACTS_DIR,
  RESOURCES_TEMPLATES_DIR,
  RESOURCES_PROCEDURES_DIR,
  RESOURCES_PREFERENCES_DIR,
  RESOURCES_NOTES_DIR,
  type ResourcesInitResult,
  type ResourcesInitError,
} from './resources';

// Contacts (subdirectory of Resources)
export {
  initContactsIndex,
  CONTACTS_INDEX_FILENAME,
  type ContactsIndexInitResult,
  type ContactsIndexInitError,
} from './contacts';

// Templates (subdirectory of Resources)
export {
  initTemplatesDirectory,
  TEMPLATES_INDEX_FILENAME,
  TEMPLATES_EMAIL_DIR,
  TEMPLATES_MEETING_DIR,
  FOLLOW_UP_TEMPLATE_FILENAME,
  FOLLOW_UP_TEMPLATE_CONTENT,
  type TemplatesInitResult,
  type TemplatesInitError,
} from './templates';

// Config
export {
  getDefaultConfig,
  initOrionConfig,
  loadConfig,
  CONFIG_FILENAME,
  type ConfigInitResult,
  type ConfigError,
} from './config';

// Schemas
export {
  OrionPreferencesSchema,
  OrionConfigSchema,
  type OrionPreferences,
  type OrionConfig,
} from './schemas/config';

export {
  InboxItemSchema,
  InboxStatsSchema,
  InboxQueueSchema,
  type InboxItem,
  type InboxStats,
  type InboxQueue,
} from './schemas/inbox';

export {
  ArchivedItemSchema,
  ArchiveStatsSchema,
  ArchiveIndexSchema,
  type ArchivedItem,
  type ArchiveStats,
  type ArchiveIndex,
} from './schemas/archive';

export {
  ResourcesIndexSchema,
  type ResourcesIndex,
} from './schemas/resources';

export {
  ContactsSubdirIndexSchema,
  ContactsSubdirStatsSchema,
  type ContactsSubdirIndex,
  type ContactsSubdirStats,
} from './schemas/contact';

export {
  TemplateEntrySchema,
  TemplatesIndexSchema,
  type TemplateEntry,
  type TemplatesIndex,
} from './schemas/templates';
