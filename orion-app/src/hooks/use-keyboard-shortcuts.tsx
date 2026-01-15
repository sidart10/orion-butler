"use client";

import { useEffect, useCallback } from "react";
import { useChatStore } from "@/stores/chat-store";

interface ShortcutConfig {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const { toggleCanvas } = useChatStore();

  const shortcuts: ShortcutConfig[] = [
    {
      key: "/",
      metaKey: true,
      action: toggleCanvas,
      description: "Toggle canvas",
    },
    {
      key: "k",
      metaKey: true,
      action: () => {
        // TODO: Open command palette in Phase 6
        console.log("Command palette (coming soon)");
      },
      description: "Open command palette",
    },
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const metaMatch = shortcut.metaKey
          ? event.metaKey || event.ctrlKey
          : true;
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : true;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (metaMatch && ctrlMatch && shiftMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

export function KeyboardShortcutsHelp() {
  const shortcuts = useKeyboardShortcuts();

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Keyboard Shortcuts</h3>
      <ul className="text-sm space-y-1">
        {shortcuts.map((shortcut) => (
          <li key={shortcut.key} className="flex justify-between">
            <span>{shortcut.description}</span>
            <kbd className="bg-muted px-2 py-0.5 rounded text-xs">
              {shortcut.metaKey && "Cmd+"}
              {shortcut.ctrlKey && "Ctrl+"}
              {shortcut.shiftKey && "Shift+"}
              {shortcut.key.toUpperCase()}
            </kbd>
          </li>
        ))}
        <li className="flex justify-between">
          <span>Send message</span>
          <kbd className="bg-muted px-2 py-0.5 rounded text-xs">Cmd+Enter</kbd>
        </li>
      </ul>
    </div>
  );
}
