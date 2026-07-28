#!/usr/bin/env bash
# Segment test: provision_instances dry-run
set -euo pipefail

PKG="$(cd "$(dirname "$0")/../.." && pwd)"
ROOT="$(cd "${PKG}/../.." && pwd)"
SCRIPT="${PKG}/scripts/provision_instances.py"

OUT="$(python3 "$SCRIPT" "$ROOT" --loop-id worker-relay --dry-run --json 2>&1)"
python3 -c "
import json, sys
d = json.loads(sys.argv[1])
r = d['results'][0]
assert r.get('dry_run') is True, r
assert r.get('ui_window_slot'), r
assert 'keep working' in r.get('paste', ''), r
assert any('window' in line for line in r.get('actions', [])), r
print('OK provision_instances dry-run')
" "$OUT"
