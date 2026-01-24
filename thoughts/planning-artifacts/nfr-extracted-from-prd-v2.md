# Non-Functional Requirements (NFRs) - Orion Butler Harness

**Extracted from:** PRD v2 Draft
**Date:** 2026-01-20
**Status:** Draft - Extracted and Formalized

---

## Overview

This document formalizes the Non-Functional Requirements (NFRs) for the Orion Butler Harness. These requirements are extracted from quality attributes, performance targets, and constraints specified throughout the PRD v2 Draft.

**NFR Format:** Following BMAD standards, each NFR is structured as:

> "The system shall [metric] [condition] [measurement method]"

All NFRs include specific, measurable criteria.

---

## NFR-1: Performance Requirements

Performance requirements define latency, throughput, and resource utilization targets.

| ID                | Requirement                                                                                                              | Measurement Method                       | Target            | Source                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- | ----------------- | ------------------------- |
| **NFR-1.1** | The system shall deliver the first token from Claude Agent SDK API within specified latency for 95th percentile requests | Response timing from send to first token | p95 < 500ms       | §7.7 Performance Targets |
| **NFR-1.2** | The system shall launch from cold start to interactive UI within specified time                                          | Time from app launch to user can type    | < 3 seconds       | §7.7 Performance Targets |
| **NFR-1.3** | The system shall complete Composio SDK tool calls within specified latency                                               | Tool invocation to result received       | < 2 seconds       | §7.7 Performance Targets |
| **NFR-1.4** | The system shall restore session context within specified time                                                           | Session load from disk to ready          | < 1 second        | §7.7, §9.5              |
| **NFR-1.5** | The system shall load each skill during startup within specified time                                                    | Individual skill initialization time     | < 100ms per skill | §9.5 Technical Health    |
| **NFR-1.6** | The system shall execute each hook within specified latency                                                              | Hook execution time                      | < 50ms per hook   | §9.5 Technical Health    |
| **NFR-1.7** | The system shall maintain typical memory usage below threshold during normal operation                                   | Process memory consumption               | < 500MB typical   | §7.7, §9.5              |

**Measurement Infrastructure:**

- Response timing via SDK instrumentation
- Performance logging at app, session, tool, and hook levels
- Alert thresholds defined in §9.5

---

## NFR-2: Reliability Requirements

Reliability requirements define uptime, error handling, and fault tolerance.

| ID                 | Requirement                                                                                   | Measurement Method                       | Target                                     | Source                    |
| ------------------ | --------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------ | ------------------------- |
| **NFR-2.1**  | The system shall maintain MCP server connection availability as measured by uptime monitoring | Connection status polling                | 99% uptime                                 | §9.5 Technical Health    |
| **NFR-2.2**  | The system shall maintain system-wide error rate below threshold                              | Failed interactions / total interactions | < 1% error rate                            | §9.5 Technical Health    |
| **NFR-2.3**  | The system shall successfully resume sessions from persistent storage                         | Session restore success count            | 99% success rate                           | §9.2 Week 1, §T4        |
| **NFR-2.4**  | The system shall load all registered skills without error during startup                      | Skill load success count                 | 100% load success                          | §9.2 Week 1              |
| **NFR-2.5**  | The system shall gracefully degrade when MCP servers are unavailable                          | UI messaging and queuing                 | Show "unavailable" status, queue retry with 30s/60s/120s intervals | §T2 Composio Reliability |
| **NFR-2.6**  | The system shall implement backoff and retry for rate-limited external API calls              | Retry behavior on rate limit             | Exponential backoff (1s, 2s, 4s, 8s max), cache results for 5min | §T2 Composio Reliability |
| **NFR-2.7**  | The system shall isolate corrupt session data to prevent cascade failures                     | Session isolation                        | Corrupt session does not affect index      | §T4 Session Persistence  |
| **NFR-2.8**  | The system shall auto-save conversation state after each message                              | Save trigger frequency                   | Every message auto-saved                   | §T4 Session Persistence  |
| **NFR-2.9**  | The system shall implement atomic write guarantees for session persistence                    | Atomic write operations                  | No partial writes, crash recovery within 1s | §T4 Session Persistence  |
| **NFR-2.10** | The system shall fail open for read-operation hooks and fail closed for write-operation hooks | Hook failure behavior                    | Read hooks skippable, write hooks required | §T5 Hook Execution       |

**Monitoring:**

- Uptime monitoring for MCP connections
- Error rate dashboards with 5% alert threshold (§9.5, §10.9)
- Session restore success logging

