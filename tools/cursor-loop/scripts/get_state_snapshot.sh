#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT="${1:-.}"
shift || true
LOOP_ID=""
REFRESH=""
EXTRA=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --loop-id) LOOP_ID="$2"; shift 2 ;;
    --refresh) REFRESH=1; shift ;;
    *) EXTRA+=("$1"); shift ;;
  esac
done
if [[ -z "$LOOP_ID" ]]; then
  echo "usage: get_state_snapshot.sh [project] --loop-id ID [--refresh]" >&2
  exit 1
fi
ARGS=(get snapshot --loop-id "$LOOP_ID")
[[ -n "$REFRESH" ]] && exec bash "${SCRIPT_DIR}/state_api.sh" "$PROJECT" --loop-id "$LOOP_ID" refresh
exec bash "${SCRIPT_DIR}/state_api.sh" "$PROJECT" --loop-id "$LOOP_ID" "${ARGS[@]}"
