# ATDD Checklist: Story 1-5-agent-server-process

## Story Reference

- **Story ID:** 1-5-agent-server-process
- **Epic:** 1 - Desktop Foundation
- **Title:** Agent Server Process
- **Status:** ready-for-dev

---

## Acceptance Criteria Summary

| AC | Description | Test Types Required |
|----|-------------|---------------------|
| AC1 | Server Starts on App Launch | Integration, Unit, E2E |
| AC2 | Server Stops on App Quit | Integration, E2E |
| AC3 | Server Auto-Restarts on Crash | Integration, E2E |

---

## AC1: Server Starts on App Launch

### Test Scenarios

#### 1.1 Server Process Spawning

| ID | Scenario | Given | When | Then | Type | Priority |
|----|----------|-------|------|------|------|----------|
| T1.1.1 | Server starts on app launch | Tauri app is launching | Initialization completes | Agent Server (Node.js) starts as child process | Integration | P0 |
| T1.1.2 | Server binds to correct port | Server is starting | Server process begins | Server binds to localhost:3001 per ARCH-005 | Unit | P0 |
| T1.1.3 | Server is managed by Tauri | App has launched | Server is running | Child process handle is stored in Tauri state | Unit | P1 |
| T1.1.4 | Server process environment | Server is spawning | Process starts | PORT=3001 and NODE_ENV=production are set | Unit | P1 |
| T1.1.5 | Server working directory | Server is spawning | Process starts | Current directory is agent-server resource folder | Integration | P1 |

#### 1.2 Health Endpoint

| ID | Scenario | Given | When | Then | Type | Priority |
|----|----------|-------|------|------|------|----------|
| T1.2.1 | Health endpoint responds | Server is running | GET /health is called | Response status is 200 OK | Unit | P0 |
| T1.2.2 | Health response JSON structure | Server is running | GET /health is called | Response contains status, version, uptime fields | Unit | P0 |
| T1.2.3 | Health status field | Server is healthy | GET /health is called | status field equals "ok" | Unit | P0 |
| T1.2.4 | Health version field | Server is running | GET /health is called | version field contains valid semver | Unit | P1 |
| T1.2.5 | Health uptime field | Server has been running 5+ seconds | GET /health is called | uptime field is number >= 5 | Unit | P0 |
| T1.2.6 | Health timestamp field | Server is running | GET /health is called | timestamp is valid ISO 8601 string | Unit | P1 |
| T1.2.7 | Health memory info | Server is running | GET /health is called | Response includes heapUsed, heapTotal, rss (bytes) | Unit | P2 |
| T1.2.8 | Health response time | Server is running | GET /health is called | Response returns within 100ms | Unit | P1 |

#### 1.3 CORS Configuration

| ID | Scenario | Given | When | Then | Type | Priority |
|----|----------|-------|------|------|------|----------|
| T1.3.1 | CORS allows localhost:3000 | Server is running | Request from localhost:3000 | Request is allowed with proper CORS headers | Unit | P0 |
| T1.3.2 | CORS headers present | Server is running | Cross-origin request | Access-Control-Allow-Origin header is present | Unit | P0 |
| T1.3.3 | CORS blocks other origins | Server is running | Request from random-domain.com | Request is blocked | Unit | P1 |
| T1.3.4 | CORS preflight OPTIONS | Server is running | OPTIONS /health from localhost:3000 | 204 response with CORS headers | Unit | P1 |

#### 1.4 Express Server Setup

| ID | Scenario | Given | When | Then | Type | Priority |
|----|----------|-------|------|------|------|----------|
| T1.4.1 | Server listens on configured port | PORT env is 3001 | Server starts | Server accepts connections on 3001 | Integration | P0 |
| T1.4.2 | Server logs startup | Server is starting | Startup completes | Console logs timestamp and port info | Unit | P2 |
| T1.4.3 | JSON body parsing enabled | Server is running | POST with JSON body | Body is parsed correctly | Unit | P1 |

---

## AC2: Server Stops on App Quit

### Test Scenarios

#### 2.1 Graceful Shutdown