---

## NFR-3: Scalability Requirements

Scalability requirements define capacity for sessions, data, and concurrent operations.

| ID                | Requirement                                                                       | Measurement Method        | Target                                            | Source                   |
| ----------------- | --------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------- | ------------------------ |
| **NFR-3.1** | The system shall support multiple active sessions per user                        | Session count + latency   | ≥100 concurrent sessions with <5% degradation in p95 API latency vs single session baseline | §4.4 Session Management |
| **NFR-3.2** | The system shall implement token budgets for user quota management                | Token tracking per user   | Configurable daily limits (e.g., 100K tokens/day) | §B1 API Cost Overruns   |
| **NFR-3.3** | The system shall track and limit subagent token usage against user quota          | Subagent token accounting | Count subagent tokens in user total               | §B1 API Cost Overruns   |
| **NFR-3.4** | The system shall implement extended thinking token caps                           | Extended thinking budget  | Cap at 10K tokens                                 | §B1 API Cost Overruns   |
| **NFR-3.5** | The system shall monitor disk space and warn users at threshold                   | Disk usage monitoring     | Warn at 90% disk full                             | §T4 Session Persistence |
| **NFR-3.6** | The system shall implement session context compaction when size exceeds threshold | Context size + entity retention | Summaries at 80% of context limit preserving ≥80% of Project/Area/Resource entities as verified by structure validation | §T4 Session Persistence |

**Implementation Notes:**

- §B1 provides implementation example for `UserUsage` interface
- Token budgets enforced before API calls
- Warning at 80% of session token budget

---

## NFR-4: Security & Privacy Requirements

Security requirements cover authentication, authorization, data protection, and audit logging.

| ID                 | Requirement                                                                     | Measurement Method                    | Target                                  | Source                      |
| ------------------ | ------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------- | --------------------------- |
| **NFR-4.1**  | The system shall store all API keys in macOS Keychain                           | Storage mechanism validation          | 100% of keys in Keychain, 0 in files/DB | §7.6, §S1, §S3           |
| **NFR-4.2**  | The system shall never transmit API keys in logs or error messages              | Log content audit                     | 0 API keys in logs/errors               | §S1, §T2                  |
| **NFR-4.3**  | The system shall transmit API keys only over HTTPS                              | Network protocol validation           | 100% HTTPS                              | §S3 BYOK Security          |
| **NFR-4.4**  | The system shall validate API keys before saving                                | Key validation on save                | Test key before persisting              | §S3 BYOK Security          |
| **NFR-4.5**  | The system shall block access to sensitive files via PreToolUse hook            | File access blocking                  | Sensitive file patterns blocked         | §7.6, §3.2                |
| **NFR-4.6**  | The system shall log all external tool calls to audit trail                     | Audit log completeness                | 100% of tool calls logged               | §7.6, §5.4.3              |
| **NFR-4.7**  | The system shall sanitize tool call input parameters in audit logs              | PII redaction in logs                 | Sensitive data redacted                 | §5.4.3 Audit Logger        |
| **NFR-4.8**  | The system shall store audit logs in structured format                          | Log format                            | JSONL with timestamp, session_id        | §5.4.3 Audit Logger        |
| **NFR-4.9**  | The system shall encrypt OAuth tokens in storage                                | Token encryption                      | Keychain encryption for OAuth tokens    | §S4 OAuth Token Security   |
| **NFR-4.10** | The system shall request minimum OAuth scopes for external integrations         | OAuth scope restriction               | Minimal scopes only                     | §S4 OAuth Token Security   |
| **NFR-4.11** | The system shall implement user-scoped database queries to prevent data leakage | Query isolation (multi-tenant future) | All queries filtered by user_id         | §S2 Multi-tenant Isolation |
| **NFR-4.12** | The system shall implement rate limiting for new account signups                | Abuse prevention                      | Rate limit new accounts                 | §B2 Abuse Prevention       |
| **NFR-4.13** | The system shall monitor for anomalous API usage patterns                       | Anomaly detection                     | Alert on >10x normal usage              | §B2 Abuse Prevention       |

**Architecture Notes:**

- Local-first architecture (§7.6) - user controls data location
- Audit trail stored at `~/Orion/resources/.audit/action_log.jsonl`
- Client → Backend (auth + rate limit) → Anthropic API (§S1)

---

## NFR-5: Usability & Accessibility Requirements

Usability requirements cover user experience, accessibility, and interface responsiveness.

