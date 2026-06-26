# CivicPulse Loops

## Default Coding Loop

Read relevant docs.

Implement requested task.

Verify:

- acceptance criteria
- architecture compliance
- no hallucinated fields/routes

If issue found:
fix once.

Stop.

---

## Bug Fix Loop

Find root cause.

Fix root cause.

Verify fix.

Check regressions.

Stop.

---

## Feature Loop

Build smallest working version.

Verify acceptance criteria.

Remove unnecessary complexity.

Stop.

---

## Judge Loop

Find:

- biggest demo risk
- biggest implementation risk
- feature to cut
- highest ROI next task

Stop.

# Deployment Loop

Goal: Deploy CivicPulse with all P0 flows working.

## Deploy

1. Read deployment docs.
2. Verify env vars.
3. Build locally.
4. Deploy Backend (Cloud Run).
5. Verify backend health.
6. Deploy Frontend (Vercel).
7. Verify frontend connects to backend.

Stop if any step fails.

---

## Verify

Run the complete production flow:

- Upload image
- GPS
- Gemini analysis
- Create issue
- Cluster matching
- Impact assessment
- Complaint draft
- RTI draft
- Community summary
- Approve complaint
- Email (or documented fallback)
- PDF download
- Tracker updates
- Report page loads

Verify:

- No frontend console errors
- No backend exceptions
- No broken assets/routes

---

## On Failure

- Find root cause.
- Fix root cause only.
- Redeploy affected service.
- Re-run full verification.

---

## Output

- Status
- Fixes
- Remaining risks
- Ready: YES / NO

Stop.