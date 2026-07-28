#!/usr/bin/env python3
"""Wake meta + stale tick detection for operator status."""
from __future__ import annotations

import json
import os
import sys
import time
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parents[2] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

import loop_hook_lib as lh  # noqa: E402


class WakeMetaTests(unittest.TestCase):
    loop_id = "test-wake-meta"

    def setUp(self) -> None:
        lh.clear_wake_meta(self.loop_id)
        lh.clear_wake_fired(self.loop_id)
        pidfile = lh.resolve_wake_pidfile_path(self.loop_id)
        pidfile.unlink(missing_ok=True)

    def tearDown(self) -> None:
        self.setUp()

    def test_write_meta_uses_arm_interval(self) -> None:
        lh.write_wake_meta(
            self.loop_id,
            interval_sec=90,
            wake_sentinel="AGENT_LOOP_WAKE_TEST",
            pid=99999,
        )
        meta = lh.read_wake_meta(self.loop_id)
        self.assertIsNotNone(meta)
        assert meta is not None
        self.assertEqual(meta["interval_sec"], 90)
        self.assertEqual(meta["wake_sentinel"], "AGENT_LOOP_WAKE_TEST")

    def test_sleeper_remaining_from_meta(self) -> None:
        meta_path = lh.resolve_wake_meta_path(self.loop_id)
        armed_at = datetime.now(timezone.utc) - timedelta(seconds=30)
        meta_path.write_text(
            json.dumps(
                {
                    "loop_id": self.loop_id,
                    "armed_at": armed_at.replace(microsecond=0).isoformat(),
                    "interval_sec": 120,
                    "wake_sentinel": "X",
                    "pid": os.getpid(),
                }
            ),
            encoding="utf-8",
        )
        lh.resolve_wake_pidfile_path(self.loop_id).write_text(f"{os.getpid()}\n", encoding="utf-8")
        label, interval = lh.wake_sleeper_remaining(self.loop_id, fallback_interval=300)
        self.assertEqual(interval, 120)
        self.assertIn("m", label)

    def test_stale_when_last_wake_old(self) -> None:
        old = (datetime.now(timezone.utc) - timedelta(hours=6)).replace(microsecond=0).isoformat()
        self.assertTrue(lh.is_tick_stale(old, 300))

    def test_orphan_meta_when_no_pending(self) -> None:
        lh.write_wake_meta(
            self.loop_id,
            interval_sec=120,
            wake_sentinel="AGENT_LOOP_WAKE_TEST",
            pid=99999,
        )
        meta = lh.read_wake_meta(self.loop_id)
        assert meta is not None
        self.assertFalse(meta["notify_attached"])
        self.assertEqual(meta["arm_source"], "orphan")

    def test_notify_meta_from_pending(self) -> None:
        lh.write_wake_pending(
            self.loop_id,
            notify_pattern="^AGENT_LOOP_WAKE_TEST",
            block_until_ms=0,
        )
        lh.write_wake_meta(
            self.loop_id,
            interval_sec=120,
            wake_sentinel="AGENT_LOOP_WAKE_TEST",
            pid=99999,
        )
        meta = lh.read_wake_meta(self.loop_id)
        assert meta is not None
        self.assertTrue(meta["notify_attached"])
        self.assertEqual(meta["arm_source"], "agent_notify")
        self.assertEqual(meta["notify_pattern"], "^AGENT_LOOP_WAKE_TEST")
        self.assertIsNone(lh.read_wake_pending(self.loop_id))

    def test_ready_requires_notify(self) -> None:
        lh.write_wake_meta(
            self.loop_id,
            interval_sec=120,
            wake_sentinel="AGENT_LOOP_WAKE_TEST",
            pid=os.getpid(),
        )
        lh.resolve_wake_pidfile_path(self.loop_id).write_text(f"{os.getpid()}\n", encoding="utf-8")
        recent = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
        detail = lh.wake_status_detail(self.loop_id, 120, "9-arm", recent)
        self.assertFalse(detail["ready_for_autonomous_tick"])
        self.assertTrue(detail["orphan_arm"])


if __name__ == "__main__":
    unittest.main()
