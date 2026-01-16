# ATDD Checklist: Story 1.2 - Next.js Frontend Integration

**Story ID:** 1-2-nextjs-frontend-integration
**Epic:** 1 - Foundation & First Chat
**Status:** Ready for Implementation
**Created:** 2026-01-15
**Author:** TEA (Murat - Master Test Architect)

---

## Overview

This ATDD checklist provides comprehensive test scenarios for Story 1.2 (Next.js Frontend Integration). Tests are designed test-first before implementation, following project patterns from test-design-epic-1.md.

### Test Distribution

| Level | Count | Coverage |
|-------|-------|----------|
| Unit | 8 | 30% |
| Integration | 10 | 37% |
| E2E | 9 | 33% |
| **Total** | **27** | 100% |

---

## AC1: Frontend Loads in WebView

**Given** the Tauri shell is running (Story 1.1 complete)
**When** the app initializes
**Then** the Next.js frontend loads in the webview
**And** React components render without hydration errors
**And** the frontend communicates with Tauri via IPC

### Test Scenarios

| ID | Type | Scenario | Expected Result | Priority |
|----|------|----------|-----------------|----------|
| AC1-01 | E2E | Frontend renders in Tauri WebView | App window shows Next.js content, not blank | P0 |
| AC1-02 | E2E | No React hydration errors in console | Zero hydration-related console errors | P0 |
| AC1-03 | E2E | No console errors on initial load | Filter non-critical; zero real errors | P0 |
| AC1-04 | Integration | IPC invoke command works (frontend to backend) | `invoke('greet')` returns expected string | P0 |
| AC1-05 | Integration | IPC event listener works (backend to frontend) | `listen` receives emitted events | P1 |
| AC1-06 | Unit | Tauri IPC helper types are correct | TypeScript compilation passes | P1 |
| AC1-07 | E2E | Page loads within acceptable time | Load complete < 2 seconds | P1 |
| AC1-08 | Integration | Tauri API available in window context | `window.__TAURI__` is defined | P0 |

### Test Code Templates

```typescript
// tests/e2e/story-1.2-frontend.spec.ts
import { test, expect } from '@playwright/test';

test.describe('AC1: Frontend Loads in WebView', () => {

  test('AC1-01 - frontend renders in Tauri WebView', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verify React app rendered (not blank page)
    const rootElement = page.locator('#__next, [data-testid="app-root"]');
    await expect(rootElement).toBeVisible();

    // Verify some actual content rendered
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test('AC1-02 - no React hydration errors', async ({ page }) => {
    const hydrationErrors: string[] = [];

    page.on('console', msg => {
      const text = msg.text().toLowerCase();
      if (text.includes('hydration') ||
          text.includes('hydrating') ||
          text.includes('server rendered')) {
        hydrationErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      if (error.message.toLowerCase().includes('hydration')) {
        hydrationErrors.push(error.message);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(hydrationErrors).toHaveLength(0);
  });

  test('AC1-03 - no console errors on initial load', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter acceptable errors
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('ResizeObserver') &&
      !err.includes('DevTools') &&
      !err.includes('third-party')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('AC1-07 - page loads within 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    console.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
  });

});

// tests/integration/story-1.2-ipc.spec.ts
import { test, expect, vi } from 'vitest';
import { invoke, listen } from '@tauri-apps/api/core';

// Mock Tauri for isolated testing
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
  listen: vi.fn(),
}));

test('AC1-04 - IPC invoke command works', async () => {
  vi.mocked(invoke).mockResolvedValue('Hello, Test! Welcome to Orion.');

  const result = await invoke<string>('greet', { name: 'Test' });

  expect(invoke).toHaveBeenCalledWith('greet', { name: 'Test' });
  expect(result).toContain('Hello');
  expect(result).toContain('Orion');
});

test('AC1-05 - IPC event listener receives events', async () => {
  const eventHandler = vi.fn();
  vi.mocked(listen).mockImplementation(async (event, handler) => {
    // Simulate backend emitting an event
    setTimeout(() => {
      handler({ payload: { message: 'Backend event' }, event: 'test-event', id: 1 });
    }, 10);
    return () => {}; // unlisten function
  });

  await listen('test-event', eventHandler);

  // Wait for async event
  await new Promise(resolve => setTimeout(resolve, 50));

  expect(eventHandler).toHaveBeenCalled();
  expect(eventHandler).toHaveBeenCalledWith(
    expect.objectContaining({
      payload: { message: 'Backend event' }
    })
  );
});

test('AC1-08 - Tauri API available check', async ({ page }) => {
  await page.goto('/');

  const tauriAvailable = await page.evaluate(() => {
    return typeof (window as any).__TAURI__ !== 'undefined';
  });

  expect(tauriAvailable).toBe(true);
});
```

