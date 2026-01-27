# ATDD Checklist: 2-1-install-claude-agent-sdk

**Story:** Install Claude Agent SDK
**Epic:** Epic 2 - First Conversation
**Created:** 2026-01-24
**Author:** TEA (Master Test Architect)

---

## Overview

This ATDD checklist covers the foundational SDK installation story. Since this is a dependency installation story (not feature implementation), tests focus on:
- Package installation verification
- TypeScript type availability
- Build system compatibility
- Documentation compliance with NFR-6.2

**Test Strategy:** Primarily unit tests with build verification. No E2E tests needed for dependency installation.

---

## AC1: Package Added to Dependencies

> **Given** the Tauri project from Epic 1
> **When** I run `npm install @anthropic-ai/claude-agent-sdk`
> **Then** the package is added to package.json dependencies

### Happy Path

- [ ] **2.1-UNIT-001**: Verify SDK package in dependencies
  - **Given:** Fresh install of `@anthropic-ai/claude-agent-sdk`
  - **When:** Read package.json dependencies object
  - **Then:** Key `@anthropic-ai/claude-agent-sdk` exists with semver range `^0.2.x` or higher
  - **Test Type:** Unit (JSON parsing)

- [ ] **2.1-UNIT-002**: Verify package-lock.json updated
  - **Given:** npm install completed successfully
  - **When:** Read package-lock.json
  - **Then:** Entry for `@anthropic-ai/claude-agent-sdk` exists with resolved version
  - **Test Type:** Unit (JSON parsing)

- [ ] **2.1-UNIT-003**: Verify node_modules installation
  - **Given:** npm install completed
  - **When:** Check filesystem for `node_modules/@anthropic-ai/claude-agent-sdk`
  - **Then:** Directory exists and contains package.json
  - **Test Type:** Integration (filesystem)

### Edge Cases

- [ ] **2.1-UNIT-004**: npm ls shows SDK without peer warnings
  - **Given:** All dependencies installed
  - **When:** Run `npm ls @anthropic-ai/claude-agent-sdk`
  - **Then:** Output shows installed version without WARN peer dependency lines
  - **Test Type:** Integration (CLI output)

- [ ] **2.1-UNIT-005**: Clean install from empty node_modules
  - **Given:** Delete node_modules directory
  - **When:** Run `npm ci` (clean install)
  - **Then:** SDK installs successfully from package-lock.json
  - **Test Type:** Integration (CLI)

### Error Handling

- [ ] **2.1-UNIT-006**: Package name typo detection
  - **Given:** Developer attempts to import from deprecated package
  - **When:** Code contains `import from "claude-code-sdk"` (deprecated)
  - **Then:** TypeScript/ESLint should error (package not found)
  - **Test Type:** Static analysis (build-time)

---

## AC2: TypeScript Types Available

> **And** TypeScript types are available for SDK classes (ClaudeAgentOptions, query, ClaudeSDKClient, etc.)

### Happy Path

- [ ] **2.1-UNIT-007**: Core function imports compile
  - **Given:** TypeScript project with SDK installed
  - **When:** Import `{ query, ClaudeSDKClient, createTool, createMcpServer }` from SDK
  - **Then:** `npx tsc --noEmit` succeeds without type errors
  - **Test Type:** Unit (type checking)

- [ ] **2.1-UNIT-008**: Core type imports compile
  - **Given:** TypeScript project with SDK installed
  - **When:** Import `type { ClaudeAgentOptions, AssistantMessage, TextBlock, ToolUseBlock, ToolResultBlock, ResultMessage, ThinkingBlock }` from SDK
  - **Then:** `npx tsc --noEmit` succeeds without type errors
  - **Test Type:** Unit (type checking)

- [ ] **2.1-UNIT-009**: Type inference works for query()
  - **Given:** Valid `query()` call setup
  - **When:** Hover over `query()` return type in IDE
  - **Then:** Returns `AsyncIterableIterator<Message>` or similar typed iterator
  - **Test Type:** Manual verification (IDE)

