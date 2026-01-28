//! Session Commands
//!
//! Tauri IPC commands for session management UI.
//! Story 3.9: Load Conversation on App Launch
//! Story 3.10: Session Selector UI
//! Story 3.15: Session Metadata Display
//!
//! Uses JOIN query to merge data from `session_index` and `conversations` tables.

use crate::db::DbState;
use serde::{Deserialize, Serialize};
use tauri::State;

// =============================================================================
// Types (aligned with frontend SessionMetadata)
// =============================================================================

/// Session metadata for UI display
/// Combines data from both `session_index` and `conversations` tables
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionMetadata {
    pub id: String,
    pub display_name: String,
    #[serde(rename = "type")]
    pub session_type: String,
    pub last_active: String,
    pub message_count: i32,
    pub project_id: Option<String>,
    pub project_name: Option<String>,
    #[serde(default)]
    pub is_corrupted: bool,
}

/// Full session with messages for loading
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionWithMessages {
    #[serde(flatten)]
    pub metadata: SessionMetadata,
    pub sdk_session_id: Option<String>,
    pub messages: Vec<StoredMessage>,
}

/// Message from database
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StoredMessage {
    pub id: String,
    pub role: String,
    pub content: String,
    pub created_at: String,
    pub tool_calls: Option<String>,
    pub tool_results: Option<String>,
}

// =============================================================================
// Commands
// =============================================================================

/// Get recent sessions for sidebar display (Story 3.10)
///
/// Joins session_index and conversations tables to get messageCount.
/// Returns sessions ordered by last_active DESC.
#[tauri::command]
pub fn get_recent_sessions(
    db: State<'_, DbState>,
    limit: i32,
) -> Result<Vec<SessionMetadata>, String> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| "Database temporarily unavailable".to_string())?;

    let mut stmt = conn
        .prepare(
            r#"
            SELECT
                si.id,
                si.display_name,
                si.type,
                si.last_active,
                COALESCE(c.message_count, 0) as message_count,
                c.project_id
            FROM session_index si
            LEFT JOIN conversations c ON c.id = si.conversation_id
            WHERE si.is_active = 1
            ORDER BY si.last_active DESC
            LIMIT ?
            "#,
        )
        .map_err(|e| format!("Query preparation failed: {}", e))?;

    let sessions = stmt
        .query_map([limit], |row| {
            Ok(SessionMetadata {
                id: row.get(0)?,
                display_name: row.get(1)?,
                session_type: row.get(2)?,
                last_active: row.get(3)?,
                message_count: row.get(4)?,
                project_id: row.get(5)?,
                project_name: None, // TODO: Join with projects table when available
                is_corrupted: false,
            })
        })
        .map_err(|e| format!("Query failed: {}", e))?
        .filter_map(|r| match r {
            Ok(session) => Some(session),
            Err(e) => {
                eprintln!("[session] Row parse error in get_recent_sessions: {}", e);
                None
            }
        })
        .collect();

    Ok(sessions)
}