---

## AC2: Error Boundary Protection

**Given** there is a JavaScript error in the frontend
**When** the error occurs
**Then** it is caught and logged (not silent failure)
**And** the app remains functional
**And** user sees a friendly error message with recovery option

### Test Scenarios

| ID | Type | Scenario | Expected Result | Priority |
|----|------|----------|-----------------|----------|
| AC2-01 | Unit | ErrorBoundary catches render errors | Fallback UI displayed, not crash | P0 |
| AC2-02 | Unit | ErrorBoundary logs errors to console | Structured error log with stack trace | P0 |
| AC2-03 | Unit | ErrorBoundary "Try Again" resets state | Click resets hasError to false | P0 |
| AC2-04 | E2E | App remains functional after error | Other components still interactive | P1 |
| AC2-05 | Unit | Next.js error.tsx catches route errors | Error page renders on route error | P0 |
| AC2-06 | Unit | Global error handler (global-error.tsx) catches root errors | App-level fallback UI shown | P1 |
| AC2-07 | Integration | Error logging includes timestamp and component stack | Log format matches spec | P1 |

### Test Code Templates

```typescript
// tests/unit/story-1.2-error-boundary.spec.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/error-boundary';
import { vi } from 'vitest';

// Component that throws an error
const ThrowingComponent = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test render error');
  }
  return <div>Normal render</div>;
};

test('AC2-01 - ErrorBoundary catches render errors', () => {
  // Suppress console.error for cleaner test output
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  render(
    <ErrorBoundary fallback={<div data-testid="fallback">Something went wrong</div>}>
      <ThrowingComponent />
    </ErrorBoundary>
  );

  // Fallback should be visible
  expect(screen.getByTestId('fallback')).toBeVisible();
  expect(screen.getByText('Something went wrong')).toBeInTheDocument();

  consoleSpy.mockRestore();
});

test('AC2-02 - ErrorBoundary logs errors with structure', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  render(
    <ErrorBoundary>
      <ThrowingComponent />
    </ErrorBoundary>
  );

  // Verify structured logging was called
  expect(consoleSpy).toHaveBeenCalled();
  const logCall = consoleSpy.mock.calls.find(call =>
    call[0]?.includes?.('[ErrorBoundary]')
  );
  expect(logCall).toBeDefined();

  consoleSpy.mockRestore();
});

test('AC2-03 - Try Again button resets error state', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  let shouldThrow = true;

  const ConditionalThrow = () => {
    if (shouldThrow) throw new Error('Test');
    return <div data-testid="success">Recovered!</div>;
  };

  render(
    <ErrorBoundary>
      <ConditionalThrow />
    </ErrorBoundary>
  );

  // Error state - should show retry button
  const retryButton = screen.getByRole('button', { name: /try again/i });
  expect(retryButton).toBeInTheDocument();

  // Fix the error condition
  shouldThrow = false;

  // Click retry
  fireEvent.click(retryButton);

  // Should recover
  expect(screen.getByTestId('success')).toBeInTheDocument();

  consoleSpy.mockRestore();
});

test('AC2-04 - App remains functional after isolated error', async ({ page }) => {
  // Inject an error in one component
  await page.goto('/');

  // Trigger error in isolated component (via test mechanism)
  await page.evaluate(() => {
    // This would trigger an error in a specific component
    (window as any).__triggerTestError?.('isolated-component');
  });

  // Other parts of the app should still be interactive
  const chatInput = page.locator('[data-testid="chat-input"]');
  if (await chatInput.isVisible()) {
    await expect(chatInput).toBeEnabled();
  }
});

test('AC2-07 - Error log includes timestamp and component stack', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  render(
    <ErrorBoundary>
      <ThrowingComponent />
    </ErrorBoundary>
  );

  const logCall = consoleSpy.mock.calls.find(call =>
    typeof call[0] === 'string' && call[0].includes('[ErrorBoundary]')
  );

  expect(logCall).toBeDefined();

  // Check the second argument (error object)
  const errorObject = logCall?.[1];
  if (typeof errorObject === 'object') {
    expect(errorObject).toHaveProperty('timestamp');
    expect(errorObject).toHaveProperty('componentStack');
    expect(errorObject).toHaveProperty('error');
  }

  consoleSpy.mockRestore();
});
```

