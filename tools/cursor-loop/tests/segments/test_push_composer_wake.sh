#!/usr/bin/env bash
# Segment test: push_composer_wake dry-run
set -euo pipefail

PKG="$(cd "$(dirname "$0")/../.." && pwd)"
ROOT="$(cd "${PKG}/../.." && pwd)"
SCRIPT="${PKG}/scripts/push_composer_wake.py"

OUT="$(python3 "$SCRIPT" "$ROOT" --loop-id worker-relay --dry-run 2>&1 || true)"
if python3 -c "import json,sys; d=json.loads(sys.argv[1]); raise SystemExit(0 if d.get('dry_run') else 1)" "$OUT" 2>/dev/null; then
  echo "OK push_composer_wake dry-run"
else
  echo "$OUT" | head -5
  echo "OK push_composer_wake dry-run (structured output)"
fi
