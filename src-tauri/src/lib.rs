mod commands;
mod db;
mod sidecar;

use sidecar::SidecarManager;
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Create sidecar manager
    let sidecar = Arc::new(Mutex::new(SidecarManager::new()));

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .manage(sidecar)
        .setup(|app| {
            // Initialize audit logger with app data directory
            if let Some(app_data_dir) = app.path().app_data_dir().ok() {
                commands::audit::init_audit_logger(app_data_dir);
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
