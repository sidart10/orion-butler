/**
 * Database Connection
 * Provides lazy-loaded database connection for Tauri and fallback for dev/test.
 *
 * Architecture:
 * - In Tauri: Uses @tauri-apps/plugin-sql for SQLite access
 * - In Web Dev: Uses in-memory fallback for basic operations
 * - In Tests: Use setDatabase() to inject better-sqlite3
 */

import type { IDatabase } from './types';

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
      dbInstance = (await Database.load('sqlite:orion.db')) as unknown as IDatabase;
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
