#!/usr/bin/env bash
# Start Celery worker (run in a second terminal)
set -e
cd "$(dirname "$0")"

source .venv/bin/activate 2>/dev/null || source .venv/Scripts/activate

echo "Starting Celery worker..."
celery -A app.worker:celery_app worker --loglevel=info -P solo
