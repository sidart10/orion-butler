# System-Level Test Design: Orion Personal Butler

**Version:** 1.0
**Status:** Draft
**Date:** 2026-01-15
**Author:** TEA (Test Architect Agent)
**Mode:** System-Level (Pre-Implementation Testability Review)

---

## 1. Executive Summary

This document provides a **system-level test design** for Orion Personal Butler covering all 14 epics. It defines test strategy by epic, identifies architecturally significant requirements (ASRs), maps NFRs to testing approaches, and flags testability concerns requiring attention before implementation begins.

### Key Metrics

| Metric | Value |
|--------|-------|
| Epics Covered | 14 |
| Stories Analyzed | ~60+ |
| FRs Mapped | 73 |
| NFRs Identified | 22 |
| Critical Test Risks | 5 |

---

## 2. Testability Assessment

### 2.1 Controllability Matrix

| Component | Level | Rationale | Test Approach |
|-----------|-------|-----------|---------------|
| Agent Server (Node.js) | HIGH | HTTP endpoints, injectable mocks | API integration tests |
| SQLite Local DB | HIGH | Direct seeding, isolated instances | In-memory test DB |
| PostgreSQL Shared | HIGH | Schema isolation, fixtures | Docker test container |
| Tauri IPC Bridge | MEDIUM | Native code boundary | Integration + E2E |
| Composio Tools | LOW-MEDIUM | External OAuth, rate limits | Mock server pattern |
| Claude API | LOW | Non-deterministic, rate limited | Structured output mocks |

### 2.2 Observability Matrix

| Component | Level | Gap | Mitigation |
|-----------|-------|-----|------------|
| Langfuse Tracing | HIGH | None | Production observability |
| Braintrust Dev | HIGH | None | Dev-time tracing |
| SQLite Queries | MEDIUM | Query logging | Add debug logging layer |
| Agent Tool Calls | HIGH | None | FR-CH004 visualization |
| SSE Streaming | MEDIUM | Event capture | Network-first interception |
| IPC Events | MEDIUM | No native capture | Tauri test utilities |

### 2.3 Critical Testability Risks

| Risk ID | Description | Impact | Mitigation |
|---------|-------------|--------|------------|
| TR-001 | 26 agents increase complexity | HIGH | Test core 4 first (Butler, Triage, Scheduler, Communicator) |
| TR-002 | Real-time streaming flakiness | MEDIUM | Network-first pattern, deterministic waits |
| TR-003 | OAuth token expiry in tests | MEDIUM | Mock Composio auth layer entirely |
| TR-004 | json-render 27 components | MEDIUM | Snapshot testing + component isolation |
| TR-005 | Dual database coordination | MEDIUM | Fixture factories for both SQLite + PostgreSQL |

---

## 3. Test Levels Strategy by Epic

### Epic 1: Foundation & First Chat

**Stories:** 1.1-1.11 | **FRs:** FR-CH001 through FR-CH006 | **Risk Level:** MEDIUM

| Test Level | Coverage | Rationale |
|------------|----------|-----------|
| **Unit** | 40% | Tauri config, message schema, keyboard handlers |
| **Integration** | 35% | SQLite persistence, Agent Server health, IPC round-trip |
| **E2E** | 25% | Launch time (<3s), streaming latency (<500ms), visual layout |

**Critical Paths:**
- App launch → WebView render → Agent Server health check
- Message send → Claude API → SSE stream → UI render
- Cmd+K shortcut → Command palette open

**NFRs Under Test:**
- NFR-P001: <500ms latency to first token (E2E + performance profiling)
- NFR-P003: App launch <3 seconds (E2E timing assertion)

---

### Epic 2: Agent & Automation Infrastructure

**Stories:** 2.1-2.10 | **FRs:** Agent infrastructure | **Risk Level:** HIGH

| Test Level | Coverage | Rationale |
|------------|----------|-----------|
| **Unit** | 50% | Prompt templates, canUseTool logic, schema validation |
| **Integration** | 40% | Agent delegation, sub-agent spawning, context handoff |
| **E2E** | 10% | Agent rail UI updates, tool permission dialogs |

