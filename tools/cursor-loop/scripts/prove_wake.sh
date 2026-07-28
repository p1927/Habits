#!/usr/bin/env bash
# Operator checklist: verify wake path for one loop (reports state; exit 1 if not ready).
# Usage: prove_wake.sh [project] [--loop-id ID]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="${1:-.}"
shift || true
LOOP_ID=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --loop-id) LOOP_ID="${2:?}"; shift 2 ;;
    *) echo "Unknown: $1" >&2; exit 1 ;;
  esac
done

ROOT="$(cd "$ROOT" && pwd)"
export PYTHONPATH="${SCRIPT_DIR}"
export PROVE_WAKE_ROOT="$ROOT"
export PROVE_WAKE_LOOP_ID="$LOOP_ID"

python3 - <<'PY'
import json
import os
from pathlib import Path

import loop_hook_lib as lh

root = Path(os.environ["PROVE_WAKE_ROOT"])
loop_id = os.environ.get("PROVE_WAKE_LOOP_ID", "")

manifest = lh.load_manifest(root)
instances = lh.load_instances_manifest(root, manifest).get("instances") or []
if loop_id:
    instances = [e for e in instances if e.get("loop_id") == loop_id]
if not instances:
    raise SystemExit("No matching instances")

rows = []
for entry in instances:
    lid = entry["loop_id"]
    interval = int(entry.get("interval_sec") or 120)
    state_path = root / entry["state_file"]
    phase = "—"
    last_wake = "—"
    if state_path.is_file():
        text = state_path.read_text(encoding="utf-8")
        if "## CHECKPOINT" in text:
            section = text.split("## CHECKPOINT", 1)[1].split("\n## ", 1)[0]
            for line in section.splitlines():
                parts = [p.strip().strip("`") for p in line.split("|")]
                if len(parts) >= 3:
                    if parts[1] == "phase":
                        phase = parts[2]
                    if parts[1] == "last_wake":
                        last_wake = parts[2]
    fired = lh.read_wake_fired(lid)
    last_wake_iso = None if last_wake == "—" else last_wake
    detail = lh.wake_status_detail(lid, interval, phase, last_wake_iso)
    wake = detail["wake"]
    timer = detail["timer"]
    stale = detail["stale"]
    orphan = detail["orphan_arm"]
    ok = detail["ready_for_autonomous_tick"]
    rows.append(
        {
            "loop_id": lid,
            "wake": wake,
            "timer": timer,
            "sleeper": detail["sleeper"],
            "last_tick": detail["last_tick"],
            "stale": stale,
            "notify": detail["notify"],
            "orphan_arm": orphan,
            "phase": phase,
            "last_wake": last_wake,
            "fired_at": fired.get("fired_at") if fired else None,
            "ready_for_autonomous_tick": ok,
            "fix": None
            if ok
            else (
                "ORPHAN: ARMED without notify_on_output — focus chat + re-arm with prepare_arm_wake + notify"
                if orphan
                else (
                    "STALE: agent idle >> interval — focus chat + keep working; re-arm with notify"
                    if stale
                    else (
                        "SPIN: focus chat + keep working; then background arm with notify"
                        if wake == "SPIN"
                        else "DOWN: re-arm with prepare_arm_wake + ARM_COMMAND + notify"
                    )
                )
            ),
        }
    )

print(json.dumps({"project": str(root), "instances": rows}, indent=2))
bad = [r for r in rows if not r["ready_for_autonomous_tick"]]
raise SystemExit(0 if not bad else 1)
PY
