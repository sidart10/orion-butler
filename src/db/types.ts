/**
 * Database Types
 * Consolidated from src/lib/db/types.ts + src/db/index.ts
 *
 * This module contains all database-related types used throughout the application.
 */

/** Database health status from Rust backend */
export interface DbHealthStatus {
  initialized: boolean;
  journalMode: string;
  foreignKeysEnabled: boolean;
  dbPath: string;
  dbSizeBytes: number;
}

/**
 * Database configuration verification result
 *
 * Returned after database initialization to confirm:
 * - WAL mode is enabled
 * - Foreign keys are enabled
 * - Required tables were created
 */
export interface DbConfigResult {
  walEnabled: boolean;
  foreignKeysEnabled: boolean;
  journalMode: string;
  /** Tables that were created/verified during initialization */
  tablesCreated: string[];
}

/** Database connection state */
export type DbConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

/**
 * Database interface matching tauri-plugin-sql API
 *
 * Used to abstract the database connection for:
 * - Tauri runtime (uses @tauri-apps/plugin-sql)
 * - Test environment (uses better-sqlite3)
 * - Web dev mode (uses in-memory fallback)
 */
export interface IDatabase {
  execute(query: string, params?: unknown[]): Promise<void>;
  select<T>(query: string, params?: unknown[]): Promise<T[]>;
  close?(): Promise<void>;
}
