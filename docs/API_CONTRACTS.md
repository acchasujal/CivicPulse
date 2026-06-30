# API_CONTRACTS.md

Base URL: `{VITE_API_BASE_URL}` · All responses `application/json` unless noted. No auth in hackathon scope (public read/write); see `DECISION_LOG.md` for the tradeoff.

---

## POST `/issues`
Submit a new issue report. Triggers Agent 1 and Agent 2 synchronously.

**Request** (`multipart/form-data`)
| Field | Type | Required |
|---|---|---|
| `photo` | file (jpg/png) | yes |
| `latitude` | float | yes |
| `longitude` | float | yes |
| `user_note` | string | no |

**Validation Rules**
- `photo`: max 8MB, must be jpg/png.
- `latitude`/`longitude`: must be valid coordinate ranges.

**Success Response — 201**
```json
{
  "id": "uuid",
  "issue_type": "road_damage",
  "severity": 4,
  "description": "Large pothole on...",
  "credibility_score": 0.87,
  "cluster_id": "uuid",
  "status": "clustered",
  "created_at": "2026-06-23T10:00:00Z"
}
```

**Failure Cases**
| Status | Condition | Body |
|---|---|---|
| 422 | invalid file type/coords | `{"error": "validation_error", "fields": {...}}` |
| 502 | Gemini call failed | `{"error": "ai_unavailable", "retryable": true}` |

---

## GET `/issues`
List issues (public tracker).

**Query params:** `cluster_id` (optional), `limit` (default 50)

**Success Response — 200**
```json
{ "issues": [ { "...": "issue object as above" } ] }
```

---

## GET `/issues/{id}`
Get a single issue with its cluster, impact summary, and drafts.

**Success Response — 200**
```json
{
  "issue": { "...": "..." },
  "cluster": { "id": "uuid", "area_label": "...", "report_count": 4 },
  "impact_summary": { "risk_level": "high", "affected_area_description": "...", "evidence_count": 4, "potential_consequences": "..." },
  "action_drafts": [ { "id": "uuid", "draft_type": "rti", "status": "pending_review", "content": "..." } ]
}
```

**Failure**
| Status | Condition |
|---|---|
| 404 | issue not found |

---

## GET `/clusters/{id}`
Get cluster detail + all member issues.

**Success Response — 200**
```json
{ "cluster": {"...": "..."}, "issues": [ {"...": "..."} ] }
```

---

## POST `/clusters/{id}/impact`
Manually (re)trigger Agent 3 for a cluster (used after report_count increments).

**Success Response — 200:** returns `impact_summaries` row.
**Failure — 404:** cluster not found.

---

## POST `/clusters/{id}/generate-drafts`
Trigger Agent 4. Requires `impact_summaries` to exist for the cluster.

**Success Response — 201**
```json
{ "drafts": [ {"id": "uuid", "draft_type": "complaint", "status": "pending_review"}, {"draft_type": "rti", "...": "..."}, {"draft_type": "community_summary", "...": "..."} ] }
```

**Failure**
| Status | Condition |
|---|---|
| 409 | no impact summary yet — generate that first |
| 502 | Gemini call failed |

---

## PATCH `/action-drafts/{id}`
Approve or reject a draft before escalation. Human-in-the-loop checkpoint — required before Agent 5 may act.

**Request**
```json
{ "status": "approved" }
```
Allowed values: `approved`, `rejected`.

**Success Response — 200:** updated draft object.
**Failure — 422:** invalid status value.

---

## POST `/escalations`
Trigger Agent 5. **Requires the referenced draft to have `status: approved`.** This is the one real external action in the system.

**Request**
```json
{ "draft_id": "uuid", "method": "email", "recipient": "ward.office@example.gov" }
```
`method=pdf_export` does not require `recipient`.

**Validation Rules**
- `draft_id` must reference a draft with `status=approved`. Returns 403 otherwise — Agent 5 must never act on an unapproved draft.
- `recipient` required and must be a valid email if `method=email`.

**Success Response — 201**
```json
{
  "id": "uuid",
  "draft_id": "uuid",
  "method": "email",
  "status": "sent",
  "provider_response": "250 OK",
  "sent_at": "2026-06-23T10:05:00Z"
}
```

**Success Response (with PDF Fallback) — 201**
If `method=email` fails but `AGENT5_PDF_FALLBACK=true` is set:
```json
{
  "id": "uuid",
  "draft_id": "uuid",
  "method": "pdf_export",
  "status": "exported",
  "provider_response": "Email failed: SendGrid API error. Fell back to PDF generation.",
  "pdf_download_url": "/api/static/downloads/xyz.pdf",
  "sent_at": "2026-06-23T10:05:00Z"
}
```

**Failure Cases**
| Status | Condition | Body |
|---|---|---|
| 403 | draft not approved | `{"error": "draft_not_approved"}` |
| 502 | SendGrid/export failed | `{"error": "escalation_failed", "provider_response": "..."}` — row still written with `status: failed`, never silently treated as sent |

---

## GET `/escalations/{id}`
Check the real status of a sent escalation.

**Success Response — 200:** escalation object as above.

---

## POST `/whatsapp/webhook`
Twilio WhatsApp webhook. Receives all incoming WhatsApp messages from the configured number.

> **Note:** This endpoint is gated by `WHATSAPP_ENABLED=true`. When disabled, returns `503`.

**Provider:** Twilio (sandbox for development). Architecture is provider-agnostic — only the adapter helpers in `whatsapp.py` are provider-specific.

**Request** (Twilio `application/x-www-form-urlencoded`)

| Field | Description |
|---|---|
| `From` | WhatsApp number of the sender (e.g. `whatsapp:+919876543210`) |
| `Body` | Text body of the message |
| `NumMedia` | Number of media attachments |
| `MediaUrl0` | URL of the first media attachment (if image) |
| `MediaContentType0` | MIME type of the media |
| `Latitude` / `Longitude` | Present when user shares their location |

**Response — 200** (always, Twilio requirement)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Response text to send to the user</Message>
</Response>
```

**Conversation steps:**
1. User sends `Hi` → welcome message + instructions
2. User sends photo → photo stored, prompt for location
3. User shares location → location stored, prompt for description
4. User sends description or `skip` → calls `issue_service.create_issue_from_bytes()` → returns Case ID + dashboard link

**Stage-0 rejection:** If Gemini rejects the photo, the bot explains why, shows accepted examples, and resets to step 1 to allow retry.

**Headers required:**
- `X-Twilio-Signature` — validated against `TWILIO_AUTH_TOKEN`. Requests without a valid signature return 403.
