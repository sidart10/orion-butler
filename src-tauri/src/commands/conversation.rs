//! Conversation Commands
//!
//! Tauri IPC commands for conversation persistence.
//! Story 3.7: Auto-Save Message on Receive
//! Story 3.8: Atomic Write Transactions
//!
//! Uses rusqlite for transaction support (tauri-plugin-sql lacks this).
//! Schema is defined by Drizzle in TypeScript - we just insert/update.

use crate::db::DbState;
use serde::Deserialize;
use tauri::State;

// =============================================================================
// Types (aligned with Drizzle schema in src/db/schema/messages.ts)
// =============================================================================

/// Message to save - matches Drizzle NewMessage type
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MessageToSave {
    pub id: String,
    pub role: String,
    pub content: String,
    #[serde(default)]
    pub tool_calls: Option<String>,
    #[serde(default)]
    pub tool_results: Option<String>,
    pub created_at: String,
}

impl MessageToSave {
    /// Validate message ID format (Issue #5)
    /// Critical fix: Prevent path traversal patterns and enforce structure
    fn validate_id(&self) -> Result<(), String> {
        if self.id.is_empty() {
            return Err("Message ID cannot be empty".to_string());
        }
        if self.id.len() > 128 {
            return Err("Message ID too long (max 128 chars)".to_string());
        }

        let chars: Vec<char> = self.id.chars().collect();

        // Must start with alphanumeric (prevents -foo, _foo patterns)
        if !chars.first().map_or(false, |c| c.is_alphanumeric()) {
            return Err("Message ID must start with alphanumeric character".to_string());
        }

        // Must end with alphanumeric (prevents foo-, foo_ patterns)
        if !chars.last().map_or(false, |c| c.is_alphanumeric()) {
            return Err("Message ID must end with alphanumeric character".to_string());
        }

        // Check each character and prevent consecutive special chars
        let mut prev_special = false;
        for c in &chars {
            let is_special = *c == '-' || *c == '_';

            // No consecutive special characters (prevents --, __, -_, etc)
            if is_special && prev_special {
                return Err("Message ID cannot have consecutive special characters".to_string());
            }

            // Only allow alphanumeric, hyphens, underscores
            if !c.is_alphanumeric() && !is_special {
                return Err("Message ID contains invalid characters".to_string());
            }

            prev_special = is_special;
        }

        Ok(())
    }

