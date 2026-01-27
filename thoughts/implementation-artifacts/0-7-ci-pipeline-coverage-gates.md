# Story 0.7: CI Pipeline with Coverage Gates

Status: done

## Story

As a **developer**,
I want GitHub Actions CI pipeline with coverage thresholds,
So that PRs are blocked if coverage drops below 80% (unit) or 70% (integration).

## Acceptance Criteria

1. **Given** PR is opened
   **When** CI runs
   **Then** unit tests, integration tests, and E2E tests all execute

2. **Given** unit test coverage is below 80%
   **When** CI completes
   **Then** the check fails with coverage threshold message

3. **Given** integration test coverage is below 70%
   **When** CI completes
   **Then** the check fails with coverage threshold message

4. **Given** all tests pass with adequate coverage
   **When** CI completes
   **Then** PR is marked as ready to merge

## Tasks / Subtasks

- [x] Create GitHub Actions workflow (AC: #1)
  - [x] Create `.github/workflows/test.yml`
  - [x] Configure checkout and Node.js setup
  - [x] Install dependencies with caching
- [x] Configure unit tests job (AC: #1, #2)
  - [x] Run `npx vitest run --coverage`
  - [x] Parse coverage-summary.json
  - [x] Fail if coverage < 80%
- [x] Configure integration tests job (AC: #1, #3)
  - [x] Run `npx vitest run --project integration --coverage`
  - [x] Parse integration coverage-summary.json
  - [x] Fail if coverage < 70%
- [x] Configure E2E tests job (AC: #1)
  - [x] Run on `macos-latest` (Tauri requirement)
  - [x] Run `npx playwright test`
  - [x] Upload test artifacts on failure
- [x] Create security audit script (AC: #1)
  - [x] Create `tests/scripts/security-audit.sh`
  - [x] Implement API key pattern detection
  - [x] Implement Keychain usage verification
  - [x] Exit 1 on violations
- [x] Add security audit job (AC: #1)
  - [x] Run `tests/scripts/security-audit.sh`
  - [x] Check for plaintext API keys
  - [x] Verify Keychain usage patterns
- [x] Configure job dependencies (AC: #4)
  - [x] E2E depends on unit + integration
  - [x] All jobs must pass for merge

## Dev Notes

### Technical Requirements
- Create `.github/workflows/test.yml`
- Jobs: `unit-tests`, `integration-tests`, `e2e-tests`, `security-audit`
- Coverage thresholds: 80% lines (unit), 70% lines (integration)
- Use `vitest --coverage` with `coverage-summary.json` parsing
- E2E tests run on `macos-latest` (Tauri requirement)
- Include security audit script from test-design-system.md

### CI Pipeline Structure
```yaml
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Run unit tests
        run: npx vitest run --coverage
      - name: Check coverage threshold
        run: |
          COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json)
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "❌ Unit coverage $COVERAGE% below 80%"
            exit 1
          fi
          echo "✅ Unit coverage: $COVERAGE%"

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Run integration tests
        run: npx vitest run --project integration --coverage
      - name: Check coverage threshold
        run: |
          COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json)
          if (( $(echo "$COVERAGE < 70" | bc -l) )); then
            echo "❌ Integration coverage $COVERAGE% below 70%"
            exit 1
          fi
          echo "✅ Integration coverage: $COVERAGE%"

  e2e-tests:
    runs-on: macos-latest  # Tauri requires macOS
    needs: [unit-tests, integration-tests]
    steps:
      - name: Run E2E tests
        run: npx playwright test
      - name: Upload artifacts on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-results
          path: test-results/

  security-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Run security audit
        run: ./tests/scripts/security-audit.sh
```

### Security Audit Script Specification

Create `tests/scripts/security-audit.sh`:

```bash
#!/bin/bash
set -e

echo "🔍 Running security audit..."

# Check for plaintext API keys in source
PATTERNS="sk-ant-|ANTHROPIC_API_KEY=sk|composio_api_key=|COMPOSIO_API_KEY="
if grep -rE "$PATTERNS" src/ .env.* --include="*.ts" --include="*.tsx" --include="*.json" 2>/dev/null; then
  echo "❌ FAIL: Found plaintext API keys in source"
  exit 1
fi
echo "✅ No plaintext API keys in source"

# Check for keys in git history (last 10 commits)
if git log -p -10 --all | grep -E "$PATTERNS" 2>/dev/null; then
  echo "⚠️ WARNING: API keys found in git history - consider rotating"
fi

# Verify Keychain usage in Tauri code (if exists)
if [ -d "src-tauri" ]; then
  if ! grep -r "keychain\|Keychain\|security-framework" src-tauri/src/ 2>/dev/null; then
    echo "⚠️ WARNING: No Keychain usage detected in Tauri code"
  else
    echo "✅ Keychain usage detected in Tauri code"
  fi
fi

# Check for .env files that shouldn't be committed
if git ls-files | grep -E "^\.env$|\.env\.local$|\.env\.production$" 2>/dev/null; then
  echo "❌ FAIL: .env files committed to repository"
  exit 1
fi
echo "✅ No .env files in repository"

echo ""
echo "🎉 Security audit passed!"
exit 0
```

### NFRs Validated
- NFR-6.5: Unit test coverage 80%+
- NFR-6.6: Integration test coverage 70%+
- NFR-4.1: API keys in Keychain only

### Project Structure Notes
- Workflow in `.github/workflows/test.yml`
- Security script in `tests/scripts/security-audit.sh`

### References
- [Source: thoughts/planning-artifacts/test-design-system.md#6.3]
- [Source: thoughts/planning-artifacts/test-design-system.md#4.3]
- [GitHub Actions Docs: https://docs.github.com/en/actions]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Fixed Pre-existing TypeScript Errors** (Story 0-2 defect)
   - Fixed type error in `tests/fixtures/helpers/tauri-ipc.ts:236` - handler type was too specific
   - Fixed type error in `tests/unit/state-management/streaming.xstate-test.ts` - replaced `Interpreter<>` with `AnyInterpreter`
   - Both errors were blocking TypeScript compilation and CI

2. **Fixed Pre-existing Test Issues**
   - Fixed `tests/unit/scaffold/config-validation.spec.ts` - `@tauri-apps/api` is in dependencies, not devDependencies
   - Fixed `tests/unit/performance/mock-server.spec.ts` - probabilistic error injection test was flaky

3. **Created CI Pipeline with Coverage Gates**
   - Updated `.github/workflows/test.yml` with 5 jobs: unit-tests, integration-tests, e2e-tests, security-audit, summary
   - Unit tests: 80% coverage threshold check via `coverage-summary.json`
   - Integration tests: 70% coverage threshold check via `coverage-summary.json`
   - E2E tests: Run on `macos-latest` as required for Tauri
   - Security audit: Validates NFR-4.1 (API keys in Keychain only)
   - Summary job: Reports overall pipeline status

4. **Created Security Audit Script**
   - Location: `tests/scripts/security-audit.sh`
   - Checks for plaintext API keys in source (sk-ant-, ANTHROPIC_API_KEY, COMPOSIO_API_KEY)
   - Verifies .env files are not committed
   - Checks git history for leaked keys (warning only)
   - Verifies Keychain usage in Tauri code (info, not blocking)
   - Excludes test files from key pattern detection

5. **Updated Vitest Configuration**
   - Added `json-summary` reporter for coverage threshold checking
   - Configured proper include/exclude patterns for coverage

6. **Created CI Tests**
   - Location: `tests/unit/ci/security-audit.spec.ts`
   - 37 tests covering security script and workflow configuration
   - Tests validate script structure, workflow jobs, and configuration

### File List

**Created:**
- `tests/scripts/security-audit.sh` - Security audit script (executable)
- `tests/unit/ci/security-audit.spec.ts` - CI pipeline tests (37 tests)

**Modified:**
- `.github/workflows/test.yml` - Complete rewrite with coverage gates
- `vitest.config.ts` - Added json-summary reporter and proper excludes
- `tests/fixtures/helpers/tauri-ipc.ts` - Fixed TypeScript error at line 236
- `tests/unit/state-management/streaming.xstate-test.ts` - Fixed Interpreter type
- `tests/unit/scaffold/config-validation.spec.ts` - Fixed @tauri-apps/api check
- `tests/unit/performance/mock-server.spec.ts` - Fixed flaky probabilistic test

### Test Results

- All 266 unit tests passing
- All 32 XState tests passing
- TypeScript compilation: No errors
- ESLint: No errors
- Security audit: Passing
