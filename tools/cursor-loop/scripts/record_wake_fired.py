#!/usr/bin/env python3
"""Record dynamic wake sentinel fire for recovery diagnostics."""
from __future__ import annotations

import sys
from pathlib import Path

import loop_hook_lib as mod

if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "--clear":
        mod.clear_wake_fired(sys.argv[2])
        raise SystemExit(0)
    if len(sys.argv) < 3:
        raise SystemExit("usage: record_wake_fired.py <loop_id> <payload_line> | --clear <loop_id>")
    mod.write_wake_fired(sys.argv[1], " ".join(sys.argv[2:]))
