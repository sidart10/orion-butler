'use client'

/**
 * Settings Page
 * Story 1.14: Dark Mode - Manual Toggle
 *
 * Minimal settings page with Appearance section for theme selection.
 * Editorial Luxury styling: 0px border radius, gold accents.
 *
 * This is a placeholder - full settings will be expanded in future stories.
 */

import Link from 'next/link'
import { ThemeSelector } from '@/components/settings/ThemeSelector'
import { KeyboardShortcutsSection } from '@/components/settings/KeyboardShortcutsSection'
import { ArrowLeft } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div
      className="min-h-screen bg-orion-bg text-orion-fg"
      data-testid="settings-page"
    >
      {/* Header */}
      <header className="border-b border-orion-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-orion-fg-muted hover:text-orion-fg transition-colors duration-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orion-gold"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
        </div>
        <h1 className="mt-4 text-2xl font-serif font-medium">Settings</h1>
      </header>

      {/* Content */}
      <main className="px-6 py-8 max-w-2xl">
        {/* Appearance Section */}
        <section
          className="mb-8"
          aria-labelledby="appearance-heading"
          data-testid="appearance-section"
        >
          <h2
            id="appearance-heading"
            className="text-lg font-medium mb-4 text-orion-fg"
          >
            Appearance
          </h2>

          {/* Theme Selection */}
          <div className="space-y-3">
            <label className="block text-sm text-orion-fg-muted">
              Theme
            </label>
            <ThemeSelector />
            <p className="text-xs text-orion-fg-muted mt-2">
              Select your preferred theme or use system settings.
            </p>
          </div>
        </section>

        {/* Keyboard Shortcuts Section - Story 1.15 */}
        <section
          className="border-t border-orion-border pt-8 mb-8"
          aria-labelledby="keyboard-heading"
          data-testid="keyboard-section"
        >
          <KeyboardShortcutsSection />
        </section>

        {/* Placeholder for future settings sections */}
        <section className="border-t border-orion-border pt-8">
          <p className="text-sm text-orion-fg-muted">
            More settings coming soon.
          </p>
        </section>
      </main>
    </div>
  )
}
