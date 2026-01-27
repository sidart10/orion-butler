# Story 2.4: Create Tauri IPC Command for Chat

Status: drafted

---

## Story Definition

| Field | Value |
|-------|-------|
| **Story ID** | 2-4-create-tauri-ipc-command-for-chat |
| **Epic** | Epic 2: First Conversation |
| **Status** | drafted |
| **Priority** | Critical (bridges frontend to SDK) |
| **Created** | 2026-01-24 |

---

## User Story

As a **developer**,
I want a Tauri command that invokes the SDK,
So that the frontend can send messages to Claude.

---

## Acceptance Criteria

1. **Given** the SDK wrapper is implemented (Story 2.3)
   **When** frontend calls `invoke('chat_send', { prompt, sessionId })`
   **Then** the Rust backend spawns the SDK query

2. **And** a unique `requestId` is returned immediately for stream correlation

3. **And** the command is non-blocking (streaming happens via events)

---

## Design References

### From Architecture (thoughts/planning-artifacts/architecture.md)

**Streaming IPC Event Schema (lines 903-1022):**

The architecture defines the IPC streaming protocol using Tauri's `emit/listen` pattern:

```typescript
// Base event structure
interface OrionEvent<T> {
  requestId: string;        // Correlate with query
  sessionId: string;        // Active session
  timestamp: string;        // ISO 8601
  payload: T;
}
```

**Tauri Event Names (architecture.md):**

| Event | Direction | Payload |
|-------|-----------|---------|
| `orion://message/chunk` | Backend -> Frontend | `MessageChunkPayload` |
| `orion://tool/start` | Backend -> Frontend | `ToolStartPayload` |
| `orion://tool/complete` | Backend -> Frontend | `ToolCompletePayload` |
| `orion://canvas/render` | Backend -> Frontend | `CanvasRenderPayload` |
| `orion://session/complete` | Backend -> Frontend | `SessionCompletePayload` |
| `orion://session/error` | Backend -> Frontend | `SessionErrorPayload` |

**Frontend Listener Hook Pattern (architecture.md lines 984-1021):**

```typescript
// src/hooks/useStreaming.ts
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { useEffect, useRef } from 'react';

export function useStreamListener(
  requestId: string,
  onMessage: (payload: MessageChunkPayload) => void,
  // ... callbacks for other events
) {
  const unlisteners = useRef<UnlistenFn[]>([]);
  // ... setup listeners filtered by requestId
}
```

**Latency Target (architecture.md line 1024):**

> First `message/chunk` event must arrive within **500ms** (p95) of query submission.

**Naming Patterns (architecture.md lines 1403-1409):**

| Element | Convention | Example |
|---------|------------|---------|
| Tauri commands | snake_case | `get_session`, `send_message` |
| JSON fields | camelCase | `sessionId`, `createdAt` |
| Events | namespace:action | `message:chunk`, `session:created` |

**IPC Response Format (architecture.md lines 1452-1455):**

> All Tauri commands return `Result<T, AppError>` (neverthrow pattern)
> Errors include `code`, `message`, and optional `context`

### From Streaming Architecture (thoughts/research/streaming-architecture.md)

**Why Event-Based Streaming (not invoke/handle):**

| Pattern | Use Case | Why Not for Streaming |
|---------|----------|----------------------|
| `invoke/handle` | Request-response | Waits for full response before returning |
| `send/on` (events) | Events, streaming | Allows multiple messages per request |

**Request ID Tracking Pattern:**

```typescript
contextBridge.exposeInMainWorld('orion', {
  query: (prompt: string, onStream: StreamCallback) => {
    const requestId = crypto.randomUUID();

    const handler = (_event: any, message: StreamMessage) => {
      if (message.requestId === requestId) {
        onStream(message);
        if (message.type === 'complete' || message.type === 'error') {
          ipcRenderer.removeListener('agent:stream', handler);
        }
      }
    };

    ipcRenderer.on('agent:stream', handler);
    ipcRenderer.send('agent:query', { requestId, prompt });

    // Return cancel function
    return () => {
      ipcRenderer.removeListener('agent:stream', handler);
      ipcRenderer.send('agent:cancel', { requestId });
    };
  }
});
```

