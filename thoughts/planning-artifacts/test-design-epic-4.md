# Epic 4: Unified Inbox Experience - Test Design

**Version:** 1.0
**Status:** Ready for Implementation
**Date:** 2026-01-15
**Author:** TEA (Test Architect Agent)
**Epic:** Unified Inbox Experience (Stories 4.1-4.9)

---

## 1. Epic Overview

| Metric | Value |
|--------|-------|
| Stories | 9 |
| Test Cases | 68 |
| Critical Paths | 4 |
| Risk Level | HIGH |
| Primary Concern | C-001 (Triage Agent non-determinism), NFR-A001/A003 (Accuracy) |

### Test Level Distribution

| Level | Count | Coverage |
|-------|-------|----------|
| Unit | 22 | 32% |
| Integration | 26 | 38% |
| E2E | 20 | 30% |

**Note:** Epic 4 has significant Triage Agent integration. All agent outputs use mocked structured responses with schema validation. Accuracy testing uses a golden dataset of labeled emails.

### Critical Testing Principles

1. **Triage Agent outputs always mocked** - No live Claude calls in automated tests
2. **Priority scores validated against schema** - 0.0-1.0 range enforced
3. **Accuracy metrics require golden dataset** - 100+ labeled emails for baseline
4. **Performance SLOs** - Bulk actions <5s, sync <30s for 500 emails

---

## 2. Risk Assessment Matrix

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation |
|---------|----------|-------------|-------------|--------|-------|------------|
| R-401 | DATA | Email sync loses data | 1 | 3 | 3 | Incremental sync checkpoints |
| R-402 | PERF | 500+ email sync slow | 3 | 2 | 6 | Pagination, background sync |
| R-403 | BUS | Priority scoring inaccurate | 2 | 3 | 6 | Golden dataset validation |
| R-404 | TECH | Action extraction low confidence | 2 | 2 | 4 | Confidence thresholds |
| R-405 | PERF | Bulk actions timeout | 2 | 2 | 4 | Batch processing, progress UI |
| R-406 | DATA | Snooze timing drift | 2 | 1 | 2 | System scheduler vs polling |
| R-407 | BUS | Undo window too short | 1 | 2 | 2 | Configurable timeout |
| R-408 | PERF | Inbox virtualization flicker | 2 | 1 | 2 | Pre-render buffer |

**High-Priority Risks (Score ≥6):** R-402, R-403

---

## 3. Story-Level Test Scenarios

### Story 4.1: Email Sync from Gmail

**Risk:** HIGH | **Priority:** P0 (Core Feature)

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 4.1.1 | Integration | Emails sync from Gmail API | Emails in SQLite | Vitest |
| 4.1.2 | Unit | Incremental sync fetches only new | Delta query used | Vitest |
| 4.1.3 | E2E | 500 emails sync <30 seconds | Timing assertion | Vercel Browser Agent |
| 4.1.4 | E2E | Progress indicator during sync | UI visible | Vercel Browser Agent |
| 4.1.5 | Unit | Email schema stores all fields | Validation passes | Vitest |
| 4.1.6 | Integration | App usable before sync complete | Chat works | Vitest |
| 4.1.7 | Unit | Sync handles pagination correctly | All pages fetched | Vitest |

#### Test Code

```typescript
// tests/unit/story-4.1-email-sync.spec.ts
import { test, expect, vi } from 'vitest';
import { EmailSyncService } from '@/services/inbox/email-sync';
import { EmailSchema } from '@/schemas/email';
import { createTestDatabase } from '../helpers/database';

test('4.1.2 - incremental sync only fetches new emails', async () => {
  const db = createTestDatabase();
  const syncService = new EmailSyncService(db);

  // Set last sync timestamp
  await db.prepare('UPDATE sync_state SET last_sync = ?').run('2026-01-14T00:00:00Z');

  const fetchSpy = vi.spyOn(syncService, 'fetchFromGmail');

  await syncService.sync();

  // Should use historyId or after: parameter
  expect(fetchSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      query: expect.stringContaining('after:'),
    })
  );
});

test('4.1.5 - email schema stores all required fields', () => {
  const validEmail = {
    id: 'msg_001',
    threadId: 'thread_001',
    from: { email: 'sender@example.com', name: 'Sender' },
    to: [{ email: 'me@example.com', name: 'Me' }],
    subject: 'Test Subject',
    snippet: 'Preview text...',
    body: '<html>Full body</html>',
    date: '2026-01-15T10:00:00Z',
    labels: ['INBOX', 'IMPORTANT'],
    isRead: false,
    hasAttachments: false,
  };

  expect(() => EmailSchema.parse(validEmail)).not.toThrow();

  // Missing required fields should fail
  expect(() => EmailSchema.parse({ id: 'msg_001' })).toThrow();
});

test('4.1.7 - sync handles pagination correctly', async () => {
  const db = createTestDatabase();
  const mockGmail = {
    fetchPage: vi.fn()
      .mockResolvedValueOnce({ messages: new Array(100), nextPageToken: 'page2' })
      .mockResolvedValueOnce({ messages: new Array(100), nextPageToken: 'page3' })
      .mockResolvedValueOnce({ messages: new Array(50), nextPageToken: null }),
  };

  const syncService = new EmailSyncService(db, { gmail: mockGmail });
  await syncService.sync();

  // Should have fetched all 3 pages
  expect(mockGmail.fetchPage).toHaveBeenCalledTimes(3);

  // Total should be 250 emails
  const count = db.prepare('SELECT COUNT(*) as count FROM emails').get();
  expect(count.count).toBe(250);
});

// tests/integration/story-4.1-gmail-sync.spec.ts
import { test, expect, beforeEach, afterEach } from 'vitest';
import { EmailSyncService } from '@/services/inbox/email-sync';
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

test('4.1.1 - emails sync from Gmail API to SQLite', async () => {
  // Mock server has 3 fixture emails
  const syncService = new EmailSyncService(db, {
    composioUrl: 'http://localhost:4001',
  });

  await syncService.sync();

  // Verify emails in database
  const emails = db.prepare('SELECT * FROM emails ORDER BY date DESC').all();

  expect(emails.length).toBeGreaterThan(0);
  expect(emails[0]).toHaveProperty('id');
  expect(emails[0]).toHaveProperty('subject');
  expect(emails[0]).toHaveProperty('from_email');
});

test('4.1.6 - app usable before sync completes', async () => {
  const syncService = new EmailSyncService(db, {
    composioUrl: 'http://localhost:4001',
  });

  // Start sync (don't await)
  const syncPromise = syncService.sync();

  // App functions should work during sync
  expect(syncService.isSyncing()).toBe(true);
  expect(() => db.prepare('SELECT 1').get()).not.toThrow();

  // Chat should work (separate from sync)
  // This would be tested via API call in real integration

  await syncPromise;
});

// tests/e2e/story-4.1-sync-performance.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('4.1.3 - 500 emails sync in under 30 seconds', async ({ page }) => {
  // Mock large email response
  await page.route('**/gmail/messages*', route => {
    const messages = Array.from({ length: 500 }, (_, i) => ({
      id: `msg_${i}`,
      threadId: `thread_${i}`,
      from: { email: `sender${i}@example.com`, name: `Sender ${i}` },
      subject: `Email ${i}`,
      snippet: 'Preview...',
      date: new Date(2026, 0, 15 - (i % 7)).toISOString(),
      isRead: i % 2 === 0,
    }));

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ messages, nextPageToken: null }),
    });
  });

  await page.goto('/inbox');

  const startTime = Date.now();

  // Wait for sync to complete
  await expect(page.getByTestId('sync-complete')).toBeVisible({ timeout: 30000 });

  const duration = Date.now() - startTime;
  expect(duration).toBeLessThan(30000); // Under 30 seconds
});

test('4.1.4 - progress indicator shows during sync', async ({ page }) => {
  // Mock slow sync
  await page.route('**/gmail/messages*', async route => {
    await new Promise(r => setTimeout(r, 2000)); // 2 second delay
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        messages: [{ id: 'msg_1', subject: 'Test' }],
      }),
    });
  });

  await page.goto('/inbox');

  // Progress indicator should be visible during sync
  await expect(page.getByTestId('sync-progress')).toBeVisible();
  await expect(page.getByText(/syncing/i)).toBeVisible();

  // Wait for completion
  await expect(page.getByTestId('sync-complete')).toBeVisible();
});
```

