mod commands;
mod db;
mod sidecar;
mod state;

use db::DbState;
use sidecar::SidecarManager;
use state::AppState;
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::Mutex;

// Track cleanup task handle (optional - for graceful shutdown later)
// Uses tauri::async_runtime::JoinHandle since cleanup task uses tauri's async runtime
static CLEANUP_TASK: std::sync::OnceLock<tauri::async_runtime::JoinHandle<()>> = std::sync::OnceLock::new();

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Create legacy sidecar manager (for chat_send backwards compatibility)
    let sidecar = Arc::new(Mutex::new(SidecarManager::new()));

    // Create new AppState with SidecarRegistry (for send_message)
    let app_state = AppState::new();

    // Clone sidecar for cleanup task (need access before move into manage())
    let sidecar_for_cleanup = sidecar.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_system_info::init())
        // Legacy: SidecarManager for chat_send (backwards compatibility)
        .manage(sidecar)
        // New: AppState with SidecarRegistry for send_message (TIGER-6)
        .manage(app_state)
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
            // Legacy chat command (backwards compatibility)
            commands::chat_send,
            commands::chat_cancel,
            commands::chat_ready,
            // New multi-sidecar command (TIGER-5)
            commands::send_message,
            // Task 8: File checkpointing rewind command
            commands::chat_rewind,
            // Database commands
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
            // PARA commands
            commands::para_move_directory,
            commands::para_create_directory,
            // Phase 0: Active Request Management
            commands::get_active_conversations,
            commands::update_active_request,
            commands::batch_update_active_requests,
            commands::get_schema_version,
            // Task 0: delete_conversation
            commands::delete_conversation,
        ])
        // TIGER-1: Use build() + run() pattern for shutdown handler
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            // TIGER-1: Handle app shutdown to cleanup sidecars
            if let tauri::RunEvent::ExitRequested { .. } = &event {
                eprintln!("[shutdown] App exit requested, cleaning up sidecars...");

                // Shutdown the SidecarRegistry (multi-sidecar)
                if let Some(state) = app_handle.try_state::<AppState>() {
                    // Use block_on to run async shutdown synchronously
                    tauri::async_runtime::block_on(async {
                        state.sidecar_registry.shutdown().await;
                        eprintln!("[shutdown] SidecarRegistry shutdown complete");
                    });
                }

                // Also stop the legacy SidecarManager
                if let Some(sidecar) = app_handle.try_state::<Arc<Mutex<SidecarManager>>>() {
                    tauri::async_runtime::block_on(async {
                        let mut guard = sidecar.lock().await;
                        let _ = guard.stop().await;
                        eprintln!("[shutdown] Legacy SidecarManager stopped");
                    });
                }

                eprintln!("[shutdown] All sidecars cleaned up");
            }
        });
}
