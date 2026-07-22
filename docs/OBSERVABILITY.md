# System Observability & Health Infrastructure

## Overview
CivicPulse provides structured logging, correlation tracking, in-memory Prometheus request/latency metrics, and Kubernetes/Cloud Run standard health probes.

## Health Probes & Metrics Endpoints
- **Liveness Probe**: `GET /live` or `GET /api/live` (Returns `200 OK` status alive).
- **Readiness Probe**: `GET /ready` (Returns `200 OK` status ready).
- **System Health**: `GET /health` (Verifies SQLModel database connectivity).
- **Prometheus Metrics**: `GET /metrics` or `GET /api/metrics` (Exposes total requests, error rates, average latency).
