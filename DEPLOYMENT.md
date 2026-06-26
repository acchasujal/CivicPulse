# CivicPulse — Google Cloud Run Production Deployment Guide

This guide details how to build and deploy the entire CivicPulse application (React frontend + FastAPI backend) as a single container on Google Cloud Run.

---

## 1. Prerequisites

1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install).
2. Authenticate and configure your active project:
   ```bash
   gcloud auth login
   gcloud config set project [YOUR_PROJECT_ID]
   ```
3. Enable the required GCP APIs:
   ```bash
   gcloud services enable run.googleapis.com \
                          artifactregistry.googleapis.com \
                          cloudbuild.googleapis.com
   ```

---

## 2. Environment Variables Checklist

Set these variables during the Cloud Run deployment process. **Do not hardcode secrets.**

| Variable Name | Purpose | Required / Optional |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API Authentication Key | **Required** |
| `SENDGRID_API_KEY` | SendGrid Mail Dispatch API Key | **Required** |
| `SENDGRID_FROM_EMAIL` | SendGrid Verified Sender Email Address | **Required** |
| `APP_BASE_URL` | Deployed URL (configured post-deployment) | **Required** |
| `LOG_LEVEL` | Logging level detail (e.g. `info`, `debug`) | Optional (Default: `info`) |

---

## 3. Step-by-Step Deployment Commands

### Step 3.1: Create Artifact Registry Repository
Create a repository in Artifact Registry to store the built container image:
```bash
gcloud artifacts repositories create civicpulse-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="CivicPulse Production Repository"
```

### Step 3.2: Build the Container Image
Run Cloud Build to compile React assets, package Python dependencies, and build the Docker image:
```bash
gcloud builds submit --tag us-central1-docker.pkg.dev/[YOUR_PROJECT_ID]/civicpulse-repo/civicpulse:latest
```

### Step 3.3: Deploy to Cloud Run
Deploy the container. We specify `max-instances=1` and `concurrency=1` to guarantee SQLite safety under the Free Tier:
```bash
gcloud run deploy civicpulse \
  --image us-central1-docker.pkg.dev/[YOUR_PROJECT_ID]/civicpulse-repo/civicpulse:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --cpu 1 \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 1 \
  --concurrency 1 \
  --timeout 300 \
  --set-env-vars="GEMINI_API_KEY=[YOUR_KEY],SENDGRID_API_KEY=[YOUR_KEY],SENDGRID_FROM_EMAIL=[YOUR_EMAIL],LOG_LEVEL=info"
```

### Step 3.4: Configure the Service URL (Post-Deployment)
Once deployed, retrieve the generated service URL:
```bash
gcloud run services describe civicpulse --region us-central1 --format="value(status.url)"
```
Update the service configuration to set `APP_BASE_URL` with your actual live URL:
```bash
gcloud run services update civicpulse \
  --region us-central1 \
  --update-env-vars="APP_BASE_URL=[YOUR_LIVE_SERVICE_URL]"
```

---

## 4. Production Smoke-Test Checklist

Verify the deployed application using the following checklist:

* [ ] **Frontend Loading**: Navigate to your HTTPS service URL; verify the Intake page loads with no Javascript errors.
* [ ] **Intake Submission**: Select a demo scenario, click "Submit", and verify the intake loader and pipeline updates.
* [ ] **Agent Pipeline**: Confirm that Agent 1 (intake classification), Agent 2 (clustering), and Agent 3 (impact) execute cleanly.
* [ ] **RTI & Complaint Generation**: Verify that drafts are compiled and formatted inside the official paper mockup viewer.
* [ ] **Escalation Email**: Click "Approve & Send" on a draft, dispatch it to an email address, and confirm delivery in your inbox.
* [ ] **PDF Export & Download**: Verify you can download the compiled PDF package from the Escalation Card.
* [ ] **SPA Router Refresh**: Navigate to `/tracker` or `/issue/[id]` and refresh the browser page. It must load correctly without 404s.

---

## 5. Troubleshooting & FAQ

### Ephemeral Storage Reset
Since SQLite is local inside the container, database state is ephemeral. If the container scales down to zero or restarts, the database will revert to its initial state.
- **For Hackathons**: `--max-instances=1` is sufficient to prevent split-brain issues.
- **For Production**: Migrate SQLite to a managed database like Cloud SQL (PostgreSQL) and update the `DATABASE_URL` environment variable.

### 502 Bad Gateway / AI Unavailable
- Verify your `GEMINI_API_KEY` is active and has sufficient quota.
- Check Cloud Run logs: `gcloud beta run services logs tail civicpulse --region us-central1`.

---

## 6. Rollback Instructions

To roll back to a previous working revision:
1. List all active revisions:
   ```bash
   gcloud run revisions list --service civicpulse --region us-central1
   ```
2. Route 100% of traffic back to the target stable revision:
   ```bash
   gcloud run services update-traffic civicpulse \
     --region us-central1 \
     --to-revisions [REVISION_NAME]=100
   ```
