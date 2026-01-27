/**
 * Configuration Validation Tests - Epic 1 Story 1.1
 *
 * Tests that verify configuration files exist and contain required settings.
 * These tests should FAIL until the Tauri scaffold is created.
 *
 * Test IDs: CV-001 through CV-012
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();

describe('Configuration Validation', () => {
  let packageJson: Record<string, unknown>;

  beforeAll(() => {
    packageJson = JSON.parse(
      readFileSync(join(PROJECT_ROOT, 'package.json'), 'utf-8')
    );
  });

  describe('package.json', () => {
    it('CV-001: should have valid package.json with required fields', () => {
      expect(packageJson.name).toBe('orion-personal-butler');
      expect(packageJson.version).toBeDefined();
      expect(packageJson.scripts).toBeDefined();
    });

    it('CV-002: should have tauri scripts in package.json', () => {
      const scripts = packageJson.scripts as Record<string, string>;
      expect(scripts['tauri']).toBeDefined();
      expect(scripts['tauri:dev']).toBeDefined();
      expect(scripts['tauri:build']).toBeDefined();
    });

    it('CV-003: should have required dependencies', () => {
      const deps = packageJson.dependencies as Record<string, string>;
      expect(deps['react']).toBeDefined();
      expect(deps['next']).toBeDefined();
    });

    it('CV-004: should have required devDependencies', () => {
      const devDeps = packageJson.devDependencies as Record<string, string>;
      const deps = packageJson.dependencies as Record<string, string>;
      expect(devDeps['typescript']).toBeDefined();
      expect(devDeps['@tauri-apps/cli']).toBeDefined();
      // @tauri-apps/api can be in either dependencies or devDependencies
      expect(devDeps['@tauri-apps/api'] || deps['@tauri-apps/api']).toBeDefined();
    });

    it('CV-011: should preserve existing dependencies', () => {
      const deps = packageJson.dependencies as Record<string, string>;
      expect(deps['@anthropic-ai/claude-agent-sdk']).toBeDefined();
      expect(deps['zustand']).toBeDefined();
      expect(deps['zod']).toBeDefined();
    });
  });

  describe('TypeScript config', () => {
    it('CV-005: should have valid tsconfig.json', () => {
      const tsconfigPath = join(PROJECT_ROOT, 'tsconfig.json');
      expect(existsSync(tsconfigPath)).toBe(true);

      // Should not throw when parsing
      const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
      expect(tsconfig.compilerOptions).toBeDefined();
    });

    it('CV-006: should have strict TypeScript settings', () => {
      const tsconfigPath = join(PROJECT_ROOT, 'tsconfig.json');
      expect(existsSync(tsconfigPath)).toBe(true);

      const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
      expect(tsconfig.compilerOptions.strict).toBe(true);
    });
  });

  describe('Tauri config', () => {
    let tauriConfig: Record<string, unknown>;

    beforeAll(() => {
      const tauriConfigPath = join(PROJECT_ROOT, 'src-tauri', 'tauri.conf.json');
      if (existsSync(tauriConfigPath)) {
        tauriConfig = JSON.parse(readFileSync(tauriConfigPath, 'utf-8'));
      }
    });

    it('CV-008: should have Tauri bundle identifier set', () => {
      const tauriConfigPath = join(PROJECT_ROOT, 'src-tauri', 'tauri.conf.json');
      expect(existsSync(tauriConfigPath)).toBe(true);

      const config = JSON.parse(readFileSync(tauriConfigPath, 'utf-8'));
      const identifier = config.identifier as string;
      expect(identifier).toMatch(/^com\.[a-z]+\.[a-z]+/);
    });

    it('CV-009: should have Tauri window title set', () => {
      const tauriConfigPath = join(PROJECT_ROOT, 'src-tauri', 'tauri.conf.json');
      expect(existsSync(tauriConfigPath)).toBe(true);

      const config = JSON.parse(readFileSync(tauriConfigPath, 'utf-8'));
      const windows = (config.app as Record<string, unknown>)?.windows as Array<Record<string, unknown>>;
      expect(windows?.[0]?.title).toContain('Orion');
    });

    it('CV-010: should have minimum macOS version set', () => {
      const tauriConfigPath = join(PROJECT_ROOT, 'src-tauri', 'tauri.conf.json');
      expect(existsSync(tauriConfigPath)).toBe(true);

      const config = JSON.parse(readFileSync(tauriConfigPath, 'utf-8'));
      const macOS = (config.bundle as Record<string, unknown>)?.macOS as Record<string, unknown>;
      const minVersion = macOS?.minimumSystemVersion as string;
      expect(minVersion).toBeDefined();
      expect(parseFloat(minVersion)).toBeGreaterThanOrEqual(12.0);
    });
  });

  describe('Tailwind config', () => {
    it('CV-007: should have valid tailwind.config', () => {
      const tailwindPath = join(PROJECT_ROOT, 'tailwind.config.ts');
      expect(existsSync(tailwindPath)).toBe(true);
    });
  });

  describe('shadcn config', () => {
    it('CV-012: should have shadcn components.json', () => {
      const componentsPath = join(PROJECT_ROOT, 'components.json');
      expect(existsSync(componentsPath)).toBe(true);
    });
  });
});
