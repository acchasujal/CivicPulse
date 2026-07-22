# Opaque Base64 Cursor Pagination Protocol

## Overview
CivicPulse endpoints support opaque Base64 cursor pagination to ensure deterministic ordering and prevent duplicate/skipped items during real-time database modifications.

## Cursor Format
- Cursors are encoded as Base64 strings representing `{timestamp}|{item_id}`.
- Query parameters: `cursor` (opaque token), `limit` (default 20, max 100).
- Response shape:
  ```json
  {
    "items": [...],
    "limit": 20,
    "has_next": true,
    "next_cursor": "MjAyNi0wNy0yMlQxMjowMDowMFp8aXNzLTEyMzQ1"
  }
  ```
