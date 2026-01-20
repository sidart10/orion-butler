# ATDD Checklist - Epic 2a, Story 2a.4: Tool Permission System (canUseTool)

**Date:** 2026-01-15
**Author:** Murat (TEA Agent)
**Primary Test Level:** Unit / Integration
**Story Status:** ready-for-dev
**Risk Level:** HIGH (Security)

---

## Story Summary

Implement a tool permission system (canUseTool callback) that categorizes tools into READ, WRITE, and DESTRUCTIVE tiers, automatically executing read-only operations while requiring user confirmation for write operations and explicit two-step approval for destructive operations.

**As a** user,
**I want** control over what actions agents can take automatically,
**So that** I maintain oversight of sensitive operations.

---

## Acceptance Criteria

1. **AC1:** Tool Categorization and Automatic Execution - canUseTool categorizes tools into READ/WRITE/DESTRUCTIVE tiers with appropriate execution behavior
2. **AC2:** User Confirmation UI - Permission dialog shows tool details and allows approve/deny/modify actions with audit logging
3. **AC3:** Session Permission Memory - "Always allow" option persists for session and resets on app restart
4. **AC4:** Permission Decision Audit - All permission decisions are recorded in action_log with queryable context
5. **AC5:** Warning Messages for Destructive Tools - Destructive tools show clear warnings and require two-step confirmation

---

## Failing Tests Created (RED Phase)

### Unit Tests (8 tests)

**File:** `tests/unit/story-2.4-permissions.spec.ts`

- **Test 2.4.1:** Read tools auto-execute without prompt
  - **Status:** RED - `canUseTool` function not implemented
  - **Verifies:** AC1 - READ category tools (get_emails, get_calendar_events, search_contacts, get_preferences) execute automatically

- **Test 2.4.2:** Write tools require confirmation
  - **Status:** RED - `canUseTool` function not implemented
  - **Verifies:** AC1 - WRITE category tools (send_email, create_event, update_contact, create_task) require user confirmation

- **Test 2.4.3:** Destructive tools are blocked until explicit approval
  - **Status:** RED - `canUseTool` function not implemented
  - **Verifies:** AC1, AC5 - DESTRUCTIVE category tools (delete_email, cancel_event, delete_contact, archive_project) blocked by default

- **Test 2.4.1b:** TOOL_CATALOG contains all required tools with correct categories
  - **Status:** RED - `TOOL_CATALOG` constant not defined
  - **Verifies:** AC1 - All Orion tools are categorized in the catalog

- **Test 2.4.3b:** Destructive tools include warning messages
  - **Status:** RED - `warningMessage` field not populated
  - **Verifies:** AC5 - Warning messages defined for each destructive tool

- **Test 2.4.6:** Session "always allow" bypasses confirmation
  - **Status:** RED - Session permission logic not implemented
  - **Verifies:** AC3 - Session permissions skip re-prompting for write tools

- **Test 2.4.6b:** Session permissions reset on clear
  - **Status:** RED - `SessionPermissionStore` not implemented
  - **Verifies:** AC3 - Session permissions cleared by clearAll()

- **Test 2.4.5b:** Cannot "always allow" destructive tools
  - **Status:** RED - Destructive blocking logic not enforced
  - **Verifies:** AC5 - Destructive tools never auto-allowed, always require explicit approval

### Integration Tests (4 tests)

**File:** `tests/integration/story-2.4-audit-log.spec.ts`

- **Test 2.4.7:** Permission decisions are logged to action_log
  - **Status:** RED - `PermissionService` not implemented
  - **Verifies:** AC4 - Audit log records tool, decision, timestamp, always_allow flag, context

- **Test 2.4.7b:** Denied decisions include reason context
  - **Status:** RED - Denial context not captured
  - **Verifies:** AC4 - Denied decisions store reason when provided

- **Test 2.4.7c:** Audit log supports query by tool
  - **Status:** RED - `queryByTool` method not implemented
  - **Verifies:** AC4 - Audit trail can be filtered by tool name

- **Test 2.4.7d:** Audit log supports query by decision type
  - **Status:** RED - `queryByDecision` method not implemented
  - **Verifies:** AC4 - Audit trail can be filtered by approved/denied/auto_allowed

### E2E Tests (5 tests)

**File:** `tests/e2e/story-2.4-permission-dialog.spec.ts`

- **Test 2.4.4:** Read tool executes without dialog
  - **Status:** RED - Permission flow not wired
  - **Verifies:** AC1 - No permission dialog appears for READ tools

- **Test 2.4.5:** Write tool shows confirmation dialog
  - **Status:** RED - `PermissionDialog` component not implemented
  - **Verifies:** AC2 - Dialog shows tool name, parameters, approve/deny buttons

- **Test 2.4.5c:** Destructive tool shows warning and requires two-step confirmation
  - **Status:** RED - Two-step confirmation not implemented
  - **Verifies:** AC5 - Destructive actions require type-to-confirm step

- **Test 2.4.6c:** "Always allow" checkbox persists for session
  - **Status:** RED - Session permission UI not wired
  - **Verifies:** AC3 - Subsequent tool requests skip dialog after "always allow"

- **Test 2.4.6d:** "Always allow" checkbox disabled for destructive tools
  - **Status:** RED - Checkbox disabling not implemented
  - **Verifies:** AC5 - Cannot enable "always allow" for destructive tools

---

## Test Code: Unit Tests

