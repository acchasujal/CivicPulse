# Resumable Media Upload Infrastructure

## Overview
CivicPulse supports chunked and resumable media uploads for large images and documents up to 25MB.

## Upload Flow
1. **Initiate Session**: `POST /api/uploads` specifying filename, file size, mime type, and expected chunk count. Returns `session_id`.
2. **Upload Chunks**: `PATCH /api/uploads/{session_id}?chunk_index={i}` uploading binary file chunks.
3. **Complete Upload**: `POST /api/uploads/{session_id}/complete` assembles uploaded chunk files, performs SHA-256 checksum verification, and saves the final file to `/static/uploads/`.
4. **Cancel Session**: `DELETE /api/uploads/{session_id}` purges temp chunk files.
