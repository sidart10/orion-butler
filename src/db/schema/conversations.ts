import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

/**
 * Conversations table - stores chat session metadata
 * Story 3.3: Create Conversations Table
 *
 * Schema matches database-schema-design.md with additional fields
 * from epics.md Story 3.3 requirements.
 */
export const conversations = sqliteTable(
  'conversations',
  {
    // Primary key with prefix format: conv_xxx
    id: text('id').primaryKey(),

    // Display metadata
    title: text('title'),

    // Claude SDK session link
    sdkSessionId: text('sdk_session_id'),

    // Session type: 'daily', 'project', 'inbox', 'adhoc'
    type: text('type').notNull().$type<'daily' | 'project' | 'inbox' | 'adhoc'>(),

    // Optional project linkage (FK to projects table - created in Epic 4)
    projectId: text('project_id'),

    // Timestamps (ISO format)
    startedAt: text('started_at').notNull(),
    lastMessageAt: text('last_message_at'),

    // Counters
    messageCount: integer('message_count').default(0),

    // Context for compaction (FR-1.8)
    contextSummary: text('context_summary'),
  },
  (table) => [
    index('idx_conversations_sdk_session').on(table.sdkSessionId),
    index('idx_conversations_type').on(table.type),
    index('idx_conversations_last_message').on(table.lastMessageAt),
  ]
);

// Type inference exports
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
