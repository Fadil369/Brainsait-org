#!/bin/bash
# Start GitHub Models proxy in background
GITHUB_MODELS_TOKEN="${GITHUB_MODELS_TOKEN}" python3 /app/backend/data/github_models_proxy.py &
echo "GitHub Models Proxy started on port 8888"

# Start the original Open WebUI
exec bash /app/start.sh
