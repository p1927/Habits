#!/usr/bin/env bash
# Daily maintenance: prune stale bindings, report loop status, validate contracts.
set -euo pipefail

TARGET="${1:-.}"
TARGET="$(cd "$TARGET" && pwd)"
MANIFEST="${TARGET}/.cursor/cursor-loop.json"
if [[ ! -f "$MANIFEST" ]]; then
  echo "daily-maintenance ERROR: manifest not found: $MANIFEST" >&2
  exit 1
fi
PKG="$(python3 -c "import json; from pathlib import Path; m=json.loads(Path('${MANIFEST}').read_text(encoding='utf-8')); print(m['package_root'])" 2>&1)" || {
  echo "daily-maintenance ERROR: failed to parse manifest: $PKG" >&2
  exit 1
}

echo "=== cursor-loop daily maintenance — ${TARGET} ==="
python3 "${TARGET}/${PKG}/scripts/cleanup_bindings.py" "${TARGET}"
bash "${TARGET}/${PKG}/scripts/loop-status.sh"
python3 "${TARGET}/${PKG}/scripts/validate_contracts.py" "${TARGET}"
