# E2E Test Plan: Orion Personal Butler MVP

Generated: 2026-01-14
Plan Agent Output

---

## Executive Summary

This plan defines a comprehensive testing strategy for Orion Personal Butler MVP, covering unit tests, integration tests, E2E tests, and manual testing. Tests are prioritized by risk (P0/P1/P2) based on user impact and system criticality.

**Testing Goals:**
- P0 tests block release (must pass)
- P1 tests should pass for quality release
- P2 tests are nice-to-have for MVP

**Coverage Targets:**
| Category | Target | MVP Minimum |
|----------|--------|-------------|
| Unit Tests (business logic) | 80% | 60% |
| Integration Tests (APIs) | 70% | 50% |
| E2E Tests (critical paths) | 100% of P0 flows | 100% |

---

## Test Infrastructure

### 1. Test Frameworks

| Layer | Framework | Location |
|-------|-----------|----------|
| Unit (TypeScript) | Vitest | `orion-app/tests/unit/` |
| Unit (Python) | pytest | `opc/tests/` |
| Integration | Vitest + MSW | `orion-app/tests/integration/` |
| E2E | agent-browser (Vercel Labs) | `orion-app/tests/e2e/` |
| Component | Storybook + Test Runner | `orion-app/.storybook/` |

### 2. Configuration Files

**`orion-app/vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.*'],
      thresholds: {
        lines: 60,
        branches: 50,
        functions: 60,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### agent-browser Setup

**Installation:**
```bash
# Install globally
npm install -g agent-browser
agent-browser install  # Downloads Chromium

# Or as dev dependency
pnpm add -D agent-browser
```

**Why agent-browser (Vercel Labs) over Playwright:**
- **AI-optimized**: Outputs element refs (@e1, @e2) perfect for LLM consumption
- **CLI-first**: Simple shell commands, no boilerplate test framework
- **Snapshot mode**: Accessibility tree with interactive elements for AI agents
- **Session management**: Persistent browser sessions across test steps
- **Rust-powered**: Fast native binary with Node.js fallback

**GitHub:** https://github.com/vercel-labs/agent-browser

### E2E Test Architecture

E2E tests use agent-browser CLI + Vitest as test runner:

```
tests/e2e/
├── setup.ts                 # Browser session management
├── helpers/
│   ├── browser.ts           # agent-browser wrapper
│   └── assertions.ts        # Custom assertions
├── onboarding.test.ts       # Onboarding journey
├── chat.test.ts             # Chat functionality
├── gmail.test.ts            # Gmail integration
├── calendar.test.ts         # Calendar integration
├── inbox.test.ts            # Inbox triage
└── projects.test.ts         # PARA projects
```

**`orion-app/tests/e2e/helpers/browser.ts`:**
```typescript
import { execSync, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class AgentBrowser {
  private session: string;

  constructor(session = 'orion-test') {
    this.session = session;
  }

  private cmd(command: string): string {
    return `agent-browser --session ${this.session} ${command}`;
  }

  async open(url: string): Promise<void> {
    await execAsync(this.cmd(`open ${url}`));
  }

  async click(selector: string): Promise<void> {
    await execAsync(this.cmd(`click "${selector}"`));
  }

  async fill(selector: string, text: string): Promise<void> {
    await execAsync(this.cmd(`fill "${selector}" "${text}"`));
  }

  async type(selector: string, text: string): Promise<void> {
    await execAsync(this.cmd(`type "${selector}" "${text}"`));
  }

  async press(key: string): Promise<void> {
    await execAsync(this.cmd(`press ${key}`));
  }

  async getText(selector: string): Promise<string> {
    const { stdout } = await execAsync(this.cmd(`get text "${selector}"`));
    return stdout.trim();
  }

  async isVisible(selector: string): Promise<boolean> {
    const { stdout } = await execAsync(this.cmd(`is visible "${selector}"`));
    return stdout.trim() === 'true';
  }

  async wait(selectorOrMs: string | number): Promise<void> {
    await execAsync(this.cmd(`wait ${selectorOrMs}`));
  }

  async waitForText(text: string): Promise<void> {
    await execAsync(this.cmd(`wait --text "${text}"`));
  }

  async waitForUrl(pattern: string): Promise<void> {
    await execAsync(this.cmd(`wait --url "${pattern}"`));
  }

  async snapshot(options?: { interactive?: boolean; compact?: boolean }): Promise<string> {
    let cmd = 'snapshot --json';
    if (options?.interactive) cmd += ' -i';
    if (options?.compact) cmd += ' -c';
    const { stdout } = await execAsync(this.cmd(cmd));
    return stdout;
  }

  async screenshot(filename?: string): Promise<void> {
    await execAsync(this.cmd(`screenshot ${filename || ''}`));
  }

  async findAndClick(strategy: string, value: string): Promise<void> {
    await execAsync(this.cmd(`find ${strategy} "${value}" click`));
  }

  async getUrl(): Promise<string> {
    const { stdout } = await execAsync(this.cmd('get url'));
    return stdout.trim();
  }
}
```

### 3. Test Data & Fixtures

**Location:** `orion-app/tests/fixtures/`

```
fixtures/
├── contacts/
│   ├── sample-contacts.json       # 10 test contacts
│   └── vip-contacts.json          # VIP contact scenarios
├── emails/
│   ├── inbox-items.json           # Sample inbox items
│   ├── urgent-email.json          # Urgency detection test
│   └── action-items.json          # Action extraction test
├── calendar/
│   ├── events.json                # Sample calendar events
│   └── availability-slots.json    # Free/busy scenarios
├── projects/
│   ├── sample-projects.json       # PARA project fixtures
│   └── tasks.json                 # Task fixtures
└── mocks/
    ├── composio-responses.json    # Mocked Composio API responses
    └── claude-responses.json      # Mocked Claude responses
```

### 4. Mock Service Worker (MSW) Setup

**`orion-app/tests/mocks/handlers.ts`:**
```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Composio Gmail fetch
  http.post('*/composio/gmail/fetch', () => {
    return HttpResponse.json({
      success: true,
      data: {
        messages: [
          {
            id: 'msg_001',
            from: 'john@example.com',
            subject: 'Meeting tomorrow?',
            snippet: 'Are you free for a 30 min call...',
            received_at: '2026-01-14T10:00:00Z',
          },
        ],
      },
    });
  }),

  // Mock Composio Calendar events
  http.post('*/composio/calendar/events', () => {
    return HttpResponse.json({
      success: true,
      data: {
        events: [
          {
            id: 'evt_001',
            summary: 'Team Standup',
            start: '2026-01-15T09:00:00Z',
            end: '2026-01-15T09:30:00Z',
          },
        ],
      },
    });
  }),

  // Mock Claude API for streaming
  http.post('https://api.anthropic.com/v1/messages', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode('data: {"type":"content_block_start"}\n\n'));
        controller.enqueue(encoder.encode('data: {"type":"content_block_delta","delta":{"text":"Hello"}}\n\n'));
        controller.enqueue(encoder.encode('data: {"type":"message_stop"}\n\n'));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }),
];
```

---

## Critical User Journeys (P0)

### Journey 1: First Launch & Onboarding

**Scenario:** User downloads Orion and completes setup

```typescript
// tests/e2e/onboarding.test.ts
// Using agent-browser CLI via Vitest

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AgentBrowser } from './helpers/browser';