**Streaming State Machine States (streaming-architecture.md):**

```
idle -> thinking -> streaming -> complete
                      |
                      v
                    error
```

### From Story Chain (.ralph/story-chain.md)

**Story 2.3 Established:**

- `ClaudeAgentSDK.query()` method fully implemented
- `StreamMessage` discriminated union for streaming events
- `OrionError` class with error codes (1xxx/2xxx/3xxx/9xxx)
- Type guards for SDK message types
- Message transformation pattern: SDK blocks -> `StreamMessage` events

**Notes for Story 2.4 from Story 2.3:**

> - Call `agentSDK.query(prompt, { sessionId })` from Rust backend
> - Return unique `requestId` immediately for stream correlation
> - Spawn SDK query in background, don't block IPC response
> - Use `emit()` to send `StreamMessage` events to frontend
> - Follow streaming IPC pattern from architecture.md lines 909-1022

---

## Technical Requirements

### IPC Command Structure

The Tauri IPC command bridges the TypeScript frontend to the TypeScript SDK wrapper:

```
Frontend (React)
    |
    | invoke('chat_send', { prompt, sessionId })
    v
Tauri IPC Layer
    |
    | Rust command handler
    v
TypeScript SDK Wrapper (Node.js sidecar)
    |
    | agentSDK.query(prompt, { sessionId })
    v
Claude Agent SDK
```

**Important Architectural Note:**

The Claude Agent SDK is a TypeScript package. Tauri's Rust backend cannot call TypeScript directly. The pattern is:

1. Tauri command spawns a Node.js sidecar process
2. Sidecar runs the SDK wrapper code
3. Sidecar communicates via stdout (JSON-line protocol)
4. Rust backend parses and emits as Tauri events

### Command Definition (Rust)

```rust
// src-tauri/src/commands/chat.rs

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use uuid::Uuid;
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

/// Request payload from frontend
#[derive(Debug, Deserialize)]
pub struct ChatSendRequest {
    pub prompt: String,
    #[serde(rename = "sessionId")]
    pub session_id: Option<String>,
}

/// Response returned immediately to frontend
#[derive(Debug, Serialize)]
pub struct ChatSendResponse {
    #[serde(rename = "requestId")]
    pub request_id: String,
}

/// IPC Command: chat_send (invoked via Tauri's invoke('chat_send', ...))
/// AC #1: Spawns SDK query via sidecar
/// AC #2: Returns requestId immediately
/// AC #3: Non-blocking (streaming via events)
#[tauri::command]
pub async fn chat_send(
    app: AppHandle,
    request: ChatSendRequest,
) -> Result<ChatSendResponse, String> {
    // AC #2: Generate unique requestId for stream correlation
    let request_id = Uuid::new_v4().to_string();
    let request_id_clone = request_id.clone();

    // AC #3: Spawn in background task, don't block response
    tokio::spawn(async move {
        if let Err(e) = run_sdk_query(
            app,
            request_id_clone,
            request.prompt,
            request.session_id,
        ).await {
            eprintln!("SDK query error: {}", e);
        }
    });

    // AC #2: Return requestId immediately
    Ok(ChatSendResponse { request_id })
}

/// Run SDK query via Node.js sidecar and emit events
async fn run_sdk_query(
    app: AppHandle,
    request_id: String,
    prompt: String,
    session_id: Option<String>,
) -> Result<(), String> {
    // Use provided session_id or generate a new one
    let active_session_id = session_id.clone().unwrap_or_else(|| Uuid::new_v4().to_string());

    // Build sidecar command
    let mut cmd = Command::new("node");
    cmd.arg("sdk-runner.mjs")
       .arg("--prompt").arg(&prompt)
       .arg("--request-id").arg(&request_id)
       .arg("--session-id").arg(&active_session_id);

    cmd.stdout(Stdio::piped())
       .stderr(Stdio::piped())
       .current_dir(app.path().app_data_dir().unwrap());

    let mut child = cmd.spawn()
        .map_err(|e| format!("Failed to spawn SDK runner: {}", e))?;

    let stdout = child.stdout.take()
        .ok_or("Failed to capture stdout")?;

    let mut reader = BufReader::new(stdout).lines();

    // Read JSON-line output and emit as Tauri events
    while let Some(line) = reader.next_line().await
        .map_err(|e| format!("Failed to read line: {}", e))?
    {
        // Parse and emit event
        if let Err(e) = emit_stream_event(&app, &request_id, &active_session_id, &line) {
            eprintln!("Failed to emit event: {}", e);
        }
    }

    // Wait for process to complete
    let status = child.wait().await
        .map_err(|e| format!("Failed to wait for process: {}", e))?;

    if !status.success() {
        emit_error_event(&app, &request_id, &active_session_id, "SDK process exited with error")?;
    }

    Ok(())
}
```

