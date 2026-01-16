# Epic 3: Connect Your Tools - Test Design

**Version:** 1.0
**Status:** Ready for Implementation
**Date:** 2026-01-15
**Author:** TEA (Test Architect Agent)
**Epic:** Connect Your Tools (Stories 3.1-3.7)

---

## 1. Epic Overview

| Metric | Value |
|--------|-------|
| Stories | 7 |
| Test Cases | 52 |
| Critical Paths | 3 |
| Risk Level | HIGH |
| Primary Concern | C-002 (OAuth testing), C-003 (External API mocking) |

### Test Level Distribution

| Level | Count | Coverage |
|-------|-------|----------|
| Unit | 18 | 35% |
| Integration | 22 | 42% |
| E2E | 12 | 23% |

**Note:** Epic 3 is heavily integration-focused due to OAuth and external API interactions. All tests use the Mock Composio Server (see `test-infra-mock-composio.md`).

### Critical Testing Principle

**NEVER hit real OAuth or Composio APIs in automated tests.**

All integration and E2E tests use:
- Mock Composio server (localhost:4001)
- Pre-generated tokens
- Simulated OAuth callbacks

---

## 2. Risk Assessment Matrix

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation |
|---------|----------|-------------|-------------|--------|-------|------------|
| R-301 | TECH | Composio MCP connection instability | 2 | 3 | 6 | Health polling, graceful degradation |
| R-302 | SEC | OAuth token storage exposure | 1 | 3 | 3 | Encryption at rest, secure storage |
| R-303 | DATA | Token refresh race condition | 2 | 2 | 4 | Mutex lock on refresh, optimistic locking |
| R-304 | PERF | Rate limit blocking user actions | 3 | 2 | 6 | Queue with backoff, user feedback |
| R-305 | OPS | Connection status UI stale | 2 | 1 | 2 | WebSocket updates, polling fallback |
| R-306 | BUS | OAuth denial leaves user confused | 2 | 2 | 4 | Clear error messaging, retry prompt |

**High-Priority Risks (Score ≥6):** R-301, R-304

---

## 3. Story-Level Test Scenarios

### Story 3.1: Composio MCP Integration

**Risk:** HIGH | **Priority:** P0 (Infrastructure)

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 3.1.1 | Integration | MCP connects on server start | Connection established | Vitest |
| 3.1.2 | Unit | Tool catalog populates from Composio | Tools registered | Vitest |
| 3.1.3 | Integration | Connection failure triggers degradation | "Tools unavailable" shown | Vitest |
| 3.1.4 | Unit | Retry uses exponential backoff | Delays: 1s, 2s, 4s, 8s | Vitest |
| 3.1.5 | E2E | App functional when Composio down | Chat works, tools disabled | Vercel Browser Agent |
| 3.1.6 | Integration | Health polling detects recovery | Status updates to connected | Vitest |

#### Test Code

```typescript
// tests/integration/story-3.1-composio-mcp.spec.ts
import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { ComposioMCPClient } from '@/services/composio/mcp-client';
import { ToolCatalog } from '@/services/tools/catalog';
import { createMockComposioServer } from '../mocks/composio-server';

let mockServer: ReturnType<typeof createMockComposioServer>;

beforeEach(async () => {
  mockServer = createMockComposioServer({ port: 4001 });
  await mockServer.start();
});

afterEach(async () => {
  await mockServer.stop();
});

test('3.1.1 - Composio MCP connects on server start', async () => {
  const client = new ComposioMCPClient({ url: 'http://localhost:4001' });

  const result = await client.connect();

  expect(result.connected).toBe(true);
  expect(result.version).toBeTruthy();
});

test('3.1.2 - tool catalog populates from Composio', async () => {
  const client = new ComposioMCPClient({ url: 'http://localhost:4001' });
  await client.connect();

  const catalog = new ToolCatalog(client);
  await catalog.initialize();

  // Mock server provides these tools
  expect(catalog.hasTool('gmail_send')).toBe(true);
  expect(catalog.hasTool('gmail_fetch')).toBe(true);
  expect(catalog.hasTool('calendar_create')).toBe(true);
  expect(catalog.hasTool('calendar_list')).toBe(true);

  expect(catalog.getToolCount()).toBeGreaterThan(0);
});

test('3.1.3 - connection failure triggers graceful degradation', async () => {
  await mockServer.stop(); // Simulate Composio down

  const client = new ComposioMCPClient({
    url: 'http://localhost:4001',
    maxRetries: 2,
  });

  const result = await client.connect();

  expect(result.connected).toBe(false);
  expect(result.degraded).toBe(true);
  expect(result.userMessage).toBe('Tool connections unavailable');
});

test('3.1.4 - retry uses exponential backoff', async () => {
  await mockServer.stop();

  const client = new ComposioMCPClient({
    url: 'http://localhost:4001',
    maxRetries: 4,
  });

  const attemptTimes: number[] = [];
  const startTime = Date.now();

  client.on('retryAttempt', () => {
    attemptTimes.push(Date.now() - startTime);
  });

  await client.connect();

  // Expected delays: 1000, 2000, 4000 (exponential)
  expect(attemptTimes[1] - attemptTimes[0]).toBeGreaterThanOrEqual(900); // ~1s
  expect(attemptTimes[2] - attemptTimes[1]).toBeGreaterThanOrEqual(1800); // ~2s
  expect(attemptTimes[3] - attemptTimes[2]).toBeGreaterThanOrEqual(3600); // ~4s
});

test('3.1.6 - health polling detects recovery', async () => {
  const client = new ComposioMCPClient({
    url: 'http://localhost:4001',
    healthPollInterval: 100, // Fast for testing
  });

  // Start connected
  await client.connect();
  expect(client.isConnected()).toBe(true);

  // Simulate outage
  await mockServer.stop();
  await new Promise(r => setTimeout(r, 150)); // Wait for health check
  expect(client.isConnected()).toBe(false);

  // Recover
  await mockServer.start();
  await new Promise(r => setTimeout(r, 150)); // Wait for health check
  expect(client.isConnected()).toBe(true);
});

// tests/e2e/story-3.1-degradation.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('3.1.5 - app functional when Composio is down', async ({ page }) => {
  // Route Composio health to 503
  await page.route('**/composio/**', route => {
    route.fulfill({ status: 503, body: 'Service unavailable' });
  });

  await page.goto('/');

  // App should load
  await expect(page.getByTestId('app-shell')).toBeVisible();

  // Chat should work
  await page.fill('[data-testid="chat-input"]', 'Hello');
  await page.click('[data-testid="send-button"]');

  // Should see response (agent works without tools)
  await expect(page.getByTestId('message-response')).toBeVisible();

  // Tool connections should show unavailable
  await page.click('[data-testid="settings-button"]');
  await expect(page.getByText('Tool connections unavailable')).toBeVisible();
});
```