**Critical Paths:**
- Butler → Intent classification → Delegate to specialist
- canUseTool → Read (auto) vs Write (confirm) vs Destructive (block)
- Prompt caching → Cache hit ratio validation

**High-Risk Agents (prioritize testing):**
1. Butler Agent (orchestration)
2. Triage Agent (structured outputs)
3. Scheduler Agent (extended thinking)
4. Communicator Agent (tone matching)

---

### Epic 3: Connect Your Tools

**Stories:** 3.1-3.5 | **FRs:** Tool infrastructure | **Risk Level:** HIGH

| Test Level | Coverage | Rationale |
|------------|----------|-----------|
| **Unit** | 30% | OAuth token validation, rate limit logic |
| **Integration** | 50% | Composio MCP connection, tool execution |
| **E2E** | 20% | Connection status UI, OAuth flow (mocked) |

**Critical Paths:**
- OAuth flow → Token storage → Refresh on expiry
- Tool execution → Rate limiter → Graceful degradation
- Connection status → Health check polling

**Mock Strategy:**
- **NEVER hit real OAuth in tests** - mock Composio auth layer
- Use recorded API responses for tool execution tests
- Rate limiter tested with controlled time manipulation

---

### Epic 4: Unified Inbox Experience

**Stories:** 4.1-4.7 | **FRs:** FR-I001 through FR-I007 | **Risk Level:** HIGH

| Test Level | Coverage | Rationale |
|------------|----------|-----------|
| **Unit** | 30% | Priority scoring algorithm, action extraction |
| **Integration** | 40% | Gmail sync, database persistence, triage results |
| **E2E** | 30% | Inbox rendering, bulk actions, snooze/undo |

**Critical Paths:**
- Gmail sync → Priority scoring (0.0-1.0) → Inbox display
- Email → Action extraction → Task creation (with confirmation)
- Bulk select → Process → Undo (5-second window)

**NFRs Under Test:**
- NFR-P004: Bulk actions <5 seconds for 10+ items
- NFR-A001: Action extraction 80%+ accuracy
- NFR-A003: Triage accuracy 80% filing suggestions accepted

**Accuracy Testing Approach:**
- Golden dataset of 100 emails with known correct triage
- Precision/recall metrics tracked per release

---

### Epic 5: Email Communication

**Stories:** 5.1-5.5 | **FRs:** FR-E001 through FR-E005, FR-I004 | **Risk Level:** MEDIUM

| Test Level | Coverage | Rationale |
|------------|----------|-----------|
| **Unit** | 30% | Template rendering, draft validation |
| **Integration** | 40% | Gmail send via Composio, TipTap → HTML conversion |
| **E2E** | 30% | Compose flow, draft review, template selection |

**Critical Paths:**
- Read email → HTML rendering (safe sanitization)
- Compose → AI draft → User edit → Send (never auto-send)
- Template selection → Variable interpolation → Preview

**NFRs Under Test:**
- NFR-P006: AI drafts generate <5 seconds

**Security Constraint:**
- XSS sanitization on all rendered email HTML
- Never auto-send without explicit user action (UX-012)

---

### Epic 6: Calendar Management

**Stories:** 6.1-6.5 | **FRs:** FR-C001 through FR-C005 | **Risk Level:** MEDIUM

| Test Level | Coverage | Rationale |
|------------|----------|-----------|
| **Unit** | 35% | Time slot calculation, conflict detection |
| **Integration** | 40% | Google Calendar sync, event creation |
| **E2E** | 25% | Day/week views, scheduling via chat, focus time |

**Critical Paths:**
- "Schedule meeting with John" → Parse → Find availability → Suggest times
- Conflict detection → Alternative proposals → User selection
- Focus time request → Auto-block slots

**NFRs Under Test:**
- NFR-P005: Availability check <3 seconds

**Extended Thinking Test:**
- Complex scheduling triggers 1,024-15,000 token budget
- Validate thinking budget scales with complexity

---

### Epic 7: Contact & Relationship Management

**Stories:** 7.1-7.5 | **FRs:** FR-R001 through FR-R006, FR-CM001 through FR-CM005 | **Risk Level:** MEDIUM

