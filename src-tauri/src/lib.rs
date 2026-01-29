mod commands;
mod db;
mod sidecar;

use db::DbState;
use sidecar::SidecarManager;
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::Mutex;

// Track cleanup task handle (optional - for graceful shutdown later)
static CLEANUP_TASK: std::sync::OnceLock<tokio::task::JoinHandle<()>> = std::sync::OnceLock::new();

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Create sidecar manager
    let sidecar = Arc::new(Mutex::new(SidecarManager::new()));

    // Clone sidecar for cleanup task (need access before move into manage())
    let sidecar_for_cleanup = sidecar.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .manage(sidecar)
        .setup(move |app| {
            // Start stale request cleanup task (Task 3.5)
            // This runs every 5 minutes and cleans up requests older than 10 minutes
            let sidecar_guard = sidecar_for_cleanup.blocking_lock();
            let cleanup_handle = sidecar_guard.start_cleanup_task();
            let _ = CLEANUP_TASK.set(cleanup_handle);
            eprintln!("[sidecar] Started stale request cleanup task (interval: 5min, threshold: 10min)");
            drop(sidecar_guard);
            // Initialize audit logger with app data directory
            if let Some(app_data_dir) = app.path().app_data_dir().ok() {
                commands::audit::init_audit_logger(app_data_dir.clone());

                // Initialize rusqlite database for atomic transactions (Story 3.7/3.8)
                // NOTE: Schema is created by TypeScript via tauri-plugin-sql
                // This only opens a connection for transactional writes
                let db_path = app_data_dir.join(db::config::DB_FILENAME);
                match DbState::new(db_path.to_str().unwrap_or("orion.db")) {
                    Ok(db_state) => {
                        app.manage(db_state);
                        println!("[DB] rusqlite connection initialized for transactions");
                    }
                    Err(e) => {
                        // Log but don't fail - DB might not exist yet (TypeScript creates it)
                        eprintln!("[DB] rusqlite init deferred: {}", e);
                    }
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::hello_world,
            commands::chat_send,
            commands::chat_cancel,
            commands::chat_ready,
            commands::db_health_check,
            commands::db_get_path,
            commands::db_ensure_dir,
            commands::save_conversation_turn,
            commands::get_or_create_conversation,
            commands::update_sdk_session_id,
            commands::get_recent_sessions,
            commands::load_session,
            commands::create_session,
            commands::get_todays_daily_session,
            commands::para_move_directory,
            commands::para_create_directory,
            // Phase 0: Active Request Management
            commands::get_active_conversations,
            commands::update_active_request,
            commands::batch_update_active_requests,
            commands::get_schema_version,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
