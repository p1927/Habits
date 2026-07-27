"""Integration: pause → survival skip → resume → stop."""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
import loop_control  # noqa: E402
import loop_hook_lib as mod  # noqa: E402

from helpers.cleanup import cleanup_project  # noqa: E402
from helpers.hooks import invoke_hook  # noqa: E402

pytestmark = pytest.mark.integration


def test_pause_survival_resume_stop_flow(installed_project: Path):
    project = installed_project
    cid = "integ-pause-1"
    root = str(project)

    try:
        invoke_hook(
            project,
            "loop-bind.sh",
            {
                "conversation_id": cid,
                "workspace_roots": [root],
                "prompt": "@docs/agents/test-loop.md keep working",
            },
        )
        binding = mod.read_binding(project, cid)
        assert binding is not None
        loop_id = binding["loop_id"]

        invoke_hook(
            project,
            "loop-bind.sh",
            {"conversation_id": cid, "workspace_roots": [root], "prompt": "pause loop"},
        )
        binding = mod.read_binding(project, cid)
        assert binding.get("paused") is True
        assert binding.get("stopped") is False
        assert mod.is_loop_paused(project, loop_id)

        _, surv_out, _ = invoke_hook(
            project,
            "loop-survival.sh",
            {"conversation_id": cid, "workspace_roots": [root]},
        )
        assert surv_out == ""

        invoke_hook(
            project,
            "loop-bind.sh",
            {"conversation_id": cid, "workspace_roots": [root], "prompt": "resume loop"},
        )
        binding = mod.read_binding(project, cid)
        assert binding.get("paused") is False
        assert binding.get("stopped") is False
        assert not mod.is_loop_paused(project, loop_id)

        invoke_hook(
            project,
            "loop-bind.sh",
            {"conversation_id": cid, "workspace_roots": [root], "prompt": "stop loop"},
        )
        binding = mod.read_binding(project, cid)
        assert binding.get("stopped") is True
        assert binding.get("paused") is False
    finally:
        if binding := mod.read_binding(project, cid):
            mod.release_loop_lock(project, binding.get("loop_id", ""), cid)
        cleanup_project(project)


def test_loop_control_cli_stop_all_preserves_state(installed_project: Path):
    project = installed_project
    cid = "integ-stop-all-1"
    root = str(project)
    state_before = ""

    try:
        invoke_hook(
            project,
            "loop-bind.sh",
            {
                "conversation_id": cid,
                "workspace_roots": [root],
                "prompt": "@docs/agents/test-loop.md keep working",
            },
        )
        binding = mod.read_binding(project, cid)
        assert binding is not None
        loop_id = binding["loop_id"]
        state_path = project / binding["state_file"]
        if state_path.is_file():
            state_before = state_path.read_text(encoding="utf-8")

        loop_control.stop_all(project)
        binding = mod.read_binding(project, cid)
        assert binding.get("stopped") is True
        assert loop_control.loop_control_state(project, loop_id) == "stopped"

        if state_before and state_path.is_file():
            assert state_path.read_text(encoding="utf-8") == state_before
    finally:
        if binding := mod.read_binding(project, cid):
            mod.release_loop_lock(project, binding.get("loop_id", ""), cid)
        cleanup_project(project)
