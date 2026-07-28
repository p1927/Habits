#!/usr/bin/env python3
"""stop hook backup — re-arm if bound, not stopped, and wake/loop process is dead."""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import build_wake_prompt
import consume_inject_on_hook as inject_hook
import loop_hook_lib as mod
import review_scope as rs
import ritual_phase as rp


def _is_loop_up(binding: dict) -> bool:
    loop_id = binding.get("loop_id") or ""
    loop_mode = binding.get("loop_mode") or mod.DEFAULT_LOOP_MODE
    if loop_mode == "dynamic":
        return mod.is_wake_process_alive(loop_id, binding)
    pidfile = (
        Path(binding["pidfile"])
        if binding.get("pidfile")
        else mod.resolve_pidfile_path(loop_id)
    )
    return mod.is_loop_process_alive(pidfile)


def _review_followup(
    *,
    root: Path,
    loop_id: str,
    contract_doc: str,
    state_file: str,
    gate: rp.GateResult,
) -> str:
    paths = rs.review_paths(loop_id, state_file)
    changed = rs.list_changed_files(root, paths)
    files_note = ", ".join(changed[:20])
    if len(changed) > 20:
        files_note += f" (+{len(changed) - 20} more)"
    return (
        f"REVIEW INCOMPLETE for {loop_id} at Phase 5+. "
        f"MUST read every changed file: {files_note or '(run prepare_review_tick.sh --apply)'}. "
        f"Invoke /code-review, then read receiving-code-review skill + /receiving-code-review, "
        f"then Phase 7b backlog reflect. "
        f"allowed_phase={gate.allowed_phase}; {gate.reason}; FIX: {gate.fix}. "
        f"Read {contract_doc} and {state_file}."
    )


