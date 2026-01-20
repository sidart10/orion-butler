# Plan: Epic 1 Validation - Verify DEV Agent Implementation

## Goal

Thoroughly validate that the DEV agent actually implemented Stories 1-8, 1-9, 1-10, and 1-11 correctly, including all files, tests, and acceptance criteria.

## Background

The DEV agent claimed completion of 4 large stories with test counts jumping from 362 → 543 → 609 → 719. Given the scope (streaming, layouts, tool visualization, shortcuts), there's reason to verify the work was done properly.

## Validation Strategy

We'll validate each story in 4 phases:
1. **File Existence Check** - Do the claimed files actually exist?
2. **Build Verification** - Does the project build without errors?
3. **Test Execution** - Do tests actually run and pass?
4. **AC Verification** - Are acceptance criteria truly met?

---

## Phase 1: File Existence Verification

### Story 1-8: Streaming Responses (17 tasks, 8 ACs)

**Critical Files to Verify:**

| File | Purpose | Must Exist |
|------|---------|------------|
| `agent-server/src/services/claude-client.ts` | Claude streaming client | Yes |
| `agent-server/src/routes/stream.ts` | SSE endpoint | Yes |
| `src/types/streaming.ts` | Stream event types | Yes |
| `src/lib/services/streamingService.ts` | Frontend SSE service | Yes |
| `src/lib/performance/streamMetrics.ts` | Performance tracking | Yes |
| `src/hooks/useAutoScroll.ts` | Auto-scroll hook | Yes |
| `src/stores/chatStore.ts` | Streaming state | Yes (verify streaming actions) |
| `src/components/chat/TypingIndicator.tsx` | Typing dots | Yes |
| `src/components/chat/StreamingText.tsx` | Text with cursor | Yes |
| `src-tauri/src/stream_forwarder.rs` | Tauri IPC | Yes |

**Test Files to Verify:**

| File | Expected Tests |
|------|----------------|
| `tests/unit/components/chat/TypingIndicator.test.tsx` | 6 |
| `tests/unit/components/chat/StreamingText.test.tsx` | 10 |
| `tests/unit/hooks/useAutoScroll.test.ts` | 8 |
| `tests/unit/services/streamingService.test.ts` | 17 |
| `tests/unit/stores/chatStore.streaming.test.ts` | 13 |

### Story 1-9: Split-Screen Layout (16 tasks, 10 ACs)

**Critical Files to Verify:**

| File | Purpose | Must Exist |
|------|---------|------------|
| `src/components/layout/AppLayout.tsx` | Main shell | Yes |
| `src/components/layout/SplitPanel.tsx` | Chat/Canvas splitter | Yes |
| `src/components/layout/Header.tsx` | Top header | Yes |
| `src/components/layout/Sidebar.tsx` | Left navigation | Yes |
| `src/components/layout/AgentRail.tsx` | Right rail | Yes |
| `src/components/layout/ResponsiveLayout.tsx` | Breakpoint handler | Yes |
| `src/components/canvas/CanvasPlaceholder.tsx` | Empty state | Yes |
| `src/components/canvas/CanvasContainer.tsx` | Mode switcher | Yes |
| `src/hooks/useMediaQuery.ts` | Media query hook | Yes |
| `src/hooks/useCanvasState.ts` | Canvas state | Yes |
| `src/hooks/useLayoutShortcuts.ts` | Cmd+\ shortcut | Yes |

**Test Files to Verify:**

| File | Expected Tests |
|------|----------------|
| `tests/unit/components/layout/AppLayout.test.tsx` | ~5 |
| `tests/unit/components/layout/SplitPanel.test.tsx` | ~5 |
| `tests/unit/components/layout/Header.test.tsx` | ~5 |
| `tests/unit/components/layout/Sidebar.test.tsx` | ~5 |
| `tests/unit/components/canvas/CanvasPlaceholder.test.tsx` | ~5 |
| `tests/unit/components/canvas/CanvasContainer.test.tsx` | ~3 |
| `tests/unit/components/layout/AgentRail.test.tsx` | ~6 |
| `tests/unit/hooks/useLayoutShortcuts.test.ts` | ~7 |
| `tests/unit/components/layout/ResponsiveLayout.test.tsx` | ~5 |

