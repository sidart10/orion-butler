# Orion Development Guide

This guide covers setting up and running the Orion Personal Butler application for development.

## Prerequisites

- **Node.js 18+** - JavaScript runtime
- **pnpm** - Package manager (recommended for Tauri projects)
- **Rust** - For Tauri backend compilation
- **Tauri CLI** - Installed via dev dependencies

### Installing Prerequisites

```bash
# Install pnpm (if not already installed)
npm install -g pnpm

# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Getting Started

### 1. Install Dependencies

```bash
# Install Node.js dependencies
pnpm install
```

### 2. Development Mode

Orion uses Tauri with Next.js. In development, you need both servers running.

**Option A: Concurrent Development (Recommended)**

```bash
# Start Next.js dev server + Tauri
pnpm tauri:dev
```

This command:
1. Starts Next.js development server on `http://localhost:3000`
2. Compiles the Tauri Rust backend
3. Opens the desktop window loading from the dev server
4. Enables Hot Module Replacement (HMR)

**Option B: Separate Terminals (For Debugging)**

```bash
# Terminal 1: Next.js dev server
pnpm dev

# Terminal 2: Tauri development
pnpm tauri dev
```

### 3. Verify HMR is Working

1. Open `src/app/page.tsx`
2. Make a visible change (e.g., modify text)
3. Save the file
4. Changes should appear in the app window without full reload
5. Component state should be preserved where possible

## Project Structure

```
orion/
├── src/                    # Next.js frontend source
│   ├── app/                # App Router pages and layouts
│   │   ├── layout.tsx      # Root layout with providers
│   │   ├── page.tsx        # Home page
│   │   ├── error.tsx       # Error handling page
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   └── error-boundary.tsx
│   ├── contexts/           # React contexts
│   │   └── error-context.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useTauriEvent.ts
│   └── lib/                # Utility libraries
│       └── tauri.ts        # Tauri IPC helpers
├── src-tauri/              # Tauri backend (Rust)
│   ├── src/
│   │   └── main.rs         # Rust entry point
│   └── tauri.conf.json     # Tauri configuration
├── out/                    # Static export output (production)
└── tests/                  # Test files
    ├── unit/               # Unit tests (Vitest)
    └── e2e/                # End-to-end tests
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js development server (port 3000) |
| `pnpm build` | Build Next.js for production (static export) |
| `pnpm tauri:dev` | Start full Tauri development environment |
| `pnpm tauri:build` | Build production desktop app |
| `pnpm test` | Run all tests in watch mode |
| `pnpm test:unit` | Run unit tests once |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm lint` | Run ESLint on source files |

## Testing

### Unit Tests

```bash
# Run all unit tests
pnpm test:unit

# Run tests in watch mode
pnpm test

# Run with coverage
pnpm test:coverage
```

### E2E Tests

```bash
# Run headless
pnpm test:e2e

# Run with browser visible
pnpm test:e2e:headed
```

## Build for Production

### Static Export

Next.js builds to static HTML files for Tauri bundling:

```bash
pnpm build
```

This creates the `out/` directory with:
- `index.html` - Entry point
- `_next/static/` - JavaScript bundles
- Static assets

### Desktop App Build

```bash
pnpm tauri:build
```

This:
1. Runs `pnpm build` for Next.js static export
2. Compiles the Rust backend
3. Bundles everything into a macOS `.app` (or `.dmg`)

Build artifacts are in `src-tauri/target/release/bundle/`.

## Tauri IPC Communication

### Frontend to Backend (invoke)

```typescript
import { greet, invokeCommand } from '@/lib/tauri';

// Simple greet command
const message = await greet('World');

// Generic command
const result = await invokeCommand<ResponseType>('command_name', { arg: 'value' });
```

### Backend to Frontend (events)

```typescript
import { useTauriEvent } from '@/hooks/useTauriEvent';

function MyComponent() {
  const { payload, isListening } = useTauriEvent<{ data: string }>({
    event: 'backend-notification',
    onEvent: (data) => console.log('Received:', data),
  });

  return <div>{payload?.data}</div>;
}
```

## Error Handling

Orion uses a centralized error handling system:

1. **ErrorProvider** - Wraps the app in `layout.tsx`
2. **ErrorBoundary** - Catches React component errors
3. **Error Pages** - `error.tsx` and `global-error.tsx` for route errors

### Using the Error Context

```typescript
import { useError } from '@/contexts/error-context';

function MyComponent() {
  const { reportError, clearError, hasError } = useError();

  const handleError = () => {
    reportError('Something went wrong', { userId: 123 });
  };

  return hasError ? <ErrorUI /> : <NormalUI />;
}
```

## Troubleshooting

### "Tauri not available"

This is normal when running `pnpm dev` without Tauri. The app gracefully falls back to browser mode. Use `pnpm tauri:dev` for full desktop experience.

### HMR Not Working

1. Check Next.js dev server is running
2. Verify Tauri is loading from `http://localhost:3000`
3. Check `tauri.conf.json` has `devUrl` set correctly

### Build Fails

```bash
# Clear caches and rebuild
rm -rf .next out node_modules/.cache
pnpm install
pnpm build
```

### Rust Compilation Errors

```bash
# Update Rust
rustup update

# Clean Rust build
cd src-tauri && cargo clean
```

## Key Technical Notes

1. **Static Export Required**: Next.js must use `output: 'export'` for Tauri compatibility. No API routes or server-side rendering.

2. **Client-Side Only**: Tauri APIs must be called client-side only. Always check `isTauri()` before invoking commands.

3. **Hydration Safety**: Avoid `Date.now()` or random values in initial render. Use `useEffect` for browser-only code.

4. **File Protocol**: The production build runs on `file://` protocol. Use `trailingSlash: true` in Next.js config.

## References

- [Tauri Documentation](https://v2.tauri.app/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Architecture Documentation](./Cont.-claude-ARCHITECTURE.md)
