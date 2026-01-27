/**
 * Session Store - SQLite Integration
 * Story 2.2: SDK Integration
 *
 * Persists Orion sessions to SQLite database via Tauri plugin.
 * Falls back to in-memory storage when SQLite is unavailable.
 */

import type { OrionSession, SessionType } from './types';

// =============================================================================
// Database Interface
// =============================================================================

/**
 * Abstract database interface for session storage
 */
interface ISessionDatabase {
  execute(query: string, params?: unknown[]): Promise<void>;
  select<T>(query: string, params?: unknown[]): Promise<T[]>;
}

// =============================================================================
// In-Memory Fallback
// =============================================================================

/**
 * In-memory storage when SQLite is unavailable (web dev mode)
 */
class InMemoryDatabase implements ISessionDatabase {
  private sessions: Map<string, OrionSession> = new Map();

  async execute(_query: string, _params?: unknown[]): Promise<void> {
    // No-op for in-memory
  }

  async select<T>(_query: string, _params?: unknown[]): Promise<T[]> {
    return Array.from(this.sessions.values()) as unknown as T[];
  }

  // Direct access methods for in-memory
  set(id: string, session: OrionSession): void {
    this.sessions.set(id, session);
  }

  get(id: string): OrionSession | undefined {
    return this.sessions.get(id);
  }

  delete(id: string): void {
    this.sessions.delete(id);
  }

  getAll(): OrionSession[] {
    return Array.from(this.sessions.values());
  }

  getByType(type: SessionType): OrionSession[] {
    return this.getAll().filter((s) => s.type === type);
  }
}

// =============================================================================
// Session Store
// =============================================================================

/**
 * Session store with SQLite persistence
 *
 * Uses Tauri SQL plugin when available, falls back to in-memory.
 */
export class SessionStore {
  private db: ISessionDatabase | null = null;
  private inMemory: InMemoryDatabase = new InMemoryDatabase();
  private initialized = false;
  private usingSqlite = false;

  /**
   * Initialize the session store
   * Attempts to connect to SQLite, falls back to in-memory
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Try to load Tauri SQL plugin
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        // Dynamic import with type assertion - plugin may not be installed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sqlModule = await import('@tauri-apps/plugin-sql' as any).catch(() => null);
        if (sqlModule?.Database) {
          this.db = (await sqlModule.Database.load('sqlite:orion.db')) as unknown as ISessionDatabase;
        } else {
          throw new Error('SQL plugin not available');
        }
        this.usingSqlite = true;

        // Create sessions table if not exists
        await this.db.execute(`
          CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            created_at TEXT NOT NULL,
            last_activity TEXT NOT NULL,
            context TEXT,
            token_count INTEGER DEFAULT 0,
            cost_usd REAL DEFAULT 0
          )
        `);

        console.log('[SessionStore] Initialized with SQLite');
      } else {
        console.log('[SessionStore] SQLite unavailable, using in-memory storage');
      }
    } catch (error) {
      console.warn('[SessionStore] Failed to initialize SQLite, using in-memory:', error);
    }

    this.initialized = true;
  }

  /**
   * Check if using SQLite or in-memory
   */
  isUsingSqlite(): boolean {
    return this.usingSqlite;
  }

  /**
   * Save or update a session
   */
  async save(session: OrionSession): Promise<void> {
    await this.init();

    if (this.usingSqlite && this.db) {
      const contextJson = session.context ? JSON.stringify(session.context) : null;

      // Use UPSERT pattern
      await this.db.execute(
        `INSERT INTO sessions (id, type, created_at, last_activity, context, token_count, cost_usd)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           last_activity = excluded.last_activity,
           context = excluded.context,
           token_count = excluded.token_count,
           cost_usd = excluded.cost_usd`,
        [
          session.id,
          session.type,
          session.createdAt,
          session.lastActivity,
          contextJson,
          session.tokenCount,
          session.costUsd,
        ]
      );
    } else {
      this.inMemory.set(session.id, session);
    }
  }

