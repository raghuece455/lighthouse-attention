#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Running backend tests..."
(cd "$ROOT_DIR/backend" && pytest)

echo "Running frontend production build..."
(cd "$ROOT_DIR/frontend" && npm run build)