### Story 1-10: Tool Call Visualization (9 tasks, 10 ACs)

**Critical Files to Verify:**

| File | Purpose | Must Exist |
|------|---------|------------|
| `src/components/chat/ToolCard.tsx` | Tool card component | Yes |
| `src/components/chat/ToolCardList.tsx` | Card list | Yes |
| `src/stores/chatStore.ts` | Tool tracking (verify ToolStatus) | Yes |

**Test Files to Verify:**

| File | Expected Tests |
|------|----------------|
| `tests/unit/components/chat/ToolCard.test.tsx` | 44 |
| `tests/unit/components/chat/ToolCardList.test.tsx` | 10 |

### Story 1-11: Keyboard Shortcuts (12 tasks, 12 ACs)

**Critical Files to Verify:**

| File | Purpose | Must Exist |
|------|---------|------------|
| `src/hooks/useKeyboardShortcuts.ts` | Global shortcuts | Yes |
| `src/hooks/useInboxShortcuts.ts` | Inbox j/k/a/r/s | Yes |
| `src/stores/uiStore.ts` | UI state | Yes |
| `src/lib/commands.ts` | Command registry | Yes |
| `src/components/CommandPalette.tsx` | Cmd+K palette | Yes |
| `src/components/QuickActionChip.tsx` | Quick actions | Yes |
| `src/components/HelpOverlay.tsx` | Help modal | Yes |
| `src/components/KeyboardHint.tsx` | Shortcut badges | Yes |

**Test Files to Verify:**

| File | Expected Tests |
|------|----------------|
| `tests/unit/hooks/useKeyboardShortcuts.test.ts` | 14 |
| `tests/unit/hooks/useInboxShortcuts.test.ts` | 10 |
| `tests/unit/stores/uiStore.test.ts` | 15 |
| `tests/unit/lib/commands.test.ts` | 18 |
| `tests/unit/components/CommandPalette.test.tsx` | 17 |
| `tests/unit/components/QuickActionChip.test.tsx` | 13 |
| `tests/unit/components/HelpOverlay.test.tsx` | 10 |
| `tests/unit/components/KeyboardHint.test.tsx` | 12 |

---

## Phase 2: Build Verification

### Commands to Run

```bash
# TypeScript compilation check
pnpm exec tsc --noEmit

# Next.js build
pnpm build

# Agent server build
cd agent-server && pnpm build

# Tauri build check (optional - takes longer)
cd src-tauri && cargo check
```

### Expected Outcomes

- [ ] No TypeScript errors
- [ ] Next.js build succeeds
- [ ] Agent server compiles
- [ ] Tauri cargo check passes

---

## Phase 3: Test Execution

### Commands to Run

```bash
# Run all unit tests with verbose output
pnpm test -- --reporter=verbose

# Get test count per file
pnpm test -- --reporter=verbose 2>&1 | grep -E "^\s+(✓|×)"

# Check for skipped tests
pnpm test -- --reporter=verbose 2>&1 | grep -i "skip"
```

### Expected Outcomes

- [ ] 719+ tests pass
- [ ] No skipped tests
- [ ] No pending tests
- [ ] Test files actually test behavior (not just stubs)

---

## Phase 4: AC Verification (Sample Check)

### Story 1-8 AC Spot Checks

**AC1: SSE Connection Established**
- [ ] Verify `agent-server/src/routes/stream.ts` has SSE headers
- [ ] Verify Content-Type is `text/event-stream`

**AC2: Typing Indicator**
- [ ] TypingIndicator.tsx exists and shows before first token
- [ ] Uses orion-primary color for dots

**AC4: Smooth Token Rendering**
- [ ] StreamingText.tsx exists with cursor indicator
- [ ] Uses `whitespace-pre-wrap`

### Story 1-9 AC Spot Checks

**AC1: Default Panel Layout**
- [ ] SplitPanel.tsx implements 35/65 split
- [ ] Verify width percentages in code

**AC8: Design System Tokens**
- [ ] Header uses 80px height
- [ ] Sidebar uses 280px width
- [ ] AgentRail uses 64px width

