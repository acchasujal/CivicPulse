# TASK_TRACKER.md

Build order is sequenced to minimize risk: deployment and the real-action proof point (Agent 5) are validated early, not left to the last day, per the project's own documented failure pattern (past hackathons: missing modules / mock data discovered late).

## Epic 1 — Core Intake Loop (Day 1–2)
| Task | Subtask | Priority | Effort | Acceptance Criteria |
|---|---|---|---|---|
| FastAPI skeleton + SQLite models | create tables per `DATABASE_SCHEMA.md` | P0 | 2h | tables created, app boots |
| Gemini client wrapper | `gemini_client.py` with structured-output call | P0 | 3h | one test call returns schema-conformant JSON for a real photo |
| Agent 1 implementation | classification + validation/retry logic | P0 | 3h | `POST /issues` returns Agent 1 output for a real photo |
| Agent 2 implementation | proximity + semantic dedup | P0 | 3h | second nearby report correctly clusters with first |
| Frontend IntakePage | photo upload + geolocation | P0 | 4h | can submit a real report end-to-end against local backend |
| **Day 1 milestone** | — | — | — | photo → Gemini Vision → structured JSON, verified manually |
| **Day 2 milestone** | — | — | — | Agent 1 + Agent 2 chained, issue visible on a basic map |

## Epic 2 — Evidence & Action Layer (Day 3–4)
| Task | Subtask | Priority | Effort | Acceptance Criteria |
|---|---|---|---|---|
| Agent 3 implementation | impact intelligence + output validator (reject fabricated-score patterns) | P0 | 3h | summary generated, validator gate tested with a deliberately bad output |
| TrackerPage + ImpactSummaryPanel | public view | P0 | 3h | shows affected_area/risk_level/evidence_count, no score field |
| Agent 4 implementation | 3 drafts incl. disclaimer gate | P0 | 4h | RTI draft always contains disclaimer string; rejecting test confirms gate works |
| DraftCard + approval endpoint | human-in-the-loop UI | P0 | 2h | can approve/reject a draft via UI |
| **Day 3 milestone** | — | — | — | Agent 3 working, validator gate proven |
| **Day 4 milestone** | — | — | — | full chain Agent 1→4 working end-to-end with an approved draft sitting ready |

## Epic 3 — Real Action & Deployment (Day 5–6)
| Task | Subtask | Priority | Effort | Acceptance Criteria |
|---|---|---|---|---|
| email_client.py (SMTP) | real send | P0 | 2h | a real test email actually arrives in an inbox |
| pdf_export.py | render draft to PDF | P1 | 2h | PDF downloads and opens correctly |
| Agent 5 implementation | enforce approved-only gate | P0 | 2h | `POST /escalations` on unapproved draft returns 403; on approved draft, sends and logs real provider response |
| Backend deployment | Render/Railway + Google AI Studio deployment path | P0 | 3h | publicly accessible link live |
| Frontend deployment | Vercel | P0 | 1h | points at deployed backend |
| **Day 5 milestone** | — | — | — | real email send proven live, deployment attempted |
| **Day 6 milestone** | — | — | — | deployment stable, full demo rehearsed twice |

## Epic 4 — Documentation & Stretch (Day 6–7)
| Task | Priority | Effort | Acceptance Criteria |
|---|---|---|---|
| Google Doc (problem/solution/tech) | P0 | 2h | started Day 1, updated incrementally — version history must show progressive edits |
| GitHub repo cleanup + README | P0 | 1h | repo public, README accurate |
| Stretch: voice input | P3 | — | only if Day 5 milestone hit early |
| Buffer / bug fixes / demo rehearsal | P0 | remaining time | submit by deadline with margin |

**Hard rule carried from `ARCHITECTURAL_TRUTHS.md` Truth 8:** if Epic 2's Day 4 milestone is not met, cut Agent 5's PDF path and voice/stretch items entirely — ship Epic 1+2 plus a working email-only Agent 5 rather than a broken 5-feature system.
