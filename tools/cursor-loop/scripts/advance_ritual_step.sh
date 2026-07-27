#!/usr/bin/env bash
# Advance ritual_step one step — only supported way to move the step line.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS="${ROOT}/scripts"
PROJECT="${1:-.}"
shift || true
export PYTHONPATH="${SCRIPTS}:${PYTHONPATH:-}"
exec python3 "${SCRIPTS}/advance_ritual_step.py" "$PROJECT" "$@"
