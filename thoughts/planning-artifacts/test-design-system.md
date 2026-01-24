# System-Level Test Design — Orion Butler

**Generated:** 2026-01-24
**Phase:** 3 (Solutioning Gate)
**Status:** ⚠️ CONCERNS — Proceed with Sprint 0 infrastructure work
**Author:** TEA (Master Test Architect)

---

## Executive Summary

This document provides the system-level testability review for Orion Butler, a Claude Agent SDK harness bringing Claude Code's productivity patterns to knowledge workers via Tauri + Next.js desktop application.

**Key Findings:**
- Architecture is **testable** with documented patterns for state control, logging, and isolation
- **3 critical concerns** require mitigation before Sprint 1 (Composio mocking, IPC streaming, XState determinism)
- **63 NFRs** across 9 categories have mapped test approaches
- **Sprint 0 infrastructure** must establish test foundations before epic implementation

**Gate Recommendation:** ⚠️ **CONCERNS** — Address critical testability gaps in Sprint 0

---

## 1. Testability Assessment

### 1.1 Controllability

| Aspect | Assessment | Evidence |
|--------|------------|----------|
| **State Control** | ✅ PASS | SQLite + Drizzle ORM enables test seeding. Factory patterns support API-based E2E setup. |
| **External Dependencies** | ⚠️ CONCERNS | Composio SDK-Direct requires mocking strategy. No interface abstraction for OAuth flows. |
| **Error Injection** | ✅ PASS | neverthrow Result types enable controlled error paths. Retry/circuit breaker patterns documented. |
| **Session Control** | ✅ PASS | Named sessions with explicit IDs enable test session isolation. |

### 1.2 Observability

| Aspect | Assessment | Evidence |
|--------|------------|----------|
| **Logging** | ✅ PASS | consola (TypeScript) + tauri-plugin-log (Rust) with unified location `~/Library/Logs/Orion/`. |
| **State Inspection** | ✅ PASS | Zustand stores + XState machines have explicit state. Canvas state persisted in SQLite. |
| **Network Tracing** | ⚠️ CONCERNS | Tauri IPC events for streaming need intercept strategy. No HAR capture for Composio calls. |
| **Audit Trail** | ✅ PASS | 100% tool call audit logging to `~/Orion/resources/.audit/action_log.jsonl`. |

### 1.3 Reliability

| Aspect | Assessment | Evidence |
|--------|------------|----------|
| **Test Isolation** | ✅ PASS | Session-scoped permissions. SQLite WAL mode for non-blocking reads. Auto-cleanup fixtures. |
| **Determinism** | ⚠️ CONCERNS | Streaming UI with XState has race condition potential. First-token latency needs deterministic waits. |
| **Reproducibility** | ✅ PASS | Session persistence + JSONL export enables replay. Token budgets provide controlled context. |

---

## 2. Architecturally Significant Requirements (ASRs)

### 2.1 Utility Tree

| Quality | ASR ID | Requirement | (I, D) | Test Approach |
|---------|--------|-------------|--------|---------------|
| **Performance** | NFR-1.1 | First token latency p95 < 500ms | (H, H) | k6 load test + streaming mock |
| **Performance** | NFR-1.2 | Cold start < 3 seconds | (H, M) | Playwright app launch timing |
| **Performance** | NFR-1.4 | Session restore < 1 second | (H, M) | Benchmark with seeded SQLite |
| **Reliability** | NFR-2.1 | MCP server 99% uptime | (H, H) | Health check + circuit breaker test |
| **Reliability** | NFR-2.5 | Graceful degradation on MCP unavailability | (H, M) | Mock server disconnect scenarios |
| **Reliability** | NFR-2.9 | Atomic writes for session persistence | (H, H) | Crash-recovery test with kill -9 |
| **Security** | NFR-4.1 | API keys in macOS Keychain only | (H, M) | Storage audit + grep for keys |
| **Security** | NFR-4.5 | Sensitive file blocking via PreToolUse hook | (H, M) | File access denial test |
| **Security** | NFR-4.6 | 100% tool call audit logging | (H, L) | Audit completeness assertion |
| **Scalability** | NFR-3.1 | ≥100 concurrent sessions | (M, H) | k6 stress test + memory profiling |
| **Scalability** | NFR-3.6 | Context compaction at 80% limit | (M, H) | Token budget exhaustion test |
| **Maintainability** | NFR-6.1 | SDK abstraction layer | (H, M) | Integration test for wrapper |
| **Maintainability** | NFR-6.3 | Skill hot-reload < 100ms | (M, M) | File watcher + timing assertion |