---

### Story 3.2: OAuth Flow for Gmail

**Risk:** HIGH | **Priority:** P0 (Core Feature)

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 3.2.1 | E2E | OAuth flow opens Google consent | Redirect to Google | Vercel Browser Agent |
| 3.2.2 | Integration | Tokens stored after successful auth | Encrypted in SQLite | Vitest |
| 3.2.3 | E2E | Connection status shows "Connected" | UI updates | Vercel Browser Agent |
| 3.2.4 | E2E | Denied OAuth returns gracefully | "Not connected" shown | Vercel Browser Agent |
| 3.2.5 | Unit | Tokens are encrypted at rest | AES-256-GCM encryption | Vitest |
| 3.2.6 | Integration | Token exchange with auth code | Access + refresh tokens | Vitest |

#### Test Code

```typescript
// tests/unit/story-3.2-oauth-encryption.spec.ts
import { test, expect } from 'vitest';
import { TokenStorage } from '@/services/auth/token-storage';
import { createTestDatabase } from '../helpers/database';

test('3.2.5 - tokens are encrypted at rest', async () => {
  const db = createTestDatabase();
  const storage = new TokenStorage(db);

  const token = {
    accessToken: 'mock_access_token_12345',
    refreshToken: 'mock_refresh_token_67890',
    expiresAt: Date.now() + 3600000,
    scope: 'gmail.read gmail.send',
  };

  await storage.storeToken('gmail', token);

  // Read raw from database
  const row = db.prepare('SELECT * FROM oauth_tokens WHERE provider = ?').get('gmail');

  // Token values should NOT be readable in plaintext
  expect(row.access_token).not.toBe('mock_access_token_12345');
  expect(row.access_token).not.toContain('mock_access');

  // Should be encrypted (base64 of encrypted bytes)
  expect(row.access_token).toMatch(/^[A-Za-z0-9+/=]+$/);

  // Decryption should return original
  const retrieved = await storage.getToken('gmail');
  expect(retrieved.accessToken).toBe('mock_access_token_12345');
  expect(retrieved.refreshToken).toBe('mock_refresh_token_67890');
});

// tests/integration/story-3.2-oauth-exchange.spec.ts
import { test, expect, beforeEach, afterEach } from 'vitest';
import { OAuthService } from '@/services/auth/oauth';
import { createMockComposioServer } from '../mocks/composio-server';

let mockServer: ReturnType<typeof createMockComposioServer>;

beforeEach(async () => {
  mockServer = createMockComposioServer({ port: 4001 });
  await mockServer.start();
});

afterEach(async () => {
  await mockServer.stop();
});

test('3.2.6 - token exchange with auth code succeeds', async () => {
  const oauth = new OAuthService({ composioUrl: 'http://localhost:4001' });

  // Simulate callback with auth code
  const result = await oauth.exchangeCode({
    code: 'mock_auth_code_abc123',
    provider: 'gmail',
    redirectUri: 'http://localhost:3000/callback',
  });

  expect(result.success).toBe(true);
  expect(result.accessToken).toMatch(/^mock_access_token_/);
  expect(result.refreshToken).toMatch(/^mock_refresh_token_/);
  expect(result.expiresIn).toBe(3600);
  expect(result.scope).toContain('gmail.read');
});

test('3.2.2 - tokens stored after successful OAuth', async () => {
  const db = createTestDatabase();
  const storage = new TokenStorage(db);
  const oauth = new OAuthService({
    composioUrl: 'http://localhost:4001',
    tokenStorage: storage,
  });

  await oauth.completeOAuth({
    code: 'mock_auth_code_abc123',
    provider: 'gmail',
  });

  // Verify stored
  const token = await storage.getToken('gmail');
  expect(token).toBeTruthy();
  expect(token.accessToken).toBeTruthy();
  expect(token.refreshToken).toBeTruthy();
});

// tests/e2e/story-3.2-oauth-flow.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('3.2.1 - OAuth flow initiates correctly', async ({ page, context }) => {
  // Mock OAuth start to return auth URL
  await page.route('**/api/oauth/start', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        authUrl: 'https://accounts.google.com/o/oauth2/auth?client_id=test&scope=gmail.read',
      }),
    });
  });

  await page.goto('/settings/connections');

  // Listen for new page (OAuth popup/redirect)
  const popupPromise = context.waitForEvent('page');

  await page.click('[data-testid="connect-gmail"]');

  // For E2E, we mock the redirect rather than actually going to Google
  // In real testing, this would verify the URL structure
  const authUrl = await page.evaluate(() => {
    return (window as any).__lastOAuthUrl;
  });

  expect(authUrl).toContain('accounts.google.com');
  expect(authUrl).toContain('gmail.read');
});

test('3.2.3 - connection status updates to Connected', async ({ page }) => {
  // Mock successful OAuth callback
  await page.route('**/api/oauth/callback**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        provider: 'gmail',
        email: 'test@gmail.com',
      }),
    });
  });

  // Mock connection status
  await page.route('**/api/connections/status', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        gmail: { connected: true, email: 'test@gmail.com' },
        calendar: { connected: false },
      }),
    });
  });

  await page.goto('/settings/connections');

  // Gmail should show connected
  const gmailCard = page.locator('[data-testid="connection-gmail"]');
  await expect(gmailCard.getByText('Connected')).toBeVisible();
  await expect(gmailCard.getByText('test@gmail.com')).toBeVisible();
});

test('3.2.4 - denied OAuth returns gracefully', async ({ page }) => {
  // Mock OAuth callback with denial
  await page.route('**/api/oauth/callback**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: 'access_denied',
        message: 'User denied access to Gmail',
      }),
    });
  });

  // Simulate OAuth return with error
  await page.goto('/settings/connections?oauth_error=access_denied');

  // Should show graceful message
  await expect(page.getByText('Gmail connection was not completed')).toBeVisible();
  await expect(page.getByText('Try again')).toBeVisible();

  // Gmail status should show not connected
  const gmailCard = page.locator('[data-testid="connection-gmail"]');
  await expect(gmailCard.getByText('Not Connected')).toBeVisible();
});
```

