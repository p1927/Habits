#!/usr/bin/env python3
"""Consume inject request for arm-wake.sh (print payload_line and exit 0 if found)."""
from __future__ import annotations

import sys

import loop_hook_lib as mod

if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("usage: consume_inject_arm.py <loop_id>")
    loop_id = sys.argv[1]
    req = mod.consume_inject_request(loop_id)
    if not req:
        raise SystemExit(1)
    line = (req.get("payload_line") or "").strip()
    if not line:
        raise SystemExit(1)
    print(line)
    raise SystemExit(0)
