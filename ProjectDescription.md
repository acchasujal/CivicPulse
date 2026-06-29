# CivicPulse: AI-Powered Civic Escalation & Deduplication Engine

## 1. Problem Statement
Municipal grievance systems suffer from two major bottlenecks: **evidence integrity** and **processing friction**. 
1. Citizens submit duplicate photos, certificates, selfies, or irrelevant images, flooding municipal databases and wasting human review hours.
2. Generating legally sound, evidence-backed complaints (or Right to Information applications) requires complex drafting, statutory knowledge, and administrative navigation.
Without a system to validate incoming visual evidence, detect spatial duplication, assess localized risk, and automate routing, municipal workflows remain congested and reactive.

---

## 2. Solution Overview
CivicPulse introduces a multi-agent AI pipeline built on Gemini 2.0 and Google Maps. It transforms citizen-reported street photos into structured, actionable municipal briefings.
1. **Stage-0 Validation**: A local PIL-based check (mime, blur, size, brightness, perceptual dhash caching) paired with a Gemini Vision gate blocks screenshots, documents, and selfies instantly, ensuring only real civic issues enter the system.
2. **Multi-Agent Engine**: Analyzes, verifies, groups reports geographically, drafts official complaints, compiles Right to Information (RTI) questions, and escalates cases to the proper authorities.
3. **Civic Intelligence**: A real-time operations dashboard highlighting ward metrics, deduplication savings, and AI pattern discoveries (e.g. rising infrastructure failures).

---

## 3. Key Features
- **Deterministic Stage-0 Gate**: Blocks invalid images before database insertion, protecting API budgets and system state.
- **Explainable Trust Model**: Translates visual verification, GPS validation, and duplicate scans into a readable 100-point trust scorecard.
- **Geospatial Deduplication (Agent 2)**: Merges incoming reports into active clusters based on Haversine distance and visual similarity, minimizing duplicate processing.
- **Government Document Templates**: Structured backend builders generate official municipal complaints and Section 6(1) RTI applications automatically.
- **Active Operations Map**: Auto-fitting cluster map color-coded by issue type and sized by localized risk.

---

## 4. Technologies Used
- **Frontend**: React (TypeScript), Tailwind CSS, Lucide icons, Framer Motion.
- **Backend**: FastAPI, SQLModel (SQLite), Pydantic v2.
- **Image Processing**: Pillow (PIL) for brightness, contrast, FIND_EDGES blur metrics, and difference hashing (dhash).
- **Testing**: Pytest with automated global dependency injection mocking.

---

## 5. Google Technologies
- **Gemini 2.0 (via Google GenAI SDK)**: Powers the vision-based Stage 0 validation, intake classification, impact assessment, and structured draft generation.
- **Google Maps JavaScript API**: Powers the interactive operations dashboard, geospatial markers, and bounds fitting.
- **Google Cloud Run**: Serverless containerized deployment with scale-to-zero capabilities.
- **Google Secret Manager**: Secure storage for Gemini API keys and database credentials.
- **Google Cloud Build**: Automated CI/CD deployment pipelines.