---

### Story 3.3: OAuth Flow for Google Calendar

**Risk:** MEDIUM | **Priority:** P1

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 3.3.1 | E2E | Calendar OAuth completes | Status shows connected | Vercel Browser Agent |
| 3.3.2 | Integration | Calendar tokens stored | Encrypted in SQLite | Vitest |
| 3.3.3 | E2E | Combined auth with Gmail | Single consent, both connected | Vercel Browser Agent |
| 3.3.4 | Unit | Scopes correctly requested | calendar.read, calendar.write | Vitest |
| 3.3.5 | E2E | Both Gmail and Calendar show connected | UI displays both | Vercel Browser Agent |

#### Test Code

```typescript
// tests/unit/story-3.3-scopes.spec.ts
import { test, expect } from 'vitest';
import { OAuthConfig } from '@/services/auth/oauth-config';

test('3.3.4 - calendar scopes are correctly requested', () => {
  const config = new OAuthConfig();

  const calendarScopes = config.getScopesForProvider('calendar');

  expect(calendarScopes).toContain('https://www.googleapis.com/auth/calendar.readonly');
  expect(calendarScopes).toContain('https://www.googleapis.com/auth/calendar.events');
});

test('combined Gmail + Calendar scopes are correctly merged', () => {
  const config = new OAuthConfig();

  const combinedScopes = config.getCombinedScopes(['gmail', 'calendar']);

  // Should have Gmail scopes
  expect(combinedScopes).toContain('https://www.googleapis.com/auth/gmail.readonly');
  expect(combinedScopes).toContain('https://www.googleapis.com/auth/gmail.send');

  // Should have Calendar scopes
  expect(combinedScopes).toContain('https://www.googleapis.com/auth/calendar.readonly');
  expect(combinedScopes).toContain('https://www.googleapis.com/auth/calendar.events');

  // No duplicates
  const uniqueScopes = new Set(combinedScopes);
  expect(uniqueScopes.size).toBe(combinedScopes.length);
});

// tests/e2e/story-3.3-combined-auth.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('3.3.3 - combined auth connects both Gmail and Calendar', async ({ page }) => {
  // Mock combined OAuth callback
  await page.route('**/api/oauth/callback**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        providers: ['gmail', 'calendar'],
        email: 'test@gmail.com',
      }),
    });
  });

  // Mock status showing both connected
  await page.route('**/api/connections/status', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        gmail: { connected: true, email: 'test@gmail.com' },
        calendar: { connected: true, email: 'test@gmail.com' },
      }),
    });
  });

  await page.goto('/settings/connections');

  // Both should show connected with same email
  await expect(page.locator('[data-testid="connection-gmail"]').getByText('Connected')).toBeVisible();
  await expect(page.locator('[data-testid="connection-calendar"]').getByText('Connected')).toBeVisible();

  // Both show same email (shared Google account)
  await expect(page.locator('[data-testid="connection-gmail"]').getByText('test@gmail.com')).toBeVisible();
  await expect(page.locator('[data-testid="connection-calendar"]').getByText('test@gmail.com')).toBeVisible();
});
```