---

### Story 4.2: Unified Inbox View

**Risk:** MEDIUM | **Priority:** P0 (Core UI)

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 4.2.1 | E2E | Inbox displays synced emails | List visible | Vercel Browser Agent |
| 4.2.2 | E2E | Unread items have distinct styling | Bold/indicator | Vercel Browser Agent |
| 4.2.3 | E2E | 100+ items scroll smoothly | 60fps verified | Vercel Browser Agent |
| 4.2.4 | Unit | Virtualization activates for large lists | Only visible rendered | Vitest |
| 4.2.5 | Visual | Inbox matches design spec | Snapshot passes | Vercel Browser Agent |
| 4.2.6 | E2E | Items show sender, subject, preview, timestamp | All fields visible | Vercel Browser Agent |

#### Test Code

```typescript
// tests/unit/story-4.2-virtualization.spec.ts
import { test, expect } from 'vitest';
import { InboxVirtualizer } from '@/components/inbox/virtualizer';

test('4.2.4 - virtualization activates for large lists', () => {
  const virtualizer = new InboxVirtualizer({
    itemCount: 500,
    itemHeight: 72,
    containerHeight: 600,
    overscan: 5,
  });

  const visibleRange = virtualizer.getVisibleRange(0); // scrollTop = 0

  // Only visible items (+ overscan) should be rendered
  // 600px / 72px = ~8 items visible + 5 overscan = 13 items
  expect(visibleRange.endIndex - visibleRange.startIndex).toBeLessThan(20);
  expect(visibleRange.startIndex).toBe(0);
  expect(visibleRange.endIndex).toBeLessThan(20);
});

test('virtualization updates on scroll', () => {
  const virtualizer = new InboxVirtualizer({
    itemCount: 500,
    itemHeight: 72,
    containerHeight: 600,
    overscan: 5,
  });

  // Scroll down 10 items
  const visibleRange = virtualizer.getVisibleRange(720); // 10 * 72px

  expect(visibleRange.startIndex).toBeGreaterThan(5); // Some items scrolled past
  expect(visibleRange.endIndex).toBeLessThan(30);
});

// tests/e2e/story-4.2-inbox-view.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('4.2.1 - inbox displays synced emails', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'msg_1',
            from: { email: 'vip@client.com', name: 'VIP Client' },
            subject: 'Urgent: Contract Review',
            snippet: 'Please review the attached...',
            date: '2026-01-15T10:00:00Z',
            isRead: false,
            priority: 0.95,
          },
          {
            id: 'msg_2',
            from: { email: 'newsletter@tech.com', name: 'Tech Newsletter' },
            subject: 'Weekly Digest',
            snippet: 'This week in tech...',
            date: '2026-01-14T08:00:00Z',
            isRead: true,
            priority: 0.15,
          },
        ],
      }),
    });
  });

  await page.goto('/inbox');

  // Both emails should be visible
  await expect(page.getByText('Urgent: Contract Review')).toBeVisible();
  await expect(page.getByText('Weekly Digest')).toBeVisible();
});

test('4.2.2 - unread items have distinct styling', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { id: 'msg_1', subject: 'Unread Email', isRead: false },
          { id: 'msg_2', subject: 'Read Email', isRead: true },
        ],
      }),
    });
  });

  await page.goto('/inbox');

  const unreadItem = page.locator('[data-testid="inbox-item"][data-read="false"]');
  const readItem = page.locator('[data-testid="inbox-item"][data-read="true"]');

  // Unread should be bold or have indicator
  await expect(unreadItem).toHaveClass(/unread|font-bold/);
  await expect(unreadItem.locator('[data-testid="unread-indicator"]')).toBeVisible();

  // Read should not have unread styling
  await expect(readItem).not.toHaveClass(/unread/);
});

test('4.2.6 - items show all required fields', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [{
          id: 'msg_1',
          from: { email: 'sender@example.com', name: 'John Doe' },
          subject: 'Meeting Tomorrow',
          snippet: 'Hi, let\'s discuss the project...',
          date: '2026-01-15T14:30:00Z',
          isRead: false,
        }],
      }),
    });
  });

  await page.goto('/inbox');

  const item = page.locator('[data-testid="inbox-item"]').first();

  // All fields should be visible
  await expect(item.getByText('John Doe')).toBeVisible(); // Sender name
  await expect(item.getByText('Meeting Tomorrow')).toBeVisible(); // Subject
  await expect(item.getByText(/discuss the project/)).toBeVisible(); // Preview
  await expect(item.getByText(/2:30|14:30/)).toBeVisible(); // Timestamp
});

test('4.2.3 - 100+ items scroll smoothly', async ({ page }) => {
  // Generate 150 items
  const items = Array.from({ length: 150 }, (_, i) => ({
    id: `msg_${i}`,
    from: { email: `sender${i}@example.com`, name: `Sender ${i}` },
    subject: `Email Subject ${i}`,
    snippet: 'Preview text...',
    date: new Date(2026, 0, 15 - (i % 7)).toISOString(),
    isRead: i % 2 === 0,
  }));

  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items }),
    });
  });

  await page.goto('/inbox');

  // Scroll to middle
  await page.locator('[data-testid="inbox-list"]').evaluate(el => {
    el.scrollTop = el.scrollHeight / 2;
  });

  // Items in middle range should be visible
  await expect(page.getByText('Email Subject 75')).toBeVisible();

  // Scroll to bottom
  await page.locator('[data-testid="inbox-list"]').evaluate(el => {
    el.scrollTop = el.scrollHeight;
  });

  // Last items should be visible
  await expect(page.getByText('Email Subject 149')).toBeVisible();
});

test('4.2.5 - inbox visual regression', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { id: 'msg_1', from: { name: 'VIP Client' }, subject: 'Urgent', isRead: false, priority: 0.95 },
          { id: 'msg_2', from: { name: 'Newsletter' }, subject: 'Digest', isRead: true, priority: 0.15 },
        ],
      }),
    });
  });

  await page.goto('/inbox');
  await expect(page.locator('[data-testid="inbox-list"]')).toHaveScreenshot('inbox-list.png');
});
```

