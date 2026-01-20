# Plan: Epic 1 Code Review & Error Fix

## Goal

Review all code from Epic 1 (Foundation & First Chat), identify and fix all lint errors, TypeScript errors, and test failures to ensure a clean codebase before proceeding with Epic 2a.

## Current State Analysis

### Summary of Issues Found

| Category | Count | Severity |
|----------|-------|----------|
| ESLint Errors | 9 | High - block commits |
| ESLint Warnings | 12 | Medium - code smell |
| TypeScript Errors | 10 | High - type safety |
| Test Failures | 7 | High - broken tests |
| Missing Dependencies | 1 | Critical - E2E tests cannot run |

#### 5. Missing Playwright Dependency

**Issue:** E2E tests use `@playwright/test` but it's not in project dependencies.

- 6 E2E test files exist in `tests/e2e/`
- Tests import from `@playwright/test`
- Module resolution fails: `Cannot find module '@playwright/test'`
- Playwright CLI (v1.55.0) is installed globally but not project-local

**Note:** Original plan called for Vercel Browser Agent, but implementation used Playwright. Either:
1. Keep Playwright and install it properly (simpler)
2. Migrate to Vercel Browser Agent (aligns with original plan)

### Detailed Error Breakdown

#### 1. ESLint Errors (9 errors)

**A. `set-state-in-effect` errors (6 occurrences):**
- `src/components/CommandPalette.tsx:93` - `setSelectedIndex(0)` in useEffect
- `src/components/CommandPalette.tsx:113` - `setQuery('')` in useEffect
- `src/components/chat/ChatContainer.tsx:30` - `setIsLoading(false)` in useEffect
- `src/components/chat/ChatError.tsx:47` - `setCountdown()` in useEffect
- `src/hooks/useAgentServerStatus.ts:146` - `setStatus('unknown')` in useEffect
- `src/hooks/useMediaQuery.ts:26` - `setMatches()` in useEffect

**B. `static-components` error (1):**
- `src/components/QuickActionChip.tsx:74` - Icon component created during render

**C. `refs` errors (2):**
- `src/hooks/useInboxShortcuts.ts:98` - Ref updated during render
- `src/hooks/useKeyboardShortcuts.ts:142` - Ref updated during render

#### 2. ESLint Warnings (12 warnings)

**Unused variables:**
- `src/components/CommandPalette.tsx:24` - `ChevronRight` import unused
- `src/hooks/useChat.ts:15` - `ChatState` unused
- `src/hooks/useChat.ts:17` - `updateConversation` unused
- `src/hooks/useInboxShortcuts.ts:88-93` - Multiple unused destructured vars
- `src/lib/services/chatService.ts:13` - `Message` import unused
- `src/stores/chatStore.ts:23` - `StreamState` unused
- `src/stores/chatStore.ts:299` - `error` unused

#### 3. TypeScript Errors (10 errors)

**Test file issues:**
- `agent-server/tests/chat.test.ts` - 7 mock typing issues (lines 223, 241, 260, 278, 296, 314, 332)
- `agent-server/tests/config.test.ts:39,45` - Read-only property violations
- `agent-server/tests/stream.test.ts:48` - Invalid SSEEventType assignment

#### 4. Test Failures (7 failing)

**All in `tests/integration/streaming/sse-endpoint.test.ts`:**
- SSE endpoint returning JSON instead of `text/event-stream`
- Claude client not initialized errors
- Missing `connected` event
- Missing text/complete events
- Invalid JSON in complete event
- Missing `clientInitialized` field in health check

### Key Files to Modify

| File | Changes Needed |
|------|----------------|
| `src/components/CommandPalette.tsx` | Remove useState in useEffect, fix icon import |
| `src/components/QuickActionChip.tsx` | Memoize icon component lookup |
| `src/components/chat/ChatContainer.tsx` | Remove setState in useEffect |
| `src/components/chat/ChatError.tsx` | Remove setState in useEffect |
| `src/hooks/useAgentServerStatus.ts` | Remove setState in useEffect |
| `src/hooks/useMediaQuery.ts` | Remove setState in useEffect |
| `src/hooks/useInboxShortcuts.ts` | Move ref update into useEffect |
| `src/hooks/useKeyboardShortcuts.ts` | Move ref update into useEffect |
| `src/hooks/useChat.ts` | Remove unused imports |
| `src/lib/services/chatService.ts` | Remove unused imports |
| `src/stores/chatStore.ts` | Remove unused imports |
| `agent-server/tests/chat.test.ts` | Fix mock typing |
| `agent-server/tests/config.test.ts` | Fix read-only property access |
| `agent-server/tests/stream.test.ts` | Fix SSEEventType assignment |
| `tests/integration/streaming/sse-endpoint.test.ts` | Fix test assumptions or endpoint |