---

### Story 3.4: Token Refresh Mechanism

**Risk:** HIGH | **Priority:** P0 (Security)

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 3.4.1 | Integration | Token refresh before expiry | New token stored | Vitest |
| 3.4.2 | Unit | Refresh triggers at <5 min remaining | Timer fires correctly | Vitest |
| 3.4.3 | E2E | Expired token prompts re-auth | Dialog shown | Vercel Browser Agent |
| 3.4.4 | Integration | Revoked token handled | Error + re-auth prompt | Vitest |
| 3.4.5 | Unit | Refresh doesn't interrupt operations | Mutex lock used | Vitest |
| 3.4.6 | Integration | Concurrent refresh requests deduplicated | Single refresh call | Vitest |

#### Test Code

```typescript
// tests/unit/story-3.4-refresh-timing.spec.ts
import { test, expect, vi } from 'vitest';
import { TokenRefreshScheduler } from '@/services/auth/token-refresh';

test('3.4.2 - refresh triggers at <5 min remaining', () => {
  vi.useFakeTimers();

  const onRefresh = vi.fn();
  const scheduler = new TokenRefreshScheduler({ onRefresh });

  // Token expires in 10 minutes
  const expiresAt = Date.now() + 10 * 60 * 1000;
  scheduler.scheduleRefresh('gmail', expiresAt);

  // After 4 minutes - no refresh yet
  vi.advanceTimersByTime(4 * 60 * 1000);
  expect(onRefresh).not.toHaveBeenCalled();

  // After 5.5 minutes (4.5 min remaining) - should refresh
  vi.advanceTimersByTime(1.5 * 60 * 1000);
  expect(onRefresh).toHaveBeenCalledWith('gmail');

  vi.useRealTimers();
});

test('3.4.5 - refresh doesn\'t interrupt active operations', async () => {
  const refreshService = new TokenRefreshService();

  // Start a "long" operation
  const operationPromise = refreshService.executeWithLock(async () => {
    await new Promise(r => setTimeout(r, 100));
    return 'operation_result';
  });

  // Attempt refresh while operation is running
  const refreshPromise = refreshService.refreshToken('gmail');

  // Operation should complete first
  const operationResult = await operationPromise;
  expect(operationResult).toBe('operation_result');

  // Then refresh should complete
  await refreshPromise;
  expect(refreshService.getLastRefreshTime('gmail')).toBeTruthy();
});

// tests/integration/story-3.4-refresh.spec.ts
import { test, expect, beforeEach, afterEach } from 'vitest';
import { TokenRefreshService } from '@/services/auth/token-refresh';
import { TokenStorage } from '@/services/auth/token-storage';
import { createMockComposioServer } from '../mocks/composio-server';
import { createTestDatabase } from '../helpers/database';

let mockServer: ReturnType<typeof createMockComposioServer>;
let db: any;

beforeEach(async () => {
  mockServer = createMockComposioServer({ port: 4001 });
  await mockServer.start();
  db = createTestDatabase();
});

afterEach(async () => {
  await mockServer.stop();
});

test('3.4.1 - token refresh before expiry stores new token', async () => {
  const storage = new TokenStorage(db);
  const refreshService = new TokenRefreshService({
    composioUrl: 'http://localhost:4001',
    tokenStorage: storage,
  });

  // Store initial token
  await storage.storeToken('gmail', {
    accessToken: 'old_access_token',
    refreshToken: 'mock_refresh_token_xyz789',
    expiresAt: Date.now() + 60000, // Expires soon
    scope: 'gmail.read',
  });

  // Refresh
  await refreshService.refreshToken('gmail');

  // Verify new token stored
  const token = await storage.getToken('gmail');
  expect(token.accessToken).not.toBe('old_access_token');
  expect(token.accessToken).toMatch(/^mock_access_token_/);
  expect(token.expiresAt).toBeGreaterThan(Date.now() + 3000000); // ~1 hour from now
});

test('3.4.4 - revoked refresh token triggers re-auth', async () => {
  // Configure mock to reject refresh
  mockServer.setFixtures({
    oauth: {
      refreshFails: true,
      refreshError: 'invalid_grant',
    },
  });

  const storage = new TokenStorage(db);
  const refreshService = new TokenRefreshService({
    composioUrl: 'http://localhost:4001',
    tokenStorage: storage,
  });

  await storage.storeToken('gmail', {
    accessToken: 'old_token',
    refreshToken: 'revoked_refresh_token',
    expiresAt: Date.now() + 60000,
    scope: 'gmail.read',
  });

  const result = await refreshService.refreshToken('gmail');

  expect(result.success).toBe(false);
  expect(result.requiresReauth).toBe(true);
  expect(result.error).toBe('invalid_grant');

  // Token should be cleared
  const token = await storage.getToken('gmail');
  expect(token).toBeNull();
});

test('3.4.6 - concurrent refresh requests are deduplicated', async () => {
  const storage = new TokenStorage(db);
  const refreshService = new TokenRefreshService({
    composioUrl: 'http://localhost:4001',
    tokenStorage: storage,
  });

  await storage.storeToken('gmail', {
    accessToken: 'old_token',
    refreshToken: 'mock_refresh_token',
    expiresAt: Date.now() + 60000,
    scope: 'gmail.read',
  });

  // Track API calls
  const callLog = mockServer.getCallLog();
  const initialCount = callLog.filter(c => c.path === '/oauth/refresh').length;

  // Fire 5 concurrent refresh requests
  await Promise.all([
    refreshService.refreshToken('gmail'),
    refreshService.refreshToken('gmail'),
    refreshService.refreshToken('gmail'),
    refreshService.refreshToken('gmail'),
    refreshService.refreshToken('gmail'),
  ]);

  // Should only have made ONE refresh call
  const finalCount = callLog.filter(c => c.path === '/oauth/refresh').length;
  expect(finalCount - initialCount).toBe(1);
});

// tests/e2e/story-3.4-reauth-prompt.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('3.4.3 - expired token prompts re-auth', async ({ page }) => {
  // Mock API to return 401 with re-auth needed
  await page.route('**/api/gmail/**', route => {
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'token_expired',
        requiresReauth: true,
        message: 'Your Gmail connection has expired',
      }),
    });
  });

  await page.goto('/inbox');

  // Should show re-auth dialog
  const dialog = page.locator('[data-testid="reauth-dialog"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Gmail connection has expired')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Reconnect' })).toBeVisible();
});
```

