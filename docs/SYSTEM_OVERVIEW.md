# nivaran — System Architecture & Overview

nivaran is an AI-powered municipal intake, automated dispatch, offline-resilient reporting, and community verification platform.

---

## Key System Components

### 1. 5-Agent Neural Pipeline
- **Agent 1 (Vision & Classification)**: Gemini 2.5 Flash Vision model classifies civic hazards and assigns 1-5 severity scores.
- **Agent 2 (Geospatial Clustering)**: Groups nearby reports into actionable spatial-temporal clusters.
- **Agent 3 (Impact Assessment)**: Evaluates infrastructure risk and economic impact.
- **Agent 4 (Drafting Engine)**: Generates structured legal complaints for municipal authorities.
- **Agent 5 (Escalation Engine)**: Monitors SLA deadlines and escalates overdue cases.

### 2. Government Case Lifecycle (17-State FSM)
- **States**: `classified` -> `clustered` / `pending_review` -> `drafted` -> `approved` -> `escalated` -> `acknowledged` -> `assigned` -> `work_in_progress` -> `inspection` -> `repair_completed` -> `verification_requested` -> `verified` -> `resolved` -> `closed` (and `reopened`).
- **Immutable Audit Log**: Every transition logs timestamp, actor ID, previous state, new state, and reason in `case_transitions`.

### 3. Offline-Resilient Sync & Media Upload
- **IndexedDB**: Offline draft snapshots stored locally on mobile devices.
- **Chunked Media Upload**: Cryptographic SHA-256 chunked uploads supporting 5MB chunks and session pause/resume.

### 4. Notification Center & Communication
- **Multi-Channel Dispatch**: In-App notifications, SendGrid Email, and Twilio WhatsApp API.
- **User Preferences**: Per-user channel toggles (`email`, `whatsapp`, `sms`, `push`), quiet hours, and language options.

### 5. Observability & Telemetry
- **Probes**: `/health`, `/ready`, `/live`.
- **Metrics**: Prometheus request counts, latency, and error rate tracking via `/metrics`.
- **Cursor Pagination**: Opaque Base64 cursors (`{timestamp}|{id}`).
