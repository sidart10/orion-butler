'use client'

import { useEffect } from 'react'

/**
 * Global Error Boundary Component for Root Layout Errors
 *
 * Next.js App Router convention: global-error.tsx handles errors in the root layout.
 * This is a Client Component that replaces the entire HTML structure when an error
 * occurs in the root layout itself.
 *
 * IMPORTANT: Because this replaces the root layout, it must include its own
 * <html> and <body> tags. The design system CSS may not be loaded, so we use
 * inline styles as fallback.
 *
 * Design System Compliance (with fallbacks):
 * - Uses orion-bg (#FAF8F5) for background
 * - Uses orion-fg (#1A1A1A) for primary text
 * - Uses orion-gold (#D4AF37) for accent/hover
 * - Sharp corners (no border-radius) per editorial luxury aesthetic
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-root-layouts
 */
export default function GlobalError({
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
    <html lang="en">
      <head>
        <title>Error - Orion</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          /* Inline fallback styles in case CSS doesn't load */
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: #FAF8F5;
            color: #1A1A1A;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .global-error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 16px;
          }
          .global-error-heading {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 32px;
            margin-bottom: 16px;
          }
          .global-error-message {
            color: #6B6B6B;
            margin-bottom: 24px;
            text-align: center;
            max-width: 28rem;
          }
          .global-error-button {
            padding: 12px 24px;
            background-color: #1A1A1A;
            color: #FAF8F5;
            border: none;
            cursor: pointer;
            font-family: inherit;
            font-size: 14px;
            transition: background-color 0.2s ease, color 0.2s ease;
          }
          .global-error-button:hover {
            background-color: #D4AF37;
            color: white;
          }
          .global-error-button:focus-visible {
            outline: 2px solid #D4AF37;
            outline-offset: 2px;
          }
        `}</style>
      </head>
      <body>
        <div
          role="alert"
          data-testid="global-error-container"
          className="global-error-container"
        >
          <h2 className="global-error-heading">
            Something went wrong
          </h2>
          <p className="global-error-message">
            {error.message || 'A critical error occurred. Please try again.'}
          </p>
          <button
            onClick={reset}
            className="global-error-button"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