    /// Validate timestamp format (Issue #6)
    /// Critical fix: Validate numeric ranges, not just structure
    fn validate_timestamp(&self) -> Result<(), String> {
        let ts = &self.created_at;
        if ts.is_empty() {
            return Err("Timestamp cannot be empty".to_string());
        }

        // Minimum length for ISO 8601: YYYY-MM-DDTHH:MM:SS (19 chars)
        // With timezone: YYYY-MM-DDTHH:MM:SSZ (20 chars) or +HH:MM (25 chars)
        if ts.len() < 19 {
            return Err("Timestamp format invalid (too short)".to_string());
        }

        let bytes = ts.as_bytes();

        // Check structural delimiters
        if bytes[4] != b'-' || bytes[7] != b'-' || bytes[10] != b'T' || bytes[13] != b':' || bytes[16] != b':' {
            return Err("Timestamp format invalid (expected ISO 8601)".to_string());
        }

        // Parse and validate numeric components
        let year_str = std::str::from_utf8(&bytes[0..4])
            .map_err(|_| "Invalid timestamp: year not valid UTF-8")?;
        let month_str = std::str::from_utf8(&bytes[5..7])
            .map_err(|_| "Invalid timestamp: month not valid UTF-8")?;
        let day_str = std::str::from_utf8(&bytes[8..10])
            .map_err(|_| "Invalid timestamp: day not valid UTF-8")?;
        let hour_str = std::str::from_utf8(&bytes[11..13])
            .map_err(|_| "Invalid timestamp: hour not valid UTF-8")?;
        let min_str = std::str::from_utf8(&bytes[14..16])
            .map_err(|_| "Invalid timestamp: minute not valid UTF-8")?;
        let sec_str = std::str::from_utf8(&bytes[17..19])
            .map_err(|_| "Invalid timestamp: second not valid UTF-8")?;

        // Validate year is numeric (we don't restrict range - future dates are fine)
        year_str.parse::<u32>()
            .map_err(|_| "Invalid timestamp: year must be numeric")?;

        // Validate month (1-12)
        let month: u32 = month_str.parse()
            .map_err(|_| "Invalid timestamp: month must be numeric")?;
        if month < 1 || month > 12 {
            return Err("Invalid timestamp: month must be 1-12".to_string());
        }

        // Validate day (1-31, simplified - doesn't check per-month)
        let day: u32 = day_str.parse()
            .map_err(|_| "Invalid timestamp: day must be numeric")?;
        if day < 1 || day > 31 {
            return Err("Invalid timestamp: day must be 1-31".to_string());
        }

        // Validate hour (0-23)
        let hour: u32 = hour_str.parse()
            .map_err(|_| "Invalid timestamp: hour must be numeric")?;
        if hour > 23 {
            return Err("Invalid timestamp: hour must be 0-23".to_string());
        }

        // Validate minute (0-59)
        let minute: u32 = min_str.parse()
            .map_err(|_| "Invalid timestamp: minute must be numeric")?;
        if minute > 59 {
            return Err("Invalid timestamp: minute must be 0-59".to_string());
        }

        // Validate second (0-59, note: leap seconds 60 are technically valid but rare)
        let second: u32 = sec_str.parse()
            .map_err(|_| "Invalid timestamp: second must be numeric")?;
        if second > 59 {
            return Err("Invalid timestamp: second must be 0-59".to_string());
        }

        Ok(())
    }

    /// Validate all fields
    pub fn validate(&self) -> Result<(), String> {
        self.validate_id()?;
        self.validate_timestamp()?;
        Ok(())
    }
}

/// Conversation update payload
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConversationUpdate {
    pub conversation_id: String,
    pub user_message: MessageToSave,
    pub assistant_message: MessageToSave,
    #[serde(default)]
    pub session_id: Option<String>,
}

// =============================================================================
// Commands
// =============================================================================

