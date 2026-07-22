# CivicPulse API Reference Guide

All backend endpoints use the prefix `/api`.

---

## 1. Authentication & Sessions (`/api/auth`)
- `POST /api/auth/register`: Create user account.
- `POST /api/auth/token`: Login and acquire OAuth2 JWT access & refresh tokens.
- `POST /api/auth/refresh`: Rotate refresh token and get new access token.
- `POST /api/auth/logout`: Revoke active session.
- `GET /api/auth/me`: Get active user profile.

---

## 2. Issues & Reporting (`/api/issues`)
- `GET /api/issues`: List issues (supports Base64 cursor pagination).
- `POST /api/issues`: Submit new issue.
- `GET /api/issues/{id}`: Get detailed issue information.

---

## 3. Offline Sync & Chunked Media Upload (`/api/sync`)
- `POST /api/sync/session`: Initialize chunked media upload session.
- `POST /api/sync/chunks`: Upload binary media chunk.
- `POST /api/sync/finalize`: Reassemble uploaded chunks and store asset.
- `POST /api/sync/fast-path`: Ingest offline draft payload upon reconnection.

---

## 4. Government Workflow & Case Management (`/api/cases`)
- `GET /api/cases`: List government cases filtered by status/department.
- `POST /api/cases/{id}/assign`: Assign case to department and officer.
- `POST /api/cases/{id}/acknowledge`: Acknowledge assigned case.
- `POST /api/cases/{id}/accept`: Mark case as work in progress.
- `POST /api/cases/{id}/repair-complete`: Log officer repair completion with before/after photos.
- `POST /api/cases/{id}/request-verification`: Trigger citizen verification.
- `POST /api/cases/{id}/verify`: Record citizen verification vote.
- `POST /api/cases/{id}/resolve`: Resolve case.
- `GET /api/cases/{id}/timeline`: Retrieve immutable audit timeline.

---

## 5. Notifications & User Preferences
- `GET /api/notifications`: Retrieve user in-app notifications.
- `GET /api/notifications/unread-count`: Get unread count.
- `PATCH /api/notifications/{id}/read`: Mark notification read.
- `PATCH /api/notifications/read-all`: Mark all read.
- `DELETE /api/notifications/{id}`: Delete notification.
- `GET /api/preferences/notifications`: Get notification preferences.
- `PUT /api/preferences/notifications`: Update notification preferences.

---

## 6. Analytics & Observability
- `GET /api/analytics/platform`: Executive overview metrics.
- `GET /api/analytics/government`: Department and officer SLA performance.
- `GET /api/analytics/community`: Resident verification consensus telemetry.
- `GET /api/audit/search`: Search audit log transitions.
- `GET /api/audit/export`: Export audit log as CSV or JSON (`?format=csv`).
- `GET /health`, `GET /ready`, `GET /live`, `GET /metrics`: Observability endpoints.