### 2.2 ASR Risk Scoring

| ASR | Category | Prob | Impact | Score | Status |
|-----|----------|------|--------|-------|--------|
| NFR-1.1 (First token) | PERF | 2 | 3 | **6** | ⚠️ Requires k6 baseline |
| NFR-2.1 (MCP uptime) | TECH | 2 | 3 | **6** | ⚠️ Composio dependency |
| NFR-2.9 (Atomic writes) | DATA | 2 | 3 | **6** | ⚠️ WAL mode validation |
| NFR-4.1 (Keychain) | SEC | 1 | 3 | 3 | ✅ macOS native |
| NFR-3.1 (100 sessions) | PERF | 2 | 2 | 4 | ✅ SQLite capable |

**Critical ASRs (Score ≥ 6):** 3 requirements demand mitigation plans and test automation in Sprint 0.

---

## 3. Test Levels Strategy

### 3.1 Test Pyramid Distribution

```
                    ╱╲
                   ╱E2E╲           5% - Critical journeys only
                  ╱──────╲
                 ╱  INT   ╲       25% - IPC, SDK, database
                ╱──────────╲
               ╱   UNIT     ╲     70% - Business logic, state
              ╱──────────────╲
```

### 3.2 Test Level Assignments

| Layer | Test Level | Framework | Target Coverage |
|-------|------------|-----------|-----------------|
| **Business Logic** | Unit | Vitest | 80%+ |
| — Token budget calculation | Unit | Vitest | Pure functions |
| — Permission resolution | Unit | Vitest | State machine logic |
| — Session compaction | Unit | Vitest | Algorithm correctness |
| **State Management** | Unit + Component | Vitest + Testing Library | 75%+ |
| — Zustand stores | Unit | Vitest | State transitions |
| — XState machines | Unit | Vitest + @xstate/test | State coverage |
| — React components | Component | Playwright CT | Prop/event handling |
| **IPC Layer** | Integration | Vitest + Tauri mock | 70%+ |
| — Tauri commands | Integration | Vitest | Command contracts |
| — Event streaming | Integration | Vitest | Event sequence |
| **Database** | Integration | Vitest + SQLite | 70%+ |
| — Drizzle ORM queries | Integration | Vitest | CRUD operations |
| — Session persistence | Integration | Vitest | Atomic writes |
| **External SDKs** | Integration | Vitest + MSW | 60%+ |
| — Claude Agent SDK | Integration | MSW mocks | Response handling |
| — Composio MCP | Integration | MSW mocks | Tool call contracts |
| **Critical Paths** | E2E | Playwright | Key journeys |
| — First conversation | E2E | Playwright | Happy path |
| — Session restore | E2E | Playwright | Persistence |
| — Tool execution | E2E | Playwright | Permission flow |

### 3.3 Framework Stack

| Tool | Purpose | Justification |
|------|---------|---------------|
| **Vitest** | Unit + Integration | Fast, ESM native, Vite compatibility |
| **Playwright** | E2E + Component | Tauri support, reliable waits |
| **MSW** | API mocking | Network-level intercept |
| **k6** | Performance | Load/stress testing |
| **@xstate/test** | State machine | Path coverage generation |

### 3.4 Test ID Convention

```
{EPIC}.{STORY}-{LEVEL}-{SEQ}

Examples:
1.1-UNIT-001   → Epic 1, Story 1, Unit test #1
2.3-INT-002    → Epic 2, Story 3, Integration test #2
3.1-E2E-001    → Epic 3, Story 1, E2E test #1
NFR-1.1-PERF-001 → NFR Performance test
```

---

## 4. NFR Testing Approach

### 4.1 Performance (NFR-1.x) — k6 + Playwright

| NFR | Target | Tool | Test Pattern |
|-----|--------|------|--------------|
| NFR-1.1 First token | p95 < 500ms | k6 | Streaming mock, measure TTFT |
| NFR-1.2 Cold start | < 3s | Playwright | `performance.timing` on app launch |
| NFR-1.3 Composio tool | < 2s | k6 | Tool invocation roundtrip |
| NFR-1.4 Session restore | < 1s | Vitest | Benchmark seeded SQLite load |
| NFR-1.5 Skill load | < 100ms/skill | Vitest | Startup profiling |
| NFR-1.6 Hook execution | < 50ms/hook | Vitest | Hook timing instrumentation |
| NFR-1.7 Memory | < 500MB typical | k6 | Endurance test |

