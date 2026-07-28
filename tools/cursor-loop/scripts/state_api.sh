#!/usr/bin/env bash
# LLM-friendly state get/set/append API
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT="."
if [[ $# -gt 0 && "$1" != --* ]]; then
  PROJECT="$1"
  shift
fi
exec python3 "${SCRIPT_DIR}/state_api.py" --project "$PROJECT" "$@"