| Test Level | Coverage | Rationale |
|------------|----------|-----------|
| **Unit** | 40% | Embedding generation, search ranking |
| **Integration** | 35% | SQLite contact storage, organization linking |
| **E2E** | 25% | Semantic search ("designer from TechConf"), contact cards |

**Critical Paths:**
- Contact creation → Embedding generation → Vector storage
- Semantic query → BGE-M3 similarity search → Ranked results
- Email signature → Auto-enrichment → Contact update

**NFRs Under Test:**
- NFR-A004: Semantic search 80%+ precision in top 5

**Embedding Test Strategy:**
- Pre-computed test embeddings for deterministic search tests
- Cosine similarity threshold assertions

---

### Epic 8: Projects & Tasks (PARA)

**Stories:** 8.1-8.6 | **FRs:** FR-P001 through FR-P006, FR-TM001 through FR-TM006 | **Risk Level:** MEDIUM

| Test Level | Coverage | Rationale |
|------------|----------|-----------|
| **Unit** | 40% | Progress calculation, status workflow |
| **Integration** | 35% | Task-project linking, stakeholder assignment |
| **E2E** | 25% | Project views, task boards, email-to-task flow |

**Critical Paths:**
- Create project → Add tasks → Track progress bar
- Email → Extract action → Suggest project → User confirm → Task created
- Archive project → Searchable in archive

**Task Status Workflow:**
```
pending → in_progress → completed
                     → cancelled
```

---

### Epic 9: Areas & Archive (PARA)

**Stories:** 9.1-9.5 | **FRs:** FR-A001 through FR-A005, FR-AR001 through FR-AR003 | **Risk Level:** LOW

| Test Level | Coverage | Rationale |
|------------|----------|-----------|
| **Unit** | 45% | Hierarchy calculations, goal tracking |
| **Integration** | 35% | Area-project relationships, archive queries |
| **E2E** | 20% | Area views, archive search/restore |

**Critical Paths:**
- Area → Projects → Tasks hierarchy view
- Archive item → Store with reason → Searchable → Restore

---

### Epic 10: Memory & Recall System

**Stories:** 10.1-10.5 | **FRs:** FR-M001 through FR-M004, FR-R004, FR-R005 | **Risk Level:** HIGH

| Test Level | Coverage | Rationale |
|------------|----------|-----------|
| **Unit** | 30% | Embedding generation, similarity scoring |
| **Integration** | 45% | PostgreSQL pgvector queries, cross-session persistence |
| **E2E** | 25% | Memory viewer, preference correction, context injection |

**Critical Paths:**
- User action → Preference Learner → Store preference → Confidence scoring
- Agent decision → Memory injection → Context-aware response
- Memory viewer → See what Orion remembers about contact

**NFRs Under Test:**
- NFR-A005: Memory recall relevance 70% helpful ratings

**PostgreSQL Test Strategy:**
- Docker container with pgvector for integration tests
- Test schema isolation (not shared with other tests)

---

### Epic 11: Dynamic AI Canvas (json-render)

**Stories:** 11.1-11.6 | **FRs:** FR-UI001 through FR-UI005, FR-DE001 through FR-DE004 | **Risk Level:** HIGH

| Test Level | Coverage | Rationale |
|------------|----------|-----------|
| **Unit** | 35% | Component rendering, action handlers |
| **Component** | 35% | 27 json-render components isolation tests |
| **E2E** | 30% | Streaming UI, TipTap editor, action execution |

**Critical Paths:**
- AI response → JSON schema → json-render → UI display
- useUIStream → Progressive rendering → Final state
- Action trigger → Handler → Tool execution

**Component Test Strategy:**
- Snapshot tests for all 27 components
- Visual regression baseline per component
- Isolated props/events testing (Vercel Browser Agent component tests)

**NFRs Under Test:**
- NFR-P007: Editor handles 10,000+ word documents

---

### Epic 12: Onboarding & First Run

**Stories:** 12.1-12.5 | **FRs:** FR-A004 | **Risk Level:** MEDIUM

| Test Level | Coverage | Rationale |
|------------|----------|-----------|
| **Unit** | 30% | Wizard state machine, validation |
| **Integration** | 30% | API key validation, OAuth initiation |
| **E2E** | 40% | Full wizard flow, time-to-value measurement |