describe('Onboarding Flow', () => {
  let browser: AgentBrowser;

  beforeEach(async () => {
    browser = new AgentBrowser('onboarding-test');
    // Clear localStorage via browser console or fresh session
  });

  afterEach(async () => {
    await browser.screenshot('test-results/onboarding-final.png');
  });

  it('P0: Complete onboarding with API key', async () => {
    await browser.open('http://localhost:3000/');

    // Step 1: Welcome screen
    await browser.waitForText('Welcome to Orion');
    await browser.findAndClick('text', 'Get Started');

    // Step 2: API key entry
    await browser.waitForText('Enter your Anthropic API key');
    await browser.fill('input[placeholder*="sk-ant"]', process.env.TEST_ANTHROPIC_KEY!);
    await browser.findAndClick('text', 'Validate & Continue');

    // Wait for validation
    await browser.waitForText('API key validated');

    // Step 3: Connect services (skip for now)
    await browser.waitForText('Connect Your Services');
    await browser.findAndClick('text', 'Skip for now');

    // Step 4: Select areas
    await browser.waitForText('Select Your Life Areas');
    await browser.click('input[name="career"]');
    await browser.click('input[name="personal"]');
    await browser.findAndClick('text', 'Continue');

    // Step 5: Ready
    await browser.waitForText("You're all set!");
    await browser.findAndClick('text', 'Start Using Orion');

    // Verify redirect to main chat
    await browser.waitForUrl('**/chat');
    const isVisible = await browser.isVisible('input[placeholder*="Ask Orion"]');
    expect(isVisible).toBe(true);
  });

  it('P0: Invalid API key shows error', async () => {
    await browser.open('http://localhost:3000/onboarding/api-key');
    await browser.fill('input[placeholder*="sk-ant"]', 'invalid-key');
    await browser.findAndClick('text', 'Validate & Continue');

    await browser.waitForText('Invalid API key');
    const isEnabled = await browser.isVisible('button:not([disabled])');
    expect(isEnabled).toBe(true);
  });
});
```

### Journey 2: Chat with Claude (Core Interaction)

**Scenario:** User sends message and receives streaming response

```typescript
// tests/e2e/chat.test.ts
// Using agent-browser CLI via Vitest

import { describe, it, expect, beforeEach } from 'vitest';
import { AgentBrowser } from './helpers/browser';