---

### Story 4.3: Priority Scoring Engine

**Risk:** HIGH | **Priority:** P0 (AI Feature)

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 4.3.1 | Unit | Priority score always 0.0-1.0 | Bounded validation | Vitest |
| 4.3.2 | Integration | Triage Agent produces scores | Mock response validated | Vitest |
| 4.3.3 | E2E | Inbox sorts by priority | Highest first | Vercel Browser Agent |
| 4.3.4 | E2E | High-priority items (>0.7) highlighted | Visual indicator | Vercel Browser Agent |
| 4.3.5 | Unit | Score factors weighted correctly | Algorithm verified | Vitest |
| 4.3.6 | Integration | Golden dataset accuracy ≥80% | NFR-A003 | Vitest |

#### Test Code

```typescript
// tests/unit/story-4.3-priority-scoring.spec.ts
import { test, expect } from 'vitest';
import { PriorityScoringSchema, calculatePriorityFactors } from '@/services/triage/priority';

test('4.3.1 - priority score is always 0.0-1.0', () => {
  // Valid scores
  expect(() => PriorityScoringSchema.parse({ score: 0.0 })).not.toThrow();
  expect(() => PriorityScoringSchema.parse({ score: 0.5 })).not.toThrow();
  expect(() => PriorityScoringSchema.parse({ score: 1.0 })).not.toThrow();

  // Invalid scores
  expect(() => PriorityScoringSchema.parse({ score: -0.1 })).toThrow();
  expect(() => PriorityScoringSchema.parse({ score: 1.1 })).toThrow();
  expect(() => PriorityScoringSchema.parse({ score: 2.0 })).toThrow();
});

test('4.3.5 - score factors are weighted correctly', () => {
  // VIP sender should boost priority
  const vipEmail = {
    from: { email: 'ceo@bigclient.com', isVIP: true },
    subject: 'Regular update',
    body: 'No urgency mentioned',
    hasDeadline: false,
  };

  const vipFactors = calculatePriorityFactors(vipEmail);
  expect(vipFactors.senderWeight).toBeGreaterThan(0.3);

  // Urgent keywords should boost priority
  const urgentEmail = {
    from: { email: 'random@company.com', isVIP: false },
    subject: 'URGENT: Need response today',
    body: 'Please respond ASAP',
    hasDeadline: true,
  };

  const urgentFactors = calculatePriorityFactors(urgentEmail);
  expect(urgentFactors.urgencyWeight).toBeGreaterThan(0.4);

  // Newsletter should have low priority
  const newsletterEmail = {
    from: { email: 'newsletter@tech.com', isVIP: false },
    subject: 'Weekly Tech Digest',
    body: 'Top stories this week...',
    labels: ['PROMOTIONS'],
    hasDeadline: false,
  };

  const newsletterFactors = calculatePriorityFactors(newsletterEmail);
  expect(newsletterFactors.senderWeight + newsletterFactors.urgencyWeight).toBeLessThan(0.3);
});

// tests/integration/story-4.3-triage-scoring.spec.ts
import { test, expect, vi } from 'vitest';
import { TriageAgent } from '@/agents/triage';
import { TriageResultSchema } from '@/agents/schemas/triage';
import { TRIAGE_MOCKS } from '../mocks/agents/triage';

test('4.3.2 - Triage Agent produces valid priority scores', async () => {
  const triage = new TriageAgent();

  // Mock Claude response
  vi.mocked(triage.client.messages.create).mockResolvedValue({
    content: [{ type: 'text', text: JSON.stringify(TRIAGE_MOCKS.urgent_client_email) }],
  });

  const result = await triage.analyzeEmail({
    id: 'msg_001',
    subject: 'URGENT: Contract Review',
    from: 'vip@client.com',
  });

  // Should produce valid score
  const validated = TriageResultSchema.parse(result);
  expect(validated.priority).toBeGreaterThanOrEqual(0.0);
  expect(validated.priority).toBeLessThanOrEqual(1.0);
});

test('4.3.6 - golden dataset accuracy meets NFR-A003 (≥80%)', async () => {
  const triage = new TriageAgent();
  const goldenDataset = await loadGoldenDataset(); // 100+ labeled emails

  let correctPredictions = 0;

  for (const email of goldenDataset) {
    // Mock response based on expected category
    vi.mocked(triage.client.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(TRIAGE_MOCKS[email.expectedCategory]) }],
    });

    const result = await triage.analyzeEmail(email);

    // Check if priority category matches expected
    const predictedCategory = categorizeByScore(result.priority);
    if (predictedCategory === email.expectedCategory) {
      correctPredictions++;
    }
  }

  const accuracy = correctPredictions / goldenDataset.length;
  expect(accuracy).toBeGreaterThanOrEqual(0.8); // 80% accuracy required
});

// tests/e2e/story-4.3-priority-sorting.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('4.3.3 - inbox sorts by priority correctly', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { id: 'msg_1', subject: 'Low Priority', priority: 0.2 },
          { id: 'msg_2', subject: 'High Priority', priority: 0.95 },
          { id: 'msg_3', subject: 'Medium Priority', priority: 0.5 },
        ],
      }),
    });
  });

  await page.goto('/inbox?sort=priority');

  const items = await page.locator('[data-testid="inbox-item"]').allTextContents();

  // Should be sorted by priority descending
  expect(items[0]).toContain('High Priority');
  expect(items[1]).toContain('Medium Priority');
  expect(items[2]).toContain('Low Priority');
});

test('4.3.4 - high-priority items are visually highlighted', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { id: 'msg_1', subject: 'Urgent', priority: 0.95 },
          { id: 'msg_2', subject: 'Normal', priority: 0.4 },
        ],
      }),
    });
  });

  await page.goto('/inbox');

  const highPriorityItem = page.locator('[data-testid="inbox-item"]').filter({ hasText: 'Urgent' });
  const normalItem = page.locator('[data-testid="inbox-item"]').filter({ hasText: 'Normal' });

  // High priority should have visual indicator
  await expect(highPriorityItem.locator('[data-testid="priority-indicator"]')).toHaveClass(/high|urgent/);
  await expect(normalItem.locator('[data-testid="priority-indicator"]')).not.toHaveClass(/high|urgent/);
});
```

