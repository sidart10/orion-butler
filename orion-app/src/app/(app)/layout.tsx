"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  return <>{children}</>;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <KeyboardShortcutsProvider>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 overflow-hidden h-screen">
            {children}
          </main>
        </SidebarInset>
      </KeyboardShortcutsProvider>
    </SidebarProvider>
  );
}
