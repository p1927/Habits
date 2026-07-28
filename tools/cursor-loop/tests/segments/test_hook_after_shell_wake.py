"""Tests for after-shell wake hook — records wake.fired only."""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
import loop_hook_lib as mod  # noqa: E402

from helpers.hooks import invoke_hook  # noqa: E402

pytestmark = pytest.mark.integration


def test_after_shell_wake_records_fired(installed_project: Path):
    cid = "after-shell-1"
    loop_id = "test-loop"
    binding = {
        "loop_id": loop_id,
        "contract_doc": "docs/agents/test-loop.md",
        "state_file": "docs/agents/test-loop-STATE.md",
        "wake_sentinel": "AGENT_LOOP_WAKE_TEST",
        "stopped": False,
    }
    mod.write_binding(installed_project, cid, binding)

    wake_payload = json.dumps({"loop_id": loop_id, "kind": "tick"})
    output = f"WAKE_ARMED loop_id={loop_id}\nAGENT_LOOP_WAKE_TEST {wake_payload}\n"

    _, out, _ = invoke_hook(
        installed_project,
        "loop-after-shell-wake.sh",
        {
            "conversation_id": cid,
            "workspace_roots": [str(installed_project)],
            "command": "bash tools/cursor-loop/scripts/arm-wake.sh",
            "output": output,
            "duration": 120000,
        },
    )
    assert out == ""
    fired = mod.read_wake_fired(loop_id)
    assert fired is not None
    assert loop_id in (fired.get("payload_line") or "")

    mod.clear_wake_fired(loop_id)
    (installed_project / ".cursor" / "loop-bindings" / f"{cid}.json").unlink(missing_ok=True)


def test_after_shell_skips_prepare_exec(installed_project: Path):
    cid = "after-shell-2"
    mod.write_binding(
        installed_project,
        cid,
        {
            "loop_id": "test-loop",
            "wake_sentinel": "AGENT_LOOP_WAKE_TEST",
            "stopped": False,
        },
    )
    wake_payload = json.dumps({"loop_id": "test-loop"})
    output = f"AGENT_LOOP_WAKE_TEST {wake_payload}\n"
    _, out, _ = invoke_hook(
        installed_project,
        "loop-after-shell-wake.sh",
        {
            "conversation_id": cid,
            "workspace_roots": [str(installed_project)],
            "command": "bash prepare_arm_wake.sh . --exec",
            "output": output,
            "duration": 120000,
        },
    )
    assert out == ""
    (installed_project / ".cursor" / "loop-bindings" / f"{cid}.json").unlink(missing_ok=True)
