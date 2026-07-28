#!/usr/bin/env bash
# macOS Composer Push — submit wake prompt into bound instance chat tab.
# Requires Accessibility permission for Terminal (System Settings → Privacy → Accessibility).
# Usage: push_composer_wake.sh [project] --loop-id ID [--dry-run] [--prompt TEXT]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="${1:-.}"
shift || true
export PYTHONPATH="${SCRIPT_DIR}:${PYTHONPATH:-}"

exec python3 "${SCRIPT_DIR}/push_composer_wake.py" "$ROOT" "$@"
