import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { conversations } from './conversations';

/**
 * Session Index table - fast lookup for session resumption
 * Story 3.5: Create Session Index Table
 *
 * Separated from conversations for NFR-9.2 (index integrity isolation).
 * Enables <1s context restore (NFR-1.4) via optimized recency queries.
 */
export const sessionIndex = sqliteTable(
  'session_index',
  {
    // Primary key
    id: text('id').primaryKey(),

    // Foreign key to conversations
    conversationId: text('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),

    // Session type (denormalized for fast filtering)
    type: text('type')
      .notNull()
      .$type<'daily' | 'project' | 'inbox' | 'adhoc'>(),

    // Display name for session selector UI
    displayName: text('display_name').notNull(),

    // Last activity timestamp for recency sorting
    lastActive: text('last_active').notNull(),

    // Active flag (INTEGER as boolean: 0 or 1)
    isActive: integer('is_active').default(1),
  },
  (table) => [
    // Primary recency index for session list
    index('idx_session_index_last_active').on(table.lastActive),
    // Index for active session lookup
    index('idx_session_index_active').on(table.isActive, table.lastActive),
    // Index for type filtering
    index('idx_session_index_type').on(table.type),
  ]
);

// Type inference exports
export type SessionIndex = typeof sessionIndex.$inferSelect;
export type NewSessionIndex = typeof sessionIndex.$inferInsert;