  /**
   * Get a session by ID
   */
  async get(id: string): Promise<OrionSession | null> {
    await this.init();

    if (this.usingSqlite && this.db) {
      const rows = await this.db.select<{
        id: string;
        type: string;
        created_at: string;
        last_activity: string;
        context: string | null;
        token_count: number;
        cost_usd: number;
      }>('SELECT * FROM sessions WHERE id = ?', [id]);

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        type: row.type as SessionType,
        createdAt: row.created_at,
        lastActivity: row.last_activity,
        context: row.context ? JSON.parse(row.context) : undefined,
        tokenCount: row.token_count,
        costUsd: row.cost_usd,
      };
    } else {
      return this.inMemory.get(id) ?? null;
    }
  }

  /**
   * List sessions, optionally filtered by type
   */
  async list(type?: SessionType): Promise<OrionSession[]> {
    await this.init();

    if (this.usingSqlite && this.db) {
      const query = type
        ? 'SELECT * FROM sessions WHERE type = ? ORDER BY last_activity DESC'
        : 'SELECT * FROM sessions ORDER BY last_activity DESC';
      const params = type ? [type] : [];

      const rows = await this.db.select<{
        id: string;
        type: string;
        created_at: string;
        last_activity: string;
        context: string | null;
        token_count: number;
        cost_usd: number;
      }>(query, params);

      return rows.map((row) => ({
        id: row.id,
        type: row.type as SessionType,
        createdAt: row.created_at,
        lastActivity: row.last_activity,
        context: row.context ? JSON.parse(row.context) : undefined,
        tokenCount: row.token_count,
        costUsd: row.cost_usd,
      }));
    } else {
      return type ? this.inMemory.getByType(type) : this.inMemory.getAll();
    }
  }

  /**
   * Update session activity and usage
   */
  async updateActivity(
    id: string,
    tokens: number,
    cost: number
  ): Promise<void> {
    await this.init();

    const now = new Date().toISOString();

    if (this.usingSqlite && this.db) {
      await this.db.execute(
        `UPDATE sessions
         SET last_activity = ?,
             token_count = token_count + ?,
             cost_usd = cost_usd + ?
         WHERE id = ?`,
        [now, tokens, cost, id]
      );
    } else {
      const session = this.inMemory.get(id);
      if (session) {
        session.lastActivity = now;
        session.tokenCount += tokens;
        session.costUsd += cost;
      }
    }
  }

  /**
   * Delete a session
   */
  async delete(id: string): Promise<void> {
    await this.init();

    if (this.usingSqlite && this.db) {
      await this.db.execute('DELETE FROM sessions WHERE id = ?', [id]);
    } else {
      this.inMemory.delete(id);
    }
  }

  /**
   * Get total usage across all sessions
   */
  async getTotalUsage(): Promise<{ tokenCount: number; costUsd: number }> {
    await this.init();

    if (this.usingSqlite && this.db) {
      const rows = await this.db.select<{
        total_tokens: number;
        total_cost: number;
      }>(
        'SELECT COALESCE(SUM(token_count), 0) as total_tokens, COALESCE(SUM(cost_usd), 0) as total_cost FROM sessions'
      );

      return {
        tokenCount: rows[0]?.total_tokens ?? 0,
        costUsd: rows[0]?.total_cost ?? 0,
      };
    } else {
      const sessions = this.inMemory.getAll();
      return sessions.reduce(
        (acc, s) => ({
          tokenCount: acc.tokenCount + s.tokenCount,
          costUsd: acc.costUsd + s.costUsd,
        }),
        { tokenCount: 0, costUsd: 0 }
      );
    }
  }
}

// =============================================================================
// Singleton Export
// =============================================================================

let storeInstance: SessionStore | null = null;

/**
 * Get the singleton session store instance
 */
export function getSessionStore(): SessionStore {
  if (!storeInstance) {
    storeInstance = new SessionStore();
  }
  return storeInstance;
}

/**
 * Reset the session store (for testing)
 */
export function resetSessionStore(): void {
  storeInstance = null;
}
