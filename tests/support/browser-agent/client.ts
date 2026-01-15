/**
 * Agent-Browser Client Wrapper
 *
 * Provides a TypeScript interface to the agent-browser CLI for both:
 * 1. Orion's browser automation capabilities (agent tool)
 * 2. E2E testing of the Orion app
 *
 * @see https://github.com/vercel-labs/agent-browser
 */

import { exec, execSync, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface BrowserSnapshot {
  url: string;
  title: string;
  refs: Record<string, ElementRef>;
  timestamp: number;
}

export interface ElementRef {
  id: string; // @e1, @e2, etc.
  role: string;
  name?: string;
  text?: string;
  bounds?: { x: number; y: number; width: number; height: number };
}

export interface AgentBrowserOptions {
  session?: string;
  headless?: boolean;
  timeout?: number;
  viewport?: { width: number; height: number };
  device?: string;
}

export class AgentBrowserClient {
  private session: string;
  private options: AgentBrowserOptions;

  constructor(options: AgentBrowserOptions = {}) {
    this.session = options.session || `orion-${Date.now()}`;
    this.options = {
      headless: true,
      timeout: 30000,
      ...options,
    };
  }

  /**
   * Execute agent-browser CLI command
   */
  private async execute(command: string, args: string[] = []): Promise<string> {
    const sessionFlag = `--session ${this.session}`;
    const fullCommand = `agent-browser ${command} ${args.join(' ')} ${sessionFlag} --json`;

    try {
      const { stdout } = await execAsync(fullCommand, {
        timeout: this.options.timeout,
        env: {
          ...process.env,
          AGENT_BROWSER_HEADLESS: this.options.headless ? '1' : '0',
        },
      });
      return stdout.trim();
    } catch (error: any) {
      throw new Error(`agent-browser ${command} failed: ${error.message}`);
    }
  }

  /**
   * Parse JSON output from agent-browser
   */
  private parseOutput<T>(output: string): T {
    try {
      return JSON.parse(output);
    } catch {
      throw new Error(`Failed to parse agent-browser output: ${output}`);
    }
  }

  // ============================================================
  // Navigation
  // ============================================================

  async open(url: string): Promise<void> {
    await this.execute('open', [url]);
  }

  async goto(url: string): Promise<void> {
    await this.execute('goto', [url]);
  }

  async back(): Promise<void> {
    await this.execute('back');
  }

  async forward(): Promise<void> {
    await this.execute('forward');
  }

  async reload(): Promise<void> {
    await this.execute('reload');
  }

  // ============================================================
  // Snapshot & Element Discovery (AI-Optimized)
  // ============================================================

  /**
   * Capture accessibility tree snapshot with interactive elements only
   * Returns deterministic refs (@e1, @e2) for reliable element targeting
   */
  async snapshot(options: { interactive?: boolean; compact?: boolean } = {}): Promise<BrowserSnapshot> {
    const args: string[] = [];
    if (options.interactive !== false) args.push('-i'); // interactive-only by default
    if (options.compact) args.push('-c');

    const output = await this.execute('snapshot', args);
    return this.parseOutput<BrowserSnapshot>(output);
  }

  /**
   * Find element by ARIA role, label, or placeholder
   */
  async find(query: string, options: { role?: string; label?: string } = {}): Promise<ElementRef[]> {
    const args = [JSON.stringify(query)];
    if (options.role) args.push(`--role ${options.role}`);
    if (options.label) args.push(`--label ${options.label}`);

    const output = await this.execute('find', args);
    return this.parseOutput<ElementRef[]>(output);
  }

  // ============================================================
  // Interactions
  // ============================================================

  /**
   * Click element by ref (@e1) or selector
   */
  async click(target: string): Promise<void> {
    await this.execute('click', [target]);
  }

  /**
   * Type text into focused element or target
   */
  async type(text: string, target?: string): Promise<void> {
    const args = [JSON.stringify(text)];
    if (target) args.unshift(target);
    await this.execute('type', args);
  }

  /**
   * Fill form field (clears first, then types)
   */
  async fill(target: string, value: string): Promise<void> {
    await this.execute('fill', [target, JSON.stringify(value)]);
  }

  /**
   * Press keyboard key
   */
  async press(key: string): Promise<void> {
    await this.execute('press', [key]);
  }

  /**
   * Scroll page or element
   */
  async scroll(options: { direction?: 'up' | 'down' | 'left' | 'right'; amount?: number } = {}): Promise<void> {
    const args: string[] = [];
    if (options.direction) args.push(`--direction ${options.direction}`);
    if (options.amount) args.push(`--amount ${options.amount}`);
    await this.execute('scroll', args);
  }

  /**
   * Hover over element
   */
  async hover(target: string): Promise<void> {
    await this.execute('hover', [target]);
  }

  /**
   * Select option from dropdown
   */
  async select(target: string, value: string): Promise<void> {
    await this.execute('select', [target, JSON.stringify(value)]);
  }

  // ============================================================
  // Assertions & Waiting
  // ============================================================

  /**
   * Wait for element to be visible
   */
  async waitFor(target: string, options: { timeout?: number; state?: 'visible' | 'hidden' } = {}): Promise<void> {
    const args = [target];
    if (options.timeout) args.push(`--timeout ${options.timeout}`);
    if (options.state) args.push(`--state ${options.state}`);
    await this.execute('wait', args);
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(options: { timeout?: number } = {}): Promise<void> {
    const args: string[] = [];
    if (options.timeout) args.push(`--timeout ${options.timeout}`);
    await this.execute('wait-navigation', args);
  }

  /**
   * Get current URL
   */
  async url(): Promise<string> {
    const output = await this.execute('url');
    return this.parseOutput<{ url: string }>(output).url;
  }

  /**
   * Get page title
   */
  async title(): Promise<string> {
    const output = await this.execute('title');
    return this.parseOutput<{ title: string }>(output).title;
  }

  // ============================================================
  // Screenshots & Artifacts
  // ============================================================

  /**
   * Take screenshot
   */
  async screenshot(path?: string): Promise<string> {
    const args = path ? [`--output ${path}`] : [];
    const output = await this.execute('screenshot', args);
    return this.parseOutput<{ path: string }>(output).path;
  }

  /**
   * Export page as PDF
   */
  async pdf(path?: string): Promise<string> {
    const args = path ? [`--output ${path}`] : [];
    const output = await this.execute('pdf', args);
    return this.parseOutput<{ path: string }>(output).path;
  }

  // ============================================================
  // Session Management
  // ============================================================

  /**
   * Close browser session
   */
  async close(): Promise<void> {
    await this.execute('close');
  }

  /**
   * Save session state (cookies, storage) for reuse
   */
  async saveState(path: string): Promise<void> {
    await this.execute('save-state', [path]);
  }

  /**
   * Load session state from file
   */
  async loadState(path: string): Promise<void> {
    await this.execute('load-state', [path]);
  }

  // ============================================================
  // Network
  // ============================================================

  /**
   * Intercept network requests
   */
  async intercept(pattern: string, response: { status?: number; body?: string }): Promise<void> {
    const args = [pattern];
    if (response.status) args.push(`--status ${response.status}`);
    if (response.body) args.push(`--body ${JSON.stringify(response.body)}`);
    await this.execute('intercept', args);
  }

  /**
   * Set extra HTTP headers
   */
  async setHeaders(headers: Record<string, string>): Promise<void> {
    await this.execute('set-headers', [JSON.stringify(headers)]);
  }
}

/**
 * Factory function for creating test browser instances
 */
export function createBrowser(options?: AgentBrowserOptions): AgentBrowserClient {
  return new AgentBrowserClient(options);
}

/**
 * Test fixture helper - creates browser and handles cleanup
 */
export async function withBrowser<T>(
  fn: (browser: AgentBrowserClient) => Promise<T>,
  options?: AgentBrowserOptions
): Promise<T> {
  const browser = createBrowser(options);
  try {
    return await fn(browser);
  } finally {
    await browser.close().catch(() => {}); // Ignore close errors
  }
}
