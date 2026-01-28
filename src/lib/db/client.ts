/**
 * Database Client
 * Story 3.1: SQLite Database Initialization
 *
 * Provides a singleton database client with initialization and health checks.
 */

import { invoke } from '@tauri-apps/api/core';
import type { DbHealthStatus, DbConnectionState, DbConfigResult } from './types';
import { initializeDatabase, verifyConfig } from './init';

// Database interface from tauri-plugin-sql
interface TauriDatabase {
  execute(sql: string, params?: unknown[]): Promise<void>;
  select<T>(sql: string, params?: unknown[]): Promise<T[]>;
  close(): Promise<void>;
}

/**
 * Orion Database Client
 *
 * Singleton client managing SQLite connection with proper initialization.
 *
 * NOTE (Pre-Mortem 2026-01-27): This client coexists with SessionStore which
 * also connects to SQLite. Current architecture:
 * - OrionDatabase: Connection management, PRAGMA configuration, health checks
 * - SessionStore: Session-specific CRUD operations (owns 'sessions' table)
 *
 * Future consolidation (Plan 3+): SessionStore will be refactored to use
 * this singleton instead of creating its own connection.
 */
export class OrionDatabase {
  private db: TauriDatabase | null = null;
  private state: DbConnectionState = 'disconnected';
  private initPromise: Promise<void> | null = null;
  private config: DbConfigResult | null = null;

  /**
   * Get current connection state
   */
  getState(): DbConnectionState {
    return this.state;
  }

  /**
   * Get database configuration (after init)
   */
  getConfig(): DbConfigResult | null {
    return this.config;
  }

  /**
   * Initialize database connection
   * Ensures PRAGMA settings are applied and verified
   */
  async init(): Promise<void> {
    // Return existing init promise if in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Don't retry if we're in error state - call close() first to reset
    if (this.state === 'error') {
      throw new Error('Database initialization failed previously. Call close() to reset.');
    }

    // Already initialized
    if (this.state === 'connected' && this.db) {
      return;
    }

    this.initPromise = this._doInit();

    try {
      await this.initPromise;
    } catch (error) {
      // Clear promise on error but keep error state
      this.initPromise = null;
      throw error;
    }

    // Only clear promise on success
    this.initPromise = null;
  }

  private async _doInit(): Promise<void> {
    this.state = 'connecting';

    try {
      // Check if we're in Tauri environment
      if (typeof window === 'undefined' || !('__TAURI__' in window)) {
        console.warn('[OrionDB] Not in Tauri environment, SQLite not available');
        this.state = 'error';
        throw new Error('SQLite not available outside Tauri environment');
      }

      // Ensure app data directory exists
      await invoke('db_ensure_dir');

      // Dynamic import of Tauri SQL plugin
      // Note: Using default export as of @tauri-apps/plugin-sql v2.3.1
      const Database = (await import('@tauri-apps/plugin-sql')).default;

      // Load database
      this.db = await Database.load('sqlite:orion.db') as unknown as TauriDatabase;

      // Initialize PRAGMA settings
      this.config = await initializeDatabase(this.db);

      // Verify configuration
      const verification = verifyConfig(this.config);
      if (!verification.valid) {
        console.error('[OrionDB] Configuration verification failed:', verification.errors);
        throw new Error(`Database configuration invalid: ${verification.errors.join(', ')}`);
      }

      this.state = 'connected';
      console.log('[OrionDB] Initialized successfully', this.config);

    } catch (error) {
      this.state = 'error';
      this.db = null;
      this.config = null;
      throw error;
    }
  }

  /**
   * Get health status from Rust backend
   */
  async healthCheck(): Promise<DbHealthStatus> {
    return invoke<DbHealthStatus>('db_health_check');
  }

  /**
   * Execute SQL statement
   */
  async execute(sql: string, params?: unknown[]): Promise<void> {
    await this.init();
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db.execute(sql, params);
  }

  /**
   * Execute SELECT query
   */
  async select<T>(sql: string, params?: unknown[]): Promise<T[]> {
    await this.init();
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db.select<T>(sql, params);
  }

  /**
   * Close database connection and reset state
   * Also resets error state to allow retry
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
    }
    this.db = null;
    this.state = 'disconnected';
    this.config = null;
  }
}

// Export singleton instance
export const db = new OrionDatabase();