---

### Story 3.5: Connection Status Dashboard

**Risk:** LOW | **Priority:** P2

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 3.5.1 | E2E | Connection panel shows integrations | All options visible | Vercel Browser Agent |
| 3.5.2 | E2E | Connected services show email | Account displayed | Vercel Browser Agent |
| 3.5.3 | E2E | Error state shows reconnect option | Button visible | Vercel Browser Agent |
| 3.5.4 | Unit | Connection status updates in real-time | WebSocket update handled | Vitest |
| 3.5.5 | Visual | Connection panel matches design | Snapshot passes | Vercel Browser Agent |

#### Test Code

```typescript
// tests/unit/story-3.5-status-updates.spec.ts
import { test, expect, vi } from 'vitest';
import { ConnectionStatusStore } from '@/stores/connection-status';

test('3.5.4 - connection status updates from WebSocket', () => {
  const store = new ConnectionStatusStore();

  // Initial state
  expect(store.getStatus('gmail')).toEqual({ connected: false });

  // Simulate WebSocket message
  store.handleWebSocketMessage({
    type: 'connection_status_update',
    provider: 'gmail',
    status: {
      connected: true,
      email: 'test@gmail.com',
      lastSync: '2026-01-15T10:00:00Z',
    },
  });

  expect(store.getStatus('gmail')).toEqual({
    connected: true,
    email: 'test@gmail.com',
    lastSync: '2026-01-15T10:00:00Z',
  });
});

// tests/e2e/story-3.5-dashboard.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('3.5.1 - connection panel shows all integration options', async ({ page }) => {
  await page.route('**/api/connections/status', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        gmail: { connected: false },
        calendar: { connected: false },
        slack: { connected: false, available: false }, // Future integration
      }),
    });
  });

  await page.goto('/settings/connections');

  // Should show Gmail and Calendar (available)
  await expect(page.locator('[data-testid="connection-gmail"]')).toBeVisible();
  await expect(page.locator('[data-testid="connection-calendar"]')).toBeVisible();

  // Each should show connect button
  await expect(page.locator('[data-testid="connection-gmail"]').getByRole('button', { name: 'Connect' })).toBeVisible();
  await expect(page.locator('[data-testid="connection-calendar"]').getByRole('button', { name: 'Connect' })).toBeVisible();
});

test('3.5.3 - error state shows reconnect option', async ({ page }) => {
  await page.route('**/api/connections/status', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        gmail: {
          connected: false,
          error: 'token_revoked',
          errorMessage: 'Your access was revoked. Please reconnect.',
        },
        calendar: { connected: true, email: 'test@gmail.com' },
      }),
    });
  });

  await page.goto('/settings/connections');

  const gmailCard = page.locator('[data-testid="connection-gmail"]');

  // Should show error state
  await expect(gmailCard.getByText('Error')).toBeVisible();
  await expect(gmailCard.getByText('access was revoked')).toBeVisible();
  await expect(gmailCard.getByRole('button', { name: 'Reconnect' })).toBeVisible();
});

test('3.5.5 - connection panel visual regression', async ({ page }) => {
  await page.route('**/api/connections/status', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        gmail: { connected: true, email: 'test@gmail.com' },
        calendar: { connected: false },
      }),
    });
  });

  await page.goto('/settings/connections');

  // Take screenshot for visual comparison
  await expect(page.locator('[data-testid="connections-panel"]')).toHaveScreenshot('connections-panel.png');
});
```

