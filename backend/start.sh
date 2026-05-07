#!/usr/bin/env bash
# Start API server (run in one terminal)
set -e
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "⚠️  No .env found. Copying .env.example..."
  cp .env.example .env
  echo "Edit .env and set OPENAI_API_KEY, then re-run."
  exit 1
fi

if [ ! -d .venv ]; then
  echo "Creating virtual environment..."
  python -m venv .venv
fi

source .venv/bin/activate 2>/dev/null || source .venv/Scripts/activate
pip install -r requirements.txt -q

echo "Starting FastAPI server on http://localhost:8000"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