### Stream Event Emission (Rust)

```rust
// src-tauri/src/commands/events.rs

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use chrono::Utc;

/// Event payload types matching architecture.md lines 922-966
#[derive(Debug, Serialize)]
#[serde(tag = "type")]
pub enum StreamPayload {
    #[serde(rename = "text")]
    Text {
        content: String,
        #[serde(rename = "isComplete")]
        is_complete: bool,
    },

    #[serde(rename = "thinking")]
    Thinking {
        content: String,
        #[serde(rename = "isComplete")]
        is_complete: bool,
    },

    #[serde(rename = "tool_start")]
    ToolStart {
        #[serde(rename = "toolId")]
        tool_id: String,
        #[serde(rename = "toolName")]
        tool_name: String,
        input: serde_json::Value,
    },

    #[serde(rename = "tool_complete")]
    ToolComplete {
        #[serde(rename = "toolId")]
        tool_id: String,
        result: serde_json::Value,
        #[serde(rename = "isError")]
        is_error: bool,
        #[serde(rename = "durationMs")]
        duration_ms: u64,
    },

    #[serde(rename = "complete")]
    Complete {
        #[serde(rename = "sessionId")]
        session_id: String,
        #[serde(rename = "durationMs")]
        duration_ms: u64,
        #[serde(rename = "costUsd")]
        cost_usd: Option<f64>,
    },

    #[serde(rename = "error")]
    Error {
        code: String,
        message: String,
        recoverable: bool,
    },
}

/// Wrapper event with metadata (matches architecture.md OrionEvent<T>)
#[derive(Debug, Serialize)]
pub struct OrionStreamEvent {
    #[serde(rename = "requestId")]
    pub request_id: String,
    #[serde(rename = "sessionId")]
    pub session_id: String,
    pub timestamp: String,
    pub payload: StreamPayload,
}

/// Parse SDK output line and emit appropriate Tauri event
pub fn emit_stream_event(
    app: &AppHandle,
    request_id: &str,
    session_id: &str,
    line: &str,
) -> Result<(), String> {
    // Parse JSON from sidecar
    let sdk_message: serde_json::Value = serde_json::from_str(line)
        .map_err(|e| format!("Invalid JSON: {}", e))?;

    let msg_type = sdk_message.get("type")
        .and_then(|v| v.as_str())
        .unwrap_or("unknown");

    // Convert to StreamPayload
    let payload = match msg_type {
        "text" => StreamPayload::Text {
            content: sdk_message.get("content")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string(),
            is_complete: sdk_message.get("isComplete")
                .and_then(|v| v.as_bool())
                .unwrap_or(false),
        },
        "thinking" => StreamPayload::Thinking {
            content: sdk_message.get("content")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string(),
            is_complete: sdk_message.get("isComplete")
                .and_then(|v| v.as_bool())
                .unwrap_or(false),
        },
        "tool_start" => StreamPayload::ToolStart {
            tool_id: sdk_message.get("toolId")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string(),
            tool_name: sdk_message.get("toolName")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string(),
            input: sdk_message.get("input")
                .cloned()
                .unwrap_or(serde_json::Value::Object(serde_json::Map::new())),
        },
        "tool_complete" => StreamPayload::ToolComplete {
            tool_id: sdk_message.get("toolId")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string(),
            result: sdk_message.get("result")
                .cloned()
                .unwrap_or(serde_json::Value::Null),
            is_error: sdk_message.get("isError")
                .and_then(|v| v.as_bool())
                .unwrap_or(false),
            duration_ms: sdk_message.get("durationMs")
                .and_then(|v| v.as_u64())
                .unwrap_or(0),
        },
        "complete" => StreamPayload::Complete {
            session_id: sdk_message.get("sessionId")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string(),
            duration_ms: sdk_message.get("durationMs")
                .and_then(|v| v.as_u64())
                .unwrap_or(0),
            cost_usd: sdk_message.get("costUsd")
                .and_then(|v| v.as_f64()),
        },
        "error" => StreamPayload::Error {
            code: sdk_message.get("code")
                .and_then(|v| v.as_str())
                .unwrap_or("1001")
                .to_string(),
            message: sdk_message.get("message")
                .and_then(|v| v.as_str())
                .unwrap_or("Unknown error")
                .to_string(),
            recoverable: sdk_message.get("recoverable")
                .and_then(|v| v.as_bool())
                .unwrap_or(true),
        },
        _ => return Ok(()), // Ignore unknown message types
    };

    // Determine event channel based on payload type
    let event_name = match &payload {
        StreamPayload::Text { .. } => "orion://message/chunk",
        StreamPayload::Thinking { .. } => "orion://message/chunk",
        StreamPayload::ToolStart { .. } => "orion://tool/start",
        StreamPayload::ToolComplete { .. } => "orion://tool/complete",
        StreamPayload::Complete { .. } => "orion://session/complete",
        StreamPayload::Error { .. } => "orion://session/error",
    };

    let event = OrionStreamEvent {
        request_id: request_id.to_string(),
        session_id: session_id.to_string(),
        timestamp: Utc::now().to_rfc3339(),
        payload,
    };

    app.emit(event_name, event)
        .map_err(|e| format!("Failed to emit event: {}", e))?;

    Ok(())
}

/// Emit error event
pub fn emit_error_event(
    app: &AppHandle,
    request_id: &str,
    session_id: &str,
    message: &str,
) -> Result<(), String> {
    let event = OrionStreamEvent {
        request_id: request_id.to_string(),
        session_id: session_id.to_string(),
        timestamp: Utc::now().to_rfc3339(),
        payload: StreamPayload::Error {
            code: "9001".to_string(),
            message: message.to_string(),
            recoverable: false,
        },
    };

    app.emit("orion://session/error", event)
        .map_err(|e| format!("Failed to emit error: {}", e))
}
```

