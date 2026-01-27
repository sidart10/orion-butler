#!/bin/bash
# Security Audit Script for Orion Butler CI Pipeline
#
# Story 0.7: CI Pipeline with Coverage Gates
# Validates NFR-4.1: API keys in Keychain only
#
# Exit codes:
#   0 - All checks passed
#   1 - Security violation found
#
# Usage: ./tests/scripts/security-audit.sh

set -e

echo "=========================================="
echo "     Orion Butler Security Audit"
echo "=========================================="
echo ""

VIOLATIONS=0

# ============================================
# Check 1: Plaintext API keys in source
# ============================================
echo "Step 1/4: Checking for plaintext API keys in source..."

# Patterns to detect API keys
PATTERNS="sk-ant-|ANTHROPIC_API_KEY=sk|composio_api_key=|COMPOSIO_API_KEY="

# Search in src/ and any .env* files in root
if grep -rE "$PATTERNS" src/ 2>/dev/null; then
  echo ""
  echo "[FAIL] Found plaintext API keys in src/"
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo "[PASS] No plaintext API keys in src/"
fi

# Check TypeScript/JavaScript/JSON files specifically (excluding test files and node_modules)
if grep -rE "$PATTERNS" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" . 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v "tests/" | grep -v ".spec.ts" | grep -v ".test.ts"; then
  echo ""
  echo "[FAIL] Found plaintext API keys in source files"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

echo ""

# ============================================
# Check 2: .env files committed to repository
# ============================================
echo "Step 2/4: Checking for .env files in repository..."

# Check if any .env files are tracked by git
if git ls-files 2>/dev/null | grep -E "^\.env$|\.env\.local$|\.env\.production$|\.env\.development$"; then
  echo ""
  echo "[FAIL] .env files committed to repository"
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo "[PASS] No .env files in repository"
fi

echo ""

# ============================================
# Check 3: API keys in git history (warning)
# ============================================
echo "Step 3/4: Checking git history for API keys (last 10 commits)..."

# Only check for actual key VALUES, not documentation patterns
ACTUAL_KEY_PATTERNS="sk-ant-api[0-9]+-[a-zA-Z0-9]{20,}|ANTHROPIC_API_KEY=sk-ant-api[0-9]+"
if git log -p -10 2>/dev/null | grep -E "$ACTUAL_KEY_PATTERNS" 2>/dev/null | head -5; then
  echo ""
  echo "[WARNING] API keys may exist in git history - consider rotating credentials"
  # This is a warning, not a violation (historical data)
else
  echo "[PASS] No API keys in recent git history"
fi

echo ""

# ============================================
# Check 4: Keychain usage in Tauri code
# ============================================
echo "Step 4/4: Verifying Keychain usage in Tauri code..."

if [ -d "src-tauri" ]; then
  # Check source files only, exclude build artifacts
  KEYCHAIN_MATCH=""
  if [ -d "src-tauri/src" ]; then
    KEYCHAIN_MATCH=$(grep -ri "keychain\|security-framework\|tauri-plugin-keychain" src-tauri/src/ 2>/dev/null | head -5 || true)
  fi

  CARGO_MATCH=""
  if [ -f "src-tauri/Cargo.toml" ]; then
    CARGO_MATCH=$(grep -i "tauri-plugin-keychain\|security-framework" src-tauri/Cargo.toml 2>/dev/null || true)
  fi

  if [ -n "$KEYCHAIN_MATCH" ]; then
    echo "$KEYCHAIN_MATCH"
    echo "[PASS] Keychain usage detected in Tauri source code"
  elif [ -n "$CARGO_MATCH" ]; then
    echo "$CARGO_MATCH"
    echo "[PASS] Keychain plugin configured in Cargo.toml"
  else
    echo "[INFO] No Keychain usage detected yet (will be required for NFR-4.1)"
    echo "  - Add tauri-plugin-keychain to Cargo.toml when implementing credentials"
    # Not a failure - Keychain is for when credentials feature is implemented
  fi
else
  echo "[INFO] src-tauri/ directory not found (may not be initialized yet)"
fi

echo ""

# ============================================
# Summary
# ============================================
echo "=========================================="
echo "              Summary"
echo "=========================================="

if [ $VIOLATIONS -gt 0 ]; then
  echo ""
  echo "[FAIL] Security audit failed with $VIOLATIONS violation(s)"
  echo ""
  echo "Please address the issues above before merging."
  exit 1
fi

echo ""
echo "[PASS] Security audit passed!"
echo ""
exit 0