### Edge Cases

- [ ] **2.1-UNIT-010**: TypeScript strict mode compatibility
  - **Given:** tsconfig.json with `"strict": true`
  - **When:** Build project with SDK imports
  - **Then:** No implicit any errors from SDK types
  - **Test Type:** Unit (build)

- [ ] **2.1-UNIT-011**: ESM and CJS module resolution
  - **Given:** Project configured for ESM (`"type": "module"`)
  - **When:** Import SDK using ES module syntax
  - **Then:** Module resolves correctly (no ERR_REQUIRE_ESM)
  - **Test Type:** Integration (build)

### Error Handling

- [ ] **2.1-UNIT-012**: Invalid type usage caught at compile time
  - **Given:** Code using SDK types incorrectly
  - **When:** Assign string to ClaudeAgentOptions.model (expects enum)
  - **Then:** TypeScript reports type error
  - **Test Type:** Unit (negative type check)

---

## AC3: Stable v1 Features Only (NFR-6.2)

> **And** the SDK version uses stable v1 features only (NFR-6.2)

### Happy Path

- [ ] **2.1-UNIT-013**: STABLE_FEATURES.md exists
  - **Given:** Story implementation complete
  - **When:** Check for `src/lib/agent/STABLE_FEATURES.md`
  - **Then:** File exists with content
  - **Test Type:** Unit (filesystem)

- [ ] **2.1-UNIT-014**: STABLE_FEATURES.md documents stable features
  - **Given:** STABLE_FEATURES.md exists
  - **When:** Parse file contents
  - **Then:** Contains sections for: query(), ClaudeSDKClient, built-in tools, hooks, skills, MCP, sessions
  - **Test Type:** Unit (content verification)

- [ ] **2.1-UNIT-015**: STABLE_FEATURES.md lists beta features to avoid
  - **Given:** STABLE_FEATURES.md exists
  - **When:** Parse file contents
  - **Then:** Lists beta features: structured-outputs, context-1m, interleaved-thinking with "DO NOT USE without approval" warning
  - **Test Type:** Unit (content verification)

### Edge Cases

- [ ] **2.1-UNIT-016**: No beta feature imports in codebase
  - **Given:** Story implementation complete
  - **When:** Grep codebase for beta feature imports
  - **Then:** No matches for `structured-outputs`, `context-1m`, `interleaved-thinking` in import statements
  - **Test Type:** Static analysis (grep)

- [ ] **2.1-UNIT-017**: SDK version constraint appropriate
  - **Given:** package.json with SDK dependency
  - **When:** Check version range
  - **Then:** Uses caret range (`^0.2.x`) not pinned, allowing minor updates
  - **Test Type:** Unit (JSON parsing)

### Error Handling

- [ ] **2.1-UNIT-018**: CI gate for beta feature imports
  - **Given:** CI pipeline configuration
  - **When:** Code imports beta feature
  - **Then:** CI should fail with clear error message about NFR-6.2 violation
  - **Test Type:** CI/CD (pipeline)
  - **Note:** This test defines the requirement; implementation is Sprint 0 infrastructure

---

## AC4: Build Without Errors

> **And** the package resolves and builds without errors via `npm run build`

### Happy Path

- [ ] **2.1-INT-001**: npm run build succeeds
  - **Given:** SDK installed, all dependencies resolved
  - **When:** Run `npm run build`
  - **Then:** Exit code 0, no errors in output
  - **Test Type:** Integration (build)

- [ ] **2.1-INT-002**: npm run tauri dev launches
  - **Given:** Full build succeeds
  - **When:** Run `npm run tauri dev`
  - **Then:** Application window opens, no crash within 5 seconds
  - **Test Type:** Integration (app launch)

- [ ] **2.1-INT-003**: Next.js static export includes no SDK errors
  - **Given:** Next.js build in static export mode
  - **When:** Run `npm run build`
  - **Then:** `.next/` output directory created without SDK-related warnings
  - **Test Type:** Integration (build output)

### Edge Cases