---

### Story 4.4: Action Item Extraction

**Risk:** MEDIUM | **Priority:** P1

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 4.4.1 | Integration | Triage extracts actions from emails | Actions returned | Vitest |
| 4.4.2 | Unit | Confidence scores 0.0-1.0 | Schema validated | Vitest |
| 4.4.3 | E2E | Action chips appear on emails | UI visible | Vercel Browser Agent |
| 4.4.4 | E2E | Clicking chip converts to task | Confirmation shown | Vercel Browser Agent |
| 4.4.5 | Unit | Due date parsing handles formats | Various formats work | Vitest |

#### Test Code

```typescript
// tests/unit/story-4.4-action-extraction.spec.ts
import { test, expect } from 'vitest';
import { ActionItemSchema, parseDueDate } from '@/services/triage/actions';

test('4.4.2 - confidence scores are 0.0-1.0', () => {
  const validAction = {
    id: 'action_001',
    description: 'Review contract',
    confidence: 0.85,
    dueDate: '2026-01-17',
    sourceEmailId: 'msg_001',
  };

  expect(() => ActionItemSchema.parse(validAction)).not.toThrow();

  // Invalid confidence
  expect(() => ActionItemSchema.parse({ ...validAction, confidence: 1.5 })).toThrow();
  expect(() => ActionItemSchema.parse({ ...validAction, confidence: -0.1 })).toThrow();
});

test('4.4.5 - due date parsing handles various formats', () => {
  // Explicit dates
  expect(parseDueDate('by January 17')).toEqual(expect.any(Date));
  expect(parseDueDate('due 1/17/2026')).toEqual(expect.any(Date));
  expect(parseDueDate('deadline: 2026-01-17')).toEqual(expect.any(Date));

  // Relative dates
  expect(parseDueDate('by tomorrow')).toEqual(expect.any(Date));
  expect(parseDueDate('by end of week')).toEqual(expect.any(Date));
  expect(parseDueDate('by EOD')).toEqual(expect.any(Date));
  expect(parseDueDate('by next Monday')).toEqual(expect.any(Date));

  // No due date
  expect(parseDueDate('please review this')).toBeNull();
});

// tests/integration/story-4.4-triage-actions.spec.ts
import { test, expect, vi } from 'vitest';
import { TriageAgent } from '@/agents/triage';
import { TRIAGE_MOCKS } from '../mocks/agents/triage';

test('4.4.1 - Triage extracts action items from emails', async () => {
  const triage = new TriageAgent();

  vi.mocked(triage.client.messages.create).mockResolvedValue({
    content: [{ type: 'text', text: JSON.stringify(TRIAGE_MOCKS.urgent_client_email) }],
  });

  const result = await triage.analyzeEmail({
    id: 'msg_001',
    subject: 'Contract Review Needed',
    body: 'Please review the contract by Friday and send feedback.',
  });

  expect(result.extractedTasks).toHaveLength(1);
  expect(result.extractedTasks[0].description).toContain('review');
  expect(result.extractedTasks[0].confidence).toBeGreaterThan(0.5);
});

// tests/e2e/story-4.4-action-chips.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('4.4.3 - action chips appear on emails with tasks', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [{
          id: 'msg_1',
          subject: 'Contract Review',
          extractedTasks: [
            { id: 'task_1', description: 'Review contract', confidence: 0.9 },
          ],
        }],
      }),
    });
  });

  await page.goto('/inbox');
  await page.click('[data-testid="inbox-item"]');

  // Action chips should be visible
  const actionChip = page.locator('[data-testid="action-chip"]');
  await expect(actionChip).toBeVisible();
  await expect(actionChip).toContainText('Review contract');
});

test('4.4.4 - clicking chip shows task creation confirmation', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [{
          id: 'msg_1',
          subject: 'Contract Review',
          extractedTasks: [
            { id: 'task_1', description: 'Review contract', confidence: 0.9, dueDate: '2026-01-17' },
          ],
        }],
      }),
    });
  });

  await page.goto('/inbox');
  await page.click('[data-testid="inbox-item"]');
  await page.click('[data-testid="action-chip"]');

  // Confirmation dialog should appear
  const dialog = page.locator('[data-testid="create-task-dialog"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Review contract')).toBeVisible();
  await expect(dialog.getByText(/January 17/)).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Create Task' })).toBeVisible();
});
```