### SDK Runner Sidecar (Node.js)

```typescript
// src-tauri/sidecar/sdk-runner.mjs

import { agentSDK } from '../src/lib/sdk/index.js';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    prompt: { type: 'string' },
    'request-id': { type: 'string' },
    'session-id': { type: 'string' },
  },
});

const prompt = values.prompt;
const requestId = values['request-id'];
const sessionId = values['session-id'];

if (!prompt) {
  console.error(JSON.stringify({ type: 'error', code: '1001', message: 'Prompt required' }));
  process.exit(1);
}

// Stream responses as JSON lines
try {
  for await (const message of agentSDK.query(prompt, { sessionId })) {
    console.log(JSON.stringify(message));
  }
} catch (error) {
  console.log(JSON.stringify({
    type: 'error',
    code: '9001',
    message: error.message,
    recoverable: false,
  }));
  process.exit(1);
}
```

### TypeScript IPC Wrapper

```typescript
// src/lib/ipc/chat.ts

import { invoke } from '@tauri-apps/api/core';

/**
 * Request payload for chat_send command
 */
interface ChatSendRequest {
  prompt: string;
  sessionId?: string;
}

/**
 * Response from chat_send command
 * AC #2: Contains requestId for stream correlation
 */
interface ChatSendResponse {
  requestId: string;
}

/**
 * Send a chat message and receive requestId for stream correlation
 * AC #1: Invokes Rust backend which spawns SDK query
 * AC #2: Returns requestId immediately
 * AC #3: Non-blocking - streaming via events
 */
export async function sendChatMessage(
  prompt: string,
  sessionId?: string
): Promise<ChatSendResponse> {
  const response = await invoke<ChatSendResponse>('chat_send', {
    request: { prompt, sessionId } as ChatSendRequest,
  });
  return response;
}
```

