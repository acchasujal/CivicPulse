# Global Audit Search & Export API Reference

## Endpoints

### 1. Global Audit Search
- **`GET /api/audit/search?q=repaired&limit=50`**
- **Query Parameters**: `q` (text search), `issue_id`, `actor_id`, `action`, `limit`.

### 2. Export Audit Log (CSV / JSON)
- **`GET /api/audit/export?format=csv`**
- **`GET /api/audit/export?format=json`**
- Returns downloadable audit log files with headers `Content-Disposition: attachment; filename="civicpulse_audit_log.csv"`.
