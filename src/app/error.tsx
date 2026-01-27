'use client'

import { useEffect } from 'react'

/**
 * Error Boundary Component for App Router
 *
 * Next.js App Router convention: error.tsx renders when errors occur in the route segment.
 * This is a Client Component that receives the error and a reset function.
 *
 * Design System Compliance:
 * - Uses orion-bg for background
 * - Uses orion-fg for primary text
 * - Uses orion-fg-muted for secondary text
 * - Uses Playfair Display (font-serif) for headings
 * - Sharp corners (no border-radius) per editorial luxury aesthetic
 * - Button follows design system with gold hover state
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    // In production, this would send to a service like Sentry, LogRocket, etc.
    console.error(error)
  }, [error])

  return (
    <div
      role="alert"
      data-testid="error-container"
      className="flex flex-col items-center justify-center min-h-screen bg-orion-bg text-orion-fg px-4"
    >
      <h2 className="text-display font-serif mb-4">
        Something went wrong
      </h2>
      <p className="text-orion-fg-muted mb-6 text-center max-w-md">
        {error.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-orion-fg text-orion-bg hover:bg-orion-gold hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orion-gold focus-visible:outline-offset-2"
      >
        Try again
      </button>
    </div>
  )
}