### Frontend Event Types

```typescript
// src/lib/ipc/types.ts

/**
 * Stream event types matching architecture.md
 */
export type StreamEventType =
  | 'text'
  | 'thinking'
  | 'tool_start'
  | 'tool_complete'
  | 'complete'
  | 'error';

/**
 * Base stream event wrapper
 * Matches architecture.md lines 914-918 (OrionEvent<T>)
 */
export interface OrionStreamEvent<T> {
  requestId: string;
  sessionId: string;
  timestamp: string;
  payload: T;
}

/**
 * Message chunk payload (text or thinking)
 * Matches architecture.md line 922-926
 */
export interface MessageChunkPayload {
  type: 'text' | 'thinking';
  content: string;
  isComplete: boolean;  // Final chunk?
}

/**
 * Tool start payload
 * Matches architecture.md lines 929-934
 */
export interface ToolStartPayload {
  type: 'tool_start';
  toolId: string;
  toolName: string;
  input: Record<string, unknown>;
}

/**
 * Tool complete payload
 * Matches architecture.md lines 936-942
 */
export interface ToolCompletePayload {
  type: 'tool_complete';
  toolId: string;
  result: unknown;
  isError: boolean;
  durationMs: number;
}

/**
 * Session complete payload
 */
export interface SessionCompletePayload {
  type: 'complete';
  sessionId: string;
  durationMs: number;
  costUsd: number | null;
}

/**
 * Session error payload
 */
export interface SessionErrorPayload {
  type: 'error';
  code: string;
  message: string;
  recoverable: boolean;
}
```

### Command Registration (Rust)

