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
  isError?: boolean;
}

// =============================================================================
// JSON Column Serialization Helpers
// =============================================================================

/**
 * Serialize tool calls array to JSON string for storage
 */
export function serializeToolCalls(calls: ToolCall[]): string {
  return JSON.stringify(calls);
}

/**
 * Deserialize tool calls from JSON string with error handling
 * Returns null on parse failure to prevent runtime crashes
 */
export function deserializeToolCalls(json: string | null): ToolCall[] | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      console.warn('[DB] toolCalls is not an array:', typeof parsed);
      return null;
    }
    return parsed as ToolCall[];
  } catch (e) {
    console.error('[DB] Failed to parse toolCalls JSON:', e);
    return null;
  }
}

/**
 * Serialize tool results array to JSON string for storage
 */
export function serializeToolResults(results: ToolResult[]): string {
  return JSON.stringify(results);
}

/**
 * Deserialize tool results from JSON string with error handling
 * Returns null on parse failure to prevent runtime crashes
 */
export function deserializeToolResults(
  json: string | null
): ToolResult[] | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      console.warn('[DB] toolResults is not an array:', typeof parsed);
      return null;
    }
    return parsed as ToolResult[];
  } catch (e) {
    console.error('[DB] Failed to parse toolResults JSON:', e);
    return null;
  }
}
