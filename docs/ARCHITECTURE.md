# ARCHITECTURE.md

## High-Level Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌────────────────────┐
│  React/Vite │ ───► │   FastAPI         │ ───► │  Gemini 2.0 Flash   │
│  Frontend   │ ◄─── │   Backend         │ ◄─── │  (Vision + Text)    │
└─────────────┘      └──────────────────┘      └────────────────────┘
                            │      │
                            ▼      ▼
                     ┌──────────┐ ┌─────────────────┐
                     │ SQLite   │ │ SMTP / PDF export │
                     │ (Evidence│ │ (real escalation)  │
                     │  store)  │ └─────────────────┘
                     └──────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Google Maps  │
                     │ JS API       │
                     └──────────────┘
```

## Component Diagram (text)

```
Frontend
├── IntakePage          → submit photo + location
├── TrackerPage         → public map + issue list (self-reported, labeled)
├── IssueDetailPage     → evidence timeline, impact summary, action drafts
└── ApprovalModal       → human review/approve before Agent 5 acts

Backend (FastAPI)
├── routers/
│   ├── issues.py        → create/list/get issue
│   ├── clusters.py      → cluster lookup
│   ├── impact.py        → impact intelligence retrieval
│   ├── actions.py       → draft retrieval/approval
│   └── escalations.py   → trigger Agent 5 send/export
├── agents/
│   ├── agent_1_intake.py
│   ├── agent_2_verification.py
│   ├── agent_3_impact.py
│   ├── agent_4_action_generator.py
│   └── agent_5_escalation.py
├── services/
│   ├── gemini_client.py
│   ├── email_client.py
│   └── pdf_export.py
└── models/  (Pydantic + SQLModel schemas)
```

## Frontend Architecture
- Vite + React, Tailwind for styling.
- State: local component state + a lightweight fetch-on-mount pattern per page (no global store needed at hackathon scale).
- Routing: `react-router-dom` — `/`, `/tracker`, `/issue/:id`.

## Backend Architecture
- FastAPI app, routers per resource, agents called from router handlers (synchronous chain for hackathon simplicity; can be made async/background later — see Decision Log).
- Each agent is a pure function: `(input_schema) -> output_schema`, calling `gemini_client` or `email_client`/`pdf_export` as needed. No agent silently mutates global state outside its declared DB write.

## AI Architecture
See `AI_SYSTEM_DESIGN.md` for full prompt/schema detail. Summary: each agent = one Gemini call with a structured-output (JSON schema) response, except Agent 5 which performs a non-AI action (send/export) after Agent 4's draft is approved.

## Database Architecture
See `DATABASE_SCHEMA.md`. Five tables: `issues`, `clusters`, `impact_summaries`, `action_drafts`, `escalations`.

## Data Flow (Request Lifecycle)

```
1. POST /issues  (photo + lat/lng + optional note)
2. Agent 1 runs synchronously → writes `issues` row (status=classified)
3. Agent 2 runs → checks `clusters` table within 300m radius → writes/updates `clusters`, sets issue.cluster_id
4. Agent 3 runs (triggered when cluster.report_count incremented) → writes `impact_summaries` row
5. If cluster.report_count >= ESCALATION_THRESHOLD (config, default 3):
     Agent 4 runs → writes `action_drafts` rows (complaint, rti, community_summary) status=pending_review
6. User opens IssueDetailPage → reviews draft → clicks Approve
7. POST /escalations/{draft_id}/send → Agent 5 runs → sends email and/or generates PDF → writes `escalations` row with real provider response/status
8. TrackerPage and IssueDetailPage reflect updated status
```

## Event Flow Diagram

```
PhotoSubmitted ──► IssueClassified ──► ClusterAssigned ──► ThresholdCrossed? 
                                                              │ yes
                                                              ▼
                                                      DraftsGenerated ──► UserApproved ──► EscalationSent
```

## Error Handling Strategy
- All agent calls wrapped in try/except; Gemini call failures return HTTP 502 with `{"error": "ai_unavailable", "retryable": true}` — frontend shows retry button, never silently fabricates a fallback result.
- Validation errors → HTTP 422 with field-level detail (FastAPI default + Pydantic).
- Escalation send failures (SMTP down, etc.) are logged to `escalations` table with `status=failed` and surfaced to the user — never silently marked as sent.

## State Management Strategy
- Backend is the source of truth; frontend re-fetches issue state after each action rather than maintaining optimistic local state, to avoid showing an unsent escalation as sent.

## Deployment Architecture
- Backend: FastAPI on Render/Railway (or Google AI Studio's deployment path if backend logic is migrated there per submission requirement — see `DECISION_LOG.md`).
- Frontend: Vercel.
- Database: SQLite file persisted on the backend host (hackathon scope; not multi-instance safe — acceptable tradeoff, documented in Decision Log).