```rust
// src-tauri/src/main.rs

mod commands;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::chat::chat_send,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## Implementation Tasks

- [ ] Task 1: Create Rust command module (AC: #1, #2, #3)
  - [ ] 1.1: Create `src-tauri/src/commands/mod.rs` module file
  - [ ] 1.2: Create `src-tauri/src/commands/chat.rs` with `ChatSendRequest` and `ChatSendResponse` structs
  - [ ] 1.3: Implement `chat_send` command with `#[tauri::command]` attribute
  - [ ] 1.4: Generate UUID for `requestId` (AC #2)
  - [ ] 1.5: Spawn async task for SDK query (AC #3)
  - [ ] 1.6: Return `ChatSendResponse` immediately (AC #2)

- [ ] Task 2: Create event emission module (AC: #1)
  - [ ] 2.1: Create `src-tauri/src/commands/events.rs`
  - [ ] 2.2: Define `StreamPayload` enum with all message types
  - [ ] 2.3: Define `OrionStreamEvent` wrapper struct
  - [ ] 2.4: Implement `emit_stream_event()` function
  - [ ] 2.5: Implement `emit_error_event()` function

- [ ] Task 3: Create SDK runner sidecar (AC: #1)
  - [ ] 3.1: Create `src-tauri/sidecar/` directory
  - [ ] 3.2: Create `sdk-runner.mjs` with CLI argument parsing
  - [ ] 3.3: Import and call `agentSDK.query()` from SDK wrapper
  - [ ] 3.4: Output JSON lines to stdout
  - [ ] 3.5: Handle errors with JSON error output

- [ ] Task 4: Implement sidecar spawning (AC: #1)
  - [ ] 4.1: Add `tokio` dependency to Cargo.toml for async process handling
  - [ ] 4.2: Implement `run_sdk_query()` function
  - [ ] 4.3: Spawn Node.js process with sidecar script
  - [ ] 4.4: Read stdout line-by-line
  - [ ] 4.5: Parse JSON and emit events

- [ ] Task 5: Create TypeScript IPC wrapper (AC: #2)
  - [ ] 5.1: Create `src/lib/ipc/chat.ts`
  - [ ] 5.2: Define `ChatSendRequest` and `ChatSendResponse` types
  - [ ] 5.3: Implement `sendChatMessage()` function using `invoke()`

- [ ] Task 6: Create event type definitions (AC: #1)
  - [ ] 6.1: Create `src/lib/ipc/types.ts`
  - [ ] 6.2: Define all `StreamPayload` types
  - [ ] 6.3: Define `OrionStreamEvent` wrapper type

- [ ] Task 7: Register command in Tauri
  - [ ] 7.1: Add `mod commands;` to main.rs
  - [ ] 7.2: Register `chat_send` in `invoke_handler`
  - [ ] 7.3: Add required dependencies to Cargo.toml (uuid, chrono, serde_json)

- [ ] Task 8: Build verification
  - [ ] 8.1: Run `cargo build` to verify Rust compiles
  - [ ] 8.2: Run `npm run tauri dev` to verify app launches
  - [ ] 8.3: Test invoke from frontend console

---

## Dependencies

### Requires (from prior stories)

| Story | What It Provides | Why Needed |
|-------|------------------|------------|
| Story 2.1 | SDK package `@anthropic-ai/claude-agent-sdk` | SDK for sidecar to import |
| Story 2.2 | `IAgentSDK` interface | Contract for SDK wrapper |
| Story 2.3 | Complete `agentSDK.query()` implementation | Function for sidecar to call |
| Story 2.3 | `StreamMessage` type definitions | Types for JSON output |
| Story 2.3 | `OrionError` class | Error format for JSON output |

### Provides For (future stories)

| Story | What This Story Provides |
|-------|--------------------------|
| Story 2.5 | IPC events for frontend to listen to |
| Story 2.6 | `requestId` for XState machine to correlate events |
| Story 2.7-2.16 | Complete IPC layer for all streaming features |

---

## Accessibility Requirements

N/A - This is a developer-facing architecture story with no UI impact.

---

## File Locations

### Files to Create

| File | Purpose |
|------|---------|
| `src-tauri/src/commands/mod.rs` | Rust commands module |
| `src-tauri/src/commands/chat.rs` | Chat send command implementation |
| `src-tauri/src/commands/events.rs` | Event emission utilities |
| `src-tauri/sidecar/sdk-runner.mjs` | Node.js sidecar script |
| `src/lib/ipc/chat.ts` | TypeScript IPC wrapper |
| `src/lib/ipc/types.ts` | Event type definitions |
| `src/lib/ipc/index.ts` | Barrel export |

### Files to Modify

| File | Changes |
|------|---------|
| `src-tauri/src/main.rs` | Register chat_send command |
| `src-tauri/Cargo.toml` | Add uuid, chrono dependencies |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `src/lib/sdk/*` | SDK wrapper from Story 2.3 is complete |
| `src-tauri/tauri.conf.json` | No capability changes needed yet |

---

## Definition of Done

- [ ] Rust command `chat_send` exists with `#[tauri::command]` attribute
- [ ] Command returns `requestId` immediately (AC #2)
- [ ] Command spawns background task for SDK query (AC #3)
- [ ] Sidecar script calls `agentSDK.query()` and outputs JSON lines
- [ ] Rust backend parses JSON and emits Tauri events
- [ ] Event names match architecture.md: `orion://message/chunk`, etc.
- [ ] TypeScript wrapper `sendChatMessage()` works with `invoke()`
- [ ] Event type definitions match architecture.md
- [ ] `cargo build` completes successfully
- [ ] `npm run tauri dev` launches the app
- [ ] PR passes CI checks

---

## Test Strategy

### Unit Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.4-UNIT-001 | `chat_send` returns valid UUID as requestId | #2 |
| 2.4-UNIT-002 | `chat_send` returns immediately (non-blocking) | #3 |
| 2.4-UNIT-003 | `emit_stream_event` parses text messages correctly | #1 |
| 2.4-UNIT-004 | `emit_stream_event` parses tool_start messages correctly | #1 |
| 2.4-UNIT-005 | `emit_stream_event` parses tool_complete messages correctly | #1 |
| 2.4-UNIT-006 | `emit_stream_event` parses complete messages correctly | #1 |
| 2.4-UNIT-007 | `emit_stream_event` parses error messages correctly | #1 |
| 2.4-UNIT-008 | SDK runner parses CLI arguments correctly | #1 |
| 2.4-UNIT-009 | SDK runner outputs valid JSON lines | #1 |

### Integration Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.4-INT-001 | Frontend `invoke()` reaches Rust command | #1 |
| 2.4-INT-002 | `requestId` is unique across calls | #2 |
| 2.4-INT-003 | Events are emitted with correct `requestId` | #1, #2 |
| 2.4-INT-004 | Multiple concurrent requests use separate requestIds | #2 |

### E2E Tests

| Test ID | Description | AC |
|---------|-------------|-----|
| 2.4-E2E-001 | Send message returns requestId within 100ms | #2, #3 |
| 2.4-E2E-002 | Events arrive with matching requestId | #1, #2 |
| 2.4-E2E-003 | Complete event arrives after text events | #1 |

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| Rust implementation | 3 hours |
| Sidecar script | 1 hour |
| TypeScript wrapper | 1 hour |
| Testing | 2 hours |
| Documentation | 30 minutes |
| **Total** | 7.5 hours |

---

## Notes

### Sidecar Architecture Rationale

The Claude Agent SDK is TypeScript, but Tauri's backend is Rust. Options considered:

1. **Rust SDK binding** - No official Rust SDK exists
2. **WebView bridge** - Would block UI thread
3. **Sidecar process** - Selected: Isolated Node.js process communicates via stdout

The sidecar pattern:
- Keeps SDK in its native TypeScript environment
- Isolates SDK crashes from main app
- Enables streaming via JSON-line protocol
- Follows architecture.md recommendation

### Non-Blocking Pattern

The command returns immediately with `requestId`. The actual SDK query runs in:

1. Tokio background task (Rust async)
2. Spawned Node.js sidecar process

This ensures:
- UI never blocks waiting for Claude
- Multiple queries can run concurrently
- Each query is trackable via `requestId`

### Event Channel Naming

Following architecture.md `orion://` namespace:
- `orion://message/chunk` - Text and thinking content
- `orion://tool/start` - Tool invocation started
- `orion://tool/complete` - Tool invocation completed
- `orion://session/complete` - Query finished successfully
- `orion://session/error` - Query failed

### Future Enhancements (NOT in this story)

- Request cancellation (`orion:chat:cancel` command)
- Session persistence
- Token budget enforcement
- Concurrent request limits
- Sidecar process pooling

---

## References

- [Source: thoughts/planning-artifacts/architecture.md#Streaming IPC Event Schema]
- [Source: thoughts/planning-artifacts/architecture.md#Naming Patterns]
- [Source: thoughts/planning-artifacts/epics.md#Story 2.4: Create Tauri IPC Command for Chat]
- [Source: thoughts/research/streaming-architecture.md#Electron IPC Streaming Pattern]
- [Source: .ralph/story-chain.md#Story 2.3 Notes for Next Story]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - expected: chat.rs, events.rs, mod.rs, sdk-runner.mjs, chat.ts, types.ts, index.ts)
