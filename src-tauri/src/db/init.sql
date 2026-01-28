-- Database Initialization Script
-- Story 3.1: Initialize SQLite Database

-- Enable WAL mode for concurrent reads during writes
PRAGMA journal_mode = WAL;

-- Enable foreign key enforcement
PRAGMA foreign_keys = ON;

-- Performance optimizations
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;  -- 64MB cache
PRAGMA temp_store = MEMORY;

-- =============================================================================
-- Schema Migration Tracking (Pre-Mortem Mitigation)
-- =============================================================================
-- Track schema versions for future migrations (Epic 3 Plan 2+)

CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    description TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Record initial schema version
INSERT OR IGNORE INTO schema_migrations (version, description)
VALUES (1, 'Initial database setup - Story 3.1');

-- Verify settings (for health check)
SELECT
    (SELECT journal_mode FROM pragma_journal_mode) as journal_mode,
    (SELECT foreign_keys FROM pragma_foreign_keys) as foreign_keys;
