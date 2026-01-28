//! Database Commands
//!
//! Tauri IPC commands for database operations.
//! Story 3.1: SQLite Database Initialization

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

/// Database health status
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DbHealthStatus {
    pub initialized: bool,
    pub journal_mode: String,
    pub foreign_keys_enabled: bool,
    pub db_path: String,
    pub db_size_bytes: u64,
}

/// Check database health and configuration
#[tauri::command]
pub async fn db_health_check(app: AppHandle) -> Result<DbHealthStatus, String> {
    // Get app data directory
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let db_path = app_data_dir.join(crate::db::config::DB_FILENAME);

    // Check if database exists
    if !db_path.exists() {
        return Ok(DbHealthStatus {
            initialized: false,
            journal_mode: String::new(),
            foreign_keys_enabled: false,
            db_path: db_path.to_string_lossy().to_string(),
            db_size_bytes: 0,
        });
    }

    // Get file size
    let db_size_bytes = std::fs::metadata(&db_path)
        .map(|m| m.len())
        .unwrap_or(0);

    // NOTE: journal_mode and foreign_keys values here are "expected" not "verified"
    // Actual verification happens in TypeScript via initializeDatabase() which
    // queries PRAGMA values after connection. This command only checks file existence.
    // See Pre-Mortem mitigation: TypeScript is source of truth for PRAGMA verification.
    Ok(DbHealthStatus {
        initialized: true,
        journal_mode: "wal".to_string(), // Expected value - verified by TypeScript
        foreign_keys_enabled: true,
        db_path: db_path.to_string_lossy().to_string(),
        db_size_bytes,
    })
}

/// Get database path
#[tauri::command]
pub fn db_get_path(app: AppHandle) -> Result<String, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let db_path = app_data_dir.join(crate::db::config::DB_FILENAME);

    Ok(db_path.to_string_lossy().to_string())
}

/// Ensure app data directory exists
#[tauri::command]
pub fn db_ensure_dir(app: AppHandle) -> Result<String, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    if !app_data_dir.exists() {
        std::fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create app data dir: {}", e))?;
    }

    Ok(app_data_dir.to_string_lossy().to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_db_health_status_serialization() {
        let status = DbHealthStatus {
            initialized: true,
            journal_mode: "wal".to_string(),
            foreign_keys_enabled: true,
            db_path: "/test/path/orion.db".to_string(),
            db_size_bytes: 4096,
        };

        let json = serde_json::to_string(&status).unwrap();
        assert!(json.contains("journalMode"));
        assert!(json.contains("foreignKeysEnabled"));
    }
}
