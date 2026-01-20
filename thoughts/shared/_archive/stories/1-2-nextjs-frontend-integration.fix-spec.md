# Fix Specification: Story 1-2-nextjs-frontend-integration

**Review Date:** 2026-01-15
**Reviewer:** DEV Agent (Amelia) - Code Review Pass
**Story Status:** review
**Review Result:** ISSUES_FOUND

---

## Issues Found

### Issue 1: ErrorProvider Not Integrated (AC2 - Severity: MEDIUM)

**Location:** `src/contexts/error-context.tsx` and `src/app/layout.tsx`

**Description:**
Task 4.4 requires "Add error context provider for centralized error handling". The `ErrorProvider` component was created in `src/contexts/error-context.tsx`, but it is **never integrated into the application**. The `layout.tsx` does not wrap children with `ErrorProvider`, making the centralized error context unusable.

**Expected:**
```tsx
// src/app/layout.tsx
import { ErrorProvider } from '@/contexts/error-context';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorProvider>
          {children}
        </ErrorProvider>
      </body>
    </html>
  );
}
```

**Actual:**
```tsx
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
```

**Fix Required:**
1. Import `ErrorProvider` from `@/contexts/error-context` in layout.tsx
2. Wrap `{children}` with `<ErrorProvider>` in the body

**AC Impacted:** AC2 (Error Boundary Protection - centralized error handling)

---

### Issue 2: Missing Unit Tests for useTauriEvent Hook (Test Coverage - Severity: MEDIUM)

**Location:** `src/hooks/useTauriEvent.ts`

**Description:**
The `useTauriEvent` custom hook (Task 5.3) has no unit tests. The ATDD checklist specifies AC1-05 "IPC event listener setup" which should include testing this hook.

**Files Checked:**
- `tests/unit/hooks/useTauriEvent.test.ts` - Does not exist
- `tests/unit/**/useTauriEvent*` - No matches

**Fix Required:**
Create `tests/unit/hooks/useTauriEvent.test.ts` with tests for:
- Hook returns correct initial state when Tauri not available
- Hook correctly manages listener lifecycle
- Hook cleans up listener on unmount
- Hook handles enabled/disabled state
- Hook updates payload state on event received

---

### Issue 3: Missing Unit Tests for ErrorContext (Test Coverage - Severity: MEDIUM)

**Location:** `src/contexts/error-context.tsx`

**Description:**
The `ErrorContext` and `ErrorProvider` components (Task 4.4) have no unit tests. The ATDD checklist specifies comprehensive error handling tests.

**Files Checked:**
- `tests/unit/contexts/error-context.test.tsx` - Does not exist
- `tests/unit/**/error-context*` - No matches

**Fix Required:**
Create `tests/unit/contexts/error-context.test.tsx` with tests for:
- `ErrorProvider` renders children correctly
- `reportError` updates error state correctly
- `clearError` clears error state
- `hasError` reflects correct state
- `useError` throws when used outside provider
- Error logging includes structured format with timestamp

---

### Issue 4: README Does Not Document Development Workflow (Documentation - Severity: LOW)

**Location:** `README.md`

**Description:**
Task 7.4 requires "Document development workflow in README". The current README is for the "Continuous Claude" framework, not specifically for Orion. There is no documentation of:
- How to start development (`pnpm dev` + `pnpm tauri dev`)
- HMR behavior and testing
- Build process for Tauri

**Fix Required:**
Either:
1. Add an "Orion Development" section to the existing README, OR
2. Create a `docs/DEVELOPMENT.md` specifically for Orion development workflow

Should include:
- Development prerequisites
- Starting the development environment
- HMR verification steps
- Build commands
- Testing commands

---

## Summary

| Issue | Severity | Type | AC Impacted |
|-------|----------|------|-------------|
| ErrorProvider not integrated | MEDIUM | Code | AC2 |
| Missing useTauriEvent tests | MEDIUM | Test Coverage | AC1 |
| Missing ErrorContext tests | MEDIUM | Test Coverage | AC2 |
| README missing dev workflow | LOW | Documentation | AC3 |

**Total Issues:** 4
**Blocking Issues:** 0 (all are MEDIUM or LOW severity)

---

## Verification After Fix

After implementing fixes, verify:

1. **ErrorProvider Integration:**
   ```bash
   # Check layout.tsx includes ErrorProvider
   grep -q "ErrorProvider" src/app/layout.tsx && echo "PASS" || echo "FAIL"
   ```

2. **Test Coverage:**
   ```bash
   # Run all unit tests - should include new test files
   pnpm test:unit
   ```

3. **Documentation:**
   ```bash
   # Check for development documentation
   grep -q "pnpm tauri dev" README.md || grep -q "Development" docs/DEVELOPMENT.md
   ```

---

**Review Completed:** 2026-01-15T20:40:00Z
