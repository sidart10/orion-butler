/**
 * Database Types
 * Story 3.1: SQLite Database Initialization
 */

/** Database health status from Rust backend */
export interface DbHealthStatus {
  initialized: boolean;
  journalMode: string;
  foreignKeysEnabled: boolean;
  dbPath: string;
  dbSizeBytes: number;
}

/** Database configuration verification result */
export interface DbConfigResult {
  walEnabled: boolean;
  foreignKeysEnabled: boolean;
  journalMode: string;
}

/** Database connection state */
export type DbConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';