| ID                | Requirement                                                                 | Measurement Method             | Target                                     | Source                    |
| ----------------- | --------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------ | ------------------------- |
| **NFR-5.1** | The system shall support keyboard navigation for all primary actions        | Keyboard accessibility testing | 100% of actions keyboard-accessible        | §8.11 Keyboard Shortcuts |
| **NFR-5.2** | The system shall support screen reader compatibility                        | Screen reader testing          | Compatible with macOS VoiceOver            | §8.12 Accessibility      |
| **NFR-5.3** | The system shall maintain minimum color contrast ratios for text            | WCAG compliance testing        | WCAG AA contrast ratios                    | §8.12 Accessibility      |
| **NFR-5.4** | The system shall support dynamic font scaling                               | Font size adjustment testing   | Respects system font size settings         | §8.12 Accessibility      |
| **NFR-5.5** | The system shall provide clear status messaging for MCP server availability | UI status indicators           | "Composio unavailable" shown on disconnect | §T2 Composio Reliability |
| **NFR-5.6** | The system shall display data location path in settings                     | Settings UI + keyboard testing | Path shown and accessible within 3 tab stops from settings entry point | §U2 PARA Discovery       |
| **NFR-5.7** | The system shall warn users at 80% of session token budget                  | Budget warning system          | Warning modal at 80% threshold             | §B1 API Cost Overruns    |
| **NFR-5.8** | The system shall display quota exceeded error with actionable messaging     | Error messaging clarity        | Clear upgrade or BYOK prompt               | §B1 API Cost Overruns    |

**User Experience Goals:**

- Conversational-first UI (§8 UX/UI Requirements)
- Permission approval flow with inline cards (§8.7)
- Graceful degradation messaging (§T2)

---

## NFR-6: Maintainability & Extensibility Requirements

Maintainability requirements cover code quality, extensibility, testing, and operational monitoring.

| ID                 | Requirement                                                          | Measurement Method          | Target                                      | Source                 |
| ------------------ | -------------------------------------------------------------------- | --------------------------- | ------------------------------------------- | ---------------------- |
| **NFR-6.1**  | The system shall abstract SDK calls behind wrapper interface         | Code architecture review    | All SDK calls via single abstraction layer | §T1 SDK Changes       |
| **NFR-6.2**  | The system shall use only documented, stable SDK features            | SDK feature audit           | 0 preview/undocumented features used        | §T1 SDK Changes       |
| **NFR-6.3**  | The system shall support hot-reload for new skills without restart   | Skill hot-reload testing    | New skill files loaded within 100ms of file detection without app restart | §3.3 UJ-7             |
| **NFR-6.4**  | The system shall validate all plugin manifests on installation       | Plugin validation           | 100% of plugins schema-validated            | §9.6 Extension Health |
| **NFR-6.5**  | The system shall validate all agent definitions against schema       | Agent definition validation | 100% of agents pass schema validation       | §9.6 Extension Health |
| **NFR-6.6**  | The system shall validate hook registration configuration            | Hook validation             | All hooks in hooks.json fire                | §9.6 Extension Health |
| **NFR-6.7**  | The system shall implement startup validation for all hooks          | Hook file validation        | Missing hook files logged at startup        | §T5 Hook Execution    |
| **NFR-6.8**  | The system shall timeout hook execution exceeding threshold          | Hook timeout enforcement    | 5s timeout per hook                         | §T5 Hook Execution    |
| **NFR-6.9**  | The system shall validate hook output schemas                        | Hook output validation      | Schema validation, defaults on failure      | §T5 Hook Execution    |
| **NFR-6.10** | The system shall support testing SDK upgrades in staging environment | Upgrade testing process     | Pin version, pass full test suite before production upgrade | §T1 SDK Changes       |
| **NFR-6.11** | The system shall implement Tauri's built-in updater mechanism        | Auto-update capability      | Built-in updater enabled                    | §T3 Tauri Maturity    |
| **NFR-6.12** | The system shall support plugin distribution via Git repositories    | Plugin install method       | Git-based plugin install succeeds for 99% of valid repositories within 30 seconds | §3.3 UJ-10            |
| **NFR-6.13** | The system shall log all errors with context for debugging           | Error logging completeness  | Error rate tracking, context included       | §9.5, §10.9          |

**Extensibility Patterns:**

- File-based skills (no compilation) - §3.3 UJ-7
- Declarative agent definitions - §3.3 UJ-8
- Git-based plugin distribution - §3.3 UJ-10
- All extension points documented in §4

---