---

## Tasks

### Task 1: Fix ESLint `set-state-in-effect` Errors

Replace synchronous setState in useEffect with proper patterns.

**Pattern to use:**
```typescript
// BEFORE (bad):
useEffect(() => {
  setSelectedIndex(0);
}, [deps]);

// AFTER (good) - Option A: Initialize with useMemo derived state
const selectedIndex = useMemo(() => {
  // Calculate based on deps
  return 0;
}, [filteredCommands.length, query]);

// AFTER (good) - Option B: Use useCallback + event handler
// For cases triggered by user action

// AFTER (good) - Option C: useState initializer
const [matches, setMatches] = useState(() => {
  if (typeof window !== 'undefined') {
    return window.matchMedia(query).matches;
  }
  return false;
});
```

- [ ] Fix `CommandPalette.tsx:93` - Use useMemo for selectedIndex based on filtered results
- [ ] Fix `CommandPalette.tsx:113` - Reset state via cleanup function or event handler
- [ ] Fix `ChatContainer.tsx:30` - Remove useEffect, initialize loading state directly
- [ ] Fix `ChatError.tsx:47` - Initialize countdown with prop value directly
- [ ] Fix `useAgentServerStatus.ts:146` - Initialize status based on isTauriAvailable
- [ ] Fix `useMediaQuery.ts:26` - Use useState initializer

**Files to modify:**
- `src/components/CommandPalette.tsx`
- `src/components/chat/ChatContainer.tsx`
- `src/components/chat/ChatError.tsx`
- `src/hooks/useAgentServerStatus.ts`
- `src/hooks/useMediaQuery.ts`

### Task 2: Fix ESLint `static-components` Error

Move Icon component resolution outside render.

**Pattern:**
```typescript
// BEFORE (bad):
function QuickActionChip({ action }) {
  const Icon = getIconComponent(action.icon); // Called every render
  return <Icon />;
}

// AFTER (good):
const ICON_MAP = {
  inbox: InboxIcon,
  calendar: CalendarIcon,
  // ... static mapping
};

function QuickActionChip({ action }) {
  const IconComponent = ICON_MAP[action.icon];
  return IconComponent ? <IconComponent /> : null;
}
```

- [ ] Refactor `QuickActionChip.tsx` to use static icon mapping

**Files to modify:**
- `src/components/QuickActionChip.tsx`

### Task 3: Fix ESLint `refs` Errors

Move ref.current assignments into useEffect.

**Pattern:**
```typescript
// BEFORE (bad):
const shortcutsRef = useRef(shortcuts);
shortcutsRef.current = shortcuts; // During render

// AFTER (good):
const shortcutsRef = useRef(shortcuts);
useEffect(() => {
  shortcutsRef.current = shortcuts;
}, [shortcuts]);
```

- [ ] Fix `useInboxShortcuts.ts:98`
- [ ] Fix `useKeyboardShortcuts.ts:142`

**Files to modify:**
- `src/hooks/useInboxShortcuts.ts`
- `src/hooks/useKeyboardShortcuts.ts`

### Task 4: Fix ESLint Warnings (Unused Variables)

Remove all unused imports and variables.

- [ ] Remove `ChevronRight` from `CommandPalette.tsx`
- [ ] Remove `ChatState`, `updateConversation` from `useChat.ts`
- [ ] Remove unused vars from `useInboxShortcuts.ts` (or prefix with `_`)
- [ ] Remove `Message` from `chatService.ts`
- [ ] Remove `StreamState` from `chatStore.ts`
- [ ] Handle/remove unused `error` in `chatStore.ts:299`

