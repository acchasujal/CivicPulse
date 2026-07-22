# Offline Sync Architecture

## Overview
CivicPulse provides robust offline reporting capabilities allowing citizens to submit issue reports even with intermittent or zero internet connectivity.

## Synchronization Protocol
1. Client stores draft issue reports locally in IndexedDB / LocalStorage.
2. When connectivity is restored, the client issues a `POST /api/sync` request containing queued draft payloads and an `Idempotency-Key` header.
3. The server processes drafts, detects duplicates based on spatial proximity (within 50 meters) and photo hash match.
4. If a duplicate is detected, a `SyncConflict` record is created and the report is merged into the existing issue cluster.
5. The server returns itemized job statuses (`pending`, `processing`, `completed`, `conflict`, `failed`).
