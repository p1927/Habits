#!/usr/bin/env python3
"""Stop/bind hooks inject followup when tick is STALE."""
from __future__ import annotations

import json
import os
import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import patch

SCRIPT_DIR = Path(__file__).resolve().parents[2] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

import hook_bind  # noqa: E402
import hook_survival  # noqa: E402
import loop_hook_lib as lh  # noqa: E402


class StaleWakeInjectionTests(unittest.TestCase):
    loop_id = "test-stale-hook"
    root = Path("/tmp/cursor-loop-stale-test-root")

    def tearDown(self) -> None:
        lh.clear_wake_meta(self.loop_id)
        lh.clear_wake_fired(self.loop_id)
        lh.resolve_wake_pidfile_path(self.loop_id).unlink(missing_ok=True)

    def test_stale_tick_followup_mentions_armed_disconnect(self) -> None:
        msg = lh.stale_tick_followup(
            loop_id=self.loop_id,
            contract_doc="docs/x/INSTANCE.md",
            state_file="docs/x/STATE.md",
            interval_sec=120,
            last_wake_iso="2026-07-28T00:00:00+00:00",
            armed=True,
        )
        self.assertIn("STALE TICK", msg)
        self.assertIn("not connected", msg)

    def test_is_tick_stale_when_last_wake_hours_ago(self) -> None:
        old = (datetime.now(timezone.utc) - timedelta(hours=6)).replace(microsecond=0).isoformat()
        self.assertTrue(lh.is_tick_stale(old, 120))


if __name__ == "__main__":
    unittest.main()
