#!/usr/bin/env python3
"""Operator wake trigger — inject for notify-armed window instances."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import wake_ladder as wl


def main() -> int:
    parser = argparse.ArgumentParser(description="Wake window instances via operator inject")
    parser.add_argument("project", nargs="?", default=".")
    parser.add_argument("--loop-id", default="")
    parser.add_argument(
        "--reason",
        default="manual",
        choices=("manual", "stale", "spin", "down", "daemon"),
    )
    parser.add_argument("--force", action="store_true", help="Wake even if ready_for_autonomous_tick")
    parser.add_argument("--source", default="trigger")
    parser.add_argument("--cooldown-sec", type=int, default=0)
    parser.add_argument(
        "--mode",
        default="ladder",
        choices=("ladder", "inject-only", "bootstrap"),
        help="ladder/inject-only=notify-armed inject; bootstrap=unbound provision only",
    )
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    root = Path(args.project).resolve()
    mode = "inject" if args.mode == "inject-only" else args.mode

    report = wl.run_wake_ladder(
        root,
        loop_id=args.loop_id or None,
        reason=args.reason,
        force=args.force,
        source=args.source,
        cooldown_sec=args.cooldown_sec,
        mode=mode,
    )
    print(json.dumps(report, indent=2))
    return 0 if report["ok_count"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
