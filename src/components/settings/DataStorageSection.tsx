'use client';

/**
 * DataStorageSection Component
 * Story 4.15: Display PARA Location in Settings
 *
 * Settings section displaying PARA and database locations with
 * copy-to-clipboard and open-in-Finder functionality.
 */

import { useState, useEffect } from 'react';
import { homeDir, appDataDir } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-shell';
import { copyToClipboard } from '@/lib/utils/clipboard';

type LoadingState = 'loading' | 'loaded' | 'error';
type CopyState = 'idle' | 'copied' | 'error';

export function DataStorageSection() {
  const [paraPath, setParaPath] = useState<string | null>(null);
  const [dbPath, setDbPath] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [copyParaState, setCopyParaState] = useState<CopyState>('idle');
  const [copyDbState, setCopyDbState] = useState<CopyState>('idle');
  const [openingFinder, setOpeningFinder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolve paths on mount
  useEffect(() => {
    async function resolvePaths() {
      try {
        const [home, appData] = await Promise.all([homeDir(), appDataDir()]);

        if (!home) {
          setLoadingState('error');
          return;
        }

        // Ensure home path ends with /
        const homePath = home.endsWith('/') ? home : `${home}/`;
        setParaPath(`${homePath}Orion/`);
        setDbPath(appData);
        setLoadingState('loaded');
      } catch {
        setLoadingState('error');
      }
    }

    resolvePaths();
  }, []);

  // Handle copy to clipboard
  const handleCopy = async (path: string, type: 'para' | 'db') => {
    const setFn = type === 'para' ? setCopyParaState : setCopyDbState;

    try {
      await copyToClipboard(path);
      setFn('copied');
      setError(null);

      // Reset after 2 seconds
      setTimeout(() => {
        setFn('idle');
      }, 2000);
    } catch {
      setFn('error');
      setError('Failed to copy to clipboard');
    }
  };

  // Handle open in Finder
  const handleOpenInFinder = async () => {
    if (!paraPath) return;

    setOpeningFinder(true);
    setError(null);

    try {
      await open(paraPath);
    } catch {
      setError('Failed to open Finder');
    } finally {
      setOpeningFinder(false);
    }
  };

  // Handle keyboard events on copy buttons
  const handleCopyKeyDown = (
    e: React.KeyboardEvent,
    path: string,
    type: 'para' | 'db'
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleCopy(path, type);
    }
  };

  // Loading state
  if (loadingState === 'loading') {
    return (
      <div data-testid="path-loading">
        <h3 className="text-lg font-medium text-orion-fg mb-4">Data Storage</h3>
        <p className="text-orion-fg-muted">Loading paths...</p>
      </div>
    );
  }

  // Error state
  if (loadingState === 'error' || !paraPath) {
    return (
      <div>
        <h3 className="text-lg font-medium text-orion-fg mb-4">Data Storage</h3>
        <p className="text-orion-fg-muted">Unable to resolve paths</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-orion-fg mb-4">Data Storage</h3>

      {/* PARA Location */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-orion-fg-muted mb-2">
          PARA Location
        </h4>
        <div className="flex items-center gap-2">
          <code
            data-testid="para-location-path"
            className="flex-1 text-sm font-mono bg-orion-bg-secondary px-3 py-2 rounded"
            style={{ userSelect: 'all', overflow: 'hidden' }}
          >
            {paraPath}
          </code>
          <button
            data-testid="copy-para-path"
            aria-label="Copy PARA location"
            onClick={() => handleCopy(paraPath, 'para')}
            onKeyDown={(e) => handleCopyKeyDown(e, paraPath, 'para')}
            className="px-3 py-2 text-sm bg-orion-bg-secondary rounded hover:bg-orion-bg-tertiary"
          >
            {copyParaState === 'copied' ? 'Copied!' : 'Copy'}
          </button>
          <button
            aria-label="Open in Finder"
            onClick={handleOpenInFinder}
            disabled={openingFinder}
            className="px-3 py-2 text-sm bg-orion-bg-secondary rounded hover:bg-orion-bg-tertiary disabled:opacity-50"
          >
            Open in Finder
          </button>
        </div>
      </div>

      {/* Database Location */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-orion-fg-muted mb-2">
          Database Location
        </h4>
        <div className="flex items-center gap-2">
          <code
            data-testid="db-location-path"
            className="flex-1 text-sm font-mono bg-orion-bg-secondary px-3 py-2 rounded"
            style={{ userSelect: 'all', overflow: 'hidden' }}
          >
            {dbPath}
          </code>
          <button
            data-testid="copy-db-path"
            aria-label="Copy database location"
            onClick={() => dbPath && handleCopy(dbPath, 'db')}
            onKeyDown={(e) => dbPath && handleCopyKeyDown(e, dbPath, 'db')}
            className="px-3 py-2 text-sm bg-orion-bg-secondary rounded hover:bg-orion-bg-tertiary"
          >
            {copyDbState === 'copied' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Status feedback (aria-live region) */}
      {copyParaState === 'copied' && (
        <div role="status" className="sr-only">
          Copied to clipboard
        </div>
      )}
      {copyDbState === 'copied' && (
        <div role="status" className="sr-only">
          Copied to clipboard
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div role="alert" className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
}
