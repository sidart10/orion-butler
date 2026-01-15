# Orion Test Suite

**Framework**: Hybrid - Vitest (unit/integration) + Agent-Browser (E2E)

---

## Quick Start

```bash
# Install dependencies
npm install

# Run all unit/integration tests
npm test

# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with visible browser
npm run test:e2e:headed

# Run with coverage
npm run test:coverage
```

---

## Directory Structure

```
tests/
├── e2e/                          # E2E tests (agent-browser)
│   └── example.test.ts           # Sample E2E test patterns
├── unit/                         # Unit tests (vitest)
│   └── example.test.ts           # Sample unit test patterns
├── integration/                  # Integration tests (vitest)
├── support/                      # Test infrastructure
│   ├── browser-agent/            # Agent-browser wrapper
│   │   ├── client.ts             # TypeScript client for CLI
│   │   └── e2e-runner.ts         # E2E test runner
│   ├── fixtures/                 # Test fixtures
│   │   ├── index.ts              # Central exports
│   │   └── setup.ts              # Vitest global setup
│   └── helpers/                  # Utility functions
│       ├── assertions.ts         # Custom assertions
│       └── wait.ts               # Wait utilities
└── README.md                     # This file
```

---

## Test Patterns

### Unit Tests (Vitest)

Use for testing isolated functions, utilities, and components.

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('MyFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

**Run**: `npm run test:unit`

### E2E Tests (Agent-Browser)

Use the **snapshot → parse → act → observe** pattern optimized for AI agents.

```typescript
import { describe, it, AgentBrowserClient } from '../support/fixtures';

describe('Feature', () => {
  it('should complete user flow', async (browser: AgentBrowserClient) => {
    // 1. NAVIGATE
    await browser.open('http://localhost:3000');

    // 2. SNAPSHOT - Get page state with refs (@e1, @e2, etc.)
    const snapshot = await browser.snapshot({ interactive: true });

    // 3. PARSE - Find elements by ref or role
    const button = Object.values(snapshot.refs).find(
      el => el.role === 'button' && el.name?.includes('Submit')
    );

    // 4. ACT - Interact using refs
    if (button) {
      await browser.click(button.id); // e.g., @e3
    }

    // 5. OBSERVE - Verify results
    await browser.waitForNavigation();
    const newSnapshot = await browser.snapshot();
    // Assert on newSnapshot...
  });
});
```

**Run**: `npm run test:e2e`

---

## Agent-Browser Reference

Agent-browser is a CLI-based browser automation tool designed for AI agents.

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Refs** | Deterministic element IDs (@e1, @e2) from snapshots |
| **Snapshots** | Accessibility tree capture with interactive elements |
| **CLI Commands** | All interactions via shell commands |
| **JSON Output** | Machine-readable output for LLM parsing |

### Common Commands

```typescript
// Navigation
await browser.open(url);           // Open URL in new tab
await browser.goto(url);           // Navigate current tab
await browser.back();              // Go back
await browser.forward();           // Go forward
await browser.reload();            // Reload page

// Snapshot & Discovery
const snap = await browser.snapshot({ interactive: true });
const elements = await browser.find('query', { role: 'button' });

// Interactions
await browser.click('@e1');        // Click by ref
await browser.type('text');        // Type into focused element
await browser.fill('@e2', 'value'); // Clear and fill
await browser.press('Enter');      // Keyboard press
await browser.scroll({ direction: 'down' });
await browser.hover('@e3');

// Assertions
const url = await browser.url();
const title = await browser.title();

// Artifacts
await browser.screenshot('path.png');
await browser.pdf('path.pdf');

// Session
await browser.saveState('auth.json');
await browser.loadState('auth.json');
await browser.close();
```

### Snapshot Structure

```typescript
interface BrowserSnapshot {
  url: string;
  title: string;
  refs: Record<string, ElementRef>;
  timestamp: number;
}

interface ElementRef {
  id: string;      // @e1, @e2, etc.
  role: string;    // ARIA role
  name?: string;   // Accessible name
  text?: string;   // Text content
  bounds?: { x, y, width, height };
}
```

---

## Helper Functions

### Wait Utilities

```typescript
import { waitForText, waitForUrl, waitForRole, sleep, retry } from '../support/helpers/wait';

// Wait for text to appear
await waitForText(browser, 'Success', { timeout: 5000 });

// Wait for URL pattern
await waitForUrl(browser, '/dashboard');

// Wait for element with role
await waitForRole(browser, 'dialog', { name: 'Confirm' });

// Simple delay
await sleep(1000);

// Retry with backoff
await retry(() => browser.click('@e1'), { retries: 3 });
```

### Custom Assertions

```typescript
import { assertUrl, assertTitle, assertRefExists, assertTextExists } from '../support/helpers/assertions';

// URL assertions
await assertUrl(browser, '/home');
await assertUrl(browser, /dashboard/);

// Title assertion
await assertTitle(browser, 'Orion');

// Snapshot assertions
assertRefExists(snapshot, '@e1');
assertTextExists(snapshot, 'Welcome');
assertRole(snapshot, 'button', { name: 'Submit' });
```

---

## Configuration

### Vitest (`vitest.config.ts`)

- **Test files**: `tests/unit/**/*.test.ts`, `tests/integration/**/*.test.ts`
- **Environment**: Node
- **Coverage**: V8 provider, reports in `test-results/coverage`
- **Setup file**: `tests/support/fixtures/setup.ts`

### Agent-Browser

Environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `AGENT_BROWSER_HEADLESS` | Run without visible browser | `1` |
| `AGENT_BROWSER_EXECUTABLE_PATH` | Custom browser path | Chromium |
| `AGENT_BROWSER_STREAM_PORT` | Enable viewport streaming | disabled |

---

## Best Practices

### 1. Use Refs, Not Selectors

```typescript
// ✅ Good - deterministic ref
await browser.click('@e3');

// ❌ Avoid - brittle selector
await browser.click('button.submit-btn');
```

### 2. Snapshot Before Acting

```typescript
// ✅ Good - snapshot to discover refs
const snapshot = await browser.snapshot();
const button = Object.values(snapshot.refs).find(el => el.role === 'button');
await browser.click(button.id);

// ❌ Avoid - guessing refs
await browser.click('@e1'); // May not exist
```

### 3. Wait for State Changes

```typescript
// ✅ Good - explicit wait
await browser.click('@e1');
await waitForText(browser, 'Success');

// ❌ Avoid - arbitrary sleep
await browser.click('@e1');
await sleep(2000);
```

### 4. Clean Up Sessions

```typescript
describe('Suite', () => {
  afterAll(async (browser) => {
    await browser.close();
  });
});
```

---

## Dual-Use: Agent Capabilities & Testing

This framework serves two purposes:

### 1. Testing Orion (QA)

E2E tests validate Orion's UI and flows work correctly.

### 2. Orion's Browser Tool (Agent Capability)

The `AgentBrowserClient` can be used by Orion's agent to:
- Automate web tasks for users
- Scrape information
- Fill forms
- Navigate complex UIs

The same `snapshot → act → observe` pattern works for both.

---

## Knowledge Base References

- [Vercel Agent-Browser](https://github.com/vercel-labs/agent-browser)
- `_bmad/bmm/testarch/knowledge/fixture-architecture.md`
- `_bmad/bmm/testarch/knowledge/data-factories.md`
- `_bmad/bmm/testarch/knowledge/test-quality.md`
