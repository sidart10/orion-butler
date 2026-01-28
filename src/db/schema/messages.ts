import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { conversations } from './conversations';

/**
 * Messages table - stores conversation history
 * Story 3.4: Create Messages Table
 *
 * Each message belongs to a conversation and contains either
 * user input or assistant response with optional tool calls.
 */
export const messages = sqliteTable(
  'messages',
  {
    // Primary key with prefix format: msg_xxx
    id: text('id').primaryKey(),

    // Foreign key to conversations
    conversationId: text('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),

    // Message role: 'user' or 'assistant'
    role: text('role').notNull().$type<'user' | 'assistant'>(),

    // Message content (markdown text)
    content: text('content').notNull(),

    // Tool usage (JSON serialized arrays)
    toolCalls: text('tool_calls'), // JSON array of tool use blocks
    toolResults: text('tool_results'), // JSON array of tool results

    // Timestamp (ISO format)
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    // Critical index for loading conversation messages
    index('idx_messages_conversation').on(table.conversationId),
    // Composite index for chronological ordering
    index('idx_messages_conversation_created').on(
      table.conversationId,
      table.createdAt
    ),
  ]
);

// Type inference exports
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

// Helper types for JSON columns
export interface ToolCall {
  id: string;
  name: string;
  input: unknown;
}

export interface ToolResult {
  toolId: string;
  result: unknown;
  durationMs: number;
}