def main() -> int:
    raw = os.environ.get("CURSOR_LOOP_INPUT", "")
    if not raw:
        return 0
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return 0

    conversation_id = payload.get("conversation_id") or ""
    if not conversation_id:
        return 0

    root = mod.workspace_root(payload)
    if root is None:
        return 0

    binding = mod.read_binding(root, conversation_id)
    if not binding or binding.get("stopped") or binding.get("paused") or binding.get("bind_blocked"):
        return 0

    loop_id = binding.get("loop_id") or ""
    contract_doc = binding.get("contract_doc") or ""
    state_file = binding.get("state_file") or ""
    wake_sentinel = binding.get("wake_sentinel") or ""
    if not loop_id or not contract_doc:
        return 0

    lock = mod.read_loop_lock(root, loop_id)
    if lock and lock.get("conversation_id") not in (None, conversation_id):
        return 0

    if state_file:
        state_path = root / state_file
        if state_path.is_file():
            state_text = state_path.read_text(encoding="utf-8")
            checkpoint = rp.parse_checkpoint_table(state_text)
            phase = rp.normalize_phase(checkpoint.get("phase", "1-wake"))

            if binding.get("operator_wake_pending"):
                inject_msg = inject_hook.pending_inject_followup(
                    root,
                    loop_id,
                    contract_doc=contract_doc,
                    state_file=state_file,
                )
                if inject_msg:
                    binding.pop("operator_wake_pending", None)
                    mod.write_binding(root, conversation_id, binding)
                    print(json.dumps({"followup_message": inject_msg}))
                    return 0
                prompt_json = build_wake_prompt.build_prompt(
                    root=root,
                    loop_id=loop_id,
                    contract_doc=contract_doc,
                    state_file=state_file,
                    recovery=True,
                )
                binding.pop("operator_wake_pending", None)
                mod.write_binding(root, conversation_id, binding)
                msg = (
                    f"OPERATOR WAKE for {loop_id}: external trigger requested tick NOW. "
                    f"Read {contract_doc} and {state_file}; run Ritual 1→8, then re-arm with notify. "
                    f"Wake payload: {prompt_json}"
                )
                print(json.dumps({"followup_message": msg}))
                return 0

            if mod.is_wake_spin(loop_id, phase):
                fired = mod.read_wake_fired(loop_id)
                line = (fired.get("payload_line") or "").strip() if fired else ""
                msg = (
                    f"SPIN for {loop_id}: sentinel fired at "
                    f"{fired.get('fired_at', '?') if fired else '?'} without completing Ritual 1→8. "
                    f"Read {contract_doc} and {state_file}; run full tick NOW (start Phase 1-wake). "
                    f"Then re-arm: prepare_arm_wake.sh + ARM_COMMAND with block_until_ms=0 and "
                    f"notify_on_output on ^{wake_sentinel or 'AGENT_LOOP_WAKE_*'}."
                )
                if line:
                    msg += f" Wake payload: {line}"
                mod.clear_wake_fired(loop_id)
                print(json.dumps({"followup_message": msg}))
                return 0

            review_gate = rp.review_stop_needed(
                checkpoint,
                state_text,
                project_root=root,
                loop_id=loop_id,
                state_file=state_file,
            )
            if review_gate is not None:
                msg = _review_followup(
                    root=root,
                    loop_id=loop_id,
                    contract_doc=contract_doc,
                    state_file=state_file,
                    gate=review_gate,
                )
                print(json.dumps({"followup_message": msg}))
                return 0

    inject_msg = inject_hook.pending_inject_followup(
        root,
        loop_id,
        contract_doc=contract_doc,
        state_file=state_file,
    )
    if inject_msg:
        print(json.dumps({"followup_message": inject_msg}))
        return 0

    fired = mod.read_wake_fired(loop_id)
    interval = mod.binding_interval_sec(binding)
    stale_while_armed = False
    if _is_loop_up(binding) and not fired:
        if state_file:
            state_path = root / state_file
            if state_path.is_file():
                last_wake = mod.parse_last_wake(state_path.read_text(encoding="utf-8"))
                if not mod.is_tick_stale(last_wake, interval):
                    return 0
                stale_while_armed = True
            else:
                return 0
        else:
            return 0

    turns = int(binding.get("survival_turns") or 0) + 1
    binding["survival_turns"] = turns
    recovery_turns = int(binding.get("recovery_turns") or 0) + 1
    binding["recovery_turns"] = recovery_turns
    mod.write_binding(root, conversation_id, binding)

    last_exit = mod.resolve_last_exit_path(loop_id)
    last_exit_note = ""
    if last_exit.is_file():
        last_exit_note = f" Last exit: {last_exit.read_text(encoding='utf-8').strip()}."

    try:
        prompt_json = build_wake_prompt.build_prompt(
            root=root,
            loop_id=loop_id,
            contract_doc=contract_doc,
            state_file=state_file,
            recovery=True,
        )
    except Exception as exc:
        print(f"HOOK_SURVIVAL_WARN build_prompt failed: {exc}", file=sys.stderr)
        import json as _json
        prompt_json = _json.dumps({"loop_id": loop_id, "contract_doc": contract_doc, "recovery": True})

    ritual_note = ""
    if state_file:
        state_path = root / state_file
        if state_path.is_file():
            state_text = state_path.read_text(encoding="utf-8")
            checkpoint = rp.parse_checkpoint_table(state_text)
            gate = rp.required_phase_before_arm(
                checkpoint,
                state_text,
                project_root=root,
                mode="arm",
                loop_id=loop_id,
                state_file=state_file,
            )
            if not gate.ok:
                ritual_note = (
                    f" RITUAL INCOMPLETE: allowed_phase={gate.allowed_phase}; {gate.fix}; "
                    f"Phase line: {rp.phase_line_marker(gate.allowed_phase)}."
                )

    msg = (
        f"Loop {loop_id} wake is DOWN (mode={binding.get('loop_mode', 'dynamic')}). "
        f"Read {contract_doc}"
    )
    if stale_while_armed:
        last_wake = None
        if state_file:
            state_path = root / state_file
            if state_path.is_file():
                last_wake = mod.parse_last_wake(state_path.read_text(encoding="utf-8"))
        msg = mod.stale_tick_followup(
            loop_id=loop_id,
            contract_doc=contract_doc,
            state_file=state_file,
            interval_sec=interval,
            last_wake_iso=last_wake,
            wake_sentinel=wake_sentinel,
            armed=True,
        )
        msg += f" Wake payload: {prompt_json}.{ritual_note}{last_exit_note}"
    else:
        fired = mod.read_wake_fired(loop_id)
        if fired:
            msg += (
                f" Sentinel ALREADY FIRED at {fired.get('fired_at', '?')} without waking this chat — "
                "arm-wake Shell likely missing notify_on_output on monitor_regex."
            )
            mod.clear_wake_fired(loop_id)
        if state_file:
            msg += f" and {state_file}"
        msg += (
            "; run Ritual deliverable THIS turn (strict phases 1→9, one at a time). "
            "Then re-arm: prepare_arm_wake.sh (no --exec), ARM_COMMAND with block_until_ms=0 "
            "and notify_on_output on monitor_regex. Do not defer work to next tick. "
            f"Wake payload: {prompt_json}.{ritual_note}{last_exit_note}"
        )
    if recovery_turns >= 3:
        msg += (
            f" WARNING: {recovery_turns} recovery wakes without product checkpoint — "
            "run checkpoint-loop.sh --product --evidence <id> before re-arm."
        )
    if turns >= mod.SURVIVAL_TURN_WARN:
        msg += (
            f" WARNING: stop-hook recovery turn {turns}/{mod.SURVIVAL_TURN_LIMIT} — "
            "after limit, paste @contract again or run force-reset.sh --loop-id with --yes."
        )
    if wake_sentinel:
        msg += f" Monitor: ^{wake_sentinel}"
    print(json.dumps({"followup_message": msg}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
