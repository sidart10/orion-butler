# Bug: TIGER-6 Session Destroy Race Condition

**Filed:** 2026-01-29
**Fixed:** 2026-01-29
**Severity:** Medium
**Component:** `src/hooks/useStreamingMachineWrapper.ts`
**Lines:** 231-256 (after fix)

---

## Summary

Session destruction during switch is fire-and-forget, allowing a race condition where new session creation may start before old session is fully destroyed.

## Current Behavior

```typescript
// Lines 346-366: Fire-and-forget destroy
const oldSessionId = previousSessionIdRef.current
if (oldSessionId && oldSessionId !== activeSessionId) {
  const sessionManager = createSessionManager()
  sessionManager.destroyStreamingSession(oldSessionId, { force: true })
    .then(() => { /* log */ })
    .catch((err) => { /* log */ })
}

// Line 369: Immediately starts setup WITHOUT awaiting destroy
setup()
```

## Expected Behavior (per plan)

```typescript
// Phase 2, Step 1 from session-management-wiring-plan.md
if (previousSessionIdRef.current && previousSessionIdRef.current !== activeSessionId) {
  const sessionManager = createSessionManager()
  const oldSession = sessionManager.getStreamingSession(previousSessionIdRef.current)

  if (oldSession) {
    // Check for in-flight requests
    if (oldSession.hasActiveRequest()) {
      await oldSession.cancel()
    }

    // AWAIT destroy before proceeding
    await sessionManager.destroyStreamingSession(previousSessionIdRef.current, { force: true })
  }
}

// THEN start setup
await setup()
```

## Impact

1. **MAX_SESSIONS_PHASE1 errors** - If destroy is slow and user switches sessions rapidly, new session creation may fail due to session limit
2. **Memory pressure** - Multiple sessions may exist briefly during transition
3. **Event routing confusion** - Old session may still receive events briefly after switch

## Reproduction Steps

1. Start a streaming response (long one)
2. Rapidly switch between 3+ sessions
3. Observe console for `MAX_SESSIONS_PHASE1` or destroy/create interleaving logs

## Proposed Fix

```typescript
// In useStreamingMachineWrapper.ts main effect

const setup = async () => {
  // STEP 0: Destroy previous session FIRST (synchronously awaited)
  const oldSessionId = previousSessionIdRef.current
  if (oldSessionId && oldSessionId !== activeSessionId) {
    try {
      const sessionManager = createSessionManager()
      const oldSession = sessionManager.getStreamingSession(oldSessionId)

      // Cancel in-flight request if any
      if (oldSession?.hasActiveRequest()) {
        await oldSession.cancel()
      }

      await sessionManager.destroyStreamingSession(oldSessionId, { force: true })

      if (process.env.NODE_ENV !== 'production') {
        console.log(`[useStreamingMachineWrapper] TIGER-6: Destroyed old session ${oldSessionId}`)
      }
    } catch (err) {
      console.error(`[useStreamingMachineWrapper] Failed to destroy session ${oldSessionId}:`, err)
      // Continue anyway - don't block new session creation
    }
  }

  // Check cancelled after destroy await
  if (cancelled) return

  // STEP 1+: Continue with existing setup logic...
  try {
    const conversationId = await getConversationId()
    // ... rest of setup
  }
}

// Remove the fire-and-forget destroy block (lines 346-366)
// Start setup directly
setup()
```

## Related

- **Plan:** `thoughts/shared/plans/session-management-wiring-plan.md` (Phase 2, Step 1)
- **TIGER-6 mitigation:** Intended to prevent MAX_SESSIONS limit errors
- **Phase 5:** Plan also mentions debounce in SessionSelector (not yet implemented)

## Acceptance Criteria

- [x] Old session destroy completes before new session creation starts
- [x] In-flight requests cancelled before destroy
- [x] No `MAX_SESSIONS_PHASE1` errors during rapid switching
- [x] Console shows sequential: "Destroyed old session X" → "Session created Y"
- [x] Unit test covers rapid switch scenario (49 tests pass, including "50 rapid session switches")

## Resolution

Fixed by moving TIGER-6 destroy logic inside the `setup()` async function where it can be properly awaited before new session creation. Key changes:

1. Moved destroy from fire-and-forget `.then()/.catch()` to awaited call inside `setup()`
2. Added `hasActiveRequest()` check with `await cancel()` before destroy
3. Added `cancelled` check after destroy await to handle unmount during async
4. Removed redundant fire-and-forget block

**Commit:** (pending)