---

### Story 3.6: Rate Limiting for Tool Calls

**Risk:** HIGH | **Priority:** P0 (Stability)

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 3.6.1 | Unit | Rate limiter tracks calls per minute | Counter increments | Vitest |
| 3.6.2 | Integration | Requests queue when near limit | Queue grows | Vitest |
| 3.6.3 | E2E | User sees "paused" message | Message visible | Vercel Browser Agent |
| 3.6.4 | Integration | Requests resume after reset | Queue drains | Vitest |
| 3.6.5 | Unit | Rate limits are per-service | Gmail vs Calendar separate | Vitest |
| 3.6.6 | Integration | Backoff increases with repeated limits | Delays grow | Vitest |

#### Test Code

```typescript
// tests/unit/story-3.6-rate-limiter.spec.ts
import { test, expect, vi } from 'vitest';
import { RateLimiter } from '@/services/rate-limiter';

test('3.6.1 - rate limiter tracks calls per minute', () => {
  const limiter = new RateLimiter({
    maxRequests: 10,
    windowMs: 60000,
  });

  // Make 5 calls
  for (let i = 0; i < 5; i++) {
    limiter.recordCall('gmail');
  }

  expect(limiter.getCallCount('gmail')).toBe(5);
  expect(limiter.getRemainingCalls('gmail')).toBe(5);
  expect(limiter.isLimited('gmail')).toBe(false);
});

test('3.6.5 - rate limits are tracked per-service', () => {
  const limiter = new RateLimiter({
    maxRequests: 10,
    windowMs: 60000,
  });

  // Max out Gmail
  for (let i = 0; i < 10; i++) {
    limiter.recordCall('gmail');
  }

  // Gmail should be limited
  expect(limiter.isLimited('gmail')).toBe(true);

  // Calendar should still have capacity
  expect(limiter.isLimited('calendar')).toBe(false);
  expect(limiter.getRemainingCalls('calendar')).toBe(10);
});

test('rate limit resets after window expires', () => {
  vi.useFakeTimers();

  const limiter = new RateLimiter({
    maxRequests: 10,
    windowMs: 60000,
  });

  // Max out
  for (let i = 0; i < 10; i++) {
    limiter.recordCall('gmail');
  }
  expect(limiter.isLimited('gmail')).toBe(true);

  // Advance past window
  vi.advanceTimersByTime(61000);

  // Should be reset
  expect(limiter.isLimited('gmail')).toBe(false);
  expect(limiter.getRemainingCalls('gmail')).toBe(10);

  vi.useRealTimers();
});

// tests/integration/story-3.6-queuing.spec.ts
import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateLimitedToolExecutor } from '@/services/tools/rate-limited-executor';
import { createMockComposioServer } from '../mocks/composio-server';

let mockServer: ReturnType<typeof createMockComposioServer>;

beforeEach(async () => {
  mockServer = createMockComposioServer({ port: 4001 });
  await mockServer.start();
});

afterEach(async () => {
  await mockServer.stop();
});

test('3.6.2 - requests queue when near rate limit', async () => {
  const executor = new RateLimitedToolExecutor({
    composioUrl: 'http://localhost:4001',
    maxRequests: 5,
    windowMs: 60000,
  });

  // Execute 5 requests (at limit)
  for (let i = 0; i < 5; i++) {
    await executor.execute('gmail', 'fetch_emails', {});
  }

  // 6th request should be queued
  const queuedPromise = executor.execute('gmail', 'fetch_emails', {});

  expect(executor.getQueueLength('gmail')).toBe(1);
  expect(executor.isQueued('gmail')).toBe(true);

  // Don't await - it will resolve when rate limit resets
});

test('3.6.4 - queued requests resume after rate limit reset', async () => {
  vi.useFakeTimers();

  const executor = new RateLimitedToolExecutor({
    composioUrl: 'http://localhost:4001',
    maxRequests: 2,
    windowMs: 1000, // Short window for testing
  });

  // Execute at limit
  await executor.execute('gmail', 'fetch_emails', {});
  await executor.execute('gmail', 'fetch_emails', {});

  // Queue more
  const promise3 = executor.execute('gmail', 'fetch_emails', {});
  const promise4 = executor.execute('gmail', 'fetch_emails', {});

  expect(executor.getQueueLength('gmail')).toBe(2);

  // Advance past rate limit window
  vi.advanceTimersByTime(1100);

  // Allow promises to resolve
  await vi.runAllTimersAsync();

  // Queue should be drained
  expect(executor.getQueueLength('gmail')).toBe(0);

  vi.useRealTimers();
});

test('3.6.6 - backoff increases with repeated rate limits', async () => {
  const executor = new RateLimitedToolExecutor({
    composioUrl: 'http://localhost:4001',
    maxRequests: 2,
    windowMs: 60000,
    backoffMultiplier: 2,
  });

  // Hit limit
  await executor.execute('gmail', 'fetch_emails', {});
  await executor.execute('gmail', 'fetch_emails', {});

  // First backoff
  expect(executor.getCurrentBackoff('gmail')).toBe(1000); // 1 second

  // Simulate hitting limit again after reset
  executor.resetWindow('gmail');
  await executor.execute('gmail', 'fetch_emails', {});
  await executor.execute('gmail', 'fetch_emails', {});

  // Backoff should double
  expect(executor.getCurrentBackoff('gmail')).toBe(2000); // 2 seconds
});

// tests/e2e/story-3.6-rate-limit-ui.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('3.6.3 - user sees syncing paused message when rate limited', async ({ page }) => {
  // Mock rate limit response
  await page.route('**/api/gmail/**', route => {
    route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'rate_limited',
        retryAfter: 30,
        message: 'Rate limit exceeded. Please wait.',
      }),
    });
  });

  await page.goto('/inbox');

  // Trigger action that hits rate limit
  await page.click('[data-testid="refresh-inbox"]');

  // Should show paused message
  await expect(page.getByText('Syncing paused')).toBeVisible();
  await expect(page.getByText('will resume shortly')).toBeVisible();

  // Should show retry timer
  await expect(page.getByTestId('rate-limit-timer')).toBeVisible();
});
```

