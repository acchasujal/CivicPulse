# CivicPulse Production Deployment Readme

This folder contains the files and configuration necessary to deploy the entire CivicPulse application to Google Cloud Run as a single service.

## Core Files

- [Dockerfile](file:///d:/Projects/CivicPulse/Dockerfile): Multi-stage container build file (React compilation -> python runner).
- [DEPLOYMENT.md](file:///d:/Projects/CivicPulse/DEPLOYMENT.md): Complete guide with required commands, variables, smoke tests, and rollback instructions.
- [.env.example](file:///d:/Projects/CivicPulse/.env.example): Production environment variables template.

## Quick Start Deployment

1. Make sure GCP CLI is configured and APIs are enabled.
2. Create your Artifact Registry:
   ```bash
   gcloud artifacts repositories create civicpulse-repo --repository-format=docker --location=us-central1
   ```
3. Build and submit:
   ```bash
   gcloud builds submit --tag us-central1-docker.pkg.dev/[YOUR_PROJECT_ID]/civicpulse-repo/civicpulse:latest
   ```
4. Deploy to Cloud Run:
   ```bash
   gcloud run deploy civicpulse \
     --image us-central1-docker.pkg.dev/[YOUR_PROJECT_ID]/civicpulse-repo/civicpulse:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --max-instances 1 \
     --concurrency 1 \
     --set-env-vars="GEMINI_API_KEY=[YOUR_KEY],SENDGRID_API_KEY=[YOUR_KEY],SENDGRID_FROM_EMAIL=[YOUR_EMAIL],LOG_LEVEL=info"
   ```
5. Once deployment is complete, fetch the URL and set `APP_BASE_URL`:
   ```bash
   gcloud run services update civicpulse \
     --region us-central1 \
     --update-env-vars="APP_BASE_URL=[DEPLOYED_URL]"
   ```

For detailed troubleshooting, rollback instructions, and a full smoke-testing checklist, please refer to the main [DEPLOYMENT.md](file:///d:/Projects/CivicPulse/DEPLOYMENT.md).