/// Load a session with all its messages (Story 3.9)
///
/// Returns session metadata plus all messages for display.
#[tauri::command]
pub fn load_session(
    db: State<'_, DbState>,
    session_id: String,
) -> Result<SessionWithMessages, String> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| "Database temporarily unavailable".to_string())?;

    // Get session metadata with message count and conversation_id in single query
    let (meta, sdk_session_id, conversation_id): (SessionMetadata, Option<String>, String) = conn
        .query_row(
            r#"
            SELECT
                si.id,
                si.display_name,
                si.type,
                si.last_active,
                COALESCE(c.message_count, 0) as message_count,
                c.project_id,
                c.sdk_session_id,
                si.conversation_id
            FROM session_index si
            LEFT JOIN conversations c ON c.id = si.conversation_id
            WHERE si.id = ?
            "#,
            [&session_id],
            |row| {
                Ok((
                    SessionMetadata {
                        id: row.get(0)?,
                        display_name: row.get(1)?,
                        session_type: row.get(2)?,
                        last_active: row.get(3)?,
                        message_count: row.get(4)?,
                        project_id: row.get(5)?,
                        project_name: None,
                        is_corrupted: false,
                    },
                    row.get::<_, Option<String>>(6)?, // sdk_session_id
                    row.get::<_, String>(7)?,         // conversation_id
                ))
            },
        )
        .map_err(|_| format!("Session not found: {}", session_id))?;

    // Get messages for this session's conversation
    let mut msg_stmt = conn
        .prepare(
            r#"
            SELECT id, role, content, created_at, tool_calls, tool_results
            FROM messages
            WHERE conversation_id = ?
            ORDER BY created_at ASC
            "#,
        )
        .map_err(|e| format!("Message query failed: {}", e))?;

    let messages: Vec<StoredMessage> = msg_stmt
        .query_map([&conversation_id], |row| {
            Ok(StoredMessage {
                id: row.get(0)?,
                role: row.get(1)?,
                content: row.get(2)?,
                created_at: row.get(3)?,
                tool_calls: row.get(4)?,
                tool_results: row.get(5)?,
            })
        })
        .map_err(|e| format!("Message fetch failed: {}", e))?
        .filter_map(|r| match r {
            Ok(msg) => Some(msg),
            Err(e) => {
                eprintln!("[session] Row parse error in load_session messages: {}", e);
                None
            }
        })
        .collect();

    Ok(SessionWithMessages {
        metadata: meta,
        sdk_session_id,
        messages,
    })
}

/// Create a new session (Story 3.10 - New Session button)
///
/// Creates both a session_index record and a linked conversation.
#[tauri::command]
pub fn create_session(
    db: State<'_, DbState>,
    session_type: String,
    project_id: Option<String>,
) -> Result<String, String> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| "Database temporarily unavailable".to_string())?;

    let now = chrono::Utc::now();
    let now_str = now.format("%Y-%m-%dT%H:%M:%SZ").to_string();

    // Generate session ID based on type
    let session_id = match session_type.as_str() {
        "daily" => format!("orion-daily-{}", now.format("%Y-%m-%d")),
        "project" => format!(
            "orion-project-{}",
            project_id.as_deref().unwrap_or("default")
        ),
        "inbox" => format!("orion-inbox-{}", now.format("%Y-%m-%d")),
        _ => format!("orion-adhoc-{}", uuid::Uuid::new_v4()),
    };

    // Generate display name
    let display_name = match session_type.as_str() {
        "daily" => format!("Daily - {}", now.format("%B %d, %Y")),
        "project" => format!("Project: {}", project_id.as_deref().unwrap_or("Untitled")),
        "inbox" => "Inbox Processing".to_string(),
        _ => format!("Session at {}", now.format("%H:%M")),
    };

    // Generate conversation ID
    let conv_id = format!("conv_{}", session_id.replace("orion-", ""));

    // Use transaction for atomicity
    let tx = conn.unchecked_transaction()
        .map_err(|e| format!("Transaction start failed: {}", e))?;

    // Insert conversation first (parent)
    tx.execute(
        r#"
        INSERT INTO conversations (id, type, started_at, message_count, project_id)
        VALUES (?1, ?2, ?3, 0, ?4)
        ON CONFLICT(id) DO NOTHING
        "#,
        rusqlite::params![&conv_id, &session_type, &now_str, &project_id],
    )
    .map_err(|e| format!("Failed to create conversation: {}", e))?;

    // Insert session_index (child with FK to conversations)
    tx.execute(
        r#"
        INSERT INTO session_index (id, conversation_id, type, display_name, last_active, is_active)
        VALUES (?1, ?2, ?3, ?4, ?5, 1)
        ON CONFLICT(id) DO UPDATE SET last_active = excluded.last_active
        "#,
        rusqlite::params![
            &session_id,
            &conv_id,
            &session_type,
            &display_name,
            &now_str,
        ],
    )
    .map_err(|e| format!("Failed to create session index: {}", e))?;

    tx.commit()
        .map_err(|e| format!("Transaction commit failed: {}", e))?;

    println!(
        "[session] Created session {} with conversation {}",
        session_id, conv_id
    );

    Ok(session_id)
}

#[cfg(test)]
mod tests {
    use super::*;

    // =============================================================================
    // Type Serialization Tests (3.15-UNIT-001 through 003)
    // =============================================================================