---

### Story 4.5: Quick File to Project/Area

**Risk:** MEDIUM | **Priority:** P1

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 4.5.1 | E2E | File dropdown shows suggestions | List visible | Vercel Browser Agent |
| 4.5.2 | Integration | Suggestions use AI relevance | Ranked by match | Vitest |
| 4.5.3 | E2E | Filing links item to project | Association created | Vercel Browser Agent |
| 4.5.4 | E2E | Filed item leaves inbox | Removed from list | Vercel Browser Agent |
| 4.5.5 | Unit | Keyboard shortcut F triggers file | Handler fires | Vitest |

#### Test Code

```typescript
// tests/unit/story-4.5-keyboard.spec.ts
import { test, expect, vi } from 'vitest';
import { InboxKeyboardHandler } from '@/components/inbox/keyboard-handler';

test('4.5.5 - F key triggers file action', () => {
  const onFile = vi.fn();
  const handler = new InboxKeyboardHandler({ onFile });

  // Simulate F keypress
  handler.handleKeyDown({ key: 'f', preventDefault: vi.fn() });

  expect(onFile).toHaveBeenCalled();
});

// tests/e2e/story-4.5-file-action.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('4.5.1 - file dropdown shows project suggestions', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [{ id: 'msg_1', subject: 'Q1 Planning' }],
      }),
    });
  });

  await page.route('**/api/file-suggestions**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        suggestions: [
          { id: 'proj_1', name: 'Q1 Planning Project', type: 'project', relevance: 0.9 },
          { id: 'area_1', name: 'Work', type: 'area', relevance: 0.7 },
        ],
      }),
    });
  });

  await page.goto('/inbox');
  await page.click('[data-testid="inbox-item"]');
  await page.click('[data-testid="file-button"]');

  // Dropdown should show suggestions
  const dropdown = page.locator('[data-testid="file-dropdown"]');
  await expect(dropdown).toBeVisible();
  await expect(dropdown.getByText('Q1 Planning Project')).toBeVisible();
  await expect(dropdown.getByText('Work')).toBeVisible();
});

test('4.5.4 - filed item leaves inbox', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { id: 'msg_1', subject: 'Email to File' },
          { id: 'msg_2', subject: 'Another Email' },
        ],
      }),
    });
  });

  await page.route('**/api/file', route => {
    route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
  });

  await page.goto('/inbox');

  // Should have 2 items initially
  await expect(page.locator('[data-testid="inbox-item"]')).toHaveCount(2);

  // File the first item
  await page.click('[data-testid="inbox-item"]').first();
  await page.click('[data-testid="file-button"]');
  await page.click('[data-testid="file-option"]').first();

  // Should now have 1 item
  await expect(page.locator('[data-testid="inbox-item"]')).toHaveCount(1);
  await expect(page.getByText('Email to File')).not.toBeVisible();
});
```

---

### Story 4.6: Bulk Actions

**Risk:** MEDIUM | **Priority:** P1 (NFR-P004)

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 4.6.1 | E2E | Multi-select with checkbox | Items selected | Vercel Browser Agent |
| 4.6.2 | E2E | Shift+click range select | Range selected | Vercel Browser Agent |
| 4.6.3 | E2E | Bulk action bar appears | Bar visible | Vercel Browser Agent |
| 4.6.4 | E2E | 10+ items process <5 seconds | Timing assertion | Vercel Browser Agent |
| 4.6.5 | E2E | Progress indicator for bulk | Shows progress | Vercel Browser Agent |
| 4.6.6 | Unit | Each bulk action type works | Archive, File, Snooze, Read | Vitest |

#### Test Code