/// Save a conversation turn atomically (Story 3.8)
///
/// Saves both user and assistant messages in a single transaction,
/// updating conversation metadata atomically.
///
/// If ANY operation fails, the entire transaction is rolled back.
#[tauri::command]
pub fn save_conversation_turn(
    db: State<'_, DbState>,
    update: ConversationUpdate,
) -> Result<(), String> {
    // Validate input messages (Issue #5 and #6)
    update.user_message.validate()?;
    update.assistant_message.validate()?;

    // Sanitize error messages - don't leak database internals to frontend
    let mut conn = db
        .conn
        .lock()
        .map_err(|_| "Database temporarily unavailable".to_string())?;

    // Run all operations in a single transaction
    let tx = conn
        .transaction()
        .map_err(|_| "Failed to start database operation".to_string())?;

    // 1. Ensure conversation exists (or create)
    // Schema: id, title, sdk_session_id, type, project_id, started_at, last_message_at, message_count, context_summary
    let conv_exists: bool = tx
        .query_row(
            "SELECT 1 FROM conversations WHERE id = ?",
            [&update.conversation_id],
            |_| Ok(true),
        )
        .unwrap_or(false);

    if !conv_exists {
        tx.execute(
            r#"
            INSERT INTO conversations (id, sdk_session_id, type, started_at, last_message_at, message_count)
            VALUES (?1, ?2, 'adhoc', ?3, ?3, 0)
            "#,
            rusqlite::params![
                &update.conversation_id,
                &update.session_id.clone().unwrap_or_default(),
                &update.user_message.created_at,
            ],
        )
        .map_err(|_| "Failed to create conversation".to_string())?;
    }

    // 2. Insert user message
    // Schema: id, conversation_id, role, content, tool_calls, tool_results, created_at
    tx.execute(
        r#"
        INSERT INTO messages (id, conversation_id, role, content, tool_calls, tool_results, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        "#,
        rusqlite::params![
            &update.user_message.id,
            &update.conversation_id,
            &update.user_message.role,
            &update.user_message.content,
            &update.user_message.tool_calls,
            &update.user_message.tool_results,
            &update.user_message.created_at,
        ],
    )
    .map_err(|_| "Failed to save user message".to_string())?;

    // 3. Insert assistant message
    tx.execute(
        r#"
        INSERT INTO messages (id, conversation_id, role, content, tool_calls, tool_results, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        "#,
        rusqlite::params![
            &update.assistant_message.id,
            &update.conversation_id,
            &update.assistant_message.role,
            &update.assistant_message.content,
            &update.assistant_message.tool_calls,
            &update.assistant_message.tool_results,
            &update.assistant_message.created_at,
        ],
    )
    .map_err(|_| "Failed to save assistant message".to_string())?;

    // 4. Update conversation metadata
    tx.execute(
        r#"
        UPDATE conversations
        SET last_message_at = ?2,
            message_count = message_count + 2
        WHERE id = ?1
        "#,
        rusqlite::params![&update.conversation_id, &update.assistant_message.created_at],
    )
    .map_err(|_| "Failed to update conversation".to_string())?;

    // Commit transaction - if this fails, all changes are rolled back
    tx.commit()
        .map_err(|_| "Failed to save conversation".to_string())?;

    println!(
        "[conversation] Saved turn to {} (2 messages)",
        update.conversation_id
    );

    Ok(())
}

/// Get or create a conversation based on session type
#[tauri::command]
pub fn get_or_create_conversation(
    db: State<'_, DbState>,
    session_type: String,
    session_id: Option<String>,
    project_id: Option<String>,
) -> Result<String, String> {
    let conn = db
        .conn
        .lock()
        .map_err(|_| "Database temporarily unavailable".to_string())?;

    // Generate conversation ID based on session type
    let now = chrono::Utc::now();
    let conv_id = match session_type.as_str() {
        "daily" => format!("conv_daily_{}", now.format("%Y-%m-%d")),
        "project" => format!(
            "conv_proj_{}",
            project_id.as_deref().unwrap_or("default")
        ),
        "inbox" => format!("conv_inbox_{}", now.format("%Y-%m-%d")),
        _ => format!("conv_adhoc_{}", uuid::Uuid::new_v4()),
    };

    // Try to get existing
    let existing: Option<String> = conn
        .query_row(
            "SELECT id FROM conversations WHERE id = ?",
            [&conv_id],
            |row| row.get(0),
        )
        .ok();

    if existing.is_none() {
        let now_str = now.format("%Y-%m-%dT%H:%M:%SZ").to_string();
        conn.execute(
            r#"
            INSERT INTO conversations (id, sdk_session_id, type, project_id, started_at, message_count)
            VALUES (?1, ?2, ?3, ?4, ?5, 0)
            "#,
            rusqlite::params![
                &conv_id,
                &session_id.unwrap_or_default(),
                &session_type,
                &project_id.unwrap_or_default(),
                &now_str,
            ],
        )
        .map_err(|_| "Failed to create conversation".to_string())?;

        println!("[conversation] Created new conversation: {}", conv_id);
    } else {
        println!("[conversation] Using existing conversation: {}", conv_id);
    }

    Ok(conv_id)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_message_to_save_deserialize() {
        let json = r#"{
            "id": "msg_123",
            "role": "user",
            "content": "Hello",
            "createdAt": "2026-01-27T12:00:00Z"
        }"#;

        let msg: MessageToSave = serde_json::from_str(json).unwrap();
        assert_eq!(msg.id, "msg_123");
        assert_eq!(msg.role, "user");
        assert_eq!(msg.content, "Hello");
        assert!(msg.tool_calls.is_none());
    }

    #[test]
    fn test_conversation_update_deserialize() {
        let json = r#"{
            "conversationId": "conv_123",
            "userMessage": {
                "id": "msg_u1",
                "role": "user",
                "content": "Hi",
                "createdAt": "2026-01-27T12:00:00Z"
            },
            "assistantMessage": {
                "id": "msg_a1",
                "role": "assistant",
                "content": "Hello!",
                "createdAt": "2026-01-27T12:00:01Z"
            }
        }"#;

        let update: ConversationUpdate = serde_json::from_str(json).unwrap();
        assert_eq!(update.conversation_id, "conv_123");
        assert_eq!(update.user_message.role, "user");
        assert_eq!(update.assistant_message.role, "assistant");
    }

    // Issue #5: Message ID validation tests
    #[test]
    fn test_validate_id_valid() {
        let msg = MessageToSave {
            id: "msg_abc-123_DEF".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-01-27T12:00:00Z".to_string(),
        };
        assert!(msg.validate_id().is_ok());
    }

    #[test]
    fn test_validate_id_empty() {
        let msg = MessageToSave {
            id: "".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-01-27T12:00:00Z".to_string(),
        };
        assert_eq!(msg.validate_id().unwrap_err(), "Message ID cannot be empty");
    }

    #[test]
    fn test_validate_id_too_long() {
        let msg = MessageToSave {
            id: "x".repeat(129),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-01-27T12:00:00Z".to_string(),
        };
        assert_eq!(
            msg.validate_id().unwrap_err(),
            "Message ID too long (max 128 chars)"
        );
    }

    #[test]
    fn test_validate_id_invalid_chars() {
        // Use invalid chars in the middle so start/end checks pass first
        let msg = MessageToSave {
            id: "msg123<script>abc".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-01-27T12:00:00Z".to_string(),
        };
        assert_eq!(
            msg.validate_id().unwrap_err(),
            "Message ID contains invalid characters"
        );
    }

    // Issue #6: Timestamp validation tests
    #[test]
    fn test_validate_timestamp_valid_utc() {
        let msg = MessageToSave {
            id: "msg_123".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-01-27T12:00:00Z".to_string(),
        };
        assert!(msg.validate_timestamp().is_ok());
    }

    #[test]
    fn test_validate_timestamp_valid_with_offset() {
        let msg = MessageToSave {
            id: "msg_123".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-01-27T12:00:00+05:30".to_string(),
        };
        assert!(msg.validate_timestamp().is_ok());
    }

    #[test]
    fn test_validate_timestamp_empty() {
        let msg = MessageToSave {
            id: "msg_123".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "".to_string(),
        };
        assert_eq!(
            msg.validate_timestamp().unwrap_err(),
            "Timestamp cannot be empty"
        );
    }

    #[test]
    fn test_validate_timestamp_invalid_format() {
        let msg = MessageToSave {
            id: "msg_123".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "Jan 27 2026".to_string(),
        };
        assert!(msg.validate_timestamp().is_err());
    }

    #[test]
    fn test_validate_full_message() {
        let msg = MessageToSave {
            id: "msg_valid-123".to_string(),
            role: "user".to_string(),
            content: "Hello, world!".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-01-27T15:30:45Z".to_string(),
        };
        assert!(msg.validate().is_ok());
    }

    // Critical fix #2: Message ID structure validation
    #[test]
    fn test_validate_id_starts_with_special() {
        let msg = MessageToSave {
            id: "-msg123".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-01-27T12:00:00Z".to_string(),
        };
        assert_eq!(
            msg.validate_id().unwrap_err(),
            "Message ID must start with alphanumeric character"
        );
    }

    #[test]
    fn test_validate_id_ends_with_special() {
        let msg = MessageToSave {
            id: "msg123_".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-01-27T12:00:00Z".to_string(),
        };
        assert_eq!(
            msg.validate_id().unwrap_err(),
            "Message ID must end with alphanumeric character"
        );
    }

    #[test]
    fn test_validate_id_consecutive_special() {
        let msg = MessageToSave {
            id: "msg--123".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-01-27T12:00:00Z".to_string(),
        };
        assert_eq!(
            msg.validate_id().unwrap_err(),
            "Message ID cannot have consecutive special characters"
        );
    }

    #[test]
    fn test_validate_id_mixed_consecutive_special() {
        let msg = MessageToSave {
            id: "msg_-123".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-01-27T12:00:00Z".to_string(),
        };
        assert_eq!(
            msg.validate_id().unwrap_err(),
            "Message ID cannot have consecutive special characters"
        );
    }

    // Critical fix #1: Timestamp numeric validation
    #[test]
    fn test_validate_timestamp_invalid_month_13() {
        let msg = MessageToSave {
            id: "msg_123".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-13-27T12:00:00Z".to_string(),
        };
        assert_eq!(
            msg.validate_timestamp().unwrap_err(),
            "Invalid timestamp: month must be 1-12"
        );
    }

    #[test]
    fn test_validate_timestamp_invalid_month_00() {
        let msg = MessageToSave {
            id: "msg_123".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-00-27T12:00:00Z".to_string(),
        };
        assert_eq!(
            msg.validate_timestamp().unwrap_err(),
            "Invalid timestamp: month must be 1-12"
        );
    }

    #[test]
    fn test_validate_timestamp_invalid_day_32() {
        let msg = MessageToSave {
            id: "msg_123".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-01-32T12:00:00Z".to_string(),
        };
        assert_eq!(
            msg.validate_timestamp().unwrap_err(),
            "Invalid timestamp: day must be 1-31"
        );
    }

    #[test]
    fn test_validate_timestamp_invalid_hour_24() {
        let msg = MessageToSave {
            id: "msg_123".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-01-27T24:00:00Z".to_string(),
        };
        assert_eq!(
            msg.validate_timestamp().unwrap_err(),
            "Invalid timestamp: hour must be 0-23"
        );
    }

    #[test]
    fn test_validate_timestamp_invalid_minute_60() {
        let msg = MessageToSave {
            id: "msg_123".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-01-27T12:60:00Z".to_string(),
        };
        assert_eq!(
            msg.validate_timestamp().unwrap_err(),
            "Invalid timestamp: minute must be 0-59"
        );
    }

    #[test]
    fn test_validate_timestamp_invalid_second_60() {
        let msg = MessageToSave {
            id: "msg_123".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-01-27T12:00:60Z".to_string(),
        };
        assert_eq!(
            msg.validate_timestamp().unwrap_err(),
            "Invalid timestamp: second must be 0-59"
        );
    }

    #[test]
    fn test_validate_timestamp_non_numeric_month() {
        let msg = MessageToSave {
            id: "msg_123".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-XX-27T12:00:00Z".to_string(),
        };
        assert_eq!(
            msg.validate_timestamp().unwrap_err(),
            "Invalid timestamp: month must be numeric"
        );
    }

    #[test]
    fn test_validate_timestamp_boundary_values() {
        // Test valid boundary values: month=12, day=31, hour=23, min=59, sec=59
        let msg = MessageToSave {
            id: "msg_123".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-12-31T23:59:59Z".to_string(),
        };
        assert!(msg.validate_timestamp().is_ok());
    }

    #[test]
    fn test_validate_timestamp_with_milliseconds() {
        // Timestamps with milliseconds should still pass (length > 19)
        let msg = MessageToSave {
            id: "msg_123".to_string(),
            role: "user".to_string(),
            content: "test".to_string(),
            tool_calls: None,
            tool_results: None,
            created_at: "2026-01-27T12:00:00.123Z".to_string(),
        };
        assert!(msg.validate_timestamp().is_ok());
    }
}
