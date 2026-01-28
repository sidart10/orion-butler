/// PARA Filesystem Commands
/// Story 4.17: Archive Completed Items
///
/// Tauri IPC commands for PARA filesystem operations that cannot be done
/// from the frontend due to security sandbox restrictions.

use std::fs;
use std::path::Path;

/// Move a directory from one location to another
/// Used for archiving projects/areas to YYYY-MM subdirectories
#[tauri::command]
pub fn para_move_directory(from: String, to: String) -> Result<(), String> {
    let from_path = Path::new(&from);
    let to_path = Path::new(&to);

    // Verify source exists
    if !from_path.exists() {
        return Err(format!("Source path does not exist: {}", from));
    }

    // Create parent directories if needed
    if let Some(parent) = to_path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create parent directories: {}", e))?;
    }

    // Perform atomic rename/move
    fs::rename(from_path, to_path).map_err(|e| format!("Failed to move directory: {}", e))
}

/// Create a directory (and all parent directories)
/// Used for creating archive/projects/YYYY-MM/ structure
#[tauri::command]
pub fn para_create_directory(path: String) -> Result<(), String> {
    fs::create_dir_all(&path).map_err(|e| format!("Failed to create directory: {}", e))
}