**Files to modify:**
- `src/components/CommandPalette.tsx`
- `src/hooks/useChat.ts`
- `src/hooks/useInboxShortcuts.ts`
- `src/lib/services/chatService.ts`
- `src/stores/chatStore.ts`

### Task 5: Fix TypeScript Errors in Agent Server Tests

Fix mock typing issues in test files.

**Pattern for mock typing:**
```typescript
// BEFORE (bad):
(client as { sendMessage: Mock<Procedure> }).sendMessage

// AFTER (good):
vi.mocked(client.sendMessage)
// Or use proper mock setup
```

- [ ] Fix 7 mock cast errors in `chat.test.ts`
- [ ] Fix read-only property violations in `config.test.ts`
- [ ] Fix SSEEventType assignment in `stream.test.ts`

**Files to modify:**
- `agent-server/tests/chat.test.ts`
- `agent-server/tests/config.test.ts`
- `agent-server/tests/stream.test.ts`

### Task 6: Fix SSE Streaming Integration Tests

Investigate and fix failing integration tests.

**Options:**
1. Tests assume wrong endpoint behavior - fix test expectations
2. Endpoint implementation is wrong - fix agent-server endpoint
3. Tests need proper setup (mock Claude client) - add setup

- [ ] Analyze `/api/stream/:streamId` endpoint implementation
- [ ] Check if Claude client initialization is required for tests
- [ ] Either fix endpoint or fix test expectations
- [ ] Ensure all 7 tests pass

**Files to investigate:**
- `tests/integration/streaming/sse-endpoint.test.ts`
- `agent-server/src/routes/stream.ts` (or similar)

### Task 7: Install Playwright & Configure E2E Tests

The E2E tests exist but Playwright is not installed as a project dependency.

**Decision needed:** Keep Playwright or migrate to Vercel Browser Agent?

**Option A: Keep Playwright (Recommended - simpler)**
- [ ] Install Playwright: `pnpm add -D @playwright/test`
- [ ] Install browsers: `pnpm exec playwright install`
- [ ] Create `playwright.config.ts` if missing
- [ ] Add test script to package.json: `"test:e2e": "playwright test"`
- [ ] Run E2E tests to verify they pass

**Option B: Migrate to Vercel Browser Agent**
- [ ] Remove Playwright test files
- [ ] Install Vercel Browser Agent
- [ ] Rewrite E2E tests using Vercel Browser Agent API
- [ ] Configure and run tests

**Files to modify:**
- `package.json` (add dependencies, scripts)
- `playwright.config.ts` (create if missing)

### Task 8: Verification

Run all checks to confirm fixes.

- [ ] Run `pnpm run lint` - expect 0 errors, 0 warnings
- [ ] Run `pnpm tsc --noEmit` - expect 0 errors
- [ ] Run `pnpm run test` - expect all tests pass
- [ ] Run `pnpm run test:e2e` - expect all E2E tests pass
- [ ] Run `pnpm run build` - expect clean build

---

## Success Criteria

### Automated Verification:
- [ ] `pnpm run lint` passes with 0 errors and 0 warnings
- [ ] `pnpm tsc --noEmit` passes with 0 errors
- [ ] `pnpm run test` shows all 719 tests passing (0 failures)
- [ ] `pnpm run test:e2e` shows all E2E tests passing
- [ ] `pnpm run build` completes successfully

### Manual Verification:
- [ ] Application starts correctly (`pnpm run tauri dev`)
- [ ] Chat functionality works (send message, receive streaming response)
- [ ] Keyboard shortcuts work (Cmd+K opens command palette)

---

## Out of Scope

- Adding new features or functionality
- Refactoring beyond what's needed to fix errors
- Test coverage improvements (beyond fixing failures)
- Performance optimizations
- Anything related to Epic 2 or later

---

## Risk Assessment

### Potential Issues:
1. **SSE tests may require mocked Claude client** - May need test setup changes
2. **React pattern changes may alter behavior** - Run E2E tests to verify
3. **Some warnings may indicate deeper issues** - Document any found

### Mitigations:
- Run full test suite after each task
- Test UI manually after React component changes
- Create separate commits per task for easy rollback