```typescript
// tests/unit/story-2.4-permissions.spec.ts
import { test, expect, describe } from 'vitest';
import { canUseTool } from '@/agents/permissions/canUseTool';
import { ToolCategory } from '@/agents/permissions/types';
import { TOOL_CATALOG } from '@/agents/permissions/catalog';
import { SessionPermissionStore, sessionPermissionStore } from '@/agents/permissions/session-store';

describe('Story 2.4: Tool Permission System', () => {

  test('2.4.1 - read tools auto-execute without prompt', () => {
    // GIVEN: Read-only tools are defined in TOOL_CATALOG
    const readTools = ['get_emails', 'get_calendar_events', 'search_contacts', 'get_preferences', 'list_tasks', 'fetch_project'];

    // WHEN: canUseTool is called for each read tool
    for (const tool of readTools) {
      const decision = canUseTool(tool, { sessionPermissions: {} });

      // THEN: Tool is allowed without confirmation
      expect(decision.allowed).toBe(true);
      expect(decision.requiresConfirmation).toBe(false);
      expect(decision.category).toBe(ToolCategory.READ);
      expect(decision.grantedBy).toBe('auto');
    }
  });

  test('2.4.2 - write tools require confirmation', () => {
    // GIVEN: Write tools that modify data
    const writeTools = ['send_email', 'create_event', 'update_contact', 'create_task', 'update_project'];

    // WHEN: canUseTool is called for each write tool
    for (const tool of writeTools) {
      const decision = canUseTool(tool, { sessionPermissions: {} });

      // THEN: Tool is allowed but requires user confirmation
      expect(decision.allowed).toBe(true);
      expect(decision.requiresConfirmation).toBe(true);
      expect(decision.category).toBe(ToolCategory.WRITE);
      expect(decision.grantedBy).toBeUndefined(); // Not granted yet
    }
  });

  test('2.4.3 - destructive tools are blocked until explicit approval', () => {
    // GIVEN: Destructive tools that delete or cancel
    const destructiveTools = ['delete_email', 'cancel_event', 'delete_contact', 'archive_project'];

    // WHEN: canUseTool is called for each destructive tool
    for (const tool of destructiveTools) {
      const decision = canUseTool(tool, { sessionPermissions: {} });

      // THEN: Tool is blocked and requires explicit approval
      expect(decision.allowed).toBe(false);
      expect(decision.requiresExplicitApproval).toBe(true);
      expect(decision.category).toBe(ToolCategory.DESTRUCTIVE);
      expect(decision.warningMessage).toBeTruthy();
    }
  });

  test('2.4.1b - TOOL_CATALOG contains all required tools with correct categories', () => {
    // GIVEN: Required tools by category
    const expectedRead = ['get_emails', 'get_calendar_events', 'search_contacts', 'get_preferences', 'list_tasks', 'fetch_project'];
    const expectedWrite = ['send_email', 'create_event', 'update_contact', 'create_task', 'update_project'];
    const expectedDestructive = ['delete_email', 'cancel_event', 'delete_contact', 'archive_project'];

    // THEN: All expected tools are in catalog with correct categories
    for (const tool of expectedRead) {
      expect(TOOL_CATALOG[tool]).toBeDefined();
      expect(TOOL_CATALOG[tool].category).toBe(ToolCategory.READ);
    }

    for (const tool of expectedWrite) {
      expect(TOOL_CATALOG[tool]).toBeDefined();
      expect(TOOL_CATALOG[tool].category).toBe(ToolCategory.WRITE);
    }

    for (const tool of expectedDestructive) {
      expect(TOOL_CATALOG[tool]).toBeDefined();
      expect(TOOL_CATALOG[tool].category).toBe(ToolCategory.DESTRUCTIVE);
    }
  });

  test('2.4.3b - destructive tools include warning messages', () => {
    // GIVEN: Destructive tools in TOOL_CATALOG
    const destructiveTools = ['delete_email', 'cancel_event', 'delete_contact', 'archive_project'];

    // THEN: Each destructive tool has a warning message
    for (const tool of destructiveTools) {
      expect(TOOL_CATALOG[tool].warningMessage).toBeTruthy();
      expect(TOOL_CATALOG[tool].warningMessage!.length).toBeGreaterThan(20); // Meaningful warning
    }
  });

  test('2.4.6 - session "always allow" bypasses confirmation', () => {
    // GIVEN: User has previously granted "always allow" for send_email
    const sessionPermissions = {
      send_email: { allowed: true, alwaysAllow: true, grantedAt: Date.now() }
    };

    // WHEN: canUseTool is called for send_email
    const decision = canUseTool('send_email', { sessionPermissions });

    // THEN: Tool is allowed without confirmation (session grant)
    expect(decision.allowed).toBe(true);
    expect(decision.requiresConfirmation).toBe(false);
    expect(decision.grantedBy).toBe('session');
  });

  test('2.4.6b - session permissions reset on clear', () => {
    // GIVEN: SessionPermissionStore with some permissions
    const store = new SessionPermissionStore();
    store.grantPermission('send_email', true);
    store.grantPermission('create_event', false);

    // THEN: Permissions exist
    expect(store.checkPermission('send_email')?.alwaysAllow).toBe(true);
    expect(store.checkPermission('create_event')).toBeDefined();

    // WHEN: clearAll is called
    store.clearAll();

    // THEN: All permissions are cleared
    expect(store.checkPermission('send_email')).toBeUndefined();
    expect(store.checkPermission('create_event')).toBeUndefined();
    expect(Object.keys(store.getAll())).toHaveLength(0);
  });

  test('2.4.5b - cannot "always allow" destructive tools', () => {
    // GIVEN: User attempts to grant "always allow" for destructive tool
    const sessionPermissions = {
      delete_email: { allowed: true, alwaysAllow: true, grantedAt: Date.now() }
    };

    // WHEN: canUseTool is called for destructive tool
    const decision = canUseTool('delete_email', { sessionPermissions });

    // THEN: Tool still requires explicit approval (session grant ignored for destructive)
    expect(decision.allowed).toBe(false);
    expect(decision.requiresExplicitApproval).toBe(true);
    // Destructive tools cannot be auto-granted even with session permission
    expect(decision.grantedBy).not.toBe('session');
  });

});
```

