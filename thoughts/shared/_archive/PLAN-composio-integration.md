# Plan: Composio Tool Router Integration

## Goal

Integrate Composio's Tool Router (from open-claude-cowork reference) to give Orion's agents access to 500+ external tools (Gmail, Slack, Google Calendar, GitHub, etc.) via MCP protocol.

## Current State Analysis

### What We Have (Orion):
- **Agent infrastructure** planned (Epic 2: Butler, Triage, Scheduler, Communicator)
- **Hooks system** migrated from CC v3
- **MCP capability** via `@anthropic-ai/claude-agent-sdk`
- **Database** PostgreSQL + SQLite for session/memory

### What We Need:
- Tool integrations for: Email, Calendar, Contacts, Slack, etc.
- OAuth flow management for connected accounts
- Rate limiting and error handling for external APIs

### Reference Implementation (open-claude-cowork):
- **GitHub**: https://github.com/ComposioHQ/open-claude-cowork
- **Key Files**:
  - `server/server.js` - Composio session + MCP config
  - `server/providers/claude-provider.js` - Claude SDK with MCP integration
  - `setup.sh` - Composio CLI authentication

## Technical Choices

- **MCP Server**: Composio Tool Router (provides 500+ integrations)
- **Why Composio**: Pre-built OAuth flows, unified API, active maintenance
- **Integration Point**: Orion's agent-server process (Story 2.5)
- **Alternative Considered**: Building individual MCP servers (rejected - too much work for 500+ tools)

## Key Files to Create/Modify

### New Files:
- `agent-server/src/composio/client.ts` - Composio session management
- `agent-server/src/composio/mcp-config.ts` - Dynamic MCP config generation
- `agent-server/src/composio/tools.ts` - Tool catalog and permissions
- `.claude/hooks/composio-connection-check.ts` - PreToolUse hook for OAuth

### Modified Files:
- `agent-server/src/agents/orchestrator.ts` - Add MCP config to agent spawning
- `.claude/settings.json` - Register Composio MCP server
- `.env.example` - Add `COMPOSIO_API_KEY`

## Tasks

### Task 1: Composio SDK Setup
Set up Composio client and session management for Orion.

- [ ] Install `composio-core` npm package
- [ ] Create `ComposioClient` class with session-per-user pattern
- [ ] Implement MCP URL retrieval from session
- [ ] Add environment variable for `COMPOSIO_API_KEY`

**Files to create:**
- `agent-server/src/composio/client.ts`

**Reference from open-claude-cowork:**
```typescript
// server/server.js lines 15-30
const composioSession = await client.sessions.create({
  userId: 'orion-user-' + userId,
});
const mcpUrl = composioSession.mcp.url;
```

### Task 2: MCP Configuration Integration
Wire Composio MCP into Orion's agent system.

- [ ] Create dynamic MCP config generator
- [ ] Integrate with agent orchestrator
- [ ] Add to Claude Agent SDK query options

**Files to create:**
- `agent-server/src/composio/mcp-config.ts`

**Files to modify:**
- `agent-server/src/agents/orchestrator.ts`

**Pattern from open-claude-cowork:**
```typescript
// providers/claude-provider.js lines 40-55
mcpServers: {
  composio: {
    url: mcpUrl,
    transport: 'sse',
  }
}
```

### Task 3: Tool Permission Mapping
Map Composio tools to Orion's canUseTool system (Story 2.4).

- [ ] Define tool categories (READ, WRITE, DESTRUCTIVE)
- [ ] Create mapping for key Composio tools
- [ ] Integrate with permission hooks

**Files to create:**
- `agent-server/src/composio/tools.ts`

**Tool categorization:**
| Tool | Category | Requires Confirmation |
|------|----------|----------------------|
| GMAIL_FETCH_EMAILS | READ | No |
| GMAIL_SEND_EMAIL | WRITE | Yes |
| GMAIL_DELETE_EMAIL | DESTRUCTIVE | Yes + explicit |
| GOOGLECALENDAR_GET_EVENTS | READ | No |
| GOOGLECALENDAR_CREATE_EVENT | WRITE | Yes |
| SLACK_SEND_MESSAGE | WRITE | Yes |

