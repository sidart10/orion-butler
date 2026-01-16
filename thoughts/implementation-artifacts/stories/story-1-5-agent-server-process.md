# Story 1.5: Agent Server Process

Status: ready-for-dev

---

## Story

As a user,
I want the AI agent to run as a local service,
So that my requests are processed quickly without external dependencies.

---

## Acceptance Criteria

1. **AC1: Server Starts on App Launch**
   - **Given** the Tauri app launches
   - **When** initialization completes
   - **Then** the Agent Server (Node.js) starts on localhost:3001 (ARCH-005)
   - **And** the server is a child process managed by Tauri
   - **And** health endpoint responds at /health

2. **AC2: Server Stops on App Quit**
   - **Given** the Agent Server is running
   - **When** the Tauri app quits
   - **Then** the Agent Server process is terminated cleanly

3. **AC3: Server Auto-Restarts on Crash**
   - **Given** the Agent Server crashes
   - **When** Tauri detects the failure
   - **Then** the server is automatically restarted
   - **And** the user sees a non-blocking notification

---

## Tasks / Subtasks

- [ ] **Task 1: Create Agent Server Node.js Project** (AC: 1)
  - [ ] 1.1 Create `agent-server/` directory in project root
  - [ ] 1.2 Initialize package.json with type: "module" for ES modules
  - [ ] 1.3 Add dependencies: express, cors, @anthropic-ai/claude-agent-sdk (placeholder)
  - [ ] 1.4 Add dev dependencies: typescript, @types/node, @types/express, tsx
  - [ ] 1.5 Create tsconfig.json with ES2022 target, NodeNext module
  - [ ] 1.6 Configure build scripts: `build` (tsc), `dev` (tsx watch)

- [ ] **Task 2: Implement Basic Express Server** (AC: 1)
  - [ ] 2.1 Create `agent-server/src/index.ts` as entry point
  - [ ] 2.2 Set up Express app with CORS enabled for localhost:3000
  - [ ] 2.3 Read PORT from environment (default 3001)
  - [ ] 2.4 Add graceful shutdown handler for SIGTERM/SIGINT
  - [ ] 2.5 Add startup logging with timestamp

- [ ] **Task 3: Implement Health Endpoint** (AC: 1)
  - [ ] 3.1 Create `agent-server/src/routes/health.ts`
  - [ ] 3.2 GET /health returns: `{ status: "ok", timestamp: ISO8601, uptime: seconds }`
  - [ ] 3.3 Add process memory usage to health response
  - [ ] 3.4 Test endpoint responds within 100ms

- [ ] **Task 4: Create Streaming Endpoint Stub** (AC: 1)
  - [ ] 4.1 Create `agent-server/src/routes/stream.ts`
  - [ ] 4.2 GET /api/stream/:streamId sets SSE headers (Content-Type: text/event-stream)
  - [ ] 4.3 Implement placeholder that sends test events every second
  - [ ] 4.4 Send completion event after 3 test messages
  - [ ] 4.5 Document endpoint for Story 1.8 (Streaming Responses) implementation

- [ ] **Task 5: Modify Tauri to Spawn Agent Server** (AC: 1, 2)
  - [ ] 5.1 Create `src-tauri/src/agent_server.rs` module
  - [ ] 5.2 Define `AgentServerState` struct to hold child process handle
  - [ ] 5.3 Implement `start_agent_server()` function using `std::process::Command`
  - [ ] 5.4 Spawn node process with args: `["dist/index.js"]`
  - [ ] 5.5 Set environment: `PORT=3001`, `NODE_ENV=production`
  - [ ] 5.6 Set working directory to agent-server resource folder
  - [ ] 5.7 Store Child process handle in Tauri state

- [ ] **Task 6: Implement Server Health Monitoring** (AC: 3)
  - [ ] 6.1 Create async task to poll /health endpoint every 5 seconds
  - [ ] 6.2 Track consecutive health check failures (threshold: 3)
  - [ ] 6.3 On failure threshold, emit Tauri event: `agent-server:health-failed`
  - [ ] 6.4 Implement process exit detection using `child.try_wait()`

- [ ] **Task 7: Implement Auto-Restart Logic** (AC: 3)
  - [ ] 7.1 On process exit or health failure, attempt restart
  - [ ] 7.2 Implement exponential backoff: 1s, 2s, 4s, max 30s
  - [ ] 7.3 Reset backoff on successful health check
  - [ ] 7.4 Emit Tauri event on restart: `agent-server:restarted`
  - [ ] 7.5 Cap restart attempts at 5 within 5 minutes (circuit breaker)

- [ ] **Task 8: Implement Clean Shutdown** (AC: 2)
  - [ ] 8.1 On Tauri `CloseRequested` event, call `child.kill()`
  - [ ] 8.2 Wait up to 5 seconds for graceful exit
  - [ ] 8.3 Force kill if still running after timeout
  - [ ] 8.4 Log shutdown sequence

