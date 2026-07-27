#!/usr/bin/env bash
# Thin wrapper for loop_control.py (pause / resume / stop).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec python3 "${SCRIPT_DIR}/loop_control.py" "$@"
