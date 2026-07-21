# Operations Runbook

## Health checks

Check `/health` for liveness, `/ready` for dependency readiness, and `/version` for deployed build identity. Inspect application logs for request failures, upload failures, dispatch failures, and database errors.

## Incident response

1. Preserve the incident timestamp, deployment version, request/case ID, and affected route.
2. Check database and upstream provider health before retrying writes.
3. Do not manually mark a case resolved to clear a queue.
4. If a client is offline, preserve its local draft and ask the user to review it online; automatic sync is not currently supported.
5. Rotate credentials through the secret manager if exposure is suspected.

## Recovery

Roll back the application artifact through the hosting platform, verify migrations are backward-compatible, then run the health and report-submission smoke checks before reopening traffic.