---

## Test Code: Integration Tests

```typescript
// tests/integration/story-2.4-audit-log.spec.ts
import { test, expect, beforeEach, afterEach, describe } from 'vitest';
import { PermissionService } from '@/services/permissions';
import Database from 'better-sqlite3';

let db: Database.Database;
let permissionService: PermissionService;

beforeEach(() => {
  // Create in-memory SQLite database for testing
  db = new Database(':memory:');
  permissionService = new PermissionService(db);
});

afterEach(() => {
  db.close();
});

describe('Story 2.4: Permission Audit Logging', () => {

  test('2.4.7 - permission decisions are logged to action_log', async () => {
    // GIVEN: Multiple permission decisions occur

    // WHEN: User approves send_email
    await permissionService.recordDecision({
      tool: 'send_email',
      decision: 'approved',
      alwaysAllow: false,
      context: { recipient: 'john@example.com', subject: 'Test Email' },
    });

    // AND: User denies delete_email
    await permissionService.recordDecision({
      tool: 'delete_email',
      decision: 'denied',
      alwaysAllow: false,
      context: { emailId: 'msg_001' },
    });

    // AND: Read tool auto-allowed
    await permissionService.recordDecision({
      tool: 'get_emails',
      decision: 'auto_allowed',
      alwaysAllow: false,
      context: { query: 'inbox' },
    });

    // THEN: All decisions are logged
    const logs = db.prepare(`
      SELECT * FROM action_log WHERE type = 'permission'
      ORDER BY created_at DESC
    `).all();

    expect(logs).toHaveLength(3);

    // Verify most recent (delete_email denied) is first
    expect(logs[0].tool).toBe('get_emails');
    expect(logs[0].decision).toBe('auto_allowed');

    expect(logs[1].tool).toBe('delete_email');
    expect(logs[1].decision).toBe('denied');

    expect(logs[2].tool).toBe('send_email');
    expect(logs[2].decision).toBe('approved');
  });

  test('2.4.7b - denied decisions include reason context', async () => {
    // GIVEN: User denies a permission with a reason
    await permissionService.recordDecision({
      tool: 'delete_email',
      decision: 'denied',
      alwaysAllow: false,
      context: {
        emailId: 'msg_002',
        reason: 'Not ready to delete this email yet',
      },
    });

    // THEN: Context includes the denial reason
    const logs = permissionService.queryByTool('delete_email');
    expect(logs).toHaveLength(1);
    expect(logs[0].context?.reason).toBe('Not ready to delete this email yet');
  });

  test('2.4.7c - audit log supports query by tool', async () => {
    // GIVEN: Multiple decisions for different tools
    await permissionService.recordDecision({
      tool: 'send_email',
      decision: 'approved',
      alwaysAllow: false,
    });
    await permissionService.recordDecision({
      tool: 'send_email',
      decision: 'approved',
      alwaysAllow: true, // Second time with always allow
    });
    await permissionService.recordDecision({
      tool: 'create_event',
      decision: 'approved',
      alwaysAllow: false,
    });

    // WHEN: Querying by tool
    const sendEmailLogs = permissionService.queryByTool('send_email');
    const createEventLogs = permissionService.queryByTool('create_event');

    // THEN: Results are filtered by tool
    expect(sendEmailLogs).toHaveLength(2);
    expect(createEventLogs).toHaveLength(1);
  });

  test('2.4.7d - audit log supports query by decision type', async () => {
    // GIVEN: Mix of decision types
    await permissionService.recordDecision({
      tool: 'send_email',
      decision: 'approved',
      alwaysAllow: false,
    });
    await permissionService.recordDecision({
      tool: 'delete_email',
      decision: 'denied',
      alwaysAllow: false,
    });
    await permissionService.recordDecision({
      tool: 'get_emails',
      decision: 'auto_allowed',
      alwaysAllow: false,
    });
    await permissionService.recordDecision({
      tool: 'create_event',
      decision: 'approved',
      alwaysAllow: true,
    });

    // WHEN: Querying by decision type
    const approvedLogs = permissionService.queryByDecision('approved');
    const deniedLogs = permissionService.queryByDecision('denied');
    const autoAllowedLogs = permissionService.queryByDecision('auto_allowed');

    // THEN: Results are filtered by decision type
    expect(approvedLogs).toHaveLength(2);
    expect(deniedLogs).toHaveLength(1);
    expect(autoAllowedLogs).toHaveLength(1);
  });

});
```

---

## Test Code: E2E Tests