describe('Chat Interface', () => {
  let browser: AgentBrowser;

  beforeEach(async () => {
    browser = new AgentBrowser('chat-test');
    await browser.open('http://localhost:3000/chat');
  });

  it('P0: Send message and receive streaming response', async () => {
    await browser.fill('input[placeholder*="Ask Orion"]', 'Hello, what can you help me with?');
    await browser.press('Enter');

    // Verify message appears in chat
    await browser.waitForText('Hello, what can you help me with?');

    // Verify thinking indicator appears
    await browser.wait('[data-testid="thinking-indicator"]');

    // Wait for response (streaming) - longer timeout
    await browser.wait(30000); // Wait for streaming to complete
    const hasResponse = await browser.isVisible('[data-testid="assistant-message"]');
    expect(hasResponse).toBe(true);

    // Thinking indicator should disappear
    const thinkingGone = !(await browser.isVisible('[data-testid="thinking-indicator"]'));
    expect(thinkingGone).toBe(true);
  });

  it('P0: Keyboard shortcut Cmd+Enter sends message', async () => {
    await browser.fill('input[placeholder*="Ask Orion"]', 'Test message');
    await browser.press('Meta+Enter');

    await browser.waitForText('Test message');
  });

  it('P0: Error handling for failed requests', async () => {
    // Network interception via agent-browser
    // agent-browser network route "**/api/chat" --abort

    await browser.fill('input[placeholder*="Ask Orion"]', 'This will fail');
    await browser.press('Enter');

    await browser.waitForText('Failed to send message');
    const hasRetry = await browser.isVisible('button:has-text("Retry")');
    expect(hasRetry).toBe(true);
  });

  it('P1: Message history persists across page refresh', async () => {
    await browser.fill('input[placeholder*="Ask Orion"]', 'Remember this message');
    await browser.press('Enter');

    await browser.waitForText('Remember this message');

    // Refresh page
    await browser.open('http://localhost:3000/chat');

    // Message should still be visible
    await browser.waitForText('Remember this message');
  });
});
```

### Journey 3: Gmail Integration

**Scenario:** User reads emails through Orion

```typescript
// tests/e2e/gmail.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Gmail Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Skip if no Gmail connection
    const hasGmail = await page.evaluate(() => {
      return localStorage.getItem('composio_gmail_connected') === 'true';
    });
    test.skip(!hasGmail && !process.env.TEST_GMAIL_CONNECTED, 'Gmail not connected');
  });

  test('P0: Fetch and display emails', async ({ page }) => {
    await page.goto('/chat');

    const chatInput = page.getByPlaceholder('Ask Orion anything...');
    await chatInput.fill('Check my email');
    await page.keyboard.press('Enter');

    // Should show tool call indicator
    await expect(page.getByTestId('tool-call-gmail')).toBeVisible({ timeout: 10000 });

    // Wait for email display in canvas
    await expect(page.getByTestId('canvas-email-list')).toBeVisible({ timeout: 15000 });

    // Should show at least one email
    const emailItems = page.getByTestId('email-item');
    await expect(emailItems.first()).toBeVisible();
  });

  test('P0: Send email through chat', async ({ page }) => {
    await page.goto('/chat');

    const chatInput = page.getByPlaceholder('Ask Orion anything...');
    await chatInput.fill('Send an email to test@example.com with subject "Test" and body "Hello from Orion"');
    await page.keyboard.press('Enter');

    // Should show email composer in canvas
    await expect(page.getByTestId('email-composer')).toBeVisible({ timeout: 15000 });

    // Verify pre-filled fields
    await expect(page.getByDisplayValue('test@example.com')).toBeVisible();
    await expect(page.getByDisplayValue('Test')).toBeVisible();

    // Should have send confirmation button
    await expect(page.getByRole('button', { name: 'Review & Send' })).toBeVisible();
  });

  test('P1: Email draft saves before send', async ({ page }) => {
    await page.goto('/chat');

    const chatInput = page.getByPlaceholder('Ask Orion anything...');
    await chatInput.fill('Draft an email to john@example.com about the meeting');
    await page.keyboard.press('Enter');

    await expect(page.getByTestId('email-composer')).toBeVisible({ timeout: 15000 });

    // Edit the draft
    const bodyInput = page.getByTestId('email-body');
    await bodyInput.fill('Updated content');

    // Verify auto-save indicator
    await expect(page.getByText('Draft saved')).toBeVisible({ timeout: 5000 });
  });
});
```

### Journey 4: Calendar Integration

**Scenario:** User views and creates calendar events

```typescript
// tests/e2e/calendar.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Calendar Integration', () => {
  test.beforeEach(async ({ page }) => {
    const hasCalendar = await page.evaluate(() => {
      return localStorage.getItem('composio_calendar_connected') === 'true';
    });
    test.skip(!hasCalendar && !process.env.TEST_CALENDAR_CONNECTED, 'Calendar not connected');
  });

  test('P0: View calendar events', async ({ page }) => {
    await page.goto('/chat');

    const chatInput = page.getByPlaceholder('Ask Orion anything...');
    await chatInput.fill('What\'s on my calendar this week?');
    await page.keyboard.press('Enter');

    // Should show calendar view in canvas
    await expect(page.getByTestId('canvas-calendar')).toBeVisible({ timeout: 15000 });

    // Calendar should have day headers
    await expect(page.getByText('Mon')).toBeVisible();
    await expect(page.getByText('Tue')).toBeVisible();
  });

  test('P0: Create calendar event via chat', async ({ page }) => {
    await page.goto('/chat');

    const chatInput = page.getByPlaceholder('Ask Orion anything...');
    await chatInput.fill('Schedule a meeting with John tomorrow at 2pm for 1 hour');
    await page.keyboard.press('Enter');

    // Should show event creation form in canvas
    await expect(page.getByTestId('event-scheduler')).toBeVisible({ timeout: 15000 });

    // Verify parsed information
    await expect(page.getByDisplayValue(/John/)).toBeVisible();
    await expect(page.getByText('2:00 PM')).toBeVisible();
    await expect(page.getByText('1 hour')).toBeVisible();

    // Confirm button
    await expect(page.getByRole('button', { name: 'Create Event' })).toBeVisible();
  });

  test('P1: Find available time slots', async ({ page }) => {
    await page.goto('/chat');

    const chatInput = page.getByPlaceholder('Ask Orion anything...');
    await chatInput.fill('Find a free 30 minute slot this week for a call');
    await page.keyboard.press('Enter');

    // Should show availability slots
    await expect(page.getByTestId('availability-slots')).toBeVisible({ timeout: 15000 });

    // Should have selectable slots
    const slots = page.getByTestId('time-slot');
    await expect(slots.first()).toBeVisible();
  });
});
```

### Journey 5: Inbox Triage

**Scenario:** User triages unified inbox with AI prioritization

```typescript
// tests/e2e/inbox.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Inbox Triage', () => {
  test('P0: View unified inbox with priority scores', async ({ page }) => {
    await page.goto('/inbox');

    // Inbox should load
    await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();

    // Should show inbox items
    await expect(page.getByTestId('inbox-item')).toBeVisible({ timeout: 10000 });

    // Each item should have priority indicator
    const firstItem = page.getByTestId('inbox-item').first();
    await expect(firstItem.getByTestId('priority-badge')).toBeVisible();
  });

  test('P0: Triage item - file to project', async ({ page }) => {
    await page.goto('/inbox');

    const firstItem = page.getByTestId('inbox-item').first();
    await firstItem.click();

    // Preview should appear
    await expect(page.getByTestId('inbox-preview')).toBeVisible();

    // Click file action
    await page.getByRole('button', { name: 'File' }).click();

    // Project selector should appear
    await expect(page.getByTestId('project-selector')).toBeVisible();

    // Select a project
    await page.getByRole('option', { name: /Project/ }).first().click();

    // Confirmation
    await expect(page.getByText('Filed to')).toBeVisible();
  });

  test('P0: Bulk archive items', async ({ page }) => {
    await page.goto('/inbox');

    // Enter selection mode
    await page.getByRole('button', { name: 'Select' }).click();

    // Select multiple items
    const checkboxes = page.getByRole('checkbox', { name: 'Select item' });
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();

    // Archive selected
    await page.getByRole('button', { name: 'Archive' }).click();

    // Confirm
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Items should be removed
    await expect(page.getByText('2 items archived')).toBeVisible();
  });

  test('P1: Priority scoring reflects urgency signals', async ({ page }) => {
    await page.goto('/inbox');

    // Wait for items to load
    await expect(page.getByTestId('inbox-item')).toBeVisible({ timeout: 10000 });

    // Items with "URGENT" should be higher priority
    const urgentItem = page.getByText('URGENT').locator('..').locator('..');
    const priorityBadge = urgentItem.getByTestId('priority-badge');

    // Should have high priority color (red/orange)
    await expect(priorityBadge).toHaveClass(/priority-high|bg-red|bg-orange/);
  });
});
```

### Journey 6: Projects & Tasks (PARA)

**Scenario:** User manages projects and tasks

```typescript
// tests/e2e/projects.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Projects (PARA)', () => {
  test('P0: Create new project', async ({ page }) => {
    await page.goto('/projects');

    await page.getByRole('button', { name: 'New Project' }).click();

    // Fill project form
    await page.getByLabel('Project Name').fill('Q1 Product Launch');
    await page.getByLabel('Description').fill('Launch new feature by end of March');
    await page.getByLabel('Deadline').fill('2026-03-31');

    // Select area
    await page.getByLabel('Area').click();
    await page.getByRole('option', { name: 'Career' }).click();

    await page.getByRole('button', { name: 'Create Project' }).click();

    // Verify project appears
    await expect(page.getByText('Q1 Product Launch')).toBeVisible();
  });

  test('P0: Add task to project', async ({ page }) => {
    await page.goto('/projects');

    // Click on existing project
    await page.getByText('Q1 Product Launch').click();

    // Add task
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByLabel('Task Title').fill('Write product spec');
    await page.getByRole('button', { name: 'Save' }).click();

    // Task should appear in list
    await expect(page.getByText('Write product spec')).toBeVisible();
  });

  test('P0: Complete task updates progress', async ({ page }) => {
    await page.goto('/projects');
    await page.getByText('Q1 Product Launch').click();

    // Get initial progress
    const progressBefore = await page.getByTestId('progress-bar').getAttribute('aria-valuenow');

    // Complete a task
    const taskCheckbox = page.getByRole('checkbox', { name: 'Write product spec' });
    await taskCheckbox.check();

    // Progress should increase
    await expect(async () => {
      const progressAfter = await page.getByTestId('progress-bar').getAttribute('aria-valuenow');
      expect(Number(progressAfter)).toBeGreaterThan(Number(progressBefore));
    }).toPass({ timeout: 5000 });
  });

  test('P1: Archive completed project', async ({ page }) => {
    await page.goto('/projects');
    await page.getByText('Q1 Product Launch').click();

    // Open project menu
    await page.getByRole('button', { name: 'Project Actions' }).click();
    await page.getByRole('menuitem', { name: 'Archive' }).click();

    // Confirm
    await page.getByRole('button', { name: 'Archive Project' }).click();

    // Project should move to archives
    await expect(page.getByText('Project archived')).toBeVisible();

    // Navigate to archives
    await page.goto('/archives');
    await expect(page.getByText('Q1 Product Launch')).toBeVisible();
  });
});
```

### Journey 7: Contacts Database

**Scenario:** User manages contacts with semantic search

```typescript
// tests/e2e/contacts.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Contacts', () => {
  test('P0: Create new contact', async ({ page }) => {
    await page.goto('/resources/contacts');

    await page.getByRole('button', { name: 'Add Contact' }).click();

    await page.getByLabel('Name').fill('John Smith');
    await page.getByLabel('Email').fill('john.smith@techcorp.com');
    await page.getByLabel('Company').fill('TechCorp');
    await page.getByLabel('Title').fill('Product Manager');
    await page.getByLabel('Notes').fill('Met at TechConf 2025, interested in AI tools');

    await page.getByRole('button', { name: 'Save Contact' }).click();

    await expect(page.getByText('John Smith')).toBeVisible();
  });

  test('P0: Search contacts by name', async ({ page }) => {
    await page.goto('/resources/contacts');

    await page.getByPlaceholder('Search contacts...').fill('John');

    await expect(page.getByText('John Smith')).toBeVisible();
  });

  test('P1: Semantic search finds contacts by context', async ({ page }) => {
    await page.goto('/chat');

    const chatInput = page.getByPlaceholder('Ask Orion anything...');
    await chatInput.fill('Find the designer I met at TechConf');
    await page.keyboard.press('Enter');

    // Should find contact based on notes
    await expect(page.getByTestId('contact-card')).toBeVisible({ timeout: 15000 });
  });

  test('P1: View interaction history', async ({ page }) => {
    await page.goto('/resources/contacts');
    await page.getByText('John Smith').click();

    // Contact detail view
    await expect(page.getByTestId('contact-detail')).toBeVisible();

    // Interaction history section
    await expect(page.getByText('Recent Interactions')).toBeVisible();
  });
});
```

### Journey 8: Preferences & Settings

**Scenario:** User configures preferences

```typescript
// tests/e2e/settings.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test('P0: View and edit preferences', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // Tabs should be visible
    await expect(page.getByRole('tab', { name: 'General' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Connections' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Preferences' })).toBeVisible();
  });

  test('P0: Manage tool connections', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('tab', { name: 'Connections' }).click();

    // Should show connection cards
    await expect(page.getByTestId('connection-gmail')).toBeVisible();
    await expect(page.getByTestId('connection-calendar')).toBeVisible();
    await expect(page.getByTestId('connection-slack')).toBeVisible();
  });

  test('P1: Disconnect and reconnect service', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('tab', { name: 'Connections' }).click();

    // Disconnect Gmail
    const gmailCard = page.getByTestId('connection-gmail');
    await gmailCard.getByRole('button', { name: 'Disconnect' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Status should update
    await expect(gmailCard.getByText('Not connected')).toBeVisible();

    // Reconnect
    await gmailCard.getByRole('button', { name: 'Connect' }).click();
    // OAuth flow would open in browser
  });
});
```

### Journey 9: A2UI Canvas Rendering

**Scenario:** Dynamic canvas content generated by agents

```typescript
// tests/e2e/canvas.spec.ts