- [ ] **Task 9: Add Frontend Notification for Server Status** (AC: 3)
  - [ ] 9.1 Create React hook: `useAgentServerStatus()`
  - [ ] 9.2 Listen to Tauri events: `agent-server:restarted`, `agent-server:health-failed`
  - [ ] 9.3 Show toast notification on restart (non-blocking)
  - [ ] 9.4 Show warning banner if server is unavailable

- [ ] **Task 10: Bundle Agent Server for Distribution** (AC: 1)
  - [ ] 10.1 Add agent-server to Tauri bundle resources
  - [ ] 10.2 Configure `tauri.conf.json` resources section
  - [ ] 10.3 Add `beforeBuildCommand` to compile agent-server TypeScript
  - [ ] 10.4 Verify bundled server runs from resource directory

- [ ] **Task 11: Write Tests** (AC: 1, 2, 3)
  - [ ] 11.1 Integration test: Server starts and responds on port 3001
  - [ ] 11.2 Integration test: Server stops when app quits
  - [ ] 11.3 Integration test: Server auto-restarts after simulated crash
  - [ ] 11.4 Unit test: Health endpoint returns 200 with status JSON
  - [ ] 11.5 E2E test: App remains functional during server restart

---

## Dev Notes

### Critical Architecture Constraints

| Constraint | Requirement | Source |
|------------|-------------|--------|
| Agent Server Port | localhost:3001 | ARCH-005 |
| Server Runtime | Node.js | [architecture.md#2.2] |
| Streaming Protocol | SSE (Server-Sent Events) | ARCH-023 |
| Process Management | Tauri child process | [architecture.md#2.2] |
| Health Check | /health endpoint | Story 1.5 AC |

### System Architecture Context

The Agent Server is a critical component in the Orion architecture:

```
[Tauri Main Process (Rust)]
    |
    +-- [WebView (Next.js/React)]
    |       |
    |       +-- Chat Component
    |       +-- Canvas Component
    |
    +-- [Agent Server (Node.js) - Child Process] <-- THIS STORY
            |
            +-- Claude Agent SDK (Story 1.7)
            +-- Composio Client (Epic 3)
            +-- Tool Execution (Epic 3)
```

### Data Flow (Future Implementation)

```
User Input -> WebView -> Tauri IPC -> Agent Server -> Claude API
                                          |
                                          v
                                    Tool Execution
                                    (Composio/Local)
                                          |
                                          v
                                    Stream Response
                                          |
                                          v
                         Agent Server -> Tauri IPC -> WebView -> UI Update
```

### Agent Server Structure

```
agent-server/
├── src/
│   ├── index.ts             # Entry point - Express app setup
│   ├── config.ts            # Environment configuration
│   └── routes/
│       ├── health.ts        # GET /health endpoint
│       └── stream.ts        # GET /api/stream/:streamId (SSE)
├── dist/                    # Compiled output (bundled with Tauri)
├── package.json
└── tsconfig.json
```

### Rust Process Management Reference

From architecture.md - the pattern for spawning and managing the server:

```rust
// src-tauri/src/agent_server.rs

use std::process::{Command, Child};
use std::sync::Mutex;

struct AgentServerState(Mutex<Option<Child>>);

// In setup hook:
let child = Command::new("node")
    .args(["dist/index.js"])
    .current_dir(&server_path)
    .env("PORT", "3001")
    .spawn()
    .expect("Failed to start agent server");

app.manage(AgentServerState(Mutex::new(Some(child))));

// On window close:
if let Some(mut child) = guard.take() {
    let _ = child.kill();
}
```

### Express Server Setup Reference

```typescript
// agent-server/src/index.ts
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// SSE streaming endpoint (stub for Story 1.8)
app.get('/api/stream/:streamId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Placeholder - sends test event
  res.write('event: connected\ndata: {}\n\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Agent server running on http://localhost:${PORT}`);
});
```

### Health Check Response Schema

```typescript
interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;      // ISO 8601
  uptime: number;         // seconds
  memory: {
    heapUsed: number;     // bytes
    heapTotal: number;    // bytes
    rss: number;          // bytes
  };
  version: string;        // from package.json
}
```

### Tauri Bundle Configuration

Add to `src-tauri/tauri.conf.json`:

```json
{
  "bundle": {
    "resources": [
      {
        "src": "../agent-server/dist/**/*",
        "target": "agent-server/"
      },
      {
        "src": "../agent-server/package.json",
        "target": "agent-server/"
      }
    ]
  }
}
```

### Dependencies to Add

**agent-server/package.json:**
```json
{
  "name": "orion-agent-server",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.21.x",
    "cors": "^2.8.x"
  },
  "devDependencies": {
    "typescript": "^5.7.x",
    "@types/node": "^22.x",
    "@types/express": "^5.x",
    "@types/cors": "^2.8.x",
    "tsx": "^4.x"
  }
}
```

**src-tauri/Cargo.toml additions:**
```toml
[dependencies]
reqwest = { version = "0.12", features = ["stream"] }
futures-util = "0.3"
tokio = { version = "1", features = ["full"] }
urlencoding = "2.1"
```

### File Structure for This Story

```
orion/
├── agent-server/                    # CREATE: New directory
│   ├── src/
│   │   ├── index.ts                # CREATE: Express entry point
│   │   ├── config.ts               # CREATE: Environment config
│   │   └── routes/
│   │       ├── health.ts           # CREATE: Health endpoint
│   │       └── stream.ts           # CREATE: SSE stub
│   ├── package.json                # CREATE: Dependencies
│   └── tsconfig.json               # CREATE: TypeScript config
│
├── src-tauri/
│   ├── src/
│   │   ├── main.rs                 # MODIFY: Add agent_server module
│   │   ├── agent_server.rs         # CREATE: Server management
│   │   └── health_monitor.rs       # CREATE: Health polling
│   ├── Cargo.toml                  # MODIFY: Add dependencies
│   └── tauri.conf.json             # MODIFY: Add bundle resources
│
└── src/
    └── hooks/
        └── useAgentServerStatus.ts  # CREATE: Status hook