**k6 Thresholds:**
```javascript
export const options = {
  thresholds: {
    'first_token_latency': ['p(95)<500'],
    'tool_invocation': ['p(95)<2000'],
    'errors': ['rate<0.01'],
  },
};
```

### 4.2 Reliability (NFR-2.x) — Playwright + Vitest

| NFR | Target | Tool | Test Pattern |
|-----|--------|------|--------------|
| NFR-2.1 MCP uptime | 99% | Playwright | Health check polling |
| NFR-2.3 Session resume | 99% success | Vitest | 100 seeded sessions load |
| NFR-2.5 Graceful degradation | Status + queue | Playwright | Mock disconnect → UI assertion |
| NFR-2.6 Retry backoff | 1s/2s/4s/8s | Vitest | Mock 429 → timing assertion |
| NFR-2.9 Atomic writes | No partial | Vitest | Kill -9 during write → verify |
| NFR-2.10 Hook fail modes | Read=skip, Write=block | Vitest | Throw in hook → behavior check |

**Reliability Test Pattern:**
```typescript
test('graceful degradation on MCP disconnect', async ({ page, context }) => {
  await context.route('**/mcp/**', route => route.abort());
  await page.goto('/chat');
  await expect(page.getByText('Composio unavailable')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
});
```

### 4.3 Security (NFR-4.x) — Playwright + Audit Scripts

| NFR | Target | Tool | Test Pattern |
|-----|--------|------|--------------|
| NFR-4.1 Keychain storage | 100% keys | Script | `security find-generic-password` |
| NFR-4.2 No key logging | 0 in logs | Grep | Scan logs for key patterns |
| NFR-4.5 File blocking | Patterns blocked | Playwright | Attempt `/etc/passwd` → denied |
| NFR-4.6 Audit logging | 100% tool calls | Vitest | Count calls vs audit entries |
| NFR-4.7 PII sanitization | Redacted | Vitest | Check audit log content |

**Security Audit Script:**
```bash
#!/bin/bash
# NFR-4.1: Verify no API keys in plaintext
echo "Checking for plaintext API keys..."
if grep -r "sk-ant-" ~/Orion/ --include="*.json" --include="*.db" 2>/dev/null; then
  echo "❌ FAIL: Found plaintext API key"
  exit 1
fi

# Verify key in Keychain
if security find-generic-password -s "OrionButler" -a "anthropic_api_key" &>/dev/null; then
  echo "✅ PASS: API key stored in Keychain"
else
  echo "⚠️ WARN: No API key in Keychain (may be expected in CI)"
fi
```

### 4.4 Maintainability (NFR-6.x) — CI Tools + Vitest

| NFR | Target | Tool | Test Pattern |
|-----|--------|------|--------------|
| NFR-6.1 SDK abstraction | Single layer | Code review | Grep for direct SDK imports |
| NFR-6.3 Skill hot-reload | < 100ms | Vitest | File change → reload timing |
| NFR-6.4 Plugin validation | Schema check | Vitest | Invalid manifest → error |
| NFR-6.8 Hook timeout | 5s max | Vitest | Slow hook → timeout error |

**CI Gate:**
```yaml
- name: NFR Maintainability Check
  run: |
    # Coverage threshold
    npx vitest --coverage --coverage.thresholds.lines=80

    # No direct SDK imports outside wrapper
    if grep -r "import.*from.*@anthropic" src/ --include="*.ts" | grep -v "sdk-wrapper"; then
      echo "❌ FAIL: Direct SDK import found outside wrapper"
      exit 1
    fi
    echo "✅ PASS: SDK abstraction enforced"
```

---

## 5. Testability Concerns

### 5.1 Critical Concerns (Score ≥ 6) — Must Mitigate Before Sprint 1

| ID | Concern | Category | P×I | Owner | Mitigation |
|----|---------|----------|-----|-------|------------|
| **TC-1** | Composio MCP mocking strategy undefined | TECH | 2×3=**6** | TBD | Define MSW intercept patterns for MCP protocol; document mock server setup |
| **TC-2** | Tauri IPC streaming intercept not documented | TECH | 2×3=**6** | TBD | Create Playwright helper for `tauri://` event interception; test first-token timing |
| **TC-3** | Streaming UI determinism (XState race conditions) | TECH | 2×3=**6** | TBD | Use `waitForResponse` not `waitForTimeout`; XState test model for state coverage |

