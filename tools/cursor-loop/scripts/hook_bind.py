#!/usr/bin/env python3
"""beforeSubmitPrompt — bind conversation to loop contract; honor stop loop."""
from __future__ import annotations

import json
import os
import sys

import loop_control
import loop_hook_lib as mod


def _resume_binding(root, conversation_id: str, binding: dict) -> None:
    binding["paused"] = False
    binding.pop("bind_blocked", None)
    binding.pop("bind_error", None)
    if binding.get("stopped"):
        binding["stopped"] = False
    loop_id = binding.get("loop_id")
    contract_doc = binding.get("contract_doc") or ""
    if loop_id and contract_doc:
        ok, err = mod.acquire_loop_lock(root, loop_id, conversation_id, contract_doc)
        if not ok:
            binding["bind_blocked"] = True
            binding["bind_error"] = err
            binding["stopped"] = True
    if loop_id:
        mod.set_lock_paused(root, loop_id, False)
    mod.write_binding(root, conversation_id, binding)


def main() -> int:
    raw = os.environ.get("CURSOR_LOOP_INPUT", "")
    if not raw:
        return 0
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return 0

    conversation_id = payload.get("conversation_id") or ""
    prompt = payload.get("prompt") or ""
    if not conversation_id:
        return 0

    root = mod.workspace_root(payload)
    if root is None:
        return 0

    try:
        manifest = mod.load_manifest(root)
    except (FileNotFoundError, ValueError):
        return 0

    mod.maybe_cleanup_bindings(root, manifest)

    binding = mod.read_binding(root, conversation_id)
    if binding and not binding.get("stopped") and not binding.get("paused"):
        loop_id = binding.get("loop_id") or ""
        fired = mod.read_wake_fired(loop_id) if loop_id else None
        if fired:
            line = (fired.get("payload_line") or "").strip()
            contract_doc = binding.get("contract_doc") or ""
            state_file = binding.get("state_file") or ""
            msg = (
                f"MISSED TICK for {loop_id}: sentinel fired at {fired.get('fired_at', '?')} "
                f"without waking this chat. Treat the wake payload below as your tick NOW — "
                f"run Ritual phases 1→8, then re-arm with prepare_arm_wake.sh + ARM_COMMAND "
                f"(block_until_ms=0, notify_on_output on monitor_regex). "
                f"Read {contract_doc}"
            )
            if state_file:
                msg += f" and {state_file}"
            msg += f". Wake payload: {line}"
            mod.clear_wake_fired(loop_id)
            print(json.dumps({"followup_message": msg}))
            return 0

    if mod.is_stop_request(prompt):
        binding = mod.read_binding(root, conversation_id)
        if binding:
            binding["stopped"] = True
            binding["paused"] = False
            mod.write_binding(root, conversation_id, binding)
            loop_id = binding.get("loop_id")
            if loop_id:
                mod.release_loop_lock(root, loop_id, conversation_id)
                loop_control.stop_loop(root, loop_id)
        return 0

    if mod.is_pause_request(prompt):
        binding = mod.read_binding(root, conversation_id)
        if binding:
            loop_id = binding.get("loop_id")
            if loop_id:
                loop_control.pause_loop(root, loop_id)
            else:
                binding["paused"] = True
                binding["stopped"] = False
                mod.write_binding(root, conversation_id, binding)
        return 0

    if mod.is_resume_request(prompt) or (
        mod.is_keep_working_request(prompt) and not mod.find_contract_paths(prompt, root, manifest)
    ):
        binding = mod.read_binding(root, conversation_id)
        if binding and (binding.get("stopped") or binding.get("paused")):
            _resume_binding(root, conversation_id, binding)
            return 0
        if binding and mod.is_keep_working_request(prompt):
            return 0

    for rel in mod.find_contract_paths(prompt, root, manifest):
        doc_path = root / rel
        if not doc_path.is_file():
            continue
        text = doc_path.read_text(encoding="utf-8")
        if not mod.has_loop_config(text):
            continue
        cfg = mod.parse_loop_config(text)
        loop_id = cfg.get("loop_id")
        if not loop_id:
            continue
        try:
            binding = mod.build_binding(root, manifest, rel, cfg)
        except FileNotFoundError:
            continue

        contract_doc = binding["contract_doc"]
        ok, err = mod.acquire_loop_lock(root, loop_id, conversation_id, contract_doc)
        if not ok:
            binding["bind_blocked"] = True
            binding["bind_error"] = err
            binding["stopped"] = True
            mod.write_binding(root, conversation_id, binding)
            break

        binding.pop("bind_blocked", None)
        binding.pop("bind_error", None)
        binding["paused"] = False
        mod.write_binding(root, conversation_id, binding)
        mod.set_lock_paused(root, loop_id, False)
        break

    return 0


if __name__ == "__main__":
    sys.exit(main())
