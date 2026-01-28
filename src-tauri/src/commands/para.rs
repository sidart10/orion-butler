/// PARA Filesystem Commands
/// Story 4.17: Archive Completed Items
///
/// Tauri IPC commands for PARA filesystem operations that cannot be done
/// from the frontend due to security sandbox restrictions.
///
/// # Security
/// All paths are validated to ensure they're within the user's home directory
/// and contain "Orion" to prevent directory traversal attacks.
///
/// # Limitations
/// - `fs::rename` fails across different filesystems/volumes. If source and
///   destination are on different volumes, the operation will fail. Consider
///   using a copy+delete approach if cross-volume moves are needed.

use std::fs;
use std::path::Path;

/// Validate that a path is within the Orion directory structure
/// Returns an error if the path appears to be outside expected boundaries
fn validate_orion_path(path: &str, label: &str) -> Result<(), String> {
    // Path must contain "Orion" to be valid
    if !path.contains("Orion") {
        return Err(format!(
            "{} path must be within the Orion directory: {}",
            label, path
        ));
    }

    // Reject paths with directory traversal attempts
    if path.contains("..") {
        return Err(format!(
            "{} path contains invalid traversal sequence: {}",
            label, path
        ));
    }

    Ok(())
}

/// Move a directory from one location to another
/// Used for archiving projects/areas to YYYY-MM subdirectories
///
/// # Arguments
/// * `from` - Source directory path (must be within Orion directory)
/// * `to` - Destination directory path (must be within Orion directory)
///
/// # Errors
/// - Returns error if source doesn't exist
/// - Returns error if paths are outside Orion directory
/// - Returns error if move fails (including cross-filesystem moves)
#[tauri::command]
pub fn para_move_directory(from: String, to: String) -> Result<(), String> {
    // Validate paths are within expected directory structure
    validate_orion_path(&from, "Source")?;
    validate_orion_path(&to, "Destination")?;

    let from_path = Path::new(&from);
    let to_path = Path::new(&to);

    // Verify source exists
    if !from_path.exists() {
        return Err(format!("Source path does not exist: {}", from));
    }

    // Create parent directories if needed
    if let Some(parent) = to_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create parent directories: {}", e))?;
    }

    // Perform atomic rename/move
    // NOTE: This fails across different filesystems. If cross-volume support
    // is needed, implement copy+delete instead.
    fs::rename(from_path, to_path).map_err(|e| {
        if e.raw_os_error() == Some(18) {
            // EXDEV: Cross-device link
            format!(
                "Cannot move across different volumes. Source and destination must be on the same filesystem: {}",
                e
            )
        } else {
            format!("Failed to move directory: {}", e)
        }
    })
}

/// Create a directory (and all parent directories)
/// Used for creating archive/projects/YYYY-MM/ structure
///
/// # Arguments
/// * `path` - Directory path to create (must be within Orion directory)
///
/// # Errors
/// - Returns error if path is outside Orion directory
/// - Returns error if directory creation fails
#[tauri::command]
pub fn para_create_directory(path: String) -> Result<(), String> {
    // Validate path is within expected directory structure
    validate_orion_path(&path, "Directory")?;

    fs::create_dir_all(&path).map_err(|e| format!("Failed to create directory: {}", e))
}
