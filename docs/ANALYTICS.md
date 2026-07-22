# Analytics & Telemetry Architecture

## Overview
CivicPulse provides executive, municipal government, community engagement, and notification telemetry endpoints.

## Telemetry Metrics
- **Platform Analytics** (`GET /api/analytics/platform`): Total issues, resolution rate %, average SLA completion, active clusters, verification accuracy %.
- **Government Analytics** (`GET /api/analytics/government`): Total case assignments, escalation count, active officers, officer productivity metrics.
- **Community Analytics** (`GET /api/analytics/community`): Registered citizens, verification votes cast, community consensus rate %.
- **Notification Analytics** (`GET /api/analytics/notifications`): Multi-channel throughput (In-App, Email, WhatsApp) and delivery success rate %.
