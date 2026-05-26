#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Starting Lighthouse Attention Lab..."
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"

(cd "$ROOT_DIR/backend" && uvicorn app.main:app --reload --port 8000) &
BACKEND_PID=$!

(cd "$ROOT_DIR/frontend" && npm run dev -- --host 0.0.0.0 --port 5173) &
FRONTEND_PID=$!

trap 'kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true' EXIT
wait
