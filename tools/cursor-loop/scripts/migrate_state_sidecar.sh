#!/usr/bin/env bash
# Rebuild STATE.hot.json sidecars for all window instances
set -euo pipefail
PROJECT="${1:-.}"
PROJECT="$(cd "$PROJECT" && pwd)"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export PYTHONPATH="${SCRIPT_DIR}:${PYTHONPATH:-}"
python3 - "$PROJECT" <<'PY'
import json
import sys
from pathlib import Path

import state_persist as sp
import state_snapshot as ss

root = Path(sys.argv[1])
manifest = root / "docs/window-instances/instances.manifest.json"
if not manifest.is_file():
    print("migrate_state_sidecar: no manifest", file=sys.stderr)
    sys.exit(1)
data = json.loads(manifest.read_text(encoding="utf-8"))
print("migrate_state_sidecar BEGIN")
for entry in data.get("instances") or []:
    loop_id = entry.get("loop_id", "")
    sf = entry.get("state_file", "")
    if not loop_id or not sf:
        continue
    path = root / sf
    if not path.is_file():
        print(f"  SKIP {loop_id} missing {sf}")
        continue
    sections = tuple(entry.get("backlog_sections") or ())
    text = path.read_text(encoding="utf-8")
    snap = sp.rebuild_sidecar(path, loop_id=loop_id, state_text=text, backlog_sections=sections or None)
    open_n = len(snap.get("open_backlog") or [])
    print(f"  OK {loop_id} fingerprint={snap.get('fingerprint','')} open_backlog={open_n}")
print("migrate_state_sidecar END")
PY
