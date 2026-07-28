#!/usr/bin/env python3
"""Watch window instances — detect code idle + unhealthy wakes; emit rearm plan."""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

import loop_hook_lib as lh  # noqa: E402


CODE_PATHS = ("pwa", "server", "tools/cursor-loop")
STATE_GLOB = "docs/window-instances/*/STATE.md"


def _utc_now() -> float:
    return time.time()


def _iso(ts: float) -> str:
    return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def latest_code_activity(root: Path) -> float:
    """Return unix timestamp of most recent code-related activity."""
    latest = 0.0

    try:
        r = subprocess.run(
            ["git", "log", "-1", "--format=%ct"],
            cwd=root,
            capture_output=True,
            text=True,
            timeout=10,
        )
        if r.returncode == 0 and r.stdout.strip().isdigit():
            latest = max(latest, float(r.stdout.strip()))
    except (subprocess.SubprocessError, ValueError):
        pass

    for rel in CODE_PATHS:
        path = root / rel
        if not path.exists():
            continue
        try:
            r = subprocess.run(
                ["git", "log", "-1", "--format=%ct", "--", rel],
                cwd=root,
                capture_output=True,
                text=True,
                timeout=10,
            )
            if r.returncode == 0 and r.stdout.strip().isdigit():
                latest = max(latest, float(r.stdout.strip()))
        except (subprocess.SubprocessError, ValueError):
            pass
        for fp in path.rglob("*"):
            if fp.is_file():
                try:
                    latest = max(latest, fp.stat().st_mtime)
                except OSError:
                    pass

    for state in root.glob(STATE_GLOB):
        try:
            latest = max(latest, state.stat().st_mtime)
        except OSError:
            pass

    if latest <= 0:
        latest = _utc_now()
    return latest


def instance_rows(root: Path) -> list[dict]:
    manifest = lh.load_manifest(root)
    instances = lh.load_instances_manifest(root, manifest).get("instances") or []
    rows: list[dict] = []
    verify = SCRIPT_DIR / "verify-wake.sh"

    for entry in instances:
        loop_id = entry["loop_id"]
        interval = int(entry.get("interval_sec") or 120)
        state_path = root / entry["state_file"]
        phase = "—"
        last_wake_iso = None
        if state_path.is_file():
            text = state_path.read_text(encoding="utf-8")
            if "## CHECKPOINT" in text:
                section = text.split("## CHECKPOINT", 1)[1].split("\n## ", 1)[0]
                for line in section.splitlines():
                    parts = [p.strip().strip("`") for p in line.split("|")]
                    if len(parts) >= 3 and parts[1] == "phase":
                        phase = parts[2]
            last_wake_iso = lh.parse_last_wake(text)

        detail = lh.wake_status_detail(loop_id, interval, phase, last_wake_iso)
        wake = detail["wake"]
        fired = lh.read_wake_fired(loop_id)
        armed = False
        if verify.is_file():
            try:
                r = subprocess.run(
                    ["bash", str(verify), loop_id],
                    cwd=root,
                    capture_output=True,
                    text=True,
                    timeout=5,
                )
                armed = r.returncode == 0
            except subprocess.SubprocessError:
                pass
        operator_wake = lh.operator_wake_label(root, loop_id, detail)
        ready = detail["ready_for_autonomous_tick"]
        rows.append(
            {
                "loop_id": loop_id,
                "wake": wake,
                "armed": armed,
                "ready_for_autonomous_tick": ready,
                "stale": detail["stale"],
                "orphan_arm": detail["orphan_arm"],
                "notify": detail["notify"],
                "operator_wake": operator_wake,
                "last_tick": detail["last_tick"],
                "sleeper": detail["sleeper"],
                "phase": phase,
                "interval_sec": interval,
                "wake_sentinel": entry.get("wake_sentinel", ""),
                "contract_doc": entry.get("contract_doc", ""),
                "state_file": entry.get("state_file", ""),
                "fired_at": fired.get("fired_at") if fired else None,
            }
        )
    return rows


def load_activity_stamp(root: Path) -> Path:
    return Path(os.environ.get("TMPDIR") or "/tmp") / f"cursor-loop-watchdog-{root.name}.activity"


def save_activity_stamp(root: Path, ts: float) -> None:
    path = load_activity_stamp(root)
    path.write_text(f"{ts}\n{_iso(ts)}\n", encoding="utf-8")


def read_saved_activity(root: Path) -> float | None:
    path = load_activity_stamp(root)
    if not path.is_file():
        return None
    try:
        line = path.read_text(encoding="utf-8").splitlines()[0].strip()
        return float(line)
    except (IndexError, ValueError, OSError):
        return None


def evaluate(root: Path, idle_sec: int) -> dict:
    now = _utc_now()
    activity_ts = latest_code_activity(root)
    prev = read_saved_activity(root)
    if prev is None or activity_ts > (prev + 1):
        save_activity_stamp(root, activity_ts)

    idle_since = now - activity_ts
    rows = instance_rows(root)
    unhealthy = [r for r in rows if not r["ready_for_autonomous_tick"]]
    should_rearm = idle_since >= idle_sec and bool(unhealthy)

    return {
        "project": str(root),
        "checked_at": _iso(now),
        "last_code_activity": _iso(activity_ts),
        "idle_seconds": int(idle_since),
        "idle_threshold_sec": idle_sec,
        "code_active": idle_since < idle_sec,
        "instances": rows,
        "unhealthy_count": len(unhealthy),
        "all_ready": not unhealthy,
        "should_rearm": should_rearm,
        "rearm_targets": [r["loop_id"] for r in unhealthy] if should_rearm else [],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Watch window instance health + code idle")
    parser.add_argument("project", nargs="?", default=".")
    parser.add_argument("--idle-sec", type=int, default=int(os.environ.get("WATCHDOG_IDLE_SEC", "300")))
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    root = Path(args.project).resolve()
    report = evaluate(root, args.idle_sec)

    if args.json:
        print(json.dumps(report, indent=2))
        return 0

    print(f"checked_at={report['checked_at']}")
    print(f"last_code_activity={report['last_code_activity']} idle={report['idle_seconds']}s threshold={report['idle_threshold_sec']}s")
    for row in report["instances"]:
        flag = "OK" if row["ready_for_autonomous_tick"] else "NEEDS_ATTENTION"
        stale = " stale" if row.get("stale") else ""
        print(
            f"  {row['loop_id']:16} {flag:16} wake={row['wake']:6} sleeper={row.get('sleeper', '—'):8} "
            f"last_tick={row.get('last_tick', '—'):6}{stale} phase={row['phase']}"
        )
    if report["should_rearm"]:
        print(f"ACTION=rearm_all targets={','.join(report['rearm_targets'])}")
    elif report["all_ready"]:
        print("ACTION=none all instances ready")
    else:
        print(f"ACTION=wait code still active or idle<{args.idle_sec}s unhealthy={report['unhealthy_count']}")

    return 1 if report["should_rearm"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
