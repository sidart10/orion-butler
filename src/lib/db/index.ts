/**
 * Database Module
 * Story 3.1: SQLite Database Initialization
 */

export { db, OrionDatabase } from './client';
export { initializeDatabase, verifyConfig } from './init';
export type { DbHealthStatus, DbConnectionState, DbConfigResult } from './types';
