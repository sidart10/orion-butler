/**
 * Example E2E Test - Agent-Browser Pattern
 *
 * Demonstrates the AI-agent workflow: snapshot → parse → act → observe
 */

import {
  describe,
  it,
  beforeAll,
  afterAll,
  expect,
  AgentBrowserClient,
} from '../support/fixtures';
import { waitForText, waitForUrl, sleep } from '../support/helpers/wait';
import { assertUrl, assertTextExists } from '../support/helpers/assertions';

describe('Orion Homepage', () => {
  let browser: AgentBrowserClient;

  beforeAll(async (b) => {
    browser = b;
    // Navigate to app (adjust URL for your local dev server)
    await browser.open('http://localhost:3000');
  });

  it('should load the homepage', async (browser) => {
    // 1. Snapshot - Capture page state with interactive refs
    const snapshot = await browser.snapshot({ interactive: true });

    // 2. Assert - Verify page loaded
    await assertUrl(browser, 'localhost:3000');

    // 3. Log refs for debugging (useful during test development)
    console.log('Available refs:', Object.keys(snapshot.refs));
  });

  it('should display the header', async (browser) => {
    const snapshot = await browser.snapshot();

    // Find header element using ARIA role
    const headerElements = Object.values(snapshot.refs).filter((el) => el.role === 'banner' || el.role === 'heading');

    expect.toBeTruthy(headerElements.length > 0, 'Expected header elements to exist');
  });
});

describe('Orion Chat Flow', () => {
  it('should open chat panel', async (browser) => {
    await browser.open('http://localhost:3000');

    // 1. Snapshot to find chat trigger
    let snapshot = await browser.snapshot({ interactive: true });

    // 2. Find and click chat button (by role or ref)
    const chatButton = Object.values(snapshot.refs).find(
      (el) => el.role === 'button' && (el.name?.toLowerCase().includes('chat') || el.text?.toLowerCase().includes('chat'))
    );

    if (chatButton) {
      await browser.click(chatButton.id);

      // 3. Wait for chat panel to appear
      await sleep(500);
      snapshot = await browser.snapshot();

      // 4. Verify chat panel is visible
      const chatPanel = Object.values(snapshot.refs).find((el) => el.role === 'dialog' || el.role === 'region');

      expect.toBeTruthy(chatPanel, 'Expected chat panel to be visible');
    } else {
      console.log('Chat button not found - skipping interaction test');
    }
  });

  it('should send a message', async (browser) => {
    await browser.open('http://localhost:3000/chat');

    // 1. Snapshot to find input field
    const snapshot = await browser.snapshot({ interactive: true });

    // 2. Find text input
    const inputField = Object.values(snapshot.refs).find((el) => el.role === 'textbox' || el.role === 'searchbox');

    if (inputField) {
      // 3. Type message
      await browser.fill(inputField.id, 'Hello, Orion!');

      // 4. Find and click send button
      const sendButton = Object.values(snapshot.refs).find(
        (el) => el.role === 'button' && (el.name?.toLowerCase().includes('send') || el.text?.toLowerCase().includes('send'))
      );

      if (sendButton) {
        await browser.click(sendButton.id);

        // 5. Wait for response
        await waitForText(browser, 'Hello', { timeout: 5000 }).catch(() => {
          console.log('Response not received within timeout');
        });
      }
    } else {
      console.log('Input field not found - skipping message test');
    }
  });
});

describe('Agent-Browser API Demo', () => {
  it('demonstrates snapshot → act → observe pattern', async (browser) => {
    // Open a public page for demo
    await browser.open('https://example.com');

    // SNAPSHOT: Get page state with refs
    const snapshot = await browser.snapshot({ interactive: true, compact: false });
    console.log(`Page: ${snapshot.title}`);
    console.log(`URL: ${snapshot.url}`);
    console.log(`Elements: ${Object.keys(snapshot.refs).length}`);

    // PARSE: Find elements of interest
    const links = Object.values(snapshot.refs).filter((el) => el.role === 'link');
    console.log(`Found ${links.length} links`);

    // ACT: Click first link (if any)
    if (links.length > 0) {
      await browser.click(links[0].id);

      // OBSERVE: Verify navigation
      await browser.waitForNavigation({ timeout: 5000 });
      const newSnapshot = await browser.snapshot();
      console.log(`Navigated to: ${newSnapshot.title}`);
    }
  });

  it('demonstrates keyboard and form interactions', async (browser) => {
    await browser.open('https://www.google.com');

    // Take snapshot to find search box
    const snapshot = await browser.snapshot({ interactive: true });

    // Find search input (usually role=combobox or role=searchbox on Google)
    const searchInput = Object.values(snapshot.refs).find(
      (el) => el.role === 'combobox' || el.role === 'searchbox' || el.role === 'textbox'
    );

    if (searchInput) {
      // Type search query
      await browser.fill(searchInput.id, 'Vercel agent-browser');

      // Press Enter to search
      await browser.press('Enter');

      // Wait for results
      await sleep(2000);

      // Verify we're on search results
      await assertUrl(browser, 'search');
    }
  });
});