import { test, expect } from '@playwright/test';

test.describe('A2UI Canvas', () => {
  test('P0: Canvas renders email composer', async ({ page }) => {
    await page.goto('/chat');

    const chatInput = page.getByPlaceholder('Ask Orion anything...');
    await chatInput.fill('Help me write an email');
    await page.keyboard.press('Enter');

    // Canvas should update with email composer
    await expect(page.getByTestId('canvas-panel')).toBeVisible();
    await expect(page.getByTestId('email-composer')).toBeVisible({ timeout: 15000 });

    // Composer should have all fields
    await expect(page.getByLabel('To')).toBeVisible();
    await expect(page.getByLabel('Subject')).toBeVisible();
    await expect(page.getByTestId('rich-text-editor')).toBeVisible();
  });

  test('P0: Canvas renders calendar view', async ({ page }) => {
    await page.goto('/chat');

    const chatInput = page.getByPlaceholder('Ask Orion anything...');
    await chatInput.fill('Show my calendar');
    await page.keyboard.press('Enter');

    await expect(page.getByTestId('canvas-calendar')).toBeVisible({ timeout: 15000 });

    // Calendar should have navigation
    await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  });

  test('P1: Canvas actions trigger agent responses', async ({ page }) => {
    await page.goto('/chat');

    // Trigger email composer
    const chatInput = page.getByPlaceholder('Ask Orion anything...');
    await chatInput.fill('Draft email to test@example.com');
    await page.keyboard.press('Enter');

    await expect(page.getByTestId('email-composer')).toBeVisible({ timeout: 15000 });

    // Click send in canvas
    await page.getByRole('button', { name: 'Send' }).click();

    // Agent should respond with confirmation
    await expect(page.getByText(/sent|delivered/i)).toBeVisible({ timeout: 10000 });
  });
});
```

### Journey 10: Semantic Memory Recall

**Scenario:** System recalls relevant memories

```typescript
// tests/e2e/memory.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Semantic Memory', () => {
  test('P1: Preferences persist across sessions', async ({ page }) => {
    await page.goto('/chat');

    // Set a preference
    const chatInput = page.getByPlaceholder('Ask Orion anything...');
    await chatInput.fill('I prefer meetings in the morning');
    await page.keyboard.press('Enter');

    await expect(page.getByTestId('assistant-message')).toBeVisible({ timeout: 15000 });

    // Refresh and ask related question
    await page.reload();

    await chatInput.fill('When should we schedule the meeting?');
    await page.keyboard.press('Enter');

    // Should reference morning preference
    await expect(page.getByText(/morning/i)).toBeVisible({ timeout: 15000 });
  });

  test('P1: Memory viewer shows stored learnings', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('tab', { name: 'Memory' }).click();

    await expect(page.getByText('Stored Memories')).toBeVisible();

    // Should list memories with types
    await expect(page.getByTestId('memory-item')).toBeVisible();
  });

  test('P2: User can delete specific memories', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('tab', { name: 'Memory' }).click();

    const memoryItem = page.getByTestId('memory-item').first();
    await memoryItem.getByRole('button', { name: 'Delete' }).click();

    await page.getByRole('button', { name: 'Confirm Delete' }).click();

    await expect(page.getByText('Memory deleted')).toBeVisible();
  });
});
```

---

## Unit Test Specifications

### 1. Triage Logic Tests

```typescript
// tests/unit/triage/priority.test.ts