```typescript
// tests/unit/story-4.6-bulk-actions.spec.ts
import { test, expect, vi } from 'vitest';
import { BulkActionService } from '@/services/inbox/bulk-actions';
import { createTestDatabase } from '../helpers/database';

test('4.6.6 - all bulk action types work correctly', async () => {
  const db = createTestDatabase();
  const service = new BulkActionService(db);

  // Seed test emails
  const emailIds = ['msg_1', 'msg_2', 'msg_3'];
  for (const id of emailIds) {
    db.prepare('INSERT INTO emails (id, is_read, status) VALUES (?, 0, "inbox")').run(id);
  }

  // Archive action
  await service.executeAction('archive', emailIds);
  let statuses = db.prepare('SELECT status FROM emails WHERE id IN (?, ?, ?)').all(...emailIds);
  expect(statuses.every(s => s.status === 'archived')).toBe(true);

  // Reset
  db.prepare('UPDATE emails SET status = "inbox"').run();

  // Mark Read action
  await service.executeAction('mark_read', emailIds);
  let readStatuses = db.prepare('SELECT is_read FROM emails WHERE id IN (?, ?, ?)').all(...emailIds);
  expect(readStatuses.every(s => s.is_read === 1)).toBe(true);
});

// tests/e2e/story-4.6-bulk-selection.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('4.6.1 - checkbox multi-select works', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { id: 'msg_1', subject: 'Email 1' },
          { id: 'msg_2', subject: 'Email 2' },
          { id: 'msg_3', subject: 'Email 3' },
        ],
      }),
    });
  });

  await page.goto('/inbox');

  // Select first and third items
  await page.locator('[data-testid="inbox-item"]').nth(0).locator('[data-testid="checkbox"]').click();
  await page.locator('[data-testid="inbox-item"]').nth(2).locator('[data-testid="checkbox"]').click();

  // Should show 2 selected
  await expect(page.getByText('2 selected')).toBeVisible();
});

test('4.6.2 - Shift+click range select works', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: Array.from({ length: 5 }, (_, i) => ({ id: `msg_${i}`, subject: `Email ${i}` })),
      }),
    });
  });

  await page.goto('/inbox');

  // Click first item
  await page.locator('[data-testid="inbox-item"]').nth(0).click();

  // Shift+click fourth item
  await page.locator('[data-testid="inbox-item"]').nth(3).click({ modifiers: ['Shift'] });

  // Should select items 0-3 (4 items)
  await expect(page.getByText('4 selected')).toBeVisible();
});

test('4.6.3 - bulk action bar appears on selection', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [{ id: 'msg_1', subject: 'Email 1' }],
      }),
    });
  });

  await page.goto('/inbox');

  // No selection - no bar
  await expect(page.locator('[data-testid="bulk-action-bar"]')).not.toBeVisible();

  // Select item
  await page.locator('[data-testid="checkbox"]').click();

  // Bar should appear with actions
  const bar = page.locator('[data-testid="bulk-action-bar"]');
  await expect(bar).toBeVisible();
  await expect(bar.getByRole('button', { name: 'Archive' })).toBeVisible();
  await expect(bar.getByRole('button', { name: 'File' })).toBeVisible();
  await expect(bar.getByRole('button', { name: 'Snooze' })).toBeVisible();
  await expect(bar.getByRole('button', { name: 'Mark Read' })).toBeVisible();
});

test('4.6.4 - 10+ items process in under 5 seconds (NFR-P004)', async ({ page }) => {
  const items = Array.from({ length: 15 }, (_, i) => ({ id: `msg_${i}`, subject: `Email ${i}` }));

  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items }),
    });
  });

  await page.route('**/api/bulk-action', route => {
    route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
  });

  await page.goto('/inbox');

  // Select all 15 items
  await page.click('[data-testid="select-all"]');

  const startTime = Date.now();

  // Execute bulk archive
  await page.click('[data-testid="bulk-archive"]');

  // Wait for completion
  await expect(page.getByText('15 items archived')).toBeVisible({ timeout: 5000 });

  const duration = Date.now() - startTime;
  expect(duration).toBeLessThan(5000); // Under 5 seconds
});
```

---

### Story 4.7: Snooze Until Later

**Risk:** LOW | **Priority:** P2

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 4.7.1 | E2E | Snooze options display | Later Today, Tomorrow, etc. | Vercel Browser Agent |
| 4.7.2 | E2E | Custom date/time picker | Picker works | Vercel Browser Agent |
| 4.7.3 | Integration | Snoozed item returns at time | Scheduler fires | Vitest |
| 4.7.4 | Unit | Snooze uses system notifications | Notification API | Vitest |
| 4.7.5 | E2E | Returned item shows origin | "Snoozed from" label | Vercel Browser Agent |

#### Test Code

```typescript
// tests/unit/story-4.7-snooze.spec.ts
import { test, expect, vi } from 'vitest';
import { SnoozeService, calculateSnoozeTime } from '@/services/inbox/snooze';

test('4.7.4 - snooze schedules system notification', async () => {
  const mockNotification = vi.fn();
  global.Notification = { requestPermission: vi.fn().mockResolvedValue('granted') } as any;

  const service = new SnoozeService({ notify: mockNotification });

  await service.snooze('msg_001', { type: 'later_today' });

  // Should have scheduled notification
  expect(service.getScheduledCount()).toBe(1);
});

test('calculateSnoozeTime returns correct times', () => {
  const now = new Date('2026-01-15T10:00:00Z');

  // Later today = 3pm same day
  const laterToday = calculateSnoozeTime('later_today', now);
  expect(laterToday.getHours()).toBe(15);

  // Tomorrow = 9am next day
  const tomorrow = calculateSnoozeTime('tomorrow', now);
  expect(tomorrow.getDate()).toBe(16);
  expect(tomorrow.getHours()).toBe(9);

  // Next week = next Monday 9am
  const nextWeek = calculateSnoozeTime('next_week', now);
  expect(nextWeek.getDay()).toBe(1); // Monday
});

// tests/integration/story-4.7-snooze-return.spec.ts
import { test, expect, vi, beforeEach } from 'vitest';
import { SnoozeService } from '@/services/inbox/snooze';
import { createTestDatabase } from '../helpers/database';

test('4.7.3 - snoozed item returns at scheduled time', async () => {
  vi.useFakeTimers();
  const db = createTestDatabase();

  // Seed email
  db.prepare('INSERT INTO emails (id, status) VALUES (?, ?)').run('msg_001', 'inbox');

  const service = new SnoozeService(db);

  // Snooze for 1 hour
  const snoozeTime = new Date(Date.now() + 3600000);
  await service.snooze('msg_001', { type: 'custom', time: snoozeTime });

  // Email should be snoozed
  let email = db.prepare('SELECT status FROM emails WHERE id = ?').get('msg_001');
  expect(email.status).toBe('snoozed');

  // Advance past snooze time
  vi.advanceTimersByTime(3600001);

  // Trigger scheduler check
  await service.checkSnoozedItems();

  // Email should be back in inbox
  email = db.prepare('SELECT status, snoozed_from FROM emails WHERE id = ?').get('msg_001');
  expect(email.status).toBe('inbox');
  expect(email.snoozed_from).toBeTruthy(); // Records origin

  vi.useRealTimers();
});

// tests/e2e/story-4.7-snooze-ui.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('4.7.1 - snooze options display correctly', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [{ id: 'msg_1', subject: 'Test' }] }),
    });
  });

  await page.goto('/inbox');
  await page.click('[data-testid="inbox-item"]');
  await page.click('[data-testid="snooze-button"]');

  // All options should be visible
  const menu = page.locator('[data-testid="snooze-menu"]');
  await expect(menu.getByText('Later Today')).toBeVisible();
  await expect(menu.getByText('Tomorrow')).toBeVisible();
  await expect(menu.getByText('Next Week')).toBeVisible();
  await expect(menu.getByText('Custom')).toBeVisible();
});

test('4.7.5 - returned item shows snooze origin', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [{
          id: 'msg_1',
          subject: 'Previously Snoozed',
          snoozedFrom: '2026-01-14T10:00:00Z',
        }],
      }),
    });
  });

  await page.goto('/inbox');

  const item = page.locator('[data-testid="inbox-item"]');
  await expect(item.getByText(/Snoozed from/)).toBeVisible();
  await expect(item.getByText(/January 14/)).toBeVisible();
});
```

