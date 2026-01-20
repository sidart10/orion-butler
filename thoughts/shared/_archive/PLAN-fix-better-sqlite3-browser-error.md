# Plan: Fix better-sqlite3 Browser Import Error

## Goal

Fix the build error where `better-sqlite3` (a Node.js-only native module) is being imported into client-side code, causing Next.js to fail bundling for the browser.

**Root Cause:** `src/hooks/useChat.ts` (marked `'use client'`) directly imports `getDatabase()` from `@/lib/db`, which imports `better-sqlite3`. This gets bundled for the browser where `fs` module doesn't exist.

## Technical Choices

- **Database Access Pattern**: Add REST API endpoints to agent-server (consistent with existing architecture where agent-server handles backend operations)
- **Why not Server Actions**: The app uses a separate Express agent-server for backend ops, not Next.js API routes. Keeping all backend logic in agent-server maintains architectural consistency.
- **Why not Tauri IPC**: The Rust side doesn't have SQLite integration yet. Agent-server already has Node.js + better-sqlite3.

## Current State Analysis

### Architecture
```
Frontend (Next.js, 'use client')
    ↓ HTTP/SSE
Agent Server (Express, localhost:3001)
    ↓
Claude Agent SDK → Anthropic API
```

**Problem:** Frontend directly imports better-sqlite3 for database operations instead of going through agent-server.

### Key Files

| File | Current Role | Problem |
|------|--------------|---------|
| `src/hooks/useChat.ts` | Chat logic + DB access | Imports better-sqlite3 in client code |
| `src/lib/db/index.ts` | SQLite singleton | Node.js only, can't run in browser |
| `agent-server/src/routes/` | Chat + streaming | Missing database CRUD endpoints |

### Database Operations Needed (from useChat.ts)

1. **createMessage** - Create a message in conversation
2. **createConversation** - Create new conversation
3. **getConversation** - Get single conversation by ID
4. **getMessages** - List messages for conversation
5. **listConversations** - List all conversations (with filters)

## Tasks

### Task 1: Add Database Routes to Agent Server

Create REST endpoints for all database operations needed by the frontend.

**File to create:** `agent-server/src/routes/db.ts`

- [ ] Create router with conversation CRUD endpoints
- [ ] Create router with message CRUD endpoints
- [ ] Add proper error handling and response types
- [ ] Export and mount in `agent-server/src/index.ts`

**Endpoints:**
```
POST   /api/db/conversations          - Create conversation
GET    /api/db/conversations          - List conversations (with query params)
GET    /api/db/conversations/:id      - Get conversation by ID
PUT    /api/db/conversations/:id      - Update conversation

POST   /api/db/messages               - Create message
GET    /api/db/conversations/:id/messages - List messages for conversation
```

### Task 2: Create Database Service in Agent Server

Move database access logic to agent-server.

**File to create:** `agent-server/src/services/database.ts`

- [ ] Copy database initialization from `src/lib/db/index.ts`
- [ ] Copy repository functions from `src/lib/db/repositories/`
- [ ] Adapt for agent-server environment (paths, config)
- [ ] Export typed service functions

### Task 3: Create Frontend Database Service

Create HTTP client for the new database endpoints.

**File to create:** `src/lib/services/databaseService.ts`

- [ ] Create `DatabaseService` class (similar pattern to `chatService.ts`)
- [ ] Implement all CRUD methods using fetch
- [ ] Add proper TypeScript types
- [ ] Export singleton instance

### Task 4: Update useChat Hook

Remove direct database imports and use the new service.

**File to modify:** `src/hooks/useChat.ts`

- [ ] Remove imports: `getDatabase`, repository functions
- [ ] Import new `databaseService`
- [ ] Update `createMessageInDb` to use service
- [ ] Update `createNewConversation` to use service
- [ ] Update `selectConversation` to use service
- [ ] Update `loadConversations` to use service

### Task 5: Add Database Dependencies to Agent Server

Ensure agent-server has required packages.

**File to modify:** `agent-server/package.json`

- [ ] Add `better-sqlite3` dependency
- [ ] Add `@types/better-sqlite3` dev dependency

### Task 6: Copy Database Utilities

Copy necessary files to agent-server.

- [ ] Copy `src/lib/db/path.ts` → `agent-server/src/db/path.ts`
- [ ] Copy `src/lib/db/migrations.ts` → `agent-server/src/db/migrations.ts`
- [ ] Copy `src/lib/db/types.ts` → `agent-server/src/db/types.ts`
- [ ] Copy `src/lib/db/ids.ts` → `agent-server/src/db/ids.ts`
- [ ] Adapt imports and paths for agent-server

### Task 7: Verify Build

Ensure the fix resolves the build error.

- [ ] Run `pnpm build` and verify no `fs` module errors
- [ ] Run `pnpm tauri:dev` and verify app starts
- [ ] Test creating a conversation
- [ ] Test sending a message
- [ ] Test loading conversations on startup

## Success Criteria

### Automated Verification
- [ ] Build passes: `pnpm build` completes without errors
- [ ] Type check: `pnpm lint` passes
- [ ] Unit tests: `pnpm test:unit` passes (existing tests)

### Manual Verification
- [ ] App launches with `pnpm tauri:dev`
- [ ] Can create new conversation
- [ ] Can send message and see response
- [ ] Conversations persist and load on refresh
- [ ] Agent server logs show database requests

## Risks (Pre-Mortem)

### Tigers:
- **Database file location mismatch** (MEDIUM)
  - Agent-server might create DB in different location than frontend expected
  - Mitigation: Use same path resolution logic, verify with logging

- **Migration state inconsistency** (MEDIUM)
  - If both frontend and agent-server try to run migrations
  - Mitigation: Only agent-server runs migrations now

### Elephants:
- **Performance of HTTP for local DB** (LOW)
  - Every DB operation now has HTTP overhead
  - Note: Acceptable for MVP, can optimize later with Tauri IPC

## Out of Scope

- Moving database to Tauri/Rust side (future optimization)
- WebSocket for real-time DB sync (not needed for MVP)
- Database caching on frontend (premature optimization)
- Removing `src/lib/db/` (keep for potential server-side rendering later)

## Alternative Approaches Considered

1. **Next.js Server Actions**: Would require restructuring, and app already uses agent-server pattern
2. **Tauri IPC for DB**: Would require Rust SQLite implementation, more complex
3. **Conditional imports**: Fragile, doesn't solve the architectural issue
4. **External DB service**: Overkill for local SQLite

The chosen approach (agent-server REST endpoints) is consistent with existing architecture and requires minimal changes.
