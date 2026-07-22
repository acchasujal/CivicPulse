# Timeline & Case API Reference

## Base Path
`/api/cases`

## Endpoints

### 1. List Cases
- **`GET /api/cases?status_filter=work_in_progress&overdue_only=false`**

### 2. Get Case Details
- **`GET /api/cases/{id}`**

### 3. Assign Case
- **`POST /api/cases/{id}/assign`**
  ```json
  {
    "department_id": "DEP-ROADS",
    "assigned_officer_id": "USR-OFFICER01",
    "notes": "Assigned to K-East Ward road repair team"
  }
  ```

### 4. Acknowledge Case
- **`POST /api/cases/{id}/acknowledge`**

### 5. Accept Case (Work In Progress)
- **`POST /api/cases/{id}/accept`**

### 6. Escalate Case
- **`POST /api/cases/{id}/escalate`**
  ```json
  { "reason": "SLA threshold exceeded" }
  ```

### 7. Complete Repair
- **`POST /api/cases/{id}/repair-complete`**
  ```json
  {
    "after_photo_url": "/static/uploads/after_photo.jpg",
    "officer_notes": "Patch filled with asphalt",
    "repair_cost": 35000.0,
    "contractor_name": "Municipal Works Corp"
  }
  ```

### 8. Request Community Verification
- **`POST /api/cases/{id}/request-verification`**

### 9. Vote on Verification
- **`POST /api/cases/{id}/verify`**
  ```json
  { "vote_passed": true }
  ```

### 10. Resolve Case
- **`POST /api/cases/{id}/resolve`**
  ```json
  {
    "resolution_summary": "Repair completed and community verified.",
    "resolution_type": "repaired"
  }
  ```

### 11. Close Case
- **`POST /api/cases/{id}/close`**

### 12. Reopen Case
- **`POST /api/cases/{id}/reopen`**

### 13. Get Audit Timeline
- **`GET /api/cases/{id}/timeline`**