import { describe, it, expect } from 'vitest';
import { calculatePriority, PriorityFactors } from '@/lib/triage/priority';

describe('Priority Calculation', () => {
  describe('VIP Contact Boost', () => {
    it('should increase score for VIP contacts', () => {
      const factors: PriorityFactors = {
        isVip: true,
        urgencySignals: 0,
        actionRequired: false,
        staleness: 0,
      };

      const score = calculatePriority(factors);
      expect(score).toBeGreaterThan(0.5);
    });

    it('should not boost non-VIP contacts', () => {
      const factors: PriorityFactors = {
        isVip: false,
        urgencySignals: 0,
        actionRequired: false,
        staleness: 0,
      };

      const score = calculatePriority(factors);
      expect(score).toBeLessThan(0.5);
    });
  });

  describe('Urgency Signal Detection', () => {
    it('should detect "URGENT" keyword', () => {
      const content = 'URGENT: Need this by EOD';
      const signals = detectUrgencySignals(content);
      expect(signals).toBeGreaterThan(0);
    });

    it('should detect "ASAP" keyword', () => {
      const content = 'Please respond ASAP';
      const signals = detectUrgencySignals(content);
      expect(signals).toBeGreaterThan(0);
    });

    it('should detect deadline mentions', () => {
      const content = 'Need this by tomorrow 5pm';
      const signals = detectUrgencySignals(content);
      expect(signals).toBeGreaterThan(0);
    });

    it('should combine multiple signals', () => {
      const content = 'URGENT: Need ASAP by EOD';
      const signals = detectUrgencySignals(content);
      expect(signals).toBeGreaterThan(2);
    });
  });

  describe('Action Extraction', () => {
    it('should extract task from question', () => {
      const content = 'Can you review the attached proposal?';
      const actions = extractActions(content);

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('task');
      expect(actions[0].action).toContain('review');
    });

    it('should extract meeting request', () => {
      const content = 'Can we schedule a call for next week?';
      const actions = extractActions(content);

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('meeting');
    });

    it('should extract multiple actions', () => {
      const content = 'Please review the doc and schedule a follow-up';
      const actions = extractActions(content);

      expect(actions.length).toBeGreaterThanOrEqual(2);
    });
  });
});
```

### 2. Database Repository Tests

```typescript
// tests/unit/repositories/contacts.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ContactRepository } from '@/lib/database/repositories/contacts';
import { createTestDb, destroyTestDb } from '../helpers/db';

