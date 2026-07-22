# Idempotency Engine Architecture

## Overview
All mutating API requests in CivicPulse (`POST /api/sync`, `POST /api/uploads`, `POST /api/issues/draft`) support `Idempotency-Key` headers to prevent duplicate executions during network retries.

## Protection Mechanism
1. The server computes a SHA-256 hash of `path + body_bytes`.
2. If `Idempotency-Key` is seen for the first time, processing proceeds and the HTTP response status & body are cached for 24 hours.
3. If an identical request with the same `Idempotency-Key` arrives, the server returns the cached response instantly with `X-Cache-Replay: true`.
4. If the same `Idempotency-Key` is submitted with a different request payload, the request is rejected with `422 Unprocessable Entity` (payload mismatch).