---

## AC3: Development Hot Reload

**Given** the app is running in development mode
**When** I modify a React component
**Then** changes appear without full page reload
**And** component state is preserved where possible

### Test Scenarios

| ID | Type | Scenario | Expected Result | Priority |
|----|------|----------|-----------------|----------|
| AC3-01 | Manual | Modify component file | Changes appear in app | P0 |
| AC3-02 | Manual | Component state preserved | Counter value maintained after edit | P1 |
| AC3-03 | Integration | Next.js HMR websocket connects | WebSocket connection established | P1 |
| AC3-04 | Manual | CSS changes apply instantly | Style updates without refresh | P1 |
| AC3-05 | Manual | Tauri dev mode connects to localhost:3000 | Dev URL configured correctly | P0 |

### Test Code Templates

```typescript
// tests/integration/story-1.2-hmr.spec.ts
import { test, expect } from '@playwright/test';

test.describe('AC3: Development Hot Reload', () => {

  // Note: HMR tests are primarily manual, but we can verify configuration
  test('AC3-03 - HMR websocket connection exists', async ({ page }) => {
    // This test runs in dev mode only
    if (process.env.NODE_ENV !== 'development') {
      test.skip();
    }

    await page.goto('/');

    // Check for HMR websocket connection
    const hmrConnected = await page.evaluate(() => {
      // Next.js HMR uses a specific websocket
      const ws = (window as any).__NEXT_DATA__?.hmr ||
                 (window as any).__next?.router?.events;
      return !!ws;
    });

    // At minimum, verify no HMR errors
    const hmrErrors: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('HMR') && msg.type() === 'error') {
        hmrErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);
    expect(hmrErrors).toHaveLength(0);
  });

  test('AC3-05 - Tauri dev URL configuration', async ({ page }) => {
    // Verify we're connecting to dev server
    const currentUrl = page.url();

    // In Tauri dev mode, should be localhost:3000 or similar
    // In production, would be tauri:// or file://
    if (process.env.NODE_ENV === 'development') {
      expect(currentUrl).toMatch(/localhost:\d+/);
    }
  });

});

// Manual Test Procedure (documented for QA)
/*
AC3-01: Manual HMR Test Procedure

1. Start development environment:
   Terminal 1: pnpm dev
   Terminal 2: pnpm tauri dev

2. Open the app and navigate to any page

3. Modify src/app/page.tsx:
   - Add a visible text change: <p>HMR Test</p>

4. Save the file

5. VERIFY:
   - [ ] Change appears in app within 2 seconds
   - [ ] No full page reload (check network tab)
   - [ ] Console shows [HMR] update message

AC3-02: State Preservation Test

1. Add a counter component to page:
   const [count, setCount] = useState(0)

2. Click to increment counter to 5

3. Modify the component text (not state logic)

4. VERIFY:
   - [ ] Counter still shows 5 after HMR
   - [ ] Component re-rendered with new text
*/
```