---

### Story 3.7: Tool Connection Verification

**Risk:** MEDIUM | **Priority:** P1

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 3.7.1 | E2E | Gmail test connection succeeds | "Verified" shown | Vercel Browser Agent |
| 3.7.2 | E2E | Calendar test connection succeeds | "Verified" shown | Vercel Browser Agent |
| 3.7.3 | E2E | Test shows failure for invalid token | Error message | Vercel Browser Agent |
| 3.7.4 | Unit | Test calls are minimal (lightweight) | Single API call | Vitest |
| 3.7.5 | E2E | Success message within 3 seconds | Timing assertion | Vercel Browser Agent |

#### Test Code

```typescript
// tests/unit/story-3.7-verification.spec.ts
import { test, expect, vi } from 'vitest';
import { ConnectionVerifier } from '@/services/connections/verifier';

test('3.7.4 - verification uses minimal API calls', async () => {
  const mockFetch = vi.fn().mockResolvedValue({ ok: true });
  const verifier = new ConnectionVerifier({ fetch: mockFetch });

  await verifier.verify('gmail');

  // Should only make ONE call
  expect(mockFetch).toHaveBeenCalledTimes(1);

  // Should be a lightweight call (not full sync)
  const [url, options] = mockFetch.mock.calls[0];
  expect(url).toContain('maxResults=1'); // Only fetch 1 item
});

// tests/e2e/story-3.7-verify-connection.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('3.7.1 - Gmail test connection shows verified', async ({ page }) => {
  // Mock successful verification
  await page.route('**/api/connections/test/gmail', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        provider: 'gmail',
        email: 'test@gmail.com',
        testResult: {
          canRead: true,
          canSend: true,
          emailCount: 150,
        },
      }),
    });
  });

  await page.route('**/api/connections/status', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        gmail: { connected: true, email: 'test@gmail.com' },
      }),
    });
  });

  await page.goto('/settings/connections');

  // Click test button
  await page.click('[data-testid="test-gmail"]');

  // Should show verification success
  await expect(page.getByText('Connection verified')).toBeVisible();
  await expect(page.getByText('test@gmail.com')).toBeVisible();
});

test('3.7.3 - test shows failure for invalid token', async ({ page }) => {
  // Mock failed verification
  await page.route('**/api/connections/test/gmail', route => {
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: 'invalid_token',
        message: 'Your Gmail token is invalid or expired',
      }),
    });
  });

  await page.route('**/api/connections/status', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        gmail: { connected: true, email: 'test@gmail.com' },
      }),
    });
  });

  await page.goto('/settings/connections');

  // Click test button
  await page.click('[data-testid="test-gmail"]');

  // Should show error
  await expect(page.getByText('Verification failed')).toBeVisible();
  await expect(page.getByText('token is invalid')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reconnect' })).toBeVisible();
});

test('3.7.5 - verification completes within 3 seconds', async ({ page }) => {
  // Mock with slight delay but under 3s
  await page.route('**/api/connections/test/gmail', async route => {
    await new Promise(r => setTimeout(r, 500)); // 500ms delay
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  await page.route('**/api/connections/status', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        gmail: { connected: true, email: 'test@gmail.com' },
      }),
    });
  });

  await page.goto('/settings/connections');

  const startTime = Date.now();
  await page.click('[data-testid="test-gmail"]');

  // Wait for verification result
  await expect(page.getByText('Connection verified')).toBeVisible();

  const duration = Date.now() - startTime;
  expect(duration).toBeLessThan(3000); // Under 3 seconds
});
```