- [ ] **2.1-INT-004**: Build with --verbose shows no SDK warnings
  - **Given:** Verbose build mode
  - **When:** Run `npx next build --debug`
  - **Then:** No warnings about `@anthropic-ai/claude-agent-sdk`
  - **Test Type:** Integration (build verbosity)

- [ ] **2.1-INT-005**: TypeScript incremental build works
  - **Given:** Previous successful build exists
  - **When:** Run `npx tsc --incremental` twice
  - **Then:** Second build faster (incremental), no errors
  - **Test Type:** Integration (build performance)

### Error Handling

- [ ] **2.1-INT-006**: Build fails gracefully if SDK missing
  - **Given:** SDK removed from node_modules (simulated)
  - **When:** Run `npm run build`
  - **Then:** Clear error message about missing module, not cryptic crash
  - **Test Type:** Integration (error messaging)

---

## Boundary Conditions

- [ ] **2.1-UNIT-019**: SDK version lower bound
  - **Given:** package.json dependency
  - **When:** Install SDK version 0.1.x (if exists)
  - **Then:** Should still satisfy caret range OR document minimum version requirement
  - **Test Type:** Unit (version resolution)

- [ ] **2.1-UNIT-020**: SDK version upper bound
  - **Given:** Future SDK version 1.0.0 released (hypothetical)
  - **When:** npm update runs
  - **Then:** Caret range `^0.2.x` does NOT auto-update to 1.x (breaking change protection)
  - **Test Type:** Unit (semver understanding)

---

## Manual Verification Checklist

| Step | Expected Result | Verified |
|------|-----------------|----------|
| Run `npm ls @anthropic-ai/claude-agent-sdk` | Shows installed version, no warnings | [ ] |
| Check `node_modules/@anthropic-ai/claude-agent-sdk` exists | Directory present | [ ] |
| Open TypeScript file, import SDK types | No red squiggles in IDE | [ ] |
| Run `npm run build` | Completes without errors | [ ] |
| Run `npm run tauri dev` | App launches successfully | [ ] |
| Check STABLE_FEATURES.md | File exists with stable/beta documentation | [ ] |

---

## Definition of Done Verification

| DoD Item | Test Coverage |
|----------|---------------|
| Package in package.json dependencies | 2.1-UNIT-001, 2.1-UNIT-002 |
| npm install without errors/warnings | 2.1-UNIT-004, 2.1-UNIT-005 |
| TypeScript types available | 2.1-UNIT-007, 2.1-UNIT-008, 2.1-UNIT-010 |
| npm run build succeeds | 2.1-INT-001, 2.1-INT-003 |
| npm run tauri dev launches | 2.1-INT-002 |
| STABLE_FEATURES.md documents NFR-6.2 | 2.1-UNIT-013, 2.1-UNIT-014, 2.1-UNIT-015 |
| No beta features imported | 2.1-UNIT-016 |
| PR passes CI checks | 2.1-UNIT-018 (defines requirement) |

---

## Test Implementation Priority

| Priority | Test IDs | Rationale |
|----------|----------|-----------|
| **P0 (Must)** | 2.1-UNIT-001, 2.1-UNIT-007, 2.1-INT-001 | Core acceptance criteria |
| **P1 (Should)** | 2.1-UNIT-013, 2.1-UNIT-014, 2.1-INT-002 | NFR compliance + app launch |
| **P2 (Could)** | 2.1-UNIT-004, 2.1-UNIT-010, 2.1-UNIT-016 | Edge cases and static analysis |

---

## Notes

1. **Test Framework:** Use Vitest for unit tests per test-design-system.md
2. **No E2E Tests:** This story is infrastructure-only; no user-facing features to E2E test
3. **CI Integration:** Tests 2.1-UNIT-016 and 2.1-UNIT-018 define CI gate requirements for Sprint 0
4. **Manual Verification:** IDE type inference (2.1-UNIT-009) requires manual verification

---

*Generated by TEA (Master Test Architect) on 2026-01-24*
