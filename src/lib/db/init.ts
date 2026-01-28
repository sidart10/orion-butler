/**
 * Database Initialization
 * Story 3.1: SQLite Database Initialization
 *
 * Handles database creation, PRAGMA configuration, and verification.
 */

import type { DbConfigResult } from './types';

/** PRAGMA initialization queries */
const INIT_PRAGMAS = [
  'PRAGMA journal_mode = WAL',
  'PRAGMA foreign_keys = ON',
  'PRAGMA synchronous = NORMAL',
  'PRAGMA cache_size = -64000',
  'PRAGMA temp_store = MEMORY',
];

/** Schema setup SQL - creates migration tracking table */
const SCHEMA_SETUP = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    description TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  INSERT OR IGNORE INTO schema_migrations (version, description)
  VALUES (1, 'Initial database setup - Story 3.1');
`;

/** Verify PRAGMA settings */
const VERIFY_QUERIES = {
  journalMode: 'PRAGMA journal_mode',
  foreignKeys: 'PRAGMA foreign_keys',
};

/**
 * Initialize database with required PRAGMA settings
 */
export async function initializeDatabase(
  db: { execute: (sql: string) => Promise<void>; select: <T>(sql: string) => Promise<T[]> }
): Promise<DbConfigResult> {
  // Execute PRAGMA statements
  for (const pragma of INIT_PRAGMAS) {
    await db.execute(pragma);
  }

  // Create schema_migrations table for future migration tracking
  await db.execute(SCHEMA_SETUP);

  // Verify configuration
  const [journalResult] = await db.select<{ journal_mode: string }>(
    VERIFY_QUERIES.journalMode
  );
  const [fkResult] = await db.select<{ foreign_keys: number }>(
    VERIFY_QUERIES.foreignKeys
  );

  const journalMode = journalResult?.journal_mode ?? 'unknown';
  const foreignKeysEnabled = fkResult?.foreign_keys === 1;

  return {
    walEnabled: journalMode.toLowerCase() === 'wal',
    foreignKeysEnabled,
    journalMode,
  };
}

/**
 * Verify database configuration meets requirements
 */
export function verifyConfig(config: DbConfigResult): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.walEnabled) {
    errors.push(`WAL mode not enabled. Current mode: ${config.journalMode}`);
  }

  if (!config.foreignKeysEnabled) {
    errors.push('Foreign keys not enabled');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
