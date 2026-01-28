/**
 * Tests for PARA Location Settings Display
 * Epic 4 Plan 4, Story 4.15: Display PARA Location in Settings
 *
 * TDD Phase: RED - Write failing tests first
 *
 * Tests the settings UI component that displays PARA and database locations,
 * with copy-to-clipboard and open-in-Finder functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import the component - will fail until implemented
import { DataStorageSection } from '@/components/settings/DataStorageSection';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock Tauri path API
vi.mock('@tauri-apps/api/path', () => ({
  homeDir: vi.fn().mockResolvedValue('/Users/testuser'),
  appDataDir: vi.fn().mockResolvedValue(
    '/Users/testuser/Library/Application Support/Orion'
  ),
}));

// Mock Tauri shell plugin
vi.mock('@tauri-apps/plugin-shell', () => ({
  open: vi.fn().mockResolvedValue(undefined),
}));

// Mock clipboard utility module
vi.mock('@/lib/utils/clipboard', () => ({
  copyToClipboard: vi.fn().mockResolvedValue(undefined),
}));

import { copyToClipboard } from '@/lib/utils/clipboard';

// Import mocks after vi.mock() calls
import * as pathApi from '@tauri-apps/api/path';
import * as shell from '@tauri-apps/plugin-shell';

describe('Story 4.15: DataStorageSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations
    vi.mocked(pathApi.homeDir).mockResolvedValue('/Users/testuser');
    vi.mocked(pathApi.appDataDir).mockResolvedValue(
      '/Users/testuser/Library/Application Support/Orion'
    );
    vi.mocked(shell.open).mockResolvedValue(undefined);

    // Reset clipboard mock
    vi.mocked(copyToClipboard).mockClear();
    vi.mocked(copyToClipboard).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================
  describe('DataStorageSection rendering', () => {
    it('should render PARA location section', async () => {
      render(<DataStorageSection />);

      await waitFor(() => {
        expect(screen.getByText(/PARA Location/i)).toBeInTheDocument();
      });
    });

    it('should display PARA path with expanded home directory', async () => {
      render(<DataStorageSection />);

      await waitFor(() => {
        // Should show full path, not ~/Orion/
        expect(screen.getByTestId('para-location-path')).toHaveTextContent(
          '/Users/testuser/Orion/'
        );
      });
    });

    it('should display database location path', async () => {
      render(<DataStorageSection />);

      await waitFor(() => {
        expect(screen.getByTestId('db-location-path')).toHaveTextContent(
          '/Users/testuser/Library/Application Support/Orion'
        );
      });
    });

    it('should render "Open in Finder" button for PARA location', async () => {
      render(<DataStorageSection />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /open.*finder/i })
        ).toBeInTheDocument();
      });
    });

    it('should render "Copy" button for PARA path', async () => {
      render(<DataStorageSection />);

      await waitFor(() => {
        const copyButtons = screen.getAllByRole('button', { name: /copy/i });
        expect(copyButtons.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should render "Copy" button for database path', async () => {
      render(<DataStorageSection />);

      await waitFor(() => {
        // Should have at least 2 copy buttons (one for each path)
        const copyButtons = screen.getAllByRole('button', { name: /copy/i });
        expect(copyButtons.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should have correct test ids', async () => {
      render(<DataStorageSection />);

      await waitFor(() => {
        expect(screen.getByTestId('para-location-path')).toBeInTheDocument();
        expect(screen.getByTestId('db-location-path')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Path Resolution Tests
  // ===========================================================================
  describe('DataStorageSection path resolution', () => {
    it('should expand ~ to actual home directory', async () => {
      vi.mocked(pathApi.homeDir).mockResolvedValue('/Users/testuser');

      render(<DataStorageSection />);

      await waitFor(() => {
        const paraPath = screen.getByTestId('para-location-path');
        expect(paraPath.textContent).toContain('/Users/testuser');
        expect(paraPath.textContent).not.toContain('~');
      });
    });

    it('should expand appDataDir for database location', async () => {
      vi.mocked(pathApi.appDataDir).mockResolvedValue(
        '/Users/johndoe/Library/Application Support/Orion'
      );

      render(<DataStorageSection />);

      await waitFor(() => {
        const dbPath = screen.getByTestId('db-location-path');
        expect(dbPath.textContent).toContain('/Users/johndoe/Library');
      });
    });

    it('should handle path resolution errors gracefully', async () => {
      vi.mocked(pathApi.homeDir).mockRejectedValue(new Error('API unavailable'));

      render(<DataStorageSection />);

      await waitFor(() => {
        expect(screen.getByText(/unable to resolve/i)).toBeInTheDocument();
      });
    });

    it('should show loading state while resolving paths', async () => {
      // Create a controllable promise for delayed resolution
      let resolveHomeDir: (value: string) => void;
      vi.mocked(pathApi.homeDir).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveHomeDir = resolve;
          })
      );

      render(<DataStorageSection />);

      // Should show loading initially
      expect(screen.getByTestId('path-loading')).toBeInTheDocument();

      // Resolve the promise
      await act(async () => {
        resolveHomeDir!('/Users/testuser');
      });

      // Should no longer be loading
      await waitFor(() => {
        expect(screen.queryByTestId('path-loading')).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Copy to Clipboard Tests
  // ===========================================================================
  describe('DataStorageSection copy functionality', () => {
    it('should copy PARA path to clipboard on click', async () => {
      const user = userEvent.setup();
      render(<DataStorageSection />);

      await waitFor(() => {
        expect(screen.getByTestId('para-location-path')).toBeInTheDocument();
      });

      const copyParaButton = screen.getByTestId('copy-para-path');
      await user.click(copyParaButton);

      expect(vi.mocked(copyToClipboard)).toHaveBeenCalledWith(
        expect.stringContaining('/Users/testuser/Orion')
      );
    });

    it('should copy database path to clipboard on click', async () => {
      const user = userEvent.setup();
      render(<DataStorageSection />);

      await waitFor(() => {
        expect(screen.getByTestId('db-location-path')).toBeInTheDocument();
      });

      const copyDbButton = screen.getByTestId('copy-db-path');
      await user.click(copyDbButton);

      expect(vi.mocked(copyToClipboard)).toHaveBeenCalledWith(
        expect.stringContaining('Library/Application Support/Orion')
      );
    });

    it('should show "Copied!" feedback after copy', async () => {
      const user = userEvent.setup();
      render(<DataStorageSection />);

      await waitFor(() => {
        expect(screen.getByTestId('copy-para-path')).toBeInTheDocument();
      });

      const copyButton = screen.getByTestId('copy-para-path');

      // Button should initially show "Copy"
      expect(copyButton).toHaveTextContent('Copy');

      await user.click(copyButton);

      // Should show "Copied!" feedback on the button
      await waitFor(() => {
        expect(copyButton).toHaveTextContent('Copied!');
      });
    });

    it('should revert "Copied!" feedback after 2 seconds', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      render(<DataStorageSection />);

      // Allow useEffect to complete
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      const copyButton = screen.getByTestId('copy-para-path');

      // Click the button
      await act(async () => {
        fireEvent.click(copyButton);
        // Flush any pending microtasks
        await Promise.resolve();
      });

      // Verify "Copied!" is shown
      expect(copyButton).toHaveTextContent('Copied!');

      // Advance time by 2 seconds
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });

      // Should revert to "Copy"
      expect(copyButton).toHaveTextContent('Copy');

      vi.useRealTimers();
    });

    it('should handle clipboard write errors', async () => {
      vi.mocked(copyToClipboard).mockRejectedValue(
        new Error('Clipboard access denied')
      );

      const user = userEvent.setup();
      render(<DataStorageSection />);

      await waitFor(() => {
        expect(screen.getByTestId('copy-para-path')).toBeInTheDocument();
      });

      const copyButton = screen.getByTestId('copy-para-path');
      await user.click(copyButton);

      // Should show error feedback
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Open in Finder Tests
  // ===========================================================================
  describe('DataStorageSection open in Finder', () => {
    it('should call shell open with PARA path', async () => {
      const user = userEvent.setup();
      render(<DataStorageSection />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /open.*finder/i })
        ).toBeInTheDocument();
      });

      const openButton = screen.getByRole('button', { name: /open.*finder/i });
      await user.click(openButton);

      expect(shell.open).toHaveBeenCalledWith(
        expect.stringContaining('/Users/testuser/Orion')
      );
    });

    it('should handle open errors gracefully', async () => {
      vi.mocked(shell.open).mockRejectedValue(
        new Error('Failed to open Finder')
      );

      const user = userEvent.setup();
      render(<DataStorageSection />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /open.*finder/i })
        ).toBeInTheDocument();
      });

      const openButton = screen.getByRole('button', { name: /open.*finder/i });
      await user.click(openButton);

      // Should show error
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should disable button while opening', async () => {
      // Create a controllable promise for delayed open
      let resolveOpen: () => void;
      vi.mocked(shell.open).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveOpen = resolve;
          })
      );

      render(<DataStorageSection />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /open.*finder/i })
        ).toBeInTheDocument();
      });

      const openButton = screen.getByRole('button', { name: /open.*finder/i });

      // Click and start the async operation
      await act(async () => {
        fireEvent.click(openButton);
        // Allow state update
        await Promise.resolve();
      });

      // Button should be disabled during operation
      expect(openButton).toBeDisabled();

      // Resolve the promise to complete operation
      await act(async () => {
        resolveOpen!();
      });

      // Button should be enabled again
      await waitFor(() => {
        expect(openButton).not.toBeDisabled();
      });
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================
  describe('DataStorageSection accessibility', () => {
    it('should have selectable path text', async () => {
      render(<DataStorageSection />);

      await waitFor(() => {
        const paraPath = screen.getByTestId('para-location-path');
        // Check for user-select CSS or selection attribute
        expect(paraPath).toHaveStyle({ userSelect: 'all' });
      });
    });

    it('should have keyboard-accessible copy buttons', async () => {
      render(<DataStorageSection />);

      await waitFor(() => {
        expect(screen.getByTestId('copy-para-path')).toBeInTheDocument();
      });

      const copyButton = screen.getByTestId('copy-para-path');

      // Should be focusable
      copyButton.focus();
      expect(document.activeElement).toBe(copyButton);

      // Should be activatable via Enter
      fireEvent.keyDown(copyButton, { key: 'Enter' });
      await waitFor(() => {
        expect(vi.mocked(copyToClipboard)).toHaveBeenCalled();
      });
    });

    it('should have keyboard-accessible copy buttons with Space', async () => {
      render(<DataStorageSection />);

      await waitFor(() => {
        expect(screen.getByTestId('copy-para-path')).toBeInTheDocument();
      });

      const copyButton = screen.getByTestId('copy-para-path');
      copyButton.focus();

      // Should be activatable via Space
      fireEvent.keyDown(copyButton, { key: ' ' });
      await waitFor(() => {
        expect(vi.mocked(copyToClipboard)).toHaveBeenCalled();
      });
    });

    it('should have aria-label on copy buttons', async () => {
      render(<DataStorageSection />);

      await waitFor(() => {
        const copyParaButton = screen.getByTestId('copy-para-path');
        const copyDbButton = screen.getByTestId('copy-db-path');

        expect(copyParaButton).toHaveAttribute(
          'aria-label',
          expect.stringMatching(/copy.*para/i)
        );
        expect(copyDbButton).toHaveAttribute(
          'aria-label',
          expect.stringMatching(/copy.*database/i)
        );
      });
    });

    it('should announce copy success to screen readers', async () => {
      const user = userEvent.setup();
      render(<DataStorageSection />);

      await waitFor(() => {
        expect(screen.getByTestId('copy-para-path')).toBeInTheDocument();
      });

      const copyButton = screen.getByTestId('copy-para-path');
      await user.click(copyButton);

      // Should have aria-live region for announcements
      await waitFor(() => {
        const liveRegion = screen.getByRole('status');
        expect(liveRegion).toBeInTheDocument();
        expect(liveRegion).toHaveTextContent(/copied/i);
      });
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================
  describe('DataStorageSection edge cases', () => {
    it('should handle home directory with spaces', async () => {
      vi.mocked(pathApi.homeDir).mockResolvedValue('/Users/John Doe');

      render(<DataStorageSection />);

      await waitFor(() => {
        const paraPath = screen.getByTestId('para-location-path');
        expect(paraPath.textContent).toContain('/Users/John Doe/Orion');
      });
    });

    it('should handle very long paths without overflow', async () => {
      vi.mocked(pathApi.appDataDir).mockResolvedValue(
        '/Users/testuser/Library/Application Support/Very/Long/Nested/Path/That/Goes/On/Forever/Orion'
      );

      render(<DataStorageSection />);

      await waitFor(() => {
        const dbPath = screen.getByTestId('db-location-path');
        expect(dbPath).toBeInTheDocument();
        // Should have text-overflow or truncation handling
        expect(dbPath).toHaveStyle({ overflow: 'hidden' });
      });
    });

    it('should handle path resolution returning undefined', async () => {
      vi.mocked(pathApi.homeDir).mockResolvedValue(undefined as unknown as string);

      render(<DataStorageSection />);

      await waitFor(() => {
        expect(screen.getByText(/unable to resolve/i)).toBeInTheDocument();
      });
    });

    it('should handle rapid copy button clicks', async () => {
      const user = userEvent.setup();
      render(<DataStorageSection />);

      await waitFor(() => {
        expect(screen.getByTestId('copy-para-path')).toBeInTheDocument();
      });

      const copyButton = screen.getByTestId('copy-para-path');

      // Rapidly click 5 times
      await user.click(copyButton);
      await user.click(copyButton);
      await user.click(copyButton);
      await user.click(copyButton);
      await user.click(copyButton);

      // Should handle gracefully (not crash, maybe debounce)
      expect(vi.mocked(copyToClipboard)).toHaveBeenCalled();
    });
  });
});
