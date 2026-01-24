# Orion Butler

> Your AI-powered personal butler for knowledge workers

[![Test Pipeline](https://github.com/sidart10/orion-butler/actions/workflows/test.yml/badge.svg)](https://github.com/sidart10/orion-butler/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri 2.0](https://img.shields.io/badge/Tauri-2.0-blue.svg)](https://tauri.app)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org)

**Orion Butler** is a macOS desktop application that brings Claude Code's autonomous productivity patterns to knowledge workers. It's a Claude Agent SDK harness with conversation-first UX, PARA/GTD organization, and deep integrations via Composio.

## Features

- **Conversational AI Interface** - Chat naturally with Claude to manage tasks, projects, and workflows
- **PARA Organization** - Projects, Areas, Resources, Archive structure for knowledge management
- **GTD Integration** - Capture, clarify, organize, reflect, engage workflow
- **Canvas System** - Visual workspace for complex planning and ideation
- **Composio Integrations** - Gmail, Calendar, Notion, Slack, and 250+ tools
- **Local-First** - Your data stays on your machine in `~/Orion/`

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Desktop Runtime** | Tauri 2.0 (Rust) |
| **Frontend** | Next.js 16 + React 19 |
| **Styling** | Tailwind CSS 4 |
| **State** | Zustand + Immer |
| **Database** | SQLite (via better-sqlite3) |
| **AI** | Claude Agent SDK |
| **Integrations** | Composio MCP |

## Prerequisites

- macOS 12+ (Monterey or later)
- Node.js 22+
- Rust (for Tauri)
- Anthropic API key

## Quick Start

```bash
# Clone
git clone https://github.com/sidart10/orion-butler.git
cd orion-butler

# Install dependencies
npm install

# Run development server
npm run dev

# Or run as Tauri app
npm run tauri:dev
```

## Development

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build Next.js for production |
| `npm run tauri:dev` | Run Tauri app in dev mode |
| `npm run tauri:build` | Build Tauri app for distribution |
| `npm run test` | Run all tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run lint` | Run ESLint |

### Project Structure

```
orion-butler/
├── src/                    # Next.js frontend
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   └── lib/               # Utilities
├── src-tauri/             # Tauri backend (Rust)
│   ├── src/               # Rust source
│   └── tauri.conf.json    # Tauri config
├── tests/                 # Test suites
│   ├── unit/              # Vitest unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # Playwright E2E tests
├── scripts/               # Helper scripts
│   ├── ci-local.sh        # Local CI mirror
│   └── burn-in.sh         # Flaky test detection
├── thoughts/              # Planning artifacts
│   └── planning-artifacts/
└── docs/                  # Documentation
```

## Testing

### Test Pyramid

```
        /\
       /E2E\        5% - Critical user journeys
      /─────\
     / INT   \     25% - IPC, SDK, database
    /─────────\
   /   UNIT    \   70% - Business logic, state
  /─────────────\
```

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests (requires dev server)
npm run test:e2e

# All tests with coverage
npm run test:coverage

# Local CI mirror
./scripts/ci-local.sh

# Flaky test detection (10 iterations)
./scripts/burn-in.sh
```

## CI/CD

The project uses GitHub Actions for continuous integration:

- **Lint & Type Check** - ESLint + TypeScript
- **Unit Tests** - Vitest with coverage
- **E2E Tests** - Playwright (4 parallel shards)
- **Burn-In** - 10-iteration flaky test detection on PRs

See [docs/ci.md](docs/ci.md) for pipeline details.

## Documentation

| Document | Description |
|----------|-------------|
| [PRD v2](thoughts/planning-artifacts/prd-v2.md) | Product Requirements Document |
| [Architecture](thoughts/planning-artifacts/architecture.md) | Technical architecture |
| [Epics](thoughts/planning-artifacts/epics.md) | Implementation epics |
| [NFRs](thoughts/planning-artifacts/nfr-extracted-from-prd-v2.md) | Non-functional requirements |
| [CI Guide](docs/ci.md) | CI/CD pipeline documentation |

## Status

**Phase:** Sprint 0 - Infrastructure Setup

- [x] Project scaffold (Tauri + Next.js)
- [x] Test framework (Vitest + Playwright)
- [x] CI/CD pipeline (GitHub Actions)
- [x] Design system foundation
- [ ] Claude Agent SDK integration
- [ ] Composio MCP setup
- [ ] Core UI components

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)

---

**Orion Butler** - Your AI-powered personal assistant for getting things done.
