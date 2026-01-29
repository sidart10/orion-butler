# Database Migration Deployment Checklist

**Phase:** Phase 0 - Concurrent Sessions Foundation
**Migration:** 0001_add_active_request
**Risk Level:** MEDIUM
**Estimated Time:** 15-30 minutes

---

## Pre-Deployment (Dev Environment)

### Test Migration on Production Database Copy

- [ ] Copy production database
  ```bash
  # Copy production DB
  cp ~/Orion/data/orion.db ~/Orion/data/orion-backup-$(date +%Y%m%d).db

  # Apply migration
  sqlite3 ~/Orion/data/orion.db < src/db/migrations/0001_add_active_request_up.sql

  # Verify schema
  sqlite3 ~/Orion/data/orion.db ".schema conversations"
  ```

- [ ] Test rollback on copy
  ```bash
  sqlite3 ~/Orion/data/orion.db < src/db/migrations/0001_add_active_request_down.sql

  # Verify column removed
  sqlite3 ~/Orion/data/orion.db ".schema conversations"
  ```

- [ ] Run full test suite after migration
  ```bash
  npm run test
  npm run test:integration
  ```

---

## Pre-Deployment (Production)

### CRITICAL: MANDATORY STEPS (ELEPHANT-A Mitigation)

- [ ] **Schedule deployment during low-traffic window**
  - Recommended: After 10 PM local time, weekday
  - Avoid: Weekends, holidays, during active user sessions

- [ ] **STOP application BEFORE migration (MANDATORY)**
  ```bash
  # Check for running processes
  pgrep -f orion && echo "ERROR: Orion is running. Stop it first." && exit 1

  # Kill if necessary
  pkill -SIGTERM -f orion
  sleep 2

  # Verify stopped
  pgrep -f orion && echo "ERROR: Failed to stop Orion" && exit 1
  ```

- [ ] **Check for open database connections (ELEPHANT-A)**
  ```bash
  lsof ~/Orion/data/orion.db && echo "ERROR: Database is open" && exit 1
  ```

- [ ] **Check table size before migration (TIGER-B)**
  ```bash
  sqlite3 ~/Orion/data/orion.db "SELECT COUNT(*) FROM conversations;"
  # If >10k rows, migration may take >5s. Plan maintenance window.
  ```

- [ ] **Verify no active sessions**
  ```bash
  sqlite3 ~/Orion/data/orion.db "SELECT COUNT(*) FROM conversations WHERE active_request_id IS NOT NULL;"
  # Should return 0 (since app is stopped)
  ```

- [ ] **Backup production database**
  ```bash
  cp ~/Orion/data/orion.db ~/Orion/backups/orion-pre-migration-$(date +%Y%m%d-%H%M%S).db
  ```

- [ ] **Document rollback command (keep handy)**
  ```bash
  # Save this command for quick rollback if needed
  sqlite3 ~/Orion/data/orion.db < src/db/migrations/0001_add_active_request_down.sql
  ```

---

## Deployment

- [ ] **Stop application** (if not already stopped)
  ```bash
  # Close all Orion windows
  # OR kill process if running headless
  pkill -f orion
  ```

- [ ] **Run migration with timeout**
  ```bash
  timeout 30s sqlite3 ~/Orion/data/orion.db < src/db/migrations/0001_add_active_request_up.sql
  echo $?  # Should be 0 (success)
  ```

- [ ] **Verify migration success**
  ```bash
  # Check column exists
  sqlite3 ~/Orion/data/orion.db "PRAGMA table_info(conversations);" | grep active_request_id
  # Should show: active_request_id | TEXT

  # Check index exists
  sqlite3 ~/Orion/data/orion.db "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_conversations_active_request';"
  # Should show: idx_conversations_active_request

  # Check schema version
  sqlite3 ~/Orion/data/orion.db "SELECT version FROM schema_migrations WHERE version=1;"
  # Should show: 1
  ```

- [ ] **Start application**
  ```bash
  # Launch Orion normally
  ```

---

## Post-Deployment (Monitor for 24 Hours)

### Monitoring Checklist

- [ ] **Check application logs for errors**
  ```bash
  # Look for:
  # - "Failed to persist request" (DB write errors)
  # - "Failed to restore from DB" (DB read errors)
  # - SQLite error messages
  ```

- [ ] **Verify RequestRegistry restore**
  ```bash
  # In Orion dev console (Cmd+Shift+I):
  # Look for: "[RequestRegistry] Restored N active requests from DB"
  ```

- [ ] **Send test message, verify completion**
  - Open Orion
  - Send "test concurrent sessions"
  - Wait for response
  - Check no errors in console

- [ ] **Monitor latency metrics**
  - Write-behind flush should take <5ms
  - Registry restore should take <100ms
  - No send() latency increase (should stay <2ms)

- [ ] **Check memory usage**
  - Monitor app memory in Activity Monitor
  - Should remain stable after 10+ messages
  - No growth >20% over 24 hours

---

## Rollback Procedure (If Needed)

### Trigger Rollback If:

- Migration fails with timeout
- Application crashes on startup after migration
- "Failed to restore from DB" errors in logs
- Users report loss of in-flight messages
- Latency degrades (send() >10ms)

### Rollback Steps

1. **Stop application**
   ```bash
   pkill -SIGTERM -f orion
   ```

2. **Choose rollback method:**

   **Option 1: Restore backup (Recommended)**
   ```bash
   cp ~/Orion/backups/orion-pre-migration-*.db ~/Orion/data/orion.db
   ```

   **Option 2: Run rollback migration**
   ```bash
   sqlite3 ~/Orion/data/orion.db < src/db/migrations/0001_add_active_request_down.sql
   ```

3. **Verify rollback**
   ```bash
   # Column should be gone
   sqlite3 ~/Orion/data/orion.db "PRAGMA table_info(conversations);" | grep active_request_id
   # Should return nothing
   ```

4. **Restart application**
   ```bash
   # Launch Orion normally
   ```

5. **Verify single-session mode works**
   - Send test message
   - Verify response
   - Check no errors

---

## Success Criteria

### Required (within 24h monitoring period):

- [ ] Migration completed in <30 seconds
- [ ] Zero "Failed to restore from DB" errors in application logs
- [ ] RequestRegistry restored N active requests (N ≥ 0)
- [ ] Test message completes successfully
- [ ] No user-reported issues after 24 hours
- [ ] Write-behind latency <2ms (p95)
- [ ] Memory usage stable (<500MB)

### Gates to Phase 1:

Phase 1 (2 Concurrent Sessions) cannot start until:

- [ ] Phase 0 deployed to production ✅
- [ ] Zero database migration errors in logs (monitor 24h)
- [ ] Write-behind latency <2ms (p95, measured via logs)
- [ ] Registry restore <100ms on app startup
- [ ] No memory leaks detected (single-session mode stress test)

---

## Emergency Contacts

**If migration fails critically:**
1. Execute rollback procedure immediately
2. Check GitHub Issues for known problems
3. Review `thoughts/shared/plans/PLAN-concurrent-sessions-phase0-foundation.md` for troubleshooting

---

## Notes

- **TIGER-B (Index Size Check):** If table has >10k rows, consider running migration during scheduled maintenance window
- **ELEPHANT-A (Active Connections):** Migration REQUIRES app to be stopped - no exceptions
- **ELEPHANT-B (Schema Versioning):** Version tracking enables safe future migrations

---

**Deployment Checklist Version:** 1.0
**Last Updated:** 2026-01-29
**Related Plan:** Phase 0 - Concurrent Sessions Foundation
