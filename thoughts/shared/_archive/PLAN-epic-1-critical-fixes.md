# Plan: Epic 1 Critical Fixes

## Goal
Fix the critical issues preventing Epic 1 from being truly "done" - broken tests, non-functional UI elements, and missing API key setup documentation.

## Technical Choices
- **Test Layer Fix**: Update tests to mock `databaseService` (service layer) instead of repositories (data layer)
- **New Chat Wiring**: Import `useChatStore` and call `createNewConversation()` from existing store
- **API Key Setup**: Create developer documentation for environment setup (not user-facing onboarding)

## Current State Analysis

### Issue 1: 14 Frontend Test Failures
**Root Cause**: `useChat.test.ts` mocks the **repository layer** (`@/lib/db/repositories/conversations`) but the `useChat` hook calls the **service layer** (`databaseService.listConversations()`).

This is a layer mismatch:
```
Test mocks: repositories/conversations.listConversations()
Hook calls: databaseService.listConversations() → HTTP → agent-server → repositories
```

### Issue 2: "New Chat" Button Non-Functional
**Location**: `src/components/layout/AppLayout.tsx:46-49`
```typescript
const handleNewChat = useCallback(() => {
  // TODO: Connect to chat store's create new conversation action
  uiLogger.debug('New chat triggered');
}, []);
```

The `useChatStore` has `createNewConversation()` but it's not imported or called.

### Issue 3: No API Key Setup Documentation
The agent-server checks for `ANTHROPIC_API_KEY` and logs warnings if missing, but there's no developer documentation explaining how to set this up.

### Key Files:
- `tests/unit/hooks/useChat.test.ts` - Test file with wrong mocks
- `src/hooks/useChat.ts` - Hook using databaseService (correct)
- `src/lib/services/databaseService.ts` - Service layer (should be mocked in tests)
- `src/components/layout/AppLayout.tsx` - New Chat handler
- `src/stores/chatStore.ts` - Has createNewConversation action

---

## Tasks

### Task 1: Fix useChat.test.ts Layer Mocking

**Description:** Update the test to mock `databaseService` instead of repository functions.

**Approach:**
1. Remove repository mocks
2. Add `databaseService` mock
3. Update test expectations to verify service calls

- [ ] Remove `vi.mock('@/lib/db/repositories/conversations', ...)`
- [ ] Remove `vi.mock('@/lib/db/repositories/messages', ...)`
- [ ] Add `vi.mock('@/lib/services/databaseService', ...)` with proper returns
- [ ] Update test assertions to use `databaseService` spy
- [ ] Run tests to verify 14 failures become passes

**Files to modify:**
- `tests/unit/hooks/useChat.test.ts`

**Verification:**
```bash
pnpm test tests/unit/hooks/useChat.test.ts
```

---

### Task 2: Wire "New Chat" Button in AppLayout

**Description:** Connect the handleNewChat callback to the chat store's createNewConversation action.

- [ ] Import `useChatStore` from `@/stores/chatStore`
- [ ] Get `createNewConversation` from the store
- [ ] Call it in `handleNewChat` callback
- [ ] Add error handling for failed creation
- [ ] Verify keyboard shortcut Cmd+N works

**Files to modify:**
- `src/components/layout/AppLayout.tsx`

**Verification:**
```bash
# Unit test
pnpm test tests/unit/components/layout/AppLayout.test.tsx

# Manual: Press Cmd+N, verify new conversation created
```

---

### Task 3: Fix Agent-Server Test Failures (11 tests)

**Description:** Fix the stream.test.ts and claude-client.test.ts issues.

- [ ] Review `agent-server/tests/stream.test.ts` - add missing required parameters
- [ ] Review `agent-server/tests/claude-client.test.ts` - fix event capture
- [ ] Run agent-server tests to identify specific failures
- [ ] Fix each failing test

**Files to modify:**
- `agent-server/tests/stream.test.ts`
- `agent-server/tests/claude-client.test.ts`
- Possibly `agent-server/tests/chat.test.ts`

**Verification:**
```bash
cd agent-server && pnpm test
```

---

### Task 4: Create Developer Setup Documentation

**Description:** Document how to configure ANTHROPIC_API_KEY for development.

- [ ] Create `docs/DEVELOPMENT.md` (or update if exists)
- [ ] Document required environment variables
- [ ] Add `.env.example` file with placeholder
- [ ] Document how to get an Anthropic API key
- [ ] Add troubleshooting for common issues

**Files to create/modify:**
- `docs/DEVELOPMENT.md`
- `.env.example` (if not exists)

**Verification:**
- Manual review of documentation

---

### Task 5: Add API Key Missing Error UI

**Description:** When API key is not configured, show a helpful error in the chat UI instead of silent failure.

- [ ] Check if `useChat` hook exposes `apiKeyConfigured` state (it does per line 35)
- [ ] Update `ChatContainer` to show setup instructions when `apiKeyConfigured === false`
- [ ] Style the error message with Orion design system
- [ ] Include link to setup docs

**Files to modify:**
- `src/components/chat/ChatContainer.tsx`
- Possibly `src/components/chat/ChatError.tsx`

**Verification:**
```bash
# Start without ANTHROPIC_API_KEY set
unset ANTHROPIC_API_KEY && pnpm tauri dev
# Verify helpful error message appears
```

---

## Success Criteria

### Automated Verification:
- [ ] All frontend tests pass: `pnpm test` (0 failures)
- [ ] All agent-server tests pass: `cd agent-server && pnpm test` (0 failures)
- [ ] Build passes: `pnpm build`
- [ ] TypeScript clean: `pnpm check`

### Manual Verification:
- [ ] Cmd+N creates new conversation
- [ ] "New Chat" button creates new conversation
- [ ] Missing API key shows helpful error (not silent failure)
- [ ] With API key set, chat works end-to-end
- [ ] DEVELOPMENT.md explains setup clearly

---

## Risks (Pre-Mortem)

### Tigers:
- **Test mock changes may require significant refactoring** (MEDIUM)
  - Mitigation: Start with one test, understand the pattern, then apply broadly

- **Agent-server test failures may reveal actual bugs** (MEDIUM)
  - Mitigation: If tests were testing wrong behavior, we fix the code not the test

### Elephants:
- **11 agent-server failures not fully diagnosed** (MEDIUM)
  - Note: May need more investigation during implementation

---

## Out of Scope
- User-facing API key entry (that's Epic 12)
- Supabase proxy setup (that's Epic 13)
- New features - this is purely fixing existing issues
- E2E tests (focus on unit/integration tests)

---

## Estimated Effort

| Task | Effort |
|------|--------|
| Task 1: Fix useChat tests | Medium |
| Task 2: Wire New Chat | Small |
| Task 3: Fix agent-server tests | Medium |
| Task 4: Dev documentation | Small |
| Task 5: API key error UI | Small |

Total: ~4-6 hours of focused work