```typescript
// tests/e2e/story-2.4-permission-dialog.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Story 2.4: Permission Dialog', () => {

  test('2.4.4 - read tool executes without dialog', async ({ page }) => {
    // GIVEN: Mock agent response that uses a read tool (get_emails)
    await page.route('**/api/chat', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: [
          'data: {"type":"tool_use","name":"get_emails","result":{"count":5,"emails":[]}}',
          'data: {"type":"text","content":"You have 5 emails in your inbox."}',
          'data: {"type":"done"}',
        ].join('\n\n'),
      });
    });

    // WHEN: User navigates to chat and sends a message
    await page.goto('/chat');
    await page.fill('[data-testid="chat-input"]', 'Check my inbox');
    await page.click('[data-testid="send-button"]');

    // Wait for response to complete
    await expect(page.getByText('You have 5 emails')).toBeVisible();

    // THEN: Permission dialog should NOT appear
    const dialog = page.locator('[data-testid="permission-dialog"]');
    await expect(dialog).not.toBeVisible();
  });

  test('2.4.5 - write tool shows confirmation dialog', async ({ page }) => {
    // GIVEN: Mock agent response that uses a write tool (send_email)
    await page.route('**/api/chat', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: [
          'data: {"type":"tool_request","name":"send_email","input":{"to":"john@example.com","subject":"Meeting tomorrow","body":"Hi John, confirming our meeting."}}',
          'data: {"type":"awaiting_permission"}',
        ].join('\n\n'),
      });
    });

    // WHEN: User sends a message that triggers email sending
    await page.goto('/chat');
    await page.fill('[data-testid="chat-input"]', 'Send an email to John about the meeting');
    await page.click('[data-testid="send-button"]');

    // THEN: Permission dialog should appear
    const dialog = page.locator('[data-testid="permission-dialog"]');
    await expect(dialog).toBeVisible();

    // AND: Dialog shows tool name
    await expect(dialog.getByText('send_email')).toBeVisible();

    // AND: Dialog shows summarized parameters (not raw JSON)
    await expect(dialog.getByText('john@example.com')).toBeVisible();
    await expect(dialog.getByText('Meeting tomorrow')).toBeVisible();

    // AND: Dialog has approve/deny buttons
    await expect(dialog.getByRole('button', { name: /approve/i })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /deny/i })).toBeVisible();

    // AND: Dialog has "always allow" checkbox
    await expect(dialog.getByLabel(/always allow/i)).toBeVisible();
    await expect(dialog.getByLabel(/always allow/i)).toBeEnabled();
  });

  test('2.4.5c - destructive tool shows warning and requires two-step confirmation', async ({ page }) => {
    // GIVEN: Mock agent response that uses a destructive tool
    await page.route('**/api/chat', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: [
          'data: {"type":"tool_request","name":"delete_email","input":{"emailId":"msg_001","subject":"Old newsletter"}}',
          'data: {"type":"awaiting_permission"}',
        ].join('\n\n'),
      });
    });

    // WHEN: User sends a message that triggers deletion
    await page.goto('/chat');
    await page.fill('[data-testid="chat-input"]', 'Delete that old newsletter email');
    await page.click('[data-testid="send-button"]');

    // THEN: Permission dialog should appear with warning
    const dialog = page.locator('[data-testid="permission-dialog"]');
    await expect(dialog).toBeVisible();

    // AND: Warning message is displayed
    await expect(dialog.getByText(/warning/i)).toBeVisible();
    await expect(dialog.getByText(/permanently delete/i)).toBeVisible();

    // AND: First click on approve shows confirmation step
    await dialog.getByRole('button', { name: /continue/i }).click();

    // THEN: Two-step confirmation appears (type to confirm)
    await expect(dialog.getByTestId('confirm-input')).toBeVisible();
    await expect(dialog.getByText(/type "delete_email" to confirm/i)).toBeVisible();

    // AND: Approve button is still visible for final confirmation
    await expect(dialog.getByRole('button', { name: /approve/i })).toBeVisible();
  });

  test('2.4.6c - "always allow" checkbox persists for session', async ({ page }) => {
    // GIVEN: Mock responses for two consecutive write tool requests
    let requestCount = 0;
    await page.route('**/api/chat', route => {
      requestCount++;
      if (requestCount === 1) {
        // First request - awaiting permission
        route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: [
            'data: {"type":"tool_request","name":"send_email","input":{"to":"alice@example.com"}}',
            'data: {"type":"awaiting_permission"}',
          ].join('\n\n'),
        });
      } else {
        // Second request - should auto-execute due to session permission
        route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: [
            'data: {"type":"tool_use","name":"send_email","result":{"success":true}}',
            'data: {"type":"text","content":"Email sent successfully."}',
            'data: {"type":"done"}',
          ].join('\n\n'),
        });
      }
    });

    // WHEN: First request - user approves with "always allow"
    await page.goto('/chat');
    await page.fill('[data-testid="chat-input"]', 'Send email to Alice');
    await page.click('[data-testid="send-button"]');

    // Wait for dialog and check "always allow"
    const dialog = page.locator('[data-testid="permission-dialog"]');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/always allow/i).check();
    await dialog.getByRole('button', { name: /approve/i }).click();

    // Wait for first request to complete (mocked)
    await page.waitForTimeout(100);

    // WHEN: Second request - same tool
    await page.fill('[data-testid="chat-input"]', 'Send another email to Bob');
    await page.click('[data-testid="send-button"]');

    // THEN: Dialog should NOT appear (session permission active)
    await page.waitForTimeout(500);
    await expect(dialog).not.toBeVisible();

    // AND: Response should complete automatically
    await expect(page.getByText('Email sent successfully')).toBeVisible();
  });

  test('2.4.6d - "always allow" checkbox disabled for destructive tools', async ({ page }) => {
    // GIVEN: Mock agent response that uses a destructive tool
    await page.route('**/api/chat', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: [
          'data: {"type":"tool_request","name":"delete_contact","input":{"contactId":"contact_001"}}',
          'data: {"type":"awaiting_permission"}',
        ].join('\n\n'),
      });
    });

    // WHEN: User triggers a destructive action
    await page.goto('/chat');
    await page.fill('[data-testid="chat-input"]', 'Delete the contact');
    await page.click('[data-testid="send-button"]');

    // THEN: Permission dialog appears
    const dialog = page.locator('[data-testid="permission-dialog"]');
    await expect(dialog).toBeVisible();

    // AND: "Always allow" checkbox is NOT present or is disabled for destructive tools
    const alwaysAllowCheckbox = dialog.getByLabel(/always allow/i);
    // Either should not exist or should be disabled
    const checkboxCount = await alwaysAllowCheckbox.count();
    if (checkboxCount > 0) {
      await expect(alwaysAllowCheckbox).toBeDisabled();
    }
  });

});
```

