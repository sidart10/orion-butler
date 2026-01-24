# CI/CD Pipeline Guide

**Generated:** 2026-01-24
**Platform:** GitHub Actions
**Workflow File:** `.github/workflows/test.yml`

---

## Overview

The Orion Butler test pipeline provides automated quality gates with:

- Parallel test execution (4 shards)
- Flaky test detection (burn-in loops)
- Failure artifact collection
- Coverage reporting

## Pipeline Stages

```
┌─────────┐     ┌────────────┐     ┌────────────┐     ┌──────────┐
│  Lint   │────▶│ Unit Tests │────▶│ E2E Tests  │────▶│ Burn-In  │
└─────────┘     └────────────┘     │ (4 shards) │     │ (10 iter)│
                                   └────────────┘     └──────────┘
```

### Stage 1: Lint & Type Check (~2 min)

- ESLint code quality checks
- TypeScript type validation
- Runs on every push/PR

### Stage 2: Unit Tests (~5 min)

- Vitest unit test suite
- Coverage report generation
- Requires lint to pass

### Stage 3: E2E Tests (~10 min per shard)

- Playwright browser tests
- 4 parallel shards for speed
- Chromium browser (fastest)
- Failure artifacts uploaded

### Stage 4: Burn-In (~30 min)

- 10 iterations of full test suite
- Detects flaky/non-deterministic tests
- Runs on PRs and weekly schedule
- Any failure = tests are flaky

## Triggers

| Event | Lint | Unit | E2E | Burn-In |
|-------|------|------|-----|---------|
| Push to main/develop | ✅ | ✅ | ✅ | ❌ |
| Pull Request | ✅ | ✅ | ✅ | ✅ |
| Weekly Schedule (Sun 2am) | ✅ | ✅ | ✅ | ✅ |
| Manual (with burn_in=true) | ✅ | ✅ | ✅ | ✅ |

## Performance Targets

| Stage | Target | Alert |
|-------|--------|-------|
| Lint | < 2 min | > 5 min |
| Unit Tests | < 5 min | > 10 min |
| E2E (per shard) | < 10 min | > 20 min |
| Burn-In | < 30 min | > 60 min |
| **Total Pipeline** | **< 45 min** | > 60 min |

## Running Locally

### Mirror CI Pipeline

```bash
# Full pipeline (includes 3-iteration burn-in)
./scripts/ci-local.sh

# Quick mode (skip burn-in)
./scripts/ci-local.sh --quick
```

### Run Burn-In

```bash
# Default 10 iterations
./scripts/burn-in.sh

# Custom iterations
./scripts/burn-in.sh 5      # Quick check
./scripts/burn-in.sh 100    # High confidence
```

### Selective Testing

```bash
# Test only changed files (vs last commit)
./scripts/test-changed.sh

# Test against main branch
./scripts/test-changed.sh main
```

## Debugging Failed CI Runs

### 1. Download Artifacts

Failed runs upload artifacts to GitHub Actions:
- `test-results-shard-N` - Per-shard results
- `burn-in-failures` - Burn-in failure traces
- `coverage-report` - Coverage HTML

### 2. View Playwright Traces

```bash
# Extract artifact and view trace
unzip test-results-shard-1.zip
npx playwright show-trace test-results/*/trace.zip
```

### 3. Reproduce Locally

```bash
# Run the specific failing test
npm run test:e2e -- tests/e2e/failing-test.spec.ts

# Run with debug mode
PWDEBUG=1 npm run test:e2e -- tests/e2e/failing-test.spec.ts
```

## Caching

The pipeline caches:

| Cache | Key | Savings |
|-------|-----|---------|
| npm dependencies | `package-lock.json` hash | ~2-3 min |
| Playwright browsers | `package-lock.json` hash | ~1-2 min |

Cache is restored automatically. Force refresh by updating dependencies.

## Environment Variables

| Variable | Purpose | Set In |
|----------|---------|--------|
| `CI` | Indicates CI environment | Auto-set |
| `NODE_VERSION` | Node.js version | Workflow |
| `BASE_URL` | App URL for E2E tests | Workflow |

## Secrets Required

Currently no secrets required. Future integrations may need:

| Secret | Purpose | Setup |
|--------|---------|-------|
| `SLACK_WEBHOOK` | Failure notifications | Optional |
| `CODECOV_TOKEN` | Coverage reporting | Optional |

See `docs/ci-secrets-checklist.md` for setup instructions.

## Badge

Add to README.md:

```markdown
[![Test Pipeline](https://github.com/sidart10/orion-butler/actions/workflows/test.yml/badge.svg)](https://github.com/sidart10/orion-butler/actions/workflows/test.yml)
```

## Troubleshooting

### Tests pass locally but fail in CI

1. Run `./scripts/ci-local.sh` to mirror CI environment
2. Check for hardcoded paths or OS-specific code
3. Verify environment variables are set correctly

### Burn-in fails intermittently

1. Tests are flaky - review failure artifacts
2. Common causes:
   - Race conditions
   - Timing-dependent assertions
   - Shared state between tests
3. Fix before merging to main

### Cache not working

1. Check cache key formula in workflow
2. Verify paths are correct
3. Try clearing cache in GitHub Actions settings

### Pipeline is slow

1. Review sharding - increase shard count if needed
2. Check for unnecessary dependencies
3. Profile individual test files

---

## Next Steps

1. **Commit the CI configuration:**
   ```bash
   git add .github/workflows/test.yml scripts/ docs/ci.md
   git commit -m "ci: add test pipeline with parallel shards and burn-in"
   ```

2. **Push to trigger first run:**
   ```bash
   git push origin main
   ```

3. **Open a PR to test burn-in:**
   ```bash
   git checkout -b ci/test-pipeline
   git push -u origin ci/test-pipeline
   # Open PR on GitHub
   ```

4. **Monitor the pipeline** in GitHub Actions tab

---

*Generated by TEA (Test Architect) CI workflow*
