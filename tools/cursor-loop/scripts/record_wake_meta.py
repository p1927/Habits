#!/usr/bin/env python3
"""Write wake.meta.json when arm-wake starts a new sleeper."""
from __future__ import annotations

import sys

import loop_hook_lib as mod

if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "--clear":
        mod.clear_wake_meta(sys.argv[2])
        raise SystemExit(0)
    if len(sys.argv) >= 3 and sys.argv[1] == "--clear-pending":
        mod.clear_wake_pending(sys.argv[2])
        raise SystemExit(0)
    if len(sys.argv) < 5:
        raise SystemExit(
            "usage: record_wake_meta.py <loop_id> <interval_sec> <wake_sentinel> <pid> | "
            "--clear <loop_id> | --clear-pending <loop_id>"
        )
    try:
        interval_sec = int(sys.argv[2])
        pid = int(sys.argv[4])
    except ValueError as exc:
        raise SystemExit(f"record_wake_meta: invalid numeric argument: {exc}") from exc
    mod.write_wake_meta(
        sys.argv[1],
        interval_sec=interval_sec,
        wake_sentinel=sys.argv[3],
        pid=pid,
    )