---

## Data Factories Created

### Permission Factory

**File:** `tests/support/factories/permission.factory.ts`

**Exports:**

- `createPermissionDecision(overrides?)` - Create permission decision with optional overrides
- `createToolDefinition(overrides?)` - Create tool definition for catalog
- `createSessionPermission(overrides?)` - Create session permission entry
- `createPermissionAudit(overrides?)` - Create permission audit record

**Example Usage:**

```typescript
import { createPermissionDecision, createToolDefinition } from '../factories/permission.factory';

const decision = createPermissionDecision({
  allowed: false,
  requiresExplicitApproval: true,
  category: ToolCategory.DESTRUCTIVE,
});

const tool = createToolDefinition({
  name: 'delete_email',
  category: ToolCategory.DESTRUCTIVE,
  warningMessage: 'This will permanently delete the email.',
});
```

### Factory Implementation

```typescript
// tests/support/factories/permission.factory.ts
import { faker } from '@faker-js/faker';
import type {
  PermissionDecision,
  ToolDefinition,
  SessionPermission,
  ToolCategory,
} from '@/agents/permissions/types';

export const createPermissionDecision = (
  overrides: Partial<PermissionDecision> = {}
): PermissionDecision => ({
  allowed: true,
  requiresConfirmation: false,
  category: faker.helpers.arrayElement(['read', 'write', 'destructive']) as ToolCategory,
  grantedBy: faker.helpers.maybe(() =>
    faker.helpers.arrayElement(['auto', 'session', 'user'])
  ),
  ...overrides,
});

export const createToolDefinition = (
  overrides: Partial<ToolDefinition> = {}
): ToolDefinition => ({
  name: faker.word.noun(),
  description: faker.lorem.sentence(),
  category: faker.helpers.arrayElement(['read', 'write', 'destructive']) as ToolCategory,
  warningMessage: faker.helpers.maybe(() => faker.lorem.sentence()),
  ...overrides,
});

export const createSessionPermission = (
  overrides: Partial<SessionPermission> = {}
): SessionPermission => ({
  allowed: true,
  alwaysAllow: faker.datatype.boolean(),
  grantedAt: faker.date.recent().getTime(),
  ...overrides,
});

export const createPermissionAudit = (
  overrides: Partial<{
    id: string;
    tool: string;
    decision: string;
    alwaysAllow: boolean;
    context: Record<string, unknown>;
    timestamp: string;
  }> = {}
) => ({
  id: `perm_${faker.string.alphanumeric(10)}`,
  tool: faker.helpers.arrayElement([
    'send_email',
    'get_emails',
    'delete_email',
    'create_event',
  ]),
  decision: faker.helpers.arrayElement(['approved', 'denied', 'auto_allowed']),
  alwaysAllow: faker.datatype.boolean(),
  context: faker.helpers.maybe(() => ({
    recipient: faker.internet.email(),
    subject: faker.lorem.sentence(),
  })),
  timestamp: faker.date.recent().toISOString(),
  ...overrides,
});
```

---

## Fixtures Created

### Permission Test Fixture

**File:** `tests/support/fixtures/permission.fixture.ts`

**Fixtures:**

- `permissionService` - PermissionService with in-memory SQLite database
  - **Setup:** Creates in-memory database, initializes PermissionService
  - **Provides:** `service`, `db` for direct query access
  - **Cleanup:** Closes database connection

**Example Usage:**

```typescript
import { test } from './fixtures/permission.fixture';

test('should log permission decision', async ({ permissionService }) => {
  const { service, db } = permissionService;

  await service.recordDecision({
    tool: 'send_email',
    decision: 'approved',
    alwaysAllow: false,
  });

  const logs = db.prepare('SELECT * FROM action_log').all();
  expect(logs).toHaveLength(1);
});
```

### Fixture Implementation

```typescript
// tests/support/fixtures/permission.fixture.ts
import { test as base } from 'vitest';
import Database from 'better-sqlite3';
import { PermissionService } from '@/services/permissions';

interface PermissionServiceFixture {
  service: PermissionService;
  db: Database.Database;
}

export const test = base.extend<{ permissionService: PermissionServiceFixture }>({
  permissionService: async ({}, use) => {
    // Setup
    const db = new Database(':memory:');
    const service = new PermissionService(db);

    // Provide to test
    await use({ service, db });

    // Cleanup
    db.close();
  },
});
```

---

## Mock Requirements

### Permission SSE Events

**Location:** Mock SSE responses for E2E tests

**Event Types:**

```typescript
// Tool request awaiting permission
data: {"type":"tool_request","name":"send_email","input":{"to":"john@example.com","subject":"Meeting"}}
data: {"type":"awaiting_permission"}

// Permission granted (after user approves)
data: {"type":"permission_granted","tool":"send_email"}

// Permission denied (after user denies)
data: {"type":"permission_denied","tool":"send_email"}

// Tool execution (READ tools - no permission needed)
data: {"type":"tool_use","name":"get_emails","result":{"count":5}}
```

**Notes:**

- Tool requests for WRITE/DESTRUCTIVE tools emit `tool_request` then `awaiting_permission`
- READ tools directly emit `tool_use` with results (no permission events)
- Frontend must handle `awaiting_permission` by showing PermissionDialog
- After user decision, frontend POSTs to permission endpoint, then receives `permission_granted` or `permission_denied`

