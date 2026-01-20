# Plan: Fix Agent Server Path Resolution

## Goal
Fix the agent server startup failure "Agent server directory not found" by implementing robust path resolution that works reliably in development, test, and production environments.

## Technical Choices
- **Path Resolution Strategy**: Use compile-time `CARGO_MANIFEST_DIR` for development, `resource_dir()` for production - this is the standard Tauri pattern
- **Environment Detection**: Use `cfg!(debug_assertions)` to differentiate dev/prod paths at compile time
- **Fallback Chain**: Implement multiple fallback paths with detailed logging for each attempt

## Current State Analysis
The current implementation in `src-tauri/src/agent_server.rs:99-133` has these issues:

1. **`resource_dir()` fails in dev mode** - Resources aren't bundled during development
2. **`current_dir()` is unreliable** - Depends on where the app is launched from
3. **No compile-time path** - Doesn't use `CARGO_MANIFEST_DIR` which is the standard Tauri pattern

### Key Files:
- `src-tauri/src/agent_server.rs` - Contains `get_agent_server_path()` function
- `src-tauri/tauri.conf.json` - Bundles `agent-server/dist/` for production
- `agent-server/dist/index.js` - The entry point that must exist

## Tasks

### Task 1: Refactor `get_agent_server_path()` with compile-time path
Implement the standard Tauri pattern using `CARGO_MANIFEST_DIR` for development builds.

- [ ] Add `env!("CARGO_MANIFEST_DIR")` for compile-time path resolution in dev mode
- [ ] Use `cfg!(debug_assertions)` to select dev vs prod path strategy
- [ ] Add detailed logging for each path attempt to aid debugging
- [ ] Maintain the `resource_dir()` path for production builds

**Files to modify:**
- `src-tauri/src/agent_server.rs`

**Code change:**
```rust
pub fn get_agent_server_path(app: &AppHandle) -> Result<PathBuf, String> {
    // In debug/development builds, use CARGO_MANIFEST_DIR (compile-time)
    #[cfg(debug_assertions)]
    {
        // CARGO_MANIFEST_DIR points to src-tauri/, so go up one level
        let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let dev_path = manifest_dir.parent()
            .map(|p| p.join("agent-server"))
            .ok_or_else(|| "Failed to get parent of CARGO_MANIFEST_DIR".to_string())?;

        info!("[Agent Server] Dev mode - checking path: {:?}", dev_path);

        if dev_path.is_dir() && dev_path.join("dist/index.js").exists() {
            info!("[Agent Server] Using dev path: {:?}", dev_path);
            return Ok(dev_path);
        }

        return Err(format!(
            "Agent server not found at {:?}. Run 'pnpm build' in agent-server/",
            dev_path
        ));
    }

    // In release builds, use bundled resources
    #[cfg(not(debug_assertions))]
    {
        // PRE-MORTEM MITIGATION: Check for ORION_DEV env var to force dev mode
        // This handles `cargo build --release` run in development environment
        if std::env::var("ORION_DEV").is_ok() {
            let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
            if let Some(parent) = manifest_dir.parent() {
                let dev_path = parent.join("agent-server");
                if dev_path.is_dir() && dev_path.join("dist/index.js").exists() {
                    info!("[Agent Server] ORION_DEV mode - using dev path: {:?}", dev_path);
                    return Ok(dev_path);
                }
            }
        }

        let resource_path = app
            .path()
            .resource_dir()
            .map_err(|e| format!("Failed to get resource dir: {}", e))?;

        // Check for bundled agent-server directory
        let server_path = resource_path.join("agent-server");
        if server_path.is_dir() {
            info!("[Agent Server] Using bundled path: {:?}", server_path);
            return Ok(server_path);
        }

        // Check if dist files are directly in resource dir (flat bundle structure)
        if resource_path.join("dist/index.js").exists() {
            info!("[Agent Server] Using flat bundle path: {:?}", resource_path);
            return Ok(resource_path.clone());
        }

        // PRE-MORTEM MITIGATION: Fallback to dev path even in release builds
        // Handles running release binary from development checkout
        let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        if let Some(parent) = manifest_dir.parent() {
            let dev_path = parent.join("agent-server");
            if dev_path.is_dir() && dev_path.join("dist/index.js").exists() {
                warn!("[Agent Server] Release build using dev path fallback: {:?}", dev_path);
                return Ok(dev_path);
            }
        }

        Err(format!(
            "Agent server not found in bundle at {:?}",
            resource_path
        ))
    }
}
```

### Task 2: Update `start_agent_server()` with better error handling
Improve error messages to help users understand what's missing and how to fix it.

