# Release Checklist

- [ ] Backend migrations applied to the target PostgreSQL instance.
- [ ] Production API origin configured; no localhost fallback.
- [ ] CORS and HTTPS verified.
- [ ] Secrets configured in the platform manager; no `.env` files in artifacts.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` pass.
- [ ] Backend tests pass with `backend/requirements.txt` installed.
- [ ] `npm audit --audit-level=high` passes or has an approved exception.
- [ ] Auth and institutional authorization tested against the real backend.
- [ ] Public/private data access and upload abuse tests pass.
- [ ] Manual accessibility matrix completed.
- [ ] Low-bandwidth and offline draft preservation tested.
- [ ] Health, readiness, logs, alerts, and rollback tested.
- [ ] Repair verification, resolution, notification, analytics, and offline sync are not advertised unless their APIs are live.
