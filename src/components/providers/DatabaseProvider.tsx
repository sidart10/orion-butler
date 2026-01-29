'use client';

/**
 * Database Provider Component
 * Initializes SQLite database before rendering children.
 *
 * This provider ensures:
 * 1. App data directory exists (via db_ensure_dir IPC)
 * 2. Database tables are created (via initializeDatabase)
 * 3. PRAGMAs are configured (WAL, foreign keys, etc.)
 *
 * Architecture:
 * - Shows loading screen during initialization
 * - Shows error screen on failure with retry option
 * - Skips initialization outside Tauri environment (SSR, web dev)
 * - Blocks children until database is ready
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { invoke } from '@tauri-apps/api/core';
import { initializeDatabase, type DbConfigResult } from '@/db';
import { getRequestRegistry } from '@/lib/ipc/request-registry';

interface DatabaseState {
  status: 'initializing' | 'ready' | 'error';
  error?: Error;
  config?: DbConfigResult;
}

interface DatabaseContextValue {
  state: DatabaseState;
  retry: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DatabaseState>({ status: 'initializing' });

  const initDb = useCallback(async () => {
    // Skip in non-Tauri environment (SSR, web dev)
    if (typeof window === 'undefined' || !('__TAURI__' in window)) {
      console.log('[DatabaseProvider] Not in Tauri environment, skipping init');
      setState({ status: 'ready' });
      return;
    }

    try {
      setState({ status: 'initializing' });
      console.log('[DatabaseProvider] Initializing database...');

      // PRE-MORTEM FIX: Ensure app data directory exists BEFORE Database.load()
      // Without this, first launch fails because the directory doesn't exist yet.
      await invoke('db_ensure_dir');

      const config = await initializeDatabase();
      console.log('[DatabaseProvider] Database ready', config);

      // CRITICAL-001 FIX: Initialize RequestRegistry and wire shutdown hook (TIGER-A mitigation)
      // This ensures pending writes are flushed before app closes
      const registry = getRequestRegistry();
      await registry.init(); // Restores active requests from database
      await registry.setupShutdownHook(); // Registers tauri://close-requested listener

      setState({ status: 'ready', config });
    } catch (error) {
      console.error('[DatabaseProvider] Initialization failed:', error);
      setState({ status: 'error', error: error as Error });
    }
  }, []);

  useEffect(() => {
    initDb();

    // Cleanup RequestRegistry on unmount (TIGER-A mitigation)
    return () => {
      const registry = getRequestRegistry();
      registry.cleanup();
    };
  }, [initDb]);

  if (state.status === 'initializing') {
    return <DatabaseLoadingScreen />;
  }

  if (state.status === 'error') {
    return <DatabaseErrorScreen error={state.error} onRetry={initDb} />;
  }

  return (
    <DatabaseContext.Provider value={{ state, retry: initDb }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseStatus() {
  const ctx = useContext(DatabaseContext);
  if (!ctx) {
    throw new Error('useDatabaseStatus must be used within DatabaseProvider');
  }
  return ctx;
}

function DatabaseLoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-orion-bg">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-orion-border border-t-orion-accent mx-auto" />
        <p className="text-orion-fg-secondary">Initializing database...</p>
      </div>
    </div>
  );
}

function DatabaseErrorScreen({
  error,
  onRetry,
}: {
  error?: Error;
  onRetry: () => void;
}) {
  return (
    <div className="flex h-screen items-center justify-center bg-orion-bg">
      <div className="max-w-md text-center p-6">
        <div className="mb-4 text-red-500">
          <svg
            className="h-12 w-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-orion-fg mb-2">
          Database Error
        </h2>
        <p className="text-orion-fg-secondary mb-4">
          {error?.message || 'Failed to initialize database'}
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-orion-accent text-white rounded-md hover:bg-orion-accent/90 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
