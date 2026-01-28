/**
 * PARA Schemas Module
 * Epic 4: PARA-Based File Structure
 *
 * Zod schemas for validating PARA data structures.
 */

// Config schemas (Story 4.1b)
export {
  OrionPreferencesSchema,
  OrionConfigSchema,
  type OrionPreferences,
  type OrionConfig,
} from './config';

// Project schemas (Story 4.1c)
export {
  StakeholderSchema,
  ProjectMetaSchema,
  ProjectIndexSchema,
  type Stakeholder,
  type ProjectMeta,
  type ProjectIndex,
} from './project';

// Area schemas (Story 4.1c)
export {
  GoalSchema,
  AreaMetaSchema,
  AreaIndexSchema,
  type Goal,
  type AreaMeta,
  type AreaIndex,
} from './area';

// Contact schemas (Story 4.1c, Story 4.10)
export {
  ContactCardSchema,
  ContactIndexSchema,
  ContactsSubdirStatsSchema,
  ContactsSubdirIndexSchema,
  type ContactCard,
  type ContactIndex,
  type ContactsSubdirStats,
  type ContactsSubdirIndex,
} from './contact';

// Inbox schemas (Story 4.1c)
export {
  InboxItemSchema,
  InboxStatsSchema,
  InboxQueueSchema,
  type InboxItem,
  type InboxStats,
  type InboxQueue,
} from './inbox';

// Archive schemas (Story 4.5)
export {
  ArchivedItemSchema,
  ArchiveStatsSchema,
  ArchiveIndexSchema,
  type ArchivedItem,
  type ArchiveStats,
  type ArchiveIndex,
} from './archive';

// Resources schemas (Story 4.4)
export {
  ResourcesIndexSchema,
  type ResourcesIndex,
} from './resources';

// Templates schemas (Story 4.11)
export {
  TemplateEntrySchema,
  TemplatesIndexSchema,
  type TemplateEntry,
  type TemplatesIndex,
} from './templates';