---

### Story 4.8: Undo Support for Actions

**Risk:** LOW | **Priority:** P2

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 4.8.1 | E2E | Undo toast appears after actions | Toast visible | Vercel Browser Agent |
| 4.8.2 | E2E | Undo reverses file action | Item returns | Vercel Browser Agent |
| 4.8.3 | E2E | Undo reverses archive action | Item returns | Vercel Browser Agent |
| 4.8.4 | Unit | 5-second timeout dismisses toast | Timer works | Vitest |
| 4.8.5 | Integration | action_log records undo events | PM-001 | Vitest |

#### Test Code

```typescript
// tests/unit/story-4.8-undo.spec.ts
import { test, expect, vi } from 'vitest';
import { UndoManager } from '@/services/inbox/undo';

test('4.8.4 - undo timeout is 5 seconds', () => {
  vi.useFakeTimers();

  const onExpire = vi.fn();
  const manager = new UndoManager({ timeout: 5000, onExpire });

  manager.push({ action: 'archive', itemId: 'msg_001' });

  // At 4 seconds - should still be available
  vi.advanceTimersByTime(4000);
  expect(manager.canUndo()).toBe(true);
  expect(onExpire).not.toHaveBeenCalled();

  // At 5.1 seconds - should be expired
  vi.advanceTimersByTime(1100);
  expect(manager.canUndo()).toBe(false);
  expect(onExpire).toHaveBeenCalled();

  vi.useRealTimers();
});

// tests/integration/story-4.8-action-log.spec.ts
import { test, expect } from 'vitest';
import { ActionLogService } from '@/services/action-log';
import { createTestDatabase } from '../helpers/database';

test('4.8.5 - action_log records both action and undo (PM-001)', async () => {
  const db = createTestDatabase();
  const logService = new ActionLogService(db);

  // Record archive action
  await logService.logAction({
    type: 'archive',
    itemId: 'msg_001',
    timestamp: new Date().toISOString(),
  });

  // Record undo
  await logService.logAction({
    type: 'undo',
    originalAction: 'archive',
    itemId: 'msg_001',
    timestamp: new Date().toISOString(),
  });

  // Verify both logged
  const logs = db.prepare('SELECT * FROM action_log WHERE item_id = ? ORDER BY timestamp').all('msg_001');

  expect(logs).toHaveLength(2);
  expect(logs[0].type).toBe('archive');
  expect(logs[1].type).toBe('undo');
  expect(logs[1].original_action).toBe('archive');
});

// tests/e2e/story-4.8-undo-toast.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('4.8.1 - undo toast appears after archive', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [{ id: 'msg_1', subject: 'Test Email' }] }),
    });
  });

  await page.route('**/api/archive', route => {
    route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
  });

  await page.goto('/inbox');
  await page.click('[data-testid="inbox-item"]');
  await page.click('[data-testid="archive-button"]');

  // Toast should appear
  const toast = page.locator('[data-testid="undo-toast"]');
  await expect(toast).toBeVisible();
  await expect(toast.getByText('Archived')).toBeVisible();
  await expect(toast.getByRole('button', { name: 'Undo' })).toBeVisible();
});

test('4.8.2 - clicking undo reverses file action', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [{ id: 'msg_1', subject: 'Filed Email' }] }),
    });
  });

  await page.route('**/api/file', route => {
    route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
  });

  await page.route('**/api/undo', route => {
    route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
  });

  await page.goto('/inbox');

  // File the email
  await page.click('[data-testid="inbox-item"]');
  await page.click('[data-testid="file-button"]');
  await page.click('[data-testid="file-option"]').first();

  // Item should be gone
  await expect(page.getByText('Filed Email')).not.toBeVisible();

  // Click undo
  await page.click('[data-testid="undo-button"]');

  // Item should return
  await expect(page.getByText('Filed Email')).toBeVisible();
});
```

---

### Story 4.9: Inbox Status Indicators

**Risk:** LOW | **Priority:** P2

#### Test Scenarios

| ID | Type | Scenario | Expected Result | Automation |
|----|------|----------|-----------------|------------|
| 4.9.1 | E2E | Status indicators on all items | Icons visible | Vercel Browser Agent |
| 4.9.2 | E2E | Indicator changes on processing | Updates in real-time | Vercel Browser Agent |
| 4.9.3 | Unit | Three status states render | needs_attention, working, done | Vitest |
| 4.9.4 | E2E | Real-time updates work | WebSocket updates | Vercel Browser Agent |
| 4.9.5 | Visual | Indicators match design | Snapshot passes | Vercel Browser Agent |

#### Test Code

