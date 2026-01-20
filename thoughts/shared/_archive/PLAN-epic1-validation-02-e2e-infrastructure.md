# Plan: Epic 1 Validation - E2E Infrastructure Setup

## Goal
Fix E2E test infrastructure so tests can actually run. Currently all E2E tests fail because:
1. `agent-browser` CLI tool is not installed/available
2. Tests use a custom test runner instead of standard Playwright
3. App/server not started before tests run

## Technical Choices
- **Test framework**: Migrate to Playwright (industry standard, already in devDependencies)
- **Browser tool**: Remove agent-browser dependency, use Playwright's built-in browser automation
- **App lifecycle**: Use Playwright's `webServer` config to auto-start Tauri/Next.js

## Current State Analysis

The E2E test infrastructure has issues:
1. Custom `agent-browser` CLI wrapper at `tests/support/browser-agent/client.ts`
2. Custom test runner at `tests/support/browser-agent/e2e-runner.ts`
3. Tests written for this custom framework, not Playwright
4. No webServer configuration to auto-start the app
5. E2E test files exist with Playwright imports but can't run

### Key Files:
- `tests/e2e/*.spec.ts` - Playwright-style tests (correct format)
- `tests/e2e/*.test.ts` - Custom agent-browser tests (broken)
- `tests/support/browser-agent/` - Custom infrastructure (unused/broken)
- `playwright.config.ts` - Missing or misconfigured

## Tasks

### Task 1: Audit Existing E2E Tests
Identify which test files use Playwright vs custom runner.
- [ ] List all `tests/e2e/*.spec.ts` files (Playwright)
- [ ] List all `tests/e2e/*.test.ts` files (custom runner)
- [ ] Document test count per format

**Files to examine:**
- `tests/e2e/*.spec.ts`
- `tests/e2e/*.test.ts`

### Task 2: Create/Fix Playwright Configuration
Set up proper Playwright config with webServer support.
- [ ] Create `playwright.config.ts` if missing
- [ ] Configure webServer to start Next.js dev server
- [ ] Configure webServer to start agent-server
- [ ] Set baseURL to http://localhost:3000
- [ ] Configure test directory to `tests/e2e`
- [ ] Add reporter configuration

**Files to create/modify:**
- `playwright.config.ts`

### Task 3: Update Package Scripts
Ensure npm scripts correctly run Playwright tests.
- [ ] Add/update `test:e2e` script to use `playwright test`
- [ ] Add `test:e2e:ui` for interactive debugging
- [ ] Add `test:e2e:debug` for headed mode
- [ ] Remove/deprecate custom runner references

**Files to modify:**
- `package.json`

### Task 4: Migrate Custom Tests to Playwright
Convert agent-browser tests to Playwright syntax.
- [ ] Migrate `tests/e2e/example.test.ts` to Playwright
- [ ] Remove or archive agent-browser test files
- [ ] Update imports to use @playwright/test
- [ ] Replace custom assertions with Playwright expect

**Files to modify:**
- `tests/e2e/example.test.ts` → convert or delete

### Task 5: Clean Up Unused Infrastructure
Remove broken agent-browser infrastructure.
- [ ] Archive `tests/support/browser-agent/` to `tests/support/archive/`
- [ ] Update any imports referencing these files
- [ ] Remove agent-browser from dependencies if present

**Files to archive:**
- `tests/support/browser-agent/client.ts`
- `tests/support/browser-agent/e2e-runner.ts`
- `tests/support/browser-agent/index.ts`

### Task 6: Verify E2E Tests Run
Run E2E test suite and confirm infrastructure works.
- [ ] Run `pnpm test:e2e` - should start servers and run tests
- [ ] Verify at least one test passes (smoke test)
- [ ] Document any test failures (actual test issues vs infrastructure)

## Success Criteria

### Automated Verification:
- [ ] `pnpm test:e2e` starts Next.js and agent-server automatically
- [ ] Playwright tests execute (even if some fail due to missing API key)
- [ ] `pnpm test:e2e -- --grep "@smoke"` runs smoke tests

### Manual Verification:
- [ ] `npx playwright test --ui` opens interactive test runner
- [ ] Can run single test file: `npx playwright test tests/e2e/story-1.8-streaming.spec.ts`

## Out of Scope
- Fixing actual test failures (separate investigation per story)
- Adding new E2E tests
- ATDD test ID alignment (separate plan)

## Risks

### Tigers:
- **Tauri app not starting correctly** (HIGH)
  - Mitigation: Test with Next.js only first, add Tauri integration later
- **Port conflicts with existing processes** (MEDIUM)
  - Mitigation: Use dynamic ports, add port availability check

### Elephants:
- **E2E tests may require Anthropic API key** (MEDIUM)
  - Note: Many tests skip without API key - need mock strategy for CI

## Estimated Effort
~3-4 hours

## Dependencies
- Plan 1 (SSE fix) should complete first to ensure agent-server works