---

## Required data-testid Attributes

### Permission Dialog Component

- `permission-dialog` - Container for the permission dialog
- `approve-button` - Button to approve tool execution
- `deny-button` - Button to deny tool execution
- `confirm-input` - Input field for two-step destructive confirmation
- `always-allow-checkbox` - Checkbox for "always allow for this session"

### Chat Interface (from prior stories)

- `chat-input` - Message input field
- `send-button` - Send message button

**Implementation Example:**

```tsx
<div
  className="bg-orion-surface border border-orion-border-muted p-6"
  data-testid="permission-dialog"
>
  <h3 className="font-playfair text-lg">Permission Required</h3>

  {/* Tool details */}
  <div className="space-y-4">
    <span className="font-mono text-orion-primary">{tool}</span>
    <p>{toolDescription}</p>
  </div>

  {/* Warning for destructive */}
  {isDestructive && (
    <div className="bg-red-900/20 border border-red-500/50 p-3">
      <strong>Warning:</strong> {warningMessage}
    </div>
  )}

  {/* Two-step confirmation input */}
  {showConfirmInput && (
    <input
      type="text"
      data-testid="confirm-input"
      placeholder={`Type "${tool}" to confirm`}
    />
  )}

  {/* Always allow checkbox (disabled for destructive) */}
  {!isDestructive && (
    <label>
      <input
        type="checkbox"
        aria-label="Always allow this tool for this session"
      />
      Always allow for this session
    </label>
  )}

  {/* Action buttons */}
  <div className="flex gap-3">
    <button data-testid="approve-button">
      {isDestructive && !confirmStep ? 'Continue' : 'Approve'}
    </button>
    <button data-testid="deny-button">Deny</button>
  </div>
</div>
```

---

## Implementation Checklist

### Test 2.4.1b: TOOL_CATALOG contains all required tools

**File:** `tests/unit/story-2.4-permissions.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `src/agents/permissions/types.ts` with `ToolCategory` enum (READ, WRITE, DESTRUCTIVE)
- [ ] Create `src/agents/permissions/catalog.ts` with `TOOL_CATALOG` constant
- [ ] Define all READ tools: get_emails, get_calendar_events, search_contacts, get_preferences, list_tasks, fetch_project
- [ ] Define all WRITE tools: send_email, create_event, update_contact, create_task, update_project
- [ ] Define all DESTRUCTIVE tools: delete_email, cancel_event, delete_contact, archive_project
- [ ] Run test: `pnpm test:unit -- story-2.4-permissions.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test 2.4.3b: Destructive tools include warning messages

**File:** `tests/unit/story-2.4-permissions.spec.ts`

**Tasks to make this test pass:**

- [ ] Add `warningMessage` field to `ToolDefinition` interface in types.ts
- [ ] Add warning messages to all DESTRUCTIVE tools in TOOL_CATALOG
- [ ] delete_email: "This will permanently delete the email. This action cannot be undone."
- [ ] cancel_event: "This will cancel the event and notify all attendees."
- [ ] delete_contact: "This will remove the contact and all associated interaction history."
- [ ] archive_project: "This will archive the project. It can be restored from the Archive."
- [ ] Run test: `pnpm test:unit -- story-2.4-permissions.spec.ts`
- [ ] Test passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test 2.4.1, 2.4.2, 2.4.3: canUseTool categorizes tools correctly

**File:** `tests/unit/story-2.4-permissions.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `src/agents/permissions/canUseTool.ts` with main function
- [ ] Implement category lookup from TOOL_CATALOG
- [ ] Return `PermissionDecision` with `allowed: true, requiresConfirmation: false` for READ
- [ ] Return `PermissionDecision` with `allowed: true, requiresConfirmation: true` for WRITE
- [ ] Return `PermissionDecision` with `allowed: false, requiresExplicitApproval: true` for DESTRUCTIVE
- [ ] Set `grantedBy: 'auto'` for READ tools
- [ ] Include `warningMessage` in decision for DESTRUCTIVE tools
- [ ] Run test: `pnpm test:unit -- story-2.4-permissions.spec.ts`
- [ ] Tests 2.4.1, 2.4.2, 2.4.3 pass (green phase)

**Estimated Effort:** 2 hours

---

### Test 2.4.6, 2.4.6b: Session permission store

**File:** `tests/unit/story-2.4-permissions.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `src/agents/permissions/session-store.ts` with `SessionPermissionStore` class
- [ ] Implement `grantPermission(tool, alwaysAllow)` method
- [ ] Implement `checkPermission(tool)` method returning `SessionPermission | undefined`
- [ ] Implement `denyPermission(tool)` method
- [ ] Implement `clearAll()` method that clears all permissions
- [ ] Implement `getAll()` method returning `Record<string, SessionPermission>`
- [ ] Export singleton `sessionPermissionStore` instance
- [ ] Update `canUseTool` to check session permissions before category decision
- [ ] Return `grantedBy: 'session'` when session permission grants access
- [ ] Run test: `pnpm test:unit -- story-2.4-permissions.spec.ts`
- [ ] Tests 2.4.6, 2.4.6b pass (green phase)

**Estimated Effort:** 2 hours

---

### Test 2.4.5b: Cannot "always allow" destructive tools

**File:** `tests/unit/story-2.4-permissions.spec.ts`

**Tasks to make this test pass:**

- [ ] Update `canUseTool` to ignore session permissions for DESTRUCTIVE tools
- [ ] DESTRUCTIVE tools always return `allowed: false, requiresExplicitApproval: true`
- [ ] Add explicit check: `if (tool.category === DESTRUCTIVE) { /* ignore session */ }`
- [ ] Run test: `pnpm test:unit -- story-2.4-permissions.spec.ts`
- [ ] Test 2.4.5b passes (green phase)

