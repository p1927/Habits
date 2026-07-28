#!/usr/bin/env python3
"""Inject request protocol + interruptible arm-wake."""
from __future__ import annotations

import json
import os
import subprocess
import sys
import unittest
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parents[2] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

import loop_hook_lib as lh  # noqa: E402


class InjectProtocolTests(unittest.TestCase):
    loop_id = "test-inject-wake"

    def setUp(self) -> None:
        lh.clear_inject_request(self.loop_id)
        lh.clear_wake_meta(self.loop_id)
        lh.resolve_inject_cooldown_path(self.loop_id).unlink(missing_ok=True)

    def tearDown(self) -> None:
        self.setUp()

    def test_write_and_consume_inject(self) -> None:
        lh.write_inject_request(
            self.loop_id,
            payload_line="AGENT_LOOP_WAKE_TEST {}",
            reason="manual",
        )
        req = lh.read_inject_request(self.loop_id)
        self.assertIsNotNone(req)
        consumed = lh.consume_inject_request(self.loop_id)
        assert consumed is not None
        self.assertEqual(consumed["payload_line"], "AGENT_LOOP_WAKE_TEST {}")
        self.assertIsNone(lh.read_inject_request(self.loop_id))

    def test_consume_inject_arm_script(self) -> None:
        lh.write_inject_request(
            self.loop_id,
            payload_line="AGENT_LOOP_WAKE_TEST {\"loop_id\":\"x\"}",
        )
        r = subprocess.run(
            [sys.executable, str(SCRIPT_DIR / "consume_inject_arm.py"), self.loop_id],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(r.returncode, 0)
        self.assertIn("AGENT_LOOP_WAKE_TEST", r.stdout)
        self.assertIsNone(lh.read_inject_request(self.loop_id))

    def test_arm_wake_fires_early_on_inject(self) -> None:
        arm_script = SCRIPT_DIR / "arm-wake.sh"
        env = {
            **os.environ,
            "LOOP_ID": self.loop_id,
            "WAKE_SENTINEL": "AGENT_LOOP_WAKE_TEST",
            "INTERVAL": "30",
            "CONTRACT_DOC": "docs/window-instances/worker-relay/INSTANCE.md",
            "STATE_FILE": "",
            "PROJECT_ROOT": str(Path(__file__).resolve().parents[3]),
            "INJECT_POLL_SEC": "1",
            "RITUAL_GATE_FORCE": "1",
        }
        proc = subprocess.Popen(
            ["bash", str(arm_script)],
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        try:
            import time

            time.sleep(0.5)
            lh.write_inject_request(
                self.loop_id,
                payload_line='AGENT_LOOP_WAKE_TEST {"loop_id":"test-inject-wake"}',
            )
            stdout, stderr = proc.communicate(timeout=10)
            self.assertIn("WAKE_INJECT", stderr + stdout)
            self.assertIn("AGENT_LOOP_WAKE_TEST", stdout)
            self.assertLess(proc.returncode or 0, 2)
        finally:
            if proc.poll() is None:
                proc.kill()


if __name__ == "__main__":
    unittest.main()
