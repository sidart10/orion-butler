/**
 * useSessionLoader Hook
 * Story 3.9: Load Conversation on App Launch
 *
 * Loads the most recent active session on app mount.
 * Includes retry logic with exponential backoff for resilience.
 */

import { useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useSessionStore, type Session, type SessionMetadata } from '@/stores/sessionStore'

/** Maximum number of retry attempts for initial load */
const MAX_RETRIES = 3

/** Base delay in ms for exponential backoff */
const BASE_DELAY_MS = 500

/** Default limit for recent sessions query */
export const RECENT_SESSIONS_LIMIT = 10

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useSessionLoader() {
  const {
    setActiveSession,
    setRecentSessions,
    setLoadingSession,
    setLoadingRecent,
    setSessionError,
  } = useSessionStore()

  useEffect(() => {
    async function loadInitialSession() {
      setLoadingSession(true)
      setLoadingRecent(true)

      let lastError: Error | unknown = null

      // Retry loop with exponential backoff
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          // Load recent sessions for selector
          const recent = await invoke<SessionMetadata[]>('get_recent_sessions', {
            limit: RECENT_SESSIONS_LIMIT,
          })
          setRecentSessions(recent)
          setLoadingRecent(false)

          // Load most recent active session
          if (recent.length > 0) {
            const mostRecent = recent[0]

            // Skip corrupted sessions
            if (mostRecent.isCorrupted) {
              setSessionError('Previous session could not be restored')
              setLoadingSession(false)
              return
            }

            const session = await invoke<Session>('load_session', {
              sessionId: mostRecent.id,
            })
            setActiveSession(session)
          }

          // Success - exit retry loop
          setLoadingSession(false)
          return
        } catch (error) {
          lastError = error
          console.warn(
            `[useSessionLoader] Attempt ${attempt + 1}/${MAX_RETRIES} failed:`,
            error
          )

          // Don't sleep after the last attempt
          if (attempt < MAX_RETRIES - 1) {
            const delay = BASE_DELAY_MS * Math.pow(2, attempt) // 500ms, 1000ms, 2000ms
            await sleep(delay)
          }
        }
      }

      // All retries exhausted
      console.error('[useSessionLoader] All retries exhausted:', lastError)
      setSessionError(
        lastError instanceof Error ? lastError.message : 'Failed to load session after retries'
      )
      setLoadingSession(false)
      setLoadingRecent(false)
    }

    loadInitialSession()
  }, [setActiveSession, setRecentSessions, setLoadingSession, setLoadingRecent, setSessionError])
}
