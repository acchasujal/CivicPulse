# BACKEND_SPEC.md

## Services

| Service | Responsibility |
|---|---|
| `gemini_client.py` | Wraps Gemini API calls for Agents 1–4; enforces structured-output schema validation per `AI_SYSTEM_DESIGN.md`; handles retry-once-then-fail logic |
| `email_client.py` | SMTP (or SendGrid) wrapper for Agent 5 email sends; returns real provider response, never assumes success |
| `pdf_export.py` | Renders `action_drafts.content` to PDF (WeasyPrint/reportlab) |
| `geo_service.py` | Haversine distance calc for cluster proximity matching |

## Controllers (Routers)
See `API_CONTRACTS.md` for full request/response contracts. One router module per resource: `issues.py`, `clusters.py`, `impact.py` (mounted under `/clusters/{id}/impact`), `actions.py` (`action-drafts`), `escalations.py`.

## Repositories
Thin data-access layer per table (`issue_repo.py`, `cluster_repo.py`, etc.) wrapping SQLModel queries — keeps agent logic free of raw SQL, makes future migration off SQLite (see Decision Log) lower-risk.

## Middleware
- CORS: allow frontend origin only (configured via env var, not wildcard, even at hackathon scope — avoids an easy "this is insecure" judge comment).
- Request logging: method, path, status, duration — to stdout (captured by deployment platform logs).

## Validation
- Pydantic models for every request/response body (see `API_CONTRACTS.md`).
- File upload validated for type/size before being sent to Gemini (avoid wasting an API call on an invalid file).

## Logging
- Structured JSON logs for every agent call: `{agent: "agent_1", issue_id, latency_ms, success}`.
- Escalation attempts always logged with the real provider response string, even on failure — this is also your live demo's evidence that Agent 5 performed a real action.

## Caching
- None required at hackathon scale. If added later: cache `clusters` proximity queries (see Decision Log placeholder).

## Authentication
- None in hackathon scope — public read/write, rate-limited by IP (see below). Documented explicitly as a known limitation in `PROJECT_CONTEXT.md` → Known Tradeoffs, not hidden.

## Rate Limiting
- Simple in-memory IP-based limiter on `POST /issues` and `POST /escalations` (e.g. 10/min) to prevent demo-day abuse and accidental duplicate sends.

## Error Handling
- Centralized FastAPI exception handler maps internal errors to the response shapes defined in `API_CONTRACTS.md`. No endpoint returns a 200 with a silently degraded/fabricated result — failures are always surfaced as non-2xx with a real error code.

## Background Jobs
- None required for hackathon MVP — the pipeline runs synchronously within the request/response cycle for demo simplicity and predictability. If latency becomes an issue, move Agent 3/4 to a background task queue post-submission threshold check (documented as a Tier 3 stretch item only, not required for MVP).
