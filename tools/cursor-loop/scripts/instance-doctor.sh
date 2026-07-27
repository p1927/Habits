#!/usr/bin/env bash
# Window Instance health dashboard — all entries in instances.manifest.json
set -euo pipefail

ROOT="${1:-.}"
ROOT="$(cd "$ROOT" && pwd)"
MANIFEST="$ROOT/docs/window-instances/instances.manifest.json"
SCRIPTS="$ROOT/tools/cursor-loop/scripts"

if [[ ! -f "$MANIFEST" ]]; then
  echo "instance-doctor: missing $MANIFEST" >&2
  exit 1
fi

python3 "$SCRIPTS/validate_instance.py" "$ROOT" || true

echo ""
echo "=== Window Instance Doctor ==="

python3 - "$ROOT" "$MANIFEST" <<'PY'
import json
import re
import subprocess
import sys
from pathlib import Path

root = Path(sys.argv[1])
manifest_path = Path(sys.argv[2])
manifest = json.loads(manifest_path.read_text())
instances = manifest.get("instances") or []

def parse_checkpoint(state_text: str) -> dict[str, str]:
    out: dict[str, str] = {}
    if "## CHECKPOINT" not in state_text:
        return out
    section = state_text.split("## CHECKPOINT", 1)[1]
    if "\n## " in section:
        section = section.split("\n## ", 1)[0]
    for line in section.splitlines():
        if "|" not in line:
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) >= 3 and parts[1] and parts[2]:
            key = parts[1].strip("`")
            val = parts[2].strip("`")
            if key and val and key.lower() not in ("field", "-------"):
                out[key] = val
    return out

def count_open_backlog(state_text: str) -> int:
    return len(re.findall(r"^\s*-\s*\[\s*\]", state_text, re.MULTILINE))

def wake_status(loop_id: str) -> str:
    script = root / "tools/cursor-loop/scripts/verify-wake.sh"
    if not script.is_file():
        return "?"
    try:
        r = subprocess.run(
            ["bash", str(script), loop_id],
            cwd=root,
            capture_output=True,
            text=True,
            timeout=5,
        )
        return "ARMED" if r.returncode == 0 else "DOWN"
    except Exception:
        return "?"

for entry in instances:
    loop_id = entry.get("loop_id", "?")
    bundle = root / entry.get("bundle", "")
    state_path = root / entry.get("state_file", "")
    status = "OK"
    notes: list[str] = []

    if not bundle.is_dir():
        status = "MISSING"
        notes.append("bundle missing")
    elif not state_path.is_file():
        status = "WARN"
        notes.append("state missing")
    else:
        state_text = state_path.read_text(encoding="utf-8")
        cp = parse_checkpoint(state_text)
        phase = cp.get("phase", "?")
        review = cp.get("review_status", "?")
        open_items = count_open_backlog(state_text)
        wake = wake_status(loop_id)
        if review == "pending" and phase not in ("1-wake", "2-review", "3-select"):
            status = "WARN"
        print(
            f"{loop_id:16} {status:4}  phase={phase:12} review={review:8} "
            f"backlog_open={open_items:2}  wake={wake}"
        )
        if notes:
            print(f"  notes: {', '.join(notes)}")
        continue

    wake = wake_status(loop_id)
    print(f"{loop_id:16} {status:4}  wake={wake}  {'; '.join(notes)}")
PY

echo ""
echo "Run: python3 tools/cursor-loop/scripts/validate_instance.py ."
