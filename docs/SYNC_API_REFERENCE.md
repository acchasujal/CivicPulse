# Sync & Upload API Reference

## Endpoints

### 1. Initiate Resumable Upload Session
- **`POST /api/uploads`**
- **Headers**: `Idempotency-Key: <unique_key>` (optional)
- **Request Body**:
  ```json
  {
    "filename": "pothole.jpg",
    "file_size": 1048576,
    "mime_type": "image/jpeg",
    "total_chunks": 2
  }
  ```

### 2. Upload Chunk
- **`PATCH /api/uploads/{session_id}?chunk_index=0`**
- **Body**: `multipart/form-data` with `file` chunk payload.

### 3. Complete Upload Session
- **`POST /api/uploads/{session_id}/complete`**

### 4. Cancel Upload Session
- **`DELETE /api/uploads/{session_id}`**

### 5. Batch Offline Queue Sync
- **`POST /api/sync`**
- **Headers**: `Idempotency-Key: <unique_key>`
- **Request Body**:
  ```json
  {
    "drafts": [
      {
        "id": "DRAFT-001",
        "latitude": 19.1196,
        "longitude": 72.8791,
        "user_note": "Pothole report"
      }
    ]
  }
  ```

### 6. List Sync Jobs
- **`GET /api/sync/jobs`**

### 7. Get Sync Job Details
- **`GET /api/sync/jobs/{id}`**

### 8. Create Issue Draft
- **`POST /api/issues/draft`**
