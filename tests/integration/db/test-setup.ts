/**
 * Test database setup using better-sqlite3
 *
 * Provides a real SQLite database for integration tests,
 * ensuring foreign key constraints and other SQLite behaviors
 * are properly tested.
 */

import Database from 'better-sqlite3';
import type { IDatabase } from '@/db';

/**
 * Create an in-memory SQLite database for testing
 * Uses better-sqlite3 which provides actual SQLite behavior
 */
export function createTestDatabase(): IDatabase {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  // Note: WAL mode not applicable to :memory: databases, but we set it
  // to match production config. SQLite silently ignores it for in-memory.
  db.pragma('journal_mode = WAL');

  return {
    execute: async (query: string, params?: unknown[]): Promise<void> => {
      if (params && params.length > 0) {
        db.prepare(query).run(...params);
      } else {
        // Handle multi-statement queries by splitting on statement-breakpoint
        const statements = query
          .split('--> statement-breakpoint')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        for (const stmt of statements) {
          db.exec(stmt);
        }
      }
    },
    select: async <T>(query: string, params?: unknown[]): Promise<T[]> => {
      if (params && params.length > 0) {
        return db.prepare(query).all(...params) as T[];
      }
      return db.prepare(query).all() as T[];
    },
  };
}

/**
 * Initialize test database with schema
 */
export async function initTestDatabase(testDb: IDatabase): Promise<void> {
  // Enable foreign keys
  await testDb.execute('PRAGMA foreign_keys = ON');

  // Create conversations table
  await testDb.execute(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT,
      sdk_session_id TEXT,
      type TEXT NOT NULL,
      project_id TEXT,
      started_at TEXT NOT NULL,
      last_message_at TEXT,
      message_count INTEGER DEFAULT 0,
      context_summary TEXT
    )
  `);

  // Create messages table with FK
  await testDb.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY NOT NULL,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      tool_calls TEXT,
      tool_results TEXT,
      created_at TEXT NOT NULL
    )
  `);

  // Create session_index table with FK
  await testDb.execute(`
    CREATE TABLE IF NOT EXISTS session_index (
      id TEXT PRIMARY KEY NOT NULL,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      display_name TEXT NOT NULL,
      last_active TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    )
  `);

  // Create indexes
  await testDb.execute(
    'CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)'
  );
  await testDb.execute(
    'CREATE INDEX IF NOT EXISTS idx_session_index_last_active ON session_index(last_active)'
  );
}