### Task 4: Connection Check Hook
Implement PreToolUse hook to verify OAuth connections.

- [ ] Create hook to check if tool's service is connected
- [ ] Return OAuth prompt if disconnected
- [ ] Cache connection status per session

**Files to create:**
- `.claude/hooks/src/composio-connection-check.ts`

**Hook behavior:**
```
PreToolUse(composio_execute) →
  if (!connected) return { decision: 'deny', action: 'prompt_oauth' }
  else return { decision: 'allow' }
```

### Task 5: Agent Template Updates
Update agent templates to use Composio tools.

- [ ] Add Composio tool definitions to Triage agent
- [ ] Add Composio tool definitions to Scheduler agent
- [ ] Add Composio tool definitions to Communicator agent
- [ ] Update Butler to delegate with tool context

**Files to modify:**
- `.claude/agents/triage.md`
- `.claude/agents/scheduler.md`
- `.claude/agents/communicator.md`
- `.claude/agents/butler.md`

### Task 6: OAuth Flow UI
Create UI for managing connected accounts (Epic 3 dependency).

- [ ] Add "Connected Accounts" section to Settings
- [ ] Display connection status per service
- [ ] Implement OAuth redirect flow
- [ ] Show connection prompt in chat when needed

**Files to create:**
- `src/components/settings/connected-accounts.tsx`
- `src/app/api/oauth/callback/route.ts`

### Task 7: Rate Limiting & Error Handling
Implement resilient tool calling.

- [ ] Add rate limiting per tool/service
- [ ] Implement retry with backoff
- [ ] Add graceful degradation messages
- [ ] Log tool call metrics

**Files to create:**
- `agent-server/src/composio/rate-limiter.ts`
- `agent-server/src/composio/error-handler.ts`

## Success Criteria

### Automated Verification:
- [ ] Unit tests: `pnpm test:unit -- --grep "composio"`
- [ ] Integration tests: `pnpm test:integration -- --grep "composio"`
- [ ] Hook tests: Verify connection check fires

### Manual Verification:
- [ ] Connect Gmail account via OAuth
- [ ] Butler can fetch emails via Triage agent
- [ ] Communicator can draft and send email (with confirmation)
- [ ] Scheduler can create calendar events (with confirmation)
- [ ] Rate limiting prevents 429 errors

## Out of Scope

- Custom MCP server development (using Composio instead)
- Direct API integrations (delegating to Composio)
- Self-hosted Composio (using cloud service)
- Full tool catalog UI (just connection management)

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 (Desktop Shell) | Required | Need app running |
| Story 2.4 (Permissions) | Required | canUseTool integration |
| Story 2.5 (Agent Server) | Required | MCP host process |
| Composio API Key | Required | `COMPOSIO_API_KEY` |

## Risks (Pre-Mortem)

### Tigers:
- **Composio service downtime** (MEDIUM)
  - Mitigation: Cache frequently-used data, graceful degradation messages

- **OAuth token expiration** (MEDIUM)
  - Mitigation: Implement token refresh, prompt reconnection

- **Rate limiting from external APIs** (HIGH)
  - Mitigation: Implement rate limiter in Task 7, batch operations

### Elephants:
- **Cost of Composio at scale** (MEDIUM)
  - Note: Review pricing before launch, consider self-hosting later

## Implementation Order

1. Task 1 + 2 (SDK + MCP config) - Foundation
2. Task 4 (Connection hook) - Safety net
3. Task 3 (Permission mapping) - Security
4. Task 5 (Agent templates) - Feature enablement
5. Task 7 (Error handling) - Resilience
6. Task 6 (OAuth UI) - User experience

## References

- [Composio Documentation](https://docs.composio.dev/)
- [open-claude-cowork source](https://github.com/ComposioHQ/open-claude-cowork)
- [Claude Agent SDK MCP docs](https://docs.anthropic.com/claude-code)

---

*Plan created by plan-agent - 2026-01-16*