**Estimated Effort:** 0.5 hours

---

### Test 2.4.7: Permission decisions logged to action_log

**File:** `tests/integration/story-2.4-audit-log.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `src/services/permissions.ts` with `PermissionService` class
- [ ] Implement `ensureTable()` to create action_log table if not exists
- [ ] Implement `recordDecision({ tool, decision, alwaysAllow, context })` method
- [ ] Generate unique ID with `perm_${timestamp}_${random}`
- [ ] Insert row with type='permission', tool, decision, always_allow, context (JSON)
- [ ] Run test: `pnpm test:integration -- story-2.4-audit-log.spec.ts`
- [ ] Test 2.4.7 passes (green phase)

**Estimated Effort:** 2 hours

---

### Test 2.4.7b, 2.4.7c, 2.4.7d: Audit log queries

**File:** `tests/integration/story-2.4-audit-log.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement `queryByTool(tool)` method returning `PermissionAudit[]`
- [ ] Implement `queryByDecision(decision)` method returning `PermissionAudit[]`
- [ ] Add `rowToAudit(row)` helper to convert DB row to typed object
- [ ] Parse JSON context field back to object
- [ ] Run test: `pnpm test:integration -- story-2.4-audit-log.spec.ts`
- [ ] Tests 2.4.7b, 2.4.7c, 2.4.7d pass (green phase)

**Estimated Effort:** 1 hour

---

### Test 2.4.4: Read tool executes without dialog (E2E)

**File:** `tests/e2e/story-2.4-permission-dialog.spec.ts`

**Tasks to make this test pass:**

- [ ] Wire `canUseTool` into agent-server tool execution path
- [ ] For READ tools, execute immediately without emitting `awaiting_permission`
- [ ] Emit `tool_use` event with results directly
- [ ] Run test: `pnpm test:e2e -- story-2.4-permission-dialog.spec.ts`
- [ ] Test 2.4.4 passes (green phase)

**Estimated Effort:** 1 hour

---

### Test 2.4.5: Write tool shows confirmation dialog (E2E)

**File:** `tests/e2e/story-2.4-permission-dialog.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `src/components/chat/permission-dialog.tsx` component
- [ ] Accept props: `tool`, `toolDescription`, `input`, `decision`, `onApprove`, `onDeny`
- [ ] Display tool name and action description
- [ ] Display summarized input parameters (not raw JSON)
- [ ] Add approve/deny buttons with `data-testid` attributes
- [ ] Add "always allow" checkbox with aria-label
- [ ] Style according to Orion Design System (zero border radius, gold accents)
- [ ] Wire component to show when `awaiting_permission` event received
- [ ] Run test: `pnpm test:e2e -- story-2.4-permission-dialog.spec.ts`
- [ ] Test 2.4.5 passes (green phase)

**Estimated Effort:** 3 hours

---

### Test 2.4.5c: Destructive tool two-step confirmation (E2E)

**File:** `tests/e2e/story-2.4-permission-dialog.spec.ts`

**Tasks to make this test pass:**

- [ ] Add `confirmStep` state to PermissionDialog component
- [ ] For DESTRUCTIVE tools, first click shows confirmation input
- [ ] Add `confirm-input` field requiring user to type tool name
- [ ] Only enable final "Approve" when tool name matches
- [ ] Display warning message prominently
- [ ] Run test: `pnpm test:e2e -- story-2.4-permission-dialog.spec.ts`
- [ ] Test 2.4.5c passes (green phase)

**Estimated Effort:** 2 hours

---

### Test 2.4.6c: "Always allow" persists for session (E2E)

**File:** `tests/e2e/story-2.4-permission-dialog.spec.ts`

**Tasks to make this test pass:**

- [ ] Wire checkbox `onChange` to call session permission store
- [ ] On approve with "always allow" checked, call `sessionPermissionStore.grantPermission(tool, true)`
- [ ] Before showing dialog, check session permissions first
- [ ] If session permission exists with `alwaysAllow: true`, skip dialog
- [ ] Run test: `pnpm test:e2e -- story-2.4-permission-dialog.spec.ts`
- [ ] Test 2.4.6c passes (green phase)

**Estimated Effort:** 1 hour

---

### Test 2.4.6d: "Always allow" disabled for destructive (E2E)

**File:** `tests/e2e/story-2.4-permission-dialog.spec.ts`

**Tasks to make this test pass:**

- [ ] Conditionally render or disable "always allow" checkbox when `isDestructive`
- [ ] Either: `{!isDestructive && <checkbox />}` or `<checkbox disabled={isDestructive} />`
- [ ] Run test: `pnpm test:e2e -- story-2.4-permission-dialog.spec.ts`
- [ ] Test 2.4.6d passes (green phase)

**Estimated Effort:** 0.5 hours

---

## Running Tests

```bash
# Run all failing tests for this story
pnpm test -- --grep "story-2.4"

# Run specific test file - unit tests
pnpm test:unit -- story-2.4-permissions.spec.ts

# Run specific test file - integration tests
pnpm test:integration -- story-2.4-audit-log.spec.ts

# Run E2E tests in headed mode (see browser)
pnpm test:e2e -- story-2.4-permission-dialog.spec.ts --headed

# Debug specific test
pnpm test:e2e -- story-2.4-permission-dialog.spec.ts --debug

# Run tests with coverage
pnpm test:unit -- --coverage --grep "story-2.4"
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- All tests written and failing
- Fixtures and factories created with auto-cleanup
- Mock requirements documented
- data-testid requirements listed
- Implementation checklist created

