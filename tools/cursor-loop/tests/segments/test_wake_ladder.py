#!/usr/bin/env python3
"""Tests for operator wake ladder decision logic."""
from __future__ import annotations

import sys
import unittest
from pathlib import Path
from unittest.mock import patch

SCRIPT_DIR = Path(__file__).resolve().parents[2] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

import loop_hook_lib as lh  # noqa: E402


class OperatorWakeLabelTests(unittest.TestCase):
    root = Path("/tmp/cursor-loop-ladder-test")

    def test_needs_bind_without_lock(self) -> None:
        with patch.object(lh, "has_loop_binding", return_value=False):
            self.assertEqual(lh.operator_wake_label(self.root, "x"), "needs_bind")

    def test_ready_when_autonomous(self) -> None:
        detail = {"inject_pending": False, "ready_for_autonomous_tick": True, "notify_attached": True}
        with patch.object(lh, "has_loop_binding", return_value=True):
            with patch.object(lh, "read_inject_request", return_value=None):
                self.assertEqual(lh.operator_wake_label(self.root, "x", detail), "ready")

    def test_needs_notify_when_orphan(self) -> None:
        detail = {"inject_pending": False, "ready_for_autonomous_tick": False, "notify_attached": False}
        with patch.object(lh, "has_loop_binding", return_value=True):
            with patch.object(lh, "read_inject_request", return_value=None):
                self.assertEqual(lh.operator_wake_label(self.root, "x", detail), "needs_notify")

    def test_queued_when_inject_pending(self) -> None:
        detail = {"inject_pending": True, "ready_for_autonomous_tick": False, "notify_attached": True}
        with patch.object(lh, "has_loop_binding", return_value=True):
            with patch.object(lh, "read_inject_request", return_value={"loop_id": "x"}):
                self.assertEqual(lh.operator_wake_label(self.root, "x", detail), "queued")


if __name__ == "__main__":
    unittest.main()
