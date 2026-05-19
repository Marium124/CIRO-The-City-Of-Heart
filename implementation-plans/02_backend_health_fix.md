# Backend Health Check Fix

The mobile app was unable to verify the backend status because it was calling `/api/health`, while the backend only had the health check at the root `/health` endpoint.

## Changes Made

- **`backend/main.py`**: Added `@app.get("/api/health")` as an alias to the existing `/health` route.

This ensures that the mobile app, which uses `http://<IP>:8000/api` as its base URL, can successfully perform its health checks.