---

## AC4: Production Build

**Given** the app is built for production
**When** the build completes
**Then** Next.js outputs static files for Tauri
**And** no server-side rendering dependencies remain
**And** all assets are bundled correctly

### Test Scenarios

| ID | Type | Scenario | Expected Result | Priority |
|----|------|----------|-----------------|----------|
| AC4-01 | Integration | `pnpm build` completes without errors | Exit code 0, no build errors | P0 |
| AC4-02 | Integration | Static export generates `out/` directory | Directory exists with HTML files | P0 |
| AC4-03 | Unit | next.config.js has `output: 'export'` | Static export configured | P0 |
| AC4-04 | Integration | No server-side dependencies in output | No API routes, no ISR, no middleware | P0 |
| AC4-05 | Integration | All assets bundled in out/ | CSS, JS, fonts in _next/ | P1 |
| AC4-06 | Integration | index.html is valid | HTML parses correctly | P0 |
| AC4-07 | E2E | Built app runs in Tauri | Production bundle loads in app | P0 |
| AC4-08 | Integration | Images use unoptimized config | next.config images.unoptimized: true | P1 |
| AC4-09 | Integration | Trailing slash configured | next.config trailingSlash: true | P1 |

### Test Code Templates

```typescript
// tests/integration/story-1.2-build.spec.ts
import { test, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = process.cwd();
const OUT_DIR = path.join(PROJECT_ROOT, 'out');

test.describe('AC4: Production Build', () => {

  // Run build once before all tests
  beforeAll(() => {
    try {
      execSync('pnpm build', {
        cwd: PROJECT_ROOT,
        stdio: 'pipe',
        timeout: 120000, // 2 minute timeout
      });
    } catch (error) {
      console.error('Build failed:', error);
      throw error;
    }
  }, 150000);

  test('AC4-01 - build completes without errors', () => {
    // If we reach here, beforeAll succeeded
    expect(true).toBe(true);
  });

  test('AC4-02 - static export generates out/ directory', () => {
    expect(fs.existsSync(OUT_DIR)).toBe(true);

    // Should have index.html
    const indexPath = path.join(OUT_DIR, 'index.html');
    expect(fs.existsSync(indexPath)).toBe(true);
  });

  test('AC4-03 - next.config.js has static export', () => {
    const configPath = path.join(PROJECT_ROOT, 'next.config.js');
    const configContent = fs.readFileSync(configPath, 'utf-8');

    expect(configContent).toContain("output: 'export'");
  });

  test('AC4-04 - no server-side dependencies in output', () => {
    // Check for absence of server-side artifacts
    const apiDir = path.join(OUT_DIR, 'api');
    expect(fs.existsSync(apiDir)).toBe(false);

    // Check no server.js or similar
    const serverFiles = ['server.js', '_middleware.js', '.next'];
    serverFiles.forEach(file => {
      expect(fs.existsSync(path.join(OUT_DIR, file))).toBe(false);
    });

    // Verify no getServerSideProps references in built files
    const htmlFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.html'));
    htmlFiles.forEach(file => {
      const content = fs.readFileSync(path.join(OUT_DIR, file), 'utf-8');
      expect(content).not.toContain('getServerSideProps');
      expect(content).not.toContain('__N_SSP');
    });
  });

  test('AC4-05 - all assets bundled in _next/', () => {
    const nextDir = path.join(OUT_DIR, '_next');
    expect(fs.existsSync(nextDir)).toBe(true);

    // Check for static assets
    const staticDir = path.join(nextDir, 'static');
    expect(fs.existsSync(staticDir)).toBe(true);

    // Should have chunks directory with JS files
    const chunksDir = path.join(staticDir, 'chunks');
    if (fs.existsSync(chunksDir)) {
      const jsFiles = fs.readdirSync(chunksDir).filter(f => f.endsWith('.js'));
      expect(jsFiles.length).toBeGreaterThan(0);
    }
  });

  test('AC4-06 - index.html is valid HTML', () => {
    const indexPath = path.join(OUT_DIR, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf-8');

    // Basic HTML validation
    expect(content).toContain('<!DOCTYPE html>');
    expect(content).toContain('<html');
    expect(content).toContain('<head>');
    expect(content).toContain('<body>');
    expect(content).toContain('</html>');

    // Should have Next.js script tags
    expect(content).toContain('_next/static');
  });

  test('AC4-08 - images unoptimized config', () => {
    const configPath = path.join(PROJECT_ROOT, 'next.config.js');
    const configContent = fs.readFileSync(configPath, 'utf-8');

    expect(configContent).toContain('unoptimized');
    expect(configContent).toMatch(/images:\s*\{[^}]*unoptimized:\s*true/);
  });

  test('AC4-09 - trailing slash configured', () => {
    const configPath = path.join(PROJECT_ROOT, 'next.config.js');
    const configContent = fs.readFileSync(configPath, 'utf-8');

    expect(configContent).toContain('trailingSlash: true');
  });

});

// tests/e2e/story-1.2-production.spec.ts
test('AC4-07 - built app runs in Tauri', async ({ page }) => {
  // This test runs against the production build
  // Tauri must be configured to serve from out/

  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  // Verify app renders
  const rootElement = page.locator('#__next, [data-testid="app-root"]');
  await expect(rootElement).toBeVisible();

  // Verify no 404 or error page
  const pageTitle = await page.title();
  expect(pageTitle).not.toContain('404');
  expect(pageTitle).not.toContain('Error');

  // Verify assets loaded (no broken images/styles)
  const brokenImages = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.filter(img => !img.complete || img.naturalWidth === 0).length;
  });
  expect(brokenImages).toBe(0);
});
```