**Critical Paths:**
- Welcome → API Key → Connect Tools → Select Areas → Complete
- Time-to-value <2 minutes (NFR target)
- First triage scoped to last 7 days

**NFRs Under Test:**
- NFR-U003: <20% beta user abandonment after first week

---

### Epic 13: Billing & Monetization

**Stories:** 13.1-13.5 | **FRs:** Monetization requirements | **Risk Level:** MEDIUM

| Test Level | Coverage | Rationale |
|------------|----------|-----------|
| **Unit** | 40% | Usage calculation, tier thresholds |
| **Integration** | 40% | Stripe webhooks, Supabase Edge metering |
| **E2E** | 20% | Subscription flow, upgrade prompts |

**Critical Paths:**
- Usage tracking → Threshold approach → Upgrade prompt
- Stripe checkout → Webhook → Tier upgrade → Access granted
- Free tier (1,000 calls) → Pro tier (10,000 calls)

**Payment Test Strategy:**
- Stripe test mode for all integration tests
- Mock webhook payloads for edge cases

---

### Epic 14: Observability & Quality

**Stories:** 14.1-14.4 | **FRs:** Operational requirements | **Risk Level:** MEDIUM

| Test Level | Coverage | Rationale |
|------------|----------|-----------|
| **Unit** | 40% | Error classification, log formatting |
| **Integration** | 45% | Braintrust/Langfuse integration, graceful degradation |
| **E2E** | 15% | Error display, rate limit messaging |

**Critical Paths:**
- Error occurs → Langfuse trace → Structured log
- Rate limit hit → Graceful message → Retry option
- Crash detection → Auto-recovery → User notification

**NFRs Under Test:**
- NFR-R001: Crash rate <1% of sessions
- NFR-R002: 95%+ uptime for core features

---

## 4. NFR Testing Strategy

### 4.1 Performance Testing (k6)

| NFR ID | Target | Test Type | Tool |
|--------|--------|-----------|------|
| NFR-P001 | <500ms first token latency | Load test | k6 |
| NFR-P003 | <3s app launch | E2E timing | Vercel Browser Agent |
| NFR-P004 | <5s bulk actions (10+ items) | Load test | k6 |
| NFR-P005 | <3s availability check | API test | k6 |
| NFR-P006 | <5s AI draft generation | API test | k6 |
| NFR-P007 | Handle 10k+ word documents | Stress test | k6 |

**k6 Configuration:**
```javascript
export const options = {
  stages: [
    { duration: '1m', target: 20 },   // Ramp up
    { duration: '3m', target: 20 },   // Sustained load
    { duration: '1m', target: 50 },   // Spike
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.01'],
  },
};
```

### 4.2 Security Testing (Vercel Browser Agent + Tools)

| NFR ID | Target | Test Type | Tool |
|--------|--------|-----------|------|
| NFR-S001 | Local-first data | Architecture audit | Manual review |
| NFR-S002 | OAuth token refresh | Integration test | Vercel Browser Agent |
| NFR-S003 | No unauthorized data sharing | E2E test | Vercel Browser Agent |

**Security E2E Checklist:**
- [ ] XSS sanitization on email HTML rendering
- [ ] CSRF protection on all mutating endpoints
- [ ] API key never logged or exposed in errors
- [ ] OAuth tokens encrypted at rest

### 4.3 Accuracy Testing (Custom Metrics)

| NFR ID | Target | Measurement | Dataset |
|--------|--------|-------------|---------|
| NFR-A001 | 80%+ action extraction | Precision/recall | 100 labeled emails |
| NFR-A002 | 70%+ filing suggestions | Acceptance rate | User telemetry |
| NFR-A003 | 80%+ triage accuracy | F1 score | Golden dataset |
| NFR-A004 | 80%+ search precision | Precision@5 | 50 semantic queries |
| NFR-A005 | 70%+ memory helpfulness | User rating | Feedback collection |

### 4.4 Reliability Testing (Vercel Browser Agent)

| NFR ID | Target | Test Type | Approach |
|--------|--------|-----------|----------|
| NFR-R001 | <1% crash rate | E2E stability | 1000 random interactions |
| NFR-R002 | 95%+ uptime | Integration | Health check monitoring |
| NFR-R003 | <5 critical bugs | QA process | Bug triage + fix SLA |

