# Performance Testing with k6

This directory contains k6 load test scripts for validating Orion's performance SLOs (Service Level Objectives).

## Overview

The baseline load test validates critical NFR-1 performance requirements:

| Metric | SLO Threshold | NFR Reference |
|--------|---------------|---------------|
| First token latency | p95 < 500ms | NFR-1.1 |
| Tool invocation | p95 < 2000ms | NFR-1.3 |
| Error rate | < 1% | NFR-2.4 |

## Prerequisites

### Install k6

```bash
# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
# or
winget install k6
```

Verify installation:

```bash
k6 version
```

### Install Node.js Dependencies

The mock server requires Node.js and the project's dependencies:

```bash
npm install
```

## Quick Start

### 1. Start the Mock Server

In one terminal:

```bash
npx tsx tests/performance/mock-server.ts
```

You should see:

```
[Mock Server] Claude API mock running on http://localhost:3456
[Mock Server] Endpoint: POST /v1/messages
[Mock Server] Configuration:
  - First token delay: 100ms (SLO: <500ms)
  - Tool call delay: 500ms (SLO: <2000ms)
  - Error rate: 0.5% (SLO: <1%)
```

### 2. Run the Load Test

In another terminal:

```bash
k6 run tests/performance/baseline.k6.js
```

## Test Scenarios

The baseline test includes three scenarios that run sequentially:

### 1. Simple Query (`simple_query`)

- **Duration:** 30 seconds
- **VUs:** 10 concurrent users
- **Purpose:** Validates first token latency (NFR-1.1)
- **Metric:** `first_token_latency`

```bash
# Run only simple_query scenario
k6 run tests/performance/baseline.k6.js --env SCENARIO=simple_query
```

### 2. Tool Call (`tool_call`)

- **Duration:** 30 seconds (starts at 30s)
- **VUs:** 5 concurrent users
- **Purpose:** Validates tool invocation latency (NFR-1.3)
- **Metric:** `tool_invocation`

```bash
# Run only tool_call scenario
k6 run tests/performance/baseline.k6.js --env SCENARIO=tool_call
```

### 3. Error Injection (`error_injection`)

- **Duration:** 30 seconds (starts at 60s)
- **VUs:** 5 concurrent users
- **Purpose:** Validates error rate threshold (NFR-2.4)
- **Metric:** `errors` (rate)

## Understanding Results

### Threshold Checks

At the end of the test, k6 displays threshold results:

```
     ✓ first_token_latency............: avg=112ms    min=101ms   med=110ms   max=145ms   p(90)=125ms   p(95)=135ms
     ✓ first_token_latency{scenario:simple_query}: avg=112ms p(95)=135ms
     ✓ tool_invocation................: avg=520ms    min=502ms   med=515ms   max=580ms   p(90)=550ms   p(95)=565ms
     ✓ errors..........................: 0.45%   ✓ 12       ✗ 2638
```

- ✓ = Threshold passed (SLO met)
- ✗ = Threshold failed (SLO violated)

### Key Metrics

| Metric | Description |
|--------|-------------|
| `first_token_latency` | Time to receive first content from Claude API |
| `tool_invocation` | Time for tool call processing |
| `errors` | Percentage of failed requests |
| `response_time` | Total request-response time |

## Mock Server Configuration

The mock server simulates Claude API responses with configurable timing:

| Parameter | Default | Purpose |
|-----------|---------|---------|
| `FIRST_TOKEN_DELAY` | 100ms | Delay before first token (tests NFR-1.1) |
| `TOKEN_INTERVAL` | 20ms | Interval between streamed tokens |
| `TOKENS_PER_RESPONSE` | 50 | Number of tokens in response |
| `TOOL_CALL_DELAY` | 500ms | Additional delay for tool calls (tests NFR-1.3) |
| `ERROR_RATE` | 0.5% | Random error injection rate (tests NFR-2.4) |

### Custom Port

```bash
PORT=8080 npx tsx tests/performance/mock-server.ts
k6 run tests/performance/baseline.k6.js --env BASE_URL=http://localhost:8080
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Performance Tests

on:
  push:
    branches: [main]
  pull_request:

jobs:
  k6-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Setup k6
        uses: grafana/setup-k6-action@v1

      - name: Start mock server
        run: |
          npx tsx tests/performance/mock-server.ts &
          sleep 2

      - name: Run k6 tests
        run: k6 run tests/performance/baseline.k6.js

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: k6-results
          path: k6-results.json
```

### JSON Output for CI

```bash
k6 run tests/performance/baseline.k6.js --out json=k6-results.json
```

## Troubleshooting

### Mock Server Not Reachable

```
Mock server not reachable at http://localhost:3456
```

**Solution:** Start the mock server first:

```bash
npx tsx tests/performance/mock-server.ts
```

### k6 Not Found

```
command not found: k6
```

**Solution:** Install k6 (see Prerequisites above)

### Threshold Failures

If thresholds fail, the mock server timing may need adjustment or there may be a real performance issue. Check:

1. Mock server is running and healthy
2. No other processes consuming CPU
3. Network latency is minimal (localhost should be ~0ms)

## NFR References

- **NFR-1.1:** First token latency p95 < 500ms
- **NFR-1.3:** Composio tool call < 2s
- **NFR-2.4:** Error rate < 1%

See `thoughts/planning-artifacts/nfr-extracted-from-prd-v2.md` for full NFR specifications.

## Files

| File | Purpose |
|------|---------|
| `baseline.k6.js` | Main k6 load test script with SLO thresholds |
| `mock-server.ts` | Claude API mock server for testing |
| `README.md` | This documentation |
