/**
 * Session API Tests
 *
 * Pure API tests for session management (no browser).
 * Demonstrates apiRequest, recurse, and factory patterns.
 *
 * @see TEA knowledge: api-request.md, api-testing-patterns.md
 */
import { test, expect } from '../support/fixtures';

test.describe('Session Management API', () => {
  test('should create a new session', async ({ apiRequest, sessionFactory, log }) => {
    await log.step('Create test session via factory');
    const session = await sessionFactory.createDailySession();

    await log.step('Verify session was created');
    expect(session.id).toBeDefined();
    expect(session.type).toBe('daily');
    expect(session.name).toContain('Daily Briefing');
  });

  test('should list existing sessions', async ({ apiRequest, log, testEnv }) => {
    await log.step('Fetch sessions from API');
    const { status, body } = await apiRequest({
      method: 'GET',
      path: '/api/sessions',
      baseUrl: testEnv.apiUrl,
    });

    await log.step('Verify response');
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  test('should resume an existing session', async ({ apiRequest, sessionFactory, log, testEnv }) => {
    await log.step('Create a session to resume');
    const session = await sessionFactory.createProjectSession('Test Project');

    await log.step('Attempt to resume session');
    const { status, body } = await apiRequest({
      method: 'POST',
      path: `/api/sessions/${session.id}/resume`,
      baseUrl: testEnv.apiUrl,
    });

    await log.step('Verify session resumed');
    expect(status).toBe(200);
    expect(body.id).toBe(session.id);
  });
});

test.describe('Task Capture API', () => {
  test('should capture an inbox item', async ({ apiRequest, taskFactory, log }) => {
    await log.step('Create inbox item via factory');
    const task = await taskFactory.createInboxItem('Call dentist to reschedule');

    await log.step('Verify task properties');
    expect(task.title).toBe('Call dentist to reschedule');
    expect(task.gtdCategory).toBe('inbox');
    expect(task.paraLocation).toBe('inbox');
  });

  test('should categorize task as next action', async ({ taskFactory, log }) => {
    await log.step('Create next action');
    const task = await taskFactory.createNextAction('Review Q4 budget', new Date('2026-01-31'));

    await log.step('Verify categorization');
    expect(task.gtdCategory).toBe('next-action');
    expect(task.paraLocation).toBe('projects');
    expect(task.dueDate).toBeDefined();
  });

  test('should handle batch inbox creation', async ({ taskFactory, log }) => {
    await log.step('Create batch of inbox items');
    const tasks = await taskFactory.createInboxBatch(5);

    await log.step('Verify batch creation');
    expect(tasks).toHaveLength(5);
    tasks.forEach((task) => {
      expect(task.gtdCategory).toBe('inbox');
    });
  });
});

test.describe('Agent Polling Pattern', () => {
  test('should poll for agent response completion', async ({ apiRequest, recurse, log, testEnv }) => {
    await log.step('Start agent conversation');
    const { body: conversation } = await apiRequest({
      method: 'POST',
      path: '/api/conversations',
      baseUrl: testEnv.apiUrl,
      body: { message: 'What is on my calendar today?' },
    });

    await log.step('Poll until agent responds');
    const completed = await recurse(
      () =>
        apiRequest({
          method: 'GET',
          path: `/api/conversations/${conversation.id}`,
          baseUrl: testEnv.apiUrl,
        }),
      (response) => response.body.status === 'completed',
      { timeout: 30000, interval: 1000 },
    );

    await log.step('Verify agent response');
    expect(completed.body.status).toBe('completed');
    expect(completed.body.response).toBeDefined();
  });
});