describe('ContactRepository', () => {
  let db: TestDb;
  let repo: ContactRepository;

  beforeEach(async () => {
    db = await createTestDb();
    repo = new ContactRepository(db);
  });

  afterEach(async () => {
    await destroyTestDb(db);
  });

  describe('create', () => {
    it('should create contact with required fields', async () => {
      const contact = await repo.create({
        name: 'John Doe',
        email: 'john@example.com',
      });

      expect(contact.id).toMatch(/^cont_/);
      expect(contact.name).toBe('John Doe');
    });

    it('should generate embedding for searchable contacts', async () => {
      const contact = await repo.create({
        name: 'John Doe',
        notes: 'Designer from TechConf',
      });

      expect(contact.embedding).toBeDefined();
      expect(contact.embedding.length).toBe(1024);
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await repo.create({ name: 'John Smith', notes: 'Designer from TechConf' });
      await repo.create({ name: 'Jane Doe', notes: 'Engineer from StartupCon' });
    });

    it('should find contacts by name', async () => {
      const results = await repo.search({ query: 'John' });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('John Smith');
    });

    it('should find contacts by semantic search', async () => {
      const results = await repo.search({
        query: 'the designer I met at a conference',
        semantic: true,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('John Smith');
    });
  });

  describe('updateInteraction', () => {
    it('should update last interaction timestamp', async () => {
      const contact = await repo.create({ name: 'John' });

      await repo.updateInteraction(contact.id, 'email');

      const updated = await repo.findById(contact.id);
      expect(updated.last_interaction_at).toBeDefined();
      expect(updated.interaction_count).toBe(1);
    });
  });
});
```

### 3. A2UI Renderer Tests

```typescript
// tests/unit/a2ui/renderer.test.tsx

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { A2UIRenderer } from '@/lib/a2ui/renderer';

describe('A2UIRenderer', () => {
  it('should render card component', () => {
    const payload = {
      version: '0.8',
      components: [
        {
          id: 'card-1',
          type: 'card',
          props: {
            title: 'Test Card',
            description: 'Card content',
          },
        },
      ],
    };

    render(<A2UIRenderer payload={payload} />);

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should render email composer', () => {
    const payload = {
      version: '0.8',
      components: [
        {
          id: 'email-1',
          type: 'email-composer',
          props: {
            to: 'test@example.com',
            subject: 'Hello',
          },
        },
      ],
    };

    render(<A2UIRenderer payload={payload} />);

    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument();
  });

  it('should handle button actions', async () => {
    const onAction = vi.fn();
    const payload = {
      version: '0.8',
      components: [
        {
          id: 'btn-1',
          type: 'button',
          props: {
            label: 'Click Me',
            action: { type: 'send_email', data: { to: 'test@example.com' } },
          },
        },
      ],
    };

    render(<A2UIRenderer payload={payload} onAction={onAction} />);

    await screen.getByText('Click Me').click();

    expect(onAction).toHaveBeenCalledWith({
      type: 'send_email',
      data: { to: 'test@example.com' },
    });
  });

  it('should render nested components', () => {
    const payload = {
      version: '0.8',
      components: [
        {
          id: 'container-1',
          type: 'container',
          props: { direction: 'vertical' },
        },
        {
          id: 'text-1',
          type: 'text',
          parentId: 'container-1',
          props: { content: 'Nested text' },
        },
      ],
    };

    render(<A2UIRenderer payload={payload} />);

    expect(screen.getByText('Nested text')).toBeInTheDocument();
  });
});
```

### 4. Composio Client Tests

```typescript
// tests/unit/composio/client.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComposioClient } from '@/lib/composio/client';

describe('ComposioClient', () => {
  let client: ComposioClient;

  beforeEach(() => {
    client = new ComposioClient({ sessionId: 'test-session' });
  });

  describe('searchTools', () => {
    it('should return tools matching query', async () => {
      const tools = await client.searchTools('send email');

      expect(tools.length).toBeGreaterThan(0);
      expect(tools.some(t => t.slug.includes('GMAIL'))).toBe(true);
    });
  });

  describe('executeMulti', () => {
    it('should execute multiple tools in parallel', async () => {
      const results = await client.executeMulti([
        { tool_slug: 'GMAIL_GET_PROFILE', arguments: {} },
        { tool_slug: 'GOOGLECALENDAR_GET_CALENDAR', arguments: {} },
      ]);

      expect(results).toHaveLength(2);
    });

    it('should handle partial failures gracefully', async () => {
      const results = await client.executeMulti([
        { tool_slug: 'GMAIL_GET_PROFILE', arguments: {} },
        { tool_slug: 'INVALID_TOOL', arguments: {} },
      ]);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBeDefined();
    });
  });

  describe('manageConnections', () => {
    it('should check connection status', async () => {
      const status = await client.manageConnections(['gmail']);

      expect(status.gmail).toBeDefined();
      expect(['active', 'inactive', 'pending']).toContain(status.gmail.status);
    });
  });
});
```

### 5. Agent Routing Tests

```typescript
// tests/unit/agent/routing.test.ts

import { describe, it, expect } from 'vitest';
import { routeToAgent, detectIntent } from '@/lib/agent/routing';

describe('Agent Routing', () => {
  describe('detectIntent', () => {
    it('should detect scheduling intent', () => {
      const intent = detectIntent('Schedule a meeting with John tomorrow');
      expect(intent.type).toBe('schedule');
    });

    it('should detect email intent', () => {
      const intent = detectIntent('Send an email to the team about the update');
      expect(intent.type).toBe('email');
    });

    it('should detect triage intent', () => {
      const intent = detectIntent("What's in my inbox?");
      expect(intent.type).toBe('triage');
    });

    it('should default to butler for unclear intents', () => {
      const intent = detectIntent('Help me think through this problem');
      expect(intent.type).toBe('general');
    });
  });

  describe('routeToAgent', () => {
    it('should route scheduling to scheduler agent', () => {
      const config = routeToAgent({ type: 'schedule', entities: [] });
      expect(config.agent).toBe('scheduler');
    });

    it('should route email to communicator agent', () => {
      const config = routeToAgent({ type: 'email', entities: [] });
      expect(config.agent).toBe('communicator');
    });

    it('should include relevant context in routing', () => {
      const config = routeToAgent({
        type: 'schedule',
        entities: [{ type: 'contact', name: 'John' }],
      });

      expect(config.context).toContain('John');
    });
  });
});
```

---

## Integration Test Specifications

### 1. Composio Integration Tests

```typescript
// tests/integration/composio.test.ts

import { describe, it, expect, beforeAll } from 'vitest';
import { setupMSW } from '../mocks/server';
import { gmail, calendar, slack } from '@/lib/composio';

describe('Composio Integration', () => {
  beforeAll(() => setupMSW());

  describe('Gmail', () => {
    it('should fetch emails with pagination', async () => {
      const result = await gmail.getEmails({
        maxResults: 10,
        pageToken: undefined,
      });

      expect(result.success).toBe(true);
      expect(result.data.messages.length).toBeLessThanOrEqual(10);
    });

    it('should send email with attachments', async () => {
      const result = await gmail.sendEmail({
        to: 'test@example.com',
        subject: 'Test with attachment',
        body: 'See attached.',
        attachments: [
          {
            filename: 'test.txt',
            content: 'VGVzdCBjb250ZW50', // base64
            mimeType: 'text/plain',
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it('should search emails by query', async () => {
      const result = await gmail.searchEmails({
        query: 'from:important@example.com',
        maxResults: 5,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Calendar', () => {
    it('should create event with attendees', async () => {
      const result = await calendar.createEvent({
        summary: 'Test Meeting',
        start: '2026-01-20T10:00:00Z',
        end: '2026-01-20T11:00:00Z',
        attendees: ['john@example.com'],
      });

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
    });

    it('should find free/busy times', async () => {
      const result = await calendar.getFreeBusy({
        timeMin: '2026-01-20T00:00:00Z',
        timeMax: '2026-01-20T23:59:59Z',
        items: [{ id: 'primary' }],
      });

      expect(result.success).toBe(true);
      expect(result.data.calendars).toBeDefined();
    });
  });

  describe('Slack', () => {
    it('should send message to channel', async () => {
      const result = await slack.sendMessage({
        channel: '#general',
        text: 'Test message from Orion',
      });

      expect(result.success).toBe(true);
    });

    it('should search messages', async () => {
      const result = await slack.searchMessages({
        query: 'project update',
        count: 10,
      });

      expect(result.success).toBe(true);
    });
  });
});
```

### 2. Database Integration Tests

```typescript
// tests/integration/database.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Database } from '@/lib/database';
import { ContactRepository } from '@/lib/database/repositories/contacts';
import { ProjectRepository } from '@/lib/database/repositories/projects';

describe('Database Integration', () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.connect(':memory:');
    await db.migrate();
  });

  afterAll(async () => {
    await db.close();
  });

  describe('Cross-table queries', () => {
    it('should link contacts to projects', async () => {
      const contacts = new ContactRepository(db);
      const projects = new ProjectRepository(db);

      const contact = await contacts.create({ name: 'John' });
      const project = await projects.create({
        name: 'Test Project',
        stakeholders: [{ contact_id: contact.id, role: 'owner' }],
      });

      const projectWithStakeholders = await projects.findWithStakeholders(project.id);
      expect(projectWithStakeholders.stakeholders[0].contact.name).toBe('John');
    });

    it('should cascade delete tasks when project deleted', async () => {
      const projects = new ProjectRepository(db);
      const tasks = new TaskRepository(db);

      const project = await projects.create({ name: 'To Delete' });
      await tasks.create({ title: 'Task 1', project_id: project.id });
      await tasks.create({ title: 'Task 2', project_id: project.id });

      await projects.delete(project.id);

      const remainingTasks = await tasks.findByProject(project.id);
      expect(remainingTasks).toHaveLength(0);
    });
  });

  describe('Full-text search', () => {
    it('should search contacts with FTS', async () => {
      const contacts = new ContactRepository(db);

      await contacts.create({ name: 'Alice Designer', notes: 'UX specialist' });
      await contacts.create({ name: 'Bob Engineer', notes: 'Backend developer' });

      const results = await contacts.fullTextSearch('designer');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Alice Designer');
    });
  });

  describe('Vector search', () => {
    it('should find semantically similar items', async () => {
      const contacts = new ContactRepository(db);

      await contacts.create({
        name: 'Sarah',
        notes: 'Product manager at tech startup, interested in AI',
      });
      await contacts.create({
        name: 'Mike',
        notes: 'Sales representative for enterprise software',
      });

      const results = await contacts.semanticSearch('AI product person');
      expect(results[0].name).toBe('Sarah');
    });
  });
});
```

### 3. Agent Integration Tests

```typescript
// tests/integration/agent.test.ts

import { describe, it, expect, beforeAll } from 'vitest';
import { setupMSW } from '../mocks/server';
import { OrionAgentClient } from '@/lib/agent/client';

describe('Agent Integration', () => {
  let agent: OrionAgentClient;

  beforeAll(() => {
    setupMSW();
    agent = new OrionAgentClient();
  });

  describe('Basic chat', () => {
    it('should stream response', async () => {
      const chunks: string[] = [];

      await agent.streamChat(
        'Hello, Orion',
        (chunk) => chunks.push(chunk),
      );

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.join('')).toBeTruthy();
    });
  });

  describe('Tool execution', () => {
    it('should execute tool and return result', async () => {
      const response = await agent.chat('What time is it?');

      // Agent should use a tool
      expect(response.toolCalls).toBeDefined();
    });
  });

  describe('Context injection', () => {
    it('should include user context in prompts', async () => {
      const context = {
        user: { name: 'Test User' },
        projects: [{ name: 'Project A' }],
      };

      const response = await agent.chat('What am I working on?', { context });

      // Response should reference the project
      expect(response.message.toLowerCase()).toContain('project');
    });
  });
});
```

---

## Manual Testing Checklist

### Pre-Release Checklist (P0)

- [ ] **App Launch**
  - [ ] App launches without crash on macOS 14+
  - [ ] First launch shows onboarding flow
  - [ ] Subsequent launches go directly to chat
  - [ ] App icon appears in dock and menu bar

- [ ] **Chat Functionality**
  - [ ] Can type and send messages
  - [ ] Responses stream in real-time
  - [ ] Thinking indicator shows while processing
  - [ ] Messages persist after page refresh
  - [ ] Cmd+Enter sends message
  - [ ] Long messages don't break layout

- [ ] **Gmail Integration**
  - [ ] OAuth flow completes successfully
  - [ ] "Check my email" returns recent emails
  - [ ] Email content displays correctly
  - [ ] Can compose and send email
  - [ ] Draft saves before sending

- [ ] **Calendar Integration**
  - [ ] OAuth flow completes successfully
  - [ ] "Show my calendar" displays events
  - [ ] Can create new events via chat
  - [ ] Event appears in Google Calendar

- [ ] **Inbox Triage**
  - [ ] Unified inbox shows items from all sources
  - [ ] Priority scores display correctly
  - [ ] Can file item to project
  - [ ] Can archive items (single and bulk)

- [ ] **Projects**
  - [ ] Can create new project
  - [ ] Can add tasks to project
  - [ ] Task completion updates progress
  - [ ] Can archive completed project

- [ ] **Contacts**
  - [ ] Can create new contact
  - [ ] Contact search works
  - [ ] Contact card displays correctly

### Extended Checklist (P1/P2)

- [ ] **Canvas (A2UI)**
  - [ ] Email composer renders correctly
  - [ ] Calendar view renders correctly
  - [ ] Form inputs work
  - [ ] Buttons trigger actions

- [ ] **Memory**
  - [ ] Preferences persist across sessions
  - [ ] Memory viewer shows stored items
  - [ ] Can delete memories

- [ ] **Settings**
  - [ ] Can view all settings tabs
  - [ ] Can disconnect/reconnect services
  - [ ] Preferences save correctly

- [ ] **Error Handling**
  - [ ] Network errors show retry option
  - [ ] Invalid input shows validation error
  - [ ] OAuth failures show reconnect option

- [ ] **Performance**
  - [ ] App starts in < 5 seconds
  - [ ] Messages send in < 500ms
  - [ ] Scroll is smooth in long lists

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml

name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  TEST_ANTHROPIC_KEY: ${{ secrets.TEST_ANTHROPIC_KEY }}

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:unit

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run migrations
        run: pnpm db:migrate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/orion_test

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/orion_test

  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install agent-browser
        run: |
          npm install -g agent-browser
          agent-browser install

      - name: Run E2E tests with agent-browser
        run: pnpm test:e2e
        env:
          TEST_ANTHROPIC_KEY: ${{ secrets.TEST_ANTHROPIC_KEY }}

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: e2e-test-results
          path: test-results/
          retention-days: 7

  build-test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Install dependencies
        run: pnpm install

      - name: Build app
        run: pnpm tauri build
        env:
          TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}

      - name: Verify DMG
        run: |
          ls -la src-tauri/target/release/bundle/dmg/
          file src-tauri/target/release/bundle/dmg/*.dmg
```

### Test Scripts in package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --coverage",
    "test:integration": "vitest run tests/integration/",
    "test:e2e": "vitest run tests/e2e/ --testTimeout=60000",
    "test:e2e:headed": "AGENT_BROWSER_HEADED=1 vitest run tests/e2e/",
    "test:all": "pnpm test:unit && pnpm test:integration && pnpm test:e2e"
  }
}
```

---

## Test Priority Matrix

| Test Category | P0 (Blocks Release) | P1 (Should Pass) | P2 (Nice to Have) |
|---------------|---------------------|------------------|-------------------|
| **Onboarding** | Complete flow, API key validation | Skip steps, error recovery | Animation smoothness |
| **Chat** | Send/receive, streaming | History persistence, shortcuts | Multi-conversation |
| **Gmail** | Fetch, send email | Search, drafts | Attachments, labels |
| **Calendar** | View, create event | Availability check | Recurring events |
| **Inbox** | Display, file, archive | Priority scoring | Bulk actions |
| **Projects** | Create, add tasks | Progress tracking | Archive/restore |
| **Contacts** | Create, search | Semantic search | Interaction history |
| **Canvas** | Email composer, calendar | Forms, buttons | Complex layouts |
| **Memory** | - | Preference persistence | Memory management |
| **Settings** | Connection status | Connect/disconnect | All preferences |

---

## Coverage Goals by Phase

### MVP (Week 12)

| Metric | Target |
|--------|--------|
| Unit test coverage | 60% |
| Integration test coverage | 50% |
| E2E tests passing | 100% of P0 |
| Manual checklist | 100% of P0 |

### Post-MVP (Week 14+)

| Metric | Target |
|--------|--------|
| Unit test coverage | 80% |
| Integration test coverage | 70% |
| E2E tests passing | 100% of P0 + P1 |
| Manual checklist | 100% of P0 + P1 |

---

## Risk-Based Test Prioritization

### Highest Risk Areas (Test First)

1. **Claude API Integration** - Core functionality, external dependency
2. **Composio OAuth Flow** - External auth, user-blocking if fails
3. **SQLite Data Persistence** - Data loss risk
4. **Chat Streaming** - Core UX, timing-sensitive

### Medium Risk Areas

5. **A2UI Canvas Rendering** - Complex UI, edge cases
6. **Priority Scoring Algorithm** - Business logic accuracy
7. **Memory Recall** - Semantic search accuracy
8. **Cross-session State** - State management complexity

### Lower Risk Areas

9. **Settings UI** - Simpler flows
10. **Archive/Restore** - Less frequently used
11. **Bulk Actions** - Power user feature
12. **Keyboard Shortcuts** - Enhancement feature

---

## References

- MVP Plan: `thoughts/shared/plans/PLAN-orion-mvp.md`
- Tech Spec Testing Section: `docs/TECH-SPEC-orion-personal-butler.md#13-testing-strategy`
- PRD Requirements: `docs/PRD-orion-personal-butler.md#4-user-stories--jobs-to-be-done`
- Database Schema: `docs/TECH-SPEC-orion-personal-butler.md#4-database-design`
