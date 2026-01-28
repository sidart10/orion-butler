/**
 * Database Module
 * Consolidated database functionality for Orion.
 *
 * This is the SINGLE source of truth for database access:
 * - Schema definitions (Drizzle)
 * - Connection management
 * - Initialization (PRAGMAs + tables)
 * - Client singleton
 *
 * Architecture Decision:
 * - Drizzle ORM is used for schema definition and type generation
 * - Queries execute via tauri-plugin-sql (raw SQL)
 * - This separation is intentional: Drizzle's query builder requires
 *   better-sqlite3 which is Node-only, but Tauri runs in browser context
 */

// Schema exports
export * from './schema';

// Types
export type {
  IDatabase,
  DbHealthStatus,
  DbConfigResult,
  DbConnectionState,
} from './types';

// Connection utilities
export {
  getDatabase,
  resetDatabase,
  setDatabase,
} from './connection';

// Initialization
export {
  initializeDatabase,
  initializeDatabaseWithConnection,
  verifyConfig,
} from './init';

// Client singleton
export { db, OrionDatabase } from './client';