| ID | Scenario | Given | When | Then | Type | Priority |
|----|----------|-------|------|------|------|----------|
| T2.1.1 | SIGTERM received on quit | Agent Server is running | Tauri app quits (close window) | Server process receives SIGTERM | Integration | P0 |
| T2.1.2 | SIGTERM received on Cmd+Q | Agent Server is running | User presses Cmd+Q | Server process receives SIGTERM | E2E | P0 |
| T2.1.3 | Graceful shutdown within timeout | Server receives SIGTERM | 5 seconds elapse | Server has shut down gracefully | Integration | P0 |
| T2.1.4 | Server logs shutdown | Server receives SIGTERM | Shutdown begins | Console logs "Received SIGTERM, shutting down..." | Unit | P2 |
| T2.1.5 | Exit code on graceful shutdown | Server receives SIGTERM | Server shuts down | Exit code is 0 | Unit | P1 |

#### 2.2 Process Cleanup

| ID | Scenario | Given | When | Then | Type | Priority |
|----|----------|-------|------|------|------|----------|
| T2.2.1 | No orphan processes | App has quit | 10 seconds after quit | No node processes from agent-server remain | E2E | P0 |
| T2.2.2 | Child process handle cleared | App is quitting | Shutdown completes | Tauri state AgentServerState is cleared | Unit | P1 |
| T2.2.3 | Force kill after timeout | Server doesn't respond to SIGTERM | 5 seconds elapse | Process is force killed (SIGKILL) | Integration | P1 |
| T2.2.4 | Port released | Server has stopped | Immediate check | Port 3001 is available for rebinding | Integration | P1 |

---

## AC3: Server Auto-Restarts on Crash

### Test Scenarios

#### 3.1 Crash Detection

| ID | Scenario | Given | When | Then | Type | Priority |
|----|----------|-------|------|------|------|----------|
| T3.1.1 | Process exit detection | Agent Server crashes unexpectedly | Tauri checks process status | Exit detected via child.try_wait() | Integration | P0 |
| T3.1.2 | Non-zero exit code detected | Server crashes | Tauri monitors process | Non-zero exit code is detected | Unit | P1 |
| T3.1.3 | Health check failure detection | Server hangs (no crash) | 3 consecutive health checks fail | Health failure is detected | Integration | P1 |
| T3.1.4 | Health check threshold | Server has intermittent issues | 2 health checks fail, then 1 succeeds | No restart triggered (threshold is 3) | Unit | P1 |

#### 3.2 Auto-Restart Mechanism

| ID | Scenario | Given | When | Then | Type | Priority |
|----|----------|-------|------|------|------|----------|
| T3.2.1 | Automatic restart on crash | Server has crashed | Tauri detects exit | Server is automatically restarted | Integration | P0 |
| T3.2.2 | Exponential backoff 1s | Server crashes first time | Restart attempt begins | Wait 1 second before restart | Unit | P0 |
| T3.2.3 | Exponential backoff 2s | Server crashes second time | Restart attempt begins | Wait 2 seconds before restart | Unit | P0 |
| T3.2.4 | Exponential backoff 4s | Server crashes third time | Restart attempt begins | Wait 4 seconds before restart | Unit | P0 |
| T3.2.5 | Exponential backoff max 30s | Server crashes many times | Backoff exceeds 30s | Backoff caps at 30 seconds | Unit | P0 |
| T3.2.6 | Backoff reset on success | Server restarts successfully | Health check succeeds | Backoff resets to 1s for next failure | Unit | P1 |
| T3.2.7 | Circuit breaker activation | 5 restarts within 5 minutes | 6th crash occurs | No more restart attempts | Integration | P1 |

#### 3.3 User Notifications

| ID | Scenario | Given | When | Then | Type | Priority |
|----|----------|-------|------|------|------|----------|
| T3.3.1 | Restart notification non-blocking | Server has restarted | Notification appears | User can continue using app (non-modal) | E2E | P0 |
| T3.3.2 | Restart notification content | Server has restarted | User sees notification | Message indicates server restarted | E2E | P1 |
| T3.3.3 | Server unavailable warning | Server fails to restart | Circuit breaker active | Warning banner displayed in UI | E2E | P1 |

#### 3.4 Frontend Status Detection