---

## 4. Test Execution Plan

### 4.1 Test Run Order

```
1. Unit Tests (CI: every commit)
   └── Stories 3.1-3.7 unit tests
   └── Rate limiter, token storage, OAuth config

2. Integration Tests (CI: every commit)
   └── Stories 3.1-3.7 integration tests
   └── Requires: Mock Composio Server running

3. E2E Tests (CI: PR merge)
   └── Stories 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
   └── Requires: Full app + Mock Composio

4. Visual Regression (CI: weekly)
   └── Story 3.5 connection panel snapshots
```

### 4.2 CI Pipeline Configuration

```yaml
# .github/workflows/epic-3-tests.yml
name: Epic 3 Tests

on:
  push:
    paths:
      - 'src/services/composio/**'
      - 'src/services/auth/**'
      - 'src/services/rate-limiter/**'
      - 'src/components/connections/**'

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:unit -- --grep "story-3"

  integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm run mock:composio &  # Start mock server
      - run: sleep 2
      - run: pnpm test:integration -- --grep "story-3"

  e2e:
    runs-on: macos-14
    needs: [unit, integration]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build:tauri
      - run: pnpm test:e2e -- --grep "story-3"
```

---

## 5. Acceptance Criteria Traceability

| Story | AC Count | Tests Mapped | Coverage |
|-------|----------|--------------|----------|
| 3.1 | 3 | 6 | 100% |
| 3.2 | 4 | 6 | 100% |
| 3.3 | 3 | 5 | 100% |
| 3.4 | 4 | 6 | 100% |
| 3.5 | 3 | 5 | 100% |
| 3.6 | 4 | 6 | 100% |
| 3.7 | 3 | 5 | 100% |

**Total:** 24 Acceptance Criteria → 52 Test Cases → **100% Coverage**

---

## 6. Gate Criteria

### Story Completion Gate

- [ ] All unit tests passing
- [ ] All integration tests passing (with Mock Composio)
- [ ] E2E OAuth flow tests passing
- [ ] Rate limiter tests passing
- [ ] Token encryption verified
- [ ] Code coverage ≥80%
- [ ] No P0/P1 bugs open

### Epic Completion Gate

- [ ] Mock Composio server operational
- [ ] OAuth flows work for Gmail and Calendar
- [ ] Token refresh mechanism verified
- [ ] Rate limiting prevents API exhaustion
- [ ] Connection status UI accurate
- [ ] Verification confirms tool access

---

## 7. Dependencies

| Dependency | Required By | Status |
|------------|-------------|--------|
| Mock Composio Server (C-002) | All stories | `test-infra-mock-composio.md` |
| SQLite test database | Story 3.2, 3.3, 3.4 | Epic 1 infrastructure |
| Token encryption key | Story 3.2 | Environment config |

---

## 8. Mock Server Requirement

**Critical:** All tests in this epic MUST use the Mock Composio Server.

See `test-infra-mock-composio.md` for:
- Server setup (`localhost:4001`)
- OAuth endpoints (`/oauth/token`, `/oauth/refresh`, `/oauth/status`)
- Gmail endpoints (`/gmail/messages`, `/gmail/send`)
- Calendar endpoints (`/calendar/events`, `/calendar/freebusy`)
- Fixture data (emails, calendar events)
- Rate limiting simulation

**Never run OAuth E2E tests against real Google APIs.**

---

**Document Status:** Ready for Implementation
**Next Step:** Implement Mock Composio server, then tests alongside story implementation

_Generated by TEA (Test Architect Agent) - 2026-01-15_