---

## 5. Test Infrastructure Requirements

### 5.1 Local Development

```bash
# Required services
- SQLite (in-memory for unit/integration)
- PostgreSQL (Docker container for memory tests)
- Mock Composio server (local HTTP server)

# Test commands
pnpm test:unit          # Vitest
pnpm test:integration   # Vitest + test containers
pnpm test:e2e           # Vercel Browser Agent
pnpm test:performance   # k6
```

### 5.2 CI Pipeline

```yaml
# .github/workflows/test.yml
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test:unit --coverage
      - uses: codecov/codecov-action@v4

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg16
    steps:
      - run: pnpm test:integration

  e2e:
    runs-on: macos-latest  # Tauri requires macOS
    steps:
      - run: pnpm test:e2e

  performance:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test:performance
      # Gate: Fail if p95 > 500ms
```

### 5.3 Test Data Factories

```typescript
// tests/factories/index.ts
export const createUser = (overrides?: Partial<User>) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  ...overrides,
});

export const createEmail = (overrides?: Partial<Email>) => ({
  id: faker.string.uuid(),
  subject: faker.lorem.sentence(),
  body: faker.lorem.paragraphs(3),
  from: faker.internet.email(),
  date: faker.date.recent(),
  ...overrides,
});

export const createProject = (overrides?: Partial<Project>) => ({
  id: faker.string.uuid(),
  name: faker.company.buzzPhrase(),
  status: 'active',
  ...overrides,
});
```

---

## 6. Quality Gate Criteria

### 6.1 Pre-Implementation Gate (This Phase)

| Criterion | Status | Notes |
|-----------|--------|-------|
| Testability assessment complete | ✅ PASS | Section 2 |
| NFR thresholds defined | ✅ PASS | Section 4 |
| Test infrastructure planned | ✅ PASS | Section 5 |
| Critical risks identified | ✅ PASS | 5 risks flagged |

### 6.2 Story-Level Gate (Per Epic)

| Criterion | Threshold |
|-----------|-----------|
| Unit test coverage | ≥80% |
| Integration test coverage | ≥70% |
| E2E critical path coverage | 100% |
| No P0 bugs open | 0 |

### 6.3 Release Gate (Full System)

| Criterion | Threshold |
|-----------|-----------|
| All NFR tests passing | 100% |
| Accuracy metrics met | All ≥70% |
| Performance SLOs met | p95 targets |
| Security audit passed | No critical/high |

---

## 7. Testability Concerns & Recommendations

### 7.1 CONCERNS (Require Attention)

| ID | Concern | Epic | Recommendation |
|----|---------|------|----------------|
| C-001 | Claude API non-determinism | 2 | Mock structured outputs for tests |
| C-002 | Composio OAuth in tests | 3 | Build mock OAuth server |
| C-003 | SSE streaming flakiness | 1, 4 | Network-first interception pattern |
| C-004 | 26 agent complexity | 2 | Prioritize core 4, defer others |
| C-005 | json-render 27 components | 11 | Snapshot baseline before iteration |

### 7.2 Recommendations

1. **Start with Mock Layer**: Before implementing Composio integration, build the mock server. Tests should never hit real OAuth.

2. **Golden Dataset for Accuracy**: Create labeled dataset of 100 emails before Epic 4. Accuracy metrics require ground truth.

3. **Network-First Pattern**: All E2E tests should intercept network BEFORE actions. This prevents flakiness.

4. **Agent Test Isolation**: Each agent test should mock Claude responses with deterministic structured outputs.

5. **Component Snapshot Baseline**: Before iterating on json-render components, capture baseline snapshots for regression detection.

---

## 8. Next Steps

1. **Approve this design** → Proceed to implementation with test infrastructure
2. **Create test data fixtures** → Factories for all entity types
3. **Build mock Composio server** → OAuth and tool execution mocks
4. **Establish accuracy baselines** → Golden dataset for triage testing
5. **Configure CI pipeline** → Unit → Integration → E2E → Performance stages

---

**Document Status:** Ready for Review
**Gate Decision:** PASS with CONCERNS (see Section 7.1)

_Generated by TEA (Test Architect Agent) - 2026-01-15_
