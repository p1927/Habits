#!/usr/bin/env bash
# Determine whether the current STATE.md diff warrants a git commit.
# Outputs COMMIT_GATE=commit or COMMIT_GATE=skip.
# Usage: check_commit_gate.sh [project] --state-file <path> [--loop-id <id>]
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT="."
if [[ $# -gt 0 && "$1" != --* ]]; then
  PROJECT="$1"
  shift
fi
exec python3 "${SCRIPT_DIR}/check_commit_gate.py" "$PROJECT" "$@"