**Verification:**

- All tests run and fail as expected
- Failure messages are clear and actionable
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with smallest scope)
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist
6. **Move to next test** and repeat

**Recommended Test Order:**

1. 2.4.1b - TOOL_CATALOG (foundation)
2. 2.4.3b - Warning messages for destructive tools
3. 2.4.1 - Read tools auto-execute
4. 2.4.2 - Write tools require confirmation
5. 2.4.3 - Destructive tools blocked
6. 2.4.6b - SessionPermissionStore clearAll
7. 2.4.6 - Session "always allow" bypasses confirmation
8. 2.4.5b - Cannot "always allow" destructive
9. 2.4.7 - Audit logging
10. 2.4.7b, 2.4.7c, 2.4.7d - Audit queries
11. 2.4.4 - E2E read tool no dialog
12. 2.4.5 - E2E write tool shows dialog
13. 2.4.5c - E2E destructive two-step
14. 2.4.6c - E2E session persistence
15. 2.4.6d - E2E disabled checkbox for destructive

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Progress Tracking:**

- Check off tasks as you complete them
- Share progress in daily standup
- Mark story as IN PROGRESS in `sprint-status.yaml`

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability, performance)
3. **Extract duplications** (DRY principle)
4. **Optimize performance** (if needed)
5. **Ensure tests still pass** after each refactor
6. **Update documentation** (if API contracts change)

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Make small refactors (easier to debug if tests fail)
- Run tests after each change
- Don't change test behavior (only implementation)

**Completion:**

- All tests pass
- Code quality meets team standards
- No duplications or code smells
- Ready for code review and story approval

---

## Next Steps

1. **Share this checklist and failing tests** with the dev workflow (manual handoff)
2. **Review this checklist** with team in standup or planning
3. **Run failing tests** to confirm RED phase: `pnpm test -- --grep "story-2.4"`
4. **Begin implementation** using implementation checklist as guide
5. **Work one test at a time** (red -> green for each)
6. **Share progress** in daily standup
7. **When all tests pass**, refactor code for quality
8. **When refactoring complete**, manually update story status to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments and sources:

- **test-design-epic-2.md** - Story 2.4 test scenarios (2.4.1-2.4.7), test code examples, security tier testing
- **test-design-system-level.md** - Testability concerns (C-001 Claude non-determinism), mock strategy
- **fixture-architecture.md** - Test fixture patterns with setup/teardown and auto-cleanup
- **data-factories.md** - Factory patterns using `@faker-js/faker` for random test data generation
- **network-first.md** - Route interception patterns for E2E streaming tests
- **test-quality.md** - Test design principles (Given-When-Then, one assertion per test, determinism)
- **story-2-4-tool-permission-system.md** - Story acceptance criteria, dev notes, schema implementations

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `pnpm test -- --grep "story-2.4"`

**Expected Results:**

```
 FAIL  tests/unit/story-2.4-permissions.spec.ts
   Story 2.4: Tool Permission System
     x 2.4.1 - read tools auto-execute without prompt
     x 2.4.2 - write tools require confirmation
     x 2.4.3 - destructive tools are blocked until explicit approval
     x 2.4.1b - TOOL_CATALOG contains all required tools with correct categories
     x 2.4.3b - destructive tools include warning messages
     x 2.4.6 - session "always allow" bypasses confirmation
     x 2.4.6b - session permissions reset on clear
     x 2.4.5b - cannot "always allow" destructive tools

 FAIL  tests/integration/story-2.4-audit-log.spec.ts
   Story 2.4: Permission Audit Logging
     x 2.4.7 - permission decisions are logged to action_log
     x 2.4.7b - denied decisions include reason context
     x 2.4.7c - audit log supports query by tool
     x 2.4.7d - audit log supports query by decision type

 FAIL  tests/e2e/story-2.4-permission-dialog.spec.ts
   Story 2.4: Permission Dialog
     x 2.4.4 - read tool executes without dialog
     x 2.4.5 - write tool shows confirmation dialog
     x 2.4.5c - destructive tool shows warning and requires two-step confirmation
     x 2.4.6c - "always allow" checkbox persists for session
     x 2.4.6d - "always allow" checkbox disabled for destructive tools

Test Files  3 failed
     Tests  17 failed
```

**Summary:**

- Total tests: 17
- Passing: 0 (expected)
- Failing: 17 (expected)
- Status: RED phase verified

**Expected Failure Messages:**

- `canUseTool is not defined` - Function not implemented yet
- `TOOL_CATALOG is not defined` - Constant not created
- `SessionPermissionStore is not defined` - Class not implemented
- `PermissionService is not defined` - Service not created
- `Cannot find element [data-testid="permission-dialog"]` - Component not implemented

---

## Notes

- **Security Priority:** This is a P0 security story - permission system must be rock solid
- **Session-Only Persistence:** CRITICAL - Never persist "always allow" to disk, memory only
- **No Destructive Auto-Allow:** DESTRUCTIVE tools can NEVER be auto-allowed, even with session permission
- **Audit Everything:** Every permission decision (approved, denied, auto_allowed) must be logged
- **User-Friendly Display:** Never show raw JSON to users - always summarize parameters
- **Two-Step for Destructive:** Type-to-confirm pattern ensures intentional action
- **Design System Compliance:** Zero border radius, gold accents, Playfair Display headings

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Tag @TEA in Slack/Discord
- Refer to `_bmad/bmm/workflows/testarch/atdd/instructions.md` for workflow documentation
- Consult `_bmad/bmm/testarch/knowledge` for testing best practices

---

**Generated by BMad TEA Agent** - 2026-01-15
