//! Database Module
//!
//! Story 3.1: SQLite Database Initialization
//!
//! Handles database initialization, migrations, and health checks.

/// SQL initialization script (compiled into binary)
pub const INIT_SQL: &str = include_str!("init.sql");

/// Database configuration constants
pub mod config {
    /// Database filename
    pub const DB_FILENAME: &str = "orion.db";

    /// Expected WAL mode after init
    pub const EXPECTED_JOURNAL_MODE: &str = "wal";
}