```

### Project Structure Notes

- Story 1.1 (Tauri Desktop Shell) must be complete - provides Tauri infrastructure
- Story 1.4 (SQLite Database Setup) can run in parallel
- Story 1.7 (Claude Integration) depends on this - will add actual Claude SDK calls
- Story 1.8 (Streaming Responses) depends on this - will implement real SSE streaming
- Story 3.1 (Composio MCP Integration) depends on this - agent server hosts Composio

### Testing Standards

| Test Type | Framework | Files |
|-----------|-----------|-------|
| Integration | Vitest | `agent-server/tests/integration.test.ts` |
| Unit | Vitest | `agent-server/tests/health.test.ts` |
| E2E | Playwright | `tests/e2e/agent-server.spec.ts` |
| Rust Unit | cargo test | `src-tauri/src/agent_server.rs` |

### Tests to Implement

```typescript
// tests/e2e/agent-server.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Agent Server', () => {
  test('health endpoint responds with 200', async ({ request }) => {
    const response = await request.get('http://localhost:3001/health');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.uptime).toBeGreaterThan(0);
  });

  test('server starts when app launches', async ({ page }) => {
    // Wait for app to launch
    await page.waitForTimeout(2000);

    const response = await fetch('http://localhost:3001/health');
    expect(response.ok).toBe(true);
  });

  test('server stops when app closes', async ({ page }) => {
    // Close app
    await page.close();
    await page.waitForTimeout(1000);

    // Verify server is not running
    await expect(fetch('http://localhost:3001/health')).rejects.toThrow();
  });

  test('SSE endpoint establishes connection', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/stream/test-id');
    expect(response.headers()['content-type']).toContain('text/event-stream');
  });
});
```

```rust
// src-tauri/src/agent_server.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_health_response() {
        let json = r#"{"status":"ok","uptime":42}"#;
        let health: HealthResponse = serde_json::from_str(json).unwrap();
        assert_eq!(health.status, "ok");
        assert_eq!(health.uptime, 42);
    }
}
```

### Error Handling Considerations

1. **Server fails to start:**
   - Log error with full details
   - Emit `agent-server:start-failed` event
   - Show user notification with retry option

2. **Port already in use:**
   - Check if existing process is Orion's
   - If not, prompt user to close other app
   - Option: Use dynamic port allocation

3. **Node.js not installed:**
   - Bundle Node.js runtime OR
   - Use pkg to create standalone binary (future)
   - Show clear error message

4. **Health check timeout:**
   - Don't immediately fail - could be CPU spike
   - Retry with increasing timeout (1s, 2s, 3s)
   - Only restart after 3 consecutive failures

---

### References

- [Source: thoughts/planning-artifacts/architecture.md#2.2 Process Architecture]
- [Source: thoughts/planning-artifacts/architecture.md#5.3 Agent Server API]
- [Source: thoughts/planning-artifacts/architecture.md#8.2 Rust Main Process]
- [Source: thoughts/planning-artifacts/architecture.md#8.3 IPC Event Streaming]
- [Source: thoughts/planning-artifacts/epics.md#Story 1.5: Agent Server Process]
- [Source: thoughts/planning-artifacts/prd.md#6.4 AI Integration]
- [Source: thoughts/planning-artifacts/architecture.md#16. File Structure]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-15 | Story created with comprehensive context | SM Agent (Bob) |

### File List

(To be filled during implementation - track all files created/modified)
