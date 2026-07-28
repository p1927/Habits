#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT="${1:-.}"
shift || true
STATE_FILE=""
LOOP_ID=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --state-file) STATE_FILE="$2"; shift 2 ;;
    --loop-id) LOOP_ID="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done
if [[ -z "$LOOP_ID" ]]; then
  echo "usage: prepare_orient_tick.sh [project] --state-file PATH --loop-id ID" >&2
  exit 1
fi
echo "ORIENT_SNAPSHOT_BEGIN"
bash "${SCRIPT_DIR}/state_api.sh" "$PROJECT" --loop-id "$LOOP_ID" ${STATE_FILE:+--state-file "$STATE_FILE"} get snapshot
echo "ORIENT_GIT_STATUS_BEGIN"
git -C "$PROJECT" status --short 2>/dev/null || true
echo "ORIENT_GIT_LOG_BEGIN"
git -C "$PROJECT" log -1 --oneline 2>/dev/null || true
echo "ORIENT_SNAPSHOT_END"