## NFR-7: Operational & Monitoring Requirements

Operational requirements cover logging, monitoring, alerting, and observability.

| ID                 | Requirement                                                           | Measurement Method              | Target                                   | Source                 |
| ------------------ | --------------------------------------------------------------------- | ------------------------------- | ---------------------------------------- | ---------------------- |
| **NFR-7.1**  | The system shall track API latency at p95 percentile                  | Performance monitoring          | p95 < 500ms, alert > 1s                  | §9.5 Technical Health |
| **NFR-7.2**  | The system shall track session resume time                            | Session restore monitoring      | < 1s target, alert > 3s                  | §9.5 Technical Health |
| **NFR-7.3**  | The system shall track skill load time per skill                      | Skill initialization monitoring | < 100ms target, alert > 500ms            | §9.5 Technical Health |
| **NFR-7.4**  | The system shall track hook execution time per hook                   | Hook performance monitoring     | < 50ms target, alert > 200ms             | §9.5 Technical Health |
| **NFR-7.5**  | The system shall track memory usage continuously                      | Memory monitoring               | < 500MB typical, alert > 1GB             | §9.5 Technical Health |
| **NFR-7.6**  | The system shall alert on API costs exceeding budget threshold        | Cost monitoring                 | Alert at 150% of budget                  | §10.9 Risk Monitoring |
| **NFR-7.7**  | The system shall alert on error rates exceeding threshold             | Error rate monitoring           | Alert at > 5%                            | §9.5, §10.9          |
| **NFR-7.8**  | The system shall log MCP server connection failures                   | Connection failure logging      | All disconnects logged and alerted       | §10.9 Risk Monitoring |
| **NFR-7.9**  | The system shall log unusual usage patterns for abuse detection       | Usage pattern monitoring        | >10x normal usage triggers review        | §B2 Abuse Prevention  |
| **NFR-7.10** | The system shall implement weekly risk review metrics collection      | Operational review cadence      | Weekly review of costs, errors, feedback | §10.9 Risk Monitoring |
| **NFR-7.11** | The system shall subscribe to SDK and dependency update notifications | Dependency monitoring           | Subscribed to Anthropic dev updates      | §T1 SDK Changes       |

**Alert Thresholds Summary:**

- API latency > 1s (p95)
- Session resume > 3s
- Skill load > 500ms
- Hook execution > 200ms
- Memory usage > 1GB
- Error rate > 5%
- API cost > 150% budget
- MCP disconnections (any)

**Weekly Monitoring (§10.9):**

- API costs vs. budget
- Error rates from logs
- User feedback themes
- SDK/dependency updates

---

## NFR-8: Compatibility & Portability Requirements

Compatibility requirements for OS versions and future platform support.

| ID                | Requirement                                                      | Measurement Method              | Target                     | Source              |
| ----------------- | ---------------------------------------------------------------- | ------------------------------- | -------------------------- | ------------------- |
| **NFR-8.1** | The system shall run on macOS versions 12, 13, 14, and 15        | OS compatibility testing        | Tested on all 4 versions   | §T3 Tauri Maturity |
| **NFR-8.2** | The system shall support future mobile platform deployment       | Architecture portability        | Tauri supports iOS/Android | §9.10.1 Stack      |
| **NFR-8.3** | The system shall minimize IPC boundary crossings for performance | IPC optimization                | Batch IPC calls to reduce crossings by >50% compared to naive single-call implementation | §T3 Tauri Maturity |
| **NFR-8.4** | The system shall use standard window management patterns         | Window management compatibility | Standard patterns only     | §T3 Tauri Maturity |

**Platform Strategy:**

- Tauri 2.0 for macOS (native, small bundle ~15MB)
- Architecture allows Electron pivot if needed (§T3)
- Future mobile support via Tauri's cross-platform capabilities

---

## NFR-9: Data Integrity & Backup Requirements

Data integrity requirements for session persistence and data protection.

| ID                | Requirement                                                                  | Measurement Method         | Target                               | Source                   |
| ----------------- | ---------------------------------------------------------------------------- | -------------------------- | ------------------------------------ | ------------------------ |
| **NFR-9.1** | The system shall use atomic write operations for session data                | Write operation validation | Atomic writes enforced               | §T4 Session Persistence |
| **NFR-9.2** | The system shall maintain session index integrity separate from session data | Index validation           | Corrupt session doesn't affect index | §T4 Session Persistence |
| **NFR-9.3** | The system shall store audit logs in append-only format                      | Audit log validation       | JSONL append-only                    | §B3 Usage Tracking      |
| **NFR-9.4** | The system shall reconcile usage tracking monthly                            | Usage reconciliation       | Monthly reconciliation process       | §B3 Usage Tracking      |
| **NFR-9.5** | The system shall document backup location for user data                      | Documentation requirement  | Clear backup docs provided           | §U2 PARA Discovery      |