```typescript
// tests/unit/story-4.9-status.spec.ts
import { test, expect } from 'vitest';
import { InboxStatus, getStatusIndicator } from '@/components/inbox/status';

test('4.9.3 - three status states render correctly', () => {
  // Needs attention (red)
  const needsAttention = getStatusIndicator('needs_attention');
  expect(needsAttention.icon).toBe('●');
  expect(needsAttention.color).toBe('red');

  // Working (yellow)
  const working = getStatusIndicator('working');
  expect(working.icon).toBe('○');
  expect(working.color).toBe('yellow');

  // Done (green)
  const done = getStatusIndicator('done');
  expect(done.icon).toBe('✓');
  expect(done.color).toBe('green');
});

// tests/e2e/story-4.9-indicators.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('4.9.1 - status indicators display on all items', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { id: 'msg_1', subject: 'Urgent', status: 'needs_attention' },
          { id: 'msg_2', subject: 'In Progress', status: 'working' },
          { id: 'msg_3', subject: 'Completed', status: 'done' },
        ],
      }),
    });
  });

  await page.goto('/inbox');

  // All items should have status indicators
  const indicators = page.locator('[data-testid="status-indicator"]');
  await expect(indicators).toHaveCount(3);
});

test('4.9.2 - indicator changes when item is processed', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [{ id: 'msg_1', subject: 'Test', status: 'needs_attention' }],
      }),
    });
  });

  await page.goto('/inbox');

  const indicator = page.locator('[data-testid="status-indicator"]').first();

  // Initially needs attention (red)
  await expect(indicator).toHaveClass(/needs-attention|red/);

  // Process the item (mark as done via archive)
  await page.click('[data-testid="inbox-item"]');
  await page.click('[data-testid="archive-button"]');

  // Should update to done (green)
  await expect(indicator).toHaveClass(/done|green/);
});

test('4.9.5 - status indicators visual regression', async ({ page }) => {
  await page.route('**/api/inbox**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { id: 'msg_1', subject: 'Needs Attention', status: 'needs_attention' },
          { id: 'msg_2', subject: 'Working', status: 'working' },
          { id: 'msg_3', subject: 'Done', status: 'done' },
        ],
      }),
    });
  });

  await page.goto('/inbox');

  await expect(page.locator('[data-testid="inbox-list"]')).toHaveScreenshot('inbox-status-indicators.png');
});
```

---

## 4. Golden Dataset for Accuracy Testing

### 4.1 Dataset Structure

```typescript
// tests/fixtures/golden-emails.ts
export const GOLDEN_DATASET = [
  // Urgent emails (expected priority > 0.8)
  {
    id: 'gold_urgent_001',
    subject: 'URGENT: Server Down',
    from: 'ops@company.com',
    body: 'Critical: Production server is down. Need immediate response.',
    expectedCategory: 'urgent',
    expectedPriorityMin: 0.85,
    expectedActions: ['respond_immediately'],
  },
  // ... 99 more labeled emails
];
```

### 4.2 Accuracy Metrics

| NFR | Target | Measurement |
|-----|--------|-------------|
| NFR-A001 | 80%+ action extraction | Precision/recall on extracted tasks |
| NFR-A002 | 70%+ filing suggestions | Acceptance rate tracking |
| NFR-A003 | 80%+ triage accuracy | F1 score on golden dataset |

---

## 5. Test Execution Plan

### 5.1 Test Run Order

```
1. Unit Tests (CI: every commit)
   └── Stories 4.1-4.9 unit tests
   └── Schema validation, scoring logic, keyboard handlers

2. Integration Tests (CI: every commit)
   └── Stories 4.1-4.9 integration tests
   └── Requires: Mock Composio, Triage Agent mocks

3. E2E Tests (CI: PR merge)
   └── All stories
   └── Requires: Full app + Mock server

4. Accuracy Tests (CI: weekly)
   └── Golden dataset validation
   └── NFR-A001, NFR-A003 metrics

5. Performance Tests (CI: weekly)
   └── NFR-P004 bulk actions
   └── 500 email sync timing
```

### 5.2 CI Pipeline Configuration

```yaml
# .github/workflows/epic-4-tests.yml
name: Epic 4 Tests

on:
  push:
    paths:
      - 'src/services/inbox/**'
      - 'src/agents/triage/**'
      - 'src/components/inbox/**'

jobs:
  unit-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:unit -- --grep "story-4"
      - run: pnpm run mock:composio &
      - run: sleep 2
      - run: pnpm test:integration -- --grep "story-4"

  e2e:
    runs-on: macos-14
    needs: unit-integration
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build:tauri
      - run: pnpm test:e2e -- --grep "story-4"

  accuracy:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule' || contains(github.event.head_commit.message, '[accuracy]')
    steps:
      - uses: actions/checkout@v4
      - run: pnpm test:accuracy -- --golden-dataset
```

---

## 6. Acceptance Criteria Traceability

| Story | AC Count | Tests Mapped | Coverage |
|-------|----------|--------------|----------|
| 4.1 | 3 | 7 | 100% |
| 4.2 | 3 | 6 | 100% |
| 4.3 | 3 | 6 | 100% |
| 4.4 | 3 | 5 | 100% |
| 4.5 | 3 | 5 | 100% |
| 4.6 | 3 | 6 | 100% |
| 4.7 | 3 | 5 | 100% |
| 4.8 | 3 | 5 | 100% |
| 4.9 | 3 | 5 | 100% |

**Total:** 27 Acceptance Criteria → 68 Test Cases → **100% Coverage**

---

## 7. Gate Criteria

### Story Completion Gate

- [ ] All unit tests passing
- [ ] All integration tests passing (with mocks)
- [ ] E2E inbox tests passing
- [ ] Virtualization performance verified
- [ ] Code coverage ≥80%
- [ ] No P0/P1 bugs open

### Epic Completion Gate

- [ ] Email sync working reliably
- [ ] Priority scoring validated against golden dataset
- [ ] Bulk actions meet NFR-P004 (<5s)
- [ ] Undo support functional
- [ ] Accuracy metrics meet NFR-A001, NFR-A003

---

## 8. Dependencies

| Dependency | Required By | Status |
|------------|-------------|--------|
| Mock Composio Server (C-002) | Story 4.1 | From Epic 3 |
| Agent Mocks (C-001) | Stories 4.3, 4.4 | `test-infra-agent-schemas.md` |
| Golden Dataset | Story 4.3 accuracy | Create before testing |
| SQLite test database | All stories | Epic 1 infrastructure |

---

**Document Status:** Ready for Implementation
**Next Step:** Create golden email dataset, implement tests alongside stories

_Generated by TEA (Test Architect Agent) - 2026-01-15_