### Story 1-10 AC Spot Checks

**AC7: XSS Protection**
- [ ] ToolCard.tsx has escapeHtml function
- [ ] Tests verify malicious content is escaped

### Story 1-11 AC Spot Checks

**AC2: Cmd+K Opens Command Palette**
- [ ] useKeyboardShortcuts.ts handles meta+k
- [ ] CommandPalette.tsx renders modal

---

## Tasks

### Task 1: File Existence Audit

**Description:** Run glob/ls checks to verify all claimed files exist.

**Commands:**
```bash
# Story 1-8 files
ls -la src/lib/services/streamingService.ts
ls -la src/components/chat/TypingIndicator.tsx
ls -la src/components/chat/StreamingText.tsx
ls -la src/hooks/useAutoScroll.ts
ls -la agent-server/src/routes/stream.ts
ls -la src-tauri/src/stream_forwarder.rs

# Story 1-9 files
ls -la src/components/layout/AppLayout.tsx
ls -la src/components/layout/SplitPanel.tsx
ls -la src/components/layout/Header.tsx
ls -la src/components/layout/Sidebar.tsx
ls -la src/components/layout/AgentRail.tsx
ls -la src/components/canvas/CanvasPlaceholder.tsx
ls -la src/hooks/useCanvasState.ts
ls -la src/hooks/useLayoutShortcuts.ts

# Story 1-10 files
ls -la src/components/chat/ToolCard.tsx
ls -la src/components/chat/ToolCardList.tsx

# Story 1-11 files
ls -la src/hooks/useKeyboardShortcuts.ts
ls -la src/hooks/useInboxShortcuts.ts
ls -la src/stores/uiStore.ts
ls -la src/lib/commands.ts
ls -la src/components/CommandPalette.tsx
ls -la src/components/QuickActionChip.tsx
ls -la src/components/HelpOverlay.tsx
ls -la src/components/KeyboardHint.tsx
```

**Files to modify:** None (read-only verification)

### Task 2: Run Full Test Suite

**Description:** Execute all tests and capture output.

**Commands:**
```bash
# Run tests with summary
pnpm test

# If tests pass, get detailed count
pnpm test -- --reporter=verbose | tail -50
```

**Success Criteria:**
- 700+ tests pass
- 0 failures
- 0 skipped

### Task 3: TypeScript Build Check

**Description:** Verify no TypeScript errors.

**Commands:**
```bash
pnpm exec tsc --noEmit 2>&1 | head -50
```

**Success Criteria:**
- Exit code 0
- No errors

### Task 4: AC Code Verification (Spot Check)

**Description:** Read key files to verify ACs are implemented.

**Files to read:**
- `src/components/chat/ToolCard.tsx` - Check escapeHtml exists
- `src/components/layout/SplitPanel.tsx` - Check 35/65 split
- `src/hooks/useKeyboardShortcuts.ts` - Check Cmd+K handling
- `agent-server/src/routes/stream.ts` - Check SSE headers

### Task 5: Generate Validation Report

**Description:** Create summary of findings.

**Output:** `thoughts/implementation-artifacts/validation/epic-1-validation-report.md`

---

## Success Criteria

### Automated Verification:
- [ ] `pnpm test` passes with 700+ tests
- [ ] `pnpm exec tsc --noEmit` passes with 0 errors
- [ ] All 50+ claimed files exist

### Manual Verification:
- [ ] Sample ACs spot-checked in code
- [ ] No obvious stubs or placeholder implementations
- [ ] Tests actually verify behavior (not just exist)

---

## Risks

### Tigers:
- **Test stubs that don't verify behavior** (HIGH)
  - Mitigation: Read test files, check for meaningful assertions
- **Files exist but aren't exported/integrated** (MEDIUM)
  - Mitigation: Check index.ts exports, verify imports

### Elephants:
- **E2E tests require Playwright which may not be installed** (MEDIUM)
  - Note: Story files mention Playwright not in devDependencies

---

## Out of Scope

- Running E2E tests (Playwright setup required)
- Manual UI testing
- Performance benchmarking
- Full code review of all 50+ files