### 5.2 Medium Concerns (Score 4-5) — Address in Sprint 0

| ID | Concern | Category | P×I | Mitigation |
|----|---------|----------|-----|------------|
| **TC-4** | No HAR capture for Composio debugging | OPS | 2×2=4 | Add network logging in dev mode |
| **TC-5** | OAuth flow test isolation unclear | TECH | 2×2=4 | Document token injection for test auth |
| **TC-6** | k6 baseline not established | PERF | 2×2=4 | Create baseline script before Epic 1 |

### 5.3 Low Concerns (Score ≤ 3) — Monitor

| ID | Concern | Category | P×I | Notes |
|----|---------|----------|-----|-------|
| **TC-7** | Keychain access in CI | OPS | 1×2=2 | Use env vars in CI, Keychain in local |
| **TC-8** | Multi-window test complexity | TECH | 1×2=2 | Single window sufficient for MVP |

---

## 6. Sprint 0 Test Infrastructure

### 6.1 Required Before Epic Implementation

- [ ] **MSW mock server** with Composio MCP patterns
- [ ] **Tauri test helpers** for IPC event interception
- [ ] **XState test model** configuration for streaming states
- [ ] **k6 baseline script** with SLO thresholds
- [ ] **Test factories** for User, Session, Skill, Hook entities
- [ ] **SQLite test fixtures** with auto-cleanup
- [ ] **CI pipeline** with coverage gates (80% unit, 70% integration)

### 6.2 Directory Structure

```
tests/
├── unit/                    # Vitest unit tests
│   ├── business-logic/
│   ├── state-management/
│   └── utils/
├── integration/             # Vitest integration tests
│   ├── ipc/
│   ├── database/
│   └── sdk/
├── e2e/                     # Playwright E2E tests
│   ├── journeys/
│   └── nfr/
├── performance/             # k6 load tests
│   ├── baseline.k6.js
│   └── stress.k6.js
├── fixtures/                # Shared test infrastructure
│   ├── factories/
│   ├── mocks/
│   └── helpers/
└── scripts/                 # Security audit scripts
    └── security-audit.sh
```

### 6.3 CI Pipeline Gates

```yaml
# .github/workflows/test.yml
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
            echo "❌ Coverage $COVERAGE% below 80%"
            exit 1
          fi

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Run integration tests
        run: npx vitest run --project integration

  e2e-tests:
    runs-on: macos-latest  # Tauri requires macOS
    steps:
      - name: Run E2E tests
        run: npx playwright test

  security-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Run security checks
        run: ./tests/scripts/security-audit.sh
```

---

## 7. Gate Decision

### 7.1 Assessment Summary

| Criterion | Status | Notes |
|-----------|--------|-------|
| Testability (Controllability) | ⚠️ CONCERNS | 3 critical concerns need Sprint 0 work |
| Testability (Observability) | ✅ PASS | Logging + audit trail adequate |
| Testability (Reliability) | ⚠️ CONCERNS | Streaming determinism needs patterns |
| ASR Coverage | ✅ PASS | All ASRs have test approaches |
| NFR Test Strategy | ✅ PASS | Tools mapped to all NFR categories |

### 7.2 Recommendation

**⚠️ CONCERNS — Proceed with conditions:**

1. **Sprint 0 must complete** test infrastructure checklist before Epic 1 begins
2. **TC-1, TC-2, TC-3** must have documented mitigations with owners assigned
3. **k6 baseline** must be established to validate NFR-1.1 approach

### 7.3 Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Test Architect | TEA (Murat) | 2026-01-24 | ⚠️ CONCERNS |
| Solution Architect | — | — | Pending |
| Product Owner | — | — | Pending |

---

## References

- **Architecture:** `thoughts/planning-artifacts/architecture.md`
- **PRD v2:** `thoughts/planning-artifacts/prd-v2.md`
- **NFRs:** `thoughts/planning-artifacts/nfr-extracted-from-prd-v2.md`
- **Epics:** `thoughts/planning-artifacts/epics.md`
- **TEA Knowledge Base:** `_bmad/bmm/testarch/knowledge/`

---

*Generated by TEA (Master Test Architect) — Strong opinions, weakly held.*