| ID | Scenario | Given | When | Then | Type | Priority |
|----|----------|-------|------|------|------|----------|
| T3.4.1 | Tauri event on restart | Server restarts | Restart completes | `agent-server:restarted` event emitted | Unit | P0 |
| T3.4.2 | Tauri event on health failure | Health checks fail 3x | Failure threshold reached | `agent-server:health-failed` event emitted | Unit | P0 |
| T3.4.3 | Frontend detects restart event | Server restarts | Event is emitted | useAgentServerStatus hook receives event | Integration | P0 |
| T3.4.4 | Frontend detects failure event | Server health fails | Event is emitted | useAgentServerStatus hook receives event | Integration | P0 |
| T3.4.5 | React hook state update | Tauri event fires | Hook processes event | Component re-renders with new status | Unit | P1 |

---

## Test Implementation Matrix

### By Test Type

| Test Type | Framework | Location | Count |
|-----------|-----------|----------|-------|
| Unit | Vitest | `agent-server/tests/*.test.ts` | 22 |
| Unit (Rust) | cargo test | `src-tauri/src/agent_server.rs` | 8 |
| Integration | Vitest | `agent-server/tests/integration.test.ts` | 12 |
| E2E | Playwright | `tests/e2e/agent-server.spec.ts` | 7 |

### By Priority

| Priority | Count | Description |
|----------|-------|-------------|
| P0 | 23 | Must pass for story acceptance |
| P1 | 18 | Should pass for quality release |
| P2 | 4 | Nice to have, non-blocking |

---

## Test Data Requirements

### Server Health Response Schema

```typescript
interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;      // ISO 8601
  uptime: number;         // seconds
  version: string;        // semver
  memory: {
    heapUsed: number;     // bytes
    heapTotal: number;    // bytes
    rss: number;          // bytes
  };
}
```

### Tauri Events Schema

```typescript
// Event: agent-server:restarted
interface ServerRestartedEvent {
  timestamp: string;
  restartCount: number;
  previousUptime: number;
}

// Event: agent-server:health-failed
interface ServerHealthFailedEvent {
  timestamp: string;
  consecutiveFailures: number;
  lastError: string;
}
```

---

## Test Environment Requirements

| Requirement | Value | Notes |
|-------------|-------|-------|
| Node.js | >= 18.x | Required for agent-server |
| Port 3001 | Available | Must not be in use |
| Tauri CLI | >= 2.x | For E2E tests |
| Rust | >= 1.70 | For Rust unit tests |

---

## Edge Cases to Cover

### AC1 Edge Cases

- [ ] Port 3001 already in use by another process
- [ ] Node.js not installed or not in PATH
- [ ] Insufficient permissions to spawn child process
- [ ] agent-server/dist not found (build not run)

### AC2 Edge Cases

- [ ] Server in middle of request when SIGTERM received
- [ ] Multiple rapid quit/restart cycles
- [ ] App force quit (SIGKILL to Tauri)
- [ ] Network connections still open during shutdown

### AC3 Edge Cases

- [ ] Server crashes during restart attempt
- [ ] System sleep/wake during backoff period
- [ ] Memory exhaustion causing crash
- [ ] Disk full preventing logs

---

## Verification Checklist

### Pre-Implementation

- [ ] Test files created in correct locations
- [ ] Test frameworks configured (Vitest, Playwright, cargo test)
- [ ] Mock servers available for isolation tests
- [ ] CI pipeline includes all test types

### Post-Implementation

- [ ] All P0 tests passing
- [ ] All P1 tests passing
- [ ] Test coverage meets minimum (80%)
- [ ] No flaky tests identified
- [ ] Performance benchmarks met (100ms health response)

---

## References

- Story: `thoughts/implementation-artifacts/stories/story-1-5-agent-server-process.md`
- Architecture: `thoughts/planning-artifacts/architecture.md#2.2`
- Constraint: ARCH-005 (Agent Server on localhost:3001)

---

## ATDD Checklist Created

**Date:** 2026-01-15
**Agent:** TEA (Murat) - Master Test Architect
**Total Test Scenarios:** 45
**P0 Critical Tests:** 23