- [ ] Add pre-flight checks for Node.js availability
- [ ] Check for `dist/index.js` existence before spawning
- [ ] Add clear error messages with recovery instructions

**Node.js pre-flight check implementation:**
```rust
// Before spawning, verify Node.js is available
fn check_node_available() -> Result<(), String> {
    Command::new("node")
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map_err(|e| format!(
            "Node.js not found. Install from https://nodejs.org/. Error: {}",
            e
        ))?;
    Ok(())
}
```

**Files to modify:**
- `src-tauri/src/agent_server.rs`

### Task 3: Add integration test for path resolution
Ensure the path resolution works correctly in test environment.

- [ ] Add unit test for `get_agent_server_path()` in dev mode
- [ ] Verify compile-time path resolution works correctly

**Files to modify:**
- `src-tauri/src/agent_server.rs` (test module)

### Task 4: Update bundle configuration for production
Ensure the bundled resources have the correct structure for production.

- [ ] Verify `tauri.conf.json` resources configuration is correct
- [ ] Consider bundling as `agent-server/dist/` directory structure vs flat

**Files to verify:**
- `src-tauri/tauri.conf.json`

### Task 5: Add production bundle verification test (PRE-MORTEM MITIGATION)
Verify the production bundle structure matches what the code expects.

- [ ] Create a test script that runs `pnpm tauri build` and inspects bundle contents
- [ ] Verify `dist/index.js` exists at expected location in the bundle
- [ ] Add to CI/pre-release checklist

**Test script:**
```bash
#!/bin/bash
# scripts/verify-bundle.sh
set -e
echo "Building production bundle..."
pnpm tauri build

# macOS bundle location
BUNDLE_RESOURCES="src-tauri/target/release/bundle/macos/Orion.app/Contents/Resources"

echo "Checking bundle structure..."
if [ -f "$BUNDLE_RESOURCES/dist/index.js" ]; then
    echo "✓ Found dist/index.js (flat structure)"
elif [ -f "$BUNDLE_RESOURCES/agent-server/dist/index.js" ]; then
    echo "✓ Found agent-server/dist/index.js (nested structure)"
else
    echo "✗ ERROR: Agent server not found in bundle!"
    echo "  Checked: $BUNDLE_RESOURCES"
    ls -la "$BUNDLE_RESOURCES" || true
    exit 1
fi
echo "Bundle verification passed!"
```

**Files to create:**
- `scripts/verify-bundle.sh`

## Success Criteria

### Automated Verification:
- [ ] Rust tests pass: `cd src-tauri && cargo test`
- [ ] Tauri dev mode starts without agent server error: `pnpm tauri dev`
- [ ] Agent server health check responds: `curl http://localhost:3001/health`

### Manual Verification:
- [ ] App starts from project root: `pnpm tauri dev`
- [ ] App starts from src-tauri/: `cd src-tauri && cargo run`
- [ ] Logs show correct path being used for agent-server
- [ ] Production build bundles agent-server correctly

## Out of Scope
- Changes to the Node.js agent server itself
- Windows/Linux path handling (can be added later)
- Automatic agent-server build if dist is missing

## Risks (Pre-Mortem)

### Tigers (Addressed):
- **CARGO_MANIFEST_DIR not available in runtime** (LOW)
  - Mitigation: It's a compile-time macro, always available ✓ PAPER TIGER

- **Bundle structure mismatch in production** (HIGH → MITIGATED)
  - Original issue: tauri.conf.json bundles flat `dist/` but code might expect nested `agent-server/`
  - Mitigation: Code handles both structures + Task 5 adds bundle verification script

- **Release build run in dev environment** (MEDIUM → MITIGATED)
  - Original issue: `cargo build --release && ./target/release/orion` uses prod paths with dev layout
  - Mitigation: Added `ORION_DEV` env var override AND automatic dev path fallback in release builds

### Elephants (Addressed):
- **Different behavior between dev and prod builds** (MEDIUM)
  - Note: This is intentional and standard for Tauri, but could cause "works on my machine" issues. Clear logging helps diagnose.

- **No Node.js availability check** (MEDIUM → MITIGATED)
  - Original issue: Task 2 mentioned pre-flight checks but didn't specify implementation
  - Mitigation: Added explicit `check_node_available()` implementation in Task 2

### Accepted Risks:
- **Windows/Linux path handling** - Explicitly out of scope, tracked for follow-up

---
**Pre-Mortem Run:**
- Date: 2026-01-19
- Mode: deep
- Original Tigers: 2 (1 HIGH, 1 MEDIUM)
- Original Elephants: 2
- All addressed with mitigations above
