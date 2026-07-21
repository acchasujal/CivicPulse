# Deployment Guide

## Backend

Use the repository `Dockerfile` or the Render service definition. Configure `DATABASE_URL`, `FRONTEND_ORIGIN`, `APP_BASE_URL`, `GEMINI_API_KEY`, `SENDGRID_API_KEY`, and `SENDGRID_FROM_EMAIL` through the platform secret manager. Run migrations before starting the service and verify `/health`, `/ready`, and `/version`.

## Frontend

Build from `frontend` with `npm ci` and `npm run build`. Set `VITE_API_BASE_URL` to the HTTPS API origin including `/api`. Set `VITE_ENABLE_EVALUATION=true` only in an isolated internal environment with server-side institutional authentication; leave it unset for public builds.

## Preflight

Verify HTTPS, CORS, SPA fallback, PostgreSQL connectivity, upload storage, log shipping, secret redaction, and a real end-to-end report submission before directing public traffic.
