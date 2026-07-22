# CivicPulse Deployment & Environment Guide

This guide explains how to configure environment variables (`.env`) and deploy CivicPulse locally, using Docker Compose, or on Google Cloud Run.

---

## 1. Environment Variables (`.env`)

Create a `.env` file inside the `backend/` directory with the following variables:

```env
# Application Settings
ENVIRONMENT=production
APP_BASE_URL=http://localhost:8000
FRONTEND_ORIGIN=http://localhost:5173

# Database & Cache Configuration
# Local SQLite (default):
DATABASE_URL=sqlite:///civicpulse.db
# PostgreSQL (production alternative):
# DATABASE_URL=postgresql://user:password@localhost:5432/civicpulse_db

REDIS_URL=redis://localhost:6379/0
RATE_LIMIT_PER_MINUTE=120

# Auth & JWT Configuration
JWT_SECRET_KEY=civicpulse_super_secret_jwt_key_2026_change_in_production!
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Gemini Vision AI API Key
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Email Gateway (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@civicpulse.org

# WhatsApp Integration (Twilio)
WHATSAPP_ENABLED=false
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

---

## 2. Local Development Setup

### Backend (FastAPI)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows (or source .venv/bin/activate on Linux/Mac)
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health Probe: `http://localhost:8000/health`

### Frontend (React / Vite)
```bash
cd frontend
npm install
npm run dev
```
- Frontend UI: `http://localhost:5173`

---

## 3. Deployment via Docker Compose (Recommended)

Run backend + Redis in containers:

```bash
cd backend
docker-compose up -d --build
```

- Backend Container: `http://localhost:8000`
- Redis Container: `localhost:6379`

---

## 4. Cloud Deployment (Google Cloud Run)

Build and deploy the backend container to Cloud Run:

```bash
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/civicpulse-backend:latest
gcloud run deploy civicpulse-backend \
  --image gcr.io/YOUR_PROJECT_ID/civicpulse-backend:latest \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars ENVIRONMENT=production,JWT_SECRET_KEY=your_production_secret,GEMINI_API_KEY=your_gemini_key
```
