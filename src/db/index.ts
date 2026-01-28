/**
 * Database Connection Wrapper
 *
 * Provides a unified interface for database access that works with:
 * 1. Tauri runtime (uses @tauri-apps/plugin-sql)
 * 2. Web dev mode (uses in-memory fallback)
 * 3. Test environment (uses better-sqlite3)
 *
 * Story 3.2: Configure Drizzle ORM
 *
 * Architecture Decision:
 * - Drizzle ORM is used for schema definition and type generation
 * - Queries execute via tauri-plugin-sql (raw SQL)
 * - This separation is intentional: Drizzle's query builder requires
 *   better-sqlite3 which is Node-only, but Tauri runs in browser context
 */

// Re-export schema for consumers
export * from './schema';

// =============================================================================
// Database Interface
// =============================================================================

/**
 * Database interface matching tauri-plugin-sql API
 */
export interface IDatabase {
  execute(query: string, params?: unknown[]): Promise<void>;
  select<T>(query: string, params?: unknown[]): Promise<T[]>;
}

// =============================================================================
// Connection Management
// =============================================================================

let dbInstance: IDatabase | null = null;

/**
 * Get database connection
 * Lazy-loads the Tauri SQL plugin in Tauri context,
 * returns in-memory fallback otherwise.
 */
export async function getDatabase(): Promise<IDatabase> {
  if (dbInstance) return dbInstance;

  if (typeof window !== 'undefined' && '__TAURI__' in window) {
    try {
      const Database = (await import('@tauri-apps/plugin-sql')).default;
      dbInstance = (await Database.load(
        'sqlite:orion.db'
      )) as unknown as IDatabase;
      console.log('[DB] Connected via Tauri SQL plugin');
      return dbInstance;
    } catch (error) {
      console.warn('[DB] Tauri SQL plugin unavailable:', error);
    }
  }

  // Fallback to in-memory (web dev mode)
  console.log('[DB] Using in-memory fallback');
  dbInstance = createInMemoryDatabase();
  return dbInstance;
}

// =============================================================================
// In-Memory Fallback (Dev/Web Mode)
// =============================================================================

/**
 * In-memory database for development/testing
 * Provides basic storage without actual SQL execution
 */
function createInMemoryDatabase(): IDatabase {
  const tables: Record<string, Map<string, Record<string, unknown>>> = {
    conversations: new Map(),
    messages: new Map(),
    session_index: new Map(),
  };

  return {
    async execute(query: string, params?: unknown[]): Promise<void> {
      // Basic INSERT handling for in-memory
      const insertMatch = query.match(/INSERT INTO (\w+)/i);
      if (insertMatch && params) {
        const tableName = insertMatch[1].toLowerCase();
        const table = tables[tableName];
        if (table && params[0]) {
          table.set(params[0] as string, { id: params[0] });
        }
      }

      // Basic DELETE handling
      const deleteMatch = query.match(/DELETE FROM (\w+) WHERE id = \?/i);
      if (deleteMatch && params) {
        const tableName = deleteMatch[1].toLowerCase();
        const table = tables[tableName];
        if (table && params[0]) {
          table.delete(params[0] as string);
        }
      }
    },
    async select<T>(query: string, params?: unknown[]): Promise<T[]> {
      // Basic SELECT handling
      const selectMatch = query.match(/FROM (\w+)/i);
      if (selectMatch) {
        const tableName = selectMatch[1].toLowerCase();
        const table = tables[tableName];
        if (table) {
          // If WHERE id = ?, return specific item
          if (query.includes('WHERE id = ?') && params?.[0]) {
            const item = table.get(params[0] as string);
            return item ? [item as T] : [];
          }
          return Array.from(table.values()) as T[];
        }
      }
      return [];
    },
  };
}

// =============================================================================
// Database Initialization
// =============================================================================

/**
 * Initialize database schema
 * Runs migrations and creates tables if needed
 */
export async function initializeDatabase(): Promise<void> {
  const db = await getDatabase();

  // Enable WAL mode and foreign keys (Story 3.1 prereq)
  await db.execute('PRAGMA journal_mode=WAL');
  await db.execute('PRAGMA foreign_keys=ON');

  // Create tables using generated migration SQL
  await createTables(db);

  console.log('[DB] Database initialized');
}

/**
 * Create all tables
 * Uses SQL that matches the Drizzle schema definitions
 * This is a single source of truth - matches drizzle-kit output
 */
async function createTables(db: IDatabase): Promise<void> {
  // Conversations table (Story 3.3)
  await db.execute(`
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

  // Conversations indexes
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_conversations_sdk_session
    ON conversations(sdk_session_id)
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_conversations_type
    ON conversations(type)
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_conversations_last_message
    ON conversations(last_message_at)
  `);

  // Messages table (Story 3.4)
  await db.execute(`
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

  // Messages indexes (Story 3.4)
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON messages(conversation_id)
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
    ON messages(conversation_id, created_at)
  `);

  // Session index table (Story 3.5)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS session_index (
      id TEXT PRIMARY KEY NOT NULL,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      display_name TEXT NOT NULL,
      last_active TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    )
  `);

  // Session index indexes (Story 3.5)
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_session_index_last_active
    ON session_index(last_active)
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_session_index_active
    ON session_index(is_active, last_active)
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_session_index_type
    ON session_index(type)
  `);
}

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Reset database instance (for testing)
 */
export function resetDatabase(): void {
  dbInstance = null;
}

/**
 * Set a custom database instance (for testing with better-sqlite3)
 */
export function setDatabase(db: IDatabase): void {
  dbInstance = db;
}