    #[test]
    fn test_session_metadata_serializes_to_camel_case() {
        // 3.15-UNIT-001: SessionMetadata must serialize with camelCase
        let meta = SessionMetadata {
            id: "sess_123".to_string(),
            display_name: "Daily - January 27, 2026".to_string(),
            session_type: "daily".to_string(),
            last_active: "2026-01-27T10:00:00Z".to_string(),
            message_count: 5,
            project_id: None,
            project_name: None,
            is_corrupted: false,
        };

        let json = serde_json::to_string(&meta).unwrap();

        // Must use camelCase
        assert!(json.contains("displayName"), "expected displayName in JSON");
        assert!(json.contains("messageCount"), "expected messageCount in JSON");
        assert!(json.contains("lastActive"), "expected lastActive in JSON");
        assert!(json.contains("isCorrupted"), "expected isCorrupted in JSON");

        // Type must be renamed from session_type
        assert!(json.contains("\"type\":\"daily\""), "expected type field");
        assert!(!json.contains("sessionType"), "should not contain sessionType");
    }

    #[test]
    fn test_session_metadata_deserializes_from_camel_case() {
        // 3.15-UNIT-002: SessionMetadata must deserialize from camelCase
        let json = r#"{
            "id": "sess_456",
            "displayName": "Project: Website",
            "type": "project",
            "lastActive": "2026-01-27T15:00:00Z",
            "messageCount": 12,
            "projectId": "proj_123",
            "projectName": "Website Redesign",
            "isCorrupted": false
        }"#;

        let meta: SessionMetadata = serde_json::from_str(json).unwrap();

        assert_eq!(meta.id, "sess_456");
        assert_eq!(meta.display_name, "Project: Website");
        assert_eq!(meta.session_type, "project");
        assert_eq!(meta.message_count, 12);
        assert_eq!(meta.project_id, Some("proj_123".to_string()));
        assert_eq!(meta.project_name, Some("Website Redesign".to_string()));
    }

    #[test]
    fn test_session_with_messages_flattens_metadata() {
        // 3.15-UNIT-003: SessionWithMessages must flatten metadata fields
        let session = SessionWithMessages {
            metadata: SessionMetadata {
                id: "sess_789".to_string(),
                display_name: "Test Session".to_string(),
                session_type: "adhoc".to_string(),
                last_active: "2026-01-27T10:00:00Z".to_string(),
                message_count: 3,
                project_id: None,
                project_name: None,
                is_corrupted: false,
            },
            sdk_session_id: Some("sdk_abc".to_string()),
            messages: vec![],
        };

        let json = serde_json::to_string(&session).unwrap();

        // Metadata fields should be flattened to top level
        assert!(json.contains("\"id\":\"sess_789\""), "id should be at top level");
        assert!(json.contains("\"displayName\":\"Test Session\""), "displayName should be flattened");
        assert!(json.contains("\"sdkSessionId\":\"sdk_abc\""), "sdkSessionId should be present");
    }

    #[test]
    fn test_stored_message_serializes_correctly() {
        // 3.9-UNIT-001: StoredMessage serialization
        let msg = StoredMessage {
            id: "msg_001".to_string(),
            role: "assistant".to_string(),
            content: "Hello, world!".to_string(),
            created_at: "2026-01-27T10:00:00Z".to_string(),
            tool_calls: Some(r#"[{"name": "read_file"}]"#.to_string()),
            tool_results: None,
        };

        let json = serde_json::to_string(&msg).unwrap();

        assert!(json.contains("\"createdAt\""), "expected camelCase createdAt");
        assert!(json.contains("\"toolCalls\""), "expected camelCase toolCalls");
        assert!(json.contains("\"toolResults\":null"), "toolResults should serialize as null");
    }

    // =============================================================================
    // Command Behavior Tests (will need DbState mock or integration test)
    // =============================================================================

    // Note: Command tests that require database access are integration tests.
    // The get_recent_sessions, load_session, and create_session commands
    // should be tested via integration tests with a real SQLite database.
    //
    // For TDD, we verify the type contracts above, then implement the
    // commands to satisfy integration tests.
}
