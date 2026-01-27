/**
 * Build Process Verification Tests - Epic 1 Story 1.1
 *
 * Tests that verify build commands execute successfully.
 * These tests should FAIL until the Tauri scaffold is created and configured.
 *
 * Test IDs: BP-001 through BP-005
 *
 * Note: These are integration tests that actually run build commands.
 * They have long timeouts and should be run separately from unit tests.
 */
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

const PROJECT_ROOT = process.cwd();

describe('Build Process Verification', () => {
  // Longer timeout for build commands
  const BUILD_TIMEOUT = 300000; // 5 minutes

  it('BP-001: should pass TypeScript type checking', () => {
    expect(() => {
      execSync('npx tsc --noEmit', {
        cwd: PROJECT_ROOT,
        stdio: 'pipe',
        timeout: 60000,
      });
    }).not.toThrow();
  }, 60000);

  it('BP-002: should pass ESLint', () => {
    expect(() => {
      execSync('npm run lint', {
        cwd: PROJECT_ROOT,
        stdio: 'pipe',
        timeout: 60000,
      });
    }).not.toThrow();
  }, 60000);

  it('BP-003: should build Next.js successfully', () => {
    expect(() => {
      execSync('npm run build', {
        cwd: PROJECT_ROOT,
        stdio: 'pipe',
        timeout: BUILD_TIMEOUT,
      });
    }).not.toThrow();
  }, BUILD_TIMEOUT);

  it('BP-004: should build Tauri successfully', () => {
    // First verify src-tauri exists
    expect(existsSync(join(PROJECT_ROOT, 'src-tauri'))).toBe(true);

    expect(() => {
      execSync('npm run tauri build', {
        cwd: PROJECT_ROOT,
        stdio: 'pipe',
        timeout: BUILD_TIMEOUT,
      });
    }).not.toThrow();
  }, BUILD_TIMEOUT);

  it('BP-005: should generate macOS .app bundle', async () => {
    const appPattern = join(PROJECT_ROOT, 'src-tauri/target/release/bundle/macos/*.app');
    const apps = await glob(appPattern);
    expect(apps.length).toBeGreaterThan(0);
  });
});
