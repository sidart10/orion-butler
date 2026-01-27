import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { KeyboardShortcutProvider } from "@/components/providers/KeyboardShortcutProvider";
import { QuickCaptureModal } from "@/components/modals/QuickCaptureModal";
import { CommandPaletteModal } from "@/components/modals/CommandPaletteModal";

/**
 * Inter font configuration
 * - Variable font with full weight range (100-900) by default
 * - Used for body text, H2/H3, UI elements
 * - display: 'swap' for FOUT prevention
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Playfair Display font configuration
 * - Display headings (32px), H1 (24px), editorial accent text
 * - Weights: 400-900 for full typographic control
 * - Includes italic variant for editorial emphasis
 * - display: 'swap' for FOUT prevention
 */
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Orion",
  description: "Your personal AI butler",
};

/**
 * Flash prevention script for theme
 * Story 1.14 AC#5: No flash of wrong theme on load
 *
 * This script runs before React hydration to apply the correct theme class
 * based on localStorage cache, preventing FOUC (Flash of Unstyled Content).
 */
const themeFlashPreventionScript = `
(function() {
  try {
    var pref = localStorage.getItem('theme-preference');
    if (pref === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      // Default to light mode - Orion is designed light-first
      document.documentElement.classList.add('light');
    }
  } catch (e) {
    document.documentElement.classList.add('light');
  }
})();
`;

/**
 * Root Layout
 * Story 1.13: Dark Mode System Detection
 * Story 1.14: Dark Mode - Manual Toggle
 *
 * Features:
 * - suppressHydrationWarning: Prevents React hydration warning when theme differs between server/client
 * - color-scheme meta tag: Ensures proper browser behavior for scrollbars, form controls, etc.
 * - bg-orion-bg text-orion-fg: Uses design system tokens that switch with theme
 * - Flash prevention script: Applies theme class before React hydration
 * - ThemeProvider: Initializes theme state and listens for system changes
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Story 1.13 AC#1: Color scheme meta tag for proper browser behavior */}
        <meta name="color-scheme" content="light dark" />
        {/* Story 1.14 AC#5: Blocking script to prevent theme flash */}
        <script dangerouslySetInnerHTML={{ __html: themeFlashPreventionScript }} />
      </head>
      <body className="font-sans antialiased bg-orion-bg text-orion-fg">
        <ThemeProvider>
          <KeyboardShortcutProvider>
            {children}
            {/* Story 1.15: Global modals rendered at root level */}
            <QuickCaptureModal />
            <CommandPaletteModal />
          </KeyboardShortcutProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