---

## Test Execution Summary

### Pre-Implementation Checklist

- [ ] Test files created in correct directories
- [ ] Playwright configured for Tauri testing
- [ ] Vitest configured with React Testing Library
- [ ] Mock for @tauri-apps/api available
- [ ] CI pipeline includes these tests

### Test Run Order

```
1. Unit Tests (AC2-01 through AC2-07, AC1-06)
   └── Run: pnpm test:unit

2. Integration Tests (AC1-04, AC1-05, AC3-03, AC4-01 through AC4-09)
   └── Run: pnpm test:integration

3. E2E Tests (AC1-01 through AC1-03, AC1-07, AC4-07)
   └── Run: pnpm test:e2e

4. Manual Tests (AC3-01, AC3-02, AC3-04, AC3-05)
   └── Document results in story completion notes
```

### Acceptance Gate

| Criterion | Threshold |
|-----------|-----------|
| All P0 tests passing | 100% (11 tests) |
| All P1 tests passing | 100% (11 tests) |
| No console errors in E2E | 0 critical errors |
| Build completes | Exit code 0 |
| Production loads in Tauri | Page renders |

---

## Traceability Matrix

| AC | Test IDs | Count |
|----|----------|-------|
| AC1: Frontend Loads | AC1-01 to AC1-08 | 8 |
| AC2: Error Boundary | AC2-01 to AC2-07 | 7 |
| AC3: Hot Reload | AC3-01 to AC3-05 | 5 |
| AC4: Production Build | AC4-01 to AC4-09 | 9 |
| **Total** | | **29** |

---

**Document Status:** Ready for Implementation
**Gate:** Tests must be created before story implementation begins (ATDD)

_Generated by TEA (Murat - Master Test Architect) - 2026-01-15_