**Data Storage:**

- Sessions: SQLite with WAL mode
- Audit logs: `~/Orion/resources/.audit/action_log.jsonl`
- PARA filesystem: `~/Orion/` (user-controlled, §7.6)
- Local-first: User controls cloud sync

---

## Success Criteria & Measurement

### Phase 1 (Week 1) - Harness Foundation Gates

From §9.2, the following NFRs must pass:

- ✓ NFR-1.2 (App Launch < 3s)
- ✓ NFR-2.1 (MCP 99% uptime)
- ✓ NFR-2.4 (100% skills load)
- ✓ NFR-2.3 (Session resume success)
- ✓ All NFR-4.x (Security requirements)

### Phase 2 (Month 1) - Orchestration Gates

From §9.3, the following NFRs are validated:

- ✓ NFR-1.4 (Session resume < 1s)
- ✓ NFR-6.3 (Hot-reload skills)
- ✓ NFR-2.8 (Auto-save every message)

### Phase 3 (Month 3) - Full Experience Gates

From §9.4, ongoing metrics from §9.5:

- ✓ All NFR-1.x (Performance targets)
- ✓ All NFR-2.x (Reliability > 99%)
- ✓ All NFR-7.x (Operational monitoring)

---

## Alert & Monitoring Dashboard

**Real-time Alerts:**

| Metric            | Threshold     | Action                 |
| ----------------- | ------------- | ---------------------- |
| API Latency (p95) | > 1s          | Investigate Claude API |
| Error Rate        | > 5%          | Review error logs      |
| Memory Usage      | > 1GB         | Check for leaks        |
| API Cost          | > 150% budget | Review usage patterns  |
| MCP Disconnect    | Any           | Check Composio status  |

**Weekly Review Metrics (§10.9):**

- API costs vs. budget
- Error rates trend
- User feedback analysis
- Dependency updates

---

## Compliance & Standards

| Standard                          | Applicable NFRs           | Status                            |
| --------------------------------- | ------------------------- | --------------------------------- |
| **WCAG AA**                 | NFR-5.2, NFR-5.3, NFR-5.4 | Accessibility requirements        |
| **BMAD NFR Format**         | All NFRs                  | Measurable criteria enforced      |
| **Anthropic SDK Stable v1** | NFR-6.1, NFR-6.2          | Production-ready SDK only         |
| **OAuth Best Practices**    | NFR-4.9, NFR-4.10         | Minimal scopes, encrypted storage |
| **macOS Security**          | NFR-4.1, NFR-4.2, NFR-4.3 | Keychain storage required         |

---

## Implementation Priority

### P0 (Must Have - Phase 1)

- NFR-1.1, 1.2 (Core performance)
- NFR-2.1, 2.3, 2.4 (Reliability basics)
- NFR-4.1, 4.2, 4.3, 4.6 (Core security)
- NFR-6.1, 6.2 (SDK abstraction)

### P1 (Should Have - Phase 2)

- NFR-1.4, 1.5, 1.6 (Advanced performance)
- NFR-2.5, 2.6, 2.8 (Advanced reliability)
- NFR-3.2, 3.3 (Token budgets)
- NFR-6.3, 6.4 (Extensibility)

### P2 (Nice to Have - Phase 3)

- NFR-5.1-5.4 (Full accessibility)
- NFR-7.1-7.11 (Comprehensive monitoring)
- NFR-8.2 (Mobile future-proofing)

---

## Document Change Log

| Date       | Version | Changes                              | Author      |
| ---------- | ------- | ------------------------------------ | ----------- |
| 2026-01-20 | 1.0     | Initial extraction from PRD v2 Draft | Scout Agent |

---

## References

- **PRD v2 Draft:** `/thoughts/planning-artifacts/prd-v2-draft.md`
- **Section Cross-References:**
  - §7.6: Security Requirements
  - §7.7: Performance Targets
  - §9.5: Technical Health Metrics
  - §10: Risks & Mitigations
  - §8.12: Accessibility

---

**Total NFRs:** 63 requirements across 9 categories
**Measurement Methods:** All NFRs include specific, measurable criteria
**BMAD Compliance:** ✓ Format validated
